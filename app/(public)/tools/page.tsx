// Path: app/(public)/tools/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  TrendingDown,
  IndianRupee,
  ClipboardCheck,
  BarChart3,
  Clock,
  Zap,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import {
  Section,
  SectionTitle,
  SectionSubtitle,
} from "@/components/ui/section-headers";

export const metadata: Metadata = {
  title: "Free Clinic Management Tools — Calculators & Scorecards | Doxxy",
  description:
    "Free interactive tools for Indian clinic owners. Calculate no-show losses, estimate software ROI, and assess your clinic's digitization level. No signup required.",
  alternates: { canonical: "/tools" },
  openGraph: {
    title: "Free Clinic Management Tools | Doxxy",
    description:
      "Interactive calculators and scorecards for Indian clinic owners. No signup required.",
    images: [
      {
        url: "/doxxy.png",
        width: 1200,
        height: 630,
        alt: "Doxxy Free Clinic Tools",
      },
    ],
  },
  keywords: [
    "clinic management tools",
    "clinic ROI calculator",
    "no-show cost calculator",
    "clinic digitization scorecard",
    "free clinic tools India",
  ],
};

const tools = [
  {
    href: "/tools/no-show-cost-calculator",
    icon: TrendingDown,
    gradient: "from-red-500 to-rose-600",
    border: "border-red-200 dark:border-red-800/50",
    iconBg: "bg-red-100 dark:bg-red-900/40",
    iconColor: "text-red-600 dark:text-red-400",
    title: "No-Show Cost Calculator",
    tagline: "See what empty chairs are actually costing you.",
    description:
      "Every no-show patient is rupees walking out the door — and most clinic owners never do the math. Adjust 3 sliders and see your daily, monthly, and annual losses in seconds.",
    stats: [
      { value: "30%", label: "Avg Indian OPD no-show rate" },
      { value: "₹1.8L", label: "Avg annual loss per clinic" },
    ],
    cta: "Calculate Your Losses",
  },
  {
    href: "/tools/clinic-roi-calculator",
    icon: IndianRupee,
    gradient: "from-emerald-500 to-green-600",
    border: "border-emerald-200 dark:border-emerald-800/50",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    title: "Clinic ROI Calculator",
    tagline: "Find out if software actually pays for itself. (It does.)",
    description:
      "Most clinic owners think software is an expense. This calculator proves it's a profit center. Input your numbers across 4 sections and see your net annual savings after Doxxy's cost.",
    stats: [
      { value: "70%", label: "Admin time reduction" },
      { value: "₹10/visit", label: "Doxxy cost — deducted live" },
    ],
    cta: "Calculate Your ROI",
  },
  {
    href: "/tools/clinic-digitization-scorecard",
    icon: ClipboardCheck,
    gradient: "from-blue-500 to-indigo-600",
    border: "border-blue-200 dark:border-blue-800/50",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    title: "Clinic Digitization Scorecard",
    tagline: "10 questions. 2 minutes. See where your clinic actually stands.",
    description:
      "Most clinic owners overestimate how digital they are. Using WhatsApp doesn't make you a digital clinic. Answer 10 questions and get a personalized score, band, and roadmap.",
    stats: [
      { value: "2 min", label: "Time to complete" },
      { value: "5 bands", label: "From Paper Era to Fully Digital" },
    ],
    cta: "Take the Scorecard",
  },
];

const whyThisMatters = [
  {
    icon: Clock,
    title: "Built for Indian Clinics",
    description:
      "All calculators assume 25 working days/month, Indian rupee denominations, and Indian clinic realities — not generic Western assumptions.",
  },
  {
    icon: Zap,
    title: "Instant Results, No Signup",
    description:
      "Every tool on this page works immediately in your browser. No email required. No account needed. See your numbers first, decide later.",
  },
  {
    icon: MessageCircle,
    title: "Honest Math, Not Marketing",
    description:
      "These tools show real calculations with real assumptions. The ROI calculator even deducts Doxxy's cost before showing your net savings. We'd rather earn your trust than inflate a number.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy First",
    description:
      "All calculations happen entirely in your browser. We never see your clinic's numbers unless you choose to share them by signing up.",
  },
];

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <div className="max-w-3xl mx-auto">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
        <Calculator className="h-4 w-4" />
        Free Interactive Tools
      </div>
      <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
        Know Your Numbers
        <br />
        Before You Decide.
      </h1>
      <SectionSubtitle>
        Three free calculators that show you exactly what your clinic is losing —
        and what it stands to gain. No signup. No sales call. Just honest math.
      </SectionSubtitle>
    </div>
  </Section>
);

const ToolsGridSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/30 !pt-0">
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {tools.map((tool) => (
        <div
          key={tool.href}
          className={`group relative bg-white dark:bg-gray-800 rounded-3xl border ${tool.border} overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
        >
          {/* Gradient accent bar at top */}
          <div className={`h-1.5 bg-gradient-to-r ${tool.gradient}`} />

          <div className="p-8">
            {/* Icon */}
            <div
              className={`w-14 h-14 ${tool.iconBg} rounded-2xl flex items-center justify-center mb-6`}
            >
              <tool.icon className={`h-7 w-7 ${tool.iconColor}`} />
            </div>

            {/* Title & tagline */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">
              {tool.title}
            </h3>
            <p className={`text-sm font-medium ${tool.iconColor} mb-4`}>
              {tool.tagline}
            </p>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
              {tool.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {tool.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-3 text-center"
                >
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Button
              asChild
              className={`w-full bg-gradient-to-r ${tool.gradient} text-white hover:opacity-90 rounded-xl py-2.5 text-sm font-semibold transition-all group-hover:shadow-lg`}
            >
              <Link href={tool.href}>
                {tool.cta}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const WhySection = () => (
  <Section>
    <SectionTitle>Why These Tools Exist.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Most clinic software companies want your email before they tell you
      anything. We think that's backwards.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-16 space-y-6">
      {whyThisMatters.map((item) => (
        <div
          key={item.title}
          className="flex gap-5 items-start bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6"
        >
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
            <item.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {item.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const ProblemToolMapSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/30">
    <SectionTitle>What Problem Do You Want to Solve?</SectionTitle>
    <SectionSubtitle className="mt-4">
      Pick the question that keeps you up at night. The right tool answers it in
      under 2 minutes.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 grid sm:grid-cols-2 gap-5">
      {[
        {
          question: "How much money am I losing to no-shows?",
          tool: "No-Show Cost Calculator",
          href: "/tools/no-show-cost-calculator",
          icon: TrendingDown,
          color: "text-red-600 dark:text-red-400",
        },
        {
          question: "Is clinic software actually worth the money?",
          tool: "Clinic ROI Calculator",
          href: "/tools/clinic-roi-calculator",
          icon: IndianRupee,
          color: "text-emerald-600 dark:text-emerald-400",
        },
        {
          question: "How digital is my clinic compared to others?",
          tool: "Digitization Scorecard",
          href: "/tools/clinic-digitization-scorecard",
          icon: ClipboardCheck,
          color: "text-blue-600 dark:text-blue-400",
        },
        {
          question: "What should I fix first to grow my practice?",
          tool: "Start with the Scorecard",
          href: "/tools/clinic-digitization-scorecard",
          icon: BarChart3,
          color: "text-purple-600 dark:text-purple-400",
        },
      ].map(({ question, tool, href, icon: Icon, color }) => (
        <Link
          key={question}
          href={href}
          className="group flex items-start gap-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 bg-gray-50 dark:bg-gray-900/50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {tool}
            </p>
            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {question}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all ml-auto flex-shrink-0 mt-1" />
        </Link>
      ))}
    </div>
  </Section>
);

const BottomCTA = () => (
  <Section className="text-center">
    <div className="max-w-2xl mx-auto">
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
        You ran the numbers. Now run a better clinic.
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Doxxy is free for your first 100 appointments. No credit card. No
        commitment. Just a better way to run your practice.
      </p>
      <Button
        size="lg"
        asChild
        className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105"
      >
        <Link href="https://wa.me/+917388890554">
          Start Free Practice <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  </Section>
);

export default function ToolsPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <ToolsGridSection />
      <WhySection />
      <ProblemToolMapSection />
      <BottomCTA />
      <SignupCTA
        heading="Calculate What Your Clinic Is Leaving on the Table"
        description="No-show calculator, ROI calculator, digitization scorecard. Try the tools, then chat with us on WhatsApp about your results."
      />

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Tools", url: `${APP_URL}/tools` },
        ]}
      />
    </div>
  );
}
