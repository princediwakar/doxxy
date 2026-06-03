// Path: app/(public)/clinic-patient-follow-up-system/page.tsx

import Script from 'next/script';
import { Button } from "@/components/ui/button";
import { MessageCircle, CalendarCheck, Bell, BarChart3, HeartHandshake, Repeat, ArrowRight, Activity, Stethoscope, TrendingUp, Clock, Users, ShieldCheck, FileText } from 'lucide-react';
import Link from 'next/link';
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Patient Follow-Up System for Clinics — Automated Recall & Rebooking | Doxxy',
  description: 'Build a systematic patient follow-up process that fills next month\'s calendar. Automated WhatsApp reminders, one-tap rebooking, and chronic disease recall — recover 15-20% of patients who would otherwise never return.',
  alternates: { canonical: '/clinic-patient-follow-up-system' },
  openGraph: {
    title: 'Patient Follow-Up System — Automated Recall & Rebooking for Indian Clinics',
    description: 'Turn one-time visitors into lifelong patients. Automated WhatsApp follow-ups that bring patients back.',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy Patient Follow-Up System' }],
  },
  keywords: ['patient follow-up system clinic', 'automated patient follow-up', 'clinic recall system', 'patient rebooking system India', 'chronic disease follow-up clinic', 'WhatsApp patient follow-up', 'patient retention clinic India'],
};

// --- PAGE COMPONENTS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      The Patient You Treated Today Shouldn&apos;t Be Gone Forever.
    </h1>
    <SectionSubtitle>
      Build a systematic follow-up engine that turns one-time visitors into lifelong patients. Automated WhatsApp reminders, one-tap rebooking, and recall campaigns that fill next month&apos;s calendar — automatically.
    </SectionSubtitle>
    <div className="mt-10">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Start Following Up Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

const ProblemSection = () => (
  <Section>
    <SectionTitle>Indian Clinics Are Exceptional at Treating. Terrible at Bringing Patients Back.</SectionTitle>
    <SectionSubtitle className="mt-4">
      You do not have a loyalty problem. You have a follow-up problem — and it is costing you lakhs every year, silently.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 text-gray-600 dark:text-gray-300 space-y-5 text-base leading-relaxed">
      <p>
        Walk through any Indian clinic on a Monday morning and you will see excellence. Patients with throat infections getting diagnosed in under 10 minutes. Hypertensive patients getting their BP checked and medication adjusted. A minor surgery completed with textbook precision. The doctor is brilliant. The treatment is spot-on. And then the patient walks out the door — and is never heard from again until the next crisis, 8 months later, when they might walk into a different clinic altogether.
      </p>
      <p>
        This is not a failure of clinical care. It is a failure of follow-up infrastructure. Chronic disease patients — diabetes, hypertension, thyroid, asthma — need regular follow-ups every 1-3 months. But without a system, most clinics rely entirely on the patient remembering to come back. And 30-50% of these patients drop off within 6 months. Not because they switched doctors. Not because they were unhappy. They simply forgot. And each forgotten follow-up is a consultation that never happened, a prescription that was never written, a relationship that slowly dissolved into silence.
      </p>
      <p>
        The missed revenue math is brutal and largely invisible. A diabetes patient who should visit 6 times a year but only comes twice represents 4 lost consultations. At a conservative ₹500 per consultation, that is ₹2,000 lost per patient per year. Now multiply that across 200 chronic disease patients in your database. That is ₹4 lakh in annual revenue that vanished — not because patients chose another clinic, but because nobody reminded them to come back.
      </p>
      <p>
        Post-procedure follow-ups are even more critical — and, in many cases, legally required. Did the patient who had a minor surgical procedure come back for suture removal? Did the patient started on new hypertension medication get their 2-week blood pressure check to verify the dosage is correct? Without a systematic tracking mechanism, these clinically essential follow-ups fall entirely through the cracks. The doctor assumes the patient will return. The patient assumes they are fine. Neither assumption is safe.
      </p>
      <p>
        And then there is the receptionist — the person who is supposed to somehow manage all of this manually. At 40 patients per day across 25 working days, that is 1,000 patients per month. Even if only 30% need follow-up, that is 300 phone calls. Each call takes 5-10 minutes between dialling, waiting, talking, and documenting. That is 25-50 hours of staff time per month — time that simply does not exist when your receptionist is already juggling walk-ins, phone inquiries, billing, and a dozen other responsibilities. Manual follow-up is not a strategy. It is a wish.
      </p>
    </div>
  </Section>
);

const TheMathSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>The Numbers That Should Keep You Awake.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Follow-up failure is not just bad patient care — it is the single largest invisible revenue leak in Indian OPD practice.
    </SectionSubtitle>
    <div className="grid md:grid-cols-3 gap-8 mt-16">
      {[
        { icon: TrendingUp, stat: '25-40%', label: 'Follow-Up Revenue Lost', detail: 'The percentage of potential follow-up revenue that vanishes because there is no systematic recall process in place.' },
        { icon: Activity, stat: '15-20%', label: 'Patients Recovered', detail: 'Automated follow-up systems recover 15-20% of patients who would otherwise never return — just by reminding them to come back.' },
        { icon: Repeat, stat: '₹3-5L', label: 'Annual Revenue Gap', detail: 'A clinic with 200 chronic disease patients loses ₹3-5 lakh per year to missed follow-up visits alone.' },
        { icon: Clock, stat: '25-50 Hrs', label: 'Staff Time Per Month', detail: 'Manual follow-up calls consume 25-50 hours of staff time monthly. Automated WhatsApp follow-ups: zero staff time, 3x higher response rate.' },
        { icon: BarChart3, stat: '2-4x', label: 'Patient Lifetime Value', detail: 'Patients who come back regularly through systematic follow-up generate 2-4x more revenue over their lifetime than one-time visitors.' },
        { icon: HeartHandshake, stat: '5x', label: 'Retention vs Acquisition Cost', detail: 'Retaining an existing patient through follow-up costs 5x less than acquiring a new one through marketing or referrals.' },
      ].map(({ icon: Icon, stat, label, detail }) => (
        <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 text-center">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-5">
            <Icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stat}</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{label}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{detail}</p>
        </div>
      ))}
    </div>
  </Section>
);

