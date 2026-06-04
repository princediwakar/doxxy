// Path: app/(public)/tools/clinic-roi-calculator/page.tsx
import Script from "next/script";
import Link from "next/link";
import {
  Calculator,
  TrendingDown,
  Clock,
  Receipt,
  UserX,
  CalendarX,
  ArrowRight,
  Check,
  ClipboardCheck,
} from "lucide-react";
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import {
  Section,
  SectionTitle,
  SectionSubtitle,
} from "@/components/ui/section-headers";
import { Button } from "@/components/ui/button";
import ClinicRoiCalculator from "./ClinicRoiCalculator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Clinic ROI Calculator — See How Much Your Practice Can Save | Doxxy",
  description:
    "Calculate how much your clinic can save by switching to Doxxy. Estimate savings from reduced admin time, billing errors, no-shows, and missed follow-ups. Built for Indian clinics.",
  alternates: {
    canonical: "/tools/clinic-roi-calculator",
  },
  openGraph: {
    title: "Clinic ROI Calculator — Doxxy",
    description:
      "See exactly how much your clinic can save with better management software.",
    images: [
      {
        url: "/doxxy.png",
        width: 1200,
        height: 630,
        alt: "Doxxy Clinic ROI Calculator",
      },
    ],
  },
  keywords: [
    "clinic ROI calculator",
    "clinic savings calculator",
    "practice management ROI",
    "healthcare software savings",
    "Indian clinic cost calculator",
  ],
};

// --- DATA ---

const problemStats = [
  {
    icon: Clock,
    value: "3-5 hours/day",
    label: "Lost to paperwork & manual scheduling by reception staff",
  },
  {
    icon: Receipt,
    value: "5-15 errors",
    label: "Billing mistakes per 100 patients costing real revenue",
  },
  {
    icon: UserX,
    value: "20-30%",
    label: "Patient no-show rate without automated reminders",
  },
  {
    icon: CalendarX,
    value: "40% or lower",
    label: "Follow-up adherence rate — revenue left on the table",
  },
];

const hiddenCosts = [
  {
    category: "Staff Time on Paperwork",
    monthlyRange: "₹8,000 – ₹20,000",
    description:
      "Receptionists spend hours managing appointment books, confirming slots, and filing records manually.",
  },
  {
    category: "Billing Errors & Leakage",
    monthlyRange: "₹3,000 – ₹12,000",
    description:
      "Manual billing leads to undercharging, missed line items, and reconciliation headaches.",
  },
  {
    category: "No-Show Revenue Loss",
    monthlyRange: "₹6,000 – ₹30,000",
    description:
      "Without automated WhatsApp/SMS reminders, 1 in 5 patients simply forgets their appointment.",
  },
  {
    category: "Missed Follow-Up Revenue",
    monthlyRange: "₹4,000 – ₹20,000",
    description:
      "Patients who need follow-ups often fall through the cracks when tracking is manual.",
  },
];

const solutionCategories = [
  {
    problem: "Hours lost on paperwork",
    solution:
      "Doxxy automates scheduling, patient check-in, and record-keeping. Your staff gains back 3+ hours every day.",
  },
  {
    problem: "Billing errors & leakage",
    solution:
      "Billing is auto-generated from consultation records. No manual entry, no missed charges, no underbilling.",
  },
  {
    problem: "High no-show rates",
    solution:
      "Automated WhatsApp and SMS reminders cut no-shows by 35% or more. Patients confirm with a single tap.",
  },
  {
    problem: "Missed follow-up appointments",
    solution:
      "Built-in follow-up scheduling and automated recall reminders push adherence from 40% to 75%+.",
  },
];

const resultQuotes = [
  {
    savings: "₹2.4 Lakhs/year",
    clinic: "Dr. Rajesh Kumar, General Practice, Jaipur",
    detail: "Reduced admin hours by 3.5/day and cut no-shows from 22% to 8%.",
  },
  {
    savings: "₹1.8 Lakhs/year",
    clinic: "Dr. Priya Nair, Gynecology Clinic, Kochi",
    detail:
      "Billing errors dropped to near zero and follow-up adherence climbed to 78%.",
  },
  {
    savings: "₹3.1 Lakhs/year",
    clinic: "Sharma Multi-Specialty Clinic, Lucknow",
    detail:
      "Three doctors, one receptionist — saved ₹3.1L annually after software costs.",
  },
];

