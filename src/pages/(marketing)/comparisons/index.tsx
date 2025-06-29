import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  DollarSign,
  Shield,
  Zap,
  BarChart3,
  FileText,
  MessageSquare,
  Smartphone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteFooter from "@/components/SiteFooter";
import SignupCTA from '@/components/SignupCTA';

const ComparisonIndex = () => {
  const comparisons = [
    {
      title: "Doxxy vs Eka Care",
      description: "See how Doxxy's innovative pricing model and comprehensive feature set provides better value for healthcare practices compared to Eka Care.",
      icon: <DollarSign className="h-8 w-8 text-blue-600" />,
      link: "/comparisons/doxxy-vs-eka-care",
      badge: "Most Popular"
    },
    {
      title: "Doxxy vs Practo",
      description: "See how Doxxy's dedicated clinic management platform offers better value and a more streamlined experience compared to Practo.",
      icon: <Shield className="h-8 w-8 text-purple-600" />,
      link: "/comparisons/doxxy-vs-practo"
    },
    {
      title: "Doxxy vs ClinicPlus",
      description: "Compare Doxxy's modern, cloud-based approach with ClinicPlus's traditional software model & discover why Doxxy is better.",
      icon: <Smartphone className="h-8 w-8 text-orange-600" />,
      link: "/comparisons/doxxy-vs-clinicplus"
    },
    {
      title: "Doxxy vs Lybrate",
      description: "Learn why Doxxy provides a more comprehensive clinic management solution compared to Lybrate's consultation-focused platform.",
      icon: <MessageSquare className="h-8 w-8 text-red-600" />,
      link: "/comparisons/doxxy-vs-lybrate"
    },
    {
      title: "Doxxy vs MFine",
      description: "Discover how Doxxy's hybrid approach to in-clinic and telemedicine appointments offers more flexibility than MFine's telemedicine-centric model.",
      icon: <FileText className="h-8 w-8 text-indigo-600" />,
      link: "/comparisons/doxxy-vs-mfine"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            Comparisons
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            How Doxxy
            <span className="text-blue-600"> Compares</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            See how Doxxy stacks up against other healthcare management platforms.
            Discover why our transparent pricing and comprehensive feature set make us the preferred choice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth">
                Start Free Practice
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Comparisons Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Detailed Comparisons
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've created detailed, feature-by-feature comparisons to help you make an informed decision.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {comparisons.map((comparison, index) => (
              <Link key={index} to={comparison.link} className="block">
                <Card className="hover:shadow-lg transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      {comparison.icon}
                      {comparison.badge && (
                        <Badge className="bg-blue-600">{comparison.badge}</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{comparison.title}</CardTitle>
                    <CardDescription className="text-gray-600">{comparison.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-blue-600 font-medium">
                      Read Comparison
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Compare Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Compare Healthcare Platforms?
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Choosing the right healthcare management software is a critical decision that impacts your practice's efficiency, patient experience, and bottom line. Our comparison guides help you:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Understand Pricing Models</p>
                    <p className="text-gray-600">See how different pricing structures affect your practice's costs as you grow.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Evaluate Feature Sets</p>
                    <p className="text-gray-600">Compare essential features across platforms to ensure you get what you need.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Assess Implementation Ease</p>
                    <p className="text-gray-600">Understand how much time and effort is required to get up and running.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Read User Experiences</p>
                    <p className="text-gray-600">Learn from healthcare professionals who have already made the switch.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=500&fit=crop" 
                alt="Doctor comparing healthcare platforms" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Our team is ready to help you compare Doxxy with any healthcare management platform you're currently using or considering.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/contact">Contact Our Team</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/faq">View FAQ</Link>
            </Button>
          </div>
        </div>
      </section>

      <SignupCTA />
      <SiteFooter />
    </div>
  );
};

export default ComparisonIndex;
