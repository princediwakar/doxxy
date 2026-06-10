// Path: app/(public)/india-clinic-digitization-guide/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import {
  CheckCircle,
  ArrowRight,
  Building2,
  Shield,
  Smartphone,
  FileText,
  CreditCard,
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  Zap,
  Search,
  BarChart3,
  Calendar,
  ChevronRight,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import SignupCTA from '@/components/SignupCTA';
import BreadcrumbJsonLd from '@/components/SEO/BreadcrumbJsonLd';
import { APP_URL } from '@/lib/constants';
import { Section, SectionTitle, SectionSubtitle } from '@/components/ui/section-headers';

export const metadata: Metadata = {
  title: 'India Clinic Digitization Guide 2026 — The Complete Roadmap for Doctors',
  description:
    'The definitive guide to digitizing your clinic in India. Covers ABDM compliance, software selection, patient records, WhatsApp integration, costs, and government schemes. Updated June 2026.',
  alternates: {
    canonical: '/india-clinic-digitization-guide',
  },
  openGraph: {
    type: 'website',
    title: 'India Clinic Digitization Guide 2026 — The Complete Roadmap for Doctors',
    description:
      'The definitive guide to digitizing your clinic in India. Covers ABDM compliance, software selection, patient records, WhatsApp integration, costs, and government schemes.',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'India Clinic Digitization Guide 2026' }],
  },
  keywords: [
    'clinic digitization India',
    'digital clinic setup guide India',
    'healthcare digital transformation India',
    'how to digitize clinic',
    'ABDM compliance clinic',
    'paperless clinic India',
    'digital India healthcare',
  ],
};

// --- DATA ---

const fivePillars = [
  {
    icon: FileText,
    title: 'Digital Patient Records (EMR)',
    description:
      'Patient history, visit notes, prescriptions, lab reports — all searchable, never lost. One-click access to any patient\'s complete medical history during consultation.',
    replaces: 'Paper files, filing cabinets, "Mrs. Sharma ka file kahan hai?"',
  },
  {
    icon: Calendar,
    title: 'Digital Appointments & Scheduling',
    description:
      'Online booking, automated WhatsApp reminders, queue management, and multi-doctor calendar sync. Patients book slots themselves. Staff stops playing phone-tag.',
    replaces: 'Paper diary, phone-tag for rescheduling, manual reminder calls.',
  },
  {
    icon: CreditCard,
    title: 'Digital Billing & Payments',
    description:
      'Auto-generated GST-compliant bills, UPI QR codes, insurance pre-auth processing, and end-of-day settlement reports. Every rupee tracked automatically.',
    replaces: 'Carbon-paper receipts, calculator billing, cash-counting at day end.',
  },
  {
    icon: Smartphone,
    title: 'Digital Patient Communication',
    description:
      'WhatsApp reminders, treatment plan sharing, lab report delivery, two-way chat. Patients get everything on the phone they already check 50 times a day.',
    replaces: 'Phone calls (45-60 min/day), printed reports that patients lose.',
  },
  {
    icon: Shield,
    title: 'Digital Compliance & Reporting',
    description:
      'ABDM/ABHA compliance, regulatory record-keeping, automated analytics, and audit-ready reports. Know your clinic\'s numbers without touching a calculator.',
    replaces: 'Manual registers, uncertainty about compliance, "I think we saw 300 patients this month."',
  },
];

