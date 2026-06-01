# Meta App Review — Allowed Usage Descriptions

App ID: `2593115681091436`

---

## 1. `public_profile`

**How will this app use public_profile?**

Doxxy uses the Facebook Login SDK (`FB.login()`) to authenticate clinic administrators when they connect their WhatsApp Business Account via Embedded Signup. When a clinic superadmin clicks "Connect WhatsApp" in their clinic settings, the Facebook Login dialog opens, the admin authenticates, and we receive an OAuth authorization code. This code is exchanged server-side for an access token — we do not read, store, or display the admin's Facebook profile data. The `public_profile` permission is the minimum required scope for the Login dialog to function.

---

## 2. `whatsapp_business_messaging`

**How will this app use whatsapp_business_messaging?**

Doxxy sends WhatsApp messages on behalf of clinics using the WhatsApp Cloud API (`/v25.0/{phone_number_id}/messages`). Each clinic connects its own WhatsApp Business number via Embedded Signup, so messages always come from the clinic's own verified number — patients see the clinic's name and number, not Doxxy's.

Two message types are sent:

1. **Document messages (PDFs):** After a consultation, clinic staff can send the patient a digital copy of their visit summary and invoice as a PDF via WhatsApp — the same documents the patient would otherwise receive on paper at the front desk.
2. **Template messages:** After a visit, staff can send a post-consultation feedback message asking the patient about their experience. This is a standard healthcare practice for quality improvement — clinics use patient feedback to improve care, not for marketing.

All messages are manually triggered by clinic staff after a consultation is complete — there is no bulk sending, no marketing broadcasts, and no automated drip campaigns. Every message requires an explicit human action tied to a specific patient visit.

Opt-out is built into every template via a "Stop reminders" Quick Reply button. When a patient replies STOP, our webhook handler marks them as opted out and blocks all future messages. The system enforces a hard uniqueness constraint: only one feedback message can ever be sent to a given patient for a given doctor (or clinic). Once sent, that patient-doctor pair is permanently deduplicated — no repeat requests regardless of how many future visits occur.

---

## 3. `whatsapp_business_management`

**How will this app use whatsapp_business_management?**

Doxxy uses the WhatsApp Business Management API to onboard clinics via Embedded Signup. When a clinic superadmin connects their WhatsApp number:

1. Exchange the OAuth authorization code for a short-lived token, then upgrade to a long-lived token (~60 days)
2. Discover the clinic's WABA IDs via `GET /me/assigned_whatsapp_business_accounts`
3. Discover phone numbers under each WABA via `GET /{waba_id}/phone_numbers`
4. Check phone number health: verification status, display name approval, quality rating
5. Trigger SMS verification codes via `POST /{phone_number_id}/request_code` if the number isn't yet verified
6. Verify the code via `POST /{phone_number_id}/verify_code` when the admin enters the 6-digit code

All credentials (`phone_number_id`, `waba_id`, `access_token`) are stored in a secure database table with Row-Level Security so each clinic can only access its own connection. Clinics can disconnect at any time, which revokes the stored token.

This permission is used solely for Embedded Signup onboarding and credential management — it is not used to read message history, manage templates, or access any other WABA data.

---

## 4. `business_management`

**How will this app use business_management?**

Doxxy acts as a Tech Provider / ISV for healthcare clinics in India. The `business_management` permission is required for Meta's Embedded Signup flow, which allows clinics to register their own WhatsApp Business Accounts (WABAs) under Doxxy's Business Manager. This permission enables the app to:

- Create and manage WABAs on behalf of clinics within Doxxy's Meta Business Manager
- Register phone numbers as WhatsApp Business numbers under those WABAs
- Route messages through the correct clinic's credentials so each clinic sends from its own number

Without this permission, clinics would need to manually create their own Meta Business Manager accounts, set up WABAs, and share credentials — which is unrealistic for small Indian clinics with limited technical staff. Embedded Signup makes this a single-click flow.

