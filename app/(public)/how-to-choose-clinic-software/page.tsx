// Path: app/(public)/how-to-choose-clinic-software/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Download,
  FileText,
  HelpCircle,
  ClipboardList,
  Search,
  Shield,
  IndianRupee,
  MessageCircle,
  Users,
  Clock,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";

export const metadata: Metadata = {
  title: 'How to Choose Clinic Management Software — The 10-Question Buyer\'s Guide',
  description: 'The ultimate 10-question checklist for choosing clinic software in India. Avoid buying the wrong system. Written for clinic owners, by people who\'ve evaluated 20+ systems.',
  alternates: {
    canonical: '/how-to-choose-clinic-software',
  },
  openGraph: {
    title: 'How to Choose Clinic Management Software — The 10-Question Buyer\'s Guide',
    description: 'The ultimate 10-question checklist for choosing clinic software in India. Avoid buying the wrong system.',
    images: [
      {
        url: '/how-to-choose-clinic-software.png',
        width: 1200,
        height: 630,
        alt: 'How to Choose Clinic Management Software Guide',
      },
    ],
  },
  keywords: [
    'how to choose clinic management software',
    'clinic software buying guide',
    'clinic software selection checklist',
    'EMR buying guide India',
    'how to evaluate clinic software',
  ],
};

// --- DATA ---

interface QuestionItem {
  number: number;
  question: string;
  why: string;
  lookFor: string[];
  redFlag: string;
}

const tenQuestions: QuestionItem[] = [
  {
    number: 1,
    question: "Is the pricing transparent and publicly listed?",
    why: "If you have to \"contact sales\" to see a price, the software is either too expensive or they plan to negotiate based on your budget, not your needs. Transparent pricing means the company is confident in their value.",
    lookFor: [
      "Public pricing page with clear tier breakdowns",
      "Free trial available without credit card",
      "No hidden setup fees or onboarding charges",
      "Clear documentation of what each tier includes and excludes",
    ],
    redFlag: "\"Book a demo for pricing\" or \"Custom pricing for every clinic.\"",
  },
  {
    number: 2,
    question: "Does it have WhatsApp integration built in?",
    why: "500M+ Indians use WhatsApp. Your patients already have it. A clinic software without WhatsApp integration means your receptionist manually calls every patient for reminders. That's 2-3 hours of wasted labor daily.",
    lookFor: [
      "Automated WhatsApp appointment reminders",
      "WhatsApp prescription delivery to patients",
      "WhatsApp lab report sharing",
      "Two-way WhatsApp messaging with patients",
    ],
    redFlag: "SMS-only reminders. SMS open rates in India are below 30%. WhatsApp open rates are 98%.",
  },
  {
    number: 3,
    question: "Is it ABDM/ABHA compliant?",
    why: "The government's Ayushman Bharat Digital Mission is not optional — it's being mandated. Software without ABDM compliance today means you'll need to switch within 2-3 years when compliance becomes mandatory. ABHA ID generation and linking is becoming a standard requirement.",
    lookFor: [
      "ABHA ID creation for patients",
      "ABHA-linked health records",
      "ABDM-compliant prescription formats",
      "Active ABDM integration (not \"on the roadmap\")",
    ],
    redFlag: "\"We're planning to add ABDM\" or no mention of ABDM at all on their website.",
  },
  {
    number: 4,
    question: "Can my receptionist learn it in under a week?",
    why: "If a 45-year-old receptionist who's been using paper registers for 20 years can't learn your software in 3 days, you bought the wrong software. Complicated software creates resistance, errors, and eventually gets abandoned for paper.",
    lookFor: [
      "Clean, simple interface without clutter",
      "Hindi/regional language support",
      "Free onboarding and training included",
      "Video tutorials in Hindi",
      "Responsive customer support via phone/WhatsApp",
    ],
    redFlag: "\"Comprehensive training program required\" — this is code for \"it's complicated.\"",
  },
  {
    number: 5,
    question: "Does it work offline or with poor internet?",
    why: "Clinics in tier-2/3 cities, basement OPDs, and rural areas have unreliable internet. If your software is cloud-only with no offline mode, you're one Jio outage away from a clinic that can't function.",
    lookFor: [
      "Offline-first or progressive web app architecture",
      "Local data caching on device",
      "Automatic sync when internet returns",
      "Low data usage mode for limited plans",
    ],
    redFlag: "\"Requires stable broadband connection\" or web-only with no mobile app.",
  },
  {
    number: 6,
    question: "What happens to my data if I want to leave?",
    why: "Vendor lock-in is real. Some software makes it easy to export your data. Others hold your 15 years of patient records hostage. You need to know before you sign up — not when you're frustrated and trying to leave.",
    lookFor: [
      "One-click data export from the dashboard",
      "Standard formats: CSV, JSON, PDF",
      "Clear data ownership policy stating you own your data",
      "The vendor will assist with migration away from them",
    ],
    redFlag: "No export option, proprietary formats only, or \"data deletion upon cancellation\" clauses in Terms of Service.",
  },
  {
    number: 7,
    question: "How good is the support when things break — at 8 PM on a Tuesday?",
    why: "Clinic software doesn't break at convenient times. It breaks at 8 PM when you have 3 patients waiting and the billing module crashes. Support quality is tested in emergencies, not during sales calls.",
    lookFor: [
      "Phone and WhatsApp support (not just email)",
      "Indian timezone support hours (not US/EU shift)",
      "Average response time under 15 minutes",
      "Support available in Hindi and regional languages",
    ],
    redFlag: "Email-only support, \"24-48 hour response time,\" or no Indian phone number listed.",
  },
  {
    number: 8,
    question: "Does it match how MY clinic works — or will I have to change my workflow?",
    why: "Some software forces you into a rigid workflow designed for large hospitals. If you see 40 patients a day in 10-minute slots, you need speed and simplicity, not a 12-field form for every patient.",
    lookFor: [
      "Customizable workflows and templates",
      "Specialty-specific features if relevant to your practice",
      "Configurable (not just \"feature-complete\")",
      "The software adapts to you, not the other way around",
    ],
    redFlag: "\"You'll get used to it\" — said by salespeople whose software doesn't match Indian clinic realities.",
  },
  {
    number: 9,
    question: "What do other doctors LIKE ME actually say about it?",
    why: "A 50-doctor hospital's experience is irrelevant if you're a solo GP. Look for reviews from clinics similar to yours: same size, same specialty, same city tier. Real feedback from real peers.",
    lookFor: [
      "Google reviews from verified users",
      "Capterra/G2 reviews with detail (not just star ratings)",
      "Video testimonials from real, named doctors",
      "Case studies with actual numbers, not vague claims",
      "Ability to talk to an existing user as a reference",
    ],
    redFlag: "Only curated testimonials on their website, no public reviews anywhere, or can't connect you with a reference customer.",
  },
  {
    number: 10,
    question: "Can I try it with real patients before committing?",
    why: "Demo environments with fake data feel smooth. Real clinics with real patients reveal the rough edges. A free trial with your actual patients is the only reliable way to know if the software works for your practice.",
    lookFor: [
      "Free trial that lets you add real patients",
      "No credit card required to start trial",
      "Full feature access during trial (not a limited version)",
      "Onboarding support provided during the trial period",
    ],
    redFlag: "No free trial, \"demo only\" (staged environment with dummy data), or credit card required for trial.",
  },
];

