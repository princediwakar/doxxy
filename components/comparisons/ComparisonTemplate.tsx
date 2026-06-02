import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, ArrowRight, Shield, Globe } from 'lucide-react';
import Link from 'next/link';
import SignupCTA from '@/components/SignupCTA';
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import type { ComparisonConfig } from '@/config/comparisons/types';

const FeatureCell = ({ value }: { value: boolean | string }) => {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-success mx-auto" />
    ) : (
      <X className="h-5 w-5 text-destructive mx-auto" />
    );
  }
  return <span className="text-muted-foreground">{value}</span>;
};

const ComparisonTemplate = ({ config }: { config: ComparisonConfig }) => {
  const { competitorName } = config;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-950 dark:via-gray-900 dark:to-green-950">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            Comparison
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Doxxy vs
            <span className="text-primary"> {competitorName}</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {config.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth">
                Start Free Practice
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Key Differences */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Key Differences
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {config.keyDifferencesSubtitle}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="py-4 px-6 text-left text-muted-foreground font-medium">Feature</th>
                  <th className="py-4 px-6 text-left text-primary font-medium">Doxxy</th>
                  <th className="py-4 px-6 text-left text-muted-foreground font-medium">{competitorName}</th>
                  <th className="py-4 px-6 text-left text-muted-foreground font-medium">Doxxy Advantage</th>
                </tr>
              </thead>
              <tbody>
                {config.comparisonPoints.map((point, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted'}>
                    <td className="py-4 px-6 border-t flex items-center">
                      <div className="mr-3">{point.icon}</div>
                      <span className="font-medium">{point.feature}</span>
                    </td>
                    <td className="py-4 px-6 border-t text-foreground">
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-success mr-2 flex-shrink-0 mt-0.5" />
                        {point.doxxy}
                      </div>
                    </td>
                    <td className="py-4 px-6 border-t text-muted-foreground">{point.competitor}</td>
                    <td className="py-4 px-6 border-t text-muted-foreground">{point.advantage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Common Pain Points with {competitorName}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              How Doxxy solves the most common challenges faced by {competitorName} users.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {config.painPointItems.map((point, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl">{point.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <X className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      <span className="font-medium">{competitorName}:</span> {point.competitor}
                    </p>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-success mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      <span className="font-medium">Doxxy:</span> {point.doxxy}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Differences (optional) */}
      {config.coreDifferences && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {config.coreDifferences.sectionTitle}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {config.coreDifferences.sectionSubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <Card className="border-blue-200">
                <CardHeader className="border-b border-blue-100 bg-blue-50">
                  <div className="flex items-center mb-2">
                    <Shield className="h-6 w-6 text-primary mr-2" />
                    <CardTitle>{config.coreDifferences.doxxy.title}</CardTitle>
                  </div>
                  <CardDescription>{config.coreDifferences.doxxy.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {config.coreDifferences.doxxy.points.map((point, i) => (
                    <div key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-success mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-muted-foreground">{point}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="border-b border-border bg-muted">
                  <div className="flex items-center mb-2">
                    <Globe className="h-6 w-6 text-muted-foreground mr-2" />
                    <CardTitle>{config.coreDifferences.competitor.title}</CardTitle>
                  </div>
                  <CardDescription>{config.coreDifferences.competitor.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {config.coreDifferences.competitor.points.map((point, i) => (
                    <div key={i} className="flex items-start">
                      <X className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-muted-foreground">{point}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Migration Process */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Seamless Migration from {competitorName}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">{config.migrationSubtitle}</p>
              <ul className="space-y-4">
                {config.migrationSteps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{step.title}</p>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button asChild>
                  <Link href="/contact">Schedule Migration Consultation</Link>
                </Button>
              </div>
            </div>
            <div>
              <Image
                src={config.migrationImageSrc}
                alt="Team working on migration"
                width={800}
                height={600}
                className="rounded-lg shadow-xl"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Doctors Who Switched Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from healthcare professionals who switched from {competitorName} to Doxxy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {config.testimonialItems.map((testimonial, index) => (
              <Card key={index} className="p-8">
                <CardContent className="space-y-4">
                  <blockquote className="text-lg text-muted-foreground italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center">
                    <img
                      src={testimonial.photo}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-muted-foreground">{testimonial.clinic}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Feature Comparison
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how Doxxy and {competitorName} compare across key features.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-background shadow-sm rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-50">
                  <th className="py-4 px-6 text-left text-foreground font-medium">Feature</th>
                  <th className="py-4 px-6 text-center text-primary font-medium">Doxxy</th>
                  <th className="py-4 px-6 text-center text-muted-foreground font-medium">
                    {competitorName}
                  </th>
                </tr>
              </thead>
              <tbody>
                {config.featureComparisonRows.map((row, index) => (
                  <tr key={index} className={index % 2 === 1 ? 'bg-muted/30' : ''}>
                    <td className="py-4 px-6 border-t font-medium">{row.feature}</td>
                    <td className="py-4 px-6 border-t text-center">
                      <FeatureCell value={row.doxxy} />
                    </td>
                    <td className="py-4 px-6 border-t text-center">
                      <FeatureCell value={row.competitor} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <SignupCTA />

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Comparisons", url: `${APP_URL}/comparisons` },
          { name: `Doxxy vs ${config.competitorName}`, url: `${APP_URL}/comparisons/${config.slug}` },
        ]}
      />
    </div>
  );
};

export default ComparisonTemplate;