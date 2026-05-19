/**
 * Smoke tests for department-aware voice transcription.
 * Run: npx tsx --eval "$(cat scripts/test-voice-departments.ts)"
 *
 * Tests: zodToJsonSchema, prompt generation, response mapping, department name normalization.
 * Does NOT require API keys or a running server.
 */

import { getSchemaForDepartment, schemasByDepartment } from '../lib/consultationNotesSchemas';
import { zodToJsonSchema, getAllFieldsFromSchema } from '../lib/schemaUtils';
import { mapDepartmentName } from '../components/consultation/constants';

// Replicate the route's generateSystemPrompt and mapStructuredOutput for testing
const INDIAN_SHORTHAND_REFERENCE = `INDIAN CLINICAL SHORTHAND REFERENCE (abridged)`;

function generateSystemPrompt(department: string, fields: ReturnType<typeof getAllFieldsFromSchema>): string {
  const fieldList = fields
    .map((f) => `  - ${f.name}: ${f.label}${f.placeholder ? ` — ${f.placeholder}` : ''}`)
    .join('\n');

  return `You are a clinical AI...

${INDIAN_SHORTHAND_REFERENCE}

DEPARTMENT: ${department}

FIELDS TO EXTRACT:
${fieldList}`;
}

const COMMON_FIELD_NAMES = new Set([
  'chief_complaint', 'diagnosis', 'prescriptions', 'assessment', 'treatment', 'follow_up',
]);

function mapStructuredOutput(aiOutput: Record<string, unknown>, fields: ReturnType<typeof getAllFieldsFromSchema>) {
  const rawFields: Record<string, unknown> = {};
  for (const field of fields) {
    if (COMMON_FIELD_NAMES.has(field.name)) continue;
    if (field.name in aiOutput) {
      rawFields[field.name] = aiOutput[field.name];
    }
  }
  const symptoms = String(aiOutput.chief_complaint ?? 'NOT_SPECIFIED');
  const diagnosis = String(aiOutput.diagnosis ?? 'NOT_SPECIFIED');
  const prescriptions = Array.isArray(aiOutput.prescriptions)
    ? (aiOutput.prescriptions as Array<Record<string, unknown>>).map((p) => ({
        drug_name: String(p.drug_name ?? 'NOT_SPECIFIED'),
        dosage: String(p.dosage ?? 'NOT_SPECIFIED'),
        frequency: String(p.frequency ?? 'NOT_SPECIFIED'),
        duration: String(p.duration ?? 'NOT_SPECIFIED'),
        route: String(p.route ?? 'NOT_SPECIFIED'),
        instructions: String(p.instructions ?? 'NOT_SPECIFIED'),
      }))
    : [];
  const adviceParts = [aiOutput.assessment, aiOutput.treatment, aiOutput.follow_up]
    .filter((v): v is string => typeof v === 'string' && v !== 'NOT_SPECIFIED' && v.length > 0);
  const advice = adviceParts.length > 0 ? adviceParts.join('. ') : 'NOT_SPECIFIED';
  return { symptoms, diagnosis, prescriptions, advice, rawFields };
}

// ============================================================================
// TEST RUNNER
// ============================================================================
let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ FAIL: ${label}`);
    failed++;
  }
}

function assertEq<T>(actual: T, expected: T, label: string): void {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ FAIL: ${label}`);
    console.log(`    expected: ${JSON.stringify(expected)}`);
    console.log(`    actual:   ${JSON.stringify(actual)}`);
    failed++;
  }
}

// ============================================================================
// 1. DEPARTMENT NAME NORMALIZATION
// ============================================================================
console.log('\n=== 1. Department Name Normalization ===');
assertEq(mapDepartmentName('Neurology'), 'Neurology', 'Neurology → Neurology');
assertEq(mapDepartmentName('Ophthalmology'), 'Ophthalmology', 'Ophthalmology → Ophthalmology');
assertEq(mapDepartmentName('General Medicine'), 'General', 'General Medicine → General');
assertEq(mapDepartmentName(''), 'General', 'empty string → General');
assertEq(mapDepartmentName('BogusDept'), 'General', 'unknown → General fallback');

