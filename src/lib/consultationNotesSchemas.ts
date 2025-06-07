import * as z from "zod";

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
  prognosis: z.string().optional(),
  follow_up: z.string().optional(),
  referrals: z.string().optional(),
});

export const neurologyNotesSchema = baseNotesSchema.extend({
  neurological_exam_findings: z.string().optional(),
});

export const ophthalmologyNotesSchema = baseNotesSchema.extend({
  visual_acuity: z.string().optional(),
  refraction: z.string().optional(),
  slit_lamp_exam: z.string().optional(),
  fundus_exam: z.string().optional(),
  intraocular_pressure: z.string().optional(),
  visual_fields: z.string().optional(),
});

// General consultation schema (fallback for unspecialized consultations)
export const generalNotesSchema = baseNotesSchema;

export type NeurologyNotes = z.infer<typeof neurologyNotesSchema>;
export type OphthalmologyNotes = z.infer<typeof ophthalmologyNotesSchema>;
export type GeneralNotes = z.infer<typeof generalNotesSchema>;

export type NoteFieldConfig = {
  name: string;
  label: string;
  type: "input" | "textarea";
  rows?: number;
  placeholder?: string;
};

export const specialtyNoteFieldConfigs: Record<string, NoteFieldConfig[]> = {
  General: [
    { name: "chief_complaint", label: "Chief Complaint", type: "textarea", rows: 4, placeholder: "Enter chief complaint" },
    { name: "history_of_present_illness", label: "History of Present Illness", type: "textarea", rows: 4, placeholder: "Enter history" },
    { name: "review_of_systems", label: "Review of Systems", type: "textarea", rows: 4, placeholder: "Enter review" },
    { name: "past_medical_history", label: "Past Medical History", type: "textarea", rows: 4, placeholder: "Enter history" },
    { name: "family_history", label: "Family History", type: "textarea", rows: 4, placeholder: "Enter family history" },
    { name: "social_history", label: "Social History", type: "textarea", rows: 4, placeholder: "Enter social history" },
    { name: "medications", label: "Medications", type: "textarea", rows: 4, placeholder: "Enter medications" },
    { name: "allergies", label: "Allergies", type: "textarea", rows: 4, placeholder: "Enter allergies" },
    { name: "physical_exam", label: "Physical Exam", type: "textarea", rows: 4, placeholder: "Enter physical exam findings" },
    { name: "investigations", label: "Investigations", type: "textarea", rows: 4, placeholder: "Enter investigations" },
    { name: "assessment", label: "Assessment", type: "textarea", rows: 4, placeholder: "Enter assessment" },
    { name: "treatment_plan", label: "Treatment Plan", type: "textarea", rows: 4, placeholder: "Enter treatment plan" },
    { name: "prognosis", label: "Prognosis", type: "textarea", rows: 4, placeholder: "Enter prognosis" },
    { name: "follow_up", label: "Follow-Up", type: "textarea", rows: 4, placeholder: "Enter follow-up plan" },
    { name: "referrals", label: "Referrals", type: "textarea", rows: 4, placeholder: "Enter referrals" },
  ],
  Neurology: [
    { name: "chief_complaint", label: "Chief Complaint", type: "textarea", rows: 4, placeholder: "Enter chief complaint" },
    { name: "history_of_present_illness", label: "History of Present Illness", type: "textarea", rows: 4, placeholder: "Enter history" },
    { name: "review_of_systems", label: "Review of Systems", type: "textarea", rows: 4, placeholder: "Enter review" },
    { name: "past_medical_history", label: "Past Medical History", type: "textarea", rows: 4, placeholder: "Enter history" },
    { name: "family_history", label: "Family History", type: "textarea", rows: 4, placeholder: "Enter family history" },
    { name: "social_history", label: "Social History", type: "textarea", rows: 4, placeholder: "Enter social history" },
    { name: "medications", label: "Medications", type: "textarea", rows: 4, placeholder: "Enter medications" },
    { name: "allergies", label: "Allergies", type: "textarea", rows: 4, placeholder: "Enter allergies" },
    { name: "physical_exam", label: "Physical Exam", type: "textarea", rows: 4, placeholder: "Enter physical exam findings" },
    { name: "neurological_exam_findings", label: "Neurological Exam Findings", type: "textarea", rows: 4, placeholder: "Enter neurological findings" },
    { name: "investigations", label: "Investigations", type: "textarea", rows: 4, placeholder: "Enter investigations" },
    { name: "assessment", label: "Assessment", type: "textarea", rows: 4, placeholder: "Enter assessment" },
    { name: "treatment_plan", label: "Treatment Plan", type: "textarea", rows: 4, placeholder: "Enter treatment plan" },
    { name: "prognosis", label: "Prognosis", type: "textarea", rows: 4, placeholder: "Enter prognosis" },
    { name: "follow_up", label: "Follow-Up", type: "textarea", rows: 4, placeholder: "Enter follow-up plan" },
    { name: "referrals", label: "Referrals", type: "textarea", rows: 4, placeholder: "Enter referrals" },
  ],
  Ophthalmology: [
    { name: "chief_complaint", label: "Chief Complaint", type: "textarea", rows: 4, placeholder: "Enter chief complaint" },
    { name: "history_of_present_illness", label: "History of Present Illness", type: "textarea", rows: 4, placeholder: "Enter history" },
    { name: "review_of_systems", label: "Review of Systems", type: "textarea", rows: 4, placeholder: "Enter review" },
    { name: "past_medical_history", label: "Past Medical History", type: "textarea", rows: 4, placeholder: "Enter history" },
    { name: "family_history", label: "Family History", type: "textarea", rows: 4, placeholder: "Enter family history" },
    { name: "social_history", label: "Social History", type: "textarea", rows: 4, placeholder: "Enter social history" },
    { name: "medications", label: "Medications", type: "textarea", rows: 4, placeholder: "Enter medications" },
    { name: "allergies", label: "Allergies", type: "textarea", rows: 4, placeholder: "Enter allergies" },
    { name: "physical_exam", label: "Physical Exam", type: "textarea", rows: 4, placeholder: "Enter physical exam findings" },
    { name: "visual_acuity", label: "Visual Acuity", type: "textarea", rows: 4, placeholder: "Enter visual acuity" },
    { name: "refraction", label: "Refraction", type: "textarea", rows: 4, placeholder: "Enter refraction" },
    { name: "slit_lamp_exam", label: "Slit Lamp Exam", type: "textarea", rows: 4, placeholder: "Enter slit lamp findings" },
    { name: "fundus_exam", label: "Fundus Exam", type: "textarea", rows: 4, placeholder: "Enter fundus exam findings" },
    { name: "intraocular_pressure", label: "Intraocular Pressure", type: "textarea", rows: 4, placeholder: "Enter intraocular pressure" },
    { name: "visual_fields", label: "Visual Fields", type: "textarea", rows: 4, placeholder: "Enter visual fields" },
    { name: "investigations", label: "Investigations", type: "textarea", rows: 4, placeholder: "Enter investigations" },
    { name: "assessment", label: "Assessment", type: "textarea", rows: 4, placeholder: "Enter assessment" },
    { name: "treatment_plan", label: "Treatment Plan", type: "textarea", rows: 4, placeholder: "Enter treatment plan" },
    { name: "prognosis", label: "Prognosis", type: "textarea", rows: 4, placeholder: "Enter prognosis" },
    { name: "follow_up", label: "Follow-Up", type: "textarea", rows: 4, placeholder: "Enter follow-up plan" },
    { name: "referrals", label: "Referrals", type: "textarea", rows: 4, placeholder: "Enter referrals" },
  ],
};