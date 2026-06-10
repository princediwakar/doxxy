// Path: app/(public)/clinic-regulatory-compliance-india/page.tsx

import type { Metadata } from 'next';
import Script from 'next/script';
import {
  ArrowRight,
  Clock,
  Building2,
  Shield,
  FileText,
  CheckCircle,
  AlertTriangle,
  ClipboardList,
  ChevronRight,
  HelpCircle,
  Zap,
  Landmark,
  Trash2,
  Pill,
  Search,
  BadgeCheck,
  Calendar,
  Database,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import SignupCTA from '@/components/SignupCTA';
import BreadcrumbJsonLd from '@/components/SEO/BreadcrumbJsonLd';
import { APP_URL } from '@/lib/constants';
import { Section, SectionTitle, SectionSubtitle } from '@/components/ui/section-headers';

export const metadata: Metadata = {
  title: 'Clinic Regulatory Compliance in India — Licenses, Acts & Digital Records | Doxxy',
  description:
    'Complete guide to regulatory compliance for Indian clinics. Covers Clinical Establishments Act, state nursing home acts, biomedical waste rules, Schedule H/H1 drug records, digital record-keeping, and inspection readiness. Updated June 2026.',
  alternates: { canonical: '/clinic-regulatory-compliance-india' },
  openGraph: {
    type: 'website',
    title: 'Clinic Regulatory Compliance in India — Licenses, Acts & Digital Records',
    description:
      'Complete guide to regulatory compliance for Indian clinics. Clinical Establishments Act, state acts, biomedical waste, drug records, and inspection readiness.',
    images: [{ url: '/doxxy.png', width: 1200, height: 630, alt: 'Clinic Regulatory Compliance India' }],
  },
  keywords: [
    'clinic regulatory compliance India',
    'Clinical Establishments Act clinic',
    'nursing home act compliance',
    'biomedical waste management clinic',
    'Schedule H drug records clinic',
    'clinic inspection readiness India',
    'digital record keeping clinic India',
    'clinic license requirements India',
  ],
};

// --- DATA ---

const clinicalEstablishmentsAct = [
  {
    icon: Building2,
    title: 'What the Clinical Establishments Act Covers',
    description:
      'The Clinical Establishments (Registration and Regulation) Act, 2010 is the central legislation governing healthcare facilities in India. It applies to all clinical establishments — clinics, nursing homes, diagnostic centres, and hospitals of all sizes across all recognized systems of medicine (allopathy, ayurveda, homeopathy, unani, siddha, and sowa-rigpa). The Act mandates: (1) registration with the state or national council for clinical establishments, (2) compliance with minimum standards of facilities and services, (3) maintenance of specified records and reports, and (4) display of rates and charges. It is implemented through the National Council for Clinical Establishments and state-level councils.',
  },
  {
    icon: AlertTriangle,
    title: 'State Adoption Status — It Is Not Uniform',
    description:
      'The Clinical Establishments Act is NOT uniformly adopted across all states. As of June 2026: Adopted states include Uttar Pradesh, Bihar, Jharkhand, Uttarakhand, Rajasthan, Assam, Sikkim, Mizoram, Arunachal Pradesh, Himachal Pradesh, and all Union Territories. Major states like Maharashtra, Karnataka, Tamil Nadu, Kerala, West Bengal, and Gujarat have their own state-specific nursing home acts and have NOT adopted the central Act. This creates a compliance patchwork: if your clinic is in a state that has adopted the central Act, you register under it. If your state has its own act (e.g., Maharashtra Nursing Homes Registration Act, 1949; Karnataka Private Medical Establishments Act, 2007), you register under the state act. Check your state\'s specific act — this guide covers both frameworks.',
  },
  {
    icon: ClipboardList,
    title: 'Registration Requirements Under the Central Act',
    description:
      'For clinics in states that have adopted the Clinical Establishments Act: You must apply for registration (provisional or permanent) with the district registering authority. Provisional registration is issued for new establishments and is valid for 1 year (renewable). Permanent registration is issued after inspections verify compliance with minimum standards. The application requires: clinic details (name, address, type, system of medicine), details of the person-in-charge (qualifications, registration with medical council), list of services provided, list of equipment, staffing details, and fee payment (varies by state: typically Rs. 5,000-50,000 depending on clinic type and bed count). Registration must be displayed prominently in the clinic.',
  },
  {
    icon: FileText,
    title: 'Minimum Standards: Four Categories of Compliance',
    description:
      'The Act prescribes minimum standards in four categories: (A) Physical Infrastructure — minimum room sizes, ventilation, lighting, waiting area, separate examination room, emergency exit, signage. (B) Human Resources — qualified medical practitioner, registered nurse or paramedic if procedures are performed, staff training in infection control and biomedical waste management. (C) Equipment and Supplies — essential diagnostic equipment (BP apparatus, stethoscope, thermometer, weighing scale, glucometer), emergency resuscitation equipment, sterilization equipment, first-aid supplies. (D) Processes and Records — patient registration records, consultation records, prescription records, lab investigation records, procedure records, consent forms for procedures, discharge/death records. These records must be maintained for the legally prescribed retention period (typically 3-7 years from the last entry).',
  },
];

const stateNursingHomeActs = [
  {
    state: 'Maharashtra',
    act: 'Maharashtra Nursing Homes Registration Act, 1949 (as amended)',
    highlights: [
      'Registration with the local municipal corporation or the district collector.',
      'Minimum physical standards specified for nursing homes (room sizes, sanitation, fire safety).',
      'Inspections by the registering authority — typically annual.',
      'Display of registration certificate and rate card.',
      'Maintenance of admission, discharge, and death registers.',
      'Penalties for non-compliance: Rs. 1,000-10,000 fine and/or imprisonment up to 3 months.',
    ],
  },
  {
    state: 'Karnataka',
    act: 'Karnataka Private Medical Establishments Act, 2007',
    highlights: [
      'Registration with the district registration authority.',
      'Minimum standards for infrastructure, staffing, equipment, and record-keeping specified by rules.',
      'Regular inspections by the competent authority.',
      'Display of registration certificate and schedule of charges.',
      'Maintenance of patient records for 5 years.',
      'Grievance redressal mechanism for patient complaints.',
    ],
  },
  {
    state: 'Tamil Nadu',
    act: 'Tamil Nadu Private Clinical Establishments (Regulation) Act, 1997',
    highlights: [
      'Registration with the competent authority (Joint Director of Health Services in each district).',
      'Minimum standards for infrastructure, equipment, staffing, and sanitation.',
      'Inspections before registration and periodically thereafter.',
      'Display of registration certificate, rate card, and hours of operation.',
      'Incident reporting to authorities for any death or medico-legal case.',
    ],
  },
  {
    state: 'Delhi',
    act: 'Delhi Nursing Homes Registration Act, 1953',
    highlights: [
      'Registration with the registering authority appointed by the Delhi government.',
      'Specified minimum standards for nursing homes and clinics.',
      'Annual renewal of registration with updated compliance documentation.',
      'Inspections by authorized officers.',
      'Penalties for operating without registration: fine and/or imprisonment.',
    ],
  },
  {
    state: 'West Bengal',
    act: 'West Bengal Clinical Establishments (Registration and Regulation) Act, 2017 (state-specific version)',
    highlights: [
      'Registration with the district registering authority.',
      'Minimum standards aligned with the central Clinical Establishments Act but with state-specific amendments.',
      'Periodic inspections and compliance reporting.',
      'Display of registration, rate card, and patient rights charter.',
    ],
  },
];

const biomedicalWasteRules = [
  {
    icon: Trash2,
    title: 'The Rules Apply to ALL Clinics — No Exceptions Based on Size.',
    description:
      'The Biomedical Waste Management Rules, 2016 (amended 2018, 2019) apply to every healthcare facility that generates biomedical waste — regardless of size. A single-doctor clinic that generates used syringes, cotton swabs, or soiled dressings is covered. There is no small-clinic exemption. The rules mandate: (1) segregation of biomedical waste at the point of generation into colour-coded bins (yellow, red, white/blue, black), (2) pre-treatment of waste before disposal (e.g., chemical disinfection for sharps), (3) collection and transportation by authorized biomedical waste handlers or through a common biomedical waste treatment facility (CBWTF), (4) maintenance of waste generation and disposal records, and (5) annual reporting to the State Pollution Control Board.',
  },
  {
    icon: BadgeCheck,
    title: 'Colour-Coded Segregation — The Daily Discipline',
    description:
      'Yellow bin: Human anatomical waste, soiled dressings, bandages, plaster casts, expired medicines, cytotoxic drugs. Treatment: incineration or deep burial. Red bin: Recyclable contaminated waste — IV tubes, catheters, syringes without needles, urine bags, gloves. Treatment: autoclaving, shredding, recycling. White/blue bin: Sharps — needles, scalpels, broken glass, lancets. Treatment: chemical disinfection followed by destruction in a needle destroyer or sharps pit. Black bin: General waste from the clinic not contaminated with biomedical material — paper, food wrappers, office waste. Disposal: municipal waste collection. Each bin must be labelled with the biohazard symbol and the type of waste. Staff must be trained on segregation. The person handling waste must wear gloves and be vaccinated against Hepatitis B and Tetanus.',
  },
  {
    icon: FileText,
    title: 'Waste Management Records and Reporting',
    description:
      'Every clinic must maintain: (1) A daily biomedical waste generation register — categorizing waste by colour code and recording the weight or number of bags. (2) A waste collection log — recording the date and quantity of waste handed over to the authorized CBWTF or waste collector. (3) A training register — documenting staff training on biomedical waste management (mandatory annual training). (4) An accident register — recording needle-stick injuries, spills, or exposure incidents. (5) Annual report submitted to the State Pollution Control Board by 30 June of the following year, using Form II under the Biomedical Waste Management Rules. Non-compliance penalties: Rs. 10,000-1,00,000 fine per violation, potential imprisonment, and suspension of clinic registration.',
  },
  {
    icon: Zap,
    title: 'Practical Implementation for Small Clinics',
    description:
      'For a single-doctor clinic generating small quantities of biomedical waste: (1) Set up 4 colour-coded bins in a designated area — not in the patient waiting area, not in the corridor. (2) Contract with a CBWTF for waste collection — costs Rs. 500-2,000/month depending on waste quantity and location. (3) Train your receptionist and any nursing staff on segregation. Create a one-page laminated chart next to the bins showing what goes where. (4) Maintain a simple daily register: date, yellow bin (kg or bags), red bin, white bin, black bin, signature of person making the entry. (5) Keep the CBWTF agreement, training records, and accident register in a designated compliance file — the first thing the inspector will ask for.',
  },
];

const scheduleHDrugRecords = [
  {
    icon: Pill,
    title: 'Schedule H and H1 — What They Are',
    description:
      'Schedule H and H1 are categories of drugs under the Drugs and Cosmetics Rules, 1945, that can only be dispensed on the prescription of a registered medical practitioner. Schedule H includes most prescription drugs — antibiotics, antihypertensives, antidiabetics, antidepressants, etc. Schedule H1 is a stricter subset (introduced in 2013) that includes certain antibiotics (third-generation cephalosporins, carbapenems), anti-TB drugs, and psychotropic substances — drugs where misuse or overuse has public health consequences. Schedule H1 drugs require: (1) a separate register with specific columns (patient name, date, doctor details, drug name, quantity, batch number), (2) retention of the register for 3 years, and (3) the register must be open for inspection by drug control authorities.',
  },
  {
    icon: FileText,
    title: 'Record-Keeping Requirements for Schedule H Drugs',
    description:
      'If your clinic dispenses Schedule H drugs directly (not just prescribing but actually giving medicines to patients): (1) Maintain a prescription register recording every prescription written, including patient name, date, diagnosis, drug name, dosage, duration, and your signature. (2) For Schedule H1 drugs: maintain a separate, bound and paginated register (not loose-leaf) with columns: serial number, date, patient name and address, prescription reference, drug name, batch number, quantity dispensed, prescriber signature. (3) Prescriptions for Schedule H and H1 drugs must be in duplicate — one copy for the patient, one retained in your records. (4) Records must be preserved for at least 3 years from the date of the last entry for Schedule H1 drugs.',
  },
  {
    icon: AlertTriangle,
    title: 'What Happens During a Drug Control Inspection',
    description:
      'Drug control officers (DCOs) from the State Drug Control Administration conduct periodic inspections of clinics that dispense medicines. During an inspection, the DCO will: (1) Check that all drugs are within expiry date. (2) Verify that Schedule H1 drugs have a separate register and that entries are complete. (3) Check that drugs are stored at the temperature specified on the label (this is where most clinics fail — medicines requiring refrigeration must be in a temperature-monitored refrigerator). (4) Verify that the doctor\'s medical council registration is current. (5) Check that samples for testing are available if requested. (6) Review prescription records for compliance with the Drugs and Cosmetics Rules. Failure points: expired drugs on shelves, missing Schedule H1 register, drugs stored in bathrooms or kitchens (common in small clinics), and incomplete prescription records.',
  },
];

const digitalRecordKeeping = [
  {
    icon: Database,
    title: 'Legal Validity of Digital Records in India',
    description:
      'The Information Technology Act, 2000 (Section 2(1)(t) and Section 4) grants legal recognition to electronic records. A digital prescription, digital consultation note, or digital lab report has the same legal standing as a paper record — provided it is accessible, retrievable, and protected from unauthorized alteration. For medico-legal purposes, digital records with audit trails, timestamps, and digital signatures are arguably stronger than paper records, because paper records can be created or altered retroactively, while properly implemented digital records have immutable audit logs showing who created, modified, or accessed each record and when.',
  },
  {
    icon: Shield,
    title: 'Data Protection and Privacy Requirements',
    description:
      'The Digital Personal Data Protection Act, 2023 (DPDP Act) applies to all digital patient data collected by clinics. Key obligations: (1) Patient data must be collected for a specific, lawful purpose (clinical care is a valid purpose). (2) Patients must be informed of what data is collected and how it is used (a privacy notice at registration suffices). (3) Reasonable security safeguards must be in place — encrypted storage, access controls, breach notification procedures. (4) Patients have the right to access, correct, and request deletion of their data (subject to legal retention requirements). (5) Data breaches must be reported to the Data Protection Board and to affected patients. For clinics using cloud-based software, the software provider typically implements technical safeguards (encryption, access controls, audit logs). The clinic\'s responsibility is to use software that is DPDP-compliant and to train staff on data handling.',
  },
  {
    icon: Clock,
    title: 'Record Retention Periods — How Long to Keep What',
    description:
      'Different regulations specify different retention periods. Consolidated guidance for clinics: (1) Outpatient consultation records, prescriptions, and lab reports: minimum 3 years from the date of the last entry (Clinical Establishments Act and MCI/NMC Code of Ethics). (2) Inpatient records, surgical records, and anaesthesia records: minimum 5-7 years (varies by state nursing home act; maintain for 7 years to be safe). (3) Schedule H1 drug registers: minimum 3 years (Drugs and Cosmetics Rules). (4) Biomedical waste records: minimum 5 years (Biomedical Waste Management Rules). (5) Medico-legal case records and death certificates: permanent retention recommended. (6) Financial records, bills, and tax records: minimum 6-8 years (Income Tax Act). Digital records make compliance with these varied retention periods trivial — the software maintains them automatically. Paper records require physical storage space and systematic archiving.',
  },
  {
    icon: Search,
    title: 'Data Access by Government Authorities',
    description:
      'Government authorities can request access to patient records under specific legal provisions: (1) Under the Clinical Establishments Act, the inspecting authority can examine records to verify compliance with minimum standards. (2) Under the Epidemic Diseases Act and state public health acts, health authorities can access aggregated, de-identified data for disease surveillance and outbreak investigation. (3) Under a court order or warrant, law enforcement agencies can access specific records relevant to a criminal investigation. (4) Under the DPDP Act, government access is permitted for specific purposes defined in the Act. In all cases, the request must be documented, specific (not a blanket "give us all your records"), and compliant with the applicable legal provision. Your clinic software should log every access, including government access, creating an audit trail that protects both your patients and your clinic.',
  },
];

const inspectionChecklist = [
  {
    category: 'Registration & Display',
    icon: BadgeCheck,
    items: [
      'Valid clinic registration certificate displayed prominently in the reception area.',
      'Registration renewal date is clearly tracked (no expired registrations).',
      'Doctor medical council registration number displayed (for all doctors practicing at the clinic).',
      'Rate card / schedule of charges displayed in a visible location.',
      'Clinic hours of operation displayed at the entrance.',
    ],
  },
  {
    category: 'Infrastructure & Safety',
    icon: Building2,
    items: [
      'Minimum room sizes as per state/city municipal requirements.',
      'Adequate ventilation and lighting in examination room and waiting area.',
      'Separate examination room with privacy (curtain or door, not just a screen).',
      'Functional fire extinguisher, inspected annually, with current inspection tag.',
      'Emergency exit clearly marked and unobstructed.',
      'Accessible, clean toilet facility for patients.',
      'Ramps or accessibility provisions as per local building accessibility codes.',
    ],
  },
  {
    category: 'Medical Equipment & Supplies',
    icon: Shield,
    items: [
      'Functional BP apparatus, stethoscope, thermometer, weighing scale, glucometer.',
      'Emergency tray or bag with basic resuscitation equipment.',
      'Oxygen cylinder (if procedures are performed) — checked, not expired, stored safely.',
      'Sterilization equipment: autoclave or chemical sterilant, with sterilization log maintained.',
      'First-aid kit fully stocked.',
      'All equipment has maintenance/service logs.',
    ],
  },
  {
    category: 'Biomedical Waste Management',
    icon: Trash2,
    items: [
      'Four colour-coded bins (yellow, red, white/blue, black) with biohazard labels.',
      'Bins are located in a designated area, not in the patient corridor.',
      'Valid agreement with a Common Biomedical Waste Treatment Facility (CBWTF).',
      'Daily waste generation register maintained with colour-code categorization.',
      'Staff training records for biomedical waste management (annual training).',
      'Needle-stick injury and accident register maintained.',
      'Annual report (Form II) submitted to the State Pollution Control Board.',
    ],
  },
  {
    category: 'Drug Storage & Records (if dispensing)',
    icon: Pill,
    items: [
      'All drugs stored within expiry dates (this is the most common failure point — inspect monthly).',
      'Temperature-sensitive drugs stored at labelled temperature (refrigerated if required, with temperature log).',
      'Separate, bound register for Schedule H1 drugs with all required columns.',
      'Prescription records maintained and retrievable by patient name and date.',
      'No sample medicines stored without proper labelling and expiry tracking.',
      'Drug purchase records maintained with supplier details and batch numbers.',
    ],
  },
  {
    category: 'Patient Records & Data Protection',
    icon: FileText,
    items: [
      'Patient records maintained for each patient, indexed and retrievable.',
      'Records include: patient demographics, chief complaint, examination findings, diagnosis, treatment plan, prescription.',
      'Informed consent forms for procedures (separate, signed, stored with the record).',
      'Digital records (if used) are stored on DPDP-compliant software with encryption and access controls.',
      'Privacy notice for patients explaining data collection, use, and their rights.',
      'Breach notification procedure documented (even if never used).',
      'Staff trained on patient data confidentiality and DPDP Act requirements.',
    ],
  },
  {
    category: 'Staff & Qualifications',
    icon: Users,
    items: [
      'All doctors have valid and current medical council registration.',
      'Nursing or paramedic staff have valid registration (if applicable).',
      'Staff employment records maintained.',
      'Staff vaccinated against Hepatitis B and Tetanus (documented).',
      'Staff training records: infection control, biomedical waste, fire safety, CPR.',
      'Staff dress code and identification badges.',
    ],
  },
];

const faqs = [
  {
    q: 'My clinic is in a state that has not adopted the Clinical Establishments Act. What applies to me?',
    a: 'If your state has not adopted the central Clinical Establishments Act, your clinic is governed by your state\'s specific nursing home or clinical establishments act. Examples: Maharashtra (Maharashtra Nursing Homes Registration Act, 1949), Karnataka (KPME Act, 2007), Tamil Nadu (TN Private Clinical Establishments Act, 1997). You must also comply with centrally applicable laws that apply regardless of state: the Biomedical Waste Management Rules, 2016; Drugs and Cosmetics Rules, 1945 (if you dispense drugs); the MCI/NMC Code of Ethics; and the DPDP Act, 2023 (if you maintain digital records). Check with your local medical association or a healthcare compliance lawyer to confirm which specific acts apply to your clinic in your city and state.',
  },
  {
    q: 'Do I really need a biomedical waste disposal contract if I only generate a small bag of waste per day?',
    a: 'Yes. The Biomedical Waste Management Rules, 2016 have no exemption based on the quantity of waste generated. If you generate any biomedical waste — even one used syringe per day — you are legally required to segregate, treat, and dispose of it through an authorized channel (CBWTF). For a small clinic generating minimal waste, the CBWTF will typically charge Rs. 500-1,500/month. This is not optional. During an inspection, the absence of a CBWTF agreement is one of the most common and easily identified non-compliance points. The fine for non-compliance can be Rs. 10,000-1,00,000 — far more than the annual CBWTF cost.',
  },
  {
    q: 'If I use digital records (like Doxxy), do I still need paper records?',
    a: 'No. The Information Technology Act, 2000 grants legal recognition to electronic records. Digital records — provided they are properly maintained with audit trails, access controls, and backup — satisfy the record-keeping requirements of the Clinical Establishments Act, state nursing home acts, and MCI/NMC Code of Ethics. You do not need to maintain parallel paper records. However, there are two important caveats: (1) Consent forms for procedures are typically still signed physically — you can scan and attach them to the digital record. (2) If an inspector demands to see records and your system is down, you must be able to demonstrate that the outage is temporary and that you can provide access when the system is back up. Keep a printed summary sheet for each patient as a fallback during the transition period, but this is not a permanent requirement.',
  },
  {
    q: 'How often do clinics actually get inspected?',
    a: 'Frequency varies by state, city, and inspection type. Clinical Establishments Act inspections: typically at the time of registration/renewal (annual or once every 2-3 years) and triggered by patient complaints. Drug control inspections: can be annual or triggered — clinics that dispense medicines should expect one every 1-2 years. Biomedical waste inspections: annual reporting is mandatory, site inspections vary (annual in major cities, less frequent in smaller towns, but increasing). Municipal health department inspections: as required by local municipal laws. The practical advice: maintain continuous compliance. Do not prepare for an inspection you know about — prepare for one that happens at 11 AM on a Tuesday without notice. The difference between a smooth inspection and a stressful one is having the compliance file organized and accessible at all times.',
  },
  {
    q: 'What are the most common compliance failures in Indian clinics?',
    a: 'Based on inspection data and compliance surveys: (1) Expired drugs on shelves — the single most common finding, entirely avoidable with a monthly expiry check. (2) Missing or incomplete Schedule H1 register (for clinics dispensing medicines). (3) No biomedical waste CBWTF agreement or expired agreement. (4) Registration certificate not displayed or expired. (5) Doctor\'s medical council registration expired (many doctors forget to renew on time). (6) No fire extinguisher or expired fire extinguisher inspection tag. (7) Staff not vaccinated against Hepatitis B. (8) Rate card not displayed. Most of these are zero-cost fixes that take less than an hour to resolve — but when found during an inspection, they result in notices, fines, and unpleasant interactions with regulators.',
  },
  {
    q: 'How does digital clinic software help with regulatory compliance?',
    a: 'Modern clinic software automates or simplifies several compliance requirements: (1) Digital records with audit trails and timestamps satisfy record-keeping requirements and provide stronger medico-legal protection than paper. (2) Digital prescription records automatically create the duplicate records needed for Schedule H/H1 compliance. (3) Expiry tracking for drugs can be configured with automatic alerts. (4) Patient consent forms can be digitized and linked to records. (5) Compliance dashboards track registration renewal dates, drug expiry, staff vaccination status, and inspection readiness — so nothing falls through the cracks. (6) Automated reports can generate the data needed for annual biomedical waste reporting and other regulatory submissions. The software does not replace your legal obligations, but it eliminates the administrative burden of manual compliance tracking.',
  },
];

const internalLinks = [
  {
    title: 'ABDM Compliance for Clinics',
    description: 'Complete guide to ABDM compliance: ABHA IDs, HPR/HFR registration, FHIR standards, digital signatures, and compliance timeline.',
    href: '/abdm-compliance-clinic',
  },
  {
    title: 'ABHA ID Guide for Clinics',
    description: 'Everything about ABHA IDs: creation during registration, record linking, patient consent, and the ABHA vs ABDM distinction.',
    href: '/abha-id-clinic-guide',
  },
  {
    title: 'India Clinic Digitization Guide',
    description: 'Step-by-step roadmap to digitize your clinic. Software selection, data migration, and the 6-phase go-live plan.',
    href: '/india-clinic-digitization-guide',
  },
  {
    title: 'Clinic Data Security Guide',
    description: 'How to protect patient data, DPDP Act compliance, encryption, access controls, and breach prevention for Indian clinics.',
    href: '/clinic-data-security-guide',
  },
  {
    title: 'Digital Treatment Plans for Clinics',
    description: 'How digital prescriptions work, drug interaction checks, 13 Indian language support, and legal validity of e-prescriptions.',
    href: '/digital-treatment-plans',
  },
  {
    title: 'Electronic Medical Records for Indian Clinics',
    description: 'Why EMRs matter for compliance, how they compare to paper records, and the medico-legal advantages of digital.',
    href: '/electronic-medical-records',
  },
  {
    title: 'Best Clinic Management Software India',
    description: 'Compare Doxxy with other software. Feature comparison, honest pros and cons, and pricing breakdown.',
    href: '/best-clinic-management-software-india',
  },
  {
    title: 'Pricing',
    description: 'Transparent Doxxy pricing. Free for the first 100 consultations, then Rs. 10/consultation. No hidden fees.',
    href: '/pricing',
  },
];

// --- ARTICLE STRUCTURED DATA ---

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Clinic Regulatory Compliance in India — Licenses, Acts & Digital Records',
  description:
    'Complete guide to regulatory compliance for Indian clinics. Covers Clinical Establishments Act, state nursing home acts, biomedical waste rules, Schedule H/H1 drug records, digital record-keeping, and inspection readiness.',
  datePublished: '2026-06-02',
  dateModified: '2026-06-02',
  author: {
    '@type': 'Organization',
    name: 'Doxxy',
    url: APP_URL,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Doxxy',
    url: APP_URL,
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${APP_URL}/clinic-regulatory-compliance-india`,
  },
};

// --- FAQ STRUCTURED DATA ---

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.a,
    },
  })),
};

// --- PAGE SECTIONS ---

const HeroSection = () => (
  <Section className="text-center !py-28 md:!py-40">
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 mb-8">
      <Clock className="h-4 w-4" />
      Updated June 2026 · Comprehensive Guide · Free Resource
    </div>
    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
      Clinic Regulatory Compliance in India — Licenses, Acts & Digital Records
    </h1>
    <SectionSubtitle>
      Everything an Indian clinic owner or doctor needs to know about regulatory compliance.
      Clinical Establishments Act, state nursing home acts, biomedical waste rules, drug record
      keeping, digital record requirements, and a complete inspection readiness checklist.
    </SectionSubtitle>
    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Get Compliance Help <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
      <Button size="lg" variant="outline" asChild className="rounded-xl px-8 py-3 text-base font-semibold dark:text-gray-300 dark:border-gray-600">
        <Link href="#inspection-checklist">Jump to Inspection Checklist <ChevronRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  </Section>
);

const TLDRSection = () => (
  <Section className="!py-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-blue-100 dark:border-blue-900/30">
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-blue-600" />
        <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">In 30 Seconds</span>
      </div>
      <ul className="space-y-3">
        <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
          <span className="text-blue-500 font-bold mt-0.5">1.</span>
          <span><strong>Compliance is a layered system, not a single act.</strong> Your clinic must comply with: your state's clinical establishments or nursing home act, the central Biomedical Waste Management Rules (2016), the Drugs and Cosmetics Rules (if dispensing), the NMC Code of Ethics, and the DPDP Act (for digital records).</span>
        </li>
        <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
          <span className="text-blue-500 font-bold mt-0.5">2.</span>
          <span><strong>The most common compliance failures are entirely avoidable:</strong> expired drugs on shelves, missing Schedule H1 register, no biomedical waste contract, expired medical council registration, and no fire extinguisher. Most are zero-cost fixes.</span>
        </li>
        <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
          <span className="text-blue-500 font-bold mt-0.5">3.</span>
          <span><strong>Inspections happen. Be ready every day, not just before a scheduled inspection.</strong> A well-organized compliance file with registration certificates, waste management records, drug registers, staff training records, and inspection logs makes any inspection a 10-minute formality instead of a nightmare.</span>
        </li>
        <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
          <span className="text-blue-500 font-bold mt-0.5">4.</span>
          <span><strong>Digital records are legally valid and offer stronger medico-legal protection</strong> than paper records — provided they are maintained with audit trails, encryption, and access controls. You do not need to maintain parallel paper records if you use compliant digital software.</span>
        </li>
      </ul>
    </div>
  </Section>
);

const ClinicalEstablishmentsSection = () => (
  <Section>
    <SectionTitle>The Clinical Establishments Act, 2010 — The Central Framework.</SectionTitle>
    <SectionSubtitle className="mt-4">
      The central legislation governing healthcare facilities in India. Applicable in states
      that have adopted it, and a reference standard for states with their own acts. Here is
      what every clinic owner needs to understand.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-12 space-y-8">
      {clinicalEstablishmentsAct.map((item) => (
        <div key={item.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
              <item.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const StateActsSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>State Nursing Home Acts — The Patchwork You Must Navigate.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Major states that have NOT adopted the central Clinical Establishments Act have their
      own legislation. If your clinic is in one of these states, this is your governing law.
      Here are the acts for the most populous and commercially significant states.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-16 space-y-6">
      {stateNursingHomeActs.map((state) => (
        <div key={state.state} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
          <div className="p-6 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-900/50">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Landmark className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              {state.state}: {state.act}
            </h3>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {state.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>

    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-8 border border-yellow-200/50 dark:border-yellow-800/50 mt-8 max-w-4xl mx-auto">
      <div className="flex items-start gap-4">
        <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Important: Verify Your State's Specific Requirements.
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            This guide provides an overview of the major state acts as of June 2026. State acts
            are amended periodically, and rules under each act may change. Check with your local
            IMA (Indian Medical Association) branch, your state medical council website, or a
            healthcare compliance lawyer to confirm the current requirements for your specific
            city and state. The cost of professional compliance advice (Rs. 5,000-15,000) is
            negligible compared to the cost of non-compliance.
          </p>
        </div>
      </div>
    </div>
  </Section>
);

const BiomedicalWasteSection = () => (
  <Section>
    <SectionTitle>Biomedical Waste Management Rules — No Exceptions for Small Clinics.</SectionTitle>
    <SectionSubtitle className="mt-4">
      The rules apply to every clinic, regardless of size. If you generate any biomedical
      waste, you must segregate, treat, and dispose of it through authorized channels.
      Here is exactly what is required.
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 gap-8 mt-16">
      {biomedicalWasteRules.map((rule) => (
        <div key={rule.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <rule.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{rule.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{rule.description}</p>
        </div>
      ))}
    </div>
  </Section>
);

const DrugRecordsSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Schedule H & H1 Drug Records — If Your Clinic Dispenses Medicines.</SectionTitle>
    <SectionSubtitle className="mt-4">
      If your clinic directly dispenses medicines to patients (over-the-counter sale from your
      clinic dispensary), you have specific record-keeping obligations under the Drugs and
      Cosmetics Rules. Here is what is required and what an inspector will check.
    </SectionSubtitle>
    <div className="max-w-4xl mx-auto mt-16 space-y-8">
      {scheduleHDrugRecords.map((item) => (
        <div key={item.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
              <item.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8 mt-8 max-w-4xl mx-auto text-center">
      <Zap className="h-10 w-10 text-blue-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        If You Only Prescribe (Do Not Dispense): These Requirements Do NOT Apply.
      </h3>
      <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
        If your clinic only writes prescriptions that patients fill at external pharmacies,
        you are NOT required to maintain Schedule H or H1 drug registers. The record-keeping
        obligations for the drugs themselves fall on the pharmacy that dispenses them, not
        on the prescribing doctor. Your obligation is limited to maintaining prescription
        records as part of the patient's medical record.
      </p>
    </div>
  </Section>
);

const DigitalRecordsSection = () => (
  <Section>
    <SectionTitle>Digital Record-Keeping Requirements — Legal Validity and Compliance.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Digital records are legally valid in India and offer stronger medico-legal protection
      than paper records — provided you follow specific requirements around security, retention,
      and accessibility. Here is what the law requires.
    </SectionSubtitle>
    <div className="grid md:grid-cols-2 gap-8 mt-16">
      {digitalRecordKeeping.map((item) => (
        <div key={item.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-8">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-5">
            <item.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{item.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
        </div>
      ))}
    </div>
  </Section>
);

const InspectionChecklistSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50" id="inspection-checklist">
    <SectionTitle>Inspection Readiness Checklist — Be Ready Every Day.</SectionTitle>
    <SectionSubtitle className="mt-4">
      The best way to survive an inspection is to never need to "prepare" for one. This checklist
      covers every category an inspector will check. Print it. Keep it in your compliance file.
      Review it on the first Monday of every month.
    </SectionSubtitle>
    <div className="mt-16 space-y-8">
      {inspectionChecklist.map((category) => (
        <div key={category.category} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 overflow-hidden">
          <div className="p-6 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-900/50">
            <div className="flex items-center gap-3">
              <category.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{category.category}</h3>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {category.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>

    <div className="bg-blue-600 rounded-2xl p-8 text-white mt-12 max-w-3xl mx-auto text-center">
      <ClipboardList className="h-10 w-10 text-blue-200 mx-auto mb-4" />
      <h3 className="text-2xl font-bold mb-3">Inspection Day Protocol</h3>
      <p className="text-blue-100 leading-relaxed">
        When an inspector arrives: (1) Greet them professionally — they have a job to do. (2) Ask
        to see their identity card and inspection order. Document their details. (3) Let them
        inspect. Do not argue, do not hide things, do not offer unsolicited explanations. (4) Have
        your compliance file ready — registration certificates, waste management records, drug
        registers, staff training records, equipment maintenance logs, all in one organized binder
        or accessible digital repository. (5) Take notes during the inspection. Note down every
        observation they make. (6) If they find issues, ask for the exact regulation reference
        and the compliance deadline. (7) Fix the issues within the deadline and send a compliance
        report with photographic evidence. (8) If the inspection is triggered by a complaint, you
        have the right to see the complaint (redacted of complainant details).
      </p>
    </div>
  </Section>
);

const FAQSection = () => (
  <Section>
    <SectionTitle>Questions Clinic Owners Ask About Regulatory Compliance.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Practical, actionable answers to the most common compliance questions from Indian
      clinic owners and doctors. Based on real regulatory requirements, not marketing.
    </SectionSubtitle>
    <div className="max-w-3xl mx-auto mt-16 space-y-4">
      {faqs.map((faq) => (
        <div key={faq.q} className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-200/75 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            {faq.q}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.a}</p>
        </div>
      ))}
    </div>
  </Section>
);

const InternalLinkHubSection = () => (
  <Section className="bg-gray-50 dark:bg-gray-800/50">
    <SectionTitle>Go Deeper Into Compliance and Clinic Management.</SectionTitle>
    <SectionSubtitle className="mt-4">
      Regulatory compliance is part of a larger story about running a modern, patient-centred
      clinic. These guides cover the adjacent terrain — from ABDM to digital prescriptions.
    </SectionSubtitle>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
      {internalLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
            {link.title}
            <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{link.description}</p>
        </Link>
      ))}
    </div>

    <div className="mt-16 text-center">
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
        Compliance does not have to be a headache. Digital clinic software handles the record-keeping
        while you focus on patients. Chat with us on WhatsApp — we help even if you choose different software.
      </p>
      <Button size="lg" asChild className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105">
        <Link href="https://wa.me/+917388890554">Chat on WhatsApp for Compliance Help <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        Free compliance consultation · No obligation · We answer honestly even about non-Doxxy setups
      </p>
    </div>
  </Section>
);

// --- ARTICLE STRUCTURED DATA COMPONENT ---

const ArticleStructuredData = () => (
  <Script
    id="article-structured-data"
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
  />
);

// --- MAIN PAGE COMPONENT ---

export default function ClinicRegulatoryComplianceIndia() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <TLDRSection />
      <ClinicalEstablishmentsSection />
      <StateActsSection />
      <BiomedicalWasteSection />
      <DrugRecordsSection />
      <DigitalRecordsSection />
      <InspectionChecklistSection />
      <FAQSection />
      <InternalLinkHubSection />
      <SignupCTA
        heading="Stay Compliant. Stay Focused on Patients."
        description="Digital clinic software that handles record-keeping, drug registers, and compliance tracking. So you do not have to think about it. Chat on WhatsApp."
        buttonText="Get Compliant Clinic Software"
        assurance="Free setup · No obligations · Cancel anytime"
      />

      <ArticleStructuredData />

      <Script
        id="faq-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: APP_URL },
          { name: 'Clinic Regulatory Compliance in India', url: `${APP_URL}/clinic-regulatory-compliance-india` },
        ]}
      />
    </div>
  );
}
