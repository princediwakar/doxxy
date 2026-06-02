import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import SignupCTA from '@/components/SignupCTA';
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import type { AlternativeConfig } from '@/config/comparisons/types';

const FeatureCell = ({ value }: { value: boolean | string }) => {
  if (typeof value === 'boolean') {
    return value ? <Check className="h-5 w-5 text-success mx-auto" /> : <X className="h-5 w-5 text-destructive mx-auto" />;
  }
  return <span className="text-muted-foreground">{value}</span>;
};

const AlternativeTemplate = ({ config }: { config: AlternativeConfig }) => {
  const { competitorName } = config;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-950 dark:via-gray-900 dark:to-green-950">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 px-4 py-2">Better Alternative</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Looking for an<span className="text-primary"> {competitorName} Alternative?</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">{config.heroSubtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="https://wa.me/+917388890554">Try Doxxy Free<ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact">Schedule Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Doxxy Over {competitorName}?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Doxxy offers a more flexible, cost-effective alternative to {competitorName} with these key advantages:</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {config.whyChooseItems.map((item, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto mb-4">{item.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Doxxy vs {competitorName}: Feature Comparison</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">See how Doxxy stacks up against {competitorName} across key features.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-background shadow-sm rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-50">
                  <th className="py-4 px-6 text-left text-foreground font-medium">Feature</th>
                  <th className="py-4 px-6 text-center text-primary font-medium">Doxxy</th>
                  <th className="py-4 px-6 text-center text-muted-foreground font-medium">{competitorName}</th>
                </tr>
              </thead>
              <tbody>
                {config.featureComparisonRows.map((row, i) => (
                  <tr key={i} className={i % 2 === 1 ? 'bg-muted/30' : ''}>
                    <td className="py-4 px-6 border-t font-medium">{row.feature}</td>
                    <td className="py-4 px-6 border-t text-center"><FeatureCell value={row.doxxy} /></td>
                    <td className="py-4 px-6 border-t text-center"><FeatureCell value={row.competitor} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Reasons to Switch */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{config.reasonsToSwitch.length} Reasons to Switch from {competitorName}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Healthcare practices across India are making the switch to Doxxy. Here&apos;s why:</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {config.reasonsToSwitch.map((reason, i) => (
              <div key={i} className="flex items-start">
                <div className="mr-4 mt-1">{reason.icon}</div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{reason.title}</h3>
                  <p className="text-muted-foreground">{reason.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Migration Process */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Simple Migration Process</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{config.migrationSubtitle}</p>
          </div>
          <div className="space-y-12">
            {config.migrationSteps.map((step, i) => (
              <div key={i} className="flex flex-col md:flex-row items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full text-white font-bold ${i % 2 === 0 ? 'bg-primary' : 'bg-success'} mb-4 md:mb-0`}>
                  {i + 1}
                </div>
                <div className="md:ml-8 text-center md:text-left">
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Button size="lg" asChild>
              <Link href="/contact">Schedule Your Migration Consultation</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Hear from Doctors Who Switched</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Healthcare professionals who made the switch from {competitorName} to Doxxy share their experiences:</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {config.testimonialItems.map((t, i) => (
              <Card key={i} className="bg-blue-50 border-none">
                <CardContent className="p-8 space-y-4">
                  <blockquote className="text-lg text-muted-foreground italic">&ldquo;{t.quote}&rdquo;</blockquote>
                  <div className="flex items-center">
                    <img src={t.photo} alt={t.name} className="w-12 h-12 rounded-full mr-4" width="48" height="48" />
                    <div>
                      <p className="font-semibold text-foreground">{t.name}</p>
                      <p className="text-muted-foreground">{t.clinic}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">Common questions about switching from {competitorName} to Doxxy.</p>
          </div>
          <div className="space-y-6">
            {config.faqs.map((faq, i) => (
              <Card key={i} className="p-6">
                <h3 className="font-semibold text-foreground mb-3">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <SignupCTA
        heading="Looking for an Alternative? See Doxxy."
        description="We'll show you how Doxxy compares on the features that matter to your clinic. Chat with us on WhatsApp — honest answers, no spin."
      />

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Comparisons", url: `${APP_URL}/comparisons` },
          { name: `${config.competitorName} Alternative`, url: `${APP_URL}/comparisons/${config.slug}` },
        ]}
      />
    </div>
  );
};

export default AlternativeTemplate;
