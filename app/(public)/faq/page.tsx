import { FAQInteractive } from '@/components/public/FAQInteractive';
import { Button } from '@/components/ui/button';
import SignupCTA from '@/components/SignupCTA';
import SiteFooter from '@/components/SiteFooter';
import Script from 'next/script';
import Link from 'next/link';
import { MessageSquare, Phone, BookOpen } from 'lucide-react';

const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Doxxy and how does it help healthcare practices?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doxxy is a cloud-based clinic-management platform built for outpatient practices. It combines patient registration, queue & appointment scheduling, digital prescriptions, basic reporting, and multi-clinic administration in a single, easy-to-use interface.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which types of healthcare practices can use Doxxy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Doxxy is perfectly designed for small to medium-sized clinics and practices.',
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

      <SignupCTA />
      <SiteFooter />
      <Script
        id="faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </div>
  );
}
