import type { Metadata } from 'next';
import AlternativeTemplate from '@/components/comparisons/AlternativeTemplate';
import ekaCareAlternativeConfig from '@/config/comparisons/eka-care-alternative';

export const metadata: Metadata = {
  title: 'Eka Care Alternative - Doxxy Clinic Management Software',
  description: 'Looking for an Eka Care alternative? Doxxy offers pay-per-appointment pricing, unlimited doctors, and comprehensive clinic management features.',
  alternates: { canonical: '/comparisons/eka-care-alternative' },
  openGraph: {
    title: 'Eka Care Alternative - Doxxy Clinic Management Software',
    description: 'Doxxy is a modern alternative to Eka Care with transparent pricing and unlimited doctors for healthcare clinics.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Eka Care Alternative - Doxxy' }],
  },
  keywords: ['eka care alternative', 'eka care competitor', 'clinic management software', 'pay per appointment pricing', 'healthcare software alternative'],
};

const EkaCareAlternative = () => <AlternativeTemplate config={ekaCareAlternativeConfig} />;

export default EkaCareAlternative;
