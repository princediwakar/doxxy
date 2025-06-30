// src/lib/consultationNotesSchemas.ts
import * as z from "zod";

// Medication schema for prescriptions
const consultationMedicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().optional(),
  route: z.enum(["Oral", "Topical", "IV", "IM", "Eye Drops", "Subcutaneous", "Inhaled"]).optional(),
  frequency: z.enum(["OD", "BD", "TDS", "QID", "PRN", "Q4H", "Q6H", "Q8H", "Q12H"]).optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
  eye: z.enum(["Left", "Right", "Both", "N/A"]).default("N/A"),
});

// Base schema for consultation notes (used for General and extended by specialties)
export const baseNotesSchema = z.object({
  chief_complaint: z.string().min(1, "Chief Complaint is required"),
  history_of_present_illness: z.string().optional(),
  review_of_systems: z.string().optional(),
  past_medical_history: z.string().optional(),
  family_history: z.string().optional(),
  social_history: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  physical_exam: z.string().optional(),
  investigations: z.string().optional(),
  assessment: z.string().min(1, "Assessment is required"),
  treatment_plan: z.string().optional(),
  prescriptions: z.array(consultationMedicationSchema).optional(),
  prognosis: z.string().optional(),
  follow_up: z.string().optional(),
  referrals: z.string().optional(),
});

// Alias for General specialty schema
export const generalNotesSchema = baseNotesSchema;

// Specialty-specific schemas
export const neurologyNotesSchema = baseNotesSchema.extend({
  neurological_exam_findings: z.string().optional(),
  cranial_nerves: z.string().optional(),
  motor_examination: z.string().optional(),
  sensory_examination: z.string().optional(),
  reflexes: z.string().optional(),
  gait_coordination: z.string().optional(),
});

export const ophthalmologyNotesSchema = baseNotesSchema.extend({
  visual_acuity: z.string().optional(),
  refraction: z.string().optional(),
  slit_lamp_exam: z.string().optional(),
  fundus_exam: z.string().optional(),
  intraocular_pressure: z.string().optional(),
  visual_fields: z.string().optional(),
  pupil_examination: z.string().optional(),
  extraocular_movements: z.string().optional(),
});

export const cardiologyNotesSchema = baseNotesSchema.extend({
  cardiac_examination: z.string().optional(),
  ecg_findings: z.string().optional(),
  echocardiogram: z.string().optional(),
  stress_test: z.string().optional(),
  cardiac_catheterization: z.string().optional(),
  rhythm_assessment: z.string().optional(),
});

export const dermatologyNotesSchema = baseNotesSchema.extend({
  skin_examination: z.string().optional(),
  lesion_description: z.string().optional(),
  dermoscopy_findings: z.string().optional(),
  biopsy_results: z.string().optional(),
  skin_type: z.string().optional(),
  distribution_pattern: z.string().optional(),
});

export const orthopedicsNotesSchema = baseNotesSchema.extend({
  musculoskeletal_exam: z.string().optional(),
  range_of_motion: z.string().optional(),
  joint_examination: z.string().optional(),
  imaging_findings: z.string().optional(),
  functional_assessment: z.string().optional(),
  stability_tests: z.string().optional(),
});

export const psychiatryNotesSchema = baseNotesSchema.extend({
  mental_status_exam: z.string().optional(),
  mood_assessment: z.string().optional(),
  cognitive_assessment: z.string().optional(),
  risk_assessment: z.string().optional(),
  psychosocial_factors: z.string().optional(),
  therapy_plan: z.string().optional(),
});

export const pediatricsNotesSchema = baseNotesSchema.extend({
  developmental_milestones: z.string().optional(),
  growth_parameters: z.string().optional(),
  vaccination_status: z.string().optional(),
  feeding_history: z.string().optional(),
  behavioral_assessment: z.string().optional(),
  parental_concerns: z.string().optional(),
});

export const entNotesSchema = baseNotesSchema.extend({
  otoscopy: z.string().optional(),
  rhinoscopy: z.string().optional(),
  laryngoscopy: z.string().optional(),
  hearing_assessment: z.string().optional(),
  nasal_examination: z.string().optional(),
  throat_examination: z.string().optional(),
});

export const gynecologyNotesSchema = baseNotesSchema.extend({
  menstrual_history: z.string().optional(),
  obstetric_history: z.string().optional(),
  gynecological_exam: z.string().optional(),
  pap_smear: z.string().optional(),
  breast_examination: z.string().optional(),
  contraceptive_counseling: z.string().optional(),
});

