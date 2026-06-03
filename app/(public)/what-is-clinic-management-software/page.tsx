// Path: app/(public)/what-is-clinic-management-software/page.tsx

import type { Metadata } from 'next';
import Script from "next/script";
import {
  ArrowRight,
  ClipboardList,
  CreditCard,
  Calendar,
  FileText,
  Users,
  BarChart3,
  Zap,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";

export const metadata: Metadata = {
  title: 'What is Clinic Management Software? A Complete Guide for Indian Doctors',
  description: 'What clinic management software actually does, how it works, and whether your clinic needs it. Plain English, no jargon. Written for doctors who\'ve used paper for decades.',
  alternates: {
    canonical: '/what-is-clinic-management-software',
  },
  openGraph: {
    title: 'What is Clinic Management Software? A Complete Guide for Indian Doctors',
    description: 'What clinic management software actually does, how it works, and whether your clinic needs it. Plain English, no jargon.',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'What is Clinic Management Software — A Guide for Indian Doctors' }],
  },
  keywords: ['what is clinic management software', 'clinic software explained', 'clinic management system meaning', 'benefits of clinic software', 'how does clinic software work', 'digital clinic management'],
};

// --- Article Structured Data ---
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'What is Clinic Management Software? A Complete Guide for Indian Doctors',
  description: 'What clinic management software actually does, how it works, and whether your clinic needs it. Plain English, no jargon. Written for doctors who have used paper for decades.',
  datePublished: '2026-06-02',
  dateModified: '2026-06-02',
  author: {
    '@type': 'Organization',
    name: 'Doxxy',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Doxxy',
    logo: {
      '@type': 'ImageObject',
      url: `${APP_URL}/doxxy.png`,
    },
  },
};

// --- DATA ---
const coreModules = [
  {
    icon: Users,
    title: 'Patient Records (EMR/EHR)',
    description: 'Digital patient files. Instead of: "Brown file #473, third shelf, somewhere." You get: Search by name, phone, or ABHA ID. Full history in one screen. Past visits, prescriptions, lab reports, allergies. No lost files. No duplicate entries. No "file not found."',
  },
  {
    icon: Calendar,
    title: 'Appointment Scheduling',
    description: 'Digital appointment book. Instead of: Receptionist writing in a diary, erasing, overwriting, double-booking. You get: Patients book online 24/7. Receptionist sees a clean calendar. No double-booking. Automatic WhatsApp reminders. Walk-in + appointment hybrid mode (critical for Indian clinics).',
  },
  {
    icon: CreditCard,
    title: 'Billing & Payments',
    description: 'Digital billing counter. Instead of: Calculator + carbon-paper receipt + manual day-end tally. You get: Auto-generated bills with GST. UPI QR integration. Insurance claim tracking. Day-end reports auto-generated. Revenue leakage eliminated (manual billing loses 5-8% of charges).',
  },
  {
    icon: FileText,
    title: 'Digital Prescriptions',
    description: 'Type or dictate prescriptions. Instead of: Handwritten Rx that pharmacists call to clarify. You get: Typed in 60 seconds. Drug interaction checks. Template for common conditions. 13 Indian language support. Auto-saved to patient record. Share via WhatsApp.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Patient Communication',
    description: 'Automated patient communication. Instead of: Receptionist making 40 phone calls every evening (45-60 minutes, half go unanswered). You get: WhatsApp reminders with 98% open rate. Prescription and lab report delivery via WhatsApp. Two-way chat with patients. No-show rate drops by 35%.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Know your practice. Instead of: "I think I saw about 35 patients this week... roughly." You get: Exact patient count, revenue by day/week/month, most common diagnoses, pending payments, no-show rate. The numbers that tell you if your practice is actually growing.',
  },
];

const selfAssessmentQuestions = [
  {
    question: 'Do you see more than 15 patients a day?',
    explanation: 'Paper works at low volume. Above 15/day, things get missed.',
  },
  {
    question: 'Have you ever lost a patient file or spent more than 5 minutes finding one?',
    explanation: 'Lost files = lost trust + lost revenue.',
  },
  {
    question: 'Does your receptionist spend more than 1 hour daily on phone calls for appointments?',
    explanation: 'Automation saves 5-10 hours/week of staff time.',
  },
  {
    question: 'Do you have billing errors or revenue discrepancies at least once a week?',
    explanation: 'Manual billing leaks 5-8% of revenue. Software plugs it.',
  },
  {
    question: 'Do your patients no-show without canceling?',
    explanation: 'WhatsApp reminders reduce no-shows by 35%.',
  },
  {
    question: 'Are you planning to apply for ABDM/ABHA registration?',
    explanation: 'Digital records are mandatory for ABDM compliance.',
  },
];

