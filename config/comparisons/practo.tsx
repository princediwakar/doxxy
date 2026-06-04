import React from 'react';
import {
  DollarSign, Users, Calendar, Clock, Zap, FileText, Smartphone, Layers,
} from 'lucide-react';
import type { ComparisonConfig } from './types';
import { sharedMigrationImage } from './types';

const practoConfig: ComparisonConfig = {
  slug: 'practo',
  competitorName: 'Practo',
  heroSubtitle: "See how Doxxy's dedicated clinic management platform offers better value and a more streamlined experience compared to Practo.",
  keyDifferencesSubtitle: 'How Doxxy compares to Practo across important features and pricing models.',
  migrationSubtitle: 'Switching from Practo to Doxxy is straightforward with our dedicated migration team:',
  comparisonPoints: [
    { feature: 'Pricing Model', doxxy: 'Pay-per-consultation (₹10/consultation)', competitor: 'Monthly subscription + per-doctor fees', advantage: 'More cost-effective for small to medium practices', icon: <DollarSign className="h-6 w-6 text-primary" /> },
    { feature: 'Free Plan', doxxy: 'First 100 consultations completely free', competitor: 'Limited free tier with restricted features', advantage: 'Start with zero risk and full feature access', icon: <Calendar className="h-6 w-6 text-primary" /> },
    { feature: 'Doctor Limits', doxxy: 'Unlimited doctors on all plans', competitor: 'Tiered pricing based on number of doctors', advantage: 'Add as many doctors as needed without extra cost', icon: <Users className="h-6 w-6 text-primary" /> },
    { feature: 'Contract Length', doxxy: 'No commitment, cancel anytime', competitor: 'Annual contracts preferred, monthly at premium', advantage: 'Flexibility to adjust as your practice needs change', icon: <Clock className="h-6 w-6 text-primary" /> },
    { feature: 'Patient Records', doxxy: 'Comprehensive EMR with unlimited storage', competitor: 'Storage limits on basic plans', advantage: 'Never worry about hitting storage limits', icon: <FileText className="h-6 w-6 text-primary" /> },
    { feature: 'Focus', doxxy: 'Dedicated to clinic management', competitor: 'Split focus between marketplace and software', advantage: 'Software built specifically for clinic operations', icon: <Layers className="h-6 w-6 text-primary" /> },
    { feature: 'Implementation', doxxy: 'Quick setup, minimal training required', competitor: 'Complex setup, extensive training needed', advantage: 'Get up and running in days, not weeks', icon: <Zap className="h-6 w-6 text-primary" /> },
    { feature: 'User Interface', doxxy: 'Modern, intuitive design', competitor: 'Complex interface with steeper learning curve', advantage: 'Less training time, higher staff adoption', icon: <Smartphone className="h-6 w-6 text-primary" /> },
  ],
  painPointItems: [
    { title: 'Complex Pricing Structure', competitor: "Practo's pricing model includes base subscription fees, per-doctor charges, and additional costs for premium features, making it difficult to predict monthly expenses.", doxxy: "Doxxy's simple pay-per-consultation model means transparent, predictable costs that scale directly with your practice volume." },
    { title: 'Marketplace Focus vs. Clinic Management', competitor: "Practo's primary focus is its patient marketplace, with clinic management software as a secondary offering, leading to divided attention on software improvements.", doxxy: 'Doxxy is 100% focused on clinic management software, with all development resources dedicated to improving the clinic and doctor experience.' },
    { title: 'Complex Implementation', competitor: "Practo's implementation can take weeks and requires extensive training sessions for staff to become proficient.", doxxy: "Doxxy's intuitive interface can be learned in hours, not days, with most practices fully operational within 48 hours." },
    { title: 'Limited Customization', competitor: 'Practo offers limited customization options for workflows and forms, forcing clinics to adapt to their system.', doxxy: 'Doxxy provides flexible templates and customizable workflows that adapt to your existing processes, not the other way around.' },
    { title: 'Expensive Add-ons', competitor: 'Many essential features in Practo require additional payments beyond the base subscription.', doxxy: "All features are included in Doxxy's simple per-consultation pricing with no hidden costs or premium tiers." },
  ],
  testimonialItems: [
    { quote: 'After using Practo for two years, we switched to Doxxy and immediately noticed the difference in usability. Our staff required minimal training, and the pay-per-consultation model has saved us nearly 35% on monthly costs.', name: 'Dr. Vikram Mehta', clinic: 'Mehta Family Clinic, Mumbai', photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop' },
    { quote: "The biggest advantage of Doxxy over Practo is the pricing transparency. With Practo, we were constantly surprised by additional charges for features we thought were included. Doxxy's all-inclusive pricing is refreshingly simple.", name: 'Dr. Ananya Gupta', clinic: 'Wellness Pediatrics, Bangalore', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop' },
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
    { feature: 'Customizable Templates', doxxy: true, competitor: 'Limited' },
    { feature: 'Implementation Time', doxxy: '1-3 Days', competitor: '2-4 Weeks' },
  ],
  migrationSteps: [
    { title: 'Data Export Assistance', description: "We'll help you export your patient records, appointment history, and other data from Practo." },
    { title: 'Data Mapping & Import', description: "Our team maps your Practo data to Doxxy's format and imports it with careful verification." },
    { title: 'Streamlined Training', description: "Brief training sessions for your staff to quickly learn Doxxy's intuitive interface." },
    { title: 'Parallel Operation Support', description: 'Run both systems side by side during transition to ensure no disruption to your practice.' },
  ],
  migrationImageSrc: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=500&fit=crop',
  coreDifferences: {
    sectionTitle: 'Core Philosophical Differences',
    sectionSubtitle: 'Understanding the fundamental differences in approach between Doxxy and Practo.',
    doxxy: { title: "Doxxy's Approach", subtitle: 'Clinic-First Software', points: ['Built exclusively for clinic management with all resources focused on improving the clinic experience', 'Transparent, usage-based pricing aligned with clinic growth', 'Designed for ease of use with minimal training requirements', 'Flexible workflows that adapt to your existing processes'] },
    competitor: { title: "Practo's Approach", subtitle: 'Marketplace-First Platform', points: ['Primary focus on patient marketplace with clinic software as secondary offering', 'Complex pricing structure with multiple variables and tiers', 'Steep learning curve requiring extensive training', 'Rigid workflows requiring clinics to adapt their processes'] },
  },
};

export default practoConfig;
