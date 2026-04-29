"use client";

import { logger } from "@/lib/logger";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Script from 'next/script';
import {
  Calendar,
  Users,
  CreditCard,
  Shield,
  Clock,
  FileText,
  CheckCircle,
  Star,
  ArrowRight,
  Globe,
  BarChart3,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import SignupCTA from "@/components/SignupCTA";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";


const structuredData = {
  "@context": "https://schema.org",
  "@type": "MedicalOrganization",
  "name": "Doxxy",
  "description": "Modern clinic management software for healthcare providers",
  "url": process.env.NEXT_PUBLIC_APP_URL || "https://doxxy.neurovisionhospital.com",
  "logo": "/doxxy.png",
  "medicalSpecialty": "Healthcare Software",
}

// --- DATA ---
const painPoints = [
  {
    icon: AlertTriangle,
    title: "Scheduling Chaos",
    description:
      "Manual appointment management leads to double bookings, no-shows, and frustrated patients.",
    solution: "Automated reminders & conflict detection",
  },
  {
    icon: FileText,
    title: "Lost Information",
    description:
      "Physical files get misplaced, patient history is incomplete, and finding records takes forever.",
    solution: "Instant search & complete digital records",
  },
  {
    icon: DollarSign,
    title: "Billing Errors",
    description:
      "Manual invoicing creates errors, payment tracking is messy, and revenue gets delayed.",
    solution: "Automated billing & payment tracking",
  },
  {
    icon: Clock,
    title: "Administrative Drain",
    description:
      "Hours spent on paperwork instead of patient care, reducing clinic efficiency and revenue.",
    solution: "Workflows that save 3+ hours daily",
  },
];

const features = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "Automated reminders, online booking, and real-time availability to reduce no-shows by 40%.",
  },
  {
    icon: Users,
    title: "Patient Records",
    description:
      "Secure, centralized patient data with medical history, prescriptions, and treatment plans.",
  },
  {
    icon: CreditCard,
    title: "Integrated Billing",
    description:
      "Automated invoicing, payment tracking, and insurance claim management in one place.",
  },
  {
    icon: FileText,
    title: "Digital Consultations",
    description:
      "Record clinical notes, manage prescriptions, and track patient progress with 11+ templates.",
  },
  {
    icon: Globe,
    title: "Multi-Clinic Support",
    description:
      "Manage multiple clinic locations with role-based access and centralized data.",
  },
  {
    icon: BarChart3,
    title: "Practice Analytics",
    description:
      "Insightful dashboards with practice metrics, revenue tracking, and performance analytics.",
  },
];

const specialties = [
  {
    name: "Cardiology",
    description: "Heart & vascular",
    image:
      "https://images.unsplash.com/photo-1618939304347-e91b1f33d2ab?w=400&h=400&fit=crop",
    alt: "3D Heart Illustration",
  },
  {
    name: "Neurology",
    description: "Brain & nervous system",
    image:
      "https://images.unsplash.com/photo-1679639539537-0d2e452890f7?w=400&h=400&fit=crop",
    alt: "3D Brain Illustration",
  },
  {
    name: "Ophthalmology",
    description: "Comprehensive eye care",
    image:
      "https://images.unsplash.com/photo-1615552441070-cbe0d49f5ae9?w=400&h=400&fit=crop",
    alt: "3D Eye Illustration",
  },
  {
    name: "Dermatology",
    description: "Skin & aesthetic care",
    image:
      "https://images.unsplash.com/photo-1700760934166-4c766d708139?w=400&h=400&fit=crop",
    alt: "3D Skincare Product Illustration",
  },
  {
    name: "Orthopedics",
    description: "Bone & musculoskeletal",
    image:
      "https://images.unsplash.com/photo-1508387104394-d13e1b497f85?w=400&h=400&fit=crop",
    alt: "3D Bone Illustration",
  },
  {
    name: "Dental",
    description: "Oral health & hygiene",
    image:
      "https://images.unsplash.com/photo-1621516799962-7dad52802428?q=80?w=400&h=400&fit=crop",
    alt: "3D Tooth Illustration",
  },
  {
    name: "Pulmonology",
    description: "Oral health & hygiene",
    image:
      "https://images.unsplash.com/photo-1743767587847-08c42b31cdec?w=400&h=400&fit=crop",
    alt: "3D Tooth Illustration",
  },
  {
    name: "ENT",
    description: "Ear, nose & throat",
    image:
      "https://images.unsplash.com/photo-1715111641804-f8af88e93b01?w=400&h=400&fit=crop",
    alt: "3D Tooth Illustration",
  },
];

