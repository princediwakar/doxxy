// Path: app/(public)/abha-id-clinic-guide/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import {
  ArrowRight,
  Clock,
  Fingerprint,
  Shield,
  Users,
  FileText,
  CheckCircle,
  AlertTriangle,
  Zap,
  Smartphone,
  ChevronRight,
  HelpCircle,
  Link2,
  Lock,
  BadgeCheck,
  BarChart3,
  Search,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import SignupCTA from '@/components/SignupCTA';
import BreadcrumbJsonLd from '@/components/SEO/BreadcrumbJsonLd';
import { APP_URL } from '@/lib/constants';
import { Section, SectionTitle, SectionSubtitle } from '@/components/ui/section-headers';

export const metadata: Metadata = {
  title: "ABHA ID for Clinics — A Doctor's Guide to Patient Health IDs | Doxxy",
  description:
    'Everything Indian doctors and clinics need to know about ABHA IDs. How to create them, link health records, manage patient consent, and understand the difference between ABHA and ABDM. Updated June 2026.',
  alternates: { canonical: '/abha-id-clinic-guide' },
  openGraph: {
    type: 'website',
    title: "ABHA ID for Clinics — A Doctor's Guide to Patient Health IDs",
    description:
      'Everything doctors and clinics need to know about ABHA IDs. Creation, linking, consent, privacy, and the ABHA vs ABDM distinction.',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'ABHA ID Guide for Clinics' }],
  },
  keywords: [
    'ABHA ID clinic',
    'ABHA health ID guide',
    'create ABHA ID patient',
    'ABHA ID registration clinic',
    'Ayushman Bharat Health Account',
    'ABHA benefits clinic India',
    'ABHA vs ABDM',
    'patient health ID India',
  ],
};

// --- DATA ---

const whatIsABHA = [
  {
    icon: Fingerprint,
    title: 'A 14-Digit Unique Health Identity Number',
    description:
      'ABHA (Ayushman Bharat Health Account) is a 14-digit unique health identification number assigned to every Indian citizen who opts in. The format is XX-XXXX-XXXX-XXXX. It is permanent — it does not change if the patient moves cities, changes phone numbers, or switches doctors. Think of it as Aadhaar for health records: a single, universal identifier that follows the patient for life, linking every health interaction — prescriptions, lab reports, discharge summaries — to one account.',
  },
  {
    icon: Smartphone,
    title: 'An Optional, Human-Readable ABHA Address',
    description:
      'In addition to the 14-digit number, patients can create a self-declared ABHA address (e.g., priya.patel@abdm or ramesh.kumar.1975@abdm). This is a human-readable alias that is easier to remember and share with providers. A patient can have multiple ABHA addresses linked to the same underlying ABHA number — useful for separating work-health records from personal-health records, or giving different addresses to different family members managing their care.',
  },
  {
    icon: Link2,
    title: 'The Glue That Connects Every Health Record',
    description:
      'Without ABHA, a patient\'s health records are scattered across every clinic, lab, and hospital they have ever visited — disconnected, inaccessible to each other. With ABHA, every record created anywhere is linked to the same identity. When a patient visits your clinic and consents to ABHA linking, you can see their prescriptions from other doctors, their lab reports from other labs, and their discharge summaries from hospitalizations — all in one view. This is not theoretical. This is the ABDM Health Information Exchange (HIE) in action.',
  },
];

