import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import mfineConfig from '@/config/comparisons/mfine';

export const metadata: Metadata = {
  title: 'Doxxy vs MFine - Hybrid Clinic Management vs Telemedicine Platform',
  description: 'Compare Doxxy\'s hybrid clinic management software with MFine\'s telemedicine focus. See benefits of managing both in-clinic and virtual consultations.',
  alternates: { canonical: '/comparisons/doxxy-vs-mfine' },
  openGraph: {
    title: 'Doxxy vs MFine - Clinic Management vs Telemedicine Platform',
    description: 'Compare Doxxy and MFine: hybrid clinic management vs telemedicine-centric platforms for healthcare practices.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy vs MFine Comparison' }],
  },
  keywords: ['doxxy vs mfine', 'mfine alternative', 'hybrid clinic software', 'telemedicine platform', 'healthcare software comparison'],
};

const DoxxyVsMFine = () => <ComparisonTemplate config={mfineConfig} />;

export default DoxxyVsMFine;