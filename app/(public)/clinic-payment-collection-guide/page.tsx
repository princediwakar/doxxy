// Path: app/(public)/clinic-payment-collection-guide/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreditCard, Smartphone, Receipt, ShieldCheck, BarChart3, Clock, IndianRupee, ArrowRight, AlertTriangle, CheckCircle, TrendingUp, QrCode, Bell, FileText, Calculator, Users, LayoutDashboard, Ban } from 'lucide-react';
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";

export const metadata: Metadata = {
  title: 'Clinic Payment Collection Guide — UPI, Digital Billing & Auto-Collections | Doxxy',
  description: 'Stop losing 5-8% of your clinic revenue to billing errors and unpaid dues. Guide to UPI QR payments, automated billing, digital ledgers, and handling "I\'ll pay next time" patients.',
  alternates: { canonical: '/clinic-payment-collection-guide' },
  openGraph: {
    title: 'Clinic Payment Collection — UPI, Digital Billing & Auto-Collections for Indian Clinics',
    description: 'How to set up UPI QR, auto-billing, and digital payment collection for your clinic. End cash handling errors.',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy Clinic Payment Collection Guide' }],
  },
  keywords: ['clinic payment collection', 'UPI for clinic', 'digital payment methods clinic India', 'clinic billing software India', 'OPD billing system', 'clinic invoice software', 'patient payment collection India', 'clinic GST billing'],
};

// --- FAQ Structured Data ---
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What if a patient doesn\'t use UPI or doesn\'t have a smartphone?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cash is still fully supported. The receptionist marks the bill as "Cash" and enters the amount received. The system tracks it exactly the same way — the only difference is the payment method label on the bill. The end-of-day report breaks down collections by payment mode (UPI, cash, card), so you have a single source of truth regardless of how patients pay. Patients can also pay by card if you have a card machine at reception. Doxxy does not force a digital-only workflow — it makes digital the default while keeping cash and card as first-class options.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does Doxxy handle GST billing for clinics?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doxxy auto-generates GST-compliant invoices with your clinic\'s GSTIN, SAC/HSN codes for medical services, and all required fields under Indian GST law. You can configure tax rates per service (e.g., consultation at 0% GST under healthcare exemption, pharmacy items at applicable rates). The system auto-selects IGST for inter-state patients and CGST+SGST for intra-state. For clinics below the ₹20 lakh GST threshold, you can disable GST entirely and generate simple receipts instead. Month-end exports are formatted for direct use in GSTR-1 filing.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can we set different consultation fees for different doctors or different time slots?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Doxxy supports a flexible fee schedule. You can set a base consultation fee per doctor (e.g., Dr. Sharma at ₹800, Dr. Patel at ₹400), add surcharges for premium time slots (weekend/evening +₹200), and configure reduced rates for follow-up visits (₹300). The system auto-selects the correct fee based on the doctor, appointment time, and visit type — no manual rate lookup by the receptionist. Fee changes can be scheduled in advance, so if a doctor\'s rates change from next month, you configure it once and the system switches over automatically.',
      },
    },
    {
      '@type': 'Question',
      name: 'How are refunds handled in Doxxy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Refunds are processed from the billing dashboard using a formal credit-note workflow. The original bill is marked as "Refunded" and a linked credit note is generated with the refund amount, reason, and date. If the patient paid via UPI, the actual fund transfer must be done through your UPI app — Doxxy records and tracks the refund status but does not process UPI transactions directly. The credit note adjusts your daily revenue totals and GST calculations automatically. Every refund action is logged with timestamp and user ID, maintaining a full audit trail for your records.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can Doxxy integrate with our existing accounting software like Tally?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Doxxy can export daily, weekly, or monthly transaction reports in CSV and Excel formats that import directly into Tally, Zoho Books, Busy, Marg, or any accounting software that accepts structured imports. The export includes bill-level detail: invoice number, date, patient name, line items, amounts, tax breakup, and payment mode. For clinics using Tally Prime, native API integration is on the Doxxy roadmap — this will enable real-time sync of every transaction to your Tally ledger without manual exports. Until then, the CSV/Excel export workflow takes under 30 seconds.',
      },
    },
  ],
};

// --- PAGE COMPONENTS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      Every Patient Who Says &ldquo;I&rsquo;ll Pay Next Time&rdquo; Is Revenue You May Never See.
    </h1>
    <SectionSubtitle>
      The complete guide to payment collection for Indian clinics — UPI QR, automated billing, digital ledgers, and a system for handling the patients who &ldquo;forget&rdquo; to pay.
    </SectionSubtitle>
    <div className="mt-10">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Stop Revenue Leakage Today <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