const whyPatientsNeedABHA = [
  {
    icon: FileText,
    title: 'No More Carrying Physical Files Between Doctors',
    description:
      'The universal Indian patient experience: a thick file of yellowing prescriptions, faded lab reports stapled together, carried between clinics in a plastic bag. ABHA eliminates this. Every prescription, every lab report, every discharge summary is digitally linked to the patient\'s ABHA. When they visit a new doctor, they grant consent, and the doctor sees the full history. Nothing is lost. Nothing is illegible. Nothing is "I forgot to bring my old reports, Doctor."',
  },
  {
    icon: Shield,
    title: 'Better Clinical Decisions Through Complete History',
    description:
      'When a diabetic patient visits you for the first time, without ABHA, you see only what they tell you and what today\'s tests show. With ABHA (and their consent), you see their last 6 months of blood sugar readings, the medications three previous doctors prescribed, the nephrologist\'s notes from 8 months ago, and the ophthalmologist\'s retinal screening report. You make a fully informed clinical decision instead of a partially informed one. This is the difference between treating a symptom and treating a patient.',
  },
  {
    icon: Lock,
    title: 'Patient-Controlled Privacy',
    description:
      'ABHA is built on a patient-consent-first architecture. The patient controls what data is shared, with whom, for how long, and for what purpose. They can view every access to their data. They can revoke consent at any time. This is not a government database where anyone can look up anyone\'s records. It is a consent-gated health locker where the patient holds the key. Every access is logged, auditable, and revocable. The ABDM consent framework is among the most privacy-protective health data frameworks in the world.',
  },
  {
    icon: TrendingUp,
    title: 'Insurance Claims and Government Scheme Access',
    description:
      'IRDAI and the NHA are progressively linking health insurance and government health scheme access to ABHA. Ayushman Bharat PM-JAY beneficiaries need ABHA for cashless treatment. Insurance companies increasingly require ABHA-linked records for faster claim processing. Patients without ABHA will face longer wait times, more paperwork, and potentially denied claims. Having an ABHA ID is becoming a practical necessity for accessing the full healthcare system.',
  },
];

const creationSteps = [
  {
    step: 1,
    title: 'Collect Basic Patient Information',
    icon: Users,
    description:
      'The receptionist collects the patient\'s name, year of birth (or full date of birth), gender, and either their Aadhaar number or a mobile number linked to Aadhaar. For patients without Aadhaar, alternative identity documents — driving licence, voter ID, passport — can be used. The information is entered into the clinic software, which validates the format before proceeding.',
    detail: 'Time: 15 seconds. The clinic software pre-fills most fields from the registration form.',
  },
  {
    step: 2,
    title: 'Verify Identity via OTP or Biometric',
    icon: Smartphone,
    description:
      'The NHA gateway sends an OTP to the patient\'s Aadhaar-linked mobile number (for OTP-based verification) or initiates biometric authentication (for biometric-based verification at clinics with fingerprint scanners). The OTP method is the default for clinics and works for 95%+ of patients. The patient enters the 6-digit OTP or provides their fingerprint. The NHA validates the identity without sharing the underlying Aadhaar number with the clinic — privacy is preserved at the infrastructure level.',
    detail: 'Time: 20 seconds. OTP delivery and entry is near-instantaneous on a good internet connection.',
  },
  {
    step: 3,
    title: 'Obtain Explicit Patient Consent',
    icon: CheckCircle,
    description:
      'Before the ABHA ID is generated, the patient must explicitly consent. This is a non-negotiable legal requirement under the ABDM consent framework. Consent can be captured digitally (the patient taps "I Consent" on a tablet or authorizes via OTP on their phone) or documented on a physical consent form for patients who prefer paper. The consent specifies: what data is being linked, for what purpose (clinical care), the duration of consent, and the patient\'s right to revoke at any time.',
    detail: 'Time: 10 seconds for digital consent. 2 minutes if using a physical consent form.',
  },
  {
    step: 4,
    title: 'ABHA ID Is Generated and Stored',
    icon: BadgeCheck,
    description:
      'The NHA system generates a unique 14-digit ABHA number, permanently linked to the patient\'s demographic identity. This number is automatically stored in your clinic software and linked to the patient\'s existing record. If the patient creates an ABHA address, that is also stored. The patient receives an SMS confirmation with their ABHA number. No physical card is issued — the number is the identity.',
    detail: 'Time: 5 seconds. The ABHA number is generated and stored instantly.',
  },
  {
    step: 5,
    title: 'Optional: Link Existing Records to ABHA',
    icon: FileText,
    description:
      'After ABHA creation, your clinic software can optionally link the patient\'s existing health records (past prescriptions, lab reports, consultation notes) to the newly created ABHA — with the patient\'s consent. This creates immediate value for the patient: their history with your clinic is now part of their portable health record. Going forward, every new record created in your clinic is automatically linked (with consent), building their longitudinal health history visit by visit.',
    detail: 'Time: 10 seconds. Automatic when the software handles it.',
  },
];

