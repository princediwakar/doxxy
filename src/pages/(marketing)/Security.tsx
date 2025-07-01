import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Lock,
  Eye,
  CheckCircle,
  FileText,
  Users,
  Database,
  Cloud,
  Key,
  AlertTriangle,
  UserCheck,
  Globe,
  Award,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SignupCTA from "@/components/SignupCTA";
import SiteFooter from "@/components/SiteFooter";

// --- DATA ---
const certifications = [
  {
    icon: <Award className="h-6 w-6 text-gray-500" />,
    title: "HIPAA Compliant",
    description: "Adherence to US healthcare data privacy and security regulations",
    status: "Certified"
  },
  {
    icon: <Shield className="h-6 w-6 text-gray-500" />,
    title: "SOC 2 Type 2",
    description: "Independent audit of security, availability, processing integrity, confidentiality, and privacy",
    status: "Certified"
  },
  {
    icon: <Globe className="h-6 w-6 text-gray-500" />,
    title: "GDPR Compliant",
    description: "European data protection regulation compliance",
    status: "Certified"
  },
  {
    icon: <Lock className="h-6 w-6 text-gray-500" />,
    title: "ISO 27001",
    description: "International security management standard",
    status: "In Progress"
  }
];

const securityFeatures = [
  {
    icon: <Lock className="h-5 w-5" />,
    title: "End-to-End Encryption",
    description: "All data encrypted in transit and at rest using AES-256 encryption"
  },
  {
    icon: <Key className="h-5 w-5" />,
    title: "Multi-Factor Authentication",
    description: "Required MFA for all user accounts with multiple authentication methods"
  },
  {
    icon: <UserCheck className="h-5 w-5" />,
    title: "Role-Based Access Control",
    description: "Granular permissions ensure users only access what they need"
  },
  {
    icon: <Eye className="h-5 w-5" />,
    title: "Audit Logging",
    description: "Comprehensive audit trails for all system access and data changes"
  },
  {
    icon: <Database className="h-5 w-5" />,
    title: "Data Backup & Recovery",
    description: "Automated daily backups with point-in-time recovery capabilities"
  },
  {
    icon: <Cloud className="h-5 w-5" />,
    title: "Secure Cloud Infrastructure",
    description: "Hosted on AWS with enterprise-grade security controls"
  },
  {
    icon: <AlertTriangle className="h-5 w-5" />,
    title: "Threat Detection",
    description: "24/7 monitoring with automated threat detection and response"
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: "Data Loss Prevention",
    description: "Advanced DLP policies prevent unauthorized data exposure"
  }
];

const hipaaCompliance = [
  {
    title: "Administrative Safeguards",
    items: [
      "Security Officer designation and responsibilities",
      "Workforce training and access management",
      "Information system activity review",
      "Assigned security responsibilities",
      "Business Associate Agreements (BAAs)"
    ]
  },
  {
    title: "Physical Safeguards",
    items: [
      "Facility access controls",
      "Workstation use restrictions",
      "Device and media controls",
      "Secure data center locations",
      "Environmental monitoring"
    ]
  },
  {
    title: "Technical Safeguards",
    items: [
      "Access control (unique user identification)",
      "Audit controls and logging",
      "Integrity of ePHI protection",
      "Transmission security protocols",
      "Encryption of data at rest and in transit"
    ]
  }
];

const dataHandling = [
  {
    phase: "Data Collection",
    description: "Minimal data collection with explicit consent",
    controls: [
      "Purpose limitation principle",
      "Data minimization practices",
      "Explicit user consent",
      "Transparent privacy notices"
    ]
  },
  {
    phase: "Data Processing",
    description: "Secure processing with audit trails",
    controls: [
      "Encrypted processing environments",
      "Access logging and monitoring",
      "Data integrity checks",
      "Processing purpose validation"
    ]
  },
  {
    phase: "Data Storage",
    description: "Encrypted storage with backup redundancy",
    controls: [
      "AES-256 encryption at rest",
      "Geographically distributed backups",
      "Retention policy enforcement",
      "Secure deletion procedures"
    ]
  },
  {
    phase: "Data Transmission",
    description: "Secure transmission protocols",
    controls: [
      "TLS 1.3 encryption in transit",
      "Certificate pinning",
      "VPN for administrative access",
      "API security authentication"
    ]
  }
];

// --- MODULAR COMPONENTS ---

