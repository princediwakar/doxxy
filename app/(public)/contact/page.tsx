import type { Metadata } from 'next';
import Script from 'next/script';
import { ContactForm } from '@/components/public/ContactForm';
import { Button } from '@/components/ui/button';
import SignupCTA from '@/components/SignupCTA';
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Mail, Phone, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Doxxy — Get in Touch',
  description: 'Contact the Doxxy team for support, sales, or partnership inquiries. Reach us by phone, email, or book a demo.',
  alternates: {
    canonical: '/contact',
  },
};

const contactInfo = [
  {
    icon: Phone,
    title: 'Call Us',
    details: ['+91 7388890554'],
    description: 'Speak directly with our team during business hours',
  },
  {
    icon: Mail,
    title: 'Email Us',
    details: ['prince@supersite.app'],
    description: 'Get in touch via email for support or sales inquiries',
  },
];

const faqs = [
  {
    question: 'How quickly can I get started with Doxxy?',
    answer: 'Most practices are up and running within 15 minutes. Our onboarding team will guide you through the entire setup process.',
  },
  {
    question: 'Do you offer data migration services?',
    answer: 'Yes, we provide free data migration from most popular healthcare management systems. Our technical team handles the entire process.',
  },
  {
    question: 'What kind of support do you provide?',
    answer: 'We offer 24/7 technical support, dedicated account managers for Enterprise clients, and comprehensive training resources.',
  },
  {
    question: 'Is Doxxy suitable for small practices?',
    answer: 'Absolutely! Our Practice Essentials plan is free for your first 100 appointments and specifically designed for solo practitioners and small clinics.',
  },
];

export default function ContactPage() {
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
      <section className="py-24 md:py-32 text-center !pt-28 md:!pt-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
            We&apos;re Here to Help.
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center">
            Have questions about Doxxy? Our team of healthcare technology experts is ready to help you transform your practice.
          </p>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <ContactForm />

            <div className="space-y-8">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{info.title}</h3>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-gray-700 dark:text-gray-300 font-medium">{detail}</p>
                        ))}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{info.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50 text-center">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Book a Demo</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  See Doxxy in action with a personalized demo
                </p>
                <Button size="lg" className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-xl py-3 text-base font-semibold">
                  Schedule Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white text-center">
            Frequently Asked Questions.
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center mt-4">
            Quick answers to common questions about Doxxy.
          </p>
          <div className="max-w-3xl mx-auto mt-16 space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SignupCTA />

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Contact", url: `${APP_URL}/contact` },
        ]}
      />
      <Script
        id="contact-faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </div>
  );
}
