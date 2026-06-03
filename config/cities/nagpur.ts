// Path: config/cities/nagpur.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'nagpur',
  cityName: 'Nagpur',
  state: 'Maharashtra',
  heroTitle: 'Nagpur Clinic Management Software — Digital for the Orange City\'s Growing Practices',
  heroSubtitle:
    'From Dharampeth to Wardha Road, Nagpur\'s 7,000+ clinics are the healthcare backbone of Central India. Doxxy brings WhatsApp-powered queue management, paperless records, UPI billing, and ABDM compliance to Nagpur clinics — built for the pace of Vidarbha\'s medical hub.',
  problemTitle: 'Why Nagpur Clinics Are Ready to Move Beyond Paper Registers',
  problemDescription:
    'Nagpur\'s strategic position as Central India\'s largest city and the winter capital of Maharashtra gives its clinics a dual role: they serve the city\'s 3 million residents and act as a referral destination for patients from across Vidarbha — Wardha, Chandrapur, Yavatmal, Bhandara, and Gondia. A clinic in Ramdaspeth or Dharampeth might see a local patient in the morning and a referred case from Gadchiroli by afternoon. This referral-driven patient flow creates operational complexity that paper records simply cannot manage. Referring doctors send patients with handwritten notes or a photograph of a lab report on WhatsApp, and the receiving specialist has to reconstruct the clinical picture from fragments. The arrival of MIHAN (Multi-modal International Cargo Hub and Airport at Nagpur) and the city\'s IT park in MIHAN-SEZ is bringing a new demographic — young professionals who expect online booking and WhatsApp-delivered prescriptions — while the city\'s traditional patient base, particularly elderly patients and those from rural Vidarbha, still prefer Marathi-language communication and phone-call-based appointment booking. Nagpur\'s clinics must serve both ends of this spectrum. The city\'s extreme summer temperatures (routinely crossing 47°C in May) create unique operational pressure: patient flow concentrates into early morning and late evening OPD hours, and no-shows spike during heatwave days when patients decide the trip to the clinic is not worth the 45°C wait at a bus stop. The Maharashtra Nursing Home Act applies here with the same force as in Mumbai and Pune, and Nagpur Municipal Corporation (NMC) has been increasing documentation scrutiny. Nagpur clinics need software that handles referral workflows, bridges the Marathi-English digital divide, and operates reliably through Vidarbha\'s intense summers.',
  clinicStats: {
    estimatedClinics: '7,000+',
    avgPatientsPerDay: '30-50',
    softwareAdoptionRate: '14%',
    abdmComplianceRate: '18%',
    paperUsageRate: '72%',
    specialtyMix: '30% multispecialty, 25% general practice, 15% dental, 10% dermatology, 20% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹500-800',
    avgMonthlyRevenue: '₹6L - ₹10L',
    avgNoShowRate: '25%',
    estimatedMonthlyLossToNoShows: '₹1.5L - ₹2.5L per month',
    avgBillingErrorRate: '6-10%',
  },
  techContext: {
    whatsappPenetration: '90%',
    digitalPaymentAdoption: '65%',
    internetPenetration: '78%',
  },
  regulatoryNotes:
    'Nagpur clinics are regulated under the Maharashtra Nursing Home Act and the Nagpur Municipal Corporation (NMC) health department. Patient records must be maintained for a minimum of 3 years for outpatient cases. Clinics operating in Nagpur must also comply with the Maharashtra Clinical Establishments (Registration and Regulation) Act. As the winter capital, Nagpur hosts the Maharashtra Legislature\'s winter session, during which healthcare compliance inspections intensify. ABDM adoption is being pushed through the NMC health department, and clinics in central Nagpur (Dharampeth, Ramdaspeth, Sitabuldi) are being prioritised for early compliance drives.',
  solutionTitle: 'Doxxy for Nagpur: Referral-Ready, Marathi-First, Built for Vidarbha',
  solutionDescription:
    'Doxxy is built for Nagpur\'s referral-heavy clinic ecosystem. When a patient is referred from a clinic in Wardha or Chandrapur, Doxxy generates a structured digital referral note with complete history, investigation results, and clinical notes — replacing the handwritten chit that currently serves as the referral document. The receiving specialist in Nagpur gets the full picture before the patient walks in. WhatsApp queue tracking in Marathi, Hindi, and English keeps patients informed in their preferred language — critical when half your patient base speaks Marathi as a first language and the other half communicates primarily in Hindi. Automated WhatsApp reminders directly attack the 25% no-show rate, with heatwave-triggered adjustments (more frequent reminders on forecasted 45°C+ days). UPI billing with auto-generated invoices catches the 6-10% revenue leakage that manual billing causes. And because Doxxy is cloud-based and works on any device, the typical Nagpur clinic — with a reception laptop and a doctor\'s tablet — can be live by the afternoon session on the day they sign up.',
  keyFeatures: [
    {
      icon: 'link',
      title: 'Structured Referral Workflow for Vidarbha-Wide Practices',
      description:
        'Nagpur clinics receive referrals from across Vidarbha — Wardha, Chandrapur, Yavatmal, Bhandara, Gadchiroli. Doxxy replaces the handwritten referral chit with a structured digital referral note that includes patient history, investigation reports, medications, and the referring doctor\'s clinical notes. The receiving specialist gets complete context before the patient arrives. Post-consultation, a digital summary with diagnosis, treatment plan, and follow-up instructions is automatically sent back to the referring doctor.',
    },
    {
      icon: 'messageSquare',
      title: 'WhatsApp Communication in Marathi, Hindi & English',
      description:
        'Nagpur\'s patient base spans Marathi-speaking locals, Hindi-speaking migrants from Madhya Pradesh and Chhattisgarh, and a growing English-speaking professional class. Doxxy delivers appointment reminders, queue updates, digital prescriptions, lab reports, and post-care instructions in the patient\'s preferred language — configured per patient. Marathi script support is full and native. This multi-lingual capability is critical for clinics in areas like Mahal, Itwari, and Sitabuldi that serve linguistically diverse catchments.',
    },
    {
      icon: 'smartPhone',
      title: 'QR-Code Check-In That Works for Tech-Novice & Tech-Savvy Patients',
      description:
        'New patients scan a QR code at reception and fill a 4-field digital intake form on their own phone — name, age, phone number, chief complaint. For elderly patients from rural Vidarbha who may not be comfortable with smartphones, the receptionist can complete the intake on their behalf in under 30 seconds using the assisted-registration mode. Returning patients confirm arrival with a single WhatsApp tap. Registration time drops from 3-4 minutes to under a minute.',
    },
    {
      icon: 'fileText',
      title: 'Digital Prescriptions Templated for Vidarbha\'s Common Presentations',
      description:
        'Nagpur\'s seasonal disease pattern is distinct: vector-borne diseases (dengue, chikungunya, malaria) spike during and after the monsoon (July-October), heat-related illnesses (heat exhaustion, dehydration, gastroenteritis) are common during the brutal May-June summer, and respiratory infections surge during the winter months. Doxxy includes pre-templated prescriptions for all these presentations, plus the chronic disease combinations (diabetes-hypertension, diabetes-hypothyroidism) common in Nagpur\'s middle-aged and elderly patient base.',
    },
    {
      icon: 'creditCard',
      title: 'UPI Billing & Revenue Leakage Prevention',
      description:
        'Nagpur clinics lose 6-10% of monthly revenue to manual billing errors — higher than Mumbai because billing is more frequently handled by a junior staff member or the doctor themselves rather than a dedicated billing desk. Doxxy auto-generates itemised invoices with UPI QR at checkout. WhatsApp payment links for follow-up settlements. Built-in charge validation catches undercharges — the ₹100 injection charge that was missed, the ₹150 dressing fee that was not added. For a clinic billing ₹8L monthly, that is ₹50,000-₹80,000 of monthly leakage recovered.',
    },
    {
      icon: 'shield',
      title: 'NMC & Maharashtra Nursing Home Act Compliance',
      description:
        'Doxxy maintains all records in formats compliant with the Maharashtra Nursing Home Act and NMC health establishment regulations. ABHA ID creation and linking are built into patient registration. Statutory registers — daily patient register, procedure log, Schedule H/H1 drug records — are auto-generated. Audit-ready compliance reports in two clicks. When the NMC health officer visits, produce documentation in minutes rather than scrambling through paper registers.',
    },
  ],
  whyDoxxyInThisCity:
    'Nagpur sits at a strategic inflection point. MIHAN and the IT sector are bringing in patients who expect digital-first clinic experiences, while the city\'s traditional patient base and referral network from rural Vidarbha demand Marathi-language, phone-friendly communication. Doxxy bridges both worlds — modern digital workflows in the language patients prefer. For Nagpur\'s referral-heavy ecosystem, the structured digital referral workflow alone transforms how clinics collaborate across Vidarbha. With 90% WhatsApp penetration, automated reminders in Marathi and Hindi cut the 25% no-show rate by over a third. And with NMC intensifying compliance scrutiny ahead of ABDM deadlines, Doxxy\'s built-in regulatory toolkit keeps Nagpur clinics ahead of the curve.',
  testimonials: [
    {
      quote:
        'My clinic in Dharampeth receives referrals from five districts across Vidarbha. Before Doxxy, every referral came with a handwritten note — sometimes just a WhatsApp photo of a prescription. I spent the first five minutes of every referred consultation trying to piece together the patient\'s history. Doxxy\'s digital referral workflow changed everything. Now referring doctors send structured notes with complete history, and I start every consultation fully informed. My referral-to-treatment time dropped by nearly 40%.',
      name: 'Dr. Sanjay Deshpande',
      clinic: 'Deshpande Multispecialty Clinic, Dharampeth, Nagpur',
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop',
    },
    {
      quote:
        'I run a dental practice in Pratap Nagar. Nagpur summers are brutal — patients cancel constantly when it crosses 45°C. Doxxy\'s WhatsApp reminders and one-tap reschedule made an immediate difference. Patients who would have just not shown up now reschedule instead, and I can fill the slot. My no-show rate dropped from 30% to 17% in the first summer using Doxxy. That alone saved me ₹40,000-₹50,000 a month during peak summer.',
      name: 'Dr. Aparna Kulkarni',
      clinic: 'Kulkarni Dental Care, Pratap Nagar, Nagpur',
      photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'Does Doxxy work for clinics that receive referrals from rural Vidarbha?',
      answer:
        'Yes. Doxxy\'s structured referral workflow is built specifically for the referral patterns common in Nagpur. Referring doctors in Wardha, Chandrapur, Yavatmal, or Gondia can use Doxxy to generate a digital referral note with complete patient history, investigation reports, current medications, and clinical notes. Even if the referring doctor does not use Doxxy, the system can ingest referral information manually at registration and structure it into the patient record. Post-consultation, a structured summary is sent back to the referring doctor — closing the referral loop that currently relies on the patient carrying a handwritten note back to their hometown. This creates a professional referral network that benefits both the referring doctor and the Nagpur specialist.',
    },
    {
      question: 'How does Doxxy handle multi-lingual requirements for Nagpur\'s diverse patient base?',
      answer:
        'Doxxy supports patient communication in Marathi, Hindi, and English — the three primary languages of Nagpur\'s patient population. Prescriptions can be generated in Marathi or Hindi script for patients who prefer vernacular prescriptions. WhatsApp reminders, queue updates, and post-care instructions are delivered in the patient\'s preferred language, configured individually. For clinics in areas like Mahal, Itwari, and Sitabuldi that serve a mix of Marathi and Hindi speakers, Doxxy handles the language switching transparently. The platform\'s Marathi support is native and complete — not a translation layer bolted on top of English templates.',
    },
    {
      question: 'Is Doxxy compliant with Maharashtra Nursing Home Act requirements that apply in Nagpur?',
      answer:
        'Yes. Doxxy maintains patient records in formats compliant with the Maharashtra Nursing Home Act and NMC health establishment regulations. All records are timestamped, access-controlled, and retained for the mandatory minimum period (3 years for outpatient records). The platform auto-generates statutory registers required by the NMC, including the daily patient register, procedure log, and Schedule H/H1 drug dispensing records. For clinics undergoing NMC health department inspections, Doxxy produces compliance documentation in the required format in under two minutes.',
    },
    {
      question: 'My clinic is in an older part of Nagpur with unreliable electricity in summer — can Doxxy work with power cuts?',
      answer:
        'Doxxy is a cloud-based platform that requires an active internet connection for full functionality. For clinics concerned about electricity reliability during Nagpur\'s intense summers, we recommend a small UPS (uninterruptible power supply) for the reception device and router — a standard 600VA UPS costs under ₹3,000 and provides 2-3 hours of backup, sufficient to cover most power cuts. For internet, a 4G hotspot (JioFi or similar) provides more than sufficient bandwidth — Doxxy uses under 50MB of data daily for a typical 40-patient clinic. We also offer a lightweight offline queue mode where the token system continues to function during brief internet drops, syncing automatically when the connection resumes. Most Nagpur clinics find that a basic UPS plus a 4G backup provides complete operational reliability.',
    },
    {
      question: 'Is Doxxy affordable for a small single-doctor clinic in Nagpur seeing 15-20 patients daily?',
      answer:
        'Yes. Doxxy\'s pricing is designed for Indian clinics at every scale. The first 100 consultations per month are completely free — sufficient for a clinic seeing 4-5 patients daily. Beyond that, it is ₹10 per consultation with no monthly minimum, no setup fee, and no hardware purchase. For a single-doctor clinic in Nagpur seeing 15-20 patients per day, the monthly cost is approximately ₹3,000-₹4,500. Preventing just one no-show per day (average consultation value ₹500-₹800 in Nagpur) more than pays for the entire month\'s Doxxy usage. Reducing billing errors by even half recovers another ₹25,000-₹40,000 per month. Doxxy is a revenue protection investment, not an expense.',
    },
  ],
}

export default config
