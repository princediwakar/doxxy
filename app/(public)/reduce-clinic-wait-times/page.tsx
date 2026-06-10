// Path: app/(public)/reduce-clinic-wait-times/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import BreadcrumbJsonLd from '@/components/SEO/BreadcrumbJsonLd';
import SignupCTA from '@/components/SignupCTA';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Section, SectionTitle, SectionSubtitle } from '@/components/ui/section-headers';
import { ArrowRight, Clock, Users, MessageCircle, Timer, Gauge, ThumbsDown, CheckCircle2, QrCode } from 'lucide-react';
import { APP_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'How to Reduce Patient Wait Times in Your Clinic — From 90 Minutes to 25',
  description: 'Long wait times are your clinic\'s #1 source of bad reviews and patient loss. Token-based queue management + WhatsApp live tracking cuts wait times by 70%. Real strategies for Indian OPDs.',
  alternates: { canonical: '/reduce-clinic-wait-times' },
  openGraph: {
    title: 'Reduce Clinic Wait Times by 70% — Queue Management for Indian OPDs',
    description: 'Token-based queues, WhatsApp live tracking, and smart scheduling. Real strategies from Indian clinics.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Reduce Clinic Wait Times with Doxxy' }],
  },
  keywords: ['reduce patient wait time clinic', 'OPD queue management', 'reduce clinic waiting time', 'hospital queue management system', 'patient wait time solutions India', 'clinic token system'],
};

const reasons = [
  {
    icon: Users,
    title: 'Walk-ins destroy the schedule',
    description: 'Indian clinics operate on a hybrid model — some patients book ahead, most just walk in. When there\'s no separation between walk-in and appointment slots, a 10 AM appointment slot gets 3 walk-ins piled on top of it. The 10:30 AM patient waits. Then the 11 AM patient waits. By noon, the entire schedule has collapsed. The doctor is rushing, the queue has doubled, and every patient blames the clinic.',
  },
  {
    icon: MessageCircle,
    title: 'Manual token systems with zero visibility',
    description: 'Paper chits. A receptionist shouting numbers. Patients crowding the counter asking "mera number aa gaya?" every 5 minutes. The receptionist spends 40% of their day being a human token display instead of managing patient flow. Patients are afraid to step out for chai because they might miss their number. The anxiety makes 45 minutes feel like 2 hours.',
  },
  {
    icon: Clock,
    title: 'No pre-visit preparation',
    description: 'Every new patient fills a paper registration form — name, address, phone, medical history, chief complaint — while standing at the reception counter. This takes 8-12 minutes. Multiply by 20 new patients a day, and you\'ve lost 3 hours of OPD time to paperwork that should have been done before the patient walked in the door.',
  },
  {
    icon: Gauge,
    title: 'Uneven patient distribution',
    description: '8 AM to 9 AM: the waiting room is nearly empty. 10 AM to 12 PM: the corridor overflows. This isn\'t random — patients gravitate toward mid-morning slots because they don\'t know how busy each hour is. Without visibility into peak times and estimated waits, patients cluster into the same 2-hour window and create artificial congestion.',
  },
  {
    icon: Timer,
    title: 'Consultation + admin overlap',
    description: 'A typical consultation takes 5-7 minutes. But the doctor spends another 5 minutes after the patient leaves — writing the prescription by hand, dictating notes, filling the paper file. That\'s 10-12 minutes per patient consumed, but only half of it is clinical. For 30 patients a day, the admin overhead alone consumes 2.5 hours of doctor time that could have been spent seeing more patients.',
  },
];

