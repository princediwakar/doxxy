// Path: config/cities/chennai.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'chennai',
  cityName: 'Chennai',
  state: 'Tamil Nadu',
  heroTitle: 'Chennai Clinic Management Software — for India\'s Healthcare Capital',
  heroSubtitle:
    'Chennai\'s 14,000+ clinics anchor one of India\'s deepest healthcare ecosystems — from Mylapore legacy practices to OMR\'s multi-specialty centres. Doxxy helps Chennai clinics digitise with Tamil-first communication, TNMC-compliant records, and the reliability Chennai doctors demand.',
  problemTitle: 'Why Chennai\'s Clinics Need Software That Matches Their Clinical Excellence',
  problemDescription:
    'Chennai is arguably India\'s healthcare capital — the city attracts patients from across Tamil Nadu and beyond, and its clinicians are among the country\'s most respected. Yet operational processes in most Chennai clinics have not kept pace with clinical standards. A senior consultant in Mylapore who spends 15 minutes carefully examining and counselling each patient still writes prescriptions on a paper pad, files records in steel almirahs, and has no systematic way to follow up on treatment adherence. The city\'s 27% no-show rate is deceptively high — patients from outside Chennai (Kanchipuram, Chengalpattu, Vellore) who travel for a specialist consultation are the most likely to cancel last-minute due to travel complications, creating empty slots that could have been filled by local patients. Chennai\'s medical council (TNMC) documentation requirements are among the most stringent in India, and maintaining paper records that satisfy a TNMC audit is a constant source of anxiety for clinic owners. The city\'s multi-specialty clinic model — often anchored by a senior physician with visiting consultants in cardiology, diabetology, and orthopaedics — creates records that are siloed by doctor rather than unified by patient. And Chennai\'s unique linguistic landscape means patient communication must handle Tamil, English, and often Telugu or Malayalam depending on the catchment. Chennai clinics do not need feature-bloated software. They need a reliable, Tamil-first, compliance-ready platform that respects their clinical expertise and removes the operational friction that has accumulated around it.',
  clinicStats: {
    estimatedClinics: '14,000+',
    avgPatientsPerDay: '40-65',
    softwareAdoptionRate: '17%',
    abdmComplianceRate: '22%',
    paperUsageRate: '66%',
    specialtyMix: '35% multispecialty, 22% general practice, 18% dental, 10% dermatology, 15% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹700-1,000',
    avgMonthlyRevenue: '₹11L - ₹15L',
    avgNoShowRate: '27%',
    estimatedMonthlyLossToNoShows: '₹3L - ₹4L per month',
    avgBillingErrorRate: '5-8%',
  },
  techContext: {
    whatsappPenetration: '94%',
    digitalPaymentAdoption: '71%',
    internetPenetration: '76%',
  },
  regulatoryNotes:
    'Chennai clinics are regulated by the Tamil Nadu Medical Council (TNMC) and the Tamil Nadu Clinical Establishments (Registration and Regulation) Act. TNMC documentation standards are among the most detailed in India, requiring specific formats for patient records, prescription documentation, and procedure logs. Record retention requirements are a minimum of 3 years for outpatient records. The Tamil Nadu government has been rolling out ABDM integration through the state health mission, and private clinics in Chennai are expected to comply with ABDM linkage requirements.',
  solutionTitle: 'Doxxy for Chennai: Tamil-First, Compliance-Ready, Clinician-Respected',
  solutionDescription:
    'Doxxy is designed for the Chennai clinic that prizes clinical quality above all else. Tamil-language WhatsApp reminders, prescriptions, and post-care instructions meet patients in their preferred language without friction. Digital prescriptions are generated in under 60 seconds using specialty-specific templates — the doctor spends their time on the patient, not the paperwork. TNMC-compliant documentation with auto-generated registers eliminates the anxiety of regulatory audits. Multi-specialty coordination lets the visiting cardiologist see the GP\'s notes and vice versa, creating a unified patient record. UPI billing with auto-reconciliation catches the undercharges that cost Chennai clinics ₹40,000-₹60,000 per month. And the no-show recovery engine specifically targets the outstation patient problem — automated travel-day reminders with traffic-aware timing help patients from Kanchipuram, Vellore, and beyond keep their specialist appointments.',
  keyFeatures: [
    {
      icon: 'messageSquare',
      title: 'Tamil-First WhatsApp Communication',
      description:
        'All patient communication — appointment confirmations, 24-hour reminders, queue updates, digital prescriptions, lab reports, and post-care instructions — delivered in Tamil via WhatsApp. English and Telugu also supported. Language is set per patient and applied automatically. This is not a translation layer over English content; it is natively authored Tamil communication that sounds natural to Chennai patients.',
    },
    {
      icon: 'fileText',
      title: 'Tamil-Script Digital Prescriptions',
      description:
        'Prescriptions generated in Tamil script for patients who prefer it, alongside English and Telugu options. Specialty-specific templates cover the 50 most common Chennai OPD presentations — from the chronic disease combinations (diabetes + hypertension + dyslipidaemia) that dominate Chennai clinics to seasonal presentations. Average prescription time: 45 seconds.',
    },
    {
      icon: 'shield',
      title: 'TNMC-Compliant Documentation & Registers',
      description:
        'Auto-generated patient records, prescription logs, procedure logs, and statutory registers in the formats prescribed by the Tamil Nadu Medical Council and the TN Clinical Establishments Act. Every entry is timestamped, digitally signed, and audit-trailed. When TNMC notifies an inspection, Doxxy produces a complete compliance package in minutes. For Chennai doctors who have spent their careers worrying about medico-legal documentation, this is the single most valuable feature.',
    },
    {
      icon: 'users',
      title: 'Multi-Specialty Coordination in a Single Record',
      description:
        'Chennai\'s common clinic model — a senior GP as anchor with visiting consultants in cardiology, diabetology, and orthopaedics — creates fragmented records. Doxxy unifies them: the cardiologist sees the GP\'s latest note and lab results, the GP sees the cardiologist\'s medication changes, and the patient has one coherent record, not four siloed ones.',
    },
    {
      icon: 'smartPhone',
      title: 'Outstation Patient No-Show Prevention',
      description:
        'Chennai clinics draw patients from across Tamil Nadu — Kanchipuram, Vellore, Chengalpattu, Cuddalore. These outstation patients have the highest cancellation rate due to travel disruptions. Doxxy sends travel-day reminders with appointment time, clinic location map, and real-time rescheduling if needed. For high-value specialist consultations, clinics can configure additional reminder touchpoints. The result: outstation no-shows drop by 25-30%.',
    },
    {
      icon: 'creditCard',
      title: 'UPI Billing with Tamil Receipts',
      description:
        'Auto-generated itemised invoices with UPI QR at checkout. Receipts and payment confirmations available in Tamil. WhatsApp payment links for follow-up settlements. Built-in charge validation catches the 5-8% revenue leakage from manual billing errors — in a Chennai clinic with ₹12L monthly revenue, that is ₹60,000-₹96,000 recovered monthly. Payment reconciliation is automatic.',
    },
  ],
  whyDoxxyInThisCity:
    'Chennai\'s clinicians are among India\'s best. Their operational tools should match. Doxxy eliminates the paperwork that consumes time better spent with patients — digital prescriptions in 45 seconds, auto-generated compliance documentation, and WhatsApp communication that handles patient outreach without staff involvement. With 94% WhatsApp penetration and a patient base that spans the entire state of Tamil Nadu (and beyond), Doxxy\'s Tamil-first communication and outstation patient management directly address Chennai\'s unique operational challenges. For the multi-specialty clinic model that dominates Chennai, Doxxy\'s unified patient record ensures that visiting consultants and anchor physicians are always on the same clinical page. And for the TNMC compliance that keeps Chennai doctors awake at night, Doxxy provides the documentation safety net that transforms regulatory audits from existential threats to routine checkpoints.',
  testimonials: [
    {
      quote:
        'I have been practising in Mylapore for 22 years. My patients trust me because I spend time with them, not because I have fancy software. I was sceptical about digitising — I thought it would come between me and my patient. Doxxy proved me wrong. The prescription templates save me time without making me feel like I am ticking boxes. The Tamil WhatsApp reminders cut my no-shows from 30% to under 20%. And the TNMC documentation — I sleep better knowing my records are audit-ready.',
      name: 'Dr. Ranganathan Subramanian',
      clinic: 'Subramanian Clinic, Mylapore, Chennai',
      photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop',
    },
    {
      quote:
        'Our multi-specialty centre in Velachery has a GP, a diabetologist, a cardiologist, and a visiting orthopaedic surgeon. Before Doxxy, each doctor maintained separate records — the cardiologist had no idea what the GP prescribed last week. Doxxy gave us one unified patient record that every consultant sees. The multi-specialty coordination alone has improved our patient outcomes. Plus, the Tamil WhatsApp reminders — our patients in Tambaram and Chengalpattu actually respond to them.',
      name: 'Dr. Lakshmi Narayanan',
      clinic: 'Velachery Multi-Specialty Clinic, Chennai',
      photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'Does Doxxy support Tamil for prescriptions and patient communication?',
      answer:
        'Yes, Doxxy provides full Tamil-language support across the platform. Patient-facing communication — WhatsApp appointment reminders, confirmations, queue updates, digital prescriptions, lab reports, and post-care instructions — is natively authored in Tamil, not machine-translated from English. Prescriptions can be generated in Tamil script for patients who prefer it. The language preference is set per patient in their profile and applies automatically to all communications. English and Telugu are also fully supported. This is particularly important for Chennai clinics whose patient base spans urban Tamil speakers, rural patients from surrounding districts, and Telugu-speaking patients from border areas.',
    },
    {
      question: 'How does Doxxy help with TNMC documentation and medico-legal compliance?',
      answer:
        'The Tamil Nadu Medical Council has some of India\'s most detailed documentation requirements. Doxxy maintains all patient records, prescriptions, and procedure logs in TNMC-compliant formats. Every clinical entry is timestamped, digitally signed, and audit-trailed. The platform auto-generates all statutory registers required under the TN Clinical Establishments Act. For medico-legal cases — which Chennai doctors are particularly attuned to — Doxxy produces a complete, tamper-evident record package that is defensible in consumer court or medical council proceedings. The system maintains record integrity that paper files cannot match: no missing pages, no altered entries, no illegible handwriting. When a TNMC inspection is notified, a complete compliance report is generated in minutes.',
    },
    {
      question: 'Can Doxxy handle multi-specialty clinics with visiting consultants?',
      answer:
        'Yes. Doxxy\'s unified patient record is specifically designed for the multi-specialty model that is common in Chennai. A patient\'s record includes notes from every consulting doctor — GP, cardiologist, diabetologist, orthopaedic surgeon — in one chronological timeline. Each doctor sees the full context before adding their own note. Prescriptions from different specialists are visible to all, preventing drug interactions. Lab results ordered by one consultant are accessible to all. Role-based access ensures each doctor sees what is clinically relevant. For the anchor GP who coordinates care across specialists, Doxxy provides a single source of truth that eliminates the "what did the cardiologist say?" phone calls and WhatsApp forwards.',
    },
    {
      question: 'How does Doxxy manage patients coming from outside Chennai?',
      answer:
        'Chennai clinics serve a large outstation patient population from across Tamil Nadu. Doxxy addresses their unique needs: travel-day reminders include clinic location, map link, and real-time traffic-aware departure timing; the WhatsApp queue tracking lets outstation patients coordinate their arrival — they can leave Kanchipuram or Vellore only when their token is approaching, rather than arriving at 8 AM and waiting 3 hours; prescription delivery via WhatsApp means outstation patients do not need to carry a paper prescription home; and follow-up scheduling accounts for the patient\'s travel constraints with wider appointment windows. These features have reduced outstation no-shows by 25-30% in clinics using Doxxy.',
    },
    {
      question: 'Is Doxxy suitable for a senior doctor who is not tech-savvy?',
      answer:
        'Doxxy was built for exactly this profile — the experienced clinician who is an expert in medicine, not technology. The interface is deliberately simple, with large touch targets, minimal navigation depth, and workflows that mirror existing paper processes. A senior doctor needs to learn only a handful of interactions: select patient, review history, enter diagnosis (from a searchable list), and sign the prescription. Many Chennai doctors in their 50s and 60s are using Doxxy comfortably after 2-3 days of use. The platform does not ask the doctor to change how they practise — it removes the paperwork so they can spend more time doing what they do best. For doctors who prefer dictation over typing, Doxxy\'s voice-to-text input supports Tamil and English medical terminology.',
    },
  ],
}

export default config