export const pulmonologyNotesSchema = baseNotesSchema.extend({
  respiratory_examination: z.string().optional(),
  spirometry: z.string().optional(),
  chest_imaging: z.string().optional(),
  oxygen_saturation: z.string().optional(),
  smoking_history: z.string().optional(),
  dyspnea_assessment: z.string().optional(),
});

export const dentalNotesSchema = baseNotesSchema.extend({
  dental_history: z.string().optional(),
  oral_hygiene_status: z.string().optional(),
  intraoral_examination: z.string().optional(),
  extraoral_examination: z.string().optional(),
  tooth_charting: z.string().optional(),
  radiographic_findings: z.string().optional(),
});

export const urologyNotesSchema = baseNotesSchema.extend({
  urological_exam: z.string().optional(),
  prostate_examination: z.string().optional(),
  bladder_function: z.string().optional(),
  imaging_findings: z.string().optional(),
  uroflowmetry: z.string().optional(),
  urinalysis: z.string().optional(),
});

export const endocrinologyNotesSchema = baseNotesSchema.extend({
  endocrine_exam: z.string().optional(),
  thyroid_examination: z.string().optional(),
  glucose_monitoring: z.string().optional(),
  hormone_levels: z.string().optional(),
  metabolic_assessment: z.string().optional(),
  bone_health: z.string().optional(),
});

export const emergencyMedicineNotesSchema = baseNotesSchema.extend({
  triage_assessment: z.string().optional(),
  vital_signs: z.string().optional(),
  trauma_assessment: z.string().optional(),
  acute_interventions: z.string().optional(),
  diagnostic_imaging: z.string().optional(),
  resuscitation_status: z.string().optional(),
});

// Type exports
export type GeneralNotes = z.infer<typeof generalNotesSchema>;
export type NeurologyNotes = z.infer<typeof neurologyNotesSchema>;
export type OphthalmologyNotes = z.infer<typeof ophthalmologyNotesSchema>;
export type CardiologyNotes = z.infer<typeof cardiologyNotesSchema>;
export type DermatologyNotes = z.infer<typeof dermatologyNotesSchema>;
export type OrthopedicsNotes = z.infer<typeof orthopedicsNotesSchema>;
export type PsychiatryNotes = z.infer<typeof psychiatryNotesSchema>;
export type PediatricsNotes = z.infer<typeof pediatricsNotesSchema>;
export type ENTNotes = z.infer<typeof entNotesSchema>;
export type GynecologyNotes = z.infer<typeof gynecologyNotesSchema>;
export type PulmonologyNotes = z.infer<typeof pulmonologyNotesSchema>;
export type DentalNotes = z.infer<typeof dentalNotesSchema>;
export type UrologyNotes = z.infer<typeof urologyNotesSchema>;
export type EndocrinologyNotes = z.infer<typeof endocrinologyNotesSchema>;
export type EmergencyMedicineNotes = z.infer<typeof emergencyMedicineNotesSchema>;
export type ConsultationMedication = z.infer<typeof consultationMedicationSchema>;

export type NoteFieldConfig = {
  name: string;
  label: string;
  type: "input" | "textarea" | "prescription";
  rows?: number;
  placeholder?: string;
  mandatory?: boolean;
};

export type FieldSection = {
  title: string;
  fields: NoteFieldConfig[];
};