const roadmapPhases = [
  {
    phase: 'Phase 1',
    title: 'Assess',
    timeframe: 'Week 1',
    icon: Search,
    steps: [
      'Count: How many active patient files do you have? How many patients per day?',
      'Identify: What is your biggest pain point? Lost files? No-shows? Billing errors? Too many phone calls?',
      'Audit: How many staff will use the software? What is their comfort with technology?',
      'Budget: What can you afford monthly? (Rs. 500 to Rs. 3,000 is the realistic range for most clinics.)',
      'Goal: Know exactly what you need before looking at software.',
    ],
  },
  {
    phase: 'Phase 2',
    title: 'Choose Software',
    timeframe: 'Week 2-3',
    icon: Zap,
    steps: [
      'Shortlist 3 options based on: WhatsApp integration, ABDM compliance, pricing, language support.',
      'Sign up for free trials of all 3. Do not skip this step.',
      'Test each with 5-10 real patients. Create appointments, write prescriptions, generate bills.',
      'Ask your receptionist which one they prefer. They will use it 10x more than you.',
      'Choose and subscribe monthly first. Do not commit to annual until you have used it for 3 months.',
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Prepare Data',
    timeframe: 'Week 3-4',
    icon: Database,
    steps: [
      'Export existing digital data: Excel patient lists, old software backups.',
      'For paper records: Digitize active patients first (visited in last 12 months). Old records can wait.',
      'Clean the data: Remove duplicate entries, fix phone numbers, standardize formats.',
      'Most software providers offer free data import assistance. Use it.',
    ],
  },
  {
    phase: 'Phase 4',
    title: 'Set Up & Train',
    timeframe: 'Week 4-5',
    icon: Users,
    steps: [
      'Software vendor helps with initial setup: clinic details, doctor profiles, fee structures.',
      'Import patient data into the system.',
      'Training sessions: 2-3 sessions of 2 hours each for receptionist and doctors.',
      'Configure templates: Prescription templates for common conditions, billing templates for common procedures.',
      'Set up WhatsApp automation: Reminder templates, treatment plan sharing workflow.',
    ],
  },
  {
    phase: 'Phase 5',
    title: 'Go Live — Parallel Run',
    timeframe: 'Week 5-6',
    icon: TrendingUp,
    steps: [
      'Run digital AND paper side by side for 1-2 weeks.',
      'Every patient gets entered in BOTH systems. This catches issues before you have fully committed.',
      'Staff builds confidence because paper is still there as backup.',
      'By week 2, most clinics naturally stop using paper because digital is faster.',
    ],
  },
  {
    phase: 'Phase 6',
    title: 'Optimize',
    timeframe: 'Week 6 onwards',
    icon: BarChart3,
    steps: [
      'Review analytics: Patient count, revenue, no-show rates, pending payments.',
      'Adjust templates based on real usage patterns.',
      'Enable advanced features: Online booking for patients, UPI payment links, automated follow-up reminders.',
      'Digitize old records gradually: 20-30 files per day during slow hours.',
      'After 3 months: Consider applying for ABDM/ABHA integration if you have not already.',
    ],
  },
];

const faqs = [
  {
    question: 'How long does full clinic digitization take?',
    answer:
      '4-6 weeks from decision to full digital operation. Phase 1-2 (assessment + software selection): 2-3 weeks. Phase 3-4 (data + setup): 1-2 weeks. Phase 5 (parallel run): 1-2 weeks. Phase 6 (optimization): ongoing. The key is starting — most clinics overthink and delay for months. The actual transition is faster than you expect.',
  },
  {
    question: 'Can I digitize my clinic if I do not have a computer?',
    answer:
      'Yes. Most modern clinic software works on smartphones and tablets. You can start with a Rs. 10,000 tablet and a Rs. 3,000 Bluetooth printer. A full computer setup is ideal but not required for day 1. Many doctors run their entire clinic from a 10-inch Android tablet.',
  },
  {
    question: 'What about clinics in rural areas with poor internet?',
    answer:
      'Look for software with offline capability — it stores data locally and syncs when internet is available. Also, 4G/5G coverage is expanding rapidly. Most tier-3 cities and many rural areas now have reliable mobile data. A Jio/Airtel 4G hotspot (Rs. 300-500/month) is sufficient for cloud-based clinic software.',
  },
  {
    question: 'Is digitization mandatory for all clinics?',
    answer:
      'Not yet legally mandatory, but ABDM is pushing in that direction. Insurance companies, government schemes, and patients are increasingly expecting digital interactions. Within 2-3 years, non-digitized clinics will face competitive and regulatory pressure. Starting now means you transition at your pace, not under a deadline.',
  },
  {
    question: 'What is the first step I should take today?',
    answer:
      'Sign up for a free trial of clinic software. Do not overthink it — add 5 patients, create 3 appointments, write 2 digital prescriptions. It takes 30 minutes and will teach you more than any guide or comparison page. Experience it, then decide. Most doctors who try it once never go back to paper.',
  },
];

const commonMistakes = [
  {
    title: 'Skipping the parallel run',
    cost: '1-3 days of chaos',
    description:
      'Going 100% digital on day 1 without paper backup. When something breaks (and it will), you have no fallback. Staff panics, patients wait, the paper register returns by evening. Always run parallel for 1-2 weeks.',
  },
  {
    title: 'Not involving staff in the decision',
    cost: 'Wasted subscription + reversion to paper',
    description:
      'The doctor chooses software. The receptionist hates it. Usage drops to 50%. Then 0%. The paper register comes back. Involve your receptionist from day 1 — they will use it 10x more than you. Their opinion matters more than yours for software selection.',
  },
  {
    title: 'Choosing the cheapest option',
    cost: 'Rs. 15,000-25,000/month in lost revenue',
    description:
      'Rs. 500/month software that crashes daily costs more in lost revenue than Rs. 2,000/month software that works reliably. Price is what you pay. Value is what you get. Do not optimize for the Rs. 1,500 difference — optimize for reliability, support, and features that actually save time.',
  },
  {
    title: 'Digitizing everything at once',
    cost: '6+ months of delay with zero improvement',
    description:
      'Trying to digitize 20 years of paper records before going live. By the time you finish, 6 months have passed and nothing has improved. Strategy: Digitize active patients first. Old records can be digitized gradually — 20-30 files per day during slow hours — over 3-6 months.',
  },
  {
    title: 'Ignoring internet reliability',
    cost: 'Software unusable for 3-4 hours/day',
    description:
      'Choosing cloud-only software when your clinic has unreliable internet. Result: Software is unusable every time the connection drops. Check your internet reliability over a full week before choosing between cloud and offline-capable software. If internet drops more than once a day, you need offline mode.',
  },
];

// --- PAGE SECTIONS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 mb-8">
      <Clock className="h-4 w-4" />
      Updated June 2026 · 3,000+ words · Free Guide
    </div>
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      The Complete Guide to Digitizing Your Clinic in India — 2026 Edition
    </h1>
    <SectionSubtitle>
      Everything you need to know about moving from paper to digital: ABDM, software, costs,
      government schemes, step-by-step roadmap, and the mistakes that cost clinics Rs. 50,000+.
    </SectionSubtitle>
    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
      <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600">
        <Link href="#roadmap">Jump to Roadmap <ChevronRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

const WhyDigitizeSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Why Digitization? Why Now?</SectionTitle>
    <SectionSubtitle className="mt-4">
      This is not a "someday" conversation. Three forces are making clinic digitization inevitable
      in India right now. Here is the data.
    </SectionSubtitle>

    {/* Stats Grid */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
      {[
        {
          icon: Users,
          stat: '1.4M+',
          label: 'Registered doctors in India. Over 70% practice in private clinics — most still on paper.',
        },
        {
          icon: FileText,
          stat: '80%+',
          label: 'Of small and mid-size clinics still use paper records as their primary system.',
        },
        {
          icon: Shield,
          stat: 'ABDM',
          label: 'Nationwide digital health coverage targeted. Clinics without digital records will be excluded.',
        },
        {
          icon: Smartphone,
          stat: '16B+',
          label: 'UPI transactions in 2025. Patients expect digital payments. Cash-only clinics lose patients.',
        },
        {
          icon: Zap,
          stat: '500M+',
          label: 'Indians use WhatsApp daily. Clinics not on WhatsApp are invisible to the primary communication channel.',
        },
        {
          icon: Building2,
          stat: 'Registration',
          label: 'ABHA ID adoption is being linked to insurance schemes and public health programs nationwide.',
        },
      ].map((item) => (
        <div
          key={item.label}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 text-center"
        >
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5 mx-auto">
            <item.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{item.stat}</div>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{item.label}</p>
        </div>
      ))}
    </div>

    {/* Three Forces */}
    <div className="mt-20">
      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
        The 3 Forces Making Digitization Inevitable
      </h3>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            icon: Shield,
            title: 'Government Mandate',
            description:
              'ABDM is not optional long-term. It will be linked to medical registration, insurance reimbursement, and public health reporting. Early adopters get compliance readiness and ABDM-linked patient discovery. Late adopters get regulatory pressure and rushed transitions.',
          },
          {
            icon: Users,
            title: 'Patient Expectations',
            description:
              'Post-COVID, post-UPI, post-WhatsApp — patients expect digital. They will choose the clinic that sends WhatsApp reminders and digital reports over the one that makes them wait on hold. Digital clinics are not competing on convenience; paper clinics are competing on obscurity.',
          },
          {
            icon: TrendingUp,
            title: 'Economic Reality',
            description:
              'Manual processes leak 5-8% of clinic revenue through billing errors, missed charges, and no-shows. The software that fixes this costs less than the leakage itself. Digitization is not an expense — it is a revenue-recovery investment with 20-30x ROI.',
          },
        ].map((force) => (
          <div
            key={force.title}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50"
          >
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
              <force.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{force.title}</h4>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{force.description}</p>
          </div>
        ))}
      </div>
    </div>
  </Section>
);

