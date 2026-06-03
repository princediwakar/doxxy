// Path: config/cities/chandigarh.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'chandigarh',
  cityName: 'Chandigarh',
  state: 'Chandigarh (UT)',
  heroTitle: 'Chandigarh Clinic Management Software — Digital for India\'s Most Planned City',
  heroSubtitle:
    'Chandigarh\'s 5,000+ clinics — spread across sectors, serving the Tricity of Chandigarh-Panchkula-Mohali — operate under a unique Union Territory regulatory framework. Doxxy brings digital records, WhatsApp patient engagement, UPI billing, and UT-compliant documentation to the city Le Corbusier designed.',
  problemTitle: 'Why Chandigarh\'s Clinics Need Software That Understands Union Territory Regulations',
  problemDescription:
    'Chandigarh is unique in Indian healthcare administration. As a Union Territory that also serves as the capital of two states — Punjab and Haryana — its regulatory framework is a hybrid unlike any other city. Clinics in Chandigarh proper are regulated by the UT Health Department under the Chandigarh Administration, but the Punjab Medical Council provides professional oversight for many practitioners, and the proximity to Panchkula (Haryana) and Mohali (Punjab) creates a Tricity healthcare market where patients, doctors, and regulations cross borders daily. A clinic in Sector 22 may see patients from Chandigarh, Panchkula, and Mohali in a single OPD session — each jurisdiction with different insurance, reimbursement, and documentation expectations. The old sectors (Sector 15, 16, 22, 35) house established clinics that have run on paper for 25-30 years with loyal patient bases, while newer clinics in the southern sectors and the rapidly growing periphery serve a younger, tech-expecting demographic of IT professionals, university students from Panjab University and PEC, and corporate employees. Chandigarh\'s high literacy rate (86%) and per capita income (among the highest in India) create a patient base that expects structured, professional clinic experiences — but most clinics still deliver paper prescriptions, manual billing, and phone-call-based appointment booking. The Tricity\'s grid-sector layout, while orderly, creates a unique operational challenge: patients choose clinics based on sector proximity, not neighbourhood names, and a clinic\'s catchment is defined by a 3-4 sector radius. This makes WhatsApp-based patient communication — queue tracking, reminders, prescription delivery — disproportionately valuable because it bridges the physical sector gap. The UT Health Department\'s documentation requirements are evolving with ABDM, and Chandigarh clinics — operating directly under the central government\'s administrative purview — will face compliance expectations sooner than clinics in most states.',
  clinicStats: {
    estimatedClinics: '5,000+',
    avgPatientsPerDay: '25-45',
    softwareAdoptionRate: '22%',
    abdmComplianceRate: '20%',
    paperUsageRate: '58%',
    specialtyMix: '28% multispecialty, 18% dental, 15% dermatology, 14% general practice, 25% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹600-900',
    avgMonthlyRevenue: '₹7L - ₹11L',
    avgNoShowRate: '22%',
    estimatedMonthlyLossToNoShows: '₹1.5L - ₹2.4L per month',
    avgBillingErrorRate: '5-7%',
  },
  techContext: {
    whatsappPenetration: '93%',
    digitalPaymentAdoption: '78%',
    internetPenetration: '88%',
  },
  regulatoryNotes:
    'Chandigarh clinics operate under a unique Union Territory regulatory structure. The UT Health Department under the Chandigarh Administration is the primary regulatory body for clinic registration, licensing, and inspections — unlike states where a state health department governs. The Punjab Medical Council provides professional oversight and registration for many practitioners in Chandigarh, creating a dual-authority framework. The Chandigarh Clinical Establishments (Registration and Regulation) Rules apply to all clinics. Patient records must be maintained for a minimum of 3 years. The Chandigarh Administration has been digitising health services, and ABDM compliance expectations for private clinics are emerging directly from central government directives rather than state-level interpretation — making adherence timelines tighter. Clinics with indoor facilities must additionally comply with the Chandigarh Nursing Home Registration Rules. The Tricity nature of the market (Chandigarh-Panchkula-Mohali) means that some clinics serve patients covered by Haryana and Punjab health schemes, requiring cross-jurisdictional documentation awareness.',
  solutionTitle: 'Doxxy for Chandigarh: UT-Compliant, Tricity-Ready, Sector-Wise Smart',
  solutionDescription:
    'Doxxy is built for Chandigarh\'s unique healthcare landscape. The platform handles UT-specific regulatory documentation, auto-generating registers compliant with the Chandigarh Clinical Establishments Rules and the dual oversight of the UT Health Department and Punjab Medical Council. For clinics serving the Tricity, Doxxy provides a unified platform that works across Chandigarh, Panchkula, and Mohali — patient records are centralised regardless of which Tricity location the patient visits. WhatsApp communication in Hindi, Punjabi, and English matches Chandigarh\'s trilingual patient base. QR-code check-in eliminates the paper registration bottleneck that wastes time in sector clinics where space is at a premium (most sector clinics operate out of ground-floor residential units with limited waiting areas). UPI billing auto-generates invoices and catches the 5-7% revenue leakage from manual billing errors. And for Chandigarh\'s high-income, high-expectation patient demographic — government officers, university professors, IT professionals, and retired senior citizens — Doxxy delivers the structured, professional clinic experience they expect from a city that consistently ranks at the top of India\'s liveability indices.',
  keyFeatures: [
    {
      icon: 'shield',
      title: 'UT-Specific Compliance & Dual-Authority Documentation',
      description:
        'Chandigarh\'s regulatory framework is unlike any state — the UT Health Department governs clinic registration and licensing, while the Punjab Medical Council provides professional oversight. Doxxy maintains records compliant with both authorities. Statutory registers under the Chandigarh Clinical Establishments Rules are auto-generated. ABDM compliance with ABHA ID creation is built in. Because Chandigarh is a UT directly under central administration, ABDM directives come faster and with tighter timelines — Doxxy keeps clinics ahead of these mandates rather than scrambling to catch up.',
    },
    {
      icon: 'messageSquare',
      title: 'Trilingual WhatsApp — Hindi, Punjabi & English',
      description:
        'Chandigarh\'s patient population is trilingual: Hindi is the lingua franca, Punjabi is widely spoken especially among patients from Mohali and the northern sectors, and English is preferred by the city\'s large professional and academic demographic. Doxxy delivers all patient communication — reminders, queue updates, prescriptions, lab reports, post-care instructions — in the patient\'s preferred language. For clinics near Panjab University (Sector 14, 15) where patient demographics include students from across North India, the multilingual support is particularly valuable.',
    },
    {
      icon: 'mapPin',
      title: 'Tricity Unified Platform — Chandigarh, Panchkula & Mohali',
      description:
        'Many Chandigarh-based doctors run OPDs across the Tricity — a morning clinic in Sector 22, an evening OPD in Panchkula, and consultations in Mohali. Doxxy provides a unified dashboard across all locations. Patient records are centralised: a patient registered in the Sector 22 clinic is instantly accessible at the Panchkula and Mohali locations. Revenue, patient counts, and no-show data are broken down by Tricity location. For clinics that serve patients from Haryana and Punjab health schemes, jurisdiction-aware documentation is generated automatically.',
    },
    {
      icon: 'smartPhone',
      title: 'Space-Efficient Digital Check-In for Sector Clinics',
      description:
        'Most Chandigarh sector clinics operate from ground-floor residential units converted into clinic spaces — typically 300-500 square feet with a small waiting area that can hold 6-8 patients comfortably. When patient volumes hit 30-40 per OPD, the waiting area overflows. Doxxy\'s QR-code check-in and WhatsApp live queue tracking lets patients register digitally and monitor their token position from outside — the sector market parking lot, a nearby coffee shop, or their home two sectors away. They walk in only when their turn is approaching. Cuts perceived wait time by 60% and eliminates waiting room crowding entirely.',
    },
    {
      icon: 'creditCard',
      title: 'UPI Billing & Revenue Integrity for High-Value Practices',
      description:
        'Chandigarh\'s average consultation fee (₹600-₹900) is higher than most tier-2 cities, reflecting the UT\'s high per capita income. Billing errors at 5-7% on a practice generating ₹10L monthly translate to ₹50,000-₹70,000 of monthly leakage. Doxxy auto-generates itemised invoices with UPI QR at checkout. Built-in charge validation catches undercharges. WhatsApp payment links for follow-up settlements. In a city where 78% of transactions are already digital, Doxxy\'s UPI-first billing aligns with patient expectations.',
    },
    {
      icon: 'fileText',
      title: 'Digital Prescriptions for Chandigarh\'s Seasonal & Chronic Disease Mix',
      description:
        'Chandigarh\'s climate — foggy winters, a defined monsoon, and a hot summer — drives predictable seasonal presentations: respiratory infections peak during the December-January fog, vector-borne diseases (dengue) spike post-monsoon (September-November), and heat-related illnesses are common in May-June. Doxxy includes pre-templated prescriptions for these seasonal conditions. For Chandigarh\'s large elderly population (the city has one of India\'s highest proportions of retired senior citizens), the chronic disease management templates — diabetes, hypertension, COPD, osteoarthritis — are comprehensive and pre-configured.',
    },
  ],
  whyDoxxyInThisCity:
    'Chandigarh is India\'s most regulationally unique healthcare market. The UT framework creates compliance complexity that no generic clinic software addresses. Doxxy\'s UT-specific compliance engine auto-handles the dual-authority documentation that Chandigarh clinics need — UT Health Department plus Punjab Medical Council. For the Tricity-wide practices common in Chandigarh, Doxxy\'s unified multi-location dashboard eliminates the fragmented-record problem. With 93% WhatsApp penetration, 78% digital payments, and India\'s second-highest per capita income, Chandigarh\'s patient base expects digital-first clinic experiences. Doxxy lets Chandigarh clinics deliver what their city\'s demographic profile demands.',
  testimonials: [
    {
      quote:
        'I have been running my clinic in Sector 22 for 18 years. The regulatory paperwork changed when Chandigarh\'s Clinical Establishments Rules were strengthened — suddenly there were new registers, new formats, new retention requirements. I spent more time on compliance than on patients for about six months. Doxxy\'s UT compliance module automated all of it. The registers are auto-generated. ABHA IDs are captured at registration. When the UT health inspector comes, I produce everything in two minutes. For a Chandigarh clinic owner, this alone is worth the price.',
      name: 'Dr. Harpreet Singh',
      clinic: 'Singh Medical Centre, Sector 22-C, Chandigarh',
      photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop',
    },
    {
      quote:
        'I see patients at my Chandigarh clinic and my Panchkula clinic. Before Doxxy, it was two separate paper registers, two sets of files, zero record continuity. A patient seen in Chandigarh on Tuesday would show up in Panchkula on Friday and I would have no idea what I prescribed. Doxxy\'s unified dashboard fixed this completely. Now I see their full history regardless of which location they visit. My patients notice the difference — "doctor, you remembered my last prescription" — and that builds trust.',
      name: 'Dr. Gurpreet Kaur',
      clinic: 'Kaur Dermatology, Sector 35-C, Chandigarh & Sector 11, Panchkula',
      photo: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'How does Doxxy handle Chandigarh\'s unique UT regulatory requirements?',
      answer:
        'Doxxy is configured for Chandigarh\'s dual-authority regulatory framework: the UT Health Department (under the Chandigarh Administration) for clinic registration, licensing, and inspections, and the Punjab Medical Council for professional oversight. The platform maintains records compliant with the Chandigarh Clinical Establishments (Registration and Regulation) Rules. All statutory registers — daily patient register, procedure log, Schedule H/H1 drug dispensing records, biomedical waste documentation — are auto-generated in UT-prescribed formats. ABHA ID creation and ABDM compliance are built in. The documentation automatically accounts for the Tricity reality: patients from Panchkula covered by Haryana health schemes and patients from Mohali covered by Punjab schemes are flagged with jurisdiction-appropriate documentation. For UT health inspections, Doxxy produces a complete compliance package in under two minutes.',
    },
    {
      question: 'Can Doxxy handle multi-location practices across the Tricity (Chandigarh-Panchkula-Mohali)?',
      answer:
        'Yes. Doxxy\'s multi-location dashboard is built for the Tricity practice model that is common in Chandigarh. Many doctors run OPDs in two or three locations across Chandigarh, Panchkula, and Mohali. Doxxy provides a unified dashboard with centralised patient records — a patient registered at the Sector 22 clinic has their complete history instantly available at the Panchkula and Mohali locations. Revenue, patient counts, no-show data, and pharmacy inventory are broken down per location with a consolidated Tricity-level view. For patients covered by different state health schemes (Haryana in Panchkula, Punjab in Mohali), jurisdiction-aware documentation is generated automatically. Multi-location is included in all paid plans.',
    },
    {
      question: 'Does Doxxy support Punjabi language for patient communication in Chandigarh?',
      answer:
        'Yes. Doxxy supports patient communication in Punjabi, Hindi, and English. WhatsApp reminders, appointment confirmations, queue updates, prescriptions, and post-care instructions can be delivered in all three languages. Language preference is set per patient. This trilingual capability is critical for Chandigarh clinics because the patient base is genuinely trilingual: Hindi as the default, Punjabi as the preferred language for a large segment (especially in the northern sectors and patients from Mohali), and English for the professional and academic demographic. Doxxy handles the language switching transparently.',
    },
    {
      question: 'My sector clinic has very limited waiting space — how does Doxxy help with this?',
      answer:
        'Chandigarh\'s sector clinics typically operate from ground-floor residential units with waiting areas that accommodate 6-8 patients. When a doctor sees 35-45 patients per OPD, the waiting area overflows — patients stand outside, crowd the reception area, and generally create a chaotic environment. Doxxy\'s QR-code check-in and WhatsApp live queue tracking solve this structurally. Patients check in by scanning a QR code (on their phone or at reception), receive their token number via WhatsApp, and track their live queue position from anywhere — the sector market, their car, their home two sectors away. They walk in only when their turn is approaching. Clinics using this feature report a 60-70% reduction in physical waiting room occupancy, which transforms the patient experience for both the clinic and the patients.',
    },
    {
      question: 'Is Doxxy affordable for a Chandigarh clinic, and what is the ROI timeline?',
      answer:
        'Doxxy\'s free tier covers the first 100 consultations per month. Beyond that, it is ₹10 per consultation with no monthly minimum and no setup fee. For a typical Chandigarh clinic seeing 25-30 patients per day, the monthly cost is approximately ₹4,500-₹6,000. Given Chandigarh\'s average consultation values (₹600-₹900), preventing one no-show per day pays for the entire month\'s Doxxy usage. Reducing billing errors by half (from 6% to 3% on ₹10L monthly revenue) recovers ₹30,000 per month. The compliance automation alone — eliminating the hours spent preparing for UT health inspections — saves the doctor or practice manager 10-15 hours per quarter. In Chandigarh, the ROI on Doxxy is typically achieved within the first two weeks of operation.',
    },
  ],
}

export default config
