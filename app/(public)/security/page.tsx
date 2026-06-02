import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Lock,
  Eye,
  CheckCircle,
  FileText,
  Database,
  Key,
  UserCheck,
  Globe,
} from 'lucide-react';
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doxxy Security — Clinic Management Software',
  description: 'How Doxxy protects patient health information with encryption, access controls, and secure cloud infrastructure.',
  alternates: {
    canonical: '/security',
  },
  openGraph: {
    title: 'Doxxy Security — Clinic Management Software',
    description: 'How Doxxy protects patient health information',
    images: [
      {
        url: '/doxxy.png',
        width: 1200,
        height: 630,
        alt: 'Doxxy Security — Clinic Management Software',
      },
    ],
  },
  keywords: ['doxxy security', 'clinic software security', 'healthcare data protection'],
};

const securityFeatures = [
  {
    icon: <Lock className="h-5 w-5" />,
    title: "Encryption",
    description: "All data encrypted in transit (TLS) and at rest (AES-256) via Supabase infrastructure",
  },
  {
    icon: <UserCheck className="h-5 w-5" />,
    title: "Role-Based Access Control",
    description: "Superadmin, doctor, and staff roles ensure users only access what they need",
  },
  {
    icon: <Eye className="h-5 w-5" />,
    title: "Row-Level Security",
    description: "Database-level policies ensure each clinic's data is isolated from every other clinic",
  },
  {
    icon: <Database className="h-5 w-5" />,
    title: "Automated Backups",
    description: "Daily automated database backups with point-in-time recovery via Supabase",
  },
  {
    icon: <Key className="h-5 w-5" />,
    title: "Secure Authentication",
    description: "OTP-based login with Google OAuth, managed by Supabase Auth",
  },
  {
    icon: <Globe className="h-5 w-5" />,
    title: "DPDP Act Compliant",
    description: "Built to comply with India's Digital Personal Data Protection Act, 2023",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "GDPR Aligned",
    description: "Data handling practices aligned with GDPR principles for consent, access, and deletion",
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: "Audit Logging",
    description: "Database-level audit trails track data access and modification",
  },
];

const dataHandling = [
  {
    phase: "Collection",
    description: "Minimal data collection with consent",
    controls: [
      "Purpose-limited data collection",
      "Data minimization practices",
      "Patient consent tracking for WhatsApp messaging",
      "Transparent privacy notices",
    ],
  },
  {
    phase: "Processing",
    description: "Secure processing with access controls",
    controls: [
      "Role-based access enforcement",
      "Row-level security at database layer",
      "Server-side data operations only",
      "No client-side database access",
    ],
  },
  {
    phase: "Storage",
    description: "Encrypted storage with regular backups",
    controls: [
      "AES-256 encryption at rest",
      "Daily automated backups",
      "Point-in-time recovery",
      "Retention policy enforcement",
    ],
  },
  {
    phase: "Transmission",
    description: "Encrypted transmission protocols",
    controls: [
      "TLS encryption in transit",
      "HTTPS enforced for all connections",
      "API authentication via Supabase",
      "OAuth token encryption",
    ],
  },
];

const SecurityHeroSection = () => (
  <Section className="!pt-28 md:!pt-40">
    <div className="max-w-4xl mx-auto text-center">
      <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 rounded-full">
        Security
      </Badge>
      <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
        Your data is <span className="text-blue-600 dark:text-blue-400">protected</span>
      </h1>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
        Doxxy is built on Supabase, a SOC 2 and GDPR-compliant cloud platform. We layer
        application-level controls — encryption, role-based access, and row-level security —
        to keep each clinic&apos;s data isolated and protected.
      </p>
    </div>
  </Section>
);

const SecurityFeaturesSection = () => (
  <Section className="bg-white dark:bg-gray-900">
    <SectionTitle>Security Practices</SectionTitle>
    <SectionSubtitle>The controls we have in place to protect clinic and patient data.</SectionSubtitle>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
      {securityFeatures.map((feature, index) => (
        <Card key={index} className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400 flex-shrink-0">
              {feature.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </Section>
);

const DataHandlingSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Data Lifecycle</SectionTitle>
    <SectionSubtitle>How data is handled at every stage — from collection to deletion.</SectionSubtitle>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
      {dataHandling.map((phase, index) => (
        <Card key={index} className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
          <CardHeader className="p-0 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium text-lg mx-auto mb-4">
              {index + 1}
            </div>
            <CardTitle className="text-lg font-medium text-center text-gray-900 dark:text-white">{phase.phase}</CardTitle>
            <p className="text-center text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-1">{phase.description}</p>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="space-y-2">
              {phase.controls.map((control, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{control}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  </Section>
);

const Security = () => {
  return (
    <div className="bg-white dark:bg-gray-900">
      <SecurityHeroSection />
      <SecurityFeaturesSection />
      <DataHandlingSection />
      <SignupCTA
        heading="Your Patient Data Deserves Enterprise-Grade Security"
        description="See Doxxy's security architecture — encryption, backups, access controls. Chat with us on WhatsApp for a security overview."
      />

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Security", url: `${APP_URL}/security` },
        ]}
      />
    </div>
  );
};

export default Security;
