# Twilio AI Startup Searchlight — Application Answers

## 1. Mission + Emerging Tech + Twilio (150–250 words)

Doxxy's mission is to eliminate administrative burden from Indian outpatient clinics so doctors can focus entirely on patient care. Indian clinics lose an estimated 2–3 hours daily to manual documentation, billing chase, and appointment coordination. We use emerging technologies to automate these workflows end-to-end.

Our AI stack — Sarvam AI for multilingual speech-to-text, OpenAI for clinical note structuring, and Gemini for supplementary processing — converts a doctor's 30-second voice dictation in Hindi, English, or Tamil into a structured SOAP note saved directly to the patient record. Separately, computer vision extracts medicine names and quantities from photos of supplier bills to auto-update pharmacy inventory.

Twilio's communications platform is central to our automation loop. We plan to use Twilio's WhatsApp Business API to send appointment reminders, prescription PDFs, and Razorpay payment links to patients, and Twilio SendGrid for transactional emails like staff invitations and patient summaries. Our vision is a clinic where the doctor sees the patient and everything else — billing, follow-ups, inventory, and record-keeping — happens automatically through AI agents connected by Twilio's messaging infrastructure.

---

## 2. Recent Feature Showcasing Innovative Use of Tech (150–250 words)

Our AI Voice-to-SOAP-Note feature best exemplifies our approach. In Indian clinics, doctors spend roughly 40% of consultation time typing clinical notes — time that could go to patient care. Our solution: the doctor taps a microphone button after the consultation, speaks for ~30 seconds in Hindi, English, or Tamil describing the encounter, and our pipeline does the rest.

Sarvam AI handles speech-to-text optimized for Indian languages and medical terminology. That transcript then passes through an LLM (OpenAI) prompted to structure it into a standard SOAP format — Subjective (patient complaints), Objective (examination findings), Assessment (diagnosis), and Plan (treatment, prescriptions, follow-up). The structured note is saved to the patient's EMR instantly.

What makes this innovative is the end-to-end language flexibility. A doctor in Tier-2 Pune can dictate in Hindi mixed with English medical terms, and the system produces clean, structured clinical documentation. No other clinic management platform in India offers this across three languages with medical-grade accuracy. We're saving doctors roughly 90 minutes per day — time they're using to see more patients or go home earlier.

---

## 3. Combining Emerging Tech + Twilio for Customer Experience (150–250 words)

Our WhatsApp-first patient communication pipeline shows how we combine AI with messaging to radically improve the patient experience.

When a consultation ends, our system auto-generates an invoice and sends it via WhatsApp as a PDF along with a Razorpay payment link. The patient pays in one tap. Simultaneously, the AI-generated prescription is delivered to the patient's WhatsApp — no paper to lose, no pharmacy confusion over handwriting. For follow-up care, our system schedules automated reminders in the patient's preferred regional language based on the doctor's recommended revisit date.

On the clinic side, WhatsApp becomes the staff's command center. Appointment confirmations, cancellations, and waitlist backfills are coordinated through template messages. When a cancellation occurs, our system automatically messages the next waitlisted patient offering the slot — reducing no-shows by a claimed 80%.

We plan to deepen this integration through Twilio's platform, leveraging Twilio's WhatsApp Business API for reliable message delivery at scale and SendGrid for transactional email workflows like patient visit summaries and lab report notifications. The combination of AI-driven content generation with Twilio's reliable delivery infrastructure means patients get timely, personalized, and actionable communications — while clinic staff do zero manual outreach.

---

## 4. Specifically, How Using Twilio Platform (150–250 words)

We are in the process of integrating Twilio's platform across three layers of our communication stack:

**WhatsApp Business API via Twilio:** We currently interface with Meta's Cloud API directly for WhatsApp messaging — sending appointment reminders, prescription PDFs, payment links, and post-visit review requests. Migrating to Twilio's WhatsApp Business API would give us a single provider for multi-channel messaging, better delivery analytics, and simplified compliance with Meta's business messaging policies.

