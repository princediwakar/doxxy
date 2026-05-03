import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getSchemaForDepartment } from '@/lib/consultationNotesSchemas';
import { mapDepartmentName } from '@/components/consultation/constants';
import { zodToJsonSchema, getAllFieldsFromSchema } from '@/lib/schemaUtils';
import type { NoteFieldConfig } from '@/lib/schemaUtils';

export const maxDuration = 45;

const INDIAN_SHORTHAND_REFERENCE = `
INDIAN CLINICAL SHORTHAND REFERENCE:
| Shorthand | Meaning | Category |
|-----------|---------|----------|
| OD / OD | Once daily | frequency |
| BD / BID | Twice a day | frequency |
| TDS / TID | Three times a day | frequency |
| QID | Four times a day | frequency |
| SOS / PRN | As needed | frequency |
| HS | At bedtime | frequency |
| PC | After meals | frequency |
| AC | Before meals | frequency |
| STAT | Immediately | frequency |
| Q4H / Q6H / Q8H / Q12H | Every N hours | frequency |
| Dolo | Paracetamol 650mg (brand) | drug_name |
| Meftal | Mefenamic Acid (brand) | drug_name |
| Crocin | Paracetamol (brand) | drug_name |
| Azithral | Azithromycin (brand) | drug_name |
| Augmentin | Amoxicillin + Clavulanic Acid (brand) | drug_name |

When transcribing, preserve the doctor's shorthand in the frequency field exactly as spoken (e.g., "BD", "TDS").
`;

const ROUTE_DETECTION = `
PRESCRIPTION ROUTE DETECTION:
- "Tab" / "tablet" / "cap" / "capsule" / "syrup" / "by mouth" / no route mentioned for oral drugs → "Oral"
- "Inj" / "injection" / "inject" → default to "IM" unless "IV" is specified
- "Oint" / "ointment" / "cream" / "gel" / "apply" / "lotion" → "Topical"
- "Eye drops" / "eye" → "Eye Drops"
- "Inhaler" / "inhale" / "puff" / "nebulizer" → "Inhaled"
- "Subcutaneous" / "SC" / "under skin" → "Subcutaneous"
`;

const SPECIAL_INSTRUCTIONS = `
SPECIAL INSTRUCTIONS EXTRACTION:
- "after food" / "after meals" / "PC" → "Take after food"
- "before food" / "before meals" / "AC" → "Take before food"
- "at bedtime" / "HS" → "Take at bedtime"
- "with milk" / "with water" → note the specific instruction
- "complete the course" → "Complete the full course"
- "apply thinly" / "apply twice daily" → note the application instruction
- "avoid alcohol" / "no alcohol" → "Avoid alcohol"
- "for fever" / "for pain" / "if needed" → note the condition
- If no special instruction is given, set instructions to "NOT_SPECIFIED"`;

function generateSystemPrompt(department: string, fields: NoteFieldConfig[]): string {
  const fieldList = fields
    .map((f) => {
      const hint = f.placeholder ? ` — ${f.placeholder}` : '';
      return `  - ${f.name}: ${f.label}${hint}`;
    })
    .join('\n');

  return `You are a clinical AI that converts voice transcripts into structured consultation notes for Indian clinics.

${INDIAN_SHORTHAND_REFERENCE}

DEPARTMENT: ${department}

FIELDS TO EXTRACT:
${fieldList}

INSTRUCTIONS:
1. Extract all fields listed above from the transcript. Set any field you cannot determine to "NOT_SPECIFIED".
2. For the prescriptions array, extract each medication with its drug_name, dosage, frequency, duration, route, and instructions.
3. For prescription frequency, preserve the doctor's shorthand exactly as spoken (e.g., "BD", "TDS", "OD").
4. Drug names: if a brand name is used (e.g., "Dolo", "Crocin"), keep the brand name in drug_name.

${ROUTE_DETECTION}

${SPECIAL_INSTRUCTIONS}`;
}

function buildFieldMetadata(fields: NoteFieldConfig[]): Record<string, { label: string }> {
  const meta: Record<string, { label: string }> = {};
  for (const f of fields) {
    meta[f.name] = { label: f.label };
  }
  return meta;
}

const COMMON_FIELD_NAMES = new Set([
  'chief_complaint',
  'diagnosis',
  'prescriptions',
  'assessment',
  'treatment',
  'follow_up',
]);

