// Path: app/(public)/multi-specialty-clinic-software/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle, Stethoscope, FileText, Pill, Heart, Baby, Bone, Ear, Scan, Users, Clock, TrendingUp, LayoutDashboard, ReceiptIndianRupee } from 'lucide-react';
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";

export const metadata: Metadata = {
  title: 'Multi-Specialty Clinic Software India — One Platform, Every Specialty | Doxxy',
  description: 'Multi-specialty clinic management software for Indian polyclinics. Specialty-specific SOAP templates, prescription formularies, and billing codes — dermatology, gynecology, pediatrics, orthopedics, ENT, general medicine — all under one login. Built for clinics with 3-15 specialties seeing 50-150 patients/day.',
  alternates: { canonical: '/multi-specialty-clinic-software' },
  openGraph: {
    title: 'Multi-Specialty Clinic Software India — One Platform, Every Workflow',
    description: 'Dermatologists, gynecologists, pediatricians, and orthopedics each get their own templates, formularies, and billing codes — under one roof, one patient record, one billing system.',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Multi-Specialty Clinic Software for Indian Polyclinics' }],
  },
  keywords: ['multi specialty clinic software', 'polyclinic management software', 'multi doctor clinic software', 'multi specialty hospital management system', 'polyclinic software India', 'clinic management software multiple specialties', 'multi specialty practice management', 'specialty specific clinic software', 'polyclinic billing software', 'clinic software for dermatology gynecology pediatrics'],
};

// --- FAQ Structured Data ---
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can Doxxy handle 10+ specialties in one clinic?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Doxxy is designed for polyclinics running anywhere from 3 to 15 or more specialties under one roof. Each specialty operates with its own configured SOAP templates, prescription formularies, billing codes, and clinical workflows — but all share a centralised patient record and billing system. A patient registered once at reception is visible to every specialist they visit during that appointment, with each specialist seeing their own specialty-adapted interface. The system has been deployed at polyclinics in Delhi, Mumbai, and Bangalore with 10+ specialties and 20+ doctors running on the same instance without performance degradation or workflow conflicts.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can each doctor customise their own prescription templates?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Each specialty — and within that specialty, each individual doctor — can have their own prescription templates. Dermatologists can set up templates with common topical medication combinations and cosmetic procedure protocols. Pediatricians can build age-segmented prescription defaults (infant, toddler, adolescent) with weight-based dosage suggestions. General physicians can create templates for the 20 most common conditions they treat — fever, URTI, hypertension follow-up, diabetes review — and generate prescriptions in under 30 seconds. Templates are configured once and available permanently, but every prescription remains fully editable for individual patient variation.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does billing work differently for different specialties?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. Each specialty in Doxxy has its own billing code set: consultation rates (new vs follow-up), procedure charges, and package pricing. A dermatology consultation with a chemical peel procedure is billed differently from an orthopedic consultation with an X-ray review and physiotherapy recommendation. When a patient sees multiple specialists in a single visit, Doxxy compiles all charges into one consolidated bill with a specialty-wise breakup. The patient pays once, the system auto-splits revenue by department, and the evening report shows exactly how much each specialty contributed. GST is calculated correctly per line item with HSN codes mapped to each specialty\'s services.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can patients see multiple specialists in one visit — how does that work in Doxxy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'This is one of Doxxy\'s core design features. A patient registers once at the central reception desk. The receptionist can book them into multiple specialist queues simultaneously or sequentially. Each specialist opens the same patient record but sees their own specialty-specific interface: the dermatologist sees the skin examination template with image attachment fields, the general physician sees a standard SOAP note template, and the cardiologist sees ECG upload fields and cardiac history. All notes are written into the same unified patient record — so when the dermatologist refers the patient to the general physician, the GP can read the dermatologist\'s findings, prescriptions, and images without asking the patient to repeat their history. At billing, all consultation charges, procedures, and pharmacy items from every specialty are compiled into a single bill. The patient pays once.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do you handle specialty-specific medical codes and terminology?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doxxy maintains a comprehensive medical terminology database that is filtered and surfaced by specialty context. For diagnosis coding, Doxxy supports ICD-10 with specialty-specific subsets — so a dermatologist searching for "acne" sees L70.0-L70.9 variants, while a cardiologist searching "chest pain" sees I20-I25 ischemic heart disease codes. For procedures, each specialty has its own CPT and SNOMED-aligned code sets. Drug formularies are also specialty-aware: dermatology sees topical agents, antifungals, and retinoids; gynecology sees hormonal therapies, prenatal supplements, and contraceptives; pediatrics sees weight-adjusted formulations and vaccination schedules. All coding happens in the background — doctors write in plain clinical language, and Doxxy maps to appropriate codes for billing and records.',
      },
    },
  ],
};