// ============================================================================
// 2. SCHEMA LOOKUP
// ============================================================================
console.log('\n=== 2. Schema Lookup ===');
const neuroSchema = getSchemaForDepartment('Neurology');
const ophthSchema = getSchemaForDepartment('Ophthalmology');
const generalSchema = getSchemaForDepartment('General');
const bogusSchema = getSchemaForDepartment('BogusDept');

assert(neuroSchema !== generalSchema, 'Neurology schema != General schema');
assert(ophthSchema !== generalSchema, 'Ophthalmology schema != General schema');
assertEq(bogusSchema, generalSchema, 'BogusDept falls back to General schema');

// ============================================================================
// 3. JSON SCHEMA CONVERSION — Neurology
// ============================================================================
console.log('\n=== 3. JSON Schema Conversion: Neurology ===');
const neuroJson = zodToJsonSchema(neuroSchema);
assertEq(neuroJson.type, 'object', 'root type is object');
assertEq(neuroJson.additionalProperties, false, 'root has additionalProperties: false');
assert(neuroJson.properties !== undefined, 'root has properties');

const neuroPropNames = Object.keys(neuroJson.properties!);
assert(neuroPropNames.includes('chief_complaint'), 'has chief_complaint (base field)');
assert(neuroPropNames.includes('diagnosis'), 'has diagnosis (base field)');
assert(neuroPropNames.includes('prescriptions'), 'has prescriptions (base field)');
assert(neuroPropNames.includes('cranial_nerves'), 'has cranial_nerves (neuro-specific)');
assert(neuroPropNames.includes('motor_examination'), 'has motor_examination (neuro-specific)');
assert(neuroPropNames.includes('sensory_examination'), 'has sensory_examination (neuro-specific)');
assert(neuroPropNames.includes('reflexes'), 'has reflexes (neuro-specific)');
assert(neuroPropNames.includes('cerebellar_examination'), 'has cerebellar_examination (neuro-specific)');
assert(neuroPropNames.includes('gait_coordination'), 'has gait_coordination (neuro-specific)');
assert(neuroPropNames.includes('other_examination'), 'has other_examination (neuro-specific)');

// Neurology should NOT have ophthalmology-specific fields
assert(!neuroPropNames.includes('visual_acuity'), 'does NOT have visual_acuity (ophth field)');
assert(!neuroPropNames.includes('fundus_exam'), 'does NOT have fundus_exam (ophth field)');
assert(!neuroPropNames.includes('slit_lamp_exam'), 'does NOT have slit_lamp_exam (ophth field)');

// Verify field metadata (labels) are preserved via zField
assertEq(neuroJson.properties!.cranial_nerves.description, 'Cranial Nerves', 'cranial_nerves has label');
assertEq(neuroJson.properties!.chief_complaint.description, 'Chief Complaint', 'chief_complaint has label');

// All optional fields become nullable unions for OpenAI strict mode compatibility
// The zodToJsonSchema converter wraps types in ["type", "null"] for optional fields

// Verify each property has a nullable type (optional → ["string", "null"] for OpenAI strict mode)
for (const prop of ['chief_complaint', 'cranial_nerves', 'sensory_examination', 'other_examination']) {
  assertEq(JSON.stringify(neuroJson.properties![prop].type), JSON.stringify(['string', 'null']), `${prop} is nullable string`);
}

// Complex types: motor_examination should be a nullable object
assertEq(JSON.stringify(neuroJson.properties!.motor_examination.type), JSON.stringify(['object', 'null']), 'motor_examination is nullable object');
assertEq(neuroJson.properties!.motor_examination.additionalProperties, false, 'motor_examination has additionalProperties: false');

// Complex types: reflexes should be a nullable object
assertEq(JSON.stringify(neuroJson.properties!.reflexes.type), JSON.stringify(['object', 'null']), 'reflexes is nullable object');

// Complex types: prescriptions should be a nullable array
assertEq(JSON.stringify(neuroJson.properties!.prescriptions.type), JSON.stringify(['array', 'null']), 'prescriptions is nullable array');

// Complex types: vital_signs should be a nullable object
assertEq(JSON.stringify(neuroJson.properties!.vital_signs.type), JSON.stringify(['object', 'null']), 'vital_signs is nullable object');

