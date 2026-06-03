import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import ekaCareConfig from '@/config/comparisons/eka-care';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Doxxy vs ${ekaCareConfig.competitorName} — Clinic Management Software Comparison`,
    description: ekaCareConfig.heroSubtitle,
    alternates: { canonical: `/comparisons/doxxy-vs-${ekaCareConfig.slug}` },
    openGraph: {
      title: `Doxxy vs ${ekaCareConfig.competitorName} — Clinic Management Software Comparison`,
      description: ekaCareConfig.heroSubtitle,
      type: 'website',
      images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: `Doxxy vs ${ekaCareConfig.competitorName} Comparison` }],
    },
    keywords: [`doxxy vs ${ekaCareConfig.competitorName.toLowerCase()}`, `${ekaCareConfig.competitorName.toLowerCase()} alternative`, 'clinic management software', 'healthcare software comparison'],
  };
}

const DoxxyVsEkaCare = () => <ComparisonTemplate config={ekaCareConfig} />;

export default DoxxyVsEkaCare;