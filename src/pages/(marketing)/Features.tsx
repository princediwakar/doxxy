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
  Bell,
  Eye,
  Printer,
  Activity,
  Pill,
  CheckCircle
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

      {/* Live UI Feature Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Real Interface. Real Workflows.
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Stop reading about features. See the actual interfaces that doctors use every day. 
              These aren't mockups - this is the real Doxxy experience.
            </p>
          </div>

          {/* Consultation Workflow Showcase */}
          <div className="mb-20">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">Complete Consultation Workflow</h3>
              <p className="text-muted-foreground">From patient check-in to prescription printing - see how smooth your workflow becomes</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Step 1: Patient Information */}
              <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
                <div className="p-4 bg-blue-50 border-b">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <h4 className="font-semibold text-blue-900">Patient Check-in</h4>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Sarah Johnson</p>
                      <p className="text-xs text-muted-foreground">Female • Age 28</p>
                    </div>
                  </div>
                  <div className="text-xs space-y-1">
                    <p><span className="text-muted-foreground">Phone:</span> +91 98765 43210</p>
                    <p><span className="text-muted-foreground">Last Visit:</span> Nov 15, 2024</p>
                    <p><span className="text-muted-foreground">Appointment:</span> 10:30 AM Today</p>
                  </div>
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                    Start Consultation
                  </Button>
                </div>
              </div>

              {/* Step 2: Consultation Interface */}
              <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
                <div className="p-4 bg-green-50 border-b">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <h4 className="font-semibold text-green-900">Digital Consultation</h4>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="p-2 bg-blue-50 rounded text-xs">
                    <p className="font-medium text-blue-900 mb-1">Chief Complaint</p>
                    <p className="text-blue-800">Recurring headaches for 5 days</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded text-xs">
                    <p className="font-medium text-purple-900 mb-1">Assessment</p>
                    <p className="text-purple-800">Tension headache, stress-related</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded text-xs">
                    <p className="font-medium text-green-900 mb-1">Prescription</p>
                    <p className="text-green-800">Acetaminophen 500mg, 1 tab q6h</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="flex-1 text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" className="flex-1 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Button>
                  </div>
                </div>
              </div>

              {/* Step 3: Prescription & Billing */}
              <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
                <div className="p-4 bg-purple-50 border-b">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <h4 className="font-semibold text-purple-900">Print & Bill</h4>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="border rounded p-2">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-medium">PRESCRIPTION</span>
                      <span className="text-muted-foreground">Dr. Johnson</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="font-medium">Sarah Johnson (28F)</p>
                      <p>Rx: Acetaminophen 500mg</p>
                      <p>Sig: Take 1 tablet every 6 hours</p>
                    </div>
                  </div>
                  <div className="border rounded p-2">
                    <div className="text-xs">
                      <div className="flex justify-between mb-1">
                        <span>Consultation Fee</span>
                        <span>₹500</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Total</span>
                        <span>₹500</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="flex-1 text-xs">
                      <Printer className="h-3 w-3 mr-1" />
                      Print Rx
                    </Button>
                    <Button size="sm" className="flex-1 text-xs">
                      <CreditCard className="h-3 w-3 mr-1" />
                      Generate Bill
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <div className="inline-flex items-center gap-4 px-6 py-3 bg-white rounded-lg shadow-sm border">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Complete workflow in under 3 minutes</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Auto-save every 5 seconds</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">One-click printing</span>
              </div>
            </div>
          </div>

          {/* Patient Management Showcase */}
          <div className="mb-20">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">Patient Management Interface</h3>
              <p className="text-muted-foreground">See how easy it is to manage thousands of patient records with instant search and comprehensive history</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-xl border overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Patient Records Database
                  </h4>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Search: "John"</Button>
                    <Button size="sm">Export Records</Button>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-0">
                {/* Patient List */}
                <div className="border-r p-4 space-y-2">
                  <h5 className="font-medium text-sm mb-3">Patients (1,247)</h5>
                  {['John Doe', 'Jane Smith', 'Mike Chen', 'Sarah Johnson', 'David Kumar'].map((name, i) => (
                    <div key={i} className={`p-2 rounded border cursor-pointer hover:bg-gray-50 ${i === 0 ? 'bg-primary/5 border-primary/30' : ''}`}>
                      <p className="font-medium text-sm">{name}</p>
                      <p className="text-xs text-muted-foreground">Last: Dec {15 - i}</p>
                    </div>
                  ))}
                </div>
                
                {/* Patient Details */}
                <div className="md:col-span-3 p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-semibold">John Doe</h5>
                        <p className="text-sm text-muted-foreground">Male • Age 35 • Patient ID: P001247</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit Patient</Button>
                        <Button size="sm" variant="outline">Schedule Appointment</Button>
                        <Button size="sm">Create Bill</Button>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <h6 className="font-medium text-sm mb-2">Contact Information</h6>
                          <div className="text-sm space-y-1">
                            <p>📞 +91 98765 43210</p>
                            <p>✉️ john.doe@email.com</p>
                            <p>📍 Mumbai, Maharashtra</p>
                          </div>
                        </div>
                        
                        <div>
                          <h6 className="font-medium text-sm mb-2">Medical Summary</h6>
                          <div className="text-sm space-y-1">
                            <p>🩺 Last Visit: Today</p>
                            <p>💊 Active Prescriptions: 2</p>
                            <p>📈 Total Consultations: 8</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h6 className="font-medium text-sm mb-2">Recent Medical History</h6>
                        <div className="space-y-2">
                          {[
                            { date: 'Dec 18, 2024', complaint: 'Headache consultation', treatment: 'Prescribed: Acetaminophen 500mg' },
                            { date: 'Nov 15, 2024', complaint: 'Routine checkup', treatment: 'Normal examination, advised diet' },
                            { date: 'Oct 08, 2024', complaint: 'Cold & cough', treatment: 'Prescribed: Cough syrup, rest' }
                          ].map((record, i) => (
                            <div key={i} className="p-2 bg-gray-50 rounded text-xs">
                              <p className="font-medium text-gray-900">{record.date} - {record.complaint}</p>
                              <p className="text-gray-600 mt-1">{record.treatment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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