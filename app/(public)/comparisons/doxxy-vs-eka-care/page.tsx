import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import ekaCareConfig from '@/config/comparisons/eka-care';

export const metadata: Metadata = {
  title: 'Doxxy vs Eka Care - Comparison of Clinic Management Software',
  description: 'Compare Doxxy vs Eka Care: pricing, features, implementation ease, and user experience. See why Doxxy offers better value for modern healthcare clinics.',
  alternates: { canonical: '/comparisons/doxxy-vs-eka-care' },
  openGraph: {
    title: 'Doxxy vs Eka Care - Clinic Management Software Comparison',
    description: 'Compare Doxxy and Eka Care for clinic management software features, pricing, and ease of use.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy vs Eka Care Comparison' }],
  },
  keywords: ['doxxy vs eka care', 'eka care alternative', 'clinic management software', 'healthcare software comparison', 'eka care vs doxxy'],
};

const DoxxyVsEkaCare = () => <ComparisonTemplate config={ekaCareConfig} />;

export default DoxxyVsEkaCare;