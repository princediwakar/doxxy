import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import clinicplusConfig from '@/config/comparisons/clinicplus';

export const metadata: Metadata = {
  title: 'Doxxy vs ClinicPlus - Modern Cloud vs Traditional Clinic Software',
  description: 'Compare Doxxy\'s cloud-based clinic management software with ClinicPlus\'s traditional model. See benefits of pay-per-consultation pricing and modern features.',
  alternates: { canonical: '/comparisons/doxxy-vs-clinicplus' },
  openGraph: {
    title: 'Doxxy vs ClinicPlus - Clinic Software Comparison',
    description: 'Compare Doxxy and ClinicPlus: cloud-based vs traditional clinic management software for healthcare practices.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy vs ClinicPlus Comparison' }],
  },
  keywords: ['doxxy vs clinicplus', 'clinicplus alternative', 'cloud clinic software', 'traditional clinic software', 'healthcare software comparison'],
};

const DoxxyVsClinicPlus = () => <ComparisonTemplate config={clinicplusConfig} />;

export default DoxxyVsClinicPlus;