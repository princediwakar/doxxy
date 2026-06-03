// Path: app/(public)/comparisons/doxxy-vs-google-sheets/page.tsx
import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import googleSheetsConfig from '@/config/comparisons/google-sheets';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Doxxy vs ${googleSheetsConfig.competitorName} — Clinic Management Software Comparison`,
    description: googleSheetsConfig.heroSubtitle,
    alternates: { canonical: `/comparisons/doxxy-vs-${googleSheetsConfig.slug}` },
    openGraph: {
      title: `Doxxy vs ${googleSheetsConfig.competitorName} — Clinic Management Software Comparison`,
      description: googleSheetsConfig.heroSubtitle,
      type: 'website',
      images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: `Doxxy vs ${googleSheetsConfig.competitorName} Comparison` }],
    },
    keywords: [`doxxy vs ${googleSheetsConfig.competitorName.toLowerCase()}`, `${googleSheetsConfig.competitorName.toLowerCase()} alternative`, 'clinic management software', 'healthcare software comparison'],
  };
}

const DoxxyVsGoogleSheets = () => <ComparisonTemplate config={googleSheetsConfig} />;

export default DoxxyVsGoogleSheets;
