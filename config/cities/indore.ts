// Path: config/cities/indore.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'indore',
  cityName: 'Indore',
  state: 'Madhya Pradesh',
  heroTitle: 'Indore Clinic Management Software — Clean City, Modern Clinics',
  heroSubtitle:
    'Indore\'s 8,000+ clinics serve MP\'s commercial capital — a city known for its entrepreneurial energy, cleanliness rankings, and rapidly growing population. Doxxy brings digital clinic management to Indore, helping clinics in Vijay Nagar, Palasia, and beyond cut no-shows, go paperless, and embrace ABDM.',
  problemTitle: 'Why Indore\'s Fast-Growing Clinic Sector Needs Software Built for MP',
  problemDescription:
    'Indore is Madhya Pradesh\'s economic engine. The city\'s population has crossed 3.5 million, driven by a booming services sector, a thriving textile and garment industry, and its reputation as India\'s cleanest city — a distinction that has attracted both businesses and families. This growth has put immense pressure on Indore\'s clinics, many of which were established 15-20 years ago for a much smaller patient base. A clinic in Palasia that handled 20 patients a day in 2010 now sees 40, with no increase in staff or physical space. The friction is everywhere: registration queues stretch out the door during morning OPD, patient records take 5 minutes to retrieve from steel almirahs, and the noon rush of office-goers seeking a quick consultation before lunch piles onto an already stretched system. Indore\'s unique position as a hub for patients from surrounding districts — Ujjain, Dewas, Dhar, Ratlam, Khargone — means that nearly 30% of patients at major clinics come from outside the city, arriving with handwritten referral notes and paper investigation reports that must be manually entered into the clinic\'s records. The Madhya Pradesh Nursing Home Act and Indore Municipal Corporation (IMC) have been increasing documentation requirements, particularly for clinics in newer areas like Vijay Nagar and Scheme 78 that have seen rapid clinic establishment in the last decade. ABDM compliance deadlines are approaching, and most Indore clinics have not begun preparation. The city\'s entrepreneurial clinic owners — many of whom run successful practices while also operating diagnostic centres or pharmacies — need a platform that unifies their operations, not another standalone tool that adds complexity.',
  clinicStats: {
    estimatedClinics: '8,000+',
    avgPatientsPerDay: '30-50',
    softwareAdoptionRate: '12%',
    abdmComplianceRate: '16%',
    paperUsageRate: '75%',
    specialtyMix: '25% multispecialty, 30% general practice, 15% dental, 10% dermatology, 20% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹400-700',
    avgMonthlyRevenue: '₹5L - ₹8L',
    avgNoShowRate: '27%',
    estimatedMonthlyLossToNoShows: '₹1.3L - ₹2L per month',
    avgBillingErrorRate: '7-10%',
  },
  techContext: {
    whatsappPenetration: '88%',
    digitalPaymentAdoption: '62%',
    internetPenetration: '74%',
  },
  regulatoryNotes:
    'Indore clinics are regulated under the Madhya Pradesh Nursing Home Act and the Indore Municipal Corporation (IMC) health department. The MP Clinical Establishments (Registration and Regulation) Rules require registration and periodic documentation submission for all clinics with more than 2 beds or procedure rooms. Patient records must be maintained for a minimum of 3 years. IMC has been particularly active in inspecting clinics in high-density commercial areas like Rajwada, Sarafa, and Palasia for fire safety and biomedical waste management compliance. ABDM adoption is being driven by the MP health department, with Indore — as the state\'s largest city — expected to lead compliance among private clinics.',
  solutionTitle: 'Doxxy for Indore: From Paper Almirahs to Digital in Days',
  solutionDescription:
    'Doxxy is built for Indore\'s entrepreneurial clinic owners who want operational efficiency without the overhead of complex software. The platform works on any device with a browser — the reception laptop, the doctor\'s tablet, the pharmacy counter\'s computer — with no server, no installation, and no IT staff required. A clinic can be live on Doxxy by the afternoon session. QR-code check-in eliminates paper registration forms. WhatsApp reminders in Hindi and English attack the 27% no-show rate that costs Indore clinics ₹1.3L-₹2L monthly. UPI billing with charge validation catches the 7-10% revenue leakage from manual errors — for a clinic billing ₹6L monthly, that is ₹42,000-₹60,000 recovered. Digital prescriptions are templated and generated in under a minute. And for Indore clinics that receive patients from Ujjain, Dewas, and Dhar, the structured referral intake workflow ensures no patient history is lost in translation.',
  keyFeatures: [
    {
      icon: 'smartPhone',
      title: 'Same-Day Digital Onboarding — No IT Required',
      description:
        'Doxxy needs no server, no installation, and no dedicated IT staff. Open a browser on any device, log in, and start seeing patients. Clinics can be fully operational by the afternoon session on the same day they sign up. This is critical for Indore\'s owner-operated clinics where the doctor doubles as the practice manager and cannot afford a week of downtime for software implementation.',
    },
    {
      icon: 'messageSquare',
      title: 'WhatsApp in Hindi & English for MP\'s Patient Base',
      description:
        'With 88% WhatsApp penetration in Indore, Doxxy uses WhatsApp as the primary patient channel. Appointment reminders, queue updates, digital prescriptions, lab reports, and post-care instructions are delivered in Hindi or English as per patient preference. For clinics serving predominantly Hindi-speaking patients — the majority in areas like Rajwada, Sarafa, and Khajrana — Hindi is the default communication language, with seamless switching to English for the growing professional demographic in Vijay Nagar and Scheme 78.',
    },
    {
      icon: 'users',
      title: 'Referral Intake for Outstation Patients from Ujjain, Dewas & Beyond',
      description:
        'Nearly a third of patients at Indore\'s major clinics come from surrounding districts. Doxxy\'s structured referral intake workflow captures referring doctor details, prior investigations, provisional diagnosis, and treatment history at registration — converting the handwritten chit and paper reports into a structured digital record. The specialist starts the consultation fully informed, not piecing together fragments from a patient\'s file folder.',
    },
    {
      icon: 'fileText',
      title: 'Digital Prescriptions for Indore\'s Common Case Mix',
      description:
        'Indore\'s seasonal disease patterns are shaped by central India\'s climate — vector-borne diseases (dengue, chikungunya, malaria) during the monsoon (July-September), respiratory infections during winter, and a high baseline of gastrointestinal cases (driven by the city\'s celebrated street food culture that occasionally contributes to food-borne illness). Doxxy includes pre-templated prescriptions for these presentations, plus Indore-specific chronic disease combinations (diabetes with hypertension, hypothyroidism with obesity) common in the city\'s middle-aged business-class population.',
    },
    {
      icon: 'creditCard',
      title: 'UPI & Digital Billing with Revenue Leakage Protection',
      description:
        'Indore clinics lose 7-10% of monthly revenue to manual billing errors — higher than metros because billing is often handled by the doctor or a single receptionist juggling multiple responsibilities. Doxxy auto-generates itemised invoices with UPI QR at checkout. Built-in charge validation flags undercharges — the ₹100 injection charge, the ₹200 procedure fee that was forgotten in the rush. WhatsApp payment links let patients settle later. For a clinic with ₹6L monthly revenue, recovering even half the billing leakage adds ₹18,000-₹30,000 to the bottom line.',
    },
    {
      icon: 'shield',
      title: 'MP Nursing Home Act & IMC Compliance Built In',
      description:
        'Doxxy maintains records in formats compliant with the Madhya Pradesh Nursing Home Act and IMC health establishment regulations. ABHA ID creation and linking for ABDM compliance. Auto-generated statutory registers including daily patient register, procedure log, and Schedule H/H1 drug dispensing records. Audit-ready compliance reports. When the IMC health inspector visits, produce documentation in minutes — no more calling the accountant to find last month\'s register.',
    },
  ],
  whyDoxxyInThisCity:
    'Indore\'s clinic owners are entrepreneurs — they understand ROI instinctively. Doxxy delivers ROI from the first week: preventing one no-show per day (₹400-₹700 consultation value) covers the monthly cost. Reducing billing errors by half recovers ₹18,000-₹30,000 per month for a typical clinic. And for Indore\'s clinics receiving outstation patients, the structured referral intake eliminates the clinical risk of incomplete patient history — a risk that leads to repeat investigations, longer consultations, and occasionally, missed diagnoses. With 88% WhatsApp penetration and growing digital payment adoption, Indore\'s patient base is ready for digital-first clinics. Doxxy makes it happen in days, not months.',
  testimonials: [
    {
      quote:
        'My clinic in Palasia started with a paper register in 2012 when I saw 15 patients a day. By 2025, I was seeing 45 patients daily with the same register, same staff, same chaos. Doxxy changed everything. QR check-in eliminated the registration queue. WhatsApp reminders cut my no-shows from 30% to 18%. My receptionist — who was drowning in phone calls — now manages patient flow instead of just surviving it. Best investment I have made in my practice in 10 years.',
      name: 'Dr. Rajendra Jain',
      clinic: 'Jain Clinic, Palasia, Indore',
      photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop',
    },
    {
      quote:
        'I get patients from Ujjain, Dewas, and Dhar every single day. They come with a chit from the local doctor, a file full of paper reports, and I have to start from scratch. Doxxy\'s referral intake workflow lets my staff capture everything digitally in under two minutes — referring doctor, provisional diagnosis, previous investigations, everything. By the time the patient enters my cabin, I already know their story. My consultation quality has gone up, and my repeat-investigation rate has dropped significantly.',
      name: 'Dr. Megha Agrawal',
      clinic: 'Agrawal Skin & Dental Centre, Vijay Nagar, Indore',
      photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'How quickly can my Indore clinic start using Doxxy, and do I need to hire IT staff?',
      answer:
        'Most Indore clinics are live on Doxxy within the same day. The process: sign up (5 minutes), add your doctors and staff (10 minutes), optionally import any existing patient data (under an hour), and start seeing patients. No server, no software installation, no IT staff required. Doxxy works on any device with a browser — the existing reception laptop, a tablet, or even a phone. We recommend starting with a single OPD session to get comfortable, and most clinics are running fully by the next morning. For owner-operated clinics where the doctor is also the practice manager, this zero-IT-overhead approach is critical.',
    },
    {
      question: 'Does Doxxy support Hindi for prescriptions and patient communication in Indore?',
      answer:
        'Yes. Hindi is fully supported for patient communication — WhatsApp reminders, appointment confirmations, queue updates, prescriptions, and post-care instructions can all be delivered in Hindi. For patients who prefer it, prescriptions can be generated in Hindi script. English is also fully supported, and language preference is set per patient. Given that Hindi is the dominant language for Indore\'s patient population — especially in areas like Rajwada, Sarafa, Khajrana, and the old city — Doxxy\'s Hindi support is native and complete. Clinics in areas like Vijay Nagar and Scheme 78, which serve a more English-oriented professional demographic, can configure their default accordingly.',
    },
    {
      question: 'Is Doxxy compliant with the Madhya Pradesh Nursing Home Act?',
      answer:
        'Yes. Doxxy maintains all patient records in formats compliant with the Madhya Pradesh Nursing Home Act and the MP Clinical Establishments Rules. All records are timestamped, access-controlled, and retained for the mandatory minimum period. The platform auto-generates statutory registers required by the IMC, including the daily patient register, procedure log, and Schedule H/H1 drug dispensing records. For clinics undergoing IMC health department inspections, Doxxy produces a complete, audit-ready compliance package in under two minutes.',
    },
    {
      question: 'I run a clinic plus a pharmacy — can Doxxy handle both?',
      answer:
        'Doxxy is designed as a clinic management platform with integrated billing — not a full pharmacy management system. However, for clinics that dispense medicines directly (a common model in Indore where the doctor prescribes and the clinic dispenses), Doxxy handles pharmacy billing as part of the consultation workflow. The system tracks dispensed medications against prescriptions, maintains Schedule H/H1 drug dispensing records required by the MP Nursing Home Act, and includes the pharmacy charges in the patient\'s consolidated invoice. For clinics that operate a separate retail pharmacy counter alongside the OPD, Doxxy covers the OPD side comprehensively, and the pharmacy can continue with its existing system — the integration point is the prescription, which can be digitally routed to the pharmacy counter.',
    },
    {
      question: 'Is Doxxy affordable for a clinic in a middle-income area of Indore?',
      answer:
        'Yes. Doxxy\'s free tier covers the first 100 consultations per month — sufficient for a clinic seeing 4-5 patients daily. Beyond that, it is ₹10 per consultation with no monthly minimum and no setup fee. For a typical single-doctor clinic in a middle-income Indore neighbourhood seeing 20-25 patients per day, the monthly cost is approximately ₹3,500-₹5,000 — less than the monthly salary of a part-time attendant. The ROI is immediate: preventing one no-show per day (₹400-₹700 consultation value in Indore) covers the monthly Doxxy cost. Reducing billing errors by even half recovers another ₹18,000-₹30,000 monthly. Doxxy is not an expense — it is the cheapest revenue protection system an Indore clinic can buy.',
    },
  ],
}

export default config
