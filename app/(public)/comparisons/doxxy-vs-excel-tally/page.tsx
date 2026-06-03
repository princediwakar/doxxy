// Path: app/(public)/comparisons/doxxy-vs-excel-tally/page.tsx
import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import excelTallyConfig from '@/config/comparisons/excel-tally';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Doxxy vs ${excelTallyConfig.competitorName} — Clinic Management Software Comparison`,
    description: excelTallyConfig.heroSubtitle,
    alternates: { canonical: `/comparisons/doxxy-vs-${excelTallyConfig.slug}` },
    openGraph: {
      title: `Doxxy vs ${excelTallyConfig.competitorName} — Clinic Management Software Comparison`,
      description: excelTallyConfig.heroSubtitle,
      type: 'website',
      images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: `Doxxy vs ${excelTallyConfig.competitorName} Comparison` }],
    },
    keywords: [`doxxy vs ${excelTallyConfig.competitorName.toLowerCase()}`, `${excelTallyConfig.competitorName.toLowerCase()} alternative`, 'clinic management software', 'healthcare software comparison'],
  };
}

const DoxxyVsExcelTally = () => <ComparisonTemplate config={excelTallyConfig} />;

export default DoxxyVsExcelTally;
