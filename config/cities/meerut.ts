// Path: config/cities/meerut.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'meerut',
  cityName: 'Meerut',
  state: 'Uttar Pradesh',
  heroTitle: 'Meerut Clinic Management Software — Digital for UP\'s Busiest Tier-2 Healthcare Hub',
  heroSubtitle:
    'From Abu Lane to Garh Road, Meerut\'s 3,200+ clinics serve western Uttar Pradesh\'s densest patient population — farmers, traders, students, and industrial workers who descend on the city for healthcare that is unavailable in surrounding towns. With software adoption at 7% and paper usage at 82%, Meerut clinics are running on manual systems that buckle under patient volumes. Doxxy brings Hindi-first WhatsApp queue management, UPI billing, and ABDM compliance — built for the rhythm of a high-volume UP OPD.',
  problemTitle: 'Why Meerut Clinics Are Drowning in Paper — And Patients',
  problemDescription:
    'Meerut is the healthcare anchor for western Uttar Pradesh. Patients travel from Muzaffarnagar, Saharanpur, Bijnor, Hapur, Baghpat, and Baraut — a catchment of 15-20 million people — to consult specialists and access diagnostics that their local towns do not offer. The result is clinic volumes that would tax a Delhi hospital but are managed in 300-square-foot setups on Abu Lane with a receptionist, a compounder, and a doctor who has been practising the same way for 20 years. A general physician near Begum Bridge may see 45-50 patients in a four-hour morning OPD — giving each patient 4-5 minutes of face time while simultaneously managing a queue of 30 waiting patients, a ringing landline, and a reception desk buried under paper chits. The structural problems are painful and familiar: manual token distribution that cannot handle the morning rush, paper records that take 3-4 minutes per patient to locate or create from scratch, handwritten prescriptions that eat into consultation time, and a 30% no-show rate that wastes appointment slots while walk-in patients overflow the waiting room. Meerut\'s software adoption rate of 7% reflects a clinic ecosystem that has never been served by a purpose-built product — clinics have either stayed fully paper-based or bought generic "medical store billing software" that handles invoices but not patient care. The Uttar Pradesh Clinical Establishments Act is gradually increasing documentation and registration requirements, and ABDM alignment through the UP State Health Agency is on the horizon. Meerut clinics face a convergence of pressures: rising patient volumes, evolving regulatory expectations, and the operational ceiling of paper-based workflows. The clinics that digitise now — on a platform built for their language, their volumes, and their budget — will turn these pressures into competitive advantages.',
  clinicStats: {
    estimatedClinics: '3,200+',
    avgPatientsPerDay: '25-40',
    softwareAdoptionRate: '7%',
    abdmComplianceRate: '9%',
    paperUsageRate: '82%',
    specialtyMix: '40% general practice, 20% multispecialty, 15% dental, 10% orthopaedics, 15% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹400-650',
    avgMonthlyRevenue: '₹4L - ₹7L',
    avgNoShowRate: '30%',
    estimatedMonthlyLossToNoShows: '₹1.2L - ₹2.1L per month',
    avgBillingErrorRate: '7-12%',
  },
  techContext: {
    whatsappPenetration: '80%',
    digitalPaymentAdoption: '45%',
    internetPenetration: '58%',
  },
  regulatoryNotes:
    'Meerut clinics are regulated under the Uttar Pradesh Clinical Establishments (Registration and Regulation) Act and the Meerut Municipal Corporation health department. The UP State Health Agency is the nodal body for ABDM implementation and has been conducting enrolment drives across western UP districts. Patient records must be maintained for a minimum of 3 years for outpatient cases under state law. Clinics in the central medical zones — Abu Lane, Begum Bridge, and Garh Road — face regular municipal health inspections due to high patient density. The Meerut Development Authority has been integrating health establishment registration with building and occupancy compliance for new clinic setups.',
  solutionTitle: 'Doxxy for Meerut: Built for High Volume, Low Margin, Hindi-First OPDs',
  solutionDescription:
    'Doxxy is engineered for the Meerut clinic reality: 40-50 patients per session, 4-5 minutes per consultation, a staff that has never used clinic software, and a patient base that communicates exclusively in Hindi and expects nothing more complex than a WhatsApp message. The platform runs on any device with a browser — no server, no installation, no IT dependency. QR-code check-in replaces the paper token system that creates morning chaos. WhatsApp live queue tracking in Hindi lets patients wait at the nearby chai shop or chemist instead of crowding the reception. Digital prescriptions in Hindi are generated in 45-60 seconds using regional disease templates. For the 30% no-show rate — among the highest in our city profiles — automated WhatsApp reminders in Hindi recover a third of missed appointments within 60 days. The billing module generates digital invoices even for cash transactions, plugging the 7-12% monthly revenue leakage from manual errors.',
  keyFeatures: [
    {
      icon: 'messageSquare',
      title: 'WhatsApp Reminders in Hindi — Fix the 30% No-Show Rate',
      description:
        'Meerut\'s 30% no-show rate costs clinics ₹1.2L-₹2.1L per month — appointments booked but never attended, with no cancellation notice. Doxxy sends automated WhatsApp reminders 24 hours and 2 hours before each appointment, in Hindi, with a single-tap confirm or reschedule option. Clinics in comparable cities see a 30-40% no-show reduction within two months. For a Meerut clinic with ₹5.5L monthly revenue, recovering one-third of no-shows adds ₹40,000-₹70,000 in monthly revenue with zero additional marketing spend.',
    },
    {
      icon: 'smartPhone',
      title: 'QR-Code Check-In — Replace the Morning Token Chaos',
      description:
        'The 8:30 AM rush at a typical Meerut clinic near Abu Lane or Garh Road is a bottleneck — 30-40 patients arriving simultaneously, the receptionist overwhelmed, paper chits flying, queue-order arguments breaking out. Doxxy\'s QR-code check-in lets new patients fill a 4-field Hindi intake form on their own phone in under 60 seconds. Returning patients check in with one WhatsApp tap. The receptionist shifts from data-entry scramble to managing patient flow — and the queue order is digital, transparent, and indisputable.',
    },
    {
      icon: 'fileText',
      title: 'Hindi Digital Prescriptions — 45 Seconds, No Handwriting Errors',
      description:
        'Most Meerut doctors handwrite 45-50 prescriptions per OPD session. Doxxy\'s templated prescription system covers the 50 most common western UP OPD presentations — seasonal fevers, gastroenteritis, respiratory infections, musculoskeletal complaints, skin conditions — with pre-filled Hindi medication names, dosage, and instructions. The doctor selects the diagnosis, reviews the template, makes adjustments, and signs digitally. Average time: 45 seconds. No more prescription pads running out. No more chemists misreading handwriting and dispensing the wrong medication.',
    },
    {
      icon: 'trendingUp',
      title: 'Seasonal Surge Handling for Western UP\'s Disease Calendar',
      description:
        'Meerut and western UP experience aggressive seasonal disease patterns: vector-borne diseases (dengue, malaria) spike sharply during and after the monsoon (August-October); respiratory infections and pneumonia rise in winter (November-February) due to the dense smog and cold; gastroenteritis and heat-related illnesses peak in summer (April-June). Doxxy\'s prescription templates include these seasonal clusters with pre-configured medications and investigation recommendations. During outbreak weeks, clinics can create and deploy custom disease-specific templates in minutes. The analytics dashboard tracks diagnosis patterns, giving clinics early warning of local outbreak trends.',
    },
    {
      icon: 'creditCard',
      title: 'Digital Invoicing for Cash-Dominant Clinics',
      description:
        'With 45% digital payment adoption, cash remains the dominant payment mode in Meerut clinics. But cash should not mean no records. Doxxy generates a digital invoice for every consultation, regardless of payment method — itemised charges, amount received, balance (if any), and a timestamped transaction record. The built-in charge validation catches the 7-12% monthly billing leakage from missed line items: the ₹80 injection fee, the ₹150 dressing charge, the ₹200 follow-up consultation. On a ₹5L monthly revenue, recovering even 5% of billing errors returns ₹25,000 — pure profit, zero new patients required.',
    },
    {
      icon: 'shield',
      title: 'UP Clinical Establishments Act & ABDM Readiness',
      description:
        'The Uttar Pradesh Clinical Establishments Act is progressively tightening documentation requirements for private clinics. Doxxy\'s digital, timestamped, audit-trailed records satisfy the statutory documentation standards. Auto-generated registers meet Meerut Municipal Corporation health inspection requirements. ABHA ID creation and linking — built into patient registration — ensures ABDM compliance readiness before mandates arrive. For Meerut clinics that have operated for decades without formal digital documentation, Doxxy provides a gradual, non-disruptive path to full regulatory compliance.',
    },
  ],
  whyDoxxyInThisCity:
    'Meerut\'s clinic ecosystem is caught between rising operational demands and the limits of paper. Patient volumes are growing, ABDM compliance deadlines are approaching, and the 30% no-show rate and 7-12% billing errors are eating into already-thin margins. Yet 93% of clinics have never used any digital tool beyond WhatsApp. Doxxy is the first platform built for this exact profile: Hindi-first, zero IT requirements, a pricing model where the first 100 consultations are free, and a workflow so close to the existing paper routine that clinics transition in days, not weeks. For a Meerut GP seeing 35 patients daily at ₹400-₹650 per consultation, the monthly Doxxy cost is approximately ₹4,500-₹6,000 — and it pays for itself by recovering two no-shows per day. The ABDM compliance readiness is an insurance policy against future regulatory costs.',
  testimonials: [
    {
      quote:
        'My clinic near Begum Bridge is a 40-patient-a-day setup that my father started 35 years ago. I was sceptical about software because I thought it would slow me down. Doxxy proved me wrong. The Hindi prescription templates save me 30 seconds per patient — across 40 patients that is 20 minutes I get back. The WhatsApp reminders cut my no-shows from 32% to 19% in two months. My compounder, who has never used a computer, manages the check-in and billing on a tablet. If a clinic like mine can go digital, any clinic in Meerut can.',
      name: 'Dr. Alok Gupta',
      clinic: 'Gupta Clinic, Begum Bridge, Meerut',
      photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop',
    },
    {
      quote:
        'I run a dental practice on Garh Road. My biggest challenge was treatment follow-through — a patient comes for consultation, I recommend a root canal requiring 2-3 visits, and they disappear after the first. Doxxy\'s treatment plan sequencing and automated Hindi WhatsApp reminders transformed this. My RCT completion rate went from 48% to 76%. The billing module alone caught ₹15,000 in missed charges in the first month — charges that my assistant had been forgetting to add for years. Doxxy is not an expense for my clinic; it is pure profit recovery.',
      name: 'Dr. Neha Agarwal',
      clinic: 'Agarwal Dental Clinic, Garh Road, Meerut',
      photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'My clinic is in a congested area near Abu Lane — will Doxxy work on a basic Jio 4G connection?',
      answer:
        'Yes. Doxxy is designed for Indian 4G conditions and uses less than 50MB of data per day for a 40-patient clinic. The platform works reliably on a standard Jio or Airtel 4G connection, which covers all of Meerut\'s clinic-dense areas — Abu Lane, Begum Bridge, Garh Road, Saket, and Shastri Nagar. The WhatsApp-based patient communication uses patients\' own connections, not the clinic\'s bandwidth. For clinics in buildings with thick construction where indoor signal can be inconsistent, a basic JioFi hotspot near a window provides more than sufficient bandwidth. We also offer a lightweight offline queue mode where token management continues during brief connectivity drops and syncs data automatically when the connection resumes.',
    },
    {
      question: 'Can Doxxy generate prescriptions and communicate with patients entirely in Hindi?',
      answer:
        'Yes. Hindi is fully supported as the default language for all patient-facing features — prescriptions, WhatsApp reminders, appointment confirmations, post-care instructions, and invoices. The templated prescription system includes Hindi medication names (in Devanagari script) with dosage instructions like "सुबह और शाम खाने के बाद". WhatsApp reminders are delivered in Hindi with local phrasing that patients from Meerut and surrounding towns find natural and trustworthy. English is also available as an option per patient. For clinics in Abu Lane, Garh Road, and surrounding areas where the patient base overwhelmingly prefers Hindi communication, Doxxy can be configured as a Hindi-first platform from day one.',
    },
    {
      question: 'How does Doxxy handle the winter smog season when respiratory cases surge in Meerut?',
      answer:
        'Western UP\'s winter smog season (November to February) brings a sharp increase in respiratory cases — asthma exacerbations, COPD, bronchitis, allergic rhinitis, and pneumonia — that can double or triple a clinic\'s respiratory patient load. Doxxy\'s templated prescription system includes pre-configured winter respiratory templates covering the most common presentations with standard medication regimens and investigation recommendations (chest X-ray, spirometry, CBC). During peak smog weeks, clinics can create custom quick-prescription templates for the specific circulating conditions. The analytics dashboard tracks diagnosis trends in real time, letting clinics anticipate patient surges and adjust staffing or session timings accordingly. The WhatsApp queue system prevents waiting room overcrowding during these high-volume periods — patients track their position and wait outside rather than adding to an already-congested reception area.',
    },
    {
      question: 'Is Doxxy affordable for a clinic with mainly lower-income and farming community patients?',
      answer:
        'Yes — and lower consultation fees make operational efficiency even more critical. The first 100 consultations per month are free. Beyond that, it is ₹10 per consultation with no setup fee and no monthly minimum. For a typical Meerut GP seeing 35 patients daily at an average of ₹500 per consultation, the monthly cost is approximately ₹5,000-₹6,500 — roughly the cost of the monthly electricity bill for the clinic. The ROI is immediate and measurable: recovering two no-shows per day (₹1,000 at ₹500 each) generates ₹30,000 in additional monthly revenue — a 5-6x return on the software cost. Reducing billing errors by even one-third recovers another ₹12,000-₹20,000 per month. For clinics operating on thin margins where every rupee counts, Doxxy is not a cost to be managed — it is a direct revenue protection and recovery tool.',
    },
    {
      question: 'Will the UP Clinical Establishments Act eventually require digital records — and will Doxxy keep me compliant?',
      answer:
        'The direction of regulation is clear: the Uttar Pradesh Clinical Establishments Act already mandates maintenance of patient records for minimum periods, and the UP State Health Agency is actively enrolling private clinics into the ABDM ecosystem. While the transition to mandated digital records is happening in phases — with hospitals and larger nursing homes in the first wave — private clinics in cities like Meerut are widely expected to face digital documentation requirements within the next 2-3 years. Doxxy prepares clinics for this proactively: all records are digital, timestamped, and audit-trailed from day one. ABHA ID creation and linking happens during patient registration. Statutory registers are auto-generated in the required format. When digital record mandates arrive, Doxxy clinics will already be compliant — no panic digitisation of years of paper records, no risk of licence renewal complications, and no last-minute capital expenditure on compliance.',
    },
  ],
}

export default config
