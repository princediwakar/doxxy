// Path: app/(public)/clinic-software-new-clinic/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import { ArrowRight, ClipboardList, Rocket, Building, Smartphone, FileText, Stethoscope, Users, TrendingUp, Shield, Zap, IndianRupee } from 'lucide-react';
import { Button } from "@/components/ui/button";
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";

export const metadata: Metadata = {
  title: 'New Clinic Setup Software — Start Digital From Day 1 | Doxxy',
  description: 'Opening a new clinic? Do not start with paper. Our clinic startup software + launch checklist helps you set up legally, train staff, and go digital before your first patient walks in. From step 1, not step 5.',
  alternates: { canonical: '/clinic-software-new-clinic' },
  openGraph: {
    title: 'New Clinic Setup Software — Your Digital Launch Partner',
    description: 'The first 90 days determine whether your clinic survives. Start with Doxxy on Day 1 — registration, software, staff training, patient onboarding. Complete launch checklist included.',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'New Clinic Setup Software for Indian Clinics' }],
  },
  keywords: ['opening a new clinic software', 'clinic startup software India', 'new clinic setup checklist', 'clinic launch software', 'new clinic management system', 'clinic registration software India', 'start clinic digital'],
};

// --- FAQ Structured Data ---
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'I have not opened my clinic yet — can I set up Doxxy before launch?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. In fact, that is exactly how we recommend doing it. You can create your Doxxy account during the pre-launch phase, and our onboarding team will help you configure everything before opening day: your speciality-wise prescription templates, billing rates with GST, consultation types, staff roles, and clinic branding. When your first patient walks in, your receptionist already knows the software, your templates are ready, and you are billing digitally from patient one. No backlog. No transition. No chaos.',
      },
    },
    {
      '@type': 'Question',
      name: 'What hardware do I need to run Doxxy in a new clinic?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doxxy works on what you already own. A laptop or desktop for the doctor (any Windows or Mac machine from the last 5 years), a laptop or tablet for the reception desk, and a smartphone for UPI payment collection. That is it. No servers, no on-premise installations, no expensive hardware procurement. Doxxy runs entirely in the browser and updates automatically. For clinics that want a leaner setup, many of our clinics run the reception dashboard on a ₹15,000 Chromebook or an Android tablet. Internet access is required — we recommend a basic broadband connection with a 4G dongle as backup.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take to set up Doxxy before opening?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A fully configured Doxxy setup takes 2-3 working days from account creation to go-live readiness. Day 1: you create your account and our team schedules a 45-minute onboarding call to understand your speciality, clinic size, and workflow. Day 1-2: we pre-configure your prescription templates, billing rates, GST details, and user accounts for each staff member. Day 2-3: we do a 30-minute training walkthrough with you and your receptionist over a video call. By the end of day 3, your clinic is fully digital and ready for patients. There is no coding, no configuration complexity, and no technical knowledge required on your part.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can Doxxy handle multiple doctors if I expand later?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Doxxy is built for clinics that grow. You can start with a single doctor and add more doctors, specialities, and consultation rooms as your practice expands. Each doctor gets their own login, their own appointment queue, their own prescription templates, and their own billing tracking. The admin dashboard gives you a consolidated view across all doctors — revenue per doctor, patient load, consultation duration, and prescription patterns. Multi-clinic support is also available if you open a second location. You never need to migrate platforms or re-enter data; you simply add capacity to the same system you started with.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if I need help setting up — do you provide onboarding support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Every new Doxxy clinic gets free onboarding support as part of your subscription. This includes configuration of your speciality templates, GST and billing setup, staff account creation, and a live training session for you and your receptionist before opening day. After launch, you have access to WhatsApp support (usually responded to within 15 minutes during business hours), a knowledge base with step-by-step guides, and optional advanced training sessions for new staff members you hire later. We are not a download-and-figure-it-out-yourself product — onboarding is a core part of what you pay for, and we take it seriously.',
      },
    },
  ],
};

// --- PAGE SECTIONS ---

