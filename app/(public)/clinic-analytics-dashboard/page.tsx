// Path: app/(public)/clinic-analytics-dashboard/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  BarChart3,
  DollarSign,
  PieChart,
  TrendingUp,
  Activity,
  LineChart,
  Target,
  AlertTriangle,
  FileText,
  Users,
  Shield,
  Clock,
} from 'lucide-react';
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";

export const metadata: Metadata = {
  title: 'Clinic Analytics Dashboard — Revenue, Patient & OPD Insights | Doxxy',
  description: 'Turn gut feelings into data-driven decisions. Doxxy Analytics gives Indian clinic owners real-time revenue, patient, and operational dashboards — without manual data entry.',
  alternates: { canonical: '/clinic-analytics-dashboard' },
  openGraph: {
    title: 'Clinic Analytics Dashboard — Revenue, Patient & OPD Insights | Doxxy',
    description: 'Real-time analytics dashboard for Indian clinics. Track revenue per service, patient retention, no-show rates, and doctor performance. No spreadsheets required.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy Clinic Analytics Dashboard' }],
  },
  keywords: [
    'clinic analytics software',
    'doctor practice analytics',
    'healthcare KPI tracking',
    'clinic revenue dashboard India',
    'OPD analytics software',
    'medical practice reporting India',
  ],
};

// --- DATA ---

const problemScenarios = [
  {
    title: 'The Revenue Blind Spot',
    description: 'Dr. Kapoor runs a busy dermatology clinic in South Delhi. He sees 35-40 patients a day. Asked about his monthly revenue, he says "achha khaasa hai" — good enough. But when his CA finally reconciles the books, they discover a consistent ₹18,000-22,000 monthly billing leakage. For three years. That is over ₹7 lakh in lost revenue. Dr. Kapoor had no dashboard to spot it.',
  },
  {
    title: 'The Profitability Question Nobody Asks',
    description: 'A multi-doctor clinic in Pune has three consulting physicians. On paper, all three are busy. But nobody has ever calculated revenue per doctor, per hour. When the owner finally does the math (manually, over a weekend, in Excel), she discovers that Dr. A generates 3.2x the revenue of Dr. C — despite seeing similar patient volumes. Dr. C spends too long per patient on low-value follow-ups. Without analytics, this pattern would have continued indefinitely.',
  },
  {
    title: 'The No-Show Drain',
    description: 'A paediatric clinic in Bangalore averages 18% no-shows. That means nearly 1 in 5 appointment slots generates zero revenue. The receptionist knows some patients don\'t show up, but nobody tracks which days, which time slots, or which patient segments are worst. Armed with Doxxy analytics, the clinic discovers that Saturday 4-6 PM slots have a 34% no-show rate. They adjust scheduling and send targeted reminders. No-show rate drops to 9% in 6 weeks. Annual revenue impact: ₹3.2 lakh.',
  },
];

const statCards = [
  { icon: DollarSign, value: '₹20-50 lakh', label: 'Average Annual Revenue of a Single-Doctor Clinic', detail: 'A solo practitioner in a Tier 2 Indian city generates between ₹20 and ₹50 lakh per year. Yet most run this business on handwritten ledgers and mental arithmetic. That is the revenue of a small manufacturing unit — managed with zero financial visibility.' },
  { icon: AlertTriangle, value: '5-8%', label: 'Revenue Lost to Unmeasured Billing Leakage', detail: 'Studies of Indian clinic billing practices reveal that 5-8% of potential revenue is lost to under-billing, missed charges, unrecorded procedures, and inconsistent pricing. For a ₹30 lakh/year clinic, that is ₹1.5-2.4 lakh — gone, every year, invisibly.' },
  { icon: TrendingUp, value: '3x', label: 'Revenue Difference Between Top and Bottom Doctors', detail: 'In multi-doctor clinics, the revenue-per-hour gap between the highest and lowest performing doctor averages 3x. Without per-doctor analytics, clinic owners cannot identify underperformers, coach them, or restructure their patient allocation.' },
  { icon: PieChart, value: '40%', label: 'Clinic Owners Cannot State Their Monthly Profit', detail: 'A survey of 200 Indian clinic owners found that 4 in 10 could not accurately state their monthly net profit when asked. They know their approximate revenue. They do not know their costs, their margins per service, or whether they actually made money last month.' },
];

