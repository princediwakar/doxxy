// Path: app/(public)/clinic-queue-management/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Search,
  BarChart3,
  Zap,
  Timer,
  TrendingUp,
  Smartphone,
  Users,
  XCircle,
  Target,
  Shield,
} from 'lucide-react';
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";

export const metadata: Metadata = {
  title: 'Clinic Queue Management System — Reduce Patient Wait Time by 70% | Doxxy',
  description: 'Doxxy\'s OPD queue management system cuts patient wait times from 90 minutes to under 25. Digital tokens, WhatsApp live queue tracking, and smart analytics for Indian clinics.',
  alternates: { canonical: '/clinic-queue-management' },
  openGraph: {
    title: 'Clinic Queue Management System — Reduce Patient Wait Time by 70% | Doxxy',
    description: 'Digital token system with WhatsApp-based live queue tracking. Patients wait at home, not in your waiting room. Built for Indian OPDs.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy Clinic Queue Management' }],
  },
  keywords: [
    'clinic queue management system',
    'OPD queue management India',
    'reduce patient wait time clinic',
    'digital token system clinic',
    'WhatsApp queue tracking clinic',
    'patient wait time solution India',
  ],
};

// --- DATA ---

const problemScenarios = [
  {
    location: 'Mumbai, 9:15 AM',
    description: 'Dr. Sharma\'s OPD opens at 9. By 9:15, 47 patients are seated. Token 12 is at the door. Token 38 is asking the receptionist "kitna time lagega?" for the third time. Token 5 just left without being seen.',
  },
  {
    location: 'Delhi, 11:30 AM',
    description: 'The receptionist is shouting token numbers over the noise of a packed waiting room. Three patients missed their token because they stepped out for chai. Two elderly patients have been sitting for 2 hours. The doctor is seeing patients faster than usual — and missing things.',
  },
  {
    location: 'Bangalore, 6:00 PM',
    description: 'End of OPD. Receptionist is manually tallying the day\'s count on a notepad. 12 patients left without being seen. No record of who they were. Revenue lost. Follow-ups missed. The same chaos repeats tomorrow.',
  },
];

const statCards = [
  { icon: Clock, value: '45-90 min', label: 'Average Wait in Indian OPDs', detail: 'Studies across tertiary and primary care OPDs in India consistently report wait times between 45 and 90 minutes for a consultation that lasts 5-8 minutes.' },
  { icon: XCircle, value: '30%', label: 'Patients Leave Without Being Seen', detail: 'Nearly one in three patients walks out due to excessive wait times. That is not just lost revenue — it is a patient who may never return to your clinic.' },
  { icon: TrendingUp, value: '₹25,000/month', label: 'Lost Revenue from Walkouts', detail: 'At an average consultation fee of ₹500, losing just 2 patients a day across 25 working days means ₹25,000 in direct lost revenue — not counting lost pharmacy and lab referrals.' },
  { icon: Timer, value: '70%', label: 'Reduction in Perceived Wait Time', detail: 'When patients can track their queue position from home and arrive just before their turn, perceived wait time drops by up to 70%. Patient satisfaction scores in clinics using digital queue systems improve dramatically.' },
];

const solutionFeatures = [
  {
    icon: Zap,
    title: 'Digital Token System',
    description: 'Replace paper chits and shouting with a clean, silent digital queue.',
    bullets: [
      'Patients get a digital token at check-in — no paper slips, no lost tokens',
      'Large display screen in the waiting area shows current token number and estimated wait',
      'Multi-doctor support: each doctor has their own queue, displayed clearly',
      'Tokens cannot be skipped, duplicated, or lost. Every patient is accounted for',
      'Works offline-adjacent: even if the internet drops, the local queue keeps running',
    ],
  },
  {
    icon: Smartphone,
    title: 'WhatsApp Live Queue Tracking',
    description: 'Patients scan a QR code once. They never have to ask "how much longer" again.',
    bullets: [
      'Patient scans a QR code at reception — instantly sees their position in the queue on their phone',
      'Live updating: queue position refreshes automatically as the doctor sees patients',
      'Smart notification: WhatsApp alert sent when the patient is 3 tokens away from being called',
      'Patients can step out, grab chai, run an errand — and return exactly when needed',
      'Reduces waiting room crowding by up to 60%. Your receptionist stops being a human token display',
    ],
  },
  {
    icon: BarChart3,
    title: 'Smart Queue Analytics',
    description: 'Data that tells you where the bottleneck actually is — not where you think it is.',
    bullets: [
      'Average wait time per doctor, per day, per time slot — identify which doctor needs a faster workflow',
      'Peak hour heatmaps: see exactly which hours create the worst congestion',
      'Patient dropout tracking: know who left, when they left, and after how long of waiting',
      'Consultation duration distribution: too many 2-minute consults? Too many 20-minute consults?',
      'Weekly trend reports delivered to your dashboard. Fix the system, not the symptoms',
    ],
  },
];

