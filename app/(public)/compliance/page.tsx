// app/(public)/compliance/page.tsx
import type { Metadata } from 'next';
import { APP_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: 'Compliance — Doxxy by Supersite Technologies',
  description: 'Doxxy compliance information — company details, WhatsApp Business Messaging Policy compliance, and pharmaceutical disclaimer.',
  alternates: { canonical: '/compliance' },
  openGraph: {
    title: 'Compliance — Doxxy by Supersite Technologies',
    description: 'Company details and platform compliance information',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy Compliance' }],
  },
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="py-8">
    <h2 className="text-xl font-semibold text-foreground mb-4">{title}</h2>
    <div className="text-muted-foreground leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function CompliancePage() {
  return (
    <div className="font-sans antialiased text-foreground">
      <section className="bg-background pt-24 md:pt-32 pb-8 md:pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-semibold text-foreground mb-4 leading-tight tracking-tight">
            Compliance
          </h1>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Platform compliance and company information
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Section title="Company Information">
          <p>
            Doxxy is a product of <strong>Supersite Technologies Private Limited</strong>,
            a company incorporated under the Companies Act, 2013, with its registered office
            in Mumbai, Maharashtra, India.
          </p>
          <p>
            Contact: <a href="mailto:prince@supersite.app" className="underline">prince@supersite.app</a>
          </p>
        </Section>

        <Section title="Jurisdiction">
          <p>
            <strong>Doxxy operates exclusively in India.</strong> All services are
            intended for clinics and patients located within the Republic of India.
            We do not offer services outside Indian jurisdiction. Patient data is
            stored on servers in India and is governed by India's Digital Personal
            Data Protection Act, 2023 (DPDP Act).
          </p>
        </Section>

        <Section title="Platform Nature">
          <p>
            Doxxy is a clinical documentation and practice management platform for
            healthcare clinics in India. We provide software tools for appointment
            scheduling, clinical note-taking, billing, and patient communication.
          </p>
          <p>
            <strong>Doxxy does not sell, dispense, or facilitate the sale of
            pharmaceutical products, medical devices, or supplements.</strong> We are
            not a pharmacy, an online pharmacy marketplace, or a pharmaceutical
            distributor. The medications section within consultation notes is clinical
            documentation of the treating doctor&apos;s treatment plan — it is not a
            prescription fulfillment or drug commerce feature.
          </p>
        </Section>

        <Section title="WhatsApp Business Messaging Compliance">
          <p>
            Doxxy integrates with the WhatsApp Business Platform (Cloud API) to send
            transactional clinical communications on behalf of healthcare providers.
            All WhatsApp messages sent through Doxxy are:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Manually triggered by clinic staff after a specific patient visit — no bulk sending, no automated drip campaigns.</li>
            <li>Sent from the clinic&apos;s own verified WhatsApp Business number via Meta Embedded Signup.</li>
            <li>Transactional in nature (visit summaries, invoices, post-consultation feedback) — never marketing or promotional.</li>
            <li>Subject to patient opt-in and opt-out. Patients can reply STOP to block all future messages.</li>
          </ul>
          <p>
            Doxxy complies with the{" "}
            <a
              href="https://www.whatsapp.com/legal/business-policy"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Business Messaging Policy
            </a>
            , the{" "}
            <a
              href="https://www.whatsapp.com/legal/business-terms"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Business Terms of Service
            </a>
            , and the{" "}
            <a
              href="https://www.whatsapp.com/legal/messaging-guidelines"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Messaging Guidelines
            </a>
            .
          </p>
        </Section>

        <Section title="Data Protection">
          <p>
            Doxxy encrypts all patient data at rest (AES-256) and in transit (TLS 1.3).
            Our data handling practices comply with the Digital Personal Data Protection
            Act, 2023 (India). For details, see our{" "}
            <a href="/privacy" className="underline">Privacy Policy</a>.
          </p>
        </Section>
      </div>
    </div>
  );
}