// ============================================================================
// 4. JSON SCHEMA CONVERSION — Ophthalmology
// ============================================================================
console.log('\n=== 4. JSON Schema Conversion: Ophthalmology ===');
const ophthJson = zodToJsonSchema(ophthSchema);
const ophthPropNames = Object.keys(ophthJson.properties!);

assert(ophthPropNames.includes('chief_complaint'), 'has chief_complaint (base field)');
assert(ophthPropNames.includes('visual_acuity'), 'has visual_acuity (ophth-specific)');
assert(ophthPropNames.includes('fundus_exam'), 'has fundus_exam (ophth-specific)');
assert(ophthPropNames.includes('intraocular_pressure'), 'has intraocular_pressure (ophth-specific)');
assert(ophthPropNames.includes('slit_lamp_exam'), 'has slit_lamp_exam (ophth-specific)');
assert(ophthPropNames.includes('extraocular_movements'), 'has extraocular_movements (ophth-specific)');
assert(ophthPropNames.includes('lids'), 'has lids (ophth-specific)');
assert(ophthPropNames.includes('cornea'), 'has cornea (ophth-specific)');
assert(ophthPropNames.includes('pupil_examination'), 'has pupil_examination (ophth-specific)');
assert(ophthPropNames.includes('lens'), 'has lens (ophth-specific)');
assert(ophthPropNames.includes('iris'), 'has iris (ophth-specific)');
assert(ophthPropNames.includes('conjunctiva'), 'has conjunctiva (ophth-specific)');
assert(ophthPropNames.includes('anterior_chamber'), 'has anterior_chamber (ophth-specific)');
assert(ophthPropNames.includes('refraction'), 'has refraction (ophth-specific)');
assert(ophthPropNames.includes('eye_examination'), 'has eye_examination');

// Ophthalmology should NOT have neurology-specific fields
assert(!ophthPropNames.includes('cranial_nerves'), 'does NOT have cranial_nerves (neuro field)');
assert(!ophthPropNames.includes('motor_examination'), 'does NOT have motor_examination (neuro field)');
assert(!ophthPropNames.includes('reflexes'), 'does NOT have reflexes (neuro field)');

// Verify eye fields are nullable objects with left/right/notes structure
const eyeField = ophthJson.properties!.visual_acuity;
assertEq(JSON.stringify(eyeField.type), JSON.stringify(['object', 'null']), 'visual_acuity is nullable object (tabular_eye)');
assert(eyeField.properties!.left !== undefined, 'visual_acuity has left property');
assert(eyeField.properties!.right !== undefined, 'visual_acuity has right property');
assert(eyeField.properties!.notes !== undefined, 'visual_acuity has notes property');
assertEq(JSON.stringify(eyeField.properties!.left.type), JSON.stringify(['string', 'null']), 'visual_acuity.left is nullable string');

// ============================================================================
// 5. SYSTEM PROMPT GENERATION
// ============================================================================
console.log('\n=== 5. System Prompt Generation ===');
const neuroFields = getAllFieldsFromSchema(neuroSchema);
const ophthFields = getAllFieldsFromSchema(ophthSchema);

const neuroPrompt = generateSystemPrompt('Neurology', neuroFields);
assert(neuroPrompt.includes('DEPARTMENT: Neurology'), 'neuro prompt has DEPARTMENT: Neurology');
assert(neuroPrompt.includes('cranial_nerves: Cranial Nerves'), 'neuro prompt lists cranial_nerves');
assert(neuroPrompt.includes('reflexes: Reflexes'), 'neuro prompt lists reflexes');
assert(neuroPrompt.includes('gait_coordination: Gait & Coordination'), 'neuro prompt lists gait_coordination');
assert(!neuroPrompt.includes('visual_acuity'), 'neuro prompt does NOT mention visual_acuity');
assert(!neuroPrompt.includes('fundus_exam'), 'neuro prompt does NOT mention fundus_exam');

const ophthPrompt = generateSystemPrompt('Ophthalmology', ophthFields);

