// Path: config/specialties/ent.ts
import type { SpecialtyConfig } from './types';

const config: SpecialtyConfig = {
  slug: 'ent',
  specialtyName: 'ENT',
  heroTitle: 'Ear, Nose, and Throat — One System, Every Subsymptom Tracked',
  heroSubtitle: 'From audiometry to sinus endoscopy, Doxxy gives ENT surgeons a structured workflow that understands the interconnected anatomy of the head and neck — no more adapting general-purpose software.',
  problemTitle: 'Why Generic Clinic Software Cannot Handle the Breadth of ENT',
  problemDescription:
    'ENT is not a single organ system — it spans otology, rhinology, laryngology, head and neck surgery, and paediatric ENT, each with its own diagnostic instruments, documentation patterns, and surgical workflows. A generic EMR forces an ENT surgeon to document a tympanogram result in a generic "lab result" field, an endoscopy image in an unstructured "attachment" section, and an audiogram in free text — losing all structure needed for longitudinal comparison. An ENT surgeon performing 50-70 consultations daily in an Indian city needs clinical templates that work at the speed of the OPD, not a click-heavy, multi-screen workflow built for internal medicine. Audiometry — the most common investigation in ENT — generates frequency-specific air and bone conduction thresholds that must be trended over time, especially in patients with noise-induced hearing loss, otosclerosis, or Meniere\'s disease. A generic system has no concept of an audiogram, let alone left-ear versus right-ear frequency-by-frequency trend comparison. Sinus surgery follow-ups require protocolized assessment: endoscopic visualization of the middle meatus, crusting and synechiae evaluation, and a Lund-Kennedy endoscopic scoring system that no generic EMR supports. Allergy testing generates large panels of results that need structured storage and cross-referencing with patient symptoms. Vertigo assessment — a core ENT competency — demands specific positional test templates (Dix-Hallpike, supine roll) and documentation of nystagmus direction, latency, and fatiguability. Voice disorder patients need stroboscopy findings, VHI-10 scores, and speech therapy progress notes tracked over multiple sessions. Without specialty-specific structure, ENT surgeons spend more time fighting their software than treating patients — and follow-up protocols for conditions like chronic otitis media and allergic rhinitis become impossible to audit systematically.',

  statsSection: {
    title: 'ENT Care in India: The Numbers Behind the Need',
    stats: [
      { value: '63M+', label: 'Indians suffer from significant hearing loss (WHO estimate)' },
      { value: '~30%', label: 'of India\'s urban population has allergic rhinitis' },
      { value: '50-70', label: 'Average daily consultations for a busy ENT surgeon' },
      { value: '1 in 8', label: 'Indians over 40 have disabling hearing loss' },
    ],
  },

  solutionTitle: 'A Unified ENT Platform That Speaks Your Clinical Language',
  solutionDescription:
    'Doxxy replaces fragmented documentation with an ENT-native clinical workspace. Audiometry data is captured as structured, frequency-specific thresholds per ear — not as a scanned PDF. Our endoscopy module lets you annotate images with arrows and text labels, attach them to the encounter, and compare them visit-over-visit to assess post-surgical healing. Sinus surgery follow-ups use a built-in Lund-Kennedy scoring template. Allergy test results are stored as structured panels, with the ability to cross-reference aeroallergens and food allergens against the patient\'s symptom diary. Vertigo assessments follow evidence-based templates: Dix-Hallpike, supine roll test, and Epley manoeuvre documentation. Voice disorder tracking links stroboscopy findings, VHI-10 scores, and speech therapy progress across sessions. All of this works within a workflow that matches how an Indian ENT OPD actually runs — high volume, procedure-heavy, and requiring crisp documentation that does not slow the surgeon down.',

  keyFeatures: [
    {
      icon: 'waveform',
      title: 'Structured Audiometry & Trend Engine',
      description:
        'Record pure-tone audiometry thresholds (air and bone conduction) at 250 Hz through 8 kHz for each ear. Doxxy plots frequency-by-frequency audiograms and tracks threshold shifts over serial tests — critical for monitoring noise-induced hearing loss, ototoxicity, and presbycusis progression.',
    },
    {
      icon: 'camera',
      title: 'Endoscopy Image Capture with Annotations',
      description:
        'Capture images from your nasal endoscope, otoscope, or laryngoscope directly into the patient encounter. Annotate findings with arrows, circles, and free-text labels directly on the image. Compare pre-operative and post-operative views side-by-side to objectively assess surgical outcomes.',
    },
    {
      icon: 'calendar',
      title: 'Sinus Surgery Follow-Up Scheduler',
      description:
        'Post-FESS follow-ups follow a protocol, not ad-hoc booking. Doxxy auto-schedules the standard sequence (Week 1, Week 2, Month 1, Month 3) when a surgery is marked complete. Each visit includes a Lund-Kennedy endoscopic scoring template to quantify polyp burden, oedema, discharge, crusting, and scarring.',
    },
    {
      icon: 'tablet',
      title: 'Allergy Test Result Manager',
      description:
        'Document skin prick test results for aeroallergens (dust mites, pollens, moulds) and food allergens in structured panels. Doxxy maps allergen reactivity against patient-reported symptoms and generates a correlation table. Track immunotherapy progress with visit-linked symptom scores to assess treatment efficacy objectively.',
    },
    {
      icon: 'brain',
      title: 'Vertigo Assessment Templates',
      description:
        'Structured templates for Dix-Hallpike, supine roll test, and head impulse test. Document nystagmus direction, latency, duration, and fatiguability with anatomical precision (geotropic vs. ageotropic, right-beating vs. left-beating). Record Epley or Semont manoeuvre performed and immediate post-manoeuvre response.',
    },
    {
      icon: 'messageSquare',
      title: 'Voice Disorder & Stroboscopy Tracker',
      description:
        'Capture stroboscopy findings — mucosal wave symmetry, glottic closure pattern, amplitude, and periodicity. Track VHI-10 (Voice Handicap Index) scores across speech therapy sessions to quantify functional improvement. Link each session to specific therapeutic interventions (resonant voice therapy, Lee Silverman, etc.).',
    },
    {
      icon: 'ear',
      title: 'Otology & Chronic Ear Disease Monitor',
      description:
        'Document otoscopic findings with tympanic membrane quadrant mapping (pars tensa perforation location, retraction pocket depth, cholesteatoma extent). Link audiometry, tympanometry, and imaging findings to create a complete disease profile. Surgical waiting list prioritization based on complication risk (facial nerve proximity, labyrinthine fistula).',
    },
    {
      icon: 'pill',
      title: 'Tonsillitis & Adenoid Assessment Module',
      description:
        'Grade tonsil size (Brodsky 1-4), document Friedman tongue position, and record adenoid hypertrophy with endoscopic visualization. Link to sleep-disordered breathing questionnaires (paediatric PSQ). Track recurrent tonsillitis episode frequency against Paradise criteria to support evidence-based surgical decision-making.',
    },
  ],

  workflowSteps: [
    {
      step: 1,
      title: 'Triage & Symptom History',
      description:
        'Patient checks in and the ENT-specific symptom questionnaire captures chief complaint, laterality, duration, and associated symptoms (for ear complaints: hearing loss, tinnitus, vertigo, otorrhoea; for nasal: obstruction, discharge, anosmia, facial pain; for throat: dysphagia, hoarseness, globus). The history is pre-populated for the surgeon\'s review.',
    },
    {
      step: 2,
      title: 'Audiometry & Diagnostic Workup',
      description:
        'For otology patients, the audiologist performs pure-tone audiometry and tympanometry. Results are entered as frequency-specific thresholds per ear. For nasal patients, a diagnostic nasal endoscopy is performed and key frames are captured. Allergy patients receive skin prick testing with results recorded per allergen. All diagnostic data flows into the encounter before the surgeon enters the room.',
    },
    {
      step: 3,
      title: 'Surgeon Consultation & Examination',
      description:
        'The ENT surgeon reviews the pre-loaded data: audiogram trends, endoscopy images, and allergy panels on a single screen. The examination proceeds systematically — otoscopy with tympanic membrane assessment, anterior rhinoscopy or nasal endoscopy, oral cavity and oropharyngeal exam, and indirect laryngoscopy. Findings are recorded by anatomical subsite using structured picklists.',
    },
    {
      step: 4,
      title: 'Specialty-Specific Assessment & Procedure',
      description:
        'For vertigo patients: the Dix-Hallpike test is performed and results documented with nystagmus characteristics. If positive for BPPV, the Epley manoeuvre is performed and recorded. For voice patients: stroboscopy is conducted and findings captured. For sinusitis patients: Lund-Kennedy scoring is completed. Minor procedures like cerumen removal, nasal packing removal, or intratympanic injection are documented with procedural notes.',
    },
    {
      step: 5,
      title: 'Treatment Plan, Prescription & Counselling',
      description:
        'The surgeon finalizes the diagnosis and treatment plan. Medications are prescribed with anatomical specificity (e.g., "ciprofloxacin ear drops — right ear, 3 drops TID for 7 days"). Surgical consent is initiated for patients requiring tonsillectomy, septoplasty, FESS, or tympanoplasty. Patient education handouts on post-operative care, nasal irrigation technique, or hearing aid use are generated.',
    },
    {
      step: 6,
      title: 'Surgery Scheduling & Long-Term Follow-Up',
      description:
        'For surgical cases: OT slot is booked with equipment requirements auto-populated (microscope, endoscope tower, microdebrider). Post-operative appointments are auto-scheduled based on the procedure type. For chronic conditions like allergic rhinitis or Meniere\'s disease: follow-up intervals are set and automated recall reminders are queued. The patient receives an SMS with the follow-up date and any pre-visit instructions (e.g., "please bring your hearing aid for reprogramming").',
    },
  ],

  beforeAfterComparisons: [
    {
      area: 'Audiometry Documentation',
      before:
        'Audiograms are printed on thermal paper and stapled to the file. The paper fades in 6 months. Serial comparison requires manually overlaying old audiograms against new ones — the surgeon squints at tiny frequency labels while patients queue up outside.',
      after:
        'Every audiogram is stored as structured data — air and bone conduction thresholds by frequency and ear. The trend view overlays the last 5 audiograms on a single interactive chart. A 10 dB threshold shift at 4 kHz is instantly flagged. Noise-induced hearing loss progression is caught before it becomes disabling.',
    },
    {
      area: 'Sinus Surgery Follow-Up',
      before:
        'Post-FESS patients are told "come back in a week." No system tracks whether they actually return. Endoscopy findings are scribbled in a note. There is no objective comparison of pre-op versus post-op endoscopic appearance. Surgeons rely on memory to gauge healing.',
      after:
        'FESS follow-ups are auto-scheduled on a protocol timetable. Each visit includes a Lund-Kennedy endoscopic score. Side-by-side endoscopy images from surgery day and follow-up visits show granulation tissue resolution, polyp recurrence, and middle meatus patency. Objective healing metrics replace subjective impressions.',
    },
    {
      area: 'Allergy Testing & Immunotherapy Tracking',
      before:
        'Skin prick test results are recorded on a paper grid. The grid is filed in the patient chart and never cross-referenced with symptoms. Immunotherapy progress is documented as "patient says they feel better" — with no quantitative symptom score to validate the claim.',
      after:
        'Allergen reactivity is stored in structured panels. Doxxy cross-references the patient\'s symptom diary (nasal obstruction score, sneezing frequency, eye itch) against allergen exposure seasons. Immunotherapy visits track a symptom severity score that trends downward as treatment progresses — objective proof of efficacy for both doctor and patient.',
    },
    {
      area: 'Vertigo Assessment & BPPV Management',
      before:
        'Dix-Hallpike findings are written as a free-text sentence: "positive on right with torsional nystagmus." There is no structured documentation of latency, duration, fatiguability, or the exact canal involved. When the patient returns 6 months later with recurrent vertigo, the original assessment details are lost.',
      after:
        'The Dix-Hallpike template captures nystagmus direction (geotropic vs. ageotropic, right-beating vs. left-beating), latency in seconds, duration, and fatiguability. The affected semicircular canal (posterior, horizontal, or anterior) is algorithmically suggested based on nystagmus characteristics. The Epley or barbecue roll manoeuvre performed is recorded. Recurrence can be compared against the index episode with full detail preserved.',
    },
    {
      area: 'Voice Disorder Management',
      before:
        'Stroboscopy videos are saved on the laryngoscope\'s local hard drive — disconnected from the patient record. VHI-10 questionnaires are handed out on paper and never scored systematically. Speech therapy progress is anecdotally tracked. There is no way to prove functional improvement to the patient or to an insurance panel.',
      after:
        'Stroboscopy images and videos attach to the patient encounter with time-stamped findings. VHI-10 scores are collected at each visit and plotted on a trend line. Speech therapy session notes are linked to the care plan. When a professional voice user asks "am I getting better?", you have a graph that answers the question.',
    },
    {
      area: 'Tonsillitis Episode Tracking',
      before:
        'A child with recurrent tonsillitis visits the OPD each time with fever and sore throat. Each episode is documented as an isolated acute visit. There is no running count of episodes per year. The surgeon relies on parental recall to decide if Paradise criteria for tonsillectomy are met — parents almost always overestimate frequency.',
      after:
        'Every episode of documented tonsillitis is date-stamped and counted. The patient dashboard shows episodes per year, fever documentation, and antibiotic courses. When the count crosses the Paradise threshold (7 in 1 year, 5/year for 2 years, or 3/year for 3 years), the system flags the patient as a surgical candidate with evidence attached.',
    },
    {
      area: 'Chronic Suppurative Otitis Media Monitoring',
      before:
        'A CSOM patient visits every few months with ear discharge. Each visit generates a new note with no link to prior episodes. The surgeon cannot easily see whether the perforation is enlarging, whether the discharge has changed character, or how many episodes have occurred this year — all of which inform the decision between conservative management and tympanoplasty.',
      after:
        'Each CSOM episode is linked to the patient\'s chronic ear disease record. Otoscopy images show perforation size and location over time. Audiometry trends reveal whether the conductive hearing loss is stable or worsening. The surgical decision — and its documentation for insurance pre-authorization — is supported by a complete, chronologically organized data set.',
    },
    {
      area: 'Post-Operative Complication Surveillance',
      before:
        'A patient develops a septal haematoma 3 days after septoplasty. They go to the emergency department of a different hospital because the original surgeon\'s clinic has no system for tracking post-op complications. The primary surgeon learns about it only if the patient chooses to return.',
      after:
        'Post-operative surveillance is active, not passive. Automated SMS check-ins ask patients about bleeding, pain, and fever at 24 and 72 hours post-surgery. Any red-flag response generates an alert that prompts a callback from the clinic. Complications are caught early, managed promptly, and documented in the surgical outcome registry for quality improvement.',
    },
  ],

  testimonial: {
    quote:
      'As an otologist, my entire clinical decision-making depends on audiometry trends. Before Doxxy, I was literally holding old audiogram printouts up to the light to compare them with new ones. Now the trend engine plots five audiograms over time with a click. The endoscopy image annotation alone is worth the switch — I can mark the exact location of a retraction pocket and compare it six months later to see if it has deepened. This is the ENT EMR I have wanted for fifteen years.',
    name: 'Dr. Meera Rajagopalan',
    clinic: 'Swaram ENT Hospital',
    city: 'Chennai',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop',
  },

  faqs: [
    {
      question: 'Can Doxxy import audiometry data directly from our diagnostic audiometer?',
      answer:
        'Yes. Doxxy supports direct data import from most clinical audiometers — including Interacoustics, Madsen, Maico, and Grason-Stadler devices — via USB serial or network export. The audiogram is parsed into structured, frequency-specific air and bone conduction thresholds for each ear and stored in the patient record. For clinics using older standalone audiometers without data export, our manual entry interface is optimized for speed: tab through frequencies, enter thresholds with number keys, and a complete bilateral audiogram is recorded in under 90 seconds.',
    },
    {
      question: 'How does the endoscopy annotation tool work, and does it slow down my OPD?',
      answer:
        'The annotation tool is designed for speed during a live OPD. Connect your endoscope camera via USB or HDMI capture card, and the video feed appears in the patient encounter screen. Tap the foot pedal or press the spacebar to freeze and capture a frame. Tap on the image to add an arrow, or drag to circle a region of interest. Most surgeons add 1-3 annotated frames per endoscopy, which takes under 20 seconds total. The images are saved with the encounter — no file naming, no folder management, no post-clinic cleanup.',
    },
    {
      question: 'Does Doxxy support paediatric ENT workflows specifically?',
      answer:
        'Yes. Paediatric ENT has dedicated templates that account for age-specific norms: paediatric audiometry (visual reinforcement audiometry and play audiometry results), age-adjusted tonsil grading, adenoid hypertrophy assessment with nasopharyngoscopy images, speech and language delay evaluation, and paediatric sleep-disordered breathing questionnaires. The system also supports growth-chart-relative documentation (e.g., "tonsils are 3+ relative to a narrow paediatric oropharynx"). Separate paediatric surgical consent templates are available with parent-friendly language.',
    },
    {
      question: 'Can I use Doxxy for multiple procedures in the same surgical session (e.g., tonsillectomy + adenoidectomy + grommet insertion)?',
      answer:
        'Absolutely. Doxxy\'s surgical scheduler allows you to add multiple procedure codes to a single OT booking. The OT list for the day will display all planned procedures. Each procedure has its own post-operative care protocol, and Doxxy intelligently merges them: for a T+A with grommets, you get the tonsillectomy follow-up schedule plus a reminder to perform post-operative audiometry at 6 weeks to confirm grommet patency. Equipment checklists auto-populate with all required instruments across procedures.',
    },
    {
      question: 'How does the vertigo module differentiate between BPPV, vestibular neuritis, and Meniere\'s templates?',
      answer:
        'The vertigo module offers diagnosis-specific templates. Select BPPV and the screen pre-loads Dix-Hallpike and supine roll test fields with canal-specific nystagmus descriptors. Select Meniere\'s and the template adds audio-vestibular profiling: low-frequency hearing fluctuation tracking, tinnitus character documentation, aural fullness rating, and definitive vertigo episode frequency with duration. Select vestibular neuritis and the head impulse test and caloric test fields open. All templates share a common vestibular examination library (Romberg, Unterberger, dynamic visual acuity) so there is no duplicated documentation.',
    },
    {
      question: 'Does Doxxy integrate with hearing aid fitting software or hearing aid vendor platforms?',
      answer:
        'While Doxxy does not directly program hearing aids, we generate a structured audiological summary that can be exported as a PDF or HL7 message for hearing aid dispensers and audiologists. The summary includes pure-tone audiogram, speech discrimination scores, tympanometry results, and the ENT surgeon\'s recommendation. For clinics with in-house audiology services, the hearing aid trial and fitting follow-up can be scheduled within Doxxy, creating a closed loop between the ENT diagnosis and audiological rehabilitation.',
    },
    {
      question: 'Can Doxxy handle the high patient volume in a government or charitable ENT hospital setting?',
      answer:
        'Yes. Doxxy was built with the Indian clinic reality in mind, including high-volume OPDs. The interface is optimized for keyboard-first data entry — tab across fields, use number keys for grading scales, and complete a routine ENT consultation in under 4 minutes of screen time. The system runs on standard hardware and tolerates intermittent internet connectivity (offline queue mode with sync when back online). For charitable hospitals, we offer subsidized pricing, and the NPCBVI and NPPCD (National Programme for Prevention and Control of Deafness) reporting modules are included at no additional cost.',
    },
    {
      question: 'How does Doxxy handle surgical audit and outcome tracking for ENT procedures?',
      answer:
        'Every surgical procedure is logged with procedure code (aligned with the Indian Standard Treatment Guidelines), surgeon, date, and outcome metrics specific to the procedure. For tympanoplasty: graft uptake status at 3 months. For FESS: Lund-Kennedy score pre-op and at 3 and 6 months post-op. For tonsillectomy: post-operative haemorrhage rate and readmission status. The surgical audit dashboard aggregates outcomes by surgeon and procedure type, enabling morbidity and mortality review meetings to be data-driven rather than anecdotal. The data is exportable for NABH accreditation submissions.',
    },
  ],
};

export default config;
