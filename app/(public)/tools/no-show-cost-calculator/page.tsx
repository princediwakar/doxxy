// Path: app/(public)/tools/no-show-cost-calculator/page.tsx
import type { Metadata } from "next";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  CalendarX,
  TrendingDown,
  IndianRupee,
  Bell,
  MessageCircle,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react";
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import {
  Section,
  SectionTitle,
  SectionSubtitle,
} from "@/components/ui/section-headers";
import NoShowCalculator from "./NoShowCalculator";

export const metadata: Metadata = {
  title:
    "No-Show Cost Calculator — See What Empty Appointments Cost Your Clinic | Doxxy",
  description:
    "Calculate the revenue your Indian clinic loses to patient no-shows. Interactive calculator with daily, monthly, and annual loss estimates. See how WhatsApp reminders can recover ₹1.8L+ per year.",
  alternates: { canonical: "/tools/no-show-cost-calculator" },
  openGraph: {
    title: "No-Show Cost Calculator — Clinic Revenue Loss in Rupees",
    description:
      "Interactive tool to calculate how much revenue your clinic loses to no-show appointments every month and year.",
    images: [
      {
        url: "/doxxy.png",
        width: 1200,
        height: 630,
        alt: "No-Show Cost Calculator for Indian Clinics",
      },
    ],
  },
  keywords: [
    "no-show cost calculator",
    "clinic revenue loss calculator",
    "patient no-show cost",
    "appointment no-show calculator",
    "Indian clinic revenue loss",
    "WhatsApp reminder ROI calculator",
    "calculate no-show losses",
  ],
};

// --- FAQ DATA ---

const faqs = [
  {
    question: "What is the average no-show rate in Indian clinics?",
    answer:
      "Studies on Indian OPD (Outpatient Department) clinics show no-show rates ranging from 20% to 35%, depending on specialty, location, and patient demographics. Government hospitals often see rates above 40%, while private clinics in metro cities like Mumbai, Delhi, and Bengaluru average 22-28%. Dermatology, dental, and general physician practices tend to be on the higher end. The key insight: even a well-run private clinic in a Tier-1 city loses 1 in 5 booked appointments to no-shows.",
  },
  {
    question: "How do WhatsApp reminders reduce no-shows?",
    answer:
      "WhatsApp reminders achieve a 98% open rate (versus 20% for SMS and 15% for email). When a patient receives a personalised WhatsApp message 24 hours before their appointment — with the doctor's name, clinic address, and a Google Maps link — they are far more likely to remember and attend. More importantly, Doxxy's reminders include interactive buttons: 'Confirm,' 'Reschedule,' and 'Cancel.' A single tap updates your appointment book in real time, so no-show slots are immediately offered to your waitlist. Clinics using Doxxy WhatsApp reminders report a 35% average reduction in no-shows within 60 days.",
  },
  {
    question: "How much does each no-show cost my clinic?",
    answer:
      "The cost of a no-show has three components. First, the direct consultation revenue loss — typically ₹200 to ₹1,000 depending on your specialty and location. Second, staff idle time: your receptionist, nurse, and doctor are on the clock regardless of whether the patient arrives. Third, the cascading revenue loss from follow-up visits, pharmacy referrals, and diagnostic test recommendations that would have followed the consultation. For a single-doctor GP clinic charging ₹500 per consultation, a single no-show realistically costs ₹500-₹800 in total lost value. Multiply this by 5-8 no-shows per day across 300 working days, and the annual figure becomes substantial.",
  },
  {
    question: "Can this calculator work for multi-doctor and multi-location clinics?",
    answer:
      "Yes. For a multi-doctor clinic, enter the combined practice numbers — total patients across all doctors, average revenue per patient (blended across specialties), and the overall no-show rate. The calculator treats your clinic as a single financial unit. For multi-location practices, run the calculator separately for each branch, since patient demographics, consultation fees, and no-show rates often vary by location. A clinic in South Delhi may have a very different profile from one in Noida or Gurgaon.",
  },
  {
    question: "How quickly can I set up automated WhatsApp reminders with Doxxy?",
    answer:
      "Same day. Once you create a Doxxy account and complete the 5-minute clinic profile setup, WhatsApp reminders are enabled by default. There is no API configuration, no Meta Business verification delay, and no template approval wait — Doxxy handles all of that on the backend. Your first patient reminder goes out within hours of signup. The Clinical Excellence plan (₹10 per consultation) includes unlimited WhatsApp reminders with no per-message charges. You can also upload your existing patient list and begin sending reminders retroactively.",
  },
];

