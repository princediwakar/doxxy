// Path: config/cities/hyderabad.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'hyderabad',
  cityName: 'Hyderabad',
  state: 'Telangana',
  heroTitle: 'Hyderabad Clinic Management Software — for the City of Pearls\' Growing Healthcare Sector',
  heroSubtitle:
    'Hyderabad\'s 12,000+ clinics — from Charminar to HITEC City — serve a booming population spanning Old City legacy practices to Gachibowli\'s tech corridor. Doxxy helps Hyderabad clinics digitise operations, cut 30% no-show rates, and comply with TSMC regulations.',
  problemTitle: 'Why Hyderabad Clinics Are Caught Between Legacy and Digital',
  problemDescription:
    'Hyderabad\'s clinic landscape is a tale of two cities. In the Old City and surrounding areas, multi-generational family clinics have been operating for 30-40 years with loyal patient bases, paper records stacked floor to ceiling, and workflows that have not changed in decades. In the western corridor — Gachibowli, HITEC City, Madhapur, Kondapur — new clinics open monthly to serve the tech workforce, and patient expectations are shaped by the apps they build during the day. The city\'s 30% no-show rate sits above the national average, driven by Hyderabad\'s infamous traffic congestion (a 5 km drive from Banjara Hills to Punjagutta can take 40 minutes during peak hours), which causes both late arrivals and last-minute cancellations. Paper usage remains stubbornly high at 68%, and many clinics still rely on physical prescription pads, handwritten billing, and a wall-mounted appointment register. The Telangana State Medical Council (TSMC) has been increasing documentation and registration requirements, and clinics — particularly older establishments — are scrambling to comply. Hyderabad\'s unique demographic mix spans Telugu, Urdu, Hindi, and English-speaking patients, and a clinic in Abids may need to communicate in three languages within a single OPD session. The city\'s pharmaceutical and healthcare ecosystem (Genome Valley, the bulk drug industry, and a dense network of diagnostic labs) creates integration opportunities that most clinic software does not leverage. Hyderabad clinics need software that respects their legacy while enabling their digital future — and works in the languages their patients actually speak.',
  clinicStats: {
    estimatedClinics: '12,000+',
    avgPatientsPerDay: '40-60',
    softwareAdoptionRate: '16%',
    abdmComplianceRate: '20%',
    paperUsageRate: '68%',
    specialtyMix: '30% multispecialty, 25% general practice, 18% dental, 12% dermatology, 15% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹750-1,100',
    avgMonthlyRevenue: '₹12L - ₹16L',
    avgNoShowRate: '30%',
    estimatedMonthlyLossToNoShows: '₹3.5L - ₹4.5L per month',
    avgBillingErrorRate: '5-8%',
  },
  techContext: {
    whatsappPenetration: '93%',
    digitalPaymentAdoption: '74%',
    internetPenetration: '78%',
  },
  regulatoryNotes:
    'Hyderabad clinics are regulated by the Telangana State Medical Council (TSMC) and the Telangana Clinical Establishments (Registration and Regulation) Act. Patient records must be maintained for a minimum of 3 years. Telangana has been proactive in healthcare digitisation — the state government runs the T-Folio electronic health record initiative, and ABDM compliance expectations for private clinics are being communicated through TSMC circulars. Clinics in the Greater Hyderabad Municipal Corporation (GHMC) limits have additional registration and waste management requirements.',
  solutionTitle: 'Doxxy for Hyderabad: Multi-Lingual, Traffic-Ready, TSMC-Compliant',
  solutionDescription:
    'Doxxy meets Hyderabad clinics where they are — whether a 40-year-old family practice in Charminar or a new specialty clinic in Gachibowli. WhatsApp reminders in Telugu, Urdu, Hindi, and English combat the city\'s 30% no-show rate by giving patients live traffic-aware appointment updates. QR-code check-in eliminates paper intake forms in under 60 seconds. Digital prescriptions support multi-lingual generation. UPI billing with auto-reconciliation stops the revenue leakage from manual errors. And TSMC-compliant documentation with auto-generated registers ensures regulatory inspections are uneventful. For clinics transitioning from decades of paper, Doxxy\'s patient data import and same-day setup make the switch feasible without disrupting ongoing patient care.',
  keyFeatures: [
    {
      icon: 'messageSquare',
      title: 'Multi-Lingual WhatsApp in Telugu, Urdu, Hindi & English',
      description:
        'Hyderabad\'s linguistic diversity is unmatched — a single OPD in Abids or Malakpet may see Telugu, Urdu, Hindi, and English-speaking patients within the same hour. Doxxy delivers WhatsApp reminders, queue updates, prescriptions, and post-care instructions in each patient\'s preferred language. Language preference is set once per patient and applied automatically.',
    },
    {
      icon: 'smartPhone',
      title: 'Traffic-Aware Appointment Reminders',
      description:
        'Hyderabad\'s traffic congestion is a primary driver of the city\'s 30% no-show rate. Doxxy\'s 2-hour-before reminders help patients plan their departure with realistic travel time. For clinics using the live queue feature, patients can track their token position from home and leave only when their turn is approaching — turning Hyderabad\'s traffic from a cancellation generator into a manageable variable.',
    },
    {
      icon: 'fileText',
      title: 'Digital Prescriptions — Telugu & Urdu Script Support',
      description:
        'Prescriptions generated in under 60 seconds using specialty-specific templates. Medicines, dosage, and instructions can be output in Telugu and Urdu scripts in addition to Hindi and English. For elderly patients who prefer reading prescriptions in their native script, this is a trust-building feature that paper prescriptions rarely offer.',
    },
    {
      icon: 'shield',
      title: 'TSMC & Telangana Clinical Establishments Act Compliance',
      description:
        'Auto-generated registers and documentation compliant with TSMC requirements and the Telangana Clinical Establishments Act. ABHA ID creation and ABDM linking at patient registration. Audit-ready compliance reports for TSMC inspections. For clinics that have maintained paper records for decades, Doxxy provides the regulatory safety net that paper never could.',
    },
    {
      icon: 'creditCard',
      title: 'UPI Billing with Auto-Reconciliation',
      description:
        'Itemised invoices auto-generated at checkout with UPI QR. WhatsApp payment links for follow-up settlements. Built-in charge validation catches the 5-8% of monthly revenue that manual billing misses. Payment reconciliation is automatic — no more end-of-day tallying the cash box against a handwritten ledger.',
    },
    {
      icon: 'flaskConical',
      title: 'Lab & Pharmacy Ecosystem Integration',
      description:
        'Hyderabad\'s dense network of diagnostic labs and pharmacies creates unique integration opportunities. Doxxy supports digital lab report receipt and auto-filing into patient records. Reports forwarded to patients via WhatsApp with a single tap. Pharmacy dispensation can be tracked within the patient record for medication reconciliation. Built to leverage Hyderabad\'s healthcare infrastructure density.',
    },
  ],
  whyDoxxyInThisCity:
    'Hyderabad is a city in transition — half legacy, half digital, with patient expectations pulling clinics in both directions simultaneously. Doxxy bridges this gap. For the 40-year-old family clinic in the Old City, it offers a gentle digital transition: same-day setup, patient data import, and workflows that mirror existing processes while adding WhatsApp, UPI, and compliance automation. For the new clinic in Gachibowli, it offers the modern stack that tech-sector patients expect: online booking, QR check-in, WhatsApp prescriptions, and data-driven analytics. With 93% WhatsApp penetration, Doxxy\'s multi-lingual communication in Telugu, Urdu, Hindi, and English directly attacks the city\'s 30% no-show rate. And with TSMC tightening regulatory requirements, Doxxy\'s compliance toolkit protects clinics from the fines and penalties that paper-based practices are increasingly exposed to.',
  testimonials: [
    {
      quote:
        'Our family clinic in Abids has been running for 38 years — my father started it, and I joined 12 years ago. Moving from paper to software felt overwhelming until I saw how simple Doxxy makes it. We were live in a day. The multi-lingual WhatsApp feature is brilliant — our Urdu-speaking patients get reminders in Urdu, Telugu speakers in Telugu, automatically. No-shows dropped from 35% to 21% in six weeks.',
      name: 'Dr. Mohammed Azharuddin',
      clinic: 'Al-Shifa Family Clinic, Abids, Hyderabad',
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop',
    },
    {
      quote:
        'My dermatology practice in Gachibowli serves mostly tech professionals. They do not want to fill paper forms or wait 45 minutes without knowing their queue position. Doxxy\'s QR check-in and live WhatsApp queue tracking matched exactly what my patients expected. The structured photo documentation also transformed how I track treatment progress — before-and-after comparisons in seconds instead of scrolling through camera roll chaos.',
      name: 'Dr. Keerthi Reddy',
      clinic: 'Dermacare Skin Clinic, Gachibowli',
      photo: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'Does Doxxy support Telugu and Urdu for patient communication?',
      answer:
        'Yes. Doxxy supports patient-facing communication in Telugu, Urdu, Hindi, and English — the four primary languages of Hyderabad\'s patient population. WhatsApp reminders, appointment confirmations, queue updates, prescriptions, and post-care instructions are delivered in each patient\'s preferred language. Language is set once per patient in their profile and applies automatically to all communications. For clinics serving areas with mixed linguistic populations (Abids, Malakpet, Charminar), this is a critical operational advantage — your software communicates in each patient\'s language without any manual switching.',
    },
    {
      question: 'How does Doxxy help with Hyderabad\'s high patient no-show rate?',
      answer:
        'Hyderabad\'s 30% no-show rate is driven primarily by traffic congestion — patients underestimate travel time, get stuck, and cancel or simply do not show. Doxxy\'s multi-touch reminder system (24 hours, 2 hours, and configurable 30 minutes before the appointment) gives patients realistic departure time cues. The live WhatsApp queue tracking feature is particularly effective in Hyderabad: patients can monitor their token position from home or office and leave only when their turn is approaching, turning traffic from a cancellation trigger into a manageable variable. Clinics using both features report no-show reductions from 30-35% to 18-22% within the first two months.',
    },
    {
      question: 'Is Doxxy compliant with Telangana State Medical Council regulations?',
      answer:
        'Yes. Doxxy maintains all records in formats compliant with TSMC requirements and the Telangana Clinical Establishments (Registration and Regulation) Act. The platform auto-generates statutory registers including the daily patient register, prescription log, procedure log, and Schedule H/H1 drug records. All entries are timestamped and audit-trailed. ABHA ID creation and linking is built into the registration workflow for ABDM compliance. When a TSMC inspection is notified, Doxxy produces a complete, inspection-ready compliance package in minutes rather than the days of paper record searching that would otherwise be required.',
    },
    {
      question: 'My clinic is an old family practice in the Old City with decades of paper records — can we transition?',
      answer:
        'Yes. Doxxy is designed for clinics transitioning from paper, not just clinics already on software. The same-day setup means minimal disruption. Basic patient data (names, phone numbers, ages) can be entered into Doxxy as patients visit — no need to digitise 30 years of records upfront. For clinics that want a bulk import, our team assists with CSV imports of existing patient databases. Historical paper records can be referenced as needed during the transition period. Most family practices in Hyderabad are fully operational on Doxxy within a week and wonder why they did not switch years ago. The key insight: you do not need to digitise your past to operate digitally going forward.',
    },
    {
      question: 'How does Doxxy handle the seasonal disease patterns Hyderabad experiences?',
      answer:
        'Hyderabad sees distinct seasonal patterns — vector-borne diseases (dengue, chikungunya, malaria) from July through October, respiratory infections during winter (November-February), and gastrointestinal infections in summer (March-June). Doxxy\'s templated prescription system includes pre-configured protocols for these seasonal presentations with medication, dosage, and recommended investigations. During outbreak periods, clinics can rapidly create custom quick-prescription templates for circulating strains. The analytics dashboard tracks diagnosis patterns, giving clinics early visibility into local outbreak trends. The Telangana government\'s disease surveillance programme also benefits from clinics that can rapidly report notifiable disease data — Doxxy\'s digital records make this reporting a one-click extraction rather than a manual register search.',
    },
  ],
}

export default config
