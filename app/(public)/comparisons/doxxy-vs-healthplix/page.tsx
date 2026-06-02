// Path: app/(public)/comparisons/doxxy-vs-healthplix/page.tsx
import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import healthplixConfig from '@/config/comparisons/healthplix';

export const metadata: Metadata = {
  title: 'Doxxy vs HealthPlix - Full Clinic Management vs Doctor-Centric EMR',
  description: 'Compare Doxxy vs HealthPlix: complete clinic suite with front desk, pharmacy, and multi-user workflows vs doctor-focused EMR with AI assistance. See the difference.',
  alternates: { canonical: '/comparisons/doxxy-vs-healthplix' },
  openGraph: {
    title: 'Doxxy vs HealthPlix - Clinic Management Software Comparison',
    description: 'Compare Doxxy and HealthPlix for clinic management: full clinic operations vs doctor-centric EMR software for healthcare practices.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy vs HealthPlix Comparison' }],
  },
  keywords: ['doxxy vs healthplix', 'healthplix alternative', 'clinic management software comparison', 'healthcare software India', 'full clinic management suite'],
};

const DoxxyVsHealthPlix = () => <ComparisonTemplate config={healthplixConfig} />;

export default DoxxyVsHealthPlix;
