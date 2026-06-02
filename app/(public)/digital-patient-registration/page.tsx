// Path: app/(public)/digital-patient-registration/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import { Button } from "@/components/ui/button";
import { ArrowRight, QrCode, ClipboardList, Smartphone, Shield, FileText, Clock, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";

export const metadata: Metadata = {
  title: 'Digital Patient Registration — QR-Based Paperless Check-in for Clinics | Doxxy',
  description: 'Replace paper intake forms with QR-based digital patient registration. Patients fill forms on their phone — data auto-populates the EMR. Save 2 minutes per patient, eliminate data entry errors.',
  alternates: { canonical: '/digital-patient-registration' },
  openGraph: {
    title: 'Digital Patient Registration — Paperless Check-in for Indian Clinics',
    description: 'QR-code patient intake that auto-fills your EMR. No more paper forms, no more data entry.',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy Digital Patient Registration' }],
  },
  keywords: ['digital patient registration', 'online patient intake form', 'paperless patient check-in', 'QR code patient registration India', 'digital patient form clinic', 'patient registration software India', 'clinic check-in system'],
};

// --- DATA ---

const workflowSteps = [
  {
    step: 1,
    icon: QrCode,
    title: 'Patient Scans QR Code',
    description: 'A QR code sits at your reception desk and in the waiting area. Patient opens their phone camera, scans the code — no app download needed. The digital intake form opens instantly in their browser. Available in 13 Indian languages including Hindi, Tamil, Telugu, Marathi, Bengali, and Gujarati.',
  },
  {
    step: 2,
    icon: Smartphone,
    title: 'Fills Form on Their Phone',
    description: 'Patient enters name, phone number, age, chief complaint, and relevant medical history. Takes 60-90 seconds on average. Returning patients see their data pre-filled — they just confirm or update. No receptionist involvement needed.',
  },
  {
    step: 3,
    icon: Zap,
    title: 'Data Auto-Populates the EMR',
    description: 'On submit, all patient data flows directly into your Doxxy EMR. Patient is automatically added to the queue. No typing by reception staff. No copy-paste. No "please fill this again" for repeat visitors.',
  },
  {
    step: 4,
    icon: ClipboardList,
    title: 'Doctor Opens Patient File',
    description: 'When the doctor opens the patient file for consultation, everything is already there — today\'s complaint, past visit history, previous prescriptions, attached lab reports. Complete context. Zero setup time. Consultation starts immediately.',
  },
];

const beforeAfterRows = [
  {
    area: 'Check-in Time',
    before: '5-8 minutes per patient. Receptionist hands over clipboard, patient fills form, receptionist types data into computer. Every. Single. Visit.',
    after: '60-90 seconds on patient\'s own phone. Receptionist is not involved. Data is already digital, already in the EMR.',
  },
  {
    area: 'Staff Involvement',
    before: 'Full receptionist attention required for every registration. Handing forms, explaining fields, deciphering handwriting, typing data, filing paper.',
    after: 'Zero staff involvement in the intake step. Receptionist is freed for billing, calls, follow-ups, and patient care — not form processing.',
  },
  {
    area: 'Data Accuracy',
    before: '8% error rate in paper forms. Illegible handwriting leads to wrong names, wrong phone numbers, wrong diagnoses downstream. Wrong phone = lost patient.',
    after: 'Under 1% error rate. Typed input. Phone number validated at entry. No handwriting to decipher. Clean, accurate data from day one.',
  },
  {
    area: 'Repeat Visits',
    before: 'Patient fills the exact same information every single visit. Name, address, phone, history — all written fresh on a new paper form. Every time.',
    after: 'Returning patient data is pre-filled. Patient confirms or updates their details. Takes 20 seconds. No frustration. No "why do I have to write this again?"',
  },
  {
    area: 'Filing & Storage',
    before: 'Paper forms stuffed into cabinets, folders, and shelves. Searching takes minutes. Misfiling is common. Monsoon humidity destroys paper.',
    after: 'All data is digital, searchable in 3 seconds by name or phone number. No cabinets. No misfiling. No monsoon damage.',
  },
  {
    area: 'Patient Experience',
    before: 'Frustrating wait at reception desk. Searching for a pen that works. Squinting at small font. Writing the same details for the 5th time this year.',
    after: 'Modern, fast, impressive. Patient fills the form on their own phone in their own language. Feels like a tech-forward clinic, not a government office.',
  },
  {
    area: 'Language Barriers',
    before: 'Form is in English or one local language. Patients who speak other languages struggle. Receptionist spends time translating each field verbally.',
    after: 'Form available in 13 Indian languages. Patient selects their language. Reads and fills comfortably. No translation assistance needed.',
  },
];

const faqs = [
  {
    question: 'What if a patient does not have a smartphone?',
    answer: 'No patient is turned away. Your receptionist can enter the patient\'s details on a tablet or computer using the same digital form. The experience is identical — the patient just provides their information verbally while the receptionist types. JioPhone users and elderly patients without smartphones are fully accommodated. In fact, clinics using Doxxy report that even patients without smartphones appreciate the efficiency — they do not have to write anything, just answer the receptionist\'s questions while the data is entered directly into the system.',
  },
  {
    question: 'Is patient data secure on a phone-based form?',
    answer: 'Yes. All data transmission between the patient\'s phone and our servers is encrypted over HTTPS (TLS 1.3). Patient data is never stored on the phone itself — the form is a web page that sends data directly to secure cloud servers. Our infrastructure runs on enterprise-grade cloud with AES-256 encryption at rest, regular security audits, and role-based access controls. We comply with ABDM (Ayushman Bharat Digital Mission) guidelines and international standards including HIPAA. No patient data is ever shared with third parties. You control who on your staff can view, edit, or export patient information.',
  },
  {
    question: 'Can we customize the registration form for our specialty?',
    answer: 'Yes, fully. Dermatologists can add fields for skin history, current skincare routine, and previous treatments. Gynecologists can add obstetric history, menstrual cycle details, and pregnancy-related questions. ENT specialists can add allergy fields, previous surgeries, and environmental exposure questions. Orthopedics can add injury history, physiotherapy records, and mobility assessment. Pediatricians can add vaccination history, developmental milestones, and birth details. Every specialty gets a form that collects exactly the information needed — no irrelevant fields, no missing critical data. You can add, remove, or reorder fields anytime. Changes reflect instantly on the patient-facing form.',
  },
  {
    question: 'What happens to our existing paper records?',
    answer: 'Doxxy offers a bulk digitization service for clinics transitioning from paper. Our team works with your staff to scan, OCR (Optical Character Recognition), and import existing patient records into the digital system. Each patient file is digitized as a PDF attachment linked to their new digital profile. For clinics with smaller volumes (under 500 patient files), staff can photograph or scan records directly into the system over a few days. For larger clinics, we deploy a migration team that works on-site or takes your records for scanning at our facility — all under strict chain-of-custody protocols. Zero data loss. Every existing patient file becomes searchable and accessible in the new system.',
  },
  {
    question: 'How do patients book follow-up appointments after digital registration?',
    answer: 'Once a patient completes their digital registration and their consultation ends, Doxxy automatically sends a WhatsApp message with a personalized link to book their next appointment. The patient\'s details are already in the system — booking is a one-tap action. No re-entering name, phone, or history. The patient selects a date and time slot from your available calendar, confirms, and receives an instant WhatsApp confirmation. Automated reminders are sent 24 hours and 2 hours before the appointment. This closed loop — register, consult, rebook — dramatically improves patient retention and follow-up compliance. Clinics using Doxxy report a 40% increase in repeat appointment bookings within the first 3 months.',
  },
];

// --- PAGE SECTIONS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      Your Patients Deserve a Check-in That Takes Seconds, Not Minutes.
    </h1>
    <SectionSubtitle>
      Replace clipboards and paper forms with a QR-code intake system that auto-fills patient data directly into your EMR. No typing. No filing. No "please fill this again."
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
    <SectionTitle>Paper Registration Is the Silent Bottleneck in Every Indian Clinic.</SectionTitle>
    <SectionSubtitle className="mt-4">
      You may not notice it because it has always been this way. But the cost is real — in time, money, errors, and patient trust.
    </SectionSubtitle>

    <div className="mt-12 max-w-4xl mx-auto space-y-6 text-gray-600 dark:text-gray-300">
      <p className="text-lg leading-relaxed">
        Walk into any Indian clinic at 9:30 AM and look at the reception desk. What do you see? Clipboards. Paper forms. A pen tied to a string. A receptionist simultaneously answering phone calls, handing out forms, and typing yesterday's registrations into a computer. Patients hovering over the desk asking "madam, yeh kya likhna hai?" in three different languages. A pile of completed forms growing unchecked. Someone's form just got coffee spilled on it. Another patient left because the queue at the desk was too long.
      </p>

      <p className="text-lg leading-relaxed">
        This is not a one-off bad morning. This is every morning in thousands of clinics across India — from single-doctor OPDs in tier-3 towns to multi-specialty clinics in Mumbai and Delhi. The paper registration process has not changed in 40 years. Yet everything else in the clinic has modernized — diagnostics, prescriptions, billing. Registration remains the stubborn, slow, error-prone anchor that drags down the entire patient flow.
      </p>

      <div className="space-y-5 mt-8">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 rounded-xl p-6">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">The Repeat Form Trap</p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Every new patient fills a registration form. Every revisit — another form. In many clinics, the same patient fills the same details 5+ times a year. Name, address, phone number, medical history — written fresh on paper every single time. Patients get frustrated. "Maine pichle hafte hi toh bhara tha." Staff shrugs. There is no other way.
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 rounded-xl p-6">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">The Data Entry Tax</p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            After the paper form is filled, someone — usually the receptionist or a data entry operator — has to type all that information into a computer or maintain a register. This is double work. It takes 2-3 additional minutes per patient. At 40 patients a day, that is 2-3 hours of pure administrative typing. Time that could be spent on patient calls, billing follow-ups, or simply reducing the chaos at the front desk.
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 rounded-xl p-6">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">The Legibility Lottery</p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Illegible handwriting on paper forms leads to wrong phone numbers, misspelled names, and incorrect medical histories. A "7" looks like a "1". "Sharma" becomes "Shamra". A phone number with one digit wrong means the clinic can never contact that patient again. These errors compound over time. Wrong data entered at registration flows into prescriptions, lab orders, and follow-up reminders. Clinical decisions get made based on incorrect patient information. The cost of a bad data entry is invisible — until it is not.
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30 rounded-xl p-6">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">The Peak Hour Collapse</p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            During flu season, monsoon outbreaks, or peak OPD hours (9-11 AM), the registration desk becomes the bottleneck. Patients wait 20+ minutes just to get registered — before they even see the doctor. The receptionist is overwhelmed. Forms pile up faster than they can be processed. The doctor is sitting idle because no registered patient file is ready. The entire clinic throughput collapses because of a paper form that should take 60 seconds.
          </p>
        </div>
      </div>

      <p className="text-lg leading-relaxed mt-8">
        The root cause is simple: paper registration separates the patient&apos;s data from the clinic&apos;s digital system. Someone has to bridge that gap manually — by typing, filing, searching. Every manual step introduces delay, error, and cost. Digital registration eliminates that gap entirely. The patient provides data directly into the EMR. No bridge needed.
      </p>
    </div>
  </Section>
);

const MathSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>The Numbers Make the Case.</SectionTitle>
    <SectionSubtitle className="mt-4">
      What paper-based registration costs your clinic — in time, money, and missed opportunities.
    </SectionSubtitle>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
          <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">3-5 min</div>
        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Per Paper Registration</div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">The average time from "please fill this form" to data entered in the system. Multiply by 40 patients daily and you lose 2-3.3 hours of staff time every single day — time that produces zero clinical value.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">60-100 hrs</div>
        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Staff Time Lost Monthly</div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Per month, your reception staff spends the equivalent of 2.5 full work weeks just on registration paperwork. That is time that could be spent on patient engagement, follow-up calls, billing, and improving front-desk experience.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-3xl font-bold text-red-500 dark:text-red-400 mb-1">1 in 12</div>
        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Forms Have Data Errors</div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Approximately 8% of paper registration forms contain at least one data entry error — wrong phone number, misspelled name, incorrect age. One wrong digit in a phone number means a patient is permanently unreachable for follow-ups, reports, and appointment reminders.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mb-4">
          <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">60-90 sec</div>
        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Digital Registration Time</div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">With Doxxy, patients complete registration on their own phone in 60-90 seconds. Zero staff time. Data flows directly into the EMR. No typing. No filing. The receptionist is freed for higher-value work.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mb-4">
          <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">700+ hrs</div>
        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Staff Hours Saved Annually</div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Over a year, digital registration saves over 700 staff hours for a clinic seeing 40 patients daily. At a conservative ₹200/hour cost, that is ₹1.5-2.5 lakh in annual labor savings — enough to hire additional clinical staff or invest in patient amenities.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mb-4">
          <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">&lt;1%</div>
        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Error Rate with Digital</div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Typed input with phone number validation drops the error rate from 8% to under 1%. Clean, accurate data from day one means reliable follow-ups, correct prescriptions, and trustworthy patient records. No more squinting at handwriting.</p>
      </div>
    </div>
  </Section>
);

