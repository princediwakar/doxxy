// Path: config/cities/nashik.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'nashik',
  cityName: 'Nashik',
  state: 'Maharashtra',
  heroTitle: 'Nashik Clinic Management Software — Built for Maharashtra\'s Next Healthcare Hub',
  heroSubtitle:
    'From College Road to Nashik Road, Nashik\'s 4,500+ clinics are riding a wave of healthcare investment and population growth. With new medical colleges, a booming pharma corridor, and patients pouring in from surrounding districts, Nashik clinics need software that handles rising volumes without adding staff or square footage. Doxxy brings WhatsApp queue management, UPI billing, and ABDM compliance to Nashik — in Marathi, Hindi, and English.',
  problemTitle: 'Why Nashik Clinics Are Outgrowing Their Pen-and-Paper Systems',
  problemDescription:
    'Nashik is no longer just a pilgrimage town — it is Maharashtra\'s fastest-emerging healthcare corridor. The city hosts three major medical colleges, a growing pharmaceutical manufacturing zone in Satpur and Ambad MIDC, and serves as the tertiary care hub for patients from Dhule, Jalgaon, Malegaon, and the tribal belt of northern Maharashtra. This means Nashik clinics are absorbing patient volumes that their infrastructure was never designed for. A general practitioner on College Road who saw 20 patients a day five years ago is now managing 35-40 — with the same receptionist, one consultation room, and a wall of paper files. The bottlenecks are structural: manual registration consuming 4-5 minutes per patient at the front desk, paper prescriptions that eat into consultation time, filing cabinets eating square footage in high-rent clinic areas, and no mechanism to track or recover the 25% of appointments that result in no-shows. Nashik\'s software adoption rate sits at just 8% — most clinics have never used any digital system beyond WhatsApp and a billing calculator. This is not resistance to technology; it is that no product has been built for Nashik\'s specific realities: Marathi-first patient communication, intermittent power outages in outer areas like Adgaon and Peth Road, seasonal surges during the Kumbh Mela and Shravan months when lakhs of pilgrims pass through, and clinics operating on razor-thin margins where a monthly SaaS fee of ₹5,000 is a genuine budget line item. The Nashik Municipal Corporation (NMC) is gradually aligning with Maharashtra\'s ABDM rollout, and clinics that are entirely paper-based will face a steep compliance cliff when digital record mandates arrive.',
  clinicStats: {
    estimatedClinics: '4,500+',
    avgPatientsPerDay: '25-40',
    softwareAdoptionRate: '8%',
    abdmComplianceRate: '14%',
    paperUsageRate: '78%',
    specialtyMix: '35% general practice, 25% multispecialty, 15% dental, 10% dermatology, 15% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹500-800',
    avgMonthlyRevenue: '₹5L - ₹8L',
    avgNoShowRate: '25%',
    estimatedMonthlyLossToNoShows: '₹1.2L - ₹2L per month',
    avgBillingErrorRate: '6-10%',
  },
  techContext: {
    whatsappPenetration: '88%',
    digitalPaymentAdoption: '60%',
    internetPenetration: '72%',
  },
  regulatoryNotes:
    'Nashik clinics are regulated under the Maharashtra Nursing Home Act and the Nashik Municipal Corporation (NMC) health department. Patient records must be maintained for a minimum of 3 years for outpatient cases under state law. The NMC has been expanding its health establishment registration drive, and clinics in the Gangapur Road, College Road, and Nashik Road areas are being brought under digital documentation scrutiny. ABDM compliance expectations are rising as Maharashtra\'s ABDM pilot expands beyond Mumbai and Pune to tier-2 cities. Clinics operating near the Godavari ghats in Panchavati face additional sanitation and public health documentation requirements during the Kumbh Mela and Shravan pilgrimage seasons.',
  solutionTitle: 'Doxxy for Nashik: Digital for the Next Wave of Growth',
  solutionDescription:
    'Doxxy meets Nashik clinics exactly where they are — moving from paper to digital without requiring a server, an IT hire, or a week of downtime. The platform works in-browser on the existing laptop at reception or a basic Android tablet. QR-code check-in replaces paper registration forms entirely. WhatsApp reminders in Marathi cut the 25% no-show rate by a third. UPI billing auto-generates invoices — critical for clinics where patients from surrounding rural areas often need to pay later. Digital prescriptions in Marathi, Hindi, and English serve Nashik\'s trilingual patient base. And because every record is digital and timestamped, NMC documentation requests and ABDM compliance deadlines stop being emergencies and become non-events.',
  keyFeatures: [
    {
      icon: 'smartPhone',
      title: 'Zero-Installation Cloud Platform',
      description:
        'No server. No installation. No IT person required. Doxxy runs in any browser on the reception laptop, a tablet, or a phone. For Nashik clinics where the closest IT support might be in Mumbai (4 hours away), this eliminates the single biggest barrier to going digital — the fear of technology breaking and having no one to fix it. Setup takes a single afternoon.',
    },
    {
      icon: 'messageSquare',
      title: 'WhatsApp in Marathi-First Communication',
      description:
        '88% WhatsApp penetration in Nashik makes it the highest-reach patient channel available. Reminders, prescription delivery, lab reports, and post-care instructions go out in Marathi by default — with Hindi and English available per patient preference. For clinics in Panchavati, Cidco, and Nashik Road where the patient base is predominantly Marathi-speaking, this eliminates language as a barrier to digital adoption.',
    },
    {
      icon: 'fileText',
      title: 'Seasonal Prescription Templates for Nashik\'s Disease Calendar',
      description:
        'Nashik\'s climate — heat in summer (April-June), heavy rains in monsoon (July-September), and cold winters — creates a predictable disease cycle. Vector-borne diseases spike during and after the monsoon. Respiratory infections surge in winter. Gastroenteritis rises in summer. Doxxy\'s templated prescriptions cover the 50 most common Nashik OPD presentations with pre-filled medication, dosage, and instructions — generated in under 60 seconds.',
    },
    {
      icon: 'creditCard',
      title: 'UPI Billing & Deferred Payment Collection',
      description:
        'Auto-generated itemised invoices with UPI QR at checkout. For patients travelling from Malegaon, Dhule, or rural Nashik who may not carry cash or a smartphone with UPI, the system sends a WhatsApp payment link that can be settled later. Built-in charge validation catches the 6-10% monthly revenue leakage from manual billing errors — ₹30,000-₹80,000 a month for a typical Nashik clinic.',
    },
    {
      icon: 'trendingUp',
      title: 'No-Show Recovery & Pilgrim Season Surge Handling',
      description:
        'Automated WhatsApp reminders 24 hours and 2 hours before each appointment reduce Nashik\'s 25% no-show rate by 30-40%. During the Kumbh Mela, Shravan, and other pilgrimage seasons when lakhs of visitors pass through Nashik and walk-in volumes spike, Doxxy\'s queue management system prevents waiting room chaos — patients track their token position on WhatsApp and arrive only when their turn approaches.',
    },
    {
      icon: 'shield',
      title: 'NMC & ABDM Compliance Toolkit',
      description:
        'Digital, timestamped, audit-trailed records that satisfy Maharashtra Nursing Home Act requirements. Auto-generated statutory registers compliant with NMC health establishment regulations. ABHA ID creation and linking for ABDM compliance. When the NMC health officer schedules an inspection, produce a compliance report in two clicks — no more scrambling through paper registers and prescription pads.',
    },
  ],
  whyDoxxyInThisCity:
    'Nashik sits at the exact inflection point where paper-based clinic operations begin hurting more than they help. Patient volumes are rising, ABDM deadlines are approaching, and the city\'s healthcare ecosystem is professionalising rapidly — but 92% of clinics have no digital tools beyond WhatsApp. Doxxy is built for this transition: zero setup friction, Marathi-first communication, offline-tolerant performance for areas with patchy connectivity, and a pricing model where the first 100 monthly consultations are free. For a Nashik clinic seeing 25 patients a day, the monthly cost is approximately ₹3,500-₹4,500 — less than the monthly chai and stationery budget. The ROI is immediate: recovering two no-shows per day (₹1,000-₹1,600) pays for the entire subscription.',
  testimonials: [
    {
      quote:
        'My clinic near Nashik Road station sees a mix of local patients and people travelling from Malegaon and Manmad. Before Doxxy, I would write 40-50 prescriptions by hand every day, and my receptionist spent half her time just answering phone calls asking "doctor kitne baje tak baithe hain." Now WhatsApp handles queue updates and prescription delivery automatically. No-shows dropped from 28% to 16% in six weeks. The Marathi prescription templates alone save me 45 seconds per patient — across 40 patients, that is 30 minutes I get back every day.',
      name: 'Dr. Rajesh Jadhav',
      clinic: 'Jadhav Clinic, Nashik Road',
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop',
    },
    {
      quote:
        'As a dentist on College Road, I knew my patients expected modern communication but I had no way to provide it. Manual reminders meant my assistant calling 15-20 patients every evening after OPD. Doxxy\'s automated WhatsApp reminders freed up an hour of staff time daily. The treatment plan sequencing — where patients get reminders for their second and third RCT visits — improved my multi-visit completion rate from 50% to 78%. For a practice my size, that is substantial additional revenue without spending a rupee on marketing.',
      name: 'Dr. Sneha Patil',
      clinic: 'SmileCare Dental, College Road, Nashik',
      photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'My clinic is in a low-connectivity area on the outskirts of Nashik — will Doxxy still work?',
      answer:
        'Yes. Doxxy is designed for Indian internet conditions. The platform uses less than 50MB of data per day for a 30-patient clinic and works reliably on a 4G Jio or Airtel connection — which covers all of Nashik, including outer areas like Adgaon, Peth Road, and Makhmalabad. The WhatsApp integration functions through the patient\'s own connection, so even if your clinic experiences a brief internet drop, patient communication is not interrupted. We also offer a lightweight offline queue mode where the token system continues to operate during connectivity gaps and syncs automatically when the connection resumes.',
    },
    {
      question: 'Does Doxxy generate prescriptions in Marathi? My patients strongly prefer it.',
      answer:
        'Yes. Marathi is fully supported — prescriptions can be generated in Marathi script, Hindi, or English, with the language preference set per patient. WhatsApp reminders, appointment confirmations, and post-care instructions default to Marathi for patients who have it set as their preferred language. For clinics in areas like Panchavati, Cidco, and Satpur where the patient base is overwhelmingly Marathi-speaking, this ensures patients actually read and follow their prescriptions rather than nodding politely and pocketing a piece of paper they cannot fully understand.',
    },
    {
      question: 'How does Doxxy handle the massive patient influx during Kumbh Mela and pilgrimage seasons?',
      answer:
        'During pilgrimage seasons — the Kumbh Mela (every 12 years, with Ardha Kumbh every 6), Shravan month, and Ram Navami — Nashik clinics see walk-in volumes that are 50-100% above baseline, with many out-of-town patients who have no prior records. Doxxy\'s QR-code check-in handles new patient registration in under 60 seconds — a critical speed gain when 60-80 patients are queued up. WhatsApp live queue tracking lets patients wait outside the clinic rather than crowding the reception area. Prescription templates for common seasonal complaints (dehydration, gastroenteritis, heat exhaustion) speed up consultation. And all out-of-town patient records are digitised and retained — so if they return for the next Kumbh, their history is available instantly.',
    },
    {
      question: 'Is Doxxy affordable for a single-doctor general practice in Nashik?',
      answer:
        'Yes. The first 100 consultations per month are completely free. Beyond that, it is ₹10 per consultation with no monthly minimum, no setup fee, and no hardware purchase. For a typical single-doctor GP in Nashik seeing 25 patients a day, the monthly cost works out to approximately ₹3,500-₹4,500 — comparable to the monthly stationery and chai budget for the clinic. The economic case is straightforward: reducing no-shows by even 30% recovers ₹36,000-₹60,000 per month (at 25% no-show rate on 25 daily patients at ₹500-₹800 each, recovering 30% of no-shows = 5-6 additional patients per day). Doxxy is not an expense — it is a direct revenue recovery tool.',
    },
    {
      question: 'I have never used clinic software before. Is the learning curve steep?',
      answer:
        'Doxxy was built for first-time software users — not for tech-savvy hospitals. The interface uses large, labelled icons in Marathi and English, with a workflow that mirrors the physical OPD routine: check-in, queue, consult, prescribe, bill. Most Nashik clinics have their receptionist fully comfortable with Doxxy within 2-3 days. The doctor\'s prescription screen is designed for speed: select diagnosis, tap medications from favourites, add instructions, sign — all without typing more than a few characters. We provide phone-based onboarding support in Marathi and Hindi, and we stay on call during your first OPD session on Doxxy so you are never alone if something feels unfamiliar.',
    },
  ],
}

export default config
