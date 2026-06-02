// Path: app/(public)/clinic-software-vs-paper/page.tsx

import Link from 'next/link';
import {
  ArrowRight, CheckCircle, XCircle, FileText, Clock, Search, Shield,
  TrendingDown, Printer, HardDrive, Smartphone, Users, Banknote,
  AlertTriangle, Calculator, BarChart3, Flame, Cloud, MousePointer,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Clinic Software vs Paper Records — What Paper Is Actually Costing You Per Year | Doxxy',
  description: 'Paper-based clinic management costs ₹3.6-5.4 lakhs every year in lost time, billing errors, and missed patients. See the real math behind paper vs digital clinic software in India — and how to switch in 4 weeks.',
  alternates: { canonical: '/clinic-software-vs-paper' },
  openGraph: {
    title: 'Clinic Software vs Paper Records — The Real Annual Cost of Paper',
    description: 'Paper is the most expensive employee in your clinic — costing ₹3.6-5.4 lakhs/year in lost time, missed billing, and buried records. See the math.',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Clinic Software vs Paper Records — Doxxy' }],
  },
  keywords: [
    'clinic software vs paper records',
    'digital vs manual clinic management',
    'paperless clinic India',
    'cost of paper records clinic',
    'clinic software ROI India',
    'switch from paper to digital clinic',
    'clinic digitization India',
  ],
};

// --- FAQ Structured Data ---
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is it difficult to switch from paper to software mid-practice?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Not if done in phases. Most Doxxy clinics run paper and digital in parallel for the first two weeks — existing patients continue on paper while all new patients are registered digitally. By week three, your staff is faster on Doxxy than on paper for new patients, and you begin bulk-importing your top repeat patients. By week four, paper becomes your backup, not your primary system. Our team helps configure your templates, specialties, and billing settings during onboarding so the software matches how your clinic actually operates from day one. The transition feels large before you start, but within 3-4 weeks most clinic owners report they cannot imagine going back.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens to my existing paper records?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your existing paper records do not need to be digitised all at once. Most clinics keep their paper archives as a historical reference and go fully digital for all new patients and visits. Over time, as repeat patients return, their paper history gets progressively captured in Doxxy through new digital consultations — each visit adds to their digital timeline. For the top 50-100 repeat patients you see most frequently, our team can assist with a focused bulk-import during onboarding. The paper archives remain in your cabinets as a fallback, but within 3-6 months you will find yourself reaching for them less and less. There is no mandate to digitise decades of records before you can start using Doxxy.',
      },
    },
    {
      '@type': 'Question',
      name: 'Will my senior staff who are not tech-savvy be able to use it?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Doxxy is designed for clinic staff, not software engineers. The interface uses large buttons, simple forms, and workflows that mirror what your staff already does on paper — search for a patient name, enter vitals, record a consultation. We have clinics where the receptionist is 55+ and had never used a computer beyond WhatsApp Web before Doxxy, and within one week they were checking in patients faster than with the paper register. The key is that Doxxy reduces steps, it does not add them: searching a name is easier than finding a file in an almirah, and typing a prescription is faster than handwriting one. We also provide screen-share training in Hindi, English, Marathi, and 5 other Indian languages during onboarding. If a staff member can use WhatsApp, they can use Doxxy.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if the internet goes down — can I still see patients?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doxxy is cloud-based and requires an internet connection to access records and generate bills. However, the platform is designed for Indian connectivity conditions and works reliably on 4G mobile data. Most clinics keep a mobile hotspot as a backup — a ₹300/month Jio or Airtel data pack provides more than enough bandwidth for Doxxy. In the rare event of a complete outage, we recommend keeping a simple paper register for walk-in patient details (name, phone, vitals) and entering them into Doxxy when connectivity returns — typically within minutes. This is the same fallback you would use if your electricity went out and you could not access your almirah in a dark clinic. For clinics in areas with genuinely unreliable connectivity, we help assess options during onboarding, including offline-capable alternatives.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I try Doxxy before committing to switch completely?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Doxxy offers a free Practice Essentials plan that lets you use the core EMR, prescription writing, and patient management features at no cost for as long as you need. You can register real patients, write digital prescriptions, and experience the speed difference firsthand — before paying anything. Most clinics start with the free plan, use it for new patients alongside their existing paper system for 2-3 weeks, and upgrade to a paid plan only when they are ready to go fully digital. There is no time limit on the free plan, and no credit card is required to sign up. This lets you evaluate Doxxy at your own pace, with your own patients, in your own clinic — not in a demo environment.',
      },
    },
  ],
};

