// Path: app/(public)/multi-location-clinic-software/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Building2,
  MapPin,
  BarChart3,
  Receipt,
  Users,
  Globe,
  ArrowLeftRight,
  Shield,
  Clock,
  TrendingUp,
  DollarSign,
  FileText,
} from 'lucide-react';
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";

const WHATSAPP_URL = "https://wa.me/917388890554?text=Hi%21%20I%27d%20like%20to%20know%20more%20about%20Doxxy%20for%20multiple%20clinic%20locations";

export const metadata: Metadata = {
  title: 'Multi-Location Clinic Management Software — 3 Clinics, 1 Dashboard | Doxxy',
  description: 'Running 2+ clinics without unified software costs ₹4-6 lakhs/year in admin waste. Doxxy gives you centralized patient records, consolidated billing, location-wise analytics. Built for Indian clinic chains.',
  alternates: { canonical: '/multi-location-clinic-software' },
  openGraph: {
    title: 'Multi-Location Clinic Management Software — 3 Clinics, 1 Dashboard | Doxxy',
    description: 'Centralized patient records, consolidated billing, location-wise analytics for Indian clinic chains. One dashboard for all your locations. Role-based staff access per clinic.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy Multi-Location Clinic Software' }],
  },
  keywords: [
    'multi clinic management software',
    'chain clinic software India',
    'multi location clinic management',
    'clinic chain management system',
    'multi branch clinic software',
    'centralized clinic management India',
  ],
};

// --- DATA ---

const problemScenarios = [
  {
    title: 'The Daily Cross-Location Shuffle',
    description: 'You own three clinics across Hyderabad — Banjara Hills, Kukatpally, and Gachibowli. Every evening, your phone buzzes with 15-20 messages: "Sir, Kukatpally collections today ₹8,400." "Sir, Banjara patient asking for Gachibowli appointment." "Sir, stock of Azithromycin finished at Kukatpally, can we transfer from Banjara?" You are not running a clinic chain. You are running a WhatsApp group with real estate.',
  },
  {
    title: 'The Patient Who Exists in Two Worlds',
    description: 'Mrs. Lakshmi visited your Banjara Hills clinic for a dermatology consult last month. This week, she walks into your Kukatpally clinic for a follow-up. The receptionist at Kukatpally has zero record of her. Mrs. Lakshmi fills the same registration form again. The doctor prescribes without knowing the previous diagnosis. This is not patient care. This is patient rediscovery — repeated at every visit, at every branch. Mrs. Lakshmi quietly switches to a single-location competitor who "seems more organized."',
  },
  {
    title: 'The Revenue Reconciliation Marathon',
    description: 'It is the 5th of the month. Your accountant sits with three separate Excel files — one from each clinic. Each file has its own format. Each receptionist records things differently. "Consultation" in Banjara Hills is "OPD Visit" in Kukatpally. By the 12th, the accountant has merged everything into one sheet. By the 15th, you finally know last month\'s revenue. By then, half of this month has already passed. You are making decisions on 45-day-old data while your competitors adjust weekly.',
  },
];

const costCards = [
  { icon: Clock, value: '2+ hrs/day', label: 'Lost to Cross-Location Coordination', detail: 'Calling receptionists. Checking WhatsApp groups. Answering "Sir, patient from X wants appointment at Y." For a 3-clinic chain, owners spend over 2 hours daily on coordination that a unified system eliminates entirely.' },
  { icon: DollarSign, value: '₹4-6 lakhs/year', label: 'Cost of Fragmentation', detail: 'Between staff time spent on manual reconciliation, missed cross-selling across locations, revenue leakage from inconsistent billing, and patient churn from poor cross-location experience — fragmentation costs a 3-clinic chain ₹4-6 lakhs annually. That is the salary of a full-time clinic manager you could hire instead.' },
  { icon: TrendingUp, value: '35%', label: 'Cross-Location Revenue Left on the Table', detail: 'When Clinic A does not know Clinic B offers dermatology, or when a patient at Kukatpally is never told about the physiotherapy unit at Banjara Hills, you bleed referral revenue. Chains with unified systems report 35% higher cross-location patient referrals.' },
  { icon: Users, value: '1 in 4', label: 'Patients Drop Off Between Branches', detail: 'When a patient has to re-register, re-explain their history, and re-do paperwork at a new branch, 25% simply do not show up for cross-location appointments. They choose convenience over loyalty. A unified patient record removes this friction entirely.' },
];