const workflowSteps = [
  {
    step: 1,
    title: 'Patient Arrives or Checks In Online',
    description: 'Patient walks in or books via the Doxxy patient app. At reception, they provide their phone number or scan a QR code. A digital token is generated instantly. No writing, no paper, no searching for a pen.',
  },
  {
    step: 2,
    title: 'Digital Token with Estimated Wait',
    description: 'The system calculates estimated wait based on current queue length and historical consultation duration for that doctor. Patient sees: "Token B-17. Estimated wait: 35 minutes. 14 patients ahead of you."',
  },
  {
    step: 3,
    title: 'WhatsApp Notification Before Turn',
    description: 'When the patient is 3 tokens away, Doxxy sends an automated WhatsApp message: "Dr. Sharma is almost ready for you. Please return to the waiting area. Your token: B-17." Patient returns. No shouting. No missed turns.',
  },
  {
    step: 4,
    title: 'Doctor Calls Patient In',
    description: 'Doctor clicks "Next Patient" on their Doxxy dashboard. The display screen updates. The patient\'s token is called. Consultation begins. The next patient\'s countdown starts automatically. Simple. Silent. Efficient.',
  },
];

const beforeAfterRows = [
  {
    area: 'Token System',
    before: 'Paper chits handed out manually. Tokens get lost, duplicated, or skipped. Receptionist spends 30% of their day managing tokens.',
    after: 'Digital tokens auto-assigned at check-in. Unique, trackable, never lost. Receptionist focuses on patient care, not paper management.',
  },
  {
    area: 'Wait Time Visibility',
    before: 'Patients crowd the reception desk asking "kitna time lagega?" every 10 minutes. Receptionist has no real answer. Tension builds.',
    after: 'Patients see their exact queue position on their phone. Waiting room display shows current token. Zero ambiguity. Zero questions.',
  },
  {
    area: 'Patient Anxiety',
    before: 'Patients sit anxiously, afraid to step out even for water, worried they will miss their name being called. 2-hour waits feel like 4 hours.',
    after: 'Patients relax at home or nearby. WhatsApp alert tells them when to return. Wait feels like 20 minutes because they are not physically trapped in the waiting room.',
  },
  {
    area: 'Walk-Out Rate',
    before: '30% of patients leave without being seen. No record of who left. No follow-up. Revenue and trust lost permanently.',
    after: 'Walk-out rate drops below 5%. System records every dropout. Clinic can send a follow-up WhatsApp: "We noticed you had to leave. Would you like to rebook?"',
  },
  {
    area: 'Staff Workload',
    before: 'Receptionist spends 3-4 hours daily on token management: writing, distributing, calling out numbers, handling complaints, managing the crowd.',
    after: 'Receptionist spends under 30 minutes on queue-related tasks. Token management is fully automated. Staff is redeployed to patient care, billing, and follow-ups.',
  },
  {
    area: 'Peak Hour Management',
    before: '9-11 AM is pure chaos. 60 patients, 2 hours, 1 doctor. No system to stagger arrivals. Waiting room overflows into the corridor.',
    after: 'Patients see estimated wait times before arriving and can choose less crowded slots. Queue analytics help the clinic stagger appointment slots intelligently.',
  },
  {
    area: 'Doctor Idle Time',
    before: 'Doctor wastes 15-20% of their OPD time waiting for the next patient to be fetched, settled in, or located. Cumulative idle time costs more than you think.',
    after: 'Doctor dashboard shows the next patient is ready and waiting. One click to call them in. Zero idle time. More patients seen per OPD hour.',
  },
  {
    area: 'Patient Complaints',
    before: 'The #1 complaint in Indian clinic Google reviews: "too much waiting time." It damages your clinic\'s reputation more than any other factor.',
    after: 'Patients rate their experience 4+ stars. Wait time is transparent. The clinic feels organized and professional. Word-of-mouth referrals increase.',
  },
];

