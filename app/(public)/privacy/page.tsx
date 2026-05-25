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
        effectiveDate="24-05-2026"
      />

      <PrivacySection title="1. Scope">
        This policy applies to all users of Doxxy including healthcare professionals, clinic staff, and patients.
      </PrivacySection>

      <PrivacySection title="2. Information We Collect" isList>
        <li><strong>Patient Information:</strong> Name, contact, DOB, gender, medical history, prescriptions, reports, appointment records, WhatsApp messaging consent and opt-out preferences.</li>
        <li><strong>Doctor and Staff Information:</strong> Name, contact, specialization, license details, consultation history.</li>
        <li><strong>Administrative Data:</strong> Billing records, payment metadata, clinic subscription status.</li>
        <li><strong>Technical Data:</strong> Device identifiers, IP address, usage logs, error reports.</li>
        <li><strong>Communication:</strong> Messages, support queries, feedback forms.</li>
        <li><strong>Location Data:</strong> Google Place IDs for clinics and doctors, collected via Google Places Autocomplete to generate review links and identify business locations.</li>
        <li><strong>WhatsApp Integration Data:</strong> When a clinic connects their WhatsApp Business Account via Meta Embedded Signup, we store WhatsApp Business Account IDs, phone number IDs, display phone numbers, and OAuth access tokens issued by Meta.</li>
      </PrivacySection>

      <PrivacySection title="3. Purpose of Data Processing">
        We use data to deliver core Doxxy services — including appointment management, billing, prescriptions, and consultation notes. We also facilitate optional WhatsApp-based communication to send bills, consultation summaries, and post-appointment review requests to patients who have consented. Google Place IDs are used to generate clinic and doctor review links. WhatsApp Business Account credentials are used solely to send messages on behalf of the connected clinic.
      </PrivacySection>

      <PrivacySection title="4. Legal Basis">
        Processing is based on consent, contract necessity, legal obligations, and our legitimate interests in providing secure clinic management software.
      </PrivacySection>

      <PrivacySection title="5. Data Sharing" isList>
        <li>Access controlled sharing with authorized clinic personnel</li>
        <li>Third-party vendors under confidentiality and compliance agreements</li>
        <li>Regulatory authorities under legal mandate</li>
        <li>Patient-initiated consent-based sharing (e.g., insurance)</li>
        <li><strong>Meta Platforms, Inc. (WhatsApp):</strong> When a clinic uses WhatsApp messaging features, patient phone numbers, names, doctor names, and PDF documents (bills, consultation notes) are transmitted to Meta's WhatsApp Cloud API to deliver messages. Meta processes this data per its own <a href="https://www.whatsapp.com/legal/privacy-policy" className="underline" target="_blank" rel="noopener noreferrer">WhatsApp Privacy Policy</a> and <a href="https://www.facebook.com/legal/terms/Meta-SP-BM" className="underline" target="_blank" rel="noopener noreferrer">Meta Business Tools Terms</a>.</li>
        <li><strong>Google LLC (Places API):</strong> Clinic and doctor location data is processed through Google Places Autocomplete to resolve Google Place IDs. Google processes this data per its <a href="https://policies.google.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.</li>
      </PrivacySection>

      <PrivacySection title="6. WhatsApp Communication & Automated Messaging" isList>
        <li>Clinics may optionally connect their WhatsApp Business Account via Meta Embedded Signup. This connection stores OAuth tokens and WhatsApp Business Account metadata to enable messaging from the clinic's own WhatsApp number.</li>
        <li>With patient consent, Doxxy may send bills, consultation summaries, and post-appointment review requests via WhatsApp. Each message is triggered by a specific clinical event (e.g., appointment completion) — never sent unsolicited.</li>
        <li>Patients may opt out of WhatsApp messages at any time by replying "Stop" or tapping the "Stop reminders" button within a WhatsApp message. Opt-out preferences are honoured immediately and apply to all future WhatsApp communication from the same clinic.</li>
        <li>Review request messages are rate-limited: a patient will not receive more than one review request per 90-day period per clinic, and duplicates to the same Google Place ID are prevented.</li>
        <li>We do not use WhatsApp for marketing, promotional content, or chatbot conversations. All automated WhatsApp messages are Utility category templates fulfilling a transactional healthcare purpose.</li>
      </PrivacySection>

      <PrivacySection title="7. Data Retention">
        Health records are retained per medical law. Metadata is retained for operational and compliance purposes. Deletion requests are honored where legally permitted.
      </PrivacySection>

      <PrivacySection title="8. Data Security" isList>
        <li>Encryption at rest and in transit</li>
        <li>Role-based access controls (RBAC)</li>
        <li>Regular audits and vulnerability patching</li>
        <li>Secure cloud infrastructure</li>
      </PrivacySection>

      <PrivacySection title="9. Your Rights">
        You can request access, correction, deletion, or export of your data — including WhatsApp opt-out preferences, stored Google Place IDs, and WhatsApp connection credentials. To opt out of WhatsApp messages, reply "Stop" to any WhatsApp message from the clinic, or contact us at team@doxxy.in for any data rights request.
      </PrivacySection>

      <PrivacySection title="10. Children's Privacy">
        Doxxy does not knowingly collect data from individuals under 18 without verified guardian consent. Clinics must verify and document such consent.
      </PrivacySection>

      <PrivacySection title="11. International Transfers">
        Data transfers outside your jurisdiction — including to Meta (WhatsApp) servers and Google (Places API) servers, which may be located globally — comply with applicable cross-border data protection laws and safeguards (e.g., localization, SCCs). Meta and Google each maintain their own data transfer frameworks; please refer to their respective privacy policies for details.
      </PrivacySection>

      <PrivacySection title="12. Compliance" isList>
        <li>India: Digital Personal Data Protection Act, 2023 (DPDP)</li>
        <li>EU: General Data Protection Regulation (GDPR)</li>
        <li>WhatsApp messaging complies with Meta's <a href="https://www.whatsapp.com/legal/business-policy" className="underline" target="_blank" rel="noopener noreferrer">WhatsApp Business Messaging Policy</a> and <a href="https://developers.facebook.com/policy" className="underline" target="_blank" rel="noopener noreferrer">Meta Platform Policies</a>.</li>
        <li>Google Places Autocomplete usage complies with the <a href="https://cloud.google.com/maps-platform/terms" className="underline" target="_blank" rel="noopener noreferrer">Google Maps Platform Terms of Service</a>.</li>
      </PrivacySection>

      <PrivacySection title="13. Policy Updates">
        Material updates will be communicated through the platform or registered email. Continued use after changes constitutes acceptance.
      </PrivacySection>

      <PrivacyContactInfo>
        Doxxy is a product of Supersite Technologies Private Limited.
        <br /><br />
        For questions or data rights requests, contact:
        <br />
        Doxxy <br />
        Mumbai, India <br />
        Email: team@doxxy.in <br />
      </PrivacyContactInfo>
    </div>
  );
}