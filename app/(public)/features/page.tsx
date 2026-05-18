import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Video, 
  Building2, 
  BarChart3, 
  Clock, 
  Globe,
  Zap,
  Lock,
  HeartHandshake,
  Stethoscope,
  Database,
  Settings,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import SignupCTA from "@/components/SignupCTA";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doxxy Features - Clinic Management Software for Healthcare',
  description: 'Explore Doxxy\'s features: appointment management, patient records, billing, telehealth, and analytics for modern healthcare clinics.',
  alternates: {
    canonical: '/features',
  },
  openGraph: {
    title: 'Doxxy Features - Clinic Management Software',
    description: 'Explore Doxxy\'s features for modern healthcare practices',
    images: [
      {
        url: '/doxxy-features.png', // Consider creating feature-specific image
        width: 1200,
        height: 630,
        alt: 'Doxxy Features Overview',
      },
    ],
  },
  keywords: ['clinic management software', 'healthcare software', 'medical practice management', 'patient records software'],
}

// --- DATA ---
const coreFeatures = [
  {
    icon: Calendar,
    title: "Smart Appointment Management",
    description: "Intelligent scheduling with automated reminders, conflict resolution, and multi-location support.",
    features: [
      "AI-powered scheduling optimization",
      "Automated SMS/email reminders",
      "Online booking with availability sync",
      "Waitlist management",
      "Multi-doctor calendar integration",
      "Recurring appointment setup"
    ],
  },
  {
    icon: Users,
    title: "Comprehensive Patient Records",
    description: "Complete digital health records with advanced search, analytics, and secure sharing capabilities.",
    features: [
      "360° patient health profiles",
      "Medical history tracking",
      "Lab results integration",
      "Prescription management",
      "Family health connections",
      "Advanced search & filtering"
    ]
  },
  {
    icon: CreditCard,
    title: "Integrated Billing System",
    description: "Streamlined billing with insurance integration, automated invoicing, and payment processing.",
    features: [
      "Insurance claim automation",
      "Multi-currency support",
      "Payment gateway integration",
      "Automated invoice generation",
      "Financial reporting",
      "Tax compliance tools"
    ]
  },
  {
    icon: Video,
    title: "Telemedicine Platform",
    description: "Video consultations with integrated prescription and note-taking.",
    features: [
      "HD video consultations",
      "Screen sharing capabilities",
      "Digital prescription during calls",
      "Real-time note taking",
      "Recording & playback",
      "Mobile app support"
    ],
    badge: "Soon"
  },
  {
    icon: Building2,
    title: "Multi-Clinic Management",
    description: "Centralized management for multi-location practices with role-based access control.",
    features: [
      "Centralized dashboard",
      "Location-specific reporting",
      "Staff role management",
      "Resource allocation",
      "Cross-location scheduling",
      "Unified billing system"
    ]
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Powerful insights and reporting to optimize practice operations and patient outcomes.",
    features: [
      "Revenue analytics",
      "Patient flow analysis",
      "Treatment outcome tracking",
      "Staff performance metrics",
      "Custom report builder",
      "Predictive analytics"
    ],
    badge: "Soon"
  }
];

const additionalFeatures = [
  { icon: Clock, title: "24/7 Support", description: "Round-the-clock support and system monitoring." },
  { icon: Globe, title: "Multi-Language", description: "Support for 15+ languages including Hindi and Tamil." },
  { icon: Zap, title: "Fast Performance", description: "Lightning-fast load times with a 99.9% uptime guarantee." },
  { icon: Lock, title: "Data Security", description: "Bank-level encryption with regular security audits." },
  { icon: HeartHandshake, title: "Patient Portal", description: "A self-service portal for patients to manage their health." },
  { icon: Stethoscope, title: "Clinical Tools", description: "Built-in clinical calculators and drug interaction alerts." },
  { icon: Database, title: "Data Migration", description: "Seamless migration from existing systems with zero downtime." },
  { icon: Settings, title: "Custom Workflows", description: "Configurable workflows to match your unique practice style." },
];

// --- PAGE SECTIONS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      The Power Behind Your Practice.
    </h1>
    <SectionSubtitle>
      Discover a comprehensive feature set designed to streamline operations, enhance patient care, and scale with your clinic—all without the enterprise complexity.
    </SectionSubtitle>
    <div className="mt-10">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="/auth">Get Started for Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

const CoreFeaturesSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>A Feature for Every Function.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Six powerful yet simple modules providing the perfect balance of functionality and ease of use, designed specifically for the needs of modern clinics.
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
      {coreFeatures.map((feature) => (
        <div key={feature.title} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 flex flex-col">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <feature.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">{feature.description}</p>
          <ul className="space-y-2 text-sm">
            {feature.features.map((item) => (
              <li key={item} className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </Section>
);

const AdditionalFeaturesSection = () => (
  <Section>
    <SectionTitle>Everything Else You Need.</SectionTitle>
    <SectionSubtitle className="mt-4">
      From bank-level security to 24/7 support, we’ve built the foundational features you can rely on, so you can focus on your patients.
    </SectionSubtitle>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 mt-16">
      {additionalFeatures.map((feature) => (
        <div key={feature.title} className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <feature.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const WorkflowShowcase = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Real Interface. Real Workflows.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Stop reading about features. See the actual interface that thousands of doctors use every day. This is the Doxxy experience.
    </SectionSubtitle>
    <div className="mt-16">
        <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Consultation Workflow</h3>
            <p className="text-gray-600 dark:text-gray-300">From check-in to prescription, see how smooth your workflow becomes.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1: Patient Check-in */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200/75 dark:border-gray-700/50"><h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>Patient Check-in</h4></div>
                <div className="p-4 space-y-3"><Button className="w-full bg-blue-600 hover:bg-blue-700">Start Consultation</Button></div>
            </div>
            {/* Step 2: Digital Consultation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200/75 dark:border-gray-700/50"><h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>Digital Consultation</h4></div>
                <div className="p-4 space-y-2">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md text-xs"><p className="font-medium text-gray-700 dark:text-gray-300">Complaint:</p><p>Recurring headaches</p></div>
                    <div className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md text-xs"><p className="font-medium text-gray-700 dark:text-gray-300">Prescription:</p><p>Acetaminophen 500mg</p></div>
                </div>
            </div>
            {/* Step 3: Print & Bill */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200/75 dark:border-gray-700/50"><h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>Print & Bill</h4></div>
                <div className="p-4 flex gap-2"><Button variant="outline" className="w-full dark:text-gray-300 dark:border-gray-600">Print Rx</Button><Button className="w-full">Generate Bill</Button></div>
            </div>
        </div>
    </div>
  </Section>
);

const PatientInterface = () => (
  <Section>
    <SectionTitle>Your Entire Patient Database, Simplified.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Manage thousands of patient records with an interface that’s powerful, searchable, and refreshingly easy to navigate.
    </SectionSubtitle>
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8 mt-16">
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Patient List */}
            <div className="lg:col-span-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/75 dark:border-gray-700/50">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Patient Database</h4>
                <div className="space-y-2">
                {[
                    { name: 'John Doe', lastVisit: 'Dec 15' },
                    { name: 'Jane Smith', lastVisit: 'Dec 14' },
                    { name: 'Mike Chen', lastVisit: 'Dec 12' },
                    { name: 'Sarah Johnson', lastVisit: 'Dec 11' },
                ].map((p, i: number) => (
                    <div key={i} className={`p-3 rounded-lg cursor-pointer ${i === 0 ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
                    <p className={`font-medium text-sm ${i === 0 ? 'text-blue-800 dark:text-blue-200' : 'text-gray-800 dark:text-gray-200'}`}>{p.name}</p>
                    <p className={`text-xs ${i === 0 ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>Last Visit: {p.lastVisit}</p>
                    </div>
                ))}
                </div>
            </div>
            {/* Patient Details */}
            <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">John Doe</h4>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="dark:text-gray-300 dark:border-gray-600">Edit</Button>
                        <Button size="sm">Create Bill</Button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200/75 dark:border-gray-700/50">
                    <div><h5 className="text-sm text-gray-500 dark:text-gray-400">Contact</h5><p className="font-medium text-gray-800 dark:text-gray-200">+91 98765 43210</p></div>
                    <div><h5 className="text-sm text-gray-500 dark:text-gray-400">Last Visit</h5><p className="font-medium text-gray-800 dark:text-gray-200">Dec 15, 2024</p></div>
                    <div className="col-span-2"><h5 className="text-sm text-gray-500 dark:text-gray-400">Medical Summary</h5><p className="font-medium text-gray-800 dark:text-gray-200">Routine checkup. No new complaints.</p></div>
                    <div className="col-span-2">
                        <h5 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Recent History</h5>
                        <div className="text-sm p-2 bg-white dark:bg-gray-700/50 rounded-md">Headache consultation. Prescribed Acetaminophen.</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </Section>
);

// --- MAIN PAGE COMPONENT ---

const Features = () => {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <CoreFeaturesSection />
      <WorkflowShowcase />
      <PatientInterface />
      <AdditionalFeaturesSection />
      <SignupCTA />
    </div>
  );
};

export default Features;
