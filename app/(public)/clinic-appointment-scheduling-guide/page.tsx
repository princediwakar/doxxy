// Path: app/(public)/clinic-appointment-scheduling-guide/page.tsx

import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Smartphone, BarChart3, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clinic Appointment Scheduling Guide — Best Practices for Indian OPDs | Doxxy',
  description: 'The complete guide to appointment scheduling for Indian clinics. Learn how to balance walk-ins with booked appointments, reduce no-shows by 35%, and structure your OPD slots for maximum efficiency.',
  alternates: { canonical: '/clinic-appointment-scheduling-guide' },
  openGraph: {
    title: 'Clinic Appointment Scheduling — Best Practices for Indian Clinics',
    description: 'How to structure your clinic schedule so walk-ins don\'t destroy it. The complete guide for Indian OPDs.',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Clinic Appointment Scheduling Guide' }],
  },
  keywords: ['clinic appointment scheduling best practices', 'doctor appointment scheduling system', 'OPD appointment management', 'clinic slot management India', 'reduce patient wait time clinic', 'walk-in appointment management', 'patient scheduling software India'],
};

// --- FAQ Structured Data ---
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'My clinic is mostly walk-ins. Do I even need an appointment system?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Even if 70% of your patients walk in, an appointment system helps you: (a) give your regular patients guaranteed slots so they feel valued and keep coming back, (b) reduce peak-hour overcrowding by spreading demand across the day — your 9 AM waiting room goes from 25 patients to 10, (c) build a database for follow-ups, chronic care reminders, and preventive health campaigns. Start with just 30% appointment slots and grow from there. Many clinics that started with "we are mostly walk-ins" now run 60%+ appointments because patients prefer the certainty of a fixed time.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens when the doctor is running late?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doxxy\'s live queue automatically adjusts ETAs. Patients waiting at home get a WhatsApp update: "Dr. Sharma is running 20 minutes behind. Your estimated time is now 11:20 AM." They can continue their day and arrive closer to their actual time instead of sitting in the waiting room. No angry phone calls to the receptionist. No patients feeling disrespected. The system recalculates every following patient\'s ETA in real time so everyone has accurate expectations.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do you handle emergencies that need immediate attention?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Flag a patient as "Emergency" in the Doxxy dashboard with one click. They jump to the top of the queue immediately. The system auto-adjusts all other estimated times and notifies affected patients of the delay with a brief, respectful message: "An emergency case requires the doctor\'s immediate attention. Your estimated time has been adjusted to 11:45 AM. We appreciate your understanding." No explanations needed from your receptionist. The system communicates professionally so your staff can focus on the patient in front of them.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can different doctors in the same clinic have different schedules?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Every doctor in Doxxy gets their own independent schedule, slot duration rules, buffer settings, and walk-in policy. Dr. Gupta (General Physician) might see 8 patients per hour with 7-minute slots and a 30% walk-in buffer. Dr. Reddy (Dermatologist) might see 4 patients per hour with 15-minute slots and no walk-ins without referral. The system handles this natively — no workarounds, no shared calendars that get confused. Each doctor\'s schedule is their own, managed under one clinic roof.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if a patient wants to cancel — do they need to call?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No phone call needed. The WhatsApp reminder sent 24 hours before the appointment includes a "Cancel" button. One tap, and the slot immediately opens in your appointment book. If you have a waitlist enabled, the system automatically offers the freed slot to the next waitlisted patient via WhatsApp. They can accept with one tap. The entire process — cancellation, waitlist notification, rebooking — happens without your receptionist touching a phone. Your chair stays filled, your revenue is protected, and your staff time is freed.',
      },
    },
  ],
};

// --- PAGE SECTIONS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      Your Waiting Room Shouldn&apos;t Be a War Zone.
    </h1>
    <SectionSubtitle>
      The complete guide to structuring clinic appointments so walk-ins don&apos;t destroy your schedule, patients don&apos;t wait 90 minutes, and you don&apos;t lose &#8377;2,500 per empty slot.
    </SectionSubtitle>
    <div className="mt-10">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Try Doxxy Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

