// Path: app/(public)/abdm-compliance-clinic/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import {
  ArrowRight,
  Clock,
  Building2,
  Shield,
  Fingerprint,
  FileText,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Zap,
  Smartphone,
  CreditCard,
  Calendar,
  ChevronRight,
  HelpCircle,
  Database,
  Link2,
  Users,
  BadgeCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import SignupCTA from '@/components/SignupCTA';
import BreadcrumbJsonLd from '@/components/SEO/BreadcrumbJsonLd';
import { APP_URL } from '@/lib/constants';
import { Section, SectionTitle, SectionSubtitle } from '@/components/ui/section-headers';

export const metadata: Metadata = {
  title: 'ABDM Compliance for Clinics — Complete Guide 2026 | Doxxy',
  description:
    'Everything Indian clinics need to know about Ayushman Bharat Digital Mission compliance. ABHA IDs, HPR registration, digital health records standards, compliance timeline, costs, and government incentives. Updated June 2026.',
  alternates: { canonical: '/abdm-compliance-clinic' },
  openGraph: {
    type: 'website',
    title: 'ABDM Compliance for Clinics — Complete Guide 2026',
    description:
      'Everything Indian clinics need to know about ABDM compliance. ABHA IDs, HPR registration, digital health records, timeline, costs, and incentives.',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'ABDM Compliance Guide for Clinics' }],
  },
  keywords: [
    'ABDM compliance clinic',
    'Ayushman Bharat Digital Mission clinic',
    'ABHA ID clinic registration',
    'HPR registration clinic',
    'digital health records India',
    'ABDM guidelines clinic India',
    'healthcare professionals registry',
    'ABDM certification clinic',
  ],
};

// --- DATA ---

const whatIsABDMItems = [
  {
    icon: Building2,
    title: 'The National Digital Health Ecosystem',
    description:
      'ABDM is the Government of India\'s flagship initiative to build a nationwide digital health infrastructure. Launched in September 2021 by the Prime Minister, it aims to create a seamless, interoperable digital health data layer for 1.4 billion Indians. The National Health Authority (NHA) is the implementing agency. ABDM is not a single app or website — it is an entire ecosystem of registries, standards, and protocols that connect patients, doctors, labs, pharmacies, and insurers on a single digital backbone.',
  },
  {
    icon: Fingerprint,
    title: 'Three Core Registries That Matter for Your Clinic',
    description:
      'ABDM is built on three foundational registries: (1) ABHA — the Ayushman Bharat Health Account, a unique 14-digit health ID for every Indian citizen, analogous to Aadhaar but specifically for health records. (2) HPR — the Healthcare Professionals Registry, where every doctor and nurse gets a unique digital identity. (3) HFR — the Health Facility Registry, where every clinic, hospital, lab, and pharmacy is registered with a unique facility ID. Your clinic needs to be on HFR. You and your doctors need to be on HPR. Your patients need ABHA IDs.',
  },
  {
    icon: Link2,
    title: 'How the Ecosystem Connects',
    description:
      'Think of ABDM as "UPI for healthcare." Just as UPI connected every bank account to every payment app, ABDM connects every patient ID (ABHA) to every provider ID (HPR/HFR), so health records — prescriptions, lab reports, discharge summaries — can flow between providers with patient consent. A patient visits your clinic. You write a prescription. With ABDM, that prescription is digitally linked to the patient\'s ABHA. When they visit a lab, the lab digitally links the report. When they visit a specialist, the specialist sees the full history — all with explicit patient consent at each step.',
  },
];

