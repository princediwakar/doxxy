// Path: app/(public)/comparisons/doxxy-vs-bajaj-finserv-health/page.tsx
import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import bajajFinservHealthConfig from '@/config/comparisons/bajaj-finserv-health';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Doxxy vs ${bajajFinservHealthConfig.competitorName} — Clinic Management Software Comparison`,
    description: bajajFinservHealthConfig.heroSubtitle,
    alternates: { canonical: `/comparisons/doxxy-vs-${bajajFinservHealthConfig.slug}` },
    openGraph: {
      title: `Doxxy vs ${bajajFinservHealthConfig.competitorName} — Clinic Management Software Comparison`,
      description: bajajFinservHealthConfig.heroSubtitle,
      type: 'website',
      images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: `Doxxy vs ${bajajFinservHealthConfig.competitorName} Comparison` }],
    },
    keywords: [`doxxy vs ${bajajFinservHealthConfig.competitorName.toLowerCase()}`, `${bajajFinservHealthConfig.competitorName.toLowerCase()} alternative`, 'clinic management software', 'healthcare software comparison'],
  };
}

const DoxxyVsBajajFinservHealth = () => <ComparisonTemplate config={bajajFinservHealthConfig} />;

export default DoxxyVsBajajFinservHealth;
