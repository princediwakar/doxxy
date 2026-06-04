// Path: app/(public)/clinic-software-cost-india/page.tsx

import { Button } from "@/components/ui/button";
import Script from "next/script";
import { Check, ArrowRight, DollarSign, Calculator, AlertTriangle, BadgeIndianRupee, Users } from "lucide-react";
import Link from "next/link";
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clinic Software Cost in India 2026 — Transparent Pricing Breakdown',
  description: 'Honest comparison of clinic management software pricing in India. Doxxy vs Practo, ClinicPlus, Lybrate. Per-consultation vs subscription. No hidden fees.',
  alternates: {
    canonical: '/clinic-software-cost-india',
  },
  openGraph: {
    title: 'Clinic Software Cost in India 2026 — Transparent Pricing Breakdown',
    description: 'Honest comparison of clinic management software pricing in India. No hidden fees. Real numbers.',
    images: [
      {
        url: '/doxxy.png',
        width: 1200,
        height: 630,
        alt: 'Clinic Software Cost India — Pricing Comparison',
      },
    ],
  },
  keywords: ['clinic management software price India', 'clinic software cost per month', 'EMR software pricing', 'clinic software India price', 'affordable clinic software'],
};

// --- DATA ---

const competitorPricing = [
  {
    name: 'Practo',
    pricingModel: 'Monthly subscription + per-doctor fees',
    entryPrice: '₹1,999–₹4,999/mo',
    trueCost3Doctor: '₹5,500–₹8,000/mo',
    hiddenFees: 'Per-doctor fees (₹500–₹1,000/doctor), premium feature add-ons, setup charges for multi-location clinics',
    isDoxxy: false,
  },
  {
    name: 'ClinicPlus',
    pricingModel: 'One-time license + annual maintenance',
    entryPrice: '₹1,500–₹3,500/mo equivalent',
    trueCost3Doctor: '₹4,000–₹6,000/mo equivalent',
    hiddenFees: 'Annual maintenance contracts (15–20% of license), paid version upgrades, per-seat licensing',
    isDoxxy: false,
  },
  {
    name: 'Lybrate',
    pricingModel: 'Subscription + consultation commission',
    entryPrice: '₹999–₹2,499/mo',
    trueCost3Doctor: '₹3,500–₹5,500/mo + commissions',
    hiddenFees: 'Commission on each online consultation (10–20%), limited to telemedicine workflows',
    isDoxxy: false,
  },
  {
    name: 'Eka Care',
    pricingModel: 'Monthly subscription + per-doctor fees',
    entryPrice: '₹1,499–₹3,999/mo',
    trueCost3Doctor: '₹4,500–₹7,000/mo',
    hiddenFees: 'Per-doctor charges, annual lock-in with early termination penalties, higher-tier plans for multi-clinic support',
    isDoxxy: false,
  },
  {
    name: 'Doxxy',
    pricingModel: 'Per-consultation (₹10)',
    entryPrice: 'Free (first 100 consultations)',
    trueCost3Doctor: '~₹2,200/mo (220 consultations)',
    hiddenFees: 'None. Unlimited doctors, all features, SMS/WhatsApp included.',
    isDoxxy: true,
  },
];

const clinicProfiles = [
  {
    label: 'Small Clinic',
    patientsPerDay: 15,
    subscriptionCost: 2000,
    doxxyCost: 330,
    savings: 1670,
    description: 'A single-doctor clinic in a tier-3 city seeing 15 patients daily. This is the backbone of Indian healthcare — and the segment most exploited by per-doctor pricing.',
    slowMonthNote: 'During festival months when patient volume drops 40%, subscription still costs ₹2,000. Doxxy drops to ~₹200.',
  },
  {
    label: 'Medium Clinic',
    patientsPerDay: 40,
    subscriptionCost: 4000,
    doxxyCost: 880,
    savings: 3120,
    description: 'A 2-doctor clinic in a tier-2 city or suburb. High enough volume that subscription pricing seems "reasonable" — until you do the math.',
    slowMonthNote: 'Subscription charges ₹4,000 whether you see 800 patients or 400. Doxxy scales with reality.',
  },
  {
    label: 'Busy Clinic',
    patientsPerDay: 80,
    subscriptionCost: 6000,
    doxxyCost: 1760,
    savings: 4240,
    description: 'A 3-doctor multi-specialty clinic. At this volume, subscription competitors push you to "enterprise" tiers with opaque pricing. Doxxy stays at ₹10/consultation.',
    slowMonthNote: 'The difference is starkest here: ₹6,000 fixed vs ₹1,760 usage-based. That is a 70% reduction in software cost.',
  },
];

