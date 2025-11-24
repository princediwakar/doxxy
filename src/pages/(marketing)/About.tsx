import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Target, 
  Users, 
  Award, 
  Globe, 
  TrendingUp,
  Shield,
  Lightbulb
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SignupCTA from "@/components/SignupCTA";
import SiteFooter from "@/components/SiteFooter";

// --- DATA ---
const stats = [
  { number: "50,000+", label: "Healthcare Professionals", icon: Users },
  { number: "2M+", label: "Patients Served", icon: Heart },
  { number: "15+", label: "Countries", icon: Globe },
  { number: "99.9%", label: "Uptime", icon: TrendingUp }
];

const values = [
  { icon: Heart, title: "Patient-Centric Care", description: "Every feature we build is designed with patient outcomes and experience at the forefront of our decision-making process." },
  { icon: Shield, title: "Security & Privacy", description: "We maintain the highest standards of data security to protect sensitive health information." },
  { icon: Lightbulb, title: "Innovation", description: "We continuously innovate to bring cutting-edge technology solutions to healthcare professionals worldwide." },
  { icon: Users, title: "Accessibility", description: "Making quality healthcare management tools accessible to practices of all sizes, from solo practitioners to large hospitals." }
];

// --- REUSABLE COMPONENTS ---

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface SectionSubtitleProps {
  children: React.ReactNode;
  className?: string;
}

const Section = ({ children, className = '' }: SectionProps) => (
  <section className={`py-24 md:py-32 ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  </section>
);

const SectionTitle = ({ children, className = '' }: SectionTitleProps) => (
  <h2 className={`text-4xl md:text-5xl font-bold text-gray-900 dark:text-white text-center ${className}`}>
    {children}
  </h2>
);

const SectionSubtitle = ({ children, className = '' }: SectionSubtitleProps) => (
  <p className={`text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center ${className}`}>
    {children}
  </p>
);

// --- PAGE SECTIONS ---

const AboutHeroSection = () => (
  <Section className="!pt-28 md:!pt-40">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
          Transforming Healthcare, Together.
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10">
          Founded by healthcare professionals for healthcare professionals, Doxxy bridges the gap between clinical excellence and technological innovation. Our mission is to make quality healthcare accessible and efficient for everyone, everywhere.
        </p>
        <div className="flex gap-4">
          <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold">
            <Link to="/features">Our Solutions</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600">
            <Link to="/contact">Get in Touch</Link>
          </Button>
        </div>
      </div>
      <div className="hidden lg:block">
        <img 
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=500&fit=crop" 
          alt="Healthcare team collaborating" 
          className="rounded-2xl shadow-xl"
        />
      </div>
    </div>
  </Section>
);

const StatsSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      {stats.map((stat) => (
        <div key={stat.label}>
          <p className="text-4xl md:text-5xl font-bold text-blue-600">{stat.number}</p>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  </Section>
);

const MissionVisionSection = () => (
  <Section>
    <div className="grid md:grid-cols-2 gap-8 md:gap-12">
      <div className="text-center">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Target className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h3>
        <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-md mx-auto">
          To democratize access to world-class healthcare technology, empowering professionals to deliver exceptional patient care while optimizing their practice operations.
        </p>
      </div>
      <div className="text-center">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Award className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Our Vision</h3>
        <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-md mx-auto">
          A world where technology seamlessly integrates with healthcare, enabling every provider to focus on what matters most: healing and improving lives.
        </p>
      </div>
    </div>
  </Section>
);

const CoreValuesSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Our Core Values.</SectionTitle>
    <SectionSubtitle className="mt-4">
      These principles guide every decision we make and every feature we build.
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
      {values.map((value) => (
        <div key={value.title} className="text-center">
          <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-200/75 dark:border-gray-700/50">
            <value.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{value.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{value.description}</p>
        </div>
      ))}
    </div>
  </Section>
);

// --- MAIN PAGE COMPONENT ---

const About = () => {
  return (
    <div className="bg-white dark:bg-gray-900">
      <AboutHeroSection />
      <StatsSection />
      <MissionVisionSection />
      <CoreValuesSection />

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
                <div className="flex-shrink-0 w-16 h-16 bg-blue-600 text-secondary  rounded-full flex items-center justify-center font-bold">
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
                  <p className="text-primary font-medium mb-3">{member.role}</p>
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