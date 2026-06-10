// Path: app/(public)/clinic-software-small-clinic/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Users, Clock, Calculator, Smartphone, FileText, CreditCard, Bell, CalendarDays, Search } from 'lucide-react';
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";

export const metadata: Metadata = {
  title: 'Clinic Management Software for Small Clinics — Solo Doctors, Light & Affordable | Doxxy',
  description: 'Clinic software built for solo doctors and small clinics in India. No bloated features. No IT team needed. Your receptionist learns it in 3 days. Starts at ₹499/month, pay per consultation. Free trial.',
  alternates: { canonical: '/clinic-software-small-clinic' },
  openGraph: {
    title: 'Clinic Management Software for Small Clinics — Built for Solo Doctors',
    description: 'Light, affordable clinic software for solo doctors and small clinics in India. No bloated features. Your receptionist learns it in 3 days. Starts at ₹499/month.',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Clinic management software for small clinics and solo doctors in India' }],
  },
  keywords: ['clinic management software for small clinic', 'clinic software for solo doctor', 'small clinic software India', 'affordable clinic management', 'solo practitioner software India', 'lightweight clinic software', 'clinic software for single doctor', 'OPD software small clinic'],
};

// --- FAQ Structured Data ---
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is Doxxy suitable for a solo doctor with a small clinic?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Doxxy is built specifically for solo doctors and small clinics. Unlike hospital-grade systems that assume you have an IT department and 20 staff members, Doxxy strips away everything you do not need. It handles the essentials — appointments, digital prescriptions, patient records, and billing — without any of the complexity that bogs down larger systems. You do not need a server, a dedicated IT person, or any hardware beyond the smartphone or laptop you already own. Most solo practitioners are up and running within a single afternoon.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does Doxxy cost for a small clinic?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doxxy starts at ₹499 per month for small clinics on the Practice Essentials plan, which includes appointment scheduling, digital treatment plans, patient records, and basic billing. There are no setup fees, no hardware costs, and no long-term contracts — you can cancel anytime. For clinics that want automated WhatsApp reminders, UPI payment collection, and advanced analytics, the Practice Plus plan is ₹999 per month. Both plans operate on a pay-per-consultation model, so if you have a slow month, your cost reflects that. Compare this to the ₹8,000-₹12,000 per month that manual record-keeping costs in staff time alone.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can my receptionist learn Doxxy? She is not very technical.',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. Doxxy was designed with the assumption that the person using it is a clinic receptionist, not a software engineer. The interface uses plain Hindi and English labels, large touch-friendly buttons, and a workflow that follows exactly what your receptionist already does — check in patients, book appointments, collect payments. Most receptionists are comfortable handling daily operations within 3 days of use. We have clinics where the receptionist is a family member of the doctor with no prior computer experience, and they navigate Doxxy confidently within the first week. We also provide free onboarding support over a WhatsApp call to walk your staff through the first few days.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to buy any special hardware or a server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Doxxy is a cloud-based web application — it runs in a browser on any device you already own. It works on a laptop, a desktop, an Android phone, or an iPhone. No server to install. No software to download. No annual maintenance contract. All patient data is stored securely on encrypted cloud servers, so you never have to worry about backups, hard drive failures, or losing paper files. If your clinic already has a basic internet connection and at least one smartphone, you have everything you need to run Doxxy.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if my clinic grows and I add more doctors? Can I upgrade?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Doxxy grows with your practice. You can start as a solo doctor and add more doctors, more receptionists, or even additional clinic locations later. All plans support multiple users, and upgrading takes a single click from your dashboard — no migration, no data transfer, no downtime. Your patient records, prescriptions, and billing history stay intact. Many of our users started as solo practitioners and now run 3-4 doctor clinics with Doxxy managing everything centrally. The platform is designed so that scaling up does not require switching to a different system.',
      },
    },
  ],
};

// --- PAGE COMPONENTS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      You Do Not Need Hospital Software.
      <br />
      <span className="text-blue-600">You Need Something That Just Works.</span>
    </h1>
    <SectionSubtitle>
      Most clinic software is built for 50-doctor hospitals. You run a small clinic — a solo practice or a 2-doctor setup with one receptionist who doubles as your accountant. You need something light, affordable, and simple enough that your staff learns it in 3 days. That is exactly what Doxxy is.
    </SectionSubtitle>
    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
      <Button size="lg" asChild variant="outline" className="rounded-xl px-8 py-3 text-base font-semibold border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
        <Link href="https://wa.me/917388890554?text=Hi%21%20I%27d%20like%20to%20know%20more%20about%20Doxxy%20for%20my%20small%20clinic">Chat on WhatsApp</Link>
      </Button>
    </div>
  </Section>
);

const ProblemSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>You Did Not Open a Clinic to Spend 3 Hours a Day on Paperwork.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Yet that is exactly what is happening. And it is not your fault — the tools available to small clinics have been ignoring you for years.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 text-gray-600 dark:text-gray-300 space-y-5 text-base leading-relaxed">
      <p>
        Here is what running a small clinic in India actually looks like. You are the doctor, the administrator, the inventory manager, and — on some days — the janitor. Your receptionist, Priya, handles three jobs simultaneously: answering phone calls for appointments, writing bills by hand, and filing patient records into cardboard folders that keep multiplying. At 8 PM, when the last patient leaves, you both sit down to tally the day: how many patients, how much collected, which follow-ups are due tomorrow. This takes an hour. Sometimes two.
      </p>
      <p>
        Meanwhile, software companies have spent the last decade building for the Fortis and Apollo hospitals of the world. Their systems cost lakhs, require server rooms, come with annual maintenance contracts, and assume you have a dedicated IT team to handle installations and training. When a solo GP in Nashik or a two-doctor paediatric clinic in Meerut looks for software, they are handed the same bloated system that a 200-bed hospital uses — and told to figure it out.
      </p>
      <p>
        So you stick with paper. You stick with the leather-bound register that has every patient name since 2015. You memorise which patient needs what follow-up. You ask patients to carry their old prescription when they visit, because there is no easy way for you to pull up their history. And you stay late every evening, compensating for the lack of a system with your own time. You know this is not sustainable. You just have not found a tool that was built with your reality in mind.
      </p>
    </div>
  </Section>
);

