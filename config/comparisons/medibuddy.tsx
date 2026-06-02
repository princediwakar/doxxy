// Path: config/comparisons/medibuddy.tsx
import React from 'react';
import {
  DollarSign, Building2, Shield, FileText, Users,
  Clock, MessageSquare, Layers,
} from 'lucide-react';
import type { ComparisonConfig } from './types';
import { sharedMigrationSteps, sharedMigrationImage } from './types';

const medibuddyConfig: ComparisonConfig = {
  slug: 'medibuddy',
  competitorName: 'MediBuddy',
  heroSubtitle: "Discover why a clinic-dedicated platform like Doxxy outperforms MediBuddy's marketplace-plus-software model for running your daily practice operations.",
  keyDifferencesSubtitle: 'How Doxxy compares to MediBuddy across focus, pricing, and clinic-first design.',
  migrationSubtitle: 'Switching from MediBuddy to Doxxy is simple and hassle-free. Our migration specialists handle the entire process:',
  comparisonPoints: [
    { feature: 'Primary Business', doxxy: '100% clinic management software', competitor: 'Patient marketplace + insurance + software add-on', advantage: 'No conflict of interest — we serve clinics, not patients shopping for doctors', icon: <Building2 className="h-6 w-6 text-primary" /> },
    { feature: 'Pricing Model', doxxy: 'Pay-per-consultation (₹10/consultation, first 100 free)', competitor: 'Subscription + commission on marketplace leads', advantage: 'Transparent cost tied to your actual usage, not lead generation', icon: <DollarSign className="h-6 w-6 text-primary" /> },
    { feature: 'Patient Relationship', doxxy: 'Your patients stay yours — no marketplace interference', competitor: 'Platform sits between you and your patients', advantage: 'Direct patient relationship with full control over your practice', icon: <Users className="h-6 w-6 text-primary" /> },
    { feature: 'Software Focus', doxxy: 'All engineering resources dedicated to clinic workflows', competitor: 'Software is a supporting product for the marketplace', advantage: 'Faster feature development, deeper clinic-specific functionality', icon: <Layers className="h-6 w-6 text-primary" /> },
    { feature: 'Contract Lock-In', doxxy: 'No contracts, cancel anytime', competitor: 'Annual contracts standard, early exit penalties', advantage: 'Freedom to leave if the product does not meet your needs', icon: <Clock className="h-6 w-6 text-primary" /> },
    { feature: 'WhatsApp Integration', doxxy: 'Built-in WhatsApp for appointments, prescriptions, reminders', competitor: 'No integrated WhatsApp workflow', advantage: 'Reach patients on the messaging platform they use daily', icon: <MessageSquare className="h-6 w-6 text-primary" /> },
    { feature: 'Data Ownership', doxxy: 'You own 100% of your patient data', competitor: 'Patient data shared with marketplace ecosystem', advantage: 'Complete privacy and control over your clinical data', icon: <Shield className="h-6 w-6 text-primary" /> },
    { feature: 'Patient Records', doxxy: 'Deep clinical EMR with full medical history', competitor: 'Basic profiles optimized for marketplace matching', advantage: 'Records built for clinical care, not insurance processing', icon: <FileText className="h-6 w-6 text-primary" /> },
  ],
  painPointItems: [
    { title: 'Conflicting Business Model', competitor: "MediBuddy makes money by connecting patients to doctors on its marketplace and processing insurance claims. The clinic software exists to feed this marketplace — not to serve your practice's operational needs.", doxxy: 'Doxxy has one business: making your clinic run better. We do not operate a patient marketplace, sell insurance, or take commissions on your consultations. Our only incentive is building software you love.' },
    { title: 'Patient Ownership Erosion', competitor: "Patients who find you through MediBuddy's marketplace belong to MediBuddy's ecosystem. The platform controls the patient relationship, communication channels, and follow-up cadence.", doxxy: 'Every patient record in Doxxy is yours. You control communication, follow-ups, and the entire patient experience. No intermediary stands between you and your patients.' },
    { title: 'Software as an Afterthought', competitor: "MediBuddy's core product is its patient marketplace and insurance platform. Clinic management features receive secondary investment, leading to slower updates, fewer integrations, and a less refined experience.", doxxy: 'Doxxy is built ground-up for clinic management. Every sprint, every feature, every line of code is focused on making your clinic operations smoother. When we ship features, they are purpose-built for clinics.' },
    { title: 'Pricing Complexity', competitor: "MediBuddy's pricing combines subscription fees, marketplace commissions, and insurance processing charges. Monthly costs are unpredictable and depend on factors outside your control.", doxxy: 'One rate: ₹10 per consultation. First 100 free. No commissions, no hidden fees, no marketplace charges. Your bill is predictable and tied directly to your patient volume.' },
    { title: 'Platform Lock-In Risk', competitor: 'Leaving MediBuddy means losing access to the patient leads and appointment flow generated through their marketplace, creating a dependency that is hard to break.', doxxy: 'Doxxy gives you complete independence. Your patient list, your data, your workflows — take them anywhere. We earn your business every month by delivering value, not by creating switching costs.' },
  ],
  testimonialItems: [
    { quote: 'We were on MediBuddy for 18 months and slowly realized our patients were becoming MediBuddy\'s patients, not ours. With Doxxy, we have full control over our patient relationships. The software is also far better for daily clinic operations.', name: 'Dr. Naveen Joseph', clinic: 'Joseph Medical Centre, Kochi', photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop' },
    { quote: 'MediBuddy\'s software felt like an add-on to their insurance business. Doxxy feels like it was built by people who actually understand how a clinic runs — the pharmacy module, the WhatsApp integration, the queue management. It all just works.', name: 'Dr. Shalini Verghese', clinic: 'Verghese Diabetes Clinic, Thiruvananthapuram', photo: 'https://images.unsplash.com/photo-1594824204175-b70147e9cbc5?w=100&h=100&fit=crop' },
  ],
  featureComparisonRows: [
    { feature: 'Appointment Scheduling', doxxy: true, competitor: true },
    { feature: 'Electronic Medical Records', doxxy: true, competitor: 'Basic' },
    { feature: 'Dedicated Clinic Management', doxxy: true, competitor: false },
    { feature: 'WhatsApp Integration', doxxy: true, competitor: false },
    { feature: 'No Patient Marketplace Conflict', doxxy: true, competitor: false },
    { feature: 'Unlimited Doctors', doxxy: true, competitor: false },
    { feature: 'Multi-Clinic Management', doxxy: true, competitor: false },
    { feature: 'Pharmacy & Inventory', doxxy: true, competitor: false },
    { feature: 'Full Data Ownership', doxxy: true, competitor: false },
    { feature: 'No Long-Term Contracts', doxxy: true, competitor: false },
    { feature: 'Free Plan (First 100 Consultations)', doxxy: true, competitor: false },
    { feature: 'Implementation Time', doxxy: '1-3 Days', competitor: '1-2 Weeks' },
  ],
  migrationSteps: sharedMigrationSteps('MediBuddy'),
  migrationImageSrc: sharedMigrationImage,
  coreDifferences: {
    sectionTitle: 'Core Philosophical Differences',
    sectionSubtitle: 'Understanding the fundamental differences in approach between Doxxy and MediBuddy.',
    doxxy: { title: "Doxxy's Approach", subtitle: 'Clinic Software Company', points: ['100% focused on building the best clinic management software — no marketplace, no insurance, no distractions', 'You own your patient data, your patient relationships, and your practice independence', 'Simple, transparent pricing tied to your clinic usage, with no commissions or hidden fees', 'Deep clinical workflows built for daily operations: EMR, pharmacy, billing, front desk, multi-clinic'] },
    competitor: { title: "MediBuddy's Approach", subtitle: 'Healthcare Marketplace with Software Add-on', points: ['Core business is patient acquisition and insurance processing — clinic software is a supporting product', 'Platform mediates the patient relationship, reducing your direct connection with patients', 'Complex pricing combining subscriptions, marketplace commissions, and insurance processing fees', 'Patient records optimized for marketplace matching and insurance claims, not comprehensive clinical care'] },
  },
};

export default medibuddyConfig;
