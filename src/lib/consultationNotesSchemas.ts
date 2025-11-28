import * as z from "zod";
import { 
  zField, 
  createEyeField, 
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
  chief_complaint: zField(z.string().optional(), {
    label: "Chief Complaint", section: "History", type: "textarea", rows: 3, placeholder: "Enter chief complaint"
  }),
  history_of_present_illness: zField(z.string().optional(), {
    label: "History of Present Illness", section: "History", type: "textarea", rows: 6, placeholder: "Describe history of present illness"
  }),
  past_medical_history: zField(z.string().optional(), {
    label: "Past Medical History", section: "History", type: "textarea", rows: 3, placeholder: "List past medical history"
  }),
  family_history: zField(z.string().optional(), {
    label: "Family History", section: "History", type: "textarea", rows: 3, placeholder: "Enter family history"
  }),
  medications: zField(z.string().optional(), {
    label: "Current Medications", section: "History", type: "textarea", rows: 3, placeholder: "List current medications"
  }),
  allergies: zField(z.string().optional(), {
    label: "Allergies", section: "History", type: "textarea", rows: 2, placeholder: "List allergies"
  }),

  // --- EXAMINATION ---
  vital_signs: vitalSignsSchema,
  physical_exam: zField(z.string().optional(), {
    label: "General Physical Exam", section: "Examination", type: "textarea", rows: 4, placeholder: "Enter physical exam findings"
  }),
  systemic_examination: zField(z.string().optional(), {
    label: "Systemic Examination", section: "Examination", type: "textarea", rows: 4, placeholder: "Enter systemic examination findings"
  }),

  // --- PREVIOUS INVESTIGATIONS ---
  previous_investigations: zField(z.string().optional(), {
    label: "Investigations", section: "Previous Investigations", type: "textarea", rows: 3, placeholder: "Enter investigation results"
  }),

  // --- MANAGEMENT ---
  // Note: 'diagnosis' was in the legacy config but not in the Zod schema. Adding it now.
  diagnosis: zField(z.string().optional(), {
    label: "Diagnosis", section: "Management", type: "textarea", rows: 3, placeholder: "Enter diagnosis"
  }),
  assessment: zField(z.string().optional(), {
    label: "Assessment", section: "Management", type: "textarea", rows: 3, placeholder: "Enter assessment"
  }),
  planned_investigations: zField(z.string().optional(), {
    label: "Planned Investigations", section: "Management", type: "textarea", rows: 3, placeholder: "Enter planned investigations"
  }),
  treatment: zField(z.string().optional(), {
    label: "Treatment", section: "Management", type: "textarea", rows: 4, placeholder: "Describe treatment plan"
  }),
  prescriptions: zField(z.array(medicationSchema).optional(), {
    label: "Prescriptions", section: "Management", type: "prescription", placeholder: "Enter prescriptions"
  }),
  prognosis: zField(z.string().optional(), {
    label: "Prognosis", section: "Management", type: "textarea", rows: 2, placeholder: "Enter prognosis"
  }),
  follow_up: zField(z.string().optional(), {
    label: "Follow-Up Plan", section: "Management", type: "textarea", rows: 2, placeholder: "Enter follow-up plan"
  }),
  referrals: zField(z.string().optional(), {
    label: "Referrals", section: "Management", type: "textarea", rows: 2, placeholder: "Enter referrals"
  }),
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
  cranial_nerves: zField(z.string().optional(), { 
    label: "Cranial Nerves", section: "Examination", type: "textarea", rows: 4, placeholder: "Describe cranial nerve examination" 
  }),
  motor_examination: motorExaminationSchema,
  sensory_examination: zField(z.string().optional(), { 
    label: "Sensory Examination", section: "Examination", type: "textarea", rows: 3, placeholder: "Describe sensory examination" 
  }),
  reflexes: reflexExaminationSchema,
  cerebellar_examination: zField(z.string().optional(), { 
    label: "Cerebellar Examination", section: "Examination", type: "textarea", rows: 3, placeholder: "Describe cerebellar examination" 
  }),
  gait_coordination: zField(z.string().optional(), { 
    label: "Gait & Coordination", section: "Examination", type: "textarea", rows: 3, placeholder: "Describe gait and coordination" 
  }),
  other_examination: zField(z.string().optional(), { 
    label: "Other Examination", section: "Examination", type: "textarea", rows: 3, placeholder: "Describe other examination findings" 
  }),
});

