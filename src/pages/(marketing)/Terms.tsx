// src/pages/Terms.tsx
import React from 'react';

// Helper component for consistent section styling
const SectionContainer = ({ children, className = '' }) => (
  <section className={`py-16 md:py-20 ${className}`}>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  </section>
);

// Modular component for the header
const TermsHeader = ({ title, effectiveDate }) => (
  <SectionContainer className="bg-white pt-24 md:pt-32 pb-8 md:pb-12">
    <h1 className="text-4xl lg:text-5xl font-semibold text-gray-900 mb-4 leading-tight tracking-tight">
      {title}
    </h1>
    <p className="text-sm uppercase tracking-wide text-gray-500">
      Effective Date: {effectiveDate}
    </p>
  </SectionContainer>
);

// Modular component for each terms section
const TermsSection = ({ title, children, isList = false }) => (
  <SectionContainer className="bg-white border-t border-gray-200">
    <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-6 leading-snug">
      {title}
    </h2>
    {isList ? (
      <ul className="list-disc list-inside space-y-4 text-lg text-gray-600 leading-relaxed">
        {children}
      </ul>
    ) : (
      <p className="text-lg text-gray-600 leading-relaxed">
        {children}
      </p>
    )}
  </SectionContainer>
);

// Modular component for contact information
const TermsContactInfo = ({ children }) => (
  <SectionContainer className="bg-white border-t border-gray-200">
    <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-6 leading-snug">
      Contact
    </h2>
    <p className="text-lg text-gray-600 leading-relaxed">
      {children}
    </p>
  </SectionContainer>
);

export default function TermsPage() {
  return (
    <div className="font-sans antialiased text-gray-900">
      <TermsHeader
        title="Terms of Service for Doxxy"
        effectiveDate="08-06-2025"
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
      </TermsSection>

      <TermsSection title="4. Account Responsibilities">
        You are responsible for maintaining the confidentiality of login credentials for all user accounts under your clinic. You must notify Doxxy immediately upon any suspected breach, unauthorized use, or loss of credentials. Doxxy is not liable for damages arising from account misuse caused by your failure to secure access credentials.
      </TermsSection>

      <TermsSection title="5. Data Rights and Ownership">
        All patient and clinical data entered by your organization remains your property. Doxxy acts as a data processor and provides tools for management, access, and retrieval. You are solely responsible for obtaining consent, ensuring legal basis for data collection, and honoring patient data rights under applicable data protection laws.
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
        All medical and patient information is considered strictly confidential. We implement encryption, access controls, and audit logging. Our handling of data complies with our Privacy Policy and relevant laws including GDPR (EU), and DPDP (India).
      </TermsSection>

      <TermsSection title="11. Third-party Integrations">
        The platform may offer integrations with third-party services (e.g., payment gateways, diagnostic labs). We are not liable for data loss, security breaches, or issues arising from such external services. Usage of third-party tools is subject to their respective terms and policies.
      </TermsSection>

      <TermsSection title="12. Limitation of Liability">
        Doxxy is not responsible for indirect, incidental, or consequential damages, including but not limited to data loss, service interruptions, or reputational harm. Our total liability under these Terms will not exceed the fees paid by you in the preceding six months of the claim.
      </TermsSection>

      <TermsSection title="13. Indemnification">
        You agree to indemnify and hold harmless Doxxy, its directors, employees, and partners from any claims, damages, or legal actions arising from your breach of these Terms, violation of any law, or misuse of the platform.
      </TermsSection>

      <TermsSection title="14. Governing Law and Jurisdiction">
        These Terms are governed by the laws of India. All disputes will be subject to the exclusive jurisdiction of courts located in Mumbai, Maharashtra, regardless of your location or country of operation.
      </TermsSection>

      <TermsSection title="15. Updates to the Terms">
        We may revise these Terms at any time. If material changes are made, we will notify you through the Service or via your registered email. Continued use after changes constitutes acceptance of the updated Terms.
      </TermsSection>

      <TermsContactInfo>
        For any legal, operational, or technical questions, contact:
        <br />
        Doxxy <br />
        Mumbai, India <br />
        Email: doxxy@neurovisionhospital.com
      </TermsContactInfo>
    </div>
  );
}