const softwareTypes = [
  {
    type: 'Cloud-based (SaaS)',
    description: 'Pay monthly, access from any device, always updated. Best for: 95% of clinics. Examples: Doxxy, Practo, KiviHealth.',
  },
  {
    type: 'On-premise (Installed)',
    description: 'Buy once, install on one computer, you manage it. Best for: Clinics with unreliable internet + local IT support. Example: Older legacy systems.',
  },
  {
    type: 'Specialty-specific',
    description: 'Built for one type of practice. Best for: Large specialty practices (eye hospitals, dental chains).',
  },
  {
    type: 'Free/Open-source',
    description: 'No cost but limited features, no support. Best for: Budget-constrained solo doctors who can manage tech themselves. Example: e-Sushrut (government).',
  },
];

const commonFears = [
  {
    fear: '"Mera staff software seekh nahi payega" (My staff won\'t learn it)',
    rebuttal: 'Modern clinic software is designed for non-tech users. If your receptionist can use WhatsApp, they can use clinic software. Most vendors provide free training in Hindi.',
  },
  {
    fear: '"Data safe hai kya?" (Is my data safe?)',
    rebuttal: 'Cloud software is safer than paper. Paper burns, floods, gets eaten by termites, or gets stolen. Cloud data is encrypted, backed up across multiple locations, and accessible only to you.',
  },
  {
    fear: '"Internet chala jayega to?" (What if internet goes down?)',
    rebuttal: 'Some software works offline and syncs when internet returns. Others need constant internet. Ask this question when choosing.',
  },
  {
    fear: '"Bahut mehenga hoga" (It\'ll be too expensive)',
    rebuttal: 'Software costs less than the revenue you lose to billing errors and no-shows alone. A Rs.999/mo software that saves you Rs.5,000/mo in billing errors is not an expense — it is a 5x return.',
  },
];

const pricingTiers = [
  { label: 'Free', cost: 'Rs.0', description: 'e-Sushrut, Bajaj Finserv Health free tier — basic records, no WhatsApp, limited support' },
  { label: 'Entry-level SaaS', cost: 'Rs.500-1,500/month', description: 'Doxxy Practice Essentials (Rs.999), Bajaj premium (Rs.999). Good for solo clinics.' },
  { label: 'Mid-range', cost: 'Rs.1,500-3,000/month', description: 'Doxxy Practice Plus (Rs.2,999), KiviHealth, DocPulse. Good for 2-5 doctor clinics.' },
  { label: 'Premium', cost: 'Rs.3,000-8,000/month', description: 'Practo full suite, DocPulse full suite. For large clinics and hospitals.' },
];

const faqItems = [
  {
    question: 'Can I use clinic software if I don\'t know computers well?',
    answer: 'Yes. Modern clinic software is designed for non-tech users. If you can use WhatsApp and YouTube, you can learn clinic software in 2-3 days. Most vendors provide free training in Hindi, Marathi, and other regional languages.',
  },
  {
    question: 'Is my patient data safe in cloud software?',
    answer: 'Cloud software is typically safer than paper records. Data is encrypted, backed up across multiple secure servers, and accessible only with your login credentials. Paper records can be lost, stolen, damaged by water/fire, or read by anyone with access to the filing room.',
  },
  {
    question: 'How long does it take to set up?',
    answer: 'Basic setup takes 1-2 days. This includes adding your clinic details, importing existing patient data (if any), and staff training. Full adoption — where you stop using paper completely — takes 2-4 weeks.',
  },
  {
    question: 'Can multiple doctors in my clinic use the same software?',
    answer: 'Yes. All modern clinic software supports multiple doctors with individual logins, separate schedules, and role-based access. Each doctor sees only their patients unless you configure shared access.',
  },
  {
    question: 'What if I don\'t like it after trying?',
    answer: 'You can export your data and switch. Most software (including Doxxy) offers data export in standard formats. You are never locked in. This is why free trials are important — test thoroughly before committing.',
  },
];

// --- FAQ Structured Data ---
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.answer,
    },
  })),
};

