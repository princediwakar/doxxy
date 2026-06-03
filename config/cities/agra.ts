// Path: config/cities/agra.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'agra',
  cityName: 'Agra',
  state: 'Uttar Pradesh',
  heroTitle: 'Agra Clinic Management Software — Built for Tourism-Impacted Practices',
  heroSubtitle:
    'Agra\'s 3,500+ clinics operate in the shadow of the Taj Mahal — serving 1.6 crore annual tourists alongside a 22-lakh resident population. With only 8% software adoption and chaotic walk-in patterns driven by tourist footfall, Agra\'s clinics face challenges no other Indian city matches. Doxxy brings order to the chaos.',
  problemTitle: 'Why Agra\'s Clinics Face a Tourism-Driven Operational Crisis',
  problemDescription:
    'Agra\'s clinic sector is shaped by a factor no software vendor accounts for: the Taj Mahal. The city receives 1.6 crore visitors annually — roughly 45,000 per day — and while most are healthy, a surprisingly large number seek acute medical care. Tourists get food poisoning at roadside eateries near the Taj. They get heatstroke in May when Agra touches 46 degrees. They have asthma flare-ups from the city\'s particulate-heavy air. They fall and sprain ankles on the marble steps. These walk-in, one-time patients flood clinics near Fatehabad Road, Tajganj, and the Sadar Bazaar corridor — creating an operational whipsaw. A clinic that sees 20 regular patients on a Tuesday might see 40 on a Saturday when tourist traffic peaks, with zero advance notice. The 30% no-show rate is the highest among major Indian cities, driven by tourists who book appointments (or walk in and promise to return for follow-up) and then leave Agra the next morning. Paper-based clinics are crushed by this variability: registration queues that suddenly stretch to an hour, prescription pads that run out mid-session, and no systematic way to distinguish a one-time tourist from a returning local patient at check-in. The Uttar Pradesh Clinical Establishments Act mandates specific records — including address and ID verification — that clinics struggle to comply with during peak walk-in surges. Adding to this, Agra\'s position on the Delhi-Mumbai and Delhi-Kolkata tourist circuit means clinics near the Taj corridor are effectively serving a national, multilingual patient base: Hindi, English, Urdu, Bengali, Marathi, and occasionally foreign languages. Agra clinics do not need software that assumes a stable, predictable patient panel. They need a platform engineered for tourism-driven variability.',
  clinicStats: {
    estimatedClinics: '3,500+',
    avgPatientsPerDay: '20-40',
    softwareAdoptionRate: '8%',
    abdmComplianceRate: '9%',
    paperUsageRate: '85%',
    specialtyMix: '35% general practice, 18% multispecialty, 15% dental, 10% dermatology, 8% paediatrics, 14% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹400-700',
    avgMonthlyRevenue: '₹3.5L - ₹7L',
    avgNoShowRate: '30%',
    estimatedMonthlyLossToNoShows: '₹1L - ₹2L per month',
    avgBillingErrorRate: '7-10%',
  },
  techContext: {
    whatsappPenetration: '85%',
    digitalPaymentAdoption: '55%',
    internetPenetration: '68%',
  },
  regulatoryNotes:
    'Agra clinics are regulated under the Uttar Pradesh Clinical Establishments (Registration and Regulation) Act and the Agra Municipal Corporation health department. The UP Act mandates a minimum 3-year record retention for outpatient cases and specific address and identity documentation requirements for new patients — particularly challenging for clinics dealing with high tourist walk-in volumes who provide incomplete or transient address information. Uttar Pradesh has been scaling ABDM adoption through the state health department, with clinics in Agra, Lucknow, and Kanpur being prioritised. Clinics near the Tajganj and Fatehabad Road corridors face additional periodic inspections from tourism police and health authorities during peak tourist seasons.',
  solutionTitle: 'Doxxy for Agra: Taming Tourism-Driven Clinic Chaos',
  solutionDescription:
    'Doxxy is architected for the operational whipsaw that defines Agra\'s clinic sector. QR-code check-in processes a new patient — local or tourist — in under 60 seconds, eliminating the registration bottleneck that spirals during peak tourist hours. The system auto-flags one-time patients versus returning locals, so staff instantly know who needs a full intake and who is a familiar face. WhatsApp reminders in Hindi, English, and Urdu target the 30% no-show rate — and for tourists who will never return, Doxxy stops staff from wasting time on futile follow-up calls. Digital prescriptions in Hindi and English are templated for Agra\'s most common acute presentations: gastroenteritis, heat-related illness, respiratory distress, minor trauma. UPI billing catches the 7-10% leakage from missed charges that is particularly acute during high-volume walk-in surges when staff are overwhelmed. And with UP Act compliance built in — including address and ID documentation — the tourist patient who provides minimal information still generates a compliant, audit-ready record. For Agra\'s 3,500 clinics, Doxxy replaces chaos with a system.',
  keyFeatures: [
    {
      icon: 'smartPhone',
      title: '60-Second QR-Code Check-In for High Walk-In Volume',
      description:
        'New patients — local or tourist — scan a QR code and complete a 4-field intake form on their phone in Hindi, English, or Urdu. Registration drops from 5 minutes to under a minute. Returning patients check in with a WhatsApp tap. During the Saturday tourist surge when 30 walk-ins arrive in two hours, Doxxy prevents the registration queue from becoming the clinic\'s rate-limiting step.',
    },
    {
      icon: 'users',
      title: 'Auto-Flag: Tourist vs. Local Patient',
      description:
        'Doxxy distinguishes one-time tourist patients from returning locals based on phone number geography, visit history, and intake patterns. Staff instantly see the flag and adjust their workflow — full intake for a new tourist, quick confirmation for a regular. No more spending 5 minutes trying to look up the paper file of a patient from Kolkata who will never visit again.',
    },
    {
      icon: 'messageSquare',
      title: 'WhatsApp Reminders That Know When to Stop',
      description:
        'Agra\'s 30% no-show rate is India\'s highest for a reason — tourists book and leave town. Doxxy sends automated WhatsApp reminders 24 hours and 2 hours before each appointment, but it also detects tourist patients (non-local phone numbers, first-time visits) and adjusts follow-up behaviour — no futile reminder cascades for patients already on a train to Delhi. For local patients, reminders push the no-show rate from 30% toward 20%.',
    },
    {
      icon: 'fileText',
      title: 'Hindi-Script Prescriptions for Agra\'s Common Acute Presentations',
      description:
        'Templated prescriptions for the conditions Agra clinics see most: gastroenteritis (tourist food poisoning), heat exhaustion and heatstroke (May-June), respiratory distress (October-February smog and particulate matter), and minor orthopaedic trauma. Templates are pre-filled with medications, dosages, and instructions. Generate a complete prescription in Hindi or English in under 45 seconds.',
    },
    {
      icon: 'creditCard',
      title: 'UPI Billing During High-Volume Surges',
      description:
        'Auto-generated itemised invoices with UPI QR at checkout. During Saturday afternoon peaks when the reception desk is overwhelmed, Doxxy\'s automated billing prevents the 7-10% charge leakage that manual billing causes — the ₹80 injection, the ₹150 dressing, the ₹100 procedure tray. For an Agra clinic billing ₹5L monthly, that is ₹35,000-₹50,000 of already-earned revenue walking out the door every month.',
    },
    {
      icon: 'shield',
      title: 'UP Clinical Establishments Act & Tourist Documentation Compliance',
      description:
        'All records digitally timestamped and audit-ready. Auto-generated statutory registers compliant with the UP Clinical Establishments Act. Address and ID documentation fields built into the intake flow — even a tourist providing a hotel name and a phone number generates a compliant record. ABHA ID creation and linking for ABDM compliance. When the Agra Municipal Corporation health inspector visits during peak tourist season, produce a compliance report in two clicks.',
    },
  ],
  whyDoxxyInThisCity:
    'Agra is a market most clinic software companies ignore because it does not fit their template — it is not a metro, not a traditional tier-2 city, and its tourism-driven variability breaks standard workflows. Doxxy does not ignore it; it is built for it. The tourist-versus-local auto-flagging feature alone transforms a clinic\'s operations, stopping staff from treating every walk-in like a returning patient. Templated prescriptions for Agra\'s acute-care-heavy case mix cut documentation time by half. WhatsApp reminders that intelligently handle tourist patients eliminate futile follow-up labour. And at ₹10 per consultation after the first 100 free, Doxxy\'s cost is recovered by preventing just 2-3 no-shows per day (₹400-₹700 each) or by catching 5% of billing leakage on a ₹5L practice (₹25,000 per month). For Agra\'s 3,500 clinics — 85% of which are still on paper — Doxxy is not a luxury. It is the operational infrastructure that a tourism-heavy clinic sector has needed for years.',
  testimonials: [
    {
      quote:
        'My clinic is 800 metres from the Taj Mahal\'s east gate. On a Saturday, I see 35-40 patients — half are tourists with food poisoning, heat exhaustion, or minor injuries. Before Doxxy, my receptionist would spend 5 minutes registering each one while the queue stretched onto the footpath. Now, tourists scan the QR code, fill four fields on their phone, and are in the queue in under a minute. Our waiting time has dropped by more than half, even on the busiest days.',
      name: 'Dr. Rajesh Agarwal',
      clinic: 'Agarwal Clinic, Tajganj, Agra',
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop',
    },
    {
      quote:
        'I used to waste hours calling tourists who had no intention of coming back — they would visit Agra, book a follow-up, and leave for Delhi the next morning. Doxxy\'s tourist detection stops that automatically. Now we only send reminders to local patients who might actually show up. Our effective no-show follow-up efficiency improved dramatically, and we stopped wasting staff time on dead-end phone calls.',
      name: 'Dr. Shama Parveen',
      clinic: 'Parveen Family Clinic, Sadar Bazaar, Agra',
      photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'How does Doxxy handle the extreme variability in patient volume — 20 patients one day, 40 the next?',
      answer:
        'Doxxy is built for variability. The QR-code check-in system scales instantly — 5 patients or 50, the registration flow is the same 60-second process per patient with no additional staff burden. The queue management system automatically adjusts wait-time estimates based on real-time patient count. For clinics near the Taj corridor, Doxxy also tracks historical patterns — if Saturdays consistently see 40% higher volume, the platform pre-configures the dashboard for higher throughput. There is no per-patient performance degradation as volume scales; the system is cloud-based and elastic.',
    },
    {
      question: 'How does Doxxy handle tourists who provide incomplete or foreign contact information?',
      answer:
        'Doxxy\'s intake form is designed to capture the minimum viable patient record: name, phone number (Indian or international), and chief complaint — all in 4 fields. For tourists providing a hotel name instead of an address, the address field accepts flexible formats. The system auto-flags the record as a transient/tourist patient, which adjusts follow-up behaviour (no automated long-term reminders) while still maintaining a compliant record for medico-legal and regulatory purposes. For foreign tourists with international numbers, WhatsApp communication works globally, and prescriptions can be generated in English.',
    },
    {
      question: 'Does Doxxy handle Hindi and Urdu for patient communication in Agra?',
      answer:
        'Yes. Hindi and English are the primary supported languages, and Urdu-script templates are available for clinics serving Agra\'s significant Urdu-speaking population. Patient intake forms, WhatsApp reminders, prescriptions, and billing receipts can all be delivered in Hindi (Devanagari script). Language preference is stored per patient and applied automatically. This is essential for Agra, where a large proportion of patients — both local residents and domestic tourists — prefer Hindi.',
    },
    {
      question: 'Is Doxxy compliant with the UP Clinical Establishments Act and Agra Municipal Corporation requirements?',
      answer:
        'Yes. Doxxy maintains patient records in full compliance with the Uttar Pradesh Clinical Establishments (Registration and Regulation) Act. All records are digitally timestamped, access-controlled, and retained for the state-mandated minimum period of 3 years for outpatient records. The platform auto-generates statutory registers required by the Agra Municipal Corporation health department. Address and ID documentation fields are built into intake to satisfy the UP Act\'s verification requirements — even for tourist patients with incomplete address information. ABHA ID creation and linking is built into registration for ABDM compliance.',
    },
    {
      question: 'What is the cost of Doxxy for a clinic in Agra, where patient spending is lower than in metros?',
      answer:
        'Doxxy\'s pricing is designed to work for clinics at every economic tier. The first 100 consultations per month are completely free — sufficient for a clinic seeing 4-5 patients daily. Beyond the free tier, it is ₹10 per consultation with no monthly minimum, no setup fee, and no hardware purchase required. For a typical Agra clinic seeing 20-25 patients per day, the monthly cost is approximately ₹3,500-₹4,500. Given Agra\'s average consultation value of ₹400-₹700, preventing just one no-show per day fully covers the software cost. Catching 5% of billing leakage on a ₹5L practice recovers ₹25,000 per month. And eliminating the staff time wasted on futile tourist follow-up calls saves 5-8 hours per week. Doxxy\'s cost is a fraction of the value it recovers.',
    },
  ],
}

export default config