const solutionCards = [
  {
    icon: QrCode,
    title: 'Digital Token + WhatsApp Live Queue',
    description: 'Patient gets a token at check-in. WhatsApp immediately shows: "Your token is #14. Currently serving: #11. Estimated wait: 25 minutes." Patients track their position from home, from the chai stall, or from their car. They arrive when their turn is near — not 2 hours early. The waiting room stays half-full even at peak hours. No one asks "kitna time lagega" because they already know.',
    link: '/clinic-queue-management',
    linkText: 'Digital queue system',
  },
  {
    icon: Users,
    title: 'Online Pre-Booking with Time Slots',
    description: 'Separate appointment slots from walk-in slots. Reserve 3 slots per hour for booked appointments and 3 for walk-ins. No overlap. A patient who booked 10:30 AM is seen at 10:30 AM — not pushed to 11:15 because 3 walk-ins jumped the queue. Your schedule stays intact. Walk-in patients see their estimated wait before they arrive so they can choose a less crowded time.',
    link: '/online-appointment-booking',
    linkText: 'Online appointment booking',
  },
  {
    icon: QrCode,
    title: 'QR Code Digital Registration',
    description: 'Patient scans a QR code at the clinic entrance, fills their details on their own phone in 3 minutes, and the data populates directly into your EMR. No paper forms. No data entry by receptionist. No illegible handwriting to decode. The 10 minutes per patient spent on registration paperwork drops to 1 minute of verification. For a clinic seeing 30 patients a day, that\'s 4.5 hours of staff time recovered.',
    link: '/electronic-medical-records',
    linkText: 'Digital patient registration',
  },
  {
    icon: Timer,
    title: 'Template-Based Treatment Plans',
    description: 'Doctor selects from pre-built templates — common diagnoses, standard drug combinations, dosage instructions. Customizes in seconds instead of writing from scratch. 5 minutes per consultation saved. For 30 patients a day, that\'s 2.5 hours of doctor time recovered. The treatment plan is printed or shared with the patient instantly. No pharmacy translation errors. No "I can\'t read the doctor\'s handwriting." The saved time goes straight into seeing more patients or finishing OPD on schedule.',
    link: '/digital-treatment-plans',
    linkText: 'Digital treatment plans',
  },
];

const beforeAfterRows = [
  {
    area: 'Token System',
    before: 'Paper chits handed out manually. Tokens get lost, duplicated, or skipped. Receptionist shouts numbers over a noisy waiting room. Patients crowd the counter to check if their number was called.',
    after: 'Digital tokens auto-assigned at check-in. Unique, trackable, never lost. WhatsApp shows live position and estimated wait. Receptionist focuses on patient check-in, not crowd control.',
  },
  {
    area: 'Average Wait Time',
    before: '90 minutes — from check-in to doctor consult. Patients arrive at 8:30 AM, are seen at 10 AM. The gap between arriving and being seen is the single biggest source of patient frustration.',
    after: '25 minutes — patients arrive 10 minutes before their estimated turn. They spend more time with the doctor than in the waiting room. The perception flips from "this clinic wastes my time" to "this clinic respects my time."',
  },
  {
    area: 'Patient Walk-Out Rate',
    before: '25% of patients leave without being seen. That\'s 1 in 4 patients who walked through your door, waited, and left. They don\'t just leave today — they leave for good. Most never return.',
    after: 'Under 5% leave. Patients know their wait time in advance. Those who cannot wait leave early — not after an hour of simmering frustration. The system records every dropout so you can send a follow-up: "We noticed you had to leave. Would you like to rebook?"',
  },
  {
    area: 'Waiting Room Atmosphere',
    before: 'Crowded, noisy, tense. 40 patients in a room built for 20. A child crying. A phone playing a YouTube video at full volume. Elderly patients standing because all chairs are taken. Patients hovering near the doctor\'s door trying to guess how many are inside.',
    after: 'Half-empty even at peak hours. Patients arrive close to their turn time. Those with longer waits relax at home or nearby. The few patients present are calm — they know exactly when they\'ll be called. The atmosphere shifts from railway platform to professional waiting lounge.',
  },
  {
    area: 'Google Reviews',
    before: '"Doctor is very good but waiting time is terrible — 2 hours for 5 minutes consultation. Not recommended if you value your time." This is the most common complaint in Indian clinic Google reviews. Each one costs you 30 potential patients.',
    after: '"Very organized clinic. WhatsApp told me my queue position so I came 15 minutes before. Minimal waiting. Doctor spent good time with me." Reviews shift from complaints about the system to praise for the organization. Your Google rating rises. More patients find you.',
  },
  {
    area: 'Staff Workload',
    before: 'Receptionist spends 3-4 hours daily on token management, answering "how much longer?" questions, managing the crowd, and handling complaints. During peak hours, they are simultaneously on the phone, at the counter, and being pulled in three directions.',
    after: 'Queue management is fully automated. Receptionist handles check-ins, billing, and patient care — the work they were hired to do. Patient questions about wait time drop to near zero. Staff morale improves because the day is predictable, not chaotic.',
  },
];

