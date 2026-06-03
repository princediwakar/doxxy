// Path: config/cities/coimbatore.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'coimbatore',
  cityName: 'Coimbatore',
  state: 'Tamil Nadu',
  heroTitle: 'Coimbatore Clinic Management Software — Digital for South India\'s Healthcare Hub',
  heroSubtitle:
    'Coimbatore\'s 7,000+ clinics form the backbone of one of India\'s most mature private healthcare ecosystems. From RS Puram to Peelamedu, clinics serve a population that is medically literate, digitally savvy, and expects healthcare at par with Chennai. With 15% software adoption and 93% WhatsApp penetration, Coimbatore clinics are ready to move beyond paper and legacy desktop systems.',
  problemTitle: 'Why Coimbatore\'s Healthcare Capital Needs a Modern Clinic Platform',
  problemDescription:
    'Coimbatore is not a typical tier-2 city — it is arguably South India\'s second-most important healthcare destination after Chennai. The city has over 750 hospitals and nursing homes, a robust medical tourism inflow from neighbouring districts and northern Kerala, and a patient base that is among the most health-literate in India. The clinic sector (7,000+ establishments) is diverse: single-doctor OPDs in Saibaba Colony and Ganapathy, high-end dental practices along Avinashi Road and Race Course, multi-specialty polyclinics in RS Puram and Peelamedu, and a large number of Ayurveda and Siddha clinics that are integral to Tamil Nadu\'s AYUSH tradition. Despite this sophistication, 70% of clinics still use paper records. The ones that are digital are often running outdated, locally built desktop applications from the early 2010s — no mobile access, no WhatsApp integration, no UPI, and no cloud backup. The Tamil Nadu Private Clinical Establishments Act sets specific record-keeping standards, and with ABDM targets approaching, clinics face a compliance gap. The city\'s medical tourism flow from Kerala adds complexity: 15-20% of patients at established clinics are from Palakkad, Thrissur, and other Kerala districts, bringing cross-state record portability challenges. Coimbatore clinics need a platform that matches the city\'s healthcare maturity — modern, multilingual (Tamil, English, Malayalam), cloud-based, and compliant with Tamil Nadu regulations.',
  clinicStats: {
    estimatedClinics: '7,000+',
    avgPatientsPerDay: '30-50',
    softwareAdoptionRate: '15%',
    abdmComplianceRate: '18%',
    paperUsageRate: '70%',
    specialtyMix: '25% general practice, 20% multispecialty, 18% dental, 12% dermatology, 10% orthopaedics, 15% other (incl. AYUSH)',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹600-900',
    avgMonthlyRevenue: '₹7L - ₹12L',
    avgNoShowRate: '24%',
    estimatedMonthlyLossToNoShows: '₹1.6L - ₹2.5L per month',
    avgBillingErrorRate: '5-7%',
  },
  techContext: {
    whatsappPenetration: '93%',
    digitalPaymentAdoption: '74%',
    internetPenetration: '82%',
  },
  regulatoryNotes:
    'Coimbatore clinics are regulated under the Tamil Nadu Private Clinical Establishments (Regulation) Act and the Coimbatore City Municipal Corporation (CCMC) health department. The state mandates a 3-year minimum record retention for outpatient cases. Tamil Nadu has been a national leader in health systems strengthening, and ABDM adoption is being actively pushed through the state health department. Coimbatore\'s proximity to Kerala means clinics treating cross-state patients should maintain records that are portable and compliant with both state frameworks. Pharmacies in Coimbatore have high digital adoption, making e-prescription workflows immediately viable.',
  solutionTitle: 'Doxxy for Coimbatore: Tamil-First, Multi-Specialty, and Medical-Tourism-Ready',
  solutionDescription:
    'Doxxy is built for clinics that have outgrown paper and legacy desktop software but do not want the complexity of enterprise hospital systems. QR-code check-in eliminates paper intake forms and cuts registration to under a minute — critical for high-volume OPDs in RS Puram and Peelamedu seeing 50+ patients per session. WhatsApp reminders in Tamil, English, and Malayalam target the 24% no-show rate, with automated 24-hour and 2-hour nudges. Digital prescriptions support Tamil script — essential for elderly patients in areas like Town Hall, Ukkadam, and Sundarapuram. For clinics treating Kerala patients, Malayalam-language reminders and prescription support ensure cross-state patients are not excluded. UPI billing stops the 5-7% revenue leakage that costs a ₹10L-monthly practice ₹50,000-₹70,000 every month. And with Tamil Nadu\'s maturing ABDM push, Doxxy\'s built-in compliance toolkit keeps clinics ahead of regulatory deadlines.',
  keyFeatures: [
    {
      icon: 'smartPhone',
      title: 'QR-Code Check-In for High-Volume OPDs',
      description:
        'Coimbatore clinics routinely see 40-50 patients in a morning session. Four-minute-per-patient paper registration creates a 40-minute backlog before the doctor sees anyone. Doxxy\'s QR-code intake cuts registration to under 60 seconds, eliminating the front-desk bottleneck. Returning patients check in with a WhatsApp tap. The receptionist shifts from data entry to patient flow management.',
    },
    {
      icon: 'messageSquare',
      title: 'Trilingual WhatsApp: Tamil, English & Malayalam',
      description:
        'With 93% WhatsApp penetration, it is the universal patient communication channel. Doxxy delivers reminders, queue updates, prescriptions, and post-care instructions in Tamil, English, or Malayalam based on patient preference. For the 15-20% of patients visiting from Kerala districts (Palakkad, Thrissur), Malayalam communication eliminates language friction and improves follow-up compliance.',
    },
    {
      icon: 'fileText',
      title: 'Tamil-Script Prescriptions & Specialty Templates',
      description:
        'Generate prescriptions in Tamil, English, or Malayalam using templates pre-filled for Coimbatore\'s most common presentations — diabetes and metabolic disorders, respiratory allergies (Coimbatore\'s pollen seasons are notable), orthopaedic complaints from the city\'s active elderly population, and dermatological conditions. Tamil-script prescriptions are essential for elderly patients in traditional neighbourhoods.',
    },
    {
      icon: 'creditCard',
      title: 'UPI Billing & Revenue Integrity',
      description:
        'Auto-generated itemised invoices with UPI QR. WhatsApp payment links for follow-up settlements. Billing validation catches missed charges — the ₹100 injection, the ₹200 procedure tray, the ₹150 dressing kit. For a Coimbatore clinic billing ₹10L monthly, recovering 5% leakage adds ₹50,000 back to the practice each month — revenue that is already being earned but not collected.',
    },
    {
      icon: 'shield',
      title: 'Tamil Nadu Clinical Establishments Act Compliance',
      description:
        'Records maintained per Tamil Nadu state requirements: digitally timestamped, access-controlled, retained for the mandatory minimum period. Auto-generated statutory registers for CCMC health inspections. ABHA ID creation and linking for ABDM compliance. A two-click compliance report replaces hours of scrambling through paper registers before an inspection.',
    },
    {
      icon: 'users',
      title: 'Cross-State Patient Records for Medical Tourism',
      description:
        'Patients from Kerala districts visiting Coimbatore specialists — common for dermatology, orthopaedics, and dental procedures — get portable digital records accessible across visits. Treatment plans, prescriptions, and follow-up schedules are WhatsApp-delivered in Malayalam. For clinics, this means better treatment adherence, fewer drop-offs, and stronger referral networks into the Kerala market.',
    },
  ],
  whyDoxxyInThisCity:
    'Coimbatore is not a market that needs to be convinced about digital — it is a market frustrated by the gap between its healthcare sophistication and its clinic software options. Existing solutions are either enterprise hospital systems (overkill and overpriced for a 2-3 doctor clinic) or outdated desktop applications that have not been updated since UPI existed. Doxxy fills that gap: modern, cloud-based, Tamil-Malayalam-English fluent, and priced at ₹10 per consultation after the first 100 free. For a city where a single dental implant case can be worth ₹25,000, where a Kerala patient who completes their treatment plan is worth ₹15,000+ in revenue, and where 5-7% billing leakage on a ₹10L practice is ₹50,000-₹70,000 monthly — Doxxy is not an expense. It is a practice optimisation investment that pays back in weeks.',
  testimonials: [
    {
      quote:
        'My dental practice on Avinashi Road gets 30% of patients from Kerala — Palakkad, Thrissur, sometimes even Kochi. Before Doxxy, following up with them was a nightmare. Different state, different language expectations, no systematic reminder process. Now, they get WhatsApp reminders in Malayalam, their prescriptions are WhatsApp-delivered, and my multi-visit RCT completion rate is up from 60% to 85%. Patients actually complete their treatment plans.',
      name: 'Dr. Karthik Subramanian',
      clinic: 'Coimbatore Dental Specialists, Avinashi Road',
      photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop',
    },
    {
      quote:
        'My general practice in RS Puram sees 50 patients daily — a mix of elderly Tamil-speaking regulars and young professionals from the IT corridor. Doxxy handles both. Tamil prescriptions for my older patients, WhatsApp reminders for the professionals, UPI billing for everyone. My receptionist went from 3 hours of paperwork to 30 minutes of admin. We recovered ₹40,000 in missed billing charges in the first month alone.',
      name: 'Dr. Meenakshi Sundaram',
      clinic: 'Sundaram Clinic, RS Puram, Coimbatore',
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'Does Doxxy support Tamil and Malayalam in addition to English?',
      answer:
        'Yes. Tamil and Malayalam are fully supported alongside English and Hindi. Patient intake forms, prescriptions, WhatsApp reminders, appointment confirmations, post-care instructions, and billing receipts can all be delivered in Tamil or Malayalam script. Language preference is stored per patient and applied automatically. For Coimbatore clinics — where a significant proportion of patients are Tamil-speaking elderly from the city or Malayalam-speaking visitors from Kerala districts — multilingual support is not a luxury, it is a clinical necessity for patient compliance and follow-up adherence.',
    },
    {
      question: 'How does Doxxy handle patients coming from Kerala for treatment?',
      answer:
        'Doxxy is designed with cross-state medical tourism in mind. Kerala patients get Malayalam-language communication across all touchpoints: appointment confirmation, reminders, prescriptions, treatment plans, and follow-up messages. Their records are cloud-based and accessible from anywhere, so if they need to share them with a local doctor back in Palakkad or Thrissur, they can do so via a secure WhatsApp link. For clinics, this means better treatment adherence for multi-visit procedures (dental, dermatology, orthopaedics) and stronger referral relationships with Kerala-based physicians who refer patients to Coimbatore specialists.',
    },
    {
      question: 'Is Doxxy compliant with the Tamil Nadu Private Clinical Establishments Act?',
      answer:
        'Yes. Doxxy maintains patient records in compliance with the Tamil Nadu Private Clinical Establishments (Regulation) Act. All records are digitally timestamped, access-controlled, and retained for the state-mandated minimum period of 3 years for outpatient cases. Auto-generated statutory registers meet CCMC health department requirements. ABHA ID creation and linking is built into the patient registration workflow for ABDM compliance. During municipal health inspections, clinics can produce a complete compliance report in two clicks.',
    },
    {
      question: 'My clinic uses a legacy desktop application from 2014 — can I migrate my data to Doxxy?',
      answer:
        'Yes. Doxxy supports patient data import from CSV exports, which most legacy desktop systems can generate. Our team assists with the migration to ensure patient demographics, phone numbers, and historical visit records transfer correctly. While deeply structured clinical notes from legacy systems may not migrate in full structured format, the core patient database transfers cleanly. For clinics with large databases (5,000+ patients), we recommend scheduling the import outside OPD hours or over a weekend. Most clinics are fully live on Doxxy within the same day they start the process.',
    },
    {
      question: 'What is the cost of Doxxy for a typical Coimbatore clinic?',
      answer:
        'Doxxy\'s pricing model is simple: the first 100 consultations every month are free. Beyond that, it is ₹10 per consultation with no monthly minimum, no annual contract, and no setup fee. For a typical single-doctor Coimbatore clinic seeing 30-35 patients per day, the monthly cost is approximately ₹5,000-₹6,000. The ROI is clear and immediate: preventing one no-show per day (₹600-₹900 per consultation in Coimbatore) more than covers the full monthly cost. Catching 5% of billing leakage on a ₹10L monthly practice recovers ₹50,000. Doxxy does not cost money — it recovers money you are already losing.',
    },
  ],
}

export default config
