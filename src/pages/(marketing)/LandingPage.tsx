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
import SiteFooter from "@/components/SiteFooter";

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
    "Pay Only For What You Use: Our per-appointment pricing means you only pay for actual appointments. No wasted resources during slow months.",
    "Free For First 100 Appointments: Start with zero risk - our Practice Essentials plan gives you full access to essential features for your first 100 appointments, completely free. No hidden fees or surprise charges.",
    "No Doctor-Based Pricing: Our pricing is based solely on appointments, allowing unlimited doctors and staff on all plans.",
    "No Annual Commitments: We don't believe in locking you into long-term contracts. Scale up or down as needed, with the flexibility to adjust to your practice's changing needs.",
    "Transparent Pricing: Our pricing is simple and transparent - ₹10 per appointment with all features included. No surprise fees, hidden costs, or expensive add-ons required for essential functionality.",
    "Grow At Your Own Pace: Our pricing model grows smoothly with your practice. No sudden pricing tier jumps when you hit arbitrary user or appointment thresholds."
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
          Clinic work,
            <span className="text-primary"> made simple.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Doxxy empowers medical clinics with comprehensive patient management, smart scheduling, 
            and seamless billing. Focus on what matters most - your patients.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg px-8 py-6 text-lg">
                Setup your Practice
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-primary/30 hover:bg-primary/5">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Demo
              </Button>
            </Link>
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

      {/* Healthcare Hero Images Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Professionals Worldwide
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From busy urban hospitals in Mumbai to rural clinics in Iowa, Doxxy serves healthcare providers across the globe.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1631217872822-1c2546d6b864?w=600&h=400&fit=crop" 
                alt="International healthcare team collaborating with Doxxy" 
                className="rounded-lg shadow-xl w-full"
              />
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-900">Live Dashboard</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Global Healthcare Excellence</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Doxxy is built for the global healthcare landscape, offering a flexible and adaptable platform that meets the diverse needs of clinics worldwide. Our commitment to simplicity, friendliness, and value ensures that every healthcare professional can deliver exceptional care.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Multi-language support (15+ languages)</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">24/7 global support across time zones</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Designed for simplicity and ease of use</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Empowering Indian Healthcare</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Born in Bengaluru and designed for the Indian healthcare ecosystem, Doxxy understands 
                the unique challenges of Indian medical practices - from Ayush integration to insurance complexity.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Ayushman Bharat integration ready</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Support for Ayurveda, Homeopathy, Unani</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Regional language interfaces (Hindi, Tamil, Bengali+)</span>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative">
              <img 
                src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=400&fit=crop" 
                alt="Indian healthcare professional using Doxxy platform" 
                className="rounded-lg shadow-xl w-full"
              />
              
            </div>
          </div>
        </div>
      </section>

      {/* Healthcare Specialties Showcase */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Serving Every Specialty, Every Size
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From solo practitioners to multi-specialty hospitals, Doxxy adapts to your unique needs.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=250&fit=crop" 
                  alt="Cardiology practice" 
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <h3 className="font-semibold text-gray-900">Cardiology</h3>
              <p className="text-sm text-gray-600">Heart specialists</p>
            </div>
            
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=250&fit=crop" 
                  alt="Pediatrics practice" 
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <h3 className="font-semibold text-gray-900">Pediatrics</h3>
              <p className="text-sm text-gray-600">Child healthcare</p>
            </div>
            
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=300&h=250&fit=crop" 
                  alt="Orthopedics practice" 
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <h3 className="font-semibold text-gray-900">Orthopedics</h3>
              <p className="text-sm text-gray-600">Bone & joint care</p>
            </div>
            
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1594824204175-b70147e9cbc5?w=300&h=250&fit=crop" 
                  alt="General practice" 
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <h3 className="font-semibold text-gray-900">General Practice</h3>
              <p className="text-sm text-gray-600">Family medicine</p>
            </div>
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1579165466949-cb523388b771?w=300&h=250&fit=crop" 
                  alt="Dermatology practice" 
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <h3 className="font-semibold text-gray-900">Dermatology</h3>
              <p className="text-sm text-gray-600">Skin & hair care</p>
            </div>
            
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1584515933487-779824d29309?w=300&h=250&fit=crop" 
                  alt="Ophthalmology practice" 
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <h3 className="font-semibold text-gray-900">Ophthalmology</h3>
              <p className="text-sm text-gray-600">Eye care</p>
            </div>
            
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=250&fit=crop" 
                  alt="Neurology practice" 
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <h3 className="font-semibold text-gray-900">Neurology</h3>
              <p className="text-sm text-gray-600">Brain & nervous system</p>
            </div>
            
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=250&fit=crop" 
                  alt="Dentistry practice" 
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <h3 className="font-semibold text-gray-900">Dentistry</h3>
              <p className="text-sm text-gray-600">Oral health</p>
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
          
          <div className="text-center mt-12">
            <Link to="/features">
              <Button size="lg" variant="outline" className="px-8 py-4">
                View All Features
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
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
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Get Started Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 text-center">
                  <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold text-foreground mb-1">Security First</h4>
                  <p className="text-sm text-muted-foreground">Enterprise-grade encryption</p>
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
            <p className="text-lg text-muted-foreground mb-6">
              See what doctors and practice managers are saying about Doxxy
            </p>
            <Link to="/about" className="text-primary hover:underline font-medium">
              Learn about our story and mission →
            </Link>
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
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg px-8 py-6 text-lg">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                View Pricing Plans
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            No credit card required • 30-day free trial • Setup support included
          </p>
          
          
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default LandingPage; 