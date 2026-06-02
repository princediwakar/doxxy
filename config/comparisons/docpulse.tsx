// Path: config/comparisons/docpulse.tsx
import React from 'react';
import {
  DollarSign, Building2, Shield, FileText, Users,
  Clock, Layers, BarChart3,
} from 'lucide-react';
import type { ComparisonConfig } from './types';
import { sharedMigrationSteps, sharedMigrationImage } from './types';

const docpulseConfig: ComparisonConfig = {
  slug: 'docpulse',
  competitorName: 'DocPulse',
  heroSubtitle: "See how Doxxy's comprehensive clinic management platform goes beyond basic EMR to deliver a complete practice solution, compared to DocPulse's small-clinic focus.",
  keyDifferencesSubtitle: 'How Doxxy compares to DocPulse across feature depth, scalability, and compliance capabilities.',
  migrationSubtitle: 'Switching from DocPulse to Doxxy is simple and hassle-free. Our migration specialists handle the entire process:',
  comparisonPoints: [
    { feature: 'Feature Depth', doxxy: 'Full clinic suite: EMR, billing, pharmacy, front desk, analytics', competitor: 'Basic EMR with limited practice management', advantage: 'One platform replaces multiple tools', icon: <Layers className="h-6 w-6 text-primary" /> },
    { feature: 'Pricing Model', doxxy: 'Pay-per-consultation (₹10/consultation)', competitor: 'Monthly subscription plans starting at ₹999/month', advantage: 'Free for low-volume practices, scales with growth', icon: <DollarSign className="h-6 w-6 text-primary" /> },
    { feature: 'Multi-Clinic Support', doxxy: 'Unlimited clinics on a single dashboard', competitor: 'Single clinic per account', advantage: 'Expand your practice without switching software', icon: <Building2 className="h-6 w-6 text-primary" /> },
    { feature: 'ABDM Compliance', doxxy: 'ABDM-compliant with Ayushman Bharat Digital Mission integration', competitor: 'Limited or no ABDM compliance', advantage: 'Stay compliant with India\'s digital health mission', icon: <Shield className="h-6 w-6 text-primary" /> },
    { feature: 'Doctor Limits', doxxy: 'Unlimited doctors, unlimited staff accounts', competitor: 'Tiered plans limit the number of users', advantage: 'Add your entire team without upgrade pressure', icon: <Users className="h-6 w-6 text-primary" /> },
    { feature: 'Pricing Transparency', doxxy: 'One simple rate, everything included', competitor: 'Multiple tiers with feature gating at each level', advantage: 'Never discover that a feature you need is locked behind a higher plan', icon: <BarChart3 className="h-6 w-6 text-primary" /> },
    { feature: 'Contract Flexibility', doxxy: 'No contracts, cancel anytime', competitor: 'Annual commitments encouraged, monthly at a premium', advantage: 'No lock-in, stay because the product works for you', icon: <Clock className="h-6 w-6 text-primary" /> },
    { feature: 'Patient Records', doxxy: 'Comprehensive EMR with templates, images, lab reports', competitor: 'Basic SOAP notes with limited attachment support', advantage: 'Richer clinical data for better patient outcomes', icon: <FileText className="h-6 w-6 text-primary" /> },
  ],
  painPointItems: [
    { title: 'Hidden Feature Gating', competitor: "DocPulse's tiered plans mean critical features like advanced reporting, inventory management, or API access are locked behind more expensive subscriptions. You often discover this after signing up.", doxxy: 'Doxxy includes every feature in a single plan. No feature gating, no premium tiers. What you see is what you get — the full product, for every clinic.' },
    { title: 'Single-Clinic Limitation', competitor: "DocPulse is designed for single-clinic setup. If you want to expand to a second location, you'll need a separate account and dashboard — doubling your cost and administrative overhead.", doxxy: 'Doxxy supports unlimited clinics under one account. Add branches, manage them from a single dashboard, and get consolidated reports across locations.' },
    { title: 'Limited Compliance Readiness', competitor: "DocPulse has limited support for ABDM (Ayushman Bharat Digital Mission) standards, which are becoming mandatory for Indian healthcare providers. You may need to migrate again when compliance deadlines hit.", doxxy: 'Doxxy is built with ABDM compliance at the core. Digital health IDs, health information exchange, and consent management are native features, not afterthoughts.' },
    { title: 'User-Based Pricing Limits Growth', competitor: "DocPulse's plans are gated by user count. Adding a receptionist, a second doctor, or a pharmacist means upgrading to a costlier plan, even if your patient volume hasn't changed.", doxxy: "Doxxy's unlimited-user model means your team can grow freely. Add receptionists, nurses, pharmacists, and specialists without any per-seat charges." },
    { title: 'No Built-In Pharmacy Module', competitor: 'DocPulse lacks an integrated pharmacy and inventory module. Clinics that dispense medicines need a separate system for stock management and billing.', doxxy: 'Doxxy includes a full pharmacy module with inventory tracking, expiry alerts, purchase management, and integrated billing — all connected to patient prescriptions.' },
  ],
  testimonialItems: [
    { quote: 'We were on DocPulse for a year before switching to Doxxy. The biggest frustration was discovering features were locked behind higher tiers. With Doxxy, everything is included from day one. Our monthly costs actually went down.', name: 'Dr. Sanjay Patil', clinic: 'Shree Diagnostics & Clinic, Nashik', photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop' },
    { quote: 'Running two clinics on DocPulse meant paying for two separate subscriptions and managing two dashboards. Doxxy gave us a single view of both locations, consolidated reports, and cut our software costs by nearly half.', name: 'Dr. Meenal Deshmukh', clinic: 'Deshmukh Eye Care, Nagpur & Wardha', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop' },
  ],
  featureComparisonRows: [
    { feature: 'Appointment Scheduling', doxxy: true, competitor: true },
    { feature: 'Electronic Medical Records', doxxy: true, competitor: true },
    { feature: 'Multi-Clinic Management', doxxy: true, competitor: false },
    { feature: 'Unlimited Doctors & Staff', doxxy: true, competitor: false },
    { feature: 'ABDM Compliance', doxxy: true, competitor: false },
    { feature: 'Pharmacy & Inventory Module', doxxy: true, competitor: false },
    { feature: 'Integrated Billing & Invoicing', doxxy: true, competitor: 'Basic' },
    { feature: 'WhatsApp Integration', doxxy: true, competitor: false },
    { feature: 'Advanced Analytics', doxxy: true, competitor: 'Premium Plan Only' },
    { feature: 'Free Plan (First 100 Consultations)', doxxy: true, competitor: false },
    { feature: 'No Long-Term Contracts', doxxy: true, competitor: false },
    { feature: 'Implementation Time', doxxy: '1-3 Days', competitor: '3-7 Days' },
  ],
  migrationSteps: sharedMigrationSteps('DocPulse'),
  migrationImageSrc: sharedMigrationImage,
  coreDifferences: {
    sectionTitle: 'Core Philosophical Differences',
    sectionSubtitle: 'Understanding the fundamental differences in approach between Doxxy and DocPulse.',
    doxxy: { title: "Doxxy's Approach", subtitle: 'Full-Spectrum Clinic Platform', points: ['Every feature included in one plan — EMR, billing, pharmacy, front desk, analytics, multi-clinic', 'Unlimited model: unlimited doctors, unlimited clinics, unlimited users on every account', 'ABDM compliance built into the core, not an afterthought or premium add-on', 'Usage-based pricing that aligns our success with yours: if your practice grows, we both win'] },
    competitor: { title: "DocPulse's Approach", subtitle: 'Basic EMR with Tiered Upgrades', points: ['Core EMR functionality with practice management features locked behind higher pricing tiers', 'User-based pricing that penalizes team growth and multi-doctor practices', 'Limited compliance features — ABDM and digital health standards not fully addressed', 'Designed for single, small clinics, requiring workarounds or duplicate accounts for multi-location practices'] },
  },
};

export default docpulseConfig;