// --- PAGE COMPONENTS ---

const HeroSection = () => (
  <Section className="text-center !pt-28 md:!pt-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      One Clinic. Five Specialties.<br className="hidden md:block" /> Zero Chaos.
    </h1>
    <SectionSubtitle>
      A dermatologist&apos;s SOAP note looks nothing like a cardiologist&apos;s. Doxxy adapts to every specialty — same platform, different workflows. Specialty-specific templates, formularies, and billing codes under one login.
    </SectionSubtitle>
    <div className="mt-10">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">See How Multi-Specialty Works <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

const ProblemSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Multi-Specialty Clinics Run on Compromises. Until They Don&apos;t.</SectionTitle>
    <SectionSubtitle className="mt-4">
      The choice that polyclinic owners face every day: force doctors into generic workflows, or juggle multiple systems.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 text-gray-600 dark:text-gray-300 space-y-5 text-lg leading-relaxed">
      <p>
        Walk into any multi-specialty polyclinic in Koramangala, Andheri, or Lajpat Nagar, and you will see the same scene: a dermatologist squinting at a general medicine form, writing skin-specific observations in the margins. A gynecologist maintaining a separate paper register for pregnancy tracking because the software does not have an antenatal scheduler. The receptionist calling across departments — &ldquo;Ortho, did you file Mr. Sharma&apos;s X-ray report under his name or yours?&rdquo; The accountant reconciling three different billing formats at month-end. This is not chaos. This is what happens when software designed for single-specialty clinics is forced onto multi-specialty practices.
      </p>
      <p>
        The options available to polyclinic owners have always been bad. Option one: buy a generic clinic management system and force every specialist into the same template. The dermatologist gets a form designed for a general physician. The pediatrician cannot record growth percentiles because the system has no growth-chart fields. The orthopedist&apos;s X-ray reports get uploaded to a generic &ldquo;Documents&rdquo; section because there is no imaging module. Doctors tolerate it for a month, then go back to writing paper notes. The software becomes an expensive patient-register app — used by reception, ignored by doctors.
      </p>
      <p>
        Option two: maintain separate systems per specialty — a dermatology EMR, a gynecology practice manager, a general billing tool. This is worse. A patient visiting three specialists registers three times, fills three forms, gets three bills, and leaves with three different file numbers. The reception desk runs three software tabs and still cannot tell an inquiring patient which department has their lab result. Reconciliation across systems is a monthly nightmare that eats 3-4 days of the accountant&apos;s time. The clinic owner cannot answer the most basic business question: &ldquo;Which specialty is making money?&rdquo;
      </p>
      <p>
        Both options cost the same thing: doctor time wasted on bad interfaces, billing leakage from disconnected systems, patient frustration from repeated registrations, and an owner flying blind on revenue. A polyclinic with four specialties and 80 patients a day can easily lose ₹8,000-₹12,000 daily to these structural inefficiencies — not through anyone&apos;s fault, but through a software architecture that was never designed for multi-specialty reality.
      </p>
    </div>
  </Section>
);

