import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ChevronDown, Save, Eye, History, Stethoscope, ClipboardList, Pill } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  neurologyNotesSchema,
  ophthalmologyNotesSchema,
  specialtyNoteFieldConfigs,
  NoteFieldConfig,
  NeurologyNotes,
  OphthalmologyNotes,
} from "@/lib/consultationNotesSchemas";
import { PrescriptionModal } from "./PrescriptionModal";

// Types
type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  patient_name?: string;
  doctor_name?: string;
  patient_date_of_birth?: string | null;
  patient_gender?: string | null;
};
type ConsultationInsert = Database['public']['Tables']['consultations']['Insert'];
type Consultation = Database['public']['Tables']['consultations']['Row'];
type DoctorDetails = Database['public']['Functions']['get_doctors_by_clinic']['Returns'][0];
type ConsultationFormValues = z.infer<typeof consultationFormSchema>;
type CombinedSpecialtyKeys = keyof NeurologyNotes | keyof OphthalmologyNotes;

// Zod schema
const consultationFormSchema = z.object({
  specialty_data: z.union([
    neurologyNotesSchema,
    ophthalmologyNotesSchema,
    z.null(),
    z.undefined(),
  ]).optional(),
});

// Section definitions for both specialties
const sectionDefinitions = [
  {
    key: "History",
    icon: History,
    fields: [
      "chief_complaint",
      "history_of_present_illness",
      "review_of_systems",
      "past_medical_history",
      "family_history",
      "social_history",
      "medications",
      "allergies",
    ],
  },
  {
    key: "Examination",
    icon: Stethoscope,
    // Neurology and Ophthalmology have some different exam fields
    neurologyFields: ["physical_exam", "neurological_exam_findings"],
    ophthalmologyFields: [
      "physical_exam",
      "visual_acuity",
      "refraction",
      "slit_lamp_exam",
      "fundus_exam",
      "intraocular_pressure",
      "visual_fields",
    ],
  },
  {
    key: "Plan",
    icon: ClipboardList,
    fields: [
      "investigations",
      "assessment",
      "treatment_plan",
      "prognosis",
      "follow_up",
      "referrals",
      "prescription",
    ],
  },
];

// Preview component
const ConsultationPreview = ({ data, fieldConfigs }: { data: ConsultationFormValues['specialty_data']; fieldConfigs: NoteFieldConfig[] }) => (
  <div className="space-y-4">
    <h3 className="text-sm font-semibold text-foreground">Consultation Summary</h3>
    {fieldConfigs.map((config) => {
      const value = data ? data[config.name as keyof typeof data] : null;
      if (!value) return null;
      return (
        <div key={config.name as string} className="border-b py-2">
          <h4 className="font-medium text-xs text-foreground">{config.label}</h4>
          <p className="text-xs text-muted-foreground">{value}</p>
        </div>
      );
    })}
  </div>
);

interface ConsultationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

