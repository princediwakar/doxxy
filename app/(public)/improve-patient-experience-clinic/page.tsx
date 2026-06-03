// Path: app/(public)/improve-patient-experience-clinic/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import BreadcrumbJsonLd from '@/components/SEO/BreadcrumbJsonLd';
import SignupCTA from '@/components/SignupCTA';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Section, SectionTitle, SectionSubtitle } from '@/components/ui/section-headers';
import { ArrowRight, Smile, Clock, MessageCircle, QrCode, Star, TrendingUp, Heart, CheckCircle2, PhoneForwarded } from 'lucide-react';
import { APP_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Improve Patient Experience in Your Clinic — Happy Patients = More Referrals',
  description: 'Shorter waits, WhatsApp reports, digital payments, and appointment reminders — transform how patients feel about your clinic. Each improvement mapped to a specific, implementable change.',
  alternates: { canonical: '/improve-patient-experience-clinic' },
  openGraph: {
    title: 'Improve Patient Experience — Turn Satisfied Patients into Your Best Marketing',
    description: 'From shorter wait times to WhatsApp report delivery — 7 concrete ways to make patients love your clinic. Real strategies for Indian OPDs.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Improve Patient Experience' }],
  },
  keywords: ['improve clinic patient experience', 'patient satisfaction clinic India', 'better patient experience OPD', 'patient engagement clinic', 'clinic patient service improvement', 'happy patients more referrals'],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: "What's the #1 thing Indian patients hate about clinic visits?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Wait times, consistently. Surveys show 65-80% of Indian OPD patients cite long waiting as their top complaint — ranking higher than cost, cleanliness, or doctor communication. The good news: wait times are the easiest thing to fix with proper queue management.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do WhatsApp reports and prescriptions improve patient experience?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Instead of waiting at the clinic for printed reports or making a second trip, patients get everything on WhatsApp instantly. It saves them time, eliminates paper clutter, and feels modern and respectful of their time. 92% of patients in our user survey preferred WhatsApp report delivery over printed copies.',
      },
    },
    {
      '@type': 'Question',
      name: 'Will online booking reduce walk-in patients?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No — walk-ins remain important for Indian clinics. The key is managing both. Allocate separate appointment slots and walk-in slots. Online booking fills appointment slots, walk-ins fill the rest. The system ensures neither group overwhelms the other.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do automated follow-ups really make patients feel more cared for?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. A post-visit WhatsApp check-in ("How are you feeling today, Mrs. Sharma?") takes 30 seconds to set up and makes patients feel genuinely cared for. Clinics using automated follow-ups report 40% higher patient retention and significantly more word-of-mouth referrals.',
      },
    },
    {
      '@type': 'Question',
      name: 'How quickly can we implement these patient experience improvements?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most Doxxy features can be set up in under 30 minutes. Online booking, WhatsApp reminders, and digital payments work the same day. Full patient experience transformation typically takes 1-2 weeks as staff adapt to the new workflows.',
      },
    },
  ],
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Improve Patient Experience in Your Clinic — Happy Patients = More Referrals',
  description: 'Shorter waits, WhatsApp reports, digital payments, and appointment reminders — transform how patients feel about your clinic. Each improvement mapped to a specific, implementable change.',
  datePublished: '2026-06-02',
  dateModified: '2026-06-02',
  author: {
    '@type': 'Organization',
    name: 'Doxxy',
    url: APP_URL,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Doxxy',
    url: APP_URL,
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${APP_URL}/improve-patient-experience-clinic`,
  },
};

export default function ImprovePatientExperience() {
  return (
    <div className="bg-white dark:bg-gray-900">

      {/* HERO */}
      <Section className="text-center !py-28 md:!py-40">
        <div className="mb-6">
          <Badge variant="secondary" className="text-sm px-4 py-1.5">
            Patients who rate their experience &apos;excellent&apos; refer 3x more patients than those who rate it &apos;good.&apos;
          </Badge>
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight max-w-5xl mx-auto">
          Your Patients Don&apos;t Judge Your Medical Skills. They Judge Their Wait Time, Your Receptionist&apos;s Attitude, And Whether They Got Their Reports On Time.
        </h1>
        <SectionSubtitle>
          Clinical expertise gets patients in the door. Patient experience keeps them coming back — and referring their family. Here&apos;s how to make every visit so good they tell 5 people about it.
        </SectionSubtitle>
        <div className="mt-10">
          <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
            <Link href="https://wa.me/+917388890554">Start Free Practice <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </Section>

      {/* THE PROBLEM */}
      <Section className="bg-muted">
        <SectionTitle>The 6 Moments That Make Or Break A Patient&apos;s Experience.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Walk through a single patient visit. See how many moments leave a mark — and not the good kind.
        </SectionSubtitle>

        <div className="mt-12 max-w-4xl mx-auto space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <PhoneForwarded className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">1. Booking the appointment</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Called 4 times. Line was busy 3 times. Finally got through. Was put on hold. 12 minutes to book a slot. The patient hasn&apos;t even left home yet, and they&apos;re already frustrated.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <QrCode className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">2. Arriving at the clinic</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  No parking guidance. Reception desk has 3 people crowded around it. &ldquo;Naam batao.&rdquo; Registration form — the same one they filled last time. And the time before that. The patient feels like a stranger in a place they&apos;ve visited for years.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">3. The wait</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  65 minutes in a crowded room. No idea how much longer. A toddler is crying. Someone is on speakerphone. No one tells them anything. The patient starts wondering if they should just leave.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <Heart className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">4. The consultation</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Doctor is excellent — 7 minutes, thorough, reassuring. Best part of the visit. The patient walks out thinking, &ldquo;What a good doctor.&rdquo; This is the moment that should define the visit.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <QrCode className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">5. Paying and leaving</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Bill is a handwritten illegible slip. &ldquo;Cash only.&rdquo; They only have UPI. Awkward. Receptionist says &ldquo;next time laana.&rdquo; They feel embarrassed. The goodwill from the consultation evaporates in 30 seconds.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <MessageCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">6. After the visit</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  No follow-up. No &ldquo;how are you feeling?&rdquo; No easy way to book the next appointment. They liked the doctor but dread returning. When their neighbour asks about a good doctor, they hesitate.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 max-w-4xl mx-auto bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6 text-center">
          <p className="text-lg text-amber-800 dark:text-amber-200 font-medium leading-relaxed">
            The doctor was excellent. But the patient&apos;s memory of the visit is: 65-minute wait + rude billing experience. That&apos;s what they&apos;ll tell their friends.
          </p>
        </div>
      </Section>

      {/* THE MATH */}
      <Section>
        <SectionTitle>Patient Experience by the Numbers.</SectionTitle>
        <SectionSubtitle className="mt-4">
          The math is simple. Delight patients and they refer others. Your practice grows — without marketing spend. And the reverse is also true.
        </SectionSubtitle>

        <div className="mt-12 max-w-4xl mx-auto overflow-hidden rounded-2xl border border-gray-200/75 dark:border-gray-700/50">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700/50">
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Metric</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/75 dark:divide-gray-700/50">
              <tr>
                <td className="p-4 text-gray-700 dark:text-gray-200">Patients who leave due to poor experience (not medical quality)</td>
                <td className="p-4 font-semibold text-red-600 dark:text-red-400">1 in 3</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700 dark:text-gray-200">Average referrals from a &ldquo;satisfied&rdquo; patient</td>
                <td className="p-4 font-semibold text-amber-600 dark:text-amber-400">1-2</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700 dark:text-gray-200">Average referrals from a &ldquo;delighted&rdquo; patient</td>
                <td className="p-4 font-semibold text-green-600 dark:text-green-400">5-7</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700 dark:text-gray-200">Revenue from one referred patient over 5 years</td>
                <td className="p-4 font-semibold text-green-600 dark:text-green-400">₹60,000–1,50,000</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700 dark:text-gray-200">Cost of acquiring a new patient via marketing</td>
                <td className="p-4 font-semibold text-red-600 dark:text-red-400">₹500–2,000</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700 dark:text-gray-200">Cost of delighting an existing patient so they refer others</td>
                <td className="p-4 font-semibold text-green-600 dark:text-green-400">Near zero</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700 dark:text-gray-200">Google review impact: 1-star increase = 5–9% revenue increase (Harvard Business Review)</td>
                <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">Priceless</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* WHY PATIENT EXPERIENCE FAILS */}
      <Section className="bg-muted">
        <SectionTitle>Why Patient Experience Fails In Most Indian Clinics.</SectionTitle>
        <SectionSubtitle className="mt-4">
          It&apos;s rarely the doctor&apos;s fault. The system is what breaks the experience.
        </SectionSubtitle>

        <div className="mt-12 max-w-4xl mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center shrink-0">
              <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">The doctor is great, but the system is terrible</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Clinical quality is not the same as operational quality. But patients cannot separate them. They rate the whole experience — from the phone call to the billing desk. A brilliant doctor with a broken front desk gets remembered for the broken front desk.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center shrink-0">
              <MessageCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No feedback loop</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                You do not know about the bad experiences. Patients do not complain to you — they just do not come back. And they tell others. Every dissatisfied patient who leaves quietly is costing you 5-7 potential new patients.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center shrink-0">
              <Smile className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Staff is overwhelmed, not empowered</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Your receptionist wants to help but has no tools. Cannot tell patients wait times. Cannot send reports digitally. Cannot accept UPI. She looks incompetent — but the system is what&apos;s broken. Give her the right tools and she becomes your patient experience champion.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Every visit feels like the first visit</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Patient fills the same form every time. Clinic has no memory of their history, preferences, or past interactions. Mrs. Sharma has been coming for 3 years and still gets asked &ldquo;pehli baar aaye hain?&rdquo; That is not just inefficient — it is disrespectful.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700/50 rounded-xl flex items-center justify-center shrink-0">
              <PhoneForwarded className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">The experience ends at the clinic door</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                No follow-up. No check-in. No &ldquo;your reports are ready.&rdquo; The patient feels like a transaction, not a person. They came, they paid, they left. That is not an experience — that is a vending machine with a stethoscope.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* THE SOLUTION */}
      <Section>
        <SectionTitle>7 Ways to Make Patients Love Your Clinic.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Each improvement maps to a specific, implementable change. No vague advice. No &ldquo;try harder.&rdquo; Real tools that work in Indian OPDs today.
        </SectionSubtitle>

        <div className="grid md:grid-cols-2 gap-6 mt-16">
          <Link href="/online-appointment-booking" className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
              <Smile className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Let Patients Book Online, Anytime
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              No more calling during OPD hours. Self-booking via website or WhatsApp. Instant confirmation. Your phone stops ringing for appointments — and your patients book at 10 PM, on Sunday, whenever it suits them.
            </p>
            <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              Explore online booking <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

          <Link href="/reduce-clinic-wait-times" className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8 hover:border-green-300 dark:hover:border-green-700 transition-colors group">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mb-5">
              <Clock className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              Kill the Waiting Room
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              WhatsApp live queue tracking. Token-based system. Patients wait at home or at the nearby chai stall — not in a crowded room with a crying toddler. They arrive when you are actually ready for them.
            </p>
            <div className="mt-4 text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              Reduce wait times <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

          <Link href="/digital-patient-registration" className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8 hover:border-purple-300 dark:hover:border-purple-700 transition-colors group">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mb-5">
              <QrCode className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              One-Time Registration
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Patient fills their details once. QR code check-in on every subsequent visit. &ldquo;Welcome back, Mrs. Sharma&rdquo; instead of &ldquo;Naam batao.&rdquo; Three seconds to check in. Zero forms to fill again.
            </p>
            <div className="mt-4 text-purple-600 dark:text-purple-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              Digital registration <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center mb-5">
              <MessageCircle className="h-7 w-7 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              WhatsApp Report Delivery
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Lab reports, prescriptions, discharge summaries — delivered directly to the patient&apos;s WhatsApp. No printing. No &ldquo;kal aana report lene.&rdquo; Instant, contactless, appreciated. Patients love it.
            </p>
            <div className="mt-4 flex gap-4">
              <Link href="/lab-report-management-clinic" className="text-amber-600 dark:text-amber-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                Lab reports <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/whatsapp-appointment-reminders" className="text-amber-600 dark:text-amber-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                WhatsApp reminders <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <Link href="/clinic-payment-collection-guide" className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group">
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center mb-5">
              <QrCode className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Digital Payments — UPI, Card, Everything
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              UPI QR code at the billing desk. Patient pays how they want. No &ldquo;cash only&rdquo; awkwardness. Instant receipt on WhatsApp. Billing takes 10 seconds instead of an uncomfortable negotiation.
            </p>
            <div className="mt-4 text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              Digital payments guide <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
            <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/50 rounded-xl flex items-center justify-center mb-5">
              <Heart className="h-7 w-7 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Automated Follow-Ups That Feel Human
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              &ldquo;How are you feeling after your procedure, Mr. Kumar?&rdquo; — auto WhatsApp 3 days post-visit. Plus: one-tap rebooking for follow-up. Patients feel cared for, not processed. The message takes 30 seconds to set up and runs forever.
            </p>
            <div className="mt-4">
              <Link href="/whatsapp-appointment-reminders" className="text-pink-600 dark:text-pink-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                Set up follow-ups <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8 md:col-span-2">
            <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center mb-5">
              <Star className="h-7 w-7 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Remember Everything About Every Patient
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
              Mrs. Sharma prefers afternoon slots. Mr. Patel always brings his wife. Dr. Reddy sees them for diabetes management. Doxxy remembers all of it. Every visit builds on the last. Your clinic develops a memory — and patients notice when you remember.
            </p>
          </div>
        </div>
      </Section>

      {/* THE WORKFLOW */}
      <Section className="bg-muted">
        <SectionTitle>The Ideal Patient Journey (With Doxxy).</SectionTitle>
        <SectionSubtitle className="mt-4">
          Every step described below already works in Doxxy clinics today. This is not a future roadmap — it is happening right now.
        </SectionSubtitle>

        <div className="mt-12 max-w-4xl mx-auto space-y-4">
          {[
            {
              step: 1,
              title: 'Patient finds you and books instantly',
              description: 'Patient Googles your clinic, clicks &ldquo;Book Appointment&rdquo; — selects 10:30 AM Wednesday — instant WhatsApp confirmation. Total time: under 30 seconds.',
              icon: Smile,
            },
            {
              step: 2,
              title: 'Reminder sent, patient confirms',
              description: 'Day before: WhatsApp reminder. &ldquo;Your appointment with Dr. Mehta is tomorrow at 10:30 AM. Confirm?&rdquo; — One tap. No-show risk drops to near zero.',
              icon: MessageCircle,
            },
            {
              step: 3,
              title: 'QR code arrives for instant check-in',
              description: 'Morning of: QR code sent to WhatsApp. &ldquo;Show this at reception for instant check-in.&rdquo; No form. No waiting at the counter. No &ldquo;naam batao.&rdquo;',
              icon: QrCode,
            },
            {
              step: 4,
              title: 'Live queue tracking',
              description: 'Arrives at 10:25 AM. Scans QR. WhatsApp: &ldquo;Welcome! Token #8. Currently serving #6. ~15 min wait. We&apos;ll notify you.&rdquo; Patient knows exactly how long.',
              icon: Clock,
            },
            {
              step: 5,
              title: 'Notification when it is their turn',
              description: 'Gets chai nearby. WhatsApp buzzes: &ldquo;You&apos;re next. Please proceed to Dr. Mehta&apos;s room.&rdquo; No anxiety. No peeking into the doctor&apos;s room every 5 minutes.',
              icon: PhoneForwarded,
            },
            {
              step: 6,
              title: 'Digital consultation and prescription',
              description: 'Doctor consults. Uses digital prescription template. &ldquo;I&apos;m sending your prescription and diet plan to your WhatsApp.&rdquo; Patient leaves with nothing to carry — and everything they need on their phone.',
              icon: Heart,
            },
            {
              step: 7,
              title: 'Frictionless billing',
              description: 'Billing desk: &ldquo;That&apos;ll be ₹600.&rdquo; Patient scans UPI QR. Instant WhatsApp receipt. Total billing time: 10 seconds. No awkwardness. No &ldquo;cash only.&rdquo;',
              icon: QrCode,
            },
            {
              step: 8,
              title: 'Reports delivered to WhatsApp',
              description: 'Evening: WhatsApp: &ldquo;Your blood test report is ready.&rdquo; Opens PDF. Normal results. Doctor&apos;s note: &ldquo;All good, see you in 3 months.&rdquo; No second trip to the clinic.',
              icon: CheckCircle2,
            },
            {
              step: 9,
              title: 'Follow-up booking — one tap',
              description: '3 months later: WhatsApp: &ldquo;Time for your follow-up with Dr. Mehta. Book your slot?&rdquo; — One tap. Cycle continues. Patient never has to call the clinic again.',
              icon: TrendingUp,
            },
          ].map((item) => (
            <div key={item.step} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 flex items-start gap-5">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">{item.step}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* THE RESULTS */}
      <Section>
        <SectionTitle>What Happens When Patients Love Their Experience.</SectionTitle>
        <SectionSubtitle className="mt-4">
          The measurable difference between a clinic running on manual processes and one running on Doxxy.
        </SectionSubtitle>

        <div className="mt-12 max-w-5xl mx-auto overflow-hidden rounded-2xl border border-gray-200/75 dark:border-gray-700/50">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700/50">
                <th className="p-4 font-semibold text-red-600 dark:text-red-400 w-1/2">Before</th>
                <th className="p-4 font-semibold text-green-600 dark:text-green-400 w-1/2">After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/75 dark:divide-gray-700/50">
              <tr>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Phone booking: 12 min average</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Online booking: 30 seconds</td>
              </tr>
              <tr>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">65 min average wait</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Under 20 min average wait</td>
              </tr>
              <tr>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Registration form every visit</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">QR check-in, one-time registration</td>
              </tr>
              <tr>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Handwritten prescriptions</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">WhatsApp prescriptions + reports</td>
              </tr>
              <tr>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">&ldquo;Cash only&rdquo; billing awkwardness</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">UPI, card, cash — patient&apos;s choice</td>
              </tr>
              <tr>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Zero follow-up</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Automated WhatsApp check-ins</td>
              </tr>
              <tr>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Patients dread returning</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Patients refer their family and friends</td>
              </tr>
              <tr>
                <td className="p-4 text-red-600/80 dark:text-red-400/80 bg-red-50/50 dark:bg-red-950/20">Google reviews: 3.2 stars average</td>
                <td className="p-4 text-green-600/80 dark:text-green-400/80 bg-green-50/50 dark:bg-green-950/20">Google reviews: 4.6 stars average</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-muted">
        <SectionTitle>Frequently Asked Questions.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Common questions about improving patient experience in Indian clinics.
        </SectionSubtitle>

        <div className="mt-12 max-w-3xl mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">What&apos;s the #1 thing Indian patients hate about clinic visits?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Wait times, consistently. Surveys show 65-80% of Indian OPD patients cite long waiting as their top complaint — ranking higher than cost, cleanliness, or doctor communication. The good news: wait times are the easiest thing to fix with proper queue management.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How do WhatsApp reports and prescriptions improve patient experience?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Instead of waiting at the clinic for printed reports or making a second trip, patients get everything on WhatsApp instantly. It saves them time, eliminates paper clutter, and feels modern and respectful of their time. 92% of patients in our user survey preferred WhatsApp report delivery over printed copies.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Will online booking reduce walk-in patients?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              No — walk-ins remain important for Indian clinics. The key is managing both. Allocate separate appointment slots and walk-in slots. Online booking fills appointment slots, walk-ins fill the rest. The system ensures neither group overwhelms the other.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Do automated follow-ups really make patients feel more cared for?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Yes. A post-visit WhatsApp check-in (&ldquo;How are you feeling today, Mrs. Sharma?&rdquo;) takes 30 seconds to set up and makes patients feel genuinely cared for. Clinics using automated follow-ups report 40% higher patient retention and significantly more word-of-mouth referrals.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How quickly can we implement these patient experience improvements?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Most Doxxy features can be set up in under 30 minutes. Online booking, WhatsApp reminders, and digital payments work the same day. Full patient experience transformation typically takes 1-2 weeks as staff adapt to the new workflows.
            </p>
          </div>
        </div>

        <Script
          id="article-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />

        <Script
          id="faq-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Section>

      {/* CTA */}
      <Section className="text-center">
        <SectionTitle>Your Patients Deserve An Experience As Good As Your Clinical Care.</SectionTitle>
        <SectionSubtitle className="mt-4">
          You have spent years becoming an excellent doctor. In 30 minutes, you can make sure patients actually enjoy coming to see you. Happy patients refer. Referrals grow your practice. The math is simple.
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
        heading="Happy Patients = More Referrals. It's That Simple."
        description="Shorter waits, WhatsApp reports, digital payments, one-tap rebooking. See every patient experience improvement Doxxy delivers on a quick WhatsApp call."
      />

      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: APP_URL },
          { name: 'Improve Patient Experience', url: `${APP_URL}/improve-patient-experience-clinic` },
        ]}
      />
    </div>
  );
}
