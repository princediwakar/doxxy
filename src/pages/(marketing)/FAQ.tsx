import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Phone, 
  BookOpen,
  Users,
  CreditCard,
  Shield,
  Settings,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SignupCTA from "@/components/SignupCTA";
import SiteFooter from "@/components/SiteFooter";

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const categories = [
    { id: 'general', name: 'General', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'getting-started', name: 'Getting Started', icon: <Zap className="h-5 w-5" /> },
    { id: 'billing', name: 'Billing & Pricing', icon: <CreditCard className="h-5 w-5" /> },
    { id: 'security', name: 'Security & Privacy', icon: <Shield className="h-5 w-5" /> },
    { id: 'technical', name: 'Technical Support', icon: <Settings className="h-5 w-5" /> },
    { id: 'integration', name: 'Integration', icon: <Users className="h-5 w-5" /> },
  ];

  const faqs = [
    {
      category: 'general',
      question: 'What is Doxxy and how does it help healthcare practices?',
      answer: 'Doxxy is a cloud-based clinic-management platform built for outpatient practices. It combines patient registration, queue & appointment scheduling, digital prescriptions, basic reporting, and multi-clinic administration in a single, easy-to-use interface.'
    },
    {
      category: 'general',
      question: 'Which types of healthcare practices can use Doxxy?',
      answer: 'Doxxy is perfectly designed for small to medium-sized clinics and practices. Our platform offers the ideal balance of powerful features and simplicity that small clinics need without the complexity and cost of enterprise systems. While it can scale to larger organizations, Doxxy truly shines in environments with 1-10 doctors where efficiency and affordability are key priorities.'
    },
    {
      category: 'getting-started',
      question: 'How quickly can I get started with Doxxy?',
      answer: 'Sign-up takes less than five minutes—no credit card required. The Practice Essentials plan gives you access to all essential features for your first 100 appointments so you can experience the platform before upgrading.'
    },
    {
      category: 'getting-started',
      question: 'Do you provide training for my staff?',
      answer: 'Yes! We offer comprehensive training programs including live training sessions, video tutorials, documentation, and ongoing support. Our training covers all aspects of the platform and can be customized for different roles in your practice.'
    },
    {
      category: 'getting-started',
      question: 'Can you migrate data from our existing system?',
      answer: 'Yes. We support CSV import for patients, visits, and prescriptions. A guided wizard helps you map columns—no expensive "data-migration package" required.'
    },
    {
      category: 'billing',
      question: 'What are your pricing plans?',
      answer: 'Doxxy keeps pricing simple:\n• Practice Essentials – FREE for the first 100 lifetime appointments.\n• Clinical Excellence – ₹10 per appointment (discounted from ₹20), unlimited doctors & locations.\nThere are no yearly commitments or hidden add-ons.'
    },
    {
      category: 'billing',
      question: 'Is there a setup fee or long-term contract?',
      answer: 'No. Pay only for what you use once you cross the 100-appointment threshold. You can downgrade, upgrade, or cancel at any time.'
    },
    {
      category: 'billing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), bank transfers, and digital payments. For Enterprise clients, we also offer invoice-based billing with NET 30 terms.'
    },
    
    {
      category: 'security',
      question: 'How do you protect patient data?',
      answer: 'We use enterprise-grade security including AES-256 encryption, multi-factor authentication, role-based access controls, and audit logging. Our infrastructure is hosted on secure cloud servers.'
    },
    {
      category: 'security',
      question: 'Where is my data stored and backed up?',
      answer: 'Your data is stored in secure, geographically distributed data centers with automated daily backups. We maintain multiple backup copies with point-in-time recovery capabilities. Data centers are located in the US and comply with all healthcare regulations.'
    },
    {
      category: 'technical',
      question: 'What devices and browsers are supported?',
      answer: 'Doxxy works on all modern devices and browsers including Chrome, Firefox, Safari, and Edge. We also provide native mobile apps for iOS and Android. The platform is fully responsive and works seamlessly on desktops, tablets, and smartphones.'
    },
    {
      category: 'technical',
      question: 'Do you offer 24/7 technical support?',
      answer: 'Yes, we provide 24/7 technical support via phone, email, and live chat. Emergency support is available for critical issues. Professional and Enterprise plans include priority support with dedicated account managers.'
    },
    {
      category: 'technical',
      question: 'What is your system uptime guarantee?',
      answer: 'We guarantee 99.9% uptime with our Service Level Agreement (SLA). Our robust infrastructure and redundant systems ensure maximum availability. We also provide real-time status updates and maintenance notifications.'
    },
    {
      category: 'integration',
      question: 'Can Doxxy integrate with other healthcare systems?',
      answer: 'Yes, Doxxy supports integration with major healthcare systems including laboratories (LabCorp, Quest), imaging centers, pharmacies, and insurance systems. We also provide APIs for custom integrations and support HL7 FHIR standards.'
    },
    {
      category: 'integration',
      question: 'Can I connect Doxxy to my accounting software?',
      answer: 'Yes, we integrate with popular accounting software including QuickBooks, Xero, and FreshBooks. This allows for seamless financial reporting and reconciliation between your practice management and accounting systems.'
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedFaqs = categories.map(category => ({
    ...category,
    faqs: filteredFaqs.filter(faq => faq.category === category.id)
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            Help Center
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Frequently Asked
            <span className="text-primary"> Questions</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find quick answers to common questions about Doxxy. 
            Can't find what you're looking for? Our support team is here to help.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-12">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search frequently asked questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-6 text-lg"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {groupedFaqs.map(category => (
            <div key={category.id} className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {category.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
              </div>
              
              <div className="space-y-4">
                {category.faqs.map((faq, index) => {
                  const globalIndex = faqs.indexOf(faq);
                  const isOpen = openItems.includes(globalIndex);
                  
                  return (
                    <Card key={globalIndex} className="overflow-hidden">
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 pr-4">
                            {faq.question}
                          </h3>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-6">
                          <p className="text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredFaqs.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any FAQs matching "{searchTerm}". 
                Try different keywords or contact our support team.
              </p>
              <Button asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Still have questions?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Our support team is available 24/7 to help you with any questions or issues.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="text-center">
                          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get instant help from our support team
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Start Chat
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-center">
                          <div className="mx-auto mb-4 p-3 bg-success/10 rounded-full w-fit">
            <Phone className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Speak directly with our experts
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  +1 (555) 123-4567
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-center">
                          <div className="mx-auto mb-4 p-3 bg-secondary/10 rounded-full w-fit">
            <BookOpen className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Browse our comprehensive guides
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Docs
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <SignupCTA />
      <SiteFooter />
    </div>
  );
};

export default FAQ; 