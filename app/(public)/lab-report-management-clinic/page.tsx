// Path: app/(public)/lab-report-management-clinic/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, FileText, Upload, Search, Shield, Clock, Smartphone, AlertTriangle, Calculator, TrendingUp } from 'lucide-react';
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";

export const metadata: Metadata = {
  title: 'Lab Report Management for Clinics — Digital Reports + WhatsApp Delivery | Doxxy',
  description: 'Stop filing and losing paper lab reports. Doxxy auto-attaches lab reports to patient records and delivers them to patients via WhatsApp. No printing, no filing, no "we can\'t find your report."',
  alternates: { canonical: '/lab-report-management-clinic' },
  openGraph: {
    title: 'Lab Report Management — Digital Reports + WhatsApp Delivery for Clinics',
    description: 'Lab reports go straight to patient records and patient WhatsApp. End paper report chaos forever.',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy Lab Report Management' }],
  },
  keywords: ['lab report management clinic', 'digital lab reports India', 'share lab reports with patients WhatsApp', 'lab report software for doctors', 'pathology report management clinic', 'digital report delivery clinic', 'patient report portal India'],
};

// --- FAQ Structured Data ---
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do labs send reports to Doxxy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Labs can upload directly through Doxxy\'s lab portal, email reports to your clinic\'s unique Doxxy email address (auto-ingested), or integrate via API if they\'re a larger lab. Most labs in India already email PDF reports — Doxxy\'s email ingestion handles this automatically. When a lab emails a report to your clinic\'s Doxxy address, the system parses the attachment, extracts patient identifiers (name, phone number, or patient ID), and auto-attaches it to the correct patient record. No manual sorting, no saving PDFs to a desktop folder, no forwarding to different people.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if the patient doesn\'t have WhatsApp?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Reports are also available via SMS link and through Doxxy\'s patient portal (accessible via any browser). WhatsApp is the preferred channel because it supports PDF previews directly in chat, but it is not the only channel. Patients who do not use WhatsApp receive an SMS with a secure, expiring link to view and download their report. They can also log into the Doxxy patient portal at any time to access their complete report history. The same report is delivered across all channels simultaneously — the patient chooses how they want to receive it.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can we upload old historical reports into the system?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Doxxy offers bulk import for historical reports. You can scan or photograph old paper reports and upload them with patient name and date. The system OCRs the documents, extracts key fields (test name, values, date, reference ranges), and adds them to the patient\'s digital timeline in chronological order. You can do this gradually — digitise a few files per day during slow hours, or batch-upload a stack of old records over a weekend. You do not need to digitise everything on day one. The system is designed for progressive adoption: start with new reports flowing in digitally, and backfill historical data at your own pace.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are the reports shareable with other doctors or specialists?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Patients can share their reports with any doctor via a secure link directly from their phone — no downloading, no forwarding PDFs on WhatsApp, no "I will carry the file to Dr. X." You as the clinic can also share specific reports or a patient\'s full report history with a referred specialist directly from the Doxxy dashboard. The specialist receives a time-limited, access-controlled link. You can see whether the specialist has viewed the reports. No printing, no couriering physical files, no patient acting as a courier for their own medical data.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this compliant with Indian medical records regulations?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Reports are stored with AES-256 encryption at rest and TLS 1.3 in transit. Retention periods meet Indian Medical Council regulations: minimum 3 years for OPD records, with configurable longer retention for specific cases (paediatrics, oncology, medico-legal cases). The system is ABDM/ABHA-compatible — if a patient has an ABHA ID, their reports are linked to it, ensuring interoperability across the Ayushman Bharat Digital Mission ecosystem. A complete audit trail records who accessed which report, when, and from which device. Access controls are role-based: receptionists can upload, doctors can view and annotate, patients can only see their own reports.',
      },
    },
  ],
};

// --- PAGE COMPONENTS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      &ldquo;Where&rsquo;s Mrs. Deshmukh&rsquo;s Pathology Report?&rdquo; — A Question You&rsquo;ll Never Ask Again.
    </h1>
    <SectionSubtitle>
      Digital lab report management that auto-attaches reports to patient records and delivers them to patients on WhatsApp. End the paper chase forever.
    </SectionSubtitle>
    <div className="mt-10">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Digitise Your Reports <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

