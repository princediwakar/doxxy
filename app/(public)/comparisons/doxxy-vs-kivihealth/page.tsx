// Path: app/(public)/comparisons/doxxy-vs-kivihealth/page.tsx
import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import kivihealthConfig from '@/config/comparisons/kivihealth';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Doxxy vs ${kivihealthConfig.competitorName} — Clinic Management Software Comparison`,
    description: kivihealthConfig.heroSubtitle,
    alternates: { canonical: `/comparisons/doxxy-vs-${kivihealthConfig.slug}` },
    openGraph: {
      title: `Doxxy vs ${kivihealthConfig.competitorName} — Clinic Management Software Comparison`,
      description: kivihealthConfig.heroSubtitle,
      type: 'website',
      images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: `Doxxy vs ${kivihealthConfig.competitorName} Comparison` }],
    },
    keywords: [`doxxy vs ${kivihealthConfig.competitorName.toLowerCase()}`, `${kivihealthConfig.competitorName.toLowerCase()} alternative`, 'clinic management software', 'healthcare software comparison'],
  };
}

const DoxxyVsKiviHealth = () => <ComparisonTemplate config={kivihealthConfig} />;

export default DoxxyVsKiviHealth;
