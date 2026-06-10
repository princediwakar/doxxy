// Path: app/(public)/stop-clinic-revenue-leakage/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import BreadcrumbJsonLd from '@/components/SEO/BreadcrumbJsonLd';
import SignupCTA from '@/components/SignupCTA';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Section, SectionTitle, SectionSubtitle } from '@/components/ui/section-headers';
import { ArrowRight, TrendingDown, IndianRupee, FileText, AlertTriangle, ShieldCheck, Receipt, BarChart3, Calculator } from 'lucide-react';
import { APP_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Stop Revenue Leakage in Your Clinic — 5-8% of Revenue Is Disappearing',
  description: 'Manual billing, missed charges, and unpaid follow-ups drain 5-8% of Indian clinic revenue. Here\'s exactly where the money leaks — and how to stop losing ₹2,500+ per day.',
  alternates: { canonical: '/stop-clinic-revenue-leakage' },
  openGraph: {
    title: 'Stop Clinic Revenue Leakage — Recover 5-8% of Lost Income',
    description: 'Billing errors, missed charges, and collection gaps cost Indian clinics ₹2,500+ daily. See the math and the fix.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Stop Clinic Revenue Leakage' }],
  },
  keywords: ['clinic revenue leakage', 'clinic billing errors cost', 'stop losing revenue clinic', 'healthcare revenue cycle management India', 'clinic financial management', 'OPD billing mistakes'],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much revenue do Indian clinics lose to billing errors?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Studies and our user data show 5-8% of OPD revenue is lost to billing errors, missed charges, and collection gaps. For a clinic seeing 30 patients per day at an average bill of ₹500-600, that translates to ₹1,000-2,000 lost every single day — ₹3,00,000 to ₹6,00,000 annually. This includes missed consultation fees for follow-up patients, uncharged procedures like ECG and dressings, manual calculation errors at the billing desk, and patients who say "I\'ll pay next time" but never do. The insidious part is that most clinic owners never see this number because manual billing provides no way to track what should have been billed versus what was actually billed.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the most common billing mistakes in clinics?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The most frequent billing mistakes in Indian clinics include: (1) Forgetting to bill follow-up consultations — a patient who came for a wound review or BP check gets seen but the receptionist never generates a bill because there was no "new" appointment. (2) Missing procedure charges — the doctor performs an ECG, dressing, or injection and scribbles it on a paper slip that gets lost before reaching the billing desk. (3) Manual calculation errors — adding ₹500 + ₹300 + ₹200 on a calculator and typing ₹900 instead of ₹1,000, which happens 5-10 times daily in a busy OPD. (4) Inconsistent pricing — different receptionists charge different amounts for the same procedure because there is no standard rate card linked to billing. (5) Failing to collect from "regular" patients who promise to pay later — a cultural norm in Indian clinics that results in significant unrecovered revenue.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does automated billing prevent revenue leakage?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Automated billing prevents leakage by capturing charges at the point of care rather than relying on a manual handoff. When a doctor records a procedure in the EMR — whether it is a consultation, an ECG, a dressing change, or an injection — that charge is automatically linked to the patient\'s bill. There is no paper slip that can be lost, no verbal instruction that can be forgotten, and no manual data entry that can introduce errors. The bill is auto-compiled from the clinical record, and the billing desk only reviews and confirms — they never re-enter data. This single change eliminates the largest source of revenue leakage: the gap between what the doctor does and what the billing desk knows about.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can UPI payments really reduce collection gaps?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, UPI payments reduce collection gaps dramatically. When a UPI QR code with the exact bill amount is generated at the billing desk, the patient scans and pays instantly using Google Pay, PhonePe, Paytm, or any BHIM app. The payment confirmation flows back into the system automatically, marking the bill as paid without the receptionist needing to check a separate app or notification. This eliminates three common leakage points: cash handling errors (wrong change given), "keep the change" informal discounts, and end-of-day cash counting discrepancies. For patients who say "I\'ll pay next time," the system can send a WhatsApp payment link immediately — converting what used to be a forgotten receivable into a same-day collection. Clinics using digital collection report under 1% uncollected revenue versus 3-5% with cash-only systems.',
      },
    },
    {
      '@type': 'Question',
      name: 'How quickly can I see results after switching to digital billing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most clinics see measurable improvement within the first week. The very first day of using automated billing typically reveals charges that would have been missed — often ₹500-1,500 worth. By the end of the first week, the clinic has a clear "expected vs actual" revenue comparison that was impossible with manual billing. By the first month-end, the revenue reconciliation typically reveals 5-8% leakage that was previously invisible — and now captured. The financial impact is immediate because you are not changing how many patients you see or what you charge; you are simply ensuring you collect what you are already owed. The learning curve for staff is minimal (most receptionists are comfortable within 2-3 days), and the time savings on end-of-day reconciliation alone — from 30-45 minutes to near-zero — justify the switch immediately.',
      },
    },
  ],
};

