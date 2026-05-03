# Doxxy Distribution Engine — Master Execution Plan

## Context

This plan turns Doxxy from a cost center into Clinic #1's primary revenue driver while generating automated B2B leads for Doxxy. Three sequential phases, each building on the last.

**Current state**: No WhatsApp infrastructure, no webhooks, no pg_cron, no public prescription pages, no follow-up automation. The database has no `follow_up` column, no messaging tracking tables.

**Supabase Project ID**: `chftygsapwhahqbqlfdx`

---

## Pre-requisite: WhatsApp Setup (Do Before Writing Any Code)

Meta's approval pipeline is the single biggest risk to this entire plan. A template rejection adds 5–7 days minimum. Do all of this before writing code.

### Embedded Signup Architecture (scales to 1000+ clinics)

Each clinic sends from its own WhatsApp number. Doxxy does NOT manage a pool of shared numbers — every clinic registers their own number through Doxxy's app using Meta's Embedded Signup API. This gives every clinic their own sender identity (display name = their business name, their phone number) while Doxxy's Business Manager remains the single Tech Provider.

1. **Meta Business Verification**: Verify Doxxy's Business Manager. Without verification, Embedded Signup is rate-limited and capped at a handful of test numbers.
2. **Embedded Signup access**: Request Embedded Signup from Meta's partnership team. This is NOT the self-serve dashboard — you need access to the WhatsApp Business Management API (`business_management` permission) and the `whatsapp_business_messaging` permission. Ask about:
   - Maximum WABAs (phone numbers) under Doxxy's Business Manager via Embedded Signup
   - Message throughput per WABA (critical: single-clinic numbers will have low volume)
   - Quality-rating thresholds for low-volume numbers
   - Any BSP/ Tech Provider certification requirements
