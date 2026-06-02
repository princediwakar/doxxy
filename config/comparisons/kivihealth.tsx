// Path: config/comparisons/kivihealth.tsx
import React from 'react';
import {
  DollarSign, Users, Calendar, Zap, FileText,
  MessageSquare, Shield, Layers,
} from 'lucide-react';
import type { ComparisonConfig } from './types';
import { sharedMigrationSteps, sharedMigrationImage } from './types';

const kivihealthConfig: ComparisonConfig = {
  slug: 'kivihealth',
  competitorName: 'KiviHealth',
  heroSubtitle: "Compare Doxxy's mature, feature-complete clinic management platform with KiviHealth's newer telemedicine-centric approach. See which one is ready for your clinic today.",
  keyDifferencesSubtitle: 'How Doxxy compares to KiviHealth across core features, maturity, and clinic-readiness.',
  migrationSubtitle: 'Switching from KiviHealth to Doxxy is simple and hassle-free. Our migration specialists handle the entire process:',
  comparisonPoints: [
    { feature: 'Platform Maturity', doxxy: 'Proven, battle-tested with thousands of clinics', competitor: 'Newer entrant still building core features', advantage: 'Stable, reliable platform with years of refinement', icon: <Shield className="h-6 w-6 text-primary" /> },
    { feature: 'Pricing Model', doxxy: 'Pay-per-consultation (₹10/consultation)', competitor: 'Subscription plans with per-user fees', advantage: 'Pay only for what you use, no per-seat charges', icon: <DollarSign className="h-6 w-6 text-primary" /> },
    { feature: 'WhatsApp Integration', doxxy: 'Built-in WhatsApp for appointments, reminders, and reports', competitor: 'No native WhatsApp integration', advantage: 'Communicate with patients where they already are', icon: <MessageSquare className="h-6 w-6 text-primary" /> },
    { feature: 'Offline Support', doxxy: 'Works with intermittent connectivity, queues sync when online', competitor: 'Cloud-only, requires stable internet', advantage: 'Keep working even during power cuts and network outages', icon: <Zap className="h-6 w-6 text-primary" /> },
    { feature: 'Doctor Limits', doxxy: 'Unlimited doctors on all plans', competitor: 'Per-doctor pricing, costs add up quickly', advantage: 'Add specialists and locum doctors without extra fees', icon: <Users className="h-6 w-6 text-primary" /> },
    { feature: 'Patient Records', doxxy: 'Full EMR with templates, prescriptions, lab integration', competitor: 'Basic patient profiles with limited clinical depth', advantage: 'Complete clinical decision support at your fingertips', icon: <FileText className="h-6 w-6 text-primary" /> },
    { feature: 'Multi-Clinic Support', doxxy: 'Built-in multi-location with centralized dashboard', competitor: 'Limited or manual workarounds for multiple clinics', advantage: 'Manage all your branches from a single login', icon: <Layers className="h-6 w-6 text-primary" /> },
    { feature: 'Appointment Experience', doxxy: 'Smart scheduling with waitlist, queue management, and auto-reminders', competitor: 'Basic booking with limited automation', advantage: 'Reduce no-shows and improve patient flow', icon: <Calendar className="h-6 w-6 text-primary" /> },
  ],
  painPointItems: [
    { title: 'Unproven at Scale', competitor: 'KiviHealth is a newer platform still evolving its feature set. Clinics often encounter missing functionality and half-built modules that disrupt daily operations.', doxxy: 'Doxxy is a mature platform refined through years of real-world clinic use. Every feature is production-hardened and trusted by clinics across India.' },
    { title: 'No Offline Resilience', competitor: "KiviHealth is cloud-dependent and stops working when your internet goes down — a frequent reality in many Indian clinics and smaller towns.", doxxy: 'Doxxy is built for Indian infrastructure realities. Core functions work offline and sync automatically when connectivity returns, so your clinic never stops.' },
    { title: 'Missing WhatsApp Workflow', competitor: "KiviHealth has no native WhatsApp integration. You're stuck using separate tools for patient communication, reminders, and report sharing.", doxxy: 'Doxxy integrates WhatsApp directly into your workflow — send appointment confirmations, share prescriptions, and collect payments over WhatsApp without switching tools.' },
    { title: 'Escalating Per-Doctor Costs', competitor: "KiviHealth's per-user pricing model means your costs multiply with every doctor, specialist, or staff member you add to the system.", doxxy: "Doxxy's unlimited-doctor model means your monthly cost stays predictable regardless of how many doctors join your practice." },
    { title: 'Limited Clinical Depth', competitor: 'Patient records in KiviHealth are basic — mostly demographic data with limited support for structured clinical notes, templates, or lab integrations.', doxxy: 'Doxxy provides a complete EMR with customizable templates, structured clinical notes, e-prescriptions, lab result tracking, and growth charts — everything you need for quality care.' },
  ],
  testimonialItems: [
    { quote: 'We evaluated KiviHealth before choosing Doxxy. The difference was clear — Doxxy had WhatsApp reminders, offline support, and unlimited doctors, which KiviHealth simply did not offer. Our front desk team learned it in a day.', name: 'Dr. Rajeshwari Iyer', clinic: 'Sai Krupa Clinic, Coimbatore', photo: 'https://images.unsplash.com/photo-1594824204175-b70147e9cbc5?w=100&h=100&fit=crop' },
    { quote: 'We briefly tried KiviHealth but switched to Doxxy within two months. The WhatsApp integration alone has reduced our no-shows by over 40%. Doxxy just has more depth — it feels like a complete product, not a work in progress.', name: 'Dr. Manoj Tiwari', clinic: 'Shivam Hospital, Lucknow', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  ],
  featureComparisonRows: [
    { feature: 'Appointment Scheduling', doxxy: true, competitor: true },
    { feature: 'Electronic Medical Records', doxxy: true, competitor: 'Basic' },
    { feature: 'WhatsApp Integration', doxxy: true, competitor: false },
    { feature: 'Offline Support', doxxy: true, competitor: false },
    { feature: 'Unlimited Doctors', doxxy: true, competitor: false },
    { feature: 'Multi-Clinic Management', doxxy: true, competitor: false },
    { feature: 'Customizable Templates', doxxy: true, competitor: 'Limited' },
    { feature: 'Integrated Billing', doxxy: true, competitor: true },
    { feature: 'Free Plan (First 100 Consultations)', doxxy: true, competitor: false },
    { feature: 'No Long-Term Contracts', doxxy: true, competitor: false },
    { feature: 'Implementation Time', doxxy: '1-3 Days', competitor: '1-2 Weeks' },
  ],
  migrationSteps: sharedMigrationSteps('KiviHealth'),
  migrationImageSrc: sharedMigrationImage,
  coreDifferences: {
    sectionTitle: 'Core Philosophical Differences',
    sectionSubtitle: 'Understanding the fundamental differences in approach between Doxxy and KiviHealth.',
    doxxy: { title: "Doxxy's Approach", subtitle: 'Mature, Clinic-First Platform', points: ['Years of production use across diverse Indian clinics, with every feature hardened by real-world feedback', 'Built for Indian infrastructure: offline-capable, WhatsApp-native, works on low-end devices', 'Unlimited everything — doctors, clinics, patients — with simple per-consultation pricing', 'Deep clinical workflows: structured EMR, lab integrations, e-prescriptions, growth charts'] },
    competitor: { title: "KiviHealth's Approach", subtitle: 'New Entrant, Telemedicine-First', points: ['Newer platform still building out core modules; gaps in clinical depth and practice management', 'Cloud-only architecture with no offline fallback, limiting reliability in areas with unstable connectivity', 'Per-user pricing that penalizes growing practices and multi-doctor clinics', 'Primarily focused on telemedicine workflows, with clinic management features lagging behind'] },
  },
};

export default kivihealthConfig;
