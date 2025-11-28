import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  ArrowRight,
  Calendar,
  Clock,
  Coins,
  Users,
  Building2,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";
import SiteFooter from "@/components/SiteFooter";
import SignupCTA from "@/components/SignupCTA";

const EkaCareAlternative = () => {
  const keyFeatures = [
    {
      icon: <Coins className="h-12 w-12 text-primary" />,
      title: "Pay-Per-Appointment Pricing",
      description:
        "Unlike Eka Care's fixed monthly fees, Doxxy charges only for the appointments you actually complete. Start with 100 free appointments and then pay just ₹10 per consultation.",
    },
    {
      icon: <Users className="h-12 w-12 text-success" />,
      title: "Unlimited Doctors & Staff",
      description:
        "Eka Care charges per doctor, limiting your practice's growth. Doxxy allows unlimited doctors and staff members on all plans, including our free tier.",
    },
    {
      icon: <Building2 className="h-12 w-12 text-purple-600" />,
      title: "Multi-Clinic Management",
      description:
        "Manage multiple clinic locations from a single dashboard without paying premium fees. Eka Care restricts this feature to higher-tier plans only.",
    },
    {
      icon: <Calendar className="h-12 w-12 text-orange-600" />,
      title: "Smart Appointment Scheduling",
      description:
        "Doxxy's intelligent scheduling system prevents double-bookings, sends automatic reminders, and allows patients to book online - all included in the base price.",
    },
  ];

  const whySwitch = [
    {
      title: "Cost Savings",
      description:
        "Practices that switch from Eka Care to Doxxy report average savings of 30-40% on their healthcare management software costs.",
      icon: <Coins className="h-6 w-6 text-primary" />,
    },
    {
      title: "No Growth Penalties",
      description:
        "Eka Care charges more as you add doctors. Doxxy's pricing is based solely on appointments, so your practice can grow without software cost penalties.",
      icon: <Users className="h-6 w-6 text-success" />,
    },
    {
      title: "All Features Included",
      description:
        "No feature restrictions or premium tiers. All Doxxy users get access to the complete platform, including advanced analytics and multi-clinic management.",
      icon: <Check className="h-6 w-6 text-purple-600" />,
    },
    {
      title: "No Long-Term Contracts",
      description:
        "Unlike Eka Care's annual commitments, Doxxy has no long-term contracts. Pay monthly based on your actual usage.",
      icon: <Clock className="h-6 w-6 text-orange-600" />,
    },
    {
      title: "Better Patient Experience",
      description:
        "Doxxy's patient portal and communication tools are more intuitive and feature-rich than Eka Care's basic offering.",
      icon: <MessageSquare className="h-6 w-6 text-destructive" />,
    },
    {
      title: "Dedicated Migration Support",
      description:
        "Our team will help you transition from Eka Care to Doxxy with minimal disruption to your practice.",
      icon: <ArrowRight className="h-6 w-6 text-indigo-600" />,
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Schedule a Demo",
      description:
        "See how Doxxy works and how it compares to your current Eka Care experience.",
    },
    {
      number: 2,
      title: "Plan Your Migration",
      description:
        "Our team will create a customized migration plan for your practice data.",
    },
    {
      number: 3,
      title: "Data Transfer",
      description:
        "We'll handle the export from Eka Care and import into Doxxy.",
    },
    {
      number: 4,
      title: "Staff Training",
      description:
        "Comprehensive training for your entire team on the new system.",
    },
    {
      number: 5,
      title: "Go Live",
      description:
        "Switch over to Doxxy with continued support during the transition.",
    },
  ];

  const testimonials = [
    {
      quote:
        "We were paying nearly ₹5000 per month with Eka Care because we had 4 doctors. With Doxxy, we're saving at least ₹2000 monthly while getting more features.",
      name: "Dr. Amit Verma",
      clinic: "City Health Clinic, Delhi",
      photo:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop",
    },
    {
      quote:
        "The unlimited doctors feature alone made switching to Doxxy worth it. As we've grown from 2 to 6 doctors, our software costs have remained predictable.",
      name: "Dr. Sunita Reddy",
      clinic: "Wellness Multispecialty, Chennai",
      photo:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop",
    },
  ];

  const faqs = [
    {
      question: "How difficult is it to migrate from Eka Care to Doxxy?",
      answer:
        "Migration is straightforward with our dedicated migration team. We handle the data export, import, and verification process. Most practices are up and running on Doxxy within 1-2 weeks with no disruption to patient care.",
    },
    {
      question: "Will I lose any features by switching from Eka Care?",
      answer:
        "No. Doxxy includes all the features available in Eka Care and adds several improvements, including unlimited doctors, better patient communication tools, and more flexible reporting.",
    },
    {
      question: "How much can I expect to save by switching?",
      answer:
        "Savings vary based on your practice size and appointment volume, but clinics with multiple doctors typically save 30-40% compared to Eka Care's doctor-based pricing model.",
    },
    {
      question: "Can I try Doxxy before fully committing?",
      answer:
        "Yes! Our Practice Essentials plan gives you 100 free appointments to fully test the system. You can even run Doxxy alongside Eka Care during your evaluation period.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-medical">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            Better Alternative
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Looking for an
            <span className="text-primary"> Eka Care Alternative?</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Discover why healthcare practices are switching from Eka Care to
            Doxxy for more flexible pricing, unlimited doctors, and a more
            comprehensive feature set.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth">
                Try Doxxy Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/contact">Schedule Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Doxxy Over Eka Care?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Doxxy offers a more flexible, cost-effective alternative to Eka
              Care with these key advantages:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {keyFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Doxxy vs Eka Care: Feature Comparison
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how Doxxy stacks up against Eka Care across key features.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-50">
                  <th className="py-4 px-6 text-left text-gray-900 font-medium">
                    Feature
                  </th>
                  <th className="py-4 px-6 text-center text-primary font-medium">
                    Doxxy
                  </th>
                  <th className="py-4 px-6 text-center text-gray-600 font-medium">
                    Eka Care
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-4 px-6 border-t font-medium">
                    Pricing Model
                  </td>
                  <td className="py-4 px-6 border-t text-center">
                    Pay-per-appointment
                  </td>
                  <td className="py-4 px-6 border-t text-center">
                    Monthly subscription
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-6 border-t font-medium">
                    Doctor Limits
                  </td>
                  <td className="py-4 px-6 border-t text-center">
                    Unlimited on all plans
                  </td>
                  <td className="py-4 px-6 border-t text-center">
                    Pay per doctor
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-t font-medium">Free Plan</td>
                  <td className="py-4 px-6 border-t text-center">
                    100 appointments free
                  </td>
                  <td className="py-4 px-6 border-t text-center">
                    Limited time trial only
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-6 border-t font-medium">
                    Contract Length
                  </td>
                  <td className="py-4 px-6 border-t text-center">
                    No commitment
                  </td>
                  <td className="py-4 px-6 border-t text-center">
                    Annual contract
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-t font-medium">
                    Multi-Clinic Management
                  </td>
                  <td className="py-4 px-6 border-t text-center">All plans</td>
                  <td className="py-4 px-6 border-t text-center">
                    Premium plans only
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-6 border-t font-medium">
                    Patient SMS Notifications
                  </td>
                  <td className="py-4 px-6 border-t text-center">Included</td>
                  <td className="py-4 px-6 border-t text-center">
                    Additional fee
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 border-t font-medium">
                    WhatsApp Integration
                  </td>
                  <td className="py-4 px-6 border-t text-center">Included</td>
                  <td className="py-4 px-6 border-t text-center">
                    Additional fee
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-6 border-t font-medium">
                    Advanced Analytics
                  </td>
                  <td className="py-4 px-6 border-t text-center">All plans</td>
                  <td className="py-4 px-6 border-t text-center">
                    Premium plans only
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why Switch */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              6 Reasons to Switch from Eka Care
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Healthcare practices across India are making the switch to Doxxy.
              Here's why:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whySwitch.map((reason, index) => (
              <div key={index} className="flex items-start">
                <div className="mr-4 mt-1">{reason.icon}</div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{reason.title}</h3>
                  <p className="text-gray-600">{reason.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Migration Process */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple Migration Process
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Switching from Eka Care to Doxxy is easier than you think. Our
              team handles the entire process:
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-200 hidden md:block"
              style={{ transform: "translateX(-50%)" }}
            ></div>

            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="flex flex-col md:flex-row items-center">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full text-secondary  font-bold ${
                        index % 2 === 0 ? "bg-primary" : "bg-success"
                      } relative z-10 mb-4 md:mb-0`}
                    >
                      {step.number}
                    </div>
                    <div className="md:ml-8 text-center md:text-left">
                      <h3 className="text-xl font-semibold mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <Button size="lg" asChild>
              <Link to="/contact">Schedule Your Migration Consultation</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hear from Doctors Who Switched
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Healthcare professionals who made the switch from Eka Care to
              Doxxy share their experiences:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-blue-50 border-none">
                <CardContent className="p-8 space-y-4">
                  <blockquote className="text-lg text-gray-700 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center">
                    <img
                      src={testimonial.photo}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {testimonial.name}
                      </p>
                      <p className="text-gray-600">{testimonial.clinic}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Common questions about switching from Eka Care to Doxxy.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <SignupCTA />

      <SiteFooter />
    </div>
  );
};

export default EkaCareAlternative;
