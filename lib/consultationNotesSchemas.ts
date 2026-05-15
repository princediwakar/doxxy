// lib/consultationNotesSchemas.ts
import * as z from "zod";
import {
  zField,
  createEyeField,
  textField,
  getSectionsFromSchema,
  type FieldSection,
  type NoteFieldConfig,
} from "./schemaUtils";

// ============================================================================
// 1. SHARED SUB-SCHEMAS
// ============================================================================

// Convert all `.optional()` string fields to `.nullable()` to satisfy Strict JSON Schema requirements natively.
export const medicationSchema = z.object({
  name: z.string().nullable(),
  dosage: z.string().nullable(),
  formulation: z.string().nullable(),
  route: z
    .enum(["Oral", "Topical", "IV", "IM", "Eye Drops", "Subcutaneous", "Inhaled"])
    .nullable(),
  frequency: z
    .enum(["OD", "BD", "TDS", "QID", "PRN", "Q4H", "Q6H", "Q8H", "Q12H", "SOS"])
    .nullable(),
  duration: z.string().nullable(),
  instructions: z.string().nullable(),
});

// Vital Signs (Section: Examination)
const vitalSignsSchema = zField(
  "vital_signs",
  z.object({
    temperature: zField("temperature", z.string().nullable(), { label: "Temperature", type: "input" }),
    pulse: zField("pulse", z.string().nullable(), { label: "Pulse", type: "input" }),
    blood_pressure_systolic: zField("blood_pressure_systolic", z.string().nullable(), { label: "BP Systolic", type: "input" }),
    blood_pressure_diastolic: zField("blood_pressure_diastolic", z.string().nullable(), { label: "BP Diastolic", type: "input" }),
    respiratory_rate: zField("respiratory_rate", z.string().nullable(), { label: "Respiratory Rate", type: "input" }),
    oxygen_saturation: zField("oxygen_saturation", z.string().nullable(), { label: "Oxygen Saturation", type: "input" }),
    height: zField("height", z.string().nullable(), { label: "Height", type: "input" }),
    weight: zField("weight", z.string().nullable(), { label: "Weight", type: "input" }),
    bmi: zField("bmi", z.string().nullable(), { label: "BMI", type: "input" }),
  }).nullable(),
  { label: "Vital Signs", type: "vital_signs", section: "Examination", placeholder: "Enter vital signs" },
);
// Neurology Sub-Schemas
const motorExaminationSchema = zField(
  "motor_examination",
  z.object({
    shoulder_left: z.string().nullable(),
    shoulder_right: z.string().nullable(),
    elbow_left: z.string().nullable(),
    elbow_right: z.string().nullable(),
    wrist_left: z.string().nullable(),
    wrist_right: z.string().nullable(),
    hip_left: z.string().nullable(),
    hip_right: z.string().nullable(),
    knee_left: z.string().nullable(),
    knee_right: z.string().nullable(),
    ankle_left: z.string().nullable(),
    ankle_right: z.string().nullable(),
    muscle_tone: z.string().nullable(),
    muscle_bulk: z.string().nullable(),
    involuntary_movements: z.string().nullable(),
    coordination: z.string().nullable(),
    notes: z.string().nullable(),
  }).nullable(),
  {
    label: "Motor Examination",
    type: "motor_examination",
    section: "Examination",
    placeholder: "Enter motor examination findings",
  },
);

const reflexExaminationSchema = zField(
  "reflexes",
  z.object({
    biceps_left: z.string().nullable(),
    biceps_right: z.string().nullable(),
    triceps_left: z.string().nullable(),
    triceps_right: z.string().nullable(),
    supinator_left: z.string().nullable(),
    supinator_right: z.string().nullable(),
    knee_left: z.string().nullable(),
    knee_right: z.string().nullable(),
    ankle_left: z.string().nullable(),
    ankle_right: z.string().nullable(),
    plantar_left: z.string().nullable(),
    plantar_right: z.string().nullable(),
    abdominal_left: z.string().nullable(),
    abdominal_right: z.string().nullable(),
    clonus: z.string().nullable(),
    hoffmann: z.string().nullable(),
    notes: z.string().nullable(),
  }).nullable(),
  {
    label: "Reflexes",
    type: "reflex_examination",
    section: "Examination",
    placeholder: "Enter reflex findings",
  },
);

// ============================================================================
// 2. BASE SCHEMA (Applied to all departments)
// ============================================================================

