import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  DollarSign,
  Shield,
  Zap,
  BarChart3,
  FileText,
  MessageSquare,
  Smartphone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteFooter from "@/components/SiteFooter";
import SignupCTA from '@/components/SignupCTA';

// --- DATA ---
const comparisons = [
  {
    title: "Doxxy vs Eka Care",
    description: "See how our innovative pricing and comprehensive features provide better value compared to Eka Care.",
    icon: DollarSign,
    link: "/comparisons/doxxy-vs-eka-care",
    badge: "Most Popular"
  },
  {
    title: "Doxxy vs Practo",
    description: "Discover why our dedicated clinic management platform offers a more streamlined experience than Practo.",
    icon: Shield,
    link: "/comparisons/doxxy-vs-practo"
  },
  {
    title: "Doxxy vs ClinicPlus",
    description: "Compare our modern, cloud-based approach with ClinicPlus's traditional software model.",
    icon: Smartphone,
    link: "/comparisons/doxxy-vs-clinicplus"
  },
  {
    title: "Doxxy vs Lybrate",
    description: "Learn why we provide a more complete clinic solution compared to Lybrate's consultation-focused platform.",
    icon: MessageSquare,
    link: "/comparisons/doxxy-vs-lybrate"
  },
  {
    title: "Doxxy vs MFine",
    description: "See how our hybrid approach offers more flexibility than MFine's telemedicine-centric model.",
    icon: FileText,
    link: "/comparisons/doxxy-vs-mfine"
  }
];

const whyCompareItems = [
    { icon: BarChart3, title: "Understand Pricing Models", description: "See how different pricing structures affect your practice's costs as you grow." },
    { icon: Shield, title: "Evaluate Feature Sets", description: "Compare essential features across platforms to ensure you get what you need." },
    { icon: Zap, title: "Assess Implementation Ease", description: "Understand the time and effort required to get up and running." },
    { icon: MessageSquare, title: "Read User Experiences", description: "Learn from healthcare professionals who have already made the switch." },
];

// --- REUSABLE COMPONENTS ---

const Section = ({ children, className = '' }) => (
  <section className={`py-24 md:py-32 ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  </section>
);

const SectionTitle = ({ children, className = '' }) => (
  <h2 className={`text-4xl md:text-5xl font-bold text-gray-900 dark:text-white text-center ${className}`}>
    {children}
  </h2>
);

const SectionSubtitle = ({ children, className = '' }) => (
  <p className={`text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center ${className}`}>
    {children}
  </p>
);

// --- PAGE SECTIONS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      How Doxxy Compares.
    </h1>
    <SectionSubtitle>
      See how Doxxy stacks up against other platforms. Discover why our transparent pricing and comprehensive features make us the preferred choice for modern clinics.
    </SectionSubtitle>
    <div className="mt-10 flex justify-center gap-4">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link to="/auth">Get Started for Free</Link>
      </Button>
      <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600">
        <Link to="/pricing">View Pricing</Link>
      </Button>
    </div>
  </Section>
);

const ComparisonsGridSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Detailed Comparisons.</SectionTitle>
    <SectionSubtitle className="mt-4">
      We've created feature-by-feature comparisons to help you make an informed decision for your practice.
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
      {comparisons.map((comp) => (
        <Link key={comp.title} to={comp.link} className="block bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
                <comp.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            {comp.badge && <div className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-1 rounded-full font-medium">{comp.badge}</div>}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{comp.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2 mb-6">{comp.description}</p>
          <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
            Read Comparison <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </Link>
      ))}
    </div>
  </Section>
);

const WhyCompareSection = () => (
  <Section>
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          An Informed Decision is the Right Decision.
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Choosing the right software is critical. Our guides help you compare pricing, features, and user experiences to find the perfect fit for your practice.
        </p>
        <ul className="space-y-6">
          {whyCompareItems.map((item) => (
            <li key={item.title} className="flex items-start">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="hidden md:block">
        <img 
          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=500&fit=crop" 
          alt="Doctor comparing healthcare platforms" 
          className="rounded-2xl shadow-xl"
        />
      </div>
    </div>
  </Section>
);

const QuestionsSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50 text-center">
    <SectionTitle>Still Have Questions?</SectionTitle>
    <SectionSubtitle className="mt-4">
      Our team is ready to help you compare Doxxy with any platform you're currently using or considering.
    </SectionSubtitle>
    <div className="mt-8 flex justify-center gap-4">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold">
        <Link to="/contact">Contact Our Team</Link>
      </Button>
      <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600">
        <Link to="/faq">View FAQ</Link>
      </Button>
    </div>
  </Section>
);

// --- MAIN PAGE COMPONENT ---

const ComparisonIndex = () => {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <ComparisonsGridSection />
      <WhyCompareSection />
      <QuestionsSection />
      <SignupCTA />
      <SiteFooter />
    </div>
  );
};

export default ComparisonIndex;