const ProblemSection = () => (
  <Section>
    <SectionTitle>The Indian OPD Scheduling Crisis.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Indian clinics don&apos;t operate like Western clinics. The walk-in + appointment hybrid creates chaos that no Western scheduling book has a chapter on.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 text-gray-600 dark:text-gray-300 space-y-5 text-base leading-relaxed">
      <p>
        Walk into any clinic in India between 9 AM and 11 AM and you will see the same scene: 25 patients crowded into a waiting room built for 12. Three generations of a family surrounding one elderly patient. A mother trying to keep a crying child quiet. The receptionist on the phone with one hand while searching a register with the other. The doctor, already exhausted by 10:30 AM, rushing through consultations because the queue outside keeps growing. This is not a staffing failure. It is a scheduling architecture failure — and it is fixable.
      </p>
      <p>
        Unlike Western clinics where 90% of patients arrive by appointment, Indian OPDs operate on a hybrid model where 40-60% of daily patients are walk-ins. This is not a problem to be eliminated — it is a reality to be engineered around. Walk-ins are the lifeblood of Indian clinics. They are your neighborhood reputation, your emergency goodwill, your "my neighbour said you are the best doctor" referrals. But without structure, they collide with your booked appointments and create the 9 AM rush that everyone dreads.
      </p>
      <p>
        Then there are the no-shows: invisible, silent, and expensive. A patient books a 10:30 AM slot, does not show up, and the slot sits empty while eight walk-ins are waiting two feet away from your reception desk. That empty slot cost your clinic &#8377;500-2,000 in lost consultation revenue alone — not counting the downstream revenue from follow-ups, pharmacy referrals, and diagnostic test recommendations that would have followed. Multiply that by 8-15 no-shows per day, and your clinic is losing &#8377;3-7 lakhs annually to patients who simply forgot.
      </p>
      <p>
        The manual appointment book or register cannot handle this complexity. Double bookings happen because "Sharma ji called at 3 PM" and "Sharma ji also walked in at 10 AM" were entered by two different people. Phone numbers are scribbled wrong — the reminder call goes to a disconnected number. A patient insists "I was promised the 4 PM slot, sir" but there is nothing in writing. Your receptionist, who should be managing patient flow and assisting you clinically, spends 3-4 hours daily on the phone: booking, rescheduling, reminding, apologising. That is a full-time salary spent on calendar management — not patient care.
      </p>
      <p>
        The worst part? Patients suffer silently. In the Indian healthcare context, the doctor is god — patients are reluctant to complain about waiting 90 minutes. They will sit on a hard bench, miss half a day of work, and say "koi baat nahi" (it is okay). But they will tell their family. And the next time they need a doctor, they will try the new clinic down the road that "has a WhatsApp booking system." The cost of poor scheduling is not just revenue — it is reputation, patient loyalty, and the quiet erosion of trust that takes years to rebuild.
      </p>
    </div>
  </Section>
);

const TheMathSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>The Numbers Your Appointment Book Won&apos;t Tell You.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Hard data from Indian OPDs. These are not estimates — they are averages from clinics doing 30-50 patients per day.
    </SectionSubtitle>
    <div className="grid md:grid-cols-3 gap-8 mt-16">
      {[
        { icon: Clock, stat: '40-60%', label: 'Daily Walk-in Rate', detail: 'The percentage of patients who arrive without an appointment at a typical Indian OPD. This is your reality — structure around it, don\'t fight it.' },
        { icon: AlertCircle, stat: '28-35%', label: 'No-Show Rate Without Reminders', detail: 'Nearly 1 in 3 booked patients does not show up if there is no reminder system. For a clinic with 40 patients/day, that is 8-14 empty but unresellable slots.' },
        { icon: CheckCircle, stat: '8-12%', label: 'No-Show Rate With WhatsApp Reminders', detail: 'Automated 24-hour reminders with Confirm/Reschedule buttons drop no-shows from 35% to single digits. That is 4-5 patients/day instead of 14.' },
        { icon: BarChart3, stat: '₹3-7 Lakhs', label: 'Annual Revenue Lost to No-Shows', detail: 'For a single-doctor clinic seeing 40 patients/day at an average consultation fee of ₹500. This is pure profit walking out the door, never to return.' },
        { icon: Clock, stat: '90 → 25 Min', label: 'Wait Time Reduction', detail: 'Proper slot management with buffer periods and structured walk-in windows reduces average patient wait time from 90 minutes to 25 minutes or less.' },
        { icon: Users, stat: '2-3 Hours/Day', label: 'Staff Time Saved', detail: 'Digital scheduling eliminates the 3-4 hours your receptionist spends daily on phone calls. That time is now available for patient care and clinic operations.' },
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

const BestPracticesSection = () => (
  <Section>
    <SectionTitle>Six Scheduling Practices That Actually Work in India.</SectionTitle>
    <SectionSubtitle className="mt-4">
      These are not textbook theories. They are field-tested patterns from Indian clinics that successfully balance walk-ins, appointments, and the chaos of a busy OPD.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 space-y-10">
      {[
        {
          number: '1',
          title: 'The Hybrid Slot Model',
          icon: Calendar,
          description: 'Reserve 60% of each hour for appointments, leave 40% for walk-ins. Never book back-to-back — always leave 5-minute buffers between appointments.',
          detail: 'Here is the math: If your consultation takes 7 minutes on average, you can see about 8 patients per hour. With the 60/40 split, book 5 appointments per hour (60%) and leave 3 slots open for walk-ins (40%). The 5-minute buffer between appointments absorbs overruns — a diabetes patient who needs 2 extra minutes to discuss their HbA1c results does not cascade into the next 10 patients being late. The walk-in slots are not empty chairs waiting for someone to appear — they are structured capacity that absorbs the unpredictable demand that defines Indian OPDs. When a walk-in arrives and there is a slot in the next 15 minutes, your receptionist can say "15 minutes, sir" instead of "please wait, we don\'t know how long." That one sentence changes the entire patient experience.',
        },
        {
          number: '2',
          title: 'The 24-Hour Confirm',
          icon: Smartphone,
          description: 'Send automated WhatsApp reminder 24 hours before. Include a "Confirm" and "Reschedule" button. Unconfirmed slots get released to walk-ins 2 hours before.',
          detail: 'This single practice cuts no-shows from 28-35% to 8-12%. The 24-hour window gives patients enough notice to plan their day but is close enough that they have not forgotten. The "Confirm" button is critical — it is not just a reminder, it is a commitment mechanism. When a patient taps "Confirm," psychology research shows they are 3x more likely to show up because they made an active choice. The "Reschedule" button is equally important: patients who cannot make it will often simply not show up rather than call your clinic (calling a doctor\'s office to cancel feels awkward and confrontational). A one-tap reschedule removes that friction entirely. And the auto-release at 2 hours before the appointment? That is the safety net. An unconfirmed 10:30 AM slot becomes available to walk-ins at 8:30 AM — giving you a full 2 hours to fill it. Your chair does not stay empty because someone forgot to tap a button.',
        },
        {
          number: '3',
          title: 'The Morning Buffer',
          icon: Clock,
          description: 'Never book appointments in the first 30 minutes. Reserve it for follow-ups from yesterday and early walk-ins. This absorbs the morning rush.',
          detail: 'This is counterintuitive but transformative. Most clinics book appointments starting at 9:00 AM sharp. By 9:10 AM, the first patient is late, three walk-ins have arrived, and the cascade has already begun. Instead, block 9:00-9:30 AM as a buffer zone. Use it for: (a) yesterday\'s patients who were asked to come back for a quick follow-up review — they appear without appointments and expect to be seen quickly, (b) the early-morning walk-ins who have been waiting since 8:45 AM, (c) any overnight emergency follow-ups. Book your first appointment at 9:30 AM. The 30-minute buffer absorbs the morning surge without disrupting anyone\'s scheduled time. Patients who book the 9:30 AM slot are actually seen at 9:30 AM — which builds trust in your appointment system. When patients trust that a booked time means something, they show up on time.',
        },
        {
          number: '4',
          title: 'Peak-Hour Load Balancing',
          icon: BarChart3,
          description: 'If you see 40 patients between 9-11 AM and 15 between 2-4 PM, guide patients toward off-peak slots with shorter wait time guarantees.',
          detail: 'Indian OPDs have a brutal peak from 9 AM to 11 AM and a lull from 2 PM to 4 PM. This is partially structural (patients prefer morning visits) and partially behavioural (patients believe the doctor is "fresher" in the morning). You can shift demand without forcing anyone. When a patient calls to book, your receptionist says: "Sir, the 10 AM slot has a 45-minute typical wait. The 3 PM slot typically has a 5-minute wait. Which would you prefer?" A surprising number of patients will choose the afternoon — especially working professionals who can step out of office, elderly patients who dislike crowded waiting rooms, and mothers with young children who dread long waits with a restless toddler. You are not restricting access; you are giving patients information that lets them self-select into off-peak times. Over 3-4 months, this naturally smooths your demand curve without any "policy" that patients might resent.',
        },
        {
          number: '5',
          title: 'The 15-Minute Late Rule',
          icon: AlertCircle,
          description: 'If a booked patient is 15 minutes late, their slot goes to the next waiting walk-in. Communicate this policy clearly at registration. It changes behaviour.',
          detail: 'This is the hardest practice to implement and the most effective. Indian patients are culturally accustomed to arriving late — traffic is unpredictable, autorickshaws take detours, and "IST" (Indian Stretchable Time) is a real phenomenon. But a 15-minute grace period is reasonable and defensible. The key is communication, not punishment. When a patient registers, tell them: "We hold your slot for 15 minutes past your appointment time. If you are running later than that, please call or WhatsApp us and we will accommodate you at the next available slot." Most patients respect this when they understand the reason: "Doctor Sahib has other patients waiting who arrived on time." The first time a chronically late patient loses their slot, they are never late again. And the patients who arrived on time? They notice. They tell their friends: "This clinic actually respects appointment times." That word-of-mouth is more valuable than any advertisement.',
        },
        {
          number: '6',
          title: 'Complaint-Based Slot Duration',
          icon: Clock,
          description: 'A diabetes follow-up is 5 minutes. A first-time headache consultation with full history is 20 minutes. Slot duration should match case complexity.',
          detail: 'The single biggest scheduling mistake Indian clinics make is treating all appointments as equal-duration slots — typically 10 minutes for everyone. A 10-minute slot works perfectly for a routine BP check or a diabetes follow-up where the patient just needs a prescription refill and a quick "how are you feeling." It is disastrous for a first-time migraine consultation where the patient needs to describe headache patterns, triggers, family history, and previous medications. That 10-minute slot overruns by 15 minutes, and the next five patients all wait longer. Instead, map complaint types to slot durations: routine follow-up (5-7 min), acute illness like fever/cold (10 min), chronic disease review (12-15 min), first consultation with full history (15-20 min). When a patient books, they select their complaint type, and the system automatically assigns the appropriate slot duration. No more guessing. No more cascading delays. Your 10 AM patient with a simple follow-up is actually seen at 10 AM.',
        },
      ].map(({ number, title, icon: Icon, description, detail }) => (
        <div key={number} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0">
              {number}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
              </div>
              <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">{description}</p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{detail}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const WorkflowSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>How Doxxy Makes This Happen — Automatically.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Four steps. No manual intervention. Your appointment book manages itself while you focus on patients.
    </SectionSubtitle>
    <div className="grid md:grid-cols-4 gap-6 mt-16">
      {[
        {
          step: '1',
          title: 'Patient Books',
          description: 'Patient books online via your clinic link, or your receptionist books via the Doxxy dashboard. The slot is assigned based on complaint type and mapped to the correct duration — routine follow-up gets 7 minutes, first consultation gets 20 minutes. No manual guessing.',
          icon: Calendar,
        },
        {
          step: '2',
          title: '24h WhatsApp Reminder',
          description: 'Exactly 24 hours before the appointment, Doxxy sends a WhatsApp message with doctor name, clinic address, Google Maps link, and interactive Confirm/Reschedule buttons. Patient confirms with one tap. Your appointment book updates in real time.',
          icon: Smartphone,
        },
        {
          step: '3',
          title: 'Auto-Release Unconfirmed',
          description: 'Two hours before the appointment time, any unconfirmed slot is automatically released to the walk-in queue. Your receptionist does not need to call anyone. The slot opens, and the first waiting walk-in gets it. Zero empty chairs.',
          icon: Users,
        },
        {
          step: '4',
          title: 'Live Queue Tracking',
          description: 'Patients see their position and estimated wait time on WhatsApp. They wait at home, not in your waiting room. When the doctor is running late, ETAs adjust automatically and patients are notified — no angry phone calls, no crowded waiting area.',
          icon: Clock,
        },
      ].map(({ step, title, description, icon: Icon }) => (
        <div key={step} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-900/50">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{step}</div>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                {title}
              </div>
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
  <Section>
    <SectionTitle>Your Clinic: Before and After Structured Scheduling.</SectionTitle>
    <SectionSubtitle className="mt-4">
      This is not a competitor comparison. This is what changes in your own clinic when you move from manual scheduling to an intelligent system.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            <th className="text-left p-4 font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Aspect</th>
            <th className="text-left p-4 font-semibold text-red-600 dark:text-red-400 text-sm uppercase tracking-wider">Before (Manual)</th>
            <th className="text-left p-4 font-semibold text-green-600 dark:text-green-400 text-sm uppercase tracking-wider">After (Doxxy)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {[
            { metric: 'Booking Method', before: 'Phone calls + register entries. Two people, two systems, constant errors.', after: 'Online self-booking + dashboard. One system. No double entries.' },
            { metric: 'No-Show Rate', before: '28-35% — nearly 1 in 3 patients does not arrive.', after: '8-12% — automated WhatsApp confirmations ensure commitment.' },
            { metric: 'Patient Wait Time', before: '60-90 minutes. Crowded room. Angry faces. Silent resentment.', after: '20-30 minutes. Patients wait at home, arrive closer to actual time.' },
            { metric: 'Walk-in Management', before: 'Chaos. First-come-first-served. "How long, sister?" every 5 minutes.', after: 'Structured buffer slots. Predictable wait times. Receptionist in control.' },
            { metric: 'Reminder System', before: 'Receptionist calls each patient. 2-3 hours/day. 40% unanswered calls.', after: 'Automated WhatsApp. Zero staff time. 98% read rate. One-tap confirm.' },
            { metric: 'Receptionist Time on Scheduling', before: '3-4 hours/day — a full salary spent on calendar management.', after: '30 minutes/day — managing exceptions only. Time freed for patient care.' },
            { metric: 'Double Bookings', before: 'Common — two entries for the same slot from different sources.', after: 'Impossible — the system prevents it. Real-time availability across all channels.' },
            { metric: 'Patient Satisfaction', before: 'Complaints about waiting. Quiet defections to other clinics. Word-of-mouth damage.', after: 'Patients recommend your clinic. "They actually respect your time" becomes your reputation.' },
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
    <SectionTitle>Questions Clinic Owners Ask.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Honest answers from clinics that have already made the switch to structured scheduling.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-6">
      {[
        {
          q: 'My clinic is mostly walk-ins. Do I even need an appointment system?',
          a: 'Even if 70% of your patients walk in, an appointment system helps you in three critical ways. First, give your regular patients guaranteed slots — the diabetic patient who comes every month, the pregnant woman on her antenatal schedule, the elderly gentleman who cannot sit in a crowded room for an hour. These are your most loyal patients and they deserve predictable access. Second, reduce peak-hour overcrowding by spreading demand. When patients know they can book a 3 PM slot with a 5-minute wait, some percentage will choose that over the 9 AM chaos. You are not forcing anyone — you are giving them options. Third, build a database for follow-ups and preventive care. Without appointments, you have no record of who should come back when. With appointments, you can run chronic-care recall programs, vaccination reminders, and health check-up campaigns. Start with just 30% appointment slots. Most clinics find that within 3-6 months, patients prefer booking and the ratio naturally shifts to 50-60% appointments. The walk-ins do not disappear — they just stop all arriving at 9 AM.',
        },
        {
          q: 'What happens when the doctor is running late?',
          a: 'Doxxy\'s live queue automatically recalculates every patient\'s estimated time when delays occur. If Dr. Sharma is running 20 minutes behind because an earlier consultation took longer than expected, the system adjusts all subsequent ETAs in real time. Patients who opted for WhatsApp updates receive a message: "Dr. Sharma is running approximately 20 minutes behind schedule. Your updated estimated time is 11:20 AM. We appreciate your patience." The key word is "estimated" — patients understand that healthcare is unpredictable. What they cannot tolerate is being left in the dark. The difference between "we don\'t know when the doctor will see you" and "your estimated time is now 11:20 AM" is the difference between a patient who leaves angry and a patient who adjusts their plan and arrives at 11:15. Your receptionist stops being a punching bag for frustrated patients and becomes a coordinator who manages expectations.',
        },
        {
          q: 'How do you handle emergencies that need immediate attention?',
          a: 'Flag a patient as "Emergency" in the Doxxy dashboard with one click. They are moved to the top of the queue instantly. The system automatically recalculates every other patient\'s ETA and sends WhatsApp notifications to those affected. The message is brief and respectful: "An emergency case requires the doctor\'s immediate attention. Your estimated time has been adjusted to 11:45 AM. We appreciate your understanding." No drama. No explanations required from your receptionist. No patient feels they were "skipped" without knowing why. The system handles the communication while your staff handles the patient. For clinics that see frequent emergencies (near highways, in industrial areas, or near schools), you can configure emergency buffer slots — 1-2 slots per hour that are held specifically for urgent cases and released to walk-ins if unused by the end of the hour.',
        },
        {
          q: 'Can different doctors in the same clinic have different schedules?',
          a: 'Yes, and this is one of Doxxy\'s most powerful capabilities for multi-doctor clinics. Each doctor gets their own independent schedule configuration. Dr. Gupta (General Physician, 20 years experience) might configure 7-minute average slots, 8 patients per hour, 60/40 appointment-to-walk-in split, and a 30-minute morning buffer. Dr. Reddy (Dermatologist, procedures take longer) might configure 15-minute average slots, 4 patients per hour, 80/20 appointment-to-walk-in split (dermatology patients rarely walk in without referral), and no morning buffer because her consultations are longer and the buffer is built into the longer slots. The system handles this natively — no shared calendars, no "please check with the other doctor\'s receptionist." Each doctor\'s schedule is managed independently under one clinic account. Patients booking online see the correct doctor availability in real time. Your receptionist sees one unified dashboard with all doctors\' queues side by side.',
        },
        {
          q: 'What if a patient wants to cancel — do they need to call?',
          a: 'No phone call needed. The WhatsApp reminder sent 24 hours before the appointment includes a "Cancel" button alongside "Confirm" and "Reschedule." One tap on "Cancel," and the slot immediately opens in your appointment book. If you have enabled the waitlist feature, the system automatically sends a WhatsApp message to the next patient on the waitlist: "A slot has opened with Dr. Sharma at 10:30 AM tomorrow. Tap to book." If they accept with one tap, the slot is filled within seconds — without your receptionist touching a phone or a register. This is what turns a cancellation from a revenue loss into a neutral event. The patient who cancelled is not getting guilt-tripped by your receptionist. The waitlisted patient is delighted they got a slot. Your clinic\'s revenue and schedule remain intact. For clinics that charge a booking or cancellation fee, Doxxy can handle the payment workflow automatically — refund or retain based on your cancellation policy.',
        },
      ].map(({ q, a }) => (
        <div key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{q}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{a}</p>
        </div>
      ))}
    </div>
  </Section>
);

// --- MAIN PAGE COMPONENT ---

const ClinicAppointmentSchedulingGuide = () => {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <ProblemSection />
      <TheMathSection />
      <BestPracticesSection />
      <WorkflowSection />
      <ComparisonSection />
      <FAQSection />
      <SignupCTA
        heading="Walk-In + Appointment Hybrid. Indian Clinics Need Both."
        description="Structure your slots so walk-ins don't destroy the schedule. See Doxxy's scheduling system handle both seamlessly — chat on WhatsApp."
      />

      <Script
        id="faq-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Clinic Appointment Scheduling Guide", url: `${APP_URL}/clinic-appointment-scheduling-guide` },
        ]}
      />
    </div>
  );
};

export default ClinicAppointmentSchedulingGuide;