export const cardiologyNotesSchema = baseNotesSchema.extend({
  cardiac_examination: zField(z.string().optional(), { 
    label: "Cardiac Examination", section: "Examination", type: "textarea", rows: 4, placeholder: "Enter cardiac exam findings" 
  }),
  ecg_findings: zField(z.string().optional(), { 
    label: "ECG Findings", section: "Previous Investigations", type: "textarea", rows: 3, placeholder: "Enter ECG results" 
  }),
  echocardiogram: zField(z.string().optional(), { 
    label: "Echocardiogram", section: "Previous Investigations", type: "textarea", rows: 4, placeholder: "Describe echocardiogram findings" 
  }),
  stress_test: zField(z.string().optional(), { 
    label: "Stress Test", section: "Previous Investigations", type: "textarea", rows: 3, placeholder: "Enter stress test results" 
  }),
  cardiac_catheterization: zField(z.string().optional(), { 
    label: "Cardiac Catheterization", section: "Previous Investigations", type: "textarea", rows: 4, placeholder: "Describe cardiac catheterization" 
  }),
  rhythm_assessment: zField(z.string().optional(), { 
    label: "Rhythm Assessment", section: "Previous Investigations", type: "textarea", rows: 3, placeholder: "Enter rhythm assessment" 
  }),
});

export const dermatologyNotesSchema = baseNotesSchema.extend({
  skin_examination: zField(z.string().optional(), { 
    label: "Skin Examination", section: "Examination", type: "textarea", rows: 4, placeholder: "Describe skin examination" 
  }),
  lesion_description: zField(z.string().optional(), { 
    label: "Lesion Description", section: "Examination", type: "textarea", rows: 3, placeholder: "Describe lesions" 
  }),
  dermoscopy_findings: zField(z.string().optional(), { 
    label: "Dermoscopy Findings", section: "Examination", type: "textarea", rows: 3, placeholder: "Enter dermoscopy findings" 
  }),
  skin_type: zField(z.string().optional(), { 
    label: "Skin Type", section: "Examination", type: "textarea", rows: 2, placeholder: "Enter skin type" 
  }),
  distribution_pattern: zField(z.string().optional(), { 
    label: "Distribution Pattern", section: "Examination", type: "textarea", rows: 3, placeholder: "Describe distribution pattern" 
  }),
  biopsy_results: zField(z.string().optional(), { 
    label: "Biopsy Results", section: "Previous Investigations", type: "textarea", rows: 3, placeholder: "Enter biopsy results" 
  }),
});

export const orthopedicsNotesSchema = baseNotesSchema.extend({
  musculoskeletal_exam: zField(z.string().optional(), { 
    label: "Musculoskeletal Examination", section: "Examination", type: "textarea", rows: 4, placeholder: "Describe musculoskeletal exam" 
  }),
  range_of_motion: zField(z.string().optional(), { 
    label: "Range of Motion", section: "Examination", type: "textarea", rows: 3, placeholder: "Enter range of motion" 
  }),
  joint_examination: zField(z.string().optional(), { 
    label: "Joint Examination", section: "Examination", type: "textarea", rows: 3, placeholder: "Describe joint examination" 
  }),
  stability_tests: zField(z.string().optional(), { 
    label: "Stability Tests", section: "Examination", type: "textarea", rows: 3, placeholder: "Enter stability test results" 
  }),
  functional_assessment: zField(z.string().optional(), { 
    label: "Functional Assessment", section: "Examination", type: "textarea", rows: 3, placeholder: "Describe functional assessment" 
  }),
  imaging_findings: zField(z.string().optional(), { 
    label: "Imaging Findings", section: "Previous Investigations", type: "textarea", rows: 3, placeholder: "Enter imaging findings" 
  }),
});

