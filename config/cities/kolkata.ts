// Path: config/cities/kolkata.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'kolkata',
  cityName: 'Kolkata',
  state: 'West Bengal',
  heroTitle: 'Kolkata Clinic Management Software — Modern Tools for the City of Healing',
  heroSubtitle:
    'From Park Street to Salt Lake, Kolkata\'s 22,000+ clinics carry forward a medical legacy that dates back to the establishment of Asia\'s oldest medical college. Doxxy brings WhatsApp-powered OPD management, Bengali-first digital prescriptions, UPI billing, and ABDM compliance to Kolkata clinics — respecting the city\'s deep clinical traditions while solving its modern operational challenges.',
  problemTitle: 'Why Kolkata Clinics Need Software That Respects Tradition While Enabling Efficiency',
  problemDescription:
    'Kolkata\'s medical ecosystem is unlike any other in India. The city that gave Asia its first medical college (Calcutta Medical College, 1835) still runs a significant portion of its outpatient care through legacy chamber practices — individual doctors operating from a single consultation room in a residential building, often in neighbourhoods like Gariahat, Rashbehari, or Jadavpur. These chamber practices are deeply personal: the doctor has known three generations of a family, prescribes with the economy of someone who remembers every patient\'s history, and maintains records in a personal notebook that only they can decipher. The system works beautifully until it does not — when a patient needs a six-month prescription history for insurance, when a medico-legal situation requires structured documentation, or when the doctor is unavailable and a locum cannot make sense of the handwritten notes. Meanwhile, the newer clinics in Salt Lake, New Town, and Rajarhat cater to a different demographic — young professionals, IT workers, and families who expect WhatsApp confirmations, digital payment options, and professional clinic experiences. These clinics have invested in infrastructure but struggle with the operational side: appointment no-shows, billing leakages, and the absence of systems to track patient outcomes over time. Kolkata\'s unique regulatory environment adds another layer: the West Bengal Clinical Establishments Act requires specific documentation standards, and the Kolkata Municipal Corporation (KMC) has been tightening inspections of clinic record-keeping. The city\'s clinics need a platform that digitises without depersonalising — one that lets a Park Street dermatologist maintain the warmth of a chamber practice while giving patients the digital experience they increasingly expect.',
  clinicStats: {
    estimatedClinics: '22,000+',
    avgPatientsPerDay: '30-50',
    softwareAdoptionRate: '12%',
    abdmComplianceRate: '15%',
    paperUsageRate: '72%',
    specialtyMix: '25% general practice, 18% dental, 15% dermatology, 12% homeopathy, 10% paediatrics, 20% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹500-800',
    avgMonthlyRevenue: '₹3.5L - ₹7L',
    avgNoShowRate: '30%',
    estimatedMonthlyLossToNoShows: '₹1L - ₹2L per month',
    avgBillingErrorRate: '5-7%',
  },
  techContext: {
    whatsappPenetration: '92%',
    digitalPaymentAdoption: '55%',
    internetPenetration: '75%',
  },
  regulatoryNotes:
    'Kolkata clinics are governed by the West Bengal Clinical Establishments (Registration and Regulation) Act and the Kolkata Municipal Corporation (KMC) health department regulations. The West Bengal Medical Council mandates a minimum of 3 years of patient record retention. Clinics in the KMC area must register with the municipal health officer and maintain specified statutory registers. The West Bengal government has been progressively implementing ABDM through the Swasthya Sathi scheme infrastructure, with Kolkata as the primary rollout zone. Chamber practices operating from residential premises face additional documentation requirements around fire safety and occupancy certification under KMC bylaws. The West Bengal Clinical Establishment Regulatory Commission has increased audits of patient record quality, making digital, structured records a compliance advantage.',
  solutionTitle: 'Doxxy for Kolkata: Digital Workflows for Chamber Practices and Modern Clinics',
  solutionDescription:
    'Doxxy is built for Kolkata\'s two-speed clinic landscape. For chamber practices in Ballygunge, Gariahat, and Salt Lake, it provides a lightweight digital layer that does not disrupt the doctor\'s established workflow. Patients check in via QR code — no receptionist needed. The doctor writes a digital prescription using specialty-specific templates that take under 60 seconds, matching the speed of handwritten notes but producing legible, structured records. WhatsApp reminders in Bengali, Hindi, and English cut the city\'s 30% no-show rate by over a third. For the modern clinics in New Town and Rajarhat, Doxxy adds patient acquisition and retention tools: automated treatment plan follow-ups, WhatsApp-based health camp promotions, and a professional digital front-desk experience. The UPI billing system generates Bengali and English invoices, and the built-in compliance toolkit ensures KMC and West Bengal Clinical Establishments Act requirements are met without additional paperwork.',
  keyFeatures: [
    {
      icon: 'messageSquare',
      title: 'Bengali, Hindi & English WhatsApp Communication',
      description:
        'Every patient touchpoint — appointment confirmation, queue update, prescription delivery, post-care follow-up — happens via WhatsApp in Bengali, Hindi, or English. For Kolkata\'s patient population, where Bengali is the primary language for a majority, vernacular WhatsApp messages are not a convenience; they are a necessity for patient comprehension and adherence. Automated reminders 24 hours and 2 hours before appointments have reduced no-show rates by 30-38% across our Kolkata clinics.',
    },
    {
      icon: 'smartPhone',
      title: 'Reception-Free QR-Code Check-In for Chamber Practices',
      description:
        'Kolkata\'s chamber practices typically do not have a dedicated receptionist — the doctor manages everything. Doxxy\'s QR-code self-check-in lets patients register themselves on their own phone: scan, fill 4 fields, done in under 45 seconds. Returning patients check in with a single WhatsApp tap. The doctor walks into the consultation room and sees a clean digital queue — no phone calls, no doorbell interruptions, no paper chits.',
    },
    {
      icon: 'fileText',
      title: 'Digital Prescriptions in Bengali Script & English',
      description:
        'Specialty-specific prescription templates with medication favourites and dosage shortcuts. Prescriptions generated in under 60 seconds, delivered via WhatsApp or printed. Bengali script support is critical for elderly patients and those from Bengali-medium backgrounds who cannot read English prescriptions. Hindi and English options cover the rest of the patient base. For dermatology practices — 15% of Kolkata clinics — we offer skin-condition-specific templates with treatment protocols and follow-up schedules.',
    },
    {
      icon: 'creditCard',
      title: 'UPI Billing with Vernacular Invoices',
      description:
        'Auto-generated invoices with UPI QR codes and Bengali/Hindi/English language options. Billing validations catch undercharging — the missed procedure fee, the unreported injection charge. WhatsApp payment links for follow-up settlements. For Kolkata clinics where digital payment adoption (55%) is still catching up compared to other metros, Doxxy actively encourages UPI adoption by making the payment workflow seamless for both clinic staff and patients.',
    },
    {
      icon: 'shield',
      title: 'West Bengal Clinical Establishments Act Compliance',
      description:
        'All patient records are digital, timestamped, and audit-trailed. The platform auto-generates registers required under the West Bengal Clinical Establishments Act and KMC health regulations, including the daily patient register, procedure log, and Schedule H drug records. ABHA ID creation is built into patient registration. When a KMC inspector or West Bengal Clinical Establishment Regulatory Commission auditor arrives, produce a compliance report in two clicks.',
    },
    {
      icon: 'calendar',
      title: 'No-Show Recovery & Appointment Optimisation',
      description:
        'Kolkata\'s 30% average no-show rate is among the highest of Indian metros — driven by unpredictable traffic, frequent political processions that block roads, and the city\'s relaxed attitude toward punctuality. Doxxy sends automated WhatsApp reminders 24 hours and 2 hours before each appointment with one-tap confirm or reschedule. The system learns each patient\'s attendance pattern and flags chronic no-showers for overbooking adjustments. Clinics using this feature report a 35-40% reduction in no-shows within 90 days.',
    },
  ],
  whyDoxxyInThisCity:
    'Kolkata clinics are defined by deep doctor-patient relationships — the kind built over decades of serving the same families in the same neighbourhood. Doxxy does not disrupt that; it protects it by removing the operational friction that erodes the patient experience. With 92% WhatsApp penetration, Bengali-first communication is the most natural bridge to better patient engagement. The city\'s 30% no-show rate drops significantly with automated reminders and live queue tracking. Chamber practices that have resisted software because it felt "too corporate" find Doxxy\'s lightweight, reception-free model a natural fit. And as KMC and the West Bengal Clinical Establishment Regulatory Commission increase documentation scrutiny, Doxxy\'s compliance toolkit ensures Kolkata\'s historic medical practices stay current with modern regulatory demands — without losing the personal touch that makes them special.',
  testimonials: [
    {
      quote:
        'I have run my dermatology chamber in Gariahat for 22 years. My patients are like extended family — I remember their skin conditions across seasons and years. But my notebook system was becoming unmanageable, especially when patients needed treatment histories for insurance. Doxxy gives me digital prescriptions that take the same time as handwriting but produce searchable, shareable records. My patients love getting their prescriptions on WhatsApp in Bengali. And the no-show reminders alone have saved me from losing 8-10 consultation slots per week.',
      name: 'Dr. Anindya Chatterjee',
      clinic: 'Chatterjee Skin Clinic, Gariahat',
      photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop',
    },
    {
      quote:
        'Our dental practice in Salt Lake sees a lot of young professionals from Sector V who book online but often do not show up. Before Doxxy, we had no system to track or reduce this — the receptionist would call each patient individually, which was unsustainable. Now, automated WhatsApp reminders in English and Bengali handle everything. Our no-show rate dropped from 35% to 19% in four months. The treatment plan sequencing for multi-visit procedures like RCTs and implants has been transformative — patients actually complete their treatment now.',
      name: 'Dr. Ritika Sen',
      clinic: 'Sen Dental Studio, Salt Lake City',
      photo: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'Can Doxxy work for a single-doctor chamber practice in Ballygunge with no receptionist or support staff?',
      answer:
        'Yes — this is precisely the use case Doxxy was designed for. Kolkata has thousands of chamber practices where the doctor manages everything alone. Doxxy\'s QR-code self-check-in eliminates the need for a receptionist: patients register themselves on their own phone. The doctor sees the digital queue on their tablet or laptop and calls patients in order. Prescriptions are generated in under 60 seconds using templates. WhatsApp handles appointment reminders, prescription delivery, and post-care follow-ups — all automated. The system requires no additional staff and runs on a single device if needed.',
    },
    {
      question: 'Does Doxxy support prescriptions in Bengali script?',
      answer:
        'Yes, fully. Doxxy supports prescription generation in Bengali, Hindi, and English. The Bengali script support is comprehensive — medication names, dosage instructions, and post-care advice are all rendered correctly in Bengali. This is particularly important for elderly patients and those from Bengali-medium backgrounds who cannot read English prescriptions confidently. The WhatsApp delivery of Bengali prescriptions ensures patients can show them to any pharmacy in Kolkata and get the correct medication dispensed.',
    },
    {
      question: 'Is Doxxy compliant with the West Bengal Clinical Establishments Act and KMC regulations?',
      answer:
        'Yes. Doxxy maintains patient records in full compliance with the West Bengal Clinical Establishments (Registration and Regulation) Act. All records are timestamped, access-controlled, and retained for the mandatory period. The platform auto-generates statutory registers required by KMC health department regulations, including the daily patient register, procedure log, and Schedule H/H1 drug records. For clinics undergoing inspections by the West Bengal Clinical Establishment Regulatory Commission, Doxxy produces a complete compliance report in the required format — no paper register scrambling.',
    },
    {
      question: 'How does Doxxy handle the high no-show rate in Kolkata, especially during the monsoon and bandh days?',
      answer:
        'Kolkata\'s no-show rate (30%) is influenced by several local factors: sudden monsoon downpours that flood streets, political processions and bandhs that block traffic, and the city\'s general cultural approach to punctuality. Doxxy addresses this through layered interventions. Automated WhatsApp reminders 24 hours and 2 hours before each appointment with one-tap confirm/reschedule. Live queue tracking that lets patients see how many people are ahead — if they are running late due to traffic, they can check whether the doctor is still available. The system also learns patient attendance patterns over time and flags chronic no-showers, allowing clinics to adjust scheduling (e.g., overbooking certain slots) to protect revenue.',
    },
    {
      question: 'What is the cost for a chamber practice in Kolkata seeing 15-20 patients per day?',
      answer:
        'Doxxy\'s first 100 consultations per month are completely free — sufficient for a chamber practice seeing 4-5 patients daily. Beyond the free tier, the cost is ₹10 per consultation with no monthly minimum, no setup fee, and no hardware purchase required. For a chamber practice seeing 15-20 patients per day (approximately 400 consultations per month), the monthly cost beyond the free tier would be roughly ₹3,000. This is less than what most chamber practices spend on prescription pads, registers, and phone call costs in a month. The ROI is immediate: preventing even one no-show per day (worth ₹500-₹800 in Kolkata) more than covers the entire software cost.',
    },
  ],
}

export default config
