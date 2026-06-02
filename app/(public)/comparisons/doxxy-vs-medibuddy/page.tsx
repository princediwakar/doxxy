// Path: app/(public)/comparisons/doxxy-vs-medibuddy/page.tsx
import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import medibuddyConfig from '@/config/comparisons/medibuddy';

export const metadata: Metadata = {
  title: 'Doxxy vs MediBuddy - Dedicated Clinic Software vs Marketplace Platform',
  description: 'Compare Doxxy vs MediBuddy: 100% clinic-focused software with full data ownership vs a patient marketplace with clinic software as an add-on. See the difference.',
  alternates: { canonical: '/comparisons/doxxy-vs-medibuddy' },
  openGraph: {
    title: 'Doxxy vs MediBuddy - Clinic Management Software Comparison',
    description: 'Compare Doxxy and MediBuddy for clinic management: dedicated clinic software vs marketplace-plus-software platform for healthcare practices.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy vs MediBuddy Comparison' }],
  },
  keywords: ['doxxy vs medibuddy', 'medibuddy alternative', 'clinic management software comparison', 'healthcare software India', 'clinic software no marketplace'],
};

const DoxxyVsMediBuddy = () => <ComparisonTemplate config={medibuddyConfig} />;

export default DoxxyVsMediBuddy;
