// Path: config/cities/lucknow.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'lucknow',
  cityName: 'Lucknow',
  state: 'Uttar Pradesh',
  heroTitle: 'Lucknow Clinic Management Software — Digital Efficiency for the City of Nawabs',
  heroSubtitle:
    'From Hazratganj to Gomti Nagar, Lucknow\'s 10,000+ clinics blend old-world courtesy with modern healthcare demands. Doxxy brings WhatsApp-powered OPD management, Hindi-first digital prescriptions, UPI billing, and ABDM compliance to Lucknow clinics — purpose-built for the city\'s unique mix of long-established family practices and rapidly growing suburban healthcare centres.',
  problemTitle: 'Why Lucknow Clinics Need Software That Matches the City\'s Evolving Healthcare Landscape',
  problemDescription:
    'Lucknow\'s clinic ecosystem is shaped by the city\'s dual identity — the old, gracious capital of Nawabi culture and the new, fast-growing administrative and educational hub of Uttar Pradesh. The legacy clinics in areas like Hazratganj, Chowk, Aminabad, and Aliganj have served generations of Lucknow families with a level of personal attention that is legendary: the doctor remembers your father\'s diabetes, your mother\'s thyroid, and your childhood asthma without referring to a file. But this memory-based system has hard limits. When a patient develops a new condition that interacts with existing medications, the doctor relies on recall — and recall fails. When a medico-legal situation arises, handwritten notes on letterhead do not constitute adequate documentation. Meanwhile, the new clinics mushrooming in Gomti Nagar, Gomti Nagar Extension, and Sushant Golf City serve a different Lucknow — young professionals, IIM students, government officers, and families who expect digital-first experiences. They want WhatsApp appointment confirmations, UPI payment options, and the ability to access their prescription on their phone. These clinics have the infrastructure but lack the operational systems to manage patient flow efficiently. The regulatory environment adds complexity: the UP Clinical Establishments Act mandates specific documentation, and the Lucknow Municipal Corporation (LMC) has been aligning with ABDM requirements. The Uttar Pradesh government\'s digital health push — part of the broader state modernisation drive — means clinics that remain paper-only will face increasing compliance pressure. Lucknow clinics need software that preserves the tehzeeb (etiquette) of a Lucknow practice while bringing the operational rigour that modern healthcare demands.',
  clinicStats: {
    estimatedClinics: '10,000+',
    avgPatientsPerDay: '25-40',
    softwareAdoptionRate: '11%',
    abdmComplianceRate: '12%',
    paperUsageRate: '73%',
    specialtyMix: '28% general practice, 18% dental, 14% homeopathy, 12% paediatrics, 10% gynaecology, 18% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹300-500',
    avgMonthlyRevenue: '₹2L - ₹5L',
    avgNoShowRate: '26%',
    estimatedMonthlyLossToNoShows: '₹50K - ₹90K per month',
    avgBillingErrorRate: '6-9%',
  },
  techContext: {
    whatsappPenetration: '88%',
    digitalPaymentAdoption: '50%',
    internetPenetration: '68%',
  },
  regulatoryNotes:
    'Lucknow clinics are governed by the UP Clinical Establishments (Registration and Regulation) Act and the Lucknow Municipal Corporation (LMC) health department regulations. The Uttar Pradesh Medical Council mandates a minimum of 3 years of patient record retention. Clinics within LMC limits must register with the municipal health officer and maintain specified statutory registers. The UP government has been implementing digital health initiatives under the State Health Mission, with Lucknow as the primary implementation centre. The Chief Medical Officer (CMO) office in Lucknow has been conducting documentation audits of private clinics, making structured digital records increasingly important. Clinics in newly developed areas (Gomti Nagar Extension, Sushant Golf City) face additional building and occupancy certification requirements from the Lucknow Development Authority (LDA).',
  solutionTitle: 'Doxxy for Lucknow: Modern Operations with Traditional Grace',
  solutionDescription:
    'Doxxy is designed for Lucknow\'s gradient of clinic types — from the heritage family practice in Hazratganj to the modern multispecialty centre in Gomti Nagar. For established clinics, it provides a non-disruptive digital overlay: QR-code self-check-in that patients handle on their own phone, Hindi-first WhatsApp communication that matches how Lucknow talks, and digital prescriptions generated in under 60 seconds using specialty-specific templates. The system does not ask the doctor to change how they practice — it simply makes the operational layer around that practice more efficient. For newer clinics in Gomti Nagar and beyond, Doxxy adds patient acquisition and retention features: automated follow-ups for incomplete treatment plans, WhatsApp-based health awareness campaigns, and a professional digital front-desk that attracts the city\'s growing professional class. The UPI billing system generates Hindi and English invoices, and the compliance toolkit ensures UP Clinical Establishments Act requirements are met without administrative burden.',
  keyFeatures: [
    {
      icon: 'messageSquare',
      title: 'Hindi & Urdu Script WhatsApp Communication',
      description:
        'Every patient interaction — appointment confirmation, queue update, prescription delivery, post-care instructions — flows through WhatsApp in Hindi, Urdu, or English. In Lucknow, where Hindi and Urdu are the languages of daily life and WhatsApp penetration is at 88%, vernacular digital communication is the most effective way to engage patients. Automated reminders 24 hours and 2 hours before each appointment have cut no-show rates by 28-35% across our Lucknow clinics.',
    },
    {
      icon: 'smartPhone',
      title: 'QR-Code Check-In for Clinics Without Dedicated Reception',
      description:
        'Many Lucknow clinics — particularly in older areas like Chowk and Aminabad — operate without a dedicated receptionist. The doctor or a family member manages check-in, billing, and phone calls simultaneously. Doxxy\'s QR-code self-check-in lets patients register on their own phone: scan, fill 4 fields, done in under 45 seconds. Returning patients check in with a single WhatsApp tap. The doctor sees a clean digital queue and can focus entirely on clinical care.',
    },
    {
      icon: 'fileText',
      title: 'Digital Prescriptions — Hindi, Urdu & English',
      description:
        'Specialty-specific templates with medication favourites. Prescriptions generated in under 60 seconds — matching the speed of a handwritten chit but producing legible, structured, searchable records. Hindi and Urdu script support ensures patients who are not comfortable with English can read and understand their prescriptions. For Lucknow\'s large homeopathy practices (14% of clinics), remedy-specific templates include potency, repetition, and duration fields with classical homeopathic terminology.',
    },
    {
      icon: 'creditCard',
      title: 'UPI Billing & Revenue Leakage Prevention',
      description:
        'Auto-generated invoices with UPI QR codes and Hindi/English language options. Billing validations catch undercharging — the consultation fee difference, the missed injection charge, the dressing fee that was not recorded. WhatsApp payment links for follow-up settlements. In Lucknow, where digital payment adoption (50%) is still growing but UPI usage is accelerating rapidly, Doxxy encourages digital payments by making the workflow effortless. The system stops the 6-9% monthly revenue leakage from manual billing errors.',
    },
    {
      icon: 'shield',
      title: 'UP Clinical Establishments Act & LMC Compliance',
      description:
        'All records are digital, timestamped, and audit-trailed. Statutory registers required under the UP Clinical Establishments Act and LMC health regulations — daily OPD register, procedure log, Schedule H/H1 drug records — are auto-generated. ABHA ID creation is built into patient registration. When the CMO office or LMC health inspector conducts a documentation audit, produce a full compliance report in two clicks rather than scrambling through years of paper registers.',
    },
    {
      icon: 'trendingUp',
      title: 'Patient Recall & Chronic Disease Management',
      description:
        'Lucknow has a high prevalence of chronic conditions — diabetes, hypertension, thyroid disorders — that require regular follow-ups. Doxxy\'s patient recall system automatically identifies patients due for their next consultation based on their last visit and diagnosis. Automated WhatsApp reminders with one-tap rebooking bring patients back on schedule. For diabetic patients, the system can send monthly check-up reminders. Clinics using this feature report a 25-30% improvement in chronic patient follow-up adherence and a corresponding increase in recurring revenue.',
    },
  ],
  whyDoxxyInThisCity:
    'Lucknow clinics are defined by their relationships — doctors who have treated entire families across decades, practices where patients are welcomed with warmth and sent off with genuine care. Doxxy does not change this; it protects it by removing the operational chaos that frustrates both doctors and patients. With 88% WhatsApp penetration and a Hindi-Urdu speaking population, vernacular digital communication is the most natural enhancement to the patient experience. The city\'s 26% no-show rate — driven partly by Lucknow\'s increasingly congested traffic on routes like Sitapur Road and Faizabad Road — drops with automated reminders and live queue tracking. As the UP government accelerates digital health adoption and LMC tightens documentation requirements, Doxxy\'s compliance toolkit keeps Lucknow clinics ahead of the regulatory curve without adding paperwork to the doctor\'s day.',
  testimonials: [
    {
      quote:
        'Our family clinic in Aliganj has been running since my father\'s time — 1978. We have patients whose grandparents came to us. Moving to digital felt like a betrayal of that personal touch. But Doxxy fits into our way of working instead of forcing us to change. Patients scan a QR, get their prescription on WhatsApp in Hindi, and still sit with me for 10 minutes of unhurried consultation. The difference is that now I have their complete history on my screen — five years of prescriptions, all their lab reports. When Mrs. Khan comes in with joint pain, I can see her uric acid levels from last year without asking her to bring old reports.',
      name: 'Dr. Syed Abbas Rizvi',
      clinic: 'Rizvi Family Clinic, Aliganj',
      photo: 'https://images.unsplash.com/photo-1622902043302-5c3429b3e109?w=100&h=100&fit=crop',
    },
    {
      quote:
        'Our dental practice in Gomti Nagar sees a lot of young professionals and students from IIM and the universities. This demographic expects digital everything — they do not want to fill paper forms or wait without knowing how long. Doxxy\'s WhatsApp queue tracking has transformed the waiting experience. Patients go to the cafe next door, track their token position on WhatsApp, and walk in exactly when it is their turn. The treatment plan follow-ups have been a game-changer — our orthodontic case completion rate has gone from 60% to 85%. For a modern clinic in a growing area, this is the standard patients expect.',
      name: 'Dr. Nupur Srivastava',
      clinic: 'Smile Studio Dental, Gomti Nagar',
      photo: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'Can Doxxy work for a small family clinic in Hazratganj that has been running on paper for 40 years?',
      answer:
        'Yes — this is the most common type of clinic we serve in Lucknow. Doxxy is designed for gradual adoption, not overnight transformation. You can start with just the digital queue and WhatsApp reminders while continuing your existing paper workflow. Once comfortable, add digital prescriptions. Then electronic billing. The QR-code check-in means patients handle their own registration — no data entry burden on you or your staff. The system works on a single tablet or smartphone if that is all you have. We have helped dozens of Lucknow family clinics make this transition without disrupting a single OPD session.',
    },
    {
      question: 'Does Doxxy support prescriptions in Hindi and Urdu for Lucknow\'s patient population?',
      answer:
        'Yes, fully. Doxxy supports prescription generation in Hindi, Urdu, and English. The Hindi and Urdu script rendering is comprehensive — medication names, dosage instructions, dietary advice, and post-care recommendations are all correctly output in the chosen script. For patients in areas like Chowk, Aminabad, and older parts of the city where Hindi/Urdu literacy is far higher than English literacy, vernacular prescriptions ensure patients actually understand what has been prescribed. WhatsApp delivery means the prescription is always available on the patient\'s phone — no lost paper.',
    },
    {
      question: 'Is Doxxy compliant with the UP Clinical Establishments Act and Lucknow Municipal Corporation regulations?',
      answer:
        'Yes. Doxxy maintains patient records in full compliance with the UP Clinical Establishments (Registration and Regulation) Act. All records are timestamped, access-controlled, and retained for the mandatory minimum of 3 years. The platform auto-generates statutory registers required by LMC, including the daily OPD register, procedure log, and Schedule H/H1 drug records. For clinics facing documentation audits from the CMO office — which have been increasing in frequency in Lucknow — Doxxy produces a complete compliance report in the required format on demand.',
    },
    {
      question: 'How does Doxxy help with chronic disease management — diabetes, hypertension, thyroid — which are very common in Lucknow?',
      answer:
        'Doxxy\'s patient recall system is purpose-built for chronic disease management. When a diabetic patient visits, the system records their diagnosis and automatically schedules a follow-up reminder based on the doctor\'s recommended interval (monthly, quarterly, etc.). Patients receive automated WhatsApp reminders when their follow-up is due, with a one-tap rebooking option. The system flags patients who have missed their follow-up window so the clinic can proactively reach out. For clinics managing hundreds of chronic patients, this automated recall system replaces the manual register-tracking that most clinics attempt and abandon. Clinics report a 25-30% improvement in chronic patient follow-up rates within the first quarter.',
    },
    {
      question: 'What is the cost for a clinic in Lucknow seeing 15-20 patients per day?',
      answer:
        'Doxxy\'s first 100 consultations per month are completely free. Beyond that, it is ₹10 per consultation with no monthly minimum, no setup fee, and no hardware purchase. For a Lucknow clinic seeing 15-20 patients daily (approximately 400 consultations per month), the monthly cost beyond the free tier is roughly ₹3,000. This is typically less than what the clinic spends on paper prescription pads, printed registers, and missed-revenue from no-shows in a single month. The economics are straightforward: prevent two no-shows per week (worth ₹600-₹1,000 in Lucknow), and the software pays for itself.',
    },
  ],
}

export default config
