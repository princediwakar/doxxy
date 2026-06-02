// Path: config/specialties/gynecology.ts

import type { SpecialtyConfig } from './types';

const config: SpecialtyConfig = {
  slug: 'gynecology',
  specialtyName: 'Gynecology',

  heroTitle: 'Gynecology Software Built for Every Stage of a Woman\'s Health Journey',
  heroSubtitle: 'From menarche to menopause, Doxxy gives your gynecology practice one unified system: ANC visit scheduler with auto-adjusting cadence, menstrual history tracker with cycle analytics, ultrasound report comparison, Pap smear recall with WhatsApp reminders, and menopause consultation templates — so every woman receives continuous, proactive care.',

  problemTitle: 'Why Generic Clinic Software Fails Gynecologists',
  problemDescription: `A gynecology practice spans the widest clinical spectrum in medicine — you manage a 13-year-old with irregular cycles, a 28-year-old in her first trimester, a 42-year-old with an abnormal Pap smear, and a 55-year-old navigating menopause, all in the same OPD session. Generic EMRs treat every encounter as discrete; they have no concept of a menstrual cycle, no understanding of gestational age, and no ability to look at a cervical cancer screening history and decide what's due next. You are left reconstructing a longitudinal narrative from fragmented, disconnected visit notes.

Antenatal care is the most protocol-driven workflow in outpatient medicine, yet most software gives you a blank text box. ANC requires a visit cadence that changes automatically as the due date approaches: monthly until 28 weeks, fortnightly until 36 weeks, then weekly until delivery. Each visit has specific investigations, specific risk assessments, and specific counselling points. Missing one visit — or forgetting to escalate a high-risk flag — can have catastrophic consequences. India records approximately 30 million pregnancies annually, and despite ANC coverage improving, only 58% of women receive the WHO-recommended 8+ ANC visits. A system that proactively schedules, reminds, and tracks compliance could close that gap meaningfully.

Menstrual history is the vital sign of gynecology. A woman presenting with infertility needs her cycle data correlated with ovulation markers. A perimenopausal woman needs her bleeding pattern tracked over months to distinguish normal transition from endometrial pathology. Generic software has no structured menstrual history module — you end up writing "LMP: 3 weeks ago, cycles regular" in a free-text field, losing the richness of data that could reveal patterns over time.

Cervical cancer screening recall is a public health imperative and a medicolegal minefield. India accounts for nearly one-quarter of global cervical cancer deaths. A Pap smear or HPV test is not a one-time event — it requires follow-up at precise intervals that differ by result (normal: 3 years, ASCUS: 1 year, LSIL: 6-12 months, HSIL: colposcopy now). Without automated recall, women are lost to follow-up, and your clinic carries the liability. Finally, menopause management involves multi-system symptom tracking (vasomotor, urogenital, musculoskeletal, mood) that no generic template captures. You deserve software that understands the arc of a woman's health — not software that treats every visit like a blank slate.`,

  statsSection: {
    title: 'Women\'s Healthcare in India — By the Numbers',
    stats: [
      { value: '30M+', label: 'Annual pregnancies in India requiring structured ANC tracking' },
      { value: '58%', label: 'Women receiving the WHO-recommended 8+ ANC visits' },
      { value: '~25%', label: "India's share of global cervical cancer deaths — largely preventable with screening recall" },
      { value: '60%+', label: 'Women overdue for cervical cancer screening due to lack of recall systems' },
      { value: '~65M', label: 'Indian women currently in the perimenopausal-to-postmenopausal age bracket' },
      { value: '4x', label: 'Faster ANC visit documentation with protocol-driven templates vs free-text notes' },
    ],
  },

  solutionTitle: 'One System for the Full Spectrum of Women\'s Health',
  solutionDescription: 'Doxxy for Gynecology unifies pregnancy tracking, menstrual history, screening recall, and menopause management into a single, longitudinal record. From a teenager\'s first consultation to a grandmother\'s post-menopausal follow-up, every visit adds to a continuous narrative — with automated protocols, smart scheduling, and WhatsApp-first patient engagement.',

  keyFeatures: [
    {
      icon: 'calendar',
      title: 'ANC Visit Scheduler — Auto-Adjusting Cadence',
      description: 'Enter the LMP or EDD once, and Doxxy generates the full ANC visit schedule — monthly until 28 weeks, fortnightly until 36 weeks, then weekly until delivery. As each visit is completed, the next date auto-adjusts. Missed visits are flagged, and patients receive WhatsApp reminders. Built-in visit templates pre-populate the recommended investigations, counselling topics, and risk assessments for each gestational age.',
    },
    {
      icon: 'clipboard',
      title: 'Menstrual History Tracker with Cycle Analytics',
      description: 'Structured menstrual history capture: age at menarche, cycle length and variability, duration and quantity of flow, dysmenorrhea severity, intermenstrual bleeding, and dyspareunia — all recorded as structured data, not free text. The system computes cycle regularity scores, identifies trends (e.g., progressively shortening cycles suggesting perimenopause), and correlates symptoms across visits to reveal patterns that free-text notes would obscure.',
    },
    {
      icon: 'scan',
      title: 'Ultrasound Report Manager — Upload, Compare, Trend',
      description: 'Upload ultrasound reports and images directly to the patient record. The system parses key measurements (CRL, BPD, FL, AC, EFW for pregnancy; endometrial thickness, ovarian volume, fibroid dimensions for gynaecological scans) and displays them in a comparison view. Serial growth scans for a pregnancy are trended on a single timeline. Side-by-side comparison of this month\'s fibroid dimensions against last year\'s scan — instantly.',
    },
    {
      icon: 'microscope',
      title: 'Pap Smear & HPV Screening Recall System',
      description: 'Log Pap smear and HPV co-testing results with structured fields for specimen adequacy, cytology findings (Bethesda system), and HPV genotype. Doxxy automatically calculates the next screening due date based on the result: normal (3 years), ASCUS (1 year with HPV triage logic), LSIL (6-12 months), ASC-H/HSIL (colposcopy referral now). Patients receive automated WhatsApp recall reminders. A dashboard shows all overdue patients — no one slips through.',
    },
    {
      icon: 'thermometer',
      title: 'Menopause Consultation Templates',
      description: 'Structured templates for the menopause consult covering all domains: vasomotor symptoms (hot flushes, night sweats — frequency and severity), urogenital syndrome (dryness, dyspareunia, urinary frequency), mood and cognitive changes (irritability, brain fog, sleep disturbance), musculoskeletal complaints (joint pain, sarcopenia risk), and sexual health. HRT risk-benefit assessment calculator built in, with cardiovascular, thromboembolic, and breast cancer risk stratification.',
    },
    {
      icon: 'heart',
      title: 'Family Planning & Procedure Records',
      description: 'Dedicated modules for contraception counselling (IUCD insertion/removal logs with thread-check reminders, implant insertion/expiry tracking, injectable DMPA schedule), sterilisation procedure records with consent documentation, MTP case records compliant with the MTP Act, and infertility workup tracking (semen analysis, tubal patency, ovulation studies, hormonal assays — all correlated on a timeline). Every procedure generates a structured, medicolegally sound record.',
    },
    {
      icon: 'activity',
      title: 'High-Risk Pregnancy Flagging & Alerts',
      description: 'Doxxy continuously evaluates each pregnancy against high-risk criteria — maternal age <18 or >35, previous LSCS, multiple gestation, pre-eclampsia, GDM, Rh incompatibility, anaemia (Hb < 10 g/dL), thyroid disorders, and 15+ other parameters. High-risk flags appear in bold red on the dashboard and trigger more frequent visit recommendations. The system tracks whether recommended specialist referrals (endocrinology, cardiology, fetal medicine) have been completed.',
    },
    {
      icon: 'messageSquare',
      title: 'WhatsApp Patient Engagement — ANC to Menopause',
      description: 'Automated WhatsApp messaging for the full care spectrum: ANC visit reminders (3 days before), iron/folic acid/calcium adherence nudges, post-partum follow-up scheduling, Pap smear recall alerts, IUCD thread-check reminders, and HRT review prompts. Patients can upload symptom diaries (bleeding calendars, hot flush logs, fetal movement counts) via WhatsApp that parse directly into structured fields in their record. Engagement without requiring app downloads.',
    },
  ],

  workflowSteps: [
    {
      step: 1,
      title: 'Morning Clinic Prep — The ANC, Screening, and Procedure Dashboard',
      description: 'Open Doxxy and today\'s priorities are laid out: 14 ANC visits scheduled (3 are new registrations, 2 are high-risk), 6 Pap recall patients overdue, 3 IUCD thread checks due, and 2 post-operative follow-ups from last week\'s hysterectomies. The system has already sent WhatsApp reminders to this morning\'s patients. Your nurse knows which rooms to prep — the pelvic exam tray for the Pap patients, the sonography room for the growth scans, and the counselling room for the new ANC registrations.',
    },
    {
      step: 2,
      title: 'ANC Visit — Every Investigation, Every Counselling Point, Nothing Missed',
      description: 'Priya, 26, is here for her 24-week ANC visit — her third. Doxxy has already pre-filled her visit template: check BP (last: 118/76), urine albumin and sugar, fundal height, fetal heart rate, and quickening confirmed. The routine investigations panel (OGTT if not done at 24 weeks, Hb, urine culture) is auto-suggested. The counselling checklist pops up: birth preparedness, danger signs, family planning post-delivery, and iron/calcium compliance. The entire visit is documented in under 4 minutes — structured, complete, and auditable.',
    },
    {
      step: 3,
      title: 'Ultrasound Review — Side-by-Side Growth Comparison',
      description: 'Priya\'s ultrasound report from this morning is uploaded. Doxxy parses the key biometrics (BPD 61 mm, HC 225 mm, AC 195 mm, FL 44 mm, EFW 680 g) and plots them on the fetal growth chart — all parameters tracking between the 50th and 75th percentile. The report is displayed side-by-side with her 20-week scan for comparison. The EFW trend is overlaid on a customised growth curve. In under 30 seconds, you\'ve confirmed appropriate interval growth — no hunting through file folders.',
    },
    {
      step: 4,
      title: 'Screening Recall — Pap Smear Follow-Up, Automated',
      description: 'A 38-year-old patient walks in for a general check-up. Her record shows a Pap smear 14 months ago with ASCUS and negative HPV. Doxxy has flagged her follow-up as overdue — the recall reminder was sent via WhatsApp last week, which is why she booked this appointment. You perform the repeat Pap, log the specimen details, and the system automatically calculates the next recall date based on the new result once it\'s entered. The patient\'s screening history is now a complete, traceable narrative — not a disconnected series of reports in a file.',
    },
    {
      step: 5,
      title: 'Menopause Consult — Multi-System Assessment in One Template',
      description: 'A 53-year-old presents with "not feeling like herself" — irritability, poor sleep, 8-10 hot flushes a day, and vaginal dryness affecting her marriage. You open the menopause template: vasomotor score (severe), GSM symptoms (moderate), PHQ-4 mood screen (moderate anxiety), VAS for joint pain. The HRT risk calculator shows low cardiovascular risk, no personal history of breast cancer, DEXA scan pending. You counsel on HRT options, print a structured consultation summary, and schedule her 3-month HRT review. The encounter is comprehensive, protocol-driven, and fully documented.',
    },
    {
      step: 6,
      title: 'End of Day — Audit-Ready, Zero Loose Ends',
      description: 'The day-end dashboard shows: 48 consults, 7 ANC visits (all investigations logged), 3 Pap smears performed, 2 IUCD insertions with consent documented, and 5 new ANC registrations with risk stratification complete. The pending list is clear — no overdue Pap recalls, no missed ANC visits. Tomorrow\'s schedule is pre-loaded with auto-generated WhatsApp reminders queued. The monthly ANC coverage report and cervical screening compliance report are ready for your internal audit. You walk out knowing every woman seen today has her next step scheduled and her reminders in place.',
    },
  ],

  beforeAfterComparisons: [
    {
      area: 'ANC Visit Scheduling',
      before: 'Staff maintain a paper register with due dates. Visit cadence doesn\'t auto-adjust. Missed visits discovered only when the patient shows up at 36 weeks after disappearing since 20 weeks. High-risk flags exist in the doctor\'s memory, not the record.',
      after: 'Auto-generated ANC schedule from LMP/EDD. Cadence shifts automatically: monthly → fortnightly → weekly. Missed visits flagged on the dashboard. WhatsApp reminders sent automatically. High-risk parameters evaluated continuously with visible alerts.',
    },
    {
      area: 'Menstrual History',
      before: '"LMP: ___, cycles: regular/irregular" scribbled in a free-text box. No structured data. Cycle patterns over months invisible. Perimenopausal transition missed until the patient presents with severe anaemia from heavy bleeding.',
      after: 'Structured cycle data (length, duration, quantity, pain, IMB, dyspareunia) recorded at every visit. Cycle regularity scores and trend graphs reveal shortening cycles, anovulatory patterns, and abnormal bleeding trajectories months before they become emergencies.',
    },
    {
      area: 'Ultrasound Report Management',
      before: 'Reports filed in paper folders or scattered across a generic file manager. Comparing this scan to the last one requires finding both reports, manually reading measurements, and doing mental arithmetic. Serial fetal growth trending is impractical.',
      after: 'Structured ultrasound data extraction. Side-by-side comparison of serial scans. Fetal growth curves plotted automatically. Fibroid size, endometrial thickness, and ovarian cyst dimensions trended longitudinally. Reports searchable by parameter and date.',
    },
    {
      area: 'Cervical Cancer Screening Recall',
      before: 'Pap smear results filed in a drawer. Follow-up recall dependent on the patient remembering or the doctor\'s memory during an unrelated visit. Women lost to follow-up for years. Clinic carries unrecognised medicolegal exposure.',
      after: 'Automated recall calculation based on Bethesda category and HPV status. Structured recall intervals: 3 years for normal, 1 year for ASCUS, 6-12 months for LSIL, immediate colposcopy for HSIL. Overdue dashboard with WhatsApp-triggered patient reminders.',
    },
    {
      area: 'Menopause Management',
      before: 'No structured template. Menopause symptoms documented across free-text notes inconsistently. HRT risk assessment done informally. No systematic follow-up. Patients discontinue treatment or miss review appointments.',
      after: 'Comprehensive menopause template covering vasomotor, urogenital, mood, musculoskeletal, and sexual domains. Built-in HRT risk-benefit calculator with cardiovascular, VTE, breast cancer, and osteoporosis risk stratification. Automated 3-month and annual review reminders.',
    },
    {
      area: 'Family Planning Procedures',
      before: 'IUCD insertion logged in a procedure book. Thread check reminders dependent on the patient. Implant expiry dates tracked in a separate calendar. MTP documentation incomplete for medicolegal requirements. Sterilisation consent forms stored separately.',
      after: 'Structured procedure records with auto-generated follow-up schedules. IUCD thread check reminders at 6 weeks. Implant expiry alerts. MTP case records compliant with the MTP Act, including consent form uploads, sonography proof, and Form C generation where required.',
    },
    {
      area: 'Patient Communication',
      before: 'Patients call the clinic for appointment dates, investigation results, and medication queries. Staff spend hours fielding routine calls. ANC patients forget iron/calcium supplementation. Pap recall relies on the patient remembering a 3-year interval.',
      after: 'WhatsApp-first communication: ANC visit reminders, investigation report sharing, medication adherence nudges (iron, calcium, folic acid), Pap recall alerts, IUCD thread check reminders, and post-operative follow-up scheduling. Patients engage through a channel they use daily.',
    },
    {
      area: 'Medicolegal Documentation',
      before: 'Incomplete ANC records create liability in adverse obstetric outcomes. MTP documentation gaps expose the clinic to regulatory action. Screening recall failures lead to missed cervical cancers. Consent forms stored separately from procedure notes.',
      after: 'Complete, time-stamped, structured records for every ANC visit, procedure, and screening event. Consent form uploads linked directly to procedure records. Audit trail for every screening notification sent. Defensible documentation that satisfies MCI, PCPNDT Act, and MTP Act requirements.',
    },
  ],

  testimonial: {
    quote: 'I used to dread our internal audit — finding Pap reports from two years ago, figuring out which ANC patients went off the grid. Doxxy solved that completely. Now I can see my entire practice\'s screening compliance on one dashboard. The ANC scheduler alone has increased our patients completing all 8 visits by about 40%. Women tell me they feel more cared for because "the clinic actually remembers me."',
    name: 'Dr. Meenakshi Sundaram',
    clinic: 'Sundaram Women\'s Health Centre',
    city: 'Coimbatore',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop',
  },

  faqs: [
    {
      question: 'How does the ANC visit scheduler handle pregnancies that start late in care?',
      answer: 'When a patient registers for ANC at, say, 22 weeks (missing the first trimester visits entirely), Doxxy does not generate a schedule from week 8 — it starts from the current gestational age and schedules the remaining visits with the correct cadence. It also flags the missed early investigations (dating scan, first-trimester screening, early Hb/thyroid baseline) as "catch-up required" and adds them to the current visit\'s suggested investigations panel. All subsequent visits follow the standard cadence based on the gestational age at registration, not an arbitrary month count.',
    },
    {
      question: 'Can Doxxy handle both low-risk and high-risk pregnancies in the same interface?',
      answer: 'Yes. Every pregnancy is continuously evaluated against 20+ high-risk criteria — maternal age extremes, previous LSCS, multiple gestation, pre-eclampsia, GDM (including early-onset vs late-onset), Rh incompatibility, anaemia severity, thyroid dysfunction, BMI extremes, previous preterm birth, and more. High-risk pregnancies are flagged prominently on the dashboard with red indicators. The visit templates automatically expand to include additional investigations (e.g., serial growth scans for GDM, umbilical artery Doppler for suspected IUGR) and more frequent visit recommendations when risk factors are present.',
    },
    {
      question: 'How does the Pap smear recall system determine when to send reminders?',
      answer: 'The recall interval is calculated based on the Bethesda cytology classification and HPV co-testing status when available. Normal cytology with negative HPV: 3 years (per ASCCP and FOGSI guidelines). ASCUS with negative HPV: 1 year. ASCUS with positive HPV or no HPV testing: immediate colposcopy referral. LSIL: 6-12 months if age < 25, colposcopy if age >= 25. ASC-H/HSIL/AGC: immediate colposcopy. WhatsApp reminders are sent 30 days and 7 days before the due date. The dashboard displays all patients grouped by status: "screening current," "recall pending," and "overdue," with overdue patients highlighted in red.',
    },
    {
      question: 'Can patients upload their own menstrual data or symptom logs?',
      answer: 'Yes. Patients can send structured bleeding calendars, hot flush frequency logs, fetal movement counts, or blood pressure readings via WhatsApp using a simple message format (e.g., "Period started today, heavy flow" or "2 hot flushes yesterday"). The system parses these into structured fields in their record. For patients who prefer more detailed tracking, a web-based patient portal is also available. This patient-entered data is flagged as patient-reported (distinct from clinic-measured data) and is visible to the doctor during the consultation for correlation with clinical findings.',
    },
    {
      question: 'Does Doxxy support MTP documentation as per the MTP Act requirements?',
      answer: 'Yes. Doxxy includes a dedicated MTP documentation module compliant with the Medical Termination of Pregnancy Act, 1971 (as amended in 2021). This includes: consent Form C generation with mandatory fields as per the Act, documentation of the mandatory 24-hour waiting period where applicable, sonography proof upload with gestational age confirmation, documentation of the medical indication (when beyond 20 weeks and requiring the Medical Board opinion for 20-24 weeks), and procedure details including method (medical vs surgical) and complications. All records are time-stamped, and the audit trail supports regulatory inspection requirements.',
    },
    {
      question: 'How does the menopause template handle HRT risk assessment?',
      answer: 'The HRT risk assessment calculator evaluates cardiovascular risk (age, BMI, smoking status, hypertension, dyslipidaemia, diabetes), venous thromboembolism risk (personal/family history, thrombophilia, immobility), breast cancer risk (Gail model inputs — age at menarche, age at first childbirth, family history, prior breast biopsies), and osteoporosis risk (age, BMI, fracture history, steroid use, secondary osteoporosis causes). The output is a risk-stratified recommendation: HRT generally safe, HRT with precautions (transdermal preferred over oral if VTE risk elevated), or HRT relatively contraindicated (refer for specialist consultation). The assessment is saved with the consultation record and updated at each annual review.',
    },
    {
      question: 'Can the ultrasound report manager compare measurements across different ultrasound centres?',
      answer: 'Yes. The system stores raw biometric values (not just the report image) so measurements from different centres, different sonographers, and different machines can be plotted on the same growth curve and compared. For fetal biometry, AC, HC, BPD, and FL are plotted against gestational age using INTERGROWTH-21st or Hadlock reference curves (you choose). For gynaecological scans, measurements like endometrial thickness, ovarian volume, fibroid dimensions, and adnexal mass characteristics are trended over time irrespective of where the scan was performed. The original report images are always available alongside the structured data for verification.',
    },
    {
      question: 'How does Doxxy handle post-partum follow-up after delivery?',
      answer: 'When you record a delivery outcome (mode of delivery, birth weight, APGAR, complications, postpartum haemorrhage, perineal tear grade), Doxxy automatically schedules the post-partum follow-up sequence: 7-day telephonic/WhatsApp check (breastfeeding, lochia, perineal care, danger signs), 6-week post-partum visit (involution check, contraception counselling, cervical screening if overdue, mental health screen using Edinburgh Postnatal Depression Scale), and 3-month/6-month follow-ups for lactation support and contraception review. For LSCS deliveries, a wound check at day 7-10 is added. High-risk post-partum patients (PPH, severe pre-eclampsia, cardiac disease) are flagged for more intensive surveillance.',
    },
  ],
};

export default config;
