// src/pages/Privacy.tsx

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-sm leading-relaxed text-gray-800">
      <h1 className="text-3xl font-semibold mb-6">Privacy Policy for Doxxy</h1>
      <p className="mb-6">Effective Date: 08-06-2025</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Scope</h2>
        <p>This policy applies to all users of Doxxy including healthcare professionals, clinic staff, and patients.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Patient Information:</strong> Name, contact, DOB, gender, medical history, prescriptions, reports, appointment records.</li>
          <li><strong>Doctor and Staff Information:</strong> Name, contact, specialization, license details, consultation history.</li>
          <li><strong>Administrative Data:</strong> Billing records, payment metadata, clinic subscription status.</li>
          <li><strong>Technical Data:</strong> Device identifiers, IP address, usage logs, error reports.</li>
          <li><strong>Communication:</strong> Messages, support queries, feedback forms.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">3. Purpose of Data Processing</h2>
        <p>We use data to deliver core Doxxy services, ensure secure healthcare workflows, comply with medical regulations, and enhance operational performance.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">4. Legal Basis</h2>
        <p>Processing is based on consent, contract necessity, legal obligations, and our legitimate interests in providing secure clinic management software.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">5. Data Sharing</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Access controlled sharing with authorized clinic personnel</li>
          <li>Third-party vendors under confidentiality and compliance agreements</li>
          <li>Regulatory authorities under legal mandate</li>
          <li>Patient-initiated consent-based sharing (e.g., insurance)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">6. Data Retention</h2>
        <p>Health records are retained per medical law. Metadata is retained for operational and compliance purposes. Deletion requests are honored where legally permitted.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">7. Data Security</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Encryption at rest and in transit</li>
          <li>Role-based access controls (RBAC)</li>
          <li>Regular audits and vulnerability patching</li>
          <li>Secure cloud infrastructure</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">8. Your Rights</h2>
        <p>You can request access, correction, deletion, or export of your data. Contact us at doxxy@neurovisionhospital.com for any data rights request.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">9. Children's Privacy</h2>
        <p>Doxxy does not knowingly collect data from individuals under 18 without verified guardian consent. Clinics must verify and document such consent.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">10. International Transfers</h2>
        <p>Data transfers outside your jurisdiction comply with applicable cross-border data protection laws and safeguards (e.g., localization, SCCs).</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">11. Compliance</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>India: Digital Personal Data Protection Act, 2023 (DPDP)</li>
          <li>USA: Health Insurance Portability and Accountability Act (HIPAA)</li>
          <li>EU: General Data Protection Regulation (GDPR)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">12. Policy Updates</h2>
        <p>Material updates will be communicated through the platform or registered email. Continued use after changes constitutes acceptance.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">13. Contact</h2>
        <p>
          For questions or data rights requests, contact:
          <br />
          Doxxy <br />
          Mumbai, India <br />
          Email: doxxy@neurovisionhospital.com <br />
        </p>
      </section>
    </div>
  );
}
