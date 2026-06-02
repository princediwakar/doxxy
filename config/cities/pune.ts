// Path: config/cities/pune.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'pune',
  cityName: 'Pune',
  state: 'Maharashtra',
  heroTitle: 'Pune Clinic Management Software — Digital-First for a Growing Healthcare Hub',
  heroSubtitle:
    'Pune\'s 8,000+ clinics serve one of India\'s fastest-growing populations — students, IT professionals, and retirees. With 20% software adoption and 94% WhatsApp penetration, Pune clinics are ready to go digital. Doxxy helps them get there in days, not months.',
  problemTitle: 'Why Pune\'s Rapidly Growing Clinic Sector Is Outgrowing Paper',
  problemDescription:
    'Pune sits at an inflection point. The city\'s population has grown over 40% in the last decade, driven by IT expansion in Hinjewadi, manufacturing in Chakan and Pimpri-Chinchwad, and a steady influx of students and retirees attracted by the city\'s climate and educational institutions. This population growth has created a healthcare demand surge that Pune\'s clinics — many of them established 15-20 years ago and still running on paper — are struggling to meet. A clinic in Kothrud that comfortably handled 25 patients a day in 2015 is now seeing 40-45, with the same staff, same space, and same paper-based processes. The friction points are classic: registration taking too long, prescription pads running out mid-OPD, patient records that take 5 minutes to retrieve from a filing cabinet, and no visibility into which patients are showing up and which are not. Pune\'s unique demographic mix adds complexity: an IT professional in Hinjewadi expects online booking and WhatsApp communication, while a retiree in Model Colony prefers a phone call in Marathi. Clinics must serve both segments seamlessly. Pune\'s software adoption rate of 20% is higher than the national average (driven by proximity to Mumbai\'s tech ecosystem), but most clinics using software are on outdated, locally built desktop applications that do not support mobile, WhatsApp, or UPI — and upgrading means starting over. The Maharashtra Nursing Home Act compliance requirements are the same as Mumbai\'s, and ABDM deadlines are approaching. Pune clinics need a platform that bridges their existing workflows to a digital future — without requiring a complete operational overhaul or a dedicated IT person.',
  clinicStats: {
    estimatedClinics: '8,000+',
    avgPatientsPerDay: '30-50',
    softwareAdoptionRate: '20%',
    abdmComplianceRate: '26%',
    paperUsageRate: '60%',
    specialtyMix: '35% multispecialty, 20% dental, 15% general practice, 10% dermatology, 20% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹700-1,000',
    avgMonthlyRevenue: '₹8L - ₹12L',
    avgNoShowRate: '26%',
    estimatedMonthlyLossToNoShows: '₹2L - ₹3L per month',
    avgBillingErrorRate: '5-8%',
  },
  techContext: {
    whatsappPenetration: '94%',
    digitalPaymentAdoption: '76%',
    internetPenetration: '84%',
  },
  regulatoryNotes:
    'Pune clinics are regulated under the Maharashtra Nursing Home Act and the Pune Municipal Corporation (PMC) health department. The same 3-year record retention requirement applies as in Mumbai. Pimpri-Chinchwad clinics fall under the PCMC jurisdiction, which has its own health establishment registration requirements. Pune has been included in Maharashtra\'s ABDM pilot expansion, and clinics in the PMC and PCMC areas are expected to begin ABDM compliance in the near term.',
  solutionTitle: 'Doxxy for Pune: Bridge from Paper to Digital in Days',
  solutionDescription:
    'Doxxy is built for clinics that are ready to move beyond paper and outdated desktop software — without the pain of a complex migration. The platform works on any device with a browser: the existing laptop at reception, the doctor\'s tablet, the staff\'s phones. No server hardware. No installation. A clinic can be live on Doxxy in a single afternoon. QR-code check-in eliminates paper registration forms. WhatsApp reminders in Marathi, Hindi, and English target the 26% no-show rate. UPI billing auto-generates invoices and catches undercharges. Digital prescriptions are templated and generated in under 60 seconds. For clinics currently on legacy desktop software, Doxxy offers a patient data import pathway that preserves existing records while transitioning to a modern, mobile-first platform.',
  keyFeatures: [
    {
      icon: 'smartPhone',
      title: 'Same-Day Setup — Cloud, No IT Required',
      description:
        'Doxxy needs no server, no installation, and no IT staff. Open a browser on any device — the reception laptop, a tablet, or a phone — log in, and start seeing patients. Clinics can be fully operational by the afternoon session on the same day they sign up. This is critical for Pune clinics that cannot afford a week of downtime for software migration.',
    },
    {
      icon: 'messageSquare',
      title: 'WhatsApp in Marathi, Hindi & English',
      description:
        'With 94% WhatsApp penetration in Pune, Doxxy uses WhatsApp as the primary patient channel. Reminders, queue updates, prescriptions, lab reports, and post-care instructions are delivered in the patient\'s preferred language — Marathi, Hindi, or English. Clinics in areas like Peth, Kothrud, and Model Colony with predominantly Marathi-speaking patients can configure their default language accordingly.',
    },
    {
      icon: 'fileText',
      title: 'Templated Prescriptions for Pune\'s Common Presentations',
      description:
        'Pune\'s climate — moderate year-round with seasonal spikes in vector-borne diseases (dengue August-October, chikungunya and malaria) and respiratory infections during the monsoon — creates predictable seasonal case patterns. Doxxy\'s specialty templates cover the 50 most common prescriptions seen in Pune OPDs, with pre-filled medication, dosage, and instructions. The doctor reviews, adjusts, and signs — in under 60 seconds.',
    },
    {
      icon: 'users',
      title: 'Patient Self-Booking Portal',
      description:
        'Share a booking link via WhatsApp or display a QR code at reception. Patients book available slots themselves, choosing time and doctor. The booking auto-populates the day\'s schedule. For Pune clinics serving IT professionals who expect self-service convenience, this eliminates the back-and-forth phone calls that clog the reception desk.',
    },
    {
      icon: 'creditCard',
      title: 'UPI Billing & Digital Collection',
      description:
        'Auto-generated itemised invoices at checkout with UPI QR. WhatsApp payment links for remote settlement or follow-up payments. Built-in charge validation catches the 5-8% revenue leakage from manual billing errors. For a Pune clinic with ₹10L monthly revenue, that is ₹50,000-₹80,000 per month currently being lost to missed charges.',
    },
    {
      icon: 'shield',
      title: 'PMC/PCMC & Nursing Home Act Compliance',
      description:
        'Auto-generated statutory registers compliant with the Maharashtra Nursing Home Act and PMC/PCMC health establishment requirements. ABHA ID creation and linking for ABDM compliance. Audit-ready record production for municipal health inspections. No more panic when the PMC health officer schedules a visit.',
    },
  ],
  whyDoxxyInThisCity:
    'Pune is India\'s most promising clinic software market — rapidly growing, digitally aware, and underserved by modern platforms. Most Pune clinics are either still on paper or stuck on outdated desktop software that cannot support WhatsApp, UPI, or mobile access. Doxxy gives these clinics a bridge to the modern stack: cloud-based, mobile-first, no IT required, and live in an afternoon. With 94% WhatsApp penetration and 76% digital payment adoption, the patient base is ready for digital-first clinic experiences. Doxxy lets Pune clinics deliver what their patients already expect.',
  testimonials: [
    {
      quote:
        'I had been using the same desktop software for 9 years. It worked — barely — but it did not do WhatsApp, UPI, or online booking. Upgrading felt like it would be a nightmare. Doxxy\'s team had me live in one afternoon. My receptionist learned it in two days. The WhatsApp reminders alone cut my no-shows from 28% to 15%. I wish I had switched years ago.',
      name: 'Dr. Amit Deshmukh',
      clinic: 'Deshmukh Clinic, Kothrud, Pune',
      photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop',
    },
    {
      quote:
        'My dental practice in Baner serves mostly IT professionals from Hinjewadi. They expect online booking, WhatsApp communication, and digital everything. Before Doxxy, I was managing appointments on a paper diary, sending reminder messages manually, and taking photos on my phone. Doxxy brought everything together. Patients book themselves, get automatic reminders, receive their prescriptions on WhatsApp. It matches what my patients expect from a modern clinic.',
      name: 'Dr. Shweta Kulkarni',
      clinic: 'Smile Studio Dental, Baner',
      photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'How quickly can my Pune clinic start using Doxxy?',
      answer:
        'Most Pune clinics are live on Doxxy within the same day. The process is: sign up (5 minutes), add your doctors and staff (10 minutes), import any existing patient data if needed (varies by volume but typically under an hour), and start seeing patients. No server setup, no software installation, no IT staff required. Doxxy works on any device with a browser — the existing reception laptop, a tablet, or a phone. We recommend starting with a single OPD session to get comfortable, and most clinics are running fully on Doxxy by the next day.',
    },
    {
      question: 'Can I import my existing patient data from my old desktop software?',
      answer:
        'Yes. Doxxy supports patient data import from CSV exports, which most legacy desktop systems can generate. Our team assists with the import process to ensure patient names, phone numbers, and basic demographics transfer correctly. While historical clinical notes from legacy systems may not transfer in full structured format, the core patient database migrates cleanly. For clinics with large patient databases (5,000+ records), we recommend scheduling the import over a weekend to avoid disruption.',
    },
    {
      question: 'Does Doxxy support Marathi for prescriptions and patient communication?',
      answer:
        'Yes. Marathi is fully supported for patient communication — WhatsApp reminders, appointment confirmations, and post-care instructions can be delivered in Marathi. Prescriptions can be generated in Marathi script for patients who prefer it. The platform also supports Hindi and English, and the language preference is set per patient. This is particularly valuable for Pune clinics in areas like Peth, Sahakar Nagar, and Sinhagad Road where a significant proportion of patients prefer Marathi.',
    },
    {
      question: 'How does Doxxy handle the seasonal disease outbreaks common in Pune?',
      answer:
        'Pune experiences predictable seasonal disease patterns — vector-borne diseases (dengue, chikungunya, malaria) during and after the monsoon (August to October), respiratory infections during the rainy season, and gastroenteritis cases in summer. Doxxy\'s templated prescription system includes these seasonal presentations with pre-configured medication, dosage, and investigation recommendations. During outbreak periods, clinics can create custom quick-prescription templates for the specific circulating strain. The analytics dashboard also tracks diagnosis trends, helping clinics identify outbreak patterns in their own patient population before they are widely reported.',
    },
    {
      question: 'Is Doxxy affordable for a small, single-doctor clinic in Pune?',
      answer:
        'Yes. Doxxy\'s free tier covers the first 100 consultations per month — sufficient for a clinic seeing 4-5 patients daily. After that, it is ₹10 per consultation with no monthly minimum and no setup fee. For a typical single-doctor clinic in Pune seeing 20-25 patients per day, the monthly cost is approximately ₹4,000-₹5,000 — less than the cost of a part-time assistant. The ROI is immediate: preventing one no-show per day (₹700-₹1,000 in Pune) covers the entire monthly cost. Reducing billing errors by even half recovers another ₹25,000-₹40,000 monthly. Doxxy is not a cost — it is a revenue protection investment.',
    },
  ],
}

export default config
