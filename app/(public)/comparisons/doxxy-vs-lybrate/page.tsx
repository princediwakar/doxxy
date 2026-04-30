import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import lybrateConfig from '@/config/comparisons/lybrate';

export const metadata: Metadata = {
  title: 'Doxxy vs Lybrate - Clinic Management vs Online Consultation Platforms',
  description: 'Compare Doxxy\'s comprehensive clinic management software with Lybrate\'s online consultation focus. See why clinics need full practice management tools.',
  alternates: { canonical: '/comparisons/doxxy-vs-lybrate' },
  openGraph: {
    title: 'Doxxy vs Lybrate - Clinic Software vs Consultation Platform',
    description: 'Compare Doxxy and Lybrate: full clinic management vs online consultation platforms for healthcare practices.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy vs Lybrate Comparison' }],
  },
  keywords: ['doxxy vs lybrate', 'lybrate alternative', 'clinic management software', 'online consultation platform', 'healthcare software comparison'],
};

const DoxxyVsLybrate = () => <ComparisonTemplate config={lybrateConfig} />;

export default DoxxyVsLybrate;