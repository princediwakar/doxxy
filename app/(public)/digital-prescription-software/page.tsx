// Path: app/(public)/digital-prescription-software/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle, FileText, Clock, Languages, Shield, Printer, Smartphone, History, Zap, Stethoscope, AlertTriangle, Pill } from 'lucide-react';
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";

export const metadata: Metadata = {
  title: 'Digital Prescription Software India — 60-Second Rx, 13 Languages | Doxxy',
  description: 'Digital prescription software for Indian doctors. Move from illegible handwriting to 60-second digital prescriptions. Templates, drug interaction checks, print or send via WhatsApp. Built for doctors writing 40-60 Rx daily.',
  alternates: { canonical: '/digital-prescription-software' },
  openGraph: {
    title: 'Digital Prescription Software India — Stop Writing. Start Prescribing.',
    description: 'Move from illegible handwriting to 60-second digital prescriptions. Templates, drug interaction checks, and support for 13 Indian languages.',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Digital Prescription Software for Indian Doctors' }],
  },
  keywords: ['digital prescription software India', 'e-prescription software', 'digital Rx India', 'electronic prescription', 'prescription writing software', 'ABDM prescription'],
};

// --- FAQ Structured Data ---
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Are digital prescriptions legally valid in India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Digital prescriptions are legally valid in India under the Telemedicine Practice Guidelines (2020) issued by the Board of Governors of the Medical Council of India, in supersession of the Medical Council of India. A digital prescription carries the same legal weight as a handwritten one, provided it includes the doctor\'s registration number, digital signature or e-signature, patient details, diagnosis, prescribed medicines with dosage and duration, and the date of consultation. Doxxy prescriptions include all mandatory fields and are timestamped with the doctor\'s digital signature, making them fully compliant with Indian medical regulations. Additionally, Doxxy is aligned with ABDM (Ayushman Bharat Digital Mission) standards for digital health records.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use my existing prescription format in Doxxy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Doxxy allows complete customisation of your prescription template. You can upload your clinic letterhead, set your preferred layout (header, footer, font, logo placement), and choose which fields appear on the printed prescription. You can create multiple templates for different purposes — a detailed template for first-time consultations, a shorter follow-up template, and even specialty-specific templates. Many doctors take a photo of their existing prescription pad, and our onboarding team replicates the format in Doxxy at no charge. Your patients will receive prescriptions that look exactly like what they are used to, just clearer, more professional, and fully legible.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Doxxy check for drug interactions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Doxxy includes a built-in drug interaction checker with a database covering over 15,000 Indian brand-name and generic medicines. When you prescribe a medication, the system checks it against the patient\'s current medications (from their prescription history in Doxxy) and flags potential interactions — drug-drug, drug-allergy, and drug-condition — with severity ratings. For example, if a patient is already on a blood thinner and you prescribe an NSAID, Doxxy will alert you with the specific interaction, its clinical significance, and suggested alternatives. This feature is particularly valuable for chronic-disease patients on multiple medications. The interaction checker is a clinical decision-support tool — it flags risks, but you remain in full control of your prescribing decisions.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I print prescriptions from Doxxy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, and printing is one click. Doxxy prescriptions are designed for both digital delivery and physical printing. When you complete a prescription, you can print it directly on your clinic printer — formatted exactly to A4, A5, or your custom prescription pad size. The print layout includes your clinic letterhead, doctor details with registration number, patient information, diagnosis, medication table with dosage instructions, advice section, and follow-up date. For clinics that prefer to hand patients a printed prescription at the counter, the receptionist can also print from their screen after the doctor signs off. Printed prescriptions include a QR code that links to the digital record for verification.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can patients get their prescriptions on WhatsApp?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Once a prescription is completed and signed in Doxxy, it can be sent to the patient via WhatsApp as a PDF attachment with a single click. The WhatsApp delivery includes the prescription PDF, a text summary of the medicines prescribed with dosage instructions, and the follow-up date. This is especially useful for chronic patients who need to maintain their prescription records, for patients who lose paper prescriptions, and for telemedicine consultations where physical handover is not possible. The WhatsApp delivery also creates a digital record on the patient\'s phone, making it easy for them to show the prescription to any pharmacist. This feature ties directly into Doxxy\'s broader WhatsApp capabilities.',
      },
    },
  ],
};