Doxxy does not access, modify, or manage any other business assets (ad accounts, pages, pixels, catalogs, Instagram accounts, etc.) under the Business Manager. The permission is scoped exclusively to WhatsApp-related assets.

---

## Data Handling

### processor-0: Data processors with access to Platform Data

**Answer: Yes**

Doxxy uses two data processors that may handle Platform Data (OAuth authorization codes, WhatsApp access tokens, WABA IDs, phone number IDs) received from Meta:

1. **Supabase** (supabase.com) — Cloud database and Edge Function runtime. WhatsApp access tokens, WABA IDs, and phone number IDs are stored in a PostgreSQL database hosted by Supabase. Meta OAuth token exchange happens through Supabase Edge Functions.
2. **Vercel** (vercel.com) — Hosting and serverless runtime. The Next.js API route that exchanges OAuth codes and the webhook handler that processes incoming WhatsApp messages run on Vercel's infrastructure.

Neither processor accesses Platform Data for their own purposes. Both act strictly on Doxxy's instructions under data processing agreements.

---

### processor-2a: Category of services for each processor

**For both Supabase and Vercel, select:**

- **IT solutions and services, including cloud storage and processing**

No other categories apply. Neither processor is used for advertising, analytics, legal, research, or goods for purchase.

---

### processor-2b: Countries where each processor handles Platform Data

