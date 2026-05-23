"use server";

import { createServerSupabase } from "@/integrations/supabase/server";
import { stripNotSpecified } from "@/lib/voice/structureUtils";
import { isBlank } from "@/lib/schemaUtils";
import type { AIStructuredOutput } from "@/types/voice";

export async function submitEncounter(
  appointmentId: string,
  patientId: string,
  doctorId: string,
  clinicId: string,
  aiData: AIStructuredOutput,
) {
  const supabase = await createServerSupabase();

  const cleanedRawFields = stripNotSpecified(aiData.rawFields) as Record<string, unknown> | null;

  const specialtyData: Record<string, unknown> = {
    chief_complaint: !isBlank(aiData.symptoms) ? aiData.symptoms : "",
    diagnosis: !isBlank(aiData.diagnosis) ? aiData.diagnosis : "",
    ...(cleanedRawFields || {}),
  };

  const validPrescriptions = (aiData.prescriptions || [])
    .filter((p) => p.drug_name && p.drug_name !== "NOT_SPECIFIED")
    .map((p) => ({
      name: p.drug_name,
      dosage: !isBlank(p.dosage) ? p.dosage : "",
      frequency: !isBlank(p.frequency) ? p.frequency : "",
      duration: !isBlank(p.duration) ? p.duration : "",
      route: !isBlank(p.route) ? p.route : "",
      instructions: !isBlank(p.instructions) ? p.instructions : "",
      formulation: !isBlank(p.formulation) ? p.formulation : "",
    }));

  // Type assertion needed until Supabase types are regenerated with the new RPC
  const { error } = await (supabase.rpc as any)("finalize_encounter", {
    p_appointment_id: appointmentId,
    p_patient_id: patientId,
    p_doctor_id: doctorId,
    p_clinic_id: clinicId,
    p_specialty_data: specialtyData,
    p_medications: validPrescriptions,
  });

  if (error) {
    console.error("Encounter submission failed:", error);
    throw new Error("Failed to save encounter securely.");
  }

  return { success: true };
}
