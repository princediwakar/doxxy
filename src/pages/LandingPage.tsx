import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Shield, 
  Clock, 
  FileText,
  Stethoscope,
  CheckCircle,
  Star,
  ArrowRight,
  Globe,
  Lock,
  BarChart3
} from "lucide-react";

const LandingPage = () => {
  const features = [
    {
      icon: Calendar,
      title: "Smart Appointment Management",
      description: "Streamline scheduling with automated reminders, online booking, and real-time availability."
    },
    {
      icon: Users,
      title: "Comprehensive Patient Records",
      description: "Secure, centralized patient data with medical history, prescriptions, and treatment plans."
    },
    {
      icon: CreditCard,
      title: "Integrated Billing System",
      description: "Automated invoicing, payment tracking, and insurance claim management in one place."
    },
    {
      icon: FileText,
      title: "Digital Consultations",
      description: "Record clinical notes, manage prescriptions, and track patient progress efficiently."
    },
    {
      icon: Globe,
      title: "Multi-Clinic Support",
      description: "Manage multiple clinic locations with role-based access and data isolation."
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Insightful dashboards with practice metrics, revenue tracking, and performance analytics."
    }
  ];

  const benefits = [
    "HIPAA compliant with enterprise-grade security",
    "Role-based access for doctors, staff, and administrators",
    "Automated workflow optimization",
    "24/7 cloud-based accessibility",
    "Seamless integration with existing systems",
    "Dedicated customer support"
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Neurologist, Metro Health Clinic",
      content: "Doxxy has transformed our practice. Patient management is now seamless, and our staff productivity has increased by 40%.",
      rating: 5
    },
    {
      name: "Dr. Michael Chen", 
      role: "Ophthalmologist, Vision Care Center",
      content: "The multi-clinic support is incredible. I can manage all three of my locations from a single dashboard.",
      rating: 5
    },
    {
      name: "Lisa Rodriguez",
      role: "Practice Manager, Family Health Group",
      content: "The billing system alone has saved us hours each week. Everything is automated and error-free.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Badge variant="outline" className="px-4 py-2 text-primary border-primary/30">
              <Stethoscope className="h-4 w-4 mr-2" />
              Modern Healthcare Management
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Streamline Your
            <span className="text-primary"> Healthcare Practice</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Doxxy empowers medical clinics with comprehensive patient management, smart scheduling, 
            and seamless billing. Focus on what matters most - your patients.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg px-8 py-6 text-lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-primary/30 hover:bg-primary/5">
              <Calendar className="mr-2 h-5 w-5" />
              Schedule Demo
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              No setup fees
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              30-day free trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Run Your Practice
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From appointment scheduling to billing, Doxxy provides all the tools 
              you need to deliver exceptional patient care.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 hover:border-primary/30 transition-colors duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg mr-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why Healthcare Professionals Choose Doxxy
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Built specifically for modern healthcare practices, Doxxy combines 
                security, efficiency, and ease of use in one powerful platform.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Link to="/auth">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Get Started Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 text-center">
                  <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold text-foreground mb-1">Security First</h4>
                  <p className="text-sm text-muted-foreground">HIPAA compliant with enterprise-grade encryption</p>
                </Card>
                <Card className="p-6 text-center mt-8">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold text-foreground mb-1">Time Saving</h4>
                  <p className="text-sm text-muted-foreground">Reduce admin time by up to 60%</p>
                </Card>
                <Card className="p-6 text-center">
                  <Lock className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold text-foreground mb-1">Data Privacy</h4>
                  <p className="text-sm text-muted-foreground">Complete data isolation between clinics</p>
                </Card>
                <Card className="p-6 text-center mt-8">
                  <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold text-foreground mb-1">Growth Insights</h4>
                  <p className="text-sm text-muted-foreground">Analytics to grow your practice</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-lg text-muted-foreground">
              See what doctors and practice managers are saying about Doxxy
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/50 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join hundreds of healthcare professionals who trust Doxxy to manage their clinics efficiently and securely.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg px-8 py-6 text-lg">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              No credit card required • 30-day free trial • Setup support included
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/50 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.svg" alt="Doxxy" className="w-24" />
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Doxxy is the modern healthcare management platform that empowers 
                clinics to deliver exceptional patient care efficiently and securely.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <div className="space-y-2">
                <Link to="/auth" className="block text-muted-foreground hover:text-primary transition-colors">
                  Features
                </Link>
                <Link to="/auth" className="block text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
                <Link to="/auth" className="block text-muted-foreground hover:text-primary transition-colors">
                  Security
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <div className="space-y-2">
                <Link to="/privacy" className="block text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="block text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
                <Link to="/auth" className="block text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 Doxxy. All rights reserved. HIPAA compliant healthcare management platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 