export function ConsultationModal({ open, onOpenChange, appointment }: ConsultationModalProps) {
  const queryClient = useQueryClient();
  const { activeClinic } = useAuth();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [editedFields, setEditedFields] = useState<string[]>([]);
  const [shouldClose, setShouldClose] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<{ status: 'idle' | 'saving' | 'saved' | 'error'; timestamp?: string }>({ status: 'idle' });

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
          toast(
            "Error fetching doctor details",
            { description: `Failed to fetch doctor details: ${error.message}` }
          );
          throw error;
        }
        const doctor = data?.find(d => d.id === appointment.doctor_id);
        return doctor ? [doctor] : null;
      },
      enabled: open && !!appointment?.doctor_id && !!activeClinic?.clinic_id,
    });

    const departmentType = doctorDetails?.[0]?.department_name;
  const currentSpecialtyFields = departmentType ? specialtyNoteFieldConfigs[departmentType] : undefined;

  // Dynamically build sections based on departmentType
  const sections = sectionDefinitions.map((section) => {
    let fields: string[] = [];
    if (section.key === "Examination") {
      if (departmentType === "Neurology") fields = section.neurologyFields || [];
      else if (departmentType === "Ophthalmology") fields = section.ophthalmologyFields || [];
    } else {
      fields = section.fields || [];
    }
    return {
      title: section.key,
      icon: section.icon,
      fields,
    };
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
        toast(
          "Error fetching consultation",
          { description: `Failed to fetch consultation: ${error.message}` }
        );
        throw error;
      }
      return data;
    },
    enabled: open && !!appointment?.id,
  });


  // Initialize form
  useEffect(() => {
    if (existingConsultation) {
      let initialSpecialtyData: ConsultationFormValues['specialty_data'] =
        existingConsultation.specialty_data && typeof existingConsultation.specialty_data === 'object' && !Array.isArray(existingConsultation.specialty_data)
          ? existingConsultation.specialty_data
          : undefined;
      if (!initialSpecialtyData && existingConsultation.clinical_notes && typeof existingConsultation.clinical_notes === 'string') {
        const department = doctorDetails?.[0]?.department_name;
        if (department === 'Neurology' || department === 'Ophthalmology') {
          initialSpecialtyData = { chief_complaint: existingConsultation.clinical_notes };
        }
      }
      form.reset({ specialty_data: initialSpecialtyData });
    } else {
      form.reset({ specialty_data: undefined });
    }
  }, [existingConsultation, form, doctorDetails]);

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
        // On finalize, set appointment status to Completed if not already
        if (appointment?.id && appointment?.status !== 'Completed') {
          updateAppointmentStatusMutation.mutate({ appointmentId: appointment.id, status: 'Completed' });
        }
        toast(
          "Consultation saved successfully!"
        );
        setShouldClose(true);
      }
      queryClient.invalidateQueries({ queryKey: ['appointments', activeClinic?.clinic_id] });
      queryClient.invalidateQueries({ queryKey: ['consultation', appointment?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data', activeClinic?.clinic_id] });
    },
    onError: (error: Error) => {
      setAutoSaveStatus({ status: 'error' });
      toast(
        "Error saving consultation",
        { description: `Failed to save consultation: ${error.message}` }
      );
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
  }, [form.formState.isDirty, form, isPreviewMode, isConfirming, saveMutation]);

  const onSubmit = useCallback((values: ConsultationFormValues, isDraft = false) => {
    if (!isDraft && !isConfirming) {
      setIsConfirming(true);
      return;
    }
    setIsConfirming(false);
    setIsPreviewMode(false);
    saveMutation.mutate({ values, isDraft });
  }, [isConfirming, saveMutation]);

  const handleDetailedPrescription = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPrescriptionModalOpen(true);
  }, []);

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

  // Handle modal closing
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen && form.formState.isDirty && !shouldClose) {
      toast(
        "Unsaved Changes",
        { description: "You have unsaved changes. Please save or confirm to close." }
      );
      return;
    }
    if (shouldClose || !newOpen) {
      onOpenChange(newOpen);
      setShouldClose(false);
    }
  }, [form.formState.isDirty, onOpenChange, shouldClose]);

  // Add mutation for updating appointment status
  const updateAppointmentStatusMutation = useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: string, status: string }) => {
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

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[90vw] sm:max-w-[960px] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b bg-background">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base sm:text-lg font-semibold text-foreground">
                {appointment?.patient_name || 'Unknown Patient'} - Consultation
                {departmentType && (
                  <Badge variant="outline" className="ml-2 text-xs border-primary text-primary">
                    {departmentType}
                  </Badge>
                )}
              </DialogTitle>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mr-4">
                {autoSaveStatus.status === 'saving' && <span>Saving...</span>}
                {autoSaveStatus.status === 'saved' && autoSaveStatus.timestamp && (
                  <span>Saved at {autoSaveStatus.timestamp}</span>
                )}
                {autoSaveStatus.status === 'error' && <span className="text-destructive">Error</span>}
              </div>
            </div>
            {appointment && (
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Doctor:</span> {appointment.doctor_name || 'Unknown Doctor'}
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <span>{format(parseISO(appointment.date), 'PPP')} at {appointment.time}</span>
                  {appointment.patient_date_of_birth && (
                    <span>{getAge(appointment.patient_date_of_birth)} yrs</span>
                  )}
                  {appointment.patient_gender && (
                    <span className="capitalize">{appointment.patient_gender}</span>
                  )}
                </div>
              </div>
            )}
            {editedFields.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-xs text-muted-foreground">Edited:</span>
                {editedFields.slice(0, 3).map((field) => (
                  <Badge key={field} variant="secondary" className="text-xs">
                    {field}
                  </Badge>
                ))}
                {editedFields.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{editedFields.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </DialogHeader>

          <ScrollArea className="flex-1 px-4 py-3 sm:px-6 sm:py-4 overflow-y-auto">
            {isLoadingConsultation || isLoadingDoctorDetails ? (
              <div className="text-center py-6 text-muted-foreground text-xs sm:text-sm">
                Loading consultation data...
              </div>
            ) : !departmentType || !currentSpecialtyFields ? (
              <div className="text-center py-6 text-muted-foreground text-xs sm:text-sm">
                No department-specific fields available. Please ensure the doctor is assigned to a department.
              </div>
            ) : isPreviewMode ? (
              <ConsultationPreview data={form.getValues().specialty_data} fieldConfigs={currentSpecialtyFields} />
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => onSubmit(values, false))} className="space-y-4">
                  {sections.map((section, index) => (
                    <div
                      key={section.title}
                      className={`border-2 rounded-lg p-3 sm:p-4 shadow-sm ${index % 2 === 0 ? 'bg-background' : 'bg-muted'}`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <section.icon className="h-4 w-4 text-primary" />
                        <h2 className="text-sm sm:text-base font-semibold text-primary">{section.title}</h2>
                      </div>
                      <Accordion type="single" collapsible className="w-full">
                        {section.fields.map((fieldName) => {
                          const fieldConfig = currentSpecialtyFields.find((f) => f.name === fieldName);
                          if (!fieldConfig) return null;
                          const isRequired = ['chief_complaint', 'assessment'].includes(fieldConfig.name as string);
                          return (
                            <AccordionItem key={fieldConfig.name as string} value={fieldConfig.name as string}>
                              <AccordionTrigger className="text-xs sm:text-sm text-foreground hover:no-underline">
                                <div className="flex items-center gap-2">
                                  {fieldConfig.name === 'prescription' && <Pill className="h-4 w-4 text-primary" />}
                                  <span>{fieldConfig.label}</span>
                                  {isRequired && <span className="text-destructive text-xs">*</span>}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-2">
                                <FormField
                                  control={form.control}
                                  name={`specialty_data.${fieldConfig.name}` as `specialty_data.${CombinedSpecialtyKeys}`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        {fieldConfig.type === 'textarea' ? (
                                          <Textarea
                                            {...field}
                                            value={(field.value as string | null | undefined) || ''}
                                            rows={fieldConfig.rows}
                                            placeholder={fieldConfig.placeholder}
                                            className={`text-xs sm:text-sm ${isRequired ? 'border-2 border-primary bg-primary/5' : 'border-input'}`}
                                            aria-label={fieldConfig.label}
                                          />
                                        ) : (
                                          <Input
                                            {...field}
                                            value={(field.value as string | null | undefined) || ''}
                                            placeholder={fieldConfig.placeholder}
                                            className={`text-xs sm:text-sm ${isRequired ? 'border-2 border-primary bg-primary/5' : 'border-input'}`}
                                            aria-label={fieldConfig.label}
                                          />
                                        )}
                                      </FormControl>
                                      <FormMessage className="text-xs text-destructive" />
                                    </FormItem>
                                  )}
                                />
                                {fieldConfig.name === 'prescription' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 text-xs sm:text-sm relative z-10"
                                    onClick={handleDetailedPrescription}
                                  >
                                    <Pill className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    Add Detailed Prescription
                                  </Button>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </div>
                  ))}
                </form>
              </Form>
            )}
          </ScrollArea>

          <DialogFooter className="border-t bg-background px-4 py-3 sm:px-6 sm:py-4">
            {isConfirming ? (
              <div className="flex flex-col sm:flex-row gap-2 items-center justify-between w-full">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Are you sure you want to end the consultation? This will save and finalize the notes.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsConfirming(false)}
                    disabled={saveMutation.isPending}
                  >
                    Back
                  </Button>
                  <Button
                    size="sm"
                    onClick={form.handleSubmit((values) => onSubmit(values, false))}
                    disabled={saveMutation.isPending || !form.formState.isValid}
                  >
                    {saveMutation.isPending ? 'Saving...' : 'Confirm and End'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 justify-end flex-wrap">
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={saveMutation.isPending}
                    onClick={() => {
                      if (form.formState.isDirty) {
                        toast(
                          "Unsaved Changes",
                          { description: "You have unsaved changes. Please save before closing." }
                        );
                        return;
                      }
                      setShouldClose(true);
                      onOpenChange(false);
                    }}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  disabled={saveMutation.isPending || isLoadingConsultation || isLoadingDoctorDetails}
                >
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  {isPreviewMode ? 'Edit Notes' : 'Preview'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={form.handleSubmit((values) => onSubmit(values, true))}
                  disabled={saveMutation.isPending || isLoadingConsultation || isLoadingDoctorDetails}
                >
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Save Draft
                </Button>
                <Button
                  size="sm"
                  onClick={form.handleSubmit((values) => onSubmit(values, false))}
                  disabled={saveMutation.isPending || isLoadingConsultation || isLoadingDoctorDetails || !form.formState.isValid}
                >
                  End Consultation
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {existingConsultation?.id && (
        <PrescriptionModal
          open={isPrescriptionModalOpen}
          onOpenChange={setIsPrescriptionModalOpen}
          consultationId={existingConsultation.id}
          appointment={appointment}
          doctorId={appointment?.doctor_id || null}
          patientId={appointment?.patient_id || null}
          clinicId={activeClinic?.clinic_id || null}
        />
      )}
    </>
  );
}