const whyItMattersPoints = [
  {
    icon: TrendingUp,
    title: 'Government Empanelment Is Tied to ABDM',
    description:
      'State health departments across Maharashtra, Karnataka, Tamil Nadu, Uttar Pradesh, Rajasthan, and Delhi have begun linking government scheme empanelment to ABDM compliance. Ayushman Bharat PM-JAY, CGHS, ECHS, and state-level health insurance schemes are progressively requiring ABDM-compliant facilities. Clinics that are not ABDM-ready by 2027 risk losing access to these patient channels entirely. This is not speculative — the circulars are already being issued.',
  },
  {
    icon: Users,
    title: 'Patient Discovery Through the ABDM Network',
    description:
      'When patients search for doctors through ABDM-enabled platforms (e.g., government health portals, ABHA app, insurance network searches), registered HPR/HFR facilities appear in the results. Non-registered clinics are invisible. This is the digital equivalent of being listed in the phone book versus not existing at all. As ABDM adoption grows, this discoverability advantage compounds.',
  },
  {
    icon: FileText,
    title: 'Medico-Legal Protection Through Standardized Records',
    description:
      'ABDM-compliant digital records meet the evidentiary standards expected by medical councils and consumer courts. In the event of a medico-legal dispute, timestamped, ABDM-linked records with digital signatures provide significantly stronger legal protection than handwritten paper notes. The Clinical Establishments Act and various state nursing home acts increasingly reference digital record standards. ABDM compliance is your defence.',
  },
  {
    icon: CreditCard,
    title: 'Insurance Reimbursement Will Require It',
    description:
      'IRDAI (Insurance Regulatory and Development Authority of India) has signalled that cashless claim processing and pre-authorization workflows will be routed through the ABDM network. Insurers want standardized, digital, tamper-proof medical records — exactly what ABDM provides. Clinics that process insurance claims should expect ABDM compliance to become a prerequisite for network empanelment within 2-3 years.',
  },
];

const abhaSteps = [
  {
    step: 1,
    title: 'Patient Provides Aadhaar or Mobile Number',
    description:
      'The patient provides their Aadhaar number (preferred) or a mobile number linked to Aadhaar. For patients without Aadhaar, a driving licence or other valid government ID can be used as an alternative identity proof. Children can be linked to a parent\'s ABHA.',
  },
  {
    step: 2,
    title: 'Consent Is Obtained Digitally or Physically',
    description:
      'The patient must explicitly consent to ABHA creation. This is non-negotiable under the ABDM consent framework. Consent can be captured digitally (via biometric or OTP) or documented on a physical consent form for patients who prefer paper. The consent specifies what data will be linked and for what purpose. Consent is revocable at any time.',
  },
  {
    step: 3,
    title: 'ABHA ID Is Generated (14-Digit Unique Number)',
    description:
      'The NHA system generates a 14-digit unique ABHA number (format: XX-XXXX-XXXX-XXXX). This number is permanent and unique to the individual. It does not change even if the patient moves cities, changes doctors, or updates their phone number. The ABHA number is linked to the patient\'s demographic details in the national registry.',
  },
  {
    step: 4,
    title: 'ABHA Address Is Created (Optional but Recommended)',
    description:
      'An optional ABHA address (e.g., ramesh.sharma@abdm) can be created. This is a human-readable alias for the 14-digit number — easier for patients to remember and share with providers. The ABHA address is self-declared and can be changed by the patient. Doxxy links both the ABHA ID and the ABHA address to the patient\'s clinic record for seamless future use.',
  },
  {
    step: 5,
    title: 'Patient Record Is Linked to ABHA in Clinic Software',
    description:
      'The generated ABHA ID is stored in your clinic software and linked to the patient\'s existing record. From this point forward, every new prescription, lab report, and consultation note you create can be linked to the patient\'s ABHA with a single consent click. The linking is governed by the ABDM Health Information Exchange (HIE) protocols.',
  },
];