assert(ophthPrompt.includes('DEPARTMENT: Ophthalmology'), 'ophth prompt has DEPARTMENT: Ophthalmology');
// createEyeField uses field name as label; human-readable name is in placeholder
assert(ophthPrompt.includes('visual_acuity') && ophthPrompt.includes('Visual Acuity'), 'ophth prompt includes visual_acuity');
assert(ophthPrompt.includes('fundus_exam') && ophthPrompt.includes('Fundus Examination'), 'ophth prompt includes fundus_exam');
assert(ophthPrompt.includes('intraocular_pressure') && ophthPrompt.includes('Intraocular Pressure'), 'ophth prompt includes intraocular_pressure');
assert(!ophthPrompt.includes('cranial_nerves'), 'ophth prompt does NOT mention cranial_nerves');
assert(!ophthPrompt.includes('reflexes'), 'ophth prompt does NOT mention reflexes');

// ============================================================================
// 6. RESPONSE MAPPING — Neurology
// ============================================================================
console.log('\n=== 6. Response Mapping: Neurology ===');
const mockNeuroAIOutput: Record<string, unknown> = {
  chief_complaint: 'Headache for 3 days with nausea',
  diagnosis: 'Migraine without aura',
  prescriptions: [
    {
      drug_name: 'Naproxen',
      dosage: '500mg',
      frequency: 'BD',
      duration: '5 days',
      route: 'Oral',
      instructions: 'Take after food',
    },
    {
      drug_name: 'Propranolol',
      dosage: '40mg',
      frequency: 'OD',
      duration: '1 month',
      route: 'Oral',
      instructions: 'Take at bedtime',
    },
  ],
  assessment: 'Classic migraine, no red flags',
  treatment: 'NSAID for acute, beta-blocker for prophylaxis',
  follow_up: 'Review in 2 weeks',
  // Neuro-specific fields
  cranial_nerves: 'CN I-XII intact, no deficits',
  motor_examination: { shoulder_left: '5/5', shoulder_right: '5/5', notes: 'Normal power' },
  sensory_examination: 'Pain and touch intact in all dermatomes',
  reflexes: { biceps_left: '2+', biceps_right: '2+', knee_left: '2+', knee_right: '2+' },
  cerebellar_examination: 'Finger-nose test normal, no dysdiadochokinesia',
  gait_coordination: 'Normal tandem gait',
  other_examination: 'No meningeal signs',
  // Fields that should NOT end up in rawFields (common fields)
  past_medical_history: 'No significant history',  // not in COMMON_FIELD_NAMES → should be in rawFields
};

const neuroResult = mapStructuredOutput(mockNeuroAIOutput, neuroFields);

assertEq(neuroResult.symptoms, 'Headache for 3 days with nausea', 'symptoms from chief_complaint');
assertEq(neuroResult.diagnosis, 'Migraine without aura', 'diagnosis mapped correctly');
assertEq(neuroResult.prescriptions.length, 2, '2 prescriptions extracted');
assertEq(neuroResult.prescriptions[0].drug_name, 'Naproxen', 'first drug name');
assertEq(neuroResult.prescriptions[0].frequency, 'BD', 'shorthand preserved');
assertEq(neuroResult.advice, 'Classic migraine, no red flags. NSAID for acute, beta-blocker for prophylaxis. Review in 2 weeks', 'advice concatenated');

// rawFields should contain department-specific and other non-common fields
assert(neuroResult.rawFields.cranial_nerves === 'CN I-XII intact, no deficits', 'cranial_nerves in rawFields');
assert(neuroResult.rawFields.sensory_examination !== undefined, 'sensory_examination in rawFields');
assert(neuroResult.rawFields.cerebellar_examination !== undefined, 'cerebellar_examination in rawFields');
assert(neuroResult.rawFields.gait_coordination !== undefined, 'gait_coordination in rawFields');
assert(neuroResult.rawFields.other_examination !== undefined, 'other_examination in rawFields');
assert(neuroResult.rawFields.past_medical_history !== undefined, 'past_medical_history in rawFields');