export const psychiatryNotesSchema = baseNotesSchema.extend({
  mental_status_exam: zField(z.string().optional(), { 
    label: "Mental Status Examination", section: "Examination", type: "textarea", rows: 4, placeholder: "Describe mental status exam" 
  }),
  mood_assessment: zField(z.string().optional(), { 
    label: "Mood Assessment", section: "Examination", type: "textarea", rows: 3, placeholder: "Enter mood assessment" 
  }),
  cognitive_assessment: zField(z.string().optional(), { 
    label: "Cognitive Assessment", section: "Examination", type: "textarea", rows: 3, placeholder: "Enter cognitive assessment" 
  }),
  risk_assessment: zField(z.string().optional(), { 
    label: "Risk Assessment", section: "Examination", type: "textarea", rows: 3, placeholder: "Enter risk assessment" 
  }),
  psychosocial_factors: zField(z.string().optional(), { 
    label: "Psychosocial Factors", section: "Management", type: "textarea", rows: 3, placeholder: "Describe psychosocial factors" 
  }),
  therapy_plan: zField(z.string().optional(), { 
    label: "Therapy Plan", section: "Management", type: "textarea", rows: 3, placeholder: "Enter therapy plan" 
  }),
});

export const pediatricsNotesSchema = baseNotesSchema.extend({
  developmental_milestones: zField(z.string().optional(), { 
    label: "Developmental Milestones", section: "History", type: "textarea", rows: 3, placeholder: "Enter developmental milestones" 
  }),
  feeding_history: zField(z.string().optional(), { 
    label: "Feeding History", section: "History", type: "textarea", rows: 3, placeholder: "Describe feeding history" 
  }),
  parental_concerns: zField(z.string().optional(), { 
    label: "Parental Concerns", section: "History", type: "textarea", rows: 3, placeholder: "Enter parental concerns" 
  }),
  growth_parameters: zField(z.string().optional(), { 
    label: "Growth Parameters", section: "Examination", type: "textarea", rows: 3, placeholder: "Enter growth parameters" 
  }),
  behavioral_assessment: zField(z.string().optional(), { 
    label: "Behavioral Assessment", section: "Examination", type: "textarea", rows: 3, placeholder: "Describe behavioral assessment" 
  }),
  vaccination_status: zField(z.string().optional(), { 
    label: "Vaccination Status", section: "Management", type: "textarea", rows: 3, placeholder: "Enter vaccination status" 
  }),
});

export const entNotesSchema = baseNotesSchema.extend({
  otoscopy: zField(z.string().optional(), { 
    label: "Otoscopy", section: "Examination", type: "textarea", rows: 3, placeholder: "Enter otoscopy findings" 
  }),
  rhinoscopy: zField(z.string().optional(), { 
    label: "Rhinoscopy", section: "Examination", type: "textarea", rows: 3, placeholder: "Enter rhinoscopy findings" 
  }),
  throat_examination: zField(z.string().optional(), { 
    label: "Throat Examination", section: "Examination", type: "textarea", rows: 3, placeholder: "Describe throat examination" 
  }),
  nasal_examination: zField(z.string().optional(), { 
    label: "Nasal Examination", section: "Examination", type: "textarea", rows: 3, placeholder: "Describe nasal examination" 
  }),
  hearing_assessment: zField(z.string().optional(), { 
    label: "Hearing Assessment", section: "Examination", type: "textarea", rows: 3, placeholder: "Enter hearing assessment" 
  }),
  laryngoscopy: zField(z.string().optional(), { 
    label: "Laryngoscopy", section: "Examination", type: "textarea", rows: 3, placeholder: "Enter laryngoscopy findings" 
  }),
});

export const gynecologyNotesSchema = baseNotesSchema.extend({
  menstrual_history: zField(z.string().optional(), { 
    label: "Menstrual History", section: "History", type: "textarea", rows: 3, placeholder: "Enter menstrual history" 
  }),
  obstetric_history: zField(z.string().optional(), { 
    label: "Obstetric History", section: "History", type: "textarea", rows: 3, placeholder: "Enter obstetric history" 
  }),
  gynecological_exam: zField(z.string().optional(), { 
    label: "Gynecological Examination", section: "Examination", type: "textarea", rows: 4, placeholder: "Describe gynecological exam" 
  }),
  breast_examination: zField(z.string().optional(), { 
    label: "Breast Examination", section: "Examination", type: "textarea", rows: 3, placeholder: "Describe breast examination" 
  }),
  pap_smear: zField(z.string().optional(), { 
    label: "Pap Smear", section: "Management", type: "textarea", rows: 3, placeholder: "Enter Pap smear results" 
  }),
  contraceptive_counseling: zField(z.string().optional(), { 
    label: "Contraceptive Counseling", section: "Management", type: "textarea", rows: 3, placeholder: "Enter contraceptive counseling details" 
  }),
});

