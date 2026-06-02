// Path: config/specialties/dermatology.ts
import type { SpecialtyConfig } from './types';

const config: SpecialtyConfig = {
  slug: 'dermatology',
  specialtyName: 'Dermatology',
  heroTitle: 'Dermatology Practice Management Built for Skin Specialists',
  heroSubtitle:
    'Photo documentation, treatment progress tracking, cosmetic procedure scheduling, and chronic condition management — all in one platform designed for Indian dermatology clinics.',
  problemTitle: 'Why Generic EMR Software Fails Dermatologists',
  problemDescription:
    'Dermatology is a visually driven specialty. Diagnosis hinges on pattern recognition — the shape, colour, border, and evolution of a lesion over time. Yet most clinic management software treats dermatology as an afterthought, offering no more than a generic text field for "complaints" and an unstructured file upload for attachments. A dermatologist seeing 60–80 patients a day in an Indian metro clinic cannot afford to scroll through a flat list of JPEGs named IMG_4729.jpg to find the baseline photo of a melanocytic nevus from six months ago. The workflow breaks down further when managing chronic conditions like psoriasis and atopic dermatitis, where PASI and EASI scores need to be tracked across visits, treatment protocols adjusted, and follow-ups scheduled at precise intervals. Cosmetic dermatology adds another layer of complexity: chemical peels, lasers, fillers, and microneedling each have their own pre-procedure checklists, consent forms, downtime instructions, and post-procedure photo timelines. Biopsy results flow in from external labs and must be matched to the correct lesion, the correct patient, and the correct follow-up action — a process that is manual, error-prone, and medico-legally risky in most clinics. Generic software also ignores the prescription patterns unique to dermatology: combination therapy with a topical (cream/ointment/lotion) plus an oral (antibiotic/retinoid/antihistamine), often with compounding instructions that don\'t fit standard pharmacy templates. Indian dermatologists need software that understands these workflows natively, not a generic EMR with a skin-coloured theme slapped on top.',
  statsSection: {
    title: 'The Dermatology Landscape in India',
    stats: [
      { value: '16,500+', label: 'Practising dermatologists across India' },
      { value: '60–80', label: 'Average patients seen daily in metro clinics' },
      { value: '₹6,200 Cr', label: 'Indian dermatology market size (2025 est.)' },
      { value: '80%', label: 'Of chronic skin patients miss at least one follow-up' },
    ],
  },
  solutionTitle: 'Doxxy for Dermatology: Purpose-Built for Skin Specialists',
  solutionDescription:
    'Doxxy replaces fragmented workflows with a unified dermatology platform. Structured photo documentation with automatic date-tagging and anatomical mapping lets you compare lesion progression side-by-side. Pre-built treatment plan templates for acne, psoriasis, eczema, melasma, and vitiligo standardise care while allowing per-patient customisation. The cosmetic procedure scheduler handles the full lifecycle — consultation, consent, pre-op photos, procedure notes, and automated post-procedure follow-up reminders with photo prompts. Biopsy tracking links each specimen to the exact lesion photograph and body site, flags pending results, and queues follow-up actions automatically. Chronic condition dashboards show upcoming follow-ups, missed appointments, and patients overdue for reassessment. Prescription templates support combination topical-oral therapy with compounding instructions, and every record is built for medico-legal defensibility. This is not a general EMR with dermatology labels — it is a dermatology-first platform.',
  keyFeatures: [
    {
      icon: 'camera',
      title: 'Structured Photo Documentation & Side-by-Side Comparison',
      description:
        'Capture, tag, and organise clinical photographs by body site, lesion type, and date. Compare baseline versus follow-up images in a split-view with measurement overlays. Automatic chronological sorting eliminates the chaos of unstructured photo galleries. Supports dermoscopic and macroscopic image pairs for each lesion.',
    },
    {
      icon: 'microscope',
      title: 'Biopsy & Lab Result Tracking',
      description:
        'Link each biopsy to the exact lesion photograph and anatomical site. Track specimen status from collection to lab dispatch to result receipt. Flag pending and overdue results. Auto-generate follow-up tasks when results arrive — call patient, schedule excision, or mark as benign with one click.',
    },
    {
      icon: 'calendar',
      title: 'Cosmetic Procedure Scheduler',
      description:
        'End-to-end workflow for chemical peels, lasers, fillers, botulinum toxin, microneedling, and PRP. Pre-built checklists capture consent, baseline photography, and contraindication screening. Automated post-procedure instructions sent via WhatsApp. Interval-based follow-up scheduling with photo comparison prompts.',
    },
    {
      icon: 'layout',
      title: 'Treatment Plan Templates by Condition',
      description:
        'Standardised yet customisable protocols for acne (grading-based), psoriasis (PASI-tracked), atopic dermatitis (EASI-tracked), melasma (MASI-tracked), vitiligo, urticaria, fungal infections, and androgenetic alopecia. Each template includes first-line, second-line, and maintenance phases with automatic interval scheduling and severity score capture.',
    },
    {
      icon: 'clock',
      title: 'Chronic Condition Follow-Up Engine',
      description:
        'Dashboard view of all patients on long-term therapy — isotretinoin, methotrexate, biologics, or long-term topicals. Tracks lab monitoring requirements (LFT, lipid profile, pregnancy test for isotretinoin). Automated reminders for overdue follow-ups, expiring prescriptions, and patients due for repeat investigations.',
    },
    {
      icon: 'pill',
      title: 'Dermatology-Specific Prescription Templates',
      description:
        'Templates that understand dermatology prescribing patterns: combination topical-plus-oral therapy, vehicle selection (cream vs ointment vs lotion vs gel), compounding instructions, and site-specific application directions. Built-in isotretinoin prescription workflow with mandatory pregnancy test verification and monthly dispensing limits.',
    },
    {
      icon: 'chartLine',
      title: 'Severity Score Tracking & Clinical Analytics',
      description:
        'Built-in calculators for PASI, EASI, SCORAD, MASI, GAGS, and DLQI. Scores are captured during consultation, plotted longitudinally, and displayed alongside clinical photographs — so both clinician and patient can see objective improvement. Export treatment outcome data for academic publication or insurance prior authorisation.',
    },
    {
      icon: 'messageSquare',
      title: 'Secure Patient Communication & Teledermatology',
      description:
        'HIPAA-compliant messaging for treatment queries, post-procedure concerns, and prescription refill requests. Built-in store-and-forward teledermatology: patients submit photos with standardised questionnaires, which are triaged and queued for asynchronous review. Reduces unnecessary in-person visits while maintaining clinical quality.',
    },
  ],
  workflowSteps: [
    {
      step: 1,
      title: 'Morning Huddle — Review the Day\'s List',
      description:
        'Arrive at 9 AM. Doxxy shows today\'s appointment list with key flags: new vs follow-up, chronic condition patients due for PASI/EASI scoring, post-procedure follow-ups (Day 3 post-peel, Day 7 post-laser), and biopsy results that arrived overnight. Drag to re-prioritise if needed.',
    },
    {
      step: 2,
      title: 'Patient Intake — Structured Chief Complaint with Photos',
      description:
        'Patient checks in. Reception captures chief complaint using dermatology-specific templates (not free text). If it\'s a new lesion, the system prompts for a photograph with a standardised ruler and lighting guide overlay. Previous records, including photos from prior visits, are queued on your screen before you enter the room.',
    },
    {
      step: 3,
      title: 'Consultation — Side-by-Side Photo Review & Scoring',
      description:
        'In the consulting room, you pull up the patient\'s timeline. Baseline photos appear next to today\'s images. You document your examination findings, update the severity score (PASI/EASI/MASI), adjust the treatment plan, and write the prescription — all on one screen. The system flags any overdue lab tests for patients on isotretinoin or methotrexate.',
    },
    {
      step: 4,
      title: 'Procedure Slot — Cosmetic or Surgical',
      description:
        'A 30-minute block for a cosmetic procedure. Doxxy pre-loads the consent form with patient-specific fields filled, shows pre-procedure checklist (pregnancy test verified? NSAIDs stopped? pre-procedure photo taken?), and queues post-procedure instructions for WhatsApp delivery. Procedure notes are templated — you fill in specifics and sign off.',
    },
    {
      step: 5,
      title: 'Post-Consultation — Automated Follow-Up & Billing',
      description:
        'As the patient leaves, Doxxy auto-generates: (a) a digital prescription sent to the patient\'s phone, (b) a follow-up appointment if the treatment plan requires it, (c) a post-procedure instruction sheet if applicable, and (d) billing with procedure and consultation codes mapped to the appropriate fee schedule.',
    },
    {
      step: 6,
      title: 'End of Day — Pending Reviews & Lab Result Queue',
      description:
        'Before logging off, review the pending queue: biopsy results awaiting action, teledermatology consults submitted asynchronously, and patients who missed follow-ups today. Clear each item with a disposition — call patient, reschedule, mark as reviewed. Doxxy generates a daily summary: patients seen, procedures done, revenue collected, pending actions carried forward.',
    },
  ],
  beforeAfterComparisons: [
    {
      area: 'Photo Management',
      before:
        'Photos scattered across phone gallery and WhatsApp forwards, named IMG_4729.jpg with no date, body site, or diagnosis tag. Finding a baseline photo means scrolling through months of images mid-consultation.',
      after:
        'Every photo tagged by body site, lesion type, date, and linked to the patient record. Side-by-side comparison view loads in under a second. Dermoscopic and macroscopic pairs stored together.',
    },
    {
      area: 'Chronic Disease Tracking',
      before:
        'PASI scores scribbled on paper or lost in unstructured progress notes. No longitudinal view of disease activity. Follow-ups scheduled ad hoc, and patients on systemic therapy miss monitoring labs.',
      after:
        'Severity scores captured digitally at every visit and plotted on a graph alongside clinical photos. Lab monitoring reminders fire automatically for isotretinoin, methotrexate, and biologic patients.',
    },
    {
      area: 'Biopsy Workflow',
      before:
        'Biopsy details written on a paper requisition form. No link between the specimen and the lesion photo. Results arrive by email or WhatsApp and must be manually matched to the patient record — a medico-legal grey zone.',
      after:
        'Biopsy record linked to the exact lesion photo and anatomical site. Results are matched automatically when they arrive. Pending results flagged on dashboard. Action queued: call patient or schedule excision.',
    },
    {
      area: 'Cosmetic Procedure Management',
      before:
        'Consent forms printed fresh for every patient. Pre-procedure checklists exist only in the clinician\'s memory. Post-procedure instructions given verbally and forgotten by the patient within hours.',
      after:
        'Digital consent with auto-filled patient details. Mandatory pre-procedure checklist must be signed off before the procedure note can be saved. Post-procedure instructions delivered via WhatsApp with photo-based progress check-ins.',
    },
    {
      area: 'Prescription Writing',
      before:
        'Handwritten or generic EMR prescriptions that can\'t handle combination topical-oral therapy, vehicle selection, or compounding instructions. Isotretinoin prescriptions lack mandatory pregnancy test verification.',
      after:
        'Dermatology-specific prescription templates with vehicle selection, compounding fields, and site-specific directions. Isotretinoin workflow enforces pregnancy test upload and monthly quantity limits before the prescription can be issued.',
    },
    {
      area: 'Teledermatology',
      before:
        'Patients send photos on WhatsApp at all hours. No structured intake, no standardised questionnaires, no triage. Images are compressed, poorly lit, and clinically unusable.',
      after:
        'Store-and-forward teledermatology with standardised photo guides and intake questionnaires. Cases are triaged and queued for asynchronous review during dedicated time blocks. Clinically usable images, structured workflow.',
    },
    {
      area: 'Follow-Up Adherence',
      before:
        '80% of chronic patients miss at least one follow-up. No automated reminder system. Clinic staff manually call patients, which is unsustainable at 60–80 patients per day.',
      after:
        'Automated WhatsApp reminders with personalised messages. Dashboard showing overdue follow-ups, patients lost to follow-up for 3+ months, and high-risk patients (on isotretinoin/biologics) who need priority outreach.',
    },
    {
      area: 'Academic & Audit Readiness',
      before:
        'Data for case studies, audits, and insurance prior authorisation must be manually extracted from paper files and disparate systems. Hours of work for a single case report.',
      after:
        'Structured, queryable clinical data. Export treatment outcomes, severity score trends, and photo timelines with a few clicks. Built for academic dermatology units and clinics pursuing NABH accreditation.',
    },
  ],
  testimonial: {
    quote:
      'Before Doxxy, tracking a psoriasis patient on methotrexate meant juggling a paper file, WhatsApp photos from six months ago, and a mental note to check LFT results. Now, I open the patient timeline, see the PASI trend alongside the photos, check the lab panel, and adjust the dose — all in under two minutes. My clinic sees 70 patients a day, and this platform is the only reason we haven\'t collapsed under the documentation load.',
    name: 'Dr. Anjali Venkatesh',
    clinic: 'Skin360 Dermatology Centre',
    city: 'Bengaluru',
    photo:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop',
  },
  faqs: [
    {
      question: 'How does Doxxy handle photo storage and comparison for dermatology?',
      answer:
        'Doxxy stores photographs as structured clinical data, not generic file attachments. Each image is tagged with the body site (using an anatomical map), lesion type, date, and visit context. The comparison view loads baseline and follow-up images side-by-side with measurement overlays. Images are stored in their original resolution and can be viewed with dermoscopic/macroscopic pairing. Storage is on secure, encrypted servers compliant with Indian data protection requirements.',
    },
    {
      question: 'Does Doxxy support severity scoring for conditions like psoriasis and eczema?',
      answer:
        'Yes. Doxxy includes built-in calculators for PASI (Psoriasis Area and Severity Index), EASI (Eczema Area and Severity Index), SCORAD, MASI (Melasma Area and Severity Index), GAGS (Global Acne Grading System), and DLQI (Dermatology Life Quality Index). Scores are captured during the consultation, stored longitudinally, and plotted on a graph alongside clinical photographs so both clinician and patient can objectively track improvement over time.',
    },
    {
      question: 'How does the biopsy tracking workflow work?',
      answer:
        'When you perform a biopsy, Doxxy creates a digital biopsy record linked to the specific lesion photograph and anatomical site. You can print a requisition form with a barcode for the lab. When results arrive (via lab integration or manual upload), they are automatically matched to the biopsy record. The system flags pending and overdue results on your dashboard and auto-generates the appropriate follow-up action — call the patient for discussion, schedule an excision, or mark the case as benign and closed.',
    },
    {
      question: 'Can Doxxy handle isotretinoin prescription workflows with pregnancy testing?',
      answer:
        'Absolutely. Doxxy has a dedicated isotretinoin prescription workflow that enforces mandatory pregnancy test verification before a prescription can be issued. The system tracks monthly dispensing limits, logs negative pregnancy test results, and blocks the prescription if the test is overdue. It also schedules automated reminders for monthly follow-ups and lab monitoring (LFT, lipid profile) as required by standard isotretinoin monitoring protocols.',
    },
    {
      question: 'Does the cosmetic procedure module support informed consent and post-care instructions?',
      answer:
        'Yes. The cosmetic procedure module covers chemical peels, lasers, botulinum toxin, dermal fillers, microneedling, PRP, and more. Each procedure type has a pre-built digital consent form that auto-fills patient demographics. A mandatory pre-procedure checklist (pregnancy status, medication review, baseline photography) must be completed before the procedure note can be saved. Post-procedure instructions are delivered automatically to the patient via WhatsApp, with photo-based progress check-ins scheduled at Day 1, Day 3, and Day 7 post-procedure.',
    },
    {
      question: 'How does chronic condition follow-up management work?',
      answer:
        'Doxxy maintains a chronic disease registry that tracks every patient on long-term therapy — whether it is topical steroids, systemic agents like methotrexate and cyclosporine, or biologics. The dashboard shows upcoming follow-ups, patients who have missed appointments, and patients overdue for monitoring investigations (blood work, photography, severity scoring). High-risk patients — such as those on immunosuppressants or isotretinoin — are flagged for priority outreach. Automated WhatsApp reminders reduce no-show rates.',
    },
    {
      question: 'Can Doxxy integrate with external labs for biopsy and blood work results?',
      answer:
        'Yes. Doxxy supports lab integration via standard HL7/FHIR interfaces for larger diagnostic chains, as well as manual result upload with automatic matching for smaller independent labs. When a biopsy or blood work result arrives, the system matches it to the correct patient and the correct clinical context (which lesion, which treatment protocol) and surfaces it on your dashboard for review. This eliminates the manual, error-prone process of matching paper or emailed results to patient records.',
    },
    {
      question: 'Is Doxxy suitable for a solo dermatology practice as well as a multi-clinician setup?',
      answer:
        'Yes. Doxxy is designed to scale from a single-dermatologist clinic to a multi-clinician practice with multiple consultation rooms and procedure suites. For solo practitioners, the streamlined workflow handles 60–80 patients a day without administrative overload. For larger setups, role-based access control lets you assign permissions for reception staff, nursing staff (who may capture photos and update scores), junior dermatologists, and the senior consultant. Multi-branch clinics can operate with a unified patient database across locations.',
    },
  ],
};

export default config;
