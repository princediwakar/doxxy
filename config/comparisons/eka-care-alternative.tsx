import React from 'react';
import { Check, ArrowRight, Calendar, Clock, Coins, Users, Building2, MessageSquare } from 'lucide-react';
import type { AlternativeConfig } from './types';

const ekaCareAlternativeConfig: AlternativeConfig = {
  slug: 'eka-care-alternative',
  competitorName: 'Eka Care',
  heroSubtitle: 'Discover why healthcare practices are switching from Eka Care to Doxxy for more flexible pricing, unlimited doctors, and a more comprehensive feature set.',
  migrationSubtitle: 'Switching from Eka Care to Doxxy is easier than you think. Our team handles the entire process:',
  whyChooseItems: [
    { icon: <Coins className="h-12 w-12 text-primary" />, title: 'Pay-Per-Consultation Pricing', description: "Unlike Eka Care's fixed monthly fees, Doxxy charges only for the consultations you actually complete. Start with 100 free consultations and then pay just ₹10 per consultation." },
    { icon: <Users className="h-12 w-12 text-success" />, title: 'Unlimited Doctors & Staff', description: "Eka Care charges per doctor, limiting your practice's growth. Doxxy allows unlimited doctors and staff members on all plans, including our free tier." },
    { icon: <Building2 className="h-12 w-12 text-purple-600" />, title: 'Multi-Clinic Management', description: 'Manage multiple clinic locations from a single dashboard without paying premium fees. Eka Care restricts this feature to higher-tier plans only.' },
    { icon: <Calendar className="h-12 w-12 text-orange-600" />, title: 'Smart Appointment Scheduling', description: "Doxxy's intelligent scheduling system prevents double-bookings, sends automatic reminders, and allows patients to book online - all included in the base price." },
  ],
  reasonsToSwitch: [
    { icon: <Coins className="h-6 w-6 text-primary" />, title: 'Cost Savings', description: 'Practices that switch from Eka Care to Doxxy report average savings of 30-40% on their healthcare management software costs.' },
    { icon: <Users className="h-6 w-6 text-success" />, title: 'No Growth Penalties', description: "Eka Care charges more as you add doctors. Doxxy's pricing is based solely on appointments, so your practice can grow without software cost penalties." },
    { icon: <Check className="h-6 w-6 text-purple-600" />, title: 'All Features Included', description: 'No feature restrictions or premium tiers. All Doxxy users get access to the complete platform, including advanced analytics and multi-clinic management.' },
    { icon: <Clock className="h-6 w-6 text-orange-600" />, title: 'No Long-Term Contracts', description: "Unlike Eka Care's annual commitments, Doxxy has no long-term contracts. Pay monthly based on your actual usage." },
    { icon: <MessageSquare className="h-6 w-6 text-destructive" />, title: 'Better Patient Experience', description: "Doxxy's patient portal and communication tools are more intuitive and feature-rich than Eka Care's basic offering." },
    { icon: <ArrowRight className="h-6 w-6 text-indigo-600" />, title: 'Dedicated Migration Support', description: 'Our team will help you transition from Eka Care to Doxxy with minimal disruption to your practice.' },
  ],
  testimonialItems: [
    { quote: 'We were paying nearly ₹5000 per month with Eka Care because we had 4 doctors. With Doxxy, we\'re saving at least ₹2000 monthly while getting more features.', name: 'Dr. Amit Verma', clinic: 'City Health Clinic, Delhi', photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop' },
    { quote: "The unlimited doctors feature alone made switching to Doxxy worth it. As we've grown from 2 to 6 doctors, our software costs have remained predictable.", name: 'Dr. Sunita Reddy', clinic: 'Wellness Multispecialty, Chennai', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop' },
  ],
  featureComparisonRows: [
    { feature: 'Pricing Model', doxxy: 'Pay-per-consultation', competitor: 'Monthly subscription' },
    { feature: 'Doctor Limits', doxxy: 'Unlimited on all plans', competitor: 'Pay per doctor' },
    { feature: 'Free Plan', doxxy: '100 consultations free', competitor: 'Limited time trial only' },
    { feature: 'Contract Length', doxxy: 'No commitment', competitor: 'Annual contract' },
    { feature: 'Multi-Clinic Management', doxxy: 'All plans', competitor: 'Premium plans only' },
    { feature: 'Patient SMS Notifications', doxxy: 'Included', competitor: 'Additional fee' },
    { feature: 'WhatsApp Integration', doxxy: 'Included', competitor: 'Additional fee' },
    { feature: 'Advanced Analytics', doxxy: 'All plans', competitor: 'Premium plans only' },
  ],
  migrationSteps: [
    { title: 'Schedule a Demo', description: 'See how Doxxy works and how it compares to your current Eka Care experience.' },
    { title: 'Plan Your Migration', description: 'Our team will create a customized migration plan for your practice data.' },
    { title: 'Data Transfer', description: "We'll handle the export from Eka Care and import into Doxxy." },
    { title: 'Staff Training', description: 'Comprehensive training for your entire team on the new system.' },
    { title: 'Go Live', description: 'Switch over to Doxxy with continued support during the transition.' },
  ],
  faqs: [
    { question: 'How difficult is it to migrate from Eka Care to Doxxy?', answer: 'Migration is straightforward with our dedicated migration team. We handle the data export, import, and verification process. Most practices are up and running on Doxxy within 1-2 weeks with no disruption to patient care.' },
    { question: 'Will I lose any features by switching from Eka Care?', answer: 'No. Doxxy includes all the features available in Eka Care and adds several improvements, including unlimited doctors, better patient communication tools, and more flexible reporting.' },
    { question: 'How much can I expect to save by switching?', answer: 'Savings vary based on your practice size and appointment volume, but clinics with multiple doctors typically save 30-40% compared to Eka Care\'s doctor-based pricing model.' },
    { question: 'Can I try Doxxy before fully committing?', answer: 'Yes! Our Practice Essentials plan gives you 100 free consultations to fully test the system. You can even run Doxxy alongside Eka Care during your evaluation period.' },
  ],
};

export default ekaCareAlternativeConfig;