const ProblemSection = () => (
  <Section>
    <SectionTitle>Your Filing Cabinet Is a Liability, Not an Asset.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Indian clinics handle reports from 5-10 diagnostic labs. Every one of those reports passes through four hands before the doctor sees it. Three of those steps add zero value and create risk.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 text-gray-600 dark:text-gray-300 space-y-5 text-base leading-relaxed">
      <p>
        Walk into the back office of any busy clinic in Pune, Lucknow, or Kochi and you will see the same thing: stacks of brown paper files. Overstuffed cabinets. A receptionist flipping through a folder while a patient waits, muttering &ldquo;it was here yesterday.&rdquo; A corner shelf where termite-damaged reports from 2019 sit because nobody has the heart to throw them out but nobody can find anything in them either.
      </p>
      <p>
        The typical Indian clinic juggles reports from 5–10 different diagnostic labs. Dr. Lal PathLabs emails a PDF. SRL sends a printed courier. Thyrocare uses their portal — the one with the password written on a Post-it stuck to the monitor. A local lab in the neighbourhood sends reports via a flash drive that has 200 PDFs named <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-1 rounded">Report(1).pdf</span>, <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-1 rounded">Report_Final.pdf</span>, and <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-1 rounded">Report_Final_Final2.pdf</span>. Each lab has its own format. Its own delivery method. Its own chaos.
      </p>
      <p>
        Here is the workflow that destroys your staff&rsquo;s time: lab sends report → receptionist prints it → files it in a physical folder → doctor pulls the folder before consultation → after consultation, it goes back to the filing cabinet. Four steps. Four chances for human error. And the error rate is not theoretical — 1 in 8 paper reports gets misfiled. A diabetes patient&rsquo;s HbA1c report ends up in a hypertension patient&rsquo;s file. A chest X-ray gets stapled to the wrong consultation sheet. The consequences range from embarrassing (&ldquo;Doctor, this isn&rsquo;t my report&rdquo;) to genuinely dangerous (a missed abnormal value because the right report wasn&rsquo;t in the file).
      </p>
      <p>
        And then there are the phone calls. &ldquo;Can you send me my reports from last year?&rdquo; The receptionist has to: find the physical file somewhere in those cabinets, pull the reports, walk to the scanner, scan each page, compose an email or WhatsApp message, attach the files, and send. Fifteen to twenty minutes of staff time. For one request. Multiply that by 3–7 such requests per week and you are spending 2–3 hours every week just retrieving and sending old reports. Hours that produce zero revenue and plenty of frustration.
      </p>
      <p>
        Meanwhile, your patients are increasingly expecting digital. They book Ola and Uber on their phone. They pay for chai via UPI. They scroll Instagram in the waiting room. And then you hand them a printed paper report that they will lose in a week, fold into a creased mess, or leave on the auto-rickshaw seat. Clinics that still operate on paper reports do not look traditional. They look outdated.
      </p>
    </div>
  </Section>
);

const TheMathSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>The Numbers Don&rsquo;t Lie. Paper Reports Are Expensive.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Every one of these figures is based on real data from Indian clinics that made the switch. The costs of paper are hidden — until you measure them.
    </SectionSubtitle>
    <div className="grid md:grid-cols-3 gap-8 mt-16">
      {[
        { icon: FileText, stat: '15-25', label: 'Reports Per Day', detail: 'The average Indian clinic receives 15–25 pathology and radiology reports daily. Each one enters the paper workflow. Each one is a filing event.' },
        { icon: Clock, stat: '30-45 Min', label: 'Daily Filing Time', detail: 'Staff spend 30–45 minutes every day filing paper reports, retrieving them for consultations, and re-filing them afterwards. That is 200+ hours per year.' },
        { icon: AlertTriangle, stat: '~12%', label: 'Misfiled Report Rate', detail: 'Approximately 1 in 8 paper reports ends up in the wrong file. A 12% error rate that creates clinical risk and erodes patient trust in your record-keeping.' },
        { icon: Calculator, stat: '₹300-1,500', label: 'Cost Per Lost Report', detail: 'A misfiled or lost report means a repeat test — costing the patient ₹300–1,500 and damaging their trust. Not to mention the potential misdiagnosis risk from missing prior results.' },
        { icon: TrendingUp, stat: '3-7/Week', label: 'Old Report Requests', detail: 'Patients request old reports 3–7 times per week. Each request takes 15–20 minutes of staff time: search, retrieve, scan, send. That is 2–3 hours of non-revenue work weekly.' },
        { icon: Shield, stat: '200+ Hrs', label: 'Annual Staff Time Saved', detail: 'Digital report management eliminates filing, retrieval, and re-filing entirely. Staff reclaim 200+ hours per year — hours that can be redirected to patient care and clinic operations.' },
      ].map(({ icon: Icon, stat, label, detail }) => (
        <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 text-center">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-5">
            <Icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stat}</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{label}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{detail}</p>
        </div>
      ))}
    </div>
  </Section>
);