const solutionFeatures = [
  {
    icon: Globe,
    title: 'Centralized Patient Database',
    description: 'One patient record. Every location. Instant access.',
    bullets: [
      'Patient registers at Location A — full EMR, history, prescriptions, allergies available at Location B, C, and D instantly',
      'Cross-location visit history: see every consultation across every branch in one chronological timeline',
      'No duplicate registrations. No lost records. No "sorry sir, aapne pehle kab consult kiya tha?"',
      'Patient walks into any branch — front desk pulls up their complete file in under 5 seconds',
      'Centralized document storage: lab reports, scans, prescriptions attached to the patient, not the location',
    ],
  },
  {
    icon: Shield,
    title: 'Role-Based Access Control',
    description: 'Your receptionist sees one clinic. You see everything.',
    bullets: [
      'Receptionist at Kukatpally sees only Kukatpally patients, appointments, and billing — by design',
      'Clinic manager can view their assigned locations only — no cross-contamination of sensitive financial data',
      'Owner/admin dashboard shows all locations aggregated: revenue, patients, staff performance, inventory',
      'Doctor access configurable: restrict to their OPD hours and location, or grant multi-location privileges',
      'Audit log tracks who accessed what, when — critical for multi-location accountability',
    ],
  },
  {
    icon: BarChart3,
    title: 'Location-Wise Analytics',
    description: 'Which branch is your profit engine? Which one is struggling? Know exactly.',
    bullets: [
      'Revenue per location: daily, weekly, monthly trends with automatic comparison across branches',
      'Patient volume by location: see which clinic is growing, which is plateauing, and which needs attention',
      'Per-doctor performance across locations: identify your best (and most expensive) consulting hours',
      'Service-wise profitability by location: is dermatology more profitable at Banjara Hills than Kukatpally?',
      'Capacity utilization: which locations have idle OPD hours? Which are overbooked and need expansion?',
    ],
  },
  {
    icon: Receipt,
    title: 'Consolidated Billing & Revenue',
    description: 'Every rupee, from every location, in one dashboard. No Excel merge required.',
    bullets: [
      'Real-time consolidated revenue dashboard: see collections across all locations as they happen',
      'Drill down by location, doctor, service type, and payment method (cash, UPI, card, insurance)',
      'GST-compliant billing with location-wise HSN/SAC codes — each clinic as a separate GST unit or consolidated',
      'Automatic revenue reconciliation: no more manual Excel merging across branches',
      'Month-end financial close that takes 30 minutes instead of 3 days — with auditable, timestamped records',
    ],
  },
  {
    icon: ArrowLeftRight,
    title: 'Cross-Location Inventory & Transfers',
    description: 'Medicine out of stock at one branch? Check the other and transfer.',
    bullets: [
      'Real-time inventory visibility across all locations — know stock levels without calling anyone',
      'Inter-branch stock transfer requests initiated and tracked within the system, not on WhatsApp',
      'Low-stock alerts configurable per location — because Gachibowli sells more dermatology products than Banjara Hills',
      'Centralized purchase orders with location-wise delivery tracking',
      'Expiry tracking across all branches — waste reduction through intelligent stock rotation',
    ],
  },
  {
    icon: FileText,
    title: 'Unified Reporting for Growth & Compliance',
    description: 'Investors, banks, and your CA need one set of books. Doxxy delivers that.',
    bullets: [
      'Consolidated P&L, balance sheet inputs, and cash flow across all locations — one-click export',
      'Location-wise P&L for internal performance reviews: which branch is actually profitable after rent and salaries?',
      'GST filing support: consolidated or location-wise returns based on your GST registration structure',
      'Investor-ready reports: patient volume growth, revenue trajectory, per-location unit economics',
      'Multi-location business valuation support: clean, auditable data when you are ready to raise or exit',
    ],
  },
];

