import React from 'react';
import {
  DollarSign, Calendar, Clock, FileText, Stethoscope, CreditCard, Building2, BarChart3,
} from 'lucide-react';
import type { ComparisonConfig } from './types';
import { sharedMigrationSteps, sharedMigrationImage } from './types';

const lybrateConfig: ComparisonConfig = {
  slug: 'lybrate',
  competitorName: 'Lybrate',
  heroSubtitle: "Learn why Doxxy provides a more comprehensive clinic management solution compared to Lybrate's consultation-focused platform.",
  keyDifferencesSubtitle: 'See how Doxxy compares to Lybrate across important features and core functionalities.',
  migrationSubtitle: 'Switching from Lybrate to Doxxy is simple and hassle-free. Our migration specialists handle the entire process:',
  comparisonPoints: [
    { feature: 'Primary Focus', doxxy: 'Comprehensive Clinic Management', competitor: 'Online Doctor Consultations', advantage: 'Manage all aspects of your practice, not just consultations', icon: <Stethoscope className="h-6 w-6 text-primary" /> },
    { feature: 'Pricing Model', doxxy: 'Pay-per-consultation (₹10/consultation)', competitor: 'Commission-based on consultations', advantage: 'Predictable costs, no hidden commissions', icon: <DollarSign className="h-6 w-6 text-primary" /> },
    { feature: 'Patient Records', doxxy: 'Comprehensive EMR with medical history, prescriptions, lab results', competitor: 'Limited to consultation notes and basic patient info', advantage: 'Full patient history at your fingertips', icon: <FileText className="h-6 w-6 text-primary" /> },
    { feature: 'Appointment Management', doxxy: 'Smart scheduling for in-clinic and online appointments', competitor: 'Primarily online appointment booking', advantage: 'Manage all your appointments from a single platform', icon: <Calendar className="h-6 w-6 text-primary" /> },
    { feature: 'Billing System', doxxy: 'Integrated billing, invoicing, and payment tracking', competitor: 'Basic payment processing for online consultations', advantage: 'Streamline your entire revenue cycle', icon: <CreditCard className="h-6 w-6 text-primary" /> },
    { feature: 'Multi-Clinic Support', doxxy: 'Built-in multi-location management', competitor: 'Not designed for multi-clinic operations', advantage: 'Easily manage multiple branches from one dashboard', icon: <Building2 className="h-6 w-6 text-primary" /> },
    { feature: 'Analytics & Reporting', doxxy: 'Advanced practice analytics and performance reports', competitor: 'Basic consultation metrics', advantage: 'Gain insights to optimize your practice growth', icon: <BarChart3 className="h-6 w-6 text-primary" /> },
  ],
  painPointItems: [
    { title: 'Limited Scope', competitor: 'Lybrate primarily focuses on connecting doctors with patients for online consultations, lacking comprehensive clinic management features.', doxxy: 'Doxxy offers an all-in-one solution covering appointments, EMR, billing, and more, for both in-clinic and online patients.' },
    { title: 'Commission-Based Pricing', competitor: 'Lybrate charges a commission on each consultation, which can eat into your revenue, especially for high-volume practices.', doxxy: "Doxxy's transparent pay-per-consultation model ensures you know exactly what you're paying, with no hidden commissions." },
    { title: 'Data Silos', competitor: 'Using Lybrate for online consultations often means your patient data is fragmented across multiple systems.', doxxy: 'Doxxy centralizes all patient data, providing a comprehensive view of their medical history regardless of how they consult.' },
    { title: 'Lack of Practice Control', competitor: 'Lybrate dictates many aspects of the online consultation process and patient interaction.', doxxy: "Doxxy empowers you with full control over your clinic's workflows, branding, and patient experience." },
  ],
  testimonialItems: [
    { quote: 'We needed a system that could handle both our in-clinic and online patients seamlessly. Doxxy provided that and so much more, unlike Lybrate which was only good for online consultations.', name: 'Dr. Kavita Rao', clinic: 'Holistic Health Clinic, Chennai', photo: 'https://images.unsplash.com/photo-1594824204175-b70147e9cbc5?w=100&h=100&fit=crop' },
    { quote: 'The integrated billing system in Doxxy has saved us countless hours. With Lybrate, we still had to manually track payments and generate invoices.', name: 'Dr. Sameer Khan', clinic: 'Apex Medical Center, Hyderabad', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop' },
  ],
  featureComparisonRows: [
    { feature: 'Comprehensive Clinic Management', doxxy: true, competitor: false },
    { feature: 'Pay-per-consultation Pricing', doxxy: true, competitor: false },
    { feature: 'Integrated Billing System', doxxy: true, competitor: false },
    { feature: 'Multi-Clinic Management', doxxy: true, competitor: false },
    { feature: 'Advanced Analytics', doxxy: true, competitor: false },
    { feature: 'Dedicated Support', doxxy: true, competitor: false },
  ],
  migrationSteps: sharedMigrationSteps('Lybrate'),
  migrationImageSrc: sharedMigrationImage,
};

export default lybrateConfig;