const faqs = [
  {
    question: 'What is the average wait time in Indian OPD clinics?',
    answer: 'Studies across Indian public and private OPDs show average wait times between 45 and 90 minutes. Tertiary care hospitals in metros like Mumbai, Delhi, and Chennai often exceed 90 minutes during peak hours. Even well-managed private clinics in Tier-2 cities like Lucknow, Indore, and Nagpur average 30-60 minutes. The gap between patient arrival and doctor consultation is consistently the #1 complaint in Indian healthcare satisfaction surveys. With digital queue management and smart scheduling, wait times can be reduced to 15-30 minutes — a 60-70% improvement.',
  },
  {
    question: 'How does WhatsApp queue tracking work?',
    answer: 'When a patient checks in at your clinic, the receptionist enters their phone number or the patient scans a QR code. Doxxy instantly generates a digital token and sends a WhatsApp message: "Your token is A-14. Currently serving: A-11. Estimated wait: 25 minutes." This message updates live — as the doctor sees patients and the queue advances, the patient\'s WhatsApp refreshes with their new position and updated ETA. When the patient is 3 tokens away, they get an alert: "Dr. Sharma is almost ready for you. Please return to the waiting area." The patient can wait at home, at the nearby chai tapri, or in their car — not in a crowded plastic chair for 2 hours. No app download required. Works on any phone that runs WhatsApp.',
  },
  {
    question: 'Can walk-in patients and appointments be managed together?',
    answer: 'Yes — and this is the most important design decision in clinic queue management. The key is separate slot allocation. Reserve a fixed number of hourly slots for pre-booked appointments and the remaining for walk-ins. For example: 3 appointments + 3 walk-ins per hour per doctor. Doxxy\'s scheduler maintains this separation automatically. When a walk-in arrives, the system assigns them to the next available walk-in slot — not the booked slot meant for the 10:30 AM patient. The result: booked patients are seen at their scheduled time, and walk-ins see their estimated wait before they even sit down. No one gets pushed because someone else jumped the queue.',
  },
  {
    question: 'How much can digital prescriptions reduce wait time?',
    answer: 'Template-based digital prescriptions save 3-5 minutes per consultation compared to handwriting prescriptions from scratch. For a doctor seeing 30 patients per day, that translates to 90-150 minutes (2-2.5 hours) of recovered time daily. Over a month of 25 working days, that\'s 50+ hours — the equivalent of nearly 7 additional OPD days. The time saved can be redirected to seeing more patients, spending more time with complex cases, or simply finishing OPD on time instead of running 2 hours late every day. Digital prescriptions also eliminate pharmacy translation errors, improve treatment adherence (printed/shared prescriptions are more legible), and create an automatic digital record for future reference.',
  },
  {
    question: 'Will my staff need technical training for a queue management system?',
    answer: 'No. Doxxy\'s queue management is designed for non-technical clinic staff. The interface mirrors the paper token system they already use — the receptionist enters a name and phone number instead of writing on a paper chit. Most receptionists learn the full workflow in under 30 minutes. There is no complex software, no command-line interface, no "IT knowledge" required. If your receptionist can use WhatsApp and enter a phone number, they can run Doxxy\'s queue system. For clinics that want additional support, we provide a 15-minute video walkthrough and live onboarding calls at no extra cost.',
  },
];