const workflowSteps = [
  {
    step: 1,
    title: 'Patient Registers at Location A',
    description: 'Mrs. Lakshmi walks into your Banjara Hills clinic. Receptionist registers her in Doxxy — name, phone, age, chief complaint. A digital EMR is created. The system auto-detects if she has visited any other branch. This is her first visit ever. EMR is clean and ready.',
  },
  {
    step: 2,
    title: 'Patient Visits Location B Next Week',
    description: 'Mrs. Lakshmi is near Kukatpally this time. She walks into that branch. The receptionist enters her phone number. Instantly, her complete Banjara Hills record loads — registration details, doctor consultation notes, prescriptions, billing history. Zero re-registration. The receptionist simply checks her in for today\'s consultation.',
  },
  {
    step: 3,
    title: 'Doctor at Location B Sees Full History',
    description: 'Dr. Reddy at Kukatpally opens Mrs. Lakshmi\'s file. He sees her dermatology consult from Banjara Hills — the diagnosis, the prescribed creams, the lab results. He sees the treatment is working and prescribes a continuation. No guessing. No "madam, pehle kya hua tha?" He makes an informed clinical decision in under 3 minutes.',
  },
  {
    step: 4,
    title: 'Billing at Location B Flows to Central Dashboard',
    description: 'The consultation is completed. The bill is generated at Kukatpally. The revenue instantly appears on your central dashboard — tagged to Location B, Dr. Reddy, dermatology. Your evening report now shows: Banjara Hills: ₹14,200 (22 patients), Kukatpally: ₹9,800 (15 patients). Real-time. Accurate. No phone call needed.',
  },
  {
    step: 5,
    title: 'Owner Reviews Consolidated Evening Report',
    description: 'You open your Doxxy dashboard at 9 PM from home. Two numbers jump out: Kukatpally\'s average revenue per patient is ₹653 vs. Banjara Hills\' ₹645. Comparable. But Gachibowli is at ₹412. You dig in — the doctor at Gachibowli is under-prescribing follow-ups. You schedule a coaching conversation for tomorrow morning. This insight took 90 seconds. Without Doxxy, you would have discovered it at month-end. Maybe.',
  },
];

const beforeAfterRows = [
  {
    area: 'Patient Records',
    before: 'Paper files stored at individual clinics. Patient visits Location A, file stays at Location A. Visiting Location B means starting from scratch — re-registration, re-writing history, re-doing vitals. Records get lost when clinics relocate or files are misfiled.',
    after: 'Unified digital EMR accessible from any authorized location. Patient visits any branch — full history, prescriptions, lab reports, allergies, and past billing load instantly. One patient, one record. Period.',
  },
  {
    area: 'Cross-Location Visibility',
    before: 'Receptionists call each other: "Bhaiyya, patient number 452 ka file check karo na." WhatsApp groups with 50+ messages a day just for patient lookups and appointment coordination. Information travels at the speed of a phone call — which usually means it does not travel at all.',
    after: 'Instant cross-location patient lookup from any branch. Front desk enters phone number or UHID — the complete record appears regardless of where the patient was last seen. No phone calls. No WhatsApp. No "I\'ll check and call you back."',
  },
  {
    area: 'Revenue Tracking & Reconciliation',
    before: 'Each clinic maintains its own Excel sheet or handwritten register. At month-end, the accountant merges 2-4 separate files — each with different date formats, different service names, different levels of detail. Reconciliation takes 7-10 days. By the time you see the numbers, 15 days of the new month have passed.',
    after: 'All billing data flows into one consolidated dashboard in real time. Filter by location, doctor, service, payment mode. Daily auto-reconciliation. Month-end close takes under 30 minutes. You know yesterday\'s revenue by 10 AM today — not the 15th of next month.',
  },
  {
    area: 'Staff Access & Permissions',
    before: 'Everyone at every location has access to everything — because paper files and shared Excel sheets have no access control. A receptionist at Clinic A can theoretically see Clinic B\'s revenue. A departing staff member can take patient data from all branches. Security is based on trust, not system design.',
    after: 'Granular, role-based access per location. Receptionist sees only their assigned clinic. Doctor sees only their OPD patients. Owner sees everything. Every access is logged. When a staff member leaves, you revoke their access in one click — not by changing physical locks and passwords.',
  },
  {
    area: 'Reporting & Analytics',
    before: 'Reports are compiled manually — if at all. "Which is my most profitable location?" requires pulling data from each clinic, normalizing formats, and building comparison charts in Excel. Most owners do this once a year (at tax time) or never. Decisions are gut-driven because data is too hard to assemble.',
    after: 'One-click location-wise P&L, patient volume reports, revenue per doctor per location, service profitability by branch. Compare Gachibowli vs. Kukatpally on any metric. Export consolidated reports for investors, banks, and your CA. Every growth decision is data-backed because data is 90 seconds away.',
  },
  {
    area: 'Patient Experience',
    before: 'Patient visits Location A, fills a 4-page form. Visits Location B a month later, fills the same 4-page form. Is asked the same medical history questions by a different doctor who has no context. Feels like a new patient at their own healthcare provider. Patient satisfaction and retention suffer silently.',
    after: 'Patient walks into any branch. Receptionist pulls up their complete profile in under 5 seconds. Doctor reviews their full medical history and continues care — not restarts it. Patient feels known, valued, and professionally managed. Cross-location convenience becomes a reason to stay, not a reason to leave.',
  },
  {
    area: 'Inventory Management',
    before: 'Each clinic manages its own pharmacy stock independently. Inventory is tracked on paper or a standalone billing system. Stock-outs at one clinic are unknown to another. Excess stock at Banjara Hills expires while Kukatpally places an emergency order for the same medicine. Inter-branch transfers happen via WhatsApp messages and manual entries.',
    after: 'Centralized inventory dashboard showing real-time stock across all locations. Low-stock alerts. Automatic inter-branch transfer requests with digital tracking. Expiry management across the entire chain. Purchase planning based on consolidated consumption patterns — not per-location guesswork.',
  },
];

