# Voice-Based Auto Clinical Notes — Implementation Plan

## Context

The consultation page currently requires doctors to manually type into textarea fields (chief complaint, history, examination findings, diagnosis, treatment plan, etc.). We want to capture the doctor-patient conversation via the browser microphone, transcribe it with AI (OpenAI Whisper), and use Gemini to extract structured clinical data that auto-populates the form fields.

**Recording lifecycle**: Starts automatically when the consultation page opens (doctor clicked "Start/Continue Consultation"), stops when doctor clicks "End Consultation", auto-populates all matching fields before completing.

---

## Architecture Decision: Next.js API Route + Browser MediaRecorder

The existing procurement extraction route at `app/api/procurement/extract/route.ts` is the proven pattern — it calls Gemini with model fallback, handles large payloads, and returns structured JSON. We follow the same approach:

1. **Browser**: `MediaRecorder` API captures audio → base64 blob
2. **Next.js API Route**: `app/api/consultation/transcribe/route.ts`
   - Step 1: Send audio to OpenAI Whisper (`whisper-1`) → transcript text
   - Step 2: Send transcript + field schema to Gemini → structured `{ fieldName: extractedText }` JSON
3. **Client**: Populate react-hook-form fields, auto-save fires automatically

**Why not Web Speech API**: Can't distinguish doctor vs patient, poor with medical terms, no Indic language support.

**Why not Supabase Edge Function**: No DB interaction needed. The procurement route already proves the Next.js route pattern.

---

## Files to Create (7 new files)

### 1. `app/api/consultation/transcribe/route.ts`
New API route following the procurement route pattern:
- `maxDuration = 60`
- Accepts `POST { audioBase64, mimeType, departmentType, fieldNames, fieldLabels }`
- Calls OpenAI Whisper or Sarvam AI (configurable via `provider` param) for transcription
- Calls Gemini (with existing `GEMINI_API_KEY` and model fallback chain) for structured extraction
- Returns `{ transcript, extractedFields: Record<string, string>, provider: string }`

### 2. `hooks/consultation/useVoiceRecording.ts` (~150 lines)
Manages `MediaRecorder` lifecycle:
- 4 useState: `recordingState`, `audioBlob`, `audioUrl`, `errorMessage`
- `startRecording()`: requests mic, creates MediaRecorder, collects chunks
- `stopRecording()`: stops recorder, combines chunks into Blob
- `elapsedSeconds` via useRef timer
- Error handling for mic denied/not found

### 3. `hooks/consultation/useVoiceTranscription.ts` (~80 lines)
Sends audio to API route:
- Uses `@tanstack/react-query` `useMutation`
- POSTs audioBlob + department metadata to `/api/consultation/transcribe`
- Returns `{ transcript, extractedFields, isProcessing }`
- Error handling via `showErrorToast()`

### 4. `hooks/consultation/useVoiceFieldPopulator.ts` (~50 lines)
Populates react-hook-form from extracted fields:
- Only populates empty fields (doesn't overwrite existing content)
- Only handles simple text/textarea fields (not complex ones like vital_signs, prescriptions, motor_examination)
- Shows sonner toast with count: "Voice notes extracted: 8 fields auto-populated"

### 5. `hooks/consultation/useConsultationVoiceFlow.ts` (~80 lines)
Orchestrator hook that coordinates the voice lifecycle:
- Auto-starts recording when consultation opens (appointment loaded + can edit)
- Wraps `handleCompleteConsultation` to stop recording + transcribe before completing
- Composes `useVoiceRecording`, `useVoiceTranscription`, `useVoiceFieldPopulator`

### 6. `components/consultation/VoiceRecordingBar.tsx` (~120 lines)
Sticky bar rendered below the ConsultationHeader:
- States: idle (hidden), recording (red pulsing dot + timer), processing (spinner + stage label), completed (green check + transcript preview), error (red alert + retry)
- Slim ~48-56px bar with appropriate background color per state

### 7. Registry updates
- `hooks/consultation/index.ts`: add exports for new hooks
- `components/consultation/index.ts`: add export for VoiceRecordingBar

---

## Files to Modify (2 files)

### 8. `app/(app)/consultation/[appointmentId]/page.tsx`
Currently 195 lines. Minimal changes (~15 lines) — all voice logic lives in the orchestrator hook:
- Import `VoiceRecordingBar` and `useConsultationVoiceFlow`
- One-line hook init: `const voiceFlow = useConsultationVoiceFlow({ form, departmentType, appointment, canEditConsultation, handleCompleteConsultation })`
- Render `<VoiceRecordingBar>` between `<ConsultationHeader>` and main content
- Pass `voiceFlow.handleCompleteConsultation` as the header's `onComplete` prop
- Remaining under the 200-line limit

### 9. `.env.local`
Add: `OPENAI_API_KEY=sk-...` (for Whisper), `SARVAM_API_KEY=...` (optional, for Sarvam). The API route supports a `provider` parameter (`"whisper"` or `"sarvam"`, default `"whisper"`).

---

## Field Population Strategy

The Gemini prompt lists all field names + labels from the consultation schema. It returns a flat `Record<string, string>` mapping field names to extracted text.

**What gets auto-populated**: Simple text/textarea fields (chief_complaint, history_of_present_illness, diagnosis, treatment, etc.)

**What does NOT get auto-populated**: Complex structured fields (vital_signs, prescriptions, motor_examination, reflex_examination, tabular eye fields). Any mentions of these in the transcript are placed into `physical_exam` as free-text notes.

**No overwrite rule**: Fields with existing content (from auto-save restore) are not overwritten.

---

## Verification

1. **Manual test flow**: Open a consultation → verify recording bar appears with pulsing dot → speak into mic → click "End Consultation" → verify processing stage shows in bar → verify fields are auto-populated → verify consultation completes normally
2. **Error cases**: Deny mic permission → verify error bar with retry button → use retry → verify recording starts
3. **Edge cases**: Refresh page during recording → verify recording stops cleanly; return to completed consultation → verify bar doesn't show
4. **API route**: Test `POST /api/consultation/transcribe` with curl using a sample audio file → verify transcript + extracted fields returned
5. **Type check**: Run `npm run type-check` to ensure no type errors