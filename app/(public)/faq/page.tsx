/* eslint-disable react-refresh/only-export-components */
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Phone,
  BookOpen,
  Users,
  CreditCard,
  Shield,
  Settings,
  Zap,
} from "lucide-react";
import Link from "next/link"
import SignupCTA from "@/components/SignupCTA";
import SiteFooter from "@/components/SiteFooter";

// --- DATA ---
const categories = [
  { id: "general", name: "General", icon: BookOpen },
  { id: "getting-started", name: "Getting Started", icon: Zap },
  { id: "billing", name: "Billing & Pricing", icon: CreditCard },
  { id: "security", name: "Security & Privacy", icon: Shield },
  { id: "technical", name: "Technical Support", icon: Settings },
  { id: "integration", name: "Integration", icon: Users },
];

const faqs = [
  {
    category: "general",
    question: "What is Doxxy and how does it help healthcare practices?",
    answer:
      "Doxxy is a cloud-based clinic-management platform built for outpatient practices. It combines patient registration, queue & appointment scheduling, digital prescriptions, basic reporting, and multi-clinic administration in a single, easy-to-use interface.",
  },
  {
    category: "general",
    question: "Which types of healthcare practices can use Doxxy?",
    answer:
      "Doxxy is perfectly designed for small to medium-sized clinics and practices. Our platform offers the ideal balance of powerful features and simplicity that small clinics need without the complexity and cost of enterprise systems. While it can scale to larger organizations, Doxxy truly shines in environments with 1-10 doctors where efficiency and affordability are key priorities.",
  },
  {
    category: "getting-started",
    question: "How quickly can I get started with Doxxy?",
    answer:
      "Sign-up takes less than five minutes—no credit card required. The Practice Essentials plan gives you access to all essential features for your first 100 appointments so you can experience the platform before upgrading.",
  },
  {
    category: "getting-started",
    question: "Do you provide training for my staff?",
    answer:
      "Yes! We offer comprehensive training programs including live training sessions, video tutorials, documentation, and ongoing support. Our training covers all aspects of the platform and can be customized for different roles in your practice.",
  },
  {
    category: "getting-started",
    question: "Can you migrate data from our existing system?",
    answer:
      'Yes. We support CSV import for patients, visits, and prescriptions. A guided wizard helps you map columns—no expensive "data-migration package" required.',
  },
  {
    category: "billing",
    question: "What are your pricing plans?",
    answer:
      "Doxxy keeps pricing simple:\n• Practice Essentials – FREE for the first 100 lifetime appointments.\n• Clinical Excellence – ₹10 per consultation (discounted from ₹20), unlimited doctors & locations.\nThere are no yearly commitments or hidden add-ons.",
  },
  {
    category: "billing",
    question: "Is there a setup fee or long-term contract?",
    answer:
      "No. Pay only for what you use once you cross the 100-appointment threshold. You can downgrade, upgrade, or cancel at any time.",
  },
  {
    category: "billing",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), bank transfers, and digital payments. For Enterprise clients, we also offer invoice-based billing with NET 30 terms.",
  },

  {
    category: "security",
    question: "How do you protect patient data?",
    answer:
      "We use enterprise-grade security including AES-256 encryption, multi-factor authentication, role-based access controls, and audit logging. Our infrastructure is hosted on secure cloud servers.",
  },
  {
    category: "security",
    question: "Where is my data stored and backed up?",
    answer:
      "Your data is stored in secure, geographically distributed data centers with automated daily backups. We maintain multiple backup copies with point-in-time recovery capabilities. Data centers are located in the US and comply with all healthcare regulations.",
  },
  {
    category: "technical",
    question: "What devices and browsers are supported?",
    answer:
      "Doxxy works on all modern devices and browsers including Chrome, Firefox, Safari, and Edge. We also provide native mobile apps for iOS and Android. The platform is fully responsive and works seamlessly on desktops, tablets, and smartphones.",
  },
  {
    category: "technical",
    question: "Do you offer 24/7 technical support?",
    answer:
      "Yes, we provide 24/7 technical support via phone, email, and live chat. Emergency support is available for critical issues. Professional and Enterprise plans include priority support with dedicated account managers.",
  },
  {
    category: "technical",
    question: "What is your system uptime guarantee?",
    answer:
      "We guarantee 99.9% uptime with our Service Level Agreement (SLA). Our robust infrastructure and redundant systems ensure maximum availability. We also provide real-time status updates and maintenance notifications.",
  },
  {
    category: "integration",
    question: "Can Doxxy integrate with other healthcare systems?",
    answer:
      "Yes, Doxxy supports integration with major healthcare systems including laboratories (LabCorp, Quest), imaging centers, pharmacies, and insurance systems. We also provide APIs for custom integrations and support HL7 FHIR standards.",
  },
  {
    category: "integration",
    question: "Can I connect Doxxy to my accounting software?",
    answer:
      "Yes, we integrate with popular accounting software including QuickBooks, Xero, and FreshBooks. This allows for seamless financial reporting and reconciliation between your practice management and accounting systems.",
  },
];