const linkedRecords = [
  {
    icon: FileText,
    title: 'Every Prescription Becomes Part of a National Health Record',
    description:
      'When you write a prescription in ABDM-compliant software and the patient consents, the prescription is structured as a FHIR Bundle, digitally signed with your credentials, and linked to the patient\'s ABHA. The patient can view it in their PHR app. A referral specialist can access it with the patient\'s consent. A pharmacist can verify it. The prescription is no longer a piece of paper that gets crumpled in a bag — it is a permanent, verifiable, interoperable health record.',
  },
  {
    icon: BarChart3,
    title: 'Lab Reports Flow Back to You Automatically',
    description:
      'When you order lab tests for a patient with an ABHA ID, the lab (if ABDM-compliant) links the results back to the same ABHA. You receive the structured, machine-readable lab report in your clinic software — no phone calls, no "the patient brought the report but it is in Hindi/Marathi/illegible handwriting." The report is timestamped, digitally signed by the lab, and permanently part of the patient\'s record.',
  },
  {
    icon: Shield,
    title: 'Discharge Summaries and Referral Notes Travel With the Patient',
    description:
      'When a patient you referred to a hospital is discharged, the discharge summary is linked to their ABHA — and visible to you with their consent. You know exactly what was done, what medications were prescribed, and what follow-up is needed. The care continuum does not break at the hospital gate. The referral loop closes.',
  },
  {
    icon: TrendingUp,
    title: 'Longitudinal Health Data for Better Outcomes',
    description:
      'Over months and years, the ABHA-linked health record becomes an enormously valuable clinical asset. HbA1c trends over 18 months. Blood pressure control trajectory. Medication adherence patterns. What worked and what did not. This data is not locked in a paper file in a dusty cabinet — it is structured, queryable, and clinically actionable. This is precision medicine made practical for the Indian clinic.',
  },
];

const privacyConsent = [
  {
    icon: Lock,
    title: 'Patient Consent Is the Legal and Technical Gate',
    description:
      'Under ABDM, patient consent is not a checkbox — it is the architectural foundation. No health record is linked, shared, or accessed without explicit, informed patient consent. Consent is granular: the patient can consent to sharing their diabetes records but not their psychiatric records. Consent is revocable: the patient can withdraw consent at any time, and the system immediately stops sharing. Consent is auditable: every access is logged, and the patient can see who accessed what and when through their PHR app. This is not privacy theatre. This is infrastructure-level privacy by design.',
  },
  {
    icon: Shield,
    title: 'Data Minimization and Purpose Limitation',
    description:
      'The ABDM Personal Data Protection framework enforces data minimization: only the minimum data necessary for the specified purpose is shared. A pharmacy verifying a prescription sees the prescription only — not the patient\'s full health record. A lab processing a test order sees the test requisition — not the patient\'s consultation notes. Purpose limitation ensures data shared for clinical care cannot be repurposed for research, marketing, or insurance underwriting without separate, explicit consent.',
  },
  {
    icon: FileText,
    title: 'Your Clinic\'s Obligations Under ABDM Privacy Rules',
    description:
      'As a healthcare provider in the ABDM ecosystem, your obligations are straightforward: (1) Obtain consent before creating or linking an ABHA record. (2) Document consent in a retrievable format (your software does this). (3) Honour consent withdrawal immediately (your software handles this). (4) Ensure your staff understands that ABHA data is protected health information — the same confidentiality obligations that apply to paper records apply to digital ABHA-linked records, with the added requirement of auditability. (5) Use ABDM-compliant software that implements the consent framework correctly.',
  },
];

