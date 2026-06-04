import React from 'react';
import {
  DollarSign, Users, Calendar, Clock, Stethoscope, FileText, MessageSquare, Smartphone,
} from 'lucide-react';
import type { ComparisonConfig } from './types';
import { sharedMigrationSteps, sharedMigrationImage } from './types';

const ekaCareConfig: ComparisonConfig = {
  slug: 'eka-care',
  competitorName: 'Eka Care',
  heroSubtitle: "See how Doxxy's innovative pricing model and comprehensive feature set provides better value for healthcare practices compared to Eka Care.",
  keyDifferencesSubtitle: 'See how Doxxy compares to Eka Care across important features and pricing models.',
  migrationSubtitle: 'Switching from Eka Care to Doxxy is simple and hassle-free. Our migration specialists handle the entire process:',
  comparisonPoints: [
    { feature: 'Pricing Model', doxxy: 'Pay-per-consultation (₹10/consultation)', competitor: 'Monthly subscription + per-doctor fees', advantage: 'More cost-effective for small to medium practices', icon: <DollarSign className="h-6 w-6 text-primary" /> },
    { feature: 'Free Plan', doxxy: 'First 100 consultations completely free', competitor: 'Limited-time trial with restricted features', advantage: 'Start with zero risk and no time pressure', icon: <Calendar className="h-6 w-6 text-primary" /> },
    { feature: 'Doctor Limits', doxxy: 'Unlimited doctors on all plans', competitor: 'Tiered pricing based on number of doctors', advantage: 'Add as many doctors as needed without extra cost', icon: <Users className="h-6 w-6 text-primary" /> },
    { feature: 'Contract Length', doxxy: 'No commitment, cancel anytime', competitor: 'Annual contracts with early termination fees', advantage: 'Flexibility to adjust as your practice needs change', icon: <Clock className="h-6 w-6 text-primary" /> },
    { feature: 'Multi-Clinic Support', doxxy: 'Built-in multi-location management', competitor: 'Available only on higher-tier plans', advantage: 'Manage multiple locations without premium pricing', icon: <Stethoscope className="h-6 w-6 text-primary" /> },
    { feature: 'Patient Records', doxxy: 'Comprehensive EMR with unlimited storage', competitor: 'Storage limits on basic plans', advantage: 'Never worry about hitting storage limits', icon: <FileText className="h-6 w-6 text-primary" /> },
    { feature: 'Patient Communication', doxxy: 'SMS, WhatsApp, and email notifications included', competitor: 'Basic notifications, premium features cost extra', advantage: 'All communication channels included at no extra cost', icon: <MessageSquare className="h-6 w-6 text-primary" /> },
    { feature: 'Mobile App', doxxy: 'Native iOS and Android apps included', competitor: 'Limited functionality in free mobile app', advantage: 'Full-featured mobile experience for doctors and staff', icon: <Smartphone className="h-6 w-6 text-primary" /> },
  ],
  painPointItems: [
    { title: 'Unpredictable Monthly Bills', competitor: "Eka Care's subscription model means you pay the same amount regardless of how many patients you see. During slow months, you're still paying full price.", doxxy: 'With Doxxy, you only pay for appointments you actually have. If you see fewer patients in a month, you pay less.' },
    { title: 'Doctor-Based Pricing Penalties', competitor: 'As your practice grows and you add more doctors, Eka Care increases your monthly fees significantly, penalizing your success.', doxxy: 'Doxxy charges only for appointments, not doctors. Add as many providers as you need without increasing your base costs.' },
    { title: 'Feature Limitations on Basic Plans', competitor: 'Eka Care restricts essential features like advanced analytics and multi-clinic management to higher-tier plans.', doxxy: 'All Doxxy features are available on all plans - you get the complete platform regardless of your size.' },
    { title: 'Long-Term Contracts', competitor: 'Eka Care typically requires annual commitments with penalties for early cancellation.', doxxy: 'Doxxy has no long-term contracts or commitments. You can cancel anytime without penalties.' },
    { title: 'Hidden Costs', competitor: 'Eka Care charges additional fees for setup, training, and premium support.', doxxy: 'Doxxy includes setup assistance, training, and premium support at no additional cost.' },
  ],
  testimonialItems: [
    { quote: "After switching from Eka Care to Doxxy, our monthly software costs decreased by nearly 40%. The pay-per-appointment model is much more aligned with our practice's cash flow.", name: 'Dr. Rajesh Sharma', clinic: 'Family Care Clinic, Mumbai', photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop' },
    { quote: "We were hesitant to switch EMR systems, but Doxxy's migration process was seamless. Their team imported all our patient data from Eka Care without any downtime.", name: 'Dr. Priya Patel', clinic: 'Wellness Medical Center, Pune', photo: 'https://images.unsplash.com/photo-1594824175513-9daa7a191e78?w=100&h=100&fit=crop' },
  ],
  featureComparisonRows: [
    { feature: 'Appointment Scheduling', doxxy: true, competitor: true },
    { feature: 'Electronic Medical Records', doxxy: true, competitor: true },
    { feature: 'Unlimited Doctors', doxxy: true, competitor: false },
    { feature: 'Multi-Clinic Management', doxxy: true, competitor: 'Premium Plans Only' },
    { feature: 'Patient Communication', doxxy: true, competitor: 'Basic Only' },
    { feature: 'Advanced Analytics', doxxy: true, competitor: 'Premium Plans Only' },
    { feature: 'Free Plan Available', doxxy: true, competitor: false },
    { feature: 'No Long-Term Contracts', doxxy: true, competitor: false },
  ],
  migrationSteps: sharedMigrationSteps('Eka Care'),
  migrationImageSrc: sharedMigrationImage,
};

export default ekaCareConfig;
