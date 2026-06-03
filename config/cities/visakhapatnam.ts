// Path: config/cities/visakhapatnam.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'visakhapatnam',
  cityName: 'Visakhapatnam',
  state: 'Andhra Pradesh',
  heroTitle: 'Visakhapatnam Clinic Management Software — Digital-Ready for the Port City',
  heroSubtitle:
    'Visakhapatnam\'s 5,000+ clinics — spread across Dwaraka Nagar, MVP Colony, Gajuwaka, and Madhurawada — serve a fast-growing port city where the naval base, pharma corridor, and IT startups converge. With only 10% software adoption but 90% WhatsApp reach, Vizag clinics need a digital bridge. Doxxy is that bridge.',
  problemTitle: 'Why Vizag\'s Expanding Clinic Sector Needs a Digital Foundation',
  problemDescription:
    'Visakhapatnam is undergoing the fastest urban expansion in coastal Andhra. Madhurawada and Rushikonda — farmland a decade ago — now house IT parks, gated communities, and a growing population of young professionals. Gajuwaka and the steel plant corridor have a dense industrial workforce. MVP Colony and Dwaraka Nagar remain the established commercial and healthcare hubs. The result is a clinic sector stretched across a linear 40-kilometre city with disconnected patient populations. A patient in Madhurawada who books at a Dwaraka Nagar specialist must navigate 15 kilometres of city traffic — and when they do not show up, the clinic has no systematic way to recover that slot. Vizag\'s 27% no-show rate is among the highest in Andhra, driven by geographic spread and inadequate reminder systems. Most clinics still use paper registers, with receptionists manually calling patients the night before — a practice that collapses at scale. The Andhra Pradesh Private Medical Care Establishments Act mandates specific record-keeping, and with ABDM adoption targets approaching, clinics face a compliance gap they are not equipped to close with paper. The city\'s Telugu-speaking majority adds a language dimension: prescriptions and patient communication must work in Telugu script or risk excluding older patients and those from rural catchment areas. Vizag clinics need a platform that solves for geography, language, compliance, and the economics of a mid-size coastal city.',
  clinicStats: {
    estimatedClinics: '5,000+',
    avgPatientsPerDay: '30-45',
    softwareAdoptionRate: '10%',
    abdmComplianceRate: '11%',
    paperUsageRate: '82%',
    specialtyMix: '30% general practice, 18% multispecialty, 18% dental, 12% dermatology, 10% orthopaedics, 12% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹500-700',
    avgMonthlyRevenue: '₹5L - ₹8L',
    avgNoShowRate: '27%',
    estimatedMonthlyLossToNoShows: '₹1.3L - ₹2L per month',
    avgBillingErrorRate: '6-9%',
  },
  techContext: {
    whatsappPenetration: '90%',
    digitalPaymentAdoption: '62%',
    internetPenetration: '74%',
  },
  regulatoryNotes:
    'Visakhapatnam clinics are regulated under the Andhra Pradesh Private Medical Care Establishments (Registration and Regulation) Act and the Greater Visakhapatnam Municipal Corporation (GVMC) health department. The state mandates a minimum 3-year record retention period for outpatient cases. Andhra Pradesh was among the early adopters of ABDM, and clinics in urban centres like Visakhapatnam and Vijayawada are being prioritised for compliance drives. The GVMC has been digitising health establishment registrations, making digital record-keeping increasingly linked to licence renewals.',
  solutionTitle: 'Doxxy for Visakhapatnam: Telugu-First, Cloud-Based, and Built for a Linear City',
  solutionDescription:
    'Doxxy solves Vizag\'s three structural problems: geography, language, and compliance. QR-code check-in eliminates paper registration and drops new-patient processing from 5 minutes to under a minute — critical when walk-in traffic is high and staff is limited. WhatsApp reminders in Telugu, Hindi, and English target the 27% no-show rate with automated 24-hour and 2-hour nudges, recovering revenue that was literally stuck in traffic. Digital prescriptions in Telugu script serve the patients who need it, while English and Hindi templates serve the IT and naval communities. UPI billing with Telugu-language invoices and WhatsApp payment links stops the 6-9% billing leakage. And with GVMC and ABDM compliance built in, the inspection that used to be a crisis becomes a two-click report.',
  keyFeatures: [
    {
      icon: 'smartPhone',
      title: 'QR-Code Check-In in Telugu, Hindi & English',
      description:
        'Patients scan a QR code at reception and complete a 4-field intake form on their phone in their preferred language — Telugu, Hindi, or English. Returning patients check in with a single WhatsApp tap. Registration drops from 5 minutes to under a minute. For clinics near the railway station and RTC Complex with high walk-in volume, this eliminates the reception bottleneck entirely.',
    },
    {
      icon: 'messageSquare',
      title: 'Automated WhatsApp Reminders Across 40 Kilometres',
      description:
        'Vizag\'s linear geography — from Gajuwaka in the south to Madhurawada in the north — means patients travel 10-20 kilometres for appointments. When they miss, the slot is lost forever. Doxxy sends WhatsApp reminders 24 hours and 2 hours before each appointment, with one-tap confirm or reschedule. Clinics using this feature reduce no-shows from 27% to under 17% within two months.',
    },
    {
      icon: 'fileText',
      title: 'Telugu-Script Digital Prescriptions',
      description:
        'Generate prescriptions in Telugu, Hindi, or English using specialty-specific templates. For clinics serving elderly patients and those from rural mandals around Vizag (Anakapalle, Pendurthi, Bheemunipatnam), Telugu-script prescriptions are not a nice-to-have — they are essential for patient compliance. Templates are pre-filled by specialty, cutting prescription time from 3 minutes to under 45 seconds.',
    },
    {
      icon: 'creditCard',
      title: 'UPI Billing & Leakage Prevention',
      description:
        'Auto-generated itemised invoices with UPI QR at checkout. WhatsApp payment links for remote follow-up payments. Billing validation catches the 6-9% of charges missed in manual billing — the ₹100 injection fee, the ₹200 dressing charge, the ₹150 procedure tray. For a Vizag clinic billing ₹6L monthly, stopping that leakage recovers ₹36,000-₹54,000 every month.',
    },
    {
      icon: 'shield',
      title: 'AP Medical Establishments Act & GVMC Compliance',
      description:
        'All records digitally timestamped, access-controlled, and retained for the state-mandated minimum period. Auto-generated statutory registers compliant with the AP Private Medical Care Establishments Act. ABHA ID integration for ABDM compliance. GVMC inspection-ready documentation produced in two clicks.',
    },
    {
      icon: 'trendingUp',
      title: 'Slot Recovery & Waitlist for Missed Appointments',
      description:
        'When a patient confirms via WhatsApp that they will not make it, Doxxy instantly releases the slot to a waitlist — a list of patients who asked for an earlier appointment. No empty slots, no wasted revenue. In a city where geography drives high no-shows, waitlist-based slot recovery is the single highest-ROI feature for a Vizag clinic.',
    },
  ],
  whyDoxxyInThisCity:
    'Visakhapatnam is at a digital tipping point. 90% WhatsApp penetration means the patient communication channel is already in every pocket. 62% UPI adoption means digital billing is not a behaviour change — it is already how patients pay for chai, auto rides, and groceries. Yet 82% of Vizag clinics still run on paper, largely because existing clinic software does not speak Telugu and was not built for the economics of a tier-2 city. Doxxy changes that. Telugu-first across every patient touchpoint. Cloud-based — no server, no IT hire. ₹10 per consultation after the first 100 free — a pricing model that aligns with Vizag clinic economics. For a city growing as fast as Visakhapatnam — new apartments in Madhurawada, new pharma units in Parawada, new startups at Rushikonda — Doxxy gives clinics the digital foundation to scale without the growing pains.',
  testimonials: [
    {
      quote:
        'My clinic in Dwaraka Nagar has patients coming from as far as Anakapalle and Simhachalam — 25-30 kilometres. Before Doxxy, my receptionist spent two hours daily on phone calls reminding people. Half still did not show up. After switching, our no-show rate dropped from 30% to 14%. The WhatsApp waitlist feature is genius — cancelled slots fill within minutes.',
      name: 'Dr. Ravi Teja',
      clinic: 'Teja Clinic, Dwaraka Nagar, Visakhapatnam',
      photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop',
    },
    {
      quote:
        'I run a dermatology practice near MVP Colony. Most of my patients are women in their 30s-50s who prefer Telugu communication. Doxxy sends their reminders, prescriptions, and post-care instructions in Telugu. They actually follow the treatment plan now. My product and procedure revenue has gone up because patients complete their prescribed courses instead of dropping off after the first visit.',
      name: 'Dr. Lakshmi Devi',
      clinic: 'Devi Skin & Aesthetics, MVP Colony, Visakhapatnam',
      photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'Does Doxxy support Telugu for prescriptions and patient communication?',
      answer:
        'Yes, Telugu is fully supported across Doxxy. Patient intake forms, prescriptions, WhatsApp reminders, appointment confirmations, post-care instructions, and billing receipts can all be delivered in Telugu script. Language preference is set per patient and applied automatically. For Visakhapatnam clinics — where a majority of patients prefer Telugu — this means every patient interaction happens in the language they are most comfortable with. Hindi and English are also fully supported, and doctors can switch prescription language per patient at the point of care.',
    },
    {
      question: 'How does Doxxy handle the geographical spread of patients across Vizag?',
      answer:
        'Doxxy\'s WhatsApp-based queue and reminder system is designed specifically for geographically spread-out cities. Patients receive their token number and live queue position on WhatsApp, so they can time when to leave home. For a patient in Madhurawada with a 10:30 AM appointment in Dwaraka Nagar, knowing they are still 6 tokens away means they do not need to sit in traffic for 45 minutes to kill time in a waiting room. Automated 24-hour and 2-hour reminders cut no-shows. And the waitlist feature means when a patient cancels, the slot fills instantly from a queue of patients who wanted an earlier time.',
    },
    {
      question: 'Is Doxxy compliant with the AP Private Medical Care Establishments Act?',
      answer:
        'Yes. Doxxy maintains records in compliance with the Andhra Pradesh Private Medical Care Establishments (Registration and Regulation) Act. All patient records are digitally timestamped, access-controlled, and retained for the state-mandated minimum period (3 years for outpatient records). Statutory registers required by the GVMC health department are auto-generated. ABHA ID creation and linking is built into registration for ABDM compliance. During GVMC inspections, clinics can produce a full compliance report in two clicks.',
    },
    {
      question: 'My clinic is in Gajuwaka, with many patients from the steel plant and port — does Doxxy handle industrial health documentation?',
      answer:
        'Yes. Doxxy includes templates for occupational health documentation commonly required for industrial workforces — pre-employment health checks, periodic medical examinations, workplace injury reports, and fitness-for-duty certificates. These are in the formats that employers in the Vizag steel plant corridor, port area, and pharma units expect from referring clinics. Reports are generated in under 2 minutes, with relevant fields pre-filled from the patient record.',
    },
    {
      question: 'What does Doxxy cost for a clinic in Visakhapatnam?',
      answer:
        'Doxxy\'s pricing is straightforward: the first 100 consultations per month are completely free. Beyond the free tier, it is ₹10 per consultation with no monthly minimum, no setup fee, and no hardware purchase required. For a typical single-doctor clinic in Vizag seeing 25-35 patients per day, the monthly cost is approximately ₹4,000-₹5,500. The cost is recovered by preventing just one no-show per day (₹500-₹700 per consultation) or by catching 5% of billing leakage on a ₹6L monthly practice (₹30,000). Doxxy is not a cost centre — it is a revenue protection tool that pays for itself, often within the first week.',
    },
  ],
}

export default config
