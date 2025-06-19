import * as z from "zod";

// Enhanced medication schema for prescriptions within consultations
const consultationMedicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().optional(),
  route: z.enum(["Oral", "Topical", "IV", "IM", "Eye Drops", "Subcutaneous", "Inhaled"]).optional(),
  frequency: z.enum(["OD", "BD", "TDS", "QID", "PRN", "Q4H", "Q6H", "Q8H", "Q12H"]).optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
  eye: z.enum(["Left", "Right", "Both", "N/A"]).default("N/A"),
});

// Base schema for consultation notes
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

// General consultation schema (fallback for unspecialized consultations)
export const generalNotesSchema = baseNotesSchema;

// Type exports
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
export type GeneralNotes = z.infer<typeof generalNotesSchema>;
export type ConsultationMedication = z.infer<typeof consultationMedicationSchema>;

export type NoteFieldConfig = {
  name: string;
  label: string;
  type: "input" | "textarea" | "prescription";
  rows?: number;
  placeholder?: string;
  mandatory?: boolean;
};

// Section-based field organization
export type FieldSection = {
  title: string;
  fields: NoteFieldConfig[];
};

// Complete specialty field configurations organized by clinical sections
export const specialtyFieldSections: Record<string, FieldSection[]> = {
  General: [
    {
      title: "History",
      fields: [
        { name: "chief_complaint", label: "Chief Complaint", type: "textarea", rows: 3, placeholder: "Primary reason for visit", mandatory: true },
        { name: "history_of_present_illness", label: "History of Present Illness", type: "textarea", rows: 4, placeholder: "Detailed history of current symptoms" },
        { name: "review_of_systems", label: "Review of Systems", type: "textarea", rows: 3, placeholder: "Systematic review of symptoms" },
        { name: "past_medical_history", label: "Past Medical History", type: "textarea", rows: 3, placeholder: "Previous medical conditions and surgeries" },
        { name: "family_history", label: "Family History", type: "textarea", rows: 3, placeholder: "Relevant family medical history" },
        { name: "social_history", label: "Social History", type: "textarea", rows: 3, placeholder: "Lifestyle, occupation, habits" },
        { name: "medications", label: "Current Medications", type: "textarea", rows: 3, placeholder: "Current medications and dosages" },
        { name: "allergies", label: "Allergies", type: "textarea", rows: 2, placeholder: "Known allergies and reactions" },
      ]
    },
    {
      title: "Examination",
      fields: [
        { name: "physical_exam", label: "Physical Examination", type: "textarea", rows: 4, placeholder: "General physical examination findings" },
      ]
    },
    {
      title: "Assessment & Plan",
      fields: [
        { name: "investigations", label: "Investigations", type: "textarea", rows: 3, placeholder: "Laboratory tests, imaging ordered" },
        { name: "assessment", label: "Assessment & Diagnosis", type: "textarea", rows: 3, placeholder: "Clinical assessment and diagnosis", mandatory: true },
        { name: "treatment_plan", label: "Treatment Plan", type: "textarea", rows: 4, placeholder: "Management plan and interventions", mandatory: true },
        { name: "prescriptions", label: "Prescriptions", type: "prescription", placeholder: "Add medications and dosage instructions" },
        { name: "prognosis", label: "Prognosis", type: "textarea", rows: 2, placeholder: "Expected outcome" },
        { name: "follow_up", label: "Follow-Up Plan", type: "textarea", rows: 2, placeholder: "Next appointment and monitoring plan" },
        { name: "referrals", label: "Referrals", type: "textarea", rows: 2, placeholder: "Specialist referrals if needed" },
      ]
    }
  ],
  Ophthalmology: [
    {
      title: "History",
      fields: [
        { name: "chief_complaint", label: "Chief Complaint", type: "textarea", rows: 3, placeholder: "Primary visual complaint", mandatory: true },
        { name: "history_of_present_illness", label: "History of Present Illness", type: "textarea", rows: 4, placeholder: "Detailed ocular history" },
        { name: "review_of_systems", label: "Review of Systems", type: "textarea", rows: 3, placeholder: "Ocular and systemic review" },
        { name: "past_medical_history", label: "Past Medical History", type: "textarea", rows: 3, placeholder: "Previous eye conditions and surgeries" },
        { name: "family_history", label: "Family History", type: "textarea", rows: 3, placeholder: "Family ocular history" },
        { name: "social_history", label: "Social History", type: "textarea", rows: 3, placeholder: "Occupation, hobbies, eye protection" },
        { name: "medications", label: "Current Medications", type: "textarea", rows: 3, placeholder: "Eye drops and systemic medications" },
        { name: "allergies", label: "Allergies", type: "textarea", rows: 2, placeholder: "Drug and environmental allergies" },
      ]
    },
    {
      title: "Examination",
      fields: [
        { name: "physical_exam", label: "General Physical Exam", type: "textarea", rows: 3, placeholder: "General examination findings" },
        { name: "visual_acuity", label: "Visual Acuity", type: "textarea", rows: 3, placeholder: "Distance/near VA, with/without correction", mandatory: true },
        { name: "refraction", label: "Refraction", type: "textarea", rows: 3, placeholder: "Objective and subjective refraction" },
        { name: "pupil_examination", label: "Pupil Examination", type: "textarea", rows: 3, placeholder: "Pupil size, reactivity, RAPD" },
        { name: "extraocular_movements", label: "Extraocular Movements", type: "textarea", rows: 3, placeholder: "Eye movement assessment" },
        { name: "slit_lamp_exam", label: "Slit Lamp Examination", type: "textarea", rows: 4, placeholder: "Anterior segment examination" },
        { name: "intraocular_pressure", label: "Intraocular Pressure", type: "textarea", rows: 2, placeholder: "IOP measurements (method, time)" },
        { name: "fundus_exam", label: "Fundus Examination", type: "textarea", rows: 4, placeholder: "Posterior segment examination", mandatory: true },
        { name: "visual_fields", label: "Visual Fields", type: "textarea", rows: 3, placeholder: "Perimetry results" },
      ]
    },
    {
      title: "Assessment & Plan",
      fields: [
        { name: "investigations", label: "Investigations", type: "textarea", rows: 3, placeholder: "OCT, angiography, ultrasound" },
        { name: "assessment", label: "Ophthalmic Assessment", type: "textarea", rows: 3, placeholder: "Ocular diagnosis and staging", mandatory: true },
        { name: "treatment_plan", label: "Treatment Plan", type: "textarea", rows: 4, placeholder: "Medical, surgical, optical management", mandatory: true },
        { name: "prescriptions", label: "Prescriptions", type: "prescription", placeholder: "Add medications and dosage instructions" },
        { name: "prognosis", label: "Prognosis", type: "textarea", rows: 2, placeholder: "Visual prognosis" },
        { name: "follow_up", label: "Follow-Up Plan", type: "textarea", rows: 2, placeholder: "Next visit and monitoring" },
        { name: "referrals", label: "Referrals", type: "textarea", rows: 2, placeholder: "Subspecialty or surgical referrals" },
      ]
    }
  ],
  Neurology: [
    {
      title: "History",
      fields: [
        { name: "chief_complaint", label: "Chief Complaint", type: "textarea", rows: 3, placeholder: "Primary neurological symptoms", mandatory: true },
        { name: "history_of_present_illness", label: "History of Present Illness", type: "textarea", rows: 4, placeholder: "Detailed neurological history" },
        { name: "review_of_systems", label: "Review of Systems", type: "textarea", rows: 3, placeholder: "Neurological review of systems" },
        { name: "past_medical_history", label: "Past Medical History", type: "textarea", rows: 3, placeholder: "Previous neurological conditions" },
        { name: "family_history", label: "Family History", type: "textarea", rows: 3, placeholder: "Family neurological history" },
        { name: "social_history", label: "Social History", type: "textarea", rows: 3, placeholder: "Lifestyle, occupation, risk factors" },
        { name: "medications", label: "Current Medications", type: "textarea", rows: 3, placeholder: "Neurological and other medications" },
        { name: "allergies", label: "Allergies", type: "textarea", rows: 2, placeholder: "Drug and other allergies" },
      ]
    },
    {
      title: "Examination",
      fields: [
        { name: "physical_exam", label: "General Physical Exam", type: "textarea", rows: 4, placeholder: "General physical examination" },
        { name: "neurological_exam_findings", label: "Neurological Examination", type: "textarea", rows: 5, placeholder: "Detailed neurological examination findings", mandatory: true },
        { name: "cranial_nerves", label: "Cranial Nerves", type: "textarea", rows: 4, placeholder: "CN I-XII examination findings" },
        { name: "motor_examination", label: "Motor Examination", type: "textarea", rows: 4, placeholder: "Muscle strength, tone, bulk" },
        { name: "sensory_examination", label: "Sensory Examination", type: "textarea", rows: 3, placeholder: "Touch, pain, vibration, proprioception" },
        { name: "reflexes", label: "Reflexes", type: "textarea", rows: 3, placeholder: "Deep tendon and pathological reflexes" },
        { name: "gait_coordination", label: "Gait & Coordination", type: "textarea", rows: 3, placeholder: "Gait analysis and cerebellar function" },
      ]
    },
    {
      title: "Assessment & Plan",
      fields: [
        { name: "investigations", label: "Investigations", type: "textarea", rows: 3, placeholder: "EEG, MRI, CT, LP, NCS/EMG" },
        { name: "assessment", label: "Neurological Assessment", type: "textarea", rows: 3, placeholder: "Neurological diagnosis and localization", mandatory: true },
        { name: "treatment_plan", label: "Treatment Plan", type: "textarea", rows: 4, placeholder: "Neurological management plan", mandatory: true },
        { name: "prescriptions", label: "Prescriptions", type: "prescription", placeholder: "Add medications and dosage instructions" },
        { name: "prognosis", label: "Prognosis", type: "textarea", rows: 2, placeholder: "Expected neurological outcome" },
        { name: "follow_up", label: "Follow-Up Plan", type: "textarea", rows: 2, placeholder: "Neurology follow-up schedule" },
        { name: "referrals", label: "Referrals", type: "textarea", rows: 2, placeholder: "Subspecialty or other referrals" },
      ]
    }
  ],
  Cardiology: [
    {
      title: "History",
      fields: [
        { name: "chief_complaint", label: "Chief Complaint", type: "textarea", rows: 3, placeholder: "Primary cardiac symptoms", mandatory: true },
        { name: "history_of_present_illness", label: "History of Present Illness", type: "textarea", rows: 4, placeholder: "Detailed cardiac history" },
        { name: "review_of_systems", label: "Review of Systems", type: "textarea", rows: 3, placeholder: "Cardiovascular review of systems" },
        { name: "past_medical_history", label: "Past Medical History", type: "textarea", rows: 3, placeholder: "Previous cardiac conditions" },
        { name: "family_history", label: "Family History", type: "textarea", rows: 3, placeholder: "Family cardiac history" },
        { name: "social_history", label: "Social History", type: "textarea", rows: 3, placeholder: "Smoking, alcohol, exercise habits" },
        { name: "medications", label: "Current Medications", type: "textarea", rows: 3, placeholder: "Cardiac and other medications" },
        { name: "allergies", label: "Allergies", type: "textarea", rows: 2, placeholder: "Drug allergies" },
      ]
    },
    {
      title: "Examination",
      fields: [
        { name: "physical_exam", label: "General Physical Exam", type: "textarea", rows: 4, placeholder: "General examination findings" },
        { name: "cardiac_examination", label: "Cardiac Examination", type: "textarea", rows: 4, placeholder: "Heart sounds, murmurs, peripheral pulses", mandatory: true },
      ]
    },
    {
      title: "Investigations",
      fields: [
        { name: "ecg_findings", label: "ECG Findings", type: "textarea", rows: 3, placeholder: "Electrocardiogram interpretation" },
        { name: "echocardiogram", label: "Echocardiogram", type: "textarea", rows: 4, placeholder: "Echo findings and measurements" },
        { name: "stress_test", label: "Stress Test", type: "textarea", rows: 3, placeholder: "Exercise or pharmacological stress results" },
        { name: "cardiac_catheterization", label: "Cardiac Catheterization", type: "textarea", rows: 4, placeholder: "Angiography and intervention details" },
        { name: "rhythm_assessment", label: "Rhythm Assessment", type: "textarea", rows: 3, placeholder: "Holter, event monitor results" },
        { name: "investigations", label: "Other Investigations", type: "textarea", rows: 3, placeholder: "Cardiac enzymes, BNP, other tests" },
      ]
    },
    {
      title: "Assessment & Plan",
      fields: [
        { name: "assessment", label: "Cardiac Assessment", type: "textarea", rows: 3, placeholder: "Cardiovascular diagnosis", mandatory: true },
        { name: "treatment_plan", label: "Treatment Plan", type: "textarea", rows: 4, placeholder: "Cardiac management plan", mandatory: true },
        { name: "prescriptions", label: "Prescriptions", type: "prescription", placeholder: "Add medications and dosage instructions" },
        { name: "prognosis", label: "Prognosis", type: "textarea", rows: 2, placeholder: "Cardiac prognosis" },
        { name: "follow_up", label: "Follow-Up Plan", type: "textarea", rows: 2, placeholder: "Cardiology follow-up" },
        { name: "referrals", label: "Referrals", type: "textarea", rows: 2, placeholder: "Cardiac surgery or other referrals" },
      ]
    }
  ]
};