**SendGrid for Transactional Email:** Our current email provider (Resend) handles staff invitations and contact form notifications. We plan to adopt SendGrid for its superior deliverability analytics, template management, and ability to scale transactional email as we onboard more clinics. Use cases include: daily appointment summaries for doctors, patient visit recaps with attached prescriptions, lab report notifications, and monthly clinic performance digests.

**Twilio SMS as a Fallback Channel:** Many of our patients are elderly or in areas with intermittent internet. SMS via Twilio would serve as a reliable fallback for appointment reminders and payment links when WhatsApp delivery fails or the patient doesn't have WhatsApp installed.

**Future — Twilio Voice:** We see potential in using Twilio's voice API for automated appointment confirmation calls in regional languages, making our platform accessible to patients across the digital literacy spectrum.

---

## 5. What Makes Your Approach Unique (100–200 words)

Most clinic management platforms in India are either legacy desktop software with zero AI, or modern SaaS tools that bolt on a chatbot and call it "AI-powered." Our approach is different in two ways.

First, we treat AI as infrastructure, not a feature. Voice dictation, invoice extraction from supplier bills, and automated patient messaging are not add-ons — they're the core workflow. The platform is designed assuming AI handles documentation and communication, with humans only stepping in for exceptions.

Second, our communications strategy is WhatsApp-native by design, not email-first with WhatsApp as an afterthought. In India, WhatsApp is the primary digital channel for 500M+ users across all income levels and age groups. By pairing AI-generated content (prescriptions, bills, reminders) with WhatsApp delivery, we meet patients and clinic staff where they already live. Competing platforms still rely on email and SMS, which have single-digit open rates among our target users. Our combination of multilingual AI + WhatsApp-first delivery + per-appointment pricing creates a moat that neither legacy vendors nor horizontal SaaS players can easily replicate.

---

## 6. Why Applied + What Hoping to Gain (100–200 words)

We applied to Twilio AI Startup Searchlight because we're at an inflection point — our AI pipeline (voice-to-SOAP notes, inventory extraction) is working in production with early clinics, and now we need to scale our communication layer to match. Twilio's platform is the obvious choice for reliable, multi-channel patient messaging at scale.

We're hoping to gain three things:

First, **platform credits and access** to Twilio's WhatsApp Business API, SendGrid, and SMS APIs so we can migrate from our current fragmented communication stack to a unified Twilio backbone without worrying about per-message costs during our growth phase.

Second, **technical mentorship** — specifically around deliverability best practices, WhatsApp template approval processes, and scaling messaging for healthcare use cases where reliability is mission-critical.

Third, **go-to-market support** — introductions to other health-tech founders in the Twilio ecosystem, visibility through Twilio's channels, and credibility that comes with being a Twilio-backed startup when selling to clinics.

---

## 7. Feedback for Twilio on Supporting AI Startups (100–200 words)

Three specific suggestions:

**1. Healthcare-specific onboarding guides.** Healthcare messaging has unique compliance requirements (data privacy, consent management, template restrictions). A dedicated healthcare startup onboarding path with pre-approved message templates, HIPAA/DPDP compliance checklists, and example architectures would dramatically reduce time-to-launch.

**2. AI credit bundles for inference + messaging.** Our costs are split between LLM inference and message delivery. A bundled startup credit that covers both (e.g., $5K Twilio credits + $5K OpenAI/AI provider credits) would acknowledge that AI-native startups don't just send messages — we generate content with AI and deliver it through Twilio in a single pipeline.

**3. Regional language support advocacy.** In markets like India, the majority of end-users prefer non-English communication. If Twilio could improve WhatsApp template approval times for regional language templates and offer built-in translation APIs as part of the messaging flow, it would unlock entire categories of AI startups serving non-English-first populations. Even basic Hindi/Marathi/Tamil template support automation would be transformative.

---

## 8. LinkedIn Profile

*[To be filled in]*