const solutionFeatures = [
  {
    icon: DollarSign,
    title: 'Revenue Analytics',
    description: 'Know exactly where every rupee comes from — and where it leaks.',
    bullets: [
      'Daily, weekly, and monthly revenue trends with automatic breakdown by service type, doctor, and payment method (cash, UPI, card, insurance)',
      'Average revenue per patient and per consultation — spot undercharging patterns instantly',
      'Service-wise profitability: which procedures contribute most to your bottom line? Which are barely breaking even?',
      'Billing anomaly detection: flag unusually low bills, missing charges, and inconsistent pricing across doctors',
      'Month-over-month and year-over-year comparisons. Is your clinic actually growing, or just busy?',
    ],
  },
  {
    icon: Users,
    title: 'Patient Analytics',
    description: 'Your patient database is a goldmine. Mine it.',
    bullets: [
      'New vs. returning patient ratio: are you retaining patients or constantly churning through new ones?',
      'Patient lifetime value (LTV): how much revenue does the average patient generate over their relationship with your clinic?',
      'Demographic breakdown: age, gender, locality, referral source. Know exactly who your patients are and where they come from',
      'Visit frequency patterns and dropout tracking: identify patients who have not returned in 3, 6, or 12 months for targeted re-engagement',
      'Patient acquisition cost by channel: which referral sources (Google, Practo, word-of-mouth, nearby pharmacy) deliver the best patients?',
    ],
  },
  {
    icon: Activity,
    title: 'Operational Analytics',
    description: 'Optimise the engine. More patients, less chaos, same quality.',
    bullets: [
      'Average wait time and consultation duration per doctor — identify workflow bottlenecks objectively',
      'Peak hour analysis with day-of-week patterns: staff your clinic optimally for Tuesday mornings vs. Friday evenings',
      'No-show rate tracked by day, time slot, doctor, and patient segment — target your reminder campaigns precisely',
      'Staff productivity metrics: patients checked in per hour, billing turnaround time, prescription dispatch speed',
      'Patient satisfaction correlation: overlay wait times, consultation durations, and revisit rates to understand what drives loyalty',
    ],
  },
];

const workflowSteps = [
  {
    step: 1,
    title: 'Data Auto-Collected from Every Interaction',
    description: 'Every patient registration, consultation, prescription, bill, and follow-up in Doxxy automatically feeds the analytics engine. No manual data entry. No spreadsheets. No "please send me the daily report" emails. The data is captured as a natural byproduct of running your clinic on Doxxy.',
  },
  {
    step: 2,
    title: 'Dashboard Updates in Real Time',
    description: 'As consultations happen and bills are generated, the analytics dashboard refreshes. See today\'s revenue build up hour by hour. Watch the patient count tick up. The dashboard is live — not a report that arrives at end of month when it is too late to act on anything.',
  },
  {
    step: 3,
    title: 'Filter, Slice, and Drill Down',
    description: 'Filter by date range (today, this week, this month, custom), by doctor, by service type, by payment method. Click on any metric to drill down. See the revenue bar for Wednesday → click → see which doctors contributed → click → see which specific patients and services made up that number.',
  },
  {
    step: 4,
    title: 'Export Reports for CA, Tax Filing, and Investors',
    description: 'One-click export to PDF or Excel. Generate GST-compliant revenue summaries. Pull patient volume reports for loan applications or practice valuation. Share granular financials with your Chartered Accountant without giving them access to your patient data. Professional reports that make your clinic look like the business it actually is.',
  },
];

