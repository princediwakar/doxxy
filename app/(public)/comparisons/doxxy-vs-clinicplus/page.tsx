import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import clinicplusConfig from '@/config/comparisons/clinicplus';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Doxxy vs ${clinicplusConfig.competitorName} — Clinic Management Software Comparison`,
    description: clinicplusConfig.heroSubtitle,
    alternates: { canonical: `/comparisons/doxxy-vs-${clinicplusConfig.slug}` },
    openGraph: {
      title: `Doxxy vs ${clinicplusConfig.competitorName} — Clinic Management Software Comparison`,
      description: clinicplusConfig.heroSubtitle,
      type: 'website',
      images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: `Doxxy vs ${clinicplusConfig.competitorName} Comparison` }],
    },
    keywords: [`doxxy vs ${clinicplusConfig.competitorName.toLowerCase()}`, `${clinicplusConfig.competitorName.toLowerCase()} alternative`, 'clinic management software', 'healthcare software comparison'],
  };
}

const DoxxyVsClinicPlus = () => <ComparisonTemplate config={clinicplusConfig} />;

export default DoxxyVsClinicPlus;