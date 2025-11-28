import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
  import { 
  Check, 
  X, 
  ArrowRight, 
  DollarSign, 
  
  Calendar,
  BarChart3,
  Stethoscope,
  FileText,
  
  Building2,
  CreditCard,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteFooter from '@/components/SiteFooter';
import SignupCTA from '@/components/SignupCTA';

const DoxxyVsMFine = () => {
  const comparisonPoints = [
    {
      feature: "Primary Model",
      doxxy: "Hybrid (In-clinic & Telemedicine)",
      mfine: "Telemedicine-centric",
      advantage: "Flexibility to manage both physical and virtual consultations",
      icon: <Stethoscope className="h-6 w-6 text-primary" />
    },
    {
      feature: "Pricing Model",
      doxxy: "Pay-per-appointment (₹10/appointment)",
      mfine: "Subscription-based for doctors, commission on consultations",
      advantage: "Predictable costs, no hidden commissions",
      icon: <DollarSign className="h-6 w-6 text-primary" />
    },
    {
      feature: "Clinic Management",
      doxxy: "Comprehensive EMR, billing, scheduling, multi-clinic support",
      mfine: "Limited to telemedicine workflow and patient engagement",
      advantage: "All-in-one solution for your entire practice operations",
      icon: <Building2 className="h-6 w-6 text-primary" />
    },
    {
      feature: "Patient Records",
      doxxy: "Full patient history, prescriptions, lab results, and clinical notes",
      mfine: "Primarily consultation notes and basic patient data",
      advantage: "Complete patient view for better diagnosis and care",
      icon: <FileText className="h-6 w-6 text-primary" />
    },
    {
      feature: "Appointment Types",
      doxxy: "Supports both in-clinic and online appointments",
      mfine: "Mainly focuses on online video consultations",
      advantage: "Seamlessly manage all types of patient visits",
      icon: <Calendar className="h-6 w-6 text-primary" />
    },
    {
      feature: "Billing & Payments",
      doxxy: "Integrated billing, invoicing, and payment tracking",
      mfine: "Handles payments for online consultations only",
      advantage: "Streamline your entire revenue cycle, not just online payments",
      icon: <CreditCard className="h-6 w-6 text-primary" />
    },
    {
      feature: "Analytics & Reporting",
      doxxy: "Advanced practice analytics and performance reports",
      mfine: "Basic metrics related to online consultations",
      advantage: "Gain deeper insights to optimize practice growth and efficiency",
      icon: <BarChart3 className="h-6 w-6 text-primary" />
    }
  ];

  const painPoints = [
    {
      title: "Limited Scope for In-clinic Practice",
      mfine: "MFine is heavily focused on telemedicine, making it less suitable for clinics with significant in-person patient flow.",
      doxxy: "Doxxy offers a hybrid model, perfectly balancing features for both in-clinic and telemedicine appointments."
    },
    {
      title: "Fragmented Patient Data",
      mfine: "If you use MFine for telemedicine and another system for in-clinic patients, your patient data becomes fragmented.",
      doxxy: "Doxxy centralizes all patient data, providing a unified record regardless of how the patient interacts with your clinic."
    },
    {
      title: "Subscription & Commission Costs",
      mfine: "MFine's pricing can involve both subscriptions for doctors and commissions on consultations, leading to unpredictable costs.",
      doxxy: "Doxxy's transparent pay-per-appointment model ensures clear and predictable billing, with no hidden commissions."
    },
    {
      title: "Lack of Comprehensive Practice Management",
      mfine: "MFine lacks features like detailed billing, multi-clinic management, and advanced reporting needed for full practice operations.",
      doxxy: "Doxxy provides an all-encompassing solution, empowering you to manage every aspect of your clinic efficiently."
    }
  ];

  const testimonials = [
    {
      quote: "We needed a platform that could handle both our walk-in patients and our growing telemedicine practice. MFine was great for telemedicine, but Doxxy gave us the complete solution we needed.",
      name: "Dr. Preeti Sharma",
      clinic: "Harmony Clinic, Bengaluru",
      photo: "https://images.unsplash.com/photo-1594824204175-b70147e9cbc5?w=100&h=100&fit=crop"
    },
    {
      quote: "The integrated billing and patient records in Doxxy are a lifesaver. With MFine, we had to use separate tools, which was inefficient and prone to errors.",
      name: "Dr. Arjun Reddy",
      clinic: "Global Health Center, Hyderabad",
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
            <span className="text-primary"> MFine</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover how Doxxy's hybrid approach to in-clinic and telemedicine appointments
            offers more flexibility and comprehensive management than MFine's telemedicine-centric model.
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
              See how Doxxy compares to MFine across important features and core functionalities.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-6 text-left text-gray-600 font-medium">Feature</th>
                  <th className="py-4 px-6 text-center text-primary font-medium">Doxxy</th>
                  <th className="py-4 px-6 text-left text-gray-600 font-medium">MFine</th>
                  <th className="py-4 px-6 text-left text-gray-600 font-medium">Doxxy Advantage</th>
                </tr>
              </thead>
              <tbody>
                {comparisonPoints.map((point, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="py-4 px-6 border-t flex items-center">
                      <div className="mr-3">{point.icon}</div>
                      <span className="font-medium">{point.feature}</span>
                    </td>
                    <td className="py-4 px-6 border-t text-gray-800">
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        {point.doxxy}
                      </div>
                    </td>
                    <td className="py-4 px-6 border-t text-gray-600">{point.mfine}</td>
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
              Common Pain Points with MFine
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              How Doxxy solves the most common challenges faced by MFine users.
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
                    <p className="text-gray-600"><span className="font-medium">MFine:</span> {point.mfine}</p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
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
                Seamless Migration from MFine
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Switching from MFine to Doxxy is simple and hassle-free. Our migration specialists handle the entire process:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Data Export & Import</p>
                    <p className="text-gray-600">We'll help you export your patient data from MFine and import it into Doxxy.</p>
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
              Hear from healthcare professionals who switched from MFine to Doxxy.
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
              See how Doxxy and MFine compare across key features.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-6 text-left text-gray-600 font-medium">Feature</th>
                  <th className="py-4 px-6 text-center text-primary font-medium">Doxxy</th>
                  <th className="py-4 px-6 text-center text-gray-600 font-medium">MFine</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-4 px-6 border-t font-medium text-foreground">Hybrid Clinic Management</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-destructive mx-auto" /></td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="py-4 px-6 border-t font-medium text-foreground">Pay-per-appointment Pricing</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-destructive mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-t font-medium text-foreground">Comprehensive Patient Records</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-destructive mx-auto" /></td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="py-4 px-6 border-t font-medium text-foreground">Integrated Billing System</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-destructive mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-t font-medium text-foreground">Multi-Clinic Management</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-destructive mx-auto" /></td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="py-4 px-6 border-t font-medium text-foreground">Advanced Analytics</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
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

export default DoxxyVsMFine;