const mistakes = [
  {
    title: "Choosing the cheapest option",
    description: "A Rs 500/mo software that creates Rs 5,000/mo in billing errors is not cheap. Price is what you pay. Value is what you get. Look at total cost of ownership, not just the monthly subscription.",
    icon: IndianRupee,
  },
  {
    title: "Choosing the most feature-rich option",
    description: "Features you don't use equal complexity you fight every day. A software with 200 features where you use 20 is worse than software with 30 features where you use 25. More is not better. Right is better.",
    icon: Zap,
  },
  {
    title: "Not involving your staff in the decision",
    description: "The doctor chooses, the receptionist suffers. Your staff will use the software 8 hours a day — you'll use it 30 minutes. If they hate it, adoption fails, data entry stops, and you're back to paper within 6 months.",
    icon: Users,
  },
  {
    title: "Signing annual contracts before testing",
    description: "Always test monthly first. Annual \"discounts\" of 15-25% are lock-in traps disguised as savings. If the software is good, you'll happily pay monthly. If it's bad, you'll pay 12 months for something you stopped using in month 2.",
    icon: FileText,
  },
  {
    title: "Ignoring WhatsApp",
    description: "In India, WhatsApp IS patient communication. Software without WhatsApp integration is half a solution. Your patients won't download a separate app, won't check email for reminders, and won't answer unknown numbers. WhatsApp or nothing.",
    icon: MessageCircle,
  },
];