export const pulmonologyNotesSchema = baseNotesSchema.extend({
  smoking_history: zField(z.string().optional(), { 
    label: "Smoking History", section: "History", type: "textarea", rows: 3, placeholder: "Enter smoking history" 
  }),
  respiratory_examination: zField(z.string().optional(), { 
    label: "Respiratory Examination", section: "Examination", type: "textarea", rows: 4, placeholder: "Describe respiratory exam" 
  }),
  oxygen_saturation: zField(z.string().optional(), { 
    label: "Oxygen Saturation", section: "Examination", type: "textarea", rows: 2, placeholder: "Enter oxygen saturation" 
  }),
  spirometry: zField(z.string().optional(), { 
    label: "Spirometry", section: "Previous Investigations", type: "textarea", rows: 3, placeholder: "Enter spirometry results" 
  }),
  chest_imaging: zField(z.string().optional(), { 
    label: "Chest Imaging", section: "Previous Investigations", type: "textarea", rows: 3, placeholder: "Enter chest imaging findings" 
  }),
  dyspnea_assessment: zField(z.string().optional(), { 
    label: "Dyspnea Assessment", section: "Previous Investigations", type: "textarea", rows: 3, placeholder: "Describe dyspnea assessment" 
  }),
});

export const dentalNotesSchema = baseNotesSchema.extend({
  dental_history: zField(z.string().optional(), { 
    label: "Past Dental History", section: "History", type: "textarea", rows: 3, placeholder: "Enter past dental history" 
  }),
  oral_hygiene_status: zField(z.string().optional(), { 
    label: "Oral Hygiene Status", section: "Examination", type: "textarea", rows: 2, placeholder: "Enter oral hygiene status" 
  }),
  extraoral_examination: zField(z.string().optional(), { 
    label: "Extraoral Examination", section: "Examination", type: "textarea", rows: 3, placeholder: "Describe extraoral examination" 
  }),
  intraoral_examination: zField(z.string().optional(), { 
    label: "Intraoral Examination", section: "Examination", type: "textarea", rows: 4, placeholder: "Describe intraoral examination" 
  }),
  tooth_charting: zField(z.string().optional(), { 
    label: "Tooth Charting", section: "Examination", type: "textarea", rows: 6, placeholder: "Enter tooth charting details" 
  }),
  radiographic_findings: zField(z.string().optional(), { 
    label: "Radiographic Findings", section: "Examination", type: "textarea", rows: 4, placeholder: "Enter radiographic findings" 
  }),
});

export const urologyNotesSchema = baseNotesSchema.extend({
  urological_exam: zField(z.string().optional(), { 
    label: "Urological Examination", section: "Examination", type: "textarea", rows: 4, placeholder: "Describe urological exam" 
  }),
  prostate_examination: zField(z.string().optional(), { 
    label: "Prostate Examination", section: "Examination", type: "textarea", rows: 3, placeholder: "Describe prostate examination" 
  }),
  bladder_function: zField(z.string().optional(), { 
    label: "Bladder Function", section: "Examination", type: "textarea", rows: 3, placeholder: "Enter bladder function details" 
  }),
  uroflowmetry: zField(z.string().optional(), { 
    label: "Uroflowmetry", section: "Previous Investigations", type: "textarea", rows: 3, placeholder: "Enter uroflowmetry results" 
  }),
  urinalysis: zField(z.string().optional(), { 
    label: "Urinalysis", section: "Previous Investigations", type: "textarea", rows: 3, placeholder: "Enter urinalysis results" 
  }),
  imaging_findings: zField(z.string().optional(), { 
    label: "Imaging Findings", section: "Previous Investigations", type: "textarea", rows: 3, placeholder: "Enter imaging findings" 
  }),
});