// Base field sections
const baseFieldSections: FieldSection[] = [
  {
    title: "History",
    fields: [
      { name: "chief_complaint", label: "Chief Complaint", type: "textarea", rows: 3, placeholder: "Enter chief complaint", mandatory: true },
      { name: "history_of_present_illness", label: "History of Present Illness", type: "textarea", rows: 4, placeholder: "Describe history of present illness" },
      { name: "review_of_systems", label: "Review of Systems", type: "textarea", rows: 3, placeholder: "Enter review of systems" },
      { name: "past_medical_history", label: "Past Medical History", type: "textarea", rows: 3, placeholder: "List past medical history" },
      { name: "family_history", label: "Family History", type: "textarea", rows: 3, placeholder: "Enter family history" },
      { name: "social_history", label: "Social History", type: "textarea", rows: 3, placeholder: "Describe social history" },
      { name: "medications", label: "Current Medications", type: "textarea", rows: 3, placeholder: "List current medications" },
      { name: "allergies", label: "Allergies", type: "textarea", rows: 2, placeholder: "List allergies" },
    ],
  },
  {
    title: "Examination",
    fields: [
      { name: "physical_exam", label: "General Physical Exam", type: "textarea", rows: 4, placeholder: "Enter physical exam findings" },
    ],
  },
  {
    title: "Investigations",
    fields: [
      { name: "investigations", label: "Investigations", type: "textarea", rows: 3, placeholder: "Enter investigation results" },
    ],
  },
  {
    title: "Assessment & Plan",
    fields: [
      { name: "assessment", label: "Assessment & Diagnosis", type: "textarea", rows: 3, placeholder: "Enter assessment and diagnosis", mandatory: true },
      { name: "treatment_plan", label: "Treatment Plan", type: "textarea", rows: 4, placeholder: "Describe treatment plan" },
      { name: "prescriptions", label: "Prescriptions", type: "prescription", placeholder: "Enter prescriptions" },
      { name: "prognosis", label: "Prognosis", type: "textarea", rows: 2, placeholder: "Enter prognosis" },
      { name: "follow_up", label: "Follow-Up Plan", type: "textarea", rows: 2, placeholder: "Enter follow-up plan" },
      { name: "referrals", label: "Referrals", type: "textarea", rows: 2, placeholder: "Enter referrals" },
    ],
  },
];

