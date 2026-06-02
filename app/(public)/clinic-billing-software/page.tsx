// Path: app/(public)/clinic-billing-software/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle, Calculator, ReceiptIndianRupee, Clock, FileCheck, BarChart3, TrendingUp, Shield, SmartphoneNfc, LayoutDashboard, AlertTriangle, Building2 } from 'lucide-react';
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";

export const metadata: Metadata = {
  title: 'Clinic Billing Software India — Stop Losing ₹2,500/Day to Manual Errors | Doxxy',
  description: 'Automated clinic billing software for Indian clinics. Generate bills in 30 seconds, accept UPI payments, auto-calculate GST, and stop revenue leakage from manual errors. For clinics billing 30-50 patients daily.',
  alternates: { canonical: '/clinic-billing-software' },
  openGraph: {
    title: 'Clinic Billing Software India — Automated Billing for Modern Clinics',
    description: 'Stop losing ₹2,500/day to manual billing errors. Automated invoicing, UPI payments, GST compliance, and real-time revenue dashboards for Indian clinics.',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Clinic Billing Software for Indian Clinics' }],
  },
  keywords: ['clinic billing software India', 'medical billing software', 'clinic invoicing', 'GST billing clinic', 'UPI payment clinic', 'OPD billing software', 'clinic revenue management'],
};

// --- FAQ Structured Data ---
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Does Doxxy support GST billing for clinics?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Doxxy generates fully GST-compliant invoices with auto-calculated CGST and SGST or IGST based on your clinic location and the patient\'s state. You can configure your GSTIN, clinic PAN, and HSN/SAC codes for services and medicines. Every bill includes all mandatory fields required under Indian GST law: invoice number, date, GSTIN, HSN codes, taxable value, tax breakup, and total. At the end of each month, you can export all invoices in a format ready for your GST return filing — no manual compilation required.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I accept UPI payments through Doxxy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Doxxy integrates with UPI payment collection. Each digital bill includes a UPI QR code that patients can scan with any UPI app — Google Pay, PhonePe, Paytm, or BHIM. The payment is instantly confirmed and reconciled against the bill, eliminating the need for your receptionist to manually match bank notifications to invoices. For clinics that prefer card payments, Doxxy also supports card terminals through partner integrations. The payment status flows directly into your daily revenue report, giving you a real-time view of collections versus outstanding amounts.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does Doxxy handle insurance claims?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doxxy supports cashless and reimbursement insurance workflows. For cashless claims, you can generate pre-authorisation forms directly from the patient consultation, attach clinical notes and prescriptions, and submit them to the insurer. For reimbursement claims, Doxxy generates detailed itemised bills with diagnosis codes, procedure codes, and pharmacy line items — all in the format insurers require. The system tracks claim status (submitted, approved, partially approved, rejected) and can flag underpaid claims for follow-up. This reduces the typical insurance processing time from 3-4 days to a few hours.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I see daily revenue reports in Doxxy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Doxxy provides a real-time revenue dashboard that updates with every bill generated. At any point during the day, you can see total collections, a breakup by payment mode (cash, UPI, card, pending), a patient-wise collection summary, and your top revenue-generating services. At the end of the day, one click generates a day-closing report showing total patients seen, total billed, total collected, outstanding amounts, and GST collected — ready for your accountant. For multi-clinic owners, you can drill down by location or see a consolidated view across all your clinics.',
      },
    },
    {
      '@type': 'Question',
      name: 'How are refunds handled in Doxxy billing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Refunds in Doxxy are handled through a formal credit-note workflow that maintains a complete audit trail. When a refund is needed — for example, if a patient was double-charged or a procedure was cancelled after payment — Doxxy generates a credit note linked to the original bill. You can issue a full or partial refund, specify the reason, and choose the refund method (original payment mode or cash). The credit note automatically adjusts your daily revenue totals and GST liability calculations. Every refund action is logged with timestamp and user ID for your internal audit requirements.',
      },
    },
  ],
};

// --- PAGE COMPONENTS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      Billing Is Revenue Protection — Not Just Invoicing.
    </h1>
    <SectionSubtitle>
      Manual billing errors leak 5-8% of your clinic revenue every month. Doxxy automates billing from consultation to collection — stopping the ₹2,500/day leakage most clinics do not even know they have.
    </SectionSubtitle>
    <div className="mt-10">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Start Billing Smart <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

