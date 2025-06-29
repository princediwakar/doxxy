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
import SignupCTA from "@/components/SignupCTA";

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
              <CheckCircle className="h-4 w-4 text-success" />
              No setup fees
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Start for free
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Simple Healthcare Management Section */}
              <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Not Complicated
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Unlike enterprise software that overwhelms with complexity, Doxxy focuses on what matters: efficient patient care, transparent costs, and growth without barriers.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&h=400&fit=crop" 
                alt="Clean, intuitive medical software interface on tablet" 
                className="rounded-lg shadow-xl w-full"
              />
              <div className="absolute -bottom-4 -right-4 bg-background p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-foreground">Easy To Use</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Healthcare Software That Actually Works</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                No overwhelming menus, hidden features, or complex training required. Doxxy's intuitive design lets you focus on patients, not software. Smart specialty workflows adapt to your practice style - from cardiology to pediatrics - without the enterprise complexity.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-success mr-3" />
                  <span className="text-foreground">Intuitive design that requires minimal training</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-success mr-3" />
                  <span className="text-foreground">11+ medical specialties with smart workflows</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-success mr-3" />
                  <span className="text-foreground">No complicated setup or lengthy onboarding</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
                        <h3 className="text-2xl font-bold text-foreground mb-4">Pricing That Actually Makes Sense</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
                Stop paying monthly fees for software you barely use. With Doxxy's per-appointment pricing, you only pay when you actually see patients. Start with 100 free appointments, add unlimited doctors without extra costs, and scale naturally as your practice grows.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-success mr-3" />
                  <span className="text-foreground">Only ₹10 per completed appointment - no monthly subscriptions</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-success mr-3" />
                  <span className="text-foreground">First 100 appointments completely free forever</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-success mr-3" />
                  <span className="text-foreground">Unlimited doctors and staff - no per-user fees</span>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative">
              <img 
                src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop" 
                alt="Simple, transparent pricing calculator showing cost savings" 
                className="rounded-lg shadow-xl w-full"
              />
              <div className="absolute -top-4 -left-4 bg-background p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
        <span className="text-sm font-medium text-foreground">Transparent Costs</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 bg-gradient-to-r from-primary/5 to-success/5 rounded-2xl p-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                        <div className="text-3xl font-bold text-primary mb-2">₹10</div>
        <div className="text-muted-foreground">Per appointment</div>
        <div className="text-sm text-muted-foreground/70 mt-1">Only when you actually see patients</div>
              </div>
              <div>
                        <div className="text-3xl font-bold text-success mb-2">100</div>
        <div className="text-muted-foreground">Free appointments</div>
        <div className="text-sm text-muted-foreground/70 mt-1">Complete access to start your practice</div>
              </div>
              <div>
                <div className="text-3xl font-bold  mb-2">∞</div>
                <div className="text-muted-foreground">Unlimited doctors</div>
                                  <div className="text-sm text-muted-foreground mt-1">No per-user fees as you grow</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Healthcare Specialties Showcase */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
                          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Serving Every Specialty, Every Size
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Specialized consultation workflows for every medical discipline. From solo practitioners to multi-specialty hospitals, Doxxy's intelligent forms adapt to your clinical requirements.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-xl mb-4 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1618939304347-e91b1f33d2ab?w=300&h=250&fit=crop" 
                  alt="Cardiologist examining patient with stethoscope" 
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-secondary ">
                  <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="font-semibold text-lg">Cardiology</h3>
                                  <p className="text-sm text-muted-foreground">Heart & vascular specialists</p>
            </div>
            
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-xl mb-4 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=300&h=250&fit=crop" 
                  alt="Neurologist examining brain scan" 
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-secondary ">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="font-semibold text-lg">Neurology</h3>
                                  <p className="text-sm text-muted-foreground">Brain & nervous system</p>
            </div>
            
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-xl mb-4 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=250&fit=crop" 
                  alt="Ophthalmologist performing eye examination" 
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-secondary ">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="font-semibold text-lg">Ophthalmology</h3>
              <p className="text-sm text-muted-foreground">Comprehensive eye care</p>
            </div>
            
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-xl mb-4 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=300&h=250&fit=crop" 
                  alt="Pediatrician examining child patient" 
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-secondary ">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="font-semibold text-lg">Pediatrics</h3>
              <p className="text-sm text-muted-foreground">Specialized child healthcare</p>
            </div>
            
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-xl mb-4 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1576671081837-49000212a370?w=300&h=250&fit=crop" 
                  alt="Dermatologist examining patient skin condition" 
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-secondary ">
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="font-semibold text-lg">Dermatology</h3>
              <p className="text-sm text-muted-foreground">Skin & aesthetic care</p>
            </div>
            
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-xl mb-4 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=300&h=250&fit=crop" 
                  alt="Orthopedic surgeon examining x-ray" 
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-secondary ">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="font-semibold text-lg">Orthopedics</h3>
              <p className="text-sm text-muted-foreground">Bone & musculoskeletal</p>
            </div>
            
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-xl mb-4 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=250&fit=crop" 
                  alt="Psychiatrist in therapy session consultation" 
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-secondary ">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="font-semibold text-lg">Psychiatry</h3>
              <p className="text-sm text-muted-foreground">Mental health & wellness</p>
            </div>
            
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-xl mb-4 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1594824204175-b70147e9cbc5?w=300&h=250&fit=crop" 
                  alt="General practitioner consulting with patient" 
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-secondary ">
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="font-semibold text-lg">General Medicine</h3>
              <p className="text-sm text-muted-foreground">Primary healthcare</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-xl mb-4 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=250&fit=crop" 
                  alt="ENT specialist examining patient's throat" 
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-secondary ">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="font-semibold text-lg">ENT</h3>
              <p className="text-sm text-muted-foreground">Ear, nose & throat specialists</p>
            </div>
            
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-xl mb-4 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1691934338603-af553029aaa3??w=300&h=250&fit=crop" 
                  alt="Gynecologist consulting with female patient" 
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-secondary ">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="font-semibold text-lg">Gynecology</h3>
              <p className="text-sm text-muted-foreground">Women's health & wellness</p>
            </div>
            
            <div className="text-center group">
              <div className="relative overflow-hidden rounded-xl mb-4 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1584515933487-779824d29309?w=300&h=250&fit=crop" 
                  alt="Pulmonologist examining chest x-ray" 
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-secondary ">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="font-semibold text-lg">Pulmonology</h3>  
              <p className="text-sm text-muted-foreground">Respiratory & lung care</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground/70 mb-4">Each specialty comes with intelligent forms, mandatory field validation, and specialty-specific workflows</p>
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4">
                Explore Your Specialty
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
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
      <section className="py-20 px-4 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Healthcare Professionals Choose Doxxy
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Join thousands of medical professionals who have transformed their practice operations with intelligent, cost-effective healthcare management software.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
            <div>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-background rounded-xl shadow-lg border border-border hover:shadow-xl transition-shadow">
                  <div className="flex-shrink-0 w-14 h-14 bg-accent rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-7 w-7 text-accent-foreground" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2 text-lg">Start Free, Grow Confidently</h4>
                    <p className="text-muted-foreground leading-relaxed">Your first 100 appointments are completely free forever. No credit card required, no time limits, no feature restrictions. Experience the full platform before committing to anything.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-6 bg-background rounded-xl shadow-lg border border-border hover:shadow-xl transition-shadow">
                  <div className="flex-shrink-0 w-14 h-14 bg-primary rounded-xl flex items-center justify-center">
                    <Shield className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2 text-lg">Bank-Level Security & Compliance</h4>
                    <p className="text-muted-foreground leading-relaxed">Advanced encryption, multi-factor authentication, and complete data isolation between clinics. HIPAA-compliant infrastructure with 99.9% uptime guarantee and automated backups.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Users className="h-7 w-7 text-secondary " />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">Scale Without Limits or Extra Fees</h4>
                    <p className="text-gray-600 leading-relaxed">Add unlimited doctors, nurses, and administrative staff without per-user charges. Manage multiple clinics from one dashboard. Pricing scales with your patient volume, not your team size.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <Card className="p-8 text-center bg-primary/10 border-primary/20 hover:scale-105 transition-transform">
                    <div className="w-20 h-20 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Clock className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <h4 className="font-bold text-foreground mb-2 text-lg">3+ Hours Saved</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Daily administrative time savings through automated workflows and intelligent scheduling</p>
                  </Card>
                  
                  <Card className="p-8 text-center bg-success/10 border-success/20 hover:scale-105 transition-transform">
                    <div className="w-20 h-20 bg-success rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Lock className="h-10 w-10 text-success-foreground" />
                    </div>
                    <h4 className="font-bold text-foreground mb-2 text-lg">100% Data Security</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Zero data breaches with enterprise-grade security and complete clinic data isolation</p>
                  </Card>
                </div>
                
                <div className="space-y-6 mt-8">
                  <Card className="p-8 text-center bg-secondary/10 border-secondary/20 hover:scale-105 transition-transform">
                    <div className="w-20 h-20 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <FileText className="h-10 w-10 text-secondary-foreground" />
                    </div>
                    <h4 className="font-bold text-foreground mb-2 text-lg">11+ Specialties</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Custom workflows for cardiology, neurology, pediatrics, and more medical specialties</p>
                  </Card>
                  
                  <Card className="p-8 text-center bg-accent/10 border-accent/20 hover:scale-105 transition-transform">
                    <div className="w-20 h-20 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Globe className="h-10 w-10 text-accent-foreground" />
                    </div>
                    <h4 className="font-bold text-foreground mb-2 text-lg">Multi-Clinic Ready</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Seamlessly manage multiple locations with unified reporting and centralized billing</p>
                  </Card>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/10 rounded-full opacity-10 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-success/10 rounded-full opacity-10 animate-pulse delay-1000"></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link to="/auth">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 shadow-lg">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="px-8 py-4 border-primary/30 hover:bg-primary/5">
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule Demo
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                No setup fees
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                No long-term contracts
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Cancel anytime
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

      <SignupCTA />

      <SiteFooter />
    </div>
  );
};

export default LandingPage; 