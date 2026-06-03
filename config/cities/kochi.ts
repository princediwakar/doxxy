// Path: config/cities/kochi.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'kochi',
  cityName: 'Kochi',
  state: 'Kerala',
  heroTitle: 'Kochi Clinic Management Software — Digital Health for India\'s Most Literate City',
  heroSubtitle:
    'Kochi\'s 6,000+ clinics — from Fort Kochi to Kakkanad — serve Kerala\'s commercial capital with the country\'s most digitally literate patient base. Doxxy brings WhatsApp-first engagement, paperless records, UPI billing, and KCM-compliant documentation to clinics ready to match their patients\' expectations.',
  problemTitle: 'Why Kochi\'s Highly Literate, Digitally Savvy Patients Expect More from Their Clinics',
  problemDescription:
    'Kochi operates in a healthcare paradox that is unique in India. Kerala has the country\'s highest literacy rate (94%), near-universal mobile phone penetration, 95% WhatsApp usage, and one of the most sophisticated healthcare-seeking populations in the world — Keralites are medically aware, ask detailed questions, and expect structured communication from their healthcare providers. Yet a significant proportion of Kochi\'s clinics still run on paper. The patient who pays for groceries via UPI, manages their bank account on a mobile app, and watches health education videos on YouTube walks into a clinic in Palarivattom or Vyttila and is handed a handwritten prescription on a notepad, asked to come back in three days without a specific appointment time, and sent home with verbal instructions they are expected to remember verbatim. This gap between patient digital literacy and clinic digital maturity is wider in Kochi than in any other Indian city. The city\'s unique healthcare ecosystem compounds the challenge: Kochi is a medical tourism destination, drawing patients from the Middle East (particularly Gulf NRIs returning for treatment), the Maldives, and Africa. These patients arrive with expectations of international-standard clinic operations — structured appointments, digital records, transparent billing — and are frequently disappointed by paper-based workflows. Simultaneously, Kochi\'s network of small neighbourhood clinics in areas like Tripunithura, Edappally, and Fort Kochi serve a loyal local patient base that has been visiting the same doctor for 15 years. The Kerala Clinical Establishments Act mandates specific documentation standards, and the Kerala State Medical Council has been strengthening record-keeping requirements. ABDM compliance is being pushed through the state health department, with Kochi — as Kerala\'s commercial hub — expected to lead adoption. Kochi clinics need software that bridges the gap between the world\'s most literate patient base and paper-based operations that belong to a different era.',
  clinicStats: {
    estimatedClinics: '6,000+',
    avgPatientsPerDay: '25-45',
    softwareAdoptionRate: '22%',
    abdmComplianceRate: '24%',
    paperUsageRate: '55%',
    specialtyMix: '25% multispecialty, 20% general practice, 18% dental, 12% dermatology, 25% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹500-800',
    avgMonthlyRevenue: '₹6L - ₹9L',
    avgNoShowRate: '20%',
    estimatedMonthlyLossToNoShows: '₹1.2L - ₹1.8L per month',
    avgBillingErrorRate: '4-7%',
  },
  techContext: {
    whatsappPenetration: '95%',
    digitalPaymentAdoption: '80%',
    internetPenetration: '92%',
  },
  regulatoryNotes:
    'Kochi clinics are regulated under the Kerala Clinical Establishments (Registration and Regulation) Act and the Kerala State Medical Council (KSMC). The Act mandates specific documentation, display, and reporting requirements for all clinical establishments. Kerala has been one of the most proactive states in digital health, with the e-Health Kerala programme setting the infrastructure for ABDM integration. Patient records must be maintained for a minimum of 3 years. Kochi Municipal Corporation has additional health establishment licence requirements. The Kerala State Pharmacy Council regulations apply to clinics that dispense medicines directly. Medical tourism-related documentation (for international patients from the Gulf, Maldives, and Africa) often requires additional certification and record formats for insurance and travel documentation purposes.',
  solutionTitle: 'Doxxy for Kochi: Digitally Native Platform for a Digitally Literate City',
  solutionDescription:
    'Doxxy is built for the Kochi healthcare paradox: a platform as digitally sophisticated as Kochi\'s patients expect, delivered with the simplicity that Kochi\'s busy clinic owners need. QR-code check-in replaces paper registration. WhatsApp reminders and queue updates in Malayalam and English attack the 20% no-show rate — the lowest among Indian cities, but still costing clinics ₹1.2L-₹1.8L monthly. Digital prescriptions in Malayalam and English are generated in under 60 seconds using specialty-specific templates. UPI billing with 80% adoption-ready workflows auto-generates invoices and catches the 4-7% billing leakage. For Kochi\'s medical tourism clinics, Doxxy supports international patient documentation — treatment summaries, diagnostic reports, and billing in formats accepted by international insurers and travel documentation authorities. And with Kerala\'s aggressive e-Health push and ABDM timelines, Doxxy\'s built-in compliance toolkit keeps Kochi clinics ahead of regulatory requirements. The platform works on any device with a browser — the reception laptop, a tablet, or a phone — and a clinic can be live by the afternoon session on the day they sign up.',
  keyFeatures: [
    {
      icon: 'messageSquare',
      title: 'WhatsApp-First Patient Engagement in Malayalam & English',
      description:
        'With 95% WhatsApp penetration in Kerala — effectively universal — Doxxy uses WhatsApp as the primary patient communication channel. Appointment reminders, live queue tracking, digital prescriptions, lab reports, and post-consultation instructions are all delivered via WhatsApp in Malayalam or English, configured per patient. The Malayalam script support is native and complete — not a transliteration workaround. For a patient base that is famously health-literate and expects detailed communication, Doxxy delivers the structured, written post-care instructions that verbal-only consultations cannot provide.',
    },
    {
      icon: 'globe',
      title: 'Medical Tourism Documentation & International Patient Workflows',
      description:
        'Kochi is one of India\'s top medical tourism destinations, receiving patients from Gulf countries, the Maldives, and Africa. Doxxy supports international patient workflows: structured treatment summaries in formats accepted by international insurers, procedure documentation with pre-and-post images for cosmetic and dental tourism, billing with multi-currency support and international invoice formats, and secure digital record sharing for follow-up care after the patient returns to their home country. This turns the clinic\'s documentation from a compliance burden into a competitive advantage for attracting international patients.',
    },
    {
      icon: 'fileText',
      title: 'Malayalam Digital Prescriptions & Structured Clinical Notes',
      description:
        'Doxxy generates prescriptions in Malayalam and English using specialty-specific templates. The doctor selects diagnosis, taps medications from a favourites list, adds instructions, and the prescription is generated, printed, or WhatsApp-delivered in under 60 seconds. For Kochi\'s health-literate patients who often research their medications and want detailed instructions, the platform supports expanded prescription notes with lifestyle advice, dietary recommendations, and warning signs to watch for — the level of detail that Kochi patients expect but that handwritten prescriptions cannot accommodate.',
    },
    {
      icon: 'trendingUp',
      title: 'No-Show Reduction — Squeezing the Last 20%',
      description:
        'Kochi\'s 20% no-show rate is the lowest among major Indian cities, but it still costs clinics ₹1.2L-₹1.8L monthly. Doxxy\'s WhatsApp reminder engine sends automated messages 24 hours and 2 hours before each appointment with one-tap confirm or reschedule. The system learns patient attendance patterns and can adjust reminder frequency for serial no-showers. For Kochi clinics where the lower baseline no-show rate means the remaining no-shows are disproportionately "hard-core" — patients who miss appointments for genuine reasons like monsoon traffic, sudden work commitments, or health changes — Doxxy\'s easy reschedule workflow captures these lost slots that would otherwise be wasted.',
    },
    {
      icon: 'creditCard',
      title: 'UPI-First Billing for India\'s Most Digitally Literate Market',
      description:
        'Kerala\'s digital payment adoption rate of 80% is among India\'s highest, and Kochi leads the state. Doxxy\'s billing workflow is UPI-first: auto-generated itemised invoices with UPI QR at checkout, WhatsApp payment links for remote settlement, and automated payment reconciliation. Built-in charge validation catches the 4-7% undercharges from manual billing. Given Kochi\'s competitive clinic landscape — where patients have choices and will switch clinics for a better experience — the billing professionalism that Doxxy provides is a differentiator, not just an efficiency gain.',
    },
    {
      icon: 'shield',
      title: 'Kerala Clinical Establishments Act & e-Health Kerala Compliance',
      description:
        'Doxxy maintains all records in formats compliant with the Kerala Clinical Establishments Act and KSMC requirements. The platform auto-generates statutory registers including the daily patient register, procedure log, and Schedule H/H1 drug dispensing records. ABHA ID creation and linking are built into registration for ABDM compliance, integrating with Kerala\'s e-Health infrastructure. For Kochi Municipal Corporation health establishment licence renewals, Doxxy produces the required documentation in minutes.',
    },
  ],
  whyDoxxyInThisCity:
    'Kochi has the widest gap between patient digital literacy and clinic digital maturity of any Indian city. Patients who pay for their morning filter coffee via UPI, video-call their family in the Gulf on WhatsApp, and research every medication on their smartphone walk into clinics that hand them a paper slip and verbal instructions. Doxxy closes this gap. For Kochi\'s significant medical tourism segment, Doxxy\'s international patient workflows turn documentation into a competitive advantage — attracting patients who expect international-standard clinic operations. With 95% WhatsApp penetration, 80% digital payments, and Kerala\'s aggressive e-Health push, Kochi is the Indian city most ready for digital-first clinic management. Doxxy is the platform that delivers it.',
  testimonials: [
    {
      quote:
        'My clinic near Marine Drive sees a mix of local patients and Gulf NRIs visiting for treatment. The Gulf patients would ask for digital prescriptions and structured reports that I simply could not provide from my paper system. Doxxy changed that. Now every patient — local or international — gets a WhatsApp prescription, a structured treatment summary, and digital billing. My Gulf patient volume increased 30% within six months because patients share their experience in community groups. Digital documentation is not a nice-to-have for Kochi clinics anymore — it is a competitive requirement.',
      name: 'Dr. Thomas Varghese',
      clinic: 'Varghese Medical Centre, Marine Drive, Kochi',
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop',
    },
    {
      quote:
        'My dental practice in Panampilly Nagar serves the most digitally aware patient base I have seen in 20 years of practice. They want online booking, WhatsApp reminders, UPI payments, and digital treatment plans. I was managing all of this with four different tools — Practo, WhatsApp Business, Google Pay, and a paper file for records. Doxxy unified everything. My patients now book, get reminded, receive treatment plans, and pay — all through a single, seamless WhatsApp-integrated workflow. My clinical day is smoother, and my patient satisfaction scores have never been higher.',
      name: 'Dr. Lakshmi Menon',
      clinic: 'Menon Dental Specialists, Panampilly Nagar, Kochi',
      photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'Does Doxxy support Malayalam for prescriptions and patient communication in Kochi?',
      answer:
        'Yes. Malayalam is fully supported as a first-class language in Doxxy — not a transliteration or translation workaround. WhatsApp reminders, appointment confirmations, queue updates, digital prescriptions, lab reports, and post-consultation instructions can all be generated and delivered in Malayalam script. The platform\'s prescription engine includes Malayalam medication names and instructions that match Kerala\'s pharmacy terminology. English is also fully supported, and language preference is set per patient. For Kochi clinics serving areas like Fort Kochi, Mattancherry, and Tripunithura where a significant proportion of patients prefer Malayalam, this native script support is critical. For clinics serving the cosmopolitan population in Kakkanad (near Infopark) and Panampilly Nagar, English can be configured as the default.',
    },
    {
      question: 'How does Doxxy handle medical tourism patients from the Gulf and other countries?',
      answer:
        'Kochi is one of India\'s premier medical tourism destinations, and Doxxy includes specific features for international patient workflows. Treatment summaries and diagnostic reports are generated in formats accepted by international insurers. Billing supports multi-currency display and international invoice formats (useful for Gulf patients who submit claims in their country of residence). Procedure documentation — including pre-and-post images for cosmetic and dental procedures — is structured for international standards. All records can be securely shared digitally with the patient for follow-up care after they return home. These features transform the clinic\'s documentation from a basic compliance requirement into a competitive advantage for attracting and retaining international patients.',
    },
    {
      question: 'Is Doxxy compliant with the Kerala Clinical Establishments Act?',
      answer:
        'Yes. Doxxy maintains all patient records in formats compliant with the Kerala Clinical Establishments (Registration and Regulation) Act and the Kerala State Medical Council requirements. All records are timestamped, digitally signed, access-controlled, and retained for the mandatory minimum period (3 years). The platform auto-generates the statutory registers prescribed under the Act, including the daily patient register, procedure log, Schedule H/H1 drug dispensing records, and biomedical waste documentation. ABHA ID creation and ABDM compliance are built in, integrating with the e-Health Kerala infrastructure. For Kochi Municipal Corporation licence renewals and KSMC inspections, Doxxy produces a complete compliance package in minutes.',
    },
    {
      question: 'Can Doxxy work through Kochi\'s monsoon season when internet and electricity can be disrupted?',
      answer:
        'Kochi\'s monsoon (June-September) brings heavy rainfall that can cause intermittent internet and electricity disruptions. Doxxy is a cloud platform that requires an active internet connection, but we have designed for Kerala\'s monsoon reality. The platform uses minimal bandwidth — under 50MB per day for a 35-patient clinic — and works reliably on 4G connections. We recommend a small UPS (₹2,500-₹3,000) for the reception device and router, which provides 2-3 hours of backup during power cuts. A 4G hotspot serves as a reliable backup internet source when broadband goes down. Doxxy also includes a lightweight offline queue mode where the token system continues to function during brief internet drops, syncing automatically when the connection resumes. Most Kochi clinics find that a basic UPS plus 4G backup provides complete year-round reliability.',
    },
    {
      question: 'I am starting a new clinic in Kakkanad near Infopark — should I go digital from day one?',
      answer:
        'Absolutely. Starting a new clinic in Kochi — especially near Infopark, Kakkanad, or any area with a high concentration of IT professionals — with Doxxy from day one is the single best operational decision you can make. Your patient base in these areas expects digital-first experiences: online booking, WhatsApp communication, UPI payments, and structured digital records. Starting digital means your first patient\'s record is structured and searchable. Your billing audit trail begins with your first invoice. Your compliance documentation is auto-generated from day one. You never develop the paper habits that are expensive and time-consuming to unlearn. And critically, in Kochi\'s competitive clinic market — where patients have choices and will switch for a better experience — a digital-first clinic signals competence and modernity from the moment you open your doors. Doxxy\'s free tier (first 100 consultations per month free) is designed for exactly this: launch digital with zero upfront cost.',
    },
  ],
}

export default config