const hiddenCosts = [
  {
    icon: Users,
    title: 'Per-Doctor Fees',
    problem: 'Most platforms charge ₹500–₹1,000 extra per doctor, per month. A 3-doctor clinic pays ₹1,500–₹3,000 just for the privilege of having multiple doctors on the system.',
    doxxy: 'Unlimited doctors on all plans. No per-provider charges ever.',
  },
  {
    icon: AlertTriangle,
    title: 'Setup & Onboarding Fees',
    problem: 'Competitors charge ₹5,000–₹15,000 as a one-time "implementation fee." This is essentially a tax on switching to their platform — you pay them to let you become a customer.',
    doxxy: 'Zero setup fees. Migration assistance included. You should not have to pay to start paying.',
  },
  {
    icon: Users,
    title: 'Staff Training Charges',
    problem: '₹2,000–₹5,000 per staff member for "training sessions." For a clinic with 3 receptionists, that is ₹6,000–₹15,000 before you have used the software for a single patient.',
    doxxy: 'Training included. The interface is built for clinic staff who do not have time for 3-day workshops.',
  },
  {
    icon: DollarSign,
    title: 'SMS & WhatsApp Charges',
    problem: 'Most platforms charge ₹0.15–₹0.50 per SMS and ₹0.25–₹1.00 per WhatsApp message. A clinic sending 500 reminders a month pays ₹75–₹500 extra — on top of the subscription.',
    doxxy: 'All patient communication channels included. SMS, WhatsApp, email — no per-message billing.',
  },
  {
    icon: AlertTriangle,
    title: 'Data Export Ransom',
    problem: 'If you decide to leave, some platforms charge ₹10,000–₹25,000 to export YOUR patient data in a usable format. Your data. Your patients. Their ransom.',
    doxxy: 'Export your data anytime, in standard formats, at zero cost. It is your data.',
  },
  {
    icon: Calculator,
    title: 'Annual Contract Lock-In',
    problem: 'Annual contracts with 2–3 month early-termination penalties. You are paying for software you are not using, in months when your clinic is slow, because you signed a paper.',
    doxxy: 'No contracts. No commitments. Cancel anytime. Pay only for consultations you actually conduct.',
  },
];