3. **Embedded Signup UI in Doxxy**: Each clinic's onboarding flow includes a "Connect WhatsApp" step. The clinic owner enters their WhatsApp number → Meta sends OTP to that number → the owner enters OTP in Doxxy's UI → Meta registers the number as a WABA under Doxxy's Business Manager → Doxxy stores `whatsapp_phone_number_id` and `whatsapp_waba_id` in the `clinics` row. The clinic's existing WhatsApp Business App on their phone continues working (messages sent via Doxxy's API appear in their Sent folder; they can still use the app manually).
4. **Generate permanent System User Token** for Doxxy's Business Manager. This single token sends on behalf of every registered phone number under Doxxy's Business Manager.
5. **Submit all three templates for approval immediately** (24–48h, often longer). All templates must include the "Stop reminders" opt-out Quick Reply button. Note: the `review_request` template body must read as Utility, not Marketing — Meta will reject copy that sounds promotional. Frame it as a visit closure notification with a review button as secondary CTA, not as a review solicitation.
6. **Configure webhook endpoint** in Meta dashboard (per-WABA webhooks can be set via API during Embedded Signup, or a single webhook at the Business Manager level handles all WABAs).
7. **Brief Clinic #1** that automated messages will appear in their WhatsApp Business App's Sent folder.

---

## Shared Infrastructure (Phase 1 — used by all phases)

### WhatsApp Cloud API
- **`lib/whatsappApi.ts`**: Service layer for WhatsApp Cloud API (`graph.facebook.com/v25.0`). Functions: `sendTemplateMessage()`, `uploadMedia()`, `sendDocumentMessage()`, `getMessageStatus()`.
- **`supabase/functions/send-whatsapp-template/index.ts`**: Single Edge Function for all WhatsApp template sending. Receives `{ automation_id, patient_phone, template_name, params, button_url }`. Follows the `invite-member` Edge Function pattern (Deno, CORS, service-role client). **Secrets**: reads `WHATSAPP_ACCESS_TOKEN` from `Deno.env` — never from the database. **Dynamic routing**: fetches `clinics.whatsapp_phone_number_id` for the request's `clinic_id`, constructs `https://graph.facebook.com/v25.0/${phoneNumberId}/messages` at runtime. **Gate check**: queries `patients.whatsapp_opt_out` before sending — if true, marks automation `cancelled` and aborts. **Review URL construction**: for `review_request` automations, fetches `google_place_id` from `doctors` (falling back to `clinics`), constructs `https://search.google.com/local/writereview?placeid=${place_id}` in memory. Never reads a stored URL.

### WhatsApp Opt-Out System
Meta bans accounts that receive too many block/spam reports. Every outbound template must include an opt-out path.

- **Database**: `ALTER TABLE patients ADD COLUMN whatsapp_opt_out boolean DEFAULT false`
- **Templates**: All templates include a native "Stop reminders" Quick Reply button. When tapped, Meta sends an inbound message to the webhook.
- **Webhook handler**: `app/api/webhooks/whatsapp/route.ts` — GET for verification handshake, POST for delivery callbacks and incoming messages. If incoming message body matches "Stop reminders" or the opt-out button payload, sets `patients.whatsapp_opt_out = true` for that phone number. If message body matches "START", sets `whatsapp_opt_out = false`. **Echo filter at the top of every POST handler**: silently drop (return 200) any message sent from the clinic's own phone number to prevent infinite loops.
- **Enforcement**: `get_pending_automations()` RPC excludes opted-out patients. The Edge Function double-checks before send.

### Credentials Architecture

Credentials split into two categories. Never mix them.

**Supabase Edge Function Secrets** (global, set once via CLI, never touch the codebase):
```
supabase secrets set WHATSAPP_ACCESS_TOKEN="EAAU..."
supabase secrets set WHATSAPP_WEBHOOK_VERIFY_TOKEN="your_secure_string"
```
`WHATSAPP_ACCESS_TOKEN` is a single Doxxy System User Token with permission to send on behalf of every phone number registered under Doxxy's Business Manager via Embedded Signup. Storing it per-clinic in the database would copy the same secret across every row — a database dump becomes a full account takeover. Read at runtime via `Deno.env.get('WHATSAPP_ACCESS_TOKEN')`.

**Vercel Environment Variables** (server-only, not tenant-specific):
`CRON_SECRET`, `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`

**`clinics` table** (tenant identifiers — not secrets, fetched per-request by the Edge Function):
`whatsapp_phone_number_id` — Meta's numeric ID for this clinic's registered WhatsApp number, populated by Embedded Signup
`whatsapp_waba_id` — WhatsApp Business Account ID, also populated by Embedded Signup

### Queue Table: `automation_queue`
Serves all three phases. Columns: `id`, `clinic_id`, `patient_id`, `doctor_id`, `appointment_id`, `automation_type` (enum: `review_request`, `prescription_share`, `bill_share`, `follow_up_reminder`), `status` (pending/sent/failed/cancelled), `payload` (JSONB), `scheduled_at`, `processed_at`, `error_message`.

Add a partial index to keep query performance as rows accumulate: `CREATE INDEX ON automation_queue (status, scheduled_at) WHERE status = 'pending'`. Add a pg_cron job to archive rows with `processed_at < now() - interval '90 days'` to prevent unbounded table growth.

### Vercel Cron: `process-automation-queue`
- **`app/api/cron/process-automation-queue/route.ts`**: Runs every 15 minutes. Calls `get_pending_automations()` RPC, invokes `send-whatsapp-template` Edge Function for each row. Batch limit: 20 per run.
- **`vercel.json`**: Cron entries added in Phase 1 and Phase 3.

---

## Phase 1: Review Requests (7–10 days including Meta approval)

**Goal**: When an appointment is marked Completed, wait 2 hours, then send the patient a WhatsApp message asking for a Google review. Show the superadmin a Reviews Generated stat card.

**Anti-spam rule**: A patient must not receive more than one review request every 90 days regardless of appointment frequency.

### Google Places Autocomplete (built in Phase 1, not deferred)

Instead of requiring clinic owners to look up and paste Google Place IDs manually, Doxxy embeds Google Places Autocomplete into every form that collects a place ID. The user types their clinic/doctor name, selects from the dropdown, and the `place_id` is extracted and saved — they never see a raw ID or URL.

- **Package**: `react-google-autocomplete` (lightweight wrapper, no full Maps embed needed)
- **Component**: `components/clinic/PlacesAutocompleteInput.tsx` — reusable across all collection points. Props: `onPlaceSelected: (placeId: string, displayName: string) => void`, `defaultValue?: string` (for editing).
- **API key**: `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` — restricted in Google Cloud Console to `doxxy.in` and `localhost:3000`. Use the Places API (not Maps JavaScript API) to keep costs low. An unrestricted key will accumulate charges from scrapers.
- **Backup manual input**: A small "Paste Place ID manually" collapsible below the autocomplete, for edge cases where a clinic isn't yet on Google Maps.

### Review Link Architecture

In Indian clinics, doctors often share a physical space but operate as independent practitioners. Dr. A's patient must never receive Dr. B's review link.

Store the `google_place_id`, not a constructed URL. The review URL (`https://search.google.com/local/writereview?placeid=...`) is constructed at send time in the Edge Function from the stored place ID. This means if Google changes their URL structure, one line of code fixes all clinics instantly. It also unlocks future API calls to fetch live star ratings for the analytics dashboard — something a raw URL cannot do.

- **`doctors.google_place_id`**: Primary. Each doctor has their own Google My Business listing.
- **`clinics.google_place_id`**: Fallback. Used only if the treating doctor's place ID is NULL.
- **If both are NULL**: The automation sets status to `cancelled` and aborts silently. No broken button gets sent.

### Database Changes
1. `ALTER TABLE doctors ADD COLUMN google_place_id text`
2. `ALTER TABLE clinics ADD COLUMN google_place_id text`
3. `ALTER TABLE patients ADD COLUMN last_review_requested_at timestamptz`
4. `ALTER TABLE patients ADD COLUMN whatsapp_opt_out boolean DEFAULT false`
5. Phone/WhatsApp columns on `clinics`:
   - `contact_phone text` — public-facing number displayed to patients (may be a landline)
   - `whatsapp_phone text` — the clinic's WhatsApp Business number; the one the clinic owner enters during Embedded Signup
   - `whatsapp_phone_number_id text` — Meta's numeric ID for the registered number, populated by Embedded Signup
   - `whatsapp_waba_id text` — WhatsApp Business Account ID, populated by Embedded Signup
6. Create `automation_queue` table (see Shared Infrastructure above)
7. Create trigger `enqueue_review_request()`: fires on `appointment.status → Completed`. Checks `patients.last_review_requested_at` — if less than 90 days ago, skips. Otherwise inserts into `automation_queue` with `automation_type = 'review_request'` and `scheduled_at = now() + interval '2 hours'`.
8. Unique index on `(appointment_id, automation_type) WHERE automation_type = 'review_request'` prevents duplicate enqueues. Use `ON CONFLICT DO NOTHING` in the trigger so status flip-flops (Completed → Scheduled → Completed) fail silently rather than throwing.
9. When the cron successfully sends the review request, update `patients.last_review_requested_at = now()`.

### Embedded Signup Flow (replaces Coexistence pre-requisite)

Rather than Meta's manual Coexistence OTP flow, clinics onboard through Doxxy's UI using Embedded Signup:

1. **UI in clinic settings**: Clinics see a "Connect WhatsApp" section. They enter their WhatsApp Business number. Doxxy initiates the Embedded Signup flow via Meta's API — the clinic owner receives an OTP on their phone. They enter the OTP in Doxxy's UI. Meta returns `whatsapp_phone_number_id` and `whatsapp_waba_id`, which Doxxy saves to the `clinics` row.
2. **Webhook registration**: After Embedded Signup completes, Doxxy registers the webhook for the new WABA via API. This is programmatic — no manual dashboard step per clinic.
3. **Template sync**: Templates are submitted once at the Business Manager level and apply to all WABAs under it (verify with Meta — if templates are per-WABA, the Edge Function must handle syncing).
4. **Disconnect flow**: Clinics can disconnect their WhatsApp number from Doxxy, which revokes the WABA registration. This is important for churned clinics.

### Phone Number Collection (clinic onboarding + settings)

**Primary input**: "Clinic Contact Number" — displayed publicly to patients, can be any number.

**WhatsApp section** (shown immediately during onboarding, not deferred):
- **"Connect WhatsApp" button**: Triggers Embedded Signup flow described above. Before connection: shows "Not connected — automated messages disabled."
- **After successful Embedded Signup**: Shows "Connected as +91 XXXX-XXXX" with a "Disconnect" button and an "Is this also your public contact number?" checkbox (checked by default).
- **The WhatsApp number must match the number registered in Meta**: The Embedded Signup flow validates this inherently — the OTP goes to the number being registered, so the number is self-verifying.

Save `contact_phone` always. Save `whatsapp_phone` from Embedded Signup. `whatsapp_phone_number_id` and `whatsapp_waba_id` are populated from Meta's Embedded Signup response — never typed by the user.

| Level | UI Location | Field |
|-------|-------------|-------|
| Doctor | `DoctorQuickOnboarding.tsx` | `google_place_id` (Places Autocomplete) |
| Clinic | `ClinicDetailsManagement.tsx` (`/clinic/about`) | `google_place_id` (Places Autocomplete), `contact_phone`, WhatsApp Embedded Signup |
| Clinic | `create-clinic/page.tsx` (Step 1) | `google_place_id` (Places Autocomplete), `contact_phone`, WhatsApp Embedded Signup |

### Hook Changes
- **`useDoctorQuickOnboarding.ts`**: Add `google_place_id` to the mutation payload and `doctors` upsert.
- **New hook `useWhatsAppEmbeddedSignup.ts`**: Manages Embedded Signup state — initiates signup, handles OTP verification callback, stores returned `whatsapp_phone_number_id` and `whatsapp_waba_id` to `clinics`.
- **New API route `app/api/whatsapp/embedded-signup/route.ts`**: Server-side handler for Embedded Signup API calls to Meta. Stores the returned credentials.

### WhatsApp Template
- **Name**: `review_request` (Utility)
- **Body**: "Hi {{1}}, your visit with Dr. {{2}} has been closed. We hope you're feeling better. If you'd like to leave a review, tap below."
- **Params**: {{1}} = patient name, {{2}} = doctor name
- **Button (URL)**: {{3}} = `https://search.google.com/local/writereview?placeid=` + resolved `google_place_id` (constructed in the Edge Function, never stored as a URL)
- **Quick Reply button**: "Stop reminders"

### Analytics
- **New RPC**: `get_clinic_review_stats(clinic_id, start_date, end_date)` — counts `review_request` rows with status `sent`
- **New hook**: `hooks/useAutomationAnalytics.ts`
- **Modify**: `components/dashboard/AnalyticsPage.tsx` — add "Reviews Generated" stat card

### Files
| Action | Path |
|--------|------|
| Create | `supabase/migrations/202605XX_phase1_automation_queue.sql` |
| Create | `supabase/functions/send-whatsapp-template/index.ts` |
| Create | `app/api/cron/process-automation-queue/route.ts` |
| Create | `app/api/webhooks/whatsapp/route.ts` |
| Create | `app/api/whatsapp/embedded-signup/route.ts` |
| Create | `lib/whatsappApi.ts` |
| Create | `hooks/useAutomationAnalytics.ts` |
| Create | `hooks/useWhatsAppEmbeddedSignup.ts` |
| Modify | `vercel.json` |
| Create | `components/clinic/PlacesAutocompleteInput.tsx` (reusable — used in all four collection points) |
| Modify | `types/core.ts` (add DbAutomationQueue, AutomationType, update DbDoctor, DbPatient, DbClinic) |
| Modify | `lib/constants.ts` (WhatsApp API constants) |
| Modify | `components/dashboard/AnalyticsPage.tsx` |
| Modify | `components/doctor/DoctorQuickOnboarding.tsx` (replace review link field with Places autocomplete) |
| Modify | `hooks/useDoctorQuickOnboarding.ts` (google_place_id) |
| Modify | `components/superadmin/ClinicDetailsManagement.tsx` (replace review link field with Places autocomplete + WhatsApp Embedded Signup) |
| Modify | `app/(app)/create-clinic/page.tsx` (replace review link field with Places autocomplete + WhatsApp Embedded Signup) |
| Regenerate | `integrations/supabase/types.ts` |

---

## Phase 2: Public Prescription Pages (7 days)

**Goal**: Replace PDF attachments with branded, trackable public web pages. Patients unlock access via a 4-digit PIN delivered in the WhatsApp message body. No account creation. No date of birth.

**Why PIN over DOB**: Front desk staff in fast-paced Indian clinics collect age, not DD-MM-YYYY. Requiring DOB when the database only stores approximate age locks patients out of their own records. A PIN generated at link creation and embedded in the WhatsApp message removes the data-entry dependency entirely.

### Database Changes
1. Create `encounter_links` table:
   - `encounter_id` (text, unique — URL slug)
   - `clinic_id`, `patient_id`, `prescription_id`, `bill_id`
   - `record_type` (enum: `prescription`, `bill`)
   - `access_pin` (text, 4 digits) — randomly generated at insert, validated by public page
   - `is_active` (boolean, default true)
   - `view_count`, `first_viewed_at`, `last_viewed_at`
   - CHECK constraint: exactly one of `prescription_id` or `bill_id` is NOT NULL
2. Create `pin_attempts` table: `encounter_id`, `ip_address`, `attempted_at`, `succeeded`. Used by the verify-pin API to enforce rate limiting across serverless cold starts. Without this, an in-memory counter is wiped on every function recycle.
3. Create trigger `create_encounter_link()`: fires AFTER INSERT on `prescriptions` and `bills`. Generates `encounter_id = encode(sha256((id || type)::bytea), 'hex')`, generates a random 4-digit PIN via `floor(random() * 9000 + 1000)::int::text`, inserts into `encounter_links`, enqueues `prescription_share` / `bill_share` automation in `automation_queue` with the PIN in the payload.
4. RPCs:
   - `get_encounter_link(encounter_id)` — returns the encounter link with joined data (SECURITY DEFINER, no auth gate)
   - `verify_encounter_pin(encounter_id, pin)` — checks `pin_attempts` for rate limit, validates PIN, returns `{ valid, patient_name, record_data }`
   - `increment_encounter_link_views(encounter_id)` — updates view counters

### WhatsApp Template
- **Name**: `prescription_share` (Utility)
- **Body**: "Your {{1}} from Dr. {{2}}'s clinic on {{3}} is ready. PIN: {{4}}. Tap below to view."
- **Button (URL)**: `https://doxxy.in/p/{{5}}`

### Frontend
- **`app/(public)/p/[encounter_id]/page.tsx`**: Public page. Fetches the encounter link by `encounter_id` (no auth needed — the slug is unguessable). Shows PIN gate. After validation, renders the record. Tracks view on successful auth.
- **`components/public/PINAuthGate.tsx`**: Four separate input boxes, auto-advancing focus. Calls `verify-pin` API. Shake animation on mismatch. After 5 failed attempts (tracked in `pin_attempts` table), lockout for 10 minutes.
- **`components/public/SharedRecordView.tsx`**: Renders prescription (medications table: name, dosage, frequency, duration, instructions) or bill (line items + totals). Mobile-first. Footer: "Securely managed by Doxxy." with a soft link to `/features` — keep this understated in the initial rollout.
- **API routes**:
  - `app/api/encounters/verify-pin/route.ts` — POST, checks `pin_attempts` table for rate limit, returns `{ success, patient_name, record_data }` or `{ success: false, attempts_remaining }`
  - `app/api/encounters/track-view/route.ts` — POST, calls `increment_encounter_link_views`
- **Hook**: `hooks/useSharedRecord.ts` — fetches encounter link metadata, manages PIN auth state

### Files
| Action | Path |
|--------|------|
| Create | `supabase/migrations/202605XX_phase2_encounter_links.sql` |
| Create | `app/(public)/p/[encounter_id]/page.tsx` |
| Create | `components/public/SharedRecordView.tsx` |
| Create | `components/public/PINAuthGate.tsx` |
| Create | `app/api/encounters/verify-pin/route.ts` |
| Create | `app/api/encounters/track-view/route.ts` |
| Create | `hooks/useSharedRecord.ts` |
| Modify | `types/core.ts` (add DbEncounterLink, RecordType) |
| Regenerate | `integrations/supabase/types.ts` |

---

## Phase 3: Follow-Up Reminders (21 days)

**Goal**: Automate follow-up reminders that drive repeat appointments back to Clinic #1.

### Database Changes
1. `ALTER TABLE consultations ADD COLUMN follow_up_weeks integer`
2. `ALTER TABLE consultations ADD COLUMN follow_up_date date`
3. Create trigger `compute_follow_up_date()`: BEFORE INSERT OR UPDATE OF `follow_up_weeks`, sets `follow_up_date = (created_at AT TIME ZONE 'Asia/Kolkata')::date + (follow_up_weeks * 7)`. Use explicit timezone to prevent breakage if the server timezone assumption ever changes.
4. RPC `get_upcoming_follow_ups()`: returns consultations WHERE `follow_up_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date + 3`, no existing follow-up appointment, no recent duplicate reminder sent
5. RPC `get_revenue_recovered(clinic_id, start_date, end_date)`: counts appointments created within 7 days of a follow-up reminder being sent × average consultation fee

### WhatsApp Template
- **Name**: `follow_up_reminder` (Utility)
- **Body**: "Hi {{1}}, it's time for your follow-up with Dr. {{2}}. Tap below to book a time."
- **Button (URL)**: Clinic booking link
- **Quick Reply button**: "Stop reminders"

### Cron
- **`app/api/cron/enqueue-follow-up-reminders/route.ts`**: Runs at 9:00 AM IST (3:30 AM UTC). Calls `get_upcoming_follow_ups()`, inserts into `automation_queue`. The existing `process-automation-queue` cron picks them up within 15 minutes.
- **`vercel.json`**: Add second cron entry `"30 3 * * *"`

### Frontend
- **`components/consultation/FollowUpWeeksInput.tsx`**: Dropdown for follow-up weeks (1, 2, 4, 12, 26, 52). Placed in the consultation form's Management section.
- **Modify consultation form / TodayDetailPanel**: Add `follow_up_weeks` input on consultation close

### Analytics
- **Modify `hooks/useAutomationAnalytics.ts`**: Add `revenueRecovered` query
- **Modify `AnalyticsPage.tsx`**: Add "Revenue Recovered" stat card (₹X,XXX format)

### Files
| Action | Path |
|--------|------|
| Create | `supabase/migrations/202605XX_phase4_follow_up.sql` |
| Create | `app/api/cron/enqueue-follow-up-reminders/route.ts` |
| Create | `components/consultation/FollowUpWeeksInput.tsx` |
| Modify | `vercel.json` |
| Modify | `types/core.ts` (add follow_up_weeks, follow_up_date to DbConsultation) |
| Modify | `components/dashboard/AnalyticsPage.tsx` |
| Modify | `hooks/useAutomationAnalytics.ts` |
| Modify | Consultation form / TodayDetailPanel |
| Regenerate | `integrations/supabase/types.ts` |

---

## Implementation Sequence

```
Phase 1: WhatsApp infra → opt-out system → automation_queue table → review trigger → cron → Embedded Signup UI → Places Autocomplete → analytics card
Phase 2: encounter_links table → pin_attempts table → /p/[encounter_id] → PIN gate → WhatsApp with PIN
Phase 3: follow_up columns → follow-up cron → FollowUpWeeksInput → revenue analytics card
```

Phases 2 and 3 both depend on Phase 1's WhatsApp infrastructure and opt-out system. Phase 3 depends on Phase 2's `/p/` route.

---

## Verification Checklist

- **Phase 1**: Mark appointment Complete → `automation_queue` row created with 2h delay → second appointment within 90 days is skipped → cron sends message → patient taps "Stop reminders" → `whatsapp_opt_out = true` → subsequent sends cancelled → analytics card reflects count
- **Phase 2**: Create prescription → `encounter_links` row with 4-digit PIN → WhatsApp received with PIN in body → patient enters PIN on public page → unlocks record → 5 wrong PINs locks out for 10 min (verified against `pin_attempts` table, not in-memory) → view count increments
- **Phase 3**: Set `follow_up_weeks = 2` on consultation → `follow_up_date` computed with IST timezone → 3 days before date, cron enqueues reminder → WhatsApp sent → patient books appointment → analytics shows recovered revenue