export const baseNotesSchema = z.object({
  // --- HISTORY ---
  chief_complaint: textField("chief_complaint", "Chief Complaint", "History", 3, "Enter chief complaint"),
  history_of_present_illness: textField(
    "history_of_present_illness",
    "History of Present Illness",
    "History",
    3,
    "Describe history of present illness",
  ),
  past_medical_history: textField("past_medical_history", "Past Medical History", "History", 3, "List past medical history"),
  family_history: textField("family_history", "Family History", "History", 3, "Enter family history"),
  medications: textField("medications", "Current Medications", "History", 3, "List current medications"),
  allergies: textField("allergies", "Allergies", "History", 2, "List allergies"),

  // --- EXAMINATION ---
  vital_signs: vitalSignsSchema,
  physical_exam: textField("physical_exam", "General Physical Exam", "Examination", 4, "Enter physical exam findings"),
  systemic_examination: textField(
    "systemic_examination",
    "Systemic Examination",
    "Examination",
    4,
    "Enter systemic examination findings",
  ),

  // --- PREVIOUS INVESTIGATIONS ---
  previous_investigations: textField(
    "previous_investigations",
    "Investigations",
    "Previous Investigations",
    3,
    "Enter investigation results",
  ),

  // --- MANAGEMENT ---
  diagnosis: textField("diagnosis", "Primary Diagnosis", "Management", 3, "Enter confirmed diagnosis"),
  differential_diagnosis: zField("differential_diagnosis", z.array(z.string()).nullable(), {
    label: "Differential Diagnosis",
    section: "Management",
    type: "input",
    placeholder: "Enter ruled out or suspected conditions",
  }),
  assessment: textField("assessment", "Assessment", "Management", 3, "Enter clinical reasoning"),
  planned_investigations: textField(
    "planned_investigations",
    "Planned Investigations",
    "Management",
    3,
    "Enter planned investigations",
  ),
  treatment: textField("treatment", "Treatment", "Management", 4, "Describe treatment plan"),
  prescriptions: zField("prescriptions", z.array(medicationSchema).nullable(), {
    label: "Active Prescriptions",
    section: "Management",
    type: "prescription",
    placeholder: "Enter prescriptions",
  }),
  discontinued_medications: zField("discontinued_medications", z.array(z.string()).nullable(), {
    label: "Discontinued / Negated Medications",
    section: "Management",
    type: "input",
    placeholder: "Medications stopped, refused, or changed",
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
  // FIX: createEyeField now forwards `section` (defaults to "Examination"),
  // so all of these fields will appear in the UI. Previously they were all
  // dropped by getSectionsFromSchema because section was undefined.
  visual_acuity: createEyeField("visual_acuity", "Visual Acuity"),
  refraction: createEyeField("refraction", "Refraction"),

  // Anterior Segment
  extraocular_movements: createEyeField("extraocular_movements", "Extraocular Movements"),
  lids: createEyeField("lids", "Lids & Adnexa"),
  conjunctiva: createEyeField("conjunctiva", "Conjunctiva"),
  cornea: createEyeField("cornea", "Cornea"),
  anterior_chamber: createEyeField("anterior_chamber", "Anterior Chamber"),
  iris: createEyeField("iris", "Iris"),
  pupil_examination: createEyeField("pupil_examination", "Pupils"),
  lens: createEyeField("lens", "Lens"),
  slit_lamp_exam: createEyeField("slit_lamp_exam", "Slit Lamp Exam (Summary)"),
  intraocular_pressure: createEyeField("intraocular_pressure", "Intraocular Pressure"),

  // Posterior Segment
  fundus_exam: createEyeField("fundus_exam", "Fundus Examination"),

  // Legacy fallback
  eye_examination: createEyeField("eye_examination", "Ocular Examination"),
});

export const neurologyNotesSchema = baseNotesSchema.extend({
  cranial_nerves: textField("cranial_nerves", "Cranial Nerves", "Examination", 4, "Describe cranial nerve examination"),
  motor_examination: motorExaminationSchema,
  sensory_examination: textField(
    "sensory_examination",
    "Sensory Examination",
    "Examination",
    3,
    "Describe sensory examination",
  ),
  reflexes: reflexExaminationSchema,
  cerebellar_examination: textField(
    "cerebellar_examination",
    "Cerebellar Examination",
    "Examination",
    3,
    "Describe cerebellar examination",
  ),
  gait_coordination: textField(
    "gait_coordination",
    "Gait & Coordination",
    "Examination",
    3,
    "Describe gait and coordination",
  ),
  other_examination: textField(
    "other_examination",
    "Other Examination",
    "Examination",
    3,
    "Describe other examination findings",
  ),
});

export const cardiologyNotesSchema = baseNotesSchema.extend({
  cardiac_examination: textField(
    "cardiac_examination",
    "Cardiac Examination",
    "Examination",
    4,
    "Enter cardiac exam findings",
  ),
  ecg_findings: textField("ecg_findings", "ECG Findings", "Previous Investigations", 3, "Enter ECG results"),
  echocardiogram: textField(
    "echocardiogram",
    "Echocardiogram",
    "Previous Investigations",
    4,
    "Describe echocardiogram findings",
  ),
  stress_test: textField("stress_test", "Stress Test", "Previous Investigations", 3, "Enter stress test results"),
  cardiac_catheterization: textField(
    "cardiac_catheterization",
    "Cardiac Catheterization",
    "Previous Investigations",
    4,
    "Describe cardiac catheterization",
  ),
  rhythm_assessment: textField(
    "rhythm_assessment",
    "Rhythm Assessment",
    "Previous Investigations",
    3,
    "Enter rhythm assessment",
  ),
});

export const dermatologyNotesSchema = baseNotesSchema.extend({
  skin_examination: textField("skin_examination", "Skin Examination", "Examination", 4, "Describe skin examination"),
  lesion_description: textField("lesion_description", "Lesion Description", "Examination", 3, "Describe lesions"),
  dermoscopy_findings: textField(
    "dermoscopy_findings",
    "Dermoscopy Findings",
    "Examination",
    3,
    "Enter dermoscopy findings",
  ),
  skin_type: textField("skin_type", "Skin Type", "Examination", 2, "Enter skin type"),
  distribution_pattern: textField(
    "distribution_pattern",
    "Distribution Pattern",
    "Examination",
    3,
    "Describe distribution pattern",
  ),
  biopsy_results: textField(
    "biopsy_results",
    "Biopsy Results",
    "Previous Investigations",
    3,
    "Enter biopsy results",
  ),
});

export const orthopedicsNotesSchema = baseNotesSchema.extend({
  musculoskeletal_exam: textField(
    "musculoskeletal_exam",
    "Musculoskeletal Examination",
    "Examination",
    4,
    "Describe musculoskeletal exam",
  ),
  range_of_motion: textField("range_of_motion", "Range of Motion", "Examination", 3, "Enter range of motion"),
  joint_examination: textField(
    "joint_examination",
    "Joint Examination",
    "Examination",
    3,
    "Describe joint examination",
  ),
  stability_tests: textField("stability_tests", "Stability Tests", "Examination", 3, "Enter stability test results"),
  functional_assessment: textField(
    "functional_assessment",
    "Functional Assessment",
    "Examination",
    3,
    "Describe functional assessment",
  ),
  imaging_findings: textField(
    "imaging_findings",
    "Imaging Findings",
    "Previous Investigations",
    3,
    "Enter imaging findings",
  ),
});

export const psychiatryNotesSchema = baseNotesSchema.extend({
  mental_status_exam: textField(
    "mental_status_exam",
    "Mental Status Examination",
    "Examination",
    4,
    "Describe mental status exam",
  ),
  mood_assessment: textField("mood_assessment", "Mood Assessment", "Examination", 3, "Enter mood assessment"),
  cognitive_assessment: textField(
    "cognitive_assessment",
    "Cognitive Assessment",
    "Examination",
    3,
    "Enter cognitive assessment",
  ),
  risk_assessment: textField("risk_assessment", "Risk Assessment", "Examination", 3, "Enter risk assessment"),
  psychosocial_factors: textField(
    "psychosocial_factors",
    "Psychosocial Factors",
    "Management",
    3,
    "Describe psychosocial factors",
  ),
  therapy_plan: textField("therapy_plan", "Therapy Plan", "Management", 3, "Enter therapy plan"),
});

export const pediatricsNotesSchema = baseNotesSchema.extend({
  developmental_milestones: textField(
    "developmental_milestones",
    "Developmental Milestones",
    "History",
    3,
    "Enter developmental milestones",
  ),
  feeding_history: textField("feeding_history", "Feeding History", "History", 3, "Describe feeding history"),
  parental_concerns: textField("parental_concerns", "Parental Concerns", "History", 3, "Enter parental concerns"),
  growth_parameters: textField("growth_parameters", "Growth Parameters", "Examination", 3, "Enter growth parameters"),
  behavioral_assessment: textField(
    "behavioral_assessment",
    "Behavioral Assessment",
    "Examination",
    3,
    "Describe behavioral assessment",
  ),
  vaccination_status: textField(
    "vaccination_status",
    "Vaccination Status",
    "Management",
    3,
    "Enter vaccination status",
  ),
});

export const entNotesSchema = baseNotesSchema.extend({
  otoscopy: textField("otoscopy", "Otoscopy", "Examination", 3, "Enter otoscopy findings"),
  rhinoscopy: textField("rhinoscopy", "Rhinoscopy", "Examination", 3, "Enter rhinoscopy findings"),
  throat_examination: textField(
    "throat_examination",
    "Throat Examination",
    "Examination",
    3,
    "Describe throat examination",
  ),
  nasal_examination: textField(
    "nasal_examination",
    "Nasal Examination",
    "Examination",
    3,
    "Describe nasal examination",
  ),
  hearing_assessment: textField(
    "hearing_assessment",
    "Hearing Assessment",
    "Examination",
    3,
    "Enter hearing assessment",
  ),
  laryngoscopy: textField("laryngoscopy", "Laryngoscopy", "Examination", 3, "Enter laryngoscopy findings"),
});

export const gynecologyNotesSchema = baseNotesSchema.extend({
  menstrual_history: textField("menstrual_history", "Menstrual History", "History", 3, "Enter menstrual history"),
  obstetric_history: textField("obstetric_history", "Obstetric History", "History", 3, "Enter obstetric history"),
  gynecological_exam: textField(
    "gynecological_exam",
    "Gynecological Examination",
    "Examination",
    4,
    "Describe gynecological exam",
  ),
  breast_examination: textField(
    "breast_examination",
    "Breast Examination",
    "Examination",
    3,
    "Describe breast examination",
  ),
  pap_smear: textField("pap_smear", "Pap Smear", "Management", 3, "Enter Pap smear results"),
  contraceptive_counseling: textField(
    "contraceptive_counseling",
    "Contraceptive Counseling",
    "Management",
    3,
    "Enter contraceptive counseling details",
  ),
});

export const pulmonologyNotesSchema = baseNotesSchema.extend({
  smoking_history: textField("smoking_history", "Smoking History", "History", 3, "Enter smoking history"),
  respiratory_examination: textField(
    "respiratory_examination",
    "Respiratory Examination",
    "Examination",
    4,
    "Describe respiratory exam",
  ),
  oxygen_saturation: textField("oxygen_saturation", "Oxygen Saturation", "Examination", 2, "Enter oxygen saturation"),
  spirometry: textField("spirometry", "Spirometry", "Previous Investigations", 3, "Enter spirometry results"),
  chest_imaging: textField(
    "chest_imaging",
    "Chest Imaging",
    "Previous Investigations",
    3,
    "Enter chest imaging findings",
  ),
  dyspnea_assessment: textField(
    "dyspnea_assessment",
    "Dyspnea Assessment",
    "Previous Investigations",
    3,
    "Describe dyspnea assessment",
  ),
});

export const dentalNotesSchema = baseNotesSchema.extend({
  dental_history: textField("dental_history", "Past Dental History", "History", 3, "Enter past dental history"),
  oral_hygiene_status: textField(
    "oral_hygiene_status",
    "Oral Hygiene Status",
    "Examination",
    2,
    "Enter oral hygiene status",
  ),
  extraoral_examination: textField(
    "extraoral_examination",
    "Extraoral Examination",
    "Examination",
    3,
    "Describe extraoral examination",
  ),
  intraoral_examination: textField(
    "intraoral_examination",
    "Intraoral Examination",
    "Examination",
    4,
    "Describe intraoral examination",
  ),
  tooth_charting: textField("tooth_charting", "Tooth Charting", "Examination", 6, "Enter tooth charting details"),
  radiographic_findings: textField(
    "radiographic_findings",
    "Radiographic Findings",
    "Examination",
    4,
    "Enter radiographic findings",
  ),
});

export const urologyNotesSchema = baseNotesSchema.extend({
  urological_exam: textField(
    "urological_exam",
    "Urological Examination",
    "Examination",
    4,
    "Describe urological exam",
  ),
  prostate_examination: textField(
    "prostate_examination",
    "Prostate Examination",
    "Examination",
    3,
    "Describe prostate examination",
  ),
  bladder_function: textField("bladder_function", "Bladder Function", "Examination", 3, "Enter bladder function details"),
  uroflowmetry: textField("uroflowmetry", "Uroflowmetry", "Previous Investigations", 3, "Enter uroflowmetry results"),
  urinalysis: textField("urinalysis", "Urinalysis", "Previous Investigations", 3, "Enter urinalysis results"),
  imaging_findings: textField(
    "imaging_findings",
    "Imaging Findings",
    "Previous Investigations",
    3,
    "Enter imaging findings",
  ),
});

export const endocrinologyNotesSchema = baseNotesSchema.extend({
  endocrine_exam: textField("endocrine_exam", "Endocrine Examination", "Examination", 4, "Describe endocrine exam"),
  thyroid_examination: textField(
    "thyroid_examination",
    "Thyroid Examination",
    "Examination",
    3,
    "Describe thyroid examination",
  ),
  glucose_monitoring: textField(
    "glucose_monitoring",
    "Glucose Monitoring",
    "Previous Investigations",
    3,
    "Enter glucose monitoring results",
  ),
  hormone_levels: textField(
    "hormone_levels",
    "Hormone Levels",
    "Previous Investigations",
    3,
    "Enter hormone level results",
  ),
  metabolic_assessment: textField(
    "metabolic_assessment",
    "Metabolic Assessment",
    "Previous Investigations",
    3,
    "Describe metabolic assessment",
  ),
  bone_health: textField(
    "bone_health",
    "Bone Health",
    "Previous Investigations",
    3,
    "Enter bone health assessment",
  ),
});

export const emergencyMedicineNotesSchema = baseNotesSchema.extend({
  triage_assessment: textField(
    "triage_assessment",
    "Triage Assessment",
    "Examination",
    3,
    "Enter triage assessment",
  ),
  trauma_assessment: textField(
    "trauma_assessment",
    "Trauma Assessment",
    "Examination",
    4,
    "Describe trauma assessment",
  ),
  diagnostic_imaging: textField(
    "diagnostic_imaging",
    "Diagnostic Imaging",
    "Previous Investigations",
    3,
    "Enter diagnostic imaging results",
  ),
  acute_interventions: textField(
    "acute_interventions",
    "Acute Interventions",
    "Previous Investigations",
    3,
    "Describe acute interventions",
  ),
  resuscitation_status: textField(
    "resuscitation_status",
    "Resuscitation Status",
    "Management",
    3,
    "Enter resuscitation status",
  ),
});

// ============================================================================
// 4. REGISTRY
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

/**
 * FIX: now logs a warning instead of silently falling back when the department
 * string doesn't match any registered schema. This surfaces typos and missing
 * registrations during development rather than silently using the wrong schema.
 */
export function getSchemaForDepartment(department: string): z.ZodObject<z.ZodRawShape> {
  const schema = schemasByDepartment[department];
  if (!schema) {
    console.warn(
      `[getSchemaForDepartment] Unknown department "${department}". ` +
      `Falling back to General. Register it in schemasByDepartment if this is intentional.`,
    );
  }
  return schema ?? generalNotesSchema;
}

// ============================================================================
// 5. LEGACY COMPAT LAYER
// ============================================================================

const SECTION_ORDER = ["History", "Examination", "Previous Investigations", "Management"] as const;
const SECTION_MAPPING: Record<string, string[]> = Object.fromEntries(
  SECTION_ORDER.map((sec) => [sec, []]),
);

export const specialtyFieldSections: Record<string, FieldSection[]> =
  Object.keys(schemasByDepartment).reduce(
    (acc, dept) => {
      acc[dept] = getSectionsFromSchema(schemasByDepartment[dept], { ...SECTION_MAPPING });
      return acc;
    },
    {} as Record<string, FieldSection[]>,
  );

export const getSpecialtyFields = (departmentType: string): NoteFieldConfig[] =>
  (specialtyFieldSections[departmentType] || specialtyFieldSections["General"]).flatMap(
    (section) => section.fields,
  );

export const getMandatoryFieldsForDepartment = (departmentType: string): string[] =>
  getSpecialtyFields(departmentType)
    .filter((field) => field.mandatory)
    .map((field) => field.name);

// ============================================================================
// 6. TYPES
// ============================================================================

export type ConsultationMedication = z.infer<typeof medicationSchema>;

/**
 * @deprecated Do not use this union type for new features.
 *
 * This merged schema exists only so legacy UI components that reference
 * `ConsultationNotes` continue to compile without modification. Every field
 * from every specialty is optional here, which means TypeScript cannot catch
 * you accessing ophthalmology fields on a cardiology note, or vice versa.
 *
 * For new code: import the specific department schema from `schemasByDepartment`
 * and infer its type with `z.infer<typeof thatSchema>`.
 *
 * Migration plan: audit all usages of ConsultationNotes, replace with the
 * specific inferred type, then delete this export.
 */
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

/** @deprecated See consultationNotesSchema above. */
export type ConsultationNotes = z.infer<typeof consultationNotesSchema>;