const faqs = [
  {
    question: 'Clinic software price kitna hota hai India mein?',
    answer: 'Clinic management software in India ranges from ₹299/month (basic apps with limited features) to ₹8,000+/month (enterprise suites for multi-location hospitals). The realistic range for a single-doctor clinic is ₹1,500–₹4,000/month on subscription models. Doxxy breaks this model entirely: you pay ₹10 per consultation, with the first 100 consultations free. For a clinic seeing 25 patients a day, that works out to approximately ₹550/month — significantly less than any comparable subscription product. Credit packages are also available: Junior (50 credits/₹499), Senior (200/₹1,999), Professional (1000/₹9,999).',
  },
  {
    question: 'Is per-consultation pricing better than a monthly subscription?',
    answer: 'For 80% of Indian clinics, yes — and the math is straightforward. Subscriptions charge you the same ₹2,000–₹5,000 whether you see 100 patients or 500 patients. During festival seasons, summer slowdowns, or any month where patient flow dips, you still pay full price. Per-consultation pricing means your software cost is a direct function of your clinic activity: busy months cost more (because you are earning more), slow months cost less (because you are earning less). This alignment means software cost never exceeds 2–3% of revenue, while subscription models can hit 8–12% during slow months. The only case where a subscription beats per-consultation pricing is for clinics seeing 500+ patients a day on a flat ₹2,000 plan — but at that volume, you are likely on an enterprise tier paying much more anyway.',
  },
  {
    question: 'What is the cheapest clinic management software in India?',
    answer: 'The cheapest usable option depends on how you define "cheap." Several mobile apps offer free tiers with severe feature restrictions (no EMR, limited appointments, ads). Among functional clinic software: MFine starts at ₹299/month but is primarily telemedicine-focused. Lybrate starts at ₹999/month but charges commissions on consultations. Doxxy is the only platform where you can run a fully functional clinic management system (EMR, scheduling, billing, reminders, multi-doctor support) at zero cost for your first 100 consultations — and then ₹10 per consultation thereafter. For a clinic doing 200 consultations a month, ₹2,000 on Doxxy gets you features that would cost ₹4,000–₹6,000 on subscription platforms. The cheapest option that does not compromise on features is Doxxy.',
  },
  {
    question: 'Are there any free clinic software options that are actually good?',
    answer: 'The short answer: free tiers on most platforms are marketing funnels, not usable products. Practo\'s free tier restricts patient record storage and disables analytics. Eka Care\'s trial is time-limited (14–30 days). ClinicPlus has no free option — you pay upfront. Doxxy\'s Practice Essentials plan is genuinely free for your first 100 consultations with no time limit, no feature restrictions, and no credit card required. Unlimited doctors, full EMR, appointment scheduling, prescriptions, and basic analytics — all included. After 100 consultations, you transition to Clinical Excellence at ₹10/consultation. For a new clinic doing 3–4 patients a day, the free tier lasts 25–33 working days — a real runway to evaluate the software, not a rushed trial that expires before you have finished onboarding.',
  },
  {
    question: 'What hidden costs should I watch out for when buying clinic software?',
    answer: 'Six specific traps to verify before signing anything: (1) Per-doctor fees — ask explicitly if adding a second doctor increases your bill. (2) Setup and onboarding charges — ask for the all-in first-year cost, not just the monthly rate. (3) Training fees — clarify whether staff training is included or billed per person. (4) Communication costs — SMS and WhatsApp charges are the most common hidden line item. (5) Data export fees — confirm in writing that you can export your patient data in a standard format at no cost if you leave. (6) Annual lock-in penalties — check the early termination clause. If the salesperson deflects any of these six questions, it is because the answer costs money. Doxxy\'s answer to all six: included, zero, no lock-in.',
  },
  {
    question: 'How much does Doxxy cost for a small clinic with 1–2 doctors?',
    answer: 'A 1–2 doctor clinic seeing 20–30 patients a day across 26 working days does approximately 520–780 consultations a month. On Doxxy Clinical Excellence at ₹10/consultation, that is ₹5,200–₹7,800/month. But this is the wrong way to think about it. The right question is: what does the software save you? At a 15% average no-show rate, this clinic loses 78–117 appointment slots a month — worth ₹39,000–₹58,500 in lost consultation fees (at ₹500 average). Doxxy\'s WhatsApp reminders recover roughly 80% of that, or ₹31,200–₹46,800. Subtract the software cost: the clinic is net-positive by ₹23,400–₹41,600 every single month. The software does not cost money. It makes money. Use the ROI calculator at /clinic-software-roi-calculator to compute your clinic\'s exact numbers.',
  },
];

// --- PAGE SECTIONS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      Clinic Software Pricing in India — The Honest Breakdown.
    </h1>
    <SectionSubtitle>
      No &ldquo;contact sales&rdquo; games. No hidden per-doctor fees. Just real numbers from someone tired of SaaS pricing bullshit.
    </SectionSubtitle>
    <div className="mt-10">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="/pricing">See Full Pricing <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

const RealityCheckSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>What Clinic Software Actually Costs in India (2026).</SectionTitle>
    <SectionSubtitle className="mt-4">
      Not the advertised price. Not the &ldquo;starting at&rdquo; bait. The real cost for a real clinic with 3 doctors.
    </SectionSubtitle>
    <div className="max-w-5xl mx-auto mt-12 overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700/50">
            <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Software</th>
            <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Pricing Model</th>
            <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Entry Price</th>
            <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">True Cost (3 Doctors)</th>
            <th className="text-left p-4 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Hidden Fees</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {competitorPricing.map((row) => (
            <tr key={row.name} className={`${row.isDoxxy ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}>
              <td className={`p-4 font-semibold ${row.isDoxxy ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                {row.name} {row.isDoxxy && <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">Our Model</span>}
              </td>
              <td className="p-4 text-gray-700 dark:text-gray-300">{row.pricingModel}</td>
              <td className="p-4 text-gray-700 dark:text-gray-300">{row.entryPrice}</td>
              <td className={`p-4 font-medium ${row.isDoxxy ? 'text-blue-700 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>{row.trueCost3Doctor}</td>
              <td className="p-4 text-gray-500 dark:text-gray-400 text-xs leading-relaxed max-w-[240px]">{row.hiddenFees}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
        Key insight: Most subscription software costs ₹3,000&ndash;₹6,000/month for a multi-doctor clinic. Doxxy costs ~₹2,200/month for the same clinic at 220 appointments/month.
      </p>
    </div>
  </Section>
);

const MathSection = () => (
  <Section>
    <SectionTitle>Why Per-Consultation Pricing Changes Everything.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Three real clinic profiles. Same 26 working days per month. See the difference.
    </SectionSubtitle>
    <div className="max-w-5xl mx-auto mt-12 grid md:grid-cols-3 gap-8">
      {clinicProfiles.map((profile) => (
        <div key={profile.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <BadgeIndianRupee className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{profile.label}</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">{profile.description}</p>

          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 mb-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Patients/day</span>
              <span className="font-semibold text-gray-900 dark:text-white">{profile.patientsPerDay}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Subscription cost</span>
              <span className="font-semibold text-red-600 dark:text-red-400">₹{profile.subscriptionCost.toLocaleString('en-IN')}/mo</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-600 pt-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Doxxy cost</span>
              <span className="font-bold text-green-600 dark:text-green-400 text-lg">₹{profile.doxxyCost.toLocaleString('en-IN')}/mo</span>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-4">
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">
              You save ₹{profile.savings.toLocaleString('en-IN')}/month
            </p>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed mt-auto">{profile.slowMonthNote}</p>
        </div>
      ))}
    </div>
  </Section>
);

const HiddenCostsSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>What Competitors Do Not Tell You.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Six line items that appear after you sign. Doxxy charges for exactly zero of them.
    </SectionSubtitle>
    <div className="max-w-5xl mx-auto mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {hiddenCosts.map((item) => (
        <div key={item.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 flex flex-col">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
            <item.icon className="h-5 w-5 text-red-500 dark:text-red-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{item.problem}</p>
          <div className="mt-auto bg-green-50 dark:bg-green-900/20 rounded-lg p-3 flex items-start gap-2">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-green-700 dark:text-green-300 font-medium">{item.doxxy}</p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const NoShowCalculatorSection = () => (
  <Section>
    <SectionTitle>The No-Show Calculator.</SectionTitle>
    <SectionSubtitle className="mt-4">
      This is the math that convinces clinic owners. Software does not cost money &mdash; empty chairs do.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Sample Calculation: 40 Patients/Day Clinic
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: 'Daily patients', value: '40', detail: null },
            { label: 'Working days/month', value: '26', detail: 'Monthly appointments: 1,040' },
            { label: 'Average no-show rate', value: '15%', detail: '156 patients do not show up each month' },
            { label: 'Average consultation fee', value: '₹500', detail: null },
            { label: 'Monthly revenue lost to no-shows', value: '₹78,000', detail: '156 × ₹500 — gone, every single month', highlight: true },
            { label: 'Doxxy WhatsApp reminders recover', value: '₹62,400', detail: '80% recovery rate. Reminders cost nothing extra.', highlight: true },
            { label: 'Doxxy software cost', value: '₹8,840/month', detail: '1,040 appointments × ₹10/consultation' },
            { label: 'Net monthly position', value: '+ ₹53,560', detail: '₹62,400 recovered − ₹8,840 software cost = your clinic is ₹53,560 better off', highlight: true },
          ].map(({ label, value, detail, highlight }) => (
            <div key={label} className={`flex justify-between items-center py-3 ${highlight ? 'border-t-2 border-blue-100 dark:border-blue-900/50 pt-4' : 'border-b border-gray-100 dark:border-gray-700/30 pb-3'}`}>
              <div>
                <span className={`text-sm ${highlight ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>{label}</span>
                {detail && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{detail}</p>}
              </div>
              <span className={`font-bold text-right ${highlight ? 'text-green-600 dark:text-green-400 text-lg' : 'text-gray-900 dark:text-white'}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 text-center">
        <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
          <Link href="/clinic-software-roi-calculator">Calculate Your Exact Numbers <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  </Section>
);

const FAQSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Frequently Asked Questions.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Direct answers. No marketing language. No evasion.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-6">
      {faqs.map((faq) => (
        <details key={faq.question} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6 group">
          <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
            {faq.question}
            <span className="text-blue-500 text-xl group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
          </summary>
          <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{faq.answer}</p>
        </details>
      ))}
    </div>
  </Section>
);

// --- MAIN PAGE COMPONENT ---

const ClinicSoftwareCostIndia = () => {
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <RealityCheckSection />
      <MathSection />
      <HiddenCostsSection />
      <NoShowCalculatorSection />
      <FAQSection />
      <SignupCTA
        heading="See Transparent Pricing — No 'Contact Sales' Nonsense"
        description="Starts at ₹999/mo. Unlimited doctors, no per-seat fees. See if Doxxy fits your clinic's budget. Chat with us on WhatsApp."
      />

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Clinic Software Cost India", url: `${APP_URL}/clinic-software-cost-india` },
        ]}
      />
      <Script
        id="clinic-software-cost-faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </div>
  );
};

export default ClinicSoftwareCostIndia;