const abhaVsABDM = [
  {
    aspect: 'What It Is',
    abha: 'A unique 14-digit health ID number for each patient.',
    abdm: 'The entire national digital health mission — infrastructure, registries, standards, protocols.',
  },
  {
    aspect: 'Who It Applies To',
    abha: 'Individual patients. Every Indian can create one.',
    abdm: 'The entire healthcare ecosystem: patients, doctors, clinics, labs, pharmacies, insurers, and government.',
  },
  {
    aspect: 'What It Does',
    abha: 'Links all of a patient\'s health records to a single identity across providers.',
    abdm: 'Creates the interoperable network through which those linked records flow between providers.',
  },
  {
    aspect: 'Analogous To',
    abha: 'Your Aadhaar number — a unique, permanent identifier for one person.',
    abdm: 'The UPI infrastructure — the system that connects all accounts and enables transactions.',
  },
  {
    aspect: 'Registration',
    abha: 'Patient registers for ABHA once. Takes 60 seconds.',
    abdm: 'Clinic registers on HFR (facility) and doctors on HPR (professionals). Takes 30 minutes per clinic.',
  },
  {
    aspect: 'Required For Compliance',
    abha: 'No — ABHA is voluntary for patients. They can refuse.',
    abdm: 'Yes — ABDM compliance (HFR + HPR + digital records) is increasingly required for clinics.',
  },
  {
    aspect: 'Cost',
    abha: 'Free for the patient. Always.',
    abdm: 'Free for registration. Software subscription for ABDM-compliant record-keeping (Rs. 999-2,999/month).',
  },
];

const faqs = [
  {
    q: 'What is an ABHA ID and how is it different from Aadhaar?',
    a: 'Aadhaar is a general-purpose identity number issued by UIDAI for all purposes — banking, telecom, government benefits, etc. ABHA is a health-specific identity number issued by the National Health Authority under ABDM. Aadhaar is used to verify identity when creating an ABHA (through OTP or biometric), but the ABHA number itself is separate and unlinked from Aadhaar in the health record system. Your clinic never sees or stores the patient\'s Aadhaar number — you only see the ABHA number. The two are connected for identity verification at creation time only, then diverge.',
  },
  {
    q: 'Can I create an ABHA ID for a patient who does not have Aadhaar?',
    a: 'Yes. While Aadhaar is the preferred and fastest method, ABHA can be created using a mobile number alone (linked to Aadhaar indirectly), or using alternative government-issued identity documents such as a driving licence, voter ID, or passport. The NHA has specifically designed this flexibility to ensure ABHA coverage extends to citizens who may not have Aadhaar or who have Aadhaar-related issues. The clinic software handles the alternative verification path.',
  },
  {
    q: 'What if a patient refuses to create an ABHA ID? Can I still treat them?',
    a: 'Absolutely. ABHA is 100% voluntary. You cannot and should not refuse treatment to a patient who declines ABHA creation. Document their refusal in your records (your software should have a simple "Patient declined ABHA" checkbox) and continue providing care as normal. You can revisit the conversation at their next visit — many patients say no initially but agree later once they see other patients using it or understand the convenience benefits. The opt-in rate among patients who receive a clear explanation is over 80%.',
  },
  {
    q: 'How long does it take to create an ABHA ID for a patient?',
    a: 'Under 60 seconds from start to finish when using ABDM-compliant clinic software. The receptionist enters name and phone number, clicks "Create ABHA," the patient receives an OTP on their phone and shares it, the patient consents, and the ABHA is generated and stored. The entire process happens through the NHA gateway in the background. The only bottleneck is the patient\'s phone being available to receive the OTP, and the internet connection being functional. On a good 4G connection with a cooperative patient: 45 seconds flat.',
  },
  {
    q: 'Do I need special hardware to create ABHA IDs?',
    a: 'No special hardware required. ABHA creation via OTP works on any device with internet access — the same computer or tablet you use for clinic software. If you want to offer biometric-based ABHA creation (for patients without mobile phones or who prefer fingerprint), you need a UIDAI-certified biometric device (Rs. 2,000-5,000, available on Amazon). But OTP-based creation covers 95%+ of patients and requires nothing beyond your existing clinic computer. Start with OTP. Add biometric later only if your patient demographic warrants it.',
  },
  {
    q: 'Is patient data safe? Who can see ABHA-linked records?',
    a: 'Patient data safety is built into ABDM at the architectural level. Records are encrypted in transit and at rest. No provider — including you — can access any ABHA-linked record without explicit patient consent, logged and auditable, granted for a specific purpose and duration. Patients control everything through their PHR app: they see who accessed what, they grant and revoke consent, they set time limits. Even the NHA cannot browse patient records — the architecture prevents it. Your clinic software sees only the records the patient has specifically consented to share with your clinic. This privacy architecture is compliant with the Digital Personal Data Protection Act 2023.',
  },
  {
    q: 'What is the difference between ABHA and ABDM? People use them interchangeably.',
    a: 'ABHA (Ayushman Bharat Health Account) is the patient\'s health ID — a 14-digit number. ABDM (Ayushman Bharat Digital Mission) is the entire national digital health programme — the infrastructure, registries, standards, and protocols that make ABHA useful. Think of it this way: ABHA is your bank account number. ABDM is the UPI infrastructure that lets you send money between accounts. Without ABDM, ABHA is just a number. ABDM is what makes records flow between providers using that number. The terms get used interchangeably in conversation, but in technical and compliance contexts, the distinction matters.',
  },
  {
    q: 'Can existing patients get ABHA IDs linked retroactively to their old records?',
    a: 'Yes. When an existing patient visits next, create their ABHA ID (60 seconds at registration), and then — with their consent — link their existing records in your clinic software to the newly created ABHA. Most ABDM-compliant software has a "Link Existing Records to ABHA" function that does this in bulk. Going forward, all new records are auto-linked. Historical records from other clinics and labs that were created with ABHA linking will become visible when the patient consents to share them with you. The health history fills in from both directions: your clinic\'s past records get linked, and other providers\' records become accessible.',
  },
];