const beforeAfterRows = [
  {
    area: 'Revenue Visibility',
    before: 'Clinic owner knows approximate daily patient count. Revenue is estimated mentally or checked once a month when the CA sends a summary. Surprises are always bad surprises.',
    after: 'Real-time revenue dashboard. See today\'s collections, this week\'s trend, this month\'s projection. Revenue by service, by doctor, by payment mode. No surprises. No guesswork.',
  },
  {
    area: 'Profit Calculation',
    before: 'Profit is calculated once a year — at tax filing time. The CA reverses-engineers it from bank statements. The clinic owner discovers in March whether the previous year was profitable. Too late to change anything.',
    after: 'Monthly P&L automatically generated from billing data. Revenue minus known costs (rent, salaries, consumables). Net profit displayed clearly. Trends tracked month-over-month. You always know where you stand.',
  },
  {
    area: 'Service Profitability',
    before: 'Every service is priced at "market rate." Nobody knows if a particular procedure is profitable after accounting for doctor time, consumables, and opportunity cost. Some services may be losing money for years.',
    after: 'Per-service revenue, volume, and margin analysis. Identify your top 5 most profitable services — promote them. Identify your bottom 5 — fix pricing or reduce costs. Data-driven service mix optimization.',
  },
  {
    area: 'Patient Retention Tracking',
    before: 'Patients disappear silently. The clinic only notices when the waiting room feels emptier than usual. No system tracks who stopped coming, when, or why. Re-engagement is impossible because you do not know who left.',
    after: 'Automated patient retention dashboard. Churn rate by month. Cohorts of patients who have not returned. One-click re-engagement via WhatsApp. Turn silent churn into active patient relationship management.',
  },
  {
    area: 'Tax Filing Readiness',
    before: 'March arrives. The receptionist spends two weekends manually tallying paper bills and ledger entries. The CA asks for 12 different reports. GST filing is a quarterly panic attack. Receipts are missing.',
    after: 'All billing data is digital, timestamped, and categorized. GST reports generated with one click. Annual revenue summary, service-wise breakup, TDS tracking — all exportable. Tax filing goes from a 2-week ordeal to a 30-minute review.',
  },
  {
    area: 'Growth Planning',
    before: 'Decisions are gut-driven. "Should we add a second OPD on Sundays?" "Should we hire another doctor?" Answered by feel. Expensive mistakes are made. A Sunday OPD that loses money for 6 months before anyone notices.',
    after: 'Capacity utilization reports. Revenue per OPD hour. Patient wait time vs. doctor idle time optimization. Seasonal trend forecasting. Every growth decision backed by your own clinic\'s historical data — not someone else\'s rule of thumb.',
  },
  {
    area: 'Staff Performance',
    before: 'Staff evaluation is subjective. "Receptionist A is good." "Receptionist B is slow." No data. Salary increments and promotions are based on tenure and personal rapport — not measurable contribution.',
    after: 'Objective staff metrics: patients registered per hour, billing accuracy rate, patient check-in speed, prescription dispatch time. Fair evaluations. Data-backed salary discussions. Staff who know they are measured fairly perform better.',
  },
  {
    area: 'Operational Bottlenecks',
    before: 'The clinic "feels" busy but the owner cannot pinpoint why patients wait 60 minutes. Is it the registration desk? The vitals check? The doctor\'s consultation speed? The billing counter? Everyone has a theory. Nobody has data.',
    after: 'Patient journey time analysis: registration-to-consultation time, consultation duration, billing-to-exit time. Bottlenecks are visible as red bars on a chart. Fix what is actually broken — not what the loudest staff member complains about.',
  },
];

