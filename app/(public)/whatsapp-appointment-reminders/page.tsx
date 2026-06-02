// Path: app/(public)/whatsapp-appointment-reminders/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle, MessageCircle, Bell, Users, CalendarX, TrendingDown, Clock, Zap, Gift, FileText, HeartHandshake, BarChart3, Shield } from 'lucide-react';
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";

export const metadata: Metadata = {
  title: 'WhatsApp Appointment Reminders for Clinics — Cut No-Shows by 35% | Doxxy',
  description: 'Automated WhatsApp appointment reminders for Indian clinics. Reduce no-shows by 35%, send confirmations, and let patients reschedule with one tap. Used by 500+ clinics across India.',
  alternates: { canonical: '/whatsapp-appointment-reminders' },
  openGraph: {
    title: 'WhatsApp Appointment Reminders for Clinics — Cut No-Shows by 35%',
    description: 'Automated WhatsApp appointment reminders for Indian clinics. Reduce no-shows, send confirmations, and let patients reschedule with one tap.',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'WhatsApp Appointment Reminders for Clinics' }],
  },
  keywords: ['WhatsApp appointment reminders', 'clinic reminder WhatsApp', 'reduce patient no-shows', 'clinic WhatsApp automation', 'patient reminder system India', 'WhatsApp Business API clinic'],
};

// --- FAQ Structured Data ---
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do WhatsApp appointment reminders reduce clinic no-shows?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'WhatsApp reminders achieve 98% open rates compared to 20% for SMS and 15% for email. When a patient receives a WhatsApp message 24 hours before their appointment, they see it, read it, and can confirm or reschedule with a single tap. Clinics using Doxxy WhatsApp reminders report an average 35% reduction in no-shows within the first 60 days. The confirmation mechanism lets clinics know exactly who is coming, so no-show slots can be offered to waitlisted patients immediately.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the WhatsApp Business API expensive for a small clinic?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Doxxy includes WhatsApp reminders in the Clinical Excellence plan at ₹10 per consultation, with no separate WhatsApp API charges. The standalone cost of WhatsApp Business API for a clinic sending 500 reminders per month would typically range from ₹1,500-₹3,000 per month through Meta directly, but Doxxy bundles this cost into your plan. When you consider that a single prevented no-show saves ₹300-₹1,000 in lost consultation revenue, the math makes the cost negligible — preventing just 3-5 no-shows per month covers your entire Doxxy subscription.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I send WhatsApp reminders in Hindi, Marathi, or other Indian languages?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Doxxy supports 13 Indian languages for WhatsApp reminders including Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Punjabi, and English. You can set the default language for your clinic, and the reminder templates automatically use culturally appropriate phrasing in the selected language. For multi-lingual patient bases, you can even set per-patient language preferences so each patient receives reminders in their preferred language. This is particularly powerful in cities like Mumbai, Pune, and Bengaluru where clinics serve patients from diverse linguistic backgrounds.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does the WhatsApp reminder system work for multi-doctor clinics?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. Doxxy handles multi-doctor scheduling natively. Each reminder includes the doctor name, clinic address, and appointment time — ensuring patients don\'t get confused about which doctor they are seeing. For multi-location clinics, reminders include the specific branch address with a Google Maps link. The system also handles doctor-specific cancellation workflows: if Doctor A is unavailable, the system automatically informs affected patients and offers to reschedule with Doctor B at the same clinic, preserving revenue that would otherwise be lost.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens if a patient does not have WhatsApp?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doxxy has a multi-channel fallback system. If a patient does not have WhatsApp (which is rare in India — over 500 million Indians use WhatsApp), or if the WhatsApp message fails to deliver, the system automatically falls back to SMS. You can configure the fallback order in your clinic settings. The system also supports voice call reminders via IVR for elderly patients who may not be comfortable with messaging apps. The goal is 100% reach — no patient should miss an appointment because they didn\'t receive a reminder in a format they use.',
      },
    },
  ],
};

// --- PAGE COMPONENTS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      Every Empty Chair Costs Your Clinic Real Money.
    </h1>
    <SectionSubtitle>
      Stop losing ₹2,500-₹5,000 per no-show. Doxxy sends automated WhatsApp reminders that patients actually read — cutting no-shows by 35% across clinics in India.
    </SectionSubtitle>
    <div className="mt-10">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Start Sending Reminders Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