const internalLinks = [
  {
    title: 'ABDM Compliance for Clinics',
    description: 'Complete guide to ABDM compliance: registries, FHIR standards, digital signatures, compliance timeline, and government incentives.',
    href: '/abdm-compliance-clinic',
  },
  {
    title: 'India Clinic Digitization Guide',
    description: 'The step-by-step roadmap to digitizing your clinic. ABDM readiness, software selection, data migration, and the 6-phase go-live plan.',
    href: '/india-clinic-digitization-guide',
  },
  {
    title: 'Digital Prescription Software',
    description: 'How digital prescriptions work, ABDM compliance, SNOMED-CT coding, and sending prescriptions to patients via WhatsApp.',
    href: '/digital-prescription-software',
  },
  {
    title: 'Electronic Medical Records for Indian Clinics',
    description: 'Why EMRs matter, how they integrate with ABHA, and how digital records improve patient care and clinic efficiency.',
    href: '/electronic-medical-records',
  },
  {
    title: 'Clinic Regulatory Compliance India',
    description: 'Complete compliance guide: Clinical Establishments Act, drug records, biomedical waste, and digital record-keeping requirements.',
    href: '/clinic-regulatory-compliance-india',
  },
  {
    title: 'Best Clinic Management Software India',
    description: 'Compare Doxxy with other software. Detailed feature comparison, pricing breakdown, and ABDM compliance capabilities.',
    href: '/best-clinic-management-software-india',
  },
];