const MathSection = () => (
  <Section>
    <SectionTitle>The Arithmetic of Specialty Adaptation.</SectionTitle>
    <SectionSubtitle className="mt-4">
      When software matches a doctor&apos;s workflow, every patient interaction gets faster. Compounded across a polyclinic, the numbers are staggering.
    </SectionSubtitle>
    <div className="grid md:grid-cols-3 gap-8 mt-16">
      {[
        { icon: Clock, stat: '12 min', label: 'Avg Time Per Patient (Generic Software)', detail: 'When a dermatologist fights a general medicine template, each consultation takes 12 minutes on average. Extra time goes to writing specialty notes in free-text fields, hunting for the right billing code, and attaching images in workarounds.' },
        { icon: TrendingUp, stat: '7 min', label: 'Avg Time Per Patient (Doxxy)', detail: 'Specialty-specific templates, pre-configured drug formularies, and auto-mapped billing codes cut consultation time to 7 minutes. Doctors spend time on clinical decisions — not on fighting the interface.' },
        { icon: Clock, stat: '400 min/day', label: 'Time Recovered Across the Clinic', detail: '5 minutes saved per patient × 80 patients/day = 400 minutes (6.6 hours) of doctor time recovered daily. That is essentially an additional part-time doctor\'s capacity freed up — without hiring anyone.' },
        { icon: Users, stat: '165 hrs/month', label: 'Monthly Capacity Unlocked', detail: '6.6 hours/day × 25 working days = 165 hours/month. At an average consultation value of ₹500, that is ₹82,500/month in additional billable capacity — from the same doctors, same clinic, same hours.' },
        { icon: ReceiptIndianRupee, stat: '₹8,000-12,000', label: 'Daily Leakage from Disconnected Systems', detail: 'Manual billing across specialties loses 3-6% of revenue: missed procedure charges, untracked inter-department referrals, pharmacy items not linked to consultations. Unified billing eliminates this entirely.' },
        { icon: LayoutDashboard, stat: 'Real-Time', label: 'Revenue by Specialty', detail: 'Instead of waiting until month-end to know which department performed, the polyclinic owner sees revenue per specialty, per doctor, per service — updated live, every single day.' },
      ].map(({ icon: Icon, stat, label, detail }) => (
        <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-200/75 dark:border-gray-700/50 shadow-sm">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <Icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stat}</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{label}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{detail}</p>
        </div>
      ))}
    </div>
  </Section>
);

const SolutionSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>The Specialty-Adaptation Engine.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Every specialty gets its own brain. One platform runs them all. No compromises.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 space-y-8">
      {[
        {
          title: 'Custom SOAP Templates Per Specialty',
          description: 'Dermatology gets skin-diagram annotation fields and treatment-progress photo documentation. Gynecology gets a pregnancy tracker, antenatal visit scheduler, menstrual history timeline, and ultrasound report linking. Cardiology gets ECG reference fields, blood pressure trending, and 2D echo integration. Orthopedics gets X-ray/MRI linking, range-of-motion tracking, and surgical planning notes. Pediatrics gets growth-chart auto-plotting (WHO and IAP standards), vaccination scheduler with WhatsApp reminders to parents, and family-linked sibling records. General medicine gets fast SOAP notes with the 30 most common Indian OPD presentations pre-templated. Every specialty sees exactly the fields it needs — no more, no less.',
          icon: FileText,
        },
        {
          title: 'Specialty-Specific Prescription Formularies',
          description: 'Dermatology prescriptions pull from topical agents, antifungals, retinoids, and cosmetic procedure aftercare protocols. Gynecology defaults to hormonal therapies, prenatal supplements (iron, folic acid, calcium), and contraceptive options with dosage guidance. Pediatrics surfaces weight-based dosing calculators and age-segmented medication lists — infants, toddlers, adolescents, each with different default regimens. Orthopedics offers pain management protocols, calcium/vitamin D supplements, and physiotherapy prescriptions with exercise diagrams. ENT prescriptions include nasal sprays, antihistamine combinations, and post-surgical care instructions. Each doctor can further personalise their top 20 prescription templates for one-click prescribing.',
          icon: Pill,
        },
        {
          title: 'Specialty-Wise Billing Codes & Pricing',
          description: 'Every specialty in Doxxy carries its own billing configuration: consultation rates (new vs follow-up), procedure charges, package pricing, and HSN/SAC codes for GST. Dermatology bills cosmetic procedures at cosmetic rates. Gynecology bills antenatal packages across multiple visits. Pediatrics bills vaccination administration separately from the vaccine cost. Orthopedics bills plaster application, joint injections, and physiotherapy sessions. When a patient sees multiple specialists, all charges compile into one consolidated bill with a clear specialty-wise breakup — patient pays once, system auto-splits revenue by department.',
          icon: ReceiptIndianRupee,
        },
        {
          title: 'Specialty-Wise Analytics Dashboard',
          description: 'The polyclinic owner logs into a single dashboard and sees: revenue per specialty (today, this week, this month), patient volume per department, average consultation value per specialty, top procedures per department, doctor-wise performance within each specialty, and pharmacy/dispensary revenue by specialty referral. No waiting for the accountant to compile monthly reports. No guessing which department is profitable. Real-time visibility into every specialty\'s contribution, with drill-down to individual doctor and service level.',
          icon: LayoutDashboard,
        },
      ].map(({ title, description, icon: Icon }) => (
        <div key={title} className="flex gap-6 items-start">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-10 text-center">
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        All of this under one login, one patient record, one billing system. No separate software. No separate databases. No reconciliation manual labour. <Link href="/features" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Explore all features &rarr;</Link>
      </p>
    </div>
  </Section>
);

const SpecialtyGridSection = () => (
  <Section>
    <SectionTitle>Six Specialties. Six Different Workflows. One Platform.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Doxxy adapts to how each specialty actually works — not the other way around.
    </SectionSubtitle>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
      {[
        {
          icon: Scan,
          specialty: 'Dermatology',
          bullets: [
            'Photo documentation with side-by-side treatment progress comparison',
            'Cosmetic procedure billing: peels, lasers, fillers — separate pricing',
            'Chronic condition tracking: psoriasis PASI scores, acne grading, eczema severity',
          ],
          link: '/specialties',
        },
        {
          icon: Heart,
          specialty: 'Gynecology',
          bullets: [
            'Pregnancy tracker with trimester-wise antenatal visit scheduler',
            'Menstrual history timeline, obstetric history, and ultrasound report linking',
            'Contraceptive counselling notes, PAP smear reminders, and menopause management',
          ],
          link: '/specialties',
        },
        {
          icon: Baby,
          specialty: 'Pediatrics',
          bullets: [
            'WHO/IAP growth charts auto-plotted from recorded measurements',
            'Vaccination scheduler with automated WhatsApp reminders to parents',
            'Family-linked records: siblings, parent history, shared contact for follow-ups',
          ],
          link: '/specialties',
        },
        {
          icon: Bone,
          specialty: 'Orthopedics',
          bullets: [
            'X-ray, MRI, and CT scan integration with annotated findings fields',
            'Physiotherapy session tracking: exercise protocol, progress notes, discharge criteria',
            'Surgical planning notes: implant details, post-op protocol, follow-up schedule',
          ],
          link: '/specialties',
        },
        {
          icon: Ear,
          specialty: 'ENT',
          bullets: [
            'Audiometry record integration and hearing-loss progression tracking',
            'Endoscopy image capture with annotated findings and procedure notes',
            'Sinus surgery follow-up protocols and post-operative care instructions',
          ],
          link: '/specialties',
        },
        {
          icon: Stethoscope,
          specialty: 'General Medicine',
          bullets: [
            '30 most common Indian OPD presentations pre-templated for sub-60-second SOAP notes',
            'Common prescription templates: URTI, fever, hypertension, diabetes, gastritis',
            'Referral management: seamless handoff to in-house specialists with clinical context',
          ],
          link: '/specialties',
        },
      ].map(({ icon: Icon, specialty, bullets, link }) => (
        <div key={specialty} className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-200/75 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <Icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{specialty}</h3>
          <ul className="space-y-3 mb-6">
            {bullets.map((bullet) => (
              <li key={bullet.slice(0, 40)} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
          <Link href={link} className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline inline-flex items-center gap-1">
            All specialties <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ))}
    </div>
  </Section>
);

const WorkflowSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>One Patient. Multiple Specialties. One Seamless Flow.</SectionTitle>
    <SectionSubtitle className="mt-4">
      What happens when a patient visits three specialists in your polyclinic — powered by Doxxy.
    </SectionSubtitle>
    <div className="grid md:grid-cols-4 gap-6 mt-16">
      {[
        { step: '1', title: 'Register', description: 'Patient arrives at central reception. Registers once. Receptionist books them into dermatology, general medicine, and pharmacy queues — all from one screen. One file number for the entire visit.' },
        { step: '2', title: 'Consult', description: 'Dermatologist opens patient record, sees dermatology SOAP template with skin-diagram fields. Diagnoses, prescribes, attaches photos. GP opens same record, sees dermatologist\'s notes, picks GP template. No repeated history. No paper handoffs.' },
        { step: '3', title: 'Bill', description: 'System auto-compiles all charges: dermatology consultation, GP consultation, dermatology prescriptions, GP prescriptions, pharmacy items. One consolidated bill with specialty-wise breakup. Patient pays once via UPI QR or cash.' },
        { step: '4', title: 'Report', description: 'WhatsApp receipt sent to patient with line items by specialty. Owner\'s dashboard updates in real time: revenue from dermatology, revenue from GP, pharmacy dispensation, total collections. End-of-day report ready with one click.' },
      ].map(({ step, title, description }) => (
        <div key={step} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden shadow-sm">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-900/50">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{step}</div>
              {title}
            </h4>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
          </div>
        </div>
      ))}
    </div>
    <div className="max-w-3xl mx-auto mt-12 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50">
      <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
        <strong className="text-gray-900 dark:text-white">No duplicate registration.</strong> No &ldquo;which file did cardiology put the ECG in?&rdquo; No &ldquo;sorry sir, your lab report is in the other system.&rdquo; No &ldquo;I have three bills from three departments, which one do I pay first?&rdquo; One patient. One record. One bill. Every specialty working in its own language — but speaking to the same system.
      </p>
    </div>
  </Section>
);

const ResultsSection = () => (
  <Section>
    <SectionTitle>Dr. Kapoor&apos;s Polyclinic. Lajpat Nagar, Delhi.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Six specialties. Twelve doctors. One platform. Here is what changed.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 md:p-8 border border-gray-200/75 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
            Before Doxxy
          </h3>
          <ul className="space-y-3">
            {[
              '3 different software systems — one for EMR, one for billing, one for pharmacy',
              '2 receptionists whose primary job was coordinating records between departments',
              'Monthly financial reconciliation took 4 full working days',
              'Patient wait time averaged 45 minutes from check-in to first consultation',
              'Lost billing slips from inter-department referrals — estimated 15-18% leakage',
              'New doctor onboarding took 10-14 days to learn 3 different systems',
            ].map((item) => (
              <li key={item.slice(0, 40)} className="flex items-start gap-3 text-gray-600 dark:text-gray-300 text-sm">
                <span className="text-red-400 mt-1 flex-shrink-0">&times;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 md:p-8 border border-gray-200/75 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block"></span>
            After Doxxy
          </h3>
          <ul className="space-y-3">
            {[
              '1 platform — EMR, billing, pharmacy, analytics, all integrated',
              '1 receptionist handles all check-ins and billing — freed up one full-time salary',
              'Reconciliation is real-time — month-end closing takes 2 hours, not 4 days',
              'Patient wait time dropped from 45 minutes to 18 minutes',
              'Revenue up 22% — no more lost billing slips, every inter-department referral tracked',
              'New doctors productive in 2 days — specialty templates are pre-configured, not built from scratch',
            ].map((item) => (
              <li key={item.slice(0, 40)} className="flex items-start gap-3 text-gray-600 dark:text-gray-300 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="text-center text-gray-500 dark:text-gray-400 text-sm italic">
        Results from Dr. Kapoor&apos;s Polyclinic, Lajpat Nagar, Delhi. 6 specialties — Dermatology, Gynecology, Pediatrics, Orthopedics, ENT, General Medicine. 12 doctors. 80-100 patients/day. Transitioned to Doxxy in 2025. Individual clinic results may vary based on patient volume, specialty mix, and existing process maturity.
      </p>
    </div>
  </Section>
);

const ComparisonSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Multi-Specialty Management: Before Doxxy vs After Doxxy.</SectionTitle>
    <SectionSubtitle className="mt-4">
      The same clinic, the same specialties. Radically different operations.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 overflow-hidden rounded-2xl border border-gray-200/75 dark:border-gray-700/50 shadow-sm">
      {/* Header */}
      <div className="grid grid-cols-3">
        <div className="p-4 bg-gray-100 dark:bg-gray-700 font-semibold text-gray-900 dark:text-white text-sm">Process</div>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-semibold text-sm">Before Doxxy</div>
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">After Doxxy</div>
      </div>
      {/* Rows */}
      {[
        {
          process: 'Patient Registration',
          before: 'Fill 3 different forms at 3 different departments. Three file numbers for one patient.',
          after: 'Register once at central reception. Records visible to all specialists instantly.',
        },
        {
          process: 'Doctor Experience',
          before: 'Generic template designed for general medicine. Specialists write specialty notes in margins.',
          after: 'Specialty-specific templates. Dermatology sees skin diagrams. Gynecology sees pregnancy tracker.',
        },
        {
          process: 'Prescriptions',
          before: 'Different prescription pads per doctor. Illegible handwriting. No drug interaction checks.',
          after: 'Digital, legible, specialty-specific formularies. Auto drug-interaction and allergy checks.',
        },
        {
          process: 'Billing',
          before: 'Collect cash at each department. Manually reconcile at month-end. Lost inter-department charges.',
          after: 'Single consolidated bill split by specialty automatically. Patient pays once. Revenue auto-attributed.',
        },
        {
          process: 'Patient Records',
          before: '3 separate files in 3 separate cabinets. No specialist sees what the other wrote.',
          after: '1 unified digital record. Every specialist sees every other specialist\'s notes, prescriptions, and attachments.',
        },
        {
          process: 'Revenue Visibility',
          before: 'Wait until month-end for the accountant\'s report. Guess which department performed.',
          after: 'Real-time dashboard by specialty, doctor, and service type. Know exactly where revenue comes from.',
        },
        {
          process: 'New Doctor Onboarding',
          before: '2 weeks to learn 3 different systems. Each system has different shortcuts, different workflows.',
          after: '2 days. Specialty templates are pre-configured. Doctors see the interface built for their specialty on day one.',
        },
        {
          process: 'Pharmacy Integration',
          before: 'Pharmacy runs on a separate system. No link between prescription written and medicine dispensed.',
          after: 'Prescriptions flow directly to pharmacy. Dispensation auto-updates inventory and adds to the patient bill.',
        },
      ].map(({ process, before, after }, idx) => (
        <div key={process} className={`grid grid-cols-3 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
          <div className="p-4 font-medium text-gray-900 dark:text-white text-sm">{process}</div>
          <div className="p-4 text-gray-600 dark:text-gray-300 text-sm">{before}</div>
          <div className="p-4 text-gray-900 dark:text-white text-sm font-medium">{after}</div>
        </div>
      ))}
    </div>
  </Section>
);

const FAQSection = () => (
  <Section>
    <SectionTitle>Frequently Asked Questions.</SectionTitle>
    <SectionSubtitle className="mt-4">
      What polyclinic owners and medical directors ask about running multiple specialties on Doxxy.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-6">
      {[
        {
          q: 'Can Doxxy handle 10+ specialties in one clinic?',
          a: 'Yes. Doxxy is designed for polyclinics running anywhere from 3 to 15 or more specialties under one roof. Each specialty operates with its own configured SOAP templates, prescription formularies, billing codes, and clinical workflows — but all share a centralised patient record and billing system. A patient registered once at reception is visible to every specialist they visit during that appointment, with each specialist seeing their own specialty-adapted interface. The system has been deployed at polyclinics in Delhi, Mumbai, and Bangalore with 10+ specialties and 20+ doctors running on the same instance without performance degradation or workflow conflicts.',
        },
        {
          q: 'Can each doctor customise their own prescription templates?',
          a: 'Yes. Each specialty — and within that specialty, each individual doctor — can have their own prescription templates. Dermatologists can set up templates with common topical medication combinations and cosmetic procedure protocols. Pediatricians can build age-segmented prescription defaults (infant, toddler, adolescent) with weight-based dosage suggestions. General physicians can create templates for the 20 most common conditions they treat — fever, URTI, hypertension follow-up, diabetes review — and generate prescriptions in under 30 seconds. Templates are configured once and available permanently, but every prescription remains fully editable for individual patient variation.',
        },
        {
          q: 'Does billing work differently for different specialties?',
          a: 'Absolutely. Each specialty in Doxxy has its own billing code set: consultation rates (new vs follow-up), procedure charges, and package pricing. A dermatology consultation with a chemical peel procedure is billed differently from an orthopedic consultation with an X-ray review and physiotherapy recommendation. When a patient sees multiple specialists in a single visit, Doxxy compiles all charges into one consolidated bill with a specialty-wise breakup. The patient pays once, the system auto-splits revenue by department, and the evening report shows exactly how much each specialty contributed. GST is calculated correctly per line item with HSN codes mapped to each specialty\'s services.',
        },
        {
          q: 'Can patients see multiple specialists in one visit — how does that work in Doxxy?',
          a: 'This is one of Doxxy\'s core design features. A patient registers once at the central reception desk. The receptionist can book them into multiple specialist queues simultaneously or sequentially. Each specialist opens the same patient record but sees their own specialty-specific interface: the dermatologist sees the skin examination template with image attachment fields, the general physician sees a standard SOAP note template, and the cardiologist sees ECG upload fields and cardiac history. All notes are written into the same unified patient record — so when the dermatologist refers the patient to the general physician, the GP can read the dermatologist\'s findings, prescriptions, and images without asking the patient to repeat their history. At billing, all consultation charges, procedures, and pharmacy items from every specialty are compiled into a single bill. The patient pays once.',
        },
        {
          q: 'How do you handle specialty-specific medical codes and terminology?',
          a: 'Doxxy maintains a comprehensive medical terminology database that is filtered and surfaced by specialty context. For diagnosis coding, Doxxy supports ICD-10 with specialty-specific subsets — so a dermatologist searching for "acne" sees L70.0-L70.9 variants, while a cardiologist searching "chest pain" sees I20-I25 ischemic heart disease codes. For procedures, each specialty has its own CPT and SNOMED-aligned code sets. Drug formularies are also specialty-aware: dermatology sees topical agents, antifungals, and retinoids; gynecology sees hormonal therapies, prenatal supplements, and contraceptives; pediatrics sees weight-adjusted formulations and vaccination schedules. All coding happens in the background — doctors write in plain clinical language, and Doxxy maps to appropriate codes for billing and records.',
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
  </Section>
);

const InternalLinksSection = () => (
  <Section>
    <SectionTitle>More Resources for Polyclinic Owners.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Essential reads on scaling a multi-specialty practice, managing revenue, and reducing operational overhead.
    </SectionSubtitle>
    <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
      {[
        {
          title: 'Multi-Clinic Management: Scaling Your Practice',
          href: '/blog/multi-clinic-management-scaling-practice',
          description: 'How to scale from one clinic to multiple locations without multiplying operational complexity.',
        },
        {
          title: 'Revenue Cycle Management for Indian Clinics',
          href: '/blog/revenue-cycle-management-strategies',
          description: 'From patient registration to final payment — close the gaps that leak revenue at every step.',
        },
        {
          title: 'Billing Software for Indian Clinics',
          href: '/clinic-billing-software',
          description: 'Automated billing, GST compliance, UPI payments, and real-time revenue dashboards.',
        },
      ].map(({ title, href, description }) => (
        <Link key={href} href={href} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow group">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
          <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium mt-3">
            Read more <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      ))}
    </div>
  </Section>
);


// --- MAIN PAGE ---

export default function MultiSpecialtyClinicSoftware() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <ProblemSection />
      <MathSection />
      <SolutionSection />
      <SpecialtyGridSection />
      <WorkflowSection />
      <ResultsSection />
      <ComparisonSection />
      <FAQSection />
      <InternalLinksSection />
      <SignupCTA
        heading="Different Specialties, Different Workflows, One Platform"
        description="Dermatology, dental, gynecology — each with its own templates. See how Doxxy handles multi-specialty clinics on a quick WhatsApp call."
      />

      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Multi-Specialty Clinic Software", url: `${APP_URL}/multi-specialty-clinic-software` },
        ]}
      />
    </div>
  );
}
