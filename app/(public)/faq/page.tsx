import type { Metadata } from 'next';
import { FAQInteractive } from '@/components/public/FAQInteractive';
import { Button } from '@/components/ui/button';
import SignupCTA from '@/components/SignupCTA';
import Script from 'next/script';
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import Link from 'next/link';
import { MessageSquare, Phone, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — Doxxy',
  description: 'Common questions about Doxxy clinic management software — pricing, features, support, and getting started.',
  alternates: {
    canonical: '/faq',
  },
};

const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Doxxy and how does it help healthcare practices?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doxxy is a cloud-based clinic-management platform built for outpatient practices. It combines patient registration, queue and appointment scheduling, digital prescriptions, clinical notes, billing, inventory, and multi-clinic administration in a single, easy-to-use interface.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which types of healthcare practices can use Doxxy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doxxy is designed for small to medium-sized outpatient clinics, including general practice, cardiology, dermatology, orthopaedics, paediatrics, gynaecology, and multi-specialty clinics. Solo practitioners and multi-clinic chains both benefit.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does Doxxy cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doxxy offers a free Practice Essentials plan for your first 100 consultations. After that, the Clinical Excellence plan costs ₹10 per consultation with no per-doctor fees, no annual contracts, and no hidden charges.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use Doxxy for multiple clinic locations?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Doxxy supports multi-clinic management. You can add unlimited clinics, each with its own doctors, staff, patients, appointments, and financials — all managed from a single account with role-based access.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my patient data secure with Doxxy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Doxxy uses bank-level encryption for data in transit and at rest, runs on secure cloud infrastructure, and follows Indian healthcare data protection standards. Role-based access controls ensure only authorized staff see sensitive information.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Doxxy support WhatsApp and SMS reminders?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. On the Clinical Excellence plan, Doxxy sends automated appointment reminders, bills, and prescriptions via WhatsApp and SMS. This reduces no-shows and speeds up payment collection.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I migrate my existing patient data to Doxxy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Doxxy provides free data migration from most popular clinic management systems. Our technical team handles the entire process to ensure your patient records, appointments, and billing history transfer smoothly.',
      },
    },
    {
      '@type': 'Question',
      name: 'What support does Doxxy provide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doxxy offers 24/7 support via live chat, phone (+91 73888-90554), and email (prince@supersite.app). We also provide a comprehensive knowledge base with step-by-step guides for doctors, staff, and administrators.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to install any software?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Doxxy is fully cloud-based and works in any modern web browser. There is no software to install or maintain. You can access your clinic from any device — desktop, laptop, or tablet.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel my subscription anytime?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Doxxy has no long-term contracts or cancellation fees. You can cancel anytime. We believe in earning your business every month through great product and service, not locking you in.',
      },
    },
  ],
};

export default function FAQPage() {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
      <FAQInteractive />

      <section className="py-24 md:py-32 bg-gray-50 dark:bg-gray-800/50 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white text-center">
            Still have questions?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center mt-4">
            Our support team is available 24/7 to help you with any questions or issues.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Live Chat</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Get instant help from our support team
              </p>
              <Button variant="outline" size="lg" className="w-full rounded-xl py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600">
                Start Chat
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Call Us</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Speak directly with our experts
              </p>
              <Button variant="outline" size="lg" className="w-full rounded-xl py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600">
                +91 73888-90554
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200/75 dark:border-gray-700/50">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Documentation</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Browse our comprehensive guides
              </p>
              <Button variant="outline" size="lg" className="w-full rounded-xl py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600">
                View Docs
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SignupCTA
        heading="Still Have Questions? Ask Us Directly."
        description="Chat with us on WhatsApp. Real answers from real people — not a chatbot, not a knowledge base."
      />
      <Script
        id="faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "FAQ", url: `${APP_URL}/faq` },
        ]}
      />
    </div>
  );
}
