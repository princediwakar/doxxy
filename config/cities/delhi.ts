// Path: config/cities/delhi.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'delhi',
  cityName: 'Delhi',
  state: 'Delhi NCR',
  heroTitle: 'Delhi Clinic Management Software — Built for the Capital\'s Practices',
  heroSubtitle:
    'Delhi NCR\'s 28,000+ clinics — from Karol Bagh to Lajpat Nagar and across Noida and Gurgaon — face the highest patient volumes in India. Doxxy helps Delhi clinics cut no-shows, go paperless, and comply with DMC and ABDM regulations.',
  problemTitle: 'Why Delhi Clinics Lose ₹5 Lakh Every Month to Operational Inefficiency',
  problemDescription:
    'Delhi\'s clinics handle the highest average patient volumes in the country — 50 to 80 patients per OPD session is routine, and peak-season OPDs (October-November and February-March) can push past 100. The result is a perfect storm of operational problems. Waiting rooms overflow. A single receptionist juggles check-in, phone calls, billing, and patient queries simultaneously, and the inevitable errors — missed charges, incorrect patient details, lost follow-up slips — compound daily. Delhi\'s no-show rate of 32% is the highest among Indian metros, driven by the city\'s unpredictable traffic (a Ring Road jam can derail an entire morning schedule) and the fact that many patients travel from satellite cities — Ghaziabad, Faridabad, Bahadurgarh, Sonipat — making a "quick OPD visit" an hour-long commitment each way. The Delhi Medical Council (DMC) mandates specific documentation standards, and clinics that fail to produce records during inspections face suspension or penalty. Meanwhile, ABDM compliance requirements are rolling out, and most Delhi clinics have not started. Multi-clinic setups — a common model in Delhi where a single doctor runs OPDs in two or three locations across the NCR — face the additional complexity of fragmented patient records: a patient seen in the Karol Bagh clinic on Monday has no digital trail when they show up at the Lajpat Nagar clinic on Thursday. Delhi clinics are haemorrhaging revenue to no-shows, billing errors, and administrative overhead — and the software solutions they are being sold were designed for American clinics with 15-minute appointment slots and insurance-first billing. Delhi does not work like that.',
  clinicStats: {
    estimatedClinics: '28,000+',
    avgPatientsPerDay: '50-80',
    softwareAdoptionRate: '15%',
    abdmComplianceRate: '24%',
    paperUsageRate: '70%',
    specialtyMix: '35% multispecialty, 25% general practice, 15% dental, 10% dermatology, 15% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹700-1,000',
    avgMonthlyRevenue: '₹14L - ₹20L',
    avgNoShowRate: '32%',
    estimatedMonthlyLossToNoShows: '₹4.5L - ₹5.5L per month',
    avgBillingErrorRate: '5-8%',
  },
  techContext: {
    whatsappPenetration: '92%',
    digitalPaymentAdoption: '72%',
    internetPenetration: '82%',
  },
  regulatoryNotes:
    'Delhi clinics are regulated by the Delhi Medical Council (DMC) under the Delhi Nursing Homes Registration Act. Patient records must be maintained for a minimum of 3 years. DMC mandates specific documentation for Schedule H, H1, and X drugs. Clinics in Delhi must also comply with Biomedical Waste Management Rules (for any clinic generating medical waste including used syringes, dressings, and expired drugs). ABDM linkage is being actively pushed by the Delhi government\'s health department, with pilot programmes running in government dispensaries that will set compliance expectations for private clinics.',
  solutionTitle: 'Doxxy for Delhi: Volume-Ready, Multi-Location, DMC-Compliant',
  solutionDescription:
    'Doxxy is built for Delhi\'s OPD volumes. QR-code check-in eliminates the 3-4 minute per-patient registration bottleneck. WhatsApp reminders sent 24 hours and 2 hours before appointments directly attack Delhi\'s 32% no-show rate — clinics using this feature see no-shows drop to under 20% within two months. The multi-location dashboard gives doctors running OPDs in Karol Bagh, Lajpat Nagar, and Noida a unified view of all their clinics — patient records follow the patient, not the physical file. UPI billing with built-in validation catches the charging errors that leak 5-8% of monthly revenue. DMC-compliant documentation templates, auto-generated statutory registers, and audit-ready record exports mean regulatory inspections go from panic-inducing events to routine checkpoints.',
  keyFeatures: [
    {
      icon: 'messageSquare',
      title: 'Aggressive No-Show Reduction Engine',
      description:
        'Delhi\'s 32% no-show rate is the city\'s biggest revenue killer. Doxxy sends automated WhatsApp reminders at 24 hours, 2 hours, and — for high-value appointments — 30 minutes before the slot. One-tap confirm or reschedule. The system learns which patients are serial no-showers and can suggest double-booking or overbooking windows to maintain OPD throughput. Delhi clinics using this have cut no-shows by 35-40%.',
    },
    {
      icon: 'smartPhone',
      title: 'QR-Code Intake That Survives 100-Patient Mornings',
      description:
        'New patients scan a QR code in the waiting area and fill a 4-field form on their own phone — no receptionist involvement required. Returning patients tap a WhatsApp link to confirm arrival. Registration time per patient drops from 4 minutes to under 45 seconds. The receptionist stops being the OPD bottleneck and becomes a patient-flow manager instead.',
    },
    {
      icon: 'mapPin',
      title: 'Multi-Location Dashboard for NCR-Wide Practices',
      description:
        'For doctors running clinics in multiple Delhi locations — Karol Bagh, Lajpat Nagar, Noida, Gurgaon — Doxxy provides a unified dashboard. Patient records are centralised: a patient registered in the Karol Bagh clinic is instantly accessible in Lajpat Nagar. Revenue, patient counts, and no-show rates are broken down by location. Inventory and staff schedules can be managed centrally.',
    },
    {
      icon: 'shield',
      title: 'DMC Compliance & Statutory Register Automation',
      description:
        'Doxxy auto-generates the registers and documentation formats prescribed by the Delhi Medical Council and the Delhi Nursing Homes Registration Act. Schedule H/H1/X drug dispensing records are maintained with the audit trail DMC inspections require. When an inspection notice arrives, produce a complete compliance report in minutes — not the days of paper-searching it would otherwise require.',
    },
    {
      icon: 'creditCard',
      title: 'UPI-First Billing with Error Detection',
      description:
        'Doxxy auto-generates itemised invoices with procedure codes, consultation fees, and pharmacy charges. Built-in billing validation flags undercharges — the ₹200 injection charge that was missed, the dressing fee that slipped. In a high-volume Delhi OPD, these small errors compound into ₹40,000-₹60,000 of monthly leakage. UPI QR at checkout. WhatsApp payment links for follow-up settlements.',
    },
    {
      icon: 'fileText',
      title: 'Digital Prescriptions with Drug Interaction Checks',
      description:
        'Templates for the 50 most common prescriptions in Delhi OPDs — from a routine URTI prescription to a multi-drug diabetes-hypertension combination. Built-in drug interaction warnings for the polypharmacy that is common in Delhi\'s elderly patient population. Generated and delivered via WhatsApp in under 60 seconds. Supports Hindi, English, and Punjabi.',
    },
  ],
  whyDoxxyInThisCity:
    'Delhi clinics lose more money to no-shows than any other Indian metro — ₹4.5L to ₹5.5L per month per clinic. Doxxy\'s WhatsApp reminder engine is the single highest-ROI intervention a Delhi clinic can make: it costs less than ₹5,000/month and recovers ₹1.5L-₹2L in what would have been lost revenue. For multi-location practices that are common in the NCR, Doxxy\'s unified dashboard eliminates the fragmented-record problem. And with DMC inspections becoming more frequent and ABDM deadlines approaching, Doxxy\'s built-in compliance toolkit protects clinics from regulatory risk — a risk most Delhi clinic owners do not realise they carry until the notice arrives.',
  testimonials: [
    {
      quote:
        'I run OPDs in two locations — Karol Bagh and Lajpat Nagar. Before Doxxy, patient records from one clinic never made it to the other. A patient I saw on Monday in Karol Bagh would show up Thursday in Lajpat Nagar and I\'d have zero history. Doxxy\'s multi-location dashboard fixed that overnight. Now my records are unified, my prescriptions are faster, and my no-show rate dropped from 34% to 20% in three months.',
      name: 'Dr. Arvind Gupta',
      clinic: 'Gupta Medical Centre, Karol Bagh & Lajpat Nagar',
      photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop',
    },
    {
      quote:
        'Our clinic in Pitampura sees 90-100 patients daily during flu season. The reception desk was chaos — phone calls, walk-ins, billing, all at once. Doxxy\'s QR check-in and WhatsApp queue system changed everything. Patients now check themselves in and track their token on their phone. My receptionist went from managing chaos to managing patient experience. And the automatic WhatsApp reminders cut our no-shows by 40% — that alone paid for Doxxy in the first month.',
      name: 'Dr. Neha Kapoor',
      clinic: 'Kapoor Family Clinic, Pitampura',
      photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'How does Doxxy help with Delhi\'s high patient no-show rate?',
      answer:
        'Delhi has the highest no-show rate among Indian metros at 32%, largely driven by traffic unpredictability and patients commuting from satellite cities. Doxxy attacks this with a multi-touch reminder system: automated WhatsApp messages go out 24 hours before, 2 hours before, and (configurable) 30 minutes before the appointment. Each message includes a one-tap confirm or reschedule button. The system tracks which patients repeatedly no-show and can recommend overbooking windows. Delhi clinics using Doxxy consistently report no-show rates dropping from 30-35% to 18-22% within two months — directly recovering ₹1.5L-₹2.5L in monthly revenue that was previously walking out the door.',
    },
    {
      question: 'Can Doxxy handle multi-location clinics across Delhi NCR?',
      answer:
        'Yes. Doxxy\'s multi-location dashboard is built for the common Delhi model of a single doctor or practice group running OPDs in multiple locations. Patient records are centralised in a single database — a patient registered at the Karol Bagh clinic has their complete history instantly available when they visit the Lajpat Nagar or Noida location. Revenue, patient counts, and no-show data are broken down per location. Inventory and pharmacy stock can be tracked per location with central oversight. Multi-location is included in all paid plans.',
    },
    {
      question: 'Is Doxxy compliant with Delhi Medical Council documentation requirements?',
      answer:
        'Yes. Doxxy maintains patient records in formats compliant with DMC and Delhi Nursing Homes Registration Act requirements. All records are timestamped, digitally signed, and access-controlled. The platform auto-generates statutory registers including the daily patient register, Schedule H/H1/X drug dispensing logs, and procedure records. For clinics that maintain indoor patient facilities, Doxxy supports IPD record-keeping with discharge summaries. When a DMC inspection is scheduled, Doxxy produces a complete, audit-ready compliance package in minutes.',
    },
    {
      question: 'I run a clinic in a densely populated area — does Doxxy work offline if the internet goes down?',
      answer:
        'Doxxy is a cloud platform that requires an active internet connection for full functionality. However, we offer a lightweight offline queue mode where the token management system continues to operate during brief internet drops, syncing automatically when the connection resumes. For clinics in areas with unreliable broadband, we recommend a 4G hotspot (JioFi or similar), which provides more than sufficient bandwidth — Doxxy uses under 50MB of data daily for a 50-patient clinic. In our experience across Delhi clinics, 4G reliability is more than adequate for uninterrupted operation.',
    },
    {
      question: 'How does Doxxy handle the seasonal patient surges Delhi clinics experience?',
      answer:
        'Delhi clinics see 40-60% patient volume spikes during respiratory infection season (October-November and February-March) and dengue season (August-October). Doxxy\'s queue management and QR check-in system scales naturally — there is no per-patient cost increase for registration or queuing. The WhatsApp reminder system can be configured to send more frequent reminders during peak season when no-shows are even more costly (a missed slot during dengue season when 20 patients are waiting is a triple loss — lost revenue, lost reputation, and a patient who needed care). The platform\'s cloud infrastructure auto-scales to handle volume spikes with no performance degradation.',
    },
  ],
}

export default config