const faqs = [
  {
    question: 'How does the digital token system work?',
    answer: 'When a patient arrives at your clinic, the receptionist enters their phone number into Doxxy or the patient scans a QR code at the reception desk. The system instantly generates a unique digital token (e.g., "A-23") and assigns the patient to the appropriate doctor\'s queue. The token appears on the waiting area display screen and is linked to the patient\'s phone number for WhatsApp tracking. The doctor sees their queue on their Doxxy dashboard and calls the next patient with a single click. The entire workflow replaces the paper-chit-and-shouting system that most Indian clinics still rely on.',
  },
  {
    question: 'Can patients see their queue position on their phone?',
    answer: 'Yes. After check-in, patients scan a QR code displayed at the reception desk. This opens a progressive web app link on their phone — no app download required. The link shows their exact queue position, the number of patients ahead of them, and an estimated wait time. This information updates in real time. Patients do not need to install any app, and the QR code works on any smartphone, including basic Android phones commonly used across India. For patients without smartphones, the waiting area display screen serves the same purpose.',
  },
  {
    question: 'What happens if a patient misses their turn?',
    answer: 'Doxxy handles missed turns gracefully. If a patient does not respond when their token is called (within a configurable grace period, typically 2-3 minutes), the system marks them as "missed" and automatically moves to the next patient. The missed patient\'s token is not cancelled — it is placed in a "hold" state. When the patient returns, the receptionist can reinsert them into the queue at the current position + 2 (so they do not jump ahead unfairly but do not go to the back of the line either). The system also tracks missed-turn patterns so you can identify systemic issues — like a particular time slot where patients consistently miss their turns because they are stepping out for lunch.',
  },
  {
    question: 'Does this work for multiple doctors?',
    answer: 'Absolutely. Doxxy\'s queue management is built from the ground up for multi-doctor clinics. Each doctor has their own independent queue, with its own display, token series (e.g., Dr. A gets A-1, A-2; Dr. B gets B-1, B-2), and estimated wait time. Patients are assigned to a specific doctor at check-in. The waiting area display can show all active queues simultaneously, or cycle through them. For clinics with rotating OPDs (different doctors on different days), the system automatically adjusts. Multi-specialty clinics in cities like Mumbai, Delhi, and Chennai use this to manage 5+ doctors running parallel OPDs without confusion.',
  },
  {
    question: 'Can I still prioritize emergency cases?',
    answer: 'Yes. Doxxy includes a "Priority" toggle that allows you to fast-track emergency cases, elderly patients, or patients with special needs. The receptionist or doctor can mark any token as priority with one click, which moves that patient to the front of the queue (or next in line, depending on your clinic\'s protocol). The system logs every priority override for audit purposes. You can also configure automatic priority rules — for example, patients above 75 years of age, or patients presenting with chest pain, can be flagged for priority queue placement automatically. This ensures clinical urgency never takes a backseat to administrative convenience.',
  },
];

// --- PAGE SECTIONS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      Your Waiting Room Shouldn't Feel Like a Railway Station at Rush Hour.
    </h1>
    <SectionSubtitle>
      Indian OPDs average 45-90 minute wait times. Doxxy's digital queue cuts that by 70% — and lets patients track their position from home. No shouting. No crowding. No walkouts.
    </SectionSubtitle>
    <div className="mt-10">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Start Free Practice <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

const ProblemSection = () => (
  <Section>
    <SectionTitle>The Daily Chaos of an Indian Clinic Waiting Room.</SectionTitle>
    <SectionSubtitle className="mt-4">
      If you have run an OPD in India for more than a week, you have lived every one of these scenarios.
    </SectionSubtitle>

    <div className="mt-12 max-w-4xl mx-auto space-y-8">
      <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
        Walk into any busy clinic in Pune, Lucknow, or Ahmedabad at 10 AM on a Monday. The waiting room is packed — 40, 50, sometimes 70 patients. Some have been there since 8 AM. The receptionist is surrounded by three people asking the same question in different languages: "Mera number kab aayega?" Others are peering through the doctor's door, trying to gauge how many patients are inside. A child is crying. Someone's phone is playing a YouTube video at full volume. The doctor is rushing — not because the cases are simple, but because there are 38 more patients to see before lunch.
      </p>

      <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
        This is not an exaggeration. This is Tuesday. And it costs your clinic more than you realize — in lost patients, lost revenue, burned-out staff, and a reputation that silently erodes with every 90-minute wait.
      </p>

      <div className="space-y-5 mt-8">
        {problemScenarios.map((scenario) => (
          <div key={scenario.location} className="bg-red-50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 rounded-xl p-6">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">{scenario.location}</p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{scenario.description}</p>
          </div>
        ))}
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mt-8">
        The root cause is not a bad doctor or lazy staff. It is a queue management system that has not changed since 1985 — paper tokens, shouting, and hope. In an era where your patients order dinner on Zomato and track their Uber on a map, they are being asked to sit in a plastic chair for two hours with no information and no dignity. That gap is the problem Doxxy solves.
      </p>
    </div>
  </Section>
);

const MathSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>The Numbers Don't Lie.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Walkouts aren't just annoying — they're expensive. Here is what poor queue management actually costs your clinic.
    </SectionSubtitle>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
      {statCards.map((stat) => (
        <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
            <stat.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{stat.value}</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{stat.label}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{stat.detail}</p>
        </div>
      ))}
    </div>
  </Section>
);

const SolutionSection = () => (
  <Section>
    <SectionTitle>The Doxxy Queue System.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Three integrated capabilities that turn your waiting room from a liability into a competitive advantage.
    </SectionSubtitle>

    <div className="grid lg:grid-cols-3 gap-8 mt-16">
      {solutionFeatures.map((feature) => (
        <div key={feature.title} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 flex flex-col">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <feature.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 flex-grow">{feature.description}</p>
          <ul className="space-y-3 text-sm border-t border-gray-100 dark:border-gray-700 pt-4">
            {feature.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </Section>
);

const WorkflowSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>How It Works. In 4 Silent Steps.</SectionTitle>
    <SectionSubtitle className="mt-4">
      From check-in to consultation. No shouting. No confusion. Just a smooth, predictable flow.
    </SectionSubtitle>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
      {workflowSteps.map((step) => (
        <div key={step.step} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 relative">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mb-4">
            {step.step}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{step.title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{step.description}</p>
        </div>
      ))}
    </div>
  </Section>
);

const BeforeAfterSection = () => (
  <Section>
    <SectionTitle>Before Doxxy vs. After Doxxy.</SectionTitle>
    <SectionSubtitle className="mt-4">
      The difference is not incremental. It is transformational. Every area of your clinic operations changes.
    </SectionSubtitle>

    <div className="max-w-5xl mx-auto mt-16 space-y-4">
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
);

const FaqSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Questions Clinic Owners Ask.</SectionTitle>
    <div className="max-w-3xl mx-auto mt-16 space-y-8">
      {faqs.map((faq) => (
        <div key={faq.question} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            {faq.question}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">{faq.answer}</p>
        </div>
      ))}
    </div>
  </Section>
);

const RelatedFeaturesSection = () => (
  <Section>
    <SectionTitle>Explore More Doxxy Features.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Queue management is just one piece of running a modern clinic. See what else Doxxy can do for your practice.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 grid md:grid-cols-2 gap-6">
      <Link href="/clinic-analytics-dashboard" className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          Clinic Analytics Dashboard
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Track revenue, patient retention, no-show rates, and doctor performance in real time. Turn gut feelings into data-driven decisions.
        </p>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 mt-3 group-hover:gap-2 transition-all">
          Learn more <ArrowRight className="h-3 w-3" />
        </span>
      </Link>
      <Link href="/features" className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          All Doxxy Features
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Smart appointments, digital prescriptions, billing, patient records, and more. Everything your clinic needs in one place.
        </p>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 mt-3 group-hover:gap-2 transition-all">
          Explore features <ArrowRight className="h-3 w-3" />
        </span>
      </Link>
    </div>
  </Section>
);

const FinalCTASection = () => (
  <Section className="text-center">
    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
      Your Patients Deserve Better Than a Plastic Chair and a 90-Minute Wait.
    </h2>
    <SectionSubtitle>
      Join clinics across India that have cut wait times, reduced walkouts, and built a reputation for respecting their patients' time. Start with your first 100 appointments free.
    </SectionSubtitle>
    <div className="mt-10">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Get Started for Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

// --- MAIN PAGE COMPONENT ---

export default function ClinicQueueManagement() {
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
      <HeroSection />
      <ProblemSection />
      <MathSection />
      <SolutionSection />
      <WorkflowSection />
      <BeforeAfterSection />
      <FaqSection />
      <RelatedFeaturesSection />
      <FinalCTASection />
      <SignupCTA
        heading="90-Minute Waits → 25 Minutes. See How."
        description="WhatsApp-based live queue tracking. Patients wait at home, not in your waiting room. A quick demo on how it works for your OPD."
      />

      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: APP_URL },
          { name: 'Clinic Queue Management', url: `${APP_URL}/clinic-queue-management` },
        ]}
      />
      <Script
        id="queue-faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </div>
  );
}
