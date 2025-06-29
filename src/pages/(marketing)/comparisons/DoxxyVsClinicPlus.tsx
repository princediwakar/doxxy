import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  ArrowRight,
  DollarSign,
  Users,
  Shield,
  Calendar,
  Clock,
  Zap,
  BarChart3,
  Stethoscope,
  FileText,
  MessageSquare,
  Smartphone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteFooter from '@/components/SiteFooter';
import SignupCTA from '@/components/SignupCTA';

const DoxxyVsClinicPlus = () => {
  const comparisonPoints = [
    {
      feature: "Pricing Model",
      doxxy: "Pay-per-appointment (₹10/appointment)",
      clinicPlus: "One-time purchase + annual maintenance fees",
      advantage: "Lower upfront cost, pay only for what you use",
      icon: <DollarSign className="h-6 w-6 text-blue-600" />
    },
    {
      feature: "Deployment",
      doxxy: "Cloud-based (SaaS)",
      clinicPlus: "On-premise software",
      advantage: "Access from anywhere, no IT maintenance required",
      icon: <Zap className="h-6 w-6 text-blue-600" />
    },
    {
      feature: "Updates & Upgrades",
      doxxy: "Automatic, continuous updates",
      clinicPlus: "Manual updates, often paid upgrades",
      advantage: "Always on the latest version with new features",
      icon: <Calendar className="h-6 w-6 text-blue-600" />
    },
    {
      feature: "Accessibility",
      doxxy: "Web and native mobile apps (iOS/Android)",
      clinicPlus: "Desktop application only",
      advantage: "Work from any device, anywhere",
      icon: <Smartphone className="h-6 w-6 text-blue-600" />
    },
    {
      feature: "Data Security & Backup",
      doxxy: "Automated cloud backups, enterprise-grade security",
      clinicPlus: "Manual backups, security depends on local setup",
      advantage: "Your data is always safe and accessible",
      icon: <Shield className="h-6 w-6 text-blue-600" />
    },
    {
      feature: "Multi-Clinic Support",
      doxxy: "Built-in multi-location management",
      clinicPlus: "Complex setup or separate licenses required",
      advantage: "Easily manage multiple branches from one dashboard",
      icon: <Stethoscope className="h-6 w-6 text-blue-600" />
    },
    {
      feature: "Support",
      doxxy: "24/7 online and phone support",
      clinicPlus: "Limited hours, often email-based support",
      advantage: "Get help whenever you need it",
      icon: <MessageSquare className="h-6 w-6 text-blue-600" />
    }
  ];

  const painPoints = [
    {
      title: "High Upfront Costs",
      clinicPlus: "ClinicPlus requires a significant one-time purchase fee, making it a large initial investment.",
      doxxy: "Doxxy's pay-per-appointment model means you have minimal upfront costs and only pay as you grow."
    },
    {
      title: "Lack of Remote Access",
      clinicPlus: "Being an on-premise solution, ClinicPlus can only be accessed from the clinic's computers.",
      doxxy: "Doxxy is cloud-based, allowing you to manage your practice from anywhere, on any device."
    },
    {
      title: "Manual Updates & Maintenance",
      clinicPlus: "With ClinicPlus, you're responsible for software updates, backups, and IT maintenance.",
      doxxy: "Doxxy handles all updates, backups, and security automatically, so you can focus on patient care."
    },
    {
      title: "Limited Scalability",
      clinicPlus: "Scaling ClinicPlus for multiple locations or growing practices can be complex and expensive.",
      doxxy: "Doxxy is designed for scalability, easily supporting multiple clinics and unlimited doctors without complex setups."
    }
  ];

  const testimonials = [
    {
      quote: "Switching from ClinicPlus to Doxxy was a game-changer. We no longer worry about server maintenance or manual updates. Everything just works!",
      name: "Dr. Anjali Singh",
      clinic: "Prime Care Clinic, Delhi",
      photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop"
    },
    {
      quote: "The mobile app for Doxxy is fantastic. I can manage appointments and view patient records on the go, which was impossible with our old ClinicPlus system.",
      name: "Dr. Rohan Mehta",
      clinic: "City Hospital, Bengaluru",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            Comparison
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Doxxy vs
            <span className="text-blue-600"> ClinicPlus</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Compare Doxxy's modern, cloud-based approach with ClinicPlus's traditional software model.
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

      {/* Key Differences */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Key Differences
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how Doxxy compares to ClinicPlus across important features and deployment models.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-6 text-left text-gray-600 font-medium">Feature</th>
                  <th className="py-4 px-6 text-left text-blue-600 font-medium">Doxxy</th>
                  <th className="py-4 px-6 text-left text-gray-600 font-medium">ClinicPlus</th>
                  <th className="py-4 px-6 text-left text-gray-600 font-medium">Doxxy Advantage</th>
                </tr>
              </thead>
              <tbody>
                {comparisonPoints.map((point, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-4 px-6 border-t flex items-center">
                      <div className="mr-3">{point.icon}</div>
                      <span className="font-medium">{point.feature}</span>
                    </td>
                    <td className="py-4 px-6 border-t text-gray-800">
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        {point.doxxy}
                      </div>
                    </td>
                    <td className="py-4 px-6 border-t text-gray-600">{point.clinicPlus}</td>
                    <td className="py-4 px-6 border-t text-gray-600">{point.advantage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Common Pain Points with ClinicPlus
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              How Doxxy solves the most common challenges faced by ClinicPlus users.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {painPoints.map((point, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl">{point.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-600"><span className="font-medium">ClinicPlus:</span> {point.clinicPlus}</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-600"><span className="font-medium">Doxxy:</span> {point.doxxy}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Migration Process */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Seamless Migration from ClinicPlus
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Switching from ClinicPlus to Doxxy is simple and hassle-free. Our migration specialists handle the entire process:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Check className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Data Export & Import</p>
                    <p className="text-gray-600">We'll help you export your data from ClinicPlus and import it into Doxxy.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Check className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Staff Training</p>
                    <p className="text-gray-600">Comprehensive training for your entire team to ensure a smooth transition.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Check className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Parallel Operation</p>
                    <p className="text-gray-600">Run both systems side by side during transition to ensure no disruption.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Check className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Dedicated Support</p>
                    <p className="text-gray-600">Personalized support throughout the migration process.</p>
                  </div>
                </li>
              </ul>
              <div className="mt-8">
                <Button asChild>
                  <Link to="/contact">Schedule Migration Consultation</Link>
                </Button>
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=500&fit=crop"
                alt="Team working on migration"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Doctors Who Switched Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from healthcare professionals who switched from ClinicPlus to Doxxy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8">
                <CardContent className="space-y-4">
                  <blockquote className="text-lg text-gray-600 italic">"{testimonial.quote}"</blockquote>
                  <div className="flex items-center">
                    <img
                      src={testimonial.photo}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-gray-600">{testimonial.clinic}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Feature Comparison
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how Doxxy and ClinicPlus compare across key features.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-6 text-left text-gray-600 font-medium">Feature</th>
                  <th className="py-4 px-6 text-center text-blue-600 font-medium">Doxxy</th>
                  <th className="py-4 px-6 text-center text-gray-600 font-medium">ClinicPlus</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-4 px-6 border-t font-medium">Pricing Model</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-6 border-t font-medium">Cloud-Based</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-t font-medium">Automatic Updates</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-6 border-t font-medium">Mobile Apps</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-t font-medium">Multi-Clinic Management</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-6 border-t font-medium">24/7 Support</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <SignupCTA />
      <SiteFooter />
    </div>
  );
};

export default DoxxyVsClinicPlus;
