import { Button } from "@/components/ui/button";
import Script from "next/script";
import {
  Check,
  Users,
  Shield,
  Phone,
  Clock,
  Award,
  ArrowRight,
  DollarSign,
  Wallet,
  BarChart3,
} from "lucide-react";
import Link from "next/link"
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doxxy Pricing - Transparent Clinic Management Software Pricing',
  description: 'Fair and transparent pricing for clinic management software. Pay per consultation with no hidden fees. First 100 appointments free.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Doxxy Pricing - Clinic Management Software',
    description: 'Transparent pricing for modern healthcare practices',
    images: [
      {
        url: '/doxxy.png',
        width: 1200,
        height: 630,
        alt: 'Doxxy Pricing Overview',
      },
    ],
  },
  keywords: ['clinic management software pricing', 'medical practice software cost', 'healthcare software pricing', 'pay per consultation'],
}

// --- DATA ---
const plans = [
  {
    name: "Practice Essentials",
    description: "Perfect for new practices. First 100 appointments free.",
    price: "Free",
    priceSuffix: "for first 100 appointments",
    features: [
      "Unlimited doctors & clinic staff",
      "Appointment scheduling (up to 100 total)",
      "Essential patient records & prescriptions",
      "Basic clinical reports & analytics",
    ],
    cta: "Start Free Practice",
    popular: false,
  },
  {
    name: "Clinical Excellence",
    description:
      "For established clinics. Premium features at special pricing.",
    price: "₹10",
    priceSuffix: "/consultation",
    originalPrice: "₹20",
    features: [
      "Everything in Essentials, plus:",
      "Unlimited appointments with smart scheduling",
      "Comprehensive EMR with digital prescriptions",
      "Patient reminders via SMS & WhatsApp",
      "Clinical analytics & practice insights",
      "Priority 24/7 support for doctors",
    ],
    cta: "Claim Special Offer",
    popular: true,
  },
];

const advantages = [
  {
    icon: DollarSign,
    title: "Pay For What You Use",
    description:
      "Our per-consultation pricing means you only pay for actual consultations. No wasted resources during slow months.",
  },
  {
    icon: Users,
    title: "No Per-Doctor Fees",
    description:
      "Other platforms charge per doctor. We allow unlimited doctors and staff on all plans, so your costs don't scale with your team.",
  },
  {
    icon: Wallet,
    title: "No Annual Commitments",
    description:
      "We don't believe in long-term contracts. Scale up or down as needed, with the flexibility to adjust to your practice's needs.",
  },
];

const comparisons = [
  {
    feature: "Pricing Model",
    us: "Per consultation (₹10)",
    competitors: "Monthly subscription + per doctor fees",
  },
  {
    feature: "Free Plan",
    us: "First 100 appointments free",
    competitors: "14-30 day time-limited trial",
  },
  {
    feature: "Doctor Limits",
    us: "Unlimited doctors on all plans",
    competitors: "Pay per doctor/provider",
  },
  {
    feature: "Contract Length",
    us: "No commitment, cancel anytime",
    competitors: "Annual contracts with penalties",
  },
  {
    feature: "Hidden Fees",
    us: "None, all features included",
    competitors: "Setup, training, and support fees",
  },
];

const trustIndicators = [
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "Data is encrypted in transit and at rest.",
  },
  {
    icon: Clock,
    title: "99.9% Uptime",
    description: "Reliable service you can count on, day and night.",
  },
  {
    icon: Phone,
    title: "24/7 Support",
    description: "Round-the-clock assistance whenever you need it.",
  },
  {
    icon: Award,
    title: "Industry Recognized",
    description: "Trusted by leading healthcare professionals in India.",
  },
];

const faqs = [
  {
    question: "Is there a free plan?",
    answer:
      "Yes! Our Practice Essentials plan is completely free for your first 100 appointments. You can explore all essential features with no credit card required.",
  },
  {
    question: "What happens when I reach 100 appointments on the free plan?",
    answer:
      "After your first 100 appointments, you'll automatically transition to our pay-as-you-go model at ₹10 per consultation. There's no interruption in service.",
  },
  {
    question: "Are there any limits on doctors or staff members?",
    answer:
      "No. Unlike other platforms that charge per provider, Doxxy allows unlimited doctors and staff members on all plans, including our free Practice Essentials plan.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, bank transfers, and for Indian customers, we also accept UPI, net banking, and digital wallets.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, we use bank-level encryption for all data. Your data is stored in secure data centers with regular backups and is compliant with Indian healthcare data laws.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, you can cancel your subscription at any time. We don't believe in long-term contracts or cancellation fees.",
  },
];