const HeroSection = () => (
  <section className="py-28 md:py-40 bg-gray-900 dark:bg-black">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
        5-8% of clinic revenue is lost to billing errors, missed charges, and collection gaps
      </Badge>
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
        Your Clinic Made ₹2.4 Lakhs This Month.<br />
        <span className="text-red-400">Only ₹2.2 Lakhs Reached Your Bank.</span><br />
        Where Did ₹20,000 Go?
      </h1>
      <SectionSubtitle className="text-gray-300 !text-center max-w-2xl mx-auto">
        It did not disappear. It leaked — through billing errors, missed charges, untracked credit patients,
        and manual calculation mistakes. Every single day, your clinic loses money you already earned.
        Here is exactly where it goes and how to stop it.
      </SectionSubtitle>
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
          <Link href="https://wa.me/+917388890554">Stop Losing Revenue Today <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  </section>
);

const ProblemSection = () => (
  <Section>
    <div className="max-w-3xl mx-auto text-center mb-16">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <SectionTitle className="!text-left !text-center">The 6 Holes In Your Revenue Bucket</SectionTitle>
      <SectionSubtitle className="mt-4 !text-center">
        Every hole is small enough to ignore. Together, they drain ₹2,500+ from your clinic every single day.
      </SectionSubtitle>
    </div>

    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4">
          <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">The Forgotten Consultation Fee</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
          Mrs. Sharma walks into Dr. Gupta&apos;s clinic in Lucknow for a follow-up. She was here last week for her BP check. The doctor sees her for 5 minutes, adjusts her medication, and sends her on her way. The receptionist, juggling three phone calls, forgets to generate a bill for Mrs. Sharma because there was no &quot;new appointment&quot; in the register. No token. No entry. No bill. This happens 3-4 times a day in a busy OPD. At ₹500 per follow-up consultation, that is ₹1,500-2,000 walking out the door — every day.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-4">
          <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">The Uncharged Procedure</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
          A patient comes to Dr. Reddy&apos;s clinic in Vijayawada with chest discomfort. The doctor decides to do an ECG. He performs it, reads the strip, reassures the patient, and writes a prescription. On the consultation slip, he writes the diagnosis and the medicines — but forgets to tick &quot;ECG.&quot; The billing desk generates a bill for ₹500 (consultation) when it should have been ₹800 (consultation + ECG). The clinic spent ₹50 on ECG paper and 10 minutes of the doctor&apos;s time. ₹300 of billable revenue disappeared because of a missing tick mark. Multiply by 4-5 such incidents daily.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mb-4">
          <IndianRupee className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">The &quot;I&apos;ll Pay Later&quot; Patient</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
          Mr. Khan has been coming to your clinic in Bhopal for three years. He is a regular. After his consultation, he tells the receptionist, <em>&quot;Agli baar de doonga, madam ji.&quot;</em> The receptionist, not wanting to offend a loyal patient, nods and makes a mental note. That mental note expires before the next patient walks in. Mr. Khan is not a bad person — he fully intends to pay next time. But &quot;next time&quot; comes a month later, and by then neither he nor the receptionist remembers the ₹600 from last month. Now multiply this by the 5-7 regular patients in every clinic who operate on this informal credit system. Monthly leakage: ₹3,000-5,000. Annual: ₹36,000-60,000. Per clinic.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
          <Calculator className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">The Manual Math Error</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
          A patient at Dr. Mehta&apos;s clinic in Surat needs three services: consultation (₹500), blood sugar test (₹300), and a dressing (₹200). The receptionist pulls out the calculator — or worse, does it in her head. She types ₹500 + ₹300 + ₹200 but accidentally hits ₹500 + ₹300 + ₹100 = ₹900. The patient pays ₹900 instead of ₹1,000. ₹100 gone. Nobody catches it because nobody double-checks. This happens 5-10 times daily in a clinic seeing 30-40 patients. Even at ₹50-100 per error, that is ₹250-1,000 lost per day. ₹7,500-30,000 per month. All from hitting the wrong digit on a calculator.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
        <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mb-4">
          <Receipt className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">The Unbilled Medicine</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
          Dr. Nair&apos;s clinic in Kochi has a small procedure room. A patient comes in with an infected wound. The nurse cleans the wound, applies a dressing, and administers a tetanus injection — all on the doctor&apos;s instructions. The doctor records the dressing in his notes. He forgets to mention the injection. The nurse, busy with the next patient, does not record the tetanus toxoid dispensed from the emergency tray. The bill includes the consultation and dressing — ₹700. The injection (cost: ₹45, charge: ₹150) is never billed. The medicine is physically gone from inventory but the money never came in. Over a month, unbilled injections, dressings, and minor consumables add up to ₹4,000-8,000.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
        <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mb-4">
          <ShieldCheck className="h-5 w-5 text-pink-600 dark:text-pink-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">The Expired Credit Note</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
          Three weeks ago, a patient overpaid ₹300 at Dr. Patil&apos;s clinic in Nagpur. The receptionist scribbled <em>&quot;₹300 credit — adjust next visit&quot;</em> on a post-it. The post-it is now under a stack of old newspapers at the billing desk. The patient came back yesterday but forgot to mention the credit. The receptionist on duty was different from the one three weeks ago. A new bill was generated for the full amount. The patient paid in full. The ₹300 credit is effectively dead — it will never be claimed, never tracked, and never settled. Every clinic has 8-12 such orphaned credits floating around at any given time. Total value: ₹2,000-5,000. Permanently unrecovered.
        </p>
      </div>
    </div>
  </Section>
);