const SolutionSection = () => (
  <Section>
    <SectionTitle>How Doxxy Digital Registration Works.</SectionTitle>
    <SectionSubtitle className="mt-4">
      A QR code at your reception desk replaces clipboards, pens, and hours of staff typing. Here is exactly how.
    </SectionSubtitle>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 flex flex-col">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
          <QrCode className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">QR Code at Reception</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm flex-grow">
          Display a QR code at the reception desk and in the waiting area. No special hardware needed — print it on a standee, show it on a tablet screen, or include it in your WhatsApp auto-reply. The QR code is unique to your clinic and never changes.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 flex flex-col">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
          <Smartphone className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Phone-Based, No App Needed</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm flex-grow">
          Patient scans the QR with their phone camera — any smartphone, any brand, any OS. The form opens directly in the browser. No app download, no sign-up, no account creation. Works on ₹6,000 Android phones and ₹1.2 lakh iPhones alike.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 flex flex-col">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
          <svg className="h-7 w-7 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6 6-6"/><path d="M5 16h14"/></svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">13 Indian Languages</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm flex-grow">
          The registration form is available in 13 Indian languages including Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu, and English. Patients switch languages with one tap. No more language barrier at the registration desk.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 flex flex-col">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
          <ClipboardList className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Smart Pre-Fill for Returns</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm flex-grow">
          Returning patients are recognized by their phone number. Their previous data — name, age, address, medical history — is pre-filled. They review, update if needed, and submit. Takes 20 seconds instead of 90. The "I filled this last week" frustration disappears permanently.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 flex flex-col">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
          <Zap className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Auto-Populates the EMR</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm flex-grow">
          On form submission, patient data flows directly into your EMR. Patient is automatically queued for consultation. The doctor opens the file and sees everything — today's complaint, past visits, prescriptions, attached reports. Zero manual data entry. Zero delay.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 flex flex-col">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
          <Shield className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Encrypted & ABDM Compliant</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm flex-grow">
          All data transmitted over HTTPS (TLS 1.3), encrypted at rest with AES-256. Never stored on the patient's phone. Role-based access controls ensure only authorized staff can view patient data. Compliant with ABDM guidelines and international healthcare data protection standards.
        </p>
      </div>
    </div>
  </Section>
);

const WorkflowSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>How It Works. In 4 Simple Steps.</SectionTitle>
    <SectionSubtitle className="mt-4">
      From patient arrival to doctor consultation — a registration flow that takes 60 seconds, not 5 minutes.
    </SectionSubtitle>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
      {workflowSteps.map((step) => (
        <div key={step.step} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 relative">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mb-4">
            {step.step}
          </div>
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-3">
            <step.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
      The difference is not incremental. Every aspect of patient registration changes — for your staff and your patients.
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
    <SectionSubtitle className="mt-4">
      Common questions about switching from paper forms to digital patient registration.
    </SectionSubtitle>

    <div className="max-w-3xl mx-auto mt-16 space-y-6">
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

const FinalCTASection = () => (
  <Section className="text-center">
    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
      Ready to Retire Your Clipboards?
    </h2>
    <SectionSubtitle>
      Join clinics across India that have replaced paper forms with digital intake. Your patients fill the form on their phone, in their language. Data flows directly into your EMR. Zero typing. Zero filing. Zero "please fill this again."
    </SectionSubtitle>
    <div className="mt-10">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Start Free Practice <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

// --- MAIN PAGE COMPONENT ---

export default function DigitalPatientRegistration() {
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
      <FinalCTASection />
      <SignupCTA
        heading="QR-Code Check-In. 2 Minutes Saved Per Patient."
        description="Patients scan a QR code, fill intake once, and it auto-fills the EMR. No more 'fill this form again.' See it in action on WhatsApp."
      />

      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: APP_URL },
          { name: 'Digital Patient Registration', url: `${APP_URL}/digital-patient-registration` },
        ]}
      />
      <Script
        id="digital-registration-faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </div>
  );
}