// Helper function to get all fields for a specialty (for backward compatibility)
export const getSpecialtyFields = (departmentType: string): NoteFieldConfig[] => {
  const sections = specialtyFieldSections[departmentType] || specialtyFieldSections['General'];
  return sections.flatMap(section => section.fields);
};

// Legacy field configs for backward compatibility
export const specialtyNoteFieldConfigs: Record<string, NoteFieldConfig[]> = Object.keys(specialtyFieldSections).reduce((acc, key) => {
  acc[key] = getSpecialtyFields(key);
  return acc;
}, {} as Record<string, NoteFieldConfig[]>);

// Complete consultation schema that includes all possible specialty fields
export const consultationNotesSchema = z.object({
  // Common fields for all specialties
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
  prognosis: z.string().optional(),
  follow_up: z.string().optional(),
  referrals: z.string().optional(),
  
  // Ophthalmology specific fields
  visual_acuity: z.string().optional(),
  refraction: z.string().optional(),
  pupil_examination: z.string().optional(),
  extraocular_movements: z.string().optional(),
  slit_lamp_exam: z.string().optional(),
  intraocular_pressure: z.string().optional(),
  fundus_exam: z.string().optional(),
  visual_fields: z.string().optional(),
  
  // Neurology specific fields
  neurological_exam_findings: z.string().optional(),
  cranial_nerves: z.string().optional(),
  motor_examination: z.string().optional(),
  sensory_examination: z.string().optional(),
  reflexes: z.string().optional(),
  gait_coordination: z.string().optional(),
  
  // Cardiology specific fields
  cardiac_examination: z.string().optional(),
  ecg_findings: z.string().optional(),
  echocardiogram: z.string().optional(),
  stress_test: z.string().optional(),
  cardiac_catheterization: z.string().optional(),
  rhythm_assessment: z.string().optional(),
  
  // Prescriptions
  prescriptions: z.array(consultationMedicationSchema).optional(),
});

export type ConsultationNotes = z.infer<typeof consultationNotesSchema>;

// Helper function to get mandatory fields for a specific department
export const getMandatoryFieldsForDepartment = (departmentType: string): string[] => {
  const sections = specialtyFieldSections[departmentType] || specialtyFieldSections['General'];
  const mandatoryFields: string[] = [];
  
  sections.forEach(section => {
    section.fields.forEach(field => {
      if (field.mandatory) {
        mandatoryFields.push(field.name);
      }
    });
  });
  
  return mandatoryFields;
};