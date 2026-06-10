# Voice AI Architecture

## Rationale

Doctors in Indian clinics spend 30–50% of consultation time on manual data entry — typing symptoms, diagnosis, prescriptions, and follow-up notes into an EMR while simultaneously conducting the patient encounter. This dual-tasking degrades both throughput and patient experience. A doctor seeing 60 patients a day loses roughly 2–3 hours to typing.

Voice AI eliminates the typing bottleneck. The doctor dictates naturally during or immediately after the examination, and the system transcribes the speech, extracts structured clinical data, and populates the consultation form automatically. The doctor reviews and submits — no typing required.

The business model reinforces the feature: the first 100 consultations per clinic are free, followed by Rs 10 per consultation. Voice AI is the wedge that makes the per-consultation pricing viable — without it, the time savings that justify per-use pricing don't exist.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                         │
│                                                                 │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │ Microphone│───▶│ AudioContext │───▶│ AudioWorklet         │  │
│  │ getUserMedia   │ (hardware    │    │ (downsample to       │  │
│  │                 │  sample rate)│    │  16kHz PCM Int16)    │  │
│  └──────────┘    └──────────────┘    └────────┬─────────────┘  │
│                                               │                 │
│                    ┌──────────────────────────┤                 │
│                    │                          ▼                 │
│                    │               ┌─────────────────────┐     │
│                    │               │ WebSocket            │     │
│                    │               │ (streaming STT)      │     │
│                    │               └──────────┬──────────┘     │
│                    │                          │                 │
│                    ▼                          │                 │
│  ┌──────────────────────────┐                │                 │
│  │ MediaRecorder            │                │                 │
│  │ (1-second chunked        │                │                 │
│  │  recording to WebM)      │                │                 │
│  └────────────┬─────────────┘                │                 │
│               │                              │                 │
│               ▼                              │                 │
│  ┌──────────────────────────┐                │                 │
│  │ AES-GCM-256 Encryption   │                │                 │
│  │ + IndexedDB persistence  │                │                 │
│  │ (offline / crash safety) │                │                 │
│  └──────────────────────────┘                │                 │
│                                              │                 │
└──────────────────────────────────────────────┼─────────────────┘
                                               │
                    ┌──────────────────────────┘
                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                       STT PROXY (Render)                         │
│                                                                  │
│  ┌─────────────────┐    ┌──────────────────────────────────┐    │
│  │ HMAC Ticket     │───▶│ Sarvam AI WebSocket              │    │
│  │ Verification    │    │ (saaras:v3, en-IN, 16kHz)        │    │
│  └─────────────────┘    └──────────────┬───────────────────┘    │
│                                        │                         │
└────────────────────────────────────────┼─────────────────────────┘
                                         │
                                         ▼
                              ┌──────────────────┐
                              │ Real-time         │
                              │ transcript        │
                              │ fragments         │
                              └────────┬─────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTES (Vercel)                    │
│                                                                  │
│  Fallback paths (when streaming fails):                          │
│  ┌─────────────────────┐  ┌──────────────────────────────────┐  │
│  │ /api/voice/          │  │ /api/voice/submit-batch          │  │
│  │ transcribe-sync      │  │ + /api/voice/poll-batch          │  │
│  │ (≤30s recordings)    │  │ (>30s recordings)                │  │
│  └─────────────────────┘  └──────────────────────────────────┘  │
│                                                                  │
│  Post-transcription:                                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Server Action: structureTranscript()                      │   │
│  │   → structureClinicalNotes()                              │   │
│  │     → OpenAI GPT-4o (temp=0, Structured Output, Zod)      │   │
│  │       → Department-specific schemas                       │   │
│  │         → AIStructuredOutput                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Component & Data Flow

### 1. Capture Layer (`hooks/voice/useDualCapture.ts`)

Dual-path recording: real-time streaming for live transcripts + MediaRecorder for durable local backup.