const healthRecordStandards = [
  {
    icon: FileText,
    title: 'SNOMED-CT Clinical Terminology',
    description:
      'All clinical terms — diagnoses, symptoms, procedures — must use SNOMED-CT coding (Systematized Nomenclature of Medicine — Clinical Terms). This is an internationally recognized standard that India has adopted for ABDM. In practice, your clinic software maps common terms like "Type 2 Diabetes Mellitus" to the corresponding SNOMED-CT code automatically. You write "Type 2 DM," the software tags it with code 44054006. You do not need to memorize codes — the software handles translation.',
  },
  {
    icon: Database,
    title: 'FHIR (Fast Healthcare Interoperability Resources)',
    description:
      'ABDM mandates FHIR Release 4 as the standard for health data exchange. FHIR defines how a prescription, lab report, or discharge summary is structured so that any ABDM-compliant system can read it. When your clinic sends a prescription to a patient\'s ABHA-linked record, it is structured as a FHIR Bundle — a machine-readable, interoperable format. When the patient visits a lab, the lab\'s software reads your prescription, understands the tests ordered, and structures the lab report as another FHIR Bundle linked to the same ABHA.',
  },
  {
    icon: Shield,
    title: 'Digital Signature Certificates (DSC)',
    description:
      'Every prescription, lab report, and clinical document in the ABDM ecosystem must be digitally signed by the creating healthcare professional. DSC ensures authenticity, non-repudiation, and tamper-evidence. A digitally signed prescription proves it was written by you, at a specific time, and has not been altered. The Controller of Certifying Authorities (CCA) licenses certifying authorities that issue DSCs. Your clinic software integrates with DSC providers so signing happens automatically when you complete a consultation.',
  },
  {
    icon: Smartphone,
    title: 'PHR (Personal Health Records) App Integration',
    description:
      'The ABDM architecture includes PHR apps — patient-facing applications (like the official ABHA app, Aarogya Setu, and third-party health lockers) where patients can view, manage, and share their health records. When you link a prescription to a patient\'s ABHA, it becomes available in their PHR app. Patients no longer need to carry physical files between providers. They control access — they grant or revoke consent for any provider to view specific records. This is patient empowerment at infrastructure scale.',
  },
];

const complianceTimeline = [
  {
    phase: 'Now — Mid 2026',
    status: 'Voluntary Adoption Phase',
    icon: CheckCircle,
    items: [
      'Get your clinic registered on HFR (Health Facility Registry) — this takes 15 minutes and is free.',
      'Get yourself and your doctors registered on HPR (Healthcare Professionals Registry) — link your NMC/State Medical Council registration number.',
      'Start generating ABHA IDs for new patients during registration — aim for 30% of new patients in the first month.',
      'Ensure your clinic software is ABDM-compliant and supports ABHA creation, record linking, and FHIR-compliant data exchange.',
      'Run a parallel system: create both paper and digital records linked to ABHA. Build staff comfort with the workflow.',
    ],
  },
  {
    phase: 'Late 2026 — Early 2027',
    status: 'Transition Phase',
    icon: AlertTriangle,
    items: [
      'State health departments begin issuing compliance deadlines for government-scheme-empanelled clinics.',
      'Insurance companies start requiring ABDM-linked records for cashless claim processing.',
      'Target: 70%+ of active patients have ABHA IDs linked to your clinic records.',
      'Target: 100% of prescriptions and lab reports are digitally signed and ABHA-linked.',
      'Clinic software must support full FHIR-based record exchange — test it by sending a record to a PHR app.',
    ],
  },
  {
    phase: 'Mid 2027 — 2028',
    status: 'Mandatory Compliance Phase',
    icon: Shield,
    items: [
      'National mandate expected. ABDM compliance linked to medical registration renewal in some states.',
      'Clinics without ABDM integration are excluded from government health schemes and insurance networks.',
      'Paper records lose medico-legal standing relative to ABDM-linked digital records.',
      'ABHA ID becomes as universal as Aadhaar — refusal to support it becomes a competitive disadvantage.',
      'Full interoperability: your prescriptions flow to labs, lab reports flow back to you, discharge summaries flow to specialists — all via ABDM.',
    ],
  },
];