// Common fields should NOT be in rawFields
assert(neuroResult.rawFields.chief_complaint === undefined, 'chief_complaint NOT in rawFields');
assert(neuroResult.rawFields.diagnosis === undefined, 'diagnosis NOT in rawFields');
assert(neuroResult.rawFields.prescriptions === undefined, 'prescriptions NOT in rawFields');
assert(neuroResult.rawFields.assessment === undefined, 'assessment NOT in rawFields');
assert(neuroResult.rawFields.treatment === undefined, 'treatment NOT in rawFields');

// Complex objects should be preserved
assert(typeof neuroResult.rawFields.motor_examination === 'object', 'motor_examination preserved as object');
assert(typeof neuroResult.rawFields.reflexes === 'object', 'reflexes preserved as object');

// ============================================================================
// 7. RESPONSE MAPPING — Ophthalmology
// ============================================================================
console.log('\n=== 7. Response Mapping: Ophthalmology ===');
const mockOphthAIOutput: Record<string, unknown> = {
  chief_complaint: 'Blurred vision in right eye for 1 week',
  diagnosis: 'Right eye corneal abrasion',
  prescriptions: [
    {
      drug_name: 'Moxifloxacin',
      dosage: '0.5%',
      frequency: 'QID',
      duration: '7 days',
      route: 'Eye Drops',
      instructions: 'Apply 1 drop to right eye',
    },
  ],
  assessment: 'Superficial corneal abrasion',
  treatment: 'Topical antibiotic, lubricating drops, eye shield at night',
  follow_up: 'Review in 3 days',
  // Ophth-specific fields
  visual_acuity: { left: '6/6', right: '6/18', notes: 'Right eye decreased' },
  refraction: { left: 'Plano', right: '-0.75D', notes: '' },
  extraocular_movements: { left: 'Full', right: 'Full', notes: '' },
  lids: { left: 'Normal', right: 'Mild edema', notes: '' },
  conjunctiva: { left: 'Clear', right: 'Injected', notes: '' },
  cornea: { left: 'Clear', right: 'Central abrasion 2mm', notes: 'Fluorescein positive' },
  anterior_chamber: { left: 'Deep and quiet', right: 'Deep and quiet', notes: '' },
  iris: { left: 'Normal', right: 'Normal', notes: '' },
  pupil_examination: { left: '3mm reactive', right: '3mm reactive', notes: '' },
  lens: { left: 'Clear', right: 'Clear', notes: '' },
  slit_lamp_exam: { left: 'Unremarkable', right: 'Corneal staining', notes: '' },
  intraocular_pressure: { left: '14mmHg', right: '15mmHg', notes: '' },
  fundus_exam: { left: 'Normal disc and macula', right: 'Hazy view', notes: '' },
  eye_examination: { left: 'Normal', right: 'Abrasion visible', notes: '' },
};

const ophthResult = mapStructuredOutput(mockOphthAIOutput, ophthFields);

assertEq(ophthResult.symptoms, 'Blurred vision in right eye for 1 week', 'symptoms mapped');
assertEq(ophthResult.diagnosis, 'Right eye corneal abrasion', 'diagnosis mapped');
assertEq(ophthResult.prescriptions.length, 1, '1 prescription');
assertEq(ophthResult.prescriptions[0].route, 'Eye Drops', 'route Eye Drops detected');
assertEq(ophthResult.prescriptions[0].frequency, 'QID', 'frequency QID preserved');

// Ophth-specific rawFields
assert(typeof ophthResult.rawFields.visual_acuity === 'object', 'visual_acuity in rawFields (object)');
assert(typeof ophthResult.rawFields.fundus_exam === 'object', 'fundus_exam in rawFields (object)');
assert(typeof ophthResult.rawFields.intraocular_pressure === 'object', 'IOP in rawFields (object)');
assert(typeof ophthResult.rawFields.cornea === 'object', 'cornea in rawFields (object)');
assert(ophthResult.rawFields.slit_lamp_exam !== undefined, 'slit_lamp_exam in rawFields');

// Neuro fields should NOT be in ophth rawFields
assert(ophthResult.rawFields.cranial_nerves === undefined, 'cranial_nerves NOT in ophth rawFields');
assert(ophthResult.rawFields.motor_examination === undefined, 'motor_examination NOT in ophth rawFields');
assert(ophthResult.rawFields.reflexes === undefined, 'reflexes NOT in ophth rawFields');

