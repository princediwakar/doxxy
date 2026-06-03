import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import lybrateConfig from '@/config/comparisons/lybrate';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Doxxy vs ${lybrateConfig.competitorName} — Clinic Management Software Comparison`,
    description: lybrateConfig.heroSubtitle,
    alternates: { canonical: `/comparisons/doxxy-vs-${lybrateConfig.slug}` },
    openGraph: {
      title: `Doxxy vs ${lybrateConfig.competitorName} — Clinic Management Software Comparison`,
      description: lybrateConfig.heroSubtitle,
      type: 'website',
      images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: `Doxxy vs ${lybrateConfig.competitorName} Comparison` }],
    },
    keywords: [`doxxy vs ${lybrateConfig.competitorName.toLowerCase()}`, `${lybrateConfig.competitorName.toLowerCase()} alternative`, 'clinic management software', 'healthcare software comparison'],
  };
}

const DoxxyVsLybrate = () => <ComparisonTemplate config={lybrateConfig} />;

export default DoxxyVsLybrate;