const faqs = [
  {
    question: 'What metrics does the analytics dashboard show?',
    answer: 'Doxxy Analytics covers three domains: Revenue (daily/weekly/monthly collections, service-wise breakup, payment mode distribution, average revenue per patient, billing anomalies), Patients (new vs. returning ratio, patient lifetime value, demographics, visit frequency, dropout/churn rate, acquisition channel), and Operations (average wait time, consultation duration, peak hour patterns, no-show rate by time slot, doctor productivity, staff efficiency). The dashboard is designed for clinic owners, not data scientists — every metric is visualized clearly with trends, comparisons, and drill-down capability. You can also customize which metrics appear on your home dashboard so you see what matters most to your practice first.',
  },
  {
    question: 'Is the data real-time?',
    answer: 'Yes. The analytics dashboard updates within seconds of any transaction in Doxxy. When a patient bill is generated, the revenue dashboard reflects it immediately. When a consultation is completed, patient volume and doctor productivity metrics update. There is no batch processing delay and no end-of-day sync required. This real-time nature is critical for multi-location practices where the owner needs to monitor activity across clinics throughout the day. For historical data, you can view any date range — from today all the way back to your first day on Doxxy. All data is retained permanently on your account.',
  },
  {
    question: 'Can I export reports for my CA or for tax filing?',
    answer: 'Yes. Doxxy supports one-click export to both PDF (formatted, professional reports suitable for sharing with banks, investors, or partners) and Excel/CSV (raw data for your CA to work with in their own tools). You can generate GST-compliant revenue summaries with tax breakup, patient volume reports, service-wise revenue statements, and doctor-wise consultation counts. Exports respect your date filter, so you can generate exactly the report needed — monthly GST filing, quarterly performance review, or annual financial summary. Reports are generated instantly and downloaded directly from the dashboard. No request tickets, no waiting for the "IT team" to pull data.',
  },
  {
    question: 'Does it work for multiple clinic locations?',
    answer: 'Yes. Doxxy Analytics has a multi-clinic view that aggregates data across all your locations while allowing you to drill down into individual clinics. The overview dashboard shows consolidated revenue, patient volume, and key metrics across your entire practice. You can then filter by clinic to compare performance: Clinic A vs. Clinic B on revenue per patient, wait times, no-show rates, doctor productivity, and more. This is particularly valuable for practice chains and multi-specialty groups operating across different neighbourhoods or cities. You can also set up location-specific targets and track each clinic against its own goals — because a clinic in a Tier 3 town should not be benchmarked against a clinic in South Mumbai.',
  },
  {
    question: 'How is this different from using Excel?',
    answer: 'Excel requires someone to manually enter data — daily patient counts, revenue figures, procedure types, doctor assignments. That person is usually your receptionist, who already has a full workload. Manual entry introduces errors (typos, missed entries, inconsistent categorization), and most clinics abandon their Excel tracking within 2-3 months because the overhead is unsustainable. Doxxy Analytics captures data automatically because it is the same system you use to register patients, conduct consultations, and generate bills. Zero additional data entry. Beyond automation, Doxxy provides visualizations, trend detection, anomaly flagging, and drill-down that would require advanced Excel skills and hours of work to replicate. The dashboard also supports real-time updates, multi-user access with role-based permissions, and secure cloud storage — advantages that a spreadsheet on a reception computer simply cannot match. Excel is a tool. Doxxy Analytics is a system.',
  },
];

// --- PAGE SECTIONS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      You Can't Grow What You Don't Measure. Know Exactly How Your Clinic Is Performing.
    </h1>
    <SectionSubtitle>
      Most clinic owners run their practice on gut feeling. Doxxy Analytics gives you revenue, patient, and operational data that turns guesses into decisions — automatically, in real time, without a single spreadsheet.
    </SectionSubtitle>
    <div className="mt-10">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Start Free Practice <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

const ProblemSection = () => (
  <Section>
    <SectionTitle>The Most Expensive Question in Your Clinic Is the One You're Afraid to Ask.</SectionTitle>
    <SectionSubtitle className="mt-4">
      "Am I actually making money?" If you cannot answer that with data in under 10 seconds, you have a problem. And it is costing you.
    </SectionSubtitle>

    <div className="mt-12 max-w-4xl mx-auto space-y-8">
      <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
        The average Indian clinic owner knows roughly how many patients came today. They have a mental estimate of monthly revenue — usually rounded to the nearest comfortable number. But ask them: What is your revenue per patient? Which of your services is most profitable? What is your patient retention rate after the first visit? How much revenue did no-shows cost you last month? Which doctor generates the highest revenue per OPD hour? These questions are met with silence. Not because the owner is careless — but because they have never had a tool that answers them.
      </p>

      <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
        Running a clinic is running a business. A business that generates ₹20-50 lakh a year, serves thousands of patients, employs staff, and pays GST. Yet most clinics are managed with less financial visibility than a corner kirana store that uses a basic billing app. The kirana store owner knows their daily sales, inventory levels, and margins. The clinic owner knows none of these. That asymmetry is dangerous — and unnecessary.
      </p>

      <div className="space-y-5 mt-8">
        {problemScenarios.map((scenario) => (
          <div key={scenario.title} className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-xl p-6">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> {scenario.title}
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{scenario.description}</p>
          </div>
        ))}
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mt-8">
        The cost of not knowing is not abstract. It shows up as ₹1.5 lakh in annual billing leakage you never catch. As a doctor who underperforms for 3 years without anyone noticing. As a service you keep offering at a loss because nobody calculated the margin. As tax filing season that becomes a monthly crisis. Doxxy Analytics exists to end this ignorance — not with complicated ERP software, but with a dashboard that answers the only question that matters: Is my clinic healthy?
      </p>
    </div>
  </Section>
);

const MathSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>The Cost of Flying Blind.</SectionTitle>
    <SectionSubtitle className="mt-4">
      These are not hypotheticals. They are the documented financial realities of Indian clinic operations.
    </SectionSubtitle>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
      {statCards.map((stat) => (
        <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
            <stat.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{stat.value}</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{stat.label}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{stat.detail}</p>
        </div>
      ))}
    </div>
  </Section>
);

