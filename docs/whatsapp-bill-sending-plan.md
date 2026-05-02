# Plan: Automated WhatsApp Bill & Consultation Note Sending

## Context

Currently, "sending" a bill via WhatsApp is purely manual: it generates a PDF client-side, downloads it to the user's machine, and opens `wa.me/{phone}` in a new tab. The user must manually attach the PDF and hit send. There is no server-side messaging, no delivery tracking, and no automation.

The user wants to integrate the WhatsApp Cloud API to:
1. Automatically send bills to patients 15 minutes after creation (cron)
2. Track sent status so bills aren't sent twice
3. Keep a manual send option (upgraded to use the actual API)
4. Do the same for consultation notes
5. Set up webhooks for WhatsApp delivery status callbacks

The user has already created a Facebook app and needs the webhook endpoint and integration code.

## Approach

- **Database**: New `whatsapp_messages` tracking table (audit trail) + two SECURITY DEFINER RPCs to find unsent bills/consultations
- **PDF Generation**: `pdfmake` (Node-compatible, no browser APIs needed) — new `lib/pdfServerGenerator.ts` parallel to the existing client-side generator
- **WhatsApp API**: New service layer at `lib/whatsappApi.ts` for upload + send operations
- **Cron**: Vercel Cron Jobs (every 15 min → `*/15 * * * *`) triggers `app/api/cron/send-whatsapp-messages/route.ts`
- **Webhook**: `app/api/webhooks/whatsapp/route.ts` handles Meta's GET verification + POST delivery status events
- **Manual Send**: New API routes + React Query hooks, replaces current client-side-only flow
- **Consultation Notes**: New `lib/consultationPdfGenerator.ts` + same send infrastructure

## Database Changes

### Migration 1: `whatsapp_messages` table