const TypesOfFollowUpSection = () => (
  <Section>
    <SectionTitle>The Five Types of Follow-Up Every Clinic Needs.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Follow-up is not one thing. It is a system of five distinct workflows — each with its own purpose, timing, and patient psychology. Understand these, and you can implement them even without software.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 space-y-10">
      {[
        {
          icon: MessageCircle,
          number: '1',
          title: 'Post-Consultation Follow-Up (24-72 Hours)',
          description: 'The simplest, highest-impact follow-up most clinics skip entirely. Twenty-four to 72 hours after a consultation, send the patient a single WhatsApp: "How are you feeling after starting the medication? Any side effects or concerns?"',
          why: 'This message accomplishes three things at once. First, it catches adverse drug reactions early — before they become emergencies. Second, it communicates that your clinic genuinely cares about what happens after the patient leaves. Third, and most subtly, it sets the expectation that follow-up is normal. Patients who receive a post-consultation check-in are 3x more likely to return for scheduled follow-ups because the relationship has been reinforced.',
          when: 'Acute conditions: fever, throat infection, injury, gastroenteritis. Any new medication that could have side effects. Any procedure where post-procedure complications are possible.',
        },
        {
          icon: CalendarCheck,
          number: '2',
          title: 'Chronic Disease Recall (1-3 Months)',
          description: 'Scheduled, condition-specific reminders sent at the interval the patient needs — not when they happen to remember. Diabetes: every 30 days for blood sugar review. Hypertension: every 60 days for BP check and medication adjustment. Thyroid: every 90 days for TSH test. Asthma: every 90 days for inhaler technique review and control assessment.',
          why: 'Chronic disease management is a rhythm, not an event. When a diabetic patient sees the doctor monthly, their HbA1c improves, complications decrease, and the doctor-patient relationship deepens. When they come sporadically, outcomes deteriorate and the patient becomes more likely to drift to another clinic. Systematic recall converts sporadic, crisis-driven visits into a predictable, health-maintaining cadence.',
          when: 'Every chronic condition. The system should auto-schedule based on diagnosis code. Type 2 diabetes = 30 days. Hypertension = 60 days. Hypothyroidism = 90 days. COPD/Asthma = 90 days. CKD = 30-90 days depending on stage. Each clinic can customise intervals per condition.',
        },
        {
          icon: FileText,
          number: '3',
          title: 'Lab Test Follow-Up',
          description: 'A patient does a blood test. The report arrives. And then — nothing. The patient never comes back to discuss the results. This is one of the most common and costly follow-up failures in Indian clinics, and it is almost entirely preventable.',
          why: 'When lab results arrive and no follow-up consultation is booked within 7 days, Doxxy detects the gap and sends: "Your test results are ready, [Patient Name]. Book a 5-minute review with Dr. [Name] to understand what they mean for your health." This single message recovers 20-30% of lost test-follow-up visits. These are not new patients — they are existing patients who already paid for a test and deserve to understand their results.',
          when: 'Any lab test that was ordered during a consultation. The 7-day window is critical — after 7 days, the patient has usually forgotten they ever had a test done.',
        },
        {
          icon: ShieldCheck,
          number: '4',
          title: 'Preventive & Wellness Recall (6-12 Months)',
          description: 'Annual health checkup reminders. Vaccination boosters — tetanus every 10 years, flu vaccine every year for seniors. Pap smear recall for gynecology patients. Mammogram reminders for women over 40. HbA1c screening for patients with family history of diabetes. These reminders say something powerful: your clinic cares about my health, not just my sickness.',
          why: 'Preventive recalls are the ultimate trust-builder. They are clinically valuable, they generate revenue, and they position your clinic as a health partner rather than a sickness vendor. A patient who receives a mammogram reminder from their gynecologist feels looked after in a way that no amount of bedside manner can replicate. And the economics work: preventive visits often uncover issues that lead to ongoing treatment relationships.',
          when: 'Annual cycles based on patient demographics and risk factors. Birth month is a natural trigger for annual checkup reminders. Condition-specific schedules for cancer screening based on age and gender.',
        },
        {
          icon: HeartHandshake,
          number: '5',
          title: 'Birthday & Relationship Messages',
          description: 'A WhatsApp on their birthday morning: "Happy Birthday from Dr. Sharma\'s Clinic, [Patient Name]! As a small gift from us, here is 10% off your next health checkup this month." Costs nothing to send. Builds enormous goodwill. Reminds the patient you exist — warmly, not transactionally.',
          why: 'Do not underestimate this. In a country where the doctor-patient relationship is deeply personal and trust-based, a birthday message is not spam — it is a relationship ritual. It says the clinic sees the patient as a person, not a file. Clinics that send birthday messages see a measurable uptick in return visits in the following 30 days. The optional discount (you can customise or remove it) gives the patient a reason to act now rather than later.',
          when: 'Birthdays, anniversaries of their first visit to your clinic, or festivals relevant to your patient base. Not daily. Not weekly. Just enough to say "we remember you" — and to keep your clinic top-of-mind when health needs arise.',
        },
      ].map(({ icon: Icon, number, title, description, why, when }) => (
        <div key={number} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
          <div className="flex items-start gap-5 mb-5">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Type {number}</span>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{title}</h3>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{description}</p>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-sm mb-2">Why This Matters</h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">{why}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5">
              <h4 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-2">When to Use</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{when}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const SolutionSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>How Doxxy Turns Follow-Up From Chaos Into System.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Not bulk messaging. Not marketing spam. A clinical workflow that respects the doctor-patient relationship — and makes it stronger.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 space-y-8">
      {[
        {
          title: 'Doctor Selects Follow-Up at the End of Consultation',
          description: 'As the doctor completes the consultation and writes the prescription, one tap selects the follow-up type and interval. Post-consultation check-in in 2 days. Diabetes recall in 30 days. Lab review after results arrive. Or the system auto-suggests the right follow-up based on the diagnosis code and treatment plan — the doctor just approves it. Two seconds. Done.',
          icon: Stethoscope,
        },
        {
          title: 'System Auto-Sends Personalised WhatsApp at Scheduled Time',
          description: 'When the scheduled time arrives, Doxxy sends a WhatsApp message that reads like a personal note from the clinic. It includes the patient\'s name, the doctor\'s name, the specific reason for the follow-up (not a generic "come back"), and a one-tap "Book Follow-Up" button. The message is sent at the optimal time — morning for elderly patients, evening for working professionals — based on clinic-configured preferences.',
          icon: Bell,
        },
        {
          title: 'Chronic Patients Are Auto-Enrolled in Recall Schedules',
          description: 'When a patient is diagnosed with diabetes, they are automatically enrolled in a 30-day recall cycle. Hypertension = 60 days. Thyroid = 90 days. The system tracks compliance: who came back, who missed, who needs escalation. No paper register. No mental checklist. No "I think we should call Mrs. Sharma, it has been a while." The system knows, and the system acts.',
          icon: Repeat,
        },
        {
          title: 'Dashboard Shows Follow-Up Health at a Glance',
          description: 'A dedicated follow-up dashboard shows: upcoming follow-ups this week, overdue follow-ups that need attention, follow-up conversion rate (how many reminders led to actual bookings), and estimated revenue recovered from the follow-up system. Your clinic manager can see, in 30 seconds, whether the follow-up engine is running or stalled.',
          icon: BarChart3,
        },
        {
          title: 'Auto-Escalation for Missed Follow-Ups',
          description: 'First reminder at the scheduled time. Second reminder 7 days later if no response. If still no response after 3 cycles, the system flags the patient for a manual phone call by staff — and only then does human time get involved. Nobody falls through the cracks. But nobody gets harassed either.',
          icon: TrendingUp,
        },
        {
          title: 'Two-Way Communication Without Sharing Personal Numbers',
          description: 'Patients can reply to follow-up messages on WhatsApp. Their response appears in the clinic\'s unified Doxxy inbox. Your receptionist can respond from the dashboard — no need to share their personal WhatsApp number. The entire conversation thread is stored with the patient\'s record for medico-legal compliance and continuity of care.',
          icon: Users,
        },
      ].map(({ title, description, icon: Icon }) => (
        <div key={title} className="flex gap-6 items-start">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const WorkflowSection = () => (
  <Section>
    <SectionTitle>Five Steps. Zero Manual Work. Complete Patient Retention.</SectionTitle>
    <SectionSubtitle className="mt-4">
      The follow-up workflow is more nuanced than a simple reminder — here is exactly how Doxxy keeps your patients coming back.
    </SectionSubtitle>
    <div className="grid md:grid-cols-5 gap-6 mt-16">
      {[
        { step: '1', title: 'Doctor Selects Follow-Up', description: 'At the end of the consultation, the doctor selects follow-up type (post-consultation check-in, chronic recall, lab review, or preventive) and interval. Two seconds. Done.' },
        { step: '2', title: 'System Auto-Schedules', description: 'Doxxy auto-schedules the follow-up message for the right date and time based on the selected interval and clinic preferences for optimal delivery.' },
        { step: '3', title: 'Patient Receives WhatsApp', description: 'At the scheduled time, the patient receives a personalised WhatsApp with their name, doctor name, reason for follow-up, and a one-tap rebooking link.' },
        { step: '4', title: 'Patient Taps to Rebook', description: 'Patient taps "Book Follow-Up." Their details are pre-filled — name, phone, doctor preference. They simply pick a date and time slot. Done in under 30 seconds.' },
        { step: '5', title: 'Cycle Continues', description: 'Appointment is confirmed. After this follow-up visit, the doctor selects the next follow-up type — and the cycle continues. Each visit triggers the next.' },
      ].map(({ step, title, description }) => (
        <div key={step} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-900/50">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{step}</div>
              {title}
            </h4>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const ComparisonSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Your Clinic Before and After Systematic Follow-Up.</SectionTitle>
    <SectionSubtitle className="mt-4">
      This is not a competitor comparison. This is the transformation that happens when your clinic moves from hope-based to system-based follow-up.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            <th className="text-left p-4 font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Metric</th>
            <th className="text-left p-4 font-semibold text-red-600 dark:text-red-400 text-sm uppercase tracking-wider">Without a System</th>
            <th className="text-left p-4 font-semibold text-green-600 dark:text-green-400 text-sm uppercase tracking-wider">With Doxxy Follow-Up System</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {[
            { metric: 'Follow-Up Method', before: 'Receptionist tries to remember. Sometimes calls. Mostly hopes.', after: 'Automated, systematic, zero human memory required.' },
            { metric: 'Chronic Patient Retention', before: '50-70% drop off within 6 months of first visit.', after: '80%+ stay on regular follow-up schedule.' },
            { metric: 'Staff Time on Follow-Ups', before: '25-50 hours/month making manual phone calls.', after: 'Less than 2 hours/month — monitoring dashboard and handling replies.' },
            { metric: 'Patient Response Rate', before: '~25% answer phone calls from unknown numbers.', after: '85%+ open and respond to WhatsApp messages.' },
            { metric: 'Post-Procedure Tracking', before: 'Doctor\'s mental checklist. Or a sticky note on the desk.', after: 'System-tracked, auto-escalated if missed. Nothing falls through.' },
            { metric: 'Revenue Visibility', before: 'Lost follow-ups are invisible. You do not know what you are missing.', after: 'Dashboard shows recovered revenue from automated follow-ups.' },
            { metric: 'Patient Experience', before: 'No communication between visits. Clinic goes dark.', after: 'Patient feels cared for. Receives relevant, timely health reminders.' },
            { metric: 'Clinic Growth Model', before: 'Dependent entirely on new patient acquisition.', after: 'Organic growth through patient retention. Retention is 5x cheaper than acquisition.' },
          ].map(({ metric, before, after }) => (
            <tr key={metric} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td className="p-4 font-medium text-gray-900 dark:text-white">{metric}</td>
              <td className="p-4 text-gray-600 dark:text-gray-300">{before}</td>
              <td className="p-4 text-gray-900 dark:text-white font-medium">{after}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Section>
);

const FAQSection = () => (
  <Section>
    <SectionTitle>Questions Clinic Owners Ask About Patient Follow-Up.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Honest answers about automated follow-up — what it does, what it does not do, and how it fits into your clinic.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-6">
      {[
        {
          q: 'How is this different from just sending bulk WhatsApp messages to all patients?',
          a: 'Bulk messaging is spam. It broadcasts the same generic message to everyone — "Get your health checkup today!" — and patients ignore it because it is not relevant to them. Doxxy\'s follow-up system is the opposite. Each message is personalised to the individual patient: their name, their specific doctor, the exact reason for the follow-up (e.g., "your 30-day blood sugar review is due"), and a rebooking link specific to that doctor. Patients respond because the message is relevant to their specific health situation, not a marketing blast. The open and response rates reflect this difference: bulk WhatsApp campaigns get 15-20% engagement. Personalised follow-up messages get 85%+ engagement. The difference is relevance.',
        },
        {
          q: 'What if a patient has already switched to another clinic?',
          a: 'If a patient replies "I have changed doctors" or does not respond after 3 follow-up cycles, the system automatically marks them as inactive and stops sending reminders. You maintain professional dignity, the patient is not harassed, and the relationship ends gracefully. You can also manually deactivate any patient from the follow-up system at any time with a single click. The system tracks deactivation reasons so you can analyse patterns — are patients leaving because of wait times? Cost? Location? The data helps you fix the root cause, not just manage the symptom.',
        },
        {
          q: 'Can we customise the follow-up messages for our clinic\'s tone and language?',
          a: 'Completely. You can write your own message templates from scratch or modify Doxxy\'s defaults. The templates support variables like {patient_name}, {doctor_name}, {date}, {condition}, and {clinic_name} that auto-fill per patient. You can have different templates for different follow-up types — your post-consultation check-in can be warm and casual while your chronic disease recall can be more clinical and specific. Language support covers English, Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, and Urdu. The system automatically uses the patient\'s preferred language, and the templates are crafted by native speakers — not machine translations. A Hindi reminder reads naturally to a Hindi speaker. A Tamil reminder uses culturally appropriate phrasing. This matters enormously for older patients and those in smaller cities who may be less comfortable with English.',
        },
        {
          q: 'Does this comply with WhatsApp\'s business messaging policies?',
          a: 'Yes, completely. Doxxy uses the official WhatsApp Business API — the same infrastructure used by banks, airlines, and healthcare providers worldwide. Our follow-up messages qualify as transactional healthcare communication, not promotional marketing, which is explicitly permitted under WhatsApp\'s business policy. Patients opt in by providing their phone number at registration and are informed that they will receive appointment and follow-up messages. They can opt out anytime by replying STOP, and the system immediately honours the opt-out. Every message includes opt-out instructions as required by WhatsApp policy. You are fully protected from a compliance standpoint.',
        },
        {
          q: 'How do we handle patients who need follow-up but do not use WhatsApp?',
          a: 'While WhatsApp penetration in India exceeds 500 million users and covers the vast majority of your patient base, Doxxy has a multi-channel fallback system for those who do not use it. If a patient does not have WhatsApp on their registered phone number, or if a WhatsApp message fails to deliver, the system automatically falls back to SMS. For elderly patients or those without smartphones at all, the follow-up dashboard includes a "Phone Call Required" list — a prioritised queue of patients who need human outreach. Your staff can work through this list during slow hours, and each call is logged in the patient\'s record for continuity. The system ensures nobody falls through the cracks. It simply uses the best available channel for each patient, and it tells you clearly when human intervention is the only option.',
        },
      ].map(({ q, a }) => (
        <div key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">{q}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{a}</p>
        </div>
      ))}
    </div>
  </Section>
);

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How is this different from just sending bulk WhatsApp messages to all patients?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bulk messaging is spam. It broadcasts the same generic message to everyone — \"Get your health checkup today!\" — and patients ignore it because it is not relevant to them. Doxxy's follow-up system is the opposite. Each message is personalised to the individual patient: their name, their specific doctor, the exact reason for the follow-up (e.g., \"your 30-day blood sugar review is due\"), and a rebooking link specific to that doctor. Patients respond because the message is relevant to their specific health situation, not a marketing blast. The open and response rates reflect this difference: bulk WhatsApp campaigns get 15-20% engagement. Personalised follow-up messages get 85%+ engagement. The difference is relevance.",
      },
    },
    {
      "@type": "Question",
      name: "What if a patient has already switched to another clinic?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If a patient replies \"I have changed doctors\" or does not respond after 3 follow-up cycles, the system automatically marks them as inactive and stops sending reminders. You maintain professional dignity, the patient is not harassed, and the relationship ends gracefully. You can also manually deactivate any patient from the follow-up system at any time with a single click. The system tracks deactivation reasons so you can analyse patterns — are patients leaving because of wait times? Cost? Location? The data helps you fix the root cause, not just manage the symptom.",
      },
    },
    {
      "@type": "Question",
      name: "Can we customise the follow-up messages for our clinic's tone and language?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Completely. You can write your own message templates from scratch or modify Doxxy's defaults. The templates support variables like {patient_name}, {doctor_name}, {date}, {condition}, and {clinic_name} that auto-fill per patient. You can have different templates for different follow-up types — your post-consultation check-in can be warm and casual while your chronic disease recall can be more clinical and specific. Language support covers English, Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, and Urdu. The system automatically uses the patient's preferred language, and the templates are crafted by native speakers — not machine translations. A Hindi reminder reads naturally to a Hindi speaker. A Tamil reminder uses culturally appropriate phrasing. This matters enormously for older patients and those in smaller cities who may be less comfortable with English.",
      },
    },
    {
      "@type": "Question",
      name: "Does this comply with WhatsApp's business messaging policies?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, completely. Doxxy uses the official WhatsApp Business API — the same infrastructure used by banks, airlines, and healthcare providers worldwide. Our follow-up messages qualify as transactional healthcare communication, not promotional marketing, which is explicitly permitted under WhatsApp's business policy. Patients opt in by providing their phone number at registration and are informed that they will receive appointment and follow-up messages. They can opt out anytime by replying STOP, and the system immediately honours the opt-out. Every message includes opt-out instructions as required by WhatsApp policy. You are fully protected from a compliance standpoint.",
      },
    },
    {
      "@type": "Question",
      name: "How do we handle patients who need follow-up but do not use WhatsApp?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "While WhatsApp penetration in India exceeds 500 million users and covers the vast majority of your patient base, Doxxy has a multi-channel fallback system for those who do not use it. If a patient does not have WhatsApp on their registered phone number, or if a WhatsApp message fails to deliver, the system automatically falls back to SMS. For elderly patients or those without smartphones at all, the follow-up dashboard includes a \"Phone Call Required\" list — a prioritised queue of patients who need human outreach. Your staff can work through this list during slow hours, and each call is logged in the patient's record for continuity. The system ensures nobody falls through the cracks. It simply uses the best available channel for each patient, and it tells you clearly when human intervention is the only option.",
      },
    },
  ],
};

// --- MAIN PAGE COMPONENT ---

export default function ClinicPatientFollowUpSystem() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <ProblemSection />
      <TheMathSection />
      <TypesOfFollowUpSection />
      <SolutionSection />
      <WorkflowSection />
      <ComparisonSection />
      <FAQSection />
      <SignupCTA
        heading="The 6-Month Checkup Reminder That Fills Next Month's Calendar"
        description="Automated WhatsApp follow-ups → one-tap rebooking. See the recall system that keeps patients coming back. Chat on WhatsApp."
      />

      <Script
        id="faq-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Clinic Patient Follow-Up System", url: `${APP_URL}/clinic-patient-follow-up-system` },
        ]}
      />
    </div>
  );
}
