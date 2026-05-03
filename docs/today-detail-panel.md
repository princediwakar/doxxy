# Plan: Voice Scribe & Active Encounter Canvas

## Context

The `TodayDetailPanel` is currently an administrative filing cabinet — status badges, tiny buttons, collapsible accordions. Clinical data (history, past prescriptions) is buried behind clicks. This redesign transforms it into an **Active Encounter Canvas** where the microphone is the primary input and clinical context is always visible.

## Critical Design Decisions (Pre-Execution Patch)

### A. iOS Safari MediaRecorder Fallback (Phase 3, Step 7)

`audio/ogg;codecs=opus` fails on iOS Safari. `useVoiceRecorder` must negotiate the MIME type before instantiating `MediaRecorder`:

```typescript
const getSupportedMimeType = (): string => {
  const types = [
    'audio/webm;codecs=opus',   // Chrome / Firefox desktop
    'audio/mp4;codecs=mp4a.40.2', // iOS Safari 14.5+
    'audio/mpeg',                // Safari fallback
    'audio/ogg;codecs=opus',     // Last resort
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) || '';
};
```

The negotiated `mimeType` is sent to the API route alongside the audio, so the backend can handle decoding correctly. If no type is supported at all (`''`), the hook sets an error state: "Your browser does not support voice recording."

### B. Few-Shot Indian Medical Shorthand Dictionary (Phase 1, Step 3)

The OpenAI system prompt must include a shorthand dictionary so `gpt-4o-mini` doesn't hallucinate or miscategorize Indian clinical shorthand. These are appended to the system prompt as a reference table:

```
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
```

### C. "Edit Manually" Handoff via Zustand (Phase 4, Step 12)

**Do not touch the database until the doctor confirms.** A DB write-then-navigate introduces a race condition (Supabase write may lag behind Next.js client-side navigation, loading empty fields) and a network-dependency (if the mutation fails, the in-memory AI JSON is lost).

Instead, weaponize the existing Zustand `todayStore`:

1. **Add to `stores/todayStore.ts`:** `draftConsultationData: AIStructuredOutput | null` + `setDraftConsultationData(data)` action
2. **On "Edit Manually" click:** Call `setDraftConsultationData(structuredOutput)`, then `router.push(/consultation/${appointmentId})` — no DB call, instantaneous
3. **In the consultation form page** (`app/(app)/consultation/[appointmentId]/page.tsx`): On mount, check `draftConsultationData` from the store. If present, inject it into `react-hook-form` default values and immediately clear it from Zustand.

**AI → consultation form field mapping:**
- `structured.symptoms` → `chief_complaint` (History)
- `structured.diagnosis` → `diagnosis` (Management)
- `structured.advice` → `treatment` (Management)
- `structured.prescriptions[].drug_name` → `prescriptions[].name`
- `structured.prescriptions[].dosage` → `prescriptions[].dosage`
- `structured.prescriptions[].frequency` → `prescriptions[].frequency`
- `structured.prescriptions[].duration` → `prescriptions[].duration`

**`useEncounterCompletion` single-mode (simplified):**
- Only the `complete` mode is needed: save consultation + prescriptions → mark appointment Completed → deduct credit → clear selection
- No `saveDraft` mode required since the handoff is client-side

---

## Implementation Order

### Phase 1: Foundation Types + API Route

**1. Create `types/voice.ts`** (~50 lines)
- `VoiceRecordingState`: `'idle' | 'requesting_permission' | 'recording' | 'error'`
- `AIStructuredOutput`: `{ symptoms, diagnosis, prescriptions: AIExtractedPrescription[], advice }`
- `AIExtractedPrescription`: `{ drug_name, dosage, frequency, duration }`
- `EncounterReviewState`: discriminated union for `idle | processing | review` phases
- `VoiceTranscribeResponse`: `{ transcript: string, structured: AIStructuredOutput | null, provider: string }`

**2. Add re-exports to `types/core.ts`** (~5 lines)
- Re-export `AIStructuredOutput`, `AIExtractedPrescription` from `types/voice.ts`

**3. Create `app/api/voice/transcribe/route.ts`** (~180 lines)
- Single `POST` handler, `maxDuration = 45` (covers 30s recording + network + AI processing)
- **Accepts multipart/form-data** (not base64 JSON): the browser sends the audio blob directly as `FormData`
- Extracts the `File` from the form field, reads as `ArrayBuffer`
- Calls Sarvam STT API:
  - **Endpoint:** `https://api.sarvam.ai/speech-to-text`
  - **Auth:** `api-subscription-key` header (NOT `Authorization: Bearer`) using `process.env.SARVAM_API_KEY`
  - **Format:** multipart/form-data — forwards the audio buffer as a file attachment
  - **Params:** `model: "saarika:v2.5"` (default, 12 Indian languages + auto-detect), `language_code: "unknown"` for auto-detect
  - **Response:** `{ transcript, language_code, language_probability }` — transcript is in field `transcript`
  - **REST API limit:** 30 seconds max audio (Batch API available for longer audio as future upgrade)