```sql
CREATE TABLE public.whatsapp_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id uuid REFERENCES public.bills(id) ON DELETE SET NULL,
  consultation_id uuid REFERENCES public.consultations(id) ON DELETE SET NULL,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  recipient_phone text NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('bill', 'consultation')),
  whatsapp_message_id text,        -- Meta's wamid
  media_id text,                   -- Meta's uploaded media ID
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  status_history jsonb DEFAULT '[]'::jsonb,
  attempt_count integer DEFAULT 0,
  last_attempt_at timestamptz,
  next_retry_at timestamptz,
  error_code text,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

RLS: clinic members can SELECT their clinic's messages. Indexes on `(bill_id)`, `(consultation_id)`, `(status)`, `(clinic_id, status)`.

### Migration 2: `get_unsent_bills()` RPC

SECURITY DEFINER function. LEFT JOINs `bills` against `whatsapp_messages` (where `message_type = 'bill'`). Returns bills with no WhatsApp message, patient has phone, and `created_at` is at least `p_min_age_minutes` old (default 5). Ordered by `created_at ASC`, limit 50.

### Migration 3: `get_unsent_consultations()` RPC

Same pattern for consultations. Returns consultations with `specialty_data IS NOT NULL`, no existing WhatsApp message, patient has phone, at least `p_min_age_minutes` old.

## Implementation Sequence

### Step 1: Environment Variables & Constants

Add to `.env.local`:
```
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_WEBHOOK_VERIFY_TOKEN=...
CRON_SECRET=...
```

Add to `lib/constants.ts`:
```
WHATSAPP_API_BASE_URL = "https://graph.facebook.com/v22.0"
WHATSAPP_API_VERSION = "v22.0"
```

### Step 2: Database Migrations

Create the 3 migration SQL files, apply them, regenerate Supabase types (`npx supabase gen types typescript`), then add `DbWhatsAppMessage` wrappers to `types/core.ts`.

### Step 3: `lib/pdfServerGenerator.ts` — Server-Side Bill PDF

Uses `pdfmake` to generate a PDF buffer. Mirrors the layout from `components/billing/billingPrintUtils.ts:generateBillPrintContent()`:
- Clinic header (name, address, phone, email)
- "Bill To" section (patient name, phone)
- Invoice metadata (invoice number, date)
- Service items table (description, qty, rate, amount)
- Totals (subtotal, discount, tax, final total)
- Notes

Function signature: `generateBillPdfBuffer(bill: Bill, patient: DbPatient, clinic: DbClinic): Promise<Buffer>`

### Step 4: `lib/whatsappApi.ts` — WhatsApp Cloud API Service

Functions:
- `uploadPdfMedia(pdfBuffer: Buffer, filename: string): Promise<string>` — POST multipart upload, returns media ID
- `sendDocumentMessage(phone: string, mediaId: string, filename: string, caption: string): Promise<{ wamid: string }>`
- `getMessageStatus(wamid: string): Promise<WhatsAppStatusResponse>`

Error handling: classify Meta error codes (e.g., 131047 = phone not on WhatsApp → permanent failure, no retry).

### Step 5: `app/api/webhooks/whatsapp/route.ts` — Webhook Handler

- **GET**: Verify Meta's handshake (`hub.mode=subscribe&hub.verify_token=...&hub.challenge=...`) → return challenge
- **POST**: Parse Meta's event payload, extract message status updates, update `whatsapp_messages` rows (status, status_history, error_code)

### Step 6: `app/api/cron/send-whatsapp-messages/route.ts` — Cron Handler

1. Authenticate via `Authorization: Bearer <CRON_SECRET>` header
2. Call `get_unsent_bills(5)` and `get_unsent_consultations(5)` RPCs
3. For each unsent bill:
   a. Fetch patient + clinic data
   b. Generate PDF via `lib/pdfServerGenerator.ts`
   c. Upload media to WhatsApp
   d. Send document message
   e. Insert `whatsapp_messages` row with status = `'sent'`
4. For each unsent consultation:
   a. Same flow using `lib/consultationPdfGenerator.ts`
5. Batch limit: 15 items per invocation (Vercel timeout safety)
6. Return JSON: `{ bills_sent: N, consultations_sent: N, errors: [...] }`

### Step 7: `vercel.json` — Cron Configuration

Add `crons` array:
```json
"crons": [{ "path": "/api/cron/send-whatsapp-messages", "schedule": "*/15 * * * *" }]
```

### Step 8: `app/api/whatsapp/send-bill/route.ts` — Manual Bill Send

POST handler. Authenticated (user's Supabase auth header). Validates `{ billId }` via Zod. Same PDF generation + WhatsApp send flow. Returns `{ success: true, wamid }`.

### Step 9: `hooks/useSendBillViaWhatsApp.ts` — Manual Send Hook

`useMutation` wrapping the API call. Shows sonner toast on success/error. Invalidates WhatsApp message query cache.

### Step 10: Update `components/billing/BillingModal.tsx`

Replace the current `sendBillViaWhatsApp()` (from `lib/billPdfExport.ts`) call in the Send button's onClick with the new hook's mutation. Remove the `lib/billPdfExport.ts` import. Keep the phone number check (use `usePatientPhone`).

### Step 11: `lib/consultationPdfGenerator.ts` — Consultation Notes PDF

Generates a PDF from consultation `specialty_data` JSON using `pdfmake`. Structured summary of clinical findings, assessment, and plan.

### Step 12: Consultation Manual Send

New files: `app/api/whatsapp/send-consultation/route.ts`, `hooks/useSendConsultationViaWhatsApp.ts`. Same pattern as bill send.

## Files to Create (12 new)

- `supabase/migrations/20260503XXXXXX_create_whatsapp_messages.sql`
- `supabase/migrations/20260503YYYYYY_get_unsent_bills.sql`
- `supabase/migrations/20260503ZZZZZZ_get_unsent_consultations.sql`
- `lib/pdfServerGenerator.ts`
- `lib/consultationPdfGenerator.ts`
- `lib/whatsappApi.ts`
- `app/api/cron/send-whatsapp-messages/route.ts`
- `app/api/webhooks/whatsapp/route.ts`
- `app/api/whatsapp/send-bill/route.ts`
- `app/api/whatsapp/send-consultation/route.ts`
- `hooks/useSendBillViaWhatsApp.ts`
- `hooks/useSendConsultationViaWhatsApp.ts`

## Files to Modify (5 existing)

- `vercel.json` — add `crons` key
- `components/billing/BillingModal.tsx` — update Send button onClick
- `lib/constants.ts` — add WhatsApp API constants
- `types/core.ts` — add `DbWhatsAppMessage` wrapper types (after Supabase types regeneration)
- `integrations/supabase/types.ts` — regenerated via CLI after migrations

## Key Design Decisions

1. **Separate tracking table over status column**: `whatsapp_messages` provides an audit trail and naturally supports both bills and consultations without adding columns to each table. Follows the same logic as the migration that removed `bills.status`.

2. **pdfmake over jspdf+html2canvas**: The current PDF generator uses browser APIs (canvas, DOM). `pdfmake` is pure Node.js with a declarative JSON API — ideal for server-side generation.

3. **5-minute grace period**: Bills created in the last 5 minutes are skipped by the cron. This allows time for editing before automatic sending.

4. **Vercel Cron over pg_cron**: Native Vercel integration, no Supabase extension dependency, easier monitoring, same runtime as API routes.

5. **Batch limit of 15 per run**: Stays safely under Vercel's timeout (60s hobby, 300s pro) even with multiple PDF generations + WhatsApp API calls.

6. **Permanent vs retryable failures**: Meta error code 131047 (phone not on WhatsApp) → permanent failure, no retry. Rate limits (error 4, 80000) → retry with exponential backoff.

## Verification

1. Apply migrations, verify `whatsapp_messages` table and RPCs exist
2. Set env vars, test WhatsApp media upload manually via a small script
3. Create a bill with a patient that has a phone number → wait 5 min → hit the cron endpoint with CRON_SECRET → verify WhatsApp receives the PDF
4. Check `whatsapp_messages` row is created with correct status
5. Configure Meta webhook → send a test message → verify webhook receives and updates status
6. Test manual Send button in BillingModal → verify sonner toast + WhatsApp delivery
7. Test consultation notes manual send
8. Run `npm run test` to verify no regressions