export default function ReduceClinicWaitTimes() {
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="bg-white dark:bg-gray-900">

      <Section className="!py-28 md:!py-40 bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="destructive" className="mb-6 px-4 py-1.5 text-sm rounded-full">
            45% of Indian patients have left a clinic without seeing the doctor due to long waits
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Your Waiting Room Is Costing You Patients. Right Now.
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            For every patient who walks out after waiting 90 minutes, you lose not just today&apos;s consultation — you lose every consultation they would have booked for the next 5 years. And when they post that 1-star review, you lose 30 more.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
              <Link href="https://wa.me/+917388890554">Start Free Practice <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold border-gray-500 text-gray-200 hover:bg-gray-800 hover:text-white">
              <Link href="/pricing">See Plans <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </Section>

      <Section className="bg-muted">
        <SectionTitle>The Waiting Room: Your Clinic&apos;s Worst Review Generator.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Every clinic owner knows the scene. But most underestimate how much it is actually costing.
        </SectionSubtitle>

        <div className="mt-12 max-w-4xl mx-auto space-y-6 text-gray-600 dark:text-gray-300">
          <p className="text-lg leading-relaxed">
            Tuesday morning. Dr. Sharma&apos;s clinic in Aundh, Pune. The board outside says OPD starts at 9 AM. By 8:30 AM, 14 patients are already waiting. The receptionist, Priya, is simultaneously answering the phone, handing out paper tokens, and telling the fifth patient in a row that she doesn&apos;t know exactly how long the wait will be. A patient who drove from Pimpri-Chinchwad is asking &ldquo;kitna time lagega?&rdquo; for the third time. Another patient is peering through the consultation room door, trying to count how many people are still inside.
          </p>
          <p className="text-lg leading-relaxed">
            By 9:30 AM, the waiting room has 22 patients. The doctor is seeing patients as fast as possible — 5 to 7 minutes per consultation — but walk-ins keep arriving and getting added to the queue. The 9:30 AM scheduled appointment hasn&apos;t been called yet because three 8:30 AM walk-ins are still waiting. The delay cascades. Every patient who walks in from 10 AM onward faces a longer wait than the patient before them.
          </p>
          <p className="text-lg leading-relaxed">
            By 11 AM, the scene has soured. An elderly patient with knee pain has been sitting in a plastic chair for over 2 hours. A mother with a restless child is visibly frustrated. Three patients have already left without being seen — one of them muttering &ldquo;roz ka yahi scene hai&rdquo; as she walks out. At 12:30 PM, a 1-star Google review appears: &ldquo;Doctor is good — but what is the point if you have to wait 2 hours for a 5-minute consultation? Never coming back.&rdquo;
          </p>

          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 rounded-xl p-6 mt-8">
            <div className="flex items-start gap-4">
              <ThumbsDown className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">The Hidden Cost of One Bad Review</p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  A Harvard Business Review study on healthcare reputation found that a single negative review costs a medical practice approximately 30 potential patients. For an Indian clinic with an average consultation fee of ₹500 and an average patient lifetime of 5 consultations over 5 years, one bad Google review costs approximately ₹75,000 in lost lifetime revenue. And wait time is the #1 topic of negative clinic reviews in India.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <SectionTitle>What Wait Times Actually Cost Your Clinic.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Not &ldquo;patient satisfaction&rdquo; in the abstract. Real rupees. Every single day.
        </SectionSubtitle>

        <div className="mt-12 max-w-5xl mx-auto overflow-hidden rounded-2xl border border-gray-200/75 dark:border-gray-700/50">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Metric</th>
                <th className="p-4 font-semibold text-center text-amber-600 dark:text-amber-400">15 min wait</th>
                <th className="p-4 font-semibold text-center text-orange-600 dark:text-orange-400">45 min wait</th>
                <th className="p-4 font-semibold text-center text-red-600 dark:text-red-400">90 min wait</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/75 dark:divide-gray-700/50">
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Patients who leave without consulting</td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-300">2%</td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-300">12%</td>
                <td className="p-4 text-center text-gray-900 dark:text-white font-semibold">25%</td>
              </tr>
              <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                <td className="p-4 font-medium text-gray-900 dark:text-white">Lost daily revenue (30 pts/day, ₹500/consult)</td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-300">₹300</td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-300">₹1,800</td>
                <td className="p-4 text-center text-gray-900 dark:text-white font-semibold">₹3,750</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Lost monthly revenue (25 working days)</td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-300">₹7,500</td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-300">₹45,000</td>
                <td className="p-4 text-center text-gray-900 dark:text-white font-semibold">₹93,750</td>
              </tr>
              <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                <td className="p-4 font-medium text-gray-900 dark:text-white">Negative Google reviews/month</td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-300">~0</td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-300">2–3</td>
                <td className="p-4 text-center text-gray-900 dark:text-white font-semibold">8–10</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Lost annual patient lifetime value</td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-300">₹45,000</td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-300">₹3.6L</td>
                <td className="p-4 text-center text-gray-900 dark:text-white font-semibold">₹11.25L</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 max-w-3xl mx-auto bg-gray-50 dark:bg-gray-800/80 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <strong className="text-gray-900 dark:text-white">How we calculate patient lifetime value:</strong> Average consultation fee ₹500 × 5 visits per year × 5 years = ₹12,500 per loyal patient. Losing 3 patients per day to wait times = 75 patients per month. 75 × ₹12,500 = ₹9.4L in immediate lost lifetime value. Add the reputational damage from 8-10 negative reviews per month (each review costing ~30 potential patients), and the total annual cost of a 90-minute wait time exceeds ₹20 lakhs — for a problem that can be solved with software that costs less than a receptionist&apos;s monthly salary.
          </p>
        </div>
      </Section>

      <Section className="bg-muted">
        <SectionTitle>Why Your Wait Times Are So High.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Five structural problems that keep your OPD stuck at 90-minute waits. None of them are the doctor&apos;s fault.
        </SectionSubtitle>

        <div className="mt-12 max-w-4xl mx-auto space-y-6">
          {reasons.map((reason) => (
            <div key={reason.title} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 flex gap-5">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                <reason.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{reason.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{reason.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionTitle>4 Changes That Cut Wait Times by 70%.</SectionTitle>
        <SectionSubtitle className="mt-4">
          None of these require hiring more doctors, expanding your clinic, or turning patients away. They require fixing the system.
        </SectionSubtitle>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {solutionCards.map((card) => (
            <div key={card.title} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 flex flex-col">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
                <card.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{card.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed flex-grow">{card.description}</p>
              <Link href={card.link} className="inline-flex items-center gap-1 mt-4 text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline">
                <span>Explore {card.linkText}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-muted">
        <SectionTitle>A Tuesday Morning, Before and After.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Same clinic. Same doctor. Same number of patients. Two completely different experiences.
        </SectionSubtitle>

        <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-5xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <ThumbsDown className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-bold text-red-700 dark:text-red-400">BEFORE — Manual System</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">8:30 AM — Patient arrives</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Walks in, joins the queue at the reception counter.</p>
                </div>
              </div>
              <div className="border-l-2 border-red-200 dark:border-red-800 pl-4 ml-2 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">8:40 AM — Paper form (10 min)</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fills a paper registration form while standing. Name, address, phone, chief complaint. No pen. Asks receptionist for one.</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">8:50 AM — Data entry (5 min)</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receptionist manually copies details into a register while answering phone calls. Token number assigned: #17.</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">8:55 AM – 10:25 AM — The wait (90 min)</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sits in a crowded room. Asks receptionist twice &ldquo;kitna time aur?&rdquo; Considers leaving. Two patients ahead in queue walk out. Token #14, #15, #16… finally #17.</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">10:25 AM — Consultation (5 min)</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Doctor rushes through. Apologizes for the wait. Writes prescription by hand (3 min).</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">10:33 AM — Patient leaves</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Frustrated. Total time: 113 minutes. Tells 5 friends about the wait. One posts a review.</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200/50 dark:border-green-800/30 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-bold text-green-700 dark:text-green-400">AFTER — Doxxy System</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Day before — Patient books online</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Opens clinic booking link on WhatsApp. Sees available slots. Books 10:30 AM. Gets instant confirmation.</p>
                </div>
              </div>
              <div className="border-l-2 border-green-200 dark:border-green-800 pl-4 ml-2 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">10:00 AM — WhatsApp reminder</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Automated message: &ldquo;Your appointment with Dr. Sharma is at 10:30 AM. Token #14. Estimated wait: 10 min.&rdquo;</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">10:25 AM — QR check-in (30 sec)</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Arrives at clinic. Scans QR code at entrance. Details auto-populated from booking. No forms. No queue at reception.</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">10:26 AM – 10:35 AM — Waiting (9 min)</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">WhatsApp shows: &ldquo;Currently serving #12. Your turn in ~10 min.&rdquo; Patient checks phone, relaxes. No anxiety. No asking the receptionist.</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">10:35 AM — Consultation (5 min)</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Doctor calls token #14. Template prescription auto-fills common medicines and dosages. Doctor customizes in 30 seconds.</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">10:41 AM — Patient leaves</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Satisfied. Total time at clinic: 16 minutes. Gets treatment plan and report on their phone. Books follow-up for next month.</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <SectionTitle>Before Doxxy vs. After Doxxy.</SectionTitle>
        <SectionSubtitle className="mt-4">
          The difference is not incremental. It is transformational. Every part of your clinic operations changes.
        </SectionSubtitle>

        <div className="max-w-5xl mx-auto mt-12 space-y-4">
          {beforeAfterRows.map((row) => (
            <div key={row.area} className="grid md:grid-cols-2 gap-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30 rounded-xl p-5">
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-2">Before Doxxy</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{row.area}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{row.before}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/30 rounded-xl p-5">
                <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-2">After Doxxy</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{row.area}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{row.after}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-muted">
        <SectionTitle>Questions Clinic Owners Ask About Wait Times.</SectionTitle>
        <div className="max-w-3xl mx-auto mt-12 space-y-6">
          {faqs.map((faq) => (
            <div key={faq.question} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {faq.question}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>

        <Script
          id="faq-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
      </Section>

      <Section>
        <SectionTitle>Complete Your Clinic&apos;s Digital Stack.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Reducing wait times is one part of the equation. These features complete the picture.
        </SectionSubtitle>

        <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
          <Link href="/clinic-queue-management" className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Clinic Queue Management <ArrowRight className="inline ml-1 h-4 w-4" /></h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Digital tokens, WhatsApp live tracking, and smart queue analytics. Cut wait times from 90 min to under 25.</p>
          </Link>
          <Link href="/online-appointment-booking" className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Online Appointment Booking <ArrowRight className="inline ml-1 h-4 w-4" /></h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Let patients book themselves in 30 seconds. Cut receptionist phone time by 3 hours daily.</p>
          </Link>
          <Link href="/improve-patient-experience-clinic" className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Improve Patient Experience <ArrowRight className="inline ml-1 h-4 w-4" /></h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">From the waiting room to the follow-up. How to make every touchpoint in your clinic feel organized and respectful.</p>
          </Link>
          <Link href="/whatsapp-appointment-reminders" className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">WhatsApp Appointment Reminders <ArrowRight className="inline ml-1 h-4 w-4" /></h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Automated confirmations and reminders that reduce no-shows by 40%. Works on every phone.</p>
          </Link>
        </div>
      </Section>

      <Section className="bg-muted text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Your Patients Deserve Better Than a Plastic Chair and a 90-Minute Wait.
        </h2>
        <SectionSubtitle>
          Join clinics across India that have cut wait times, reduced walkouts, and built a reputation for respecting their patients&apos; time. Start with your first 100 consultations free.
        </SectionSubtitle>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
            <Link href="https://wa.me/+917388890554">Start Free Practice <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600">
            <Link href="/pricing">View Pricing Plans <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </Section>

      <SignupCTA
        heading="90-Minute Waits → 25 Minutes. Your Waiting Room Will Thank You."
        description="Token-based queue + WhatsApp live tracking. Patients wait at home, not in your waiting room. See the queue system in action on WhatsApp."
      />

      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: APP_URL },
          { name: 'Reduce Clinic Wait Times', url: '/reduce-clinic-wait-times' },
        ]}
      />
    </div>
  );
}