const ProblemSection = () => (
  <Section>
    <SectionTitle>Manual Billing Is Costing You Real Revenue. Every Single Day.</SectionTitle>
    <SectionSubtitle className="mt-4">
      The ₹2,500 you lose today is not a one-time mistake — it is a structural problem baked into how most Indian clinics handle billing.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 text-gray-600 dark:text-gray-300 space-y-5 text-base leading-relaxed">
      <p>
        Let us be blunt: if your receptionist writes bills by hand or types them into a generic billing template, you are leaking money. Not occasionally. Not when someone makes a mistake. Systematically. Every day.
      </p>
      <p>
        Consider a medium-sized OPD in Indore or Coimbatore that sees 40 patients a day. Each bill has 3-5 line items: consultation fee, a couple of diagnostic tests, maybe some pharmacy items. At the end of a 10-hour shift, does your receptionist remember to add the ₹150 blood sugar test to patient 23's bill? Did they charge the newborn consultation rate or the adult rate for that family visit? When a patient says "I will pay tomorrow," is it tracked or forgotten?
      </p>
      <p>
        Studies of manual billing in Indian healthcare settings show a consistent 5-8% revenue leakage — not from fraud, but from simple human error. Missed line items. Incorrect rates. Unbilled follow-ups. Untracked credit patients. For a clinic collecting ₹50,000 a day, that is ₹2,500-₹4,000 lost daily. Annually, that figure crosses ₹9,00,000. That is not a rounding error. That is an entire staff salary.
      </p>
      <p>
        And revenue is only half the problem. Manual bills mean no standardised GST invoices, so your accountant spends weekends compiling tax data. Payments get collected in cash with no digital trail. End-of-day reconciliation takes 45 minutes of counting and cross-checking. And when a patient disputes a charge from three weeks ago, your receptionist digs through carbon copies of receipt books.
      </p>
    </div>
  </Section>
);

const MathSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>What Manual Billing Is Actually Costing You.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Break down the leakage. Every figure here is based on real Indian OPD billing data.
    </SectionSubtitle>
    <div className="grid md:grid-cols-3 gap-8 mt-16">
      {[
        { icon: AlertTriangle, stat: '5-8%', label: 'Revenue Leakage Rate', detail: 'Manual processes lose 5-8% of billable revenue through missed charges, incorrect rates, and untracked credit patients.' },
        { icon: Calculator, stat: '₹2,500', label: 'Lost Per Day', detail: 'For a clinic billing ₹50,000/day, a 5% leakage is ₹2,500 daily. That compounds to ₹9,00,000+ annually.' },
        { icon: Clock, stat: '45 Min', label: 'Daily Reconciliation', detail: 'Manual end-of-day reconciliation takes 45+ minutes. Staff staying late to match cash, receipts, and appointment logs.' },
        { icon: ReceiptIndianRupee, stat: '30-50', label: 'Patients Per Day', detail: 'The average Indian OPD sees 30-50 paying patients daily, each bill with 3-5 line items — 90-250 line items to track.' },
        { icon: TrendingUp, stat: '3-4 Days', label: 'Insurance Claim Time', detail: 'Manually preparing insurance claims takes 3-4 days per claim due to missing data and inconsistent formats.' },
        { icon: FileCheck, stat: '0%', label: 'GST Compliance in Manual', detail: 'Most manual billing setups provide zero GST-compliant invoices — creating audit risk and input credit loss.' },
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
    <SectionTitle>Doxxy Billing: Built for How Indian Clinics Actually Operate.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Not an accounting tool retrofitted for healthcare. A billing system purpose-built for OPDs, polyclinics, and multi-specialty practices in India.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 space-y-8">
      {[
        {
          title: 'Consultation-to-Bill in One Flow',
          description: 'When a doctor completes a consultation in Doxxy and records a diagnosis, prescriptions, and investigations, the bill generates automatically. No separate data entry. The consultation fee, procedure charges, pharmacy items, and diagnostic test costs are pulled directly from the clinical record. The receptionist reviews and confirms — but never re-enters data. This eliminates the single largest source of billing errors: mistyped or forgotten line items.',
          icon: FileCheck,
        },
        {
          title: 'UPI, Card, Cash — One Screen',
          description: 'The payment collection screen shows all modes: UPI QR (instantly generated per bill with exact amount), card terminal integration, and cash with auto-calculated change. When a patient pays via UPI, the payment confirmation flows back into Doxxy, marking the bill as paid. No need for the receptionist to check a separate PhonePe or Paytm notification. End-of-day reconciliation for digital payments is automatic — because every transaction is matched at the point of collection.',
          icon: SmartphoneNfc,
        },
        {
          title: 'GST-Compliant Invoices by Default',
          description: 'Every bill generated in Doxxy is a GST-compliant tax invoice with CGST/SGST breakup, HSN codes for services, and your clinic GSTIN prominently displayed. The system auto-selects IGST for inter-state patients and CGST+SGST for intra-state transactions. At month-end, one export gives your accountant every invoice with all fields needed for GSTR-1 and GSTR-3B filing. No manual tax calculation. No Excel sheets. No audit anxiety.',
          icon: Shield,
        },
        {
          title: 'Real-Time Revenue Dashboard',
          description: 'From any screen, the Doxxy dashboard shows live numbers: today\'s collections, patient count, average bill value, payment-mode breakup, and outstanding credit. Drill down by doctor, by service type, or by payment mode. For multi-clinic owners, switch between location views or see a consolidated revenue picture. This is not a monthly report you wait for — it is a real-time pulse of your clinic\'s financial health.',
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
    <SectionTitle>One Seamless Billing Flow. Zero Manual Steps.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Watch what happens to your billing process when it is directly connected to clinical data.
    </SectionSubtitle>
    <div className="grid md:grid-cols-4 gap-6 mt-16">
      {[
        { step: '1', title: 'Patient Checks In', description: 'Patient arrives. Receptionist marks them as "arrived" in Doxxy. The system knows the appointment type, doctor, and applicable consultation rate automatically.' },
        { step: '2', title: 'Consultation Recorded', description: 'Doctor completes the consultation: diagnosis, prescriptions, lab tests ordered, procedure notes. Every clinical action carries its billing code in the background.' },
        { step: '3', title: 'Bill Auto-Generated', description: 'Doxxy compiles all chargeable items from the consultation into a bill. Receptionist reviews, confirms, selects payment mode. Patient pays via UPI QR or cash.' },
        { step: '4', title: 'Receipt & Reconciliation', description: 'Digital receipt sent to patient via WhatsApp. Transaction logged. Dashboard updates live. End-of-day report ready with one click. Nothing to reconcile manually.' },
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
    <SectionTitle>Your Clinic Before and After Doxxy Billing.</SectionTitle>
    <SectionSubtitle className="mt-4">
      The same clinic. The same patients. Radically different financial control.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            <th className="text-left p-4 font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Metric</th>
            <th className="text-left p-4 font-semibold text-red-600 dark:text-red-400 text-sm uppercase tracking-wider">Manual Billing</th>
            <th className="text-left p-4 font-semibold text-green-600 dark:text-green-400 text-sm uppercase tracking-wider">Doxxy Billing</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {[
            { metric: 'Error Rate', before: '5-8% — missed line items, wrong rates', after: 'Under 1% — auto-compiled from clinical data' },
            { metric: 'Time Per Bill', before: '3-5 minutes — manual write-up, rate lookup', after: '30 seconds — review and confirm only' },
            { metric: 'Payment Collection', before: 'Cash-dominated, no digital trail, difficult to reconcile', after: 'UPI QR + card + cash. Every payment matched to a bill.' },
            { metric: 'GST Compliance', before: 'Inconsistent. Most bills are non-compliant.', after: 'Every bill is a valid tax invoice. Month-end export ready for filing.' },
            { metric: 'Follow-Up Billing', before: 'Often forgotten. No systematic tracking.', after: 'Auto-flagged. Outstanding payments dashboard with SMS/WhatsApp nudges.' },
            { metric: 'End-of-Day Reconciliation', before: '45 minutes of manual counting and cross-checking.', after: 'One click. Real-time dashboard already reconciled throughout the day.' },
            { metric: 'Insurance Claims', before: '3-4 days per claim. Inconsistent formats.', after: 'Pre-formatted itemised bills. Claim submitted same day with all attachments. Pair with <Link href="/digital-prescription-software" className="text-blue-600 hover:underline">digital prescriptions</Link> for coded, insurer-ready claims.' },
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
    <SectionTitle>Billing Is Just the Start.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Three capabilities that make Doxxy billing more than an invoicing tool — it is your clinic's financial command centre.
    </SectionSubtitle>
    <div className="grid md:grid-cols-3 gap-8 mt-16">
      {[
        {
          icon: LayoutDashboard,
          title: 'Revenue Analytics Dashboard',
          description: 'See daily, weekly, and monthly revenue trends. Compare doctor-wise collections, service-wise revenue, and payment-mode splits. Identify your most profitable services and busiest days.',
          items: ['Doctor-wise revenue comparison', 'Service-level profitability analysis', 'Patient acquisition cost tracking', 'Monthly revenue forecasting'],
        },
        {
          icon: Building2,
          title: 'Multi-Clinic Consolidated Billing',
          description: 'For chains and multi-location practices: unified billing across all clinics with location-specific drill-downs. Consolidated GST reports, inter-clinic revenue comparison, and centralised patient credit tracking.',
          items: ['Location-wise P&L in one dashboard', 'Consolidated tax filing exports', 'Cross-clinic patient credit visibility', 'Unified payment gateway for all locations'],
        },
        {
          icon: ReceiptIndianRupee,
          title: 'Pharmacy & Lab Billing Integration',
          description: 'If your clinic has an in-house pharmacy or diagnostic lab, Doxxy integrates billing seamlessly. Pharmacy dispensation and lab test orders from the consultation flow directly into the bill with correct pricing and inventory deduction.',
          items: ['Auto-linked pharmacy dispensation billing', 'Lab test order-to-bill integration', 'Inventory auto-deduction on dispensation', 'Separate pharmacy P&L tracking'],
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
      Everything clinic owners ask about billing, payments, and financial compliance.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-6">
      {[
        {
          q: 'Does Doxxy support GST billing for clinics?',
          a: 'Yes, Doxxy is built with Indian GST compliance at its core. Every bill generated is a valid tax invoice with CGST and SGST (or IGST for inter-state patients) auto-calculated based on your clinic\'s state and the patient\'s location. You configure your GSTIN, clinic PAN, and HSN/SAC codes once during setup, and every subsequent bill picks up the correct tax treatment automatically. For pharmacy line items, HSN codes are linked to your inventory items. At the end of each month, the system exports all invoices in a format directly usable for GSTR-1 and GSTR-3B filing. Your accountant does not need to open a single Excel file.',
        },
        {
          q: 'Can I accept UPI payments through Doxxy?',
          a: 'Yes, and it is one of the most-used features by Doxxy clinics. Each bill generates a UPI QR code with the exact amount pre-filled. Patients scan with Google Pay, PhonePe, Paytm, or any BHIM UPI app. The payment confirmation is automatically reconciled against the bill, so your receptionist never has to manually match a phone notification to an invoice. For clinics that accept card payments, Doxxy integrates with popular card terminals. The payment screen shows all three modes — UPI, card, cash — and tracks the status of each bill in real time. At day-end, your collection report is already accurate.',
        },
        {
          q: 'How does Doxxy handle insurance claims for clinics?',
          a: 'Doxxy supports both cashless and reimbursement insurance workflows. For cashless claims, you can generate a pre-authorisation request directly from the patient\'s consultation record, attaching the clinical notes and proposed treatment plan. For reimbursement claims, Doxxy produces itemised bills with diagnosis codes (ICD-10), procedure codes, and pharmacy line items — all in the structured format that insurers like Star Health, ICICI Lombard, and HDFC Ergo require. The system tracks the status of each claim, flags underpaid amounts, and maintains a complete audit trail for TPA audits. What used to take 3-4 days per claim now takes under an hour.',
        },
        {
          q: 'Can I see daily revenue reports?',
          a: 'You can see live revenue data — not just daily reports. The Doxxy dashboard updates in real time as each bill is generated and paid. At any moment during the day, you can see total collections, payment-mode breakup (UPI vs cash vs card vs pending), patient-wise collection summaries, and top revenue-generating services. At day-end, one click produces the closing report: total patients, total billed, total collected, outstanding credit, GST collected, and net revenue. For multi-clinic owners, you can view location-level reports or a consolidated view. Historical reports let you compare today to the same day last week or last month, so you always know how your clinic is trending.',
        },
        {
          q: 'How are refunds and cancellations handled?',
          a: 'Doxxy uses a formal credit-note system for refunds. When a refund is needed — for instance, if a patient was double-charged, a test was cancelled, or a procedure was not performed — your staff creates a credit note linked to the original bill. You can issue a full or partial refund, select the reason from a predefined list, and choose the return mode (original payment method or cash). The credit note automatically adjusts your daily revenue totals, GST calculations, and inventory (if pharmacy items are involved). Every refund action is logged with timestamp, user ID, and reason — giving you a complete and auditable trail. This is essential for both internal controls and any potential tax audit.',
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

export default function ClinicBillingSoftware() {
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
        heading="Stop Leaving ₹2,500/Day on the Table"
        description="See how Doxxy's automated billing catches what manual billing misses — from missed charges to forgotten follow-up invoices. A 15-minute WhatsApp walkthrough, not a sales pitch."
      />

      <Script
        id="faq-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Clinic Billing Software", url: `${APP_URL}/clinic-billing-software` },
        ]}
      />
    </div>
  );
}