const faqs = [
  {
    question: 'How many locations can Doxxy handle?',
    answer: 'Doxxy is built to scale from 2 locations to 20+ without any change in architecture. The centralized patient database, consolidated billing engine, and role-based access control work identically whether you have 2 clinics or 15. Our customers range from single-doctor setups to multi-specialty chains with 10+ branches across Tier 1 and Tier 2 cities. There is no per-location surcharge — all plans include multi-location support. The only consideration at scale is onboarding each location\'s staff, which our team handles with structured training sessions.',
  },
  {
    question: 'Can each location have different pricing and specialties?',
    answer: 'Yes, and this is a core design principle. You can configure different consultation fees, procedure rates, and service catalogues per location. A consultation at your Banjara Hills dermatology clinic can cost ₹800 while the same service at your Kukatpally clinic costs ₹500 — reflecting local market dynamics. Each location can also have its own set of active specialties: your Gachibowli branch might offer physiotherapy while your Banjara Hills branch focuses on cosmetic dermatology. The analytics dashboard automatically normalizes across locations so you can still compare performance on a like-for-like basis.',
  },
  {
    question: 'Is patient data shared across all locations by default?',
    answer: 'Yes, the patient\'s core medical record — demographics, consultation history, prescriptions, lab reports, allergies, and billing history — is accessible from any location where the patient presents. This is the entire point of a unified system: continuity of care across branches. However, sensitive documents can be flagged as location-restricted if needed (e.g., a specific lab report relevant only to one clinic\'s specialty). The system is designed with the clinical assumption that a patient visiting any of your branches expects you to know their history — and Doxxy ensures that you do.',
  },
  {
    question: 'Can I restrict what staff at each location can see?',
    answer: 'Absolutely. Doxxy\'s role-based access control is location-aware. You can assign a receptionist to "Kukatpally — Front Desk" and they will only see patients, appointments, and billing for Kukatpally. A doctor assigned to "Banjara Hills — Dermatology OPD" sees only their scheduled patients at that location. As the owner, you have an admin-level view across all locations. You can also create intermediate roles like "Regional Manager — Hyderabad West" with access to a subset of locations. Every access level is configurable, and all access is logged for audit. When a staff member transfers between branches or leaves, you update permissions in seconds.',
  },
  {
    question: 'How does billing work across multiple locations for GST filing?',
    answer: 'Doxxy supports both models of GST registration. If you have a single GSTIN across all locations (common for chains operating within the same state), billing is unified under one GST number with location-wise HSN/SAC codes for internal tracking. If each location has its own GSTIN (common for chains operating across states), each clinic generates bills under its respective GST number. The analytics dashboard provides both consolidated and per-GSTIN revenue reports. For filing, you can export location-wise or consolidated GST reports (GSTR-1, GSTR-3B ready formats) with one click. Your CA gets clean, auditable data without spending days normalizing formats across branches.',
  },
];