// --- SECTION COMPONENTS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      Paper Is the Most Expensive Employee in Your Clinic.
    </h1>
    <SectionSubtitle>
      You do not pay it a salary, but it is costing you 3.6-5.4 lakhs every year in lost time, missed billing, and buried records. Here is the math.
    </SectionSubtitle>
    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Calculate What Paper Is Costing You <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
      <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold">
        <Link href="https://wa.me/917388890554?text=Hi%21%20I%27d%20like%20to%20know%20more%20about%20switching%20from%20paper%20to%20Doxxy">Chat on WhatsApp</Link>
      </Button>
    </div>
  </Section>
);

const ProblemSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>The Quiet Cost of Paper. No Error Message. No Crash. Just Slow — Every Single Day.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Paper does not fail loudly. It fails in a thousand tiny, expensive ways that nobody adds up. Let us add them up.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 text-gray-600 dark:text-gray-300 space-y-5 text-lg leading-relaxed">
      <p>
        There is no dramatic moment when paper breaks. No error popup. No server crash. Just the receptionist walking to the almirah for the fourth time this hour, flipping through 200 folders to find Mrs. Sharma's file while three patients wait and the queue stretches into the corridor. Four minutes. Multiply that by 25 patients a day. Multiply that by 300 working days. That is 500 hours a year — over 20 full days — spent just <strong className="text-gray-900 dark:text-white">finding things</strong>.
      </p>
      <p>
        And that is only one cost. The prescription pad that ran out mid-OPD, so you wrote on a blank sheet that the patient lost before reaching the pharmacy. The billing slip that went missing, so you never charged for that follow-up consultation. The patient who never came back because nobody remembered to remind them. The 45 minutes after closing spent cross-checking the day's cash against a hand-written register, knowing there is always a mismatch and you will never find it.
      </p>
      <p>
        Paper does not fail catastrophically. It fails through friction — a thousand small delays, errors, and omissions that compound every single day. And because this is just &ldquo;how clinics have always been run,&rdquo; nobody adds up the bill. Nobody asks: what is this actually costing me? Not in emotional terms. In rupees. In real, measurable, annual financial loss.
      </p>
      <p>
        Here is the uncomfortable truth: for a 25-patient-a-day clinic in Nagpur, Lucknow, or Coimbatore, paper is silently draining <strong className="text-gray-900 dark:text-white">3.6 to 5.4 lakhs from your practice every year</strong>. Not in one-time costs. Not in dramatic losses. In the steady, invisible erosion of time, accuracy, and revenue that you have normalised because you have never had a comparison point.
      </p>
      <p>
        Until now.
      </p>
    </div>
  </Section>
);