- **AudioWorklet downsamples** hardware sample rate to 16kHz mono PCM Int16
- **WebSocket** sends PCM chunks to Sarvam via the STT proxy for real-time transcription
- **MediaRecorder** records 1-second WebM chunks simultaneously for fallback and offline recovery
- **IndexedDB persistence**: encrypted chunks written every 5 seconds for crash recovery
- **Visibility API handling**: pauses on app-switch (mobile), resumes on return, degrades gracefully if disconnected >90s
- **Transcript recovery**: sessionStorage backup every 10 seconds; recovered on remount after crash

### 2. Streaming STT (`lib/voice/streamingStt.ts`)

- WebSocket connection to Sarvam Saaras v3 via a standalone proxy server
- HMAC-signed tickets (`/api/voice/stt-ticket`) authenticate the browser without exposing the JWT to WebSocket query params
- Chunk buffering: audio chunks arriving before `onopen` are queued and drained on connect
- Backpressure: drops chunks if `bufferedAmount > 256KB` to prevent memory bloat
- Exponential backoff reconnection on unexpected close (1s → 2s → 4s → ... → 30s max)

### 3. Fallback Transcription (`lib/voice/fallbackTranscription.ts`)

When the WebSocket fails to open (network issues, proxy down), the system degrades to "degraded" mode. On stop:

- **≤30s recordings**: `POST /api/voice/transcribe-sync` — synchronous Sarvam REST API
- **>30s recordings**: `POST /api/voice/submit-batch` → poll `GET /api/voice/poll-batch` — async batch pipeline (create job → upload to presigned URL → process → download)

All three paths (streaming, sync fallback, batch fallback) converge on the same transcript buffer.

### 4. Encryption & Offline Queue (`lib/voice/crypto.ts`, `lib/voice/idb-storage.ts`, `lib/voice/backgroundSync.ts`)

**Key hierarchy:**
- **DEK** (Data Encryption Key): AES-GCM-256, generated per session, stored only in a module-level variable (never persisted)
- **KEK** (Key Encryption Key): derived via HKDF-SHA256 from a per-user seed served by `/api/voice/encryption-key`
- **Wrapped DEK**: DEK encrypted with KEK, stored in `sessionStorage` for tab-reload recovery

All audio blobs and transcripts persisted to IndexedDB are encrypted at rest. If the user's session expires, the wrapped DEK becomes unrecoverable and stale ciphertext is auto-cleaned.

**Offline recovery:** When the network is unavailable when recording stops, encrypted blobs are queued in IndexedDB. `backgroundSync.ts` processes the queue on app init and on the browser `online` event, retrying up to 5 times with exponential backoff.

### 5. Clinical Structuring (`lib/voice/structureClinicalNotes.ts`, `actions/voice/structure.ts`)

- **Model:** OpenAI GPT-4o (`gpt-4o-2024-08-06`) at temperature 0.0
- **Mode:** Strict Structured Output via `zodResponseFormat` — Zod schema compiled to JSON Schema, enforced by OpenAI's constrained decoding
- **System prompt:** Department-aware surgical prompt instructing the model to act as a clinical extraction engine. Rules cover: third-person objective voice, chain-of-thought reasoning, Hinglish-to-English translation, vital sign formatting, zero data loss with catch-all routing
- **Incremental updates:** When `existingData` is provided, the prompt instructs the model to merge new dictation with existing notes (preserve, update, or append) rather than regenerate from scratch
- **80K character safety limit:** rejects transcripts exceeding a clinical safety threshold via `TranscriptTooLongError`

### 6. Department-Specific Schemas (`lib/consultationNotesSchemas.ts`)

Each department gets a dedicated Zod schema with specialty-specific fields:

