// Path: config/cities/bhopal.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'bhopal',
  cityName: 'Bhopal',
  state: 'Madhya Pradesh',
  heroTitle: 'Bhopal Clinic Management Software — Digital Health for the City of Lakes',
  heroSubtitle:
    'Bhopal\'s 6,000+ clinics — from MP Nagar to Kolar — serve the capital\'s unique mix of government employees, students, and lakeside communities. Doxxy brings digital records, WhatsApp patient engagement, UPI billing, and ABDM compliance to Bhopal\'s clinics at a price that makes sense for the capital city.',
  problemTitle: 'Why Bhopal\'s Clinic Infrastructure Has Not Kept Up with Its Growing Population',
  problemDescription:
    'Bhopal is a city of sharp contrasts — and its clinic infrastructure reflects this. The city\'s population has grown significantly over the last two decades, absorbing the township expansions of Kolar, Hoshangabad Road, and the BHEL area, while large swathes of Old Bhopal continue to rely on clinics that have operated for 30-40 years with minimal technology adoption. In MP Nagar and Arera Colony — the city\'s commercial and administrative heart — clinics cater to a patient base of government officers, university faculty, and professionals who expect structured communication and digital records. In Old Bhopal and the densely populated areas around Itwara, Chowk, and Bairagarh, clinics serve a more price-sensitive demographic where ₹300 consultation fees are the norm and patients rely entirely on phone calls and walk-in visits. This dual demographic forces Bhopal clinics into an operational tightrope: they must serve government employees who want WhatsApp appointment confirmations and digital prescriptions while simultaneously accommodating elderly patients from Old Bhopal who arrive with a bundle of paper prescriptions tied in a rubber band. Bhopal\'s software adoption rate of 11% is among the lowest for an Indian state capital, primarily because no platform has been built with this dual-demographic reality in mind. The MP Nursing Home Act applies, and the Bhopal Municipal Corporation (BMC) has been strengthening clinic registration and inspection requirements. The city\'s status as the state capital means that regulatory scrutiny is higher here than in any other MP city — health department offices are a 15-minute drive from most clinics, not a day\'s journey away. ABDM deadlines are approaching, and Bhopal clinics, especially those serving the government-employee demographic, are beginning to feel the compliance pressure.',
  clinicStats: {
    estimatedClinics: '6,000+',
    avgPatientsPerDay: '25-45',
    softwareAdoptionRate: '11%',
    abdmComplianceRate: '14%',
    paperUsageRate: '78%',
    specialtyMix: '20% multispecialty, 35% general practice, 15% dental, 10% dermatology, 20% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹400-700',
    avgMonthlyRevenue: '₹4L - ₹7L',
    avgNoShowRate: '24%',
    estimatedMonthlyLossToNoShows: '₹1L - ₹1.6L per month',
    avgBillingErrorRate: '8-12%',
  },
  techContext: {
    whatsappPenetration: '86%',
    digitalPaymentAdoption: '60%',
    internetPenetration: '72%',
  },
  regulatoryNotes:
    'Bhopal clinics are regulated under the Madhya Pradesh Nursing Home Act and the Bhopal Municipal Corporation (BMC) health department. As the state capital, Bhopal is subject to more frequent and rigorous inspections than other MP cities — the Directorate of Health Services is located in the city, and regulatory audits can be triggered with short notice. Patient records must be maintained for a minimum of 3 years. BMC has specific requirements for clinics in newly developed areas (Kolar, Hoshangabad Road extension, Airport Road) regarding waste management and building safety. ABDM adoption is being driven from the state health secretariat in Bhopal, making the city a compliance bellwether for the rest of MP.',
  solutionTitle: 'Doxxy for Bhopal: Bridging Old City Trust with Digital Efficiency',
  solutionDescription:
    'Doxxy is built for Bhopal\'s dual-demographic reality. For patients who expect digital-first experiences — the government officers in MP Nagar, the professors in Arera Colony, the engineering students near MANIT — Doxxy provides QR-code check-in, WhatsApp appointment booking, digital prescriptions, and UPI billing. For patients from Old Bhopal who arrive with paper files and prefer Hindi or Urdu communication, Doxxy\'s assisted-registration mode lets the receptionist complete intake in under 30 seconds, and all communication defaults to Hindi. There is no "wrong" way to use Doxxy — the platform adapts to how each patient prefers to interact, not the other way around. The platform works on any device with a browser — no server, no installation, no IT staff. A clinic can be live by the afternoon session. WhatsApp reminders in Hindi cut the 24% no-show rate. Built-in billing validation catches the 8-12% revenue leakage. And for Bhopal clinics facing the highest regulatory scrutiny in MP, Doxxy\'s compliance toolkit turns inspections from stressful events into routine checkpoints.',
  keyFeatures: [
    {
      icon: 'users',
      title: 'Dual-Mode Patient Intake — Digital & Assisted',
      description:
        'Doxxy supports both self-service QR-code check-in (for the tech-comfortable patients who dominate MP Nagar and Arera Colony clinics) and assisted-registration mode (for elderly patients, rural visitors, and patients from Old Bhopal who are not comfortable with smartphones). The receptionist can complete assisted intake in under 30 seconds using a simple form. Both modes feed the same digital patient record — no hybrid paper-digital workflow. This dual-mode design is the core reason Doxxy works for Bhopal clinics that serve both ends of the digital literacy spectrum.',
    },
    {
      icon: 'messageSquare',
      title: 'WhatsApp in Hindi, with Optional Urdu Messaging',
      description:
        'With 86% WhatsApp penetration in Bhopal, Doxxy uses WhatsApp as the primary patient channel. All communication — reminders, queue updates, prescriptions, lab reports — can be delivered in Hindi, which serves as the lingua franca across Bhopal\'s demographics. For clinics in areas with significant Urdu-speaking populations (Old Bhopal, Itwara, Chowk, Shahjahanabad), custom Urdu message templates can be configured. English is available for the professional demographic in MP Nagar and the lakeside colonies.',
    },
    {
      icon: 'fileText',
      title: 'Templated Prescriptions for Bhopal\'s Common Conditions',
      description:
        'Bhopal\'s climate — moderate summers compared to the rest of MP, a well-defined monsoon, and fog-prone winters — creates a predictable seasonal disease pattern. Vector-borne diseases (dengue, chikungunya) peak during and after the monsoon (July-October). Respiratory infections surge during the winter fog (December-January). Water-borne illnesses spike during the monsoon. Doxxy includes pre-templated prescriptions for all these seasonal presentations, plus the chronic disease combinations (diabetes, hypertension, hypothyroidism, COPD) common in Bhopal\'s middle-aged and elderly population.',
    },
    {
      icon: 'creditCard',
      title: 'Flexible Billing for Bhopal\'s Wide Fee Spectrum',
      description:
        'Consultation fees in Bhopal range from ₹200-₹300 in Old Bhopal clinics to ₹700-₹1,000 in MP Nagar and Arera Colony specialty setups. Doxxy supports configurable fee structures per doctor, per time slot, and per service type. UPI QR at checkout. WhatsApp payment links for follow-up settlement. Built-in charge validation catches the 8-12% revenue leakage from manual billing — for a clinic with ₹5L monthly revenue, that is ₹40,000-₹60,000 per month currently being lost to missed charges and calculation errors.',
    },
    {
      icon: 'trendingUp',
      title: 'Patient Visit History & Longitudinal Records',
      description:
        'Bhopal clinics, especially those serving government employees and their families, see the same patients over years and decades. Doxxy builds a structured, searchable patient history — every consultation, every prescription, every investigation, every procedure — accessible in seconds. When a retired government officer who has been visiting the same clinic since 2012 comes in with a new complaint, the doctor sees their complete history at a glance. This is the clinical value that paper files — even meticulously maintained ones sitting in a steel almirah for a decade — can never provide.',
    },
    {
      icon: 'shield',
      title: 'MP Nursing Home Act & Capital-Level Compliance',
      description:
        'Bhopal clinics face the highest regulatory scrutiny in Madhya Pradesh because the Directorate of Health Services is located in the city. Doxxy maintains records in formats compliant with the MP Nursing Home Act and BMC health establishment regulations. All records are timestamped, access-controlled, and auditable. Statutory registers are auto-generated. ABHA ID creation is built into registration for ABDM compliance. When an inspection is triggered — sometimes with a day\'s notice in the capital — Doxxy produces a complete compliance package in minutes.',
    },
  ],
  whyDoxxyInThisCity:
    'Bhopal\'s clinics have been underserved by software because no platform has been built for the city\'s dual-demographic reality. Doxxy bridges the gap: digital-first for the MP Nagar professional, assisted and Hindi-first for the Old Bhopal patient. For clinics facing the highest regulatory scrutiny in MP — because the health directorate is 15 minutes away, not a day\'s drive — Doxxy\'s compliance toolkit eliminates the stress of surprise inspections. And with Bhopal\'s software adoption at just 11%, the clinics that move first to a modern platform will differentiate themselves for years. Doxxy lets Bhopal clinics be those first movers.',
  testimonials: [
    {
      quote:
        'My clinic in MP Nagar serves a lot of government employees — they expect professionalism. Before Doxxy, we managed everything on paper. The register, the prescription pad, the billing receipt book. It worked for 20 years, but in the last 3-4 years, patients started asking "can you WhatsApp me the prescription" or "can I pay by UPI." Doxxy brought us up to what our patients expected. The transition was surprisingly smooth — my staff of two learned it in under a week.',
      name: 'Dr. Alok Shrivastava',
      clinic: 'Shrivastava Clinic, MP Nagar, Bhopal',
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop',
    },
    {
      quote:
        'I run a dental clinic near MANIT. My patients are mostly students and faculty — they all expect WhatsApp booking and digital everything. I was managing appointments on a paper diary until 2025. Doxxy\'s patient self-booking portal alone changed my practice. Students book their own slots online, get automatic reminders, and receive post-procedure instructions on WhatsApp. My front-desk time dropped by 60%, and my RCT completion rate improved because patients actually remember their second and third visits now.',
      name: 'Dr. Zara Siddiqui',
      clinic: 'Siddiqui Dental Care, Hoshangabad Road, Bhopal',
      photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'Does Doxxy work for clinics that serve both tech-savvy and non-tech-savvy patients?',
      answer:
        'Yes. This dual-demographic reality is the exact problem Doxxy was designed for. For tech-comfortable patients, Doxxy provides QR-code self-check-in, WhatsApp booking and reminders, digital prescriptions, and UPI payments — a modern, frictionless experience. For patients who are not comfortable with smartphones — elderly patients, rural visitors, or anyone who simply prefers a human touch — Doxxy\'s assisted-registration mode lets your receptionist complete their intake in under 30 seconds using a simple form on any device. Both pathways feed the same digital patient record, so there is no split system. A patient who does assisted registration today can scan a QR next week — their history is unified either way. This dual-mode design is what makes Doxxy uniquely suited for Bhopal clinics.',
    },
    {
      question: 'How does Doxxy handle the higher regulatory scrutiny Bhopal clinics face as the state capital?',
      answer:
        'Bhopal clinics face more frequent and more rigorous inspections than clinics in any other MP city because the Directorate of Health Services, the MP Medical Council, and the state health secretariat are all located in Bhopal. Doxxy maintains all records in formats compliant with the MP Nursing Home Act and BMC regulations. All records are timestamped, digitally signed, access-controlled, and auditable. Statutory registers are auto-generated daily. For inspections — which can be triggered with as little as a day\'s notice — Doxxy produces a complete compliance package (patient register, procedure log, Schedule H/H1 drug records, biomedical waste documentation) in under two minutes. This transforms the inspection experience from a multi-day paper-search exercise into a routine checkpoint.',
    },
    {
      question: 'Can Doxxy work in Old Bhopal areas where internet connectivity is inconsistent?',
      answer:
        'Doxxy is a cloud platform that requires an active internet connection. For clinics in Old Bhopal areas where broadband may be unreliable, we recommend a 4G hotspot (JioFi or Airtel 4G dongle) which provides more than sufficient bandwidth — Doxxy uses under 50MB of data daily for a typical 35-patient clinic. We also offer a lightweight offline queue mode where the token system continues to function during brief internet drops, syncing automatically when the connection resumes. Most Bhopal clinics across all areas — Old City, New Bhopal, Kolar, and the lakeside colonies — find that a basic 4G connection provides complete operational reliability.',
    },
    {
      question: 'Does Doxxy support Hindi prescriptions and patient communication in Bhopal?',
      answer:
        'Yes. Hindi is the primary communication language for the majority of Bhopal\'s patient population, and Doxxy\'s Hindi support is native and complete. WhatsApp reminders, appointment confirmations, queue updates, prescriptions, and post-care instructions can all be delivered in Hindi. Prescriptions can be generated in Hindi script for patients who prefer it. For clinics in areas with significant Urdu-speaking populations (Old Bhopal, Itwara, Chowk), we can configure custom Urdu message templates for common communications. English is also fully supported and can be set as the default for clinics primarily serving the professional demographic in MP Nagar and Arera Colony.',
    },
    {
      question: 'Is Doxxy affordable for a clinic in Bhopal where consultation fees are ₹300-₹400?',
      answer:
        'Yes, and the ROI is even more compelling at lower consultation fees because operational efficiency directly impacts margins. Doxxy\'s free tier covers the first 100 consultations per month. Beyond that, it is ₹10 per consultation with no monthly minimum and no setup fee. For a Bhopal clinic seeing 20-25 patients daily at an average fee of ₹400, the monthly Doxxy cost is approximately ₹3,500-₹5,000. Preventing one no-show per day (₹400) covers the entire monthly cost. Reducing billing errors by even half — from 10% leakage to 5% on ₹5L monthly revenue — recovers ₹25,000 per month. For a Bhopal clinic operating on lean margins, Doxxy is not a cost centre; it is the most direct path to improving practice profitability.',
    },
  ],
}

export default config