const CostBreakdownSection = () => (
  <Section>
    <SectionTitle>The Annual Cost of Paper — Calculated.</SectionTitle>
    <SectionSubtitle className="mt-4">
      For a typical single-doctor clinic seeing 25 patients per day. Every number is conservative.
    </SectionSubtitle>

    <div className="max-w-4xl mx-auto mt-16">
      {/* Time Costs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <Clock className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Time Costs Per Day</h3>
        </div>
        <ul className="space-y-4">
          {[
            { label: 'Finding patient files', calc: '2 min/file × 25 patients', total: '50 min/day' },
            { label: 'Writing prescriptions by hand', calc: '3 min × 25 patients', total: '75 min/day' },
            { label: 'Manual billing and cash reconciliation', calc: '30 min/day', total: '30 min/day' },
            { label: 'Filing records at end of day', calc: '20 min/day', total: '20 min/day' },
          ].map(({ label, calc, total }) => (
            <li key={label} className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-gray-900 dark:text-white font-medium">{label}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">— {calc}</span>
              </div>
              <span className="text-red-600 dark:text-red-400 font-bold whitespace-nowrap">{total}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900 dark:text-white">Total Staff Time Lost</span>
            <div className="text-right">
              <span className="text-3xl font-bold text-red-600 dark:text-red-400">175 min/day</span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Approximately 3 hours per day of staff time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hard Costs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <Banknote className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Hard Costs Per Month</h3>
        </div>
        <ul className="space-y-4">
          {[
            { label: 'Paper, registers, prescription pads, printer ink', cost: '1,500 - 2,500/month' },
            { label: 'Storage — almirahs, file cabinets, physical space (equivalent rent)', cost: '800 - 1,200/month' },
            { label: 'Staff time — 3 hrs/day  × 150/hr × 25 days', cost: '11,250/month' },
          ].map(({ label, cost }) => (
            <li key={label} className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-gray-900 dark:text-white font-medium">{label}</span>
              </div>
              <span className="text-red-600 dark:text-red-400 font-bold whitespace-nowrap">{cost}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900 dark:text-white">Total Hard Costs</span>
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">13,550 - 15,250/month</span>
          </div>
        </div>
      </div>

      {/* Revenue Losses */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue Losses Per Month</h3>
        </div>
        <ul className="space-y-4">
          {[
            { label: 'Missed and no-show patients — no reminder system', loss: '8,000 - 15,000/month' },
            { label: 'Billing errors and unbilled services', loss: '3,000 - 5,000/month' },
            { label: 'Lost follow-up revenue — no patient recall system', loss: '5,000 - 10,000/month' },
          ].map(({ label, loss }) => (
            <li key={label} className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-gray-900 dark:text-white font-medium">{label}</span>
              </div>
              <span className="text-red-600 dark:text-red-400 font-bold whitespace-nowrap">{loss}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900 dark:text-white">Total Monthly Revenue Lost</span>
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">16,000 - 30,000/month</span>
          </div>
        </div>
      </div>

      {/* Annual Total */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800 text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Calculator className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Annual Total Cost of Paper</h3>
        <div className="text-5xl md:text-6xl font-bold text-blue-600 dark:text-blue-400 mb-4">
          3.6 - 5.4 Lakhs
        </div>
        <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">per year, for a single-doctor, 25-patient/day clinic.</p>
        <p className="text-gray-600 dark:text-gray-300">
          And that is conservative. For a <strong className="text-gray-900 dark:text-white">50-patient clinic, double it</strong>.
          For a <strong className="text-gray-900 dark:text-white">multi-doctor clinic, triple it</strong>.
          Your paper is not free. It never was.
        </p>
      </div>
    </div>
  </Section>
);

const ComparisonSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Paper vs Doxxy — Every Dimension, Head to Head.</SectionTitle>
    <SectionSubtitle className="mt-4">
      This is not a comparison with a competitor. This is your clinic before and after digitisation.
    </SectionSubtitle>

    <div className="max-w-5xl mx-auto mt-12 overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            <th className="text-left p-4 font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Dimension</th>
            <th className="text-left p-4 font-semibold text-red-600 dark:text-red-400 text-sm uppercase tracking-wider">Paper</th>
            <th className="text-left p-4 font-semibold text-emerald-600 dark:text-emerald-400 text-sm uppercase tracking-wider">Doxxy</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {[
            { dimension: 'Patient Check-In Time', paper: '6-8 min — fill form, find file, update register', doxxy: '2 min — search name, verify, done' },
            { dimension: 'Record Retrieval', paper: '2-5 min — walk to almirah, flip through folders', doxxy: 'Instant — type the name, complete history loads' },
            { dimension: 'Prescription Writing', paper: '3-4 min — handwrite, manually calculate dosage', doxxy: '60 sec — template-based, auto-dosage, legible every time' },
            { dimension: 'Billing Accuracy', paper: '12% average error rate — manual calculation, lost slips', doxxy: '100% accurate — auto-compiled from consultation, GST compliant' },
            { dimension: 'Follow-Up Management', paper: 'Forgotten — no systematic tracking', doxxy: 'Automated WhatsApp reminders — patients actually show up' },
            { dimension: 'Day-End Reconciliation', paper: '30 min — count cash, tally register, hunt for mismatches', doxxy: 'Real-time dashboard — always reconciled, one-click report' },
            { dimension: 'Record Safety', paper: 'Fire, flood, termites = permanent loss of decades of history', doxxy: 'Encrypted cloud backup — geo-redundant, accessible from anywhere' },
            { dimension: 'Patient Experience', paper: '"Please wait, we are finding your file"', doxxy: '"Right this way — Doctor has your full history ready"' },
            { dimension: 'Monthly Cost', paper: '16,000+ — staff time, supplies, errors, lost revenue', doxxy: '499/month' },
            { dimension: 'Data for Decisions', paper: '"I think we saw more patients this month?"', doxxy: 'Revenue, patient, and specialty analytics — real time' },
          ].map(({ dimension, paper, doxxy }) => (
            <tr key={dimension} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td className="p-4 font-medium text-gray-900 dark:text-white">{dimension}</td>
              <td className="p-4 text-gray-600 dark:text-gray-300 bg-red-50/30 dark:bg-red-950/10">{paper}</td>
              <td className="p-4 text-gray-900 dark:text-white font-medium bg-emerald-50/30 dark:bg-emerald-950/10">{doxxy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Section>
);

const HiddenCostsSection = () => (
  <Section>
    <SectionTitle>The Hidden Costs Paper Users Never Calculate.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Beyond the rupees. The structural, emotional, and strategic costs of running a paper-based clinic in modern India.
    </SectionSubtitle>

    <div className="grid md:grid-cols-2 gap-8 mt-16 max-w-5xl mx-auto">
      {/* Disaster Vulnerability */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 shadow-sm">
        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-5">
          <Flame className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Disaster Vulnerability</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          One fire. One flood. One termite infestation. And 15 years of patient records are gone — permanently. No backup exists. No recovery is possible. No legal defence if a patient sues for malpractice and you cannot produce their treatment history. Ask any clinic owner in Chennai who lived through the 2015 floods or in Kerala during the 2018 deluge: paper records and water do not mix. Cloud records survive everything.
        </p>
      </div>

      {/* Doctor Burnout */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 shadow-sm">
        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-5">
          <Clock className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Doctor Burnout</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          You studied for 8+ years to become a doctor. You did not sign up to be a filing clerk. The 3 hours a day spent on paper admin adds up to <strong className="text-gray-900 dark:text-white">15 hours a week, 750 hours a year</strong> — the equivalent of 31 full days. Days you could spend with your family. Reading medical journals. Seeing 8 more patients a day. Or simply resting. Paper is not just expensive — it is exhausting.
        </p>
      </div>

      {/* Patient Trust */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 shadow-sm">
        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-5">
          <Users className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Patient Trust</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          When you cannot find their file from the last visit, patients notice. When you write a prescription from scratch instead of reviewing their history, they notice. When you forget their follow-up and they miss a critical checkup, they leave — and they tell their family. In an era where patients expect their bank, their food delivery, and their taxi to be instant and digital, a clinic that cannot pull up a file in under 5 minutes feels outdated. Trust is built on competence. Paper undermines both.
        </p>
      </div>

      {/* Growth Ceiling */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 shadow-sm">
        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-5">
          <TrendingDown className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">The Growth Ceiling</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Paper does not scale. At 25 patients a day, it is annoying. At 40 a day, it is chaos — files pile up, prescriptions get rushed, billing errors multiply. At 60 a day, you are either turning patients away or hiring a second receptionist whose entire job is managing paper. Paper sets a hard ceiling on your clinic&apos;s growth that has nothing to do with your medical skill and everything to do with administrative friction. Every clinic that outgrows paper discovers the same thing: the limit was never the doctor&apos;s capacity. It was the filing cabinet&apos;s.
        </p>
      </div>
    </div>
  </Section>
);

const TransitionSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>The Thought of Switching Is Scarier Than the Switch Itself.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Four weeks. That is how long it takes to move from paper-dependent to paper-optional. Here is the exact plan.
    </SectionSubtitle>

    <div className="max-w-4xl mx-auto mt-16 space-y-6">
      {[
        {
          week: 'Week 1',
          title: 'Setup and Configuration',
          description: 'Sign up for Doxxy. Our onboarding team helps configure your consultation templates, billing rates, prescription formats, and specialty settings. By the end of week one, your Doxxy account mirrors how your clinic actually operates — same fee structure, same prescription patterns, same workflow. No generic software that forces you to change how you practice.',
          icon: MousePointer,
        },
        {
          week: 'Week 2',
          title: 'Parallel Running',
          description: 'Existing patients continue on paper. All new patients are registered directly in Doxxy. Your receptionist is already faster on Doxxy for new registrations than on paper — searching a name instead of creating a new file, typing vitals instead of writing them. By Friday of week two, your staff has used Doxxy for 20-30 patients and the initial hesitation has been replaced by relief.',
          icon: FileText,
        },
        {
          week: 'Week 3',
          title: 'Bulk Import and Full Digital for New Patients',
          description: 'We help bulk-import your top 50 repeat patients — the ones you see every week. Their history, medications, and last visit notes are digitised. From this point forward, all new patients and all repeat patients on the import list are managed fully in Doxxy. Paper registrations stop. Your almirah stays closed for most of the day.',
          icon: HardDrive,
        },
        {
          week: 'Week 4',
          title: 'Paper Is Now Your Backup',
          description: 'You reach for the mouse, not the pen. Prescriptions are typed, not written. Bills are auto-generated, not tallied. Patient history loads in 3 seconds, not 3 minutes. Paper files are still in the cabinet as a reference, but you have not pulled one out in three days. The transition is complete — not because you forced it, but because digital is genuinely easier.',
          icon: Cloud,
        },
      ].map(({ week, title, description, icon: Icon }) => (
        <div key={week} className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-200/75 dark:border-gray-700/50 shadow-sm flex gap-6 items-start">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">{week}</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="max-w-3xl mx-auto mt-12 text-center bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
      <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
        <strong className="text-gray-900 dark:text-white">Month 3:</strong> You have not bought a prescription pad in 60 days.
        Your end-of-day reconciliation takes one click. Your patient wait time is half what it was. You cannot remember how you managed before — and you do not want to.
      </p>
    </div>
  </Section>
);

const ResultsSection = () => (
  <Section>
    <SectionTitle>Real Clinic. Real Switch. Real Results.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Not a hypothetical. A clinic like yours that made the move.
    </SectionSubtitle>

    <div className="max-w-4xl mx-auto mt-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-10 border border-gray-200/75 dark:border-gray-700/50 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1">
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              <strong className="text-gray-900 dark:text-white text-xl">Dr. Venkatesh, General Physician</strong>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Coimbatore, Tamil Nadu — 18 years in practice</span>
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              Dr. Venkatesh ran a busy single-doctor OPD seeing 30-35 patients daily. His clinic had four almirahs stuffed with 14 years of patient files. Finding a returning patient&apos;s folder took 3-5 minutes, during which the queue grew and tempers shortened. Prescriptions were handwritten. Bills were manual. Follow-ups were tracked in a diary that nobody had time to update.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              He switched to Doxxy in January 2026. By March:
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mt-4">
          {[
            { icon: Clock, stat: '35 → 12 min', label: 'Patient Wait Time', detail: 'Down 65%. Patients in and out faster. More patients seen per day without rushing.' },
            { icon: TrendingDown, stat: '+18%', label: 'Monthly Revenue', detail: 'Billing errors eliminated. Follow-up reminders bringing patients back. Every service billed.' },
            { icon: Users, stat: '30/day', label: 'Patients with Zero Filing', detail: 'Receptionist handles 30 patients daily. No files pulled. No files filed. No files lost.' },
          ].map(({ icon: Icon, stat, label, detail }) => (
            <div key={label} className="text-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{stat}</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{label}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{detail}</p>
            </div>
          ))}
        </div>

        <blockquote className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <p className="text-lg text-gray-700 dark:text-gray-200 italic leading-relaxed">
            &ldquo;My only regret is not switching 5 years ago. I did not realise how much time and money paper was taking until I stopped using it. The first month, my revenue went up by 18% — not because I saw more patients, but because I stopped missing charges and my patients started coming back for follow-ups they used to forget. Doxxy paid for itself in the first week.&rdquo;
          </p>
        </blockquote>
      </div>
    </div>
  </Section>
);

const ROISection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>The ROI Does Not Need a Calculator. But Here It Is Anyway.</SectionTitle>
    <SectionSubtitle className="mt-4">
      This is not a software purchase. It is the highest-return investment your clinic will ever make.
    </SectionSubtitle>

    <div className="max-w-3xl mx-auto mt-16">
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 md:p-10 border border-blue-200 dark:border-blue-800">
        <div className="grid sm:grid-cols-2 gap-8 mb-8">
          <div className="text-center">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Printer className="h-7 w-7 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Paper Costs You</div>
            <div className="text-4xl md:text-5xl font-bold text-red-600 dark:text-red-400">3.6-5.4L</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">per year</div>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Cloud className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Doxxy Costs You</div>
            <div className="text-4xl md:text-5xl font-bold text-emerald-600 dark:text-emerald-400">5,988</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">per year (499/month)</div>
          </div>
        </div>

        <div className="text-center pt-6 border-t border-blue-200 dark:border-blue-800">
          <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Return on Investment</div>
          <div className="text-5xl md:text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            6,000-9,000%
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-200">
            For every rupee you spend on Doxxy, you save 60-90 rupees in paper costs, staff time, billing errors, and lost patients.
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-3">
            If a bank offered you a 6,000% return, you would empty your savings account. This is the same math — applied to your clinic.
          </p>
        </div>
      </div>
    </div>
  </Section>
);

const FAQSection = () => (
  <Section>
    <SectionTitle>Frequently Asked Questions.</SectionTitle>
    <SectionSubtitle className="mt-4">
      What clinic owners ask before making the switch from paper to digital.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-6">
      {[
        {
          q: 'Is it difficult to switch from paper to software mid-practice?',
          a: 'Not if done in phases. Most Doxxy clinics run paper and digital in parallel for the first two weeks — existing patients continue on paper while all new patients are registered digitally. By week three, your staff is faster on Doxxy than on paper for new patients, and you begin bulk-importing your top repeat patients. By week four, paper becomes your backup, not your primary system. Our team helps configure your templates, specialties, and billing settings during onboarding so the software matches how your clinic actually operates from day one. The transition feels large before you start, but within 3-4 weeks most clinic owners report they cannot imagine going back.',
        },
        {
          q: 'What happens to my existing paper records?',
          a: 'Your existing paper records do not need to be digitised all at once. Most clinics keep their paper archives as a historical reference and go fully digital for all new patients and visits. Over time, as repeat patients return, their paper history gets progressively captured in Doxxy through new digital consultations — each visit adds to their digital timeline. For the top 50-100 repeat patients you see most frequently, our team can assist with a focused bulk-import during onboarding. The paper archives remain in your cabinets as a fallback, but within 3-6 months you will find yourself reaching for them less and less. There is no mandate to digitise decades of records before you can start using Doxxy.',
        },
        {
          q: 'Will my senior staff who are not tech-savvy be able to use it?',
          a: 'Yes. Doxxy is designed for clinic staff, not software engineers. The interface uses large buttons, simple forms, and workflows that mirror what your staff already does on paper — search for a patient name, enter vitals, record a consultation. We have clinics where the receptionist is 55+ and had never used a computer beyond WhatsApp Web before Doxxy, and within one week they were checking in patients faster than with the paper register. If a staff member can use WhatsApp, they can use Doxxy. We provide screen-share training in Hindi, English, Marathi, and 5 other Indian languages during onboarding.',
        },
        {
          q: 'What if the internet goes down — can I still see patients?',
          a: 'Doxxy is cloud-based and requires an internet connection to access records and generate bills. However, the platform is designed for Indian connectivity conditions and works reliably on 4G mobile data. Most clinics keep a mobile hotspot as a backup — a 300/month Jio or Airtel data pack provides more than enough bandwidth for Doxxy. In the rare event of a complete outage, we recommend keeping a simple paper register for walk-in patient details (name, phone, vitals) and entering them into Doxxy when connectivity returns — typically within minutes. For clinics in areas with genuinely unreliable connectivity, we help assess options during onboarding.',
        },
        {
          q: 'Can I try Doxxy before committing to switch completely?',
          a: 'Yes. Doxxy offers a free Practice Essentials plan that lets you use the core EMR, prescription writing, and patient management features at no cost for as long as you need. You can register real patients, write digital prescriptions, and experience the speed difference firsthand — before paying anything. Most clinics start with the free plan, use it for new patients alongside their existing paper system for 2-3 weeks, and upgrade to a paid plan only when they are ready to go fully digital. There is no time limit on the free plan, and no credit card is required to sign up. This lets you evaluate Doxxy at your own pace, with your own patients, in your own clinic.',
        },
      ].map(({ q, a }) => (
        <details key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6 group">
          <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
            {q}
            <span className="text-blue-500 text-xl group-open:rotate-45 transition-transform">+</span>
          </summary>
          <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">{a}</p>
        </details>
      ))}
    </div>

    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  </Section>
);

const FinalCTASection = () => (
  <Section className="text-center bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Paper Has Cost You Enough.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Start your last month of paper records. Every day you wait is another 3 hours of staff time and another 1,000+ rupees in hidden costs you will never recover.
    </SectionSubtitle>
    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Start Free Practice <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
      <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold">
        <Link href="https://wa.me/917388890554?text=Hi%21%20I%27d%20like%20to%20know%20more%20about%20switching%20from%20paper%20to%20Doxxy">Chat on WhatsApp</Link>
      </Button>
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
      Free to start. No credit card required. Cancel anytime.
    </p>
  </Section>
);

const ExploreLinksSection = () => (
  <Section>
    <SectionTitle>Explore What Doxxy Replaces.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Every feature that replaces a paper process in your clinic.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 grid sm:grid-cols-2 gap-4">
      {[
        { href: '/features', label: 'All Features', desc: 'Everything Doxxy replaces — EMR, billing, reminders, analytics' },
        { href: '/pricing', label: 'Pricing Plans', desc: 'From free to unlimited. Find the plan that fits your clinic' },
        { href: '/electronic-medical-records', label: 'Electronic Medical Records', desc: 'Replace paper files with instant, searchable digital records' },
        { href: '/digital-prescription-software', label: 'Digital Prescriptions', desc: 'Stop handwriting. Templates, auto-dosage, WhatsApp delivery' },
        { href: '/clinic-billing-software', label: 'Clinic Billing', desc: 'Auto-generate GST bills, accept UPI, reconcile in real time' },
        { href: '/whatsapp-appointment-reminders', label: 'WhatsApp Reminders', desc: 'Cut no-shows by 35%. Automated confirmations and waitlist fills' },
      ].map(({ href, label, desc }) => (
        <Link
          key={href}
          href={href}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {label}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
        </Link>
      ))}
    </div>
  </Section>
);

// --- MAIN PAGE ---

export default function ClinicSoftwareVsPaper() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <ProblemSection />
      <CostBreakdownSection />
      <ComparisonSection />
      <HiddenCostsSection />
      <TransitionSection />
      <ResultsSection />
      <ROISection />
      <FAQSection />
      <FinalCTASection />
      <ExploreLinksSection />
      <SignupCTA
        heading="Paper Costs More Than Software. Do the Math."
        description="A typical solo clinic spends ₹18,000-24,000/year on paper, printing, filing, and storage — before counting staff time. See what switching saves you. Chat on WhatsApp."
      />

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Clinic Software vs Paper Records", url: `${APP_URL}/clinic-software-vs-paper` },
        ]}
      />
    </div>
  );
}