- Extracts transcript, then calls OpenAI `gpt-4o-mini` with Structured Outputs:
  - Model: `gpt-4o-mini`, temperature: 0.1
  - `response_format`: `{ type: "json_schema", json_schema: { name: "clinical_note", strict: true, schema: {...} } }`
  - System prompt includes: instruction to filter non-clinical noise, mark unknown fields as `"NOT_SPECIFIED"`, **the Indian Clinical Shorthand Reference (see Section B above)**
- Returns `{ transcript, structured: { symptoms, diagnosis, prescriptions, advice }, provider: "sarvam+openai" }`
- Graceful degradation: if OpenAI fails, returns `{ transcript, structured: null }` so ReviewHandoff can show transcript-only with a warning
- Error handling: Sarvam errors (403 auth, 429 quota, 500/503) returned as appropriate HTTP status

### Phase 2: Data-Access Hooks

**4. Create `hooks/patient/useLastVisitSummary.ts`** (~85 lines)
- Input: `patientId: string | null`
- `useQuery` with key `['lastVisitSummary', patientId]`
- Fetches most recent completed consultation (with `appointments!inner(status=Completed)` join) and most recent prescription
- Returns `{ lastConsultation, lastPrescription, isLoading }`

**5. Create `hooks/encounter/useEncounterCompletion.ts`** (~130 lines)
- `useMutation` — single `complete` mode only (no saveDraft needed; Edit Manually uses Zustand handoff)
- `mutationFn`: upsert `consultations.specialty_data` with mapped AI data → upsert `prescriptions` rows (one per medication) → update appointment status to "Completed" → call `deduct_appointment_credit` RPC
- AI → DB field mapping: `symptoms→chief_complaint`, `diagnosis→diagnosis`, `advice→treatment`, `prescriptions[].drug_name→name`, `dosage→dosage`, `frequency→frequency`, `duration→duration`
- Invalidates appointments + patient detail + billing queries
- `onSuccess`: `toast.success('Encounter completed')` → caller clears selection
- `onError`: `showErrorToast(err)`

**6. Add query keys to `lib/query-keys.ts`** (~5 lines)
- `lastVisitSummary: (patientId) => ['lastVisitSummary', patientId]`

### Phase 3: Voice Hooks

**7. Create `hooks/voice/useVoiceRecorder.ts`** (~160 lines)
- **MIME type negotiation**: `getSupportedMimeType()` with ordered fallback array (webm→mp4→mpeg→ogg), checked at hook init
- Browser support check: `typeof MediaRecorder !== 'undefined'` before attempting
- State machine: idle → requesting_permission → recording → error
- `startRecording()`: calls `navigator.mediaDevices.getUserMedia({ audio: true })` with negotiated MIME type, creates `MediaRecorder`
- **Max 30s recording** (matches Sarvam REST API limit, not the 60s in PRD) via `setInterval` timer, auto-stops with sonner toast
- `stopRecording()`: collects chunks into a single Blob (not base64), returns `{ audioBlob: Blob, mimeType: string }`
- `resetRecording()`: clears chunks + timer, returns to idle
- Cleanup on unmount: stops tracks, releases MediaStream, clears timer
- Error states: permission denied, no browser support, no supported MIME type, NotSupportedError on unsupported codec

**8. Create `hooks/voice/useVoiceTranscription.ts`** (~70 lines)
- `useMutation` that POSTs the audio Blob directly as multipart/form-data to `/api/voice/transcribe`
  - Client sends `FormData` with the Blob (no base64 encoding on either side — raw binary through)
- Returns `{ transcribe, isTranscribing, result, resetTranscription }`
- `onError`: `showErrorToast(err)`

### Phase 4: UI Components (bottom-up, each <200 lines)

**9. Create `components/today/PatientHeader.tsx`** (~60 lines)
- Patient name (large), age/gender, current appointment status badge
- Kebab menu (three-dot `...` dropdown) with: Schedule, Bill, Edit Patient, Edit Appointment
- Clean, minimal — no inline buttons cluttering the header

**10. Create `components/today/LastVisitSummary.tsx`** (~70 lines)
- Always-visible box using `useLastVisitSummary`
- Shows: date of last visit, chief complaint, diagnosis, medication names + dosages
- Handles empty state (first visit): "No prior visits found"
- No accordions, no clicks required

