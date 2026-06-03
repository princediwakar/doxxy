// Path: app/(public)/comparisons/doxxy-vs-healthplix/page.tsx
import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import healthplixConfig from '@/config/comparisons/healthplix';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Doxxy vs ${healthplixConfig.competitorName} — Clinic Management Software Comparison`,
    description: healthplixConfig.heroSubtitle,
    alternates: { canonical: `/comparisons/doxxy-vs-${healthplixConfig.slug}` },
    openGraph: {
      title: `Doxxy vs ${healthplixConfig.competitorName} — Clinic Management Software Comparison`,
      description: healthplixConfig.heroSubtitle,
      type: 'website',
      images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: `Doxxy vs ${healthplixConfig.competitorName} Comparison` }],
    },
    keywords: [`doxxy vs ${healthplixConfig.competitorName.toLowerCase()}`, `${healthplixConfig.competitorName.toLowerCase()} alternative`, 'clinic management software', 'healthcare software comparison'],
  };
}

const DoxxyVsHealthPlix = () => <ComparisonTemplate config={healthplixConfig} />;

export default DoxxyVsHealthPlix;