const MathSection = () => (
  <Section className="bg-muted">
    <SectionTitle>Calculate What You&apos;re Losing Right Now</SectionTitle>
    <SectionSubtitle className="mt-4">
      These are not imaginary numbers. These are conservative estimates based on real Indian OPD billing data.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
        <thead>
          <tr className="bg-red-50 dark:bg-red-900/20">
            <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Daily Patients</th>
            <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Avg Bill (₹)</th>
            <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Leakage %</th>
            <th className="text-left p-4 font-semibold text-red-600 dark:text-red-400">Daily Loss</th>
            <th className="text-left p-4 font-semibold text-red-600 dark:text-red-400">Monthly Loss</th>
            <th className="text-left p-4 font-semibold text-red-600 dark:text-red-400">Annual Loss</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
            <td className="p-4 font-medium text-gray-900 dark:text-white">20</td>
            <td className="p-4 text-gray-600 dark:text-gray-300">₹500</td>
            <td className="p-4 text-gray-600 dark:text-gray-300">5%</td>
            <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹500</td>
            <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹12,500</td>
            <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹1,50,000</td>
          </tr>
          <tr className="bg-gray-50 dark:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40">
            <td className="p-4 font-medium text-gray-900 dark:text-white">30</td>
            <td className="p-4 text-gray-600 dark:text-gray-300">₹600</td>
            <td className="p-4 text-gray-600 dark:text-gray-300">6%</td>
            <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹1,080</td>
            <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹27,000</td>
            <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹3,24,000</td>
          </tr>
          <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
            <td className="p-4 font-medium text-gray-900 dark:text-white">40</td>
            <td className="p-4 text-gray-600 dark:text-gray-300">₹700</td>
            <td className="p-4 text-gray-600 dark:text-gray-300">8%</td>
            <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹2,240</td>
            <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹56,000</td>
            <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹6,72,000</td>
          </tr>
          <tr className="bg-gray-50 dark:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/40">
            <td className="p-4 font-medium text-gray-900 dark:text-white">50</td>
            <td className="p-4 text-gray-600 dark:text-gray-300">₹800</td>
            <td className="p-4 text-gray-600 dark:text-gray-300">8%</td>
            <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹3,200</td>
            <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹80,000</td>
            <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹9,60,000</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl">
      <p className="text-red-700 dark:text-red-300 text-center font-medium leading-relaxed">
        This table does not include the 2-3 walk-away patients who did not pay at all — the ones who &quot;forgot their wallet,&quot; &quot;will transfer online,&quot; or simply left while the receptionist was busy. Add those for the real number. The actual leakage in most clinics is higher than these estimates.
      </p>
    </div>
  </Section>
);

