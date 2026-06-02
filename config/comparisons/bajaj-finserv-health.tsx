// Path: config/comparisons/bajaj-finserv-health.tsx
import React from 'react';
import {
  DollarSign, Building2, Shield, FileText, Users,
  Clock, Layers, CreditCard,
} from 'lucide-react';
import type { ComparisonConfig } from './types';
import { sharedMigrationSteps, sharedMigrationImage } from './types';

const bajajFinservHealthConfig: ComparisonConfig = {
  slug: 'bajaj-finserv-health',
  competitorName: 'Bajaj Finserv Health',
  heroSubtitle: "Understand why purpose-built clinic software like Doxxy delivers a better daily operational experience than Bajaj Finserv Health's fintech-healthcare hybrid platform.",
  keyDifferencesSubtitle: 'How Doxxy compares to Bajaj Finserv Health across product focus, clinic workflows, and operational depth.',
  migrationSubtitle: 'Switching from Bajaj Finserv Health to Doxxy is simple and hassle-free. Our migration specialists handle the entire process:',
  comparisonPoints: [
    { feature: 'Product Nature', doxxy: 'Purpose-built clinic management software', competitor: 'Fintech platform with healthcare features bolted on', advantage: 'Software designed for clinics, not adapted from a financial product', icon: <Building2 className="h-6 w-6 text-primary" /> },
    { feature: 'Pricing Model', doxxy: 'Pay-per-consultation (₹10/consultation, first 100 free)', competitor: 'Subscription plans often bundled with financial products', advantage: 'Pay for software, not bundled financial services you may not need', icon: <DollarSign className="h-6 w-6 text-primary" /> },
    { feature: 'Core Focus', doxxy: 'Daily clinic operations and patient care workflows', competitor: 'EMI financing, health insurance, and health loans', advantage: 'Software that optimizes your clinical workflow, not your financing options', icon: <CreditCard className="h-6 w-6 text-primary" /> },
    { feature: 'Clinic Workflow Depth', doxxy: 'Deep operational features: queue management, token display, pharmacy, lab integration', competitor: 'Basic EMR and appointment scheduling as add-on to financial services', advantage: 'Complete clinic toolkit vs partial feature set', icon: <Layers className="h-6 w-6 text-primary" /> },
    { feature: 'Doctor Limits', doxxy: 'Unlimited doctors, unlimited staff accounts', competitor: 'Per-user licensing model', advantage: 'No per-seat costs, add your entire team freely', icon: <Users className="h-6 w-6 text-primary" /> },
    { feature: 'Data Privacy', doxxy: 'Your clinical data stays in your clinic management system', competitor: 'Clinical data may be used for financial product cross-selling', advantage: 'Patient data used only for care, not for selling loans or insurance', icon: <Shield className="h-6 w-6 text-primary" /> },
    { feature: 'Contract Terms', doxxy: 'No contracts, no lock-in, cancel anytime', competitor: 'Often tied to financial product agreements with lock-in periods', advantage: 'Software freedom without financial entanglement', icon: <Clock className="h-6 w-6 text-primary" /> },
    { feature: 'Patient Records', doxxy: 'Comprehensive clinical EMR built for medical decision-making', competitor: 'Basic records with emphasis on financial eligibility data', advantage: 'Records optimized for patient care, not credit assessment', icon: <FileText className="h-6 w-6 text-primary" /> },
  ],
  painPointItems: [
    { title: 'Software as a Financial Distribution Channel', competitor: "Bajaj Finserv Health's platform is fundamentally a channel to distribute Bajaj's financial products — health EMI cards, insurance plans, and medical loans. The clinic software is the hook, not the product.", doxxy: 'Doxxy has no financial products to sell. No loans, no insurance, no EMI cards. Our only business is building software that makes your clinic run better. Your success is our only metric.' },
    { title: 'Shallow Daily Operations Features', competitor: "Bajaj Finserv Health covers the basics — appointments and basic EMR — but lacks the depth clinics need daily: queue management, token displays, pharmacy inventory, lab report tracking, and multi-user role-based workflows.", doxxy: 'Doxxy goes deep on daily operations. Token displays for patient queues. Pharmacy with stock alerts. Lab report upload and tracking. Role-based interfaces for receptionists, doctors, and pharmacists. Every feature is built for a real clinic workflow.' },
    { title: 'Patient Data Used for Cross-Selling', competitor: "When you use Bajaj Finserv Health, patient financial profiles and treatment histories can be used to target patients with loan offers, insurance upgrades, and EMI plans — eroding patient trust in your clinic's data practices.", doxxy: 'Doxxy never mines your patient data for financial product targeting. Your patient records are used for one purpose only: delivering better healthcare. This is a hard policy, not a marketing promise.' },
    { title: 'Financial Product Bundling Creates Lock-In', competitor: "Many Bajaj Finserv Health deployments are bundled with financing agreements — equipment loans, working capital facilities, or insurance partnerships. Leaving the software can mean untangling financial contracts.", doxxy: 'Doxxy is pure software with no financial strings attached. No loans, no bundled insurance, no equipment financing contracts. You can leave anytime with zero financial consequences.' },
    { title: 'Limited Customization for Clinical Workflows', competitor: "The platform's templates and workflows are generalized to serve a wide range of healthcare providers, from solo doctors to corporate chains, with minimal ability to adapt to your specific specialty or practice style.", doxxy: 'Doxxy offers specialty-specific templates, customizable prescription formats, flexible billing workflows, and configurable patient intake forms. Your clinic runs your way, not the platform\'s way.' },
  ],
  testimonialItems: [
    { quote: 'Bajaj Finserv Health felt more like a financing tool than clinic software. The appointment module was basic, and there was constant pressure to offer their health EMI card to our patients. Doxxy is refreshingly different — it is pure clinic software that respects our patient relationships.', name: 'Dr. Rajat Agarwal', clinic: 'Agarwal Dental & Implant Centre, Jaipur', photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop' },
    { quote: 'We switched from Bajaj Finserv Health because we needed real clinic management, not a financial services portal. Doxxy\'s pharmacy module, queue management, and WhatsApp integration handle everything our 15-person team needs daily. Our operations are noticeably smoother.', name: 'Dr. Priyanka Sharma', clinic: 'Sharma Healthcare Multispecialty, Indore', photo: 'https://images.unsplash.com/photo-1594824204175-b70147e9cbc5?w=100&h=100&fit=crop' },
  ],
  featureComparisonRows: [
    { feature: 'Appointment Scheduling', doxxy: true, competitor: true },
    { feature: 'Electronic Medical Records', doxxy: true, competitor: 'Basic' },
    { feature: 'Purpose-Built Clinic Software', doxxy: true, competitor: false },
    { feature: 'Queue Management & Token Display', doxxy: true, competitor: false },
    { feature: 'Pharmacy & Inventory Module', doxxy: true, competitor: false },
    { feature: 'WhatsApp Integration', doxxy: true, competitor: false },
    { feature: 'Unlimited Doctors & Staff', doxxy: true, competitor: false },
    { feature: 'Multi-Clinic Management', doxxy: true, competitor: false },
    { feature: 'No Financial Product Cross-Selling', doxxy: true, competitor: false },
    { feature: 'No Long-Term Contracts', doxxy: true, competitor: false },
    { feature: 'Free Plan (First 100 Consultations)', doxxy: true, competitor: false },
    { feature: 'Full Patient Data Privacy', doxxy: true, competitor: false },
  ],
  migrationSteps: sharedMigrationSteps('Bajaj Finserv Health'),
  migrationImageSrc: sharedMigrationImage,
  coreDifferences: {
    sectionTitle: 'Core Philosophical Differences',
    sectionSubtitle: 'Understanding the fundamental differences in approach between Doxxy and Bajaj Finserv Health.',
    doxxy: { title: "Doxxy's Approach", subtitle: 'Clinic Software, Nothing Else', points: ['100% focused on building software that makes daily clinic operations faster, smoother, and more organized', 'Your patient data is sacred — never mined, never cross-referenced, never used beyond delivering care', 'Deep operational features built from observing real Indian clinic workflows: queues, tokens, pharmacy, billing', 'No financial products, no loans, no insurance — we earn your business purely through the quality of our software'] },
    competitor: { title: "Bajaj Finserv Health's Approach", subtitle: 'Fintech Platform with Healthcare Features', points: ['Core business is financial services — health loans, EMI cards, insurance — with clinic software serving as a distribution channel', 'Patient data exists within a financial ecosystem where treatment information can be used for credit and insurance profiling', 'Clinic management features are thin — sufficient to attract clinics to the platform but not deep enough for serious daily operations', 'Bundled financial agreements create lock-in, making it difficult to separate software choice from financing decisions'] },
  },
};

export default bajajFinservHealthConfig;
