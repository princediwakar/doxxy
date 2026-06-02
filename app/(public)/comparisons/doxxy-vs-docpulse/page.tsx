// Path: app/(public)/comparisons/doxxy-vs-docpulse/page.tsx
import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import docpulseConfig from '@/config/comparisons/docpulse';

export const metadata: Metadata = {
  title: 'Doxxy vs DocPulse - Full Clinic Suite vs Basic EMR Software',
  description: 'Compare Doxxy vs DocPulse: comprehensive clinic management with ABDM compliance and unlimited users vs basic EMR with tiered pricing. See which fits your clinic.',
  alternates: { canonical: '/comparisons/doxxy-vs-docpulse' },
  openGraph: {
    title: 'Doxxy vs DocPulse - Clinic Management Software Comparison',
    description: 'Compare Doxxy and DocPulse for clinic management software features, pricing transparency, ABDM compliance, and multi-clinic support.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy vs DocPulse Comparison' }],
  },
  keywords: ['doxxy vs docpulse', 'docpulse alternative', 'clinic management software comparison', 'healthcare software India', 'abdm compliant clinic software'],
};

const DoxxyVsDocPulse = () => <ComparisonTemplate config={docpulseConfig} />;

export default DoxxyVsDocPulse;