| Department | Specialty Fields |
|---|---|
| Ophthalmology | visual_acuity, eye_examination, fundus, refraction |
| Neurology | motor_examination, sensory_examination, reflexes, cranial_nerves |
| Psychiatry | mental_status_exam, risk_assessment, mood, affect |
| Gynecology | obstetric_history, menstrual_history, pelvic_exam |
| Pediatrics | growth_params, developmental_milestones, immunization |
| Emergency Medicine | triage_acuity, interventions, disposition |
| General (default) | history_of_present_illness, physical_exam, systemic_examination, etc. |

The same schemas power both the AI structuring prompt and the `specialtyFieldSections` used by `InlineConsultationForm` to render department-specific form fields.

### 7. UI Layer

- **`DictationZone`**: record/pause/stop/reset buttons, elapsed timer, live transcript preview, degraded-mode indicator, crash recovery prompt
- **`EncounterCanvas`**: orchestrates `DictationZone` → `handleStructured` callback → `InlineConsultationForm`
- **`InlineConsultationForm`**: consumes `AIStructuredOutput` via `useEffect`, maps structured fields into React Hook Form, merges with manually edited data

---

## Key Design Decisions

### Decision 1: Dual-path capture (streaming + local recording)

**Why:** Real-time streaming gives the doctor immediate feedback (live transcript), which is essential for trust in the system. But streaming alone is fragile — network drops, proxy failures, and mobile connectivity issues are common in Indian clinics. The local MediaRecorder guarantees no audio is ever lost. The two paths run simultaneously, and the system transparently degrades to the local backup when streaming fails.

**Trade-off:** Higher client-side CPU/memory usage. Mitigated by 1-second chunked recording and throttled IndexedDB writes.

### Decision 2: Sarvam AI over Whisper/Deepgram for STT

**Why:** Sarvam's Saaras v3 model is optimized for Indian languages and Hinglish (Hindi-English code-switching), which is the dominant speech pattern in Indian clinical settings. It also offers a WebSocket API for real-time streaming, which Whisper (REST-only) does not. Deepgram supports Indic languages but lacks the depth of Hinglish training data Sarvam has.

**Trade-off:** Sarvam is a younger provider with a smaller ecosystem. Mitigated by the three-path fallback (streaming → sync REST → async batch), so even if the WebSocket API has issues, transcription still works.

### Decision 3: OpenAI GPT-4o with Zod Structured Output for clinical extraction

**Why:** Clinical notes require high precision. GPT-4o with `zodResponseFormat` guarantees the output conforms to the department-specific schema — no hallucinated fields, no missing required fields, no type violations. Temperature 0.0 ensures deterministic outputs. The Zod schemas serve double duty: they define the AI contract AND power the form rendering. Single source of truth.

**Trade-off:** Cost and latency. Mitigated by caching (server-side) and only calling OpenAI after transcription completes, not during recording.

### Decision 4: Standalone STT WebSocket proxy (not on Vercel)

**Why:** Vercel's serverless functions have a 10-second execution limit and do not support WebSocket upgrades natively. The Sarvam WebSocket API requires the API key in an HTTP header, which browsers cannot set on WebSocket connections. A standalone Node.js proxy (deployed on Render or similar) solves both problems: it handles the WebSocket upgrade, attaches the API key server-side, and verifies HMAC-signed tickets from the browser.

**Trade-off:** Additional infrastructure to manage. Mitigated by keeping the proxy stateless and simple (no database, no sessions — just forwarding).

### Decision 5: AES-GCM-256 encryption for all locally persisted audio

**Why:** Medical dictation contains PHI (Protected Health Information). Storing raw audio in IndexedDB would be a compliance violation. AES-GCM-256 with a per-session DEK, wrapped by a server-derived KEK, ensures that: (a) data at rest in IndexedDB is encrypted, (b) the DEK never touches disk, (c) a session expiry makes old ciphertext permanently unrecoverable (auto-cleaned).

**Trade-off:** Encryption/decryption overhead on every chunk write (~5ms per chunk). Acceptable given the 1-second chunk interval.

### Decision 6: Department-aware schemas with catch-all routing