const HeroSection = () => (
  <Section className="text-center !pt-28 md:!pt-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      Your New Clinic Deserves Better Than a Paper Register.
    </h1>
    <SectionSubtitle>
      The first 90 days determine whether your clinic survives. Start with software on Day 1 — not after you are drowning in paper, billing errors, and lost patient records.
    </SectionSubtitle>
    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Get the New Clinic Launch Checklist <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
      <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold">
        <Link href="https://wa.me/917388890554?text=Hi%21%20I%27d%20like%20to%20know%20more%20about%20Doxxy%20for%20my%20new%20clinic">Talk to Our Team</Link>
      </Button>
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Free onboarding setup for new clinics. No hardware needed — works on your existing laptop.</p>
  </Section>
);

const ProblemSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Paper Is the Most Expensive Decision a New Clinic Makes.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Most clinics repeat the same mistake. They buy furniture, hire staff, and think, &ldquo;we will get software later.&rdquo; Six months later, they are buried.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 text-gray-600 dark:text-gray-300 space-y-5 text-lg leading-relaxed">
      <p>
        The pattern is predictable because it feels prudent. You have just signed a lease in Lucknow or Indore. The carpenter is building your reception desk. You have ordered your doctor&apos;s coat and letterheads from the printer. The staff has been hired. The bank account is open. Software feels like a &ldquo;nice to have&rdquo; — something you will subscribe to once the clinic has some patients and you can afford it.
      </p>
      <p>
        Six months later, you have 300 patient files in a steel almirah. Your receptionist spends Sundays manually typing prescriptions into Word because patients keep asking for digital copies. Billing errors have piled up — undercharges on consultation fees, missed pharmacy line items, forgotten follow-up charges. You have no idea which patients are due for a follow-up because there is no system to remind you. When a patient calls and says &ldquo;I visited three months ago, can you tell me what medicines I was prescribed?&rdquo; your receptionist spends 15 minutes flipping through paper files.
      </p>
      <p>
        Now you decide to switch to software. And you have 3,000 paper records to digitize. That costs ₹15-25 per file from a data entry service — ₹45,000 to ₹75,000 to clean up a mess that could have been avoided entirely. Your receptionist works overtime for three weekends scanning, typing, and filing. Your clinic operations slow down because old records are being digitized while new patients keep arriving. Your staff is frustrated. You are frustrated. And the entire time, the software you signed up for sits half-empty because the data is still being entered.
      </p>
      <p>
        Starting with paper and switching later is not a gradual transition. It is a clean break that costs 10x more than starting with software from Day 1. The smartest thing a new clinic can do is never create a paper record in the first place.
      </p>
    </div>
  </Section>
);

