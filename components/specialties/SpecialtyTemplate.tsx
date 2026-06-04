// Path: components/specialties/SpecialtyTemplate.tsx

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Activity, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import SignupCTA from '@/components/SignupCTA';
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import { Section, SectionTitle, SectionSubtitle } from "@/components/ui/section-headers";
import type { SpecialtyConfig } from '@/config/specialties/types';
import * as LucideIcons from 'lucide-react';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  camera: LucideIcons.Camera,
  clipboard: LucideIcons.ClipboardList,
  calendar: LucideIcons.Calendar,
  tooth: LucideIcons.Bone,
  eye: LucideIcons.Eye,
  ear: LucideIcons.Ear,
  baby: LucideIcons.Baby,
  heart: LucideIcons.HeartPulse,
  bone: LucideIcons.Bone,
  stethoscope: LucideIcons.Stethoscope,
  syringe: LucideIcons.Syringe,
  microscope: LucideIcons.Microscope,
  messageSquare: LucideIcons.MessageSquare,
  barChart: LucideIcons.BarChart3,
  fileText: LucideIcons.FileText,
  clock: LucideIcons.Clock,
  shield: LucideIcons.ShieldCheck,
  users: LucideIcons.Users,
  activity: Activity,
  brain: LucideIcons.Brain,
  scan: LucideIcons.Scan,
  pill: LucideIcons.Pill,
  thermometer: LucideIcons.Thermometer,
  flaskConical: LucideIcons.FlaskConical,
  waveform: LucideIcons.Waves,
  tablet: LucideIcons.TabletSmartphone,
  layout: LucideIcons.LayoutTemplate,
  chartLine: LucideIcons.TrendingUp,
  target: LucideIcons.Target,
  puzzle: LucideIcons.Puzzle,
  star: LucideIcons.Star,
  wrench: LucideIcons.Wrench,
  smartPhone: LucideIcons.Smartphone,
};

const resolveIcon = (iconName: string, className = "h-6 w-6 text-blue-600") => {
  const Icon = iconMap[iconName] || LucideIcons.Stethoscope;
  return <Icon className={className} />;
};

const SpecialtyTemplate = ({ config }: { config: SpecialtyConfig }) => {
  const { specialtyName } = config;

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero */}
      <Section className="text-center !py-28 md:!py-40">
        <Badge variant="outline" className="mb-4 px-4 py-2 text-sm">
          Specialty Solution
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
          {config.heroTitle}
        </h1>
        <SectionSubtitle>{config.heroSubtitle}</SectionSubtitle>
        <div className="mt-10 flex justify-center gap-4">
          <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
            <Link href="https://wa.me/+917388890554">Start Free Practice <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600">
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      </Section>

      {/* TL;DR — "In 30 Seconds" for LLM extractability */}
      <Section className="!py-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-blue-100 dark:border-blue-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <LucideIcons.Clock className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">In 30 Seconds</span>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
              <span className="text-blue-500 font-bold mt-0.5">1.</span>
              <span><strong>Doxxy for {specialtyName} replaces paper records, manual billing, and phone-call reminders</strong> with a single digital platform built for {specialtyName.toLowerCase()} workflows.</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
              <span className="text-blue-500 font-bold mt-0.5">2.</span>
              <span><strong>Specialty-specific templates and workflows</strong> — not a generic clinic tool with the specialty name swapped in. Custom clinical note templates, prescription patterns, and billing codes for {specialtyName.toLowerCase()}.</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
              <span className="text-blue-500 font-bold mt-0.5">3.</span>
              <span><strong>WhatsApp reminders cut no-shows by 35%.</strong> Automated patient communication via WhatsApp, the platform your patients already use.</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
              <span className="text-blue-500 font-bold mt-0.5">4.</span>
              <span><strong>Pay per consultation, not per doctor.</strong> Unlimited doctors and staff on all plans. First 100 consultations free. No annual contracts.</span>
            </li>
          </ul>
        </div>
      </Section>

      {/* The Problem */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {config.problemTitle}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {config.problemDescription}
          </p>
        </div>
      </Section>

      {/* The Stats */}
      <Section className="bg-blue-600 text-white">
        <SectionTitle className="text-white !text-3xl md:!text-4xl">{config.statsSection.title}</SectionTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {config.statsSection.stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
              <div className="text-blue-100 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* The Solution */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <SectionTitle>{config.solutionTitle}</SectionTitle>
          <SectionSubtitle className="mt-4">{config.solutionDescription}</SectionSubtitle>
        </div>
      </Section>

      {/* Key Features */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>Built for {specialtyName} Workflows</SectionTitle>
        <SectionSubtitle className="mt-4">
          Every feature is designed around how {specialtyName.toLowerCase()} clinics actually operate — not a generic template with the specialty name swapped in.
        </SectionSubtitle>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {config.keyFeatures.map((feature, i) => (
            <Card key={i} className="border border-gray-200/75 dark:border-gray-700/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
                  {resolveIcon(feature.icon)}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Workflow */}
      <Section>
        <SectionTitle>A Day in a {specialtyName} Clinic — With Doxxy</SectionTitle>
        <SectionSubtitle className="mt-4">
          Here&apos;s how Doxxy transforms the daily workflow for a {specialtyName.toLowerCase()} practice.
        </SectionSubtitle>
        <div className="max-w-3xl mx-auto mt-16 space-y-8">
          {config.workflowSteps.map((step, i) => (
            <div key={i} className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                {step.step}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Before / After */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>Before Doxxy vs After Doxxy</SectionTitle>
        <SectionSubtitle className="mt-4">
          The difference isn&apos;t just software — it&apos;s how your clinic runs day to day.
        </SectionSubtitle>
        <div className="overflow-x-auto mt-12">
          <table className="w-full max-w-4xl mx-auto border-collapse bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="py-4 px-6 text-left text-gray-600 dark:text-gray-300 font-medium">Area</th>
                <th className="py-4 px-6 text-left text-gray-600 dark:text-gray-300 font-medium">
                  <span className="line-through decoration-gray-400">Before Doxxy</span>
                </th>
                <th className="py-4 px-6 text-left text-blue-600 dark:text-blue-400 font-medium">With Doxxy</th>
              </tr>
            </thead>
            <tbody>
              {config.beforeAfterComparisons.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}>
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700">{row.area}</td>
                  <td className="py-4 px-6 text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">{row.before}</td>
                  <td className="py-4 px-6 text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700">
                    <span className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      {row.after}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Testimonial (optional) */}
      {config.testimonial && (
        <Section>
          <div className="max-w-3xl mx-auto text-center">
            <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white italic leading-relaxed">
              &ldquo;{config.testimonial.quote}&rdquo;
            </blockquote>
            <div className="mt-8 flex items-center justify-center">
              <img
                src={config.testimonial.photo}
                alt={config.testimonial.name}
                className="w-14 h-14 rounded-full mr-4"
              />
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">{config.testimonial.name}</p>
                <p className="text-gray-500 dark:text-gray-400">{config.testimonial.clinic}, {config.testimonial.city}</p>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* FAQ */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>Frequently Asked Questions</SectionTitle>
        <div className="max-w-3xl mx-auto mt-12 space-y-4">
          {config.faqs.map((faq, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <SignupCTA
        heading="See Doxxy in Your Specialty — Not a Generic Demo"
        description="We'll show you the templates, workflows, and features specific to your specialty. Chat with us on WhatsApp — tell us what you practice."
      />

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: `${config.specialtyName} Clinic Software`, url: `${APP_URL}/specialties/${config.slug}` },
        ]}
      />
    </div>
  );
};

export default SpecialtyTemplate;
