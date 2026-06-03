// Path: app/(public)/comparisons/doxxy-vs-docpulse/page.tsx
import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import docpulseConfig from '@/config/comparisons/docpulse';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Doxxy vs ${docpulseConfig.competitorName} — Clinic Management Software Comparison`,
    description: docpulseConfig.heroSubtitle,
    alternates: { canonical: `/comparisons/doxxy-vs-${docpulseConfig.slug}` },
    openGraph: {
      title: `Doxxy vs ${docpulseConfig.competitorName} — Clinic Management Software Comparison`,
      description: docpulseConfig.heroSubtitle,
      type: 'website',
      images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: `Doxxy vs ${docpulseConfig.competitorName} Comparison` }],
    },
    keywords: [`doxxy vs ${docpulseConfig.competitorName.toLowerCase()}`, `${docpulseConfig.competitorName.toLowerCase()} alternative`, 'clinic management software', 'healthcare software comparison'],
  };
}

const DoxxyVsDocPulse = () => <ComparisonTemplate config={docpulseConfig} />;

export default DoxxyVsDocPulse;