const testimonials = [
  {
    name: "Dr. Priya Sharma",
    role: "Cardiologist, Apollo Hospitals, Delhi",
    content:
      "Doxxy has revolutionized how we manage patient flow. The scheduling is flawless, and it has freed up my team to focus on what matters most—patient care.",
  },
  {
    name: "Dr. Rohan Gupta",
    role: "Orthopedic Surgeon, Fortis Hospital, Mumbai",
    content:
      "The multi-clinic dashboard is a game-changer. I can oversee my practice in Bandra and Andheri from one screen. It's incredibly efficient.",
  },
  {
    name: "Anjali Mehta",
    role: "Practice Manager, Manipal Hospital, Bangalore",
    content:
      "The automated billing and invoicing system has cut our administrative workload by at least 50%. It's accurate, professional, and has significantly improved our revenue cycle.",
  },
  {
    name: "Dr. Vikram Singh",
    role: "General Physician, Max Healthcare, Gurgaon",
    content:
      "I was skeptical about EMRs, but Doxxy is different. It's so intuitive. The consultation templates are tailored perfectly for Indian practice needs.",
  },
];

// --- MODULAR COMPONENTS ---

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

const HeroSection = () => (
  <section className="py-28 md:py-40 text-center">
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
        Clinic work, <br className="md:hidden" />
        <span className="text-blue-600">made simple.</span>
      </h1>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
        The intelligent platform for modern clinics. Spend less time on admin
        and more time on what matters: your patients.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
        <Link href="/auth">
          <Button
            size="lg"
            className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105"
          >
            Setup Your Practice for Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-blue-500" />
          <span>No setup fees</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-blue-500" />
          <span>Cancel anytime</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-blue-500" />
          <span>100 free consultations</span>
        </div>
      </div>
    </div>
  </section>
);

interface PainPoint {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  solution: string;
}

interface PainPointsProps {
  points: PainPoint[];
}

