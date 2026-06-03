import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import mfineConfig from '@/config/comparisons/mfine';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Doxxy vs ${mfineConfig.competitorName} — Clinic Management Software Comparison`,
    description: mfineConfig.heroSubtitle,
    alternates: { canonical: `/comparisons/doxxy-vs-${mfineConfig.slug}` },
    openGraph: {
      title: `Doxxy vs ${mfineConfig.competitorName} — Clinic Management Software Comparison`,
      description: mfineConfig.heroSubtitle,
      type: 'website',
      images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: `Doxxy vs ${mfineConfig.competitorName} Comparison` }],
    },
    keywords: [`doxxy vs ${mfineConfig.competitorName.toLowerCase()}`, `${mfineConfig.competitorName.toLowerCase()} alternative`, 'clinic management software', 'healthcare software comparison'],
  };
}

const DoxxyVsMFine = () => <ComparisonTemplate config={mfineConfig} />;

export default DoxxyVsMFine;