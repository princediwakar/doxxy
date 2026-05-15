import * as z from "zod";
import {
  zField,
  createEyeField,
  textField,
  getSectionsFromSchema,
  FieldSection,
  NoteFieldConfig
} from "./schemaUtils";

// ============================================================================
// 1. SHARED SUB-SCHEMAS
// ============================================================================

// Exported separately for Phase 1/3 integration
export const medicationSchema = z.object({
  name: z.string().optional(),
  dosage: z.string().optional(),
  route: z.enum(["Oral", "Topical", "IV", "IM", "Eye Drops", "Subcutaneous", "Inhaled"]).optional(),
  frequency: z.enum(["OD", "BD", "TDS", "QID", "PRN", "Q4H", "Q6H", "Q8H", "Q12H", "SOS"]).optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
});

// Vital Signs (Section: Examination)
const vitalSignsSchema = zField(
  z.object({
    temperature: zField(z.string().optional(), { label: "Temperature", type: "input" }),
    pulse: zField(z.string().optional(), { label: "Pulse", type: "input" }),
    blood_pressure_systolic: zField(z.string().optional(), { label: "BP Systolic", type: "input" }),
    blood_pressure_diastolic: zField(z.string().optional(), { label: "BP Diastolic", type: "input" }),
    respiratory_rate: zField(z.string().optional(), { label: "Respiratory Rate", type: "input" }),
    oxygen_saturation: zField(z.string().optional(), { label: "Oxygen Saturation", type: "input" }),
    height: zField(z.string().optional(), { label: "Height", type: "input" }),
    weight: zField(z.string().optional(), { label: "Weight", type: "input" }),
    bmi: zField(z.string().optional(), { label: "BMI", type: "input" }),
  }).optional(),
  { label: "Vital Signs", type: "vital_signs", section: "Examination", placeholder: "Enter vital signs" }
);

