// Path: config/specialties/pediatrics.ts

import type { SpecialtyConfig } from './types';

const config: SpecialtyConfig = {
  slug: 'pediatrics',
  specialtyName: 'Pediatrics',

  heroTitle: 'Pediatric Clinic Software That Understands Growing Children',
  heroSubtitle: 'Purpose-built for pediatricians: digital growth charts with WHO/IAP percentiles, IAP vaccination scheduler with WhatsApp parent reminders, weight-based dose calculator, and family-linked records — so you can focus on the child, not the paperwork.',

  problemTitle: 'Why Generic Clinic Software Fails Pediatricians',
  problemDescription: `Running a pediatric practice is fundamentally different from running any other clinic. Your patients don't stay the same size — they grow, and every consultation must be interpreted against an ever-changing baseline of weight, height, head circumference, and developmental stage. Generic EMRs treat every visit as a blank slate, forcing you to manually pull up last month's weight, mentally calculate percentiles, and cross-reference vaccination cards that parents inevitably forget to bring.

Growth charting is the central diagnostic tool in pediatrics, yet most software either omits it entirely or offers a static image you cannot plot against. Indian pediatricians need both WHO standards (for children under 5) and IAP (Indian Academy of Pediatrics) charts for older children — a nuance no off-the-shelf system handles. Vaccination scheduling is another minefield: the IAP schedule differs from the government's Universal Immunization Programme, catch-up doses have complex interval rules, and parents need reminders via a channel they actually check — which in India means WhatsApp, not email. Missed vaccines lead to anxious phone calls from parents, wasted chair time, and preventable disease outbreaks.

Weight-based dosing adds a layer of risk absent in adult medicine. A 2 kg error in recording a child's weight can mean a 20% dosing error. Manual calculations at the end of a 60-patient OPD are where mistakes happen. Then there is the administrative tangle: siblings share family history, allergies, and vaccination preferences, but generic software forces you to re-enter everything for each child. Parents expect you to remember that their older child had a febrile seizure at 9 months or that the family prefers certain vaccine brands — context that should be linked, not lost.

Generic software treats your pediatric clinic like it's a scaled-down adult practice. It's not. It's a completely different clinical paradigm, and it deserves software built from that understanding.`,

  statsSection: {
    title: 'Pediatric Healthcare in India — By the Numbers',
    stats: [
      { value: '27M+', label: 'Annual births requiring immunization tracking in India' },
      { value: '~60K', label: 'Pediatricians serving a population of 450M+ children' },
      { value: '60%+', label: 'Parents who miss scheduled vaccines due to reminder gaps' },
      { value: '3x', label: 'Faster growth assessment with digital WHO/IAP percentile charts' },
      { value: '50-100', label: 'Average daily OPD for a busy Indian pediatrician' },
      { value: '20%', label: 'Dosing errors attributable to manual weight-based calculations' },
    ],
  },

  solutionTitle: 'A Pediatric EMR That Grows With Your Patients',
  solutionDescription: 'Doxxy for Pediatrics replaces the chaos of paper growth charts, forgotten vaccination cards, and mental arithmetic with a single system that knows every child in your practice — their growth trajectory, their immunisation status, their sibling connections, and exactly what they need at today\'s visit. Built around IAP and WHO standards, with WhatsApp-first parent communication.',

  keyFeatures: [
    {
      icon: 'chartLine',
      title: 'Digital Growth Charts — WHO & IAP Standards',
      description: 'Plot weight, height, head circumference, and BMI against WHO (0-5 years) and IAP (5-18 years) percentiles automatically. Historical growth trajectory displayed as an overlay on every visit. Catch growth faltering, obesity trends, and failure-to-thrive at a glance — no ruler, no graph paper, no manual plotting.',
    },
    {
      icon: 'syringe',
      title: 'IAP Vaccination Scheduler with WhatsApp Reminders',
      description: 'Full IAP and UIP (Universal Immunization Programme) schedules built in, with automatic catch-up dose calculations when a child misses a window. Parents receive WhatsApp reminders 7 days, 3 days, and 1 day before each scheduled vaccine. Batch number, expiry, and site logged per dose for medicolegal compliance.',
    },
    {
      icon: 'pill',
      title: 'Weight-Based Dose Calculator',
      description: "Enter the child's weight (auto-populated from the last recorded measurement) and get exact mg/kg dosing for 2,000+ pediatric formulations — syrups, drops, suspensions, and tablets. Built-in safety alerts for maximum single-dose and daily-dose limits. Eliminates the most common source of pediatric prescribing errors.",
    },
    {
      icon: 'users',
      title: 'Family-Linked Patient Records',
      description: 'Link siblings and parents into a single family unit. Allergies, adverse vaccine reactions, family medical history, and brand preferences flow across linked records. When an older sibling had a reaction to a particular vaccine, the younger sibling\'s chart flags it automatically. No more re-entering family history for every child.',
    },
    {
      icon: 'baby',
      title: 'Developmental Milestone Tracker',
      description: 'Age-appropriate milestone checklists (gross motor, fine motor, language, social) from the IAP and CDC guidelines, presented at each well-child visit. Missed or delayed milestones are flagged and trended over time. Generates a parent-friendly milestone report with clear "what to expect next" guidance.',
    },
    {
      icon: 'thermometer',
      title: 'Fever & Acute Illness Visit Templates',
      description: 'Rapid SOAP-note templates optimized for the 8-minute pediatric consult: fever without focus, acute gastroenteritis, URTI, bronchiolitis, and 20+ common presentations. Auto-populates growth parameters, vaccination status, and sibling illness history. Pre-built differential diagnosis checklists reduce cognitive load during a packed OPD.',
    },
    {
      icon: 'messageSquare',
      title: 'WhatsApp-First Parent Communication',
      description: 'Share prescriptions, vaccine certificates, growth charts, and follow-up instructions directly to the parent\'s WhatsApp. Two-way messaging with automatic language detection (English, Hindi, and 8 Indian languages). Parents can reply with symptom updates that attach directly to the child\'s record. No app download required for the parent.',
    },
    {
      icon: 'shield',
      title: 'Immunization Certificate & School Health Forms',
      description: 'Generate IAP-compliant immunization certificates with a single click, complete with batch numbers, administering doctor, and clinic stamp. School admission health forms pre-filled from the child\'s record. Exportable as PDF or shareable via WhatsApp link. Medico-legally sound documentation that satisfies school and travel requirements.',
    },
  ],

  workflowSteps: [
    {
      step: 1,
      title: 'Morning OPD Prep — Know What\'s Coming',
      description: 'Arrive at the clinic, open Doxxy, and see today\'s dashboard: 47 appointments, 12 vaccinations due today, and 5 children overdue for their 9-month developmental screen. The system has already sent WhatsApp reminders to parents whose appointments are in the next 2 hours. One glance tells you which rooms are booked, which vaccine vials need to be taken out of cold storage, and which children need longer consultation slots.',
    },
    {
      step: 2,
      title: 'Patient Check-In — The Family Context Loads Instantly',
      description: 'The receptionist searches by parent phone number and the entire family unit appears: siblings Riya (6 years) and Arjun (4 months). Arjun is here for his 14-week vaccines. His record already shows birth weight (2.9 kg), Riya\'s history of egg allergy (flagged on Arjun\'s chart), and the family\'s preference for the painless DTaP formulation. No one asks the parent the same questions twice.',
    },
    {
      step: 3,
      title: 'Consultation — Growth Plotting Is Automatic',
      description: 'The nurse records Arjun\'s weight (6.1 kg) and length (62 cm). Doxxy instantly plots both on the WHO percentile chart and overlays the trend from his 10-week visit. He\'s tracking along the 50th percentile — no concerns. You open the developmental milestone checklist for 14 weeks: social smile, head control, cooing — all check. The parent sees the growth chart on your tablet and understands immediately. No explaining a paper graph.',
    },
    {
      step: 4,
      title: 'Vaccination — Batch Logging, Next Dose, Reminder — All in One Step',
      description: 'You select DTaP-Hib-IPV dose 2 from Arjun\'s schedule. Scan the vial barcode and the batch number and expiry auto-populate. Site: right anterolateral thigh. The system calculates the next dose date (18 weeks from now), adds it to the schedule, and queues a WhatsApp reminder series. The immunisation certificate updates in real time — the parent receives it on WhatsApp before they\'ve left the clinic.',
    },
    {
      step: 5,
      title: 'Prescribing — Weight-Based, Safety-Checked',
      description: 'A 3-year-old presents with fever and cough. Weight: 14 kg (auto-populated from last visit). You select paracetamol syrup — the system calculates 210 mg (15 mg/kg), shows the volume in mL for the 250 mg/5 mL formulation, and flags the maximum daily dose. Prescription is generated in your selected format, printed for the parent, and sent to their WhatsApp. Total time from chief complaint to printed prescription: under 3 minutes.',
    },
    {
      step: 6,
      title: 'End of Day — Nothing Falls Through the Cracks',
      description: 'The day-end dashboard shows: 54 consults completed, 12 vaccines administered, 3 children overdue for follow-up, and 2 abnormal growth trends flagged for review. Tomorrow\'s vaccine cold-storage checklist is auto-generated. The clinic\'s monthly immunization performance report is ready for the government health portal upload. You leave knowing every child\'s record is complete and every parent has their reminders.',
    },
  ],

  beforeAfterComparisons: [
    {
      area: 'Growth Charting',
      before: 'Manually plot weight and height on paper WHO charts with a ruler. Previous measurements scattered across old case sheets. Percentile crossing missed until it\'s severe.',
      after: 'Auto-plotted digital growth charts with WHO/IAP percentiles. Full historical trend overlaid on every visit. Faltering growth flagged automatically with colour-coded alerts.',
    },
    {
      area: 'Vaccination Tracking',
      before: 'Parents forget vaccination cards. Staff manually calculate next dose dates on a paper calendar. Catch-up schedules require phone calls to senior colleagues. No systematic reminder system.',
      after: 'Digital IAP/UIP schedule with auto-calculated catch-up doses. Parents receive 3 WhatsApp reminders per vaccine. Batch numbers logged via barcode scan. Immunisation certificates generated instantly.',
    },
    {
      area: 'Dose Calculation',
      before: 'Mental arithmetic or calculator app for every prescription. Misreading a weight by 1-2 kg leads to under/overdosing. No safety check on maximum daily limits for combination formulations.',
      after: 'Auto-populated weight from last recorded measurement. Instant mg/kg calculation with mL conversion for the specific formulation. Hard stops on maximum single-dose and daily-dose limits.',
    },
    {
      area: 'Family History',
      before: 'Re-enter allergic history, birth details, and family medical conditions for every sibling. Older sibling\'s adverse vaccine reaction recorded in a separate file, easily missed.',
      after: 'Single family unit record. Allergies, vaccine reactions, and family history propagate across siblings automatically. Chart flags appear when relevant history exists for any linked family member.',
    },
    {
      area: 'Developmental Screening',
      before: 'Ask parents "is everything normal?" with no structured checklist. Missed delays documented only when the child is visibly behind at 2-3 years of age.',
      after: 'Age-specific IAP/CDC milestone checklist at every well-child visit. Delayed milestones flagged and trended. Parent-friendly milestone report with age-appropriate "red flag" guidance generated automatically.',
    },
    {
      area: 'Parent Communication',
      before: 'Parents call the clinic to ask about vaccine dates, lose paper prescriptions, and forget follow-up appointments. Staff spend hours on phone calls that should be automated.',
      after: 'WhatsApp-first communication: prescription sharing, vaccine reminders, follow-up scheduling, and two-way symptom reporting. Parents engage through a channel they already use daily. Staff phone time drops by 70%.',
    },
    {
      area: 'Prescription Workflow',
      before: 'Handwrite every prescription. No quick access to the child\'s last weight or allergy list. Parents lose paper copies. Refill requests require pulling the physical file.',
      after: 'Pre-filled prescription templates with current weight, allergies, and growth parameters. Print, share via WhatsApp, or email. Digital prescription history searchable in seconds.',
    },
    {
      area: 'Medicolegal Documentation',
      before: 'Vaccine batch numbers scribbled in a register. Immunisation certificates handwritten on letterhead. Incomplete records create liability during adverse event investigations.',
      after: 'Barcode-scanned batch numbers, expiry dates, and administration sites logged per dose. IAP-compliant certificates generated with full traceability. Audit-ready records for government reporting and medicolegal defence.',
    },
  ],

  testimonial: {
    quote: 'Doxxy replaced three different registers and four file cabinets in my pediatric clinic. The growth chart plotting alone saves me 2-3 minutes per child — over a 60-patient OPD, that\'s nearly 3 hours saved every day. But the real value is that I never miss a vaccination reminder anymore. Parents tell me this is the most organized clinic they\'ve ever visited.',
    name: 'Dr. Rajesh Iyer',
    clinic: 'Little Stars Children\'s Clinic',
    city: 'Chennai',
    photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop',
  },

  faqs: [
    {
      question: 'Does Doxxy support both WHO and IAP growth charts?',
      answer: 'Yes. Doxxy includes WHO growth standards for children 0-5 years (weight-for-age, length/height-for-age, weight-for-length/height, head circumference, and BMI-for-age) and IAP 2015 growth charts for children 5-18 years. You select which standard to use, and the system automatically switches based on the child\'s age. Percentiles are computed and plotted in real time, and any crossing of major percentile lines is flagged for clinical review.',
    },
    {
      question: 'How does the vaccination scheduler handle catch-up doses?',
      answer: 'When a child misses a scheduled vaccine, Doxxy automatically calculates the minimum interval before the next dose can be administered, based on IAP and WHO catch-up guidelines. For example, if a child misses the 10-week DTaP dose and presents at 14 weeks, the system calculates the corrected schedule for dose 2 and adjusts all subsequent doses accordingly. It also accounts for accelerated schedules (e.g., for travel) and live vaccine spacing rules.',
    },
    {
      question: 'Can parents access their child\'s records through an app?',
      answer: 'Parents do not need to download a separate app. All communication — growth charts, prescriptions, vaccine certificates, appointment reminders, and follow-up instructions — is sent directly to their WhatsApp. They can reply with text updates or photos (e.g., a rash or a thermometer reading) that attach to the child\'s record. This WhatsApp-first design was chosen specifically because Indian parents use WhatsApp universally, eliminating the friction of app installation and account creation.',
    },
    {
      question: 'How does family-linking work across siblings?',
      answer: 'All patients registered under the same parent phone number are automatically grouped into a family unit. Shared attributes — allergies, adverse drug reactions, family medical history (asthma, atopy, epilepsy, congenital conditions), vaccine brand preferences, and insurance details — propagate across all linked children. When you open any sibling\'s chart, relevant flags from other family members are displayed. You can also add extended family members (grandparents, cousins) when genetic conditions need to be tracked.',
    },
    {
      question: 'Does the dose calculator account for different formulations of the same drug?',
      answer: 'Yes. The calculator contains India-specific formulations from major manufacturers. When you select a drug, it displays available strengths (e.g., paracetamol 125 mg/5 mL, 250 mg/5 mL, and 250 mg suppositories) and calculates the precise volume or number of units based on the child\'s weight. It enforces both mg/kg single-dose limits and mg/kg/day maximum limits. For combination formulations, it cross-checks the paracetamol component to prevent accidental overdose when multiple paracetamol-containing medications are prescribed.',
    },
    {
      question: 'What milestone assessment tools are included?',
      answer: 'Doxxy includes milestone checklists aligned with IAP and CDC guidelines for ages 2 weeks through 5 years, covering gross motor, fine motor, language/communication, social/emotional, and cognitive domains. Each checklist is age-appropriate — a 9-month visit shows different items than a 3-year visit. The system flags delayed milestones (red flags) and generates a trend graph showing whether a child is catching up, staying on track, or falling further behind. A parent-facing milestone guide is automatically generated after each visit.',
    },
    {
      question: 'Can Doxxy generate reports for government immunization portals?',
      answer: 'Yes. Doxxy generates immunization performance reports in formats compatible with the Ministry of Health and Family Welfare\'s reporting requirements, including the National Health Mission (NHM) MIS formats. Monthly vaccine utilization summaries, coverage rates by antigen, dropout tracking (BCG to measles), and cold chain inventory reports can be exported with a single click. This eliminates the manual compilation work that typically consumes hours of staff time each month.',
    },
    {
      question: 'How does Doxxy handle a very high-volume pediatric OPD?',
      answer: 'Doxxy is built for Indian OPD volumes — we tested it in clinics seeing 80-120 children per day during peak season. The rapid SOAP note templates auto-populate vitals, growth parameters, and vaccination status, so you start each consultation with a pre-filled note rather than a blank page. The interface is keyboard-navigable for speed, prescription templates are selectable in two clicks, and vaccine batch scanning takes under 3 seconds. We\'ve benchmarked the system to add less than 30 seconds of screen time per consultation for a proficient user.',
    },
  ],
};

export default config;