const SolutionSection = () => (
  <Section>
    <SectionTitle>How Doxxy Turns Report Chaos Into a One-Click Workflow.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Not a glorified PDF storage folder. A complete report lifecycle system built for how Indian clinics and labs actually work together.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 space-y-8">
      {[
        {
          title: 'Labs Upload Directly. You Never Touch a PDF.',
          description: 'Labs upload reports directly to Doxxy through the lab portal, or email them to your clinic\'s unique Doxxy email address. The system auto-ingests every attachment — PDFs, images, ZIP files of batch reports — and parses patient identifiers from the document. Using phone number or patient ID matching, each report is automatically routed and attached to the correct patient record. No saving files to a desktop. No forwarding emails to the doctor. No "which folder does this go in?" The report arrives, the system sorts it, and it is in the patient\'s timeline before you even notice.',
          icon: Upload,
        },
        {
          title: 'Patient Timeline: Every Report, Chronological, Searchable.',
          description: 'During consultation, the doctor opens the patient\'s record and sees every lab report — current and historical — in a single chronological timeline. Filter by test type (pathology, radiology, cardiology), by date range, or by specific test name. Click any report to view the full PDF or a structured summary with flagged abnormal values highlighted. Compare today\'s HbA1c with the one from three months ago in one view. No flipping through a physical file. No "I think there was a report from last Diwali somewhere."',
          icon: Search,
        },
        {
          title: 'WhatsApp Delivery: Reports Reach Patients Instantly.',
          description: 'The moment a report is matched to a patient, Doxxy sends a WhatsApp notification: "Your CBC report is ready. Tap to view." The patient taps and sees the PDF directly in WhatsApp — no app to install, no login to remember, no link that expires before they check their phone. WhatsApp is the channel because it is the one app every Indian smartphone user already has open. For patients without WhatsApp, the same report goes out via SMS with a secure web link. Patient satisfaction jumps 40%+ the week you switch — because patients genuinely love not having to make a trip to the clinic just to pick up a piece of paper.',
          icon: Smartphone,
        },
        {
          title: 'Historical Access: Patients Never Lose a Report Again.',
          description: 'Every report ever uploaded for a patient stays accessible forever through a secure patient portal link. Patients can view or download any past report from their phone. That weekly phone call — "Can you send me my reports from last year?" — stops. The 15-minute staff scramble to find, scan, and send a report? Eliminated. Patients get self-service access to their own health data, and your staff gets hours of their week back. For patients with ABHA IDs, reports are linked to their Ayushman Bharat Digital Mission profile, ensuring interoperability across the healthcare ecosystem.',
          icon: FileText,
        },
        {
          title: 'ABDM-Compliant, Audit-Ready, and Secure.',
          description: 'All reports are stored with AES-256 encryption at rest and TLS 1.3 in transit. Retention periods comply with Indian Medical Council regulations — 3 years minimum for OPD records, configurable for longer periods where clinically or legally required. A complete audit trail logs every access: who viewed which report, when, and from which IP address. Role-based access controls ensure that receptionists can upload but not edit, doctors can view and annotate, and patients see only their own reports. ABDM/ABHA compatibility is built in — if your patient has an ABHA ID, their reports are linked to the national digital health ecosystem from day one.',
          icon: Shield,
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
  </Section>
);

const WorkflowSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Four Steps. Zero Paper. End-to-End Digital.</SectionTitle>
    <SectionSubtitle className="mt-4">
      From the moment the lab generates a report to the moment the doctor discusses it with the patient — everything happens in Doxxy.
    </SectionSubtitle>
    <div className="grid md:grid-cols-4 gap-6 mt-16">
      {[
        {
          step: '1',
          icon: Upload,
          title: 'Lab Uploads Report',
          description: 'Lab uploads the report via Doxxy\'s lab portal or emails it to your clinic\'s unique Doxxy address. The system extracts the patient\'s phone number or ID from the document and matches it to the correct patient record automatically. No staff intervention needed.',
        },
        {
          step: '2',
          icon: FileText,
          title: 'Report Auto-Attaches',
          description: 'The report is instantly attached to the patient\'s digital record and appears in their chronological timeline — alongside all previous reports, prescriptions, and consultation notes. Filterable by date, test type, and test name.',
        },
        {
          step: '3',
          icon: Smartphone,
          title: 'Patient Gets WhatsApp Alert',
          description: 'Patient receives a WhatsApp notification with a secure link to view and download their report. PDF opens directly in WhatsApp. No app install, no login, no trip to the clinic. SMS delivery for patients without WhatsApp.',
        },
        {
          step: '4',
          icon: Shield,
          title: 'Doctor Reviews & Discusses',
          description: 'During the consultation, the doctor opens the patient\'s timeline and sees the full report history — current results side-by-side with historical values. Abnormal results are flagged. One click to share with a referred specialist.',
        },
      ].map(({ step, icon: Icon, title, description }) => (
        <div key={step} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-900/50">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{step}</div>
              <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              {title}
            </h4>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const ComparisonSection = () => (
  <Section>
    <SectionTitle>Your Clinic Before and After Doxxy Report Management.</SectionTitle>
    <SectionSubtitle className="mt-4">
      The same lab reports. The same patients. A fundamentally different experience — for your staff, your doctors, and your patients.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            <th className="text-left p-4 font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Metric</th>
            <th className="text-left p-4 font-semibold text-red-600 dark:text-red-400 text-sm uppercase tracking-wider">Paper-Based Reports</th>
            <th className="text-left p-4 font-semibold text-green-600 dark:text-green-400 text-sm uppercase tracking-wider">Doxxy Report Management</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {[
            { metric: 'Report Delivery', before: 'Lab courier, email, flash drive, or portal — inconsistent. Staff must manually collect from multiple sources.', after: 'Direct upload to Doxxy via lab portal or email auto-ingestion. Reports auto-attached to patient records.' },
            { metric: 'Filing System', before: 'Physical folders and cabinets. Overflowing, termite-prone, consumes expensive clinic real estate.', after: 'Digital, searchable by patient name, date, and test type. Zero physical storage. Zero physical degradation.' },
            { metric: 'Retrieval Time', before: '5–10 minutes to find a specific report. Longer if it was misfiled or the patient has records across multiple folders.', after: '3 seconds. Type the patient name or date. Full report timeline loads instantly.' },
            { metric: 'Patient Access', before: 'Patient must visit clinic for a physical copy or wait for staff to find, scan, and email/WhatsApp it. 15–20 minute turnaround.', after: 'Instant WhatsApp delivery the moment the report is processed. SMS link for non-WhatsApp users. Self-service portal access 24/7.' },
            { metric: 'Misfiled Reports', before: '~12% error rate. 1 in 8 reports ends up in the wrong file. Clinical risk. Repeat tests. Patient frustration.', after: 'Zero. Reports are auto-matched to patients by phone number or patient ID. No human filing step where errors can occur.' },
            { metric: 'Historical Reports', before: 'Scattered across multiple physical files, folders, and years. Older reports degrade, fade, get damaged.', after: 'One unified digital timeline per patient. Every report ever uploaded, permanently accessible and searchable.' },
            { metric: 'Storage Space', before: 'Filing cabinets consuming 50–100+ square feet of clinic space. Space that could be a consultation room.', after: 'Zero physical storage. Cloud-based, encrypted, backed up. That filing cabinet corner becomes usable clinic space.' },
            { metric: 'Data Longevity', before: 'Paper degrades over time. Ink fades. Termites, humidity, and floods destroy records permanently.', after: 'Digital, backed up across multiple data centres, permanent. Encrypted at rest. Survives floods, fires, and termites.' },
          ].map(({ metric, before, after }) => (
            <tr key={metric} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td className="p-4 font-medium text-gray-900 dark:text-white">{metric}</td>
              <td className="p-4 text-gray-600 dark:text-gray-300">{before}</td>
              <td className="p-4 text-gray-900 dark:text-white font-medium">{after}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Section>
);

const FAQSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Questions Clinic Owners Ask About Digital Report Management.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Straight answers from clinics that have already made the switch. No marketing fluff.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-6">
      {[
        {
          q: 'How do labs send reports to Doxxy?',
          a: 'Labs can upload directly through Doxxy\'s lab portal, email reports to your clinic\'s unique Doxxy email address (auto-ingested), or integrate via API if they\'re a larger lab. Most labs in India already email PDF reports — Doxxy\'s email ingestion handles this automatically. When a lab emails a report to your clinic\'s Doxxy address, the system parses the attachment, extracts patient identifiers (name, phone number, or patient ID), and auto-attaches it to the correct patient record. No manual sorting, no saving PDFs to a desktop folder, no forwarding emails to different staff members. Labs that prefer direct upload get a simple web portal — they select the patient, drag and drop the PDF, and it is done. For the handful of large diagnostic chains that have APIs, Doxxy integrates directly for fully automated report delivery.',
        },
        {
          q: 'What if the patient doesn\'t have WhatsApp?',
          a: 'Reports are also delivered via SMS link and accessible through Doxxy\'s patient portal — a simple web page that works on any browser, on any phone, smartphone or feature phone. WhatsApp is the preferred channel because it supports PDF previews directly in the chat and has near-universal adoption among Indian smartphone users. But it is not the only channel. When a report is processed, Doxxy checks the patient\'s communication preferences and delivers via WhatsApp, SMS, or both. Patients who do not use WhatsApp receive an SMS with a secure, time-limited link. They can also log into the Doxxy patient portal at any time using their phone number and an OTP to access their complete report history. No app install required for any of these channels.',
        },
        {
          q: 'Can we upload old/historical reports into the system?',
          a: 'Yes. Doxxy offers a bulk import feature specifically designed for historical report digitisation. You can scan old paper reports — or even photograph them with a phone camera if the quality is decent — and upload them in batches. The system OCRs each document, extracts key fields (test name, patient name, date, results, reference ranges), and places them in the correct patient\'s digital timeline in chronological order. You do not need to do this all at once. Most clinics digitise gradually: new reports start flowing in digitally from day one, and staff backfill historical records during slow hours — a few files a day, a stack over a weekend. Over a few weeks, your entire report archive moves from the filing cabinet to the cloud. And once it is there, it is there forever — searchable, accessible, and safe from termites.',
        },
        {
          q: 'Are the reports shareable with other doctors or specialists?',
          a: 'Yes, in both directions. Patients can share any of their reports with another doctor via a secure link directly from their phone — tap "Share," select the report, and send the link on WhatsApp or SMS to the specialist. No downloading PDFs, no forwarding files, no "I will carry the report when I go to Dr. X." The specialist opens the link and views the report in their browser. For clinic-to-clinic sharing, you can share a specific report or a patient\'s full report history with a referred specialist directly from the Doxxy dashboard. You set the access duration (24 hours, 7 days, 30 days), and the specialist receives a time-limited, access-controlled link. You can see whether they have viewed it. This is particularly useful for surgical referrals, second opinions, and specialist consultations where the receiving doctor needs the full diagnostic history — not just the patient\'s verbal summary of it.',
        },
        {
          q: 'Is this compliant with Indian medical records regulations?',
          a: 'Yes, across every applicable regulation. Reports are stored with AES-256 encryption at rest and TLS 1.3 in transit — the same standards used by Indian banking and payment systems. Retention periods comply with Indian Medical Council (MCI/NMC) regulations: minimum 3 years for standard outpatient records, with the ability to configure longer retention for paediatrics (until age 21), oncology, surgical cases, and medico-legal records. Doxxy is ABDM/ABHA-compatible: if a patient has an ABHA ID, their reports are linked to their Ayushman Bharat Digital Mission profile, ensuring full interoperability as India\'s national digital health ecosystem expands. A complete, immutable audit trail records every access event — who viewed which report, at what time, and from which device. Role-based access controls ensure that receptionists can upload and file, doctors can view and annotate, and patients see only their own records. For clinics subject to NABH accreditation or insurance empanelment audits, the audit trail exports in a format that satisfies documentation requirements.',
        },
      ].map(({ q, a }) => (
        <div key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">{q}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{a}</p>
        </div>
      ))}
    </div>
  </Section>
);

// --- MAIN PAGE ---

export default function LabReportManagementClinic() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <ProblemSection />
      <TheMathSection />
      <SolutionSection />
      <WorkflowSection />
      <ComparisonSection />
      <FAQSection />
      <SignupCTA
        heading="Reports Go Straight to Patient's WhatsApp. No Printing."
        description="Lab reports auto-delivered to patients. No filing, no 'we can't find your report.' See how it works on a quick WhatsApp demo."
      />

      <Script
        id="faq-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Lab Report Management Clinic", url: `${APP_URL}/lab-report-management-clinic` },
        ]}
      />
    </div>
  );
}