const costsAndIncentives = [
  {
    icon: CreditCard,
    title: 'ABDM Compliance Is Almost Free for Clinics',
    description:
      'HFR registration: Free. HPR registration: Free. ABHA creation for patients: Free. The National Health Authority has deliberately made registration zero-cost to encourage adoption. The only cost is the clinic software subscription that supports ABDM compliance — and that cost (Rs. 999-2,999/month) is significantly less than the revenue you recover through better record-keeping, reduced no-shows, and insurance claim efficiency.',
  },
  {
    icon: TrendingUp,
    title: 'State-Level Financial Incentives',
    description:
      'Multiple states are offering direct financial incentives for ABDM adoption. Maharashtra offers up to Rs. 50,000 for clinics that achieve full ABDM compliance (HFR + HPR + ABHA generation + digital prescriptions). Karnataka has a similar scheme through Suvarna Arogya Suraksha Trust. Tamil Nadu provides incentives through the Tamil Nadu Health Systems Project. Check your state health department portal for current schemes. These are disbursed after verification of compliance metrics.',
  },
  {
    icon: Building2,
    title: 'MSME Digital Transformation Subsidy',
    description:
      'Clinics registered as MSMEs (Udyam-registered) can access the government\'s Digital MSME scheme, which provides up to 50% subsidy on digital infrastructure — including computers, tablets, printers, and software subscriptions. Combined with ABDM-specific incentives, a clinic can essentially digitize for free or at a fraction of the sticker price. Register on the Udyam portal if you have not already.',
  },
  {
    icon: FileText,
    title: 'Tax Benefits: Section 37(1) and GST Input Credit',
    description:
      'Software subscriptions, hardware purchases, and internet costs are fully deductible as business expenses under Section 37(1) of the Income Tax Act. GST-registered clinics can claim input tax credit on software subscriptions — effectively reducing cost by 18%. Maintain proper invoices. Your CA can optimize this for you.',
  },
];

const doxxyABDMFeatures = [
  {
    icon: Fingerprint,
    title: 'One-Tap ABHA Creation During Registration',
    description:
      'When your receptionist enters a new patient\'s name and phone number, Doxxy presents a one-tap ABHA creation option. The software handles the entire NHA gateway interaction: OTP generation, consent capture, ABHA creation, and linking to the patient record. The patient provides consent via OTP on their phone. The whole process takes under 60 seconds.',
  },
  {
    icon: FileText,
    title: 'Auto-Linking Records to ABHA',
    description:
      'After an ABHA ID is linked, every prescription, consultation note, lab report, and procedure note you create in Doxxy is automatically linked to the patient\'s ABHA — with the patient\'s consent captured once per session or per record, based on your clinic\'s configured consent policy. No extra steps. No "did we link this?" confusion. The system handles it transparently.',
  },
  {
    icon: Shield,
    title: 'Digital Signatures Built Into Every Prescription',
    description:
      'Doxxy integrates with CCA-licensed Digital Signature Certificate providers. When you finalize a prescription, it is automatically signed with your DSC. The signature is embedded in the FHIR-compliant document bundle. The prescription is tamper-evident, timestamped, and legally valid. For doctors who prefer not to use individual DSCs, Doxxy\'s cloud-based signing meets ABDM requirements for clinic-level authentication.',
  },
  {
    icon: Database,
    title: 'FHIR-Compliant Record Export and Exchange',
    description:
      'Every medical record in Doxxy can be exported as a FHIR Bundle — ready for exchange through the ABDM Health Information Exchange (HIE) gateway. When a patient visits a referral lab or specialist, their records travel with them — securely, with consent, in a universally readable format. The receiving facility does not need Doxxy. They just need any ABDM-compliant system.',
  },
  {
    icon: Link2,
    title: 'HPR and HFR Registration Assistance',
    description:
      'Doxxy provides guided walkthrough for HPR (doctor registration) and HFR (facility registration). We pre-fill your known details from your Doxxy profile, show you the exact fields that need to be entered, and verify the registration is complete. Most clinics complete both registrations in under 30 minutes. If you get stuck, our support team is available on WhatsApp.',
  },
  {
    icon: BadgeCheck,
    title: 'Compliance Dashboard With Real-Time Metrics',
    description:
      'A dedicated ABDM Compliance Dashboard shows your clinic\'s compliance metrics in real time: percentage of patients with ABHA IDs linked, percentage of prescriptions digitally signed, number of records exported via FHIR, HPR/HFR registration status, and any compliance gaps that need attention. One screen. 30 seconds. You know exactly where you stand.',
  },
];