export const endocrinologyNotesSchema = baseNotesSchema.extend({
  endocrine_exam: zField(z.string().optional(), { 
    label: "Endocrine Examination", section: "Examination", type: "textarea", rows: 4, placeholder: "Describe endocrine exam" 
  }),
  thyroid_examination: zField(z.string().optional(), { 
    label: "Thyroid Examination", section: "Examination", type: "textarea", rows: 3, placeholder: "Describe thyroid examination" 
  }),
  glucose_monitoring: zField(z.string().optional(), { 
    label: "Glucose Monitoring", section: "Previous Investigations", type: "textarea", rows: 3, placeholder: "Enter glucose monitoring results" 
  }),
  hormone_levels: zField(z.string().optional(), { 
    label: "Hormone Levels", section: "Previous Investigations", type: "textarea", rows: 3, placeholder: "Enter hormone level results" 
  }),
  metabolic_assessment: zField(z.string().optional(), { 
    label: "Metabolic Assessment", section: "Previous Investigations", type: "textarea", rows: 3, placeholder: "Describe metabolic assessment" 
  }),
  bone_health: zField(z.string().optional(), { 
    label: "Bone Health", section: "Previous Investigations", type: "textarea", rows: 3, placeholder: "Enter bone health assessment" 
  }),
});

export const emergencyMedicineNotesSchema = baseNotesSchema.extend({
  triage_assessment: zField(z.string().optional(), { 
    label: "Triage Assessment", section: "Examination", type: "textarea", rows: 3, placeholder: "Enter triage assessment" 
  }),
  trauma_assessment: zField(z.string().optional(), { 
    label: "Trauma Assessment", section: "Examination", type: "textarea", rows: 4, placeholder: "Describe trauma assessment" 
  }),
  diagnostic_imaging: zField(z.string().optional(), { 
    label: "Diagnostic Imaging", section: "Previous Investigations", type: "textarea", rows: 3, placeholder: "Enter diagnostic imaging results" 
  }),
  acute_interventions: zField(z.string().optional(), { 
    label: "Acute Interventions", section: "Previous Investigations", type: "textarea", rows: 3, placeholder: "Describe acute interventions" 
  }),
  resuscitation_status: zField(z.string().optional(), { 
    label: "Resuscitation Status", section: "Management", type: "textarea", rows: 3, placeholder: "Enter resuscitation status" 
  }),
});

// ============================================================================
// 4. REGISTRY & BRIDGE (The Legacy Compat Layer)
// ============================================================================

const schemasByDepartment: Record<string, z.ZodObject<z.ZodRawShape>> = {
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

// THE BRIDGE: Reconstruct the legacy array format from the Zod Metadata
// This ensures existing UI components work without modification.
export const specialtyFieldSections: Record<string, FieldSection[]> = 
  Object.keys(schemasByDepartment).reduce((acc, dept) => {
    // Define the valid sections and their order for this department
    const sectionOrder = [
      "History", 
      "Examination", 
      "Previous Investigations", 
      "Management"
    ];
    
    // Map section names to an empty array to seed the order
    const sectionMapping = sectionOrder.reduce((map, sec) => ({ ...map, [sec]: [] }), {});

    // Use the bridge function to extract fields and group them
    acc[dept] = getSectionsFromSchema(schemasByDepartment[dept], sectionMapping);
    return acc;
  }, {} as Record<string, FieldSection[]>);


// Helper function to get all fields for a specialty (Legacy Compat)
export const getSpecialtyFields = (departmentType: string): NoteFieldConfig[] =>
  (specialtyFieldSections[departmentType] || specialtyFieldSections["General"])
    .flatMap((section) => section.fields);

// Legacy field configs map
export const specialtyNoteFieldConfigs: Record<string, NoteFieldConfig[]> =
  Object.keys(specialtyFieldSections).reduce(
    (acc, key) => ({ ...acc, [key]: getSpecialtyFields(key) }),
    {} as Record<string, NoteFieldConfig[]>
  );

// Helper function to get mandatory fields
export const getMandatoryFieldsForDepartment = (departmentType: string): string[] =>
  getSpecialtyFields(departmentType)
    .filter((field) => field.mandatory)
    .map((field) => field.name);