// ============================================================================
// 8. EDGE CASES
// ============================================================================
console.log('\n=== 8. Edge Cases ===');

// 8a. Empty AI output
const emptyResult = mapStructuredOutput({}, neuroFields);
assertEq(emptyResult.symptoms, 'NOT_SPECIFIED', 'empty output → symptoms NOT_SPECIFIED');
assertEq(emptyResult.diagnosis, 'NOT_SPECIFIED', 'empty output → diagnosis NOT_SPECIFIED');
assertEq(emptyResult.prescriptions.length, 0, 'empty output → empty prescriptions');
assertEq(emptyResult.advice, 'NOT_SPECIFIED', 'empty output → advice NOT_SPECIFIED');
assertEq(Object.keys(emptyResult.rawFields).length, 0, 'empty output → empty rawFields');

// 8b. Partial AI output (only some fields)
const partialResult = mapStructuredOutput(
  { chief_complaint: 'Fever', cranial_nerves: 'Intact' },
  neuroFields,
);
assertEq(partialResult.symptoms, 'Fever', 'partial: symptoms mapped');
assertEq(partialResult.diagnosis, 'NOT_SPECIFIED', 'partial: missing diagnosis → NOT_SPECIFIED');
assertEq(partialResult.rawFields.cranial_nerves, 'Intact', 'partial: cranial_nerves in rawFields');

// 8c. No prescriptions
const noPrescriptionsResult = mapStructuredOutput(
  { chief_complaint: 'Cough', diagnosis: 'Viral URI' },
  neuroFields,
);
assertEq(noPrescriptionsResult.prescriptions.length, 0, 'no prescriptions → empty array');

// 8d. Prescriptions not an array
const badPrescriptionsResult = mapStructuredOutput(
  { chief_complaint: 'Cough', diagnosis: 'URI', prescriptions: 'not-an-array' },
  neuroFields,
);
assertEq(badPrescriptionsResult.prescriptions.length, 0, 'non-array prescriptions → empty array');

// 8e. All 15 departments have valid schemas
const allDepts = Object.keys(schemasByDepartment);
assert(allDepts.length >= 15, `has at least 15 departments (found ${allDepts.length})`);
for (const dept of allDepts) {
  const schema = getSchemaForDepartment(dept);
  const json = zodToJsonSchema(schema);
  assert(json.type === 'object', `${dept}: valid JSON schema`);
  assert(json.properties !== undefined, `${dept}: has properties`);
  const fieldCount = Object.keys(json.properties!).length;
  assert(fieldCount > 5, `${dept}: has >5 fields (found ${fieldCount})`);
}

// 8f. All properties in all department schemas have types
for (const dept of allDepts) {
  const json = zodToJsonSchema(getSchemaForDepartment(dept));
  for (const [propName, propSchema] of Object.entries(json.properties!)) {
    assert(propSchema.type !== undefined, `${dept}.${propName}: has type`);
  }
}

// 8g. No cross-contamination between neurology and ophthalmology
const neuroFieldNames = new Set(Object.keys(neuroJson.properties!));
const ophthFieldNames = new Set(Object.keys(ophthJson.properties!));
const neuroOnly = ['cranial_nerves', 'motor_examination', 'sensory_examination', 'reflexes', 'cerebellar_examination', 'gait_coordination', 'other_examination'];
const ophthOnly = ['visual_acuity', 'refraction', 'extraocular_movements', 'lids', 'conjunctiva', 'cornea', 'anterior_chamber', 'iris', 'pupil_examination', 'lens', 'slit_lamp_exam', 'intraocular_pressure', 'fundus_exam', 'eye_examination'];

for (const f of neuroOnly) {
  assert(neuroFieldNames.has(f) && !ophthFieldNames.has(f), `neuro field ${f}: in neuro only`);
}
for (const f of ophthOnly) {
  assert(ophthFieldNames.has(f) && !neuroFieldNames.has(f), `ophth field ${f}: in ophth only`);
}

// ============================================================================
// 9. SUMMARY
// ============================================================================
console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  console.log('SOME TESTS FAILED — review output above.');
  process.exit(1);
} else {
  console.log('All tests passed.');
}
