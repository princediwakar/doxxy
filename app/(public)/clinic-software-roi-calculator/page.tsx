// Path: app/(public)/clinic-software-roi-calculator/page.tsx
import { Button } from "@/components/ui/button";
import Script from "next/script";
import { ArrowRight, Calculator, TrendingUp, DollarSign, Clock, BarChart3, AlertTriangle, BadgeIndianRupee } from "lucide-react";
import Link from "next/link";
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";
import type { Metadata } from 'next';
import ROICalculatorInteractive from "./ROICalculatorInteractive";

export const metadata: Metadata = {
  title: 'Clinic Software ROI Calculator — See Your Savings in 30 Seconds',
  description: 'Interactive calculator: Input your patient numbers and see exactly how much Doxxy saves your clinic. No email required. Real numbers based on Indian clinic economics.',
  alternates: {
    canonical: '/clinic-software-roi-calculator',
  },
  openGraph: {
    title: 'Clinic Software ROI Calculator — See Your Savings in 30 Seconds',
    description: 'Calculate how much Doxxy saves your clinic. No email required.',
    images: [
      {
        url: '/doxxy.png',
        width: 1200,
        height: 630,
        alt: 'Doxxy Clinic Software ROI Calculator',
      },
    ],
  },
  keywords: ['clinic software ROI', 'clinic software return on investment', 'calculate clinic savings', 'EMR cost savings calculator', 'clinic software benefits calculator'],
};

// --- DATA ---

const faqs = [
  {
    question: "How accurate is this ROI calculator?",
    answer:
      "The calculator uses conservative, industry-standard assumptions: 15% average no-show rate for Indian clinics, 80% recovery rate with automated WhatsApp reminders, and 75% reduction in administrative time. These numbers are based on data from 200+ clinics using Doxxy. Your actual results may vary, but the direction is always positive — clinics see net savings from month one.",
  },
  {
    question: "What's included in the ₹10 per consultation fee?",
    answer:
      "₹10 per completed consultation covers everything: unlimited doctors and staff, EMR, digital prescriptions, appointment scheduling, WhatsApp reminders, billing, and analytics. There are no setup fees, per-doctor charges, or hidden costs. You only pay for consultations that actually happen.",
  },
  {
    question: "Do you charge for no-show appointments?",
    answer:
      "No. You only pay ₹10 for completed consultations. If a patient cancels or doesn't show up, you pay nothing. This aligns our incentives with yours — we only succeed when your clinic runs at full capacity.",
  },
  {
    question: "How does WhatsApp reduce no-shows?",
    answer:
      "Doxxy sends automated WhatsApp reminders 24 hours before and 1 hour before each appointment. Patients can confirm or reschedule with a single tap. Clinics using Doxxy see an average 80% reduction in no-shows — from 15% down to 3%. The reminders work because WhatsApp has a 98% open rate in India, compared to ~20% for SMS and near-zero for email.",
  },
  {
    question: "Can I try Doxxy before committing?",
    answer:
      "Yes. Our Practice Essentials plan is completely free for your first 100 consultations — no credit card required. You get full access to scheduling, patient records, digital prescriptions, and billing. Once you see the value, you can continue at ₹10 per consultation with zero commitment and no annual contract.",
  },
];

const mathCards = [
  {
    icon: AlertTriangle,
    title: "Revenue Lost to No-Shows",
    formula: "patients/day × 26 days × no-show% × avg fee",
    description:
      "Every empty slot is lost revenue. At 40 patients/day with a 15% no-show rate and ₹500 average fee, your clinic loses ₹78,000 per month before a single billing error is accounted for.",
  },
  {
    icon: TrendingUp,
    title: "Revenue Recovered",
    formula: "80% of no-show revenue recovered via WhatsApp reminders",
    description:
      "Automated WhatsApp reminders sent 24 hours and 1 hour before each appointment bring patients back. With a 98% open rate in India, these reminders recover 80% of would-be no-shows. Your staff stops making phone calls, and your slots fill up.",
  },
  {
    icon: BadgeIndianRupee,
    title: "Doxxy Fee",
    formula: "completed appointments × ₹10",
    description:
      "You pay only for consultations that happen. Cancellations and no-shows are free. No per-doctor fees, no setup costs, no annual contracts. Just ₹10 per completed visit — that's it.",
  },
  {
    icon: Clock,
    title: "Admin Time Saved",
    formula: "~3 min saved per appointment = hours back every month",
    description:
      "Digital prescriptions, automated billing, and instant record lookup save roughly 3 minutes per appointment. At 40 patients/day, that's 52 hours per month returned to your staff — time they can spend on patient care instead of paperwork.",
  },
];

