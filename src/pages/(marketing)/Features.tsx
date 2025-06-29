import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  FileText, 
  CreditCard, 
  Video, 
  Building2, 
  BarChart3, 
  Shield, 
  Clock, 
  Smartphone,
  Globe,
  Zap,
  Lock,
  HeartHandshake,
  Stethoscope,
  Database,
  Settings,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteFooter from "@/components/SiteFooter";
import SignupCTA from "@/components/SignupCTA";

const Features = () => {
  const coreFeatures = [
    {
      icon: <Calendar className="h-8 w-8 text-primary" />,
      title: "Smart Appointment Management",
      description: "Intelligent scheduling with automated reminders, conflict resolution, and multi-location support.",
      features: [
        "AI-powered scheduling optimization",
        "Automated SMS/email reminders",
        "Online booking with availability sync",
        "Waitlist management",
        "Multi-doctor calendar integration",
        "Recurring appointment setup"
      ],
      badge: ""
    },
    {
      icon: <Users className="h-8 w-8 text-success" />,
      title: "Comprehensive Patient Records",
      description: "Complete digital health records with advanced search, analytics, and secure sharing capabilities.",
      features: [
        "360° patient health profiles",
        "Medical history tracking",
        "Lab results integration",
        "Prescription management",
        "Family health connections",
        "Advanced search & filtering"
      ]
    },
    {
      icon: <CreditCard className="h-8 w-8 text-secondary" />,
      title: "Integrated Billing System",
      description: "Streamlined billing with insurance integration, automated invoicing, and payment processing.",
      features: [
        "Insurance claim automation",
        "Multi-currency support",
        "Payment gateway integration",
        "Automated invoice generation",
        "Financial reporting",
        "Tax compliance tools"
      ]
    },
    {
      icon: <Video className="h-8 w-8 text-accent" />,
      title: "Telemedicine Platform",
      description: "Video consultations with integrated prescription and note-taking.",
      features: [
        "HD video consultations",
        "Screen sharing capabilities",
        "Digital prescription during calls",
        "Real-time note taking",
        "Recording & playback",
        "Mobile app support"
      ],
      badge: "Soon"
    },
    {
      icon: <Building2 className="h-8 w-8 text-primary" />,
      title: "Multi-Clinic Management",
      description: "Centralized management for multi-location practices with role-based access control.",
      features: [
        "Centralized dashboard",
        "Location-specific reporting",
        "Staff role management",
        "Resource allocation",
        "Cross-location scheduling",
        "Unified billing system"
      ]
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-destructive" />,
      title: "Advanced Analytics",
      description: "Powerful insights and reporting to optimize practice operations and patient outcomes.",
      features: [
        "Revenue analytics",
        "Patient flow analysis",
        "Treatment outcome tracking",
        "Staff performance metrics",
        "Custom report builder",
        "Predictive analytics"
      ],
      badge: "Soon"
    }
  ];

  const additionalFeatures = [
    
    {
      icon: <Clock className="h-6 w-6 text-success" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support and system monitoring"
    },
    // {
    //   icon: <Smartphone className="h-6 w-6 text-purple-600" />,
    //   title: "Mobile Apps",
    //   description: "Native iOS and Android apps for doctors and patients"
    // },
    {
      icon: <Globe className="h-6 w-6 text-accent" />,
      title: "Multi-Language",
      description: "Support for 15+ languages including Hindi, Tamil, and Bengali"
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Fast Performance",
      description: "Lightning-fast load times with 99.9% uptime guarantee"
    },
    {
      icon: <Lock className="h-6 w-6 text-destructive" />,
      title: "Data Security",
      description: "Bank-level encryption with regular security audits"
    },
    {
      icon: <HeartHandshake className="h-6 w-6 text-secondary" />,
      title: "Patient Portal",
      description: "Self-service portal for patients to manage appointments and records"
    },
    {
      icon: <Stethoscope className="h-6 w-6 text-primary" />,
      title: "Clinical Tools",
      description: "Built-in clinical calculators, drug interactions, and guidelines"
    },
    {
      icon: <Database className="h-6 w-6 text-accent" />,
      title: "Data Migration",
      description: "Seamless migration from existing systems with zero downtime"
    },
    {
      icon: <Settings className="h-6 w-6 text-muted-foreground" />,
      title: "Custom Workflows",
      description: "Configurable workflows to match your practice style"
    },
    {
      icon: <Bell className="h-6 w-6 text-accent" />,
      title: "Smart Notifications",
      description: "Intelligent alerts for critical patient events and tasks"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5">
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            Complete Healthcare Solution
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Powerful Features for
            <span className="text-primary"> Modern Healthcare</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Discover how Doxxy's comprehensive feature set is perfectly tailored for small to medium clinics,
            streamlining operations and improving patient outcomes without enterprise complexity or cost.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth">Start Free Practice</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/contact">Schedule Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Core Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Six powerful yet easy-to-use modules designed specifically for small to medium clinics,
              providing the perfect balance of functionality and simplicity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="relative group hover:shadow-lg transition-all duration-300">
                {feature.badge && (
                  <Badge className="absolute -top-2 -right-2 z-10">
                    {feature.badge}
                  </Badge>
                )}
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center text-sm text-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything Else You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Additional features and capabilities that make Doxxy the complete 
              solution for healthcare professionals.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="font-semibold text-xl mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      {/* <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Seamless Integrations
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with the tools you already use and love.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Electronic Health Records",
                image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=150&h=150&fit=crop",
                description: "Seamless EHR integration"
              },
              {
                name: "Payment Gateways",
                image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=150&h=150&fit=crop",
                description: "Secure payment processing"
              },
              {
                name: "Lab Systems",
                image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=150&h=150&fit=crop",
                description: "Direct lab result integration"
              },
              {
                name: "Insurance Providers",
                image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=150&h=150&fit=crop",
                description: "Claims & verification"
              },
              {
                name: "Telemedicine Platforms",
                image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=150&h=150&fit=crop",
                description: "Video consultation tools"
              },
              {
                name: "Pharmacy Networks",
                image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=150&h=150&fit=crop",
                description: "E-prescription delivery"
              },
              {
                name: "Government Systems",
                image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=150&h=150&fit=crop",
                description: "Ayushman Bharat & NDHM"
              },
              {
                name: "Medical Devices",
                image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=150&h=150&fit=crop",
                description: "IoT device connectivity"
              }
            ].map((integration, index) => (
              <div key={index} className="text-center group">
                <div className="relative overflow-hidden rounded-lg mb-3 transition-transform group-hover:scale-105">
                  <img 
                    src={integration.image} 
                    alt={integration.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{integration.name}</h3>
                <p className="text-xs text-gray-600">{integration.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <SignupCTA />

      <SiteFooter />
    </div>
  );
};

export default Features; 