**Supabase:**
- [FILL IN — Check your Supabase project region at https://supabase.com/dashboard/project/chftygsapwhahqbqlfdx/settings/general. Common regions for Indian projects: ap-southeast-1 (Singapore) or us-east-1 (United States). Select the country where that AWS region is located.]

**Vercel:**
- United States (serverless functions run in us-east-1 / IAD1 by default)
- Global (Edge Functions and Edge Config are distributed across Vercel's global edge network; the WhatsApp webhook handler and embedded-signup API route run as serverless functions in us-east-1)

---

### responsible-1: Entity responsible for Platform Data

**Answer:** Supersite Technologies Private Limited

---

### responsible-2: Country of responsible entity

**Answer:** India

---

### requests-3: National security requests in past 12 months

**Answer:** [FILL IN — Do you (Supersite Technologies) know of any national security requests for user data in the past 12 months? Almost certainly "No" for a healthcare SaaS startup.]

---

### requests-4: Policies for public authority data requests

**Answer:** [FILL IN — Select which policies apply. A small company typically has at minimum: review of legality, data minimization, and documentation. Select all that are true for your organization:

- Required review of the legality of these requests
- Provisions for challenging these requests if they are considered unlawful
- Data minimization policy
- Documentation of these requests, including responses and legal reasoning]

---

## Reviewer Instructions

### fblogin-web-1: Is Facebook Login integrated?

**Answer: Yes**

Facebook Login is used exclusively for WhatsApp Embedded Signup. When a clinic superadmin connects their WhatsApp Business Account, `FB.login()` is called to authenticate the admin and obtain an OAuth authorization code. Facebook Login is not used for patient or end-user authentication — only for clinic administrators during WhatsApp onboarding.

---

### instructions-web-2: How to access and test the app

1. Navigate to **https://doxxy.in** and sign in with the test credentials provided below.
2. After sign-in, you will land on the **Today** dashboard showing the clinic's appointments.
3. To test **WhatsApp Embedded Signup** (`business_management` + `whatsapp_business_management`):
   - Use the bottom navigation to go to **Clinic** tab
   - In the sub-navigation, click **WhatsApp** (visible only to superadmin role)
   - Click **Connect WhatsApp** — this triggers `FB.login()` (`public_profile`) and the Embedded Signup flow (`business_management`)
   - Complete the OAuth flow to connect a WhatsApp Business number
   - After connection, the settings page shows phone number, status, and quality rating (`whatsapp_business_management`)
4. To test **WhatsApp Messaging** (`whatsapp_business_messaging`):
   - Navigate to any patient appointment in the **Today** view
   - Open a consultation or billing modal
   - Tap the **WhatsApp** (green) button to send a PDF document to the patient
   - After marking an appointment complete, tap **Send Feedback Request** to send the post-consultation feedback template
5. To verify **opt-out handling**: Reply "STOP" from the recipient's WhatsApp — the webhook at `https://doxxy.in/api/webhooks/whatsapp` processes the opt-out and marks the patient as opted out, blocking future messages.

**Confirmation of Meta API usage:**
- `public_profile`: `FB.login()` in `components/settings/WhatsAppConnection.tsx` and Facebook SDK initialized in `app/layout.tsx`
- `whatsapp_business_messaging`: WhatsApp Cloud API `POST /{phone_number_id}/messages` in `supabase/functions/whatsapp-messaging/index.ts`
- `whatsapp_business_management`: `GET /me/assigned_whatsapp_business_accounts`, `GET /{waba_id}/phone_numbers`, `POST /{phone_number_id}/request_code`, `POST /{phone_number_id}/verify_code` in `app/api/whatsapp/embedded-signup/route.ts` and `app/api/whatsapp/verify-phone/route.ts`
- `business_management`: Embedded Signup configuration management via Facebook JS SDK

---

### accesscode-web-1: Test credentials

**Answer:** [FILL IN — Provide a test clinic superadmin account with WhatsApp already connected, OR a test account that can go through the Embedded Signup flow. Include:

- Login URL: https://doxxy.in
- Email: [test account email]
- Password: [test account password]
- Role: superadmin (has access to Clinic → WhatsApp settings)

If the test account does not have a WhatsApp number pre-connected, the reviewer will need to complete the Embedded Signup flow themselves. Ensure the test Facebook account has access to a WhatsApp Business Account with a phone number that can receive SMS verification codes.]

---

### accesscode-web-2: App store gift codes

**Answer:** Not applicable. Doxxy is a web application (https://doxxy.in), not distributed through app stores. No download or payment is required.

---

### geo-web-5: Geographic restrictions

**Answer:** Not applicable. Doxxy is accessible globally without geo-blocking or geo-fencing. The app serves healthcare clinics in India, but there are no technical restrictions preventing access from other locations.

---

### documents-web-1: Supporting documentation

[Upload screencasts here. Three separate recordings recommended:

1. **Embedded Signup flow** (for `business_management` + `whatsapp_business_management` + `public_profile`): Show superadmin navigating to Clinic → WhatsApp → Connect WhatsApp → Facebook Login → Embedded Signup popup → successful connection → phone number displayed in settings.

2. **Message sending** (for `whatsapp_business_messaging`): Show staff opening a consultation/billing modal → tapping WhatsApp button → PDF arriving on recipient's phone. Also show the feedback template being sent after appointment completion.

3. **Opt-out flow** (for policy compliance): Show recipient replying "STOP" → webhook processing → patient marked as opted out → subsequent send attempt blocked.]

---

## Access Verification — Tech Provider

Supersite Technologies Private Limited

### Which options best describe your business?

**Answer: SaaS Platform**

Doxxy is a SaaS clinic management platform. Healthcare clinics subscribe to Doxxy to manage appointments, consultations, billing, and patient communication. WhatsApp integration is a feature of the platform, not a standalone service — clinics use it through their Doxxy subscription.

---

### How will your business use Platform Data to enable a product or service on behalf of your clients?

**Answer:**

Doxxy receives WhatsApp access tokens and WABA phone number IDs from Meta when a clinic connects their WhatsApp Business Account through Doxxy's Embedded Signup flow. We store these credentials on the clinic's behalf and use them only to send WhatsApp messages that the clinic's own staff trigger — such as sending a patient their visit summary as a PDF or a post-consultation feedback message. The credentials are never shared, sold, or used for Doxxy's own purposes. Each clinic's credentials are isolated via database-level access controls so one clinic cannot access another's WhatsApp account. Clinics use this integration to communicate with their own patients from their own WhatsApp Business number, with their clinic name displayed as the sender.

---

### Does your business manage multiple business portfolios?

**Answer: No**

---

### Provide a link to your website.

**Answer:** https://doxxy.in