const faqs = [
  {
    q: 'Is ABDM compliance legally mandatory for all clinics right now?',
    a: 'As of June 2026, ABDM compliance is not yet a nationwide legal mandate for all clinics. However, it is increasingly required for: (a) government scheme empanelment (Ayushman Bharat PM-JAY, CGHS, ECHS, state health schemes), (b) insurance network participation (cashless claim processing), and (c) certain state-level medical registration requirements. The NHA has stated its goal of universal adoption. Multiple states — Maharashtra, Karnataka, Tamil Nadu — have issued circulars requiring ABDM compliance for empanelled facilities. The trajectory is clear: voluntary today, conditional by late 2026, mandatory by 2027-2028. Starting now gives you time to transition at your pace, not under a regulatory deadline.',
  },
  {
    q: 'What exactly do I need to do to make my clinic ABDM compliant?',
    a: 'Four things. (1) Register your clinic on the Health Facility Registry (HFR) at abdm.gov.in — 15 minutes, free, needs your clinic registration certificate. (2) Register yourself (and any other doctors in your clinic) on the Healthcare Professionals Registry (HPR) — 10 minutes per doctor, needs your NMC/State Medical Council registration number. (3) Use ABDM-compliant clinic software (like Doxxy) that supports ABHA ID creation, FHIR-based record exchange, and digital signatures. (4) Start creating ABHA IDs for your patients and linking their health records. That is the full checklist. The software handles the technical complexity.',
  },
  {
    q: 'What if my patients do not have Aadhaar or do not want an ABHA ID?',
    a: 'ABHA creation is voluntary. You cannot force a patient to create one. However, ABHA can be created using a mobile number alone (linked to Aadhaar) or using alternative identity documents for patients without Aadhaar. For patients who decline: document their refusal, continue providing care as usual, and revisit the conversation at their next visit. Most patients agree when they understand it means no more carrying physical files between doctors. The opt-in rate in clinics that explain ABHA benefits is over 80%.',
  },
  {
    q: 'How much does ABDM compliance cost my clinic?',
    a: 'Registration: free. ABHA creation: free. Record linking: free. The only cost is your clinic software subscription (Rs. 999-2,999/month for ABDM-compliant software like Doxxy). This is offset by: (a) state-level incentives (Rs. 5,000-50,000 depending on state), (b) MSME digital transformation subsidies (up to 50% of infrastructure cost), (c) GST input credit on software (18% savings), and (d) income tax deductions under Section 37(1). For most clinics, the net cost is negative — you recover more through incentives and operational savings than you spend on compliance.',
  },
  {
    q: 'Can a small single-doctor clinic realistically comply with ABDM?',
    a: 'Yes — ABDM was specifically designed to include small clinics, not just large hospitals. The HPR accepts registration from MBBS doctors with state medical council registration. The HFR accepts small clinics with a clinic establishment certificate. ABHA creation at the clinic level is designed to work on a smartphone or basic tablet. The government has explicitly stated that ABDM must work for the single-doctor clinic in a tier-3 town as well as it works for a 500-bed hospital in Mumbai. The software abstracts the complexity. If you can use WhatsApp, you can use ABDM-compliant clinic software.',
  },
  {
    q: 'What happens to my existing paper records? Do I need to digitize them for ABDM?',
    a: 'No. ABDM compliance applies to records created after you go digital. You do not need to digitize 20 years of paper files. Historical records remain as they are. For active patients, you can link their ABHA going forward — new prescriptions, new lab reports, new consultation notes will be ABHA-linked. Over time, as patients revisit, their digital record grows. The paper archive remains accessible but becomes increasingly irrelevant. This is the progressive digitization approach the NHA recommends.',
  },
  {
    q: 'Is patient data safe? How does ABDM handle privacy?',
    a: 'ABDM has one of the most robust health data privacy frameworks in the world. Data is encrypted in transit and at rest. Records are shared ONLY with explicit patient consent — every single time a provider accesses a record. Patients control what data is shared, with whom, for how long, and for what purpose. Consent is granular, revocable, and auditable. The ABDM Personal Data Protection framework aligns with the Digital Personal Data Protection Act 2023. Patients can view every access to their data through their PHR app. Your clinic software sees only what the patient consents to share with you.',
  },
];

