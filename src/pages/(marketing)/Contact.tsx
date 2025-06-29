import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Users, 
  Building2,
  Globe,
  Calendar,
  CheckCircle
} from 'lucide-react';
import SignupCTA from "@/components/SignupCTA";
import SiteFooter from "@/components/SiteFooter";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    city: '',
    subject: '',
    message: '',
    meetingType: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { data, error } = await fetch('/api/submit-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          company: formData.company || null,
          city: formData.city || null,
          subject: formData.subject || null,
          message: formData.message,
          meeting_type: formData.meetingType || null
        }),
      }).then(res => res.json());
      
      if (error) {
        throw new Error(error.message || 'Failed to submit form');
      }
      
      setIsSubmitted(true);
    } catch (err) {
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
        icon: <Phone className="h-6 w-6" />,
        title: "Call Us",
        details: ["+91 7388890554"],
        description: "Speak directly with our team during business hours"
      },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Us",
      details: ["doxxyapp@gmail.com"],
      description: "Get in touch via email for support or sales inquiries"
    },
    
  ];

  const offices = [
    {
      city: "Bengaluru",
      country: "India",
      address: "Koramangala, Bengaluru, Karnataka 560034",
      phone: "+91 7388890554",
      email: "doxxyapp@gmail.com",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
    },
    {
      city: "Delhi", 
      country: "India",
      address: "Connaught Place, New Delhi, Delhi 110001",
      phone: "+91 7388890554",
      email: "doxxyapp@gmail.com",
      image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop"
    }
  ];

  const faqs = [
    {
      question: "How quickly can I get started with Doxxy?",
      answer: "Most practices are up and running within 24-48 hours. Our onboarding team will guide you through the entire setup process."
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
        <Card className="max-w-md mx-auto text-center p-8">
          <div className="mx-auto mb-6 p-3 bg-green-100 rounded-full w-fit">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
            Thank You!
          </CardTitle>
          <CardDescription className="text-gray-600 mb-6">
            We've received your message and will get back to you within 24 hours. 
            A member of our team will contact you soon.
          </CardDescription>
          <Button onClick={() => setIsSubmitted(false)} className="w-full">
            Send Another Message
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            Get in Touch
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            We're Here to
            <span className="text-blue-600"> Help</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Have questions about Doxxy? Want to schedule a demo? Our team of healthcare 
            technology experts is ready to help you transform your practice.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className=" px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-8">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Message Sent Successfully!
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Thank you for reaching out. We'll get back to you within 24 hours at {formData.email}.
                      </p>
                      <Button onClick={() => {
                        setFormData({
                          name: '',
                          email: '',
                          phone: '',
                          company: '',
                          city: '',
                          subject: '',
                          message: '',
                          meetingType: ''
                        });
                        setIsSubmitted(false);
                      }}>
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <Textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        placeholder="Tell us more about your practice and how we can help..."
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">

                    

                      <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Practice/Organization Name
                      </label>
                      <Input
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        placeholder="ABC Medical Center"
                      />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <Input
                          value={formData.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                          placeholder="Bengaluru"
                        />
                      </div>
                      <div>
                    
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <Input
                          required
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          placeholder="Dr. John Smith"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          placeholder="+91 80-1234-5678"
                        />
                      </div>
                     
                    </div>

                  




                    {error && (
                      <div className="text-red-500 mb-4 text-sm">
                        {error}
                      </div>
                    )}
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                                      </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {info.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-blue-600 font-medium">{detail}</p>
                      ))}
                      <p className="text-sm text-gray-600 mt-2">{info.description}</p>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Quick Demo CTA */}
              <Card className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <div className="text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Book a Demo</h3>
                  <p className="text-sm opacity-90 mb-4">
                    See Doxxy in action with a personalized demo
                  </p>
                  <Button variant="secondary" size="sm" className="w-full">
                    Schedule Now
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Global Offices */}
      {/* <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Global Offices
            </h2>
            <p className="text-lg text-gray-600">
              Visit us in person or reach out to our local teams.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {offices.map((office, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  src={office.image} 
                  alt={`${office.city} office`}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {office.city}, {office.country}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {office.address}
                    </p>
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {office.phone}
                    </p>
                    <p className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {office.email}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Quick answers to common questions about Doxxy.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <SignupCTA />
      <SiteFooter />
    </div>
  );
};

export default Contact; 