const PainPoints = ({ points }: PainPointsProps) => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>From Chaos to Clarity.</SectionTitle>
    <SectionSubtitle className="mt-4">
      We solve the core administrative problems that slow your practice down, so
      you can focus on patient care.
    </SectionSubtitle>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
      {points.map((pain: PainPoint, index: number) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50"
        >
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center mb-4">
            <pain.icon className="h-6 w-6 text-red-500 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {pain.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            {pain.description}
          </p>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium">
            <CheckCircle className="h-4 w-4" />
            <span>{pain.solution}</span>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const ProductShowcase = () => {
  interface ShowcaseCardProps {
    title: string;
    description: string;
    items: string[];
  }

  const ShowcaseCard = ({ title, description, items }: ShowcaseCardProps) => (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-8 h-full flex flex-col">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">
        {description}
      </p>
      <div className="space-y-3">
        {items.map((item: string, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );

  interface MockupCardProps {
    children: React.ReactNode;
    className?: string;
  }

  const MockupCard = ({ children, className = "" }: MockupCardProps) => (
    <div
      className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl p-2 shadow-sm border border-gray-200/75 dark:border-gray-700/50 ${className}`}
    >
      {children}
    </div>
  );

  return (
    <Section>
      <SectionTitle>See Doxxy in Action.</SectionTitle>
      <SectionSubtitle className="mt-4">
        This is how modern healthcare software should look and feel—powerful,
        intuitive, and a pleasure to use.
      </SectionSubtitle>

      <div className="space-y-20 mt-20">
        {/* Showcase 1: Smart Appointment Management */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <ShowcaseCard
            title="Smart Appointment Management"
            description="Eliminate double bookings and reduce no-shows. Real-time updates and automated reminders create the smoothest experience for staff and patients."
            items={[
              "Automated SMS & Email Reminders",
              "Real-time Conflict Detection",
              "Patient Self-Scheduling Portal",
            ]}
          />
          <MockupCard>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Today's Schedule
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-500/30">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-green-800 dark:text-green-200">
                    Priya Sharma
                  </h4>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">
                    Checked In
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  10:30 AM - Cardiology Consult
                </p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-500/30">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Rohan Gupta
                  </h4>
                  <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded-full">
                    Waiting
                  </span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  11:00 AM - Orthopedic Follow-up
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-500/30">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                    Anjali Mehta
                  </h4>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full">
                    Scheduled
                  </span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  11:30 AM - New Patient
                </p>
              </div>
            </div>
          </MockupCard>
        </div>

        {/* Showcase 2: Patient Records */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <MockupCard className="lg:order-last">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Patient: Vikram Singh
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Age</p>
                  <p className="font-semibold">42</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Gender</p>
                  <p className="font-semibold">Male</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-semibold">+91 98XXXXXX01</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Last Visit</p>
                  <p className="font-semibold">12/06/2025</p>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Recent Consultations
                </h5>
                <div className="text-sm p-2 bg-white dark:bg-gray-700/50 rounded-md">
                  Fever and cough. Prescribed Paracetamol.
                </div>
              </div>
            </div>
          </MockupCard>
          <ShowcaseCard
            title="Complete Patient Records"
            description="A comprehensive digital file with complete medical history, notes, and prescriptions. Search thousands of records in seconds."
            items={[
              "Searchable Medical Timeline",
              "Prescription History & Alerts",
              "One-Click PDF Export",
            ]}
          />
        </div>

        {/* Showcase 3: Practice Dashboard */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <ShowcaseCard
            title="Practice Dashboard"
            description="Get a complete overview of your practice with real-time metrics. Track patient flow, revenue, and appointment trends at a glance."
            items={[
              "Real-time Practice Metrics & KPIs",
              "Visual Charts for Revenue Trends",
              "Role-Based Views for Staff",
            ]}
          />
          <MockupCard>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Clinic Overview
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white dark:bg-gray-700/50 rounded-lg text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Appointments
                  </p>
                  <p className="text-2xl font-bold text-blue-500">32</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-700/50 rounded-lg text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Revenue
                  </p>
                  <p className="text-2xl font-bold text-blue-500">₹45,000</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-700/50 rounded-lg text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-yellow-500">4</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-700/50 rounded-lg text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-green-500">28</p>
                </div>
              </div>
            </div>
          </MockupCard>
        </div>

        {/* Showcase 4: Professional Billing */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <MockupCard className="lg:order-last">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Invoice: #INV-0042
              </h3>
            </div>
            <div className="p-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Consultation
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    ₹800.00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Lab Test
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    ₹1200.00
                  </span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-gray-200 dark:border-gray-700 mt-3 pt-3">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-blue-600">₹2000.00</span>
              </div>
            </div>
          </MockupCard>
          <ShowcaseCard
            title="Professional Billing"
            description="Generate professional invoices, track payments, and manage billing seamlessly. Integrated with appointments for an error-free workflow."
            items={[
              "Auto-Generate Invoices",
              "Payment Tracking & Alerts",
              "Professional PDF Invoices",
            ]}
          />
        </div>
      </div>
    </Section>
  );
};

interface Specialty {
  name: string;
  description: string;
  image: string;
  alt: string;
}

interface SpecialtiesProps {
  specialties: Specialty[];
}

const Specialties = ({ specialties }: SpecialtiesProps) => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Built for Every Specialty.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Our platform is built with flexible, specialty-specific workflows for
      cardiology, dentistry, and everything in between.
    </SectionSubtitle>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-8 mt-16">
      {specialties.map((specialty: Specialty) => (
        <div
          key={specialty.name}
          className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200/75 dark:border-gray-700/50 group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
          <div className="relative h-40 w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <img
              src={specialty.image}
              alt={specialty.alt}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4 text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {specialty.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {specialty.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const PricingSection = () => (
  <Section>
    <SectionTitle>Fair & Transparent Pricing.</SectionTitle>
    <SectionSubtitle className="mt-4">
      One simple, transparent price. No monthly subscriptions, no hidden fees,
      and no surprises. Ever.
    </SectionSubtitle>
    <div className="max-w-md mx-auto mt-16 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8 text-center">
      <h3 className="text-5xl font-bold text-gray-900 dark:text-white">₹10</h3>
      <p className="text-gray-600 dark:text-gray-300 mt-2">per consultation</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        (First 100 are free)
      </p>
      <Link href="/auth">
        <Button
          size="lg"
          className="w-full mt-6 bg-blue-600 text-white hover:bg-blue-700 rounded-xl py-3 text-base font-semibold"
        >
          Try Now for Free
        </Button>
      </Link>
      <div className="space-y-3 mt-8 text-left text-sm">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-4 w-4 text-blue-500" />
          <span>Unlimited doctors & staff</span>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircle className="h-4 w-4 text-blue-500" />
          <span>Patient records & scheduling</span>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircle className="h-4 w-4 text-blue-500" />
          <span>Billing & invoicing</span>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircle className="h-4 w-4 text-blue-500" />
          <span>Digital consultations & notes</span>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircle className="h-4 w-4 text-blue-500" />
          <span>Multi-specialty support</span>
        </div>
      </div>
    </div>
  </Section>
);

interface CoreFeature {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

interface CoreFeaturesProps {
  features: CoreFeature[];
}

const CoreFeatures = ({ features }: CoreFeaturesProps) => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>The Complete Practice Toolkit.</SectionTitle>
    <SectionSubtitle className="mt-4">
      We’ve built every feature you need to run a modern practice, all in one
      cohesive and intuitive platform.
    </SectionSubtitle>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
      {features.map((feature: CoreFeature) => (
        <div
          key={feature.title}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50"
        >
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
            <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {feature.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  </Section>
);

const BenefitsSection = () => (
  <Section>
    <SectionTitle>The Doxxy Advantage.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Secure, scalable, and efficient. Discover the core advantages that make
      Doxxy the trusted choice for modern clinics.
    </SectionSubtitle>
    <div className="grid lg:grid-cols-3 gap-8 mt-16">
      <div className="flex items-start gap-4">
        <Shield className="h-8 w-8 text-blue-500 flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
            Bank-Level Security
          </h4>
          <p className="text-gray-600 dark:text-gray-300">
            Advanced encryption and data isolation. HIPAA-compliant with 99.9%
            uptime.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <Users className="h-8 w-8 text-blue-500 flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
            Scale Without Limits
          </h4>
          <p className="text-gray-600 dark:text-gray-300">
            Add unlimited staff without per-user charges. Pricing scales with
            your patient volume, not team size.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <Clock className="h-8 w-8 text-blue-500 flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
            Save Time, Daily
          </h4>
          <p className="text-gray-600 dark:text-gray-300">
            Automated workflows for appointments, billing, and records save
            clinics over 3 hours every day.
          </p>
        </div>
      </div>
    </div>
  </Section>
);

interface Testimonial {
  name: string;
  role: string;
  content: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

const TestimonialsSection = ({ testimonials }: TestimonialsSectionProps) => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Trusted by India's Leading Doctors.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Don’t just take our word for it. Here’s what leading doctors and practice
      managers across India are saying about Doxxy.
    </SectionSubtitle>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
      {testimonials.map((testimonial: Testimonial) => (
        <figure
          key={testimonial.name}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50"
        >
          <div className="flex mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
            ))}
          </div>
          <blockquote className="text-gray-700 dark:text-gray-300 mb-6">
            <p>"{testimonial.content}"</p>
          </blockquote>
          <figcaption className="text-sm">
            <div className="font-bold text-gray-900 dark:text-white">
              {testimonial.name}
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              {testimonial.role}
            </div>
          </figcaption>
        </figure>
      ))}
    </div>
  </Section>
);

// --- MAIN LANDING PAGE ---

const LandingPageClient = () => {
  const {
    user,
    loading: initialLoading,
    activeClinic,
    clinicLoading,
    needsProfileCompletion,
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for initial loading to complete
    if (initialLoading) return;

    // If user is authenticated, redirect to appropriate page
    if (user) {
      if (process.env.NODE_ENV === "development") {
        logger.log(
          "LandingPage: Authenticated user detected, checking redirect logic",
          {
            user: !!user,
            needsProfileCompletion,
            clinicLoading,
            activeClinic: activeClinic ? activeClinic.clinics?.name : null,
          }
        );
      }

      // Profile incomplete - redirect to complete profile
      if (needsProfileCompletion) {
        if (process.env.NODE_ENV === "development") logger.log("LandingPage: Redirecting to /complete-profile");
        router.replace("/complete-profile");
        return;
      }

      // Profile complete but clinic loading - wait
      if (clinicLoading) {
        if (process.env.NODE_ENV === "development") logger.log("LandingPage: Clinic data loading, waiting...");
        return;
      }

      // Profile complete, no clinic - redirect to create clinic
      if (!activeClinic) {
        if (process.env.NODE_ENV === "development") logger.log(
          "LandingPage: No active clinic, redirecting to /create-clinic"
        );
        router.replace("/create-clinic");
        return;
      }

      // Profile complete, has clinic - redirect to dashboard
      if (process.env.NODE_ENV === "development") logger.log(
        "LandingPage: User has active clinic, redirecting to /dashboard"
      );
      router.replace("/dashboard");
    }
  }, [
    user,
    initialLoading,
    needsProfileCompletion,
    clinicLoading,
    activeClinic,
    router,
  ]);

  // Show loading spinner while checking authentication
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Only render landing page for unauthenticated users
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
      <HeroSection />
      {/* <SuccessMetrics metrics={successMetrics} /> */}
      <PainPoints points={painPoints} />
      <ProductShowcase />
      <Specialties specialties={specialties} />
      <PricingSection />
      <CoreFeatures features={features} />
      <BenefitsSection />
      <TestimonialsSection testimonials={testimonials} />
      <SignupCTA />
      <SiteFooter />
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </div>
  );
};

const LandingPage = () => {
  return <LandingPageClient />;
};

export default LandingPage;
