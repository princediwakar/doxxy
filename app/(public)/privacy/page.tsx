// src/pages/Privacy.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doxxy Privacy Policy - Clinic Management Software Data Protection',
  description: 'Doxxy privacy policy outlines how we collect, use, and protect your data. We are committed to transparency and safeguarding patient health information.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Doxxy Privacy Policy - Clinic Management Software Data Protection',
    description: 'How we collect, use, and protect your data',
    images: [
      {
        url: '/doxxy.png',
        width: 1200,
        height: 630,
        alt: 'Doxxy Privacy Policy - Clinic Management Software',
      },
    ],
  },
  keywords: ['doxxy privacy policy', 'clinic management software privacy', 'healthcare data protection', 'medical practice privacy policy'],
}

// Helper component for consistent section styling
interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
}

const SectionContainer = ({ children, className = '' }: SectionContainerProps) => (
  <section className={`py-16 md:py-20 ${className}`}>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  </section>
);

// Modular component for the header
interface PrivacyHeaderProps {
  title: string;
  effectiveDate: string;
}

const PrivacyHeader = ({ title, effectiveDate }: PrivacyHeaderProps) => (
  <SectionContainer className="bg-background pt-24 md:pt-32 pb-8 md:pb-12">
    <h1 className="text-4xl lg:text-5xl font-semibold text-foreground mb-4 leading-tight tracking-tight">
      {title}
    </h1>
    <p className="text-sm uppercase tracking-wide text-muted-foreground">
      Effective Date: {effectiveDate}
    </p>
  </SectionContainer>
);

// Modular component for each privacy section
interface PrivacySectionProps {
  title: string;
  children: React.ReactNode;
  isList?: boolean;
}

const PrivacySection = ({ title, children, isList = false }: PrivacySectionProps) => (
  <SectionContainer className="bg-background border-t border-border">
    <h2 className="text-2xl lg:text-3xl font-semibold text-foreground mb-6 leading-snug">
      {title}
    </h2>
    {isList ? (
      <ul className="list-disc list-inside space-y-4 text-lg text-muted-foreground leading-relaxed">
        {children}
      </ul>
    ) : (
      <p className="text-lg text-muted-foreground leading-relaxed">
        {children}
      </p>
    )}
  </SectionContainer>
);

// Modular component for contact information
interface PrivacyContactInfoProps {
  children: React.ReactNode;
}

const PrivacyContactInfo = ({ children }: PrivacyContactInfoProps) => (
  <SectionContainer className="bg-background border-t border-border">
    <h2 className="text-2xl lg:text-3xl font-semibold text-foreground mb-6 leading-snug">
      Contact
    </h2>
    <p className="text-lg text-muted-foreground leading-relaxed">
      {children}
    </p>
  </SectionContainer>
);

export default function PrivacyPage() {
  return (
    <div className="font-sans antialiased text-foreground">
      <PrivacyHeader
        title="Privacy Policy for Doxxy"
        effectiveDate="08-06-2025"
      />

      <PrivacySection title="1. Scope">
        This policy applies to all users of Doxxy including healthcare professionals, clinic staff, and patients.
      </PrivacySection>

      <PrivacySection title="2. Information We Collect" isList>
        <li><strong>Patient Information:</strong> Name, contact, DOB, gender, medical history, prescriptions, reports, appointment records.</li>
        <li><strong>Doctor and Staff Information:</strong> Name, contact, specialization, license details, consultation history.</li>
        <li><strong>Administrative Data:</strong> Billing records, payment metadata, clinic subscription status.</li>
        <li><strong>Technical Data:</strong> Device identifiers, IP address, usage logs, error reports.</li>
        <li><strong>Communication:</strong> Messages, support queries, feedback forms.</li>
      </PrivacySection>

      <PrivacySection title="3. Purpose of Data Processing">
        We use data to deliver core Doxxy services, ensure secure healthcare workflows, comply with medical regulations, and enhance operational performance.
      </PrivacySection>

      <PrivacySection title="4. Legal Basis">
        Processing is based on consent, contract necessity, legal obligations, and our legitimate interests in providing secure clinic management software.
      </PrivacySection>

      <PrivacySection title="5. Data Sharing" isList>
        <li>Access controlled sharing with authorized clinic personnel</li>
        <li>Third-party vendors under confidentiality and compliance agreements</li>
        <li>Regulatory authorities under legal mandate</li>
        <li>Patient-initiated consent-based sharing (e.g., insurance)</li>
      </PrivacySection>

      <PrivacySection title="6. Data Retention">
        Health records are retained per medical law. Metadata is retained for operational and compliance purposes. Deletion requests are honored where legally permitted.
      </PrivacySection>

      <PrivacySection title="7. Data Security" isList>
        <li>Encryption at rest and in transit</li>
        <li>Role-based access controls (RBAC)</li>
        <li>Regular audits and vulnerability patching</li>
        <li>Secure cloud infrastructure</li>
      </PrivacySection>

      <PrivacySection title="8. Your Rights">
        You can request access, correction, deletion, or export of your data. Contact us at doxxy@neurovisionhospital.com for any data rights request.
      </PrivacySection>

      <PrivacySection title="9. Children's Privacy">
        Doxxy does not knowingly collect data from individuals under 18 without verified guardian consent. Clinics must verify and document such consent.
      </PrivacySection>

      <PrivacySection title="10. International Transfers">
        Data transfers outside your jurisdiction comply with applicable cross-border data protection laws and safeguards (e.g., localization, SCCs).
      </PrivacySection>

      <PrivacySection title="11. Compliance" isList>
        <li>India: Digital Personal Data Protection Act, 2023 (DPDP)</li>
        <li>EU: General Data Protection Regulation (GDPR)</li>
      </PrivacySection>

      <PrivacySection title="12. Policy Updates">
        Material updates will be communicated through the platform or registered email. Continued use after changes constitutes acceptance.
      </PrivacySection>

      <PrivacyContactInfo>
        For questions or data rights requests, contact:
        <br />
        Doxxy <br />
        Mumbai, India <br />
        Email: doxxy@neurovisionhospital.com <br />
      </PrivacyContactInfo>
    </div>
  );
}