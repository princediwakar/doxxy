// src/pages/Terms.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doxxy Terms of Service - Clinic Management Software Agreement',
  description: 'Doxxy terms of service outline the agreement between users and our clinic management software platform. Please read carefully before using our services.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Doxxy Terms of Service - Clinic Management Software Agreement',
    description: 'Agreement between users and our clinic management software platform',
    images: [
      {
        url: '/doxxy.png',
        width: 1200,
        height: 630,
        alt: 'Doxxy Terms of Service - Clinic Management Software',
      },
    ],
  },
  keywords: ['doxxy terms of service', 'clinic management software agreement', 'healthcare software terms', 'medical practice terms'],
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
interface TermsHeaderProps {
  title: string;
  effectiveDate: string;
}

const TermsHeader = ({ title, effectiveDate }: TermsHeaderProps) => (
  <SectionContainer className="bg-background pt-24 md:pt-32 pb-8 md:pb-12">
    <h1 className="text-4xl lg:text-5xl font-semibold text-foreground mb-4 leading-tight tracking-tight">
      {title}
    </h1>
    <p className="text-sm uppercase tracking-wide text-muted-foreground">
      Effective Date: {effectiveDate}
    </p>
  </SectionContainer>
);

// Modular component for each terms section
interface TermsSectionProps {
  title: string;
  children: React.ReactNode;
  isList?: boolean;
}