const WhyManualBillingFailsSection = () => (
  <Section>
    <SectionTitle>Why Manual Billing Is Structurally Incapable of Protecting Your Revenue</SectionTitle>
    <SectionSubtitle className="mt-4">
      This is not about hiring better receptionists. The process itself guarantees failure — regardless of how careful your staff is.
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-5">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Human Error Is Guaranteed</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Even the best receptionist — with 10 years of experience and zero malice — makes 3-5 calculation errors per day in a clinic seeing 30+ patients. Each bill has multiple line items, different rates for different doctors, and variable charges based on what the doctor did. The human brain is not designed to perform 150+ arithmetic operations a day without error. A 2% individual error rate on 150 line items means 3 mistakes daily. Perfection is mathematically impossible in a manual system.
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-5">
          <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No Audit Trail</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Paper bills and handwritten receipts tell you the final amount collected. They do not tell you who generated the bill, when, what was originally written by the doctor, whether any items were missed, or whether the amount matches what should have been charged. When the monthly tally does not match the bank balance — and it rarely does — you have no way to trace which patient, which bill, which receptionist, or which day the money leaked from. The audit trail in a manual system begins and ends with a carbon copy.
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-5">
          <IndianRupee className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Inconsistent Pricing</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Dr. Shah charges ₹600 for a consultation. Dr. Desai, in the same clinic, charges ₹500. A dressing costs ₹200 when Nurse Lata does it, but ₹300 when Nurse Priya does it — because Priya uses a different brand of bandage and charges accordingly. The receptionist is supposed to know all these differentials and apply the right rates to the right doctor-procedure combination. In reality, two different receptionists charge two different amounts for the exact same service on the same day. Some patients are overcharged (and complain). More are undercharged (and you lose money silently).
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
        <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mb-5">
          <ShieldCheck className="h-6 w-6 text-teal-600 dark:text-teal-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No Integration With Inventory</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Every injection, dressing material, and medicine dispensed in your clinic has a cost. In a manual system, the physical act of dispensing and the financial act of billing are completely disconnected. Your nurse dispenses a tetanus shot — the vial leaves the inventory. But whether it appears on the bill depends on whether the nurse remembered to tell the receptionist, whether the receptionist remembered to add it, and whether the rate was correct. The result: medicines are physically gone, but the revenue for them was never collected. Your inventory shrinks while your bank balance stays the same. The disconnect is invisible until you do a physical stock count — which most clinics do once a quarter, if at all.
        </p>
      </div>
    </div>
  </Section>
);