const Section = ({ children, className = '' }) => (
  <section className={`py-20 md:py-28 ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  </section>
);

const SectionTitle = ({ children, className = '' }) => (
    <h2 className={`text-4xl lg:text-5xl font-semibold text-gray-900 text-center tracking-tight ${className}`}>
        {children}
    </h2>
);

const SectionSubtitle = ({ children, className = '' }) => (
    <p className={`mt-4 text-lg text-gray-600 max-w-3xl mx-auto text-center leading-relaxed ${className}`}>
        {children}
    </p>
);

const SecurityHeroSection = () => (
  <Section className="bg-white pt-32 pb-20 md:pt-40 md:pb-28">
    <div className="max-w-4xl mx-auto text-center">
      <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-medium text-gray-600 border-gray-300 rounded-full">
        Security & Compliance
      </Badge>
      <h1 className="text-5xl lg:text-7xl font-semibold text-gray-900 mb-6 leading-tight tracking-tight">
        Your Data is <span className="text-gray-900">Secure</span>
      </h1>
      <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
        Doxxy implements enterprise-grade security measures to protect your practice and patient data with the highest level of security.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" asChild className="bg-gray-900 text-white hover:bg-gray-700 rounded-lg px-8 py-3 text-base font-medium transition-colors">
          <Link to="/contact">Security Consultation</Link>
        </Button>
        <Button variant="outline" size="lg" className="border-gray-300 text-gray-900 hover:bg-gray-100 rounded-lg px-8 py-3 text-base font-medium transition-colors">
          Download Security Whitepaper
        </Button>
      </div>
    </div>
  </Section>
);

const SecurityCertificationsSection = ({ certifications }) => (
  <Section className="bg-gray-50">
    <SectionTitle>Security Certifications</SectionTitle>
    <SectionSubtitle>We maintain industry-leading certifications to ensure the highest standards of security and compliance.</SectionSubtitle>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
      {certifications.map((cert, index) => (
        <Card key={index} className="p-6 text-center bg-white border border-gray-200 rounded-xl">
          <CardHeader className="p-0 mb-4">
            <div className="mx-auto mb-3 flex items-center justify-center">
              {cert.icon}
            </div>
            <CardTitle className="text-lg font-medium text-gray-900">{cert.title}</CardTitle>
            <Badge
              className={`mt-2 mx-auto px-3 py-1 rounded-full text-xs font-medium ${cert.status === "Certified" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
            >
              {cert.status}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-600 text-sm leading-relaxed">
              {cert.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  </Section>
);

const SecurityFeaturesSection = ({ features }) => (
  <Section className="bg-white">
    <SectionTitle>Comprehensive Security Features</SectionTitle>
    <SectionSubtitle>Comprehensive security controls protecting your data at every level.</SectionSubtitle>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
      {features.map((feature, index) => (
        <Card key={index} className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-gray-200 rounded-lg text-gray-600 flex-shrink-0">
              {feature.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </Section>
);

const HIPAAComplianceSection = ({ safeguards }) => (
  <Section className="bg-gray-50">
    <SectionTitle>HIPAA Compliance</SectionTitle>
    <SectionSubtitle>Doxxy is fully compliant with HIPAA regulations, ensuring the utmost privacy and security for patient health information.</SectionSubtitle>
    <div className="grid md:grid-cols-3 gap-6 mt-16">
      {safeguards.map((category, index) => (
        <Card key={index} className="p-6 bg-white border border-gray-200 rounded-xl">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg font-medium text-gray-900">{category.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="space-y-2">
              {category.items.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  </Section>
);

const DataHandlingLifecycleSection = ({ dataHandlingPhases }) => (
  <Section className="bg-white">
    <SectionTitle>Secure Data Lifecycle</SectionTitle>
    <SectionSubtitle>Every stage of data handling is secured with multiple layers of protection.</SectionSubtitle>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
      {dataHandlingPhases.map((phase, index) => (
        <Card key={index} className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
          <CardHeader className="p-0 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-medium text-lg mx-auto mb-4">
              {index + 1}
            </div>
            <CardTitle className="text-lg font-medium text-center text-gray-900">{phase.phase}</CardTitle>
            <CardDescription className="text-center text-sm text-gray-600 leading-relaxed">{phase.description}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="space-y-2">
              {phase.controls.map((control, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 leading-relaxed">{control}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  </Section>
);

const SecurityMonitoringSection = () => (
  <Section className="bg-gray-50">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <SectionTitle className="!text-left !text-4xl">24/7 Security Monitoring</SectionTitle>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Our Security Operations Center (SOC) provides round-the-clock monitoring
          and threat detection to protect your practice from evolving cyber threats.
        </p>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-gray-200 rounded-lg">
              <Zap className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Real-time Threat Detection</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Advanced AI-powered monitoring identifies and responds to threats in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2 bg-gray-200 rounded-lg">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Expert Security Team</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Certified security professionals monitor and respond to incidents 24/7.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2 bg-gray-200 rounded-lg">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Incident Response</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Rapid incident response with detailed forensics and remediation plans.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1551808525-51a94da548ce?w=600&h=500&fit=crop"
          alt="Security monitoring dashboard"
          className="rounded-xl border border-gray-200"
        />
        <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-900">99.9%</div>
            <div className="text-sm text-gray-600">Threat Detection Rate</div>
          </div>
        </div>
      </div>
    </div>
  </Section>
);

// --- MAIN SECURITY PAGE ---

const Security = () => {
  return (
    <div className="font-sans antialiased text-gray-900">
      <SecurityHeroSection />
      <SecurityCertificationsSection certifications={certifications} />
      <SecurityFeaturesSection features={securityFeatures} />
      <HIPAAComplianceSection safeguards={hipaaCompliance} />
      <DataHandlingLifecycleSection dataHandlingPhases={dataHandling} />
      <SecurityMonitoringSection />
      <SignupCTA />
      <SiteFooter />
    </div>
  );
};

export default Security;