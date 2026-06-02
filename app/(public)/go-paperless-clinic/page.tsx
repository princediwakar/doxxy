// Path: app/(public)/go-paperless-clinic/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import BreadcrumbJsonLd from '@/components/SEO/BreadcrumbJsonLd';
import SignupCTA from '@/components/SignupCTA';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Section, SectionTitle, SectionSubtitle } from '@/components/ui/section-headers';
import { ArrowRight, FileText, FileX, Search, HardDrive, Shield, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { APP_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'How to Go Paperless in Your Clinic — The Complete Step-by-Step Guide',
  description: 'Transform your Indian clinic from paper to digital. Which records to digitize first, how to handle legacy files, and how to get your staff onboard. A practical guide for clinics of all sizes.',
  alternates: { canonical: '/go-paperless-clinic' },
  openGraph: {
    title: 'Go Paperless Clinic — Complete Digital Transformation Guide for Indian Clinics',
    description: 'Step-by-step guide: digitize patient records, prescriptions, billing, and reports. Built for Indian OPDs and clinics.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Go Paperless Clinic Guide' }],
  },
  keywords: ['how to go paperless clinic', 'paperless clinic setup India', 'digital clinic transformation', 'paperless medical records India', 'clinic digitization guide', 'switch from paper to digital clinic'],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How long does it take to go completely paperless?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'New patients can go digital from day 1. Full transformation — including digitizing legacy records — typically takes 3-6 months depending on patient volume. Most clinics phase it in gradually with zero disruption to daily operations. Start with digital registration and prescriptions for new patients in week 1. By month 4, 80% of your daily workflow is already digital, and the remaining paper files are being digitized during idle time.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if my senior doctor refuses to use a computer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doxxy works on smartphones and tablets too — no computer required. Voice-to-text lets doctors dictate prescriptions in Hindi, Marathi, Gujarati, or English. The interface is designed to need minimal typing: tap common diagnoses from a list, select medications from your favourites, and the prescription is generated. Many senior doctors who initially resisted adapt within a week when they see prescriptions go from 3 minutes of handwriting to 30 seconds of tapping.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I digitize 2,000+ old patient files?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Do not try to do it all at once — that is the single biggest mistake clinics make. Instead, enter 15-20 old files per day during idle time. At that pace, 1,000 files are digitized in 2-3 months. Prioritize active patients — those who have visited in the last 12 months. For inactive patients, digitize only when they return for a visit. This phased approach means your staff is never overwhelmed and daily OPD continues without interruption.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is digital data safe from hacking and data loss?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doxxy uses bank-grade AES-256 encryption for all patient data — both when stored and when transmitted. Automatic backups run continuously across multiple geographically separate data centres, so even if one server fails, your data is safe. Paper records, by contrast, can be destroyed by fire, flood, theft, or simply degrade over time. Role-based access controls ensure receptionists, nurses, and doctors each see only what they need. We comply with Indian data protection laws and ABDM guidelines.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens if the internet goes down during OPD hours?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doxxy works offline. All data is stored locally on your device and automatically syncs to the cloud when the internet reconnects. You can register patients, write prescriptions, and record clinical notes without an active connection. When connectivity returns — whether after 5 minutes or 5 hours — everything syncs seamlessly. No disruption to patient care. For doctors practising in areas with unreliable internet, this offline-first design is built into the core of Doxxy.',
      },
    },
  ],
};