**Why:** A generic "symptoms/diagnosis/prescriptions" schema would fail for specialties like Ophthalmology (needs visual acuity fractions, eye exam laterality) or Neurology (needs reflex grading, motor power scales). Department-specific schemas ensure the AI extracts specialty-relevant data. The catch-all routing (unmapped facts → `history_of_present_illness` or `treatment`) ensures no clinical data is dropped even if it doesn't fit a predefined field.

**Trade-off:** Maintenance burden of per-department schemas. Mitigated by sharing schemas between AI structuring and form rendering — adding a field to the schema automatically surfaces it in the UI.

### Decision 7: Server action for structuring, not client-side OpenAI calls

**Why:** The OpenAI API key must never reach the browser. Structuring happens via a Next.js Server Action (`actions/voice/structure.ts`), which keeps the key server-side and allows `revalidatePath` after the consultation is saved. This also enables server-side caching of repeated structuring calls.

---

## Impact

### On Doctor Workflow
- **Before:** Type symptoms, diagnosis, prescriptions, and notes into separate form fields during or after the consultation. ~3–5 minutes per encounter spent on data entry.
- **After:** Dictate naturally for the duration of the examination. The form is pre-populated. Review, make minor corrections, and submit. ~30 seconds of review time per encounter.
- **Time savings:** ~2–3 minutes per consultation. For a doctor seeing 60 patients/day, that's 2–3 hours recovered daily.

### On Data Quality
- Structured output enforces completeness — the AI extracts discrete fields (drug name, dosage, frequency, duration) from free-form dictation, reducing the "paracetamol 500mg TID x 5 days" scribbled in a free-text-box problem.
- Department-specific schemas capture specialty data that would otherwise be omitted (e.g., visual acuity fractions, reflex grades).
- Confidence indicators (`FieldConfidence`) flag low-certainty extractions for review.

### On System Architecture
- Voice AI was the forcing function for several architectural improvements:
  - **Department-specific schemas** (`consultationNotesSchemas.ts`) now serve as the single source of truth for both AI structuring and form rendering
  - **Encryption infrastructure** (`crypto.ts`, `idb-storage.ts`) provides a reusable pattern for any future PHI-bearing local data
  - **Offline queue** (`backgroundSync.ts`) establishes a pattern for resilient client-side operations in low-connectivity environments
  - **Server Action pattern** for AI calls reinforces the Server-First mandate — no API keys on the client

### On the Product
- Voice AI is the core differentiator. Indian EMRs are predominantly type-heavy; voice-first data entry is rare.
- It makes the per-consultation pricing viable — the time savings directly justify the cost.
- The degraded-mode design means the feature works even in clinics with unreliable internet, which is the norm in tier-2 and tier-3 Indian cities.

---

## File Index

| Concern | Files |
|---|---|
| Types | `types/voice.ts` |
| Streaming STT | `lib/voice/streamingStt.ts`, `stt-proxy/server.ts` |
| Fallback transcription | `lib/voice/fallbackTranscription.ts`, `lib/voice/sarvamBatch.ts` |
| Clinical structuring | `lib/voice/structureClinicalNotes.ts`, `lib/voice/structureUtils.ts`, `actions/voice/structure.ts` |
| Department schemas | `lib/consultationNotesSchemas.ts` |
| Encryption | `lib/voice/crypto.ts` |
| Local persistence | `lib/voice/idb-storage.ts` |
| Offline recovery | `lib/voice/backgroundSync.ts` |
| Capture hook | `hooks/voice/useDualCapture.ts`, `hooks/voice/useDictationMachine.ts` |
| UI components | `components/schedule/DictationZone.tsx`, `components/schedule/EncounterCanvas.tsx`, `components/schedule/InlineConsultationForm.tsx` |
| API routes | `app/api/voice/stt-ticket/`, `app/api/voice/encryption-key/`, `app/api/voice/transcribe-sync/`, `app/api/voice/transcribe-batch/`, `app/api/voice/submit-batch/`, `app/api/voice/poll-batch/` |
