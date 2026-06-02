// Path: config/comparisons/excel-tally.tsx
import React from 'react';
import {
  Calendar, FileText, Shield, Calculator, Clock, Database, Users, BarChart3,
} from 'lucide-react';
import type { ComparisonConfig } from './types';
import { sharedMigrationImage } from './types';

const excelTallyConfig: ComparisonConfig = {
  slug: 'excel-tally',
  competitorName: 'Excel & Tally',
  heroSubtitle: 'Spreadsheets and accounting software are not clinic software. See what your practice is leaving on the table every single day.',
  keyDifferencesSubtitle: 'Doxxy is built for clinics. Excel and Tally are general-purpose tools retrofitted for healthcare — and it shows.',
  migrationSubtitle: 'Going digital does not mean starting from scratch. We convert your existing spreadsheets into structured clinic records:',
  comparisonPoints: [
    {
      feature: 'Appointment Scheduling',
      doxxy: 'Automated booking with WhatsApp reminders, no-shows drop by 40%+',
      competitor: 'Manual entry in Excel, zero patient communication',
      advantage: 'Automated reminders recover missed revenue from no-shows',
      icon: <Calendar className="h-6 w-6 text-primary" />,
    },
    {
      feature: 'Patient Records',
      doxxy: 'Structured EMR with instant search across all patient history',
      competitor: 'Excel rows with no structure, no search, no medical history view',
      advantage: 'Find any patient record in under 3 seconds',
      icon: <FileText className="h-6 w-6 text-primary" />,
    },
    {
      feature: 'ABDM Compliance',
      doxxy: 'Built-in Ayushman Bharat Digital Mission compliance',
      competitor: 'Impossible — Excel and Tally are not healthcare software',
      advantage: 'Avoid regulatory penalties and stay compliant from day one',
      icon: <Shield className="h-6 w-6 text-primary" />,
    },
    {
      feature: 'Billing Accuracy',
      doxxy: 'Automated invoice generation, zero manual calculation errors',
      competitor: 'Manual Tally entries — 5-8% revenue leakage from missed charges',
      advantage: 'Recover ₹2,000-₹5,000/day in missed billings',
      icon: <Calculator className="h-6 w-6 text-primary" />,
    },
    {
      feature: 'Staff Productivity',
      doxxy: 'Receptionist focuses on patients, not data entry — saves 15+ hours/week',
      competitor: 'Staff buried in Excel updates, Tally entries, and manual reconciliation',
      advantage: 'Redeploy 15+ hours/week from data entry to patient care',
      icon: <Clock className="h-6 w-6 text-primary" />,
    },
    {
      feature: 'Data Security',
      doxxy: 'Encrypted cloud storage, role-based access, automated daily backups',
      competitor: 'Local Excel file on a single computer — crash, virus, or theft = everything gone',
      advantage: 'Enterprise-grade security with zero data loss risk',
      icon: <Database className="h-6 w-6 text-primary" />,
    },
    {
      feature: 'Multi-User Access',
      doxxy: 'Role-based access — receptionist, doctor, and accountant each see what they need',
      competitor: 'Single Excel file, version conflicts, "who has the latest copy?" chaos',
      advantage: 'Entire team works simultaneously without conflicts',
      icon: <Users className="h-6 w-6 text-primary" />,
    },
    {
      feature: 'Analytics & Insights',
      doxxy: 'Real-time dashboard — revenue trends, patient demographics, peak hours',
      competitor: 'Hours of manual pivot tables, stale data, decisions based on gut feel',
      advantage: 'Data-driven practice growth instead of guesswork',
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
    },
  ],
  painPointItems: [
    {
      title: 'The Receptionist Bottleneck',
      competitor: "Your receptionist spends 3-4 hours every day manually entering appointment details into Excel, updating patient info, and reconciling Tally entries — time that should be spent with patients.",
      doxxy: 'Doxxy automates scheduling, record-keeping, and billing. Your receptionist becomes a patient-care coordinator, not a data-entry operator.',
    },
    {
      title: 'The Missing Reminder Problem',
      competitor: "Excel cannot send WhatsApp reminders, SMS, or any patient communication. No-shows remain at 20-30% because patients simply forget their appointments.",
      doxxy: 'Automated WhatsApp reminders cut no-shows by 40% or more. Every missed appointment you prevent is pure revenue recovery.',
    },
    {
      title: 'The Data Loss Nightmare',
      competitor: "Your entire clinic's patient history lives in a single Excel file on one computer. A hard drive crash, ransomware attack, or even accidental deletion wipes out years of records with no backup.",
      doxxy: 'All data is encrypted, backed up across multiple servers, and accessible from any device. You can spill coffee on your laptop and lose nothing.',
    },
    {
      title: 'The Billing Error Black Hole',
      competitor: 'Manual Tally entries lead to missed line items, wrong amounts, and unbilled services. The average clinic leaks ₹2,500/day — over ₹75,000/month — from avoidable billing errors.',
      doxxy: 'Automated billing ensures every consultation, procedure, and medicine is captured. Built-in validation catches errors before the invoice reaches the patient.',
    },
    {
      title: 'The Compliance Gap',
      competitor: "Excel and Tally are not healthcare software. They cannot generate ABDM-compliant digital health records, maintain audit trails, or meet data protection requirements for patient information.",
      doxxy: 'ABDM compliance is built into the platform. Digital prescriptions, audit-logged access, and encrypted patient records keep your practice legally protected.',
    },
    {
      title: 'The Growth Ceiling',
      competitor: "Excel works for 15-20 patients a day. At 40+, the file slows down, formulas break, and your staff spends more time fighting the tool than serving patients.",
      doxxy: 'Doxxy scales from 10 to 500+ patients a day without breaking stride. The platform grows with your practice, not against it.',
    },
  ],
  testimonialItems: [
    {
      quote: "I used Excel for 3 years to manage patient records. I had no idea how much revenue I was losing to billing errors until Doxxy showed me the gap. In the first month alone, our collections improved by ₹12,000 just from accurate billing. The WhatsApp reminders alone recovered 8 missed appointments in the first week.",
      name: 'Dr. Rajesh Kumar',
      clinic: 'Shri Ram Clinic, Jaipur',
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop',
    },
    {
      quote: "Tally is great for accounting but it can't send WhatsApp reminders or manage appointments. My receptionist spent 4 hours every day updating Excel sheets. With Doxxy, she now spends that time with patients. The clinic feels completely different — more professional, more organized.",
      name: 'Dr. Priya Sharma',
      clinic: 'Sai Health Centre, Pune',
      photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop',
    },
  ],
  featureComparisonRows: [
    { feature: 'Appointment Scheduling', doxxy: true, competitor: false },
    { feature: 'Patient Records (EMR)', doxxy: true, competitor: false },
    { feature: 'WhatsApp Reminders', doxxy: true, competitor: false },
    { feature: 'Automated Billing', doxxy: true, competitor: 'Manual Tally Entries' },
    { feature: 'ABDM Compliance', doxxy: true, competitor: false },
    { feature: 'Analytics Dashboard', doxxy: true, competitor: 'Manual Pivot Tables' },
    { feature: 'Multi-User with Roles', doxxy: true, competitor: 'Single File Conflicts' },
    { feature: 'Automated Backups', doxxy: true, competitor: false },
    { feature: 'Instant Search', doxxy: true, competitor: 'Ctrl+F Only' },
    { feature: 'Prescription Writing', doxxy: true, competitor: false },
    { feature: 'Inventory Management', doxxy: true, competitor: 'Stock Ledger Only' },
    { feature: 'Staff Management', doxxy: true, competitor: false },
  ],
  migrationSteps: [
    {
      title: 'Patient Data Digitization',
      description: "We'll help you convert your existing Excel patient lists and Tally billing records into structured digital profiles in Doxxy. No data entry on your end.",
    },
    {
      title: 'Template Setup',
      description: "We configure your prescription templates, invoice formats, and appointment types to match exactly how your clinic already works — just automated.",
    },
    {
      title: 'Staff Training',
      description: "Hands-on training for your entire team. Most clinics are fully operational within 48 hours. Your receptionist will wonder why you didn't switch sooner.",
    },
    {
      title: 'Go-Live Support',
      description: "Dedicated support during your first week of going fully digital. We're on call to handle any questions as your team settles into the new workflow.",
    },
  ],
  migrationImageSrc: sharedMigrationImage,
  coreDifferences: {
    sectionTitle: 'Core Philosophical Differences',
    sectionSubtitle: 'Understanding why general-purpose tools fail clinics — and what purpose-built software does differently.',
    doxxy: {
      title: "Doxxy's Approach",
      subtitle: 'Purpose-Built Clinic Platform',
      points: [
        'Designed from the ground up for Indian clinics — every feature solves a real clinic workflow problem',
        'Automated workflows eliminate manual data entry, reduce errors, and recover lost revenue',
        'ABDM-compliant by design — digital prescriptions, audit trails, encrypted patient data',
        'Cloud-native with offline support — works even when your internet flickers',
      ],
    },
    competitor: {
      title: "Excel & Tally's Approach",
      subtitle: 'General-Purpose Tools Adapted for Healthcare',
      points: [
        'Neither Excel nor Tally was designed for healthcare — they lack patient records, scheduling, and compliance',
        'Every process is manual — manual entry, manual reminders, manual reconciliation, manual errors',
        'No regulatory compliance capabilities — cannot generate ABDM-compliant digital health records',
        'Single point of failure — local files with no backup, no access control, no disaster recovery',
      ],
    },
  },
};

export default excelTallyConfig;
