import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  X, 
  ArrowRight, 
  DollarSign, 
  Calendar,
  Stethoscope,
  FileText,
  CreditCard,
  Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteFooter from '@/components/SiteFooter';
import SignupCTA from '@/components/SignupCTA';

const DoxxyVsLybrate = () => {
  const comparisonPoints = [
    {
      feature: "Primary Focus",
      doxxy: "Comprehensive Clinic Management",
      lybrate: "Online Doctor Consultations",
      advantage: "Manage all aspects of your practice, not just consultations",
      icon: <Stethoscope className="h-6 w-6 text-primary" />
    },
    {
      feature: "Pricing Model",
      doxxy: "Pay-per-appointment (₹10/appointment)",
      lybrate: "Commission-based on consultations",
      advantage: "Predictable costs, no hidden commissions",
      icon: <DollarSign className="h-6 w-6 text-primary" />
    },
    {
      feature: "Patient Records",
      doxxy: "Comprehensive EMR with medical history, prescriptions, lab results",
      lybrate: "Limited to consultation notes and basic patient info",
      advantage: "Full patient history at your fingertips",
      icon: <FileText className="h-6 w-6 text-primary" />
    },
    {
      feature: "Appointment Management",
      doxxy: "Smart scheduling for in-clinic and online appointments",
      lybrate: "Primarily online appointment booking",
      advantage: "Manage all your appointments from a single platform",
      icon: <Calendar className="h-6 w-6 text-primary" />
    },
    {
      feature: "Billing System",
      doxxy: "Integrated billing, invoicing, and payment tracking",
      lybrate: "Basic payment processing for online consultations",
      advantage: "Streamline your entire revenue cycle",
      icon: <CreditCard className="h-6 w-6 text-primary" />
    },
    {
      feature: "Multi-Clinic Support",
      doxxy: "Built-in multi-location management",
      lybrate: "Not designed for multi-clinic operations",
      advantage: "Easily manage multiple branches from one dashboard",
      icon: <Building2 className="h-6 w-6 text-primary" />
    },
    {
      feature: "Analytics & Reporting",
      doxxy: "Advanced practice analytics and performance reports",
      lybrate: "Basic consultation metrics",
      advantage: "Gain insights to optimize your practice growth",
      icon: <BarChart3 className="h-6 w-6 text-primary" />
    }
  ];

  const painPoints = [
    {
      title: "Limited Scope",
      lybrate: "Lybrate primarily focuses on connecting doctors with patients for online consultations, lacking comprehensive clinic management features.",
      doxxy: "Doxxy offers an all-in-one solution covering appointments, EMR, billing, and more, for both in-clinic and online patients."
    },
    {
      title: "Commission-Based Pricing",
      lybrate: "Lybrate charges a commission on each consultation, which can eat into your revenue, especially for high-volume practices.",
      doxxy: "Doxxy's transparent pay-per-appointment model ensures you know exactly what you're paying, with no hidden commissions."
    },
    {
      title: "Data Silos",
      lybrate: "Using Lybrate for online consultations often means your patient data is fragmented across multiple systems.",
      doxxy: "Doxxy centralizes all patient data, providing a comprehensive view of their medical history regardless of how they consult."
    },
    {
      title: "Lack of Practice Control",
      lybrate: "Lybrate dictates many aspects of the online consultation process and patient interaction.",
      doxxy: "Doxxy empowers you with full control over your clinic's workflows, branding, and patient experience."
    }
  ];

  const testimonials = [
    {
      quote: "We needed a system that could handle both our in-clinic and online patients seamlessly. Doxxy provided that and so much more, unlike Lybrate which was only good for online consultations.",
      name: "Dr. Kavita Rao",
      clinic: "Holistic Health Clinic, Chennai",
      photo: "https://images.unsplash.com/photo-1594824204175-b70147e9cbc5?w=100&h=100&fit=crop"
    },
    {
      quote: "The integrated billing system in Doxxy has saved us countless hours. With Lybrate, we still had to manually track payments and generate invoices.",
      name: "Dr. Sameer Khan",
      clinic: "Apex Medical Center, Hyderabad",
      photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop"
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
            <span className="text-primary"> Lybrate</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Learn why Doxxy provides a more comprehensive clinic management solution
            compared to Lybrate's consultation-focused platform.
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
              See how Doxxy compares to Lybrate across important features and core functionalities.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-6 text-left text-gray-600 font-medium">Feature</th>
                  <th className="py-4 px-6 text-left text-primary font-medium">Doxxy</th>
                  <th className="py-4 px-6 text-left text-gray-600 font-medium">Lybrate</th>
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
                        <Check className="h-5 w-5 text-success mr-2 flex-shrink-0 mt-0.5" />
                        {point.doxxy}
                      </div>
                    </td>
                    <td className="py-4 px-6 border-t text-gray-600">{point.lybrate}</td>
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
              Common Pain Points with Lybrate
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              How Doxxy solves the most common challenges faced by Lybrate users.
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
                    <X className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-600"><span className="font-medium">Lybrate:</span> {point.lybrate}</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-success mr-2 flex-shrink-0 mt-0.5" />
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
                Seamless Migration from Lybrate
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Switching from Lybrate to Doxxy is simple and hassle-free. Our migration specialists handle the entire process:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Data Export & Import</p>
                    <p className="text-gray-600">We'll help you export your patient data from Lybrate and import it into Doxxy.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Staff Training</p>
                    <p className="text-gray-600">Comprehensive training for your entire team to ensure a smooth transition.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Parallel Operation</p>
                    <p className="text-gray-600">Run both systems side by side during transition to ensure no disruption.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Check className="h-5 w-5 text-primary" />
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
              Hear from healthcare professionals who switched from Lybrate to Doxxy.
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
              See how Doxxy and Lybrate compare across key features.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-6 text-left text-gray-600 font-medium">Feature</th>
                  <th className="py-4 px-6 text-center text-primary font-medium">Doxxy</th>
                  <th className="py-4 px-6 text-center text-gray-600 font-medium">Lybrate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-4 px-6 border-t font-medium text-foreground">Comprehensive Clinic Management</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-destructive mx-auto" /></td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="py-4 px-6 border-t font-medium text-foreground">Pay-per-appointment Pricing</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-destructive mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-t font-medium text-foreground">Integrated Billing System</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-destructive mx-auto" /></td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="py-4 px-6 border-t font-medium text-foreground">Multi-Clinic Management</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-destructive mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-t font-medium text-foreground">Advanced Analytics</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-destructive mx-auto" /></td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="py-4 px-6 border-t font-medium text-foreground">Dedicated Support</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-destructive mx-auto" /></td>
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

export default DoxxyVsLybrate;
