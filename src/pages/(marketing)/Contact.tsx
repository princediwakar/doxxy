import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, 
  Phone, 
  Calendar,
  CheckCircle
} from 'lucide-react';
import SignupCTA from "@/components/SignupCTA";
import SiteFooter from "@/components/SiteFooter";
import { getSupabase } from "@/integrations/supabase/client";

// --- REUSABLE COMPONENTS ---

const Section = ({ children, className = '' }) => (
  <section className={`py-24 md:py-32 ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  </section>
);

const SectionTitle = ({ children, className = '' }) => (
  <h2 className={`text-4xl md:text-5xl font-bold text-gray-900 dark:text-white text-center ${className}`}>
    {children}
  </h2>
);

const SectionSubtitle = ({ children, className = '' }) => (
  <p className={`text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center ${className}`}>
    {children}
  </p>
);

// --- MODULAR SUBCOMPONENTS ---

const HeroSection = () => (
  <Section className="text-center !pt-28 md:!pt-40">
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      We're Here to Help.
    </h1>
    <SectionSubtitle>
      Have questions about Doxxy? Our team of healthcare technology experts is ready to help you transform your practice.
    </SectionSubtitle>
  </Section>
);

const ThankYouMessage = ({ onSendAnother }) => (
  <div className="max-w-md mx-auto text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50">
    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
      <CheckCircle className="h-7 w-7 text-blue-600 dark:text-blue-400" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
      Thank You!
    </h3>
    <p className="text-gray-600 dark:text-gray-300 mb-6">
      We've received your message and will get back to you within 24 hours.
    </p>
    <Button onClick={onSendAnother} className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-xl py-3 text-base font-semibold">
      Send Another Message
    </Button>
  </div>
);

const ContactForm = ({ formData, handleChange, handleSubmit, isSubmitting, error }) => (
  <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">Send us a Message</h3>
    <p className="text-gray-600 dark:text-gray-300 text-center mb-8">Fill out the form below and we'll get back to you within 24 hours.</p>
    
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message *</label>
        <Textarea
          id="message"
          required
          rows={5}
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          placeholder="Tell us more about your practice and how we can help..."
          className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 rounded-lg p-3"
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Dr. John Smith"
            className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 rounded-lg p-3"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="john@example.com"
            className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 rounded-lg p-3"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+91 80-1234-5678"
            className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 rounded-lg p-3"
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Practice/Organization Name</label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            placeholder="ABC Medical Center"
            className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 rounded-lg p-3"
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Bengaluru"
            className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 rounded-lg p-3"
          />
        </div>
      </div>
      {error && (
        <div className="text-red-500 dark:text-red-400 mb-4 text-sm">
          {error}
        </div>
      )}
      <Button 
        type="submit" 
        size="lg" 
        className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-xl py-3 text-base font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  </div>
);

const ContactInfoCard = ({ icon: Icon, title, details, description }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50">
    <div className="flex items-start space-x-4">
      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
        {details.map((detail, idx) => (
          <p key={idx} className="text-gray-700 dark:text-gray-300 font-medium">{detail}</p>
        ))}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{description}</p>
      </div>
    </div>
  </div>
);


const FAQItem = ({ question, answer }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/75 dark:border-gray-700/50">
    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">{question}</h3>
    <p className="text-gray-600 dark:text-gray-300">{answer}</p>
  </div>
);

// --- MAIN PAGE COMPONENT ---

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    city: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const supabase = getSupabase();
      
      // Call the RPC function to submit the contact form
      const { data, error: rpcError } = await supabase.rpc('submit_contact_form', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        city: formData.city || null,
        message: formData.message
      });
      
      if (rpcError) {
        throw new Error(rpcError.message || 'Failed to submit form');
      }
      
      console.log('Contact form submitted successfully with ID:', data);
      
      // Send email notification via Edge Function
      try {
        const emailResponse = await supabase.functions.invoke('send-contact-email', {
          body: {
            record: {
              id: data,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              company: formData.company,
              city: formData.city,
              message: formData.message,
              created_at: new Date().toISOString()
            }
          }
        });
        
        if (emailResponse.error) {
          console.error('Failed to send email notification:', emailResponse.error);
          // Don't throw error here - form submission was successful, email is just a bonus
        } else {
          console.log('Email notification sent successfully:', emailResponse.data);
        }
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't throw error here - form submission was successful, email is just a bonus
      }
      
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        city: '',
        message: '',
      });
    } catch (err) {
      console.error('Contact form error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactInfo = [
      {
        icon: Phone,
        title: "Call Us",
        details: ["+91 7388890554"],
        description: "Speak directly with our team during business hours"
      },
    {
      icon: Mail,
      title: "Email Us",
      details: ["doxxyapp@gmail.com"],
      description: "Get in touch via email for support or sales inquiries"
    },
    
  ];


  const faqs = [
    {
      question: "How quickly can I get started with Doxxy?",
      answer: "Most practices are up and running within 15 minutes. Our onboarding team will guide you through the entire setup process."
    },
    {
      question: "Do you offer data migration services?",
      answer: "Yes, we provide free data migration from most popular healthcare management systems. Our technical team handles the entire process."
    },
    {
      question: "What kind of support do you provide?",
      answer: "We offer 24/7 technical support, dedicated account managers for Enterprise clients, and comprehensive training resources."
    },
    {
      question: "Is Doxxy suitable for small practices?",
      answer: "Absolutely! Our Practice Essentials plan is free for your first 100 appointments and specifically designed for solo practitioners and small clinics."
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
      {isSubmitted ? (
        <ThankYouMessage onSendAnother={() => {
          setFormData({
            name: '',
            email: '',
            phone: '',
            company: '',
            city: '',
            message: '',
          });
          setIsSubmitted(false);
        }} />
      ) : (
        <>
          <HeroSection />
          <Section className="bg-gray-50 dark:bg-gray-800/50">
            <div className="grid lg:grid-cols-3 gap-8">
              <ContactForm 
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                error={error}
              />
              <div className="space-y-8">
                {contactInfo.map((info, index) => (
                  <ContactInfoCard key={index} {...info} />
                ))}
                {/* Quick Demo CTA */}
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
          </Section>

          {/* Global Offices (Commented) */}
          {/* <Section>
            <SectionTitle>Our Global Offices</SectionTitle>
            <SectionSubtitle className="mt-4">Visit us in person or reach out to our local teams.</SectionSubtitle>
            <div className="grid md:grid-cols-2 gap-8 mt-16">
              {offices.map((office, index) => (
                <OfficeCard key={index} {...office} />
              ))}
            </div>
          </Section> */}

          <Section className="bg-gray-50 dark:bg-gray-800/50">
            <SectionTitle>Frequently Asked Questions.</SectionTitle>
            <SectionSubtitle className="mt-4">Quick answers to common questions about Doxxy.</SectionSubtitle>
            <div className="max-w-3xl mx-auto mt-16 space-y-8">
              {faqs.map((faq, index) => (
                <FAQItem key={index} {...faq} />
              ))}
            </div>
          </Section>
        </>
      )}
      <SignupCTA />
      <SiteFooter />
    </div>
  );
};

export default Contact;