const ProblemSection = () => (
  <Section>
    <SectionTitle>No-Shows Are Bleeding Your Practice.</SectionTitle>
    <SectionSubtitle className="mt-4">
      You do not have a patient problem. You have a communication problem — and it is costing you more than you think.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 text-gray-600 dark:text-gray-300 space-y-5 text-base leading-relaxed">
      <p>
        Picture a typical Tuesday morning at your clinic in Pune or Lucknow. Your appointment book shows 35 patients scheduled between 9 AM and 1 PM. Your receptionist, Priya, arrived early. The doctor has reviewed the list. Everyone is ready.
      </p>
      <p>
        By 11 AM, seven patients have not shown up. No calls. No messages. Priya tried calling them on her personal phone, but three numbers were switched off and two calls went unanswered. Your consultation room sits empty while the waiting area has six walk-in patients who could have taken those slots — if anyone had known.
      </p>
      <p>
        This is not a staffing problem. It is not a patient-loyalty problem. It is a reminder problem. SMS gets ignored. Phone calls feel intrusive. But WhatsApp — the app your patients already open 25 times a day — gets read within 3 minutes, 98% of the time. The solution is not more reminders. It is reminders on the right channel.
      </p>
      <p>
        Indian clinics lose an average of 8-15 booked appointments every single day to no-shows. Each empty slot represents ₹300-₹1,000 in lost consultation fees, plus the cascading losses of follow-up visits, pharmacy referrals, and diagnostic test recommendations that would have followed. For a single-doctor clinic, that is ₹90,000-₹1,80,000 in lost annual revenue — and that figure does not even count the cost of idle staff time.
      </p>
    </div>
  </Section>
);

const MathSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>The Numbers Do Not Lie.</SectionTitle>
    <SectionSubtitle className="mt-4">
      WhatsApp is not just convenient — it is statistically the most effective patient communication channel in India.
    </SectionSubtitle>
    <div className="grid md:grid-cols-3 gap-8 mt-16">
      {[
        { icon: MessageCircle, stat: '98%', label: 'WhatsApp Open Rate', detail: 'vs 20% for SMS and 15% for email. Your message gets seen.' },
        { icon: TrendingDown, stat: '35%', label: 'Average No-Show Reduction', detail: 'Clinics on Doxxy see a 35% drop in no-shows within 60 days of enabling WhatsApp reminders.' },
        { icon: Users, stat: '500M+', label: 'WhatsApp Users in India', detail: 'Your patients already use WhatsApp daily. Meet them where they are.' },
        { icon: CalendarX, stat: '8-15', label: 'Daily No-Shows Per Clinic', detail: 'The average Indian OPD loses 8-15 appointment slots per day to no-shows.' },
        { icon: Clock, stat: '3 Min', label: 'Average Read Time', detail: 'WhatsApp messages are read within 3 minutes of delivery. SMS can sit unread for hours.' },
        { icon: Zap, stat: '₹1.8L', label: 'Annual Revenue Saved', detail: 'For a single-doctor clinic, reducing no-shows by 35% saves approximately ₹1,80,000 per year.' },
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
    <SectionTitle>How Doxxy WhatsApp Reminders Work.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Not just notifications — a full confirmation and rescheduling system that keeps your appointment book full.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 space-y-8">
      {[
        {
          title: 'Automated & Personalised',
          description: 'Every reminder includes the doctor name, clinic address with a Google Maps link, appointment time, and a culturally appropriate greeting. Patients feel like the doctor personally reached out — but your receptionist never touched a phone. Templates are customisable per clinic, per doctor, and per language.',
          icon: Bell,
        },
        {
          title: 'One-Tap Confirm or Reschedule',
          description: 'Patients do not need to call your clinic. The WhatsApp message includes interactive buttons: "Confirm," "Reschedule," and "Cancel." A single tap updates your appointment book in real time. Cancelled slots are immediately flagged so your receptionist can offer them to waitlisted patients — filling slots that would have been empty.',
          icon: CheckCircle,
        },
        {
          title: 'Multi-Language, Multi-Channel Fallback',
          description: 'Reminders go out in 13 Indian languages including Hindi, Marathi, Tamil, Telugu, Bengali, and Gujarati. Set per-patient language preferences or a clinic-wide default. If a patient does not have WhatsApp or the message fails, Doxxy automatically falls back to SMS — and to IVR voice calls for elderly patients.',
          icon: MessageCircle,
        },
        {
          title: 'Appointment Book Optimisation',
          description: 'Doxxy does not just send reminders — it optimises your schedule. Cancelled slots are automatically offered to the top of your waitlist. The system learns which patients are frequent no-shows and can flag them for double-confirmation or overbooking strategies. Your appointment book stays full, and your revenue stays protected.',
          icon: BarChart3,
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
    <SectionTitle>From Booking to Confirmation — Entirely Automated.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Four steps. Zero manual work for your staff. Complete visibility for your clinic.
    </SectionSubtitle>
    <div className="grid md:grid-cols-4 gap-6 mt-16">
      {[
        { step: '1', title: 'Patient Books', description: 'Patient books an appointment via the Doxxy patient portal, WhatsApp, phone call to clinic, or walk-in registration at the reception desk.' },
        { step: '2', title: 'Reminder at 24 Hours', description: 'Exactly 24 hours before the appointment, Doxxy sends a WhatsApp message with doctor name, time, clinic address, and a Google Maps link.' },
        { step: '3', title: 'One-Tap Response', description: 'Patient taps "Confirm" or "Reschedule." The appointment book updates instantly. No phone calls. No manual follow-up.' },
        { step: '4', title: 'Auto-Fill Cancellations', description: 'If a patient cancels, waitlisted patients are immediately notified and offered the slot. Your chair never stays empty.' },
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
    <SectionTitle>Your Clinic Before and After WhatsApp Reminders.</SectionTitle>
    <SectionSubtitle className="mt-4">
      This is not a competitor comparison. This is the state of your own clinic before and after automated WhatsApp reminders.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            <th className="text-left p-4 font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Metric</th>
            <th className="text-left p-4 font-semibold text-red-600 dark:text-red-400 text-sm uppercase tracking-wider">Without Reminders</th>
            <th className="text-left p-4 font-semibold text-green-600 dark:text-green-400 text-sm uppercase tracking-wider">With Doxxy WhatsApp Reminders</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {[
            { metric: 'No-Show Rate', before: '20-30% of booked patients', after: '10-15% — a 35% reduction' },
            { metric: 'Staff Time on Reminders', before: '2-3 hours/day making phone calls', after: 'Zero — fully automated' },
            { metric: 'Patient Confirmation Rate', before: 'Less than 20% via SMS/phone', after: 'Over 70% via one-tap confirm' },
            { metric: 'Lost Revenue per No-Show', before: '₹300-₹1,000 per empty slot', after: 'Slots re-filled from waitlist within minutes' },
            { metric: 'Patient Satisfaction', before: 'Frustrated staff, confused patients', after: 'Professional, timely, language-preferred comms' },
            { metric: 'End-of-Day Schedule Accuracy', before: 'Receptionist manually reconciles', after: 'Real-time dashboard. Always accurate.' },
            { metric: 'Waitlisted Patient Conversion', before: 'Waitlisted patients rarely called back', after: 'Auto-offered cancelled slots. 40% conversion.' },
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
    <SectionTitle>WhatsApp Does More Than Reminders.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Four powerful WhatsApp capabilities built into Doxxy that go beyond appointment reminders.
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 gap-8 mt-16">
      {[
        {
          icon: Gift,
          title: 'Birthday and Anniversary Messages',
          description: 'Automatically send personalised birthday and anniversary wishes to patients on their special days. A small touch that builds loyalty — patients remember the clinic that remembered them.',
          items: ['Auto-detected from patient profiles', 'Customisable templates in 13 languages', 'Optional health checkup reminder included', 'Boosts return visits by 22%'],
        },
        {
          icon: FileText,
          title: 'Lab Report Delivery via WhatsApp',
          description: 'Send lab reports and diagnostic results directly to patients via WhatsApp as PDFs. No more asking patients to visit the clinic just to collect a report. Faster, more convenient, and fully encrypted.',
          items: ['Auto-attach PDF reports to WhatsApp', 'End-to-end encrypted delivery', 'Patient notified instantly when results are ready', 'Eliminates report-collection visits'],
        },
        {
          icon: Users,
          title: 'Bulk WhatsApp Campaigns',
          description: 'Send health awareness messages, flu-season alerts, or new-service announcements to your entire patient base — or targeted segments — through WhatsApp. Like email marketing, but with 98% open rates.',
          items: ['Segment by age, condition, or visit history', 'Schedule campaigns in advance', 'Track open and response rates', 'GDPR and data-protection compliant'],
        },
        {
          icon: Shield,
          title: 'Two-Way Patient Communication',
          description: 'WhatsApp on Doxxy is not just broadcast. Patients can reply to reminders, ask questions, and your receptionist can respond from the Doxxy dashboard — keeping all clinic-patient communication in one thread.',
          items: ['Unified inbox for all WhatsApp messages', 'Patient context auto-attached to each message', 'No need to use personal WhatsApp numbers', 'Full conversation history for medico-legal records'],
        },
      ].map(({ icon: Icon, title, description, items }) => (
        <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">{description}</p>
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
      Everything clinic owners ask about using WhatsApp for patient communication.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-6">
      {[
        {
          q: 'How do WhatsApp appointment reminders reduce clinic no-shows?',
          a: 'WhatsApp messages achieve a 98% open rate compared to just 20% for SMS and 15% for email. When your clinic sends a friendly, personalised WhatsApp reminder 24 hours before an appointment, the patient sees it almost immediately and can confirm attendance with a single tap. Doxxy clinics report an average 35% drop in no-shows within the first 60 days. Beyond the reminder itself, the confirmation mechanism gives your receptionist real-time visibility into who is and is not coming, so no-show slots can be filled from your waitlist within minutes. The net effect is not just fewer empty chairs — it is a fundamentally more predictable and profitable appointment book. Combined with <Link href="/clinic-billing-software" className="text-blue-600 hover:underline">automated billing</Link>, your front-desk operations go from chaotic to clockwork.',
        },
        {
          q: 'Is the WhatsApp Business API expensive for a small clinic?',
          a: 'Doxxy bundles WhatsApp reminders into the Clinical Excellence plan at ₹10 per consultation, with no separate WhatsApp API charges or per-message fees. If you were to set up the WhatsApp Business API independently through Meta, a clinic sending 500 reminders a month would pay approximately ₹1,500-₹3,000 in API and messaging fees — before factoring in the development cost of building the integration. With Doxxy, all of that is included. Consider this: preventing just 3-5 no-shows per month (at ₹300-₹1,000 per consultation) covers your entire Doxxy subscription. The WhatsApp reminders pay for themselves many times over.',
        },
        {
          q: 'Can I send WhatsApp reminders in Hindi, Marathi, or other regional languages?',
          a: 'Yes. Doxxy supports 13 Indian languages: Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu, and English. You can set a clinic-wide default language, and for clinics serving a multi-lingual patient base, you can set per-patient language preferences. The reminder templates are crafted with culturally appropriate phrasing for each language — a Hindi reminder reads naturally to a Hindi speaker, not like a machine translation. This is especially valuable in cosmopolitan cities like Mumbai, Bengaluru, and Hyderabad where clinics routinely serve patients who speak 3-4 different languages.',
        },
        {
          q: 'Does the reminder system work for clinics with multiple doctors?',
          a: 'Absolutely. Doxxy handles multi-doctor scheduling natively. Each WhatsApp reminder includes the specific doctor name, their specialisation, the appointment time, and the clinic address with a Google Maps link — so patients never mix up which doctor or which branch they are visiting. For multi-location clinics, the reminder includes the correct branch address automatically. There is also a doctor-specific cancellation workflow: if one doctor is unavailable, the system informs affected patients and offers to reschedule with another doctor at the same clinic, preserving revenue that would otherwise walk out the door.',
        },
        {
          q: 'What happens if a patient does not use WhatsApp?',
          a: 'While over 500 million Indians use WhatsApp (making it by far the most ubiquitous messaging platform in the country), Doxxy has a multi-channel fallback system for the small percentage who do not. If a patient does not have WhatsApp registered on their phone number, or if the WhatsApp message fails to deliver for any reason, Doxxy automatically falls back to SMS. For elderly patients who may be uncomfortable with any messaging app, you can configure IVR (interactive voice response) call reminders. You set the fallback order in your clinic settings — the goal is 100% reach, regardless of the patient\'s tech comfort level.',
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

export default function WhatsAppAppointmentReminders() {
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
        heading="See How Doxxy's WhatsApp Reminders Work"
        description="Book a 15-minute walkthrough on WhatsApp. We'll show you exactly how automated reminders can cut your clinic's no-shows by 35%."
      />

      <Script
        id="faq-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "WhatsApp Appointment Reminders", url: `${APP_URL}/whatsapp-appointment-reminders` },
        ]}
      />
    </div>
  );
}