const scenarios = [
  {
    icon: TrendingUp,
    label: "Small Clinic",
    subtitle: "15 patients/day",
    savings: "~₹20,000/month",
    hours: "20",
    highlight: false,
  },
  {
    icon: BarChart3,
    label: "Mid-Size Clinic",
    subtitle: "40 patients/day",
    savings: "~₹53,500/month",
    hours: "52",
    highlight: true,
  },
  {
    icon: TrendingUp,
    label: "Busy Clinic",
    subtitle: "80 patients/day",
    savings: "~₹1,07,000/month",
    hours: "104",
    highlight: false,
  },
];

// --- SECTION COMPONENTS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
      <Calculator className="h-4 w-4" />
      Interactive Calculator
    </div>
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      How Much Is Manual Admin Costing Your Clinic?
    </h1>
    <SectionSubtitle>
      30 seconds. 4 inputs. See your real numbers. No email required.
    </SectionSubtitle>
    <div className="mt-10">
      <Button
        size="lg"
        asChild
        className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105"
      >
        <a href="#calculator">
          Calculate Your Savings <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
  </Section>
);

const CalculatorSection = () => (
  <Section id="calculator">
    <SectionTitle>Your Personalized ROI Calculator.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Drag the sliders to match your clinic&apos;s numbers. The math updates instantly.
    </SectionSubtitle>
    <div className="mt-12 max-w-4xl mx-auto">
      <ROICalculatorInteractive />
    </div>
  </Section>
);

const HowMathWorksSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>How the Math Works.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Transparent calculations. No black-box numbers. Every assumption explained.
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 gap-6 mt-16 max-w-5xl mx-auto">
      {mathCards.map((card) => (
        <div
          key={card.title}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50"
        >
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
            <card.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {card.title}
          </h3>
          <p className="text-sm font-mono text-blue-600 dark:text-blue-400 mt-2 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded inline-block">
            {card.formula}
          </p>
          <p className="text-gray-600 dark:text-gray-300 mt-3 text-sm leading-relaxed">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  </Section>
);

const ScenarioSection = () => (
  <Section>
    <SectionTitle>What This Means for Your Clinic.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Real numbers from clinics that switched from paper to Doxxy.
    </SectionSubtitle>
    <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
      {scenarios.map((scenario) => (
        <div
          key={scenario.label}
          className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border text-center ${
            scenario.highlight
              ? "border-blue-500 ring-2 ring-blue-600 ring-offset-2"
              : "border-gray-200/75 dark:border-gray-700/50"
          }`}
        >
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <scenario.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {scenario.label}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {scenario.subtitle}
          </p>
          <div className="mt-4 space-y-2">
            <div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {scenario.savings}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Net monthly savings
              </p>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                {scenario.hours} admin hours saved
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                per month
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const FaqSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Frequently Asked Questions.</SectionTitle>
    <div className="max-w-3xl mx-auto mt-16 space-y-8">
      {faqs.map((faq) => (
        <div key={faq.question}>
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            {faq.question}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{faq.answer}</p>
        </div>
      ))}
    </div>
  </Section>
);

// --- MAIN PAGE COMPONENT ---

const ClinicSoftwareROICalculatorPage = () => {
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
      <CalculatorSection />
      <HowMathWorksSection />
      <ScenarioSection />
      <FaqSection />
      <SignupCTA
        heading="The Math Is Clear: Software Pays for Itself in Month 1"
        description="Input your numbers, see your savings. Then chat with us on WhatsApp — we'll walk you through the real numbers for your specific clinic."
      />

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Clinic Software ROI Calculator", url: `${APP_URL}/clinic-software-roi-calculator` },
        ]}
      />
      <Script
        id="roi-calculator-faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </div>
  );
};

export default ClinicSoftwareROICalculatorPage;