const faqs = [
  {
    question: "How long does it take to switch clinic software?",
    answer: "Typical migration takes 2-4 weeks: 1 week for data export/import, 1 week for staff training, and 2 weeks of parallel running (old and new system side by side). Budget for a month of overlap. The key is planning — start the migration during a relatively quiet period and have clear milestones for each week.",
  },
  {
    question: "Should I choose cloud-based or on-premise software?",
    answer: "Cloud-based (SaaS) is the right choice for 95% of clinics. It's cheaper upfront, gets automatic updates, is accessible from anywhere (home, mobile, satellite clinic), and has better security than a local server sitting in your clinic. On-premise only makes sense if you have consistently unreliable internet AND a local IT person who can maintain the server.",
  },
  {
    question: "What if my staff refuses to use new software?",
    answer: "This is common and entirely solvable. Involve staff in the selection process from day 1. Let them test the trial themselves. Show them specifically how the software makes THEIR job easier — \"you won't have to file papers anymore\" or \"you won't have to call every patient manually.\" The key is making them feel heard, not forced. Staff who participate in choosing are staff who participate in using.",
  },
  {
    question: "Can I negotiate pricing on clinic software?",
    answer: "Yes, especially for annual commitments. Most vendors offer 15-25% discount for annual billing. For multi-location clinics, ask for volume pricing. But a word of caution: don't let a small discount lock you into a 12-month contract before you've tested the software thoroughly with real patients. A 20% discount on a product you stop using after 3 months is a 100% waste.",
  },
  {
    question: "What's the one thing most clinic owners overlook when choosing software?",
    answer: "Support quality. Everyone evaluates features and pricing. Almost nobody evaluates support until it's 8 PM, the billing module is broken, and there are 5 patients waiting. Before buying, call the support number at an odd hour — say, 8:30 PM on a weekday — and see if they answer. That single call will tell you more about the company than any demo or sales pitch.",
  },
];

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Choose Clinic Management Software — The 10-Question Buyer's Guide",
  description: "The ultimate 10-question checklist for choosing clinic software in India. Avoid buying the wrong system. Written for clinic owners, by people who've evaluated 20+ systems.",
  datePublished: "2026-06-02",
  dateModified: "2026-06-02",
  author: {
    "@type": "Organization",
    name: "Doxxy",
  },
  publisher: {
    "@type": "Organization",
    name: "Doxxy",
    url: APP_URL,
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${APP_URL}/how-to-choose-clinic-software`,
  },
};

// --- PAGE SECTIONS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight max-w-5xl mx-auto">
      How to Choose Clinic Management Software Without Getting It Wrong
    </h1>
    <SectionSubtitle className="max-w-3xl">
      Most clinic owners spend more time choosing a phone than their practice software. This guide fixes that. 10 questions. 15 minutes. A decision you won&apos;t regret.
    </SectionSubtitle>
    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="#the-checklist">
          Get the Free Checklist <ClipboardList className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  </Section>
);

const CostOfChoosingWrong = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>The Real Cost of Choosing Wrong</SectionTitle>
    <SectionSubtitle className="mt-4">
      Most clinic owners don&apos;t realize the true cost of a bad software decision until it&apos;s too late. Here&apos;s what&apos;s at stake.
    </SectionSubtitle>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
      {[
        { label: "Migration Cost", value: "Rs 15,000-50,000", detail: "To move patient records from one system to another.", icon: Download },
        { label: "Training Cost", value: "2-4 Weeks", detail: "Of staff time to learn a new system from scratch.", icon: Users },
        { label: "Downtime Cost", value: "1-3 Days", detail: "Of disruption during the switchover period.", icon: Clock },
        { label: "The Real Number", value: "6-12 Months", detail: "Of wasted subscription, retraining, and frustration.", icon: AlertTriangle },
      ].map((item) => (
        <div key={item.label} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <item.icon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{item.label}</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{item.value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{item.detail}</p>
        </div>
      ))}
    </div>
    <div className="mt-10 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 text-center">
      <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
        Spend 15 minutes reading this guide. It saves you 6 months of regret.
      </p>
    </div>
  </Section>
);

const TenQuestionsSection = () => (
  <Section id="the-checklist">
    <SectionTitle>The 10 Questions Every Clinic Owner Should Ask</SectionTitle>
    <SectionSubtitle className="mt-4">
      Ask these questions during every demo. If the vendor hesitates, deflects, or answers vaguely, walk away. You owe it to your practice.
    </SectionSubtitle>

    <div className="mt-16 space-y-10">
      {tenQuestions.map((q) => (
        <div key={q.number} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 scroll-mt-24" id={`question-${q.number}`}>
          <div className="flex items-start gap-5">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center text-lg font-bold">
              {q.number}
            </div>
            <div className="flex-1 space-y-5">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-snug">
                {q.question}
              </h3>

              <div>
                <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">Why It Matters</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{q.why}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-3">What to Look For</h4>
                <ul className="space-y-2">
                  {q.lookFor.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Red Flag</h4>
                  <p className="text-red-600 dark:text-red-300 text-sm">{q.redFlag}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const ChecklistSummary = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50" id="checklist-summary">
    <SectionTitle>The 10-Question Checklist</SectionTitle>
    <SectionSubtitle className="mt-4">
      Screenshot this. Print it. Take it to every demo. If you answer NO to 3 or more of these, the software is not right for your clinic.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-16 bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800">
      <div className="space-y-4">
        {tenQuestions.map((q) => (
          <div key={q.number} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex-shrink-0 w-8 h-8 border-2 border-gray-300 dark:border-gray-500 rounded-lg flex items-center justify-center">
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{q.number}</span>
            </div>
            <div className="flex items-center gap-3 flex-1">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{q.question}</span>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold">YES</span>
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold">NO</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
        <p className="text-amber-800 dark:text-amber-200 text-sm font-semibold">
          If you answer NO to 3 or more of these, the software is not right for your clinic. Move on.
        </p>
      </div>
    </div>
  </Section>
);

const DecisionFramework = () => (
  <Section>
    <SectionTitle>How to Make the Final Decision</SectionTitle>
    <SectionSubtitle className="mt-4">
      You have the questions. Now here is the framework for turning answers into action. Follow these 5 steps.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-16 space-y-6">
      {[
        {
          step: 1,
          title: "Shortlist 3 options",
          description: "Use the 10 questions above to narrow your list to 3 candidates. Any more and you'll get overwhelmed. Any fewer and you don't have enough comparison points.",
        },
        {
          step: 2,
          title: "Sign up for free trials of all 3",
          description: "Start all trials in the same week so you compare them fairly. Don't stagger them — memory of the first will fade by the time you test the third.",
        },
        {
          step: 3,
          title: "Use each for 3-5 real patient visits",
          description: "Don't judge based on the demo or first 10 minutes. Use each software for actual consultations. Create real prescriptions. Generate real bills. The rough edges only show up with real use.",
        },
        {
          step: 4,
          title: "Ask your receptionist which one they prefer",
          description: "Not the doctor — the staff. Your receptionist will use the software 8 hours a day. You'll use it 30 minutes between patients. If your staff hates it, adoption fails, period.",
        },
        {
          step: 5,
          title: "Choose the one your staff likes best",
          description: "The best software is the one that actually gets used every day. A technically superior product that your staff resists is worse than a simpler product they embrace. Adoption beats features. Every time.",
        },
      ].map((item) => (
        <div key={item.step} className="flex items-start gap-5 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
            {item.step}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const CommonMistakes = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>5 Mistakes That Cost Clinic Owners 6-12 Months</SectionTitle>
    <SectionSubtitle className="mt-4">
      Learn from those who came before you. These mistakes are common, expensive, and entirely avoidable.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-16 space-y-6">
      {mistakes.map((mistake, index) => (
        <div key={mistake.title} className="flex items-start gap-5 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <mistake.icon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wider">Mistake #{index + 1}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{mistake.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{mistake.description}</p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const FAQSection = () => (
  <Section>
    <SectionTitle>Frequently Asked Questions</SectionTitle>
    <SectionSubtitle className="mt-4">
      The questions clinic owners ask us during demos — answered honestly, without the sales pitch.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-16 space-y-4">
      {faqs.map((faq) => (
        <details key={faq.question} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
          <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
            <span className="text-base font-semibold text-gray-900 dark:text-white pr-4">{faq.question}</span>
            <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-90" />
          </summary>
          <div className="px-6 pb-6">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
          </div>
        </details>
      ))}
    </div>
  </Section>
);

// --- MAIN PAGE COMPONENT ---

const HowToChooseClinicSoftware = () => {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <CostOfChoosingWrong />
      <TenQuestionsSection />
      <ChecklistSummary />
      <DecisionFramework />
      <CommonMistakes />
      <FAQSection />

      <SignupCTA
        heading="The 10 Questions Every Clinic Owner Should Ask Before Buying"
        description="Get the checklist. Ask us anything on WhatsApp — we'll answer honestly, even if Doxxy isn't the right fit for your specific case."
      />

      <Script
        id="article-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "How to Choose Clinic Software", url: `${APP_URL}/how-to-choose-clinic-software` },
        ]}
      />
    </div>
  );
};

export default HowToChooseClinicSoftware;