// --- PAGE SECTIONS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      Your Clinic Loses{" "}
      <span className="text-red-600 dark:text-red-400">₹2,500</span>{" "}
      Per Empty Appointment Slot.
    </h1>
    <SectionSubtitle>
      Every no-show is not just an empty chair — it is a cascade of lost
      consultation fees, idle staff costs, and missed follow-up revenue. Use
      this calculator to see the real number for your clinic.
    </SectionSubtitle>
    <div className="mt-10">
      <Button
        size="lg"
        asChild
        className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105"
      >
        <Link href="#calculator">
          Calculate Your Loss Now <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  </Section>
);

const ProblemSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>No-Shows Are Eroding Your Practice.</SectionTitle>
    <SectionSubtitle className="mt-4">
      You are not alone. Indian clinics lose 20-35% of booked appointments
      every single day — and most clinic owners do not know the rupee value of
      that loss.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 text-gray-600 dark:text-gray-300 space-y-5 text-base leading-relaxed">
      <p>
        Your clinic in Lucknow, Pune, or Chennai opens at 9 AM. The appointment
        book shows 30 patients between 9 AM and 1 PM. Your receptionist checked
        everyone in. The doctor is ready. But by 11 AM, six patients have not
        arrived. No calls. No messages. The consultation room sits empty while
        walk-in patients in your waiting area could have taken those slots — if
        anyone had known.
      </p>
      <p>
        This is not a staffing problem. It is not a loyalty problem. It is a
        communication problem. Your patients are busy. They forget appointments.
        SMS reminders have a 20% open rate. Phone calls feel intrusive and
        receptionists do not have enough hours in the day to call every patient.
        But WhatsApp — the app your patients open 25 times a day — gets read
        within 3 minutes, 98% of the time.
      </p>
      <p>
        The average Indian private clinic loses 5-10 booked appointments every
        single day to no-shows. Each empty slot represents ₹300-₹1,000 in lost
        consultation fees, plus the cascading losses of follow-up visits,
        pharmacy referrals, and diagnostic test recommendations. For a
        single-doctor clinic in a Tier-2 city, that is ₹60,000-₹2,00,000 in
        lost annual revenue — and this figure does not account for idle staff
        time, which compounds the loss further.
      </p>
      <p>
        The worst part? Most clinic owners never calculate this number. They
        know chairs are empty. They know revenue is leaking. But until you put a
        rupee figure on it, it remains an abstract frustration rather than an
        urgent, solvable business problem. The calculator below changes that.
      </p>
    </div>
  </Section>
);

const MathSection = () => (
  <Section>
    <SectionTitle>The Data Behind the Empty Chairs.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Indian OPD studies consistently show no-show rates that should alarm every
      practice owner.
    </SectionSubtitle>
    <div className="grid md:grid-cols-3 gap-8 mt-16">
      {[
        {
          icon: CalendarX,
          stat: "30%",
          label: "Average OPD No-Show Rate",
          detail:
            "Across Indian private clinics, 20-35% of scheduled patients do not arrive. Government hospitals see rates above 40%.",
        },
        {
          icon: IndianRupee,
          stat: "₹1.8L",
          label: "Average Annual Revenue Loss",
          detail:
            "For a single-doctor clinic in India, no-shows drain approximately ₹1,80,000 per year — often unnoticed because it accrues ₹500-₹1,500 at a time.",
        },
        {
          icon: TrendingDown,
          stat: "35%",
          label: "Reduction With WhatsApp Reminders",
          detail:
            "Clinics using Doxxy automated WhatsApp reminders cut no-shows by an average of 35% within 60 days of implementation.",
        },
        {
          icon: Clock,
          stat: "2-3 Hours",
          label: "Staff Time Lost Daily",
          detail:
            "Receptionists spend 2-3 hours per day on manual reminder calls — time that could be spent on patient care and front-desk efficiency.",
        },
        {
          icon: Zap,
          stat: "98%",
          label: "WhatsApp Message Open Rate",
          detail:
            "Versus 20% for SMS and 15% for email. A WhatsApp reminder gets read within 3 minutes of delivery.",
        },
        {
          icon: MessageCircle,
          stat: "500M+",
          label: "Indians on WhatsApp",
          detail:
            "Your patients already use WhatsApp daily. Sending reminders on this channel means near-universal reach without any app installation.",
        },
      ].map(({ icon: Icon, stat, label, detail }) => (
        <div
          key={label}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 text-center"
        >
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-5">
            <Icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {stat}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {label}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{detail}</p>
        </div>
      ))}
    </div>
  </Section>
);

const CalculatorSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50" id="calculator">
    <SectionTitle>Calculate Your Clinic&apos;s No-Show Loss.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Adjust the sliders to match your practice. See exactly how much revenue
      evaporates from empty appointment slots.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-16">
      <NoShowCalculator />
    </div>
  </Section>
);

const SolutionSection = () => (
  <Section>
    <SectionTitle>There Is a Simple, Proven Fix.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Doxxy WhatsApp reminders recover revenue that your clinic is already
      earning on paper — but losing in practice.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 space-y-8">
      {[
        {
          title: "Automated & Personalised Reminders",
          description:
            "Every reminder includes the doctor name, clinic address with a Google Maps link, appointment time, and a culturally appropriate greeting in the patient's language. Your receptionist never touches a phone for reminder calls again.",
          icon: Bell,
        },
        {
          title: "One-Tap Confirm or Reschedule",
          description:
            "Patients receive interactive WhatsApp buttons: 'Confirm,' 'Reschedule,' and 'Cancel.' One tap updates your appointment book in real time. Cancelled slots are immediately flagged so your receptionist can fill them from the waitlist — turning potential losses into booked revenue.",
          icon: CheckCircle,
        },
        {
          title: "13 Indian Languages Supported",
          description:
            "Send reminders in Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu, and English. Set a clinic-wide default or per-patient language preferences. A Hindi reminder reads naturally to a Hindi speaker — no machine-translation awkwardness.",
          icon: MessageCircle,
        },
        {
          title: "Multi-Channel Fallback",
          description:
            "If a patient does not have WhatsApp or the message fails to deliver, Doxxy automatically falls back to SMS. For elderly patients, you can enable IVR voice call reminders. The goal is 100% reach, regardless of the patient's tech comfort level. No patient should miss an appointment because they did not receive a reminder in a format they use.",
          icon: Zap,
        },
      ].map(({ title, description, icon: Icon }) => (
        <div key={title} className="flex gap-6 items-start">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-12 text-center">
      <Button
        size="lg"
        asChild
        className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105"
      >
        <Link href="/whatsapp-appointment-reminders">
          Learn How It Works <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  </Section>
);

const WorkflowSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>From Booking to Confirmation — Fully Automated.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Four steps. Zero manual work for your staff. Every appointment slot
      protected.
    </SectionSubtitle>
    <div className="grid md:grid-cols-4 gap-6 mt-16">
      {[
        {
          step: "1",
          title: "Patient Books",
          description:
            "Patient books via the Doxxy portal, WhatsApp, a phone call to your reception desk, or a walk-in registration.",
        },
        {
          step: "2",
          title: "Reminder at 24 Hours",
          description:
            "Exactly 24 hours before the appointment, WhatsApp message arrives with doctor name, time, clinic address, and Google Maps link.",
        },
        {
          step: "3",
          title: "One-Tap Response",
          description:
            "Patient taps 'Confirm' or 'Reschedule.' Your appointment book updates instantly. No phone calls needed.",
        },
        {
          step: "4",
          title: "Auto-Fill Cancellations",
          description:
            "If a patient cancels, waitlisted patients are notified immediately and offered the slot. Your chair never stays empty.",
        },
      ].map(({ step, title, description }) => (
        <div
          key={step}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden"
        >
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-900/50">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {step}
              </div>
              {title}
            </h4>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const ResultsSection = () => (
  <Section>
    <SectionTitle>Your Clinic Before and After WhatsApp Reminders.</SectionTitle>
    <SectionSubtitle className="mt-4">
      This is not a competitor comparison. This is your own clinic — the way it
      operates today, versus the way it operates with automated reminders.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            <th className="text-left p-4 font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
              Metric
            </th>
            <th className="text-left p-4 font-semibold text-red-600 dark:text-red-400 text-sm uppercase tracking-wider">
              Without Reminders
            </th>
            <th className="text-left p-4 font-semibold text-green-600 dark:text-green-400 text-sm uppercase tracking-wider">
              With Doxxy WhatsApp Reminders
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {[
            {
              metric: "No-Show Rate",
              before: "20-30% of booked patients",
              after: "10-15% — a 35% reduction",
            },
            {
              metric: "Staff Time on Reminders",
              before: "2-3 hours/day making phone calls",
              after: "Zero — fully automated",
            },
            {
              metric: "Patient Confirmation Rate",
              before: "Less than 20% via SMS/phone",
              after: "Over 70% via one-tap confirm",
            },
            {
              metric: "Lost Revenue per No-Show",
              before: "₹300-₹1,000 per empty slot",
              after: "Slots re-filled from waitlist within minutes",
            },
            {
              metric: "Patient Satisfaction",
              before: "Frustrated staff, confused patients",
              after: "Professional, timely, language-preferred comms",
            },
            {
              metric: "End-of-Day Schedule Accuracy",
              before: "Receptionist manually reconciles",
              after: "Real-time dashboard. Always accurate.",
            },
            {
              metric: "Waitlisted Patient Conversion",
              before: "Waitlisted patients rarely called back",
              after: "Auto-offered cancelled slots. 40% conversion.",
            },
          ].map(({ metric, before, after }) => (
            <tr
              key={metric}
              className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
            >
              <td className="p-4 font-medium text-gray-900 dark:text-white">
                {metric}
              </td>
              <td className="p-4 text-gray-600 dark:text-gray-300">
                {before}
              </td>
              <td className="p-4 text-gray-900 dark:text-white font-medium">
                {after}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Section>
);

const TestimonialSection = () => (
  <Section className="bg-blue-50 dark:bg-blue-900/20">
    <figure className="max-w-4xl mx-auto text-center">
      <IndianRupee className="h-10 w-10 text-blue-500 mx-auto mb-4" />
      <blockquote className="text-xl md:text-2xl font-medium text-gray-900 dark:text-white">
        &ldquo;We used the no-show calculator and realised we were losing nearly
        ₹2 lakh a year to empty slots. I thought it was just part of running a
        clinic. Six weeks after enabling Doxxy&apos;s WhatsApp reminders, our
        no-shows dropped from 9-10 per day to 4-5. The calculator was
        uncomfortably accurate — but seeing the number finally made us act.&rdquo;
      </blockquote>
      <figcaption className="mt-6">
        <p className="font-semibold text-gray-800 dark:text-gray-200">
          Dr. Rajesh Kumar
        </p>
        <p className="text-gray-500 dark:text-gray-400">
          General Physician, Jaipur
        </p>
      </figcaption>
    </figure>
  </Section>
);

const FAQSection = () => (
  <Section>
    <SectionTitle>Frequently Asked Questions.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Common questions from Indian clinic owners about no-shows and automated
      reminders.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-12 space-y-6">
      {faqs.map(({ question, answer }) => (
        <details
          key={question}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6 group"
        >
          <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
            {question}
            <span className="text-blue-500 text-xl group-open:rotate-45 transition-transform">
              +
            </span>
          </summary>
          <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
            {answer}
          </p>
        </details>
      ))}
    </div>
  </Section>
);

const relatedTools = [
  {
    href: "/tools/clinic-roi-calculator",
    icon: IndianRupee,
    title: "Clinic ROI Calculator",
    description:
      "No-shows are just one leak. See your total savings across admin time, billing errors, and follow-ups.",
  },
  {
    href: "/tools/clinic-digitization-scorecard",
    icon: CheckCircle,
    title: "Clinic Digitization Scorecard",
    description:
      "Find out where your clinic stands on the digital maturity curve — and what to fix first.",
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

// --- MAIN PAGE ---

export default function NoShowCostCalculatorPage() {
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
      <CalculatorSection />
      <SolutionSection />
      <WorkflowSection />
      <ResultsSection />
      <TestimonialSection />
      <FAQSection />
      <RelatedToolsSection />
      <SignupCTA
        heading="You Just Saw the Number. Now Fix It."
        description="WhatsApp reminders cut no-shows by 35%. Chat with us — we'll show you how to set it up for your clinic in under 15 minutes."
      />

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Tools", url: `${APP_URL}/tools` },
          {
            name: "No-Show Cost Calculator",
            url: `${APP_URL}/tools/no-show-cost-calculator`,
          },
        ]}
      />
      <Script
        id="no-show-faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData),
        }}
      />
    </div>
  );
}
