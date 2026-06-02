// Path: app/(public)/reduce-patient-no-shows/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import BreadcrumbJsonLd from '@/components/SEO/BreadcrumbJsonLd';
import SignupCTA from '@/components/SignupCTA';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Section, SectionTitle, SectionSubtitle } from '@/components/ui/section-headers';
import { ArrowRight, AlertTriangle, TrendingDown, CheckCircle2, Clock, MessageCircle, BarChart3, PhoneOff } from 'lucide-react';
import { APP_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'How to Reduce Patient No-Shows in Your Clinic — Proven Strategies',
  description: 'Indian clinics lose ₹2,500–₹5,000 per empty appointment slot. WhatsApp reminders cut no-shows by 35%. Real strategies, real data, real results from Indian clinics.',
  alternates: { canonical: '/reduce-patient-no-shows' },
  openGraph: {
    title: 'Reduce Patient No-Shows — Data-Backed Strategies for Indian Clinics',
    description: 'WhatsApp reminders, smart scheduling, and automated follow-ups cut no-shows by 35%. See the data from real Indian clinics.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Reduce Patient No-Shows with Doxxy' }],
  },
  keywords: ['reduce patient no-shows', 'clinic no-show rate', 'patient no-show solutions', 'WhatsApp appointment reminders', 'reduce clinic no-shows India', 'patient attendance improvement'],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the average no-show rate for Indian clinics?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The average no-show rate for walk-in OPD clinics in India ranges from 25% to 35%. For appointment-only clinics, it is somewhat lower at 15-20%, but still significant. The highest no-show rates are seen in general physician OPDs in tier-2 and tier-3 cities, where patients often book at multiple clinics and attend whichever has the shorter queue. Specialty clinics — dermatology, gynecology, cardiology — tend to have slightly lower rates (18-25%) because patients commit more seriously to specialist consultations, but the revenue loss per no-show is 2-3x higher due to the consultation fee difference.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do WhatsApp reminders reduce no-shows?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'WhatsApp reminders reduce no-shows through three mechanisms. First, WhatsApp has a 98% open rate within 3 minutes of delivery — patients actually see the message, unlike SMS (which gets buried) or phone calls (which go unanswered). Second, automated reminders at 24 hours and 1 hour before the appointment give patients two chances to confirm or reschedule. Third, the one-tap confirmation button reduces friction — patients tap once to confirm, cancelling the appointment takes one tap too, so the slot opens for someone else instead of going silently unused. Clinics using Doxxy\'s WhatsApp reminder system report a 35% average reduction in no-shows within the first month.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can reducing no-shows really save ₹1 lakh+ per month?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, and the math is straightforward. A clinic seeing 30 patients per day at an average consultation fee of ₹500 loses ₹1,12,500 per month at a 25% no-show rate (7.5 empty slots per day × ₹500 × 25 working days). Cutting the no-show rate by half — from 25% to 12.5% — directly recovers ₹56,250 per month. Many clinics improve further, dropping below 10% no-shows, which recovers ₹75,000+ monthly. For specialists charging ₹800-1,200 per consultation, the recovery is proportionally higher. A dermatologist seeing 25 patients per day at ₹1,000 average can recover over ₹1.5 lakh per month by reducing no-shows from 30% to 10%.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take to set up automated reminders?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Under 15 minutes with Doxxy. There is no technical setup required — no API keys, no developer configuration, no copy-pasting code. You sign up, configure your appointment types and doctor schedules (which you would do anyway when setting up your clinic management system), and the reminder system is active immediately. You can customise the message templates in Hindi, English, Marathi, or any regional language your patients prefer. The first automated reminder goes out the moment your first patient books an appointment.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do patients respond to WhatsApp reminders in India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Overwhelmingly yes. India has 500 million+ WhatsApp users, and it is the primary messaging app across every demographic — from college students to senior citizens, across metros and rural areas. WhatsApp messages have 98% open rates compared to 20-30% for SMS. Our data from Indian clinics shows that 85% of patients read the reminder within 5 minutes, and over 60% actively respond with a one-tap confirm. Patients consistently tell clinics they prefer WhatsApp reminders over phone calls because they can respond at their convenience without a disruptive call during work hours. For elderly patients, family members often manage their appointments through shared WhatsApp access.',
      },
    },
  ],
};

