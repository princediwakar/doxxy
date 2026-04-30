import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import practoConfig from '@/config/comparisons/practo';

export const metadata: Metadata = {
  title: 'Doxxy vs Practo - Comparison of Clinic Management Software',
  description: 'Compare Doxxy vs Practo: pricing, features, implementation ease, and user experience. See why Doxxy offers better value for modern healthcare clinics.',
  alternates: { canonical: '/comparisons/doxxy-vs-practo' },
  openGraph: {
    title: 'Doxxy vs Practo - Clinic Management Software Comparison',
    description: 'Compare Doxxy and Practo for clinic management software features, pricing, and ease of use.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy vs Practo Comparison' }],
  },
  keywords: ['doxxy vs practo', 'practo alternative', 'clinic management software', 'healthcare software comparison', 'practo vs doxxy'],
};

const DoxxyVsPracto = () => <ComparisonTemplate config={practoConfig} />;

export default DoxxyVsPracto;