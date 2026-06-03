// Path: app/(public)/comparisons/doxxy-vs-medibuddy/page.tsx
import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import medibuddyConfig from '@/config/comparisons/medibuddy';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Doxxy vs ${medibuddyConfig.competitorName} — Clinic Management Software Comparison`,
    description: medibuddyConfig.heroSubtitle,
    alternates: { canonical: `/comparisons/doxxy-vs-${medibuddyConfig.slug}` },
    openGraph: {
      title: `Doxxy vs ${medibuddyConfig.competitorName} — Clinic Management Software Comparison`,
      description: medibuddyConfig.heroSubtitle,
      type: 'website',
      images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: `Doxxy vs ${medibuddyConfig.competitorName} Comparison` }],
    },
    keywords: [`doxxy vs ${medibuddyConfig.competitorName.toLowerCase()}`, `${medibuddyConfig.competitorName.toLowerCase()} alternative`, 'clinic management software', 'healthcare software comparison'],
  };
}

const DoxxyVsMediBuddy = () => <ComparisonTemplate config={medibuddyConfig} />;

export default DoxxyVsMediBuddy;