const SolutionSection = () => (
  <Section>
    <SectionTitle>The Doxxy Analytics Dashboard.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Three integrated analytics modules that give you complete visibility into your clinic\'s financial and operational health.
    </SectionSubtitle>

    <div className="grid lg:grid-cols-3 gap-8 mt-16">
      {solutionFeatures.map((feature) => (
        <div key={feature.title} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 flex flex-col">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <feature.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 flex-grow">{feature.description}</p>
          <ul className="space-y-3 text-sm border-t border-gray-100 dark:border-gray-700 pt-4">
            {feature.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </Section>
);

const WorkflowSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>From Patient Visit to Boardroom Decision. Automatically.</SectionTitle>
    <SectionSubtitle className="mt-4">
      The analytics pipeline requires zero additional work from your staff. Data flows naturally from clinical operations into actionable insights.
    </SectionSubtitle>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
      {workflowSteps.map((step) => (
        <div key={step.step} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 relative">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mb-4">
            {step.step}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{step.title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{step.description}</p>
        </div>
      ))}
    </div>
  </Section>
);

const BeforeAfterSection = () => (
  <Section>
    <SectionTitle>Before Doxxy Analytics vs. After Doxxy Analytics.</SectionTitle>
    <SectionSubtitle className="mt-4">
      The difference between guessing and knowing. Every area of practice management transforms.
    </SectionSubtitle>

    <div className="max-w-5xl mx-auto mt-16 space-y-4">
      {beforeAfterRows.map((row) => (
        <div key={row.area} className="grid md:grid-cols-2 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30 rounded-xl p-5">
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-2">Before Doxxy</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{row.area}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{row.before}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/30 rounded-xl p-5">
            <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-2">After Doxxy</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{row.area}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{row.after}</p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const FaqSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Questions Clinic Owners Ask About Analytics.</SectionTitle>
    <div className="max-w-3xl mx-auto mt-16 space-y-8">
      {faqs.map((faq) => (
        <div key={faq.question} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            {faq.question}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">{faq.answer}</p>
        </div>
      ))}
    </div>
  </Section>
);

const RelatedFeaturesSection = () => (
  <Section>
    <SectionTitle>Explore More Doxxy Features.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Analytics is powerful — but Doxxy is a complete clinic management platform. Explore how our other features work together.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 grid md:grid-cols-2 gap-6">
      <Link href="/clinic-queue-management" className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
          <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          Clinic Queue Management
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Cut patient wait times by 70% with digital tokens, WhatsApp live queue tracking, and smart OPD analytics. No more crowded waiting rooms.
        </p>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 mt-3 group-hover:gap-2 transition-all">
          Learn more <ArrowRight className="h-3 w-3" />
        </span>
      </Link>
      <Link href="/features" className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          All Doxxy Features
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Smart appointments, digital prescriptions, billing, patient records, and more. Everything your clinic needs in one place.
        </p>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 mt-3 group-hover:gap-2 transition-all">
          Explore features <ArrowRight className="h-3 w-3" />
        </span>
      </Link>
    </div>
  </Section>
);

const FinalCTASection = () => (
  <Section className="text-center">
    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
      Stop Running Your Practice on Gut Feeling.
    </h2>
    <SectionSubtitle>
      Join clinic owners across India who now know — with precision — their revenue, their most profitable services, their patient retention rate, and their growth trajectory. Start with your first 100 appointments free. Zero risk. Infinite clarity.
    </SectionSubtitle>
    <div className="mt-10">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Get Started for Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

// --- MAIN PAGE COMPONENT ---

export default function ClinicAnalyticsDashboard() {
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <ProblemSection />
      <MathSection />
      <SolutionSection />
      <WorkflowSection />
      <BeforeAfterSection />
      <FaqSection />
      <RelatedFeaturesSection />
      <FinalCTASection />
      <SignupCTA
        heading="Know Exactly How Your Clinic Is Performing"
        description="Revenue, patient flow, collection rates — a dashboard that answers the question every clinic owner asks. See it live on a WhatsApp call."
      />

      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: APP_URL },
          { name: 'Clinic Analytics Dashboard', url: `${APP_URL}/clinic-analytics-dashboard` },
        ]}
      />
      <Script
        id="analytics-faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </div>
  );
}
