// Path: app/(public)/tools/clinic-digitization-scorecard/page.tsx
import Script from "next/script";
import Link from "next/link";
import {
  TrendingUp,
  Clock,
  Users,
  AlertTriangle,
  ArrowRight,
  Smartphone,
  ShieldCheck,
  Wifi,
  GraduationCap,
  IndianRupee,
  TrendingDown,
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
import ScorecardQuiz from "./ScorecardQuiz";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Clinic Digitization Scorecard — How Digital Is Your Clinic? | Doxxy",
  description:
    "Take our free 2-minute assessment to find out how digital your clinic really is. Personalized score, benchmarks, and a roadmap for your practice.",
  alternates: {
    canonical: "/tools/clinic-digitization-scorecard",
  },
  openGraph: {
    title: "Clinic Digitization Scorecard — Rate Your Clinic | Doxxy",
    description:
      "10 questions. 2 minutes. Find out where your clinic stands on digitization and what it's costing you.",
    images: [
      {
        url: "/doxxy.png",
        width: 1200,
        height: 630,
        alt: "Doxxy Clinic Digitization Scorecard",
      },
    ],
  },
  keywords: [
    "clinic digitization scorecard",
    "clinic digital assessment",
    "healthcare digitization India",
    "clinic management software",
    "digital clinic checklist",
    "EMR assessment",
  ],
};

// --- DATA ---

const digitizationLevels = [
  {
    label: "Paper Era (0-20%)",
    revenue: "₹15K-₹30K lost/month in inefficiencies",
    patients: "Long wait times, frustrated patients, no-shows common",
    staff: "4-5 hours/day on paperwork, manual follow-ups, filing",
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
  },
  {
    label: "Early Digital (21-40%)",
    revenue: "₹5K-₹15K lost/month in missed follow-ups and billing gaps",
    patients: "Some convenience, but staff still the bottleneck",
    staff: "2-3 hours/day on tasks software could automate",
    icon: Clock,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
  },
  {
    label: "Semi-Digital (41-60%)",
    revenue: "Revenue stable but growth capped by manual processes",
    patients: "Decent experience, but competitors may offer more",
    staff: "1-2 hours/day on avoidable admin work",
    icon: TrendingUp,
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800",
  },
  {
    label: "Mostly Digital (61-80%)",
    revenue: "Revenue optimized. Minor leaks in follow-up conversions",
    patients: "Smooth experience. Online booking, digital payments work",
    staff: "Staff focused on patient care, not paperwork",
    icon: Users,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
  },
  {
    label: "Fully Digital (81-100%)",
    revenue: "₹20K+/month saved vs. paper-based peers. Growth on autopilot",
    patients: "Seamless digital journey from booking to follow-up",
    staff: "Minimal admin. Staff doing what they do best — caring for patients",
    icon: ShieldCheck,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
  },
];

const faqs = [
  {
    question: "What does 'digitization' mean for a clinic?",
    answer:
      "It means moving from paper-based to software-based operations — digital patient records instead of files, online booking instead of phone calls, automated reminders instead of manual follow-ups, and real-time analytics instead of guesswork. It is about making your clinic efficient, scalable, and patient-friendly.",
  },
  {
    question: "How long does it take to digitize a clinic?",
    answer:
      "With Doxxy, basic setup takes as little as 3 days. A full transition — including migrating patient records, training staff, and going live with all features — typically takes 2-4 weeks. We handle the heavy lifting so your practice isn't disrupted.",
  },
  {
    question: "Is digitization expensive?",
    answer:
      "Doxxy starts free for your first 100 appointments. After that, it is ₹10 per consultation — no monthly subscriptions, no per-doctor fees, no hidden costs. The real expense is staying on paper: clinics lose ₹15,000-₹30,000/month in inefficiencies that software eliminates.",
  },
  {
    question: "Will my staff need technical training?",
    answer:
      "If your staff can use WhatsApp, they can use Doxxy. Our interface is designed for Indian clinic staff — simple, intuitive, and available in regional languages. Most teams are comfortable within 3 days.",
  },
  {
    question: "What if I have poor internet connectivity?",
    answer:
      "Doxxy is built for Indian infrastructure realities. It works reliably on 4G mobile data and is optimized for low-bandwidth conditions. You do not need fiber internet or expensive hardware — a basic smartphone or any computer is enough.",
  },
];

// --- PAGE SECTIONS ---

const HeroSection = () => (
  <Section className="text-center !py-20 md:!py-32">
    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-6">
      <Smartphone className="h-4 w-4" />
      Free 2-Minute Assessment
    </div>
    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      How digital is your clinic,{" "}
      <span className="text-blue-600 dark:text-blue-400">really?</span>
    </h1>
    <SectionSubtitle>
      Most clinic owners overestimate their digitization. Using WhatsApp does
      not make you digital. Take this 2-minute scorecard to find out where your
      clinic actually stands — and what it is costing you.
    </SectionSubtitle>
    <div className="mt-10">
      <Button
        size="lg"
        asChild
        className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105"
      >
        <Link href="#quiz">
          Take the Scorecard <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  </Section>
);

const ProblemSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>The Digitization Blind Spot.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Most Indian clinic owners believe they are &ldquo;digital enough&rdquo;
      because they use WhatsApp and have a computer at reception. The reality is
      very different.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-16 grid md:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          What You Think
        </h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
          <li>&ldquo;I use WhatsApp for patient communication&rdquo;</li>
          <li>&ldquo;My receptionist enters appointments in Excel&rdquo;</li>
          <li>&ldquo;I have a billing software for invoices&rdquo;</li>
          <li>&ldquo;Patients can call to book appointments&rdquo;</li>
        </ul>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
          <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          What Digital Actually Means
        </h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
          <li>Patients book online, no phone calls needed</li>
          <li>Automated reminders cut no-shows by 40%</li>
          <li>Integrated billing, EMR, and prescriptions in one system</li>
          <li>Real-time dashboard shows clinic performance at a glance</li>
        </ul>
      </div>
    </div>
  </Section>
);

const MathSection = () => (
  <Section>
    <SectionTitle>What Your Digitization Level Costs You.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Every level of digitization directly impacts your revenue, patient
      experience, and staff workload. Here is the math.
    </SectionSubtitle>
    <div className="max-w-5xl mx-auto mt-16 space-y-4">
      {digitizationLevels.map((level) => (
        <div
          key={level.label}
          className={`rounded-xl border p-5 md:p-6 ${level.bg}`}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              <level.icon className={`h-5 w-5 ${level.color}`} />
            </div>
            <div className="flex-1">
              <h4
                className={`font-bold text-lg ${level.color}`}
              >
                {level.label}
              </h4>
              <div className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Revenue Impact:
                  </span>{" "}
                  <span className="text-gray-600 dark:text-gray-400">
                    {level.revenue}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Patient Experience:
                  </span>{" "}
                  <span className="text-gray-600 dark:text-gray-400">
                    {level.patients}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Staff Workload:
                  </span>{" "}
                  <span className="text-gray-600 dark:text-gray-400">
                    {level.staff}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const QuizSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50" id="quiz">
    <SectionTitle>Take the Scorecard.</SectionTitle>
    <SectionSubtitle className="mt-4">
      10 questions. 2 minutes. Find out exactly where your clinic stands.
    </SectionSubtitle>
    <div className="mt-12">
      <ScorecardQuiz />
    </div>
  </Section>
);

const SolutionSection = () => (
  <Section>
    <SectionTitle>From Paper to Digital — In Days, Not Months.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Whatever your score, Doxxy can get you to the next level. Here is what
      makes it possible.
    </SectionSubtitle>
    <div className="max-w-5xl mx-auto mt-16 grid md:grid-cols-3 gap-8">
      <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Smartphone className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Built for Indian Clinics
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Works on 4G, supports regional languages, and is designed for the way
          Indian clinics actually operate — not Western hospitals.
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
          <IndianRupee className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Pay Per Consultation
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No monthly subscriptions. First 100 appointments free. Then just
          Rs.10 per consultation. You pay only when your clinic earns.
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          3-Day Learning Curve
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          If your staff can use WhatsApp, they can use Doxxy. We provide
          onboarding support and training so your clinic is up and running fast.
        </p>
      </div>
    </div>
    <div className="text-center mt-12">
      <Button
        size="lg"
        asChild
        className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105"
      >
        <Link href="https://wa.me/+917388890554">
          Start Your Digital Journey <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
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

const relatedTools = [
  {
    href: "/tools/no-show-cost-calculator",
    icon: TrendingDown,
    title: "No-Show Cost Calculator",
    description:
      "Your scorecard flagged gaps. Now put a rupee value on your biggest leak — patient no-shows.",
  },
  {
    href: "/tools/clinic-roi-calculator",
    icon: IndianRupee,
    title: "Clinic ROI Calculator",
    description:
      "Take your scorecard insights further. See exactly how much you save by closing each digitization gap.",
  },
];

const RelatedToolsSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/30">
    <SectionTitle>Next: Put Numbers on Your Scorecard.</SectionTitle>
    <SectionSubtitle className="mt-4">
      You know where you stand. Now find out what fixing it is worth.
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

const ClinicDigitizationScorecard = () => {
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
      <QuizSection />
      <SolutionSection />
      <FaqSection />
      <RelatedToolsSection />
      <SignupCTA
        heading="You Scored. Now Improve It."
        description="See what a fully digital clinic looks like. Chat with us on WhatsApp — we'll walk you through the gaps and how to close them."
      />

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Tools", url: `${APP_URL}/tools` },
          {
            name: "Clinic Digitization Scorecard",
            url: `${APP_URL}/tools/clinic-digitization-scorecard`,
          },
        ]}
      />
      <Script
        id="scorecard-faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </div>
  );
};

export default ClinicDigitizationScorecard;