// --- PAGE COMPONENTS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      Your Handwriting Is Putting Patients at Risk.
    </h1>
    <SectionSubtitle>
      Illegible prescriptions cause an estimated 7,000+ medication-error deaths annually in India. Doxxy gives you clear, professional, 60-second digital prescriptions that pharmacists can actually read — in 13 Indian languages.
    </SectionSubtitle>
    <div className="mt-10">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Start Prescribing Digitally <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

const ProblemSection = () => (
  <Section>
    <SectionTitle>The Cost of Bad Handwriting Is Higher Than You Think.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Every illegible prescription is a potential misdiagnosis, a frustrated pharmacist, and a patient who loses trust in your care.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 text-gray-600 dark:text-gray-300 space-y-5 text-base leading-relaxed">
      <p>
        You did not become a doctor to win a penmanship contest. You became a doctor to heal. But every day, after seeing 40-60 patients in a busy OPD in Nagpur or Jaipur, your hand hurts, your writing deteriorates, and a pharmacist in a crowded medical store squints at your prescription trying to decode whether you wrote "Cetzine 10mg" or "Cetrimide 10mg." That one misread character could mean the difference between treating an allergy and causing a chemical burn.
      </p>
      <p>
        Studies estimate that more than 7,000 deaths annually in India are attributable to medication errors — and a significant proportion trace back to illegible or ambiguous handwriting on prescriptions. Beyond the catastrophic cases, there is the daily friction: pharmacists calling your clinic to clarify drug names, patients returning because they received the wrong medication, and the quiet erosion of professional credibility when a patient sees the pharmacist struggling to read your writing.
      </p>
      <p>
        And it is not just about legibility. Handwritten prescriptions mean no systematic drug interaction checks. No easy access to a patient's medication history. No way to quickly pull up your go-to treatment protocol for allergic rhinitis without rewriting it from scratch. Every prescription is manual labour — writing drug names, dosages, frequencies, and advice. For a doctor seeing 50 patients a day, that is 50 times you write "Tab. Paracetamol 500mg 1-0-1 after food x 5 days." That repetition is not medicine. It is typing — by hand.
      </p>
      <p>
        The Indian healthcare ecosystem is also changing. ABDM (Ayushman Bharat Digital Mission) is pushing for standardised digital health records. Insurance companies increasingly require typed, coded prescriptions for claim processing — and <Link href="/clinic-billing-software" className="text-blue-600 hover:underline">integrated billing systems</Link> need coded diagnosis data to auto-generate accurate claims. And patients — especially younger, urban patients — expect the convenience of receiving prescriptions on their phones. Handwriting is not just risky. It is becoming obsolete.
      </p>
    </div>
  </Section>
);

const MathSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>The Numbers Behind the Pen.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Your prescription workflow can be 3x faster. Here is the data.
    </SectionSubtitle>
    <div className="grid md:grid-cols-3 gap-8 mt-16">
      {[
        { icon: Clock, stat: '90 Sec', label: 'Time Saved Per Patient', detail: 'Digital prescriptions take 30-45 seconds vs 2-3 minutes for handwritten. Over 50 patients, that saves over an hour daily.' },
        { icon: FileText, stat: '40-60', label: 'Prescriptions Written Daily', detail: 'The average Indian OPD doctor writes 40-60 prescriptions per day. Digital templates eliminate repetitive writing.' },
        { icon: AlertTriangle, stat: '7,000+', label: 'Annual Rx Error Deaths', detail: 'Studies estimate more than 7,000 medication-error deaths per year in India linked to prescription misinterpretation.' },
        { icon: Languages, stat: '13', label: 'Indian Languages Supported', detail: 'Doxxy prescriptions can be generated in Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, and 6 more languages.' },
        { icon: Zap, stat: '3 Clicks', label: 'Template Rx Generation', detail: 'Use pre-built specialty templates. Select diagnosis, pick from saved medication sets, review, and done — all in 3 clicks.' },
        { icon: Shield, stat: '15,000+', label: 'Drugs in Database', detail: 'Doxxy\'s medication database covers over 15,000 Indian brand-name and generic drugs with dosage and interaction data.' },
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
    <SectionTitle>Doxxy Digital Prescriptions: Built for Indian Doctors.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Not a generic e-prescription tool translated for India. Designed from the ground up for how Indian OPDs and clinics prescribe.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 space-y-8">
      {[
        {
          title: '60-Second Prescription Templates',
          description: 'Every specialty has its bread-and-butter cases. A dermatologist sees 15 acne patients a week. A general physician treats 20 cases of upper respiratory infection. Create prescription templates for your most common diagnoses — pre-filled with your preferred medicines, dosages, and advice. When a familiar case walks in, select the template, adjust one or two fields for the specific patient, and you are done. One template can save 90 seconds per patient. Over 50 patients a day, that is over an hour of clinical time reclaimed.',
          icon: Zap,
        },
        {
          title: 'Drug Interaction & Allergy Checker',
          description: 'Doxxy maintains a database of over 15,000 Indian medications — both brand names (like Crocin, Dolo, Azicip) and generic compounds — with interaction data. When you prescribe, the system cross-references against the patient\'s current medications and known allergies. A clear, colour-coded alert flags potential interactions with severity ratings and clinical recommendations. This is not a replacement for your clinical judgment — it is a quiet safety net that catches the interactions even the best doctors can miss on a busy day.',
          icon: Shield,
        },
        {
          title: '13 Indian Languages for Patient Instructions',
          description: 'Your prescription header can be in English, but the medicine instructions — the part patients actually need to understand — can be in Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu, or English. Set a default language for your clinic, or choose per patient. The instruction translation is not machine-generated gibberish — our templates use clinically accurate, colloquially appropriate phrasing that an elderly patient in a Tier-2 city can understand without assistance. The pharmacist reads the drug name in English. The patient reads "subah shaam ek goli khana khane ke baad" and knows exactly what to do.',
          icon: Languages,
        },
        {
          title: 'Print, WhatsApp, or Both — One Click',
          description: 'Complete the prescription and choose your delivery method: print on your clinic printer (A4, A5, or custom prescription pad size), send to patient via WhatsApp as a professionally formatted PDF, or both. For telemedicine consultations, the WhatsApp delivery is the primary handover. For in-person visits, you can print for immediate handover and WhatsApp a copy for the patient\'s records. Each printed prescription includes a QR code that links to the digital record. No more "Doctor, I lost my prescription" calls.',
          icon: Smartphone,
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
    <SectionTitle>Your New Prescription Workflow — 60 Seconds, Start to Finish.</SectionTitle>
    <SectionSubtitle className="mt-4">
      The fastest path from diagnosis to a printed prescription your patient and pharmacist can both read.
    </SectionSubtitle>
    <div className="grid md:grid-cols-4 gap-6 mt-16">
      {[
        { step: '1', title: 'Open Patient Record', description: 'Search by name, phone, or UHID. The patient\'s complete medical history, current medications, allergies, and past prescriptions load instantly.' },
        { step: '2', title: 'Select Diagnosis & Template', description: 'Choose the diagnosis from your specialty-specific template library. Your preferred medicines, dosages, and instructions auto-populate.' },
        { step: '3', title: 'Review & Customise', description: 'Adjust dosages, add or remove medications, check interaction alerts. Add specific advice or follow-up instructions. Takes 15-20 seconds.' },
        { step: '4', title: 'Sign, Print, or Send', description: 'Digital signature applied. One click to print on clinic printer. One click to WhatsApp the PDF to patient. Prescription saved to patient history.' },
      ].map(({ step, title, description }) => (
        <div key={step} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
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
  </Section>
);

const ResultsSection = () => (
  <Section>
    <SectionTitle>Your Prescribing — Before and After Doxxy.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Same doctor. Same patients. Radically different prescription experience.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            <th className="text-left p-4 font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Metric</th>
            <th className="text-left p-4 font-semibold text-red-600 dark:text-red-400 text-sm uppercase tracking-wider">Handwritten Rx</th>
            <th className="text-left p-4 font-semibold text-green-600 dark:text-green-400 text-sm uppercase tracking-wider">Doxxy Digital Rx</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {[
            { metric: 'Time Per Prescription', before: '2-3 minutes of writing', after: '30-60 seconds with templates' },
            { metric: 'Legibility', before: 'Depends on hand fatigue, patient volume', after: 'Crystal clear. Every time. Pharmacists love it.' },
            { metric: 'Drug Interaction Check', before: 'Relies on memory. No systematic check.', after: 'Automatic cross-reference against 15,000+ drugs and patient history.' },
            { metric: 'Medication History Access', before: 'Patient carries old Rx — if they remember.', after: 'Full history. Every prescription ever written in your clinic, searchable.' },
            { metric: 'Patient Understanding', before: 'Pharmacist translates. Patient may misunderstand.', after: 'Instructions in patient\'s language. Clear dosage in words, not abbreviations.' },
            { metric: 'Prescription Duplicate', before: 'Carbon copy. Fades. Gets lost.', after: 'Digital record forever. Reprint anytime. WhatsApp copy on patient\'s phone.' },
            { metric: 'Insurance Claim Support', before: 'Illegible Rx rejected by TPA.', after: 'Typed, coded, digitally signed. Insurer accepts first time.' },
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

const BonusFeaturesSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>More Than Prescriptions. A Complete Clinical Toolkit.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Four capabilities built into Doxxy that make prescribing just one part of a comprehensive digital clinical workflow.
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 gap-8 mt-16">
      {[
        {
          icon: Pill,
          title: 'Drug Database with Indian Brand Names',
          description: 'Search by brand name (Azee, Crocin, Dolo) or generic compound (Azithromycin, Paracetamol). The database covers 15,000+ medications available in the Indian market with standard dosages, available strengths, and price ranges. Frequently prescribed drugs appear in your favourites — no searching required.',
          items: ['15,000+ Indian brand and generic drugs', 'Standard dosage suggestions per age/weight', 'Strength variants auto-suggested', 'Favourites list for your top 20 drugs'],
        },
        {
          icon: Stethoscope,
          title: 'Specialty-Specific Templates',
          description: 'Templates for dermatology, paediatrics, cardiology, orthopaedics, ENT, ophthalmology, gynaecology, general practice, and more. Each template is built with input from practising specialists — not generic content. Use them as-is or customise every field.',
          items: ['12+ specialty template libraries', 'Custom template builder included', 'Share templates across doctors in your clinic', 'Import/export templates between clinics'],
        },
        {
          icon: History,
          title: 'Complete Prescription History',
          description: 'Every prescription ever written in Doxxy is stored and searchable. For a chronic diabetic patient visiting you for the 30th time, their entire medication journey — what was tried, what worked, what was changed — is visible in one timeline. No more relying on the patient\'s memory.',
          items: ['Full chronological prescription timeline', 'Filter by date, diagnosis, or medication', 'Quick comparison: last visit vs this visit', 'Export history for referral letters'],
        },
        {
          icon: Shield,
          title: 'ABDM-Aligned, Legally Compliant',
          description: 'Doxxy digital prescriptions meet all Indian regulatory requirements under the Telemedicine Practice Guidelines (2020) and are aligned with ABDM (Ayushman Bharat Digital Mission) standards for interoperability. Your prescriptions are future-proof.',
          items: ['MCI/NMC compliant prescription format', 'Digital signature with timestamp', 'ABDM health-record interoperability ready', 'Complete audit trail for medico-legal purposes'],
        },
      ].map(({ icon: Icon, title, description, items }) => (
        <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-5 leading-relaxed text-sm">{description}</p>
          <ul className="space-y-2">
            {items.map(item => (
              <li key={item} className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </Section>
);

const FAQSection = () => (
  <Section>
    <SectionTitle>Frequently Asked Questions.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Everything doctors ask about moving from handwritten to digital prescriptions.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-6">
      {[
        {
          q: 'Are digital prescriptions legally valid in India?',
          a: 'Yes, they are fully valid. The Telemedicine Practice Guidelines (March 2020), issued by the Board of Governors of the Medical Council of India, explicitly recognise digital prescriptions as legally equivalent to handwritten prescriptions. For a digital prescription to be valid, it must include the doctor\'s full name, registration number, the patient\'s name, the diagnosis, prescribed medicines with dosage and duration, the date, and the doctor\'s signature (digital or e-signature). Doxxy prescriptions include all these mandatory elements and are timestamped with the consulting doctor\'s digital credentials. Additionally, Doxxy is aligned with ABDM (Ayushman Bharat Digital Mission) standards, which the Indian government is actively promoting for interoperability of digital health records across the healthcare ecosystem.',
        },
        {
          q: 'Can I make Doxxy prescriptions look like my current prescription pad?',
          a: 'Yes. Template customisation is one of Doxxy\'s most-requested features, and it is fully supported. You can upload your clinic\'s letterhead, set your preferred layout (A4, A5, or prescription-pad size), choose fonts and colours, and select which fields appear. You can create multiple templates: a detailed template for first consultations, a compact follow-up template, and specialty-specific formats. Many doctors simply send us a photo of their existing prescription, and our onboarding team replicates it in Doxxy at no cost. The result: your patients get prescriptions that look exactly like your clinic\'s signature format — just typed, not handwritten. Your professional branding stays intact.',
        },
        {
          q: 'Does Doxxy check for drug interactions and allergies?',
          a: 'Yes. Doxxy includes a built-in clinical decision-support system with a database of over 15,000 Indian medications covering both brand names and generic compounds. When you prescribe a medication, the system automatically cross-references it against the patient\'s current active medications (from their prescription history in Doxxy), known allergies (from their patient record), and relevant conditions. If a potential interaction is detected, Doxxy displays a colour-coded alert: red for serious contraindications, amber for caution-required interactions, and blue for informational notes. Each alert includes the specific interaction, its clinical significance, and a list of suggested alternatives. This is a safety net — you remain fully in control of your prescribing decisions. It is especially valuable for elderly patients on polypharmacy and chronic-disease patients on multi-drug regimens.',
        },
        {
          q: 'Can I print prescriptions on paper?',
          a: 'Yes, and it is designed to be as fast as tearing a page off a prescription pad. Once you complete and sign a prescription in Doxxy, one click sends it to your clinic\'s printer — pre-formatted for A4, A5, or your custom prescription-pad paper size. The printed prescription includes your clinic letterhead, doctor\'s details with registration number, patient details, diagnosis, a clean medication table with dosage and duration, any advice or follow-up notes, and a QR code that links to the digital record. If your receptionist handles printing, they can do it from their own screen while the patient waits at the counter. The entire print-and-handover process takes under 10 seconds. Most clinics keep a dedicated prescription printer at the reception desk for exactly this purpose.',
        },
        {
          q: 'Can I send prescriptions to patients via WhatsApp?',
          a: 'Yes, and this is one of the most popular features among Doxxy doctors. After completing a prescription, you (or your receptionist) can send it to the patient via WhatsApp as a professionally formatted PDF with a single click. The WhatsApp message includes the prescription PDF, a text summary of medicines with dosage instructions in the patient\'s preferred language, and the follow-up date. This is ideal for several scenarios: telemedicine consultations where physical handover is impossible; chronic patients who need a digital copy for their records; patients who frequently lose paper prescriptions; and clinics that want to reduce paper usage. The WhatsApp copy stays on the patient\'s phone, so they can show it to any pharmacist even weeks later. This feature works seamlessly with Doxxy\'s broader WhatsApp communication suite for <Link href="/whatsapp-appointment-reminders" className="text-blue-600 hover:underline">appointment reminders</Link> and lab report delivery.',
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

// --- MAIN PAGE ---

export default function DigitalPrescriptionSoftware() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <ProblemSection />
      <MathSection />
      <SolutionSection />
      <WorkflowSection />
      <ResultsSection />
      <BonusFeaturesSection />
      <FAQSection />
      <SignupCTA
        heading="Write Prescriptions in 60 Seconds, Not 5 Minutes"
        description="See Doxxy's digital prescription workflow — templates, drug interaction checks, 13 Indian languages. A quick WhatsApp demo tailored to your specialty."
      />

      <Script
        id="faq-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Digital Prescription Software", url: `${APP_URL}/digital-prescription-software` },
        ]}
      />
    </div>
  );
}