const internalLinks = [
  {
    title: 'ABHA ID Guide for Clinics',
    description: 'Deep dive into ABHA IDs: creation, linking, privacy, consent, and the difference between ABHA and ABDM.',
    href: '/abha-id-clinic-guide',
  },
  {
    title: 'India Clinic Digitization Guide',
    description: 'The complete step-by-step roadmap to digitizing your clinic — from paper to ABDM-compliant digital in 6 phases.',
    href: '/india-clinic-digitization-guide',
  },
  {
    title: 'Clinic Regulatory Compliance India',
    description: 'Complete guide to clinic regulations: Clinical Establishments Act, Biomedical Waste Rules, drug record keeping, and inspection readiness.',
    href: '/clinic-regulatory-compliance-india',
  },
  {
    title: 'Best Clinic Management Software India',
    description: 'Compare Doxxy with other clinic software. Feature comparison, honest pros and cons, and pricing breakdown.',
    href: '/best-clinic-management-software-india',
  },
  {
    title: 'Digital Treatment Plans',
    description: 'How digital prescriptions work, ABDM compliance, drug interaction checks, and 13 Indian language support.',
    href: '/digital-treatment-plans',
  },
  {
    title: 'Electronic Medical Records for Indian Clinics',
    description: 'Why EMRs matter, how they differ from paper records, and how ABDM is transforming record-keeping.',
    href: '/electronic-medical-records',
  },
];

// --- ARTICLE STRUCTURED DATA ---

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'ABDM Compliance for Clinics — Complete Guide 2026',
  description:
    'Everything Indian clinics need to know about Ayushman Bharat Digital Mission compliance. ABHA IDs, HPR registration, digital health records standards, compliance timeline, costs, and government incentives.',
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
    '@id': `${APP_URL}/abdm-compliance-clinic`,
  },
};

// --- FAQ STRUCTURED DATA ---

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.a,
    },
  })),
};

// --- PAGE SECTIONS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 mb-8">
      <Clock className="h-4 w-4" />
      Updated June 2026 · ABDM v2.0 Standards · Free Guide
    </div>
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      ABDM Compliance for Clinics — Complete Guide 2026
    </h1>
    <SectionSubtitle>
      Everything your clinic needs to know about Ayushman Bharat Digital Mission compliance.
      ABHA IDs, HPR registration, FHIR standards, compliance timeline, government incentives,
      and how to get compliant without disrupting your practice.
    </SectionSubtitle>
    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Get ABDM Compliant <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
      <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600">
        <Link href="#compliance-checklist">Jump to Checklist <ChevronRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

const TLDRSection = () => (
  <Section className="!py-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-blue-100 dark:border-blue-900/30">
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-blue-600" />
        <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">In 30 Seconds</span>
      </div>
      <ul className="space-y-3">
        <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
          <span className="text-blue-500 font-bold mt-0.5">1.</span>
          <span><strong>ABDM is the government's "UPI moment" for healthcare.</strong> Three registries — ABHA (patient IDs), HPR (doctor IDs), and HFR (facility IDs) — create a national digital health ecosystem connecting patients, doctors, labs, and insurers.</span>
        </li>
        <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
          <span className="text-blue-500 font-bold mt-0.5">2.</span>
          <span><strong>Compliance is voluntary today, but not for long.</strong> Government scheme empanelment, insurance networks, and state medical councils are already linking requirements to ABDM. Mandatory compliance is expected by 2027-2028.</span>
        </li>
        <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
          <span className="text-blue-500 font-bold mt-0.5">3.</span>
          <span><strong>ABDM compliance costs almost nothing for the clinic.</strong> Registration is free. State incentives cover digitization costs. The ABDM-compliant software subscription (Rs. 999-2,999/month) is offset by tax benefits, MSME subsidies, and operational savings from better record-keeping and fewer no-shows.</span>
        </li>
        <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
          <span className="text-blue-500 font-bold mt-0.5">4.</span>
          <span><strong>Good clinic software handles the complexity automatically.</strong> ABHA creation, consent management, FHIR record exchange, and digital signatures all happen in the background. Your workflow does not change — you see patients, the software handles ABDM.</span>
        </li>
      </ul>
    </div>
  </Section>
);