const FivePillarsSection = () => (
  <Section>
    <SectionTitle>What "Clinic Digitization" Actually Means</SectionTitle>
    <SectionSubtitle className="mt-4">
      Digitization is not one thing. It is five interconnected pillars. Each replaces a manual
      process that is currently costing you time, money, or patients.
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
      {fivePillars.map((pillar) => (
        <div
          key={pillar.title}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 flex flex-col"
        >
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <pillar.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{pillar.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow leading-relaxed">
            {pillar.description}
          </p>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-auto">
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-1">
              Replaces
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{pillar.replaces}</p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const ABDMSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Understanding ABDM — The Biggest Driver of Digitization</SectionTitle>
    <SectionSubtitle className="mt-4">
      Ayushman Bharat Digital Mission is the government's "UPI moment" for healthcare.
      Here is what every clinic owner needs to know.
    </SectionSubtitle>

    <div className="mt-16 space-y-12">
      {/* What ABDM Is */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-10 border border-gray-200/75 dark:border-gray-700/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What ABDM Is</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Ayushman Bharat Digital Mission is the government's initiative to create a national
              digital health ecosystem. Think of it as "UPI for healthcare." Every Indian gets an
              ABHA ID (a health account, like Aadhaar for health). Every doctor and clinic gets
              registered in the Healthcare Professionals Registry (HPR). Every health record —
              prescriptions, lab reports, discharge summaries — gets linked to the patient's ABHA
              with their consent. The goal: a seamless, interoperable health data layer for 1.4
              billion Indians.
            </p>
          </div>
        </div>
      </div>

      {/* What ABDM Requires */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            What ABDM Requires From Clinics
          </h3>
          <ul className="space-y-4">
            {[
              'ABHA ID creation for patients (like Aadhaar for health records).',
              'Digital health records that can be linked to ABHA with patient consent.',
              'ABDM-compliant prescription formats with standard drug codes and digital signatures.',
              'Registration in the Healthcare Professionals Registry (HPR).',
              'Eventually: mandatory digital record-keeping for insurance and public health reporting.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold text-blue-700 dark:text-blue-300 mt-0.5">
                  {i + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600" />
            Timeline & What It Means For You
          </h3>
          <div className="space-y-4">
            {[
              {
                period: 'Now',
                detail: 'ABDM is in active rollout. Several states have begun mandating ABDM compliance for empaneled clinics.',
              },
              {
                period: '2026-2027',
                detail: 'National mandate expected. Insurance companies will require digital records. Government schemes will require ABDM linkage.',
              },
              {
                period: 'Beyond',
                detail: 'ABDM becomes the backbone of Indian healthcare data. Clinics without ABDM integration are excluded from the digital health ecosystem.',
              },
            ].map((item) => (
              <div
                key={item.period}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200/75 dark:border-gray-700/50"
              >
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  {item.period}
                </span>
                <p className="mt-1 text-gray-600 dark:text-gray-300">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Software Handles It */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-200/50 dark:border-blue-800/50 text-center">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5 mx-auto">
          <Zap className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          Good News: The Software Handles It Automatically
        </h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          ABDM-compliant software (Doxxy, KiviHealth, HealthPlix) handles ABHA creation, record
          linking, and HPR registration automatically. You do not need to understand the technical
          architecture of ABDM. The software abstracts all of that. Your job: use the software.
          The software's job: ensure ABDM compliance.
        </p>
      </div>
    </div>
  </Section>
);

const RoadmapSection = () => (
  <Section id="roadmap">
    <SectionTitle>The Digitization Roadmap: 6 Phases to Go Paperless</SectionTitle>
    <SectionSubtitle className="mt-4">
      A proven, step-by-step plan that takes your clinic from paper to digital in 4-6 weeks.
      Each phase builds on the last. Do not skip phases.
    </SectionSubtitle>

    <div className="mt-16 space-y-8">
      {roadmapPhases.map((phase, index) => (
        <div
          key={phase.title}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-10 border border-gray-200/75 dark:border-gray-700/50 flex flex-col md:flex-row gap-8"
        >
          {/* Phase Badge */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2 w-full md:w-32">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">{index + 1}</span>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{phase.phase}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{phase.timeframe}</div>
            </div>
          </div>

          {/* Phase Content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <phase.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{phase.title}</h3>
            </div>
            <ul className="space-y-3">
              {phase.steps.map((step, si) => (
                <li key={si} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const CostsROISection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Costs & ROI: The Real Numbers</SectionTitle>
    <SectionSubtitle className="mt-4">
      Transparent estimates based on real Indian clinic data. No inflated numbers, no
      hand-waving. Here is what digitization actually costs and what it returns.
    </SectionSubtitle>

    <div className="mt-16 grid lg:grid-cols-2 gap-12">
      {/* Costs Table */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Digitization Costs
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[
              { item: 'Software subscription', cost: 'Rs. 999 - Rs. 2,999/month' },
              { item: 'Setup & onboarding', cost: 'Usually free (included)' },
              { item: 'Staff training', cost: 'Free (vendor-provided)' },
              {
                item: 'Data migration',
                cost: 'Free (digital data) to Rs. 5,000-15,000 (manual digitization of paper records)',
              },
              { item: 'Hardware (if needed)', cost: 'Rs. 25,000-40,000 for basic computer + printer' },
            ].map((row) => (
              <div key={row.item} className="flex justify-between items-center px-6 py-4">
                <span className="text-gray-700 dark:text-gray-300 font-medium">{row.item}</span>
                <span className="text-gray-900 dark:text-white font-semibold text-right ml-4">
                  {row.cost}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROI Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          The ROI Calculation
        </h3>
        <div className="space-y-5">
          {[
            {
              title: 'Reduced No-Shows (35% reduction)',
              calc: '30 patients/day × 20% no-show × Rs. 500 avg/patient = Rs. 3,000 lost/day. WhatsApp reminders cut this by 35% = Rs. 1,050 saved/day = Rs. 26,250/month.',
            },
            {
              title: 'Fewer Billing Errors (5-8% leakage fixed)',
              calc: 'Rs. 3L monthly revenue × 6% billing leakage = Rs. 15,000-24,000/month recovered.',
            },
            {
              title: 'Staff Time Saved',
              calc: '45-60 minutes saved daily on phone calls = 15-20 hours/month of staff time freed for patient care.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50"
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{item.calc}</p>
            </div>
          ))}

          {/* Bottom Line */}
          <div className="bg-blue-600 rounded-xl p-6 text-white">
            <h4 className="font-semibold text-lg mb-2">Bottom Line</h4>
            <p className="text-blue-100 leading-relaxed">
              A Rs. 1,500/month software investment typically returns Rs. 30,000-50,000/month in
              recovered revenue and saved time. That is a <strong>20-30x ROI</strong>. Digitization
              pays for itself in the first week.
            </p>
          </div>
        </div>
      </div>
    </div>
  </Section>
);

const GovernmentSchemesSection = () => (
  <Section>
    <SectionTitle>Government Schemes & Financial Incentives</SectionTitle>
    <SectionSubtitle className="mt-4">
      The government is actively incentivizing healthcare digitization. Do not leave money
      on the table. Here is what is available.
    </SectionSubtitle>

    <div className="grid md:grid-cols-2 gap-8 mt-16">
      {[
        {
          icon: Building2,
          title: 'ABDM Early Adopter Incentives',
          description:
            'Several state health departments offer financial incentives for clinics that adopt ABDM-compliant systems early. Check your state\'s health department portal for current schemes. Amounts vary by state (typically Rs. 5,000-25,000) and are disbursed after verification of ABDM compliance.',
        },
        {
          icon: TrendingUp,
          title: 'Digital India MSME Schemes',
          description:
            'Clinics registered as MSMEs can access digital transformation subsidies. The government offers up to 50% subsidy on digital infrastructure — including computers, software, and internet connectivity — for registered MSMEs. Register on the Udyam portal if you have not already.',
        },
        {
          icon: CreditCard,
          title: 'GST Input Credit',
          description:
            'If your clinic is GST-registered, software subscriptions qualify for GST input tax credit. This effectively reduces your software cost by 18%. Track your software invoices and claim input credit in your monthly GST return (GSTR-3B).',
        },
        {
          icon: FileText,
          title: 'Income Tax Deduction',
          description:
            'Software subscriptions, computer hardware, printers, and internet costs are fully deductible business expenses under Section 37(1) of the Income Tax Act. These reduce your taxable income directly. Maintain proper invoices for audit purposes.',
        },
      ].map((scheme) => (
        <div
          key={scheme.title}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50"
        >
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <scheme.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{scheme.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{scheme.description}</p>
        </div>
      ))}
    </div>
  </Section>
);

const MistakesSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>5 Mistakes That Cost Clinics Rs. 50,000+</SectionTitle>
    <SectionSubtitle className="mt-4">
      Learn from clinics that digitized the wrong way. Each of these mistakes is avoidable
      with a little planning. The cost estimates are real.
    </SectionSubtitle>

    <div className="mt-16 space-y-6">
      {commonMistakes.map((mistake, index) => (
        <div
          key={mistake.title}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-200/75 dark:border-gray-700/50 flex flex-col md:flex-row gap-6"
        >
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                Mistake {index + 1}
              </span>
              <span className="hidden sm:block text-gray-300 dark:text-gray-600">·</span>
              <span className="text-sm font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full inline-block w-fit">
                Cost: {mistake.cost}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {mistake.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{mistake.description}</p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const FutureSection = () => (
  <Section>
    <SectionTitle>The Future of Indian Clinics: 2026-2030</SectionTitle>
    <SectionSubtitle className="mt-4">
      Where Indian healthcare is heading. This is the vision that guides everything we build at
      Doxxy. The future is closer than most doctors think.
    </SectionSubtitle>

    <div className="mt-16 space-y-8">
      {[
        {
          year: '2026-2027',
          title: 'ABDM Becomes Standard',
          description:
            'ABDM adoption reaches critical mass. Clinics without digital records are excluded from insurance networks and government empanelment. ABHA ID becomes as common as Aadhaar. Digital prescriptions become the norm, not the exception. Clinics that adopted early operate smoothly. Late adopters scramble.',
        },
        {
          year: '2027-2028',
          title: 'AI-Assisted Diagnosis Enters the Clinic',
          description:
            'AI-powered clinical decision support becomes available in mainstream clinic software. Not replacing doctors — suggesting differential diagnoses, checking drug interactions, flagging guideline deviations, and surfacing relevant research during consultation. Think of it as a junior resident who has read every medical textbook ever published, sitting beside you silently and speaking up only when something matters.',
        },
        {
          year: '2028-2029',
          title: 'The Interoperable Health Ecosystem',
          description:
            'Clinics, labs, pharmacies, and hospitals are connected via the ABDM network. A patient\'s entire health record — every prescription, every lab report, every discharge summary — is accessible with consent across providers. No more "bring your old reports." No more duplicate tests. The health system finally talks to itself.',
        },
        {
          year: '2029-2030',
          title: 'Voice-to-EMR Goes Mainstream',
          description:
            'Doctors dictate notes in Hindi, Marathi, Tamil, Bengali, English — whatever language they think in. Software transcribes and structures the notes automatically into structured EMR entries. Doxxy already has voice dictation built in. This is not science fiction. This is the direction we are building toward, and it will be standard within 5 years.',
        },
      ].map((item) => (
        <div
          key={item.year}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-10 border border-gray-200/75 dark:border-gray-700/50 flex flex-col md:flex-row gap-8"
        >
          <div className="flex-shrink-0">
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg whitespace-nowrap">
              {item.year}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{item.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const FAQSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Frequently Asked Questions</SectionTitle>
    <SectionSubtitle className="mt-4">
      The questions every doctor asks before starting their digitization journey. Short,
      direct answers. No marketing speak.
    </SectionSubtitle>

    <div className="max-w-3xl mx-auto mt-16 space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-200/75 dark:border-gray-700/50"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-3">
            <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">Q:</span>
            {faq.question}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed pl-9">{faq.answer}</p>
        </div>
      ))}
    </div>
  </Section>
);

const InternalLinkHubSection = () => (
  <Section>
    <SectionTitle>Explore Our Complete Guides</SectionTitle>
    <SectionSubtitle className="mt-4">
      This guide is part of a comprehensive resource library for Indian clinic owners.
      Dive deeper into specific topics.
    </SectionSubtitle>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
      {[
        {
          title: 'Best Clinic Software India',
          description:
            'See how Doxxy compares to other software. Detailed feature comparison, pricing breakdown, and honest pros and cons.',
          href: '/best-clinic-management-software-india',
        },
        {
          title: 'How to Choose Clinic Software',
          description:
            'The 10-question buyer\'s checklist. Ask these before talking to any software vendor. Save yourself months of regret.',
          href: '/how-to-choose-clinic-software',
        },
        {
          title: 'What Is Clinic Management Software',
          description:
            'Understand the basics. What it does, who needs it, and how it transforms a clinic from day 1.',
          href: '/what-is-clinic-management-software',
        },
        {
          title: 'ABDM Compliance Guide',
          description:
            'Everything about ABDM: ABHA IDs, HPR registration, compliance requirements, and how software handles it automatically.',
          href: '/abdm-compliance-clinic',
        },
        {
          title: 'Clinic Software ROI Calculator',
          description:
            'Calculate your clinic\'s digitization ROI in 2 minutes. Enter your numbers and see exactly how much you save.',
          href: '/tools/clinic-roi-calculator',
        },
      ].map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
            {link.title}
            <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{link.description}</p>
        </Link>
      ))}
    </div>

    {/* Final CTA */}
    <div className="mt-16 text-center">
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
        Ready to start your digitization journey? Do not overthink it. Try it for 30 minutes.
      </p>
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        No credit card required · Free setup · Cancel anytime
      </p>
    </div>
  </Section>
);

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.answer,
    },
  })),
};

// --- MAIN PAGE COMPONENT ---

const ArticleStructuredData = () => {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'India Clinic Digitization Guide 2026 — The Complete Roadmap for Doctors',
    description:
      'The definitive guide to digitizing your clinic in India. Covers ABDM compliance, software selection, patient records, WhatsApp integration, costs, and government schemes.',
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
      '@id': `${APP_URL}/india-clinic-digitization-guide`,
    },
  };

  return (
    <Script
      id="article-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
    />
  );
};

const IndiaClinicDigitizationGuide = () => {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />

      {/* TL;DR — "In 30 Seconds" for LLM extractability */}
      <Section className="!py-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-blue-100 dark:border-blue-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">In 30 Seconds</span>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
              <span className="text-blue-500 font-bold mt-0.5">1.</span>
              <span><strong>This is the complete roadmap for digitizing your Indian clinic</strong> — from paper records to a fully digital practice. Covers every step: EMR, appointments, billing, prescriptions, and ABDM compliance.</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
              <span className="text-blue-500 font-bold mt-0.5">2.</span>
              <span><strong>ABDM (Ayushman Bharat Digital Mission) is the biggest driver.</strong> Government incentives, ABHA ID linking, and digital health records are becoming mandatory — this guide explains what you need to do and when.</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
              <span className="text-blue-500 font-bold mt-0.5">3.</span>
              <span><strong>You don&apos;t need to go all-digital on day one.</strong> The 6-phase roadmap lets you digitize progressively, starting with patient records and appointments, then adding billing, prescriptions, and compliance.</span>
            </li>
          </ul>
        </div>
      </Section>

      <WhyDigitizeSection />
      <FivePillarsSection />
      <ABDMSection />
      <RoadmapSection />
      <CostsROISection />
      <GovernmentSchemesSection />
      <MistakesSection />
      <FutureSection />
      <FAQSection />
      <InternalLinkHubSection />
      <SignupCTA
        heading="The Definitive Guide to Clinic Digitization in India"
        description="Everything you need to know about going digital — in one place. Have specific questions? Chat with us on WhatsApp. We'll answer honestly."
      />

      <ArticleStructuredData />

      <Script
        id="faq-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: APP_URL },
          { name: 'India Clinic Digitization Guide', url: `${APP_URL}/india-clinic-digitization-guide` },
        ]}
      />
    </div>
  );
};

export default IndiaClinicDigitizationGuide;