**11. Create `components/today/DictationZone.tsx`** (~130 lines)
- Full-width "Press & Hold to Dictate" button (massive, primary CTA)
- On hold: starts recording via `useVoiceRecorder`, pulse animation + audio waveform SVG, silently calls `onStartConsultation` if appointment is "Scheduled"
- On release: stops recording, triggers `useVoiceTranscription`
- Ghost "Or type notes manually" link below (calls `onEditManually` → saveDraft + navigate)
- Error state: mic denied message + instruction to enable permissions
- Shows elapsed timer while recording
- Auto-stops at 30s (Sarvam REST API limit)

**12. Create `components/today/ReviewHandoff.tsx`** (~140 lines)
- Raw transcript in small muted text at top (trust/verification)
- Structured cards: Symptoms, Diagnosis, Prescriptions table
- Prescription items with `dosage === "NOT_SPECIFIED"` or `frequency === "NOT_SPECIFIED"` show yellow warning badge
- Massive "Approve & Complete" primary button → calls `onApprove(structuredOutput)` which triggers `useEncounterCompletion` mutation
- "Edit Manually" secondary button → calls `onEditManually(structuredOutput)` which:
  1. Calls `todayStore.setDraftConsultationData(structuredOutput)` (Zustand, instantaneous)
  2. Calls `router.push(/consultation/${appointmentId})` (no DB write, no race condition)

**13. Create `components/today/AdministrativeFooter.tsx`** (~100 lines)
- Demographics row (gender, age, phone, medical ID)
- History accordion (extracted from existing TodayDetailPanel, removing chief complaint preview since it's now in LastVisitSummary)
- Bills accordion (extracted from existing TodayDetailPanel)
- Props: `patientDetail`, `patientBills`, `isLoadingBills`, and relevant callbacks

**14. Create `components/today/StaffView.tsx`** (~40 lines)
- Simple wrapper for staff (non-doctor) view
- PatientHeader with elevated Schedule/Bill/Edit buttons
- LastVisitSummary (still useful for context)
- AdministrativeFooter
- No DictationZone

**15. Create `components/today/EncounterCanvas.tsx`** (~70 lines)
- Thin orchestrator for doctor view
- Composes: PatientHeader → LastVisitSummary → DictationZone (or ReviewHandoff when in review state) → AdministrativeFooter
- Manages encounter review state locally via `useState<EncounterReviewState>`

### Phase 5: Integration

**16. Rewrite `components/today/TodayDetailPanel.tsx`** (~90 lines)
- Remove the 150-line `AppointmentCard` inner component
- Thin orchestrator: checks `isOwnAppointment` → renders `EncounterCanvas` (doctor) or `StaffView` (staff)
- Receives `onApproveEncounter` and `onEditManually` callbacks from page
- Passes necessary callbacks down to child components

**17. Modify `app/(app)/today/page.tsx`** (~30 lines changed)
- Wire `useEncounterCompletion` hook
- `onApproveEncounter`: calls `completeEncounter` mutation → `clearSelection()` on success
- `onEditManually`: NO mutation — sets `draftConsultationData` in Zustand, then `router.push(/consultation/${appointmentId})`
- Pass callbacks to `TodayDetailPanel`

**18. Modify `stores/todayStore.ts`** (~10 lines)
- Add `draftConsultationData: AIStructuredOutput | null` to state
- Add `setDraftConsultationData(data: AIStructuredOutput | null)` action
- Add `clearDraftConsultationData()` action (called by consultation form after hydrating)

**19. Modify `app/(app)/consultation/[appointmentId]/page.tsx`** (~20 lines)
- On mount: read `draftConsultationData` from `useTodayStore`
- If present: map AI fields to `ConsultationNotes` shape and merge into `react-hook-form` default values
- Immediately call `clearDraftConsultationData()` after hydration
- Keeps existing fetch logic intact — the Zustand data augments the initial form state, it doesn't replace the DB fetch

## Verification

1. `npx tsc --noEmit` — zero type errors
2. iOS Safari: open Today page on iPhone, verify MIME negotiation picks `audio/mp4`, verify recording works
3. Manual: Mic permission flow — deny → error state with fallback link; grant → recording starts on hold
4. Manual: PTT → pulse animation → release → "Structuring..." spinner → review state with transcript + cards
5. Manual: "Approve & Complete" → consultation row created with correct AI data, prescriptions created, appointment Completed, selection cleared
6. Manual: "Edit Manually" → Zustand handoff (no DB write) → navigates to consultation form → form fields pre-populated with AI data, Zustand draft cleared after hydration
7. Manual: Indian shorthand — dictate "TDS for 5 days" → verify frequency field shows "TDS" not "three times a day"
8. Manual: Staff view — no dictation zone, elevated Schedule/Bill buttons
9. Manual: Last Visit Summary — shows previous visit data without clicking
10. Manual: Missing dosage warning — yellow badge on prescription items with "NOT_SPECIFIED"
11. Manual: 30-second cap — hold dictation for >30s → auto-stops with toast "Maximum recording length reached"