// --- PAGE SECTIONS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      What Is Clinic Management Software? (And Do You Actually Need It?)
    </h1>
    <SectionSubtitle>
      If you have been running your clinic with paper registers and Excel sheets for 15 years, here is what software actually does — explained in plain Hindi-English, no tech jargon.
    </SectionSubtitle>
    <div className="mt-10">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="#how-it-works">See How It Works <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

const ThirtySecondExplanation = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50" id="how-it-works">
    <SectionTitle>The 30-Second Explanation</SectionTitle>
    <SectionSubtitle className="mt-4">
      Clinic management software is to your clinic what UPI is to cash. Instead of paper registers, prescription pads, and manual billing, everything happens on a screen. Patient records, appointments, bills, prescriptions — all in one place, accessible in seconds.
    </SectionSubtitle>

    <div className="mt-16 max-w-4xl mx-auto">
      <p className="text-center text-lg text-gray-700 dark:text-gray-300 mb-12 font-semibold">
        Here is what a typical day looks like — before and after software.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Before Software */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border border-red-200 dark:border-red-800/50">
          <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-6 flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            Before Software (The Paper Life)
          </h3>
          <ul className="space-y-4">
            {[
              { time: '8:00 AM', text: 'Receptionist searches through a register to find today\'s appointments' },
              { time: '9:00 AM', text: 'Patient fills a paper form. Again. (Third visit this year, same form.)' },
              { time: '10:30 AM', text: '"Mrs. Sharma\'s file kahan hai?" — 10 minutes searching through cabinets' },
              { time: '11:00 AM', text: 'Doctor writes a prescription by hand. Pharmacist can\'t read it. Calls to clarify.' },
              { time: '2:00 PM', text: 'Manual billing. Receptionist adds charges on a calculator. One missed entry = lost revenue.' },
              { time: '5:00 PM', text: 'Receptionist calls patients one by one for tomorrow\'s reminders. 45 minutes.' },
              { time: '7:00 PM', text: 'End of day. Cash counted manually. Rs.300 discrepancy. No way to trace it.' },
            ].map((item) => (
              <li key={item.time} className="flex gap-3 text-gray-700 dark:text-gray-300 text-sm">
                <span className="font-semibold text-red-600 dark:text-red-400 shrink-0 w-16">{item.time}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* After Software */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800/50">
          <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-6 flex items-center gap-2">
            <Zap className="h-6 w-6" />
            After Software (The Digital Life)
          </h3>
          <ul className="space-y-4">
            {[
              { time: '8:00 AM', text: 'Dashboard shows today\'s 32 appointments, ordered by time. One click to see each patient\'s history.' },
              { time: '9:00 AM', text: 'Returning patient? QR code scan → all details auto-loaded. No form.' },
              { time: '10:30 AM', text: '"Mrs. Sharma" → typed, instant. Full history: 3 visits, 2 prescriptions, 1 lab report. 5 seconds.' },
              { time: '11:00 AM', text: 'Digital prescription. Typed or dictated. Auto-saved. Pharmacist reads it clearly.' },
              { time: '2:00 PM', text: 'Auto-billing. Charges computed from consultation type + procedures. Zero missed entries.' },
              { time: '5:00 PM', text: 'WhatsApp auto-sends reminders to all 32 patients for tomorrow. Zero clicks.' },
              { time: '7:00 PM', text: 'Day-end report auto-generated. Revenue, patients seen, pending payments. Exact to the rupee.' },
            ].map((item) => (
              <li key={item.time} className="flex gap-3 text-gray-700 dark:text-gray-300 text-sm">
                <span className="font-semibold text-green-600 dark:text-green-400 shrink-0 w-16">{item.time}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </Section>
);

const CoreModulesSection = () => (
  <Section>
    <SectionTitle>What Can Clinic Software Actually Do?</SectionTitle>
    <SectionSubtitle className="mt-4">
      Six core modules that replace every paper-based process in your clinic. Each one is designed for how Indian clinics actually work — not how a Silicon Valley engineer imagines they work.
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
      {coreModules.map((module) => (
        <div key={module.title} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 flex flex-col">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <module.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{module.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{module.description}</p>
        </div>
      ))}
    </div>
  </Section>
);

const SelfAssessmentSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Does YOUR Clinic Need Software?</SectionTitle>
    <SectionSubtitle className="mt-4">
      Answer these six questions honestly. If you answer YES to 3 or more, it is time to move beyond paper.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-4">
      {selfAssessmentQuestions.map((item, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 flex items-start gap-4">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{i + 1}</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">{item.question}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.explanation}</p>
          </div>
        </div>
      ))}

      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-6 border border-blue-200 dark:border-blue-800/50 mt-8 text-center">
        <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
          Answered YES to 3 or more? It is time to try software. Start with a free trial — no commitment, no credit card.
        </p>
        <div className="mt-4">
          <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
            <Link href="https://wa.me/+917388890554">Start Your Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </div>
  </Section>
);

const SoftwareTypesSection = () => (
  <Section>
    <SectionTitle>Types of Clinic Software (The Landscape)</SectionTitle>
    <SectionSubtitle className="mt-4">
      Not all clinic software is the same. Here is a simple breakdown so you understand what is out there before you start looking.
    </SectionSubtitle>
    <div className="grid sm:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto">
      {softwareTypes.map((item) => (
        <div key={item.type} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.type}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
        </div>
      ))}
    </div>
  </Section>
);

const PricingSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>How Much Does It Cost in India?</SectionTitle>
    <SectionSubtitle className="mt-4">
      Real numbers. No hidden fees. Here is what clinic software actually costs for Indian clinics.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12">
      <div className="overflow-hidden rounded-2xl border border-gray-200/75 dark:border-gray-700/50">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700/50">
              <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Tier</th>
              <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Cost</th>
              <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Details</th>
            </tr>
          </thead>
          <tbody>
            {pricingTiers.map((tier, i) => (
              <tr key={i} className="border-t border-gray-200/75 dark:border-gray-700/50 bg-white dark:bg-gray-800">
                <td className="p-4 font-medium text-gray-900 dark:text-white">{tier.label}</td>
                <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">{tier.cost}</td>
                <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{tier.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
        Most include free onboarding and training. Some charge setup fees (Rs.2,000-10,000 one-time) — avoid these.
      </p>
    </div>
  </Section>
);

const CommonFearsSection = () => (
  <Section>
    <SectionTitle>Common Fears (and Why They Are Wrong)</SectionTitle>
    <SectionSubtitle className="mt-4">
      These are the real concerns we hear from clinic owners who have never used software. Let us address them honestly.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-6">
      {commonFears.map((item, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center shrink-0">
              <HelpCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.fear}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{item.rebuttal}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const GettingStartedSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>How to Get Started (4 Steps)</SectionTitle>
    <SectionSubtitle className="mt-4">
      You do not need to go all-in on day one. Here is the no-risk way to try clinic software.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-6">
      {[
        {
          step: 1,
          title: 'Sign up for a free trial',
          description: 'No credit card, no commitment — 14 to 30 days of full access. Test every feature with no pressure.',
        },
        {
          step: 2,
          title: 'Add 5-10 real patients',
          description: 'Do not use demo data. Add actual patients from your practice to see how it really works with names you recognise.',
        },
        {
          step: 3,
          title: 'Run it in parallel with paper for 1 week',
          description: 'Use both systems side by side. Compare. Let your receptionist try it during real patient interactions. Build confidence gradually.',
        },
        {
          step: 4,
          title: 'Decide with your staff',
          description: 'Ask the receptionist if they like it. They are the one using it 8 hours a day. If they are happy, you have your answer.',
        },
      ].map((item) => (
        <div key={item.step} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0">
            <span className="text-lg font-bold">{item.step}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const FAQSection = () => (
  <Section>
    <SectionTitle>Frequently Asked Questions</SectionTitle>
    <SectionSubtitle className="mt-4">
      Quick answers to the questions every first-time clinic software buyer asks.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-6">
      {faqItems.map((item, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-start gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            {item.question}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed pl-7">{item.answer}</p>
        </div>
      ))}
    </div>
  </Section>
);

// --- MAIN PAGE COMPONENT ---

const WhatIsClinicManagementSoftware = () => {
  return (
    <div className="bg-white dark:bg-gray-900">
      <Script
        id="faq-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="article-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <HeroSection />
      <ThirtySecondExplanation />
      <CoreModulesSection />
      <SelfAssessmentSection />
      <SoftwareTypesSection />
      <PricingSection />
      <CommonFearsSection />
      <GettingStartedSection />
      <FAQSection />
      <SignupCTA
        heading="15 Years on Paper. See What Software Can Actually Do."
        description="An honest, no-jargon walkthrough of what clinic software changes in your daily workflow. Chat with us on WhatsApp — ask anything."
      />

      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: APP_URL },
          { name: 'What is Clinic Management Software', url: `${APP_URL}/what-is-clinic-management-software` },
        ]}
      />
    </div>
  );
};

export default WhatIsClinicManagementSoftware;