const comparisonRows = [
  {
    metric: "Appointment Scheduling",
    before: "Manual register or phone calls, 30-60 min/day",
    after: "Online booking + auto-confirmations, 5 min/day",
  },
  {
    metric: "Billing Accuracy",
    before: "Manual entry, 5-15 errors per 100 patients",
    after: "Auto-generated from consult record, near-zero errors",
  },
  {
    metric: "Patient No-Shows",
    before: "20-30% without reminders",
    after: "8-12% with automated WhatsApp/SMS",
  },
  {
    metric: "Follow-Up Adherence",
    before: "~40% without structured tracking",
    after: "75%+ with automated recall system",
  },
  {
    metric: "Staff Overtime",
    before: "8-12 extra hours/week on admin",
    after: "Staff focused on patient care, not paperwork",
  },
  {
    metric: "Monthly Software Cost",
    before: "₹3,000-₹15,000 fixed subscription",
    after: "₹10/consultation (pay only for what you use)",
  },
];

const faqs = [
  {
    question: "How accurate is this ROI calculator?",
    answer:
      "The calculator uses conservative estimates based on real data from Indian clinics that switched to digital practice management. We assume 25 working days per month and modest improvement rates (35% no-show reduction, 75% follow-up adherence) that most clinics exceed in practice. Your actual savings may be higher.",
  },
  {
    question: "What is the biggest source of savings?",
    answer:
      "For most clinics, the largest saving comes from admin time reduction. A receptionist spending 4 hours a day on paperwork at ₹150/hour costs the clinic ₹18,000/month in pure administrative overhead. Doxxy typically cuts this by 70% or more by automating scheduling, record-filing, and patient communication.",
  },
  {
    question: "How does Doxxy reduce billing errors?",
    answer:
      "Doxxy auto-generates billing entries directly from digital consultation records. When a doctor completes a consultation in the system, the billing line items are created automatically — no manual transcription from paper to billing software. This eliminates the most common source of errors and undercharging.",
  },
  {
    question: "What if my clinic is very small?",
    answer:
      "The calculator works for solo practices too. Set the number of doctors to 1 and adjust patient numbers to match your practice. Even a solo doctor with 15 patients a day can save ₹60,000-₹80,000 per year after software costs, mostly from reduced no-shows and better billing accuracy.",
  },
  {
    question: "How soon will I see ROI after switching?",
    answer:
      "Most clinics see measurable savings within the first month. Admin time drops immediately once scheduling is digitized. No-show rates begin falling within the first week of automated reminders. Full ROI — where savings exceed software cost — is typically achieved in the first month for clinics seeing 20+ patients per day.",
  },
];

// --- PAGE SECTIONS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
      <Calculator className="h-8 w-8 text-blue-600 dark:text-blue-400" />
    </div>
    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight max-w-4xl mx-auto">
      What if your clinic management software{" "}
      <span className="text-blue-600 dark:text-blue-400">paid for itself</span>{" "}
      in 3 days?
    </h1>
    <SectionSubtitle>
      Use our calculator to see exactly how much your practice loses to manual
      processes — and how much Doxxy puts back in your pocket each year.
    </SectionSubtitle>
    <div className="mt-10">
      <Button
        size="lg"
        asChild
        className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105"
      >
        <Link href="#calculator">
          Calculate My Savings <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  </Section>
);

const ProblemSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>
      Manual processes cost Indian clinics ₹15,000 – ₹40,000/month.
    </SectionTitle>
    <SectionSubtitle className="mt-4">
      Most clinic owners do not realize how much revenue seeps through the
      cracks of paper-based workflows.
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
      {problemStats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50 text-center"
        >
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <stat.icon className="h-6 w-6 text-red-500 dark:text-red-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {stat.value}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  </Section>
);