// Neurology Sub-Schemas
const motorExaminationSchema = zField(
  z.object({
    shoulder_left: z.string().optional(),
    shoulder_right: z.string().optional(),
    elbow_left: z.string().optional(),
    elbow_right: z.string().optional(),
    wrist_left: z.string().optional(),
    wrist_right: z.string().optional(),
    hip_left: z.string().optional(),
    hip_right: z.string().optional(),
    knee_left: z.string().optional(),
    knee_right: z.string().optional(),
    ankle_left: z.string().optional(),
    ankle_right: z.string().optional(),
    muscle_tone: z.string().optional(),
    muscle_bulk: z.string().optional(),
    involuntary_movements: z.string().optional(),
    coordination: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
  { label: "Motor Examination", type: "motor_examination", section: "Examination", placeholder: "Enter motor examination findings" }
);

const reflexExaminationSchema = zField(
  z.object({
    biceps_left: z.string().optional(),
    biceps_right: z.string().optional(),
    triceps_left: z.string().optional(),
    triceps_right: z.string().optional(),
    supinator_left: z.string().optional(),
    supinator_right: z.string().optional(),
    knee_left: z.string().optional(),
    knee_right: z.string().optional(),
    ankle_left: z.string().optional(),
    ankle_right: z.string().optional(),
    plantar_left: z.string().optional(),
    plantar_right: z.string().optional(),
    abdominal_left: z.string().optional(),
    abdominal_right: z.string().optional(),
    clonus: z.string().optional(),
    hoffmann: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
  { label: "Reflexes", type: "reflex_examination", section: "Examination", placeholder: "Enter reflex findings" }
);

// ============================================================================
// 2. BASE SCHEMA (Applied to all departments)
// ============================================================================

export const baseNotesSchema = z.object({
  // --- HISTORY ---
  chief_complaint: textField("chief_complaint", "Chief Complaint", "History", 3, "Enter chief complaint"),
  history_of_present_illness: textField("history_of_present_illness", "History of Present Illness", "History", 3, "Describe history of present illness"),
  past_medical_history: textField("past_medical_history", "Past Medical History", "History", 3, "List past medical history"),
  family_history: textField("family_history", "Family History", "History", 3, "Enter family history"),
  medications: textField("medications", "Current Medications", "History", 3, "List current medications"),
  allergies: textField("allergies", "Allergies", "History", 2, "List allergies"),

  // --- EXAMINATION ---
  vital_signs: vitalSignsSchema,
  physical_exam: textField("physical_exam", "General Physical Exam", "Examination", 4, "Enter physical exam findings"),
  systemic_examination: textField("systemic_examination", "Systemic Examination", "Examination", 4, "Enter systemic examination findings"),

  // --- PREVIOUS INVESTIGATIONS ---
  previous_investigations: textField("previous_investigations", "Investigations", "Previous Investigations", 3, "Enter investigation results"),

  // --- MANAGEMENT ---
  // Note: 'diagnosis' was in the legacy config but not in the Zod schema. Adding it now.
  diagnosis: textField("diagnosis", "Diagnosis", "Management", 3, "Enter diagnosis"),
  assessment: textField("assessment", "Assessment", "Management", 3, "Enter assessment"),
  planned_investigations: textField("planned_investigations", "Planned Investigations", "Management", 3, "Enter planned investigations"),
  treatment: textField("treatment", "Treatment", "Management", 4, "Describe treatment plan"),
  prescriptions: zField(z.array(medicationSchema).optional(), {
    label: "Prescriptions", section: "Management", type: "prescription", placeholder: "Enter prescriptions"
  }),
  prognosis: textField("prognosis", "Prognosis", "Management", 2, "Enter prognosis"),
  follow_up: textField("follow_up", "Follow-Up Plan", "Management", 2, "Enter follow-up plan"),
  referrals: textField("referrals", "Referrals", "Management", 2, "Enter referrals"),
});

// ============================================================================
// 3. SPECIALTY EXTENSIONS
// ============================================================================

export const generalNotesSchema = baseNotesSchema;

export const ophthalmologyNotesSchema = baseNotesSchema.extend({
  // Visual Function
  visual_acuity: createEyeField("visual_acuity", "Visual Acuity"),
  refraction: createEyeField("refraction", "Refraction"),
  
  // Anterior Segment (Ordered: EOM -> Lids -> Conjunctiva -> Cornea -> AC -> Iris -> Pupil -> Lens -> IOP)
  extraocular_movements: createEyeField("extraocular_movements", "Extraocular Movements"),
  lids: createEyeField("lids", "Lids & Adnexa"),
  conjunctiva: createEyeField("conjunctiva", "Conjunctiva"),
  cornea: createEyeField("cornea", "Cornea"),
  anterior_chamber: createEyeField("anterior_chamber", "Anterior Chamber"),
  iris: createEyeField("iris", "Iris"),
  pupil_examination: createEyeField("pupil_examination", "Pupils"),
  lens: createEyeField("lens", "Lens"),
  slit_lamp_exam: createEyeField("slit_lamp_exam", "Slit Lamp Exam (Summary)"), // Maintained for legacy compat
  intraocular_pressure: createEyeField("intraocular_pressure", "Intraocular Pressure"),

  // Posterior Segment
  fundus_exam: createEyeField("fundus_exam", "Fundus Examination"),
  
  // Single generic eye exam field (legacy fallback)
  eye_examination: createEyeField("eye_examination", "Ocular Examination"),
});

export const neurologyNotesSchema = baseNotesSchema.extend({
  cranial_nerves: textField("cranial_nerves", "Cranial Nerves", "Examination", 4, "Describe cranial nerve examination"),
  motor_examination: motorExaminationSchema,
  sensory_examination: textField("sensory_examination", "Sensory Examination", "Examination", 3, "Describe sensory examination"),
  reflexes: reflexExaminationSchema,
  cerebellar_examination: textField("cerebellar_examination", "Cerebellar Examination", "Examination", 3, "Describe cerebellar examination"),
  gait_coordination: textField("gait_coordination", "Gait & Coordination", "Examination", 3, "Describe gait and coordination"),
  other_examination: textField("other_examination", "Other Examination", "Examination", 3, "Describe other examination findings"),
});

export const cardiologyNotesSchema = baseNotesSchema.extend({
  cardiac_examination: textField("cardiac_examination", "Cardiac Examination", "Examination", 4, "Enter cardiac exam findings"),
  ecg_findings: textField("ecg_findings", "ECG Findings", "Previous Investigations", 3, "Enter ECG results"),
  echocardiogram: textField("echocardiogram", "Echocardiogram", "Previous Investigations", 4, "Describe echocardiogram findings"),
  stress_test: textField("stress_test", "Stress Test", "Previous Investigations", 3, "Enter stress test results"),
  cardiac_catheterization: textField("cardiac_catheterization", "Cardiac Catheterization", "Previous Investigations", 4, "Describe cardiac catheterization"),
  rhythm_assessment: textField("rhythm_assessment", "Rhythm Assessment", "Previous Investigations", 3, "Enter rhythm assessment"),
});

export const dermatologyNotesSchema = baseNotesSchema.extend({
  skin_examination: textField("skin_examination", "Skin Examination", "Examination", 4, "Describe skin examination"),
  lesion_description: textField("lesion_description", "Lesion Description", "Examination", 3, "Describe lesions"),
  dermoscopy_findings: textField("dermoscopy_findings", "Dermoscopy Findings", "Examination", 3, "Enter dermoscopy findings"),
  skin_type: textField("skin_type", "Skin Type", "Examination", 2, "Enter skin type"),
  distribution_pattern: textField("distribution_pattern", "Distribution Pattern", "Examination", 3, "Describe distribution pattern"),
  biopsy_results: textField("biopsy_results", "Biopsy Results", "Previous Investigations", 3, "Enter biopsy results"),
});

export const orthopedicsNotesSchema = baseNotesSchema.extend({
  musculoskeletal_exam: textField("musculoskeletal_exam", "Musculoskeletal Examination", "Examination", 4, "Describe musculoskeletal exam"),
  range_of_motion: textField("range_of_motion", "Range of Motion", "Examination", 3, "Enter range of motion"),
  joint_examination: textField("joint_examination", "Joint Examination", "Examination", 3, "Describe joint examination"),
  stability_tests: textField("stability_tests", "Stability Tests", "Examination", 3, "Enter stability test results"),
  functional_assessment: textField("functional_assessment", "Functional Assessment", "Examination", 3, "Describe functional assessment"),
  imaging_findings: textField("imaging_findings", "Imaging Findings", "Previous Investigations", 3, "Enter imaging findings"),
});

export const psychiatryNotesSchema = baseNotesSchema.extend({
  mental_status_exam: textField("mental_status_exam", "Mental Status Examination", "Examination", 4, "Describe mental status exam"),
  mood_assessment: textField("mood_assessment", "Mood Assessment", "Examination", 3, "Enter mood assessment"),
  cognitive_assessment: textField("cognitive_assessment", "Cognitive Assessment", "Examination", 3, "Enter cognitive assessment"),
  risk_assessment: textField("risk_assessment", "Risk Assessment", "Examination", 3, "Enter risk assessment"),
  psychosocial_factors: textField("psychosocial_factors", "Psychosocial Factors", "Management", 3, "Describe psychosocial factors"),
  therapy_plan: textField("therapy_plan", "Therapy Plan", "Management", 3, "Enter therapy plan"),
});

export const pediatricsNotesSchema = baseNotesSchema.extend({
  developmental_milestones: textField("developmental_milestones", "Developmental Milestones", "History", 3, "Enter developmental milestones"),
  feeding_history: textField("feeding_history", "Feeding History", "History", 3, "Describe feeding history"),
  parental_concerns: textField("parental_concerns", "Parental Concerns", "History", 3, "Enter parental concerns"),
  growth_parameters: textField("growth_parameters", "Growth Parameters", "Examination", 3, "Enter growth parameters"),
  behavioral_assessment: textField("behavioral_assessment", "Behavioral Assessment", "Examination", 3, "Describe behavioral assessment"),
  vaccination_status: textField("vaccination_status", "Vaccination Status", "Management", 3, "Enter vaccination status"),
});

export const entNotesSchema = baseNotesSchema.extend({
  otoscopy: textField("otoscopy", "Otoscopy", "Examination", 3, "Enter otoscopy findings"),
  rhinoscopy: textField("rhinoscopy", "Rhinoscopy", "Examination", 3, "Enter rhinoscopy findings"),
  throat_examination: textField("throat_examination", "Throat Examination", "Examination", 3, "Describe throat examination"),
  nasal_examination: textField("nasal_examination", "Nasal Examination", "Examination", 3, "Describe nasal examination"),
  hearing_assessment: textField("hearing_assessment", "Hearing Assessment", "Examination", 3, "Enter hearing assessment"),
  laryngoscopy: textField("laryngoscopy", "Laryngoscopy", "Examination", 3, "Enter laryngoscopy findings"),
});

export const gynecologyNotesSchema = baseNotesSchema.extend({
  menstrual_history: textField("menstrual_history", "Menstrual History", "History", 3, "Enter menstrual history"),
  obstetric_history: textField("obstetric_history", "Obstetric History", "History", 3, "Enter obstetric history"),
  gynecological_exam: textField("gynecological_exam", "Gynecological Examination", "Examination", 4, "Describe gynecological exam"),
  breast_examination: textField("breast_examination", "Breast Examination", "Examination", 3, "Describe breast examination"),
  pap_smear: textField("pap_smear", "Pap Smear", "Management", 3, "Enter Pap smear results"),
  contraceptive_counseling: textField("contraceptive_counseling", "Contraceptive Counseling", "Management", 3, "Enter contraceptive counseling details"),
});

export const pulmonologyNotesSchema = baseNotesSchema.extend({
  smoking_history: textField("smoking_history", "Smoking History", "History", 3, "Enter smoking history"),
  respiratory_examination: textField("respiratory_examination", "Respiratory Examination", "Examination", 4, "Describe respiratory exam"),
  oxygen_saturation: textField("oxygen_saturation", "Oxygen Saturation", "Examination", 2, "Enter oxygen saturation"),
  spirometry: textField("spirometry", "Spirometry", "Previous Investigations", 3, "Enter spirometry results"),
  chest_imaging: textField("chest_imaging", "Chest Imaging", "Previous Investigations", 3, "Enter chest imaging findings"),
  dyspnea_assessment: textField("dyspnea_assessment", "Dyspnea Assessment", "Previous Investigations", 3, "Describe dyspnea assessment"),
});

export const dentalNotesSchema = baseNotesSchema.extend({
  dental_history: textField("dental_history", "Past Dental History", "History", 3, "Enter past dental history"),
  oral_hygiene_status: textField("oral_hygiene_status", "Oral Hygiene Status", "Examination", 2, "Enter oral hygiene status"),
  extraoral_examination: textField("extraoral_examination", "Extraoral Examination", "Examination", 3, "Describe extraoral examination"),
  intraoral_examination: textField("intraoral_examination", "Intraoral Examination", "Examination", 4, "Describe intraoral examination"),
  tooth_charting: textField("tooth_charting", "Tooth Charting", "Examination", 6, "Enter tooth charting details"),
  radiographic_findings: textField("radiographic_findings", "Radiographic Findings", "Examination", 4, "Enter radiographic findings"),
});

export const urologyNotesSchema = baseNotesSchema.extend({
  urological_exam: textField("urological_exam", "Urological Examination", "Examination", 4, "Describe urological exam"),
  prostate_examination: textField("prostate_examination", "Prostate Examination", "Examination", 3, "Describe prostate examination"),
  bladder_function: textField("bladder_function", "Bladder Function", "Examination", 3, "Enter bladder function details"),
  uroflowmetry: textField("uroflowmetry", "Uroflowmetry", "Previous Investigations", 3, "Enter uroflowmetry results"),
  urinalysis: textField("urinalysis", "Urinalysis", "Previous Investigations", 3, "Enter urinalysis results"),
  imaging_findings: textField("imaging_findings", "Imaging Findings", "Previous Investigations", 3, "Enter imaging findings"),
});

export const endocrinologyNotesSchema = baseNotesSchema.extend({
  endocrine_exam: textField("endocrine_exam", "Endocrine Examination", "Examination", 4, "Describe endocrine exam"),
  thyroid_examination: textField("thyroid_examination", "Thyroid Examination", "Examination", 3, "Describe thyroid examination"),
  glucose_monitoring: textField("glucose_monitoring", "Glucose Monitoring", "Previous Investigations", 3, "Enter glucose monitoring results"),
  hormone_levels: textField("hormone_levels", "Hormone Levels", "Previous Investigations", 3, "Enter hormone level results"),
  metabolic_assessment: textField("metabolic_assessment", "Metabolic Assessment", "Previous Investigations", 3, "Describe metabolic assessment"),
  bone_health: textField("bone_health", "Bone Health", "Previous Investigations", 3, "Enter bone health assessment"),
});

export const emergencyMedicineNotesSchema = baseNotesSchema.extend({
  triage_assessment: textField("triage_assessment", "Triage Assessment", "Examination", 3, "Enter triage assessment"),
  trauma_assessment: textField("trauma_assessment", "Trauma Assessment", "Examination", 4, "Describe trauma assessment"),
  diagnostic_imaging: textField("diagnostic_imaging", "Diagnostic Imaging", "Previous Investigations", 3, "Enter diagnostic imaging results"),
  acute_interventions: textField("acute_interventions", "Acute Interventions", "Previous Investigations", 3, "Describe acute interventions"),
  resuscitation_status: textField("resuscitation_status", "Resuscitation Status", "Management", 3, "Enter resuscitation status"),
});

// ============================================================================
// 4. REGISTRY & BRIDGE (The Legacy Compat Layer)
// ============================================================================

export const schemasByDepartment: Record<string, z.ZodObject<z.ZodRawShape>> = {
  General: generalNotesSchema,
  Ophthalmology: ophthalmologyNotesSchema,
  Neurology: neurologyNotesSchema,
  Cardiology: cardiologyNotesSchema,
  Dermatology: dermatologyNotesSchema,
  Orthopedics: orthopedicsNotesSchema,
  Psychiatry: psychiatryNotesSchema,
  Pediatrics: pediatricsNotesSchema,
  ENT: entNotesSchema,
  Gynecology: gynecologyNotesSchema,
  Pulmonology: pulmonologyNotesSchema,
  Dental: dentalNotesSchema,
  Urology: urologyNotesSchema,
  Endocrinology: endocrinologyNotesSchema,
  EmergencyMedicine: emergencyMedicineNotesSchema,
};

export function getSchemaForDepartment(department: string): z.ZodObject<z.ZodRawShape> {
  return schemasByDepartment[department] ?? generalNotesSchema;
}

// "God Object" schema (Intersection of all possible fields)
// This mirrors the previous implementation where all fields existed on the type
export const consultationNotesSchema = z.object({
  ...generalNotesSchema.shape,
  ...ophthalmologyNotesSchema.shape,
  ...neurologyNotesSchema.shape,
  ...cardiologyNotesSchema.shape,
  ...dermatologyNotesSchema.shape,
  ...orthopedicsNotesSchema.shape,
  ...psychiatryNotesSchema.shape,
  ...pediatricsNotesSchema.shape,
  ...entNotesSchema.shape,
  ...gynecologyNotesSchema.shape,
  ...pulmonologyNotesSchema.shape,
  ...dentalNotesSchema.shape,
  ...urologyNotesSchema.shape,
  ...endocrinologyNotesSchema.shape,
  ...emergencyMedicineNotesSchema.shape,
});

export type ConsultationNotes = z.infer<typeof consultationNotesSchema>;
export type ConsultationMedication = z.infer<typeof medicationSchema>;

const SECTION_ORDER = ["History", "Examination", "Previous Investigations", "Management"] as const;
const SECTION_MAPPING: Record<string, string[]> = Object.fromEntries(
  SECTION_ORDER.map((sec) => [sec, []])
);

// THE BRIDGE: Reconstruct the legacy array format from the Zod Metadata
// This ensures existing UI components work without modification.
export const specialtyFieldSections: Record<string, FieldSection[]> =
  Object.keys(schemasByDepartment).reduce((acc, dept) => {
    acc[dept] = getSectionsFromSchema(schemasByDepartment[dept], { ...SECTION_MAPPING });
    return acc;
  }, {} as Record<string, FieldSection[]>);


// Helper function to get all fields for a specialty (Legacy Compat)
export const getSpecialtyFields = (departmentType: string): NoteFieldConfig[] =>
  (specialtyFieldSections[departmentType] || specialtyFieldSections["General"])
    .flatMap((section) => section.fields);

// Helper function to get mandatory fields
export const getMandatoryFieldsForDepartment = (departmentType: string): string[] =>
  getSpecialtyFields(departmentType)
    .filter((field) => field.mandatory)
    .map((field) => field.name);