// --- PAGE SECTIONS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      3 Locations. 1 Dashboard.
    </h1>
    <SectionSubtitle>
      Running multiple clinics should not mean running multiple software accounts, multiple Excel sheets, and a WhatsApp group that never stops buzzing. Doxxy gives you centralized control with location-level autonomy — patient records, billing, analytics, and inventory across every branch, from a single screen.
    </SectionSubtitle>
    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">See How Multi-Location Management Works <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
      <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold">
        <Link href={WHATSAPP_URL}>Chat on WhatsApp</Link>
      </Button>
    </div>
  </Section>
);

const ProblemSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>The Hidden Tax of Running Multiple Clinics Without Unified Software.</SectionTitle>
    <SectionSubtitle className="mt-4">
      You did not sign up to spend your evenings on WhatsApp coordinating between your own branches. But here you are.
    </SectionSubtitle>

    <div className="mt-12 max-w-4xl mx-auto space-y-8">
      <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
        Opening your second clinic should have been a milestone. Instead, it became a management crisis. Suddenly, you are not a doctor or a healthcare entrepreneur — you are an air traffic controller. Patients move between branches, but their records do not. Staff at Clinic A cannot answer basic questions about Clinic B. Revenue numbers arrive as three separate WhatsApp messages, in three different formats, at three different times. Your chartered accountant dreads your monthly reconciliation call.
      </p>

      <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
        This is not a personnel problem. Your receptionists are not lazy. Your clinic managers are not incompetent. The problem is that you are trying to run a multi-location healthcare business on single-location tools — paper files, standalone billing software, Excel sheets, and messaging apps. These tools were never designed to talk to each other across locations. And so you, the owner, become the integration layer. You are the database that connects Clinic A to Clinic B. You are the API that transfers information between branches. And that is an expensive, unsustainable role for a business owner to play.
      </p>

      <div className="space-y-5 mt-8">
        {problemScenarios.map((scenario) => (
          <div key={scenario.title} className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-xl p-6">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" /> {scenario.title}
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{scenario.description}</p>
          </div>
        ))}
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mt-8">
        The painful irony: you expanded to grow. But the operational overhead of managing multiple locations is now the single biggest constraint on your growth. Every new clinic you open multiplies the chaos — not the revenue, not the patient reach, just the number of WhatsApp groups you need to check. Doxxy breaks this cycle by giving you what you actually need: a single system where every location runs on the same patient database, the same billing engine, and the same analytics dashboard. Your clinics become branches of one business — not a loose federation of independent units.
      </p>
    </div>
  </Section>
);