const SolutionSection = () => (
  <Section className="bg-muted">
    <SectionTitle>Plug Every Leak. Automatically.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Four ways Doxxy eliminates revenue leakage at the source — before the money ever has a chance to disappear.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
        <div className="flex gap-5 items-start">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Auto-Billing from Consultation Notes</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              Whatever the doctor records — consultation, ECG, injection, dressing, blood test — auto-generates the bill. No paper slip. No verbal handoff. No forgotten line items. The doctor&apos;s clinical note is the billing source of truth. When the doctor records a procedure in the EMR, the charge exists. The billing desk reviews and confirms, but never re-enters data. This eliminates the single largest source of leakage: the gap between what the doctor did and what the billing desk knows about.
            </p>
            <Link href="/clinic-billing-software" className="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center gap-1 hover:underline text-sm">
              See how auto-billing works <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
        <div className="flex gap-5 items-start">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
            <IndianRupee className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Digital Payment Collection</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              UPI QR with exact amount + card + cash — all tracked on one screen. Every payment mode reconciled automatically. When a patient says <em>&quot;I&apos;ll pay next time,&quot;</em> the system sends a WhatsApp payment link to their phone before they reach the parking lot. &quot;Agli baar&quot; becomes &quot;abhi abhi.&quot; Payment confirmations flow back into Doxxy automatically, marking bills as paid without the receptionist checking a separate PhonePe notification. End-of-day reconciliation for digital payments is instant — because every transaction is matched at the point of collection.
            </p>
            <Link href="/clinic-payment-collection-guide" className="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center gap-1 hover:underline text-sm">
              Read the payment collection guide <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
        <div className="flex gap-5 items-start">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
            <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Real-Time Revenue Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              See today&apos;s actual collections versus expected collections — live, updated with every bill. Discrepancies are flagged before the end of the day, not discovered at month-end when it is too late to recover. If 40 patients checked in but only 37 bills were generated, the dashboard shows it at 4 PM — not on the 5th of next month when your accountant finally reconciles the books. Doctor-wise revenue breakdowns, payment-mode splits, and outstanding credit reports — all updated in real time, accessible from your phone.
            </p>
            <Link href="/clinic-analytics-dashboard" className="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center gap-1 hover:underline text-sm">
              Explore the analytics dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
        <div className="flex gap-5 items-start">
          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
            <Receipt className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Inventory-to-Bill Linking</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              Every injection, dressing, and medicine dispensed in the clinic automatically appears on the patient&apos;s bill and is deducted from inventory. When Nurse Priya administers a tetanus shot, the system records: one vial of TT consumed, ₹150 added to the patient&apos;s bill, inventory count decremented by one. Physical stock always matches digital stock — or more importantly, when it does not, you know immediately. No more discovering at quarterly stock-taking that ₹8,000 worth of consumables were dispensed but never billed. The link between dispensing and billing is automatic and unbreakable.
            </p>
          </div>
        </div>
      </div>
    </div>
  </Section>
);

