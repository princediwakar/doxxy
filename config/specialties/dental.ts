// Path: config/specialties/dental.ts
import type { SpecialtyConfig } from './types';

const config: SpecialtyConfig = {
  slug: 'dental',
  specialtyName: 'Dental',
  heroTitle: 'Dental Practice Management Software That Understands Dentistry',
  heroSubtitle:
    'Interactive odontograms, multi-appointment treatment plans, lab case tracking, and periodontal charting — a platform built for the unique workflows of Indian dental clinics.',
  problemTitle: 'Why Generic Software Fails Dental Practices',
  problemDescription:
    'Dentistry is fundamentally different from general medicine. A dental consultation revolves around a graphical tooth chart — the odontogram — where findings are recorded per surface, per tooth, across 32 teeth each with 5 surfaces. Generic clinic software has no concept of an odontogram, forcing dentists to describe findings in text fields: "MO caries #16, distal overhang #36, grade II mobility #31." This is not just tedious — it makes treatment planning, insurance claims, and medico-legal documentation fragmented and error-prone. Multi-appointment treatment plans add another layer of complexity. A single root canal treatment spans 3 to 4 visits spread over 2 to 3 weeks, with each visit building on the previous one: access opening, biomechanical preparation, obturation, and finally crown preparation and cementation. Generic EMRs treat each visit as an isolated encounter with no awareness of where the patient is in the treatment sequence. Lab work — crowns, bridges, dentures, and implant prostheses — adds a third dimension: cases sent to external labs must be tracked from impression to try-in to final cementation, with due dates and patient recall triggers. Periodontal charting requires recording probing depths, bleeding on probing, gingival margin levels, and clinical attachment loss at six sites per tooth — resulting in 192 data points per full-mouth charting that generic software has no structured way to capture. Paediatric dentistry adds fluoride varnish schedules, pit-and-fissure sealant tracking, mixed dentition charting, and growth monitoring. Indian dental clinics, whether a single-chair setup in a tier-2 city or a multi-specialty practice in a metro, need software that was designed by people who understand the difference between a Class I and a Class V cavity — not a general EMR with a tooth icon in the header.',
  statsSection: {
    title: 'The Dental Landscape in India',
    stats: [
      { value: '3,10,000+', label: 'Registered dentists in India (highest globally)' },
      { value: '70%', label: 'Of Indian dental clinics are single-chair setups' },
      { value: '₹30,000 Cr', label: 'Indian dental services market size (2025 est.)' },
      { value: '60%', label: 'Of RCT patients do not complete the full treatment series' },
    ],
  },
  solutionTitle: 'Doxxy for Dental: Chart, Plan, Track — All in One Place',
  solutionDescription:
    'Doxxy puts an interactive odontogram at the centre of every patient record. Click any tooth surface to record caries, restorations, fractures, mobility, or periapical findings. The odontogram drives everything downstream: it auto-generates the treatment plan with multi-appointment sequencing, it pre-fills insurance claims with tooth numbers and surface codes, and it maintains a complete graphical history of every tooth over time. Root canal protocols automatically schedule the full 3-4 visit sequence with templates for each session. Lab case tracking monitors every crown, bridge, and denture from impression dispatch to final cementation with automated patient recall. The periodontal module captures full-mouth charting at six sites per tooth and plots pocket depth trends longitudinally. Paediatric workflows include mixed dentition charting, fluoride application schedules, and eruption tracking against chronological age. Doxxy does not ask a dentist to adapt to software — the software adapts to dentistry.',
  keyFeatures: [
    {
      icon: 'tooth',
      title: 'Interactive Odontogram — The Centre of Every Record',
      description:
        'A full graphical tooth chart covering all 32 teeth with 5 surfaces each (mesial, distal, buccal, lingual/palatal, occlusal/incisal). Click any surface to record caries, existing restorations, fractures, attrition, erosion, abrasion, or periapical pathology. Supports FDI and Universal numbering systems. The odontogram drives treatment planning, billing, and insurance claims automatically.',
    },
    {
      icon: 'calendar',
      title: 'Multi-Appointment Treatment Sequencing',
      description:
        'Protocols for treatments that require multiple visits: RCT (3–4 visits with templated notes for access opening, BMP, obturation, and post-endo restoration), implant placement (3+ visits from placement to loading), full-mouth rehabilitation, and orthodontic adjustments. Each visit builds on the previous one with automatic scheduling of the next appointment at the clinically appropriate interval.',
    },
    {
      icon: 'wrench',
      title: 'Dental Lab Case Tracking',
      description:
        'Track every lab case from impression/scan dispatch through to try-in and final cementation. Log the lab name, material (PFM, zirconia, E.max, acrylic, metal), shade, and due date. Dashboard flags overdue cases and patients awaiting cementation. Automated patient recall when the lab work is ready. Maintain a complete lab case history per patient with outcomes and complications.',
    },
    {
      icon: 'activity',
      title: 'Periodontal Charting & Gum Health Monitoring',
      description:
        'Full-mouth periodontal charting capturing probing depth, bleeding on probing, gingival margin level, mucogingival junction, furcation involvement, and clinical attachment loss at six sites per tooth — generating 192 structured data points per exam. Longitudinal graphs show pocket depth trends and attachment loss over time. Auto-calculates periodontal diagnosis based on AAP staging and grading criteria.',
    },
    {
      icon: 'baby',
      title: 'Paediatric Dentistry Workflow',
      description:
        'Mixed dentition charting that tracks primary teeth exfoliation and permanent teeth eruption against chronological age. Fluoride varnish application scheduler with age-appropriate intervals. Pit-and-fissure sealant tracking with retention checks. Growth assessment and orthodontic referral flags. Behaviour management notes and parent communication templates designed for paediatric cases.',
    },
    {
      icon: 'camera',
      title: 'Intraoral Photography & Smile Documentation',
      description:
        'Structured capture and storage of intraoral and extraoral photographs — frontal, profile, occlusal, and retracted views. Pre-op and post-op comparison for cosmetic cases. Photographs linked to the relevant tooth in the odontogram. Built-in smile design documentation for aesthetic dentistry cases including veneers, laminates, and full-mouth rehabilitation.',
    },
    {
      icon: 'pill',
      title: 'Prescription & Post-Op Instruction Automation',
      description:
        'Dental-specific prescription templates covering antibiotics (amoxicillin, metronidazole, clindamycin), analgesics (NSAIDs, paracetamol combinations), chlorhexidine mouthwash, and pre-medication for patients with specific conditions (infective endocarditis risk, joint replacement). Post-extraction, post-RCT, and post-surgical instruction sheets delivered automatically to the patient via WhatsApp.',
    },
    {
      icon: 'barChart',
      title: 'Treatment Acceptance & Revenue Analytics',
      description:
        'Track treatment plan presentation versus acceptance rates by procedure type. Identify which treatment plans are being deferred or declined. Revenue analytics by provider, procedure category, and payment mode. Insurance claim status tracking with pending, approved, and rejected claim dashboards. Designed to help clinics understand the business side of their practice without manual spreadsheet work.',
    },
  ],
  workflowSteps: [
    {
      step: 1,
      title: 'Patient Arrival & Dental History Intake',
      description:
        'Patient arrives at 9:30 AM for a new consultation. Reception captures chief complaint (pain, sensitivity, aesthetic concern, routine check-up) using a dental triage form. Previous dental records — including the odontogram from prior visits — load on the dentist\'s screen. If it is a first visit, a blank odontogram with FDI numbering awaits charting.',
    },
    {
      step: 2,
      title: 'Clinical Examination — Odontogram Charting',
      description:
        'You start with a full-mouth examination. As you call out findings, you (or your assistant) click tooth surfaces on the odontogram: disto-occlusal caries in #16, fractured mesial marginal ridge #36, grade I mobility #31, generalised gingivitis with calculus deposits. The odontogram renders findings graphically while the system captures structured data behind each click. Hard-tissue and soft-tissue findings are recorded in parallel.',
    },
    {
      step: 3,
      title: 'Treatment Planning with Sequencing',
      description:
        'Doxxy auto-generates a treatment plan from the odontogram findings. For tooth #16 with deep caries approaching the pulp, the system suggests a RCT protocol: Visit 1 (access opening + pulp extirpation + CaOH dressing), Visit 2 (BMP), Visit 3 (obturation), Visit 4 (post-endo composite restoration + crown prep). You approve and customise. The entire 4-visit sequence is scheduled with clinically appropriate intervals. Estimated cost is calculated and presented to the patient for informed consent.',
    },
    {
      step: 4,
      title: 'Procedure Execution & Lab Case Initiation',
      description:
        'For a crown case: after tooth preparation, you record the prep design (chamfer/shoulder), shade selection (A2, M2), and impression technique. The lab case form auto-fills with the tooth number, preparation details, material choice (zirconia/PFM/E.max), and lab name. A due date is set and the case appears on your lab tracking dashboard. For the current visit, procedure notes are templated — you add specifics and sign off.',
    },
    {
      step: 5,
      title: 'Patient Checkout — Prescription, Instructions & Recall',
      description:
        'Post-procedure, Doxxy auto-generates the prescription (analgesics, antibiotics if indicated, mouthwash), delivers post-op instructions via WhatsApp, and prints or emails the invoice with procedure codes. The next visit in the treatment sequence is already scheduled. If the treatment plan includes a prophylaxis, a 6-month recall is automatically set. For lab cases, a "try-in" appointment is created when the lab marks the case as dispatched.',
    },
    {
      step: 6,
      title: 'End of Day — Lab Case Review & Pending Actions',
      description:
        'Before closing, review the dashboard: lab cases past their due date (a PFM crown for #36 that should have arrived from the lab 3 days ago — call the lab), patients who missed today\'s scheduled RCT continuation (reschedule or flag as discontinued treatment), and treatment plans presented but not yet accepted (queue a follow-up call). Doxxy generates a daily summary: patients seen, procedures completed, lab cases tracked, revenue collected, and pending actions for tomorrow.',
    },
  ],
  beforeAfterComparisons: [
    {
      area: 'Clinical Charting',
      before:
        'Handwritten or text-based notes describing caries as "cavity in upper right first molar on the chewing surface." No graphical record. Finding what was done to tooth #16 three years ago requires reading through pages of handwritten notes.',
      after:
        'Interactive odontogram with every finding recorded per surface, per tooth. Three years of dental history for tooth #16 is visible at a glance — when the MOD amalgam was placed, when it was replaced with a composite, and when the crown was done.',
    },
    {
      area: 'Multi-Appointment Treatment Plans',
      before:
        'RCT sequenced across 3–4 visits tracked in the dentist\'s memory or a paper diary. Patients forget appointments midway through treatment. Incomplete RCTs lead to flare-ups, tooth loss, and patient dissatisfaction.',
      after:
        'The full RCT sequence is templated and auto-scheduled at the right clinical intervals. Each visit builds on the previous with pre-loaded procedure notes. The dashboard shows patients mid-treatment and flags those who missed a continuation visit.',
    },
    {
      area: 'Lab Case Management',
      before:
        'Lab work tracked in a physical register or WhatsApp messages. The lab calls to say the crown is ready but the clinic cannot immediately recall which patient it was for. Cases sit at the lab for weeks because nobody followed up.',
      after:
        'Every lab case logged with patient, tooth, material, shade, lab name, and due date. Overdue cases flagged. Lab-ready notifications trigger automatic patient recall. Complete lab case history maintained per patient with outcomes.',
    },
    {
      area: 'Periodontal Charting',
      before:
        'Probing depths written on a paper periodontal chart that is filed away and never compared longitudinally. A patient with 5 mm pockets today versus 4 mm six months ago — the progression is missed because the old chart was never pulled out.',
      after:
        'Full-mouth charting with 192 data points captured digitally at six sites per tooth. Pocket depth trends plotted longitudinally. Attachment loss progression flagged automatically. AAP staging and grading calculated from structured data.',
    },
    {
      area: 'Paediatric Dentistry',
      before:
        'No structured way to track mixed dentition, eruption sequence, or fluoride application intervals. Paediatric recall depends on the parent remembering to book an appointment.',
      after:
        'Mixed dentition chart with primary tooth exfoliation and permanent tooth eruption tracked against chronological age. Automated fluoride varnish and sealant recall at age-appropriate intervals. Growth assessment notes and orthodontic referral flags.',
    },
    {
      area: 'Insurance & Billing',
      before:
        'Insurance claims require manually looking up tooth numbers, surface codes, and procedure codes. Errors in surface mapping lead to claim rejections. No visibility into pending, approved, and rejected claims.',
      after:
        'The odontogram auto-generates claim forms with correct tooth numbers and surface codes. Claim status dashboard tracks every claim through submission, approval, and payment. Rejected claims flagged with reason codes for resubmission.',
    },
    {
      area: 'Patient Communication',
      before:
        'Post-extraction instructions explained verbally and forgotten by the patient before they reach home. No standardised way to send appointment reminders. Patients call the clinic asking "Doctor, can I eat rice after the extraction?"',
      after:
        'Procedure-specific post-op instructions delivered automatically via WhatsApp in the patient\'s preferred language. Appointment reminders with personalised messages. Two-way messaging for urgent queries with photo sharing for post-op concerns.',
    },
    {
      area: 'Practice Analytics',
      before:
        'Revenue tracked in a separate accounting system with no link to clinical data. Which procedures generate the most revenue? What is the treatment acceptance rate? Which months are slow? These questions require hours of manual reconciliation.',
      after:
        'Unified clinical and financial analytics. Revenue by procedure category, provider, and payment mode. Treatment acceptance tracking. Chair utilisation rates. Insurance versus cash-pay breakdown. Designed for the Indian dental practice owner who wants data-driven decisions.',
    },
  ],
  testimonial: {
    quote:
      'As a prosthodontist doing 12–15 crown cases a week, my biggest headache was tracking lab work. Cases would sit at the lab for weeks while I had no visibility. Doxxy\'s lab tracking dashboard changed everything — I can see exactly which cases are overdue, which are ready for try-in, and which are pending cementation. My treatment completion rate for full-mouth rehab cases went from about 40% to over 85% because patients are now automatically recalled when their lab work arrives. This is the first software I\'ve used in 15 years of practice that actually understands dental workflows.',
    name: 'Dr. Rajesh Khanna',
    clinic: 'Smile Architects Dental Speciality Centre',
    city: 'Chennai',
    photo:
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop',
  },
  faqs: [
    {
      question: 'How does the odontogram work, and which tooth numbering system does Doxxy use?',
      answer:
        'The Doxxy odontogram is an interactive graphical chart of all 32 teeth, each with 5 surfaces (mesial, distal, buccal, lingual/palatal, occlusal/incisal). You click any surface to record caries, existing restorations, fractures, mobility, periapical findings, implants, bridges, or crowns. Doxxy supports both FDI (two-digit) and Universal numbering systems, and you can switch between them in settings. The odontogram is the central hub — findings recorded here automatically drive treatment planning, billing codes, and insurance claim forms with correct tooth and surface mapping.',
    },
    {
      question: 'Can Doxxy handle multi-appointment treatments like RCT and implant cases?',
      answer:
        'Yes, this is one of Doxxy\'s core strengths. The system includes pre-built multi-appointment protocols for common treatments. For RCT, the protocol spans 3–4 visits (access opening and pulp extirpation, biomechanical preparation, obturation, and post-endo restoration/crown prep), each with templated procedure notes and the next visit auto-scheduled at the clinically appropriate interval (typically 2–5 days between visits). For implants, the sequence covers placement, osseointegration waiting period, second-stage surgery if needed, impression, and final loading. The dashboard shows every patient mid-treatment and flags anyone who has missed a continuation visit, so incomplete treatment plans are never lost to follow-up.',
    },
    {
      question: 'How does the dental lab case tracking feature work?',
      answer:
        'When you prepare a tooth for a crown, bridge, or any prosthesis requiring lab work, Doxxy creates a lab case record linked to the patient and the specific tooth. You log the lab name, material (PFM, zirconia, E.max lithium disilicate, full metal, acrylic), shade, and preparation details. The system sets a due date based on your lab\'s typical turnaround time and adds the case to your lab tracking dashboard. When the lab notifies you that the case is ready, a single click triggers an automated patient recall via WhatsApp. Overdue cases are flagged prominently. After cementation, you record the outcome (satisfactory, remade, adjusted), building a lab performance history that helps you evaluate which labs deliver consistent quality and on time.',
    },
    {
      question: 'Does Doxxy support full-mouth periodontal charting?',
      answer:
        'Yes. Doxxy\'s periodontal module captures full-mouth charting at six sites per tooth (mesiobuccal, buccal, distobuccal, mesiolingual, lingual, distolingual), recording probing depth, bleeding on probing, gingival margin level, mucogingival junction position, furcation involvement (Grade I–IV), and clinical attachment loss. This generates up to 192 data points per exam. The system plots pocket depth trends and attachment loss longitudinally, flags sites with disease progression (2 mm or more increase in pocket depth or attachment loss), and auto-calculates the AAP periodontal staging and grading. This is essential for treatment planning, insurance documentation, and tracking non-surgical and surgical periodontal therapy outcomes.',
    },
    {
      question: 'How does Doxxy handle paediatric dental patients?',
      answer:
        'The paediatric module includes mixed dentition charting that tracks the exfoliation of 20 primary teeth and the eruption sequence of 32 permanent teeth against the patient\'s chronological age. It flags deviations from normal eruption patterns for orthodontic referral consideration. The fluoride varnish scheduler sets age-appropriate recall intervals (typically every 3–6 months based on caries risk assessment). Pit-and-fissure sealant application is recorded per tooth with retention check reminders. The module also supports behaviour management notes (Frankl behaviour rating scale), parental anxiety documentation, and child-friendly appointment scheduling (shorter slots, morning preference for younger children).',
    },
    {
      question: 'Can Doxxy help with insurance claims and billing for dental procedures?',
      answer:
        'Yes. When you chart findings and create a treatment plan on the odontogram, Doxxy maps the procedures to the correct insurance codes with tooth numbers and surface designations automatically. This eliminates the most common cause of dental claim rejections: incorrect tooth-surface-to-procedure mapping. The insurance dashboard tracks every claim through submission, adjudication, approval, and payment. Rejected claims are flagged with the reason code and a resubmission prompt. For cash-pay patients, Doxxy generates detailed invoices with procedure codes, tooth numbers, and cost breakdowns that patients can use for reimbursement from their own insurance or employer health plans.',
    },
    {
      question: 'Does Doxxy work for a single-chair dental clinic or only for larger practices?',
      answer:
        'Doxxy is designed to work for both. Over 70% of Indian dental clinics are single-chair setups, and Doxxy\'s workflow is optimised for the solo dentist who is also the clinic owner, front-desk manager, and treatment coordinator. The odontogram-driven workflow reduces documentation time so you can focus on clinical work rather than typing. For multi-chair and multi-specialty practices (with an endodontist, prosthodontist, periodontist, and orthodontist under one roof), Doxxy supports multiple provider logins with role-based access, a unified patient database, and the ability to assign specific procedures within a treatment plan to different specialists. Multi-branch clinics can operate with a consolidated patient database across locations.',
    },
    {
      question: 'How does Doxxy handle post-operative instructions and patient communication?',
      answer:
        'After any procedure — extraction, RCT, implant placement, periodontal surgery, or crown cementation — Doxxy automatically delivers a procedure-specific post-operative instruction sheet to the patient via WhatsApp. These instructions cover diet, oral hygiene modifications, medication schedule, activity restrictions, and warning signs that should prompt an immediate call back to the clinic. Instructions can be sent in the patient\'s preferred language (English, Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Bengali). The system also sends automated appointment reminders and, for treatment plans that require multiple visits, nudges patients who are at risk of discontinuing treatment. Two-way messaging allows patients to send photos of post-operative concerns for triage without an unnecessary visit.',
    },
  ],
};

export default config;