const ChecklistSection = () => (
  <Section>
    <SectionTitle>The New Clinic Launch Checklist: 7 Steps to Open Right.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Software is Step 3, not Step 7. Here is the order that saves you ₹50,000+ and months of chaos. Bookmark this.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-16 space-y-8">
      {[
        {
          step: '1',
          title: 'Legal & Registration',
          icon: FileText,
          description: 'Register your clinic as a legal entity — sole proprietorship, partnership, or private limited. Obtain MSME registration (Udyam), GST registration (mandatory if turnover exceeds ₹20 lakhs, but recommended from day one for input tax credit), and your clinic establishment licence from the local municipal corporation or health department. Apply for a pollution control board consent if your clinic generates biomedical waste. Open a current account in your clinic&apos;s name and set up a UPI-linked business payment collection. Hire a part-time accountant to handle monthly GST filings — do not wait until you have a notice from the tax department.',
        },
        {
          step: '2',
          title: 'Location & Infrastructure',
          icon: Building,
          description: 'Finalise your clinic lease with clear terms on rent escalation and lock-in period. Set up your consultation room, reception area, waiting area, and pharmacy/dispensary if applicable. Invest in a reliable broadband connection (minimum 50 Mbps) and a 4G dongle as backup — your software depends on internet, and downtime is not acceptable when patients are waiting. Purchase basic furniture: examination table, doctor&apos;s desk and chair, reception counter, waiting benches, and a steel almirah for physical records (you will need far less storage than a paper clinic, but some physical documents are unavoidable). Install a basic inverter or UPS for power backup.',
        },
        {
          step: '3',
          title: 'Clinic Software — Before Your First Patient Walks In',
          icon: Zap,
          description: 'Sign up for Doxxy during your pre-launch phase. Our team configures your speciality-specific prescription templates, billing rates with GST, appointment types and durations, staff user accounts, and clinic branding. By the time you open your doors, your receptionist already knows how to register a patient and generate a bill, your prescription workflow is mapped to your consultation style, and your UPI QR is live on the billing screen. Step 3 is the highest-leverage decision in this checklist — it determines whether your launch is smooth or chaotic. Software configured before Day 1 means zero backlog, ever.',
        },
        {
          step: '4',
          title: 'Staff Hiring & Training',
          icon: Users,
          description: 'Hire your core team: a receptionist (or front-desk coordinator), a staff nurse or attendant, and a cleaner. When interviewing receptionists, test for basic computer literacy — typing speed, familiarity with browsers, and comfort with navigating a dashboard. Train them on Doxxy before opening day. The receptionist should be able to register a new patient, schedule an appointment, check in a walk-in, generate a bill, and send a WhatsApp receipt — all within a 2-hour training session. Staff trained before opening day means no fumbling in front of patients.',
        },
        {
          step: '5',
          title: 'Pharmacy & Lab Tie-Ups',
          icon: Stethoscope,
          description: 'If you are dispensing in-house, stock your most commonly prescribed medicines (typically 80-100 SKUs for a general physician or 50-60 for a specialist) and add them to your Doxxy inventory with HSN codes, purchase price, and selling price. For lab tests, identify 2-3 reliable diagnostic labs in your area and negotiate referral rates. Integrate their test menu into your Doxxy lab-ordering workflow so you can order tests during consultation and the lab report flows back digitally. If you are not dispensing in-house, identify a nearby pharmacy and set up a referral arrangement.',
        },
        {
          step: '6',
          title: 'Patient Marketing & Discovery',
          icon: TrendingUp,
          description: 'Create your Google Maps Business Profile with your clinic name, address, phone number, consultation hours, and photos of your clinic interior and exterior. Set up WhatsApp Business with a catalogue of your services, auto-reply for out-of-hours inquiries, and quick replies for frequently asked questions. Print visiting cards with a QR code that links to your Google Maps listing. Distribute them to nearby pharmacies, diagnostic centres, and neighbouring businesses. Announce your opening in the local area — a simple neighbourhood pamphlet drop or local newspaper ad in the health section works better than you think. If budget permits, run a ₹2,000-3,000 Google Ads campaign targeting &ldquo;[your speciality] doctor near me&rdquo; for your first month.',
        },
        {
          step: '7',
          title: 'Grand Opening & First Patient Walkthrough',
          icon: Rocket,
          description: 'Opening day. Your Doxxy dashboard is live. Your receptionist logs in and the queue screen is empty — ready for the first patient. Walk through the entire flow together one final time: receptionist taps &ldquo;New Patient,&rdquo; fills the digital registration form (name, age, phone, chief complaint), assigns the patient to the doctor&apos;s queue. Doctor opens the SOAP note in Doxxy, picks the relevant prescription template, prescribes in under 60 seconds. Bill auto-generates with consultation fee, pharmacy line items, and GST — patient scans the UPI QR on the reception screen. WhatsApp receipt and digital prescription land on the patient&apos;s phone instantly. The patient is auto-added to the follow-up list. One patient done. Zero paper touched. Your digital clinic is live.',
        },
      ].map(({ step, title, description, icon: Icon }) => (
        <div key={step} className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-200/75 dark:border-gray-700/50 shadow-sm">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
              {step}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                  <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="max-w-4xl mx-auto mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
      <p className="text-blue-900 dark:text-blue-100 text-center font-semibold text-lg">
        The pattern is clear: Registration, Infrastructure, Software, Staff, Partners, Marketing, Launch. Software at step 3 means you configure systems while the carpenter builds your desk — not while patients are waiting in your reception.
      </p>
    </div>
  </Section>
);

const MathSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>The True Cost of Starting With Paper.</SectionTitle>
    <SectionSubtitle className="mt-4">
      One calculation that should convince you to never create a paper record.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-10 border border-gray-200/75 dark:border-gray-700/50 shadow-sm">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
            <span className="text-gray-600 dark:text-gray-300">Patients per day</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">20</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
            <span className="text-gray-600 dark:text-gray-300">Working days per month</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">25</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
            <span className="text-gray-600 dark:text-gray-300">New patient files generated per month</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">500</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
            <span className="text-gray-600 dark:text-gray-300">Paper files after 6 months</span>
            <span className="text-xl font-bold text-red-600 dark:text-red-400">3,000+</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
            <span className="text-gray-600 dark:text-gray-300">Digitisation cost per file (₹15-25)</span>
            <span className="text-xl font-bold text-red-600 dark:text-red-400">₹45,000 – ₹75,000</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
            <span className="text-gray-600 dark:text-gray-300">Staff overtime (2-3 weekends)</span>
            <span className="text-xl font-bold text-red-600 dark:text-red-400">₹8,000 – ₹12,000</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
            <span className="text-gray-600 dark:text-gray-300">Paper, printing, and storage (6 months)</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">₹18,000+</span>
          </div>
          <div className="flex justify-between items-center pt-4">
            <span className="text-lg font-bold text-gray-900 dark:text-white">Total cost of starting with paper</span>
            <span className="text-3xl font-bold text-red-600 dark:text-red-400">₹71,000 – ₹1,05,000</span>
          </div>
        </div>
        <div className="mt-10 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800 text-center">
          <p className="text-green-900 dark:text-green-100 font-semibold text-lg">
            Doxxy starts at <span className="text-2xl font-bold">₹499/month</span>. Starting with paper and switching later costs <span className="font-bold underline">10x more</span> than starting with software from Day 1.
          </p>
        </div>
      </div>
    </div>
  </Section>
);

const SolutionSection = () => (
  <Section>
    <SectionTitle>Doxxy for New Clinics: Built for Your First Patient.</SectionTitle>
    <SectionSubtitle className="mt-4">
      A clinic management system designed for clinics that do not exist yet. Pre-configured. Pre-trained. Ready before opening day.
    </SectionSubtitle>
    <div className="grid md:grid-cols-3 gap-8 mt-16">
      {[
        {
          icon: ClipboardList,
          title: 'Free Pre-Launch Onboarding',
          description: 'We configure your speciality templates, billing rates, and user accounts before you open. Our team does a 45-minute setup call and a 30-minute training session with your staff. You open with everything ready — not a blank screen.',
        },
        {
          icon: Smartphone,
          title: 'Works on Your Existing Devices',
          description: 'No server rooms. No ₹50,000 hardware purchase. Doxxy runs on the laptop or tablet you already own. Reception desk runs on a ₹15,000 Chromebook or an Android tablet. Zero upfront hardware investment.',
        },
        {
          icon: IndianRupee,
          title: 'Pay-As-You-Grow Pricing',
          description: 'Start at ₹499/month for a solo practice. Upgrade as your patient volume grows. No annual lock-in, no hidden setup fees, no per-patient charges. Your software budget grows only when your clinic does.',
        },
        {
          icon: Users,
          title: 'Staff Trains Before Opening Day',
          description: 'Your receptionist learns Doxxy before patients arrive. Patient registration, appointment scheduling, billing, UPI collection, and WhatsApp receipts — practised during setup, not improvised in front of patients.',
        },
        {
          icon: Shield,
          title: 'Zero Backlog, Forever',
          description: 'Every patient record created in Doxxy is searchable, exportable, and audit-ready from the moment it is entered. No almirah. No digitization backlog. No &ldquo;we will enter old records later.&rdquo;',
        },
        {
          icon: TrendingUp,
          title: 'Revenue Tracking From Day 1',
          description: 'Know exactly how much your clinic collected today, this week, and this month. UPI payments auto-reconciled. GST collected tracked automatically. First-month revenue report ready for your CA in one click.',
        },
      ].map(({ icon: Icon, title, description }) => (
        <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-200/75 dark:border-gray-700/50 shadow-sm">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <Icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{description}</p>
        </div>
      ))}
    </div>
    <div className="mt-10 text-center">
      <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold">
        <Link href="/pricing">See Full Pricing <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

const WorkflowSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Day 1 With Doxxy: Your First Patient, No Paper.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Walk through the exact flow of your first patient visit — entirely digital, entirely smooth.
    </SectionSubtitle>
    <div className="grid md:grid-cols-5 gap-4 mt-16">
      {[
        { step: '1', title: 'Patient Registers', description: 'Receptionist taps &ldquo;New Patient.&rdquo; Fills name, age, phone, chief complaint. Digital registration form. Two minutes. No paper form. No carbon copy.' },
        { step: '2', title: 'Doctor Consults', description: 'Doctor opens SOAP note in Doxxy. Picks the relevant prescription template. Types diagnosis and treatment. Prescribes in 60 seconds — not 3 minutes of handwriting.' },
        { step: '3', title: 'Bill Generates', description: 'Doxxy compiles consultation fee, pharmacy items, lab tests into an itemized bill with GST. Receptionist confirms. Patient scans UPI QR on the screen. Paid.' },
        { step: '4', title: 'Receipt Sent', description: 'WhatsApp receipt + digital prescription sent to patient instantly. No printed bill to lose. No &ldquo;can you send me a copy?&rdquo; calls at 10 PM.' },
        { step: '5', title: 'Follow-Up Set', description: 'Patient auto-added to follow-up list. System flags overdue visits. One tap to send a WhatsApp reminder. No diary. No manual tracking.' },
      ].map(({ step, title, description }) => (
        <div key={step} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 text-center">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mx-auto mb-4">{step}</div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
        </div>
      ))}
    </div>
    <div className="mt-10 max-w-3xl mx-auto text-center">
      <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
        Every record searchable forever. Every prescription legible. Every bill accurate. Every follow-up tracked. No paper touched from registration to receipt. This is not a future-state aspiration — this is what Doxxy clinics do every single day.
      </p>
    </div>
  </Section>
);

const ResultsSection = () => (
  <Section>
    <SectionTitle>Dr. Mehta Opened Her Dermatology Clinic With Doxxy. Here Is What Happened.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Jaipur, March 2025. First-time clinic owner. Started digital on Day 1. Fourteen months later, the numbers speak for themselves.
    </SectionSubtitle>
    <div className="grid md:grid-cols-4 gap-8 mt-16">
      {[
        { stat: '2,800+', label: 'Digital Patient Records', detail: 'Every patient record created digitally from the first consultation. Searchable by name, phone, or diagnosis. Zero files in a physical almirah.' },
        { stat: '₹0', label: 'Spent on Digitisation', detail: 'No backlog. No data entry service. No weekend overtime to digitize old files. Because there are no old files — every record was born digital.' },
        { stat: '25/Day', label: 'Patients Per Receptionist', detail: 'One receptionist handles check-ins, billing, UPI collection, and WhatsApp receipts for 25 patients daily. Paper clinics need two staff for the same volume.' },
        { stat: '12 Min', label: 'Average Visit Time', detail: 'From check-in to bill payment. The Indian paper-clinic average is 22 minutes. Doxxy cuts visit time nearly in half — more patients seen, less waiting room crowding.' },
      ].map(({ stat, label, detail }) => (
        <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-200/75 dark:border-gray-700/50 shadow-sm text-center">
          <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">{stat}</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{label}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{detail}</p>
        </div>
      ))}
    </div>
  </Section>
);

const ComparisonSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>New Clinic: Paper-First vs Software-First.</SectionTitle>
    <SectionSubtitle className="mt-4">
      The same clinic. The same patients. Two fundamentally different trajectories.
    </SectionSubtitle>
    <div className="max-w-5xl mx-auto mt-16">
      <div className="grid grid-cols-3 gap-0 rounded-2xl overflow-hidden border border-gray-200/75 dark:border-gray-700/50">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-5 border-b border-gray-200/75 dark:border-gray-700/50">
          <span className="font-semibold text-gray-900 dark:text-white">Metric</span>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-5 border-b border-gray-200/75 dark:border-gray-700/50">
          <span className="font-semibold text-red-600 dark:text-red-400">Starting With Paper</span>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-5 border-b border-gray-200/75 dark:border-gray-700/50">
          <span className="font-semibold text-green-600 dark:text-green-400">Starting With Doxxy</span>
        </div>
        {/* Rows */}
        {[
          { metric: 'Setup Time', paper: '2 weeks — print registers, design forms, buy carbon-paper receipt books, get rubber stamps made.', doxxy: '1 day — create account, configure templates, train staff. Ready before opening.' },
          { metric: 'Staff Training', paper: 'Learn-as-you-go. Receptionist figures out filing while patients wait. Mistakes are part of the process.', doxxy: 'Pre-opening training. Staff practises on dummy patients. Opening day is their second or third run, not their first.' },
          { metric: 'Patient Check-in', paper: '8 minutes — patient fills paper form. Receptionist files it. Creates a paper OPD slip. Finds the right register.', doxxy: '2 minutes — tap "New Patient," fill digital form, assigned to queue. Everything auto-filed.' },
          { metric: 'Record Retrieval (6 Months Later)', paper: 'Flip through almirah drawers. Hope the file is alphabetically sorted. Average retrieval time: 8-15 minutes.', doxxy: 'Type the patient\'s name or phone number. Instant result. Every prescription, bill, and lab report linked to the patient record.' },
          { metric: 'Billing Accuracy', paper: '±12% errors — missed line items, wrong rates, human calculation mistakes in manual totals.', doxxy: '100% accurate — bill auto-compiled from consultation record. GST auto-calculated. No manual math.' },
          { metric: 'Monthly Cost', paper: '₹3,000+ — paper, printing, carbon sheets, registers, storage, and staff time spent on manual filing and retrieval.', doxxy: '₹499 — fixed monthly software subscription. Unlimited patients. Unlimited records. Unlimited prescriptions.' },
          { metric: 'Switching Cost (If You Change Your Mind)', paper: '₹50,000-75,000 — digitization backlog of 3,000+ files. Staff overtime. Operational slowdown during transition.', doxxy: '₹0 — every record is already digital. Export your data and move. No backlog. No cleanup.' },
        ].map(({ metric, paper, doxxy }) => (
          <div key={metric} className="contents">
            <div className="bg-white dark:bg-gray-800 p-5 border-b border-gray-100 dark:border-gray-700/50">
              <span className="font-medium text-gray-900 dark:text-white text-sm">{metric}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 border-b border-gray-100 dark:border-gray-700/50">
              <span className="text-gray-600 dark:text-gray-300 text-sm">{paper}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 border-b border-gray-100 dark:border-gray-700/50">
              <span className="text-gray-900 dark:text-white font-medium text-sm">{doxxy}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="mt-10 text-center">
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-2xl mx-auto">
        The decision is not &ldquo;software or no software.&rdquo; It is &ldquo;software now or software later.&rdquo; Now costs ₹499/month. Later costs ₹50,000+ plus months of chaos. New clinics do not have the luxury of fixing mistakes they have not made yet.
      </p>
    </div>
  </Section>
);

const FAQSection = () => (
  <Section>
    <SectionTitle>Questions New Clinic Owners Ask.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Answered by our onboarding team, who have set up 500+ Indian clinics on Doxxy.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-6">
      {[
        {
          q: 'I have not opened my clinic yet — can I set up Doxxy before launch?',
          a: 'Absolutely. In fact, that is exactly how we recommend doing it. You can create your Doxxy account during the pre-launch phase, and our onboarding team will help you configure everything before opening day: your speciality-wise prescription templates, billing rates with GST, consultation types, staff roles, and clinic branding. When your first patient walks in, your receptionist already knows the software, your templates are ready, and you are billing digitally from patient one. No backlog. No transition. No chaos.',
        },
        {
          q: 'What hardware do I need to run Doxxy in a new clinic?',
          a: 'Doxxy works on what you already own. A laptop or desktop for the doctor (any Windows or Mac machine from the last 5 years), a laptop or tablet for the reception desk, and a smartphone for UPI payment collection. That is it. No servers, no on-premise installations, no expensive hardware procurement. Doxxy runs entirely in the browser and updates automatically. For clinics that want a leaner setup, many of our clinics run the reception dashboard on a ₹15,000 Chromebook or an Android tablet. Internet access is required — we recommend a basic broadband connection with a 4G dongle as backup.',
        },
        {
          q: 'How long does it take to set up Doxxy before opening?',
          a: 'A fully configured Doxxy setup takes 2-3 working days from account creation to go-live readiness. Day 1: you create your account and our team schedules a 45-minute onboarding call to understand your speciality, clinic size, and workflow. Day 1-2: we pre-configure your prescription templates, billing rates, GST details, and user accounts for each staff member. Day 2-3: we do a 30-minute training walkthrough with you and your receptionist over a video call. By the end of day 3, your clinic is fully digital and ready for patients. There is no coding, no configuration complexity, and no technical knowledge required on your part.',
        },
        {
          q: 'Can Doxxy handle multiple doctors if I expand later?',
          a: 'Yes. Doxxy is built for clinics that grow. You can start with a single doctor and add more doctors, specialities, and consultation rooms as your practice expands. Each doctor gets their own login, their own appointment queue, their own prescription templates, and their own billing tracking. The admin dashboard gives you a consolidated view across all doctors — revenue per doctor, patient load, consultation duration, and prescription patterns. Multi-clinic support is also available if you open a second location. You never need to migrate platforms or re-enter data; you simply add capacity to the same system you started with.',
        },
        {
          q: 'What if I need help setting up — do you provide onboarding support?',
          a: 'Every new Doxxy clinic gets free onboarding support as part of your subscription. This includes configuration of your speciality templates, GST and billing setup, staff account creation, and a live training session for you and your receptionist before opening day. After launch, you have access to WhatsApp support (usually responded to within 15 minutes during business hours), a knowledge base with step-by-step guides, and optional advanced training sessions for new staff members you hire later. We are not a download-and-figure-it-out-yourself product — onboarding is a core part of what you pay for, and we take it seriously.',
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

const BottomCTA = () => (
  <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
        Do Not Make Paper Your First Hire.
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
        The smartest new clinics in India — in Jaipur, Lucknow, Indore, Pune, and Coimbatore — are opening without a single paper register. They are starting with Doxxy. You can too. Sign up now and get your clinic fully configured before your first patient walks in.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
          <Link href="https://wa.me/+917388890554">Start Your Digital Clinic <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
        <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold">
          <Link href="https://wa.me/917388890554?text=Hi%21%20I%27d%20like%20to%20know%20more%20about%20Doxxy%20for%20my%20new%20clinic">Chat on WhatsApp</Link>
        </Button>
      </div>
      <p className="text-sm mt-6 text-gray-500 dark:text-gray-400">
        Free pre-launch onboarding. No hardware needed. ₹499/month. Cancel anytime.
      </p>
    </div>
  </section>
);

// --- MAIN PAGE ---

export default function NewClinicSoftwarePage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <ProblemSection />
      <ChecklistSection />
      <MathSection />
      <SolutionSection />
      <WorkflowSection />
      <ResultsSection />
      <ComparisonSection />
      <FAQSection />
      <BottomCTA />
      <SignupCTA
        heading="Don't Start With Paper. Software Should Be Step 1."
        description="Opening a new clinic? Get the launch checklist + see how Doxxy sets you up digital from day one. Chat with us on WhatsApp."
      />

      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "New Clinic Setup Software", url: `${APP_URL}/clinic-software-new-clinic` },
        ]}
      />
    </div>
  );
}