const ProblemSection = () => (
  <Section>
    <SectionTitle>Most Indian Clinics Collect Payments Like It&rsquo;s 1995. It&rsquo;s Costing You a Fortune.</SectionTitle>
    <SectionSubtitle className="mt-4">
      The cash-and-register model is not charming. It is a structural leak that bleeds ₹30,000-₹50,000 a month from your clinic — and you do not even see it happening.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 text-gray-600 dark:text-gray-300 space-y-5 text-base leading-relaxed">
      <p>
        Picture this. It is 9:15 PM. Your clinic closed at 8:30, but the receptionist is still at the desk. The dog-eared register is open. A calculator sits on top of a stack of handwritten receipts. She is counting — notes first, then coins, then cross-checking against the appointment list she scribbled on a notepad this morning. Every few minutes, she frowns. There is a ₹500 note that does not match anything. A patient who came at 11 AM and apparently &ldquo;paid later&rdquo; but never did. An injection charge that was ₹80 on the rate card but got entered as ₹50 in the register.
      </p>
      <p>
        This is not a one-off bad day. This is the daily reality for thousands of Indian clinics — from single-doctor OPDs in tier-2 cities to multi-specialty polyclinics in metros. The receptionist collects cash, scribbles in a register, and everyone hopes the math adds up. It often does not. And the problem compounds silently: ₹500 today, ₹300 tomorrow, ₹800 the day after. Over a month? ₹12,000-₹18,000 gone. Over a year? You have lost enough to hire another staff member or upgrade your diagnostic equipment.
      </p>
      <p>
        &ldquo;I&rsquo;ll pay next time&rdquo; is the single most expensive phrase spoken in an Indian clinic. Patients say it with genuine intent — but life happens. They forget. Without a system to track and follow up, studies and clinic audits show that 40-60% of deferred payments are never collected. Not because patients are dishonest. Because there is no mechanism to remind them. The receptionist tries to remember, but she sees 50 patients a day. By next week, she cannot recall who promised to pay and who already did.
      </p>
      <p>
        Billing errors are invisible by nature. A consultation that should be ₹500 gets billed at ₹400 because the receptionist forgot to add the injection charge. A lab test worth ₹350 slips through because it was ordered verbally and never noted on the bill. Over a month, these micro-losses add up to ₹8,000-₹15,000. And here is the worst part: you never find out. There is no alert. No red flag. Just a register that looks &ldquo;close enough&rdquo; at the end of the day.
      </p>
      <p>
        Cash itself introduces an entire class of problems: counting errors after a 10-hour shift, the occasional fake note that goes undetected in the rush, the small theft that is impossible to prove because there is no digital trail, and the sheer time waste of physically reconciling cash against the patient register every evening — 30 to 45 minutes, every single day. That is 15-22 hours a month your staff spends counting money instead of doing anything productive.
      </p>
      <p>
        And here is the irony. Indian clinics are rapidly adopting digital payments. UPI adoption in urban India exceeds 70%. Your patients have Google Pay and PhonePe on their phones. They want to scan and pay. But most clinics give them a UPI QR code taped to the reception desk — disconnected from the billing system. The patient scans, pays ₹500, and then the receptionist manually marks &ldquo;paid&rdquo; in the register. Two disconnected systems, twice the work, same reconciliation headache at 9:15 PM.
      </p>
    </div>
  </Section>
);

const TheMathSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>The Hard Math of Manual Payment Collection.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Every figure here is based on real data from Indian OPDs and polyclinics. If these numbers feel uncomfortable, good — they should.
    </SectionSubtitle>
    <div className="grid md:grid-cols-3 gap-8 mt-16">
      {[
        { icon: AlertTriangle, stat: '5-8%', label: 'Revenue Leakage Rate', detail: 'Manual billing and payment collection loses 5-8% of total billable revenue through missed line items, incorrect rates, and uncollected dues.' },
        { icon: IndianRupee, stat: '₹4.3L', label: 'Lost Per Year', detail: 'For a clinic billing ₹7.2 lakh/month (40 patients/day × ₹600 avg bill), 5% leakage is ₹36,000/month — ₹4.3 lakh/year. Gone.' },
        { icon: Clock, stat: '45 Min', label: 'Daily Cash Reconciliation', detail: 'End-of-day cash counting and register matching takes 30-45 minutes. That is 15-22 hours of staff time every month — wasted on counting notes.' },
        { icon: Users, stat: '15-25%', label: 'Patients Say "Next Time"', detail: 'At many clinics, 15-25% of patients request to pay later. Without a follow-up system, only ~50% of these payments are ever collected.' },
        { icon: Calculator, stat: '₹1,500', label: 'Cash Handling Errors/Month', detail: 'Miscounts, fake notes, and reconciliation gaps bleed ₹500-₹1,500 monthly in pure cash handling losses — even before billing errors factor in.' },
        { icon: TrendingUp, stat: '90%+', label: 'Collection Rate With Auto Follow-Up', detail: 'Clinics using automated WhatsApp payment reminders recover over 90% of deferred payments. The difference is ₹25,000-₹35,000/month back in your bank.' },
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
    <SectionTitle>How Doxxy Turns Payment Collection Into a Zero-Effort System.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Not a payment gateway bolted onto a generic tool. A billing-to-collection workflow purpose-built for how Indian clinics actually operate.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 space-y-8">
      {[
        {
          title: 'Auto-Generated Bills at the End of Consultation',
          description: 'The moment a doctor completes a consultation in Doxxy — recording the diagnosis, prescriptions, lab orders, and any procedures — the bill generates automatically. Consultation fee, procedure charges, pharmacy items dispensed, and diagnostic tests ordered are all pulled directly from the clinical record. Every line item is transparent. The receptionist reviews and confirms in seconds — but never re-enters a single piece of data. This eliminates the single largest source of billing error: manual data entry.',
          icon: FileText,
        },
        {
          title: 'UPI QR Code Built Into Every Bill',
          description: 'Every digital bill includes a UPI QR code with the exact amount pre-filled. The patient sees the bill on a display at reception, or receives it instantly on WhatsApp. They open any UPI app — Google Pay, PhonePe, Paytm, BHIM — scan the QR, and pay in seconds. No typing amounts. No wrong UPI IDs. No &ldquo;send me the QR.&rdquo; The payment confirmation flows back into Doxxy and marks the bill as PAID automatically. Your receptionist never touches a payment confirmation screen.',
          icon: QrCode,
        },
        {
          title: 'Automatic Payment Reconciliation — No Manual Matching',
          description: 'When a patient pays, the bill status updates to PAID in the system. The ledger updates in real time. End-of-day reconciliation for digital payments is instant because every transaction was matched at the moment of collection. For cash payments, the receptionist selects &ldquo;Cash&rdquo; and enters the amount — the system tracks it identically. The day-end report shows total billed, total collected, total due, and a payment-method breakdown (UPI/cash/card) — with zero manual calculation.',
          icon: ShieldCheck,
        },
        {
          title: 'Automated &ldquo;Pay Later&rdquo; Follow-Up System',
          description: 'When a patient says &ldquo;I&rsquo;ll pay next time,&rdquo; the receptionist clicks &ldquo;Defer Payment&rdquo; — not &ldquo;Skip.&rdquo; The bill stays open and tagged as DUE. Doxxy sends an automated WhatsApp reminder after 24 hours: friendly, personalised with the patient&rsquo;s name, doctor&rsquo;s name, and the pending amount with a UPI payment link. If unpaid, a second reminder goes out at 48 hours, and a third at 7 days. Still unpaid? It appears prominently on the staff dashboard for a personal follow-up call. Clinics using this system recover 90%+ of deferred payments — up from ~50% without it.',
          icon: Bell,
        },
        {
          title: 'One-Click End-of-Day Reports',
          description: 'At the end of the day, you do not count cash. You click one button. The report shows: total patients seen, total billed, total collected, total outstanding, payment-mode breakup, GST collected, and net revenue. Every number is backed by individual transaction records. For multi-clinic owners, you can view location-wise reports or a consolidated view. Historical comparisons — today vs last Tuesday, this month vs last month — are available instantly. Your accountant gets a reconciled report without you spending 45 minutes at a calculator.',
          icon: BarChart3,
        },
        {
          title: 'Complete Patient Financial History',
          description: 'Every transaction is linked to a patient record. Open any patient&rsquo;s profile and see their full financial history: every consultation billed, every payment made, every outstanding due, every refund processed. When a patient says &ldquo;I already paid,&rdquo; you click their name and see the truth in one second. When a repeat offender tries to book an appointment with unpaid dues, the system shows a gentle &ldquo;Payment Pending&rdquo; alert — so your staff can address it before the consultation, not after.',
          icon: CreditCard,
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
    <SectionTitle>The Payment Flow That Ends Your 9:15 PM Cash-Counting Ritual.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Four steps. Zero manual reconciliation. No calculator. No dog-eared register. No missing ₹500.
    </SectionSubtitle>
    <div className="grid md:grid-cols-4 gap-6 mt-16">
      {[
        {
          step: '1',
          title: 'Consultation Completed',
          description: 'Doctor finishes the consultation in Doxxy — diagnosis, prescriptions, lab orders, procedure notes all recorded. Every clinical action carries its billing code in the background. No separate data entry needed.',
          icon: FileText,
        },
        {
          step: '2',
          title: 'Bill Auto-Generated',
          description: 'Doxxy compiles all chargeable items into a bill with line-item detail. Bill is displayed to patient on screen, and optionally sent to their WhatsApp instantly. UPI QR code is on the bill itself.',
          icon: Receipt,
        },
        {
          step: '3',
          title: 'Patient Pays via UPI',
          description: 'Patient scans the QR code using any UPI app — Google Pay, PhonePe, Paytm. Pays the exact amount in seconds. Payment confirmation auto-reconciles in Doxxy. Bill marked PAID without any manual step.',
          icon: Smartphone,
        },
        {
          step: '4',
          title: 'Receipt Sent & Ledger Updated',
          description: 'Digital receipt auto-sent to patient&rsquo;s WhatsApp. GST invoice available for download. Ledger updated in real time. Day-end report ready with one click. Nothing to count. Nothing to reconcile.',
          icon: CheckCircle,
        },
      ].map(({ step, title, description, icon: Icon }) => (
        <div key={step} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-900/50">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{step}</div>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                {title}
              </div>
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

const HandlingCreditPatientsSection = () => (
  <Section>
    <SectionTitle>How to Handle the &ldquo;I&rsquo;ll Pay Next Time&rdquo; Patient — Without Losing the Revenue or the Relationship.</SectionTitle>
    <SectionSubtitle className="mt-4">
      This is the #1 revenue leak in Indian clinics and the #1 reason clinic owners feel a knot in their stomach at month-end. Here is a five-step system that works.
    </SectionSubtitle>

    <div className="max-w-4xl mx-auto mt-16 space-y-12">
      <div className="flex gap-6 items-start">
        <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
          <FileText className="h-7 w-7 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-3 py-1 rounded-full">Step 1</span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Set the Expectation Before It Comes Up</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Display a clear, friendly payment policy at reception — not a threatening sign, but a warm notice that sets the tone: &ldquo;Payment is due at the time of consultation. We accept UPI, cash, and card for your convenience.&rdquo; This is not about being harsh. It is about removing ambiguity. When every patient sees the same message, the &ldquo;can I pay later?&rdquo; question drops significantly. For existing patients who have a history of deferred payments, the system shows a gentle &ldquo;outstanding balance&rdquo; note when they book their next appointment — so your staff can mention it before the consultation even begins: &ldquo;Mr. Sharma, just a quick note — there&rsquo;s a pending balance of ₹600 from your last visit. Would you like to clear that along with today&rsquo;s consultation?&rdquo; Polite. Professional. Effective.
          </p>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
          <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-3 py-1 rounded-full">Step 2</span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Flag, Do Not Skip</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            This is the single most important operational change you can make. When a patient says &ldquo;next time,&rdquo; the receptionist clicks &ldquo;Defer Payment&rdquo; — not &ldquo;Skip.&rdquo; The bill stays open in the system, tagged as DUE with the date, amount, and patient name. Nothing is forgotten. Nothing is left to the receptionist&rsquo;s memory or a scribble on a sticky note that falls behind the desk. The system treats this as an active receivable, not a closed transaction. The psychology matters: &ldquo;Defer&rdquo; means the obligation still exists — it is just postponed. &ldquo;Skip&rdquo; means it is gone. Most manual systems default to Skip. Doxxy defaults to Defer.
          </p>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
          <Bell className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-full">Step 3</span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Automated, Friendly Follow-Ups</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            The system takes over from here — no staff involvement needed. At 24 hours after the deferred payment, the patient receives a WhatsApp message: &ldquo;Hi Priya, just a gentle reminder that your consultation with Dr. Mehta on 12 March has a pending payment of ₹600. You can pay easily via this UPI link: [payment link]. Thank you!&rdquo; If unpaid, a second reminder goes at 48 hours — still friendly, slightly more direct. At 7 days, a third and final automated reminder. These are not aggressive collection calls. They are polite nudges that work precisely because most patients genuinely intended to pay but simply forgot. The recovery rate with this three-nudge sequence exceeds 90% across Doxxy clinics.
          </p>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
          <LayoutDashboard className="h-7 w-7 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded-full">Step 4</span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">The Pending Collections Dashboard</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Staff see a dedicated &ldquo;Pending Collections&rdquo; view on their dashboard, sorted by age. Today&rsquo;s dues. 1-7 days overdue. 8-30 days. Over 30 days (flagged in red). Each entry shows patient name, amount, original bill date, and number of reminders sent. Your staff can filter by doctor, by date range, or by amount. They can manually trigger an additional reminder or mark the bill for a phone call. This dashboard turns &ldquo;I think some patients owe us money&rdquo; into &ldquo;Here are the exact 14 patients who owe us ₹8,400 total, and here is the status of each.&rdquo; No more gut feelings. No more forgotten dues.
          </p>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
          <Ban className="h-7 w-7 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-3 py-1 rounded-full">Step 5</span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">The Boundary for Repeat Offenders</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            For the small percentage of patients who repeatedly defer and ignore all reminders — the system protects your clinic. When a patient with overdue unpaid bills (30+ days) books a new appointment, Doxxy shows a clear &ldquo;Payment Pending&rdquo; alert on the appointment screen. Your receptionist sees it the moment they open the booking. This gives your staff the information and the opportunity to gently address it: &ldquo;Mr. Kumar, before we proceed with today&rsquo;s consultation, I notice there&rsquo;s a pending balance of ₹1,200 from your last two visits. Would you like to clear that first?&rdquo; You are not refusing care. You are running a professional practice with professional financial boundaries. Most patients respect this when it is presented respectfully. And for the very few who do not — you now have the data to make an informed decision.
          </p>
        </div>
      </div>
    </div>

    <div className="max-w-3xl mx-auto mt-16 p-8 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800/50 text-center">
      <p className="text-lg text-blue-900 dark:text-blue-200 font-medium">
        The difference between hoping patients pay and knowing they will? A system that treats every deferred payment as an active receivable — not a forgotten transaction. Doxxy clinics recover 90%+ of their deferred payments. The math, as you saw above, is undeniable.
      </p>
    </div>
  </Section>
);

const ComparisonSection = () => (
  <Section>
    <SectionTitle>Your Clinic Before and After Digital Payment Collection.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Same clinic. Same patients. Same doctors. Radically different financial control.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            <th className="text-left p-4 font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">Metric</th>
            <th className="text-left p-4 font-semibold text-red-600 dark:text-red-400 text-sm uppercase tracking-wider">Manual Cash &amp; Register</th>
            <th className="text-left p-4 font-semibold text-green-600 dark:text-green-400 text-sm uppercase tracking-wider">Doxxy Digital Collection</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {[
            { metric: 'Billing Method', before: 'Manual entry in register, handwritten receipts, carbon copies', after: 'Auto-generated digital bill with all line items from consultation record' },
            { metric: 'Payment Collection', before: 'Cash only, manual counting, register matching at day-end', after: 'UPI QR + card + cash. Every payment auto-reconciled to its bill.' },
            { metric: 'End-of-Day Reconciliation', before: '30-45 min counting notes and coins, frequent errors, staff stays late', after: 'One-click report. Instant. Zero errors. Staff leaves on time.' },
            { metric: 'Revenue Leakage', before: '5-8% lost to missed line items, wrong rates, and uncollected dues', after: 'Under 1% leakage. Bills auto-compiled. Dues auto-tracked.' },
            { metric: 'Deferred Payment Follow-Up', before: 'No system. Receptionist tries to remember. 50% never collected.', after: 'Automated WhatsApp reminders at 24h, 48h, 7 days. 90%+ recovery rate.' },
            { metric: 'GST Compliance', before: 'Manual calculation in separate software. Inconsistent. Audit risk.', after: 'Auto-generated GST-compliant invoices. Month-end export ready for GSTR-1.' },
            { metric: 'Patient Receipts', before: 'Handwritten on a slip. Lost by the time patient reaches home.', after: 'Auto-sent to WhatsApp. Downloadable PDF. Always accessible.' },
            { metric: 'Financial Reporting', before: 'Once a month, if the accountant has time. Based on register entries.', after: 'Real-time dashboard. Daily, weekly, monthly. Doctor-wise, service-wise, payment-mode-wise.' },
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
    <SectionTitle>Frequently Asked Questions.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Everything clinic owners ask about digital payment collection, UPI, GST, and handling patient dues.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-8">
      {[
        {
          q: 'What if a patient does not use UPI or does not have a smartphone?',
          a: 'Cash and card are fully supported alongside UPI. The receptionist marks the bill as "Cash" or "Card" and enters the amount received. The system tracks it identically — the only difference is the payment method label on the bill and in reports. The end-of-day report breaks down collections by payment mode (UPI, cash, card), so you have a single source of truth regardless of how patients choose to pay. For elderly patients or those uncomfortable with UPI, cash remains the fallback — but the bill itself is still digital, line-itemed, and tracked. No more handwritten receipts that get lost.',
        },
        {
          q: 'How does this handle GST billing for clinics?',
          a: 'Doxxy auto-generates GST-compliant invoices with your clinic\'s GSTIN, SAC/HSN codes for medical services, and all required fields under Indian GST law. You can configure tax rates per service: most healthcare services are GST-exempt, but pharmacy items, consumables, and certain diagnostic tests may attract GST. The system auto-selects IGST for inter-state patients and CGST+SGST for intra-state transactions. For clinics below the ₹20 lakh GST registration threshold, you can disable GST and generate simple receipts instead. At month-end, export all invoices in a format ready for GSTR-1 filing. Your accountant does not need to manually compile anything.',
        },
        {
          q: 'Can we set different consultation fees for different doctors or time slots?',
          a: 'Yes. Doxxy supports a flexible, multi-tier fee schedule. Set a base rate per doctor: Dr. Sharma (Senior Consultant) at ₹800, Dr. Patel (Junior Consultant) at ₹400. Add surcharges for premium slots: weekend/evening appointments can auto-add ₹200. Set reduced rates for follow-up visits: ₹300 instead of the first-consultation rate. The system auto-selects the correct fee based on the doctor assigned, the appointment time, and the visit type (new vs follow-up). The receptionist never manually looks up a rate card — the right fee is applied automatically. Fee changes can be scheduled in advance, so if rates change from the 1st of next month, you configure it once and the system switches over.',
        },
        {
          q: 'What if we need to issue a refund to a patient?',
          a: 'Refunds are handled through a formal credit-note workflow within Doxxy. From the billing dashboard, staff select the original bill, mark it as "Refunded," and enter the refund amount (full or partial), reason, and date. A credit note is generated and linked to the original bill. If the patient paid via UPI, the actual fund transfer must be processed manually through your UPI app — Doxxy records and tracks the refund status but does not initiate UPI transactions. The credit note automatically adjusts your daily revenue totals and GST liability calculations. Every refund action is logged with timestamp, user ID, and reason, maintaining a full audit trail for your internal controls and any potential tax audit.',
        },
        {
          q: 'Can we integrate with our existing accounting software like Tally?',
          a: 'Yes. Doxxy can export daily, weekly, or monthly transaction reports in CSV and Excel formats that import directly into Tally, Zoho Books, Busy, Marg, or any accounting software that accepts structured imports. The export includes bill-level detail: invoice number, date, patient name, line items, amounts, tax breakup (CGST/SGST/IGST), and payment mode. Most clinics export once a week or once a month — the process takes under 30 seconds. For clinics using Tally Prime, native API integration is on the Doxxy product roadmap — this will enable real-time sync of every transaction to your Tally ledger without any manual export step. Until then, the CSV/Excel export workflow is straightforward and sufficient for monthly accounting.',
        },
      ].map(({ q, a }) => (
        <div key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{q}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{a}</p>
        </div>
      ))}
    </div>
  </Section>
);

// --- MAIN PAGE ---

export default function ClinicPaymentCollectionGuide() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <ProblemSection />
      <TheMathSection />
      <SolutionSection />
      <WorkflowSection />
      <HandlingCreditPatientsSection />
      <ComparisonSection />
      <FAQSection />
      <SignupCTA
        heading="UPI QR + Auto-Billing = Zero Cash Handling Errors"
        description="See how Doxxy handles payments, including the 'I'll pay next time' patient. A quick WhatsApp walkthrough of the full billing + collection flow."
      />

      <Script
        id="faq-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Clinic Payment Collection Guide", url: `${APP_URL}/clinic-payment-collection-guide` },
        ]}
      />
    </div>
  );
}
