// Path: config/cities/bangalore.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'bangalore',
  cityName: 'Bangalore',
  state: 'Karnataka',
  heroTitle: 'Bangalore Clinic Management Software — India\'s Most Tech-Ready Healthcare Market',
  heroSubtitle:
    'Bangalore\'s 20,000+ clinics lead India in digital adoption — 25% already use software, 85% accept digital payments, and 96% of patients are on WhatsApp. Doxxy gives Bangalore\'s tech-savvy clinics a platform that matches their ambition.',
  problemTitle: 'Why Even Bangalore\'s Tech-Forward Clinics Are Held Back by Fragmented Tools',
  problemDescription:
    'Bangalore should be the easiest city in India to run a digital clinic. It has the country\'s highest software adoption rate (25%), the highest digital payment penetration (85%), and a patient population — heavy with IT professionals, startup founders, and corporate employees — that expects digital-first experiences. Yet even in Bangalore, most clinics operate with a patchwork of disconnected tools: one app for appointments, a WhatsApp Business account for patient chat, a Tally or Excel sheet for billing, Google Drive for lab reports, and a physical register for the things none of the above can handle. The result is a clinic that looks digital on the surface (patients book on Practo, pay by UPI, receive WhatsApp messages) but is operationally fragmented underneath — records live in five different systems, no single source of truth exists, and the doctor cannot see a patient\'s complete history without opening three different apps. This fragmentation is most painful in Bangalore\'s specialty-heavy clinic profile: a patient visiting a dermatologist in Koramangala for acne treatment has likely seen a general physician in Jayanagar and had lab work done at a diagnostic centre in Indiranagar — none of which talks to the dermatologist\'s system. The Karnataka Medical Council has been increasing documentation requirements, and ABDM compliance deadlines are approaching. Bangalore clinics need consolidation, not another standalone app. They need a unified platform that brings appointments, records, billing, lab reports, and patient communication into a single system — designed for the way Bangalore clinics actually operate.',
  clinicStats: {
    estimatedClinics: '20,000+',
    avgPatientsPerDay: '35-55',
    softwareAdoptionRate: '25%',
    abdmComplianceRate: '28%',
    paperUsageRate: '55%',
    specialtyMix: '30% multispecialty, 20% dermatology, 18% dental, 12% general practice, 20% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹900-1,300',
    avgMonthlyRevenue: '₹11L - ₹17L',
    avgNoShowRate: '24%',
    estimatedMonthlyLossToNoShows: '₹3L - ₹4L per month',
    avgBillingErrorRate: '5-8%',
  },
  techContext: {
    whatsappPenetration: '96%',
    digitalPaymentAdoption: '85%',
    internetPenetration: '92%',
  },
  regulatoryNotes:
    'Bangalore clinics are regulated by the Karnataka Private Medical Establishments (KPME) Act and the Karnataka Medical Council. The KPME Act mandates specific registration, documentation, and display requirements for all private clinics. Karnataka has been one of the more proactive states in ABDM adoption, with the state health department running digital health initiatives that set expectations for private clinics. Clinics in Bangalore municipal corporation limits have additional waste management and fire safety compliance requirements.',
  solutionTitle: 'Doxxy for Bangalore: Unified Platform for Tech-Ready Clinics',
  solutionDescription:
    'Doxxy consolidates Bangalore clinics\' fragmented tools into a single, unified platform. Instead of Practo for bookings + WhatsApp for chat + Excel for billing + Google Drive for reports + a paper register for compliance, clinics get one system that does all of it — with a single patient record at the centre. Appointments booked online auto-populate the EMR. WhatsApp reminders and queue updates go out automatically. UPI billing generates invoices and tracks payments. Lab reports shared via WhatsApp are auto-filed into the patient\'s record. ABDM compliance is built in, not bolted on. For Bangalore\'s tech-forward clinics, Doxxy is not another tool to manage — it is the platform that replaces the patchwork.',
  keyFeatures: [
    {
      icon: 'link',
      title: 'Unified Patient Record — One Source of Truth',
      description:
        'Appointments, clinical notes, prescriptions, lab reports, billing, and WhatsApp communications — all linked to a single patient record. No more opening Practo for the appointment time, a separate EMR for the clinical note, and Gmail to find the lab report. One search, one patient, one complete history. This is what Bangalore clinics have been trying to build with fragmented tools.',
    },
    {
      icon: 'messageSquare',
      title: 'WhatsApp Integration Across the Full Patient Journey',
      description:
        'With 96% WhatsApp penetration in Bangalore, Doxxy uses WhatsApp as the primary patient communication channel. Appointment booking confirmations, 24-hour and 2-hour reminders, live queue position updates, digital prescriptions, lab reports, post-consultation instructions, and follow-up reminders — all on WhatsApp. Patients never need to download an app or remember a login.',
    },
    {
      icon: 'creditCard',
      title: 'UPI-First Billing with 85% Adoption-Ready Workflow',
      description:
        'Bangalore leads India in digital payments at 85% adoption. Doxxy\'s billing workflow is UPI-first: auto-generated invoice with QR code at checkout, WhatsApp payment links for remote settlement, and automated payment reconciliation. Built-in charge validation catches the undercharges that manual billing misses — protecting the 5-8% of monthly revenue that Bangalore clinics currently leak to billing errors.',
    },
    {
      icon: 'trendingUp',
      title: 'Advanced Analytics & Practice Intelligence',
      description:
        'Bangalore clinic owners are data-driven. Doxxy provides analytics that go beyond basic patient counts: revenue per specialty, average revenue per patient trended over time, no-show rate by day of week and time slot, patient acquisition source tracking (walk-in vs online vs referral), procedure mix analytics, and profitability by consultation type. Designed for the clinic owner who wants to run their practice like a business.',
    },
    {
      icon: 'shield',
      title: 'KPME & ABDM Compliance Built In',
      description:
        'Auto-generated registers compliant with the Karnataka Private Medical Establishments Act. ABHA ID creation and linking at registration. Audit-ready documentation for KMC inspections. As Karnataka pushes ABDM adoption, Doxxy keeps Bangalore clinics ahead of compliance deadlines — no scrambling when the notice arrives.',
    },
    {
      icon: 'flaskConical',
      title: 'Lab & Diagnostic Integration',
      description:
        'Bangalore has one of India\'s densest diagnostic lab networks — patients routinely get tests done at different centres than where they consult. Doxxy\'s lab integration lets clinics receive reports digitally and auto-file them into the patient record. Reports can be forwarded to the patient\'s WhatsApp with a single tap. No more "we emailed you the report three weeks ago, can you forward it again?"',
    },
  ],
  whyDoxxyInThisCity:
    'Bangalore is India\'s most tech-ready healthcare market — 25% software adoption, 85% digital payments, 96% WhatsApp penetration. Yet most clinics run on fragmented tools that create more work than they eliminate. Doxxy consolidates the patchwork into a single platform, giving Bangalore clinics what they have been trying to cobble together with 4-5 different apps. For clinic owners who are tired of juggling tools, Doxxy is the unification they have been waiting for. And with Karnataka pushing ABDM adoption aggressively, Doxxy\'s compliance toolkit keeps clinics ahead of regulatory requirements.',
  testimonials: [
    {
      quote:
        'I was using three different apps — one for appointments, one for billing, and WhatsApp for patient messages. Nothing talked to each other. Doxxy brought everything into one place. Now when a patient books online, their record is ready before they walk in. Billing is a single tap. Reports go to their WhatsApp automatically. I did not realise how much time the fragmentation was costing me until Doxxy eliminated it.',
      name: 'Dr. Ramesh Krishnan',
      clinic: 'Koramangala Medical Centre, Bangalore',
      photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop',
    },
    {
      quote:
        'As a dermatologist in Indiranagar, photo documentation is everything. Before Doxxy, I had patient photos scattered across my phone, a clinic iPad, and a Google Drive folder — finding a baseline photo from six months ago was a treasure hunt. Doxxy\'s structured photo documentation changed my practice. Side-by-side before-and-after comparison in seconds. My treatment plan compliance rate went up because patients can actually see their progress.',
      name: 'Dr. Ananya Subramanian',
      clinic: 'Skin Deep Dermatology, Indiranagar',
      photo: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'Does Doxxy integrate with Practo and other booking platforms Bangalore clinics use?',
      answer:
        'Doxxy includes its own patient-facing online booking page that can be shared via WhatsApp, QR code, or website link. For clinics currently listed on Practo or other platforms, Doxxy can serve as your primary clinic management system while you maintain your Practo listing. Appointments booked externally can be quickly entered into Doxxy via the fast-registration workflow. Many Bangalore clinics eventually find that Doxxy\'s integrated booking + EMR + billing workflow eliminates the need for external booking platforms entirely, saving the 15-20% commission those platforms charge.',
    },
    {
      question: 'How does Doxxy handle the high dermatology and specialty mix in Bangalore?',
      answer:
        'Bangalore has an unusually high concentration of dermatology clinics (20% of the market versus 10-12% nationally), driven by demand from the city\'s young, appearance-conscious professional population. Doxxy provides specialty-specific workflows including structured photo documentation with side-by-side comparison, treatment progress tracking for chronic conditions (acne, psoriasis, eczema), cosmetic procedure scheduling with consent and photo timelines, and automated follow-up reminders. These specialty workflows are available across all supported specialties — dermatology, dental, ophthalmology, ENT, orthopaedics, gynaecology, paediatrics, and general medicine.',
    },
    {
      question: 'Is Doxxy compliant with the Karnataka Private Medical Establishments Act?',
      answer:
        'Yes. Doxxy maintains all records in formats compliant with the KPME Act and Karnataka Medical Council requirements. The platform auto-generates the mandatory registers prescribed under the Act, including the patient register, procedure log, and prescription records with complete audit trails. For clinics undergoing KMC or KPME inspections, Doxxy produces a complete compliance package in minutes rather than days. The platform also supports ABHA ID creation and linking for ABDM compliance as Karnataka rolls out its digital health programme.',
    },
    {
      question: 'Can Doxxy handle the tech expectations of Bangalore\'s patient demographic?',
      answer:
        'Bangalore\'s patient base — heavy with tech professionals, startup employees, and corporate workers — expects digital-first healthcare experiences. Doxxy delivers: online self-booking, QR-code check-in (scan and fill a 30-second form on your own phone), WhatsApp-delivered prescriptions and lab reports, UPI payment with auto-generated invoices, and live queue tracking so patients do not waste time in waiting rooms. These are features Bangalore patients already expect from food delivery and cab apps — Doxxy brings that same experience standard to clinic visits.',
    },
    {
      question: 'I am opening a new clinic in Whitefield — should I start with software from day one?',
      answer:
        'Absolutely. Starting a new clinic with Doxxy from day one is the single best decision you can make for long-term operational efficiency. New clinics that start digital never develop the paper habits that are so painful to unlearn. Your patient records are structured and searchable from patient one. Your billing has an audit trail from the first invoice. Your compliance documentation is auto-generated from the start. And critically for Bangalore — where patients in areas like Whitefield, Electronic City, and Sarjapur expect tech-forward experiences — a digital-first clinic signals competence and modernity. The free tier (first 100 consultations per month free) is designed exactly for this: start digital with zero upfront cost.',
    },
  ],
}

export default config
