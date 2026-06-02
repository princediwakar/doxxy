import React from 'react';
import {
  DollarSign, Zap, Calendar, Smartphone, Shield, Stethoscope, MessageSquare,
} from 'lucide-react';
import type { ComparisonConfig } from './types';
import { sharedMigrationSteps, sharedMigrationImage } from './types';

const clinicplusConfig: ComparisonConfig = {
  slug: 'clinicplus',
  competitorName: 'ClinicPlus',
  heroSubtitle: "Compare Doxxy's modern, cloud-based approach with ClinicPlus's traditional software model.",
  keyDifferencesSubtitle: 'See how Doxxy compares to ClinicPlus across important features and deployment models.',
  migrationSubtitle: 'Switching from ClinicPlus to Doxxy is simple and hassle-free. Our migration specialists handle the entire process:',
  comparisonPoints: [
    { feature: 'Pricing Model', doxxy: 'Pay-per-consultation (₹10/consultation)', competitor: 'One-time purchase + annual maintenance fees', advantage: 'Lower upfront cost, pay only for what you use', icon: <DollarSign className="h-6 w-6 text-primary" /> },
    { feature: 'Deployment', doxxy: 'Cloud-based (SaaS)', competitor: 'On-premise software', advantage: 'Access from anywhere, no IT maintenance required', icon: <Zap className="h-6 w-6 text-primary" /> },
    { feature: 'Updates & Upgrades', doxxy: 'Automatic, continuous updates', competitor: 'Manual updates, often paid upgrades', advantage: 'Always on the latest version with new features', icon: <Calendar className="h-6 w-6 text-primary" /> },
    { feature: 'Accessibility', doxxy: 'Web and native mobile apps (iOS/Android)', competitor: 'Desktop application only', advantage: 'Work from any device, anywhere', icon: <Smartphone className="h-6 w-6 text-primary" /> },
    { feature: 'Data Security & Backup', doxxy: 'Automated cloud backups, enterprise-grade security', competitor: 'Manual backups, security depends on local setup', advantage: 'Your data is always safe and accessible', icon: <Shield className="h-6 w-6 text-primary" /> },
    { feature: 'Multi-Clinic Support', doxxy: 'Built-in multi-location management', competitor: 'Complex setup or separate licenses required', advantage: 'Easily manage multiple branches from one dashboard', icon: <Stethoscope className="h-6 w-6 text-primary" /> },
    { feature: 'Support', doxxy: '24/7 online and phone support', competitor: 'Limited hours, often email-based support', advantage: 'Get help whenever you need it', icon: <MessageSquare className="h-6 w-6 text-primary" /> },
  ],
  painPointItems: [
    { title: 'High Upfront Costs', competitor: 'ClinicPlus requires a significant one-time purchase fee, making it a large initial investment.', doxxy: "Doxxy's pay-per-consultation model means you have minimal upfront costs and only pay as you grow." },
    { title: 'Lack of Remote Access', competitor: "Being an on-premise solution, ClinicPlus can only be accessed from the clinic's computers.", doxxy: 'Doxxy is cloud-based, allowing you to manage your practice from anywhere, on any device.' },
    { title: 'Manual Updates & Maintenance', competitor: "With ClinicPlus, you're responsible for software updates, backups, and IT maintenance.", doxxy: 'Doxxy handles all updates, backups, and security automatically, so you can focus on patient care.' },
    { title: 'Limited Scalability', competitor: 'Scaling ClinicPlus for multiple locations or growing practices can be complex and expensive.', doxxy: 'Doxxy is designed for scalability, easily supporting multiple clinics and unlimited doctors without complex setups.' },
  ],
  testimonialItems: [
    { quote: 'Switching from ClinicPlus to Doxxy was a game-changer. We no longer worry about server maintenance or manual updates. Everything just works!', name: 'Dr. Anjali Singh', clinic: 'Prime Care Clinic, Delhi', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop' },
    { quote: 'The mobile app for Doxxy is fantastic. I can manage appointments and view patient records on the go, which was impossible with our old ClinicPlus system.', name: 'Dr. Rohan Mehta', clinic: 'City Hospital, Bengaluru', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  ],
  featureComparisonRows: [
    { feature: 'Pricing Model', doxxy: true, competitor: false },
    { feature: 'Cloud-Based', doxxy: true, competitor: false },
    { feature: 'Automatic Updates', doxxy: true, competitor: false },
    { feature: 'Mobile Apps', doxxy: true, competitor: false },
    { feature: 'Multi-Clinic Management', doxxy: true, competitor: false },
    { feature: '24/7 Support', doxxy: true, competitor: false },
  ],
  migrationSteps: sharedMigrationSteps('ClinicPlus'),
  migrationImageSrc: sharedMigrationImage,
};

export default clinicplusConfig;
