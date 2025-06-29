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
import SiteFooter from "@/components/SiteFooter";
import SignupCTA from '@/components/SignupCTA';

const DoxxyVsEkaCare = () => {
  const comparisonPoints = [
    {
      feature: "Pricing Model",
      doxxy: "Pay-per-appointment (₹10/appointment)",
      ekacare: "Monthly subscription + per-doctor fees",
      advantage: "More cost-effective for small to medium practices",
      icon: <DollarSign className="h-6 w-6 text-blue-600" />
    },
    {
      feature: "Free Plan",
      doxxy: "First 100 appointments completely free",
      ekacare: "Limited-time trial with restricted features",
      advantage: "Start with zero risk and no time pressure",
      icon: <Calendar className="h-6 w-6 text-blue-600" />
    },
    {
      feature: "Doctor Limits",
      doxxy: "Unlimited doctors on all plans",
      ekacare: "Tiered pricing based on number of doctors",
      advantage: "Add as many doctors as needed without extra cost",
      icon: <Users className="h-6 w-6 text-blue-600" />
    },
    {
      feature: "Contract Length",
      doxxy: "No commitment, cancel anytime",
      ekacare: "Annual contracts with early termination fees",
      advantage: "Flexibility to adjust as your practice needs change",
      icon: <Clock className="h-6 w-6 text-blue-600" />
    },
    {
      feature: "Multi-Clinic Support",
      doxxy: "Built-in multi-location management",
      ekacare: "Available only on higher-tier plans",
      advantage: "Manage multiple locations without premium pricing",
      icon: <Stethoscope className="h-6 w-6 text-blue-600" />
    },
    {
      feature: "Patient Records",
      doxxy: "Comprehensive EMR with unlimited storage",
      ekacare: "Storage limits on basic plans",
      advantage: "Never worry about hitting storage limits",
      icon: <FileText className="h-6 w-6 text-blue-600" />
    },
    {
      feature: "Patient Communication",
      doxxy: "SMS, WhatsApp, and email notifications included",
      ekacare: "Basic notifications, premium features cost extra",
      advantage: "All communication channels included at no extra cost",
      icon: <MessageSquare className="h-6 w-6 text-blue-600" />
    },
    {
      feature: "Mobile App",
      doxxy: "Native iOS and Android apps included",
      ekacare: "Limited functionality in free mobile app",
      advantage: "Full-featured mobile experience for doctors and staff",
      icon: <Smartphone className="h-6 w-6 text-blue-600" />
    }
  ];

  const painPoints = [
    {
      title: "Unpredictable Monthly Bills",
      ekaCare: "Eka Care's subscription model means you pay the same amount regardless of how many patients you see. During slow months, you're still paying full price.",
      doxxy: "With Doxxy, you only pay for appointments you actually have. If you see fewer patients in a month, you pay less."
    },
    {
      title: "Doctor-Based Pricing Penalties",
      ekaCare: "As your practice grows and you add more doctors, Eka Care increases your monthly fees significantly, penalizing your success.",
      doxxy: "Doxxy charges only for appointments, not doctors. Add as many providers as you need without increasing your base costs."
    },
    {
      title: "Feature Limitations on Basic Plans",
      ekaCare: "Eka Care restricts essential features like advanced analytics and multi-clinic management to higher-tier plans.",
      doxxy: "All Doxxy features are available on all plans - you get the complete platform regardless of your size."
    },
    {
      title: "Long-Term Contracts",
      ekaCare: "Eka Care typically requires annual commitments with penalties for early cancellation.",
      doxxy: "Doxxy has no long-term contracts or commitments. You can cancel anytime without penalties."
    },
    {
      title: "Hidden Costs",
      ekaCare: "Eka Care charges additional fees for setup, training, and premium support.",
      doxxy: "Doxxy includes setup assistance, training, and premium support at no additional cost."
    }
  ];

  const testimonials = [
    {
      quote: "After switching from Eka Care to Doxxy, our monthly software costs decreased by nearly 40%. The pay-per-appointment model is much more aligned with our practice's cash flow.",
      name: "Dr. Rajesh Sharma",
      clinic: "Family Care Clinic, Mumbai",
      photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop"
    },
    {
      quote: "We were hesitant to switch EMR systems, but Doxxy's migration process was seamless. Their team imported all our patient data from Eka Care without any downtime.",
      name: "Dr. Priya Patel",
      clinic: "Wellness Medical Center, Pune",
      photo: "https://images.unsplash.com/photo-1594824175513-9daa7a191e78?w=100&h=100&fit=crop"
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
            <span className="text-blue-600"> Eka Care</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            See how Doxxy's innovative pricing model and comprehensive feature set
            provides better value for healthcare practices compared to Eka Care.
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
              See how Doxxy compares to Eka Care across important features and pricing models.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-6 text-left text-gray-600 font-medium">Feature</th>
                  <th className="py-4 px-6 text-left text-blue-600 font-medium">Doxxy</th>
                  <th className="py-4 px-6 text-left text-gray-600 font-medium">Eka Care</th>
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
                    <td className="py-4 px-6 border-t text-gray-600">{point.ekacare}</td>
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
              Common Pain Points with Eka Care
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              How Doxxy solves the most common challenges faced by Eka Care users.
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
                    <p className="text-gray-600"><span className="font-medium">Eka Care:</span> {point.ekaCare}</p>
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
                Seamless Migration from Eka Care
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Switching from Eka Care to Doxxy is simple and hassle-free. Our migration specialists handle the entire process:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Check className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Data Export & Import</p>
                    <p className="text-gray-600">We'll help you export your data from Eka Care and import it into Doxxy.</p>
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
              Hear from healthcare professionals who switched from Eka Care to Doxxy.
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
              See how Doxxy and Eka Care compare across key features.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-6 text-left text-gray-600 font-medium">Feature</th>
                  <th className="py-4 px-6 text-center text-blue-600 font-medium">Doxxy</th>
                  <th className="py-4 px-6 text-center text-gray-600 font-medium">Eka Care</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-4 px-6 border-t font-medium">Appointment Scheduling</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-6 border-t font-medium">Electronic Medical Records</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-t font-medium">Unlimited Doctors</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-6 border-t font-medium">Multi-Clinic Management</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center text-gray-600">Premium Plans Only</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-t font-medium">Patient Communication</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center text-gray-600">Basic Only</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-6 border-t font-medium">Advanced Analytics</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center text-gray-600">Premium Plans Only</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-t font-medium">Free Plan Available</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-6 border-t font-medium">No Long-Term Contracts</td>
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

export default DoxxyVsEkaCare;
