import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Lock, 
  Eye, 
  CheckCircle, 
  FileText, 
  Users, 
  Database,
  Cloud,
  Key,
  AlertTriangle,
  UserCheck,
  Globe,
  Award,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SignupCTA from "@/components/SignupCTA";
import SiteFooter from "@/components/SiteFooter";

const Security = () => {
  const certifications = [
    {
      icon: <Award className="h-8 w-8 text-blue-600" />,
      
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      
    },
    {
      icon: <Globe className="h-8 w-8 text-purple-600" />,
      title: "GDPR Compliant",
      description: "European data protection regulation compliance",
      status: "Certified"
    },
    {
      icon: <Lock className="h-8 w-8 text-orange-600" />,
      title: "ISO 27001",
      description: "International security management standard",
      status: "In Progress"
    }
  ];

  const securityFeatures = [
    {
      icon: <Lock className="h-6 w-6" />,
      title: "End-to-End Encryption",
      description: "All data encrypted in transit and at rest using AES-256 encryption"
    },
    {
      icon: <Key className="h-6 w-6" />,
      title: "Multi-Factor Authentication",
      description: "Required MFA for all user accounts with multiple authentication methods"
    },
    {
      icon: <UserCheck className="h-6 w-6" />,
      title: "Role-Based Access Control",
      description: "Granular permissions ensure users only access what they need"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Audit Logging",
      description: "Comprehensive audit trails for all system access and data changes"
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Data Backup & Recovery",
      description: "Automated daily backups with point-in-time recovery capabilities"
    },
    {
      icon: <Cloud className="h-6 w-6" />,
      title: "Secure Cloud Infrastructure",
      description: "Hosted on AWS with enterprise-grade security controls"
    },
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: "Threat Detection",
      description: "24/7 monitoring with automated threat detection and response"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Data Loss Prevention",
      description: "Advanced DLP policies prevent unauthorized data exposure"
    }
  ];

  const hipaaCompliance = [
    {
      title: "Administrative Safeguards",
      items: [
        "Security Officer designation and responsibilities",
        "Workforce training and access management",
        "Information system activity review",
        "Assigned security responsibilities",
        "Business Associate Agreements (BAAs)"
      ]
    },
    {
      title: "Physical Safeguards",
      items: [
        "Facility access controls",
        "Workstation use restrictions",
        "Device and media controls",
        "Secure data center locations",
        "Environmental monitoring"
      ]
    },
    {
      title: "Technical Safeguards",
      items: [
        "Access control (unique user identification)",
        "Audit controls and logging",
        "Integrity of ePHI protection",
        "Transmission security protocols",
        "Encryption of data at rest and in transit"
      ]
    }
  ];

  const dataHandling = [
    {
      phase: "Data Collection",
      description: "Minimal data collection with explicit consent",
      controls: [
        "Purpose limitation principle",
        "Data minimization practices",
        "Explicit user consent",
        "Transparent privacy notices"
      ]
    },
    {
      phase: "Data Processing",
      description: "Secure processing with audit trails",
      controls: [
        "Encrypted processing environments",
        "Access logging and monitoring",
        "Data integrity checks",
        "Processing purpose validation"
      ]
    },
    {
      phase: "Data Storage",
      description: "Encrypted storage with backup redundancy",
      controls: [
        "AES-256 encryption at rest",
        "Geographically distributed backups",
        "Retention policy enforcement",
        "Secure deletion procedures"
      ]
    },
    {
      phase: "Data Transmission",
      description: "Secure transmission protocols",
      controls: [
        "TLS 1.3 encryption in transit",
        "Certificate pinning",
        "VPN for administrative access",
        "API security authentication"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            Security & Compliance
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Data is
            <span className="text-blue-600"> Secure</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Doxxy implements enterprise-grade security measures to protect your practice and patient data with the highest level of security.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/contact">Security Consultation</Link>
            </Button>
            <Button variant="outline" size="lg">
              Download Security Whitepaper
            </Button>
          </div>
        </div>
      </section>

      {/* Certifications
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Security Certifications
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We maintain industry-leading certifications to ensure the highest standards of security and compliance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {certifications.map((cert, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4">{cert.icon}</div>
                  <CardTitle className="text-xl">{cert.title}</CardTitle>
                  <Badge 
                    variant={cert.status === "Certified" ? "default" : "secondary"}
                    className="mt-2"
                  >
                    {cert.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {cert.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Security Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Security Features
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive security controls protecting your data at every level.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HIPAA Compliance */}
      

      {/* Data Handling Lifecycle */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Secure Data Lifecycle
            </h2>
            <p className="text-lg text-gray-600">
              Every stage of data handling is secured with multiple layers of protection.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {dataHandling.map((phase, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg mx-auto mb-4">
                    {index + 1}
                  </div>
                  <CardTitle className="text-xl text-center">{phase.phase}</CardTitle>
                  <CardDescription className="text-center">{phase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {phase.controls.map((control, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-600">{control}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Monitoring */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                24/7 Security Monitoring
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our Security Operations Center (SOC) provides round-the-clock monitoring 
                and threat detection to protect your practice from evolving cyber threats.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Real-time Threat Detection</h3>
                    <p className="text-gray-600 text-sm">
                      Advanced AI-powered monitoring identifies and responds to threats in real-time.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Expert Security Team</h3>
                    <p className="text-gray-600 text-sm">
                      Certified security professionals monitor and respond to incidents 24/7.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Incident Response</h3>
                    <p className="text-gray-600 text-sm">
                      Rapid incident response with detailed forensics and remediation plans.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1551808525-51a94da548ce?w=600&h=500&fit=crop" 
                alt="Security monitoring dashboard" 
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">99.9%</div>
                  <div className="text-sm text-gray-600">Threat Detection Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <SignupCTA />
      <SiteFooter />
    </div>
  );
};

export default Security; 