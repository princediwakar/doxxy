// Path: components/cities/CityHubTemplate.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Building2, TrendingUp, FileText, UserX, IndianRupee, ShieldCheck, Smartphone, CreditCard, Wifi, MessageSquare, QrCode, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'
import SignupCTA from '@/components/SignupCTA'
import BreadcrumbJsonLd from '@/components/SEO/BreadcrumbJsonLd'
import { APP_URL } from '@/lib/constants'
import { Section, SectionTitle, SectionSubtitle } from '@/components/ui/section-headers'
import type { CityConfig } from '@/config/cities/types'

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  messageSquare: MessageSquare,
  smartPhone: Smartphone,
  fileText: FileText,
  creditCard: CreditCard,
  shield: ShieldCheck,
  trendingUp: TrendingUp,
  mapPin: MapPin,
  link: MessageSquare,
  flaskConical: FileText,
  users: Building2,
  qrCode: QrCode,
  clock: Clock,
  building2: Building2,
  userX: UserX,
  indianRupee: IndianRupee,
  wifi: Wifi,
}

const resolveIcon = (iconName: string, className = 'h-6 w-6 text-blue-600') => {
  const Icon = iconMap[iconName] || Building2
  return <Icon className={className} />
}

const CityHubTemplate = ({ config }: { config: CityConfig }) => {
  const { cityName } = config

  const dataStats = [
    { icon: Building2, value: config.clinicStats.estimatedClinics, label: `Estimated Clinics in ${cityName}` },
    { icon: TrendingUp, value: config.clinicStats.softwareAdoptionRate, label: 'Software Adoption Rate' },
    { icon: FileText, value: config.clinicStats.paperUsageRate, label: 'Still Using Paper Records' },
    { icon: UserX, value: config.clinicEconomics.avgNoShowRate, label: 'Average Patient No-Show Rate' },
    { icon: IndianRupee, value: config.clinicEconomics.avgRevenuePerPatient, label: 'Average Revenue Per Patient' },
    { icon: ShieldCheck, value: config.clinicStats.abdmComplianceRate, label: 'ABDM Compliance Rate' },
  ]

  const techStats = [
    { icon: Smartphone, value: config.techContext.whatsappPenetration, label: 'WhatsApp Penetration' },
    { icon: CreditCard, value: config.techContext.digitalPaymentAdoption, label: 'Digital Payment Adoption' },
    { icon: Wifi, value: config.techContext.internetPenetration, label: 'Internet Penetration' },
  ]

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero */}
      <Section className="text-center !py-28 md:!py-40">
        <Badge variant="outline" className="mb-4 px-4 py-2 text-sm">
          City Solution
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

      {/* The Data — Stats Cards */}
      <Section className="bg-blue-600 text-white">
        <SectionTitle className="text-white !text-3xl md:!text-4xl">
          Clinic Landscape in {cityName}: The Data
        </SectionTitle>
        <SectionSubtitle className="text-blue-100 mt-4">
          A snapshot of how clinics in {cityName} operate today — and the opportunity for digital transformation.
        </SectionSubtitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {dataStats.map((stat, i) => (
            <div key={i} className="text-center">
              <stat.icon className="h-8 w-8 mx-auto mb-3 text-blue-200" />
              <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
              <div className="text-blue-100 text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* The Math — Economics Section */}
      <Section>
        <SectionTitle>The Math: What Operational Inefficiency Costs {cityName} Clinics</SectionTitle>
        <SectionSubtitle className="mt-4">
          Clinics in {cityName} lose approximately {config.clinicEconomics.estimatedMonthlyLossToNoShows} to patient no-shows and billing errors.
        </SectionSubtitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 max-w-5xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-blue-600">{config.clinicEconomics.avgNoShowRate}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Average No-Show Rate</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-red-500">{config.clinicEconomics.estimatedMonthlyLossToNoShows}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Monthly Revenue Lost to No-Shows</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-blue-600">{config.clinicEconomics.avgBillingErrorRate}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Billing Error Rate (Manual)</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-blue-600">{config.clinicEconomics.avgMonthlyRevenue}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Average Monthly Revenue</p>
            </CardContent>
          </Card>
        </div>
        <div className="max-w-3xl mx-auto mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            These numbers are based on aggregated data from clinics across {cityName}. Individual clinic figures vary based on specialty, location, and patient volume.
          </p>
        </div>
      </Section>

      {/* The Solution */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <SectionTitle>{config.solutionTitle}</SectionTitle>
          <SectionSubtitle className="mt-4">{config.solutionDescription}</SectionSubtitle>
        </div>
      </Section>

      {/* Key Features */}
      <Section>
        <SectionTitle>How Doxxy Serves {cityName} Clinics</SectionTitle>
        <SectionSubtitle className="mt-4">
          Each feature is designed for how clinics in {cityName} operate — with an understanding of local patient expectations, regulatory requirements, and operational realities.
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

      {/* Tech Context */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>{cityName}&apos;s Digital Readiness</SectionTitle>
        <SectionSubtitle className="mt-4">
          {cityName}&apos;s patient base is ready for digital-first clinic experiences. The infrastructure is already in place.
        </SectionSubtitle>
        <div className="grid sm:grid-cols-3 gap-8 mt-12 max-w-3xl mx-auto">
          {techStats.map((stat, i) => (
            <div key={i} className="text-center">
              <stat.icon className="h-10 w-10 mx-auto mb-4 text-blue-600" />
              <div className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
              <div className="text-gray-500 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Why Doxxy in This City */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <SectionTitle>Why Doxxy for {cityName} Clinics</SectionTitle>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mt-8 whitespace-pre-line">
            {config.whyDoxxyInThisCity}
          </p>
        </div>
      </Section>

      {/* Regulatory Notes */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <SectionTitle>Regulatory Landscape for {cityName} Clinics</SectionTitle>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mt-8">
            {config.regulatoryNotes}
          </p>
        </div>
      </Section>

      {/* Testimonials */}
      <Section>
        <SectionTitle>Trusted by Clinics in {cityName}</SectionTitle>
        <div className="max-w-4xl mx-auto mt-12 space-y-12">
          {config.testimonials.map((testimonial, i) => (
            <div key={i} className="max-w-3xl mx-auto text-center">
              <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white italic leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="mt-8 flex items-center justify-center">
                <img
                  src={testimonial.photo}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full mr-4"
                />
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-gray-500 dark:text-gray-400">{testimonial.clinic}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQs */}
      <Section className="bg-gray-50 dark:bg-gray-800/50">
        <SectionTitle>Frequently Asked Questions</SectionTitle>
        <SectionSubtitle className="mt-4">
          Common questions from clinic owners in {cityName}.
        </SectionSubtitle>
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

      {/* CTA */}
      <SignupCTA
        heading={`See How Clinics in ${cityName} Are Going Digital with Doxxy`}
        description={`Join ${config.clinicStats.estimatedClinics} clinics across ${cityName} that are upgrading from paper and fragmented tools to a unified digital platform. Chat with us on WhatsApp — we will show you how Doxxy works for your specific specialty and location.`}
      />

      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: APP_URL },
          { name: `Clinic Management Software in ${config.cityName}`, url: `${APP_URL}/cities/${config.slug}` },
        ]}
      />
    </div>
  )
}

export default CityHubTemplate
