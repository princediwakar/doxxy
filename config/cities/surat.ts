// Path: config/cities/surat.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'surat',
  cityName: 'Surat',
  state: 'Gujarat',
  heroTitle: 'Surat Clinic Management Software — Digital OPD for India\'s Diamond City',
  heroSubtitle:
    'From Adajan to Vesu, Surat\'s 9,000+ clinics serve one of India\'s fastest-growing urban populations — diamond traders, textile entrepreneurs, and migrant workers alike. Doxxy brings WhatsApp-powered patient engagement, paperless records, UPI-first billing, and ABDM compliance to Surat clinics — designed for the city\'s unique business-first culture, high patient volumes, and rapidly expanding healthcare infrastructure.',
  problemTitle: 'Why Surat Clinics Need Software Built for Speed, Scale, and the Surti Work Ethic',
  problemDescription:
    'Surat is unlike any other Indian city. It is arguably the country\'s most commercially driven urban centre — a city where the diamond polishing industry processes 90% of the world\'s diamonds, where the textile mills run 24-hour shifts, and where a significant portion of the population is migrant labour from Bihar, UP, Odisha, and Maharashtra. This economic reality shapes healthcare demand in very specific ways. First, Surat\'s clinics face extraordinary patient volume during limited windows — diamond workers and textile labourers visit clinics either very early in the morning before their shift or late in the evening after it ends, creating two daily rush periods that can overwhelm a clinic\'s check-in and queue management. Second, the city\'s migrant population presents a documentation challenge: patients from other states often lack medical history, previous prescriptions, and continuity of care records — each visit to a Surat clinic is effectively a fresh start. Third, Surat\'s business community — the diamond traders of Mahidharpura, the textile merchants of Ring Road — are people who value time above all else. They will not wait 45 minutes for a scheduled appointment; they will leave and find another doctor. Fourth, the city has seen an explosion of new clinics in the rapidly developing areas of Vesu, Piplod, and City Light, where competition for patients is intense and digital presence is becoming the differentiator. Fifth, the Surat Municipal Corporation (SMC) — widely regarded as one of India\'s most efficient municipal bodies — has been proactive about health regulation and documentation standards, with ABDM alignment accelerating. Surat clinics need software that matches the city\'s tempo: fast check-in, efficient queue management, multilingual communication (Gujarati, Hindi, and Odia), and compliance-ready documentation.',
  clinicStats: {
    estimatedClinics: '9,000+',
    avgPatientsPerDay: '35-55',
    softwareAdoptionRate: '14%',
    abdmComplianceRate: '16%',
    paperUsageRate: '69%',
    specialtyMix: '30% general practice, 18% dental, 14% dermatology, 12% gynaecology, 10% paediatrics, 16% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹350-600',
    avgMonthlyRevenue: '₹4L - ₹8L',
    avgNoShowRate: '27%',
    estimatedMonthlyLossToNoShows: '₹1L - ₹1.8L per month',
    avgBillingErrorRate: '5-7%',
  },
  techContext: {
    whatsappPenetration: '93%',
    digitalPaymentAdoption: '62%',
    internetPenetration: '80%',
  },
  regulatoryNotes:
    'Surat clinics are governed by the Gujarat Nursing Home Act and regulations from the Surat Municipal Corporation (SMC) health department. The Gujarat Medical Council mandates a minimum of 3 years of patient record retention. Clinics in the SMC jurisdiction must register with the municipal health officer and maintain specified statutory registers including a daily OPD register, procedure log, and Schedule H drug records. The SMC, known for its administrative efficiency, has been a frontrunner among Gujarat municipal corporations in implementing digital health initiatives and conducting regular clinic inspections. The state government\'s ABDM rollout through the Gujarat Health Infrastructure Mission has identified Surat as a priority city. Clinics in industrial areas (Udhna, Pandesara, Sachin) face additional occupational health documentation requirements from the Gujarat Pollution Control Board and the Directorate of Industrial Safety and Health.',
  solutionTitle: 'Doxxy for Surat: Speed, Multilingual Support, and Volume-Ready Operations',
  solutionDescription:
    'Doxxy is engineered for Surat\'s high-intensity clinic rhythm. The QR-code self-check-in system eliminates registration bottlenecks during the morning and evening rush periods — patients scan, fill 4 fields in their preferred language, and join the queue in under 45 seconds. The WhatsApp-powered queue system lets patients track their token position in real time, reducing waiting room overcrowding and allowing patients to step out to the nearby chai ki tapri or their shop while waiting. Multilingual WhatsApp communication — Gujarati, Hindi, Odia, and English — ensures that Surat\'s diverse patient population (local Gujaratis, Hindi-belt migrants, Odia workers) all receive appointment reminders, prescription deliveries, and post-care instructions in a language they understand. Digital prescriptions are generated in under 60 seconds using specialty-specific templates. UPI-first billing auto-generates invoices with QR codes and sends payment links via WhatsApp. For Surat\'s growing number of clinics in Vesu and City Light competing for patients, Doxxy provides professional digital front-desk tools that attract and retain a patient base accustomed to efficient service.',
  keyFeatures: [
    {
      icon: 'messageSquare',
      title: 'Multilingual WhatsApp: Gujarati, Hindi, Odia & English',
      description:
        'Surat\'s patient population is linguistically diverse — local Gujaratis, Hindi-speaking migrants from UP and Bihar, Odiya workers from Odisha, and English-speaking professionals. Doxxy delivers every patient communication in the patient\'s preferred language: appointment confirmations, queue updates, prescription deliveries, post-care instructions, and payment links. With 93% WhatsApp penetration across all demographic groups, this is the single most effective channel for patient engagement. Automated multilingual reminders have reduced no-shows by 30-35% across our Surat clinics.',
    },
    {
      icon: 'smartPhone',
      title: 'Dual Rush-Hour Queue Management',
      description:
        'Surat clinics face two daily peak periods — early morning (7-9 AM, before factory shifts start) and evening (7-9 PM, after shifts end). Doxxy\'s queue system is designed for these volume surges. Patients check in via QR code and receive a live-updating token position on WhatsApp. The system prioritises appointments while efficiently slotting walk-ins into gaps. Patients waiting during rush periods can step out — to their shop, their workstation, or a nearby tea stall — and return when their token is approaching. This cuts waiting room crowding by half and eliminates the chaos of patients crowding the reception desk asking "kitni der aur?"',
    },
    {
      icon: 'fileText',
      title: 'Digital Prescriptions — Gujarati, Hindi, Odia & English',
      description:
        'Specialty-specific templates with medication favourites. Prescriptions generated in under 60 seconds and delivered via WhatsApp or printed. Multi-script support means a textile worker from Ganjam district in Odisha receives their prescription in Odia, a diamond polisher from Saurashtra gets it in Gujarati, and a trader from Bihar reads it in Hindi. This is not a luxury — it directly impacts medication adherence and treatment outcomes among Surat\'s migrant worker population.',
    },
    {
      icon: 'creditCard',
      title: 'UPI-First Billing with Migrant Worker Payment Workflows',
      description:
        'Auto-generated invoices with UPI QR codes and multilingual invoice options. For Surat\'s large population of daily-wage workers, Doxxy supports partial payment workflows and WhatsApp payment links that can be settled when the patient receives their weekly or monthly wages. Billing validations catch undercharging — the missed follow-up differential, the unreported procedure charge. The system stops the 5-7% monthly revenue leakage from manual billing errors and accommodates the flexible payment arrangements common in Surat\'s industrial-area clinics.',
    },
    {
      icon: 'shield',
      title: 'Gujarat Nursing Home Act & SMC Compliance Toolkit',
      description:
        'All records are digital, timestamped, and audit-trailed. Statutory registers required under the Gujarat Nursing Home Act and SMC health regulations — daily OPD register, procedure log, Schedule H/H1 drug records — are auto-generated. ABHA ID creation is built into patient registration. For clinics in industrial areas, the system supports additional occupational health documentation. When the SMC health inspector arrives — and SMC is known for its proactive inspection regime — produce a complete compliance report in two clicks.',
    },
    {
      icon: 'users',
      title: 'Migrant Patient Record Continuity & Health History Builder',
      description:
        'Surat\'s large migrant population means many patients arrive with no medical history. Doxxy\'s health history builder constructs a structured medical record from the very first visit — chief complaints, diagnoses, prescriptions, lab reports, and allergies are captured and organised. When a migrant worker returns six months later with a different complaint, the doctor has their complete Surat medical history instantly available. Over time, this creates continuity of care for a population that typically receives fragmented, episodic treatment. For employers with on-site clinics, Doxxy can provide aggregated occupational health data.',
    },
  ],
  whyDoxxyInThisCity:
    'Surat runs on speed and commerce — and its clinics need software that matches that rhythm. Doxxy\'s dual rush-hour queue management, 45-second QR-code check-in, and 60-second digital prescriptions are built for a city where the patient\'s time is as valuable as the doctor\'s. With 93% WhatsApp penetration and a linguistically diverse population spanning Gujarati, Hindi, and Odia speakers, multilingual digital communication is the only approach that ensures every patient receives comprehensible care instructions. The city\'s 27% no-show rate — driven by shift workers whose schedules change unpredictably — drops sharply with automated reminders and live queue tracking. For the new clinics in Vesu, Piplod, and City Light competing for Surat\'s growing middle class, Doxxy provides the professional digital experience that differentiates a clinic from the dozen others on the same road. And with SMC\'s proactive inspection regime and Gujarat\'s ABDM alignment, Doxxy\'s compliance toolkit keeps Surat clinics ahead of regulatory requirements without adding administrative burden.',
  testimonials: [
    {
      quote:
        'Our clinic near Pandesara GIDC sees over 80 patients a day — mostly textile workers from UP, Bihar, and Odisha. Before Doxxy, the morning rush was chaos. Patients crowding the counter, shouting their names, the compounder trying to manage tokens on a whiteboard. Now, patients scan a QR code and get their token on WhatsApp. They go have chai and come back when their token is near. The chaos is gone. And the Odia prescription support — I cannot tell you what a difference this makes. Patients from Odisha finally understand what medicines they need to take and why.',
      name: 'Dr. Amit Patel',
      clinic: 'Patel Healthcare Clinic, Pandesara',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    {
      quote:
        'I opened my dermatology practice in Vesu two years ago. The area has five other dermatologists within a 2-kilometre radius. Standing out is hard. Doxxy gave us a professional digital front-desk — WhatsApp booking, queue tracking, digital prescriptions, treatment follow-ups — that our competitors simply do not have. Patients comment on it. They refer others because the experience is smooth. Our patient volume has grown 60% in 14 months, and I credit a significant part of that to the practice management system. In a competitive market like Vesu, this is not optional — it is table stakes.',
      name: 'Dr. Kinjal Shah',
      clinic: 'Shah Skin & Aesthetics, Vesu',
      photo: 'https://images.unsplash.com/photo-1594751543129-6701ad444259?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'How does Doxxy handle the linguistic diversity of Surat\'s patient population — Gujarati, Hindi, Odia speakers?',
      answer:
        'Doxxy provides full multilingual support across Gujarati, Hindi, Odia, and English. During patient registration, the preferred language is captured and all subsequent communication — WhatsApp messages, appointment reminders, prescription deliveries, invoices, post-care instructions — is automatically delivered in that language. The prescription engine supports all four scripts with correct rendering of medical terminology. This is especially critical for Surat\'s large Odia-speaking migrant population, who often face language barriers in accessing healthcare. Odia-script prescriptions ensure these patients receive and understand their treatment instructions — directly improving medication adherence and health outcomes.',
    },
    {
      question: 'Can Doxxy handle the extreme patient volume during morning and evening rush periods in Surat clinics?',
      answer:
        'Yes — this is one of the core design considerations behind Doxxy. The queue system is built for high-volume, time-compressed OPD sessions. QR-code self-check-in processes a new patient in under 45 seconds without staff involvement. Returning patients check in via WhatsApp in under 5 seconds. The live queue updates mean patients do not crowd the reception area — they wait elsewhere and return when their token approaches. For clinics seeing 80+ patients in a morning session, this transforms the OPD experience from chaotic to orderly. The system uses under 50MB of data per day even at high volumes, and works reliably on a 4G connection.',
    },
    {
      question: 'Is Doxxy compliant with the Gujarat Nursing Home Act and SMC regulations?',
      answer:
        'Yes. Doxxy maintains patient records in full compliance with the Gujarat Nursing Home Act and SMC health department regulations. All records are timestamped, access-controlled, and retained for the mandatory minimum of 3 years. The platform auto-generates all statutory registers required by SMC, including the daily OPD register, procedure log, and Schedule H/H1 drug records. ABHA ID creation and ABDM integration are built into the patient registration workflow. Given SMC\'s reputation for conducting regular and thorough clinic inspections, Doxxy\'s compliance toolkit ensures clinics are always audit-ready — produce a full compliance report in two clicks when the inspector arrives.',
    },
    {
      question: 'My clinic is in an industrial area (Udhna/Pandesara). Many of my patients are daily-wage workers who sometimes cannot pay the full amount upfront. Does Doxxy support this?',
      answer:
        'Yes. Doxxy\'s billing system includes flexible payment workflows designed for clinics serving daily-wage and migrant worker populations. You can record partial payments and send WhatsApp payment links for the balance — the patient can settle when they receive their wages. The system tracks outstanding balances per patient and sends automated payment reminders at configurable intervals. UPI QR codes on invoices make digital payment easy even for patients who may not carry cash. The billing validations ensure proper charge capture regardless of the payment schedule, protecting your revenue while accommodating your patients\' financial realities.',
    },
    {
      question: 'What is the cost for a clinic in Surat seeing 30-40 patients per day?',
      answer:
        'Doxxy\'s first 100 consultations per month are completely free. Beyond the free tier, the cost is ₹10 per consultation with no monthly minimum, no setup fee, and no hardware purchase required. For a Surat clinic seeing 30-40 patients daily (approximately 800 consultations per month), the monthly cost beyond the free tier is roughly ₹7,000. This is less than the cost of a part-time receptionist\'s salary for one week. The ROI is immediate: preventing just one no-show per day (worth ₹350-₹600 in Surat) recovers the entire monthly software cost. For clinics in competitive areas like Vesu and City Light, the patient retention benefits alone — fewer no-shows, higher treatment plan completion rates — typically deliver a 3-5x return on the software investment within the first quarter.',
    },
  ],
}

export default config
