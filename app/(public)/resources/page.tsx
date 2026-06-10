// Path: app/(public)/resources/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import Link from "next/link";
import { ArrowRight, BookOpen, Building2, Zap, Heart, Settings, Shield, Lightbulb } from 'lucide-react';
import SignupCTA from '@/components/SignupCTA';
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";

export const metadata: Metadata = {
  title: 'Clinic Management Resources — Guides, Tools & Best Practices | Doxxy',
  description: 'Free guides, calculators, and best practices for Indian clinics — software selection, digitization, patient experience, operations, and compliance. Everything you need to run a modern clinic.',
  alternates: {
    canonical: '/resources',
  },
  openGraph: {
    title: 'Clinic Management Resources — Guides, Tools & Best Practices',
    description: 'Free guides, calculators, and best practices for Indian clinics. Everything you need to run a modern clinic.',
    type: 'website',
    images: [
      {
        url: '/doxxy.png',
        width: 1200,
        height: 630,
        alt: 'Doxxy Clinic Management Resources',
      },
    ],
  },
  keywords: ['clinic management resources', 'clinic software guides', 'clinic digitization resources', 'clinic operations guides', 'healthcare compliance resources'],
};

// --- CATEGORY DATA ---

interface ResourceLink {
  href: string;
  title: string;
  description: string;
}

interface ResourceCategory {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  links: ResourceLink[];
}

const resourceCategories: ResourceCategory[] = [
  {
    title: 'Clinic Software Basics',
    description: 'Understand what clinic software does, how to choose it, and what it costs.',
    icon: BookOpen,
    links: [
      { href: '/what-is-clinic-management-software', title: 'What Is Clinic Management Software?', description: 'What clinic management software actually does, how it works, and whether your clinic needs it.' },
      { href: '/how-to-choose-clinic-software', title: 'How to Choose Clinic Software', description: 'The ultimate 10-question checklist for choosing clinic software in India.' },
      { href: '/best-clinic-management-software-india', title: 'Best Clinic Management Software India 2026', description: 'Honest comparison of the 6 best clinic management software options in India.' },
      { href: '/clinic-software-cost-india', title: 'Clinic Software Cost in India 2026', description: 'Honest comparison of clinic management software pricing in India.' },
      { href: '/clinic-software-roi-calculator', title: 'Clinic Software ROI Calculator', description: 'Interactive calculator: Input your patient numbers and see exactly how much Doxxy saves your clinic.' },
      { href: '/free-clinic-software-india', title: 'Free Clinic Software India 2026', description: 'Honest guide to free clinic management software in India.' },
    ],
  },
  {
    title: 'For Your Clinic Type',
    description: 'Find the right software for your specific clinic size and structure.',
    icon: Building2,
    links: [
      { href: '/clinic-software-small-clinic', title: 'Software for Small Clinics', description: 'Clinic software built for solo doctors and small clinics in India.' },
      { href: '/clinic-software-new-clinic', title: 'New Clinic Setup Software', description: 'Opening a new clinic? Do not start with paper.' },
      { href: '/multi-location-clinic-software', title: 'Multi-Location Clinic Software', description: 'Running 2+ clinics without unified software costs Rs.4-6 lakhs/year in admin waste.' },
      { href: '/multi-specialty-clinic-software', title: 'Multi-Specialty Clinic Software', description: 'Multi-specialty clinic management software for Indian polyclinics.' },
    ],
  },
  {
    title: 'Going Digital',
    description: 'Step-by-step guides to move your clinic from paper to digital.',
    icon: Zap,
    links: [
      { href: '/go-paperless-clinic', title: 'How to Go Paperless in Your Clinic', description: 'Transform your Indian clinic from paper to digital.' },
      { href: '/clinic-software-vs-paper', title: 'Clinic Software vs Paper Records', description: 'Paper-based clinic management costs Rs.3.6-5.4 lakhs every year in lost time, billing errors, and missed patients.' },
      { href: '/india-clinic-digitization-guide', title: 'India Clinic Digitization Guide 2026', description: 'The definitive guide to digitizing your clinic in India.' },
      { href: '/digital-patient-registration', title: 'Digital Patient Registration', description: 'Replace paper intake forms with QR-based digital patient registration.' },
      { href: '/digital-treatment-plans', title: 'Digital Treatment Plans', description: 'Digital treatment plan software for Indian doctors.' },
      { href: '/electronic-medical-records', title: 'Electronic Medical Records (EMR)', description: 'Switch from paper files to digital EMR.' },
    ],
  },
  {
    title: 'Patient Experience',
    description: 'Reduce wait times, cut no-shows, and keep patients coming back.',
    icon: Heart,
    links: [
      { href: '/improve-patient-experience-clinic', title: 'Improve Patient Experience', description: 'Shorter waits, WhatsApp reports, digital payments, and appointment reminders — transform how patients feel about your clinic.' },
      { href: '/reduce-clinic-wait-times', title: 'Reduce Patient Wait Times', description: 'Long wait times are your clinic\'s #1 source of bad reviews and patient loss.' },
      { href: '/reduce-patient-no-shows', title: 'Reduce Patient No-Shows', description: 'Indian clinics lose Rs.2,500-Rs.5,000 per empty appointment slot.' },
      { href: '/online-appointment-booking', title: 'Online Appointment Booking', description: 'Let patients book online in 30 seconds.' },
      { href: '/clinic-queue-management', title: 'Clinic Queue Management', description: 'Doxxy\'s OPD queue management system cuts patient wait times from 90 minutes to under 25.' },
      { href: '/whatsapp-appointment-reminders', title: 'WhatsApp Appointment Reminders', description: 'Automated WhatsApp appointment reminders for Indian clinics.' },
      { href: '/clinic-appointment-scheduling-guide', title: 'Appointment Scheduling Guide', description: 'The complete guide to appointment scheduling for Indian clinics.' },
      { href: '/clinic-patient-follow-up-system', title: 'Patient Follow-Up System', description: 'Build a systematic patient follow-up process that fills next month\'s calendar.' },
    ],
  },
  {
    title: 'Clinic Operations',
    description: 'Billing, analytics, labs, and staff — run your clinic like a business.',
    icon: Settings,
    links: [
      { href: '/clinic-billing-software', title: 'Clinic Billing Software', description: 'Automated clinic billing software for Indian clinics.' },
      { href: '/clinic-payment-collection-guide', title: 'Payment Collection Guide', description: 'Stop losing 5-8% of your clinic revenue to billing errors and unpaid dues.' },
      { href: '/clinic-analytics-dashboard', title: 'Clinic Analytics Dashboard', description: 'Turn gut feelings into data-driven decisions.' },
      { href: '/lab-report-management-clinic', title: 'Lab Report Management', description: 'Stop filing and losing paper lab reports.' },
      { href: '/stop-clinic-revenue-leakage', title: 'Stop Revenue Leakage', description: 'Manual billing, missed charges, and unpaid follow-ups drain 5-8% of Indian clinic revenue.' },
      { href: '/reduce-clinic-staff-burnout', title: 'Reduce Staff Burnout', description: 'Indian clinic receptionists spend 70% of their day on paperwork that software eliminates.' },
    ],
  },
  {
    title: 'Compliance & Security',
    description: 'Keep patient data safe and your clinic compliant with Indian regulations.',
    icon: Shield,
    links: [
      { href: '/abdm-compliance-clinic', title: 'ABDM Compliance Guide', description: 'Everything Indian clinics need to know about Ayushman Bharat Digital Mission compliance.' },
      { href: '/abha-id-clinic-guide', title: 'ABHA ID Guide for Clinics', description: 'Everything Indian doctors and clinics need to know about ABHA IDs.' },
      { href: '/clinic-data-security-guide', title: 'Clinic Data Security Guide', description: 'Fire, flood, theft, or a corrupted Excel file — your clinic\'s patient data is one disaster away from being gone forever.' },
      { href: '/clinic-regulatory-compliance-india', title: 'Regulatory Compliance in India', description: 'Complete guide to regulatory compliance for Indian clinics.' },
      { href: '/security', title: 'Doxxy Security', description: 'How Doxxy protects patient health information with encryption, access controls, and secure cloud infrastructure.' },
    ],
  },
];

