// Path: app/(public)/comparisons/doxxy-vs-google-sheets/page.tsx
import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import googleSheetsConfig from '@/config/comparisons/google-sheets';

export const metadata: Metadata = {
  title: 'Doxxy vs Google Sheets — From Spreadsheets to Clinic Software',
  description: 'Google Sheets got your clinic started. Now see why growing practices upgrade to Doxxy for appointments, EMR, prescriptions, compliance, and automated patient communication.',
  alternates: { canonical: '/comparisons/doxxy-vs-google-sheets' },
  openGraph: {
    title: 'Doxxy vs Google Sheets — From Spreadsheets to Clinic Software',
    description: 'Google Sheets is free — but is it really? Calculate the hidden costs of manual data entry, broken formulas at scale, and zero patient communication. Then see what Doxxy does differently.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy vs Google Sheets Comparison' }],
  },
  keywords: ['doxxy vs google sheets', 'clinic software vs spreadsheets', 'google sheets alternative for doctors', 'clinic management software india', 'upgrade from spreadsheets', 'digital clinic records', 'cloud clinic software india'],
};

const DoxxyVsGoogleSheets = () => <ComparisonTemplate config={googleSheetsConfig} />;

export default DoxxyVsGoogleSheets;
