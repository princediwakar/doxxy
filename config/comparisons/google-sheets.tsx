// Path: config/comparisons/google-sheets.tsx
import React from 'react';
import {
  DollarSign, Calendar, FileText, Search, Shield, TrendingUp, Stethoscope, Smartphone,
} from 'lucide-react';
import type { ComparisonConfig } from './types';
import { sharedMigrationImage } from './types';

const googleSheetsConfig: ComparisonConfig = {
  slug: 'google-sheets',
  competitorName: 'Google Sheets',
  heroSubtitle: 'Google Sheets got you started. Here is exactly when and why your practice has outgrown spreadsheets — and what comes next.',
  keyDifferencesSubtitle: 'Google Sheets is a brilliant tool. It is just not clinic software. Here is what changes when you switch to a platform built for healthcare.',
  migrationSubtitle: 'Your data is already in the cloud. Moving from Google Sheets to Doxxy takes less than a day:',
  comparisonPoints: [
    {
      feature: 'True Cost',
      doxxy: '₹10 per consultation, first 100 free — transparent, predictable',
      competitor: '"Free" but costs 15-20 staff hours/week in manual work — hidden cost of ₹20,000-40,000/month',
      advantage: 'Doxxy pays for itself by eliminating manual data entry labour',
      icon: <DollarSign className="h-6 w-6 text-primary" />,
    },
    {
      feature: 'Patient Scheduling',
      doxxy: 'Smart calendar with automated WhatsApp confirmations and reminders',
      competitor: 'Manual calendar entries, zero patient communication, no-show rate unchanged',
      advantage: 'Every automated reminder prevents a missed appointment and lost revenue',
      icon: <Calendar className="h-6 w-6 text-primary" />,
    },
    {
      feature: 'Data Entry Quality',
      doxxy: 'Structured forms with field validation — clean, consistent data from day one',
      competitor: 'Free-text cells, typos, inconsistent naming — "Dr. Sharma" vs "Dr Sharmaa" vs "Dr. S"',
      advantage: 'Clean data means accurate reports and no embarrassing patient communication errors',
      icon: <FileText className="h-6 w-6 text-primary" />,
    },
    {
      feature: 'Search & Retrieval',
      doxxy: 'Type a name or phone number — instant results across all records',
      competitor: 'Ctrl+F across multiple sheets. Slows to a crawl beyond 1,000 rows. Hope you remember which tab it is on.',
      advantage: 'Find any patient record in under 3 seconds, even with 10,000+ patients',
      icon: <Search className="h-6 w-6 text-primary" />,
    },
    {
      feature: 'Data Protection & Privacy',
      doxxy: 'End-to-end encryption, role-based access control, full audit trail on every record access',
      competitor: 'Basic Google account security — anyone with the link can potentially access patient data',
      advantage: 'Healthcare-grade security that satisfies data protection regulations',
      icon: <Shield className="h-6 w-6 text-primary" />,
    },
    {
      feature: 'Scalability',
      doxxy: 'Handles 10,000+ patients, 200+ daily appointments without performance degradation',
      competitor: 'Google Sheets slows down at 2,000 rows, hits the 10 million cell limit, formulas break at scale',
      advantage: 'Your software grows with your practice instead of becoming a bottleneck',
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
    },
    {
      feature: 'Prescription Writing',
      doxxy: 'Digital prescriptions with templates, drug databases, and interaction checks',
      competitor: 'Cannot write prescriptions. You are still using paper pads or typing into a blank cell.',
      advantage: 'Professional digital prescriptions that patients trust — no more illegible handwriting complaints',
      icon: <Stethoscope className="h-6 w-6 text-primary" />,
    },
    {
      feature: 'Patient Communication',
      doxxy: 'Automated WhatsApp and SMS for reminders, follow-ups, lab reports, and birthday wishes',
      competitor: 'Manual communication only — copy-paste phone numbers, type individual messages',
      advantage: 'Automated communication builds patient loyalty without staff effort',
      icon: <Smartphone className="h-6 w-6 text-primary" />,
    },
  ],
  painPointItems: [
    {
      title: 'The Formula Breaks at 5,000 Rows',
      competitor: "Google Sheets gets unusably slow as your patient list grows. VLOOKUPs take seconds to calculate. Filters lag. Your staff starts dreading opening the file.",
      doxxy: "Doxxy's database handles hundreds of thousands of records with sub-second response times. Your patient list can grow 10x and performance stays identical.",
    },
    {
      title: 'The "Who Changed This?" Problem',
      competitor: "Google Sheets version history shows edits but was not designed for clinical data. No audit trail for who accessed which patient record, no accountability for changes to billing or prescriptions.",
      doxxy: 'Every record access, edit, and deletion is logged with user identity and timestamp. Full audit trail for compliance and accountability.',
    },
    {
      title: 'The Patient Communication Gap',
      competitor: 'Sheets stores phone numbers but cannot act on them. You still manually call or message every patient. Reminders, follow-ups, and lab report notifications all require staff time.',
      doxxy: 'Phone numbers become an automated communication channel. Reminders, follow-ups, and reports are sent automatically based on your configured workflows.',
    },
    {
      title: 'The Compliance Liability',
      competitor: "Storing patient health data in Google Sheets violates India's data protection norms for healthcare. No encryption at rest, no access controls beyond basic sharing permissions, no audit capability.",
      doxxy: 'End-to-end encryption, role-based access, and audit-logged access meet healthcare data protection requirements. Your practice stays legally protected.',
    },
    {
      title: 'The Growth Ceiling',
      competitor: "Google Sheets works beautifully for your first 6-12 months with 15-20 patients a day. At 50+ daily patients, you are spending more time managing the spreadsheet than treating patients.",
      doxxy: 'Doxxy is built for clinics seeing 10 to 500+ patients per day. The platform adapts to your growth — you never need to migrate again.',
    },
  ],
  testimonialItems: [
    {
      quote: "Google Sheets worked for us when we started with 15 patients a day. At 50+ patients, it became a nightmare — slow loading, broken formulas, and no way to track who changed what. Moving to Doxxy was the best decision for our growing practice. Everything is faster, and our staff finally stopped complaining about 'the spreadsheet.'",
      name: 'Dr. Amit Patel',
      clinic: 'Apex Dental Clinic, Ahmedabad',
      photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop',
    },
    {
      quote: "We thought we were smart using Google Sheets because it was free. Then we calculated how many hours our staff spent manually entering and searching data — over 60 hours a month. At our consultation rates, that was ₹45,000/month in wasted time. Doxxy paid for itself in the first 3 days.",
      name: 'Dr. Neha Reddy',
      clinic: 'Bloom Women\'s Clinic, Hyderabad',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
    },
  ],
  featureComparisonRows: [
    { feature: 'Appointment Scheduling', doxxy: true, competitor: false },
    { feature: 'Patient Records (EMR)', doxxy: true, competitor: 'Basic Spreadsheet Rows' },
    { feature: 'WhatsApp Reminders', doxxy: true, competitor: false },
    { feature: 'Automated Billing', doxxy: true, competitor: false },
    { feature: 'Digital Prescriptions', doxxy: true, competitor: false },
    { feature: 'Data Encryption', doxxy: true, competitor: 'Basic Google Account Auth' },
    { feature: 'Audit Trail', doxxy: true, competitor: 'Version History Only' },
    { feature: 'Analytics & Reports', doxxy: true, competitor: 'Built-in Charts & Formulas' },
    { feature: 'Scalability (10,000+ Patients)', doxxy: true, competitor: false },
    { feature: 'ABDM Compliance', doxxy: true, competitor: false },
    { feature: 'Multi-User with Roles', doxxy: true, competitor: 'Share Link Permissions' },
    { feature: 'Mobile App', doxxy: true, competitor: 'Google Sheets App (View Only)' },
  ],
  migrationSteps: [
    {
      title: 'Data Import & Structuring',
      description: "We import your Google Sheets data and organize it into Doxxy's structured patient records. Your existing patient list, appointment history, and billing data come with you.",
    },
    {
      title: 'Template Configuration',
      description: "We set up your prescription templates, invoice formats, appointment types, and reminder messages to match your clinic's workflow — no generic defaults.",
    },
    {
      title: 'Staff Onboarding',
      description: "Quick, focused training sessions. Your team already understands digital tools — they just need to learn where everything lives in Doxxy. Most staff are comfortable within hours.",
    },
    {
      title: 'Parallel Operation & Handover',
      description: "Run Google Sheets and Doxxy side by side for your first week while your team builds confidence. Then archive the spreadsheet — you will not need it anymore.",
    },
  ],
  migrationImageSrc: sharedMigrationImage,
  coreDifferences: {
    sectionTitle: 'Core Philosophical Differences',
    sectionSubtitle: 'Google Sheets is a starting point, not a destination. Here is the fundamental difference between a spreadsheet and clinic software.',
    doxxy: {
      title: "Doxxy's Approach",
      subtitle: 'Clinic Software That Scales With You',
      points: [
        'Purpose-built for Indian clinics — appointments, EMR, billing, prescriptions, and compliance in one platform',
        'Starts free (first 100 consultations), then ₹10/consultation — transparent pricing that matches your practice volume',
        'Structured data entry eliminates errors, enables powerful search, and generates actionable analytics',
        'Every feature you will ever need is already built — you never need to "figure out a formula" for a clinic workflow',
      ],
    },
    competitor: {
      title: "Google Sheets' Approach",
      subtitle: 'A Starting Point, Not a Destination',
      points: [
        'A general-purpose spreadsheet tool — powerful for what it does, but completely agnostic to healthcare workflows',
        '"Free" hides massive hidden costs in staff time, billing errors, missed appointments, and compliance risk',
        'Unstructured data becomes a liability at scale — inconsistent entries, no validation, no relational integrity',
        'Fine for your first 6 months and 15 patients/day. Becomes the single biggest bottleneck to practice growth beyond that.',
      ],
    },
  },
};

export default googleSheetsConfig;