const MathSection = () => (
  <Section>
    <SectionTitle>Where your money is actually going.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Here is the breakdown of hidden costs eating into your clinic&apos;s bottom
      line every month.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-16 space-y-6">
      {hiddenCosts.map((item) => (
        <div
          key={item.category}
          className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50 flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <div className="flex-shrink-0 w-full sm:w-48">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Monthly loss
            </div>
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              {item.monthlyRange}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {item.category}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
      Based on a typical 2-doctor clinic seeing 30 patients/day. Your numbers
      may vary — use the calculator below for your exact estimate.
    </p>
  </Section>
);

const SolutionSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>How Doxxy eliminates each cost category.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Every feature is built to plug a specific revenue leak.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-16 grid gap-6">
      {solutionCategories.map((item) => (
        <div
          key={item.problem}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50 flex gap-4"
        >
          <div className="flex-shrink-0 mt-1">
            <Check className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              <span className="text-red-500 line-through mr-2">
                {item.problem}
              </span>
              {" → "}
              <span className="text-green-600 dark:text-green-400">Fixed</span>
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {item.solution}
            </p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const ResultsSection = () => (
  <Section>
    <SectionTitle>Real savings from real Indian clinics.</SectionTitle>
    <SectionSubtitle className="mt-4">
      These clinics switched to Doxxy. Here is what happened to their bottom
      line.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-16 grid md:grid-cols-3 gap-6">
      {resultQuotes.map((quote) => (
        <div
          key={quote.clinic}
          className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50 flex flex-col"
        >
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-3">
            {quote.savings}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 flex-1">
            {quote.detail}
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3 mt-auto">
            {quote.clinic}
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const ComparisonSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>
      Before Doxxy vs After Doxxy: The Annual P&amp;L Picture.
    </SectionTitle>
    <SectionSubtitle className="mt-4">
      A side-by-side look at what changes when your clinic goes digital.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-16">
      <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-100 dark:bg-gray-700/50 font-semibold text-sm text-gray-700 dark:text-gray-200">
          <div className="col-span-4">Metric</div>
          <div className="col-span-4 text-red-600 dark:text-red-400">
            Before Doxxy
          </div>
          <div className="col-span-4 text-green-600 dark:text-green-400">
            After Doxxy
          </div>
        </div>
        {comparisonRows.map((row, i) => (
          <div
            key={row.metric}
            className={`grid grid-cols-12 gap-4 p-4 text-sm ${
              i < comparisonRows.length - 1
                ? "border-b border-gray-200/75 dark:border-gray-700/50"
                : ""
            }`}
          >
            <div className="col-span-4 font-medium text-gray-800 dark:text-gray-200">
              {row.metric}
            </div>
            <div className="col-span-4 text-gray-600 dark:text-gray-400">
              {row.before}
            </div>
            <div className="col-span-4 text-gray-800 dark:text-gray-200 font-medium">
              {row.after}
            </div>
          </div>
        ))}
      </div>
    </div>
  </Section>
);

const FaqSection = () => (
  <Section>
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

const CalculatorCTASection = () => (
  <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-blue-600 dark:bg-blue-800">
    <div className="max-w-4xl mx-auto text-center">
      <TrendingDown className="h-12 w-12 text-white/80 mx-auto mb-6" />
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
        See exactly how Doxxy saves you money.
      </h2>
      <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
        The numbers above are estimates based on your inputs. Start a free
        practice to see these savings materialize in your own clinic.
      </p>
      <Button
        size="lg"
        asChild
        className="bg-white text-blue-600 hover:bg-blue-50 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105"
      >
        <Link href="https://wa.me/+917388890554">
          Start Free Practice <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
      <p className="text-sm text-blue-200 mt-4">
        First 100 consultations free. No credit card required.
      </p>
    </div>
  </section>
);

const relatedTools = [
  {
    href: "/tools/no-show-cost-calculator",
    icon: TrendingDown,
    title: "No-Show Cost Calculator",
    description:
      "Zoom in on your single biggest leak. See exactly what empty appointment slots cost you each month.",
  },
  {
    href: "/tools/clinic-digitization-scorecard",
    icon: ClipboardCheck,
    title: "Clinic Digitization Scorecard",
    description:
      "ROI depends on where you start. Take the 2-minute scorecard to see your clinic's digital baseline.",
  },
];

const RelatedToolsSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/30">
    <SectionTitle>Related Tools.</SectionTitle>
    <SectionSubtitle className="mt-4">
      These calculators work together. Run all three to get the complete picture
      of your clinic&apos;s financial health.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 grid sm:grid-cols-2 gap-6">
      {relatedTools.map((tool) => (
        <Link
          key={tool.href}
          href={tool.href}
          className="group flex items-start gap-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <tool.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {tool.title}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {tool.description}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all ml-auto flex-shrink-0 mt-1" />
        </Link>
      ))}
    </div>
  </Section>
);

// --- MAIN PAGE COMPONENT ---

const ClinicRoiCalculatorPage = () => {
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
      <ProblemSection />
      <MathSection />
      <Section className="bg-gray-50 dark:bg-gray-800/30" id="calculator">
        <ClinicRoiCalculator />
      </Section>
      <SolutionSection />
      <ResultsSection />
      <ComparisonSection />
      <FaqSection />
      <CalculatorCTASection />
      <RelatedToolsSection />
      <SignupCTA
        heading="The Numbers Don't Lie. Software Pays for Itself."
        description="See exactly how much your clinic saves by switching. Chat with us on WhatsApp — we'll run the real numbers for your specific practice."
      />

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Tools", url: `${APP_URL}/tools` },
          {
            name: "Clinic ROI Calculator",
            url: `${APP_URL}/tools/clinic-roi-calculator`,
          },
        ]}
      />
      <Script
        id="clinic-roi-faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </div>
  );
};

export default ClinicRoiCalculatorPage;
