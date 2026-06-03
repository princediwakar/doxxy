import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import practoConfig from '@/config/comparisons/practo';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Doxxy vs ${practoConfig.competitorName} — Clinic Management Software Comparison`,
    description: practoConfig.heroSubtitle,
    alternates: { canonical: `/comparisons/doxxy-vs-${practoConfig.slug}` },
    openGraph: {
      title: `Doxxy vs ${practoConfig.competitorName} — Clinic Management Software Comparison`,
      description: practoConfig.heroSubtitle,
      type: 'website',
      images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: `Doxxy vs ${practoConfig.competitorName} Comparison` }],
    },
    keywords: [`doxxy vs ${practoConfig.competitorName.toLowerCase()}`, `${practoConfig.competitorName.toLowerCase()} alternative`, 'clinic management software', 'healthcare software comparison'],
  };
}

const DoxxyVsPracto = () => <ComparisonTemplate config={practoConfig} />;

export default DoxxyVsPracto;