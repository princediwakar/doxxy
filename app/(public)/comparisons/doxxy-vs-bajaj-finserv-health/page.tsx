// Path: app/(public)/comparisons/doxxy-vs-bajaj-finserv-health/page.tsx
import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import bajajFinservHealthConfig from '@/config/comparisons/bajaj-finserv-health';

export const metadata: Metadata = {
  title: 'Doxxy vs Bajaj Finserv Health - Purpose-Built Clinic Software vs Fintech Platform',
  description: 'Compare Doxxy vs Bajaj Finserv Health: dedicated clinic management software vs a fintech-healthcare hybrid. See why purpose-built software wins for daily clinic operations.',
  alternates: { canonical: '/comparisons/doxxy-vs-bajaj-finserv-health' },
  openGraph: {
    title: 'Doxxy vs Bajaj Finserv Health - Clinic Management Software Comparison',
    description: 'Compare Doxxy and Bajaj Finserv Health: purpose-built clinic software vs fintech-healthcare hybrid platform for Indian clinics.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy vs Bajaj Finserv Health Comparison' }],
  },
  keywords: ['doxxy vs bajaj finserv health', 'bajaj finserv health alternative', 'clinic management software comparison', 'healthcare software India', 'purpose built clinic software'],
};

const DoxxyVsBajajFinservHealth = () => <ComparisonTemplate config={bajajFinservHealthConfig} />;

export default DoxxyVsBajajFinservHealth;
