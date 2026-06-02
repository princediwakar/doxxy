// Path: app/(public)/comparisons/doxxy-vs-excel-tally/page.tsx
import type { Metadata } from 'next';
import ComparisonTemplate from '@/components/comparisons/ComparisonTemplate';
import excelTallyConfig from '@/config/comparisons/excel-tally';

export const metadata: Metadata = {
  title: 'Doxxy vs Excel & Tally — Why Clinics Outgrow Spreadsheets',
  description: 'Excel and Tally are not clinic software. Compare Doxxy vs spreadsheets and accounting tools: automated appointments, EMR, ABDM compliance, and billing accuracy that manual tools cannot match.',
  alternates: { canonical: '/comparisons/doxxy-vs-excel-tally' },
  openGraph: {
    title: 'Doxxy vs Excel & Tally — Why Clinics Outgrow Spreadsheets',
    description: 'Your clinic runs on Excel and Tally. But how much revenue are you losing to manual billing errors, missed appointments with no reminders, and zero ABDM compliance? See the real numbers.',
    type: 'website',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Doxxy vs Excel & Tally Comparison' }],
  },
  keywords: ['doxxy vs excel', 'doxxy vs tally', 'clinic software vs spreadsheets', 'clinic management software india', 'tally alternative for clinics', 'excel alternative for doctors', 'digital clinic records india'],
};

const DoxxyVsExcelTally = () => <ComparisonTemplate config={excelTallyConfig} />;

export default DoxxyVsExcelTally;
