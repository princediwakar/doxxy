// Path: config/cities/vadodara.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'vadodara',
  cityName: 'Vadodara',
  state: 'Gujarat',
  heroTitle: 'Vadodara Clinic Management Software — Digital for Gujarat\'s Cultural Capital',
  heroSubtitle:
    'Vadodara\'s 5,500+ clinics — concentrated in Alkapuri, Sayajigunj, Karelibaug, and Manjalpur — serve a unique mix of PSU employees, university students, and industrial workers. With only 12% software adoption but 92% WhatsApp penetration, Vadodara clinics are primed for a digital leap. Doxxy helps them make it.',
  problemTitle: 'Why Vadodara\'s Clinics Are Stuck Between Industrial Speed and Paper Processes',
  problemDescription:
    'Vadodara\'s healthcare ecosystem reflects its economic DNA: large public sector employers (GSFC, IPCL, ONGC, Railways) have their own dispensaries, leaving thousands of private clinics to serve everyone else — university students from MSU Baroda, industrial contract workers from Nandesari and Makarpura GIDC, and the city\'s growing service-sector middle class. A typical clinic in Alkapuri or Sayajigunj manages 35-45 patients daily on paper, with a receptionist who doubles as phone operator and billing clerk. The Gujarat Nursing Home Act mandates specific record-keeping standards, and the Vadodara Municipal Corporation (VMC) health department has been increasing inspection frequency — clinics that cannot produce auditable records face compounding fines. The language mix adds another layer: Gujarati-speaking elderly patients from old-city areas like Mandvi and Raopura want prescriptions in Gujarati, while younger patients and the large non-Gujarati workforce at GIDC estates prefer Hindi or English. Clinics near the railway station and bus stand see a high volume of walk-in, transient patients with no prior records — registration eats up 5-6 minutes per new patient. No-show rates hover around 25%, driven by patients at the far ends of the city (Waghodia Road, Harni, Tarsali) who skip appointments rather than navigate cross-city traffic. Vadodara\'s clinics do not need generic software — they need a platform that understands Gujarat\'s regulatory environment, the multilingual patient base, and the economics of a mid-size city practice.',
  clinicStats: {
    estimatedClinics: '5,500+',
    avgPatientsPerDay: '25-40',
    softwareAdoptionRate: '12%',
    abdmComplianceRate: '14%',
    paperUsageRate: '78%',
    specialtyMix: '30% general practice, 20% multispecialty, 18% dental, 12% dermatology, 10% paediatrics, 10% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹500-800',
    avgMonthlyRevenue: '₹5L - ₹9L',
    avgNoShowRate: '25%',
    estimatedMonthlyLossToNoShows: '₹1.2L - ₹2L per month',
    avgBillingErrorRate: '5-8%',
  },
  techContext: {
    whatsappPenetration: '92%',
    digitalPaymentAdoption: '68%',
    internetPenetration: '78%',
  },
  regulatoryNotes:
    'Vadodara clinics are regulated under the Gujarat Nursing Home Act and VMC health department. Patient records must be maintained for a minimum of 3 years under state norms. Gujarat has been progressing with ABDM adoption through the state health department, with larger clinics in metro areas being the first wave. Pharmacies in Gujarat have a high digital adoption rate, making e-prescription workflows particularly viable — prescriptions sent digitally to local chemists can be filled without paper handoffs. Clinics operating near industrial zones (Nandesari, Makarpura) face additional occupational health documentation requirements.',
  solutionTitle: 'Doxxy for Vadodara: Gujarati-First, Paperless, and PSU-Ready',
  solutionDescription:
    'Doxxy is purpose-built for Gujarat\'s clinic environment. QR-code patient check-in cuts registration from 5 minutes to under 60 seconds, eliminating the front-desk bottleneck that clogs Vadodara OPDs during the 9 AM-11 AM rush. WhatsApp reminders in Gujarati, Hindi, and English target the 25% no-show rate with automated 24-hour and 2-hour nudges — critical when patients are commuting from Waghodia Road or Harni to central clinics. Digital prescriptions support Gujarati script, a must for the 40%+ of patients who prefer prescriptions in their mother tongue. UPI billing with Gujarati invoice templates and WhatsApp payment links stops the 5-8% revenue leakage from manual billing. For clinics near GIDC estates, Doxxy\'s occupational health modules help meet workplace injury and periodic check-up documentation requirements that PSU contractors demand. And with VMC inspections tightening, auto-generated statutory registers make compliance a non-event.',
  keyFeatures: [
    {
      icon: 'smartPhone',
      title: 'QR-Code Check-In with Gujarati Intake',
      description:
        'New patients scan a QR code and fill a 4-field intake form on their phone — in Gujarati, Hindi, or English. Returning patients check in with a single WhatsApp tap. Registration drops from 5-6 minutes to under 60 seconds. The receptionist stops being a data-entry bottleneck and starts managing patient flow — critical during the morning rush when 25+ patients arrive in the first two hours.',
    },
    {
      icon: 'messageSquare',
      title: 'WhatsApp Reminders in Gujarati, Hindi & English',
      description:
        'Automated appointment reminders sent 24 hours and 2 hours before each slot. One-tap confirm or reschedule. For elderly Gujarati-speaking patients in old-city areas, these arrive in Gujarati script — no English, no confusion. Clinics using this feature see no-show rates drop from 25% to under 16% within 60 days.',
    },
    {
      icon: 'fileText',
      title: 'Gujarati-Script Prescriptions & Digital Pharmacy Handoff',
      description:
        'Generate prescriptions in Gujarati, Hindi, or English using specialty-specific templates. Send prescriptions directly to the patient\'s preferred pharmacy via WhatsApp — Gujarat\'s digitally advanced chemist network means many local pharmacies can fill prescriptions from a phone screen. No lost paper prescriptions. No pharmacy callbacks to verify illegible handwriting.',
    },
    {
      icon: 'creditCard',
      title: 'UPI Billing & Revenue Recovery for Mid-Size Clinics',
      description:
        'Auto-generated itemised invoices with UPI QR at checkout. WhatsApp payment links for patients who leave without paying or need to settle later. Billing validation catches undercharges — the ₹80 injection charge missed, the ₹150 dressing procedure not added. For a Vadodara clinic billing ₹6L monthly, recovering even 5% in missed charges adds ₹30,000 back to the bottom line each month.',
    },
    {
      icon: 'shield',
      title: 'Gujarat Nursing Home Act & VMC Compliance',
      description:
        'All records timestamped, access-controlled, and auditable. Auto-generated statutory registers compliant with Gujarat Nursing Home Act requirements. ABHA ID creation and linking built into registration. When the VMC health inspector visits, produce a compliance report in two clicks. No scrambling through paper registers, no compounding fines for missing documentation.',
    },
    {
      icon: 'briefcase',
      title: 'Occupational Health Documentation for Industrial Catchments',
      description:
        'For clinics in Nandesari, Makarpura GIDC, and Harni — areas with high industrial worker footfall — Doxxy includes templates for workplace injury documentation, periodic health check-up reports, and fitness certificates. These are standard requirements for PSU and large industrial employer referrals. Generate a complete occupational health report in under 2 minutes.',
    },
  ],
  whyDoxxyInThisCity:
    'Vadodara occupies a sweet spot: large enough to have digital infrastructure (92% WhatsApp, 68% UPI adoption), small enough that most clinics still run on paper, and culturally Gujarati-first in a way that most clinic software — designed for English-dominant metros — cannot serve. Doxxy meets Vadodara clinics where they are: Gujarati-language support across check-in, prescriptions, reminders, and billing; cloud-based with zero IT overhead; and aggressive pay-per-consultation pricing (₹10/consultation after the first 100 free) that aligns with the economics of a mid-size city practice. Preventing one no-show per day at ₹500-₹800 pays for the entire month of Doxxy. Stopping 5% billing leakage on a ₹6L monthly practice recovers ₹30,000. For Vadodara\'s 5,500 clinics, Doxxy is not a luxury upgrade — it is unclaimed revenue already sitting in the OPD.',
  testimonials: [
    {
      quote:
        'My clinic in Alkapuri sees a lot of elderly patients from the old city who only read Gujarati. Before Doxxy, I was handwriting prescriptions in Gujarati — taking 3-4 minutes per patient. Now I select from templates in Gujarati, review, and sign in under a minute. The WhatsApp reminders in Gujarati have cut my no-shows dramatically. My patients feel respected because the software speaks their language.',
      name: 'Dr. Harshil Shah',
      clinic: 'Shah Clinic, Alkapuri, Vadodara',
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop',
    },
    {
      quote:
        'I run a dental practice near the railway station — half my patients come from outside Vadodara. They do not know the city, often arrive late, and previously just would not show up for their second or third RCT visit. Doxxy\'s automated WhatsApp reminders and live queue tracking changed everything. My multi-visit treatment completion rate went from 48% to 74% in four months. That is real revenue I was losing.',
      name: 'Dr. Kinjal Patel',
      clinic: 'Patel Dental Care, Sayajigunj, Vadodara',
      photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'Does Doxxy support prescriptions and communication in Gujarati?',
      answer:
        'Yes. Gujarati is a first-class language in Doxxy. Patient intake forms, prescriptions, WhatsApp reminders, appointment confirmations, and post-care instructions can all be delivered in Gujarati script. The patient\'s language preference is stored in their profile and applied automatically. For clinics in areas with significant Gujarati-speaking populations — which is most of Vadodara — this means patients receive communication in the language they are most comfortable with. Hindi and English are also fully supported, and the doctor can switch prescription language per patient if needed.',
    },
    {
      question: 'How does Doxxy handle walk-in patients and transient traffic common near railway stations and bus stands?',
      answer:
        'Clinics near transit hubs like the Vadodara railway station and central bus stand see a high volume of new, walk-in patients with no prior records. Doxxy\'s QR-code intake form gets these patients registered in under a minute — they scan, fill four fields on their phone, and are in the queue. No paper form, no receptionist data entry, no backlog. For patients who will never return (one-time visitors), the system still captures a complete record for medico-legal compliance without consuming staff time. These records remain searchable if the patient ever comes back.',
    },
    {
      question: 'Is Doxxy compliant with the Gujarat Nursing Home Act and VMC regulations?',
      answer:
        'Yes. Doxxy maintains patient records in the format prescribed under the Gujarat Nursing Home Act, with all records timestamped, access-controlled, and retained for the mandatory minimum period. The platform auto-generates statutory registers required by the VMC health department, including the daily patient register and procedure logs. ABHA ID creation and linking is built into patient registration for ABDM compliance. For clinics undergoing VMC inspections, compliance documentation is produced in the required format on demand.',
    },
    {
      question: 'Can Doxxy handle my clinic\'s specific specialty — we see a lot of occupational health cases from GIDC?',
      answer:
        'Yes. Doxxy includes occupational health templates specifically useful for clinics serving industrial workers. Pre-configured templates for workplace injury documentation, pre-employment health checks, periodic medical examinations, and fitness-for-duty certificates are available. These are the standard formats that PSUs like GSFC, ONGC, and large GIDC employers require from referring clinics. You can generate a complete occupational health report in under 2 minutes instead of hand-typing or handwriting each one.',
    },
    {
      question: 'What does Doxxy cost for a typical single-doctor clinic in Vadodara?',
      answer:
        'Doxxy follows a simple pay-per-use model: the first 100 consultations per month are completely free. Beyond that, it is ₹10 per consultation with no monthly minimum, no setup fee, and no hardware purchase. For a typical single-doctor Vadodara clinic seeing 25-30 patients per day, the monthly cost is approximately ₹4,500-₹5,500 — less than a part-time receptionist\'s salary. The ROI is immediate and measurable: preventing one no-show per day (₹500-₹800) covers the entire monthly cost. Recovering 5% billing leakage on a ₹6L monthly practice adds ₹30,000 in reclaimed revenue. Doxxy pays for itself — often on day one.',
    },
  ],
}

export default config