// --- ARTICLE STRUCTURED DATA ---

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: "ABHA ID for Clinics — A Doctor's Guide to Patient Health IDs",
  description:
    'Everything Indian doctors and clinics need to know about ABHA IDs. How to create them, link health records, manage patient consent, and understand the difference between ABHA and ABDM.',
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
    '@id': `${APP_URL}/abha-id-clinic-guide`,
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
      Updated June 2026 · For Doctors & Clinic Owners · Free Guide
    </div>
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      ABHA ID for Clinics — A Doctor's Guide to Patient Health IDs
    </h1>
    <SectionSubtitle>
      Everything you need to know about ABHA IDs: what they are, why your patients need them,
      how to create them during registration in under 60 seconds, privacy and consent rules,
      and how ABHA fits into the larger ABDM ecosystem.
    </SectionSubtitle>
    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Start Creating ABHA IDs <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
      <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600">
        <Link href="#how-to-create">How to Create ABHA IDs <ChevronRight className="ml-2 h-4 w-4" /></Link>
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
          <span><strong>ABHA is a 14-digit unique health ID for every Indian</strong> — like Aadhaar, but specifically for health records. It links every prescription, lab report, and discharge summary to one permanent, portable identity.</span>
        </li>
        <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
          <span className="text-blue-500 font-bold mt-0.5">2.</span>
          <span><strong>Creating an ABHA ID takes under 60 seconds</strong> — the patient provides their Aadhaar-linked mobile number, verifies via OTP, consents, and the system generates the ABHA. No special hardware needed. Your clinic software handles the entire NHA gateway interaction.</span>
        </li>
        <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
          <span className="text-blue-500 font-bold mt-0.5">3.</span>
          <span><strong>Patient consent is the core of ABHA privacy.</strong> Records are shared only with explicit, granular, revocable consent. The patient controls who sees what and for how long. Every access is logged and auditable.</span>
        </li>
        <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
          <span className="text-blue-500 font-bold mt-0.5">4.</span>
          <span><strong>ABHA is voluntary today, but increasingly expected.</strong> Insurance networks, government schemes, and specialty referrals are being routed through ABHA. Patients without ABHA will face friction in accessing the full healthcare system.</span>
        </li>
      </ul>
    </div>
  </Section>
);

