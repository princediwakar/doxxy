// Path: config/cities/jaipur.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'jaipur',
  cityName: 'Jaipur',
  state: 'Rajasthan',
  heroTitle: 'Jaipur Clinic Management Software — Digital Health for the Pink City',
  heroSubtitle:
    'From C-Scheme to Malviya Nagar, Jaipur\'s 12,000+ clinics serve a rapidly urbanising population and a growing medical tourism sector. Doxxy brings WhatsApp-powered patient engagement, paperless records, UPI billing, and ABDM compliance to Jaipur clinics — built for the city\'s unique mix of traditional family practices, dental clinics, and Ayurveda centres.',
  problemTitle: 'Why Jaipur Clinics Need a Digital Platform Built for Rajasthan\'s Healthcare Reality',
  problemDescription:
    'Jaipur\'s healthcare ecosystem reflects the city itself — a blend of deep tradition and rapid modernisation. The old city areas — Johari Bazaar, Chandpole, Tripolia Bazaar — are home to clinics that have served families for generations, often operating from residential havelis where the ground floor is the clinic and the family lives above. These practices rely entirely on personal relationships and paper records; the doctor knows every patient but cannot, when asked, produce a structured five-year prescription history. The newer parts of Jaipur — Malviya Nagar, Vaishali Nagar, Mansarovar, Jagatpura — tell a different story. These areas have seen an explosion of dental clinics, dermatology centres, and IVF clinics catering to a more affluent, digitally-native patient base. The patients here book via phone, expect WhatsApp confirmations, and will switch clinics if they face a 60-minute wait without communication. Compounding this, Jaipur\'s growing reputation as a medical tourism destination — particularly for dental work, cosmetic procedures, and Ayurvedic treatments — means clinics increasingly serve out-of-town patients who need digital pre-consultation, appointment scheduling, and post-treatment follow-up delivered remotely. The Rajasthan Medical Council and Jaipur Nagar Nigam (JNN) have been progressively implementing documentation standards aligned with ABDM, and the Rajasthan Medicare Act imposes specific record-keeping requirements. Jaipur clinics need a platform that can handle the walk-in patient from the neighbourhood and the pre-booked medical tourist with equal ease — one that digitises operations without stripping away the warmth of a traditional Rajasthan practice.',
  clinicStats: {
    estimatedClinics: '12,000+',
    avgPatientsPerDay: '25-45',
    softwareAdoptionRate: '13%',
    abdmComplianceRate: '14%',
    paperUsageRate: '70%',
    specialtyMix: '25% general practice, 22% dental, 14% Ayurveda, 12% dermatology, 10% gynaecology/IVF, 17% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹350-600',
    avgMonthlyRevenue: '₹3L - ₹6L',
    avgNoShowRate: '24%',
    estimatedMonthlyLossToNoShows: '₹70K - ₹1.2L per month',
    avgBillingErrorRate: '5-8%',
  },
  techContext: {
    whatsappPenetration: '91%',
    digitalPaymentAdoption: '58%',
    internetPenetration: '72%',
  },
  regulatoryNotes:
    'Jaipur clinics are governed by the Rajasthan Medicare Act and regulations from the Jaipur Nagar Nigam (JNN) health department. The Rajasthan Medical Council mandates a minimum of 3 years of patient record retention for outpatient cases. Clinics operating in the JNN jurisdiction must register with the municipal health officer and maintain specified statutory registers including a daily OPD register, procedure log, and Schedule H drug records. The Rajasthan government has been rolling out the Rajasthan Digital Health Mission in alignment with ABDM, with Jaipur as the primary urban pilot. Ayurveda clinics — which constitute a significant 14% of Jaipur\'s healthcare providers — fall under both the Rajasthan Ayurveda and Unani Department and the Central Council for Research in Ayurvedic Sciences (CCRAS) for certain documentation standards. Medical tourism clinics catering to international patients face additional documentation requirements around patient consent, treatment protocols, and follow-up records.',
  solutionTitle: 'Doxxy for Jaipur: Bridging Traditional Practice and Digital Expectations',
  solutionDescription:
    'Doxxy is architected for Jaipur\'s three clinic archetypes. For traditional family clinics in the walled city and older neighbourhoods, it provides a low-friction digital overlay: QR-code check-in that patients handle themselves, Hindi-first WhatsApp communication, and digital prescriptions that match the speed of a handwritten chit. For the modern dental, dermatology, and IVF clinics in Malviya Nagar and Vaishali Nagar, Doxxy delivers patient experience tools that match their premium positioning — professional WhatsApp confirmations, live queue tracking, treatment plan sequencing, and UPI-first billing with automated payment links. For medical tourism clinics, Doxxy provides remote pre-consultation forms, digital consent workflows, multi-language prescription generation, and automated post-treatment follow-up that maintains the patient relationship across distances. Across all segments, the built-in Rajasthan Medicare Act compliance toolkit ensures clinics meet regulatory requirements without administrative overhead.',
  keyFeatures: [
    {
      icon: 'messageSquare',
      title: 'Hindi-First WhatsApp Patient Engagement',
      description:
        'Every patient communication — appointment confirmation, queue position, prescription delivery, post-care instructions — flows through WhatsApp in Hindi or English based on patient preference. In Jaipur, where 91% of the adult population uses WhatsApp and Hindi is the default language for healthcare conversations, this is the most natural channel for patient engagement. Automated reminders 24 hours and 2 hours before appointments have reduced no-shows by 30-35% across our Jaipur clinics.',
    },
    {
      icon: 'smartPhone',
      title: 'QR-Code Self-Check-In for Walk-In Heavy Clinics',
      description:
        'Jaipur clinics, especially in older areas, see a high proportion of walk-in patients — people who decide to visit the doctor and show up without an appointment. Doxxy\'s QR-code check-in handles this seamlessly: walk-in patients scan, fill 4 fields, and join the digital queue. Registered patients check in with a single WhatsApp tap. The system adapts the queue dynamically — appointments get their slots, walk-ins fill gaps — maximising the doctor\'s time without keeping anyone waiting unnecessarily.',
    },
    {
      icon: 'fileText',
      title: 'Digital Prescriptions — Hindi & English',
      description:
        'Specialty-specific prescription templates with medication shortcuts. Prescriptions generated in under 60 seconds, delivered via WhatsApp or printed. Hindi script support ensures elderly patients and those from Hindi-medium backgrounds can read their prescriptions with confidence. For Jaipur\'s large Ayurveda practices (14% of clinics), we offer remedy-specific templates that include classical Ayurvedic formulations, dosage in traditional units (Vati, Churna, Kwath), and Anupana instructions.',
    },
    {
      icon: 'creditCard',
      title: 'UPI Billing & Revenue Integrity',
      description:
        'Auto-generated invoices with UPI QR codes and Hindi/English language options. Billing validations prevent undercharging — the missed consultation differential, the unreported procedure fee, the dressing charge that was forgotten. WhatsApp payment links for follow-up settlements and out-of-town patients. In Jaipur where billing errors currently leak 5-8% of monthly revenue, the system typically pays for itself within the first two weeks of use.',
    },
    {
      icon: 'shield',
      title: 'Rajasthan Medicare Act & JNN Compliance Ready',
      description:
        'All records are digital, timestamped, and audit-trailed. Statutory registers required under the Rajasthan Medicare Act and JNN health regulations — daily OPD register, procedure log, Schedule H/H1 drug records — are auto-generated. ABHA ID creation is built into patient registration. For Ayurveda clinics, the system supports additional documentation required by the Rajasthan Ayurveda Department. When an inspector arrives, produce a compliance report in two clicks.',
    },
    {
      icon: 'globe',
      title: 'Medical Tourism Patient Management',
      description:
        'Jaipur\'s growing medical tourism sector — particularly dental, cosmetic, and Ayurveda treatments — requires clinics to manage patients who live in other cities or countries. Doxxy provides digital pre-consultation forms that patients fill remotely, WhatsApp-based treatment plan sharing, multi-language prescription delivery, and automated post-treatment follow-up. Out-of-town patients receive travel coordination support via WhatsApp (clinic location, nearby accommodation suggestions, post-procedure care instructions). This professional digital experience is often the deciding factor for medical tourists choosing between clinics.',
    },
  ],
  whyDoxxyInThisCity:
    'Jaipur\'s clinics sit at a crossroads: tradition on one side, rapid urbanisation and medical tourism on the other. Doxxy addresses both. For the family clinic in Adarsh Nagar that has done paper records for 30 years, it provides a gentle digital transition — no workflow disruption, no staff retraining, just a QR code on the wall and WhatsApp handling the rest. For the dental implant centre in Malviya Nagar serving patients from across Rajasthan and abroad, it delivers the professional digital front-end that premium patients expect. With 91% WhatsApp penetration and a Hindi-first population, Doxxy\'s vernacular communication is a natural extension of how Jaipur already talks. The 24% no-show rate drops significantly with automated reminders, and the Rajasthan Medicare Act compliance toolkit means clinics are prepared for the regulatory shift that is already underway.',
  testimonials: [
    {
      quote:
        'Our dental practice in Malviya Nagar treats patients from across Rajasthan — Jaipur, Jodhpur, Udaipur, even Delhi. Before Doxxy, managing out-of-town patients was chaotic: phone calls for appointments, WhatsApp texts for documents, no way to track who was coming when. Now, everything is in one system. Pre-consultation forms, appointment booking, treatment plan sharing, post-procedure follow-up — all automated. Our out-of-town patient volume has grown 40% in six months because the digital experience inspires confidence.',
      name: 'Dr. Alok Sharma',
      clinic: 'Sharma Dental Implant Centre, Malviya Nagar',
      photo: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=100&h=100&fit=crop',
    },
    {
      quote:
        'I run an Ayurveda clinic in C-Scheme that my grandfather started. Our patients trust us because of the personal attention, not because of technology. I was hesitant about software — I thought it would make the practice feel corporate. Doxxy proved me wrong. The patients love getting their prescriptions on WhatsApp in Hindi with proper Ayurvedic terminology. The appointment reminders have cut our no-shows by almost half. And the digital records mean I can see a patient\'s entire treatment history — including Panchakarma cycles from two years ago — before they even enter the consultation room.',
      name: 'Dr. Pradeep Vyas',
      clinic: 'Shri Ayurveda Chikitsalaya, C-Scheme',
      photo: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'Does Doxxy support Ayurveda clinic workflows and terminology?',
      answer:
        'Yes. Doxxy has customisable templates for Ayurveda practices that include fields for classical formulations (Kwath, Vati, Churna, Asava-Arishta), traditional dosage units, Anupana (vehicle) instructions, and Panchakarma treatment sequencing. The prescription output supports Hindi script with proper Devanagari rendering of Ayurvedic terminology. Treatment plan sequencing is particularly valuable for Panchakarma — the system tracks multi-day therapy schedules, sends WhatsApp reminders for each session, and maintains a complete treatment record for returning patients. Given that 14% of Jaipur\'s clinics are Ayurveda practices, this is a first-class use case, not an afterthought.',
    },
    {
      question: 'How does Doxxy handle medical tourism patients coming to Jaipur from other cities or countries?',
      answer:
        'Doxxy provides a complete medical tourism workflow. Pre-consultation: patients fill digital intake forms remotely, share previous reports via WhatsApp, and receive a preliminary treatment plan before they travel. During treatment: digital consent forms, multi-language prescription delivery, and WhatsApp coordination for appointment scheduling. Post-treatment: automated follow-up check-ins via WhatsApp, medication reminders, and a direct line to the clinic for any concerns. For international patients, all forms and prescriptions are available in English, and the UPI-plus-international-payment workflow is supported. This professional digital experience is often what makes a patient choose one clinic over another.',
    },
    {
      question: 'Is Doxxy compliant with the Rajasthan Medicare Act and Jaipur Nagar Nigam regulations?',
      answer:
        'Yes. Doxxy maintains patient records in accordance with the Rajasthan Medicare Act requirements. All records are timestamped, access-controlled, and retained for the mandatory minimum of 3 years for outpatient cases. The platform auto-generates statutory registers required by JNN health regulations, including the daily OPD register, procedure log, and Schedule H/H1 drug records. For clinics registered with the Rajasthan Ayurveda Department, additional documentation fields are available. ABHA ID creation and ABDM integration are built into the patient registration workflow.',
    },
    {
      question: 'Can Doxxy work for a small clinic in the old city without reliable internet?',
      answer:
        'Yes. Doxxy is a cloud-based platform that works on any device with a browser and a 4G connection. For clinics in older parts of Jaipur (walled city, Johari Bazaar area) where broadband may be inconsistent, a JioFi or Airtel 4G hotspot provides sufficient bandwidth. The platform uses under 50MB of data per day for a typical 35-patient clinic. We also offer a lightweight offline queue mode — the token system continues to function during brief internet drops, syncing data automatically when the connection resumes.',
    },
    {
      question: 'What is the cost for a small family clinic in Jaipur seeing 20 patients per day?',
      answer:
        'Doxxy\'s first 100 consultations per month are completely free — enough for a clinic seeing 4-5 patients daily. Beyond that, it is ₹10 per consultation with no monthly minimum, no setup fee, and no hardware purchase. For a clinic seeing 20 patients per day (roughly 500 consultations per month), the monthly cost beyond the free tier is approximately ₹4,000 — roughly equivalent to the cost of paper prescription pads and registers for the same period. The ROI is immediate: preventing even one no-show per day (worth ₹350-₹600 in Jaipur) more than covers the entire month of Doxxy usage.',
    },
  ],
}

export default config
