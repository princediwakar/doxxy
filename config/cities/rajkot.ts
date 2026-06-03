// Path: config/cities/rajkot.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'rajkot',
  cityName: 'Rajkot',
  state: 'Gujarat',
  heroTitle: 'Rajkot Clinic Management Software — Digital Efficiency for Gujarat\'s Business Hub',
  heroSubtitle:
    'From Yagnik Road to Kalavad Road, Rajkot\'s 3,800+ clinics serve one of India\'s most business-savvy populations — traders, manufacturers, and entrepreneurs who expect the same digital convenience from their doctor that they get from their bank and their kirana supplier. With 93% WhatsApp penetration and a clinic sector still 72% paper-based, Rajkot is ready for a platform that speaks Gujarati, respects business efficiency, and works on the devices clinics already own.',
  problemTitle: 'Why Rajkot\'s Clinics Are Overdue for a Digital Leap',
  problemDescription:
    'Rajkot punches well above its weight. The city is Gujarat\'s fourth-largest but its commercial density — engineering units, auto parts manufacturing, textile trading, jewellery — creates a patient base that is mobile, time-conscious, and digitally fluent. These are patients who book train tickets on IRCTC, pay their electricity bill on Google Pay, and run their wholesale business on WhatsApp — and they expect their doctor\'s clinic to offer the same level of digital convenience. Yet 72% of Rajkot clinics still run on paper. The clinic on Yagnik Road that sees 35 patients between 9 AM and 1 PM handles registration with a pen, chits, and a register. Prescriptions are handwritten in Gujarati on pre-printed pads. Follow-ups are tracked by memory or, at best, a desk diary. The result is predictable: inefficiencies that a business-owing patient would never tolerate in their own company. The 24% no-show rate costs the average Rajkot clinic ₹1.5L-₹2.5L per month. Manual billing errors — a ₹100 injection fee missed here, a ₹300 dressing charge forgotten there — leak 5-8% of monthly revenue. Patient records that take 4-5 minutes to retrieve from a filing cabinet compress the doctor\'s consultation time and limit how many patients can be seen. Rajkot\'s software adoption rate of 10% is slightly above the national average, but most adopted clinics are using outdated desktop systems — locally installed, no WhatsApp integration, no UPI support, no mobile access. The Rajkot Municipal Corporation (RMC) regulates clinics under the Gujarat Nursing Home Act, and ABDM compliance expectations are gradually rising. The clinics that digitise now will do it on their own terms — gradually, affordably, and with a platform that respects the Gujarati work ethic: efficiency without complexity, technology that works reliably without needing an IT department.',
  clinicStats: {
    estimatedClinics: '3,800+',
    avgPatientsPerDay: '25-40',
    softwareAdoptionRate: '10%',
    abdmComplianceRate: '18%',
    paperUsageRate: '72%',
    specialtyMix: '35% general practice, 20% multispecialty, 15% dental, 12% dermatology, 18% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹600-900',
    avgMonthlyRevenue: '₹6L - ₹10L',
    avgNoShowRate: '24%',
    estimatedMonthlyLossToNoShows: '₹1.5L - ₹2.5L per month',
    avgBillingErrorRate: '5-8%',
  },
  techContext: {
    whatsappPenetration: '93%',
    digitalPaymentAdoption: '65%',
    internetPenetration: '74%',
  },
  regulatoryNotes:
    'Rajkot clinics are regulated under the Gujarat Nursing Home Act and the Rajkot Municipal Corporation (RMC) health department. Patient records must be maintained for a minimum of 3 years for outpatient cases under state law. The RMC has been strengthening its health establishment registration and inspection framework, with particular attention to clinics in the central business areas (Yagnik Road, Amin Marg, Jawahar Road) where patient density is highest. Gujarat has been a proactive participant in ABDM rollout, and Rajkot — as Saurashtra\'s commercial capital — is expected to see increased ABDM compliance expectations for private clinics in the coming year.',
  solutionTitle: 'Doxxy for Rajkot: Gujarati-First, Business-Efficient, Zero Friction',
  solutionDescription:
    'Doxxy is built to match Rajkot\'s business culture: efficient, reliable, and no unnecessary complexity. The platform runs on any device with a browser — the existing PC, a tablet, or a phone. No server. No installation. No AMC contract with a local IT vendor. QR-code check-in eliminates paper registration entirely. WhatsApp integration — at 93% penetration in Rajkot — handles appointment reminders, queue updates, and prescription delivery in Gujarati, Hindi, and English. UPI billing with auto-generated invoices serves both cash-and-digital payment workflows. Digital prescriptions in Gujarati script take under 60 seconds using templates tailored to Rajkot\'s common OPD presentations. For clinics currently on legacy desktop systems, Doxxy offers a patient data import pathway that migrates existing records without data loss.',
  keyFeatures: [
    {
      icon: 'messageSquare',
      title: 'WhatsApp-First Communication in Gujarati, Hindi & English',
      description:
        'At 93% WhatsApp penetration, Rajkot has near-universal WhatsApp coverage across all patient demographics — from a 70-year-old in a joint family on Amin Marg to a 22-year-old engineering trainee near Aji Dam. Doxxy uses WhatsApp for appointment reminders, live queue updates, prescription delivery, payment links, and post-care instructions — all in the patient\'s preferred language (Gujarati, Hindi, or English). This single channel handles 80% of what a receptionist currently does by phone.',
    },
    {
      icon: 'smartPhone',
      title: 'QR-Code Registration — 60 Seconds, No Paper',
      description:
        'New patients scan a QR code at reception and fill a 4-field digital intake form on their own phone. Returning patients check in via WhatsApp with a single tap. Registration time drops from 4-5 minutes of paper form filling to under a minute. For Rajkot clinics seeing 30-40 patients per session, this saves 2-3 hours of receptionist time per day — time that can be redirected to patient care, billing accuracy, and follow-up management.',
    },
    {
      icon: 'fileText',
      title: 'Digital Prescriptions in Gujarati Script',
      description:
        'Gujarati-script prescriptions are essential for Rajkot\'s patient base — particularly elderly patients and families from traditional Gujarati backgrounds. Doxxy\'s templated prescription system generates prescriptions in Gujarati, Hindi, or English, with pre-filled medication names, dosage instructions, and follow-up guidance. The doctor selects the diagnosis, reviews the template, makes any adjustments, and signs — in under 60 seconds. No more illegible handwriting causing dispensing errors at the chemist.',
    },
    {
      icon: 'creditCard',
      title: 'UPI Billing With Gujarati Invoices',
      description:
        'Auto-generated itemised invoices at checkout with UPI QR. For Rajkot\'s trading community — who often visit between business hours and ask to "settle later" — WhatsApp payment links are sent directly. Built-in charge validation stops the 5-8% revenue leakage from missed line items. The invoice can be generated in Gujarati or English. For a clinic with ₹8L monthly revenue, even a 3% billing accuracy improvement recovers ₹24,000 per month — ₹2.88L annually with zero additional patient volume.',
    },
    {
      icon: 'trendingUp',
      title: 'Appointment Reminders That Match the Gujarati Work Calendar',
      description:
        'Rajkot\'s 24% no-show rate is driven partly by the business calendar — patients who own shops or small manufacturing units often miss appointments when urgent work intervenes. Doxxy\'s automated WhatsApp reminders at 24 hours and 2 hours before the appointment, with one-tap confirm or reschedule, have cut no-shows by 30-40% in comparable cities. The system also supports custom reminder timing for evening OPDs, which are common in Rajkot where patients prefer to visit after their business closes.',
    },
    {
      icon: 'shield',
      title: 'Gujarat Nursing Home Act & RMC Compliance',
      description:
        'All records are digital, timestamped, and audit-trailed — meeting the documentation standards of the Gujarat Nursing Home Act. Statutory registers are auto-generated in the format required by the RMC health department. ABHA ID creation and linking is built into patient registration for ABDM compliance. When the municipal health inspector schedules a visit, the clinic produces a complete compliance report in two clicks — no scrambling through paper files, no anxiety about incomplete registers, no risk of licence complications.',
    },
  ],
  whyDoxxyInThisCity:
    'Rajkot\'s clinic sector has the highest latent digital readiness of any tier-2 city in India — 93% WhatsApp penetration, 65% digital payment adoption, and a patient base that actively prefers digital convenience. Yet 72% of clinics are still paper-based, and the 10% that use software are stuck on outdated desktop systems that do not support WhatsApp, UPI, or Gujarati prescriptions. Doxxy bridges this gap: a cloud platform that requires zero IT investment, works on existing devices, supports Gujarati as a first-class language, and whose pricing model (first 100 consultations free, then ₹10 per consultation) makes the financial decision a non-issue. For Rajkot\'s business-minded doctors, Doxxy is not a software purchase — it is an operational efficiency investment with a measurable, immediate ROI.',
  testimonials: [
    {
      quote:
        'My clinic on Kalavad Road sees many patients from the engineering and auto parts businesses. They are busy people — they message on WhatsApp, pay with Google Pay, and expect the same from their doctor. Before Doxxy, I was losing 7-8 patients every day to no-shows because the reminder calls were inconsistent. The automated WhatsApp reminders in Gujarati changed everything. No-shows dropped from 26% to 14% in two months. My patients appreciate the professionalism — they tell me my clinic feels "organised" now.',
      name: 'Dr. Hitesh Patel',
      clinic: 'Patel Family Clinic, Kalavad Road, Rajkot',
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop',
    },
    {
      quote:
        'As a dermatologist near Yagnik Road, my practice depends on follow-up visits — acne treatment, pigmentation, laser sessions all need 3-6 visits spread over months. Earlier, my assistant would call patients manually and maybe half would remember their follow-up. Doxxy\'s treatment plan sequencing and automated Gujarati WhatsApp reminders brought my follow-up completion rate from 45% to 75%. The Gujarati prescription template alone saves me an hour of writing every day. My patients love getting their prescriptions on WhatsApp — they never lose them.',
      name: 'Dr. Kinjal Thakkar',
      clinic: 'Thakkar Skin & Aesthetics, Yagnik Road, Rajkot',
      photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'Does Doxxy generate prescriptions in Gujarati? My elderly patients cannot read English prescriptions.',
      answer:
        'Yes. Gujarati is fully supported as a prescription language, alongside Hindi and English. The templated prescription system includes Gujarati medication names, dosage instructions (e.g., "સવારે અને રાત્રે જમ્યા પછી"), and follow-up guidance. WhatsApp reminders and post-care instructions also support Gujarati. The language preference is set per patient — a clinic can serve Gujarati, Hindi, and English-speaking patients seamlessly. This is particularly valuable in Rajkot where a significant proportion of patients across all age groups prefer Gujarati-script communication.',
    },
    {
      question: 'Can Doxxy handle evening OPDs — most of my patients come after 6 PM when their shops close?',
      answer:
        'Yes. Many Rajkot clinics run evening OPDs (6 PM to 9 PM) to accommodate patients who run businesses during the day. Doxxy\'s scheduling system fully supports multiple OPD sessions per day — morning and evening — with separate queues, separate appointment slots, and separate WhatsApp reminder schedules. The evening session can be configured with its own timing windows, and reminders are sent accordingly (e.g., a 2 PM reminder for a 7 PM appointment). The token system and queue tracking work identically across both sessions, giving evening patients the same WhatsApp-based wait-time visibility as morning patients.',
    },
    {
      question: 'How does Doxxy handle the seasonal shift in Rajkot\'s disease patterns — dengue, chikungunya, and skin conditions?',
      answer:
        'Rajkot\'s semi-arid climate creates a distinct disease calendar: vector-borne diseases (dengue, chikungunya, malaria) spike during and after the monsoon (July to October); skin conditions (fungal infections, prickly heat) rise in the hot, humid summer months (March to June); respiratory infections and seasonal allergies peak during the winter (November to February). Doxxy\'s specialty-specific prescription templates cover these seasonal presentations with pre-configured medications and dosages. During outbreak periods, clinics can create and save custom quick-prescription templates for the specific circulating disease strain. The analytics dashboard also tracks diagnosis trends, helping clinics identify outbreak patterns in their own patient data before municipal health bulletins are published.',
    },
    {
      question: 'Is Doxxy affordable for a single-doctor clinic in Rajkot?',
      answer:
        'Yes. The first 100 consultations per month are completely free — suitable for a clinic seeing 4-5 patients daily. Beyond that, it is ₹10 per consultation with no monthly minimum, no setup fee, and no hardware costs. For a typical single-doctor Rajkot clinic seeing 25-30 patients per day, the monthly cost is approximately ₹4,500-₹5,500. The economics are unambiguous: recovering just two no-shows per day (₹1,200-₹1,800 at Rajkot\'s average ₹600-₹900 per consultation) generates ₹36,000-₹54,000 in additional monthly revenue — a 7-10x return on the software cost. Reducing billing errors by even half recovers another ₹25,000-₹40,000 monthly. Doxxy is not an expense; it is an operational efficiency investment with a payback period measured in days, not months.',
    },
    {
      question: 'I currently use an old desktop software — can my patient data be moved to Doxxy?',
      answer:
        'Yes. Doxxy supports patient data import from CSV exports, which most legacy desktop clinic management systems (common in Rajkot) can generate. Our team assists with mapping and importing patient names, phone numbers, demographics, and visit history. While detailed historical clinical notes may not transfer in full structured format, the core patient database — names, contact information, and basic medical history — migrates cleanly. For clinics with large databases (5,000+ patient records), we recommend scheduling the import over a weekend to avoid any OPD disruption. The transition from the old system to Doxxy can be completed in 2-3 days.',
    },
  ],
}

export default config
