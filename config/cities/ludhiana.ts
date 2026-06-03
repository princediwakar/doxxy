// Path: config/cities/ludhiana.ts
import type { CityConfig } from './types'

const config: CityConfig = {
  slug: 'ludhiana',
  cityName: 'Ludhiana',
  state: 'Punjab',
  heroTitle: 'Ludhiana Clinic Management Software — Digital for Punjab\'s Industrial Powerhouse',
  heroSubtitle:
    'Ludhiana\'s 4,500+ clinics serve India\'s most affluent non-metro patient base — hosiery and cycle industry owners, traders, and a growing services class. With only 10% software adoption but 91% WhatsApp penetration, clinics are leaving money on the table with paper workflows. Doxxy helps Ludhiana clinics match their patients\' digital expectations.',
  problemTitle: 'Why Ludhiana\'s Affluent Clinic Sector Is Underserved by Modern Software',
  problemDescription:
    'Ludhiana\'s economy creates a clinic market unlike any other tier-2 city in India. The hosiery and textile industry, cycle manufacturing, and auto parts sector have produced a large, affluent business class that spends on private healthcare at rates comparable to South Delhi or South Mumbai — but without the software infrastructure to match. The average consultation value in a Model Town or Sarabha Nagar clinic is ₹800-₹1,200, patient expectations are high, and yet 80% of clinics still manage appointments on paper diaries and handwritten registers. The disconnect is stark: patients who pay via UPI for everything from groceries to cars are handed a carbon-copy paper receipt at the clinic. They book restaurant tables online but call the clinic receptionist 3 times to confirm a consultation slot. Ludhiana\'s no-show rate of 22% is lower than the national average — reflective of a patient base that values their time — but even at 22%, a clinic billing ₹12L monthly is losing ₹2.6L to empty slots. The Punjab Clinical Establishments Act sets specific record-keeping requirements, and with the state health department accelerating ABDM adoption, clinics face a compliance gap. Additionally, Ludhiana\'s significant NRI population — with family members frequently visiting from Canada, the UK, and Australia — creates a unique use case: clinics need to share records digitally with patients and their overseas family members. Paper files do not cross borders; WhatsApp-delivered digital records do. Ludhiana clinics need a platform that reflects the economic reality of their patient base: premium, digital, and borderless.',
  clinicStats: {
    estimatedClinics: '4,500+',
    avgPatientsPerDay: '25-40',
    softwareAdoptionRate: '10%',
    abdmComplianceRate: '12%',
    paperUsageRate: '80%',
    specialtyMix: '25% general practice, 18% multispecialty, 15% dental, 12% dermatology, 10% orthopaedics, 10% paediatrics, 10% other',
  },
  clinicEconomics: {
    avgRevenuePerPatient: '₹800-1,200',
    avgMonthlyRevenue: '₹8L - ₹15L',
    avgNoShowRate: '22%',
    estimatedMonthlyLossToNoShows: '₹2L - ₹3.5L per month',
    avgBillingErrorRate: '4-7%',
  },
  techContext: {
    whatsappPenetration: '91%',
    digitalPaymentAdoption: '72%',
    internetPenetration: '78%',
  },
  regulatoryNotes:
    'Ludhiana clinics are regulated under the Punjab Clinical Establishments (Registration and Regulation) Act and the Ludhiana Municipal Corporation health department. The Act mandates a minimum 3-year record retention for outpatient cases. Punjab has been steadily rolling out ABDM adoption through the state health agency, with private clinics in Ludhiana, Amritsar, and Jalandhar being prioritised. The state drug controller maintains strict oversight of prescription practices, making legible digital prescriptions with audit trails particularly relevant for Punjab clinics.',
  solutionTitle: 'Doxxy for Ludhiana: Premium Digital Experience for a Premium Patient Base',
  solutionDescription:
    'Doxxy brings Ludhiana clinics into the digital present with a platform that matches the expectations of an affluent, tech-aware patient base. QR-code check-in eliminates the paper diary — patients register in under a minute on their own phone. WhatsApp reminders in Punjabi, Hindi, and English target the 22% no-show rate and push it into single digits. Digital prescriptions with Punjabi (Gurmukhi) script support serve patients who prefer their mother tongue, while English templates serve the NRI and corporate segments. UPI billing generates proper itemised invoices — not carbon copies — with WhatsApp payment links for post-visit settlement. For NRI families, digital records are shareable via secure WhatsApp links, so a son in Toronto can see his father\'s prescription from the family clinic in Model Town. Doxxy gives Ludhiana\'s clinics the digital polish their patients already expect from every other service they use.',
  keyFeatures: [
    {
      icon: 'smartPhone',
      title: 'QR-Code Check-In — No More Paper Diary',
      description:
        'Patients scan a QR code at reception and complete a 4-field intake form on their phone in Punjabi, Hindi, or English. Returning patients check in with a WhatsApp tap. Registration drops from 4-5 minutes to under a minute. The paper appointment diary — a staple of Ludhiana clinics for decades — becomes a thing of the past.',
    },
    {
      icon: 'messageSquare',
      title: 'WhatsApp in Punjabi, Hindi & English',
      description:
        'With 91% WhatsApp penetration, the channel is already ubiquitous. Doxxy delivers appointment reminders, queue updates, prescriptions, lab reports, and post-care instructions in the patient\'s preferred language — Punjabi (Gurmukhi), Hindi, or English. Automated 24-hour and 2-hour reminders push Ludhiana\'s 22% no-show rate toward single digits.',
    },
    {
      icon: 'fileText',
      title: 'Digital Prescriptions in Gurmukhi & English',
      description:
        'Templates pre-filled by specialty. Generate prescriptions in Punjabi (Gurmukhi script), Hindi, or English in under 45 seconds. For elderly patients and those from surrounding towns (Khanna, Jagraon, Mullanpur) who prefer Punjabi, Gurmukhi prescriptions improve medication compliance. Digital prescriptions also satisfy the state drug controller\'s push for legible, auditable prescription records.',
    },
    {
      icon: 'creditCard',
      title: 'UPI Billing for an Affluent Patient Base',
      description:
        'Auto-generated itemised invoices with UPI QR at checkout. WhatsApp payment links for patients who choose to settle later. Billing validation catches missed charges — the ₹200 dressing, the ₹500 injection, the ₹300 procedure tray. For a Ludhiana clinic billing ₹12L monthly, recovering 4-7% leakage adds ₹48,000-₹84,000 back to the practice each month.',
    },
    {
      icon: 'globe',
      title: 'NRI-Family Record Sharing',
      description:
        'Ludhiana has one of India\'s highest NRI populations, with family members frequently visiting from Canada, the UK, and Australia. Doxxy enables secure, WhatsApp-delivered digital records that patients can share with overseas family members instantly. A son in Vancouver can review his mother\'s prescription and lab results from the family clinic in Dugri — no photos of paper files, no garbled phone explanations.',
    },
    {
      icon: 'shield',
      title: 'Punjab Clinical Establishments Act Compliance',
      description:
        'All records digitally timestamped, access-controlled, and retained for the state-mandated minimum period. Auto-generated statutory registers compliant with the Punjab Clinical Establishments Act. ABHA ID creation and linking for ABDM compliance. When the municipal health department inspects, produce a complete compliance report in two clicks.',
    },
  ],
  whyDoxxyInThisCity:
    'Ludhiana is the most economically compelling clinic software market in Punjab — high patient spending, low software penetration, and a patient base that already lives on WhatsApp and UPI. The opportunity cost of paper in Ludhiana is higher than in most cities. A single no-show here costs ₹800-₹1,200 — 40% more than in many other tier-2 cities. A billing error here bleeds more because the average invoice is larger. And a dissatisfied patient here — one who expects the same digital experience they get from Swiggy, Amazon, and Paytm — may quietly switch to the clinic down the road that has modernised. Doxxy gives Ludhiana clinics the software that their patient base already assumes they have: digital check-in, WhatsApp communication, UPI billing, and records that cross borders as easily as their patients\' families do. At ₹10 per consultation after the first 100 free, the cost is a rounding error against the revenue it protects.',
  testimonials: [
    {
      quote:
        'My clinic on Pakhowal Road sees a lot of business families — hosiery owners, exporters, traders. They pay ₹1,000 for a consultation and expect a certain experience. Handing them a carbon-copy paper receipt did not match that expectation. With Doxxy, everything is digital — WhatsApp booking, UPI payment, prescription on their phone. My patients notice the difference. And our billing leakage dropped by ₹55,000 in the first month.',
      name: 'Dr. Gurpreet Singh',
      clinic: 'Singh Medical Centre, Pakhowal Road, Ludhiana',
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop',
    },
    {
      quote:
        'Half my dermatology patients have family abroad — sons and daughters in Canada or the UK who want to see what I have prescribed. Before Doxxy, I was taking photos of my prescription pad and sending them on WhatsApp. Embarrassing, looking back. Now, the prescription is generated digitally, and the patient\'s son in Toronto gets a proper medical record, not a blurry phone photo. It has changed how seriously my practice is perceived.',
      name: 'Dr. Harpreet Kaur',
      clinic: 'Kaur Skin Clinic, Sarabha Nagar, Ludhiana',
      photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop',
    },
  ],
  faqs: [
    {
      question: 'Does Doxxy support Punjabi (Gurmukhi) for prescriptions and communication?',
      answer:
        'Yes. Punjabi in Gurmukhi script is fully supported across Doxxy. Patient intake forms, prescriptions, WhatsApp reminders, appointment confirmations, post-care instructions, and billing receipts can all be delivered in Gurmukhi. Language preference is stored per patient and applied automatically. For Ludhiana clinics serving patients from surrounding towns (Khanna, Jagraon, Samrala) where Punjabi is the primary language, Gurmukhi communication improves understanding and treatment adherence. Hindi and English are also fully supported.',
    },
    {
      question: 'How does Doxxy handle NRI patients and their families who want access to medical records?',
      answer:
        'Doxxy makes record-sharing with overseas family members frictionless. Every patient record, prescription, and lab report is digital and can be shared via a secure WhatsApp link. A patient\'s son in Toronto, daughter in London, or brother in Melbourne can receive and review their family member\'s medical documentation instantly — no photos of paper files, no unclear phone descriptions. This is particularly valuable in Ludhiana, where a significant proportion of families have members abroad who remain closely involved in their parents\' healthcare decisions.',
    },
    {
      question: 'Is Doxxy compliant with the Punjab Clinical Establishments Act?',
      answer:
        'Yes. Doxxy maintains patient records in compliance with the Punjab Clinical Establishments (Registration and Regulation) Act. All records are digitally timestamped, access-controlled, and retained for the state-mandated minimum period of 3 years for outpatient cases. The platform auto-generates statutory registers required by the Ludhiana Municipal Corporation health department. ABHA ID creation and linking is built into registration for ABDM compliance. Digital prescriptions with full audit trails also satisfy the Punjab drug controller\'s documentation standards.',
    },
    {
      question: 'My clinic caters to an affluent patient base — can Doxxy\'s interface match the experience they expect?',
      answer:
        'Doxxy is designed to deliver a premium patient experience that matches the expectations of an affluent, digitally native patient base. From WhatsApp-based booking and QR-code check-in (no paper forms at reception) to UPI billing with proper digital invoices and prescriptions delivered to the patient\'s phone, every touchpoint feels modern and polished. Patients who use Swiggy, Amazon, and Paytm every day recognise and appreciate the same level of digital convenience in their clinic experience. For Ludhiana clinics serving a business-class patient base, this digital polish is a competitive differentiator.',
    },
    {
      question: 'What does Doxxy cost for a Ludhiana clinic?',
      answer:
        'Doxxy\'s pricing is transparent and aligned with clinic economics: the first 100 consultations per month are completely free. Beyond that, it is ₹10 per consultation with no monthly minimum, no setup fee, and no hardware purchase. For a typical Ludhiana clinic seeing 25-30 patients per day, the monthly cost is approximately ₹4,500-₹5,500. Given that Ludhiana\'s average consultation value is ₹800-₹1,200, preventing just one no-show per day more than covers the entire monthly cost. Catching 5% of billing leakage on a ₹12L monthly practice recovers ₹60,000 — more than 10 times the software cost. Doxxy is not a cost for Ludhiana clinics; it is an immediate profit contributor.',
    },
  ],
}

export default config