// Specialty-specific field configurations
const specialtySpecificFields: Record<string, FieldSection[]> = {
  General: [],
  Ophthalmology: [
    {
      title: "Examination",
      fields: [
        { name: "visual_acuity", label: "Visual Acuity", type: "textarea", rows: 3, placeholder: "Enter visual acuity", mandatory: true },
        { name: "refraction", label: "Refraction", type: "textarea", rows: 3, placeholder: "Enter refraction details" },
        { name: "pupil_examination", label: "Pupil Examination", type: "textarea", rows: 3, placeholder: "Describe pupil examination" },
        { name: "extraocular_movements", label: "Extraocular Movements", type: "textarea", rows: 3, placeholder: "Describe extraocular movements" },
        { name: "slit_lamp_exam", label: "Slit Lamp Examination", type: "textarea", rows: 4, placeholder: "Enter slit lamp findings" },
        { name: "intraocular_pressure", label: "Intraocular Pressure", type: "textarea", rows: 2, placeholder: "Enter intraocular pressure" },
        { name: "fundus_exam", label: "Fundus Examination", type: "textarea", rows: 4, placeholder: "Describe fundus examination" },
        { name: "visual_fields", label: "Visual Fields", type: "textarea", rows: 3, placeholder: "Enter visual field results" },
      ],
    },
  ],
  Neurology: [
    {
      title: "Examination",
      fields: [
        { name: "neurological_exam_findings", label: "Neurological Examination", type: "textarea", rows: 5, placeholder: "Enter neurological exam findings" },
        { name: "cranial_nerves", label: "Cranial Nerves", type: "textarea", rows: 4, placeholder: "Describe cranial nerve examination" },
        { name: "motor_examination", label: "Motor Examination", type: "textarea", rows: 4, placeholder: "Describe motor examination" },
        { name: "sensory_examination", label: "Sensory Examination", type: "textarea", rows: 3, placeholder: "Describe sensory examination" },
        { name: "reflexes", label: "Reflexes", type: "textarea", rows: 3, placeholder: "Enter reflex findings" },
        { name: "gait_coordination", label: "Gait & Coordination", type: "textarea", rows: 3, placeholder: "Describe gait and coordination" },
      ],
    },
  ],
  Cardiology: [
    {
      title: "Examination",
      fields: [
        { name: "cardiac_examination", label: "Cardiac Examination", type: "textarea", rows: 4, placeholder: "Enter cardiac exam findings", mandatory: true },
      ],
    },
    {
      title: "Investigations",
      fields: [
        { name: "ecg_findings", label: "ECG Findings", type: "textarea", rows: 3, placeholder: "Enter ECG results" },
        { name: "echocardiogram", label: "Echocardiogram", type: "textarea", rows: 4, placeholder: "Describe echocardiogram findings" },
        { name: "stress_test", label: "Stress Test", type: "textarea", rows: 3, placeholder: "Enter stress test results" },
        { name: "cardiac_catheterization", label: "Cardiac Catheterization", type: "textarea", rows: 4, placeholder: "Describe cardiac catheterization" },
        { name: "rhythm_assessment", label: "Rhythm Assessment", type: "textarea", rows: 3, placeholder: "Enter rhythm assessment" },
      ],
    },
  ],
  Dermatology: [
    {
      title: "Examination",
      fields: [
        { name: "skin_examination", label: "Skin Examination", type: "textarea", rows: 4, placeholder: "Describe skin examination", mandatory: true },
        { name: "lesion_description", label: "Lesion Description", type: "textarea", rows: 3, placeholder: "Describe lesions" },
        { name: "dermoscopy_findings", label: "Dermoscopy Findings", type: "textarea", rows: 3, placeholder: "Enter dermoscopy findings" },
        { name: "skin_type", label: "Skin Type", type: "textarea", rows: 2, placeholder: "Enter skin type" },
        { name: "distribution_pattern", label: "Distribution Pattern", type: "textarea", rows: 3, placeholder: "Describe distribution pattern" },
      ],
    },
    {
      title: "Investigations",
      fields: [
        { name: "biopsy_results", label: "Biopsy Results", type: "textarea", rows: 3, placeholder: "Enter biopsy results" },
      ],
    },
  ],
  Orthopedics: [
    {
      title: "Examination",
      fields: [
        { name: "musculoskeletal_exam", label: "Musculoskeletal Examination", type: "textarea", rows: 4, placeholder: "Describe musculoskeletal exam", mandatory: true },
        { name: "range_of_motion", label: "Range of Motion", type: "textarea", rows: 3, placeholder: "Enter range of motion" },
        { name: "joint_examination", label: "Joint Examination", type: "textarea", rows: 3, placeholder: "Describe joint examination" },
        { name: "stability_tests", label: "Stability Tests", type: "textarea", rows: 3, placeholder: "Enter stability test results" },
        { name: "functional_assessment", label: "Functional Assessment", type: "textarea", rows: 3, placeholder: "Describe functional assessment" },
      ],
    },
    {
      title: "Investigations",
      fields: [
        { name: "imaging_findings", label: "Imaging Findings", type: "textarea", rows: 3, placeholder: "Enter imaging findings" },
      ],
    },
  ],
  Psychiatry: [
    {
      title: "Examination",
      fields: [
        { name: "mental_status_exam", label: "Mental Status Examination", type: "textarea", rows: 4, placeholder: "Describe mental status exam", mandatory: true },
        { name: "mood_assessment", label: "Mood Assessment", type: "textarea", rows: 3, placeholder: "Enter mood assessment" },
        { name: "cognitive_assessment", label: "Cognitive Assessment", type: "textarea", rows: 3, placeholder: "Enter cognitive assessment" },
        { name: "risk_assessment", label: "Risk Assessment", type: "textarea", rows: 3, placeholder: "Enter risk assessment" },
      ],
    },
    {
      title: "Assessment & Plan",
      fields: [
        { name: "psychosocial_factors", label: "Psychosocial Factors", type: "textarea", rows: 3, placeholder: "Describe psychosocial factors" },
        { name: "therapy_plan", label: "Therapy Plan", type: "textarea", rows: 3, placeholder: "Enter therapy plan" },
      ],
    },
  ],
  Pediatrics: [
    {
      title: "History",
      fields: [
        { name: "developmental_milestones", label: "Developmental Milestones", type: "textarea", rows: 3, placeholder: "Enter developmental milestones" },
        { name: "feeding_history", label: "Feeding History", type: "textarea", rows: 3, placeholder: "Describe feeding history" },
        { name: "parental_concerns", label: "Parental Concerns", type: "textarea", rows: 3, placeholder: "Enter parental concerns" },
      ],
    },
    {
      title: "Examination",
      fields: [
        { name: "growth_parameters", label: "Growth Parameters", type: "textarea", rows: 3, placeholder: "Enter growth parameters", mandatory: true },
        { name: "behavioral_assessment", label: "Behavioral Assessment", type: "textarea", rows: 3, placeholder: "Describe behavioral assessment" },
      ],
    },
    {
      title: "Assessment & Plan",
      fields: [
        { name: "vaccination_status", label: "Vaccination Status", type: "textarea", rows: 3, placeholder: "Enter vaccination status" },
      ],
    },
  ],
  ENT: [
    {
      title: "Examination",
      fields: [
        { name: "otoscopy", label: "Otoscopy", type: "textarea", rows: 3, placeholder: "Enter otoscopy findings", mandatory: true },
        { name: "rhinoscopy", label: "Rhinoscopy", type: "textarea", rows: 3, placeholder: "Enter rhinoscopy findings" },
        { name: "throat_examination", label: "Throat Examination", type: "textarea", rows: 3, placeholder: "Describe throat examination" },
        { name: "nasal_examination", label: "Nasal Examination", type: "textarea", rows: 3, placeholder: "Describe nasal examination" },
        { name: "hearing_assessment", label: "Hearing Assessment", type: "textarea", rows: 3, placeholder: "Enter hearing assessment" },
        { name: "laryngoscopy", label: "Laryngoscopy", type: "textarea", rows: 3, placeholder: "Enter laryngoscopy findings" },
      ],
    },
  ],
  Gynecology: [
    {
      title: "History",
      fields: [
        { name: "menstrual_history", label: "Menstrual History", type: "textarea", rows: 3, placeholder: "Enter menstrual history" },
        { name: "obstetric_history", label: "Obstetric History", type: "textarea", rows: 3, placeholder: "Enter obstetric history" },
      ],
    },
    {
      title: "Examination",
      fields: [
        { name: "gynecology_exam", label: "Gynecological Examination", type: "textarea", rows: 4, placeholder: "Describe gynecological exam", mandatory: true },
        { name: "breast_examination", label: "Breast Examination", type: "textarea", rows: 3, placeholder: "Describe breast examination" },
      ],
    },
    {
      title: "Assessment & Plan",
      fields: [
        { name: "pap_smear", label: "Pap Smear", type: "textarea", rows: 3, placeholder: "Enter Pap smear results" },
        { name: "contraceptive_counseling", label: "Contraceptive Counseling", type: "textarea", rows: 3, placeholder: "Enter contraceptive counseling details" },
      ],
    },
  ],
  Pulmonology: [
    {
      title: "History",
      fields: [
        { name: "smoking_history", label: "Smoking History", type: "textarea", rows: 3, placeholder: "Enter smoking history" },
      ],
    },
    {
      title: "Examination",
      fields: [
        { name: "respiratory_examination", label: "Respiratory Examination", type: "textarea", rows: 4, placeholder: "Describe respiratory exam", mandatory: true },
        { name: "oxygen_saturation", label: "Oxygen Saturation", type: "textarea", rows: 2, placeholder: "Enter oxygen saturation" },
      ],
    },
    {
      title: "Investigations",
      fields: [
        { name: "spirometry", label: "Spirometry", type: "textarea", rows: 3, placeholder: "Enter spirometry results" },
        { name: "chest_imaging", label: "Chest Imaging", type: "textarea", rows: 3, placeholder: "Enter chest imaging findings" },
        { name: "dyspnea_assessment", label: "Dyspnea Assessment", type: "textarea", rows: 3, placeholder: "Describe dyspnea assessment" },
      ],
    },
  ],
  Dental: [
    {
      title: "History",
      fields: [
        { name: "dental_history", label: "Past Dental History", type: "textarea", rows: 3, placeholder: "Enter past dental history" },
      ],
    },
    {
      title: "Examination",
      fields: [
        { name: "oral_hygiene_status", label: "Oral Hygiene Status", type: "textarea", rows: 2, placeholder: "Enter oral hygiene status" },
        { name: "extraoral_examination", label: "Extraoral Examination", type: "textarea", rows: 3, placeholder: "Describe extraoral examination" },
        { name: "intraoral_examination", label: "Intraoral Examination", type: "textarea", rows: 4, placeholder: "Describe intraoral examination" },
        { name: "tooth_charting", label: "Tooth Charting", type: "textarea", rows: 6, placeholder: "Enter tooth charting details" },
        { name: "radiographic_findings", label: "Radiographic Findings", type: "textarea", rows: 4, placeholder: "Enter radiographic findings" },
      ],
    },
  ],
  Urology: [
    {
      title: "Examination",
      fields: [
        { name: "urological_exam", label: "Urological Examination", type: "textarea", rows: 4, placeholder: "Describe urological exam", mandatory: true },
        { name: "prostate_examination", label: "Prostate Examination", type: "textarea", rows: 3, placeholder: "Describe prostate examination" },
        { name: "bladder_function", label: "Bladder Function", type: "textarea", rows: 3, placeholder: "Enter bladder function details" },
      ],
    },
    {
      title: "Investigations",
      fields: [
        { name: "uroflowmetry", label: "Uroflowmetry", type: "textarea", rows: 3, placeholder: "Enter uroflowmetry results" },
        { name: "urinalysis", label: "Urinalysis", type: "textarea", rows: 3, placeholder: "Enter urinalysis results" },
        { name: "imaging_findings", label: "Imaging Findings", type: "textarea", rows: 3, placeholder: "Enter imaging findings" },
      ],
    },
  ],
  Endocrinology: [
    {
      title: "Examination",
      fields: [
        { name: "endocrine_exam", label: "Endocrine Examination", type: "textarea", rows: 4, placeholder: "Describe endocrine exam", mandatory: true },
        { name: "thyroid_examination", label: "Thyroid Examination", type: "textarea", rows: 3, placeholder: "Describe thyroid examination" },
      ],
    },
    {
      title: "Investigations",
      fields: [
        { name: "glucose_monitoring", label: "Glucose Monitoring", type: "textarea", rows: 3, placeholder: "Enter glucose monitoring results" },
        { name: "hormone_levels", label: "Hormone Levels", type: "textarea", rows: 3, placeholder: "Enter hormone level results" },
        { name: "metabolic_assessment", label: "Metabolic Assessment", type: "textarea", rows: 3, placeholder: "Describe metabolic assessment" },
        { name: "bone_health", label: "Bone Health", type: "textarea", rows: 3, placeholder: "Enter bone health assessment" },
      ],
    },
  ],
  EmergencyMedicine: [
    {
      title: "Examination",
      fields: [
        { name: "triage_assessment", label: "Triage Assessment", type: "textarea", rows: 3, placeholder: "Enter triage assessment", mandatory: true },
        { name: "vital_signs", label: "Vital Signs", type: "textarea", rows: 3, placeholder: "Enter vital signs", mandatory: true },
        { name: "trauma_assessment", label: "Trauma Assessment", type: "textarea", rows: 4, placeholder: "Describe trauma assessment" },
      ],
    },
    {
      title: "Investigations",
      fields: [
        { name: "diagnostic_imaging", label: "Diagnostic Imaging", type: "textarea", rows: 3, placeholder: "Enter diagnostic imaging results" },
        { name: "acute_interventions", label: "Acute Interventions", type: "textarea", rows: 3, placeholder: "Describe acute interventions" },
      ],
    },
    {
      title: "Assessment & Plan",
      fields: [
        { name: "resuscitation_status", label: "Resuscitation Status", type: "textarea", rows: 3, placeholder: "Enter resuscitation status" },
      ],
    },
  ],
};

