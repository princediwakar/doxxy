// Path: app/(public)/comparisons/doxxy-vs-kivihealth/page.tsx
import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import kivihealthConfig from '@/config/comparisons/kivihealth';

export const metadata: Metadata = {
  title: 'Doxxy vs KiviHealth - Mature Clinic Management vs New Telemedicine Platform',
  description: 'Compare Doxxy vs KiviHealth: mature clinic management with WhatsApp integration, offline support, and unlimited doctors vs a newer telemedicine-focused platform.',
  alternates: { canonical: '/comparisons/doxxy-vs-kivihealth' },
  openGraph: {
    title: 'Doxxy vs KiviHealth - Clinic Management Software Comparison',
    description: 'Compare Doxxy and KiviHealth for clinic management software features, pricing, offline support, and WhatsApp integration.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy vs KiviHealth Comparison' }],
  },
  keywords: ['doxxy vs kivihealth', 'kivihealth alternative', 'clinic management software comparison', 'healthcare software India', 'whatsapp clinic software'],
};

const DoxxyVsKiviHealth = () => <ComparisonTemplate config={kivihealthConfig} />;

export default DoxxyVsKiviHealth;
