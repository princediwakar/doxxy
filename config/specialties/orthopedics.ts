// Path: config/specialties/orthopedics.ts
import type { SpecialtyConfig } from './types';

const config: SpecialtyConfig = {
  slug: 'orthopedics',
  specialtyName: 'Orthopedics',

  heroTitle: 'Orthopaedic Practice Management That Understands Bones, Joints, and Everything Between',
  heroSubtitle: 'From X-ray triage to post-op recovery tracking — a platform built for the unique rhythm of Indian orthopaedic clinics handling trauma, arthroplasty, sports medicine, and physiotherapy under one roof.',

  problemTitle: 'Why Generic Clinic Software Fails Orthopaedic Practices',
  problemDescription:
    'Orthopaedic practice in India sits at a punishing intersection of high trauma caseload, image-heavy diagnostics, and longitudinal recovery tracking that generic EMRs were never designed to handle. A typical orthopaedic surgeon in a Tier-2 Indian city sees 60 to 80 patients daily — each visit generating X-rays, MRI scans, range-of-motion readings, and physiotherapy notes that need to be correlated across weeks or months. Generic software treats every visit as a blank slate. It does not understand that today\'s knee flexion measurement is meaningless without last week\'s baseline. It offers no side-by-side view for comparing pre-op and post-op imaging. It cannot track which Zimmer implant was used in which knee, what the manufacturer\'s post-op protocol is, or when the patient is due for their next physiotherapy session.\n\nSurgical planning becomes a paper-and-sticky-note exercise: pre-op checklists scattered across files, implant catalogs stored in WhatsApp chats with sales reps, post-op protocols dictated but never tracked. Fracture follow-ups — where the gap between a week-2 and week-6 X-ray determines whether a malunion is forming — are managed through memory and hurried file-flipping. Physiotherapy referrals are written on prescription pads and handed to patients who may or may not ever show up. The result is a practice that runs on clinician memory rather than systems, where follow-ups fall through cracks, implant records are incomplete, and recovery outcomes are never measured because nobody has the time to stitch the data together. Orthopaedic surgeons do not need another generic patient-registration-and-billing tool. They need a system that thinks in imaging series, anatomical timelines, and surgical workflows.',

  statsSection: {
    title: 'The Orthopaedic Landscape in India',
    stats: [
      { value: '200M+', label: 'Indians with musculoskeletal disorders (WHO India)' },
      { value: '200K+', label: 'Knee replacements performed annually, growing 18% YoY' },
      { value: '60-80', label: 'Patients seen daily by a typical orthopaedic surgeon' },
      { value: '<40%', label: 'Physiotherapy adherence rate due to poor follow-up systems' },
    ],
  },

  solutionTitle: 'A Platform That Mirrors the Orthopaedic Clinical Workflow',
  solutionDescription:
    'Doxxy for Orthopaedics replaces fragmented systems with a unified platform that understands the orthopaedic care continuum. Every patient record is anchored to their imaging timeline — pre-injury, post-injury, intra-operative, post-operative, and follow-up series. Surgeons upload X-rays and MRIs directly into the patient chart and compare them side-by-side against prior studies with annotation tools. Fracture cases get automatic follow-up schedules based on fracture type and bone involved. Surgical cases carry embedded pre-op checklists, implant detail templates, and phase-wise post-op protocols that auto-populate physiotherapy session schedules. Range-of-motion measurements, pain scores, and functional assessments are logged at each visit and plotted as trend lines — so recovery, plateau, or regression is visible in a single glance. Physiotherapist referrals are tracked end-to-end: referred, appointment booked, attended, progress note filed. Implant inventory links to surgical records so you always know which patient has which implant, when follow-up imaging is due, and when warranty or revision windows are approaching. Doxxy reduces the cognitive load of orthopaedic practice by turning disconnected data points into a coherent clinical narrative.',

  keyFeatures: [
    {
      icon: 'scan',
      title: 'Imaging Hub with Side-by-Side Comparison',
      description: 'Upload X-rays, MRIs, and CT scans directly to the patient timeline. View any two studies side-by-side — pre-op vs post-op, week-2 vs week-6 — with zoom, pan, and annotation overlays. Auto-tag studies by anatomical region and laterality for instant retrieval.',
    },
    {
      icon: 'calendar',
      title: 'Physiotherapy Scheduler with Progress Tracking',
      description: 'Schedule recurring physiotherapy sessions linked to surgical or fracture protocols. Each session logs ROM measurements, pain VAS scores, and therapist notes. Missed sessions trigger automatic SMS reminders to patients and alerts to the referring surgeon.',
    },
    {
      icon: 'clipboard',
      title: 'Surgical Planning & Implant Registry',
      description: 'Pre-loaded templates for TKR, THR, arthroscopy, and spine procedures with customizable pre-op checklists. Record implant make, model, batch number, and sizing per surgery. Link post-op protocols that auto-schedule follow-ups and physiotherapy.',
    },
    {
      icon: 'bone',
      title: 'Fracture Healing Progress Tracker',
      description: 'Create fracture episodes with type classification (simple, comminuted, open), fixation method, and expected union timeline. Correlate serial X-rays with clinical findings. Flag delayed union or malunion risks based on deviation from expected healing milestones.',
    },
    {
      icon: 'activity',
      title: 'Range-of-Motion & Functional Score Logger',
      description: 'Record goniometer measurements, MMT grades, and standardized scores (Oxford Knee, Harris Hip, DASH, Oswestry) at each visit. Visualize improvement curves overlaid on surgical or injury timelines. Spot plateaus that indicate stalled recovery.',
    },
    {
      icon: 'users',
      title: 'Physiotherapist Referral Network',
      description: 'Maintain a directory of affiliated physiotherapists with specialty tags (sports rehab, post-op, neuro). Generate digital referral letters with diagnosis summary and protocol instructions. Track referral outcomes — scheduled, attended, completed, discharged.',
    },
    {
      icon: 'chartLine',
      title: 'Recovery Timeline & Outcome Analytics',
      description: 'A longitudinal dashboard for each patient showing imaging milestones, ROM progression, pain trend, and functional scores on a single timeline. Surgeon notes and physio reports are threaded chronologically. Generate outcome reports for surgical audit and patient education.',
    },
    {
      icon: 'clock',
      title: 'Trauma Triage & Emergency Worklist',
      description: 'Priority queue for acute trauma walk-ins with injury mechanism, preliminary diagnosis, and imaging status. Sort by urgency (open fracture, dislocation, compartment syndrome risk). Assign to available surgeons and track time-to-treatment metrics.',
    },
  ],

  workflowSteps: [
    {
      step: 1,
      title: 'Patient Registration & Triage',
      description: 'Front desk registers the patient with chief complaint and injury mechanism. For trauma cases, the system flags urgency and surfaces the patient to the top of the surgeon\'s worklist. Previous records and imaging are auto-fetched if the patient is returning.',
    },
    {
      step: 2,
      title: 'Clinical Assessment & Imaging Order',
      description: 'Surgeon documents clinical findings — inspection, palpation, ROM, special tests — using structured orthopaedic examination templates. Imaging orders (X-ray, MRI, CT) are generated digitally and sent to the in-house or partnered radiology unit with clinical context attached.',
    },
    {
      step: 3,
      title: 'Imaging Review & Diagnosis',
      description: 'Radiology uploads images directly to the patient record. Surgeon opens the imaging hub, reviews studies with annotation tools, compares against any prior imaging, and records the diagnosis with ICD-11 coding. Findings are auto-populated into a patient-facing summary.',
    },
    {
      step: 4,
      title: 'Treatment Plan & Surgical Scheduling',
      description: 'For conservative management: prescription, physiotherapy referral, and follow-up schedule are generated. For surgical cases: pre-op checklist is activated, investigations are ordered, implant requirements are noted, and surgery is scheduled with OT slot booking.',
    },
    {
      step: 5,
      title: 'Post-Treatment Recovery & Rehab Tracking',
      description: 'Post-op or post-casting, the recovery protocol activates: physiotherapy sessions are auto-scheduled, ROM measurements are logged at each visit, serial X-rays are compared on the timeline, and progress against expected milestones is tracked with deviation alerts.',
    },
    {
      step: 6,
      title: 'Discharge & Outcome Documentation',
      description: 'When functional goals are met, the surgeon finalizes the episode with outcome scores, discharge summary, and long-term follow-up recommendations. The completed record feeds practice analytics — surgical volumes, complication rates, average recovery timelines, and patient satisfaction scores.',
    },
  ],

  beforeAfterComparisons: [
    {
      area: 'X-ray Retrieval',
      before: 'Searching through folders, CDs, and WhatsApp images to find a patient\'s previous X-ray. Comparing week-2 and week-6 films meant holding physical films up to a light box or switching between phone photos.',
      after: 'Every image lives on the patient timeline, tagged by date, anatomy, and laterality. Pull up any two studies side-by-side in the imaging hub and annotate the comparison directly on screen.',
    },
    {
      area: 'Surgical Planning',
      before: 'Pre-op checklists on loose paper. Implant details scribbled on the OPD slip. Post-op protocols dictated to a junior resident who may or may not enter them in the file. No system to confirm each step was completed.',
      after: 'Surgical template auto-populates pre-op checklist, implant registry fields, and phase-wise post-op protocol. Each checklist item is digitally checked off with timestamp. Implant data is permanently linked to the patient record.',
    },
    {
      area: 'Physiotherapy Coordination',
      before: 'A handwritten physiotherapy referral handed to the patient. No way to know if they attended, what was done, or whether the protocol was followed. Surgeon discovers non-compliance only at the next follow-up — weeks later.',
      after: 'Digital referral sent to affiliated physiotherapist with diagnosis and protocol attached. Appointment scheduling, attendance, and progress notes are tracked in the patient chart. Missed sessions trigger alerts to both therapist and surgeon.',
    },
    {
      area: 'Fracture Follow-Up',
      before: 'Fracture patients given a return date on a piece of paper. No tracking of expected union timelines. Delayed union identified late because no one correlated the serial X-rays systematically. Missed follow-ups lost to attrition.',
      after: 'Fracture episode auto-generates follow-up schedule based on fracture type and fixation method. Expected healing milestones are plotted against actual X-ray and clinical findings. Deviation from normal union curve flags early for intervention.',
    },
    {
      area: 'ROM and Outcome Measurement',
      before: 'Range-of-motion numbers jotted in the file margin — previous readings not referenced. No standardized outcome scoring. Impossible to audit surgical results or show patients objective proof of their progress.',
      after: 'ROM measurements, VAS pain scores, and standardized functional scores logged digitally at each visit and plotted as trend lines. Patients see their recovery curve. Surgeons audit their outcomes with one click.',
    },
    {
      area: 'Implant Tracking',
      before: 'Implant details recorded only in the OT register or the bill. No link between patient record and the specific implant make, model, and batch. Recall or revision queries require searching through paper archives.',
      after: 'Implant registry embedded in the surgical record: make, model, batch number, size, and laterality. Searchable by implant type across all patients. Instant recall capability for implant alerts or revision planning.',
    },
    {
      area: 'Patient Communication',
      before: 'Patients call the clinic to ask when their next physio session is, whether they need a repeat X-ray, or what exercises they should be doing. Staff juggle calls while managing walk-ins.',
      after: 'Automated SMS reminders for appointments, physiotherapy sessions, and follow-up imaging. Patient portal shows their recovery timeline, exercise prescriptions, and upcoming schedule. Clinic calls drop by over 60%.',
    },
    {
      area: 'Practice Analytics',
      before: 'No visibility into surgical volumes, complication rates, average recovery duration, or physio adherence. Practice growth decisions made on gut feel. Impossible to benchmark outcomes or participate in clinical research.',
      after: 'Real-time dashboard showing case volumes by procedure, implant usage, complication rates, average time-to-recovery, referral conversion, and revenue. Export de-identified outcome data for audits, research, and accreditation.',
    },
  ],

  testimonial: {
    quote:
      'Doxxy changed how our entire orthopaedic unit operates. We went from hunting for X-rays in WhatsApp chats to having every image, every ROM reading, and every physio note on a single patient timeline. Our post-op follow-up compliance improved from under 50% to over 85% because the system actively tracks and reminds patients. The implant registry alone has saved us hours during revision planning — we know exactly which implant is in which patient without opening a single file.',
    name: 'Dr. Rajesh Krishnan',
    clinic: 'Krishnan Orthopaedic & Sports Injury Centre',
    city: 'Coimbatore, Tamil Nadu',
    photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop',
  },

  faqs: [
    {
      question: 'How does Doxxy handle X-ray and MRI storage differently from generic EMRs?',
      answer: 'Doxxy structures imaging as a timeline, not a file attachment list. Every image is tagged by anatomical region, laterality, and clinical context (pre-injury, post-injury, intra-op, post-op, follow-up week). This lets surgeons instantly pull up all imaging for a specific joint or compare any two studies side-by-side — essential for fracture follow-up and surgical outcome assessment. DICOM viewer integration is available for practices with PACS systems.',
    },
    {
      question: 'Can I customize the surgical planning templates for my specific procedures?',
      answer: 'Yes. Every surgical template is fully customizable. You can modify pre-op checklists, add procedure-specific implant fields, define phase-wise post-op protocols with weight-bearing status and ROM restrictions, and set auto-scheduling rules for follow-up visits and physiotherapy sessions. Templates ship with common Indian-practice defaults for TKR, THR, arthroscopy, and spine procedures, but you can create unlimited custom templates.',
    },
    {
      question: 'How does the physiotherapy module work with external physiotherapists?',
      answer: 'You maintain a directory of affiliated physiotherapists in your network. When you initiate a physiotherapy referral, Doxxy generates a digital referral letter with the diagnosis, surgical details (if applicable), and the prescribed protocol — ROM goals, weight-bearing status, contraindications. The physiotherapist gets portal access to log session notes and ROM measurements, which flow back into your patient chart. If your physiotherapist does not use Doxxy, they can submit progress updates via a secure web link.',
    },
    {
      question: 'Does the fracture tracker actually predict healing timelines?',
      answer: 'The fracture tracker does not use AI to predict healing — it uses evidence-based expected union timelines based on fracture location, type, patient age, and fixation method. You set the expected milestones (callus formation by week 3, bridging callus by week 6, remodeling by week 12) and the system compares serial X-rays and clinical findings against these benchmarks. Deviations are flagged as alerts, prompting you to investigate for delayed union, non-union, or malunion rather than discovering it late.',
    },
    {
      question: 'What outcome scoring systems are built into the platform?',
      answer: 'Doxxy comes with pre-configured digital forms for the most commonly used orthopaedic outcome scores: Oxford Knee Score, Oxford Shoulder Score, Harris Hip Score, DASH (Disabilities of the Arm, Shoulder and Hand), Oswestry Disability Index, WOMAC, and the Visual Analogue Scale for pain. Scores are calculated automatically and plotted on the patient\'s recovery timeline. You can add custom scoring instruments as needed.',
    },
    {
      question: 'How does implant inventory tracking connect to patient records?',
      answer: 'When you complete a surgical record, the implant section captures manufacturer, model, batch/lot number, size, material, and laterality. This data is searchable across your entire patient base — so if you receive a recall notice for a specific implant batch, you can identify every affected patient in seconds. For revision surgery planning, you can retrieve the exact implant specifications of the primary surgery without digging through OT registers.',
    },
    {
      question: 'Can I use Doxxy for medico-legal documentation and insurance claims?',
      answer: 'Absolutely. Every clinical interaction, imaging review, surgical record, and outcome measurement is timestamped and audit-trailed. Doxxy generates comprehensive discharge summaries and procedure notes that meet Indian insurance and medico-legal documentation standards. The imaging timeline with annotations and the structured outcome data are particularly valuable for MLC (medico-legal case) documentation and personal injury claim assessments.',
    },
    {
      question: 'What about practices that handle both trauma walk-ins and scheduled elective surgeries?',
      answer: 'Doxxy\'s trauma triage worklist is designed specifically for this dual workload. Walk-in trauma patients are flagged by urgency and surfaced to the top of the surgeon\'s queue without disrupting the scheduled elective patient flow. The system tracks time-to-treatment for acute presentations and allows surgeons to toggle between their scheduled list and the emergency worklist. This hybrid workflow is what makes Doxxy suited for the typical Indian orthopaedic practice that handles everything from roadside accidents to planned joint replacements in the same OPD.',
    },
  ],
};

export default config;