// --- PAGE SECTIONS ---

const ResourceCard = ({ link }: { link: ResourceLink }) => (
  <Link
    href={link.href}
    className="group block bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
  >
    <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
      {link.title}
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">
      {link.description}
    </p>
  </Link>
);

const CategorySection = ({ category }: { category: ResourceCategory }) => {
  const Icon = category.icon;
  return (
    <Section className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {category.title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {category.description}
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {category.links.map((link) => (
          <ResourceCard key={link.href} link={link} />
        ))}
      </div>
    </Section>
  );
};

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full mb-8">
      <Lightbulb className="w-4 h-4" />
      Everything you need to run a modern clinic
    </div>
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      Clinic Resources.
    </h1>
    <SectionSubtitle>
      Free guides, calculators, and best practices for Indian clinics. Software selection, digitization, patient experience, operations, and compliance — all in one place.
    </SectionSubtitle>
  </Section>
);

// --- MAIN PAGE COMPONENT ---

const ResourcesIndex = () => {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      {resourceCategories.map((category) => (
        <CategorySection key={category.title} category={category} />
      ))}
      <SignupCTA
        heading="Ready to Put These Guides to Work?"
        description="All the advice, plus the software that makes it easy. Chat with us on WhatsApp for a quick demo tailored to your clinic."
      />

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Resources", url: `${APP_URL}/resources` },
        ]}
      />
    </div>
  );
};

export default ResourcesIndex;
