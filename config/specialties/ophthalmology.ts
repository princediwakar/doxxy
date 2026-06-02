// Path: config/specialties/ophthalmology.ts
import type { SpecialtyConfig } from './types';

const config: SpecialtyConfig = {
  slug: 'ophthalmology',
  specialtyName: 'Ophthalmology',
  heroTitle: 'Precision Eye Care, From Refraction to Retina',
  heroSubtitle: 'The only practice management platform built for the complete ophthalmology workflow — vision testing, IOP tracking, cataract surgery scheduling, and prescription management in one system.',
  problemTitle: 'Why Generic Clinic Software Fails Ophthalmology Practices',
  problemDescription:
    'Ophthalmology sits at a unique intersection of outpatient clinic, diagnostic imaging centre, and surgical facility — yet most practice management software treats it like a general physician\'s clinic. A typical ophthalmology practice in India sees 60-100 patients daily, each requiring multiple diagnostic data points before the doctor even enters the room: visual acuity via Snellen chart, auto-refraction values, intraocular pressure (IOP) readings, and increasingly, fundus photographs and OCT scans. Generic EMRs have no concept of laterality — they cannot natively distinguish between right eye and left eye findings, forcing clinicians to rely on free-text notes that are useless for longitudinal trending. Cataract surgery, which accounts for over 6.5 million procedures annually in India, demands meticulous coordination across pre-op assessment, surgical scheduling with IOL power calculation, and a regimented post-op follow-up cadence (Day 1, Week 1, Month 1). Most systems treat these as disconnected appointments with no protocol linking. Glaucoma patients require IOP tracking graphed over years — a single missed data point can mean delayed detection of progression. Refraction prescriptions for spectacles and contact lenses need structured, printable formats that comply with optical dispensing standards. Without laterality-aware structured data capture, ophthalmologists waste 30-40% of consultation time on documentation instead of diagnosis, and clinical audits for conditions like diabetic retinopathy become impossible without manual chart review. The Indian context adds further complexity: high patient volumes, the need for vernacular prescription printouts, and integration with government blindness control programs make generic software wholly inadequate.',

  statsSection: {
    title: 'Ophthalmology in India: A Data-Driven Reality',
    stats: [
      { value: '6.5M+', label: 'Cataract surgeries performed annually in India' },
      { value: '~12M', label: 'Indians live with glaucoma; 1.2M already blind from it' },
      { value: '60-100', label: 'Average daily patient load per ophthalmologist' },
      { value: '77M', label: 'Indians have diabetes — all need annual retinal screening' },
    ],
  },

  solutionTitle: 'One Platform for the Complete Ophthalmic Workflow',
  solutionDescription:
    'Doxxy replaces fragmented paper records and generic EMRs with a structured, laterality-aware practice management system purpose-built for ophthalmology. Record right eye and left eye findings as discrete, queryable data points — not buried in free text. Our cataract surgery module links pre-op assessment, biometry, surgical scheduling, and post-op follow-ups into a single unified workflow. IOP readings are captured longitudinally and graphed over time for every glaucoma suspect. Prescriptions for spectacles and contact lenses are generated in a format that opticians can dispense directly. Fundus images and OCT reports attach to the patient record, not a disconnected folder on a desktop. And because we understand the Indian clinic reality, everything works with the patient volumes you actually handle — not idealized 15-minute appointment slots that crumble by 10 AM.',

  keyFeatures: [
    {
      icon: 'eye',
      title: 'Laterality-Aware Clinical Documentation',
      description:
        'Every finding is recorded as OD (right eye), OS (left eye), or OU (both eyes). Visual acuity, IOP, anterior segment findings, and fundus details are structurally stored per eye — enabling one-click comparison between visits and eliminating ambiguous free-text notes.',
    },
    {
      icon: 'scan',
      title: 'Cataract Surgery Workflow Manager',
      description:
        'A complete surgical pipeline: pre-op assessment with biometry and IOL power calculation, surgery scheduling with OT slot management, and automated post-op follow-up scheduling for Day 1, Week 1, and Month 1 visits. Each stage tracks its own checklist — no step falls through the cracks.',
    },
    {
      icon: 'activity',
      title: 'IOP & Glaucoma Progression Tracker',
      description:
        'Log IOP readings by eye at every visit. Doxxy automatically plots IOP trends over time with target pressure thresholds. Flag patients whose IOP is trending upward despite treatment, and link visual field test results for correlated progression analysis.',
    },
    {
      icon: 'camera',
      title: 'Fundus & OCT Image Attachments',
      description:
        'Attach fundus photographs, OCT scans, and slit-lamp images directly to the patient encounter. Images are stored alongside the corresponding clinical findings — not in a disconnected desktop folder — and are viewable chronologically to track disease progression visually.',
    },
    {
      icon: 'clipboard',
      title: 'Structured Refraction & Prescription Manager',
      description:
        'Record distance and near refraction with sphere, cylinder, axis, and add power for each eye. Generate printable spectacle and contact lens prescriptions in standard optical notation. Track prescription history to monitor myopic progression in children and presbyopic changes in adults.',
    },
    {
      icon: 'waveform',
      title: 'Visual Field Test Integration',
      description:
        'Upload and attach Humphrey perimeter or Octopus visual field reports. Map mean deviation and pattern deviation trends visit-over-visit. Correlate VF progression with IOP data to make evidence-based decisions about glaucoma treatment escalation.',
    },
    {
      icon: 'calendar',
      title: 'LASIK & Refractive Surgery Consultation Workflow',
      description:
        'Dedicated checklists for refractive surgery candidates: corneal topography review, pachymetry, tear film assessment, and dilated fundus exam. Schedule pre-op counselling, surgery day, and post-op follow-ups with procedure-specific templates.',
    },
    {
      icon: 'chartLine',
      title: 'Diabetic Retinopathy Screening Dashboard',
      description:
        'Flag all diabetic patients overdue for annual retinal examination. Record retinopathy grade (NPDR mild/moderate/severe, PDR) and macular edema status per eye. Generate compliance reports for internal audits and government blindness control program submissions.',
    },
  ],

  workflowSteps: [
    {
      step: 1,
      title: 'Patient Check-In & Preliminary Workup',
      description:
        'Front desk checks the patient in. Optometrist or technician records visual acuity (aided and unaided) for each eye using the Snellen chart interface, measures auto-refraction, and captures IOP via air-puff or applanation tonometry. All values are stored per eye in the patient\'s encounter record before the doctor enters.',
    },
    {
      step: 2,
      title: 'Doctor Consultation & Slit-Lamp Examination',
      description:
        'The ophthalmologist reviews the pre-loaded diagnostic data on a single screen: VA, refraction, IOP trends graphed over time. Slit-lamp findings for anterior segment are recorded with laterality — lid, conjunctiva, cornea, anterior chamber, iris, and lens are documented systematically. The doctor selects the diagnosis from a specialty-specific ICD-11 picklist.',
    },
    {
      step: 3,
      title: 'Dilated Fundus Examination & Imaging Correlation',
      description:
        'Post-dilation, the doctor examines the fundus. Findings are recorded per eye: optic disc (CDR for glaucoma), macula, vessels, and periphery. If OCT or fundus photos were taken, they appear side-by-side with the doctor\'s notes for immediate correlation. Any discrepancy between imaging and clinical exam is flagged.',
    },
    {
      step: 4,
      title: 'Cataract Surgery Planning & Counselling',
      description:
        'For surgical candidates: biometry values (axial length, K readings, ACD) are entered and IOL power is calculated. The surgery is scheduled with OT slot selection, preferred IOL type, and patient counselling checklist — including informed consent documentation. Post-op visits are auto-scheduled for Day 1, Week 1, and Month 1.',
    },
    {
      step: 5,
      title: 'Prescription Generation & Patient Handout',
      description:
        'The doctor finalizes the spectacle or contact lens prescription with the structured refraction module. A printable prescription is generated in standard notation. If medications are prescribed, the dosage, frequency, and laterality (which eye) are clearly specified. Instructions can be printed in English or a regional language.',
    },
    {
      step: 6,
      title: 'Billing, Pharmacy Dispensing & Follow-Up Scheduling',
      description:
        'Consultation and procedure charges are auto-calculated based on services rendered. Optical shop orders (spectacles, contact lenses) are linked to the patient record. The follow-up interval is set — whether 3 months for routine glaucoma monitoring or 1 day for a post-op cataract patient — and an automated SMS reminder is queued.',
    },
  ],

  beforeAfterComparisons: [
    {
      area: 'Visual Acuity Recording',
      before:
        'VA scribbled as "6/12, 6/9" on a paper slip with no indication of which eye is which. Previous visit values are buried in a thick file, making comparison impossible during a busy OPD.',
      after:
        'VA is recorded per eye (OD/OS) in structured fields. Current and previous values are displayed side-by-side on the consultation screen. "Was 6/12 at last visit, now 6/18 — this eye is deteriorating" is instantly visible.',
    },
    {
      area: 'IOP Trend Monitoring',
      before:
        'IOP values scattered across paper notes or generic EMR free-text. The doctor must flip through pages to mentally reconstruct the trend. A slowly rising IOP is easily missed.',
      after:
        'Every IOP reading is time-stamped per eye. A sparkline graph renders on the patient dashboard showing IOP trend over the last 6 visits. Any reading above target pressure is highlighted in amber. Glaucoma progression is caught months earlier.',
    },
    {
      area: 'Cataract Surgery Coordination',
      before:
        'Pre-op assessment, surgery scheduling, and follow-ups exist as three disconnected events. The OT coordinator calls the doctor to confirm IOL power. Post-op Day 1 visit is forgotten unless the patient remembers to come back.',
      after:
        'The entire surgical episode is a single tracked workflow. Pre-op checklist ensures biometry is done and IOL calculated before surgery can be scheduled. OT slot booking triggers automated post-op appointment creation. Nothing is left to memory.',
    },
    {
      area: 'Spectacle Prescription Management',
      before:
        'Prescriptions written on letterhead pads that patients lose. No record of previous prescriptions means the doctor cannot track myopic progression objectively. Opticians call the clinic daily to verify illegible handwriting.',
      after:
        'Every prescription is digitally stored with date, refraction values, and PD. A child\'s myopia progression over 3 years is plotted on a graph. Prescriptions print clearly in standard notation. Opticians dispense without calling to verify.',
    },
    {
      area: 'Fundus Documentation',
      before:
        'Doctor dictates fundus findings while an assistant types free text. "CDR 0.6" might refer to right eye or left eye — nobody is sure. Fundus photos are on a separate imaging machine with no link to the EHR.',
      after:
        'Fundus findings are recorded per eye with structured fields for disc, macula, vessels, and periphery. Fundus photos attach to the encounter. A year later, the doctor pulls up the image and note side-by-side to assess for change.',
    },
    {
      area: 'Diabetic Retinopathy Screening Compliance',
      before:
        'The doctor knows their diabetic patients need annual retinal exams, but there is no system to track who is overdue. The list exists only in the doctor\'s head. Patients slip through. Preventable blindness occurs.',
      after:
        'Doxxy identifies every diabetic patient in the practice and flags those overdue for retinal screening. A dashboard shows screening compliance rates. For clinics participating in the NPCBVI program, reports are one click away.',
    },
    {
      area: 'LASIK Candidacy Assessment',
      before:
        'Refractive surgery workup involves pachymetry, topography, tear film assessment, and dilated exam — but results are scattered across devices and paper forms. The doctor must collate everything manually before making a surgical decision.',
      after:
        'The LASIK consultation template brings all pre-op data into a single structured view. Corneal thickness, topography patterns, refraction stability, and tear film status are assessed against eligibility criteria. The surgeon makes a data-driven recommendation in minutes, not after 15 minutes of paper shuffling.',
    },
    {
      area: 'Patient Communication & Recall',
      before:
        'A glaucoma patient on travoprost is supposed to return in 3 months. There is no recall system. The patient returns only when symptoms worsen — by which time irreversible optic nerve damage has progressed.',
      after:
        'Automated SMS and WhatsApp reminders are sent 7 days and 1 day before the scheduled follow-up. Patients who miss appointments appear on a "No-Show" dashboard for staff call-back. Continuity of care is enforced, not hoped for.',
    },
  ],

  testimonial: {
    quote:
      'Before Doxxy, my IOP tracking was a nightmare — readings scattered across paper files, and I had to mentally reconstruct trends for every glaucoma patient. Now I glance at the trend graph and know immediately if a patient\'s pressures are drifting upward. The cataract workflow alone saves my surgical coordinator 2 hours a day in phone calls. This is what an ophthalmology EMR should have been from day one.',
    name: 'Dr. Arvind Subramanian',
    clinic: 'Kovai Eye Care Centre',
    city: 'Coimbatore',
    photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop',
  },

  faqs: [
    {
      question: 'How does Doxxy handle right eye and left eye data differently from a generic EMR?',
      answer:
        'Every clinical finding in Doxxy is stored with laterality — right eye (OD), left eye (OS), or both eyes (OU). When you record visual acuity, it is logged as "OD: 6/12, OS: 6/9" as discrete data points, not a single free-text string. This means you can query "show me all patients whose right eye IOP exceeded 22 mmHg in the last 6 months" and get results instantly. When viewing IOP trends, each eye is graphed as a separate line on the same chart for easy comparison.',
    },
    {
      question: 'Can Doxxy integrate with our existing auto-refractometer, OCT, or perimeter devices?',
      answer:
        'Doxxy supports DICOM and HL7 integration for imaging devices including OCT, fundus cameras, and visual field perimeters. For auto-refractometers and tonometers that output structured data (typically via RS-232 or networked export), we can map fields to the appropriate laterality-aware slots in the patient encounter. For clinics without direct device integration, our quick-entry interface allows optometrists to transcribe values in under 30 seconds per patient — substantially faster than writing on paper.',
    },
    {
      question: 'How does the cataract surgery workflow handle IOL power calculation?',
      answer:
        'The cataract workflow includes a biometry data entry screen where you record axial length, K1/K2, anterior chamber depth, and lens thickness for each eye. Doxxy integrates with the Barrett Universal II, SRK/T, Hoffer Q, and Haigis formulae to calculate recommended IOL power. You can compare results across formulae, select the target refraction, and the chosen IOL power is locked to the surgery plan. The surgery scheduler then ensures the correct IOL is listed on the OT list for that day.',
    },
    {
      question: 'Does Doxxy support vernacular language prescription printouts for patients?',
      answer:
        'Yes. Medication instructions, follow-up dates, and spectacle prescriptions can be printed in Hindi, Tamil, Telugu, Malayalam, Kannada, Bengali, Marathi, and Gujarati. The clinical data remains in English (or your preferred documentation language), but patient-facing handouts are translated at print time. This is particularly important for elderly cataract patients who may not read English and need clear post-operative care instructions in their mother tongue.',
    },
    {
      question: 'Can we track spectacle and contact lens prescription history to monitor myopic progression?',
      answer:
        'Absolutely. Every refraction is stored with date, full prescription values, and prescribing doctor. For paediatric myopia patients, Doxxy plots spherical equivalent over time so you can show parents the objective evidence of progression. This is invaluable when counselling about myopia control interventions like atropine, orthokeratology, or multifocal contact lenses. You can also see which prescriptions were dispensed by your optical shop versus written for external fulfilment.',
    },
    {
      question: 'How does the glaucoma progression analysis work?',
      answer:
        'Doxxy correlates three longitudinal data streams for each glaucoma patient: IOP readings (graphed per eye against target pressure), optic nerve findings (cup-to-disc ratio, rim thinning, disc haemorrhage notes), and visual field indices (mean deviation, pattern standard deviation, visual field index). The dashboard flags patients whose IOP is consistently above target OR whose visual fields show progression at target IOP — prompting a re-evaluation of the treatment target. You can set per-patient target pressures, and the system will alert you when readings breach the threshold.',
    },
    {
      question: 'Is there support for government blindness control program reporting (NPCBVI)?',
      answer:
        'Yes. Doxxy includes a compliance reporting module for the National Programme for Control of Blindness and Visual Impairment (NPCBVI). You can generate reports showing number of cataract surgeries performed (with IOL implantation rate), diabetic retinopathy screenings conducted, and refractive error corrections dispensed — all filterable by date range and formatted per NPCBVI submission guidelines. This eliminates the manual tallying that takes staff hours every reporting period.',
    },
    {
      question: 'What happens if a post-op cataract patient misses their Day 1 follow-up?',
      answer:
        'The cataract workflow module tracks every scheduled post-op visit. If a patient does not arrive for their Day 1, Week 1, or Month 1 follow-up by noon on the scheduled day, they appear on the "Missed Post-Op" alert list. Front-desk staff can call the patient from within Doxxy (click-to-dial) and reschedule. The system also sends automated SMS reminders 2 days and 1 day before each post-op appointment. Post-operative complications like endophthalmitis are time-critical, and this workflow ensures no patient is lost to follow-up during the high-risk window.',
    },
  ],
};

export default config;
