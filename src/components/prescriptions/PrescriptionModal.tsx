import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Pill, Plus, Trash2, Calendar, User, Stethoscope } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MedicineCombobox } from "@/components/ui/medicine-combobox";

const supabase = getSupabase();

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  patient_name?: string;
  doctor_name?: string;
  date?: string;
  time?: string;
};

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

type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;

interface PrescriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultationId: string | null;
  appointment: Appointment | null;
  doctorId: string | null;
  patientId: string | null;
  clinicId: string | null;
}

export function PrescriptionModal({ 
  open, 
  onOpenChange, 
  consultationId, 
  appointment, 
  doctorId: initialDoctorId, 
  patientId: initialPatientId, 
  clinicId 
}: PrescriptionModalProps) {
  const { activeClinic } = useAuth();
  const queryClient = useQueryClient();
  const [shouldClose, setShouldClose] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(appointment?.id || null);
  const [manualDoctorId, setManualDoctorId] = useState<string | null>(initialDoctorId || null);
  const [manualPatientId, setManualPatientId] = useState<string | null>(initialPatientId || null);
  const [manualConsultationId, setManualConsultationId] = useState<string | null>(consultationId || null);

  // Fetch appointments for dropdown with detailed info
  const { data: appointmentsForSelect = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['appointments-detailed', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];
      const { data, error } = await getSupabase()
        .rpc('get_appointments_with_details_by_clinic', { clinic_id: activeClinic.clinic_id });
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!activeClinic?.clinic_id,
  });

  // Fetch doctors for manual selection
  const { data: doctors = [], isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['doctors', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];
      const { data, error } = await getSupabase().rpc('get_doctors_by_clinic_enhanced', { clinic_id: activeClinic.clinic_id });
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!activeClinic?.clinic_id,
  });

  // Fetch patients for manual selection
  const { data: patients = [], isLoading: isLoadingPatients } = useQuery({
    queryKey: ['patients', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];
      const { data, error } = await getSupabase().from('patients').select('id, name, phone').eq('clinic_id', activeClinic.clinic_id).order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!activeClinic?.clinic_id,
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
        setManualConsultationId(null); // Reset consultation when appointment changes
      }
    } else if (!selectedAppointmentId) {
      // When "No appointment" is selected, clear auto-filled data but keep manual selections
      if (!initialDoctorId && !initialPatientId) {
        setManualDoctorId(null);
        setManualPatientId(null);
        setManualConsultationId(null);
      }
    }
  }, [selectedAppointmentId, appointmentsForSelect, initialDoctorId, initialPatientId]);

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: { 
      medications: [{ name: "" }],
      notes: ""
    },
    mode: 'onChange',
  });

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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medications"
  });

  const addMedication = useCallback(() => {
    append({ name: "" });
  }, [append]);

  const removeMedication = useCallback((index: number) => {
    // Always remove the specific medication from the form array.
    remove(index);
  }, [remove]);

  // Handle medicine selection with auto-fill
  const handleMedicineSelect = (index: number, medicine: { name: string }, autoFillData: { dosage: string; route: string; suggestedFrequency?: string }) => {
    const medicationFieldName = `medications.${index}` as const;
    
    form.setValue(`${medicationFieldName}.name`, medicine.name);
    form.setValue(`${medicationFieldName}.dosage`, autoFillData.dosage || '');
    
    if (autoFillData.suggestedFrequency) {
      form.setValue(`${medicationFieldName}.frequency`, autoFillData.suggestedFrequency as "OD" | "BD" | "TDS" | "QID" | "PRN" | "Q4H" | "Q6H" | "Q8H" | "Q12H");
    } else {
      form.setValue(`${medicationFieldName}.frequency`, undefined);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (values: PrescriptionFormValues) => {
      if (!manualDoctorId || !manualPatientId || !clinicId) {
        throw new Error('Missing required information: doctor, patient, or clinic context is required.');
      }

      // Filter out medications with empty names (more strict filtering)
      const validMedications = values.medications.filter(med => med.name && med.name.trim().length > 0);
      
      if (validMedications.length === 0) {
        throw new Error('Cannot create prescription without any valid medications');
      }

      const prescriptionData = {
        consultation_id: manualConsultationId || null,
        doctor_id: manualDoctorId,
        patient_id: manualPatientId,
        clinic_id: clinicId,
        medications: validMedications,
        notes: values.notes || null,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('prescriptions')
        .insert(prescriptionData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("Prescription created successfully!", {
        description: `Prescription for ${selectedPatient?.name || 'patient'} has been saved.`
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['patient-prescriptions'] });
      
      // Auto-close modal after successful creation
      setShouldClose(true);
      setTimeout(() => {
        onOpenChange(false);
      }, 100);
    },
    onError: (error: Error) => {
      console.error("PrescriptionModal: Save error:", error);
      toast.error("Failed to save prescription", {
        description: error.message
      });
    },
  });

  const onSubmit = useCallback((values: PrescriptionFormValues) => {
    // Validate that at least one medication has a name
    const validMedications = values.medications.filter(med => med.name && med.name.trim().length > 0);
    if (validMedications.length === 0) {
      toast.error("Cannot create prescription", {
        description: "Please add at least one medication with a valid name"
      });
      return;
    }

    // Check if there are any medications with empty names
    const emptyMedications = values.medications.filter(med => !med.name || med.name.trim().length === 0);
    if (emptyMedications.length > 0) {
      toast.error("Invalid medications", {
        description: "Please remove or fill in all medications with empty names"
      });
      return;
    }

    saveMutation.mutate({
      ...values,
      medications: validMedications
    });
  }, [saveMutation]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen && form.formState.isDirty && !shouldClose && !saveMutation.isSuccess) {
      toast.warning("Unsaved Changes", {
        description: "You have unsaved changes. Please save or cancel to close."
      });
      return;
    }
    
    if (shouldClose || !newOpen) {
      onOpenChange(newOpen);
      setShouldClose(false);
      form.reset();
    }
  }, [form, onOpenChange, shouldClose, saveMutation.isSuccess]);

  const handleAppointmentChange = useCallback((value: string) => {
    setSelectedAppointmentId(value === 'none' ? null : value);
  }, []);

  const handleDoctorChange = useCallback((value: string) => {
    setManualDoctorId(value === 'none' ? null : value);
  }, []);

  const handlePatientChange = useCallback((value: string) => {
    setManualPatientId(value === 'none' ? null : value);
  }, []);

  // Check for missing context
  const missingContext = !manualDoctorId || !manualPatientId || !clinicId;
  const canCreatePrescription = !missingContext && !saveMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Pill className="h-5 w-5" />
            <span>Create New Prescription</span>
          </DialogTitle>
          <DialogDescription>
            Create a prescription by selecting or entering patient and doctor details, then adding medications with dosage instructions.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Context Selection Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Prescription Context</h3>
              </div>

              {/* Related Appointment Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Related Appointment <span className="text-muted-foreground">(optional)</span>
                </label>
                <Select
                  onValueChange={handleAppointmentChange}
                  value={selectedAppointmentId || 'none'}
                  disabled={isLoadingAppointments}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingAppointments ? "Loading appointments..." : "Select an appointment (optional)"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        <span>No appointment selected</span>
                      </div>
                    </SelectItem>
                    {appointmentsForSelect.filter((apt) => !!apt.id).map((apt) => (
                      <SelectItem key={apt.id} value={apt.id}>
                        <div className="flex flex-col">
                          <div className="font-medium">{apt.patient_name} - {apt.date}</div>
                          <div className="text-sm text-muted-foreground">{apt.doctor_name} • {apt.time}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Manual Doctor Selection (if no appointment selected) */}
              {!selectedAppointmentId && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Doctor <span className="text-destructive">*</span>
                  </label>
                  <Select
                    onValueChange={handleDoctorChange}
                    value={manualDoctorId || 'none'}
                    disabled={isLoadingDoctors}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingDoctors ? "Loading doctors..." : "Select a doctor"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select a doctor</SelectItem>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4" />
                            <span>{doctor.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Manual Patient Selection (if no appointment selected) */}
              {!selectedAppointmentId && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Patient <span className="text-destructive">*</span>
                  </label>
                  <Select
                    onValueChange={handlePatientChange}
                    value={manualPatientId || 'none'}
                    disabled={isLoadingPatients}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingPatients ? "Loading patients..." : "Select a patient"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select a patient</SelectItem>
                                              {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          <div className="flex flex-col">
                            <div className="font-medium flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {patient.name}
                            </div>
                            {patient.phone && (
                              <div className="text-sm text-muted-foreground">{patient.phone}</div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Display selected context */}
              {(selectedAppointment || (selectedDoctor && selectedPatient)) && (
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">Prescription Context</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Doctor:</span>
                        <p className="font-medium">{selectedDoctor?.name || selectedAppointment?.doctor_name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Patient:</span>
                        <p className="font-medium">{selectedPatient?.name || selectedAppointment?.patient_name}</p>
                      </div>
                      {selectedAppointment && (
                        <>
                          <div>
                            <span className="font-medium text-muted-foreground">Date:</span>
                            <p>{selectedAppointment.date}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Time:</span>
                            <p>{selectedAppointment.time}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Error message if context is missing */}
            {missingContext && (
              <Card className="border-destructive bg-destructive/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <div className="h-2 w-2 rounded-full bg-destructive"></div>
                    <h4 className="font-semibold">Missing Required Information</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please select an appointment or manually choose both a doctor and patient to create a prescription.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Medications Form */}
            {canCreatePrescription && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Medications</h3>
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 space-y-4 bg-white border-gray-200 hover:border-gray-300 transition-colors">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs font-medium">
                            {index + 1}
                          </Badge>
                          <span className="text-sm font-medium text-gray-700">
                            {form.watch(`medications.${index}.name`) || 'New Medication'}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeMedication(index);
                          }}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Medicine Name */}
                      <FormField
                        control={form.control}
                        name={`medications.${index}.name`}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Medicine Name <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <MedicineCombobox
                                value={formField.value ?? ''}
                                onValueChange={formField.onChange}
                                onMedicineSelect={(medicine, autoFillData) => handleMedicineSelect(index, medicine, autoFillData)}
                                onClear={() => {
                                  const currentMedications = form.getValues('medications');
                                  const updatedMedications = [...currentMedications];
                                  updatedMedications[index] = {
                                    ...updatedMedications[index],
                                    name: '',
                                    dosage: '',
                                    frequency: undefined
                                  };
                                  form.setValue('medications', updatedMedications);
                                }}
                                placeholder="Search for medicine..."
                                disabled={saveMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      {/* Basic Fields Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`medications.${index}.dosage`}
                          render={({ field: formField }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <FormLabel className="text-sm font-medium text-gray-700">Dosage</FormLabel>
                                {formField.value && (
                                  <Badge variant="secondary" className="text-xs">Auto-filled</Badge>
                                )}
                              </div>
                              <FormControl>
                                <Input
                                  {...formField}
                                  value={formField.value ?? ''}
                                  placeholder="e.g., 500mg"
                                  className="text-sm"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`medications.${index}.frequency`}
                          render={({ field: formField }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <FormLabel className="text-sm font-medium text-gray-700">Frequency</FormLabel>
                                {formField.value && (
                                  <Badge variant="secondary" className="text-xs">Suggested</Badge>
                                )}
                              </div>
                              <Select onValueChange={formField.onChange} value={formField.value || ''}>
                                <FormControl>
                                  <SelectTrigger className="text-sm">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="OD">OD (Once Daily)</SelectItem>
                                  <SelectItem value="BD">BD (Twice Daily)</SelectItem>
                                  <SelectItem value="TDS">TDS (Three Times Daily)</SelectItem>
                                  <SelectItem value="QID">QID (Four Times Daily)</SelectItem>
                                  <SelectItem value="PRN">PRN (As Needed)</SelectItem>
                                  <SelectItem value="Q4H">Q4H (Every 4 Hours)</SelectItem>
                                  <SelectItem value="Q6H">Q6H (Every 6 Hours)</SelectItem>
                                  <SelectItem value="Q8H">Q8H (Every 8 Hours)</SelectItem>
                                  <SelectItem value="Q12H">Q12H (Every 12 Hours)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`medications.${index}.duration`}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Duration</FormLabel>
                              <FormControl>
                                <Input
                                  {...formField}
                                  value={formField.value ?? ''}
                                  placeholder="e.g., 7 days"
                                  className="text-sm"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>



                      {/* Instructions */}
                      <FormField
                        control={form.control}
                        name={`medications.${index}.instructions`}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Special Instructions</FormLabel>
                            <FormControl>
                              <Textarea
                                {...formField}
                                value={formField.value ?? ''}
                                placeholder="Special instructions for patient..."
                                rows={2}
                                className="text-sm resize-none"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}

                  {/* Add Medication Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addMedication}
                    className="w-full h-10 text-sm font-medium border-dashed border-gray-300 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="submit" form="prescription-form" disabled={!canCreatePrescription}>
              {saveMutation.isPending ? "Saving..." : "Save Prescription"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}