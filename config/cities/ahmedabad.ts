// Path: config/cities/ahmedabad.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'ahmedabad',
  cityName: 'Ahmedabad',
  state: 'Gujarat',
  heroTitle: 'Ahmedabad Clinic Management Software — Built for Gujarat\'s Healthcare Hub',
  heroSubtitle:
    'From Maninagar to SG Highway, Ahmedabad\'s 18,000+ clinics form the backbone of Gujarat\'s healthcare system. Doxxy brings WhatsApp-powered patient engagement, paperless OPD management, UPI-first billing, and ABDM compliance to Ahmedabad clinics — designed for the city\'s unique mix of family-run clinics and rapidly expanding multispecialty centres.',
  problemTitle: 'Why Ahmedabad Clinics Need Purpose-Built Digital Tools',
  problemDescription:
    'Ahmedabad\'s healthcare landscape sits at a fascinating inflection point. The city is home to thousands of legacy family clinics — practices that have served the same neighbourhood for two, sometimes three generations — operating alongside brand-new multispecialty centres that have sprung up along the SG Highway and Science City corridor in the last five years. The older clinics in areas like Maninagar, Paldi, and Naranpura run on paper records and trust-based systems: the doctor knows every patient by name but cannot produce a structured medical history when a patient develops a chronic condition over multiple visits. Reception is typically handled by a family member who manages appointments through a paper diary and phone calls — when they step away for chai, the system collapses. Meanwhile, the new clinics on SG Highway and in Prahladnagar have invested in infrastructure but struggle with patient acquisition and retention — they have the equipment but lack the patient engagement systems that build loyalty. Ahmedabad\'s strong Gujarati business community expects efficiency: they do not want to wait 45 minutes when their appointment was at 10 AM. With the Ahmedabad Municipal Corporation (AMC) gradually aligning with ABDM mandates and the Gujarat Nursing Home Act requiring specific documentation standards, clinics across the city face a compliance horizon they are not prepared for. Ahmedabad clinics need software that honours the personal touch of family practice while bringing the efficiency of digital workflows — not a one-size-fits-all tool that ignores how healthcare actually works in this city.',
  clinicStats: {
    estimatedClinics: '18,000+',
    avgPatientsPerDay: '35-55',
    softwareAdoptionRate: '15%',
    abdmComplianceRate: '18%',
    paperUsageRate: '68%',
    specialtyMix: '30% general practice, 20% dental, 15% homeopathy, 12% dermatology, 13% multispecialty, 10% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹400-700',
    avgMonthlyRevenue: '₹5L - ₹9L',
    avgNoShowRate: '25%',
    estimatedMonthlyLossToNoShows: '₹1.2L - ₹2L per month',
    avgBillingErrorRate: '4-6%',
  },
  techContext: {
    whatsappPenetration: '94%',
    digitalPaymentAdoption: '65%',
    internetPenetration: '82%',
  },
  regulatoryNotes:
    'Ahmedabad clinics are governed by the Gujarat Nursing Home Act and regulations from the Ahmedabad Municipal Corporation (AMC) health department. The Gujarat Medical Council mandates a minimum of 3 years of patient record retention for outpatient cases. Clinics in the AMC jurisdiction must maintain specified statutory registers including a daily patient register, indoor patient register (if applicable), and a Schedule H drug register. The state government has been rolling out ABDM integration through the Gujarat Health Infrastructure Mission, with urban centres like Ahmedabad as early-adopter targets. Clinics in the eastern parts of the city (Maninagar, Bapunagar) have received compliance notices from AMC regarding documentation standards, making digital record-keeping a practical necessity rather than a choice.',
  solutionTitle: 'Doxxy for Ahmedabad: Digital Efficiency with a Personal Touch',
  solutionDescription:
    'Doxxy is designed for Ahmedabad\'s dual-speed healthcare ecosystem. For legacy family clinics in Maninagar and Naranpura, we provide a gradual digital transition — QR-code check-in that patients complete on their own phone (no data entry burden on the family member at reception), WhatsApp appointment reminders in Gujarati and Hindi, and digital prescriptions that print or send via WhatsApp. The system does not demand that the doctor change their workflow — it adapts to how they already practice. For the newer multispecialty centres on SG Highway, Doxxy delivers patient acquisition tools: automated follow-up for incomplete treatment plans, WhatsApp-based health camps and screening event promotions, and a professional digital front-desk experience that matches the premium infrastructure these clinics have invested in. Across both segments, UPI-first billing eliminates cash-handling errors, and built-in ABDM compliance ensures clinics are ready for AMC documentation audits without last-minute scrambling.',
  keyFeatures: [
    {
      icon: 'messageSquare',
      title: 'Gujarati & Hindi WhatsApp Patient Communication',
      description:
        'Every patient interaction — appointment confirmation, queue position update, prescription delivery, post-care instructions — happens via WhatsApp in Gujarati or Hindi based on patient preference. For a city where WhatsApp penetration exceeds 94% and Gujarati is the primary language of daily life, this is not a nice-to-have; it is the default communication channel. Automated reminders 24 hours and 2 hours before each appointment have reduced no-shows by 35-40% across our Ahmedabad clinics.',
    },
    {
      icon: 'smartPhone',
      title: 'QR-Code Self-Check-In for Family-Run Clinics',
      description:
        'In Ahmedabad\'s family-run clinics, the reception desk is often managed by the doctor\'s spouse or parent — someone who also handles phone calls, billing, and the household. Doxxy\'s QR-code check-in lets patients register themselves: scan, fill 4 fields (name, age, phone, complaint) on their own phone, done. The family member at reception is freed from data entry and can focus on patient care coordination. Registration time drops from 4-5 minutes to under 45 seconds.',
    },
    {
      icon: 'fileText',
      title: 'Digital Prescriptions — English, Gujarati, Hindi',
      description:
        'Specialty-specific templates with medication favourites. The doctor taps diagnosis, selects drugs and dosage, adds instructions, and generates a prescription in under 60 seconds. Delivered via WhatsApp or printed in Gujarati, Hindi, or English. For Ahmedabad\'s large homeopathy practices (15% of city clinics), we offer remedy-specific templates with potency and repetition schedules. No more illegible handwriting — patients and pharmacists can actually read what was prescribed.',
    },
    {
      icon: 'creditCard',
      title: 'UPI Billing with Gujarati-Language Invoices',
      description:
        'Auto-generated invoices with UPI QR codes. Billing validations catch undercharging — the missed consultation fee for a follow-up, the unreported procedure charge. Invoices and receipts are generated in Gujarati or English based on patient preference. WhatsApp payment links for patients who need to settle later. For Ahmedabad clinics where billing errors currently cost 4-6% of monthly revenue, the system pays for itself within the first week.',
    },
    {
      icon: 'shield',
      title: 'Gujarat Nursing Home Act & AMC Compliance Toolkit',
      description:
        'All records are digital, timestamped, and audit-trailed. Statutory registers required under the Gujarat Nursing Home Act — daily patient register, procedure log, indoor patient register, Schedule H/H1 drug records — are auto-generated and always inspection-ready. ABHA ID creation is built into patient registration. When the AMC health inspector arrives, produce a full compliance report in two clicks. No more frantic searching through paper registers while the inspector waits.',
    },
    {
      icon: 'users',
      title: 'Patient Retention & Treatment Plan Follow-Up',
      description:
        'Ahmedabad clinics lose significant revenue from incomplete treatment plans. A patient comes for consultation, the doctor recommends a 5-session physiotherapy course or a multi-visit dental procedure, and the patient disappears after the second visit. Doxxy\'s treatment sequencing automatically sends WhatsApp reminders for upcoming sessions, tracks completion rates, and flags patients at risk of dropping out. Clinics using this feature report a 30-45% improvement in treatment plan completion rates.',
    },
  ],
  whyDoxxyInThisCity:
    'Ahmedabad clinics operate at the intersection of trust and efficiency. Patients choose a clinic in Maninagar because their family has gone there for 20 years — but they still want WhatsApp reminders and UPI payments. Doxxy bridges this gap: it digitises the operational layer (check-in, billing, records, compliance) without disrupting the personal doctor-patient relationship. With 94% WhatsApp penetration in Ahmedabad and a patient population that is both tech-savvy and Gujarati-first, Doxxy\'s vernacular WhatsApp workflows are a natural fit. The city\'s 25% no-show rate — costing clinics ₹1.2L-₹2L per month — drops sharply with automated reminders and live queue tracking. And as AMC aligns with ABDM mandates, Doxxy\'s built-in compliance toolkit means Ahmedabad clinics are prepared, not panicked, when notices arrive.',
  testimonials: [
    {
      quote:
        'Our clinic in Maninagar has served the same neighbourhood since my father started it in 1982. I was worried that bringing in software would feel impersonal — our patients are like family. Doxxy proved me wrong. Patients love the WhatsApp reminders, the queue tracking means they don\'t crowd the waiting room, and my wife who manages reception now has time to actually talk to patients instead of scribbling in registers. The best part? Our monthly revenue went up by 18% simply because billing stopped leaking.',
      name: 'Dr. Harshil Patel',
      clinic: 'Patel Family Clinic, Maninagar',
      photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop',
    },
    {
      quote:
        'We opened our multispecialty centre on SG Highway in 2023 with state-of-the-art equipment but struggled with patient follow-ups. Patients would come for consultation, we would recommend treatment, and tracking whether they completed it was entirely manual. Doxxy\'s treatment sequencing changed that. Our physiotherapy completion rate went from 50% to 78% in three months. The WhatsApp health camp promotions brought in 200 new patients for our monsoon wellness drive. For a new clinic, this kind of patient engagement system is not optional — it is the difference between growing and staying empty.',
      name: 'Dr. Megha Desai',
      clinic: 'Aarogyam Multispecialty Centre, SG Highway',
      photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'Can Doxxy handle bilingual patient communication in Gujarati and Hindi for Ahmedabad clinics?',
      answer:
        'Yes. Doxxy supports patient communication in Gujarati, Hindi, and English — the three languages of Ahmedabad\'s patient population. WhatsApp reminders, appointment confirmations, post-care instructions, and invoices are all delivered in the patient\'s preferred language. Prescriptions can be generated in Gujarati script for elderly patients who prefer reading in their mother tongue, or in English for corporate patients visiting from the SG Highway and Prahladnagar corporate hubs. The UPI payment workflow supports Gujarati-language confirmations as well.',
    },
    {
      question: 'Is Doxxy compliant with the Gujarat Nursing Home Act and Ahmedabad Municipal Corporation regulations?',
      answer:
        'Yes. Doxxy maintains patient records in the format prescribed under the Gujarat Nursing Home Act. All records are timestamped, access-controlled, and retained for the mandatory minimum period (3 years for outpatient records). The platform auto-generates the statutory registers required by AMC, including the daily patient register, indoor patient register, procedure log, and Schedule H/H1 drug records. For clinics undergoing AMC inspections, Doxxy produces a complete compliance report in the required format — no more manual register hunting.',
    },
    {
      question: 'We are a homeopathy clinic in Navrangpura — does Doxxy support non-allopathic practices?',
      answer:
        'Absolutely. Doxxy is specialty-agnostic and works seamlessly for homeopathy, ayurveda, physiotherapy, and dental clinics alongside allopathic practices. For homeopathy clinics specifically, Doxxy offers customisable prescription templates with fields for remedy name, potency (30C, 200C, 1M, etc.), repetition schedule, and duration. The treatment sequencing feature is especially valuable for homeopathy where patients typically need multiple follow-ups over weeks or months — automated WhatsApp reminders ensure they do not drop out of the treatment cycle. Over 12% of our Ahmedabad clinics are homeopathy practices.',
    },
    {
      question: 'Our clinic is in the old city near Bhadra — internet can be patchy. Will Doxxy work reliably?',
      answer:
        'Doxxy is designed to work on any device with a browser and a 4G mobile connection. For clinics in older parts of Ahmedabad where broadband infrastructure may be inconsistent, a JioFi or Airtel 4G hotspot provides more than sufficient bandwidth. The platform uses under 50MB of data per day for a typical 40-patient clinic. We also offer a lightweight offline queue mode where the token system continues to function during brief internet drops, syncing automatically when the connection resumes.',
    },
    {
      question: 'What is the cost for a small single-doctor clinic in Ahmedabad seeing 20 patients per day?',
      answer:
        'Doxxy\'s pricing is designed for Indian clinics of every size. The first 100 consultations per month are completely free. Beyond that, it is ₹10 per consultation with no monthly minimum, no setup fee, and no hardware purchase. For a clinic seeing 20 patients per day (roughly 500 consultations per month), the cost beyond the free tier would be approximately ₹4,000 per month — less than what most clinics spend on paper registers and printing in the same period. The ROI is immediate: preventing even one no-show per day (worth ₹400-₹700 in Ahmedabad) covers more than the entire monthly software cost.',
    },
  ],
}

export default config