const WorkflowSection = () => (
  <Section>
    <SectionTitle>One Patient Visit: Before and After Revenue Tracking</SectionTitle>
    <SectionSubtitle className="mt-4">
      The same 15-minute consultation. Two radically different financial outcomes.
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 gap-8 mt-16 max-w-5xl mx-auto">
      <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800/30 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-800/40 rounded-full flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-red-700 dark:text-red-300">Before Doxxy</h3>
        </div>
        <ol className="space-y-4 text-gray-700 dark:text-gray-300">
          <li className="flex gap-3">
            <span className="text-red-400 font-bold flex-shrink-0">1.</span>
            <span>Patient arrives. Receptionist pulls out a paper file from the shelf and writes the name in a register. No digital record of arrival time or queue position.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-red-400 font-bold flex-shrink-0">2.</span>
            <span>Doctor consults. Scribbles diagnosis and charges on a paper slip — often illegible, sometimes incomplete. ECG done but not noted. Dressing done but ticked on a different page.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-red-400 font-bold flex-shrink-0">3.</span>
            <span>Paper slip reaches billing desk. Receptionist manually types each line item into an Excel template or a generic billing app. Looks up rates from a printed chart taped to the wall.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-red-400 font-bold flex-shrink-0">4.</span>
            <span>Patient pays cash. Receptionist counts notes, gives change from a cash drawer. Amount noted in a diary or register. No digital receipt unless patient asks.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-red-400 font-bold flex-shrink-0">5.</span>
            <span>End of day: manual tally. Receptionist spends 30 minutes adding up cash, counting notes, checking the diary against the appointment register. Discrepancies are shrugged off. &quot;Kal dekh lenge.&quot;</span>
          </li>
        </ol>
        <div className="mt-6 p-4 bg-red-100 dark:bg-red-800/20 rounded-xl">
          <p className="text-red-700 dark:text-red-300 font-semibold text-sm text-center">
            Errors at EVERY step. At least one charge missed per 5-6 patients. Revenue vanishing silently.
          </p>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-200 dark:border-green-800/30 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-800/40 rounded-full flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-green-700 dark:text-green-300">After Doxxy</h3>
        </div>
        <ol className="space-y-4 text-gray-700 dark:text-gray-300">
          <li className="flex gap-3">
            <span className="text-green-500 font-bold flex-shrink-0">1.</span>
            <span>Patient arrives. Digital check-in on tablet. System knows appointment type, doctor, applicable consultation rate. Queue is live, visible to doctor and staff.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-green-500 font-bold flex-shrink-0">2.</span>
            <span>Doctor records consultation, diagnosis, procedures, and prescriptions in the EMR. Every clinical action that has a cost is captured — no tick marks to forget, no paper to lose.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-green-500 font-bold flex-shrink-0">3.</span>
            <span>Bill is auto-generated from the clinical record. All charges — consultation, ECG, dressing, injection — compiled automatically with correct rates. Receptionist reviews and confirms only.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-green-500 font-bold flex-shrink-0">4.</span>
            <span>Patient pays via UPI QR (exact amount pre-filled), card, or cash. Payment confirmation reconciled instantly. Digital receipt sent to patient via WhatsApp with one click.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-green-500 font-bold flex-shrink-0">5.</span>
            <span>Dashboard updates in real time. Actual vs expected revenue visible all day. End-of-day report ready with one click. Zero manual reconciliation needed.</span>
          </li>
        </ol>
        <div className="mt-6 p-4 bg-green-100 dark:bg-green-800/20 rounded-xl">
          <p className="text-green-700 dark:text-green-300 font-semibold text-sm text-center">
            Zero manual steps between clinical care and revenue collection. Zero leakage points.
          </p>
        </div>
      </div>
    </div>
    <div className="text-center mt-10">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Switch to Leak-Proof Billing <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

const ResultsSection = () => (
  <Section className="bg-muted">
    <SectionTitle>Your Clinic With and Without Revenue Leak Protection</SectionTitle>
    <SectionSubtitle className="mt-4">
      The same clinic. The same patient load. Radically different financial outcomes.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            <th className="text-left p-4 font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">What You Experience</th>
            <th className="text-left p-4 font-semibold text-red-600 dark:text-red-400 text-sm uppercase tracking-wider">Manual Billing</th>
            <th className="text-left p-4 font-semibold text-green-600 dark:text-green-400 text-sm uppercase tracking-wider">With Doxxy</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          <tr>
            <td className="p-4 font-medium text-gray-900 dark:text-white">Billing process</td>
            <td className="p-4 text-gray-600 dark:text-gray-300">Manual billing from paper slips. Receptionist re-types everything.</td>
            <td className="p-4 text-gray-900 dark:text-white">Auto-billing from doctor&apos;s clinical notes. Zero re-entry.</td>
          </tr>
          <tr className="bg-gray-50 dark:bg-gray-700/20">
            <td className="p-4 font-medium text-gray-900 dark:text-white">Revenue leakage</td>
            <td className="p-4 text-red-600 dark:text-red-400 font-semibold">5-8% — missed charges, wrong rates, untracked credit</td>
            <td className="p-4 text-green-600 dark:text-green-400 font-semibold">Under 1% — every charge captured at point of care</td>
          </tr>
          <tr>
            <td className="p-4 font-medium text-gray-900 dark:text-white">&quot;I&apos;ll pay later&quot; patients</td>
            <td className="p-4 text-gray-600 dark:text-gray-300">Lost revenue. No tracking. No follow-up.</td>
            <td className="p-4 text-gray-900 dark:text-white">WhatsApp payment link sent instantly. Collected same day.</td>
          </tr>
          <tr className="bg-gray-50 dark:bg-gray-700/20">
            <td className="p-4 font-medium text-gray-900 dark:text-white">End-of-day reconciliation</td>
            <td className="p-4 text-gray-600 dark:text-gray-300">30 minutes of manual tallying. Diary vs register vs cash drawer.</td>
            <td className="p-4 text-gray-900 dark:text-white">Real-time dashboard. One-click day-end report. 0 minutes.</td>
          </tr>
          <tr>
            <td className="p-4 font-medium text-gray-900 dark:text-white">Monthly revenue (30 patients/day, ₹600 avg)</td>
            <td className="p-4 text-red-600 dark:text-red-400 font-semibold">₹3.24L expected → ₹2.98L actual (6% gap)</td>
            <td className="p-4 text-green-600 dark:text-green-400 font-semibold">₹3.24L expected → ₹3.20L actual (under 1% gap)</td>
          </tr>
          <tr className="bg-gray-50 dark:bg-gray-700/20">
            <td className="p-4 font-medium text-gray-900 dark:text-white">When you discover billing errors</td>
            <td className="p-4 text-gray-600 dark:text-gray-300">At month-end. Too late to recover. Source untraceable.</td>
            <td className="p-4 text-gray-900 dark:text-white">Same-day. Flagged before the clinic closes. Correctable immediately.</td>
          </tr>
          <tr>
            <td className="p-4 font-medium text-gray-900 dark:text-white">Inventory-consumables billing</td>
            <td className="p-4 text-gray-600 dark:text-gray-300">Disconnected. Injections dispensed but often unbilled.</td>
            <td className="p-4 text-gray-900 dark:text-white">Auto-linked. Every dispensed item appears on the bill automatically.</td>
          </tr>
          <tr className="bg-gray-50 dark:bg-gray-700/20">
            <td className="p-4 font-medium text-gray-900 dark:text-white">GST compliance</td>
            <td className="p-4 text-gray-600 dark:text-gray-300">Inconsistent. Most bills not valid tax invoices.</td>
            <td className="p-4 text-gray-900 dark:text-white">Every bill is a GST-compliant tax invoice with all mandatory fields.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl text-center">
      <p className="text-blue-700 dark:text-blue-300 font-semibold text-lg">
        That is ₹22,000 more in your bank account every month — from the same patients, same clinic, same doctors. Just without the leaks.
      </p>
    </div>
  </Section>
);

const FAQSection = () => (
  <Section>
    <SectionTitle>Frequently Asked Questions</SectionTitle>
    <SectionSubtitle className="mt-4">
      What clinic owners ask when they first discover how much revenue they have been losing.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How much revenue do Indian clinics lose to billing errors?</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Studies and our user data show 5-8% of OPD revenue is lost to billing errors, missed charges, and collection gaps. For a clinic seeing 30 patients per day at an average bill of ₹500-600, that translates to ₹1,000-2,000 lost every single day — ₹3,00,000 to ₹6,00,000 annually. This includes missed consultation fees for follow-up patients, uncharged procedures like ECG and dressings, manual calculation errors at the billing desk, and patients who say &quot;I&apos;ll pay next time&quot; but never do. The insidious part is that most clinic owners never see this number because manual billing provides no way to track what should have been billed versus what was actually billed. The first month of using automated billing is typically an eye-opener — most clinics discover leakage they had no idea existed.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">What are the most common billing mistakes in clinics?</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          The most frequent billing mistakes in Indian clinics include: (1) Forgetting to bill follow-up consultations — a patient who came for a wound review or BP check gets seen but the receptionist never generates a bill because there was no &quot;new&quot; appointment. (2) Missing procedure charges — the doctor performs an ECG, dressing, or injection and scribbles it on a paper slip that gets lost before reaching the billing desk. (3) Manual calculation errors — adding ₹500 + ₹300 + ₹200 on a calculator and typing ₹900 instead of ₹1,000, which happens 5-10 times daily in a busy OPD. (4) Inconsistent pricing — different receptionists charge different amounts for the same procedure because there is no standard rate card linked to billing. (5) Failing to collect from &quot;regular&quot; patients who promise to pay later — a cultural norm in Indian clinics that results in significant unrecovered revenue.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How does automated billing prevent revenue leakage?</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Automated billing prevents leakage by capturing charges at the point of care rather than relying on a manual handoff. When a doctor records a procedure in the EMR — whether it is a consultation, an ECG, a dressing change, or an injection — that charge is automatically linked to the patient&apos;s bill. There is no paper slip that can be lost, no verbal instruction that can be forgotten, and no manual data entry that can introduce errors. The bill is auto-compiled from the clinical record, and the billing desk only reviews and confirms — they never re-enter data. This single change eliminates the largest source of revenue leakage: the gap between what the doctor does and what the billing desk knows about.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Can UPI payments really reduce collection gaps?</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Yes, UPI payments reduce collection gaps dramatically. When a UPI QR code with the exact bill amount is generated at the billing desk, the patient scans and pays instantly using Google Pay, PhonePe, Paytm, or any BHIM app. The payment confirmation flows back into the system automatically, marking the bill as paid without the receptionist needing to check a separate app or notification. This eliminates three common leakage points: cash handling errors (wrong change given), &quot;keep the change&quot; informal discounts, and end-of-day cash counting discrepancies. For patients who say &quot;I&apos;ll pay next time,&quot; the system can send a WhatsApp payment link immediately — converting what used to be a forgotten receivable into a same-day collection. Clinics using digital collection report under 1% uncollected revenue versus 3-5% with cash-only systems.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How quickly can I see results after switching to digital billing?</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Most clinics see measurable improvement within the first week. The very first day of using automated billing typically reveals charges that would have been missed — often ₹500-1,500 worth. By the end of the first week, the clinic has a clear &quot;expected vs actual&quot; revenue comparison that was impossible with manual billing. By the first month-end, the revenue reconciliation typically reveals 5-8% leakage that was previously invisible — and now captured. The financial impact is immediate because you are not changing how many patients you see or what you charge; you are simply ensuring you collect what you are already owed. The learning curve for staff is minimal (most receptionists are comfortable within 2-3 days), and the time savings on end-of-day reconciliation alone — from 30-45 minutes to near-zero — justify the switch immediately.
        </p>
      </div>
    </div>
  </Section>
);

export default function StopClinicRevenueLeakage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <ProblemSection />
      <MathSection />
      <WhyManualBillingFailsSection />
      <SolutionSection />
      <WorkflowSection />
      <ResultsSection />
      <FAQSection />
      <SignupCTA
        heading="Find Out How Much Revenue Your Clinic Is Leaking"
        description="Most clinics lose 5-8% of revenue to manual billing errors — and don't know it. Chat with us on WhatsApp. We'll help you spot the leaks in under 15 minutes."
      />

      <Script
        id="faq-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: APP_URL },
          { name: 'Stop Clinic Revenue Leakage', url: `${APP_URL}/stop-clinic-revenue-leakage` },
        ]}
      />
    </div>
  );
}
