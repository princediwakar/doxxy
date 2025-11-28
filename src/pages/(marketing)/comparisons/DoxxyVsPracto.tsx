import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  FileText,
  Smartphone,
  Globe,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteFooter from "@/components/SiteFooter";
import SignupCTA from '@/components/SignupCTA';

const DoxxyVsPracto = () => {
  const comparisonPoints = [
    {
      feature: "Pricing Model",
      doxxy: "Pay-per-appointment (₹10/appointment)",
      practo: "Monthly subscription + per-doctor fees",
      advantage: "More cost-effective for small to medium practices",
      icon: <DollarSign className="h-6 w-6 text-primary" />
    },
    {
      feature: "Free Plan",
      doxxy: "First 100 appointments completely free",
      practo: "Limited free tier with restricted features",
      advantage: "Start with zero risk and full feature access",
      icon: <Calendar className="h-6 w-6 text-primary" />
    },
    {
      feature: "Doctor Limits",
      doxxy: "Unlimited doctors on all plans",
      practo: "Tiered pricing based on number of doctors",
      advantage: "Add as many doctors as needed without extra cost",
      icon: <Users className="h-6 w-6 text-primary" />
    },
    {
      feature: "Contract Length",
      doxxy: "No commitment, cancel anytime",
      practo: "Annual contracts preferred, monthly at premium",
      advantage: "Flexibility to adjust as your practice needs change",
      icon: <Clock className="h-6 w-6 text-primary" />
    },
    {
      feature: "Patient Records",
      doxxy: "Comprehensive EMR with unlimited storage",
      practo: "Storage limits on basic plans",
      advantage: "Never worry about hitting storage limits",
      icon: <FileText className="h-6 w-6 text-primary" />
    },
    {
      feature: "Focus",
      doxxy: "Dedicated to clinic management",
      practo: "Split focus between marketplace and software",
      advantage: "Software built specifically for clinic operations",
      icon: <Layers className="h-6 w-6 text-primary" />
    },
    {
      feature: "Implementation",
      doxxy: "Quick setup, minimal training required",
      practo: "Complex setup, extensive training needed",
      advantage: "Get up and running in days, not weeks",
      icon: <Zap className="h-6 w-6 text-primary" />
    },
    {
      feature: "User Interface",
      doxxy: "Modern, intuitive design",
      practo: "Complex interface with steeper learning curve",
      advantage: "Less training time, higher staff adoption",
      icon: <Smartphone className="h-6 w-6 text-primary" />
    }
  ];

  const painPoints = [
    {
      title: "Complex Pricing Structure",
      practo: "Practo's pricing model includes base subscription fees, per-doctor charges, and additional costs for premium features, making it difficult to predict monthly expenses.",
      doxxy: "Doxxy's simple pay-per-appointment model means transparent, predictable costs that scale directly with your practice volume."
    },
    {
      title: "Marketplace Focus vs. Clinic Management",
      practo: "Practo's primary focus is its patient marketplace, with clinic management software as a secondary offering, leading to divided attention on software improvements.",
      doxxy: "Doxxy is 100% focused on clinic management software, with all development resources dedicated to improving the clinic and doctor experience."
    },
    {
      title: "Complex Implementation",
      practo: "Practo's implementation can take weeks and requires extensive training sessions for staff to become proficient.",
      doxxy: "Doxxy's intuitive interface can be learned in hours, not days, with most practices fully operational within 48 hours."
    },
    {
      title: "Limited Customization",
      practo: "Practo offers limited customization options for workflows and forms, forcing clinics to adapt to their system.",
      doxxy: "Doxxy provides flexible templates and customizable workflows that adapt to your existing processes, not the other way around."
    },
    {
      title: "Expensive Add-ons",
      practo: "Many essential features in Practo require additional payments beyond the base subscription.",
      doxxy: "All features are included in Doxxy's simple per-appointment pricing with no hidden costs or premium tiers."
    }
  ];

  const testimonials = [
    {
      quote: "After using Practo for two years, we switched to Doxxy and immediately noticed the difference in usability. Our staff required minimal training, and the pay-per-appointment model has saved us nearly 35% on monthly costs.",
      name: "Dr. Vikram Mehta",
      clinic: "Mehta Family Clinic, Mumbai",
      photo: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop"
    },
    {
      quote: "The biggest advantage of Doxxy over Practo is the pricing transparency. With Practo, we were constantly surprised by additional charges for features we thought were included. Doxxy's all-inclusive pricing is refreshingly simple.",
      name: "Dr. Ananya Gupta",
      clinic: "Wellness Pediatrics, Bangalore",
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
            <span className="text-primary"> Practo</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            See how Doxxy's dedicated clinic management platform offers better value
            and a more streamlined experience compared to Practo.
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
              How Doxxy compares to Practo across important features and pricing models.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-6 text-left text-gray-600 font-medium">Feature</th>
                  <th className="py-4 px-6 text-left text-primary font-medium">Doxxy</th>
                  <th className="py-4 px-6 text-left text-gray-600 font-medium">Practo</th>
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
                    <td className="py-4 px-6 border-t text-gray-600">{point.practo}</td>
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
              Common Challenges with Practo
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              How Doxxy addresses the most common pain points experienced by Practo users.
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
                    <p className="text-gray-600"><span className="font-medium">Practo:</span> {point.practo}</p>
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

      {/* Core Differences */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Core Philosophical Differences
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Understanding the fundamental differences in approach between Doxxy and Practo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-blue-200">
              <CardHeader className="border-b border-blue-100 bg-blue-50">
                <div className="flex items-center mb-2">
                  <Shield className="h-6 w-6 text-primary mr-2" />
                  <CardTitle>Doxxy's Approach</CardTitle>
                </div>
                <CardDescription>Clinic-First Software</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-success mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">Built exclusively for clinic management with all resources focused on improving the clinic experience</p>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-success mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">Transparent, usage-based pricing aligned with clinic growth</p>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-success mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">Designed for ease of use with minimal training requirements</p>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-success mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">Flexible workflows that adapt to your existing processes</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader className="border-b border-gray-100 bg-gray-50">
                <div className="flex items-center mb-2">
                  <Globe className="h-6 w-6 text-gray-600 mr-2" />
                  <CardTitle>Practo's Approach</CardTitle>
                </div>
                <CardDescription>Marketplace-First Platform</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start">
                  <X className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600">Primary focus on patient marketplace with clinic software as secondary offering</p>
                </div>
                <div className="flex items-start">
                  <X className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600">Complex pricing structure with multiple variables and tiers</p>
                </div>
                <div className="flex items-start">
                  <X className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600">Steep learning curve requiring extensive training</p>
                </div>
                <div className="flex items-start">
                  <X className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600">Rigid workflows requiring clinics to adapt their processes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Migration Process */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Seamless Migration from Practo
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Switching from Practo to Doxxy is straightforward with our dedicated migration team:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Data Export Assistance</p>
                    <p className="text-gray-600">We'll help you export your patient records, appointment history, and other data from Practo.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Data Mapping & Import</p>
                    <p className="text-gray-600">Our team maps your Practo data to Doxxy's format and imports it with careful verification.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Streamlined Training</p>
                    <p className="text-gray-600">Brief training sessions for your staff to quickly learn Doxxy's intuitive interface.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Parallel Operation Support</p>
                    <p className="text-gray-600">Run both systems side by side during transition to ensure no disruption to your practice.</p>
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
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=500&fit=crop" 
                alt="Team working on migration" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Doctors Who Switched Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from healthcare professionals who switched from Practo to Doxxy.
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Detailed Feature Comparison
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how Doxxy and Practo compare across key features.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-50">
                  <th className="py-4 px-6 text-left text-gray-900 font-medium">Feature</th>
                  <th className="py-4 px-6 text-center text-primary font-medium">Doxxy</th>
                  <th className="py-4 px-6 text-center text-gray-600 font-medium">Practo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-4 px-6 border-t font-medium">Appointment Scheduling</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="py-4 px-6 border-t font-medium">Electronic Medical Records</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-t font-medium">Unlimited Doctors</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-destructive mx-auto" /></td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="py-4 px-6 border-t font-medium">Multi-Clinic Management</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center text-muted-foreground">Premium Plans Only</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-t font-medium">Patient Communication</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center text-muted-foreground">Basic Only</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="py-4 px-6 border-t font-medium">Advanced Analytics</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center text-gray-600">Premium Plans Only</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-t font-medium">Free Plan Available</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-destructive mx-auto" /></td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="py-4 px-6 border-t font-medium">No Long-Term Contracts</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center"><X className="h-5 w-5 text-destructive mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-t font-medium">Customizable Templates</td>
                  <td className="py-4 px-6 border-t text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  <td className="py-4 px-6 border-t text-center text-gray-600">Limited</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="py-4 px-6 border-t font-medium">Implementation Time</td>
                  <td className="py-4 px-6 border-t text-center">1-3 Days</td>
                  <td className="py-4 px-6 border-t text-center">2-4 Weeks</td>
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

export default DoxxyVsPracto;
