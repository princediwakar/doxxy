// Path: config/cities/mumbai.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'mumbai',
  cityName: 'Mumbai',
  state: 'Maharashtra',
  heroTitle: 'Mumbai Clinic Management Software — Built for Local Practices',
  heroSubtitle:
    'From Colaba to Borivali, Mumbai\'s 35,000+ clinics run on tight schedules, packed waiting rooms, and premium real estate. Doxxy brings WhatsApp-powered queue management, paperless records, UPI billing, and ABDM compliance to Mumbai clinics — without slowing down a single OPD.',
  problemTitle: 'Why Mumbai Clinics Need Software Built for Maximum City',
  problemDescription:
    'Mumbai\'s clinics operate under conditions that no other Indian city matches. Space is at an extreme premium — a 200-square-foot clinic in Dadar or Andheri pays rent comparable to a 1,000-square-foot setup in a tier-2 city, which means every square foot occupied by filing cabinets is revenue lost. Patient volumes routinely hit 60-80 per OPD session, compressing consultation time to 3-4 minutes per patient. In that window, a doctor must review history, examine, diagnose, prescribe, and document — and any delay in the front-desk registration or billing workflow cascades into 90-minute waiting room pileups. The city\'s notorious commute means patients who arrive late throw off the entire morning schedule, while those stuck in traffic rely on WhatsApp to check if the doctor is still available. Mumbai\'s western suburbs (Andheri to Borivali) house thousands of single-doctor clinics that have done paper records for decades — the receptionist knows every patient by name but cannot produce a six-month prescription history when a medico-legal situation arises. Central Mumbai\'s multi-specialty polyclinics face a different challenge: coordinating records across a general physician, a dermatologist, and a pathologist sharing the same physical space but operating in information silos. And across the city, the Brihanmumbai Municipal Corporation (BMC) is increasing scrutiny of clinic documentation as part of the Ayushman Bharat Digital Mission rollout — clinics that cannot produce digital, auditable records will face compliance pressure. Mumbai clinics do not need generic software with a Bandra photo in the hero image. They need a platform engineered for volume, speed, space efficiency, and the unique rhythm of a Maximum City OPD.',
  clinicStats: {
    estimatedClinics: '35,000+',
    avgPatientsPerDay: '40-60',
    softwareAdoptionRate: '18%',
    abdmComplianceRate: '22%',
    paperUsageRate: '65%',
    specialtyMix: '40% multispecialty, 20% dental, 15% dermatology, 10% general practice, 15% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹800-1,200',
    avgMonthlyRevenue: '₹12L - ₹18L',
    avgNoShowRate: '28%',
    estimatedMonthlyLossToNoShows: '₹3.5L - ₹4.5L per month',
    avgBillingErrorRate: '5-8%',
  },
  techContext: {
    whatsappPenetration: '95%',
    digitalPaymentAdoption: '78%',
    internetPenetration: '89%',
  },
  regulatoryNotes:
    'Mumbai clinics fall under the Maharashtra Nursing Home Act and BMC health department regulations. Patient records must be maintained for a minimum of 3 years for outpatient cases. MCGM has been actively pushing digital health records integration with ABDM, with clinics in the western suburbs (Andheri to Borivali) being prioritised for compliance drives. Clinics operating near railway stations — a common location for high-footfall OPDs — face additional fire safety and occupancy documentation requirements from the municipal corporation.',
  solutionTitle: 'Doxxy for Mumbai: Speed, Space, and Digital Compliance',
  solutionDescription:
    'Doxxy is architected for Mumbai\'s clinic rhythm. A 60-second QR-code check-in eliminates the registration bottleneck that causes waiting room pileups. WhatsApp live queue tracking lets patients monitor their token position from the chai tapri downstairs or their office in Lower Parel — they walk in only when it\'s their turn. Digital prescriptions in Marathi, Hindi, and English are generated in under 60 seconds using specialty-specific templates. UPI-first billing auto-generates invoices and sends payment links to patients who left without paying or need to settle later. And because every record is digital, timestamped, and audit-trailed, BMC inspections become a non-event. For Mumbai\'s space-constrained clinics, Doxxy eliminates the filing cabinets that currently consume 40-60 square feet of premium real estate — space that can become a second consultation room or a procedure area.',
  keyFeatures: [
    {
      icon: 'messageSquare',
      title: 'WhatsApp Live Queue & Token System',
      description:
        'Patients receive a WhatsApp message with their token number and estimated wait time. Live queue position updates let them step out for tea or wait at home in a nearby building — they arrive only when their turn is approaching. Cuts perceived wait time by 60% and waiting room crowding by half. Critical for Mumbai clinics where physical waiting space is limited and patients commute from 30+ minutes away.',
    },
    {
      icon: 'smartPhone',
      title: 'QR-Code Patient Check-In (Under 60 Seconds)',
      description:
        'New patients scan a QR code at reception and fill a 4-field digital intake form on their own phone — name, age, phone number, chief complaint. Returning patients check in with a single tap via WhatsApp. Registration time drops from 4-5 minutes to under a minute. The receptionist stops being a data-entry bottleneck and starts managing patient flow.',
    },
    {
      icon: 'fileText',
      title: 'Digital Prescriptions in Marathi, Hindi & English',
      description:
        'Templates pre-filled by specialty. The doctor selects diagnosis, taps medications from favourites, adds instructions, and the prescription is generated — printed, WhatsApp-delivered, or both. Supports Marathi and Hindi scripts for patients who prefer vernacular prescriptions. Average prescription time: 45 seconds versus 2-3 minutes handwriting.',
    },
    {
      icon: 'creditCard',
      title: 'UPI Billing & Revenue Protection',
      description:
        'Auto-generated invoices with UPI QR at checkout. For follow-up payments or patients who "forgot their wallet," the system sends a WhatsApp payment link. Built-in billing validations catch undercharging — the ₹150 injection charge that was missed, the ₹200 dressing fee that wasn\'t added. Stops the 5-8% monthly revenue leakage from manual billing errors.',
    },
    {
      icon: 'shield',
      title: 'ABDM Compliance & BMC-Ready Documentation',
      description:
        'All records are digital, timestamped, and audit-trailed. ABHA ID creation and linking is built into patient registration. Statutory registers required by the Maharashtra Nursing Home Act are auto-generated. When the BMC inspector visits, produce a compliance report in two clicks instead of scrambling through paper registers.',
    },
    {
      icon: 'trendingUp',
      title: 'No-Show Recovery with Automated WhatsApp Reminders',
      description:
        'Mumbai\'s 28% average no-show rate costs clinics ₹3.5L-₹4.5L per month. Doxxy sends automated WhatsApp reminders 24 hours and 2 hours before each appointment, with one-tap confirm or reschedule. Clinics using this feature report a 30-40% reduction in no-shows within the first 60 days — directly recovering revenue that was walking out the door.',
    },
  ],
  whyDoxxyInThisCity:
    'Mumbai clinics operate on razor-thin time margins. A doctor in Dadar seeing 60 patients between 9 AM and 1 PM cannot afford 4-minute-per-patient registration delays. Doxxy\'s QR-code check-in, WhatsApp queue updates, and 60-second digital prescriptions are built for Mumbai\'s volume. With 95% WhatsApp penetration in the city, automated reminders in Marathi, Hindi, and English cut the 28% no-show rate by over a third. For clinics in Churchgate, Bandra, and Powai — where rent per square foot is among the highest in the country — going paperless with Doxxy frees up physical space currently occupied by filing cabinets. And with BMC tightening ABDM compliance requirements, Doxxy\'s built-in regulatory toolkit ensures Mumbai clinics stay ahead of mandates rather than scrambling when notices arrive.',
  testimonials: [
    {
      quote:
        'We see 70-80 patients daily at our Dadar clinic. Before Doxxy, our receptionist spent 3 hours a day just on phone calls — confirming appointments, answering "what\'s the queue," taking cancellations. Now, WhatsApp handles everything. Patients get their token number, live queue position, and prescription — all on their phone. Our no-show rate dropped from 32% to 18% in two months.',
      name: 'Dr. Vikram Mehta',
      clinic: 'Mehta Family Clinic, Dadar',
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop',
    },
    {
      quote:
        'As a dental surgeon in Andheri West, my biggest headache was treatment plan follow-ups. Patients would come for consultation, I\'d recommend a 3-visit RCT, and they\'d vanish after the first visit. Doxxy\'s treatment sequencing and automated WhatsApp reminders brought my RCT completion rate from 55% to 82%. Patients actually show up for their second and third visits now.',
      name: 'Dr. Priya Sharma',
      clinic: 'Sharma Dental Care, Andheri West',
      photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'Does Doxxy work for clinics in Mumbai suburbs like Borivali, Kandivali, and Thane?',
      answer:
        'Yes. Doxxy is a cloud-based platform that works anywhere with an internet connection. Over 60% of our Mumbai clinics are in the suburbs — Borivali, Kandivali, Malad, Ghatkopar, Vikhroli, and Thane. The platform performs well even on 4G connections, which is how most suburban clinics connect. The WhatsApp integration is particularly valuable for suburban clinics where patients typically travel 30-45 minutes for their appointment — live queue tracking lets them leave home only when their turn is approaching, rather than spending an hour in the waiting room.',
    },
    {
      question: 'How does Doxxy handle multi-lingual patient communication in Mumbai?',
      answer:
        'Doxxy supports patient communication in Marathi, Hindi, and English — the three primary languages of Mumbai\'s patient population. Prescriptions can be generated in any of these languages. WhatsApp reminders, appointment confirmations, and post-care instructions are automatically delivered in the patient\'s preferred language. For clinics in areas with significant Gujarati-speaking populations (Ghatkopar, Bhendi Bazaar), we can configure custom message templates. The UPI payment workflow and receipts also support multi-lingual confirmations.',
    },
    {
      question: 'Is Doxxy compliant with the Maharashtra Nursing Home Act and BMC regulations?',
      answer:
        'Yes. Doxxy maintains patient records in the format prescribed under the Maharashtra Nursing Home Act and BMC health establishment regulations. All records are timestamped, access-controlled, and retained for the mandatory minimum period (3 years for outpatient records). The platform auto-generates statutory registers required by MCGM, including the daily patient register, procedure log, and Schedule H/H1 drug records. For clinics undergoing BMC inspections, Doxxy produces compliance reports in the required format on demand — no more scrambling through paper registers when the inspector arrives.',
    },
    {
      question: 'My clinic is in an old Mumbai building with unreliable internet — can I still use Doxxy?',
      answer:
        'Doxxy\'s progressive web architecture works on any device with a browser and a 4G connection — no installations, no server hardware, no dedicated IT staff. For clinics in older buildings in South Mumbai or Dadar where broadband can be unreliable, a simple JioFi or Airtel 4G hotspot provides sufficient bandwidth. The platform uses less than 50MB of data per day for a typical 50-patient clinic. We also offer a lightweight offline queue mode where the token system continues to function even during brief internet drops, syncing data automatically when the connection resumes.',
    },
    {
      question: 'What about clinics in lower-income catchment areas — is Doxxy affordable for a small Mumbai OPD?',
      answer:
        'Doxxy\'s pricing is designed for Indian clinics at every economic level. The first 100 consultations per month are completely free — sufficient for a clinic seeing 4-5 patients a day. Beyond that, it is ₹10 per consultation with no monthly minimum, no setup fee, and no hardware purchase. For a typical single-doctor clinic in a middle-income neighbourhood seeing 20-25 patients daily, the total monthly cost is approximately ₹4,000-₹5,500 — less than the salary of a part-time receptionist. The ROI is immediate: preventing just one no-show per day (worth ₹800-₹1,200 in Mumbai) more than pays for the entire month of Doxxy usage.',
    },
  ],
}

export default config
