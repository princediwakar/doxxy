// Path: config/comparisons/healthplix.tsx
import React from 'react';
import {
  DollarSign, Users, Clock, FileText,
  Smartphone, Layers, MessageSquare, Building2,
} from 'lucide-react';
import type { ComparisonConfig } from './types';
import { sharedMigrationSteps, sharedMigrationImage } from './types';

const healthplixConfig: ComparisonConfig = {
  slug: 'healthplix',
  competitorName: 'HealthPlix',
  heroSubtitle: "See why Doxxy's full clinic management suite — covering front desk, billing, pharmacy, and multi-user workflows — delivers more value than HealthPlix's doctor-centric EMR approach.",
  keyDifferencesSubtitle: 'How Doxxy compares to HealthPlix across clinic-wide functionality, team workflows, and practice management depth.',
  migrationSubtitle: 'Switching from HealthPlix to Doxxy is simple and hassle-free. Our migration specialists handle the entire process:',
  comparisonPoints: [
    { feature: 'Platform Scope', doxxy: 'Full clinic management: EMR + front desk + billing + pharmacy + analytics', competitor: 'Doctor-focused EMR with AI clinical assistance', advantage: 'One platform for your entire clinic team, not just the doctor', icon: <Layers className="h-6 w-6 text-primary" /> },
    { feature: 'Pricing Model', doxxy: 'Pay-per-consultation (₹10/consultation, first 100 free)', competitor: 'Per-doctor subscription with usage minimums', advantage: 'No minimums, no per-doctor charges, pay for what you use', icon: <DollarSign className="h-6 w-6 text-primary" /> },
    { feature: 'Team Workflows', doxxy: 'Multi-user with role-based access: receptionist, doctor, pharmacist, admin', competitor: 'Primarily designed for single-doctor use', advantage: 'Your entire staff works on one coordinated platform', icon: <Users className="h-6 w-6 text-primary" /> },
    { feature: 'Front Desk Management', doxxy: 'Full front desk: check-in, queue, billing, token display', competitor: 'No dedicated front desk module', advantage: 'Streamline patient flow from arrival to discharge', icon: <Building2 className="h-6 w-6 text-primary" /> },
    { feature: 'Pharmacy Integration', doxxy: 'Built-in pharmacy with stock management, expiry alerts, dispensing', competitor: 'No pharmacy module', advantage: 'Connect prescriptions directly to dispensing and inventory', icon: <FileText className="h-6 w-6 text-primary" /> },
    { feature: 'WhatsApp Communication', doxxy: 'Native WhatsApp: appointment confirmations, prescriptions, lab reports', competitor: 'No WhatsApp integration', advantage: 'Instant patient communication on India\'s most-used messaging app', icon: <MessageSquare className="h-6 w-6 text-primary" /> },
    { feature: 'Contract Freedom', doxxy: 'No contracts, cancel anytime', competitor: 'Annual contracts with usage commitments', advantage: 'Stay because the product delivers value, not because you are locked in', icon: <Clock className="h-6 w-6 text-primary" /> },
    { feature: 'Multi-Clinic Support', doxxy: 'Built-in multi-location management with consolidated reports', competitor: 'Limited multi-clinic capabilities', advantage: 'Expand your practice across locations without switching systems', icon: <Smartphone className="h-6 w-6 text-primary" /> },
  ],
  painPointItems: [
    { title: 'EMR-Only, Not Practice Management', competitor: 'HealthPlix focuses almost entirely on the doctor\'s EMR experience — AI-assisted notes, disease summaries, clinical decision support. But running a clinic involves far more: front desk, billing, pharmacy, patient communication, and staff coordination.', doxxy: "Doxxy covers the full clinic workflow. Yes, we have a great EMR — but we also give you front desk check-in, token queue displays, integrated billing, pharmacy stock management, and WhatsApp messaging. Your receptionist, pharmacist, and accountant use Doxxy as much as the doctor does." },
    { title: 'Single-User Design Limits Team Efficiency', competitor: "HealthPlix is optimized for a doctor working alone. There's no meaningful role-based access for receptionists, nurses, or pharmacists. This creates bottlenecks where the doctor becomes the data entry point for everything.", doxxy: 'Doxxy is built for clinic teams. Receptionists manage check-ins and queues. Pharmacists handle dispensing. Accountants run billing. Each role has its own tailored interface, and the doctor sees a unified patient view without doing data entry.' },
    { title: 'Contractual Lock-In with Usage Minimums', competitor: "HealthPlix requires annual contracts with minimum consultation commitments. If your practice has a slow month or you want to try alternatives, you're still paying for consultations you didn't conduct.", doxxy: "Doxxy has no contracts and no minimums. If you do 50 consultations this month, you pay for 50 (after your free 100). If you do 500 next month, you pay for 500. Your cost tracks your actual workload." },
    { title: 'No Pharmacy or Inventory Management', competitor: "If your clinic dispenses medicines, HealthPlix offers no help. You'll need a separate pharmacy management system, creating data silos between prescriptions and dispensing.", doxxy: 'Doxxy includes a complete pharmacy module. When a doctor writes a prescription, the pharmacist sees it instantly. Stock levels update automatically. Expiry alerts prevent waste. It is a single, connected workflow.' },
    { title: 'Missing Patient Communication Tools', competitor: "HealthPlix has no built-in WhatsApp or SMS integration. Appointment reminders, prescription sharing, and report delivery require separate tools or manual effort from your staff.", doxxy: 'Doxxy sends appointment confirmations, reminders, e-prescriptions, and lab reports over WhatsApp automatically. Your patients get timely communication, and your staff saves hours of phone calls each week.' },
  ],
  testimonialItems: [
    { quote: 'HealthPlix has a good EMR, but my clinic needed more than just doctor notes. Doxxy gave us front desk queue management, integrated pharmacy, and WhatsApp — all in one place. My staff productivity has doubled.', name: 'Dr. Amrita Kulkarni', clinic: 'Sparsh Multispecialty Clinic, Pune', photo: 'https://images.unsplash.com/photo-1594824204175-b70147e9cbc5?w=100&h=100&fit=crop' },
    { quote: 'The pharmacy module in Doxxy was the deciding factor. With HealthPlix, we had to maintain a separate pharmacy system. Doxxy connects prescriptions to dispensing seamlessly — our inventory errors dropped to zero.', name: 'Dr. Vikas Chandra', clinic: 'Chandra Neuro & General Clinic, Patna', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  ],
  featureComparisonRows: [
    { feature: 'Electronic Medical Records', doxxy: true, competitor: true },
    { feature: 'AI-Assisted Clinical Notes', doxxy: true, competitor: true },
    { feature: 'Front Desk Management', doxxy: true, competitor: false },
    { feature: 'Pharmacy & Inventory Module', doxxy: true, competitor: false },
    { feature: 'Multi-User Role-Based Access', doxxy: true, competitor: false },
    { feature: 'WhatsApp Integration', doxxy: true, competitor: false },
    { feature: 'Multi-Clinic Management', doxxy: true, competitor: false },
    { feature: 'Integrated Billing & Invoicing', doxxy: true, competitor: 'Basic' },
    { feature: 'Unlimited Doctors & Staff', doxxy: true, competitor: false },
    { feature: 'No Annual Contracts', doxxy: true, competitor: false },
    { feature: 'Free Plan (First 100 Consultations)', doxxy: true, competitor: false },
    { feature: 'Implementation Time', doxxy: '1-3 Days', competitor: '1-2 Weeks' },
  ],
  migrationSteps: sharedMigrationSteps('HealthPlix'),
  migrationImageSrc: sharedMigrationImage,
  coreDifferences: {
    sectionTitle: 'Core Philosophical Differences',
    sectionSubtitle: 'Understanding the fundamental differences in approach between Doxxy and HealthPlix.',
    doxxy: { title: "Doxxy's Approach", subtitle: 'Whole-Clinic Platform', points: ['Built for the entire clinic team: reception, doctors, pharmacists, accountants — each with their own optimized interface', 'Covers the complete patient journey: check-in, consultation, pharmacy dispensing, billing, follow-up — all in one system', 'Simple, flexible pricing with no contracts, no minimums, and unlimited users on every account', 'Patient communication built-in: WhatsApp for appointments, prescriptions, reports, and payments'] },
    competitor: { title: "HealthPlix's Approach", subtitle: 'Doctor-Centric EMR', points: ['Optimized for individual doctor productivity with AI-assisted note-taking and clinical summaries', 'Limited beyond the consultation room: no front desk, pharmacy, or multi-user team workflows', 'Annual contracts with per-doctor pricing and consultation minimum commitments', 'No built-in patient communication tools — clinics must use external systems for reminders and report sharing'] },
  },
};

export default healthplixConfig;
