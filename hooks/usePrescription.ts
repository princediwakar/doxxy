"use client";
import { logger } from "@/lib/logger";

import { useState, useCallback, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAppState } from "@/contexts/AppStateContext";
import { createPrescription } from "@/actions/prescriptions";
import type { DbPrescriptionBaseInsert } from "@/types/core";
import type {
  PrescriptionFormValues,
  UsePrescriptionProps
} from "@/types/prescriptions";

const supabase = getSupabase();

// Enhanced prescription schema with better validation
const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().optional(),
  frequency: z.enum(["OD", "BD", "TDS", "QID", "PRN", "Q4H", "Q6H", "Q8H", "Q12H"]).optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
}).refine((data) => data.name.trim().length > 0, {
  message: "Medication name cannot be empty",
  path: ["name"]
});

const prescriptionFormSchema = z.object({
  medications: z.array(medicationSchema).min(1, "At least one medication is required")
    .refine(
      (medications) => medications.some(med => med.name.trim().length > 0),
      {
        message: "At least one medication must have a valid name",
        path: ["medications"]
      }
    ),
  notes: z.string().optional(),
});

export const usePrescription = ({
  open,
  consultationId,
  appointment,
  doctorId: initialDoctorId,
  patientId: initialPatientId,
  onOpenChange
}: UsePrescriptionProps) => {
  const { activeClinicId } = useAppState();
  const [shouldClose, setShouldClose] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(appointment?.id || null);
  const [manualDoctorId, setManualDoctorId] = useState<string | null>(initialDoctorId || null);
  const [manualPatientId, setManualPatientId] = useState<string | null>(initialPatientId || null);
  const [manualConsultationId, setManualConsultationId] = useState<string | null>(consultationId || null);

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: { 
      medications: [{ name: "" }],
      notes: ""
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medications"
  });

  // Fetch appointments for dropdown with detailed info
  const { data: appointmentsForSelect = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['appointments-detailed', activeClinicId],
    queryFn: async () => {
      if (!activeClinicId) return [];
      const { data, error } = await supabase.rpc('get_appointments_with_details_by_clinic', { 
        clinic_id: activeClinicId 
      });
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!activeClinicId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch doctors for manual selection
  const { data: doctors = [], isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['doctors', activeClinicId],
    queryFn: async () => {
      if (!activeClinicId) return [];
      const { data, error } = await supabase.rpc('get_doctors_by_clinic', { 
        clinic_id: activeClinicId 
      });
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!activeClinicId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch patients for manual selection
  const { data: patients = [], isLoading: isLoadingPatients } = useQuery({
    queryKey: ['patients', activeClinicId],
    queryFn: async () => {
      if (!activeClinicId) return [];
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, phone')
        .eq('clinic_id', activeClinicId)
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!activeClinicId,
    staleTime: 5 * 60 * 1000,
  });

  // Get selected appointment details
  const selectedAppointment = selectedAppointmentId 
    ? appointmentsForSelect.find((apt) => apt.id === selectedAppointmentId)
    : null;

  // Get doctor and patient names for display
  const selectedDoctor = manualDoctorId ? doctors.find(d => d.id === manualDoctorId) : null;
  const selectedPatient = manualPatientId ? patients.find(p => p.id === manualPatientId) : null;

  // When appointment is selected, auto-fill doctor/patient/consultation
  useEffect(() => {
    if (selectedAppointmentId && appointmentsForSelect.length > 0) {
      const apt = appointmentsForSelect.find((a) => a.id === selectedAppointmentId);
      if (apt) {
        setManualDoctorId(apt.doctor_id);
        setManualPatientId(apt.patient_id);
        setManualConsultationId(null);
      }
    } else if (!selectedAppointmentId) {
      if (!initialDoctorId && !initialPatientId) {
        setManualDoctorId(null);
        setManualPatientId(null);
        setManualConsultationId(null);
      }
    }
  }, [selectedAppointmentId, appointmentsForSelect, initialDoctorId, initialPatientId]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setSelectedAppointmentId(appointment?.id || null);
      setManualDoctorId(initialDoctorId || null);
      setManualPatientId(initialPatientId || null);
      setManualConsultationId(consultationId || null);
      setShouldClose(false);
      form.reset({ 
        medications: [{ name: "" }],
        notes: ""
      });
    }
  }, [open, appointment, initialDoctorId, initialPatientId, consultationId, form]);

  const addMedication = useCallback(() => {
    append({ name: "" });
  }, [append]);

  const removeMedication = useCallback((index: number) => {
    remove(index);
  }, [remove]);

  // Handle medicine selection with auto-fill
  const handleMedicineSelect = useCallback((
    index: number,
    medicine: { name: string },
    autoFillData: { dosage: string; route: string; suggestedFrequency?: string }
  ) => {
    const medicationFieldName = `medications.${index}` as const;
    
    form.setValue(`${medicationFieldName}.name`, medicine.name);
    
    if (autoFillData.dosage) {
      form.setValue(`${medicationFieldName}.dosage`, autoFillData.dosage);
    }
    
    if (autoFillData.suggestedFrequency) {
      form.setValue(`${medicationFieldName}.frequency`, autoFillData.suggestedFrequency as "OD" | "BD" | "TDS" | "QID" | "PRN" | "Q4H" | "Q6H" | "Q8H" | "Q12H");
    }
  }, [form]);

  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = useCallback(async (values: PrescriptionFormValues) => {
    if (!activeClinicId) {
      toast.error('No active clinic');
      return;
    }

    const finalDoctorId = manualDoctorId;
    const finalPatientId = manualPatientId;
    const finalConsultationId = manualConsultationId;

    if (!finalDoctorId || !finalPatientId) {
      toast.error('Doctor ID and Patient ID are required');
      return;
    }

    const medications = values.medications
      .filter(med => med.name?.trim())
      .map(med => ({
        name: med.name!.trim(),
        dosage: med.dosage || null,
        frequency: med.frequency || null,
        duration: med.duration || null,
        instructions: med.instructions || null,
      }));

    if (medications.length === 0) {
      toast.error('At least one medication is required');
      return;
    }

    const prescriptionData: DbPrescriptionBaseInsert = {
      clinic_id: activeClinicId,
      doctor_id: finalDoctorId,
      patient_id: finalPatientId,
      consultation_id: finalConsultationId,
      medications,
    };

    setIsSaving(true);
    try {
      const result = await createPrescription(prescriptionData);
      if (result.error) {
        toast.error(`Error saving prescription: ${result.error}`);
      } else {
        toast.success("Prescription saved successfully!");
        setShouldClose(true);
      }
    } catch (err) {
      logger.error('Error saving prescription:', err);
      toast.error(`Error saving prescription: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  }, [activeClinicId, manualDoctorId, manualPatientId, manualConsultationId]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen && form.formState.isDirty && !shouldClose) {
      const confirmDiscard = window.confirm(
        "You have unsaved changes. Do you want to discard them and close?"
      );
      if (confirmDiscard) {
        form.reset();
        onOpenChange(false);
        setShouldClose(false);
      }
      return;
    }
    
    if (shouldClose || !newOpen) {
      onOpenChange(newOpen);
      setShouldClose(false);
    }
  }, [form, shouldClose, onOpenChange]);

  const isLoading = isLoadingAppointments || isLoadingDoctors || isLoadingPatients;

  return {
    // Form
    form,
    fields,
    onSubmit,
    
    // Data
    appointmentsForSelect,
    doctors,
    patients,
    selectedAppointment,
    selectedDoctor,
    selectedPatient,
    
    // State
    selectedAppointmentId,
    setSelectedAppointmentId,
    manualDoctorId,
    setManualDoctorId,
    manualPatientId,
    setManualPatientId,
    shouldClose,
    
    // Actions
    addMedication,
    removeMedication,
    handleMedicineSelect,
    handleOpenChange,
    
    // Loading states
    isLoading,
    isSaving,
  };
}; 