const TermsSection = ({ title, children, isList = false }: TermsSectionProps) => (
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
interface TermsContactInfoProps {
  children: React.ReactNode;
}

const TermsContactInfo = ({ children }: TermsContactInfoProps) => (
  <SectionContainer className="bg-background border-t border-border">
    <h2 className="text-2xl lg:text-3xl font-semibold text-foreground mb-6 leading-snug">
      Contact
    </h2>
    <p className="text-lg text-muted-foreground leading-relaxed">
      {children}
    </p>
  </SectionContainer>
);

export default function TermsPage() {
  return (
    <div className="font-sans antialiased text-foreground">
      <TermsHeader
        title="Terms of Service for Doxxy"
        effectiveDate="24-05-2026"
      />

      <TermsSection title="1. Acceptance of Terms">
        By registering for, accessing, or using any part of the Doxxy platform, including its web and mobile applications, APIs, and associated services (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not use the Service.
      </TermsSection>

      <TermsSection title="2. Eligibility">
        You must be at least 18 years old and legally authorized to represent a healthcare clinic, hospital, or licensed medical professional to use Doxxy for patient management. We do not permit use by minors or individuals acting without valid medical credentials or authorization.
      </TermsSection>

      <TermsSection title="3. Use of the Service" isList>
        <li>You may use the Service solely for lawful, clinical, administrative, and diagnostic purposes as permitted under applicable law.</li>
        <li>You must ensure that all information entered into the system is accurate, up-to-date, and maintained as part of proper medical records.</li>
        <li>You must not use the Service to store or transmit infringing, libelous, or unlawful content.</li>
        <li>You must not disrupt or compromise the system's integrity, performance, or security.</li>
        <li>When using WhatsApp messaging features, you must comply with Meta's <a href="https://www.whatsapp.com/legal/business-policy" className="underline" target="_blank" rel="noopener noreferrer">WhatsApp Business Messaging Policy</a> and must not send marketing, promotional, or unsolicited messages. Only transactional, healthcare-related messages are permitted.</li>
        <li>You must honour patient opt-out requests for WhatsApp communication immediately and must not attempt to circumvent rate limits or duplicate-message protections.</li>
      </TermsSection>

      <TermsSection title="4. Account Responsibilities">
        You are responsible for maintaining the confidentiality of login credentials for all user accounts under your clinic. You must notify Doxxy immediately upon any suspected breach, unauthorized use, or loss of credentials. Doxxy is not liable for damages arising from account misuse caused by your failure to secure access credentials.
      </TermsSection>

      <TermsSection title="5. Data Rights and Ownership">
        All patient and clinical data entered by your organization — including Google Place IDs you associate with clinics or doctors, patient WhatsApp consent and opt-out preferences, and WhatsApp Business Account credentials you connect via Embedded Signup — remains your property. Doxxy acts as a data processor and provides tools for management, access, and retrieval. You are solely responsible for obtaining patient consent for WhatsApp communication (including an opt-in mechanism), ensuring legal basis for all data collection, and honoring patient data rights under applicable data protection laws.
      </TermsSection>

      <TermsSection title="6. Subscriptions, Billing, and Payment" isList>
        <li>Some features of Doxxy are offered under a paid subscription model. You agree to pay applicable fees based on your selected plan.</li>
        <li>All invoices must be settled within the billing cycle. Failure to pay may result in service suspension or termination.</li>
        <li>We may update pricing, features, or billing terms by providing advance notice to your registered email address.</li>
      </TermsSection>

      <TermsSection title="7. Intellectual Property">
        The Doxxy software, branding, UI/UX, source code, documentation, and all proprietary technology are protected by copyright, trademark, and intellectual property laws. You are granted a non-transferable, non-exclusive license to use the platform within your organization. You may not duplicate, resell, reverse-engineer, or create derivative works without written permission.
      </TermsSection>

      <TermsSection title="8. Service Availability and Maintenance">
        We strive to maintain 99.9% uptime but do not guarantee uninterrupted availability. Planned maintenance, force majeure events, cyberattacks, or outages may disrupt access. We will notify users of major scheduled downtimes in advance and take reasonable efforts to restore services swiftly in case of disruptions.
      </TermsSection>

      <TermsSection title="9. Termination" isList>
        <li>We reserve the right to terminate or suspend your access for violations of these Terms, misuse, legal enforcement requests, or failure to pay dues.</li>
        <li>Clinics may terminate their account by written request. Upon termination, data will be retained for 30 days for export before permanent deletion unless legally required to retain it longer.</li>
      </TermsSection>

      <TermsSection title="10. Confidentiality and Data Protection">
        All medical and patient information is considered strictly confidential. We implement encryption at rest and in transit, access controls, and audit logging. When WhatsApp messaging is enabled, patient phone numbers, names, doctor names, and PDF summaries are transmitted to Meta's WhatsApp Cloud API for message delivery; this transmission is encrypted in transit but is no longer under Doxxy's control once received by Meta. Our handling of data complies with our Privacy Policy and relevant laws including GDPR (EU) and DPDP (India).
      </TermsSection>

      <TermsSection title="11. Third-party Integrations" isList>
        <li>The platform offers integrations with third-party services including but not limited to Meta's WhatsApp Cloud API (for messaging) and Google's Places API (for location autocomplete and Place ID resolution). We are not liable for data loss, security breaches, or service interruptions arising from these external services.</li>
        <li>WhatsApp messaging usage is subject to Meta's <a href="https://www.whatsapp.com/legal/business-policy" className="underline" target="_blank" rel="noopener noreferrer">WhatsApp Business Messaging Policy</a>, <a href="https://developers.facebook.com/policy" className="underline" target="_blank" rel="noopener noreferrer">Meta Platform Policies</a>, and the <a href="https://www.facebook.com/legal/terms/Meta-SP-BM" className="underline" target="_blank" rel="noopener noreferrer">Meta Business Tools Terms</a>.</li>
        <li>Google Places usage is subject to <a href="https://cloud.google.com/maps-platform/terms" className="underline" target="_blank" rel="noopener noreferrer">Google Maps Platform Terms of Service</a> and <a href="https://policies.google.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.</li>
        <li>When you connect your WhatsApp Business Account via Meta Embedded Signup, you authorize Doxxy to send messages on your behalf using your WhatsApp Business number. You are responsible for maintaining your WhatsApp Business Account in good standing with Meta and for any messages sent from your number.</li>
      </TermsSection>

      <TermsSection title="12. WhatsApp Messaging Terms" isList>
        <li><strong>Patient Consent Required:</strong> You must obtain explicit consent from patients before sending them WhatsApp messages through Doxxy. The platform provides consent tracking fields (<code>whatsapp_consent</code>) that you are responsible for populating accurately.</li>
        <li><strong>Opt-Out Compliance:</strong> When a patient opts out of WhatsApp communication (by replying "Stop" or using the "Stop reminders" button), Doxxy automatically updates their opt-out preference. You must not manually override or circumvent these opt-out preferences.</li>
        <li><strong>Message Content:</strong> WhatsApp messages sent through Doxxy are limited to transactional healthcare communications — bills (as PDF invoices), consultation summaries, and post-appointment review requests. Marketing, promotional content, or unsolicited bulk messaging is strictly prohibited.</li>
        <li><strong>Rate Limiting:</strong> The platform enforces a 90-day cooldown between review requests per patient and prevents duplicate review requests to the same Google Place ID. You must not attempt to bypass these protections.</li>
        <li><strong>Google Review Links:</strong> Review links are generated from Google Place IDs you provide. You are responsible for ensuring the Place ID is accurate, corresponds to the correct clinic or doctor, and complies with Google's policies regarding review solicitation.</li>
        <li><strong>WhatsApp Business Account:</strong> Each clinic connects its own WhatsApp Business Account via Meta Embedded Signup. You are responsible for keeping your WhatsApp Business Account compliant with Meta's policies, maintaining your WABA in good standing, and understanding that message quality ratings and any Meta-imposed restrictions apply to your number.</li>
      </TermsSection>

      <TermsSection title="13. Limitation of Liability">
        Doxxy is not responsible for indirect, incidental, or consequential damages, including but not limited to data loss, service interruptions, message delivery failures caused by Meta's WhatsApp Cloud API or Google's Places API, or reputational harm. Our total liability under these Terms will not exceed the fees paid by you in the preceding six months of the claim.
      </TermsSection>

      <TermsSection title="14. Indemnification">
        You agree to indemnify and hold harmless Doxxy, its directors, employees, and partners from any claims, damages, or legal actions arising from your breach of these Terms, violation of any law, or misuse of the platform.
      </TermsSection>

      <TermsSection title="15. Governing Law and Jurisdiction">
        These Terms are governed by the laws of India. All disputes will be subject to the exclusive jurisdiction of courts located in Mumbai, Maharashtra, regardless of your location or country of operation.
      </TermsSection>

      <TermsSection title="16. Updates to the Terms">
        We may revise these Terms at any time. If material changes are made, we will notify you through the Service or via your registered email. Continued use after changes constitutes acceptance of the updated Terms.
      </TermsSection>

      <TermsContactInfo>
        Doxxy is a product of Supersite Technologies Private Limited.
        <br /><br />
        For any legal, operational, or technical questions, contact:
        <br />
        Doxxy <br />
        Mumbai, India <br />
        Email: team@doxxy.in
      </TermsContactInfo>
    </div>
  );
}