const MathSection = () => (
  <Section>
    <SectionTitle>The Real Cost of Running a Small Clinic Without Software.</SectionTitle>
    <SectionSubtitle className="mt-4">
      These numbers are from real Indian solo practices. The waste is larger than it feels day-to-day.
    </SectionSubtitle>
    <div className="grid md:grid-cols-3 gap-8 mt-16">
      {[
        { icon: Users, stat: '15-25', label: 'Patients Per Day', detail: 'The average solo clinic in India sees 15-25 patients daily. Each one generates at least 5-7 minutes of paperwork — registration, prescription writing, billing.' },
        { icon: Clock, stat: '3.5 Hours', label: 'Lost to Admin Daily', detail: 'At 7 minutes per patient for manual records and billing, plus 30 minutes of day-end reconciliation, you lose 3-4 hours a day to paperwork that software handles in minutes.' },
        { icon: Calculator, stat: '₹12,500', label: 'Monthly Staff Cost of Paperwork', detail: 'A receptionist earning ₹15,000/month spends roughly 80% of her time on manual record-keeping. That is ₹12,000/month spent on tasks software automates. Add ₹500 in physical registers, files, and storage.' },
        { icon: CalendarDays, stat: '6-8', label: 'No-Shows Per Week', detail: 'Without automated reminders, small clinics lose 6-8 appointments every week to no-shows. At ₹300-₹500 per consultation, that is ₹7,200-₹16,000 in lost monthly revenue.' },
        { icon: FileText, stat: '12 Min', label: 'Average Record Retrieval', detail: 'Finding a patient\'s last prescription in a filing cabinet takes 10-15 minutes. With digital search, it takes under 10 seconds. Multiply by 10 patients a day who need history pulled.' },
        { icon: Search, stat: '80%', label: 'Time You Get Back', detail: 'Small clinics that switch to Doxxy report an 80% reduction in admin time. The 3.5 hours becomes 40 minutes. That is nearly 3 hours a day returned to patient care — or to closing on time.' },
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
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Doxxy: Clinic Software Stripped Down to What You Actually Need.</SectionTitle>
    <SectionSubtitle className="mt-4">
      No enterprise modules. No "implementation consultants." No hardware. Just the essential tools a small clinic uses every day — at a price that makes sense.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 space-y-8">
      {[
        {
          title: 'Appointment Booking — No More Phone Tag',
          description: 'Patients book their own appointments through a simple link you share on WhatsApp or your clinic\'s Google listing. They pick an available slot, get an instant confirmation message, and receive an automated reminder the day before. Your receptionist sees the day\'s schedule on a single screen — no phone calls to answer, no register to flip through. Walk-in patients can be added in two taps.',
          icon: CalendarDays,
        },
        {
          title: 'Digital Prescriptions — Write, Print, Share in Under 60 Seconds',
          description: 'Type or dictate (English or Hindi) your prescription. Doxxy auto-suggests common medicines, dosages, and durations. Print it on your existing printer, or share it digitally with the patient. Every prescription is saved against the patient record, so next visit, you pull up their history in seconds. No more "Please bring your old prescription." No more deciphering handwriting at the pharmacy.',
          icon: FileText,
        },
        {
          title: 'Patient Records — Search 3,000 Patients in 3 Seconds',
          description: 'Every patient gets a digital file: name, phone number, age, visit history, prescriptions, diagnoses, and bills. Search by name or phone number from any screen — it is faster than pulling a physical file. When Mr. Sharma returns after 8 months, you see his entire history before he sits down. No lost files. No "I think we gave him Augmentin last time." Certainty, not memory.',
          icon: Search,
        },
        {
          title: 'Billing — Auto-Generated from the Consultation',
          description: 'When the doctor finishes the consultation, the bill generates automatically. Consultation fee, procedure charges, pharmacy items — pulled directly from the clinical record. The receptionist confirms and collects payment (cash, UPI QR, or card). Digital receipt sent to the patient on WhatsApp. No separate billing software. No manual calculators. No end-of-day tally nightmares.',
          icon: CreditCard,
        },
        {
          title: 'WhatsApp Reminders — Stop the No-Show Bleed',
          description: 'Appointment reminders are sent by your staff on WhatsApp the day before every booking. Patients can confirm or reschedule with one tap. For follow-ups, the system flags overdue patients and sends gentle reminders. Clinics using this feature report a 35-40% drop in no-shows within the first month. That alone often covers the cost of Doxxy several times over.',
          icon: Bell,
        },
        {
          title: 'Works on What You Already Own',
          description: 'No server. No installation. No hardware purchase. Doxxy runs in a browser on your existing laptop, desktop, or smartphone. One internet connection. One login. Your receptionist can use it from the front desk Android phone while you review patient histories on your iPad between consultations. Everything syncs in real time.',
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
  <Section>
    <SectionTitle>A Day in Your Clinic — After Doxxy.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Here is what happens from the moment your first patient walks in to the moment you close.
    </SectionSubtitle>
    <div className="grid md:grid-cols-5 gap-6 mt-16">
      {[
        { step: '1', title: 'Patient Arrives', description: 'Patient walks in. Receptionist taps "Check In" on the Doxxy screen. If new, enters name and phone number in 30 seconds. If returning, the system auto-fills their record. No paper form.' },
        { step: '2', title: 'Doctor Consults', description: 'You open the patient\'s file and see their full history: past visits, prescriptions, diagnoses. Use the SOAP note template to record today\'s findings. Prescribe medicines with auto-suggest. Done in under 2 minutes.' },
        { step: '3', title: 'Bill Generated', description: 'The moment you save the consultation, the bill compiles automatically. Consultation fee, any procedure charges, pharmacy items — all pulled from your clinical entries. Receptionist reviews and confirms. No re-typing.' },
        { step: '4', title: 'Patient Pays and Exits', description: 'Patient scans the UPI QR on the receptionist\'s screen (or pays cash). Receipt drops into their WhatsApp instantly. Next appointment booked before they leave. The whole checkout takes 90 seconds.' },
        { step: '5', title: 'Day-End in One Tap', description: '8 PM. Priya taps "Close Day." The screen shows: 22 patients seen, ₹14,500 collected, 3 follow-ups booked for tomorrow, GST breakdown ready for the accountant. Day reconciled. Lights off by 8:15.' },
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
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Your Clinic: Before Doxxy vs After Doxxy.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Not a comparison with competitors. This is what changes in your own practice — measured against how you operate today.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            <th className="text-left p-4 font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">What Changes</th>
            <th className="text-left p-4 font-semibold text-red-600 dark:text-red-400 text-sm uppercase tracking-wider">Before Doxxy</th>
            <th className="text-left p-4 font-semibold text-green-600 dark:text-green-400 text-sm uppercase tracking-wider">After Doxxy</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {[
            { metric: 'Appointment Booking', before: 'Patients call. Phone rings busy. Receptionist scribbles in a diary. Double-bookings are common.', after: 'Patients self-book via your WhatsApp link. Calendar updates live. No double-booking possible. Receptionist focuses on patients in the clinic.' },
            { metric: 'Patient Records', before: 'Cardboard folders in a steel almirah. Misfiled, lost, or buried under newer files. 10 minutes to find one record.', after: 'Digital. Search by name or number. Full history in 3 seconds. Never lose a file again. Access from phone or laptop.' },
            { metric: 'Prescriptions', before: 'Handwritten on letterhead. Pharmacist calls to decipher. Patient loses it before next visit. No record of what was prescribed.', after: 'Typed or dictated. Saved to patient file forever. Share digitally with patient. Print if needed. Complete prescription history across all visits.' },
            { metric: 'Billing', before: 'Manual calculator. Handwritten receipt in triplicate. Cash-only tracking. 45-minute evening tally with frequent errors.', after: 'Auto-generated from consultation. UPI, card, or cash. Digital receipt on WhatsApp. Day-end report in one click. Zero reconciliation needed.' },
            { metric: 'Follow-Ups', before: 'Doctor mentally tracks who needs to return. Patients forget. Conditions worsen. Revenue walks out the door.', after: 'System flags overdue follow-ups. Automated WhatsApp reminders go out. Patients rebook. Continuity of care — and revenue — is maintained.' },
            { metric: 'Monthly Cost', before: '₹8,000-₹12,000 in staff time spent on paperwork, plus ₹500 in stationery, ₹1,000 in missed billings, and ₹7,000+ in no-show revenue loss.', after: '₹499/month flat (Practice Essentials). No hidden costs. The time saved alone is worth 15-20x the subscription. No-shows drop, billings are complete, day closes on time.' },
            { metric: 'Closing Time', before: '8:30 PM. Sometimes 9. You and Priya sit tallying cash, matching receipts, writing tomorrow\'s appointment list by hand.', after: '8:15 PM. One tap. Everything reconciled. You walk out with a clear head and a complete picture of the day\'s numbers.' },
          ].map(({ metric, before, after }) => (
            <tr key={metric} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td className="p-4 font-medium text-gray-900 dark:text-white">{metric}</td>
              <td className="p-4 text-gray-600 dark:text-gray-300 text-sm">{before}</td>
              <td className="p-4 text-gray-900 dark:text-white font-medium text-sm">{after}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Section>
);

const TestimonialSection = () => (
  <Section>
    <SectionTitle>Small Clinics Across India Are Already Running on Doxxy.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Real outcomes from solo practitioners and two-doctor clinics who made the switch.
    </SectionSubtitle>
    <div className="grid md:grid-cols-3 gap-8 mt-16">
      {[
        {
          quote: 'I was spending ₹8,000 a month on a receptionist whose main job was maintaining patient files and writing bills. With Doxxy, she now handles actual patient care — greeting, checking in, following up. My no-shows dropped from 8 a week to 2. The software paid for itself in the first week.',
          name: 'Dr. Sharma',
          detail: 'Solo GP, Pune — 18 patients/day',
        },
        {
          quote: 'I run a small paediatric clinic with my wife. Neither of us is technical. We were worried about "learning software." Our receptionist, who had never used a computer before, was booking appointments on Doxxy by day three. The WhatsApp reminders alone bring back 4-5 patients a week who would have otherwise forgotten their follow-up.',
          name: 'Dr. and Dr. Verma',
          detail: 'Paediatric Clinic, Lucknow — 2 doctors, 30 patients/day',
        },
        {
          quote: 'For years I thought clinic software was for big hospitals. I assumed it would cost ₹20,000+ and need a server. Doxxy runs on my 3-year-old Android phone. I type prescriptions in Hindi, my patients get them instantly on their phones, and I close my day by 7:30 PM. I have not touched a prescription pad in 5 months.',
          name: 'Dr. Menon',
          detail: 'General Physician, Kochi — Solo practice, 20 patients/day',
        },
      ].map(({ quote, name, detail }) => (
        <div key={name} className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-200/75 dark:border-gray-700/50 flex flex-col">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm flex-grow mb-6 italic">
            &ldquo;{quote}&rdquo;
          </p>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="font-semibold text-gray-900 dark:text-white text-sm">{name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{detail}</div>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const FAQSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Questions Small Clinic Owners Ask Before Switching.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Honest answers. No sales language.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-6">
      {[
        {
          q: 'Is Doxxy suitable for a solo doctor with a small clinic?',
          a: 'Yes — and this is exactly who Doxxy was built for. Unlike hospital-grade software that assumes you have an IT department and dozens of staff, Doxxy is stripped down to what a solo or two-doctor clinic actually needs: appointments, prescriptions, patient records, and billing. No modules you will never use. No complexity that requires training workshops. Most solo practitioners are running independently within a single afternoon of setup.',
        },
        {
          q: 'How much does Doxxy cost for a small clinic?',
          a: 'Practice Essentials starts at ₹499/month — that covers appointment scheduling, digital treatment plans, patient records, and basic billing. Practice Plus at ₹999/month adds WhatsApp reminders, UPI payment collection, and advanced analytics. No setup fees, no hardware costs, no annual contracts. Cancel anytime. Compare this to the ₹8,000-₹12,000 your clinic loses every month in staff time spent on manual paperwork alone. The ROI is not marginal — it is immediate.',
        },
        {
          q: 'Can my receptionist learn it? She has never used clinic software before.',
          a: 'This is the most common concern we hear, and it is the one we have designed most carefully for. Doxxy uses plain language (Hindi and English), large buttons, and a workflow that follows exactly what your receptionist already does — check in, book, bill. We have clinics where the receptionist is a family member with zero computer experience, and they are navigating Doxxy confidently within 3 days. We also offer a free onboarding call over WhatsApp where we walk your staff through their first few days live.',
        },
        {
          q: 'Do I need to buy any special hardware, server, or software?',
          a: 'Nothing. Doxxy runs in a web browser — Chrome, Safari, anything. It works on your existing laptop, desktop, Android phone, or iPhone. You need one internet connection and one device. There is no server to install, no software to download, no annual maintenance contract. Patient data is stored securely on encrypted cloud servers, so you never worry about backups, hard drive crashes, or losing paper files to a leaking roof or a fire.',
        },
        {
          q: 'What if my clinic grows? Can Doxxy handle more doctors and more patients?',
          a: 'Doxxy scales with you. Start as a solo doctor. Add a second doctor, then a third. Add additional receptionist logins. Even add a second clinic location — all managed from the same account. Upgrading your plan takes one click from your dashboard. Your patient data, prescription history, and billing records stay intact. Several of our current users started as solo practitioners and now run 3-4 doctor clinics on the same Doxxy account they began with. No migration. No downtime. No switching systems.',
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

const FinalCTASection = () => (
  <Section className="text-center">
    <SectionTitle>Your Clinic Deserves Tools Built for Its Size.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Stop compensating with your time. Stop paying for bloated systems you do not need. A 2-doctor clinic in Surat does not need the same software as a 200-bed hospital in Mumbai. You need Doxxy.
    </SectionSubtitle>
    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
      <Button size="lg" asChild variant="outline" className="rounded-xl px-8 py-3 text-base font-semibold border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
        <Link href="https://wa.me/917388890554?text=Hi%21%20I%27d%20like%20to%20know%20more%20about%20Doxxy%20for%20my%20small%20clinic">Chat With Us on WhatsApp</Link>
      </Button>
    </div>
    <p className="text-sm mt-4 text-gray-500 dark:text-gray-400">
      No setup fees &middot; Cancel anytime &middot; Free onboarding call for you and your staff
    </p>
  </Section>
);

// --- MAIN PAGE ---

export default function ClinicSoftwareSmallClinic() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <ProblemSection />
      <MathSection />
      <SolutionSection />
      <WorkflowSection />
      <ResultsSection />
      <TestimonialSection />
      <FAQSection />
      <FinalCTASection />
      <SignupCTA
        heading="Built for Clinics Like Yours — Small, but Serious"
        description="No bloated hospital software. Light, affordable, and your receptionist learns it in 3 days. Chat with us on WhatsApp — we'll show you how it fits a solo practice."
      />

      <Script
        id="faq-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Clinic Software for Small Clinics", url: `${APP_URL}/clinic-software-small-clinic` },
        ]}
      />
    </div>
  );
}