export default function GoPaperlessClinic() {
  return (
    <div className="bg-white dark:bg-gray-900">

      {/* HERO */}
      <Section className="text-center !py-28 md:!py-40">
        <Badge variant="secondary" className="mb-6 text-sm px-4 py-1.5">
          The average Indian clinic spends 3+ hours daily on paperwork
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
          Mrs. Sharma&apos;s File Is Somewhere In That Cabinet. You Just Spent 8 Minutes Looking For It.
        </h1>
        <SectionSubtitle>
          The real cost of paper is not the ₹10 per file. It is the 5-8 minutes per file search, the 200 water-damaged records after last monsoon, the storage room that could be generating ₹2,000/day as a second consultation cabin. This is the definitive guide to transforming your Indian clinic from paper to digital — step by step, without disrupting your OPD.
        </SectionSubtitle>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
            <Link href="https://wa.me/+917388890554">Start Your Paperless Journey <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600">
            <Link href="/pricing">See Pricing <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </Section>

      {/* THE PROBLEM */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>What Paper Is Actually Costing Your Clinic.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Not vague statistics. Real costs, Indian clinic context, stories you will recognize.
        </SectionSubtitle>

        <div className="mt-16 space-y-10 max-w-4xl mx-auto">
          <div className="flex gap-5">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
              <Search className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">The Search Tax</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Monday morning, 10:42 AM. Your receptionist, Priya, is searching for Mrs. Sharma&apos;s file. She checked the &ldquo;S&rdquo; drawer — not there. Tried &ldquo;Sh&rdquo; — not there either. It was misfiled under &ldquo;S harma&rdquo; with a space. Seven minutes gone. Mrs. Sharma is in the waiting room, checking her watch. Three more patients have arrived. Now multiply this: 10 such searches per day × 7 minutes each = <strong className="text-gray-900 dark:text-white">70 minutes of staff time lost daily</strong>. That is Priya spending nearly 6 hours every week just hunting for paper, instead of helping patients.
              </p>
            </div>
          </div>

          <div className="flex gap-5">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
              <HardDrive className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">The Space Tax</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Walk to the back of your clinic. That room with 15 years of patient files? Three steel almirahs, floor to ceiling. It measures 10 feet by 8 feet — the exact size of a consultation room. At a modest ₹200 consultation fee and 10 patients a day, that room could be generating <strong className="text-gray-900 dark:text-white">₹2,000/day, or ₹50,000/month</strong>. Instead, it stores paper that you access for 70 minutes a day. You are paying rent — ₹3,000 to ₹8,000/month depending on your city — for dead storage. That is a consultation room you are not building, a diagnostic corner you are not opening, a pharmacy shelf you are not stocking.
              </p>
            </div>
          </div>

          <div className="flex gap-5">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
              <FileX className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">The Illegibility Tax</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Dr. Verma prescribed <strong className="text-gray-900 dark:text-white">Amlodipine 5mg</strong> to Mr. Joshi. The pharmacist read it as <strong className="text-gray-900 dark:text-white">Amlodipine 50mg</strong>. One handwritten prescription, one near-miss. Mr. Joshi is 68 years old. A 50mg dose could have landed him in the emergency room. This is not hypothetical. A 2016 study in the Indian Journal of Pharmacology found that <strong className="text-gray-900 dark:text-white">illegible prescriptions contribute to 7,000+ medication errors annually</strong> in India. Your handwriting is not the problem — the system is. Every handwritten prescription is a gamble that the pharmacist, the patient, and the nurse all interpret the same squiggle the same way.
              </p>
            </div>
          </div>

          <div className="flex gap-5">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">The Disaster Tax</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                July 2023, Pune. Dr. Kulkarni&apos;s clinic. The monsoon was heavier than usual. The ceiling developed a leak overnight — directly above the filing room. By morning, <strong className="text-gray-900 dark:text-white">200 patient files were water-damaged</strong>. Ink had bled across pages. Mould had already started. Twelve years of medical history — allergies, chronic conditions, surgical histories — gone in one night. No backup. No recovery. Dr. Kulkarni had to call patients one by one, asking them to recall their own medical history. Some had moved. Some had changed numbers. Some simply could not remember which antibiotic they were allergic to. Paper has no undo button.
              </p>
            </div>
          </div>

          <div className="flex gap-5">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">The Growth Tax</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                You have built a successful clinic in Andheri. Now you want to open a second one in Borivali — 18 km away. But your patient records are in physical files at Clinic 1. When Mrs. Iyer, who usually visits Andheri, walks into your new Borivali clinic, how do you see her history? Do you call Andheri and ask someone to read her file over the phone? Do you courier the file? Do you tell her to go back to Andheri? Paper chains your patients to one location. Digital frees them — and you — to grow. Every multi-location clinic in India started with paper at Location 1 and realized within the first week of Location 2 that paper does not scale.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* THE MATH */}
      <Section>
        <SectionTitle>The Annual Cost of Running on Paper.</SectionTitle>
        <SectionSubtitle className="mt-4">
          A conservative estimate for a single-doctor OPD clinic seeing 30 patients a day.
        </SectionSubtitle>

        <div className="mt-12 max-w-4xl mx-auto overflow-hidden rounded-2xl border border-gray-200/75 dark:border-gray-700/50">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700/50">
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Cost Category</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white text-right">Monthly</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white text-right">Annual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/75 dark:divide-gray-700/50">
              <tr>
                <td className="p-4 text-gray-700 dark:text-gray-300">Files, paper, printing, stationery</td>
                <td className="p-4 text-gray-900 dark:text-white text-right font-medium">₹1,500</td>
                <td className="p-4 text-gray-900 dark:text-white text-right font-medium">₹18,000</td>
              </tr>
              <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                <td className="p-4 text-gray-700 dark:text-gray-300">Storage space (cabinets, room rent allocation)</td>
                <td className="p-4 text-gray-900 dark:text-white text-right font-medium">₹3,000</td>
                <td className="p-4 text-gray-900 dark:text-white text-right font-medium">₹36,000</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700 dark:text-gray-300">Staff time on paperwork (3 hrs/day at ₹150/hr)</td>
                <td className="p-4 text-gray-900 dark:text-white text-right font-medium">₹13,500</td>
                <td className="p-4 text-red-600 dark:text-red-400 text-right font-bold">₹1,62,000</td>
              </tr>
              <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                <td className="p-4 text-gray-700 dark:text-gray-300">Lost or misfiled records (3-5/month, avg ₹500/visit lost)</td>
                <td className="p-4 text-gray-900 dark:text-white text-right font-medium">₹2,000</td>
                <td className="p-4 text-gray-900 dark:text-white text-right font-medium">₹24,000</td>
              </tr>
              <tr className="bg-blue-50 dark:bg-blue-900/20">
                <td className="p-4 font-bold text-blue-900 dark:text-blue-100">TOTAL</td>
                <td className="p-4 font-bold text-blue-900 dark:text-blue-100 text-right text-lg">₹20,000</td>
                <td className="p-4 font-bold text-blue-900 dark:text-blue-100 text-right text-lg">₹2,40,000</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-6 max-w-4xl mx-auto text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          This does not include the patients who never came back because their file was lost. The prescriptions misread by pharmacists. The monsoon-damaged records. The second clinic you could not open because your records are tied to one location. The real annual cost of paper — when you account for lost revenue, liability risk, and growth constraints — is easily <strong className="text-gray-700 dark:text-gray-300">₹4,00,000 to ₹5,00,000</strong> for an established clinic.
        </p>
      </Section>

      {/* WHY CLINICS STAY ON PAPER */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>Why Clinics Stay on Paper — And Why Those Reasons Are Wrong.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Every clinic owner has the same four fears. Let us address them directly.
        </SectionSubtitle>

        <div className="mt-16 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center mb-4">
              <span className="text-amber-600 dark:text-amber-400 text-xl font-bold">1</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">&ldquo;My senior doctor won&apos;t use a computer.&rdquo;</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              He does not have to. Doxxy works on a smartphone and tablet. The interface is designed for doctors, not IT professionals — large buttons, pre-filled templates, and voice-to-text input in Hindi, Marathi, Gujarati, Tamil, and 9 other Indian languages. Your senior doctor can dictate a prescription and have it auto-typed. Tapping a diagnosis from a list takes 5 seconds versus 2 minutes of handwriting. Most doctors over 55 adapt within a week — not because they love technology, but because they love going home 90 minutes earlier.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center mb-4">
              <span className="text-amber-600 dark:text-amber-400 text-xl font-bold">2</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">&ldquo;What if the internet goes down?&rdquo;</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Doxxy works offline. Register patients, write prescriptions, record clinical notes — all without an active internet connection. When connectivity returns, everything syncs automatically to the cloud. This is not a backup feature; it is core architecture designed for Indian clinics where a Jio hotspot can drop mid-OPD. Five minutes offline or five hours — your workflow does not change. The data is stored locally on your device and syncs when the connection is back.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center mb-4">
              <span className="text-amber-600 dark:text-amber-400 text-xl font-bold">3</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">&ldquo;What about my 2,000 old patient files?&rdquo;</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              You do not digitize them all on day 1 — that is the mistake. Phase them in gradually. Start digital for every new patient from day 1. For existing patients with paper files, digitize their record when they come in for their next visit. During idle time, staff can enter 15-20 old files per day. At that pace, 1,000 files are digitized in 50 working days without a single extra hour of overtime. By month 4, 80% of your daily workflow is already digital, and the remaining paper files are being chipped away at during quiet hours.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center mb-4">
              <span className="text-amber-600 dark:text-amber-400 text-xl font-bold">4</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">&ldquo;My receptionist has never used a computer.&rdquo;</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              If she can use WhatsApp, she can use Doxxy. The patient registration screen is simpler than a WhatsApp chat — name, phone number, age, gender. Four fields. Search is a single box, like Google. The learning curve is 3 days, not 3 months. We have clinics where the receptionist is a 45-year-old who had never touched a mouse and was registering patients on Doxxy by day 3. The interface uses large text, colour-coded buttons, and zero technical jargon. It was designed for clinics in Tier 2 and Tier 3 cities where staff computer literacy is not a given.
            </p>
          </div>
        </div>
      </Section>

      {/* THE SOLUTION — 4 PHASES */}
      <Section>
        <SectionTitle>The 4-Phase Paperless Transformation.</SectionTitle>
        <SectionSubtitle className="mt-4">
          A practical roadmap that works alongside your existing OPD. No shutdowns, no disruption.
        </SectionSubtitle>

        <div className="mt-16 space-y-10 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
            <div className="p-5 bg-blue-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">1</div>
                <div>
                  <h3 className="text-xl font-semibold">New Patients Go Digital</h3>
                  <p className="text-blue-100 text-sm">Week 1-2</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                This is the easiest, lowest-risk starting point. From Monday of Week 1, every new patient gets a digital registration, a digital prescription, and a digital bill. Zero paper for new patients from day 1. Your existing patients continue on paper — no disruption to their experience. Your staff learns the system on a manageable volume (5-10 new patients a day, not 50). Within 2 weeks, your receptionist is fluent in digital registration and your doctor has muscle memory for digital prescriptions.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="outline" size="sm" asChild className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                  <Link href="/digital-patient-registration">Digital Patient Registration <ArrowRight className="ml-1 h-3 w-3" /></Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
            <div className="p-5 bg-blue-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">2</div>
                <div>
                  <h3 className="text-xl font-semibold">Digital Prescriptions and Billing for Everyone</h3>
                  <p className="text-blue-100 text-sm">Week 2-4</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                By week 3, extend digital prescriptions and billing to existing patients as well — even if their full medical history is still on paper. The doctor writes the prescription digitally. The bill is auto-calculated from the consultation notes. The patient gets their prescription on WhatsApp. The paper file still exists, but it is now a reference document, not the active record. This is the phase where your staff starts to feel the time savings: no more manual bill calculations, no more deciphering handwriting for the pharmacist.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="outline" size="sm" asChild className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                  <Link href="/digital-prescription-software">Digital Prescription Software <ArrowRight className="ml-1 h-3 w-3" /></Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                  <Link href="/clinic-billing-software">Clinic Billing <ArrowRight className="ml-1 h-3 w-3" /></Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
            <div className="p-5 bg-blue-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">3</div>
                <div>
                  <h3 className="text-xl font-semibold">Legacy Digitization</h3>
                  <p className="text-blue-100 text-sm">Month 2-4</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Your daily workflow is now digital for all active patients. The remaining task is migrating old paper files into the EMR. Enter 15-20 old files per day during idle time — between patients, during cancellations, in the last 30 minutes before closing. At 20 files per day, 1,000 files are digitized in 50 working days. Prioritize active patients (visited in the last 12 months) first. For patients who have not visited in years, digitize their file only when they return. By the end of month 4, your filing cabinets are largely archival, and 90% of your daily activity is digital.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="outline" size="sm" asChild className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                  <Link href="/electronic-medical-records">Electronic Medical Records <ArrowRight className="ml-1 h-3 w-3" /></Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
            <div className="p-5 bg-green-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Full Digital</h3>
                  <p className="text-green-100 text-sm">Month 4-6</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                All records are digital. The paper cabinets are repurposed or removed. The back room that stored files is now a second consultation cabin, or a diagnostic corner, or simply open space. You can access any patient record from your phone. You can open a second clinic because your records are in the cloud, not in a cabinet. You have gone paperless — not with a disruptive, all-at-once overhaul, but with a phased, practical transition that your staff embraced because they could feel it making their jobs easier every week.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* THE WORKFLOW */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>One Patient Visit: Paper vs Paperless.</SectionTitle>
        <SectionSubtitle className="mt-4">
          A side-by-side comparison of the admin time behind a single patient consultation.
        </SectionSubtitle>

        <div className="mt-12 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-red-200 dark:border-red-900/50 p-8">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-6 w-6 text-red-500" />
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">Paper Workflow</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-xs font-bold text-red-600 dark:text-red-400">1</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Patient fills paper registration form</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Writing name, address, history by hand. Illegible entries common. ~5 min.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-xs font-bold text-red-600 dark:text-red-400">2</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Receptionist fetches file from cabinet</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Search, misfile risk, cabinet is in another room. ~2-7 min.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-xs font-bold text-red-600 dark:text-red-400">3</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Doctor writes clinical notes by hand</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Often rushed, abbreviated. Future-you will not remember what that note meant. ~3 min.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-xs font-bold text-red-600 dark:text-red-400">4</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Doctor handwrites prescription</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Legibility depends on how many patients are waiting. ~2 min.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-xs font-bold text-red-600 dark:text-red-400">5</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Bill calculated manually, written on paper</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Mental math or calculator. Errors in addition common. ~2 min.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-xs font-bold text-red-600 dark:text-red-400">6</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">File returned to cabinet</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Misfile risk again. ~1 min.</p>
                </div>
              </li>
            </ul>
            <div className="mt-6 pt-4 border-t border-red-200 dark:border-red-900/30">
              <p className="text-red-600 dark:text-red-400 font-bold text-lg">Total: 15-20 min admin time per patient</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-green-200 dark:border-green-900/50 p-8">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">Paperless Workflow (Doxxy)</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-xs font-bold text-green-600 dark:text-green-400">1</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Patient scans QR, fills form on phone</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Typed, legible, auto-saved. Patient does the data entry. ~1 min.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-xs font-bold text-green-600 dark:text-green-400">2</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">EMR auto-loaded on doctor&apos;s screen</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Full history, past prescriptions, allergies — all visible. Instant.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-xs font-bold text-green-600 dark:text-green-400">3</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Doctor selects template, taps findings</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Pre-built templates for common conditions. Structured, searchable notes. ~1 min.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-xs font-bold text-green-600 dark:text-green-400">4</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Prescription auto-generated, sent via WhatsApp</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Crystal clear. 13 Indian languages. Patient never loses it. ~30 sec.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-xs font-bold text-green-600 dark:text-green-400">5</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Bill auto-generated from consult notes</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Zero manual calculation. Line items from service catalogue. Instant.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-xs font-bold text-green-600 dark:text-green-400">6</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">All records stored, searchable forever</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Encrypted cloud backup. Find any patient in 3 seconds, 5 years from now.</p>
                </div>
              </li>
            </ul>
            <div className="mt-6 pt-4 border-t border-green-200 dark:border-green-900/30">
              <p className="text-green-600 dark:text-green-400 font-bold text-lg">Total: 3-5 min admin time per patient</p>
            </div>
          </div>
        </div>

        <div className="mt-10 max-w-3xl mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 text-center">
          <p className="text-lg text-blue-900 dark:text-blue-100 font-semibold">
            30 patients/day x 12 minutes saved per patient = <span className="text-blue-600 dark:text-blue-400">6 hours of staff time recovered. Every single day.</span>
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
            That is 180 hours a month. A full-time employee&apos;s worth of time — freed to do actual patient care instead of paper shuffling.
          </p>
        </div>
      </Section>

      {/* THE RESULTS — BEFORE/AFTER */}
      <Section>
        <SectionTitle>Before Doxxy vs After Doxxy.</SectionTitle>
        <SectionSubtitle className="mt-4">
          The transformation, measured in real clinic outcomes.
        </SectionSubtitle>

        <div className="mt-12 max-w-5xl mx-auto overflow-hidden rounded-2xl border border-gray-200/75 dark:border-gray-700/50">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700/50">
                <th className="p-4 font-semibold text-red-600 dark:text-red-400 w-1/2">Before (Paper)</th>
                <th className="p-4 font-semibold text-green-600 dark:text-green-400 w-1/2">After (Doxxy)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/75 dark:divide-gray-700/50">
              <tr>
                <td className="p-4 text-gray-700 dark:text-gray-300 bg-red-50/30 dark:bg-red-950/10">Paper files fill 3 cabinets, consuming an entire room</td>
                <td className="p-4 text-gray-700 dark:text-gray-300 bg-green-50/30 dark:bg-green-950/10">Zero cabinets, room repurposed as second consultation cabin</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700 dark:text-gray-300 bg-red-50/30 dark:bg-red-950/10">7 min average to retrieve a patient file</td>
                <td className="p-4 text-gray-700 dark:text-gray-300 bg-green-50/30 dark:bg-green-950/10">Instant search by name, phone number, or ABHA ID</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700 dark:text-gray-300 bg-red-50/30 dark:bg-red-950/10">Handwritten prescriptions — legibility risk with every script</td>
                <td className="p-4 text-gray-700 dark:text-gray-300 bg-green-50/30 dark:bg-green-950/10">Digital prescriptions printed or sent via WhatsApp in 13 Indian languages</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700 dark:text-gray-300 bg-red-50/30 dark:bg-red-950/10">Files lost or damaged every monsoon; no backup exists</td>
                <td className="p-4 text-gray-700 dark:text-gray-300 bg-green-50/30 dark:bg-green-950/10">Encrypted cloud backup across multiple data centres; never lost</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700 dark:text-gray-300 bg-red-50/30 dark:bg-red-950/10">Records accessible only at the clinic, during working hours</td>
                <td className="p-4 text-gray-700 dark:text-gray-300 bg-green-50/30 dark:bg-green-950/10">Access patient records from any device, any location, 24/7</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700 dark:text-gray-300 bg-red-50/30 dark:bg-red-950/10">₹2,40,000/year spent on paper, printing, and staff filing time</td>
                <td className="p-4 text-gray-700 dark:text-gray-300 bg-green-50/30 dark:bg-green-950/10">₹0 spent on paper and filing — entire budget redirected to patient care</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700 dark:text-gray-300 bg-red-50/30 dark:bg-red-950/10">Opening a second clinic means duplicating or couriering files</td>
                <td className="p-4 text-gray-700 dark:text-gray-300 bg-green-50/30 dark:bg-green-950/10">Multi-clinic ready — same patient record visible at any location</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>Common Questions About Going Paperless.</SectionTitle>
        <SectionSubtitle className="mt-4">
          Every clinic owner asks these. Here are the straight answers.
        </SectionSubtitle>

        <div className="mt-12 max-w-3xl mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How long does it take to go completely paperless?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              New patients can go digital from day 1. Full transformation — including digitizing legacy records — typically takes 3-6 months depending on patient volume. Most clinics phase it in gradually with zero disruption to daily operations. Start with digital registration and prescriptions for new patients in week 1. By month 4, 80% of your daily workflow is already digital, and the remaining paper files are being digitized during idle time.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">What if my senior doctor refuses to use a computer?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Doxxy works on smartphones and tablets too — no computer required. Voice-to-text lets doctors dictate prescriptions in Hindi, Marathi, Gujarati, or English. The interface is designed to need minimal typing: tap common diagnoses from a list, select medications from your favourites, and the prescription is generated. Many senior doctors who initially resisted adapt within a week when they see prescriptions go from 3 minutes of handwriting to 30 seconds of tapping.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How do I digitize 2,000+ old patient files?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Do not try to do it all at once — that is the single biggest mistake clinics make. Instead, enter 15-20 old files per day during idle time. At that pace, 1,000 files are digitized in 2-3 months. Prioritize active patients — those who have visited in the last 12 months. For inactive patients, digitize only when they return for a visit. This phased approach means your staff is never overwhelmed and daily OPD continues without interruption.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Is digital data safe from hacking and data loss?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Yes. Doxxy uses bank-grade AES-256 encryption for all patient data — both when stored and when transmitted. Automatic backups run continuously across multiple geographically separate data centres, so even if one server fails, your data is safe. Paper records, by contrast, can be destroyed by fire, flood, theft, or simply degrade over time. Role-based access controls ensure receptionists, nurses, and doctors each see only what they need. We comply with Indian data protection laws and ABDM guidelines.{' '}
              <Link href="/clinic-data-security-guide" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Read our complete data security guide.
              </Link>
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">What happens if the internet goes down during OPD hours?</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Doxxy works offline. All data is stored locally on your device and automatically syncs to the cloud when the internet reconnects. You can register patients, write prescriptions, and record clinical notes without an active connection. When connectivity returns — whether after 5 minutes or 5 hours — everything syncs seamlessly. No disruption to patient care. For doctors practising in areas with unreliable internet, this offline-first design is built into the core of Doxxy.
            </p>
          </div>
        </div>

        <Script
          id="faq-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Section>

      {/* FINAL CTA */}
      <Section className="text-center">
        <SectionTitle>Ready to Retire Your Filing Cabinets?</SectionTitle>
        <SectionSubtitle className="mt-4">
          Join thousands of Indian clinics that have made the switch. Start with new patients from day 1, phase in your legacy records, and reclaim 6 hours of staff time every single day.
        </SectionSubtitle>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
            <Link href="https://wa.me/+917388890554">Start Your Paperless Practice <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600">
            <Link href="/clinic-software-vs-paper">Paper vs Digital Comparison <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </Section>

      <SignupCTA
        heading="Go Paperless in 30 Days — We'll Show You How"
        description="Step-by-step plan: which records to digitize first, how to handle legacy files, how to get your staff onboard. Chat with us on WhatsApp for a personalised roadmap."
      />

      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: APP_URL },
          { name: 'Go Paperless Clinic Guide', url: `${APP_URL}/go-paperless-clinic` },
        ]}
      />
    </div>
  );
}