// --- REUSABLE COMPONENTS ---

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

const Section = ({ children, className = "" }: SectionProps) => (
  <section className={`py-24 md:py-32 ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
  </section>
);

const SectionTitle = ({ children, className = "" }: SectionProps) => (
  <h2
    className={`text-4xl md:text-5xl font-bold text-gray-900 dark:text-white text-center ${className}`}
  >
    {children}
  </h2>
);

const SectionSubtitle = ({ children, className = "" }: SectionProps) => (
  <p
    className={`text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center ${className}`}
  >
    {children}
  </p>
);

// --- MODULAR SUBCOMPONENTS ---

interface FAQHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const FAQHeader = ({ searchTerm, setSearchTerm }: FAQHeaderProps) => (
  <Section className="text-center !pt-28 md:!pt-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      Frequently Asked Questions.
    </h1>
    <SectionSubtitle>
      Find quick answers to common questions about Doxxy. Can't find what you're
      looking for? Our support team is here to help.
    </SectionSubtitle>
    <div className="relative max-w-2xl mx-auto mt-10">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <Input
        placeholder="Search frequently asked questions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-12 py-6 text-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
      />
    </div>
  </Section>
);

interface FAQCategoryProps {
  category: {
    id: string;
    name: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  };
  faqs: Array<{
    category: string;
    question: string;
    answer: string;
  }>;
  toggleItem: (index: number) => void;
  openItems: number[];
}

const FAQCategory = ({
  category,
  faqs,
  toggleItem,
  openItems,
}: FAQCategoryProps) => (
  <div className="mb-12">
    <div className="flex items-center space-x-3 mb-6">
      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
        <category.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {category.name}
      </h2>
    </div>

    <div className="space-y-4">
      {faqs.map(
        (
          faq: { category: string; question: string; answer: string },
          index: number
        ) => {
          const isOpen = openItems.includes(index);

          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full p-6 text-left transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </h3>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="px-6 pb-6">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        }
      )}
    </div>
  </div>
);

interface EmptyStateProps {
  searchTerm: string;
}

const EmptyState = ({ searchTerm }: EmptyStateProps) => (
  <div className="text-center py-12">
    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      No results found
    </h3>
    <p className="text-gray-600 dark:text-gray-300 mb-6">
      We couldn't find any FAQs matching "{searchTerm}". Try different keywords
      or contact our support team.
    </p>
    <Button
      asChild
      className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold"
    >
      <Link href="/contact">Contact Support</Link>
    </Button>
  </div>
);

const SupportCTA = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50 text-center">
    <SectionTitle>Still have questions?</SectionTitle>
    <SectionSubtitle className="mt-4">
      Our support team is available 24/7 to help you with any questions or
      issues.
    </SectionSubtitle>

    <div className="grid md:grid-cols-3 gap-6 mt-16">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Live Chat
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Get instant help from our support team
        </p>
        <Button
          variant="outline"
          size="lg"
          className="w-full rounded-xl py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600"
        >
          Start Chat
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Phone className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Call Us
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Speak directly with our experts
        </p>
        <Button
          variant="outline"
          size="lg"
          className="w-full rounded-xl py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600"
        >
          +91 73888-90554
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Documentation
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Browse our comprehensive guides
        </p>
        <Button
          variant="outline"
          size="lg"
          className="w-full rounded-xl py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600"
        >
          View Docs
        </Button>
      </div>
    </div>
  </Section>
);

// --- MAIN PAGE COMPONENT ---

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedFaqs = categories
    .map((category) => ({
      ...category,
      faqs: filteredFaqs.filter((faq) => faq.category === category.id),
    }))
    .filter((category) => category.faqs.length > 0);

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
      <FAQHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <Section className="bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          {groupedFaqs.length > 0 ? (
            groupedFaqs.map((category) => (
              <FAQCategory
                key={category.id}
                category={category}
                faqs={category.faqs}
                toggleItem={toggleItem}
                openItems={openItems}
              />
            ))
          ) : (
            <EmptyState searchTerm={searchTerm} />
          )}
        </div>
      </Section>

      <SupportCTA />

      <SignupCTA />
      <SiteFooter />
    </div>
  );
};

export default FAQ;
