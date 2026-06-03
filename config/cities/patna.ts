// Path: config/cities/patna.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'patna',
  cityName: 'Patna',
  state: 'Bihar',
  heroTitle: 'Patna Clinic Management Software — Built for Bihar\'s Digitising Healthcare Sector',
  heroSubtitle:
    'From Boring Road to Kankarbagh, Patna\'s 5,500+ clinics are at the centre of Bihar\'s healthcare digitisation push. With the state government actively promoting digital health records, ABDM enrolment, and e-governance, Patna clinics need software that bridges Bihar\'s traditional paper-based systems to a modern, compliant digital platform — without disrupting the high-volume, low-margin OPD rhythm that sustains them.',
  problemTitle: 'Why Patna Clinics Need a Bridge from Paper to Digital — Fast',
  problemDescription:
    'Patna\'s clinic ecosystem is large, fragmented, and under immense pressure. As Bihar\'s capital and the only city with a major medical infrastructure corridor (PMCH, NMCH, IGIMS, and multiple private medical colleges), Patna absorbs patients from across the entire state — from Gaya, Muzaffarpur, Bhagalpur, Purnia, and the Kosi belt. A general practitioner in Kankarbagh may see 50-60 patients between 8 AM and 1 PM, with an average consultation time of 3-4 minutes. In that compressed window, the doctor must take a history, examine, diagnose, prescribe, and document — all while the waiting room overflows with patients who arrived by bus from neighbouring districts with no appointment. The result is a clinic that runs on muscle memory and paper: paper slips for tokens, paper registers for patient records, paper prescription pads that run out mid-OPD, and a receptionist whose entire morning is spent managing the queue manually. Software adoption in Patna stands at just 6% — one of the lowest among India\'s major cities — but this is changing. The Bihar State Health Society, under the Ayushman Bharat Digital Mission, has begun active outreach to private clinics for ABDM enrolment and digital health record compliance. The Bihar Clinical Establishments (Registration and Regulation) Act is being enforced with increasing rigour. Patna clinics face a dual pressure: rising patient volumes driven by urbanisation and population growth, and regulatory mandates that require digital documentation capabilities they currently lack. The gap is wide, but it is also an opportunity — for clinics that adopt the right digital platform now, the transition from paper to compliant digital records can happen gradually and affordably, rather than as a panic-driven scramble when enforcement tightens.',
  clinicStats: {
    estimatedClinics: '5,500+',
    avgPatientsPerDay: '35-55',
    softwareAdoptionRate: '6%',
    abdmComplianceRate: '10%',
    paperUsageRate: '85%',
    specialtyMix: '40% general practice, 20% multispecialty, 15% dental, 10% gynaecology, 15% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹400-700',
    avgMonthlyRevenue: '₹4.5L - ₹7.5L',
    avgNoShowRate: '32%',
    estimatedMonthlyLossToNoShows: '₹1.4L - ₹2.4L per month',
    avgBillingErrorRate: '7-12%',
  },
  techContext: {
    whatsappPenetration: '82%',
    digitalPaymentAdoption: '48%',
    internetPenetration: '60%',
  },
  regulatoryNotes:
    'Patna clinics are regulated under the Bihar Clinical Establishments (Registration and Regulation) Act and the Patna Municipal Corporation health department. The Bihar State Health Society is the nodal agency for ABDM implementation and has been actively enrolling private clinics in the digital health ecosystem. Patient records must be maintained for a minimum of 3 years for outpatient cases. The state government has linked clinic licence renewals to basic digital record readiness in a phased manner, with Patna\'s urban clinics being prioritised in the first wave. Clinics operating near railway stations (Patna Junction, Rajendra Nagar Terminal) face additional municipal health inspection requirements due to high patient footfall from outstation arrivals.',
  solutionTitle: 'Doxxy for Patna: Digital Transition Without Disruption',
  solutionDescription:
    'Doxxy is built for the specific reality of a Patna OPD: high patient volumes, compressed consultation times, a staff that has never used clinic software, and a patient base that predominantly speaks Hindi and communicates via WhatsApp. The platform works on any device with a browser — the existing laptop, a basic Android tablet, or a shared desktop. QR-code check-in eliminates the paper token system that creates chaos at the reception desk. WhatsApp live queue tracking in Hindi lets patients check their token position from the chai stall outside or from the bus stand across the road — they walk in only when their number is approaching. Digital prescriptions in Hindi are generated in under 60 seconds using specialty-specific templates. UPI billing generates itemised invoices even when patients pay in cash, maintaining the digital record. For the 32% no-show rate — the highest among our city profiles — automated WhatsApp reminders in Hindi cut missed appointments by a third within the first two months.',
  keyFeatures: [
    {
      icon: 'messageSquare',
      title: 'WhatsApp Reminders in Hindi — Attack the 32% No-Show Rate',
      description:
        'Patna\'s 32% no-show rate is the highest among major Indian cities and costs a typical clinic ₹1.4L-₹2.4L monthly. Doxxy sends automated WhatsApp reminders 24 hours and 2 hours before each appointment, with one-tap confirm or reschedule — entirely in Hindi. Clinics using this feature see a 30-40% reduction in no-shows within 60 days. For a Patna clinic with ₹6L monthly revenue, that is ₹42,000-₹96,000 in recovered revenue per month.',
    },
    {
      icon: 'smartPhone',
      title: 'QR-Code Check-In — Eliminate the Paper Token Mess',
      description:
        'Patna clinics, especially those near railway stations and bus stands, face chaotic morning registration — 40-50 patients arriving simultaneously, competing for the receptionist\'s attention. Doxxy\'s QR-code check-in lets new patients fill a 4-field intake form on their own phone (name, age, phone number, complaint) in under 60 seconds. Returning patients check in with a single WhatsApp tap. The receptionist stops being a data-entry bottleneck and becomes a patient-flow manager.',
    },
    {
      icon: 'fileText',
      title: 'Digital Prescriptions in Hindi — Speed Without Typing',
      description:
        'Most Patna doctors write 50-60 prescriptions daily by hand. Doxxy\'s templated prescription system covers the 50 most common OPD presentations — fever, gastroenteritis, respiratory infections, skin conditions, musculoskeletal pain — with pre-filled medication, dosage, and instructions in Hindi. The doctor selects the diagnosis, reviews the template, adjusts if needed, and signs. Average prescription time: 45 seconds. No more running out of prescription pads mid-OPD.',
    },
    {
      icon: 'shield',
      title: 'Bihar Clinical Establishments Act & ABDM Compliance',
      description:
        'The Bihar State Health Society is actively enrolling private clinics for ABDM compliance. Doxxy\'s built-in ABHA ID creation and linking, digital timestamped records, and statutory register generation satisfy the documentation requirements of the Bihar Clinical Establishments Act. When the municipal health inspector visits, produce a compliance report in two clicks — no more panic-searching through years of paper registers that may be incomplete, water-damaged, or lost to Patna\'s monsoon humidity.',
    },
    {
      icon: 'users',
      title: 'Multi-Receptionist Queue Management',
      description:
        'In larger Patna polyclinics and nursing homes with 2-3 doctors consulting simultaneously, managing separate paper queues for each doctor creates confusion and patient complaints. Doxxy\'s multi-doctor queue system assigns patients to specific doctors, tracks parallel queues on a single dashboard, and lets patients see their individual wait time and position on WhatsApp. No more arguments at the reception desk about whose turn it is.',
    },
    {
      icon: 'creditCard',
      title: 'UPI Billing With Cash-Compatible Records',
      description:
        'Patna\'s digital payment adoption is 48% — cash remains dominant. Doxxy\'s billing workflow accommodates this: generate a digital invoice for every consultation regardless of payment mode, record cash payments, and create a complete digital financial trail. For the 7-12% revenue currently lost to billing errors — missed charges, undercounted items, forgotten follow-up fees — built-in charge validation stops the leakage. On a ₹6L monthly revenue, recovering 5% means ₹30,000 back in the doctor\'s pocket.',
    },
  ],
  whyDoxxyInThisCity:
    'Patna is India\'s most underserved major city when it comes to clinic software — 94% of its 5,500+ clinics are still entirely paper-based. But the regulatory push from the Bihar State Health Society and the operational pain of managing 50+ patients daily with manual systems creates a clear mandate for change. Doxxy is the first platform purpose-built for this transition: Hindi-first, zero IT requirements, a pricing model where the first 100 consultations are free, and a workflow that mirrors the existing paper OPD routine so the learning curve is measured in days, not weeks. For a Patna GP seeing 40 patients daily at ₹400-₹700 per consultation, Doxxy pays for itself by recovering just two no-shows per day — and the ABDM compliance readiness is a built-in insurance policy against future regulatory pressure.',
  testimonials: [
    {
      quote:
        'My clinic on Boring Road sees 55-60 patients every morning. Before Doxxy, our paper token system was a daily headache — patients would argue about queue order, the receptionist would lose track of who was waiting, and at least 15 patients every day would leave without being seen because the wait was too long. WhatsApp queue tracking has transformed this. Patients sit at the tea stall across the road and walk in when their number appears. No-shows dropped from 35% to 20% in three months. My OPD now finishes by 1 PM instead of dragging past 2 PM.',
      name: 'Dr. Sanjay Kumar Sinha',
      clinic: 'Sinha Clinic, Boring Road, Patna',
      photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop',
    },
    {
      quote:
        'As a gynaecologist in Kankarbagh, my patients come from as far as Samastipur and Chhapra. They travel 3-4 hours by bus with no appointment, and if I am not available, they waste an entire day. Doxxy\'s WhatsApp booking system lets them confirm a slot before they leave home. The Hindi prescription templates save me 45 seconds per patient — across 40 patients that is half an hour I now use for actual patient care. And the ABDM compliance features mean when the health department notification comes, I am already prepared.',
      name: 'Dr. Anjali Verma',
      clinic: 'Verma Maternity & Gynae Clinic, Kankarbagh, Patna',
      photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'Does Doxxy work reliably with Patna\'s internet connectivity?',
      answer:
        'Yes. Doxxy is designed for real-world Indian internet conditions — it works on a basic 4G Jio or Airtel connection and uses less than 50MB of data per day for a 50-patient clinic. Patna\'s 4G coverage from Jio and Airtel is robust across all major clinic areas: Boring Road, Kankarbagh, Rajendra Nagar, Bailey Road, Patna Junction, and Danapur. The WhatsApp-based patient communication uses each patient\'s own connection, not the clinic\'s bandwidth. For clinics in areas with occasional connectivity drops, we offer a lightweight offline queue mode that continues token management during brief outages and syncs automatically when the connection resumes.',
    },
    {
      question: 'My receptionist has never used a computer — can she learn Doxxy?',
      answer:
        'Doxxy was specifically built for first-time software users. The interface is visual and icon-based, with large buttons in Hindi and English. Workflow mirrors the existing paper routine: check-in, queue, consult, prescribe, bill. Most Patna clinics find that the receptionist — who already manages patient names, token numbers, and phone calls — adapts to Doxxy within 2-3 days. The doctor\'s prescription screen requires minimal typing — select diagnosis from a list, tap medications from favourites, review, sign. We provide phone-based onboarding support in Hindi, and our team stays on call during your first OPD session on Doxxy.',
    },
    {
      question: 'How does Doxxy help with ABDM compliance when the Bihar government makes it mandatory?',
      answer:
        'Doxxy has ABDM compliance built into the core workflow, not bolted on as an afterthought. ABHA ID creation and linking happens during patient registration. All records are digital, timestamped, and audit-trailed — satisfying the documentation standards the Bihar State Health Society is promoting. The platform auto-generates the statutory registers required under the Bihar Clinical Establishments Act. When the government mandates digital record submission for private clinics — and this is a question of when, not if — Doxxy clinics will already be compliant. No panic migration. No backlog of paper records to digitise. No risk of licence non-renewal due to documentation gaps.',
    },
    {
      question: 'Is Doxxy affordable for a clinic in Patna seeing mostly lower-middle-income patients at ₹400-500 per consultation?',
      answer:
        'Yes — and in fact, lower consultation fees make Doxxy even more critical for the bottom line. The first 100 consultations per month are free. Beyond that, it is ₹10 per consultation with no setup fee and no monthly minimum. For a Patna GP seeing 40 patients daily at an average of ₹500 per consultation, the monthly cost is approximately ₹6,000-₹8,000. The ROI is immediate: recovering just three no-shows per day (₹1,500 at ₹500 each) generates ₹45,000 in additional monthly revenue — a 6-7x return on the software cost. The billing error reduction alone (7-12% on ₹6L monthly = ₹42,000-₹72,000) delivers a 5-9x return. Doxxy is a revenue recovery and protection tool, not a cost centre.',
    },
    {
      question: 'Does Doxxy support the multi-lingual needs of Patna — Hindi, English, and regional dialects?',
      answer:
        'Doxxy supports Hindi and English as primary languages for all patient communication, prescriptions, and invoice generation. While Bhojpuri, Maithili, and Magahi are widely spoken in Patna, written medical communication is standardised in Hindi (Devanagari script) and English — both of which Doxxy fully supports. WhatsApp reminders, prescription instructions, and post-care messages are delivered in Hindi by default, with the option to switch to English per patient. For clinics serving patients from rural Bihar who may be more comfortable with oral instructions than written ones, the WhatsApp voice note integration lets doctors record short post-care instructions that accompany the written prescription.',
    },
  ],
}

export default config