// Merge base and specialty-specific fields
const mergeFieldSections = (specialtyFields: FieldSection[]): FieldSection[] => {
  const mergedSections: Record<string, FieldSection> = {};
  baseFieldSections.forEach((baseSection) => {
    mergedSections[baseSection.title] = { title: baseSection.title, fields: [...baseSection.fields] };
  });
  specialtyFields.forEach((specialtySection) => {
    if (mergedSections[specialtySection.title]) {
      mergedSections[specialtySection.title].fields.push(...specialtySection.fields);
    } else {
      mergedSections[specialtySection.title] = { title: specialtySection.title, fields: [...specialtySection.fields] };
    }
  });
  return Object.values(mergedSections);
};

// Specialty field configurations
export const specialtyFieldSections: Record<string, FieldSection[]> = Object.keys(specialtySpecificFields).reduce(
  (acc, specialty) => {
    acc[specialty] = mergeFieldSections(specialtySpecificFields[specialty]);
    return acc;
  },
  {} as Record<string, FieldSection[]>
);

// Complete consultation schema
export const consultationNotesSchema = z.object({
  chief_complaint: z.string().optional(),
  history_of_present_illness: z.string().optional(),
  review_of_systems: z.string().optional(),
  past_medical_history: z.string().optional(),
  family_history: z.string().optional(),
  social_history: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  physical_exam: z.string().optional(),
  investigations: z.string().optional(),
  assessment: z.string().optional(),
  treatment_plan: z.string().optional(),
  prescriptions: z.array(consultationMedicationSchema).optional(),
  prognosis: z.string().optional(),
  follow_up: z.string().optional(),
  referrals: z.string().optional(),
  visual_acuity: z.string().optional(),
  refraction: z.string().optional(),
  slit_lamp_exam: z.string().optional(),
  fundus_exam: z.string().optional(),
  intraocular_pressure: z.string().optional(),
  visual_fields: z.string().optional(),
  pupil_examination: z.string().optional(),
  extraocular_movements: z.string().optional(),
  neurological_exam_findings: z.string().optional(),
  cranial_nerves: z.string().optional(),
  motor_examination: z.string().optional(),
  sensory_examination: z.string().optional(),
  reflexes: z.string().optional(),
  gait_coordination: z.string().optional(),
  cardiac_examination: z.string().optional(),
  ecg_findings: z.string().optional(),
  echocardiogram: z.string().optional(),
  stress_test: z.string().optional(),
  cardiac_catheterization: z.string().optional(),
  rhythm_assessment: z.string().optional(),
  skin_examination: z.string().optional(),
  lesion_description: z.string().optional(),
  dermoscopy_findings: z.string().optional(),
  biopsy_results: z.string().optional(),
  skin_type: z.string().optional(),
  distribution_pattern: z.string().optional(),
  musculoskeletal_exam: z.string().optional(),
  range_of_motion: z.string().optional(),
  joint_examination: z.string().optional(),
  imaging_findings: z.string().optional(),
  functional_assessment: z.string().optional(),
  stability_tests: z.string().optional(),
  mental_status_exam: z.string().optional(),
  mood_assessment: z.string().optional(),
  cognitive_assessment: z.string().optional(),
  risk_assessment: z.string().optional(),
  psychosocial_factors: z.string().optional(),
  therapy_plan: z.string().optional(),
  developmental_milestones: z.string().optional(),
  growth_parameters: z.string().optional(),
  vaccination_status: z.string().optional(),
  feeding_history: z.string().optional(),
  behavioral_assessment: z.string().optional(),
  parental_concerns: z.string().optional(),
  otoscopy: z.string().optional(),
  rhinoscopy: z.string().optional(),
  laryngoscopy: z.string().optional(),
  hearing_assessment: z.string().optional(),
  nasal_examination: z.string().optional(),
  throat_examination: z.string().optional(),
  menstrual_history: z.string().optional(),
  obstetric_history: z.string().optional(),
  gynecological_exam: z.string().optional(),
  pap_smear: z.string().optional(),
  breast_examination: z.string().optional(),
  contraceptive_counseling: z.string().optional(),
  respiratory_examination: z.string().optional(),
  spirometry: z.string().optional(),
  chest_imaging: z.string().optional(),
  oxygen_saturation: z.string().optional(),
  smoking_history: z.string().optional(),
  dyspnea_assessment: z.string().optional(),
  dental_history: z.string().optional(),
  oral_hygiene_status: z.string().optional(),
  intraoral_examination: z.string().optional(),
  extraoral_examination: z.string().optional(),
  tooth_charting: z.string().optional(),
  radiographic_findings: z.string().optional(),
  urological_exam: z.string().optional(),
  prostate_examination: z.string().optional(),
  bladder_function: z.string().optional(),
  uroflowmetry: z.string().optional(),
  urinalysis: z.string().optional(),
  endocrine_exam: z.string().optional(),
  thyroid_examination: z.string().optional(),
  glucose_monitoring: z.string().optional(),
  hormone_levels: z.string().optional(),
  metabolic_assessment: z.string().optional(),
  bone_health: z.string().optional(),
  triage_assessment: z.string().optional(),
  vital_signs: z.string().optional(),
  trauma_assessment: z.string().optional(),
  acute_interventions: z.string().optional(),
  diagnostic_imaging: z.string().optional(),
  resuscitation_status: z.string().optional(),
});

export type ConsultationNotes = z.infer<typeof consultationNotesSchema>;

// Helper function to get all fields for a specialty
export const getSpecialtyFields = (departmentType: string): NoteFieldConfig[] =>
  (specialtyFieldSections[departmentType] || specialtyFieldSections["General"]).flatMap((section) => section.fields);

// Legacy field configs
export const specialtyNoteFieldConfigs: Record<string, NoteFieldConfig[]> = Object.keys(specialtyFieldSections).reduce(
  (acc, key) => ({ ...acc, [key]: getSpecialtyFields(key) }),
  {} as Record<string, NoteFieldConfig[]>
);

// Helper function to get mandatory fields
export const getMandatoryFieldsForDepartment = (departmentType: string): string[] =>
  (specialtyFieldSections[departmentType] || specialtyFieldSections["General"])
    .flatMap((section) => section.fields)
    .filter((field) => field.mandatory)
    .map((field) => field.name);