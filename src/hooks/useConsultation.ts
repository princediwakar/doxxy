import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  neurologyNotesSchema,
  ophthalmologyNotesSchema,
  cardiologyNotesSchema,
  dermatologyNotesSchema,
  orthopedicsNotesSchema,
  psychiatryNotesSchema,
  pediatricsNotesSchema,
  entNotesSchema,
  gynecologyNotesSchema,
  pulmonologyNotesSchema,
  generalNotesSchema,
  specialtyFieldSections,
  specialtyNoteFieldConfigs,
  NoteFieldConfig,
  FieldSection,
} from "@/lib/consultationNotesSchemas";

const supabase = getSupabase();

export type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  patient_name?: string;
  doctor_name?: string;
  patient_date_of_birth?: string | null;
  patient_gender?: string | null;
};

type ConsultationInsert = Database['public']['Tables']['consultations']['Insert'];
type Consultation = Database['public']['Tables']['consultations']['Row'];
type DoctorDetails = Database['public']['Functions']['get_doctors_by_clinic']['Returns'][0];

const consultationFormSchema = z.object({
  specialty_data: z.union([
    neurologyNotesSchema,
    ophthalmologyNotesSchema,
    cardiologyNotesSchema,
    dermatologyNotesSchema,
    orthopedicsNotesSchema,
    psychiatryNotesSchema,
    pediatricsNotesSchema,
    entNotesSchema,
    gynecologyNotesSchema,
    pulmonologyNotesSchema,
    generalNotesSchema,
    z.null(),
    z.undefined(),
  ]).optional(),
});

export type ConsultationFormValues = z.infer<typeof consultationFormSchema>;

interface UseConsultationProps {
  appointment: Appointment | null;
  open: boolean;
}