// --- PAGE SECTIONS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      Pricing That Makes Sense.
    </h1>
    <SectionSubtitle>
      No hidden fees, no per-doctor charges, and no complex tiers. Just fair,
      transparent pricing that scales with your practice.
    </SectionSubtitle>
    <div className="mt-10">
      <Button
        size="lg"
        asChild
        className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105"
      >
        <Link href="/auth">
          Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  </Section>
);

const PricingCardsSection = () => (
  <Section>
    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-start">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`bg-white dark:bg-gray-800/50 rounded-2xl p-8 border ${
            plan.popular
              ? "border-blue-500"
              : "border-gray-200/75 dark:border-gray-700/50"
          }`}
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {plan.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2 mb-6">
            {plan.description}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              {plan.price}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {plan.priceSuffix}
            </span>
            {plan.originalPrice && (
              <span className="text-gray-400 dark:text-gray-500 line-through">
                {plan.originalPrice}
              </span>
            )}
          </div>
          <Button
            asChild
            className={`w-full mt-8 ${
              plan.popular
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            } rounded-lg py-3`}
          >
            <Link href="/auth">{plan.cta}</Link>
          </Button>
          <ul className="space-y-3 mt-8 text-sm">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
              >
                <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </Section>
);

const AdvantagesSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>The Doxxy Pricing Advantage.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Our innovative model gives your practice more flexibility and better
      value.
    </SectionSubtitle>
    <div className="grid md:grid-cols-3 gap-8 mt-16">
      {advantages.map((advantage) => (
        <div key={advantage.title}>
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
            <advantage.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {advantage.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {advantage.description}
          </p>
        </div>
      ))}
    </div>
  </Section>
);

const ComparisonTableSection = () => (
  <Section>
    <SectionTitle>How We Compare.</SectionTitle>
    <SectionSubtitle className="mt-4">
      See how our philosophy stacks up against traditional software pricing
      models.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-16">
      <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200/75 dark:border-gray-700/50">
        {comparisons.map((item, index: number) => (
          <div
            key={item.feature}
            className={`grid grid-cols-3 gap-4 p-4 ${
              index < comparisons.length - 1
                ? "border-b border-gray-200/75 dark:border-gray-700/50"
                : ""
            }`}
          >
            <div className="font-medium text-gray-800 dark:text-gray-200">
              {item.feature}
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Check className="h-4 w-4 text-blue-500" />
              {item.us}
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              {item.competitors}
            </div>
          </div>
        ))}
      </div>
    </div>
  </Section>
);

const TestimonialSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <figure className="max-w-4xl mx-auto text-center">
      <BarChart3 className="h-10 w-10 text-blue-500 mx-auto mb-4" />
      <blockquote className="text-xl md:text-2xl font-medium text-gray-900 dark:text-white">
        "After switching from a subscription-based platform that charged per
        doctor, we're saving over 40% with Doxxy's per-appointment model. The
        best part is we only pay for what we actually use."
      </blockquote>
      <figcaption className="mt-6">
        <p className="font-semibold text-gray-800 dark:text-gray-200">
          Dr. Meera Sharma
        </p>
        <p className="text-gray-500 dark:text-gray-400">
          Family Medicine Practice, Bengaluru
        </p>
      </figcaption>
    </figure>
  </Section>
);

const TrustIndicatorsSection = () => (
  <Section>
    <div className="grid md:grid-cols-4 gap-8 text-center">
      {trustIndicators.map((indicator) => (
        <div key={indicator.title} className="flex flex-col items-center">
          <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4">
            <indicator.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {indicator.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {indicator.description}
          </p>
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

const Pricing = () => {
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
      <PricingCardsSection />
      <AdvantagesSection />
      <ComparisonTableSection />
      <TestimonialSection />
      <TrustIndicatorsSection />
      <FaqSection />
      <SignupCTA />

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Pricing", url: `${APP_URL}/pricing` },
        ]}
      />
      <Script
        id="pricing-faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </div>
  );
};

export default Pricing;