const WhatIsABHASection = () => (
  <Section>
    <SectionTitle>What Is an ABHA ID? Three Layers of Understanding.</SectionTitle>
    <SectionSubtitle className="mt-4">
      The ABHA ID is simple on the surface — a 14-digit number. But what it enables is
      transformative. Here is what ABHA actually is, from identity layer to ecosystem glue.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 space-y-8">
      {whatIsABHA.map((item) => (
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

const WhyPatientsNeedSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Why Your Patients Need an ABHA ID — And Why Your Clinic Benefits.</SectionTitle>
    <SectionSubtitle className="mt-4">
      ABHA is not a government paperwork exercise. It has real, tangible benefits for patients
      and the clinics that serve them. Here are the four reasons it matters.
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 gap-8 mt-16">
      {whyPatientsNeedABHA.map((item) => (
        <div key={item.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <item.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{item.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
        </div>
      ))}
    </div>
  </Section>
);

const HowToCreateSection = () => (
  <Section id="how-to-create">
    <SectionTitle>How to Create ABHA IDs During Patient Registration.</SectionTitle>
    <SectionSubtitle className="mt-4">
      The complete 5-step workflow. From collecting patient information to linking existing
      records — all in under 60 seconds when handled by ABDM-compliant clinic software.
    </SectionSubtitle>
    <div className="mt-16 space-y-8">
      {creationSteps.map((s) => (
        <div key={s.step} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8 flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">{s.step}</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <s.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{s.title}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{s.description}</p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 inline-block">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">{s.detail}</p>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-200/50 dark:border-blue-800/50 text-center mt-12">
      <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5 mx-auto">
        <Zap className="h-7 w-7 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        Total Time for the Full Workflow: Under 60 Seconds.
      </h3>
      <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
        Add up the steps: 15 sec (info entry) + 20 sec (OTP) + 10 sec (consent) + 5 sec (generation)
        + 10 sec (linking) = 60 seconds. This is not a theoretical estimate — it is the real timing
        observed in clinics using ABDM-compliant software. The software handles every NHA gateway
        interaction in the background. Your receptionist stays in one screen. The patient waits less
        than they would for a chai.
      </p>
    </div>
  </Section>
);

const LinkedRecordsSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>ABHA-Linked Health Records — What Changes for Your Clinic.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Once a patient has an ABHA ID linked to their records, the way their health data flows
      changes fundamentally. Records become portable, interoperable, and cumulative.
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 gap-8 mt-16">
      {linkedRecords.map((item) => (
        <div key={item.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <item.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{item.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
        </div>
      ))}
    </div>
  </Section>
);

const PrivacySection = () => (
  <Section>
    <SectionTitle>Privacy & Patient Consent — The Architecture of Trust.</SectionTitle>
    <SectionSubtitle className="mt-4">
      ABDM has one of the world's most robust health data privacy frameworks. Here is how
      consent, data minimization, and audit trails protect your patients — and your clinic.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-16 space-y-8">
      {privacyConsent.map((item) => (
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

const ABHAvsABDMSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>ABHA vs ABDM — What Is the Difference?</SectionTitle>
    <SectionSubtitle className="mt-4">
      These two terms are used interchangeably so often that they have become confused.
      They are not the same thing. Here is the clear distinction — and why it matters
      when you are evaluating software or explaining the system to patients.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            <th className="text-left p-4 font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Aspect</th>
            <th className="text-left p-4 font-semibold text-blue-600 dark:text-blue-400 text-sm uppercase tracking-wider">ABHA</th>
            <th className="text-left p-4 font-semibold text-indigo-600 dark:text-indigo-400 text-sm uppercase tracking-wider">ABDM</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {abhaVsABDM.map((row) => (
            <tr key={row.aspect} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td className="p-4 font-medium text-gray-900 dark:text-white">{row.aspect}</td>
              <td className="p-4 text-gray-600 dark:text-gray-300">{row.abha}</td>
              <td className="p-4 text-gray-600 dark:text-gray-300">{row.abdm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8 mt-8 text-center max-w-3xl mx-auto">
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
        <strong className="text-gray-900 dark:text-white">Simple analogy:</strong> ABHA is your
        bank account number. ABDM is the UPI infrastructure that lets you send and receive money
        between accounts. Without ABDM, ABHA is just a number — nothing flows through it. Without ABHA,
        ABDM has no accounts to connect. They need each other. Your patients get ABHA. The government
        and software vendors build ABDM. Your clinic operates at the intersection — creating ABHA
        IDs and using ABDM-compliant software to make those IDs useful.
      </p>
    </div>
  </Section>
);

const FAQSection = () => (
  <Section>
    <SectionTitle>Questions Doctors Ask About ABHA IDs.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Practical answers to the questions that come up in every clinic evaluating ABHA
      adoption. No jargon. No marketing. Just what you need to know.
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
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Go Deeper. Explore Related Guides.</SectionTitle>
    <SectionSubtitle className="mt-4">
      ABHA is one piece of the digital health puzzle. These guides cover the full picture —
      from compliance to software selection to going completely paperless.
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
        Ready to start creating ABHA IDs for your patients? We can set you up with ABDM-compliant
        software and walk you through your first ABHA creation. Takes under 30 minutes.
      </p>
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Chat on WhatsApp — We'll Help You Start <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        Free setup walkthrough · No obligation · We answer honestly even if you choose different software
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

export default function AbhaIdClinicGuide() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <TLDRSection />
      <WhatIsABHASection />
      <WhyPatientsNeedSection />
      <HowToCreateSection />
      <LinkedRecordsSection />
      <PrivacySection />
      <ABHAvsABDMSection />
      <FAQSection />
      <InternalLinkHubSection />
      <SignupCTA
        heading="Start Creating ABHA IDs for Your Patients — in Under 60 Seconds Each."
        description="We will set you up with ABDM-compliant software and walk you through your first ABHA creation. Chat on WhatsApp — takes 5 minutes to get started."
        buttonText="Get ABHA-Ready Free"
        assurance="Free setup walkthrough · No obligations · Cancel anytime"
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
          { name: 'ABHA ID Guide for Clinics', url: `${APP_URL}/abha-id-clinic-guide` },
        ]}
      />
    </div>
  );
}
