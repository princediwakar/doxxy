import React from 'react';
import {
  DollarSign, Calendar, FileText, Stethoscope, CreditCard, Building2, BarChart3,
} from 'lucide-react';
import type { ComparisonConfig } from './types';
import { sharedMigrationSteps, sharedMigrationImage } from './types';

const mfineConfig: ComparisonConfig = {
  slug: 'mfine',
  competitorName: 'MFine',
  heroSubtitle: "Discover how Doxxy's hybrid approach to in-clinic and telemedicine appointments offers more flexibility and comprehensive management than MFine's telemedicine-centric model.",
  keyDifferencesSubtitle: 'See how Doxxy compares to MFine across important features and core functionalities.',
  migrationSubtitle: 'Switching from MFine to Doxxy is simple and hassle-free. Our migration specialists handle the entire process:',
  comparisonPoints: [
    { feature: 'Primary Model', doxxy: 'Hybrid (In-clinic & Telemedicine)', competitor: 'Telemedicine-centric', advantage: 'Flexibility to manage both physical and virtual consultations', icon: <Stethoscope className="h-6 w-6 text-primary" /> },
    { feature: 'Pricing Model', doxxy: 'Pay-per-appointment (₹10/appointment)', competitor: 'Subscription-based for doctors, commission on consultations', advantage: 'Predictable costs, no hidden commissions', icon: <DollarSign className="h-6 w-6 text-primary" /> },
    { feature: 'Clinic Management', doxxy: 'Comprehensive EMR, billing, scheduling, multi-clinic support', competitor: 'Limited to telemedicine workflow and patient engagement', advantage: 'All-in-one solution for your entire practice operations', icon: <Building2 className="h-6 w-6 text-primary" /> },
    { feature: 'Patient Records', doxxy: 'Full patient history, prescriptions, lab results, and clinical notes', competitor: 'Primarily consultation notes and basic patient data', advantage: 'Complete patient view for better diagnosis and care', icon: <FileText className="h-6 w-6 text-primary" /> },
    { feature: 'Appointment Types', doxxy: 'Supports both in-clinic and online appointments', competitor: 'Mainly focuses on online video consultations', advantage: 'Seamlessly manage all types of patient visits', icon: <Calendar className="h-6 w-6 text-primary" /> },
    { feature: 'Billing & Payments', doxxy: 'Integrated billing, invoicing, and payment tracking', competitor: 'Handles payments for online consultations only', advantage: 'Streamline your entire revenue cycle, not just online payments', icon: <CreditCard className="h-6 w-6 text-primary" /> },
    { feature: 'Analytics & Reporting', doxxy: 'Advanced practice analytics and performance reports', competitor: 'Basic metrics related to online consultations', advantage: 'Gain deeper insights to optimize practice growth and efficiency', icon: <BarChart3 className="h-6 w-6 text-primary" /> },
  ],
  painPointItems: [
    { title: 'Limited Scope for In-clinic Practice', competitor: 'MFine is heavily focused on telemedicine, making it less suitable for clinics with significant in-person patient flow.', doxxy: 'Doxxy offers a hybrid model, perfectly balancing features for both in-clinic and telemedicine appointments.' },
    { title: 'Fragmented Patient Data', competitor: 'If you use MFine for telemedicine and another system for in-clinic patients, your patient data becomes fragmented.', doxxy: 'Doxxy centralizes all patient data, providing a unified record regardless of how the patient interacts with your clinic.' },
    { title: 'Subscription & Commission Costs', competitor: "MFine's pricing can involve both subscriptions for doctors and commissions on consultations, leading to unpredictable costs.", doxxy: "Doxxy's transparent pay-per-appointment model ensures clear and predictable billing, with no hidden commissions." },
    { title: 'Lack of Comprehensive Practice Management', competitor: 'MFine lacks features like detailed billing, multi-clinic management, and advanced reporting needed for full practice operations.', doxxy: 'Doxxy provides an all-encompassing solution, empowering you to manage every aspect of your clinic efficiently.' },
  ],
  testimonialItems: [
    { quote: 'We needed a platform that could handle both our walk-in patients and our growing telemedicine practice. MFine was great for telemedicine, but Doxxy gave us the complete solution we needed.', name: 'Dr. Preeti Sharma', clinic: 'Harmony Clinic, Bengaluru', photo: 'https://images.unsplash.com/photo-1594824204175-b70147e9cbc5?w=100&h=100&fit=crop' },
    { quote: 'The integrated billing and patient records in Doxxy are a lifesaver. With MFine, we had to use separate tools, which was inefficient and prone to errors.', name: 'Dr. Arjun Reddy', clinic: 'Global Health Center, Hyderabad', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop' },
  ],
  featureComparisonRows: [
    { feature: 'Hybrid Clinic Management', doxxy: true, competitor: false },
    { feature: 'Pay-per-appointment Pricing', doxxy: true, competitor: false },
    { feature: 'Comprehensive Patient Records', doxxy: true, competitor: false },
    { feature: 'Integrated Billing System', doxxy: true, competitor: false },
    { feature: 'Multi-Clinic Management', doxxy: true, competitor: false },
    { feature: 'Advanced Analytics', doxxy: true, competitor: false },
  ],
  migrationSteps: sharedMigrationSteps('MFine'),
  migrationImageSrc: sharedMigrationImage,
};

export default mfineConfig;
