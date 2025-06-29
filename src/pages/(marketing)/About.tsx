import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Target, 
  Users, 
  Award, 
  Globe, 
  Building2,
  TrendingUp,
  Shield,
  Stethoscope,
  Lightbulb,
  MapPin,
  Mail,
  Linkedin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SignupCTA from "@/components/SignupCTA";
import SiteFooter from "@/components/SiteFooter";

const About = () => {
  const stats = [
    { number: "50,000+", label: "Healthcare Professionals", icon: <Users className="h-6 w-6" /> },
    { number: "2M+", label: "Patients Served", icon: <Heart className="h-6 w-6" /> },
    { number: "15+", label: "Countries", icon: <Globe className="h-6 w-6" /> },
    { number: "99.9%", label: "Uptime", icon: <TrendingUp className="h-6 w-6" /> }
  ];

  const values = [
    {
      icon: <Heart className="h-8 w-8 text-red-500" />,
      title: "Patient-Centric Care",
      description: "Every feature we build is designed with patient outcomes and experience at the forefront of our decision-making process."
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-500" />,
      title: "Security & Privacy",
      description: "We maintain the highest standards of data security to protect sensitive health information."
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-yellow-500" />,
      title: "Innovation",
      description: "We continuously innovate to bring cutting-edge technology solutions to healthcare professionals worldwide."
    },
    {
      icon: <Users className="h-8 w-8 text-green-500" />,
      title: "Accessibility",
      description: "Making quality healthcare management tools accessible to practices of all sizes, from solo practitioners to large hospitals."
    }
  ];

  const team = [
    {
      name: "Dr. Priya Sharma",
      role: "CEO & Co-Founder",
      bio: "Former practicing physician with 15+ years in healthcare technology. MBBS from AIIMS Delhi, MBA from IIM Bengaluru.",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=400&fit=crop",
      linkedin: "#"
    },
    {
      name: "Rajesh Kumar",
      role: "CTO & Co-Founder", 
      bio: "Former Senior Engineering Manager at Google. Built scalable healthcare systems serving millions of users.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
      linkedin: "#"
    },
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      bio: "Board-certified internist and healthcare informatics specialist. Previously at Mayo Clinic's Innovation Lab.",
      image: "https://images.unsplash.com/photo-1594824204175-b70147e9cbc5?w=300&h=400&fit=crop",
      linkedin: "#"
    },
    {
      name: "Amit Patel",
      role: "VP of Engineering",
      bio: "Former Lead Architect at Microsoft Healthcare. Expert in FHIR standards and healthcare interoperability.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop",
      linkedin: "#"
    },
    {
      name: "Dr. Maria Rodriguez",
      role: "Head of Product",
      bio: "Emergency medicine physician turned product manager. Deep understanding of clinical workflows and user needs.",
      image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=300&h=400&fit=crop",
      linkedin: "#"
    },
    {
      name: "Vikram Singh",
      role: "VP of Sales",
      bio: "15+ years in healthcare technology sales. Former regional director at Epic Systems and Allscripts.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=400&fit=crop",
      linkedin: "#"
    }
  ];

  const milestones = [
    { year: "2019", title: "Company Founded", description: "Doxxy was founded by a team of healthcare professionals and technologists in Bengaluru, India." },
    { year: "2020", title: "First 1,000 Users", description: "Reached our first milestone of 1,000 healthcare professionals using our platform." },
    { year: "2021", title: "Series A Funding", description: "Raised $10M Series A to expand our platform and enter international markets." },
    { year: "2022", title: "Launched in the US", description: "Launched in the United States market." },
    { year: "2023", title: "AI Integration", description: "Launched AI-powered features for appointment scheduling and patient insights." },
    { year: "2024", title: "Global Expansion", description: "Expanded to 15 countries and crossed 50,000 healthcare professionals on our platform." }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <section className="py-20 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            About <span className="text-blue-600">Doxxy</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transforming healthcare delivery through innovative technology solutions.
          </p>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4 px-4 py-2">
                Our Story
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Transforming Healthcare
                <span className="text-blue-600"> Together</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Founded by healthcare professionals for healthcare professionals, Doxxy bridges the gap 
                between clinical excellence and technological innovation. Our mission is to make quality 
                healthcare accessible and efficient for everyone, everywhere.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link to="/contact">Get in Touch</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/features">Our Solutions</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=500&fit=crop" 
                alt="Healthcare team collaborating" 
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Stethoscope className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Trusted by</p>
                    <p className="text-2xl font-bold text-blue-600">50,000+ Doctors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit text-blue-600">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="p-8">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">
                  To democratize access to world-class healthcare management technology, 
                  empowering healthcare professionals to deliver exceptional patient care 
                  while optimizing their practice operations, regardless of their size or location.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">
                  A world where technology seamlessly integrates with healthcare delivery, 
                  enabling every healthcare provider to focus on what matters most - 
                  healing and improving lives, while we handle the complexity of practice management.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These principles guide every decision we make and every feature we build.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4">{value.icon}</div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      {/* <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-gray-600">
              Key milestones in our mission to transform healthcare technology.
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {milestone.year}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Team */}
      {/* <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Leadership Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Healthcare professionals and technology experts working together to revolutionize healthcare delivery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-3 aspect-h-4">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {member.bio}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Linkedin className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}


      <SignupCTA />
      <SiteFooter />
    </div>
  );
};

export default About; 