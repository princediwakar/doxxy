// Path: config/specialties/general-physician.ts
import type { SpecialtyConfig } from './types';

const config: SpecialtyConfig = {
  slug: 'general-physician',
  specialtyName: 'General Physician',

  heroTitle: 'General Practice Management Built for Volume, Speed, and Continuity of Care',
  heroSubtitle: 'A platform engineered for the Indian GP who sees 60 patients before lunch — with rapid SOAP notes, one-tap prescriptions, chronic disease tracking, and referral coordination that keeps you in control of your patient\'s entire care journey.',

  problemTitle: 'Why Generic EMRs Fail the Indian General Physician',
  problemDescription:
    'The Indian general physician operates in a clinical environment that has no parallel in the West. A typical urban GP in India sees 50 to 70 patients in a four-hour OPD — roughly one patient every three to four minutes. In that compressed window, the physician must take a history, perform a focused examination, arrive at a differential diagnosis, write a prescription, counsel the patient, and decide whether follow-up or referral is needed. Generic EMRs add friction to every one of these steps. They demand 12 clicks to write a prescription for viral fever — something that takes 30 seconds on a paper pad. Their SOAP note templates are designed for the 15-minute American consultation, not the 3-minute Indian OPD. They treat every visit as an isolated event with no awareness that this diabetic patient was last seen four weeks ago with an HbA1c of 9.2 and needs a trend review, not a blank form.\n\nChronic disease management — which accounts for the majority of a GP\'s longitudinal workload — is where generic software collapses entirely. A patient with hypertension, diabetes, and hypothyroidism visits the same GP every month, yet the EMR shows three disconnected episodes with no unified dashboard showing HbA1c trends, blood pressure logs, lipid profiles, and thyroid function over time. The GP must mentally reconstruct the patient\'s trajectory from scattered lab reports and old prescriptions. Referral coordination is another black hole: the GP refers a patient to a cardiologist or endocrinologist and has no visibility into whether the consultation happened, what was advised, or whether the specialist\'s recommendations contradict the GP\'s ongoing management plan.\n\nPreventive health — the single most valuable tool a GP has to reduce long-term morbidity — is reduced to a generic "master health checkup" package with no risk stratification, no age-and-gender-appropriate tailoring, and no systematic follow-up on abnormal findings. The Indian GP needs software that accelerates the routine (so a fever prescription takes 30 seconds, not 3 minutes), illuminates the complex (so chronic disease patients are managed on trends, not single data points), and closes the referral loop (so the GP remains the quarterback of the patient\'s care).',

  statsSection: {
    title: 'The General Practice Reality in India',
    stats: [
      { value: '50-70', label: 'Patients seen daily by an average urban GP in India' },
      { value: '77M+', label: 'Indians living with diabetes; over 50% remain undiagnosed' },
      { value: '220M+', label: 'Indians with hypertension; only 12% achieve BP control' },
      { value: '3-4 min', label: 'Average consultation time per patient in Indian OPDs' },
    ],
  },

  solutionTitle: 'A GP Platform That Accelerates the Routine and Illuminates the Complex',
  solutionDescription:
    'Doxxy for General Physicians is built around a single, non-negotiable design principle: every common task must take less time than paper. SOAP notes use smart templates that pre-populate based on chief complaint — a fever consult opens with a focused fever history template, a diabetes follow-up opens with the patient\'s HbA1c trend, last BP reading, and current medications already on screen. One-tap prescription templates for the 10 most common presentations (viral fever, URTI, UTI, acute gastroenteritis, hypertension follow-up, diabetes follow-up, hypothyroidism, allergic rhinitis, tension headache, acute bronchitis) let you complete a prescription with medication selection, dosing, duration, and pharmacy-ready printout in under 60 seconds. Chronic disease patients have longitudinal dashboards showing trends for every relevant parameter — HbA1c, fasting and post-prandial glucose, systolic and diastolic BP, lipid profile, TSH, creatinine, BMI — all plotted against treatment milestones so you can see whether that antihypertensive you added three months ago is actually working.\n\nReferral management becomes a closed loop. When you refer a patient to a cardiologist, endocrinologist, or any specialist in your network, Doxxy generates a structured referral letter with relevant history, current medications, investigation results, and your specific clinical question. The specialist\'s consultation note and recommendations flow back into the patient chart. You get notified. No more patients returning with a crumpled prescription from a specialist you never knew they visited. Preventive health packages are fully configurable by age, gender, and risk profile — with automatic flagging of abnormal results, patient-friendly report summaries, and systematic recall for overdue checkups. Doxxy transforms the GP from a transactional prescriber into a longitudinal care coordinator without adding a single minute to the average consultation.',

  keyFeatures: [
    {
      icon: 'fileText',
      title: 'Rapid SOAP Notes — Under 60 Seconds',
      description: 'Chief-complaint-specific templates that pre-populate the relevant history, examination fields, and differential checklist. A fever template opens with fever duration, pattern, associated symptoms, and vitals fields. A diabetes follow-up opens with last HbA1c, current medications, and systems review checklist. Complete your note faster than handwriting it.',
    },
    {
      icon: 'pill',
      title: 'One-Tap Prescription Templates',
      description: 'Pre-configured prescription templates for the 10 most frequent presentations: viral fever, URTI, UTI, acute gastroenteritis, hypertension, diabetes, hypothyroidism, allergic rhinitis, tension headache, and acute bronchitis. Select medications from your preferred formulary, adjust dose and duration, add pharmacy instructions — all under 60 seconds. Templates learn your prescribing patterns over time.',
    },
    {
      icon: 'barChart',
      title: 'Chronic Disease Dashboard',
      description: 'Unified longitudinal view for each chronic disease patient. HbA1c trend over 12 months, BP log with systolic/diastolic chart, lipid panel history, TSH and creatinine trends, BMI tracker — all on one screen. Overlay medication changes as annotations on the trend line so you can correlate treatment adjustments with clinical response.',
    },
    {
      icon: 'messageSquare',
      title: 'Closed-Loop Referral Coordination',
      description: 'Generate a structured referral letter in 30 seconds with chief complaint, relevant history, current medications, key investigation results, and your specific clinical question. Track referral status: sent, scheduled, completed. Specialist notes and recommendations flow back into the patient chart. Stay the quarterback of your patient\'s care.',
    },
    {
      icon: 'shield',
      title: 'Preventive Health Package Manager',
      description: 'Design age-and-gender-appropriate health checkup packages with risk stratification (basic, comprehensive, cardiac-focused, diabetic, senior citizen). Auto-flag abnormal values against reference ranges. Generate patient-friendly summary reports with trend arrows. Systematic recall for overdue annual checkups with automated SMS reminders.',
    },
    {
      icon: 'flaskConical',
      title: 'Lab Result Tracker with Abnormal Alerts',
      description: 'All investigations — in-house or external lab — populate directly into the patient chart and the chronic disease dashboard. Abnormal values are flagged with visual alerts and severity indicators. View trends over time for any parameter. Compare current results against previous values to catch deterioration before it becomes a crisis.',
    },
    {
      icon: 'heart',
      title: 'Cardiovascular Risk Calculator & Monitoring',
      description: 'Integrated ASCVD and WHO/ISH risk calculators that pull patient data (age, BP, cholesterol, diabetes status, smoking) directly from the chart. Auto-calculate 10-year CVD risk at each visit. Track risk score trends. Flag patients crossing from moderate to high risk for intensified intervention.',
    },
    {
      icon: 'clock',
      title: 'Smart Patient Queue & Triage',
      description: 'Digital queue with patient type indicators (walk-in, follow-up, emergency, procedure). Priority flags for elderly, diabetic patients needing fasting labs, and acute presentations. Estimated wait times displayed in the waiting area. Quick-look dashboard showing today\'s case mix, pending lab reviews, and unsigned prescriptions.',
    },
  ],

  workflowSteps: [
    {
      step: 1,
      title: 'Patient Check-In & Record Retrieval',
      description: 'Reception marks the patient as arrived. For returning patients, the system surfaces their chronic disease dashboard, last visit summary, pending investigation results, and upcoming preventive health requirements before the patient even enters the consultation room.',
    },
    {
      step: 2,
      title: 'Focused Consultation & SOAP Note',
      description: 'GP selects the chief complaint. The smart template pre-loads relevant history fields, examination checklists, and the patient\'s relevant trends. SOAP note is completed in under 60 seconds with minimal typing — dropdown selections, checkboxes, and voice-to-text for free-text fields.',
    },
    {
      step: 3,
      title: 'Prescription & Investigation Ordering',
      description: 'One-tap template generates a complete prescription with medication, dosing, duration, and pharmacy instructions. Investigations are ordered with a single click from a favorites list. Digital prescription is printed or sent to the patient\'s phone. Pharmacy and lab orders are queued.',
    },
    {
      step: 4,
      title: 'Referral or Follow-Up Planning',
      description: 'If referral is needed, the structured referral letter is generated in 30 seconds. Follow-up appointments are scheduled before the patient leaves the consultation room. Chronic disease patients get auto-scheduled recall based on their condition protocol.',
    },
    {
      step: 5,
      title: 'Lab Review & Chronic Disease Update',
      description: 'As investigation results arrive (in real-time for in-house labs, or batch-uploaded for external), abnormal values are flagged on the GP\'s dashboard. Results auto-populate into the relevant chronic disease trend charts. The GP reviews flagged results between consultations or during dedicated lab-review slots.',
    },
    {
      step: 6,
      title: 'End-of-Day Review & Practice Analytics',
      description: 'Dashboard summarizes the day: patients seen, case mix, prescriptions issued, referrals sent, pending lab reviews. Chronic disease panel shows patients overdue for follow-up or with deteriorating trends. Preventive health reminders flag patients due for annual checkups. Practice patterns emerge from the analytics — most common diagnoses, prescribing trends, referral patterns, and revenue breakdown.',
    },
  ],

  beforeAfterComparisons: [
    {
      area: 'Consultation Speed',
      before: 'Writing SOAP notes from scratch for every patient. Re-typing the same fever history questions 30 times a day. Prescription written by hand — legibility issues, no automated drug interaction check, no pharmacy-ready format.',
      after: 'Smart templates pre-load relevant fields based on chief complaint. One-tap prescriptions with your preferred medication list. Complete a fever consult with full SOAP note and printed prescription in under 90 seconds — faster than pen and paper.',
    },
    {
      area: 'Chronic Disease Management',
      before: 'Diabetic patient visits every month. GP flips through a thick file looking for last month\'s HbA1c, last quarter\'s lipid profile, last year\'s creatinine. Mentally reconstructs trends. Misses a creeping upward drift in fasting glucose because the data is scattered across six pages.',
      after: 'Patient\'s chronic disease dashboard opens before they sit down. HbA1c trend over 12 months, BP log, lipid panel, creatinine, and BMI are plotted on one screen. Medication changes are annotated on the timeline. Deterioration is visible before the patient becomes symptomatic.',
    },
    {
      area: 'Prescription Management',
      before: 'Handwriting 50 prescriptions a day with medication names, doses, duration, and instructions. Common errors: wrong dosage, missed drug interactions (prescribing a fluoroquinolone to a patient already on a sulfonylurea), illegible handwriting leading to pharmacy errors.',
      after: 'One-tap templates with your vetted medication list. Built-in drug interaction checker flags contraindications (e.g., statin + macrolide, metformin + contrast dye). Dosing is auto-calculated based on weight and renal function where relevant. Printed prescription is pharmacy-ready.',
    },
    {
      area: 'Referral Coordination',
      before: 'GP writes "Refer to Cardiologist" on a prescription pad. Patient may or may not go. If they go, the cardiologist\'s advice comes back on a piece of paper — if the patient remembers to bring it. No structured handoff, no feedback loop, fragmented care.',
      after: 'Structured referral letter generated in 30 seconds with clinical summary, current medications, key findings, and specific clinical question. Referral tracked through to completion. Specialist\'s note and recommendations flow back into the patient chart. GP stays in control of the care plan.',
    },
    {
      area: 'Lab Result Management',
      before: 'Lab reports arrive as paper printouts or PDFs on WhatsApp. Staff file them in physical folders. Abnormal results may not be flagged. GP discovers a rising creatinine three months late because nobody correlated this report with the last one.',
      after: 'Lab results auto-populate into the patient chart with abnormal values flagged by severity. Trend view shows any parameter over time. The chronic disease dashboard updates automatically. The GP reviews flagged results from a single dashboard between consultations.',
    },
    {
      area: 'Preventive Health',
      before: 'A generic "Master Health Checkup" offered to anyone who asks. No risk stratification, no tailoring by age and gender. Abnormal results delivered as a PDF with no explanation. No systematic recall for annual checkups — patients only return when they feel unwell.',
      after: 'Age-and-gender-appropriate packages with risk-based customization. Patient-friendly summary with trend arrows and plain-language explanations of abnormal findings. Automated SMS recall for overdue annual checkups. Preventive health becomes a practice revenue stream, not an afterthought.',
    },
    {
      area: 'Patient Recall & Follow-Up',
      before: 'Patients told "come back in 2 weeks" and given a date on a piece of paper. No system to track who returned and who did not. Chronic disease patients lost to follow-up for months. Diabetic patient with HbA1c 10.2 is not seen for 8 months because there was no recall mechanism.',
      after: 'Follow-up appointments scheduled before the patient leaves. Automated SMS reminders 48 hours and 24 hours before. Missed appointments flagged for staff callback. Chronic disease patients with abnormal parameters are prioritized for proactive recall. No patient falls through the cracks.',
    },
    {
      area: 'Practice Intelligence',
      before: 'No data on case mix, prescribing patterns, referral frequency, or revenue per patient. Practice growth decisions based on intuition. Cannot identify which patient segments are growing, which are under-managed, or where revenue is leaking.',
      after: 'Real-time analytics dashboard showing daily and monthly case mix, most common diagnoses, prescribing trends, lab test ordering patterns, referral conversion rates, and revenue distribution. Identify your practice\'s clinical strengths and growth opportunities with data, not guesswork.',
    },
  ],

  testimonial: {
    quote:
      'I was skeptical that any software could keep up with my OPD pace — I see 60 to 70 patients in four hours. Doxxy proved me wrong. The SOAP templates and one-tap prescriptions actually save me time compared to handwriting. But the real transformation has been in chronic disease management. My diabetic and hypertensive patients now have trend dashboards that show me in one glance whether my treatment adjustments are working. I caught three patients with deteriorating renal function last month that I would have missed with my old paper files. This is the first software that feels like it was designed by someone who has actually worked in an Indian clinic.',
    name: 'Dr. Meera Sundaram',
    clinic: 'Sundaram Family Clinic & Diabetes Care',
    city: 'Madurai, Tamil Nadu',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop',
  },

  faqs: [
    {
      question: 'How fast are the SOAP note templates — can they really keep up with a 3-minute consultation?',
      answer: 'The templates are designed with an Indian OPD pace in mind. A chief-complaint-specific template pre-loads the most relevant history questions, examination fields, and differential checklist. For a fever consult, you tap "Fever" and the template opens with fever duration, pattern (continuous/remittent/intermittent), associated symptoms (cough, sore throat, myalgia, nausea), and vitals fields ready. Most entries are single-tap selections or checkboxes; free text is supported via voice-to-text. A complete SOAP note for a routine febrile illness takes 45-60 seconds once you are familiar with the template — consistently faster than handwriting.',
    },
    {
      question: 'Can I customize the prescription templates with my own medication preferences?',
      answer: 'Yes, and this is where Doxxy adapts to your practice. Each prescription template starts with sensible defaults (e.g., paracetamol 650mg TDS for fever, amoxicillin-clavulanate 625mg BD for URTI) but you can modify every medication, dose, frequency, and duration. The system learns your prescribing patterns — if you consistently prefer cefpodoxime over amoxicillin-clavulanate for URTI, your template adapts. You can also maintain your own formulary of preferred medications organized by therapeutic category.',
    },
    {
      question: 'How does the chronic disease dashboard work for patients with multiple conditions?',
      answer: 'A patient with diabetes, hypertension, and hypothyroidism gets a unified dashboard that displays all relevant parameters in a single view: HbA1c trend, fasting and post-prandial glucose, blood pressure log (systolic/diastolic chart), lipid profile, TSH, creatinine, eGFR, and BMI. Each parameter has its own trend line with treatment milestones annotated — so you can see that HbA1c dropped from 9.2 to 7.8 after you added empagliflozin three months ago, while BP has been stable on the current regimen. Medication reconciliation runs across all conditions to flag potential polypharmacy issues.',
    },
    {
      question: 'Does Doxxy support drug interaction checking for Indian medication combinations?',
      answer: 'Yes. The drug interaction database is curated for the Indian formulary — it covers the combinations commonly prescribed in Indian practice, including fixed-dose combinations, Ayurvedic concomitant use, and OTC medications popular in India. When you prescribe, the system checks against the patient\'s current medication list and flags clinically significant interactions (e.g., statin + macrolide, metformin + contrast dye, ACE inhibitor + potassium-sparing diuretic, warfarin + NSAID). Severity is graded so you can make an informed clinical decision rather than being overwhelmed by trivial interactions.',
    },
    {
      question: 'How does referral management work if the specialist does not use Doxxy?',
      answer: 'The structured referral letter is generated as a PDF that can be printed, emailed, or sent via WhatsApp to the specialist. It includes a unique referral ID and a secure web link where the specialist can submit their consultation note and recommendations — no Doxxy account required. When the specialist submits their note through the link, it flows back into your patient\'s chart automatically. If the specialist prefers to respond by email or WhatsApp, your staff can upload their note to the referral record. Either way, the referral is tracked and the loop is closed.',
    },
    {
      question: 'Can I create my own preventive health packages?',
      answer: 'Absolutely. Doxxy provides a package builder where you define the investigations included, the target demographic (age range, gender, risk profile), the recommended frequency (annual, biannual, once), and the pricing. You can create tiered packages — Basic, Comprehensive, Cardiac-Focused, Diabetic, Women\'s Health, Senior Citizen. Each package has its own reference-range-aware report template. When a patient\'s results arrive, abnormal values are auto-flagged and a patient-friendly summary is generated with plain-language explanations. The recall engine automatically notifies patients when their next checkup is due.',
    },
    {
      question: 'How does Doxxy handle patient data privacy and comply with Indian regulations?',
      answer: 'Doxxy is designed to comply with the Digital Personal Data Protection Act 2023 and adheres to data minimization principles. All patient data is encrypted at rest and in transit. Access controls allow you to define role-based permissions — reception staff see appointment and demographic data, nursing staff see vitals and lab results, physicians see the complete clinical record. Audit logs track every access and modification. Data is stored on Indian cloud infrastructure with regular encrypted backups. You retain full ownership of your patient data with the ability to export it in standard formats at any time.',
    },
    {
      question: 'What internet connectivity does Doxxy require? We face frequent outages in our area.',
      answer: 'Doxxy is a cloud-based platform and requires internet connectivity for full functionality — real-time syncing, lab integration, and SMS notifications depend on it. However, we have designed for the reality of Indian internet infrastructure. The platform implements optimistic UI updates with local queuing, so if connectivity drops mid-consultation, you can continue working and data will sync automatically when the connection is restored. For clinics with genuinely unreliable connectivity, we offer a 4G failover dongle configuration that automatically switches to cellular data when the primary connection drops. Offline-first modes for core consultation workflows (SOAP notes and prescriptions) are on our near-term roadmap.',
    },
  ],
};

export default config;