export const useConsultation = ({ appointment, open }: UseConsultationProps) => {
  const queryClient = useQueryClient();
  const { activeClinic, user, activeClinicRole } = useAuth();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [editedFields, setEditedFields] = useState<string[]>([]);
  const [shouldClose, setShouldClose] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<{ 
    status: 'idle' | 'saving' | 'saved' | 'error'; 
    timestamp?: string 
  }>({ status: 'idle' });

  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues: { specialty_data: undefined },
    mode: 'onChange',
  });

  // Fetch doctor details
  const { data: doctorDetails, isLoading: isLoadingDoctorDetails } = useQuery<DoctorDetails[] | null>({
    queryKey: ['doctorDetails', appointment?.doctor_id, activeClinic?.clinic_id],
    queryFn: async () => {
      if (!appointment?.doctor_id || !activeClinic?.clinic_id) return null;
      const { data, error } = await supabase.rpc('get_doctors_by_clinic', {
        clinic_id: activeClinic.clinic_id,
      });
      if (error) {
        toast("Error fetching doctor details", { 
          description: `Failed to fetch doctor details: ${error.message}` 
        });
        throw error;
      }
      const doctor = data?.find(d => d.id === appointment.doctor_id);
      return doctor ? [doctor] : null;
    },
    enabled: open && !!appointment?.doctor_id && !!activeClinic?.clinic_id,
  });

  // Map database department names to schema keys
  const mapDepartmentToSchemaKey = useCallback((databaseDepartmentName: string | null | undefined): string => {
    if (!databaseDepartmentName) return 'General';
    
    const mapping: Record<string, string> = {
      'General Medicine': 'General',
      'Neurology': 'Neurology',
      'Ophthalmology': 'Ophthalmology',
      'Cardiology': 'Cardiology',
      'Dermatology': 'Dermatology',
      'Orthopedics': 'Orthopedics',
      'Psychiatry': 'Psychiatry',
      'Pediatrics': 'Pediatrics',
      'ENT': 'ENT',
      'Gynecology': 'Gynecology',
      'Pulmonology': 'Pulmonology',
      'No Department': 'General',
    };
    
    return mapping[databaseDepartmentName] || 'General';
  }, []);

  // Determine effective department type
  const effectiveDepartmentType = useMemo(() => {
    const databaseDepartmentName = doctorDetails?.[0]?.department_name;
    return mapDepartmentToSchemaKey(databaseDepartmentName);
  }, [doctorDetails, mapDepartmentToSchemaKey]);

  // Get specialty sections and fields
  const currentSpecialtySections = useMemo(() => {
    let sections = [];
    
    try {
      sections = effectiveDepartmentType ? 
        (specialtyFieldSections[effectiveDepartmentType] || specialtyFieldSections['General']) : 
        specialtyFieldSections['General'];
      
      if (!sections || !Array.isArray(sections) || sections.length === 0) {
        sections = specialtyFieldSections['General'];
      }
    } catch (error) {
      console.error('Error getting specialty sections:', error);
      sections = specialtyFieldSections['General'];
    }
    
    return sections;
  }, [effectiveDepartmentType]);

  const currentSpecialtyFields = useMemo(() => {
    let fields = [];
    
    try {
      fields = currentSpecialtySections.flatMap(section => section.fields);
      
      if (!fields || fields.length === 0) {
        const generalSections = specialtyFieldSections['General'];
        fields = generalSections.flatMap(section => section.fields);
      }
    } catch (error) {
      console.error('Error getting specialty fields:', error);
      fields = [
        { name: "chief_complaint", label: "Chief Complaint", type: "textarea", rows: 3, placeholder: "Primary reason for visit" },
        { name: "history_of_present_illness", label: "History of Present Illness", type: "textarea", rows: 4, placeholder: "Detailed history of current symptoms" },
        { name: "physical_exam", label: "Physical Examination", type: "textarea", rows: 4, placeholder: "General physical examination findings" },
        { name: "assessment", label: "Assessment & Diagnosis", type: "textarea", rows: 3, placeholder: "Clinical assessment and diagnosis" },
        { name: "treatment_plan", label: "Treatment Plan", type: "textarea", rows: 4, placeholder: "Management plan and interventions" },
      ];
    }
    
    return fields;
  }, [currentSpecialtySections]);

  // Fetch consultation data
  const { data: existingConsultation, isLoading: isLoadingConsultation } = useQuery<Consultation | null>({
    queryKey: ['consultation', appointment?.id],
    queryFn: async () => {
      if (!appointment?.id) return null;
      const { data, error } = await supabase
        .from('consultations')
        .select('*, clinical_notes')
        .eq('appointment_id', appointment.id)
        .single();
      if (error && error.code !== 'PGRST116') {
        toast("Error fetching consultation", { 
          description: `Failed to fetch consultation: ${error.message}` 
        });
        throw error;
      }
      return data;
    },
    enabled: open && !!appointment?.id,
  });

  // Track edited fields
  useEffect(() => {
    const dirtyFields = form.formState.dirtyFields.specialty_data;
    if (dirtyFields && currentSpecialtyFields) {
      const edited = Object.keys(dirtyFields)
        .map((key) => {
          const config = currentSpecialtyFields.find((f) => f.name === key);
          return config ? config.label : null;
        })
        .filter((label): label is string => !!label);
      setEditedFields(edited);
    } else {
      setEditedFields([]);
    }
  }, [form.formState.dirtyFields.specialty_data, currentSpecialtyFields]);

  // Initialize form
  useEffect(() => {
    if (existingConsultation) {
      let initialSpecialtyData: ConsultationFormValues['specialty_data'] =
        existingConsultation.specialty_data && typeof existingConsultation.specialty_data === 'object' && !Array.isArray(existingConsultation.specialty_data)
          ? existingConsultation.specialty_data
          : undefined;
      if (!initialSpecialtyData && existingConsultation.clinical_notes && typeof existingConsultation.clinical_notes === 'string') {
        const department = effectiveDepartmentType;
        if (department && specialtyNoteFieldConfigs[department]) {
          initialSpecialtyData = { chief_complaint: existingConsultation.clinical_notes };
        }
      }
      form.reset({ specialty_data: initialSpecialtyData });
    } else {
      form.reset({ specialty_data: undefined });
    }
  }, [existingConsultation, form, effectiveDepartmentType]);

  // Update appointment status mutation
  const updateAppointmentStatusMutation = useMutation({
    mutationFn: async ({ appointmentId, status }: { 
      appointmentId: string, 
      status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' 
    }) => {
      if (!activeClinic?.clinic_id) throw new Error('No active clinic selected.');
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)
        .eq('clinic_id', activeClinic.clinic_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', activeClinic?.clinic_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data', activeClinic?.clinic_id] });
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async ({ values, isDraft }: { values: ConsultationFormValues; isDraft: boolean }) => {
      if (!activeClinic?.clinic_id || !appointment?.id || !appointment?.doctor_id) {
        throw new Error('Missing required data to save consultation.');
      }
      const baseConsultationData: ConsultationInsert = {
        clinic_id: activeClinic.clinic_id,
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        clinical_notes: null,
        specialty_data: values.specialty_data ? JSON.parse(JSON.stringify(values.specialty_data)) : null,
      };
      let result;
      if (existingConsultation?.id) {
        result = await supabase
          .from('consultations')
          .update(baseConsultationData)
          .eq('id', existingConsultation.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('consultations')
          .insert(baseConsultationData)
          .select()
          .single();
      }
      if (result.error) throw result.error;
      return { data: result.data, isDraft };
    },
    onSuccess: ({ isDraft }) => {
      if (isDraft) {
        setAutoSaveStatus({ status: 'saved', timestamp: format(new Date(), 'h:mm a') });
      } else {
        if (appointment?.id && appointment?.status !== 'Completed') {
          updateAppointmentStatusMutation.mutate({ appointmentId: appointment.id, status: 'Completed' });
        }
        toast("Consultation saved successfully!");
        setShouldClose(true);
      }
      queryClient.invalidateQueries({ queryKey: ['appointments', activeClinic?.clinic_id] });
      queryClient.invalidateQueries({ queryKey: ['consultation', appointment?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data', activeClinic?.clinic_id] });
    },
    onError: (error: Error) => {
      setAutoSaveStatus({ status: 'error' });
      toast("Error saving consultation", { 
        description: `Failed to save consultation: ${error.message}` 
      });
    },
  });

  // Auto-save
  useEffect(() => {
    if (!form.formState.isDirty || isPreviewMode || isConfirming) return;
    const timeout = setTimeout(() => {
      setAutoSaveStatus({ status: 'saving' });
      saveMutation.mutate({ values: form.getValues(), isDraft: true });
    }, 2000);
    return () => clearTimeout(timeout);
  }, [form.formState.isDirty, isPreviewMode, isConfirming, saveMutation, form]);

  const onSubmit = useCallback((values: ConsultationFormValues, isDraft = false) => {
    if (!isDraft && !isConfirming) {
      setIsConfirming(true);
      return;
    }
    setIsConfirming(false);
    setIsPreviewMode(false);
    saveMutation.mutate({ values, isDraft });
  }, [isConfirming, saveMutation]);

  const getAge = useCallback((dateString?: string | null): string => {
    if (!dateString) return '';
    const dob = new Date(dateString);
    if (isNaN(dob.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return `${age}y`;
  }, []);

  const handleOpenChange = useCallback((newOpen: boolean, onOpenChange: (open: boolean) => void) => {
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
  }, [form, shouldClose]);

  return {
    // Form
    form,
    onSubmit,
    
    // Data
    doctorDetails,
    existingConsultation,
    effectiveDepartmentType,
    currentSpecialtySections,
    currentSpecialtyFields,
    
    // State
    isPreviewMode,
    setIsPreviewMode,
    isConfirming,
    setIsConfirming,
    editedFields,
    autoSaveStatus,
    
    // Loading states
    isLoadingConsultation,
    isLoadingDoctorDetails,
    isSaving: saveMutation.isPending,
    
    // Utils
    getAge,
    handleOpenChange,
    
    // Flags
    isCurrentUserSuperadminConsulting: activeClinicRole === 'superadmin' && user?.id === appointment?.doctor_id,
  };
}; 