const WhatIsABDMSection = () => (
  <Section>
    <SectionTitle>What Is ABDM? The Digital Health Highway.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Ayushman Bharat Digital Mission is not an app. It is not a website. It is the national
      infrastructure that will connect every healthcare provider, patient, and record in India.
      Here is what that means for your clinic.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 space-y-8">
      {whatIsABDMItems.map((item) => (
        <div key={item.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
              <item.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const WhyItMattersSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Why ABDM Matters for Your Clinic — Today and Tomorrow.</SectionTitle>
    <SectionSubtitle className="mt-4">
      This is not a theoretical conversation about government policy. ABDM compliance has
      direct, measurable impact on your clinic's revenue, patient volume, legal protection,
      and competitive position. Here are the four reasons it matters.
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 gap-8 mt-16">
      {whyItMattersPoints.map((point) => (
        <div key={point.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <point.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{point.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{point.description}</p>
        </div>
      ))}
    </div>
  </Section>
);

const ABHAStepsSection = () => (
  <Section>
    <SectionTitle>ABHA ID Creation & Linking — The Onboarding Workflow.</SectionTitle>
    <SectionSubtitle className="mt-4">
      ABHA (Ayushman Bharat Health Account) is a 14-digit unique health ID for every Indian.
      Creating one for a patient is a 5-step, 60-second process. Here is exactly how it works.
    </SectionSubtitle>
    <div className="mt-16 space-y-8">
      {abhaSteps.map((step) => (
        <div key={step.step} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8 flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 flex items-start gap-4 md:w-32">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">{step.step}</span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{step.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{step.description}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-200/50 dark:border-blue-800/50 text-center mt-12">
      <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5 mx-auto">
        <Zap className="h-7 w-7 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        Your Clinic Software Automates All 5 Steps.
      </h3>
      <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
        With ABDM-compliant software like Doxxy, the entire 5-step process happens through
        the NHA gateway in the background. The receptionist enters the patient's name and
        phone number, clicks "Create ABHA," and the system handles consent, OTP generation,
        number creation, and record linking — all in under 60 seconds.
      </p>
    </div>
  </Section>
);

const HealthRecordsSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Digital Health Records Standards — The Technical Backbone.</SectionTitle>
    <SectionSubtitle className="mt-4">
      ABDM mandates specific technical standards for health data. Your clinic software
      implements them. But understanding what they are helps you evaluate software and
      explain the system to colleagues. Here are the four standards that matter.
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 gap-8 mt-16">
      {healthRecordStandards.map((standard) => (
        <div key={standard.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <standard.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{standard.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{standard.description}</p>
        </div>
      ))}
    </div>
  </Section>
);

const TimelineSection = () => (
  <Section id="compliance-checklist">
    <SectionTitle>ABDM Compliance Timeline — What to Do and When.</SectionTitle>
    <SectionSubtitle className="mt-4">
      The transition to mandatory ABDM compliance is happening in three phases. Your clinic's
      strategy depends on which phase you act in. Earlier is easier, cheaper, and comes with
      incentives. Later means deadlines, pressure, and missed opportunities.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-16 space-y-8">
      {complianceTimeline.map((phase) => (
        <div key={phase.phase} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
          <div className="p-6 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-900/50">
            <div className="flex items-center gap-3">
              <phase.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{phase.phase}</h3>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{phase.status}</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {phase.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const CostsSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Costs & Government Incentives — The Real Numbers.</SectionTitle>
    <SectionSubtitle className="mt-4">
      ABDM compliance costs less than you think, and the government is actively paying clinics
      to adopt it. Here is the honest breakdown of costs, incentives, and tax benefits.
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 gap-8 mt-16">
      {costsAndIncentives.map((item) => (
        <div key={item.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <item.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{item.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
        </div>
      ))}
    </div>

    <div className="bg-blue-600 rounded-2xl p-8 text-white mt-12 text-center">
      <h3 className="text-2xl font-bold mb-3">Bottom Line: Compliance Is Revenue-Positive</h3>
      <p className="text-blue-100 max-w-3xl mx-auto leading-relaxed">
        A Rs. 1,500/month ABDM-compliant software subscription, combined with state incentives
        (Rs. 5,000-50,000), MSME subsidies (up to 50% of infrastructure), GST input credit (18%),
        and income tax deductions — means compliance pays for itself and then some. The government
        is effectively paying clinics to digitize. Do not leave this money on the table.
      </p>
    </div>
  </Section>
);

const DoxxyHandlesSection = () => (
  <Section>
    <SectionTitle>How Doxxy Handles ABDM Compliance — Automatically.</SectionTitle>
    <SectionSubtitle className="mt-4">
      ABDM compliance sounds complex. The right software makes it invisible. You see patients.
      Doxxy handles the ABDM plumbing — ABHA creation, consent, FHIR records, digital signatures,
      and compliance reporting. Here is how.
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 gap-8 mt-16">
      {doxxyABDMFeatures.map((feature) => (
        <div key={feature.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <feature.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
        </div>
      ))}
    </div>
  </Section>
);

const FAQSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Questions Doctors Ask About ABDM Compliance.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Direct answers. No government jargon. What you actually need to know as a clinic owner
      or doctor evaluating ABDM compliance for your practice.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-16 space-y-4">
      {faqs.map((faq) => (
        <div key={faq.q} className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-200/75 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            {faq.q}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.a}</p>
        </div>
      ))}
    </div>
  </Section>
);

const InternalLinkHubSection = () => (
  <Section>
    <SectionTitle>Continue Your Research.</SectionTitle>
    <SectionSubtitle className="mt-4">
      ABDM compliance is one piece of the puzzle. Explore our complete guides on related
      topics — written specifically for Indian clinic owners.
    </SectionSubtitle>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
      {internalLinks.map((link) => (
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

    <div className="mt-16 text-center">
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
        Ready to make your clinic ABDM compliant? We can help you register on HPR and HFR in under 30 minutes.
      </p>
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Chat on WhatsApp for ABDM Help <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        Free HPR/HFR registration walkthrough · No obligation · We answer your questions honestly
      </p>
    </div>
  </Section>
);

// --- ARTICLE STRUCTURED DATA COMPONENT ---

const ArticleStructuredData = () => (
  <Script
    id="article-structured-data"
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
  />
);

// --- MAIN PAGE COMPONENT ---

export default function AbdmComplianceClinic() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <TLDRSection />
      <WhatIsABDMSection />
      <WhyItMattersSection />
      <ABHAStepsSection />
      <HealthRecordsSection />
      <TimelineSection />
      <CostsSection />
      <DoxxyHandlesSection />
      <FAQSection />
      <InternalLinkHubSection />
      <SignupCTA
        heading="Get Your Clinic ABDM Compliant — Without the Headache."
        description="We will walk you through HPR registration, HFR registration, and ABHA creation — for free. Even if you are not a Doxxy user. Chat on WhatsApp."
        buttonText="Get ABDM Help Free"
        assurance="Free compliance walkthrough · No obligations · Cancel anytime"
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
          { name: 'ABDM Compliance for Clinics', url: `${APP_URL}/abdm-compliance-clinic` },
        ]}
      />
    </div>
  );
}