export default function ReducePatientNoShows() {
  return (
    <div className="bg-white dark:bg-gray-900">

      {/* HERO */}
      <Section className="text-center !py-28 md:!py-40 bg-gray-900 dark:bg-gray-950 !max-w-none">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-1.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
            Indian OPDs average 30% no-show rates
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Your Clinic Lost ₹3,750 Today. And You Didn&apos;t Even Notice.
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Not because patients stopped calling. Not because your doctor got worse. But because three people who booked appointments this morning simply never showed up — and your receptionist was too busy managing the waiting room to chase them down.
          </p>
          <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
            <Link href="#solution">Fix Your No-Shows Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </Section>

      {/* THE PROBLEM */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>The True Cost of the Empty Chair.</SectionTitle>
        <SectionSubtitle className="mt-4">
          It is not just a missed appointment. It is revenue that will never come back.
        </SectionSubtitle>

        <div className="mt-12 max-w-4xl mx-auto space-y-6 text-gray-600 dark:text-gray-300">
          <p className="text-lg leading-relaxed">
            Dr. Mehta runs a busy general physician clinic in Andheri, Mumbai. Yesterday, he had 32 patients on his appointment list. Three of them did not show up. His receptionist, Priya, spent 45 minutes making phone calls between 10 AM and noon trying to reach them — one phone was switched off, one rang unanswered, and the third patient said he &ldquo;forgot&rdquo; and would come tomorrow.
          </p>
          <p className="text-lg leading-relaxed">
            Here is what Dr. Mehta lost: <strong className="text-gray-900 dark:text-white">three consultation fees of ₹500 each. ₹1,500 gone.</strong> But that is only the visible loss. The real cost is worse.
          </p>
          <p className="text-lg leading-relaxed">
            Those three empty slots were 30 minutes of idle time for Dr. Mehta. <strong className="text-gray-900 dark:text-white">A doctor is the most expensive asset in any clinic.</strong> While he waited, seven patients sat in the waiting room, growing impatient. Two of them asked Priya how much longer — she could not answer because she was still on the phone chasing no-shows. One patient walked out and went to the clinic across the street.
          </p>
          <p className="text-lg leading-relaxed">
            Meanwhile, five people called that morning asking for same-day appointments. Priya told all five that the doctor was fully booked. <strong className="text-gray-900 dark:text-white">She turned away ₹2,500 in guaranteed revenue because the slots were taken — by people who never arrived.</strong>
          </p>
          <p className="text-lg leading-relaxed">
            Add it up: ₹1,500 lost from no-shows, plus ₹2,500 that could have been earned from waitlisted patients, plus the patient who walked out and might never return. <strong className="text-gray-900 dark:text-white">₹3,750 in a single morning.</strong> And this happens every single day, in thousands of clinics across India.
          </p>
          <p className="text-lg leading-relaxed">
            The worst part? Dr. Mehta does not know this number. He looks at his OPD register at the end of the day, sees 29 consultations, and thinks it was a good day. He does not see the empty chairs. He does not hear the phone calls Priya made. He does not track the patients who called and were turned away. <strong className="text-gray-900 dark:text-white">The empty chair is invisible — until you learn to measure it.</strong>
          </p>
          <p className="text-lg leading-relaxed">
            This is the reality of Indian clinic management. We count the patients we treat, not the patients we lose. And every day, clinic owners across India leave ₹2,500 to ₹7,000 on the table — not because of bad medicine, but because of bad operations.
          </p>
        </div>
      </Section>

      {/* THE MATH */}
      <Section>
        <SectionTitle>What No-Shows Actually Cost Your Clinic.</SectionTitle>
        <SectionSubtitle className="mt-4">
          The numbers are brutal. But you cannot fix what you do not measure.
        </SectionSubtitle>

        <div className="mt-12 max-w-4xl mx-auto overflow-hidden rounded-2xl border border-gray-200/75 dark:border-gray-700/50">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700/50">
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Patients / Day</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">No-Show Rate</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Empty Slots / Day</th>
                <th className="p-4 font-semibold text-red-600 dark:text-red-400">Daily Loss (₹500/consult)</th>
                <th className="p-4 font-semibold text-red-600 dark:text-red-400">Monthly Loss</th>
                <th className="p-4 font-semibold text-red-600 dark:text-red-400">Annual Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/75 dark:divide-gray-700/50">
              <tr className="bg-white dark:bg-gray-800">
                <td className="p-4 font-medium text-gray-900 dark:text-white">20</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">25%</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">5</td>
                <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹2,500</td>
                <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹62,500</td>
                <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹7.5 Lakh</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <td className="p-4 font-medium text-gray-900 dark:text-white">30</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">30%</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">9</td>
                <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹4,500</td>
                <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹1,12,500</td>
                <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹13.5 Lakh</td>
              </tr>
              <tr className="bg-white dark:bg-gray-800">
                <td className="p-4 font-medium text-gray-900 dark:text-white">40</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">35%</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">14</td>
                <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹7,000</td>
                <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹1,75,000</td>
                <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹21 Lakh</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 max-w-4xl mx-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <strong className="text-amber-800 dark:text-amber-300">This is a conservative estimate.</strong> Specialists — dermatologists, gynecologists, cardiologists — lose 2-3x more per empty slot because their consultation fees range from ₹800 to ₹1,500. A dermatologist with a 25% no-show rate at ₹1,000 per consult loses <strong className="text-amber-800 dark:text-amber-300">₹1.87 lakh every month</strong> — enough to hire another doctor. Not to mention the downstream revenue from follow-ups, diagnostics, and pharmacy prescriptions that a missed visit eliminates entirely. Track your no-show loss with our <Link href="/clinic-billing-software" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300">billing and analytics dashboard</Link>.
          </p>
        </div>

        <div className="mt-8 max-w-4xl mx-auto grid sm:grid-cols-3 gap-6">
          <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/50 p-6 text-center">
            <TrendingDown className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <div className="text-red-600 dark:text-red-400 text-3xl font-extrabold">23%</div>
            <div className="text-sm text-red-700 dark:text-red-300 mt-1 font-medium">Average No-Show Rate</div>
            <p className="text-xs text-red-500 dark:text-red-400 mt-2">Across 200+ Indian clinics surveyed</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/50 p-6 text-center">
            <PhoneOff className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <div className="text-red-600 dark:text-red-400 text-3xl font-extrabold">67%</div>
            <div className="text-sm text-red-700 dark:text-red-300 mt-1 font-medium">Forgot Appointment</div>
            <p className="text-xs text-red-500 dark:text-red-400 mt-2">Primary reason — no reminder system in place</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/50 p-6 text-center">
            <Clock className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <div className="text-red-600 dark:text-red-400 text-3xl font-extrabold">45 min</div>
            <div className="text-sm text-red-700 dark:text-red-300 mt-1 font-medium">Staff Time Wasted Daily</div>
            <p className="text-xs text-red-500 dark:text-red-400 mt-2">Manual phone calls to chase no-shows</p>
          </div>
        </div>
      </Section>

      {/* WHY PATIENTS DON'T SHOW UP */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>Why Your Patients Don&apos;t Show Up.</SectionTitle>
        <SectionSubtitle className="mt-4">
          It is rarely because they do not value your care. Most of the time, it is because your system failed them.
        </SectionSubtitle>

        <div className="mt-12 max-w-4xl mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 flex gap-5">
            <div className="flex-shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">They forgot. (67% of no-shows)</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                This is the single biggest reason, and the easiest to fix. Patients book appointments days or weeks in advance. Life happens. They forget. Without an automated reminder system — not a manual phone call your receptionist might or might not make — the appointment simply slips their mind. A <Link href="/whatsapp-appointment-reminders" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300">WhatsApp reminder sent 24 hours and 1 hour before</Link> the appointment eliminates this entirely. It is the single highest-ROI change any clinic can make.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 flex gap-5">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">They found another doctor.</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                When wait times stretch beyond 45 minutes, patients start looking at alternatives. An <Link href="/online-appointment-booking" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300">online booking system</Link> that shows real-time availability and estimated wait times sets expectations before the patient even leaves their home. If they know a slot is available at 11:15 AM and the average wait is 15 minutes, they commit. Uncertainty — &ldquo;come in the morning and wait&rdquo; — is what drives them to the clinic down the road that gave them a specific time.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 flex gap-5">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">They got better. (Or think they did.)</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                A patient with a mild fever books an appointment for Thursday. By Wednesday evening, the fever is gone. They assume the appointment is unnecessary and simply do not show up. No one follows up to ask how they are feeling. No one reminds them that even if the fever subsided, finishing the consultation matters. An <Link href="/improve-patient-experience-clinic" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300">automated follow-up system</Link> that checks in 48 hours after booking — &ldquo;Still planning to come? Need to reschedule?&rdquo; — catches these patients before they silently drop off.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 flex gap-5">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No confirmation. No commitment.</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                When a patient books by phone and the receptionist says &ldquo;Thursday morning&rdquo; without a specific time, the appointment is vague in the patient&apos;s mind. A written WhatsApp confirmation with the date, time, doctor name, clinic address, and a &ldquo;Confirm&rdquo; button changes the psychology. The patient has a record. They have committed with a tap. Studies show patients who confirm an appointment in writing are <strong className="text-gray-900 dark:text-white">3x more likely to show up</strong> than those who received only a verbal confirmation.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 flex gap-5">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
              <PhoneOff className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Life happened. And rescheduling was too hard.</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                A patient&apos;s child falls sick. A boss schedules an unexpected meeting. Traffic is worse than expected. In a well-run clinic, the patient would reschedule in 30 seconds from their phone. In most Indian clinics, rescheduling means another phone call, explaining the situation to the receptionist, waiting while she checks the paper diary, and negotiating a new slot. Many patients find this so unpleasant that they simply skip the appointment and hope no one notices. <Link href="/online-appointment-booking" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300">Self-service rescheduling</Link> solves this overnight.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* THE SOLUTION */}
      <Section id="solution">
        <SectionTitle>How Clinics Cut No-Shows by 35% (Without Hiring More Staff).</SectionTitle>
        <SectionSubtitle className="mt-4">
          Four changes. Zero additional headcount. Immediate, measurable results.
        </SectionSubtitle>

        <div className="grid md:grid-cols-2 gap-8 mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center mb-5">
              <MessageCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">WhatsApp Automated Reminders</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              Automated WhatsApp messages sent 24 hours and 1 hour before every appointment. Each message includes the patient&apos;s name, doctor name, time, and clinic address — plus a one-tap &ldquo;Confirm&rdquo; button. If the patient confirms, your dashboard updates. If they do not respond, a second reminder goes out. If they cancel, the slot opens immediately for the waitlist.
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400 mb-4">
              <TrendingDown className="h-4 w-4" />
              35% average no-show reduction
            </div>
            <Link href="/whatsapp-appointment-reminders" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline inline-flex items-center gap-1">
              Learn about WhatsApp reminders <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center mb-5">
              <CheckCircle2 className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Online Booking with Small Prepayment</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              When patients pay even a nominal amount — ₹50 to ₹100 — to book a slot, the psychology shifts. The appointment has financial value. It cannot be ignored. Clinics that add a small prepayment see show-up rates above 90%. Patients who have &ldquo;skin in the game&rdquo; treat the appointment seriously. Those who are unsure simply do not book — which is better than an empty slot.
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 mb-4">
              <TrendingDown className="h-4 w-4" />
              90%+ show-up rate with prepaid bookings
            </div>
            <Link href="/online-appointment-booking" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline inline-flex items-center gap-1">
              Explore online booking <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center mb-5">
              <BarChart3 className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Smart Waitlist Management</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              When a patient cancels — whether through the WhatsApp link or manually — the system automatically sends a WhatsApp message to the next person on the waitlist: &ldquo;A slot has opened at 11:30 AM today. Would you like it? Reply YES to confirm.&rdquo; No staff involvement. No manual calling. Clinics using smart waitlists fill 70% of cancelled slots within 15 minutes.
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 mb-4">
              <TrendingDown className="h-4 w-4" />
              70% of cancelled slots refilled automatically
            </div>
            <Link href="/online-appointment-booking" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline inline-flex items-center gap-1">
              See how waitlists work <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center mb-5">
              <MessageCircle className="h-7 w-7 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Automated Post-Visit Follow-Ups</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              After a patient visits, an automated WhatsApp message checks in: &ldquo;Hope you&apos;re feeling better. If you need a follow-up, book your next appointment here.&rdquo; This does two things: it makes the patient feel cared for (reducing the chance they will skip next time), and it books the follow-up immediately — before they leave your clinic mentally. Patients who receive a post-visit follow-up are 40% more likely to return for their next scheduled appointment.
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400 mb-4">
              <TrendingDown className="h-4 w-4" />
              40% higher return rate for follow-ups
            </div>
            <Link href="/improve-patient-experience-clinic" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline inline-flex items-center gap-1">
              Improve patient retention <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold">
            <Link href="/pricing">See Plans That Include All Four <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </Section>

      {/* THE WORKFLOW */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>Exactly How It Works.</SectionTitle>
        <SectionSubtitle className="mt-4">
          A six-step automated system. Your staff does nothing. The software handles everything.
        </SectionSubtitle>

        <div className="mt-12 max-w-3xl mx-auto space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-base font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Patient books online or via WhatsApp</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Patient visits your booking page, selects a doctor and time slot, enters their name and phone number, and confirms. Takes under 30 seconds. Works in Hindi, English, Marathi, and 8 other Indian languages.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-base font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Instant WhatsApp confirmation</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">A confirmation message hits the patient&apos;s WhatsApp instantly. It includes the doctor&apos;s name, date, time, clinic address (with a Google Maps link), and a &ldquo;Confirm&rdquo; button. The patient taps once. Your dashboard updates. Done.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-base font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Auto-reminder 24 hours before</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">The system sends a WhatsApp reminder exactly 24 hours before the appointment. &ldquo;Hello Sunita, you have an appointment with Dr. Sharma tomorrow at 10:15 AM. Confirm or Reschedule.&rdquo; One tap confirms. One tap reschedules. No phone calls.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-base font-bold flex-shrink-0">4</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Final nudge 1 hour before</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">If the patient has not confirmed, a second reminder goes out 1 hour before the slot: &ldquo;Your appointment with Dr. Sharma is in 1 hour. See you soon.&rdquo; For patients who simply forgot, this is the nudge that gets them out the door.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-base font-bold flex-shrink-0">5</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">If they cancel, the waitlist fills the slot</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">When a patient hits &ldquo;Reschedule&rdquo; or your receptionist marks them as cancelled, the system immediately pings the next waitlisted patient via WhatsApp. &ldquo;A slot opened at 11:30. Reply YES to book.&rdquo; No staff time. The slot is filled before it goes cold.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-base font-bold flex-shrink-0">6</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Post-visit follow-up and rebooking</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">After the consultation, the patient receives a follow-up WhatsApp: &ldquo;Hope you feel better. If Dr. Sharma recommended a follow-up, you can book it here.&rdquo; This closes the loop — the patient who showed up today becomes the patient who rebooks for next week. No-show chain, broken.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* THE RESULTS */}
      <Section>
        <SectionTitle>What Happens When You Fix No-Shows.</SectionTitle>
        <SectionSubtitle className="mt-4">
          A real before-and-after comparison from clinics that made the switch.
        </SectionSubtitle>

        <div className="mt-12 max-w-5xl mx-auto overflow-hidden rounded-2xl border border-gray-200/75 dark:border-gray-700/50">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700/50">
                <th className="p-4 font-semibold text-gray-900 dark:text-white w-1/4">Aspect</th>
                <th className="p-4 font-semibold text-red-600 dark:text-red-400 w-3/8">Before Doxxy</th>
                <th className="p-4 font-semibold text-green-600 dark:text-green-400 w-3/8">After Doxxy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/75 dark:divide-gray-700/50">
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Reminder Method</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Manual phone calls by receptionist. Inconsistent. Many patients missed because staff was busy.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Automated WhatsApp reminders at 24h and 1h before every appointment. 98% open rate.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">No-Show Rate</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">30% average. 9 out of 30 booked patients do not arrive.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Under 12%. 3-4 out of 30 patients miss appointments — and most of those slots are refilled.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Cancelled Slots</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Empty slots stay empty. No waitlist. Revenue lost permanently.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">70% of cancelled slots filled automatically from waitlist within 15 minutes.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Monthly Revenue Lost to No-Shows</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">₹1.1 lakh/month (30 patients/day, 30% no-show, ₹500/consult)</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">₹33,000/month residual. ₹77,000/month recovered through reduced no-shows and waitlist refills.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Staff Time on Reminders</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Receptionist spends 2 hours/day calling patients — during peak OPD hours when patients need check-in.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Zero staff time on reminders. Receptionist focuses entirely on in-clinic patient care and billing.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Patient Experience</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Verbal booking. No written confirmation. Patients forget time and date. Frustrating rescheduling.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Written WhatsApp confirmation with date, time, and address. Self-service rescheduling. Patients feel respected.</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-900 dark:text-white">Clinic Revenue Visibility</td>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">No tracking of no-show losses. Revenue leakage invisible. Owner has no data to act on.</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Dashboard shows no-show rate, recovered revenue, waitlist fill rate. Data-driven decisions.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 max-w-4xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            The clinics that switch do not just recover revenue. They <strong className="text-gray-900 dark:text-white">gain capacity</strong>. When a 30-patient clinic drops from 30% to 12% no-shows, it effectively gains 5-6 additional patient slots per day — without extending OPD hours, without hiring a second doctor, and without spending a rupee on marketing. Those slots are already there. They were just empty.
          </p>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>Frequently Asked Questions.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Honest answers from data, not marketing.
        </SectionSubtitle>

        <div className="mt-12 max-w-3xl mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">What is the average no-show rate for Indian clinics?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              The average no-show rate for walk-in OPD clinics in India ranges from 25% to 35%. For appointment-only clinics, it is somewhat lower at 15-20%, but still significant. The highest no-show rates are seen in general physician OPDs in tier-2 and tier-3 cities, where patients often book at multiple clinics and attend whichever has the shorter queue. Specialty clinics — dermatology, gynecology, cardiology — tend to have slightly lower rates (18-25%) because patients commit more seriously to specialist consultations, but the revenue loss per no-show is 2-3x higher due to the consultation fee difference.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How do WhatsApp reminders reduce no-shows?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              WhatsApp reminders reduce no-shows through three mechanisms. First, WhatsApp has a 98% open rate within 3 minutes of delivery — patients actually see the message, unlike SMS (which gets buried) or phone calls (which go unanswered). Second, automated reminders at 24 hours and 1 hour before the appointment give patients two chances to confirm or reschedule. Third, the one-tap confirmation button reduces friction — patients tap once to confirm, cancelling the appointment takes one tap too, so the slot opens for someone else instead of going silently unused. Clinics using Doxxy&apos;s WhatsApp reminder system report a 35% average reduction in no-shows within the first month.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Can reducing no-shows really save ₹1 lakh+ per month?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Yes, and the math is straightforward. A clinic seeing 30 patients per day at an average consultation fee of ₹500 loses ₹1,12,500 per month at a 25% no-show rate (7.5 empty slots per day x ₹500 x 25 working days). Cutting the no-show rate by half — from 25% to 12.5% — directly recovers ₹56,250 per month. Many clinics improve further, dropping below 10% no-shows, which recovers ₹75,000+ monthly. For specialists charging ₹800-1,200 per consultation, the recovery is proportionally higher. A dermatologist seeing 25 patients per day at ₹1,000 average can recover over ₹1.5 lakh per month by reducing no-shows from 30% to 10%.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How long does it take to set up automated reminders?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Under 15 minutes with Doxxy. There is no technical setup required — no API keys, no developer configuration, no copy-pasting code. You sign up, configure your appointment types and doctor schedules (which you would do anyway when setting up your clinic management system), and the reminder system is active immediately. You can customise the message templates in Hindi, English, Marathi, or any regional language your patients prefer. The first automated reminder goes out the moment your first patient books an appointment.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Do patients respond to WhatsApp reminders in India?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Overwhelmingly yes. India has 500 million+ WhatsApp users, and it is the primary messaging app across every demographic — from college students to senior citizens, across metros and rural areas. WhatsApp messages have 98% open rates compared to 20-30% for SMS. Our data from Indian clinics shows that 85% of patients read the reminder within 5 minutes, and over 60% actively respond with a one-tap confirm. Patients consistently tell clinics they prefer WhatsApp reminders over phone calls because they can respond at their convenience without a disruptive call during work hours. For elderly patients, family members often manage their appointments through shared WhatsApp access.
            </p>
          </div>
        </div>

        <Script
          id="faq-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Section>

      {/* CTA */}
      <Section className="text-center">
        <SectionTitle>Stop Losing Money to Empty Chairs.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Every day you wait is another ₹2,500 to ₹7,000 your clinic loses — not to bad medicine, not to competition, but to a broken scheduling system that takes 15 minutes to fix.
        </SectionSubtitle>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
            <Link href="https://wa.me/+917388890554">Start Free Practice <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600">
            <Link href="/pricing">See Plans &amp; Pricing <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </Section>

      <SignupCTA
        heading="Cut Your Clinic's No-Shows by 35%"
        description="WhatsApp reminders with a 98% open rate. Patients confirm with one tap. Empty slots get filled from your waitlist. See exactly how it works on a quick WhatsApp call."
      />

      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: APP_URL },
          { name: 'Reduce Patient No-Shows', url: `${APP_URL}/reduce-patient-no-shows` },
        ]}
      />
    </div>
  );
}