const MathSection = () => (
  <Section>
    <SectionTitle>The Arithmetic of Fragmentation.</SectionTitle>
    <SectionSubtitle className="mt-4">
      What multi-location fragmentation actually costs a 3-clinic chain in India. These numbers are conservative.
    </SectionSubtitle>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
      {costCards.map((stat) => (
        <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 shadow-sm">
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
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Doxxy's Multi-Location Architecture.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Six integrated modules designed from the ground up for clinic chains — not single-location software with a "multi-branch" checkbox.
    </SectionSubtitle>

    <div className="grid lg:grid-cols-3 gap-8 mt-16">
      {solutionFeatures.map((feature) => (
        <div key={feature.title} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 shadow-sm flex flex-col">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <feature.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 flex-grow">{feature.description}</p>
          <ul className="space-y-3 text-sm border-t border-gray-100 dark:border-gray-700 pt-4">
            {feature.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
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
  <Section>
    <SectionTitle>A Patient's Journey Across Your Locations. Seamless.</SectionTitle>
    <SectionSubtitle className="mt-4">
      See how a unified system transforms the cross-location patient experience — from registration to billing to your evening dashboard.
    </SectionSubtitle>

    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mt-16">
      {workflowSteps.map((step) => (
        <div key={step.step} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 shadow-sm relative">
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

const ResultsSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Dr. Reddy's 3 Clinics. Hyderabad. Before and After Doxxy.</SectionTitle>
    <SectionSubtitle className="mt-4">
      A real story from a multi-specialty chain that switched from fragmented systems to Doxxy. Numbers shared with permission.
    </SectionSubtitle>

    <div className="max-w-4xl mx-auto mt-16 space-y-10">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" /> The Setup
        </h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Dr. Venkat Reddy runs three clinics in Hyderabad — a dermatology-focused clinic in Banjara Hills, a general practice in Kukatpally, and a multi-specialty setup in Gachibowli with visiting consultants. Combined, the three locations see approximately 65 patients per day across 5 doctors and 9 support staff. Before Doxxy, Dr. Reddy used a standalone billing software at Banjara Hills (installed in 2019, never updated), paper registers at Kukatpally, and a different billing app at Gachibowli. Patient records did not move between locations. Revenue reconciliation was a monthly 3-day exercise involving his accountant, two receptionists, and a lot of WhatsApp forwards.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 shadow-sm text-center">
          <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">12 hrs</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Admin Coordination</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-3">Hours spent per week before Doxxy — calling between branches, checking registers, reconciling patient records. Now: under 2 hours per week. An 83% reduction that gave Dr. Reddy back 10 hours every week for clinical work and family.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 shadow-sm text-center">
          <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">85%</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Revenue Leakage Drop</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-3">Revenue lost to unbilled follow-ups, missed procedure charges, and inconsistent pricing across branches dropped by 85% within the first 3 months. Doxxy's standardized billing with service catalogues per location eliminated pricing drift.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 shadow-sm text-center">
          <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">40%</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Cross-Location Referrals</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-3">Increase in patients referred between branches within 6 months. When Kukatpally staff could see that Banjara Hills offered cosmetic dermatology, they started recommending it. When Gachibowli patients needed follow-ups closer to home, Kukatpally was ready with their full history.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">In Dr. Reddy's Words</h3>
        <blockquote className="text-gray-600 dark:text-gray-300 italic leading-relaxed border-l-4 border-blue-500 pl-4">
          "Earlier, I used to spend my Sundays on Excel — merging three branches' data just to see if we made money that week. Now I check my dashboard between patients. I know Kukatpally's revenue before the receptionist there has finished counting cash. My patients tell me 'sir, aapke yahan toh kisi bhi branch mein jaao, sab pata hota hai.' That matters more than the money."
        </blockquote>
      </div>
    </div>
  </Section>
);

const BeforeAfterSection = () => (
  <Section>
    <SectionTitle>Managing Multiple Clinics: Before Doxxy vs. After Doxxy.</SectionTitle>
    <SectionSubtitle className="mt-4">
      The difference between a loose collection of clinics and a unified healthcare business.
    </SectionSubtitle>

    <div className="max-w-5xl mx-auto mt-16 space-y-4">
      {beforeAfterRows.map((row) => (
        <div key={row.area} className="grid md:grid-cols-2 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30 rounded-xl p-5">
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-2">Before Doxxy</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{row.area}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{row.before}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-xl p-5">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2">After Doxxy</p>
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
    <SectionTitle>Questions Clinic Chain Owners Ask About Doxxy.</SectionTitle>
    <div className="max-w-3xl mx-auto mt-16 space-y-8">
      {faqs.map((faq) => (
        <div key={faq.question} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            {faq.question}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">{faq.answer}</p>
        </div>
      ))}
    </div>
  </Section>
);

const FinalCTASection = () => (
  <Section className="text-center">
    <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
      Run Your Chain from a Single Screen.
    </h2>
    <SectionSubtitle>
      Join multi-location clinic owners across India — from Hyderabad to Delhi, Bangalore to Mumbai — who have stopped managing by WhatsApp and started managing by dashboard. Centralized records. Location-wise analytics. Consolidated billing. Your first 100 consultations are free. No setup fees. No per-location surcharge.
    </SectionSubtitle>
    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Start for Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
      <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold">
        <Link href={WHATSAPP_URL}>Talk to Our Team on WhatsApp</Link>
      </Button>
    </div>
  </Section>
);

// --- MAIN PAGE COMPONENT ---

export default function MultiLocationClinicSoftware() {
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
      <ResultsSection />
      <BeforeAfterSection />
      <FaqSection />
      <FinalCTASection />
      <SignupCTA
        heading="3 Locations, 1 Dashboard. Centralized Control."
        description="Centralized patient records, consolidated billing, location-wise analytics. See how multi-location management works on a quick WhatsApp demo."
      />

      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: APP_URL },
          { name: 'Multi-Location Clinic Software', url: `${APP_URL}/multi-location-clinic-software` },
        ]}
      />
      <Script
        id="multi-location-faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </div>
  );
}
