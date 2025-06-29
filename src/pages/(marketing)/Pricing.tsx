import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
  import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Building2, 
  Users, 
  Shield,
  Phone,
  Clock,
  Award,
  ArrowRight,
  DollarSign,
  Percent,
  Wallet,
  CreditCard,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteFooter from "@/components/SiteFooter";
import SignupCTA from '@/components/SignupCTA';

const Pricing = () => {
  // Pricing now has no yearly commitment; billing is purely usage based.

  const plans = [
    {
      name: "Practice Essentials",
      description: "Perfect for new practices. First 100 appointments free.",
      monthlyPrice: 0,
      priceSuffix: "",
      icon: <Users className="h-6 w-6" />,
      features: [
        "Unlimited doctors & clinic staff",
        "Appointment scheduling (up to 100 total)",
        "Essential patient records & prescriptions",
        "Basic clinical reports & analytics",
        "Secure medical data storage",
        "Fully compliant with healthcare regulations"
      ],
      limitations: [
        "Pay-as-you-go after 100 appointments"
      ],
      cta: "Start Free Practice",
      popular: false
    },
    {
      name: "Clinical Excellence",
      description: "For established clinics. Premium features at special pricing.",
      monthlyPrice: 10,
      priceSuffix: "/appointment",
      originalPrice: 20,
      icon: <Zap className="h-6 w-6" />,
      features: [
        "Unlimited doctors & staff members",
        "Unlimited appointments with smart scheduling",
        "Comprehensive EMR with digital prescriptions",
        "Patient reminders via SMS & WhatsApp",
        "Clinical analytics & practice insights",
        "Secure role-based access for your team",
        "Priority 24/7 support for doctors"
      ],
      limitations: [],
      cta: "Claim Special Offer",
      popular: true
    },
  ];

  // Add-ons removed as per request

  const faqs = [
    {
      question: "Is there a free plan?",
      answer: "Yes! Our Practice Essentials plan is completely free for your first 100 appointments. You can explore all essential features with no credit card required."
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Absolutely. You can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the next billing cycle."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, bank transfers, and for Indian customers, we also accept UPI, net banking, and digital wallets."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we use bank-level encryption for all data. Your data is stored in secure data centers with regular backups."
    },
    {
      question: "Do you offer discounts for non-profits?",
      answer: "Yes, we offer special pricing for non-profit healthcare organizations and government health programs. Contact our sales team for details."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your subscription at any time. We don't believe in long-term contracts or cancellation fees."
    },
    {
      question: "What exactly counts as an 'appointment'?",
      answer: "An appointment is any scheduled patient visit that's marked as 'completed' in the system. Cancelled or no-show appointments are not counted in your billing."
    },
    {
      question: "What happens when I reach 100 appointments on the free plan?",
      answer: "After your first 100 appointments, you'll automatically transition to our pay-as-you-go model at ₹10 per appointment. There's no interruption in service, and you can continue using all the features you need."
    },
    {
      question: "Are there any limits on doctors or staff members?",
      answer: "No. Unlike other platforms that charge per provider, Doxxy allows unlimited doctors and staff members on all plans, including our free Practice Essentials plan."
    },
    {
      question: "How does billing work?",
      answer: "We bill monthly based on your completed appointments. You'll receive an invoice at the end of each month detailing your usage, and payment is processed automatically through your preferred payment method."
    }
  ];

  const advantages = [
    {
      icon: <DollarSign className="h-8 w-8 text-success" />,
      title: "Pay Only For What You Use",
      description: "Unlike other platforms that charge monthly subscription fees regardless of usage, our per-appointment pricing means you only pay for actual appointments. No wasted resources during slow months.",
      competitors: "Monthly subscription fees regardless of usage"
    },
    {
      icon: <Calendar className="h-8 w-8 text-primary" />,
      title: "Free For First 100 Appointments",
      description: "Start with zero risk - our Practice Essentials plan gives you full access to essential features for your first 100 appointments, completely free. No hidden fees or surprise charges.",
      competitors: "Limited-time trials that expire regardless of usage"
    },
    {
      icon: <Percent className="h-8 w-8 text-secondary" />,
      title: "No Doctor-Based Pricing",
      description: "Other platforms charge per doctor, forcing you to pay more as your practice grows. Our pricing is based solely on appointments, allowing unlimited doctors and staff on all plans.",
      competitors: "Per-doctor fees that multiply costs as your team grows"
    },
    {
      icon: <Wallet className="h-8 w-8 text-accent" />,
      title: "No Annual Commitments",
      description: "We don't believe in locking you into long-term contracts. Scale up or down as needed, with the flexibility to adjust to your practice's changing needs.",
      competitors: "Annual contracts with hefty early termination fees"
    },
    {
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      title: "Transparent Pricing",
      description: "Our pricing is simple and transparent - ₹10 per appointment with all features included. No surprise fees, hidden costs, or expensive add-ons required for essential functionality.",
      competitors: "Base fees plus expensive add-ons for essential features"
    },
    {
      icon: <Zap className="h-8 w-8 text-destructive" />,
      title: "Grow At Your Own Pace",
      description: "Our pricing model grows smoothly with your practice. No sudden pricing tier jumps when you hit arbitrary user or appointment thresholds.",
      competitors: "Steep price increases when crossing arbitrary thresholds"
    }
  ];

  const comparisons = [
    {
      feature: "Pricing Model",
      us: "Per appointment (₹10)",
      competitors: "Monthly subscription + per doctor fees",
      better: true
    },
    {
      feature: "Free Plan",
      us: "First 100 appointments free",
      competitors: "14-30 day time-limited trial",
      better: true
    },
    {
      feature: "Doctor Limits",
      us: "Unlimited doctors on all plans",
      competitors: "Pay per doctor/provider",
      better: true
    },
    {
      feature: "Contract Length",
      us: "No commitment, cancel anytime",
      competitors: "Annual contracts with penalties",
      better: true
    },
    {
      feature: "Hidden Fees",
      us: "None, all features included",
      competitors: "Setup fees, training fees, support fees",
      better: true
    },
    {
      feature: "Cost Predictability",
      us: "Directly tied to appointment volume",
      competitors: "Complex tiered pricing with multiple variables",
      better: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-medical">
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            Fair & Transparent Pricing
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Pricing That
            <span className="text-primary"> Makes Sense</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Premium plans designed specifically for doctors and small clinics. 
            No hidden fees, no per-doctor charges, no complex tiers - just fair pricing that scales with your practice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth">
                Start Free Practice
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.popular ? 'ring-2 ring-blue-600 scale-105' : ''} hover:shadow-lg transition-all duration-300`}
              >
                {plan.originalPrice && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <Badge className="bg-success px-3 py-1 text-sm font-medium">
                      <Clock className="h-4 w-4 mr-2" />
                      Limited Time Offer
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 mb-4">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">
                      {plan.monthlyPrice === 0 ? (
                        <>
                          Free
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col items-center justify-center">
                            <div className="flex items-center gap-3 mb-1">
                              <div className="text-4xl font-bold">
                                ₹{plan.monthlyPrice}
                                <span className="text-lg text-gray-500 font-normal">{plan.priceSuffix}</span>
                              </div>
                              {plan.originalPrice && (
                                <div className="text-lg text-gray-400 line-through">
                                  ₹{plan.originalPrice}{plan.priceSuffix}
                                </div>
                              )}
                            </div>
                            {plan.originalPrice && (
                              <div className="mt-1 text-sm font-medium text-success">
                                Save ₹{plan.originalPrice - plan.monthlyPrice} per appointment
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-success mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Not included:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-500">
                            <X className="h-4 w-4 text-destructive mr-3 flex-shrink-0" />
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button 
                    className="w-full mt-6" 
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/auth">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The Doxxy Pricing Advantage
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              How our innovative pricing model gives your practice more flexibility and better value.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4">{advantage.icon}</div>
                  <CardTitle className="text-xl">{advantage.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{advantage.description}</p>
                  <div className="flex items-start">
                    <X className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-500 italic">
                      <span className="font-medium">Other platforms:</span> {advantage.competitors}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How We Compare
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how our pricing philosophy stacks up against traditional healthcare software pricing models.
            </p>
            <div className="mt-4">
              <Link to="/comparisons" className="text-primary hover:text-primary/80 underline font-medium">
                View detailed comparisons with Eka Care, Practo, and more →
              </Link>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-4 px-2 font-semibold text-gray-900 w-1/3">Feature</th>
                      <th className="text-left py-4 px-2 font-semibold text-primary w-1/3">Doxxy</th>
                      <th className="text-left py-4 px-2 font-semibold text-gray-500 w-1/3">Other Platforms</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons.map((item, index) => (
                      <tr key={index} className={index < comparisons.length - 1 ? "border-b" : ""}>
                        <td className="py-4 px-2 font-medium text-gray-900">{item.feature}</td>
                        <td className="py-4 px-2 text-gray-800 flex items-center">
                          {item.better && <Check className="h-4 w-4 text-success mr-2 flex-shrink-0" />}
                          {item.us}
                        </td>
                        <td className="py-4 px-2 text-gray-500">{item.competitors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <Card className="border-none shadow-xl bg-gradient-to-r from-primary to-primary/80 text-secondary ">
            <CardContent className="p-8">
              <div className="mb-6">
                <BarChart3 className="h-12 w-12" />
              </div>
              <blockquote className="text-xl md:text-2xl font-medium mb-6">
                "After switching from a subscription-based platform that charged per doctor, we're saving over 40% with Doxxy's per-appointment model. The best part is we only pay for what we actually use."
              </blockquote>
              <div>
                <p className="text-secondary font-semibold">Dr. Meera Sharma</p>
                <p className="text-primary-foreground/70">Family Medicine Practice, Bengaluru</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Healthcare Professionals Choose Doxxy
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            
            <div className="flex flex-col items-center">
              <Phone className="h-12 w-12 text-success mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-sm text-gray-600">Round-the-clock assistance when you need it</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="h-12 w-12 text-secondary mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">99.9% Uptime</h3>
              <p className="text-sm text-gray-600">Reliable service you can count on</p>
            </div>
            <div className="flex flex-col items-center">
              <Award className="h-12 w-12 text-accent mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Award Winning</h3>
              <p className="text-sm text-gray-600">Recognized by healthcare industry leaders</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
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

export default Pricing; 