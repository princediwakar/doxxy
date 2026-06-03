import type { Metadata } from 'next';
import AlternativeTemplate from '@/components/comparisons/AlternativeTemplate';
import ekaCareAlternativeConfig from '@/config/comparisons/eka-care-alternative';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${ekaCareAlternativeConfig.competitorName} Alternative — Doxxy Clinic Management Software`,
    description: ekaCareAlternativeConfig.heroSubtitle,
    alternates: { canonical: '/comparisons/eka-care-alternative' },
    openGraph: {
      title: `${ekaCareAlternativeConfig.competitorName} Alternative — Doxxy Clinic Management Software`,
      description: ekaCareAlternativeConfig.heroSubtitle,
      type: 'website',
      images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: `${ekaCareAlternativeConfig.competitorName} Alternative — Doxxy` }],
    },
    keywords: [`${ekaCareAlternativeConfig.competitorName.toLowerCase()} alternative`, `${ekaCareAlternativeConfig.competitorName.toLowerCase()} competitor`, 'clinic management software', 'healthcare software alternative'],
  };
}

const EkaCareAlternative = () => <AlternativeTemplate config={ekaCareAlternativeConfig} />;

export default EkaCareAlternative;