function mapStructuredOutput(
  aiOutput: Record<string, unknown>,
  fields: NoteFieldConfig[],
): {
  symptoms: string;
  diagnosis: string;
  prescriptions: Array<Record<string, string>>;
  advice: string;
  rawFields: Record<string, unknown>;
} {
  const rawFields: Record<string, unknown> = {};

  for (const field of fields) {
    if (COMMON_FIELD_NAMES.has(field.name)) continue;
    if (field.name in aiOutput) {
      rawFields[field.name] = aiOutput[field.name];
    }
  }

  const symptoms = String(aiOutput.chief_complaint ?? 'NOT_SPECIFIED');
  const diagnosis = String(aiOutput.diagnosis ?? 'NOT_SPECIFIED');

  const prescriptions = (() => {
    const raw = aiOutput.prescriptions;
    if (Array.isArray(raw)) {
      return raw.map((p: Record<string, unknown>) => ({
        drug_name: String(p.drug_name ?? 'NOT_SPECIFIED'),
        dosage: String(p.dosage ?? 'NOT_SPECIFIED'),
        frequency: String(p.frequency ?? 'NOT_SPECIFIED'),
        duration: String(p.duration ?? 'NOT_SPECIFIED'),
        route: String(p.route ?? 'NOT_SPECIFIED'),
        instructions: String(p.instructions ?? 'NOT_SPECIFIED'),
      }));
    }
    return [];
  })();

  const adviceParts = [
    aiOutput.assessment,
    aiOutput.treatment,
    aiOutput.follow_up,
  ].filter((v): v is string => typeof v === 'string' && v !== 'NOT_SPECIFIED' && v.length > 0);

  const advice = adviceParts.length > 0 ? adviceParts.join('. ') : 'NOT_SPECIFIED';

  return { symptoms, diagnosis, prescriptions, advice, rawFields };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const mimeType = (formData.get('mimeType') as string) || 'audio/webm';
    const rawDepartment = (formData.get('department') as string) || '';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const audioBuffer = await audioFile.arrayBuffer();

    const sarvamMimeType = mimeType.split(';')[0];

    // Step 1: Sarvam STT
    const sarvamKey = process.env.SARVAM_API_KEY;
    if (!sarvamKey) {
      return NextResponse.json({ error: 'Speech-to-text service not configured' }, { status: 500 });
    }

    const sarvamFormData = new FormData();
    sarvamFormData.append('file', new Blob([audioBuffer], { type: sarvamMimeType }), 'audio');
    sarvamFormData.append('model', 'saarika:v2.5');
    sarvamFormData.append('language_code', 'unknown');

    const sarvamResponse = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: { 'api-subscription-key': sarvamKey },
      body: sarvamFormData,
    });

    if (!sarvamResponse.ok) {
      const errorText = await sarvamResponse.text();
      logger.error('Sarvam STT error:', sarvamResponse.status, errorText);

      if (sarvamResponse.status === 403) {
        return NextResponse.json({ error: 'Speech-to-text authentication failed' }, { status: 502 });
      }
      if (sarvamResponse.status === 429) {
        return NextResponse.json({ error: 'Speech-to-text quota exceeded' }, { status: 429 });
      }
      return NextResponse.json({ error: 'Speech-to-text service error' }, { status: 502 });
    }

    const sarvamData = await sarvamResponse.json();
    const transcript: string = sarvamData.transcript || '';

    if (!transcript.trim()) {
      return NextResponse.json({
        transcript: '',
        structured: null,
        provider: 'sarvam',
      });
    }

    // Step 2: OpenAI Structured Outputs — department-aware
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      logger.warn('OpenAI API key not configured, returning transcript-only');
      return NextResponse.json({
        transcript,
        structured: null,
        provider: 'sarvam',
      });
    }

    const department = rawDepartment ? mapDepartmentName(rawDepartment) : 'General';
    const schema = getSchemaForDepartment(department);
    const fields = getAllFieldsFromSchema(schema);
    const jsonSchema = zodToJsonSchema(schema);
    const systemPrompt = generateSystemPrompt(department, fields);
    const fieldMetadata = buildFieldMetadata(fields);

    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.1,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Transcribe and structure this clinical dictation:\n\n${transcript}` },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'clinical_note',
              strict: true,
              schema: jsonSchema,
            },
          },
        }),
      });

      if (!openaiResponse.ok) {
        const errText = await openaiResponse.text();
        logger.error('OpenAI error:', openaiResponse.status, errText);
        return NextResponse.json({
          transcript,
          structured: null,
          provider: 'sarvam',
          fieldMetadata,
        });
      }

      const openaiData = await openaiResponse.json();
      const content = openaiData.choices?.[0]?.message?.content;
      if (!content) {
        return NextResponse.json({ transcript, structured: null, provider: 'sarvam', fieldMetadata });
      }

      const aiOutput = JSON.parse(content);
      const structured = mapStructuredOutput(aiOutput, fields);

      return NextResponse.json({
        transcript,
        structured,
        provider: 'sarvam+openai',
        fieldMetadata,
      });
    } catch (openaiError) {
      logger.error('OpenAI processing failed:', openaiError);
      return NextResponse.json({
        transcript,
        structured: null,
        provider: 'sarvam',
        fieldMetadata,
      });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Voice transcribe route error:', msg);
    return NextResponse.json({ error: 'Server error', details: msg }, { status: 500 });
  }
}
