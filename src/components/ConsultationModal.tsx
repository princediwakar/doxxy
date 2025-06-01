import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrescriptionForm } from "./medical-records/PrescriptionForm";
import { supabase } from "@/integrations/supabase/client";
import { Database, Json, Tables } from "@/integrations/supabase/types"; // Ensure Tables is imported
import { AppointmentModal } from "./AppointmentModal"; // Only need AppointmentModal component
import { PatientModal } from "./PatientModal";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Define simplified local types for data structures used in the modal
// These should align with the data fetched/handled and help avoid deep type issues.

// Define AppointmentTypeWithClinic explicitly to ensure correct properties
// Add clinic_id if it's on the appointments table and needed
// Ensure patients and doctors are defined as arrays of objects with necessary fields
// Note: The actual definition of AppointmentType should ideally come from a shared types file
// or be consistent with how appointments are fetched elsewhere (e.g., in DoctorDashboard).
// Based on usage like appointment?.patients?.[0]?.name, patients and doctors are expected to be arrays.
// Added clinic_id and department based on expected usage in this modal.
// Include base properties from appointments table explicitly based on types.ts
export interface AppointmentTypeWithClinic {
  id: string;
  created_at: string | null; // types.ts says string | null
  date: string;
  doctor_id: string;
  notes: string | null;
  patient_id: string;
  status: string;
  time: string;
  type: string;
  clinic_id: string; // Added as per schema change
  department: string; // Keep as expected prop on appointment, fetched elsewhere
  // Joined relations - matching expected structure in UI
  patients?: { id: string; name: string; }[] | null;
  doctors?: { id: string; name: string; }[] | null;
}

interface SimpleConsultationData {
  id?: string;
  appointment_id: string; // Link to the current appointment
  patient_id: string;
  doctor_id: string;
  clinic_id: string;
  specialty: string; // From appointment/department
  specialty_data: Json | null; // For future template data
  clinical_notes: Json | null; // General notes will go here
  created_at?: string | null;
}

interface SimpleMedicalRecordData { // Minimal data needed for finding/creating
  id?: string;
  patient_id: string;
  clinic_id: string;
  chief_complaint: string | null;
  diagnosis: string | null;
  notes: string | null; // Duplicated in consultation, might need refinement later
  symptoms: string | null;
  treatment_plan: string | null;
  created_at?: string | null;
}

interface SimplePrescriptionData { // Simplified for form handling
  id?: string;
  consultation_id?: string | null; // Link to the current consultation
  medical_record_id?: string | null; // Link to the medical record
  patient_id: string;
  doctor_id: string;
  clinic_id: string;
  medicines: Array<{ name: string; dosage: string; frequency: string; duration: string; }>;
  instructions: string | null;
  follow_up_date: Date | null; // Use Date object for form, convert for DB
  created_at?: string | null;
}

// Define the main interface for data passed to the modal
interface ConsultationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentTypeWithClinic | null; // Appointment data, including patient and doctor joins
  onConsultationSaved?: () => Promise<void>; // Add the new prop
  // We won't pass an 'existingRecord' directly anymore, but fetch based on appointment
}

// Define interface for the data structure returned by the fetchConsultationData query
// This matches the select `*, medical_records (*), prescriptions (*)` structure
// Inherits base columns from consultations table via Tables<'consultations'>
interface ConsultationFetchResult extends Tables<'consultations'> {
    // medical_record_id and specialty_data are part of Tables<'consultations'> (Row)
    // Note: medical_record_id is NOT on consultations based on current types.ts
    medical_records: Tables<'medical_records'>[] | null; // medical_records relation returns an array
    prescriptions: Tables<'prescriptions'>[] | null; // prescriptions relation returns an array
}

export function ConsultationModal({
  open,
  onOpenChange,
  appointment,
  onConsultationSaved
}: ConsultationModalProps) {
  const { activeClinic, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);

  // State for the data to be saved
  const [consultationData, setConsultationData] = useState<Partial<SimpleConsultationData>>({});
  const [medicalRecordData, setMedicalRecordData] = useState<Partial<SimpleMedicalRecordData>>({});
  const [prescriptionData, setPrescriptionData] = useState<Partial<SimplePrescriptionData>>({
      medicines: []
  });

  // Effect to fetch existing data when the modal opens with an appointment
  useEffect(() => {
    const fetchConsultationData = async () => {
        if (!open || !appointment || !activeClinic) return;
        setLoading(true);
        try {
            // Fetch existing consultation for this appointment
            const { data: consultation, error: consultationError } = await supabase
                .from('consultations')
                .select(
                    `
                    *,
                    medical_records (*),
                    prescriptions (*)
                    `
                )
                .eq('appointment_id', appointment.id)
                .eq('clinic_id', activeClinic.clinic_id)
                .single();

            if (consultationError && consultationError.code !== 'PGRST116') { // PGRST116 means no rows found, which is expected for new consultations
                throw consultationError;
            }

            if (consultation) {
                // Populate state with fetched data
                // Cast the fetched data to the new interface
                const fetchedConsultation = consultation as ConsultationFetchResult;

                // Map fetched data to match SimpleConsultationData structure before setting state
                // Access properties directly from fetchedConsultation, but REMOVE medical_record_id and specialty
                setConsultationData({
                    id: fetchedConsultation.id,
                    appointment_id: fetchedConsultation.appointment_id || undefined, // appointment_id can be null
                    patient_id: fetchedConsultation.patient_id, // Access directly
                    doctor_id: fetchedConsultation.doctor_id, // Access directly
                    clinic_id: fetchedConsultation.clinic_id, // Access directly
                    specialty: appointment?.department || '', // Get from appointment prop for UI/state
                    specialty_data: fetchedConsultation.specialty_data, // specialty_data IS on consultations table
                    clinical_notes: fetchedConsultation.clinical_notes,
                    created_at: fetchedConsultation.created_at,
                });

                if (fetchedConsultation.medical_records && fetchedConsultation.medical_records.length > 0) {
                    // Assuming medical_records relationship returns an array, take the first one
                    // Map fetched data to match SimpleMedicalRecordData structure
                    const fetchedMedicalRecord = fetchedConsultation.medical_records[0];
                    // Ensure all required properties of SimpleMedicalRecordData are included
                    setMedicalRecordData({
                        id: fetchedMedicalRecord.id,
                        patient_id: fetchedMedicalRecord.patient_id,
                        clinic_id: fetchedMedicalRecord.clinic_id,
                        chief_complaint: fetchedMedicalRecord.chief_complaint,
                        diagnosis: fetchedMedicalRecord.diagnosis,
                        notes: fetchedMedicalRecord.notes,
                        symptoms: fetchedMedicalRecord.symptoms,
                        treatment_plan: fetchedMedicalRecord.treatment_plan,
                        created_at: fetchedMedicalRecord.created_at,
                    });
                }

                if (fetchedConsultation.prescriptions && fetchedConsultation.prescriptions.length > 0) {
                    const existingPrescription = fetchedConsultation.prescriptions[0]; // Assuming one prescription per consultation for simplicity now
                     setPrescriptionData({
                        id: existingPrescription.id,
                        consultation_id: existingPrescription.consultation_id,
                        medical_record_id: existingPrescription.medical_record_id, // Access directly
                        patient_id: existingPrescription.patient_id,
                        doctor_id: existingPrescription.doctor_id,
                        clinic_id: existingPrescription.clinic_id,
                        // Explicitly cast medications to the expected array type
                        medicines: Array.isArray(existingPrescription.medications) ? existingPrescription.medications as SimplePrescriptionData['medicines'] : [],
                        instructions: existingPrescription.instructions || "",
                        follow_up_date: existingPrescription.follow_up_date ? new Date(existingPrescription.follow_up_date) : null
                    });
                } else {
                     // Reset prescription form if no existing prescription
                    setPrescriptionData({ medicines: [], instructions: "", follow_up_date: null });
                }

            } else {
                // Initialize state for a new consultation
                 setMedicalRecordData({
                    patient_id: appointment.patient_id,
                    clinic_id: activeClinic.clinic_id,
                 });
                 setConsultationData({
                    appointment_id: appointment.id,
                    patient_id: appointment.patient_id,
                    doctor_id: appointment.doctor_id,
                    clinic_id: activeClinic.clinic_id,
                    specialty: appointment.department, // Use department as specialty for now
                    specialty_data: {},
                    clinical_notes: "",
                 });
                 setPrescriptionData({ medicines: [], instructions: "", follow_up_date: null });
            }

        } catch (error: unknown) {
            console.error("Error fetching consultation data:", error);
            toast({ title: 'Error', description: error instanceof Error ? error.message : "An unexpected error occurred.", variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    if (open) {
        fetchConsultationData();
    } else {
        // Reset state when modal closes
        setConsultationData({});
        setMedicalRecordData({});
        setPrescriptionData({ medicines: [] });
    }

  }, [toast, open, appointment, activeClinic]); // Depend on open, appointment, and activeClinic

  const handleMedicalRecordChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMedicalRecordData(prev => ({ ...prev, [name]: value }));
  };

   const handleConsultationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Assuming general notes go into clinical_notes for now
    if (name === 'notes') {
        setConsultationData(prev => ({ ...prev, clinical_notes: value as Json }));
    } else {
        // Handle other potential consultation fields if added later
        setConsultationData(prev => ({ ...prev, [name]: value }));
    }
  };

   const handleSubmit = async () => {
      if (!appointment || !appointment.id || !medicalRecordData.patient_id || !activeClinic) {
            toast({ title: 'Error', description: "Missing required information (appointment, patient, or clinic).", variant: 'destructive' });
            return;
        }

        setLoading(true);

        try {
            let currentMedicalRecordId = medicalRecordData.id;

            // Step 1: Find or Create Medical Record
            if (!currentMedicalRecordId) {
                 // Try to find an existing medical record for this patient in this clinic
                 const { data: existingMr, error: findMrError } = await supabase
                    .from('medical_records')
                    .select('id')
                    .eq('patient_id', medicalRecordData.patient_id)
                    .eq('clinic_id', activeClinic.clinic_id)
                    .single();

                if (findMrError && findMrError.code !== 'PGRST116') { // PGRST116 means no rows found
                    throw findMrError;
                }

                if (existingMr) {
                    currentMedicalRecordId = existingMr.id;
                } else {
                    // Create new medical record if none found
                    const { data: newMr, error: createMrError } = await supabase
                        .from('medical_records')
                        .insert({
                            patient_id: medicalRecordData.patient_id,
                            clinic_id: activeClinic.clinic_id,
                            chief_complaint: medicalRecordData.chief_complaint || null,
                            diagnosis: medicalRecordData.diagnosis || null,
                            notes: medicalRecordData.notes || null,
                            symptoms: medicalRecordData.symptoms || null,
                            treatment_plan: medicalRecordData.treatment_plan || null,
                        })
                        .select('id')
                        .single();

                    if (createMrError) throw createMrError;
                    currentMedicalRecordId = newMr.id;
                }
            }

             // Ensure we have a medical record ID before proceeding
            if (!currentMedicalRecordId) {
                throw new Error("Failed to find or create medical record ID.");
            }
            // Update state with the determined medical record ID
            setMedicalRecordData(prev => ({ ...prev, id: currentMedicalRecordId }));
            setConsultationData(prev => ({ ...prev, medical_record_id: currentMedicalRecordId }));

            // Step 2: Save or Update Consultation Record
            let currentConsultationId = consultationData.id;

            if (!currentConsultationId) {
                 // Create new consultation
                 const { data, error } = await supabase
                    .from('consultations')
                    .insert({
                         // Explicitly include all required fields based on the generated Insert type
                         appointment_id: appointment.id,
                         doctor_id: appointment.doctor_id,
                         clinic_id: activeClinic.clinic_id,
                         patient_id: appointment.patient_id, // Explicitly include patient_id
                         medical_record_id: currentMedicalRecordId, // Explicitly include medical_record_id
                         specialty: appointment.department,
                         specialty_data: consultationData.specialty_data || {},
                         clinical_notes: consultationData.clinical_notes || null,
                         // created_at will be set by the database
                     } as Database['public']['Tables']['consultations']['Insert'])
                    .select('id')
                    .single();

                 if (error) throw error;
                 currentConsultationId = data.id;
            } else {
                 // Update existing consultation
                 const consultationUpdatePayload: Database['public']['Tables']['consultations']['Update'] = {
                     clinical_notes: consultationData.clinical_notes || null, // Only update clinical notes
                     // Add other updatable fields here later if needed
                 };

                 const { error } = await supabase
                    .from('consultations')
                    .update(consultationUpdatePayload)
                    .eq('id', currentConsultationId)
                    .eq('clinic_id', activeClinic.clinic_id);

                 if (error) throw error;
            }

             // Ensure we have a consultation ID before proceeding
            if (!currentConsultationId) {
                throw new Error("Failed to create or update consultation record ID.");
            }
            // Update state with the determined consultation ID
            setConsultationData(prev => ({ ...prev, id: currentConsultationId }));
            // Update prescription data state, ensuring 'medicines' is always an array
            setPrescriptionData(prev => ({
                ...prev,
                consultation_id: currentConsultationId,
                medical_record_id: currentMedicalRecordId,
                medicines: prev.medicines || [] // Ensure medicines is an array
            }));

            // Step 3: Save or Update Prescription if it exists or delete if empty
            if (prescriptionData.medicines && prescriptionData.medicines.length > 0) { // Use .medicines
                const prescriptionPayload: Database['public']['Tables']['prescriptions']['Insert'] | Database['public']['Tables']['prescriptions']['Update'] = {
                   medical_record_id: currentMedicalRecordId,
                   consultation_id: currentConsultationId, // Link to the created/found consultation ID
                   patient_id: appointment.patient_id,
                   doctor_id: appointment.doctor_id,
                   clinic_id: activeClinic.clinic_id,
                   medications: prescriptionData.medicines as Json, // Save medicines as JSON
                   instructions: prescriptionData.instructions || null,
                   follow_up_date: prescriptionData.follow_up_date ?
                     new Date(prescriptionData.follow_up_date).toISOString().split('T')[0] : null,
                };

                if (!prescriptionData.id) {
                  // Create new prescription
                  const { error } = await supabase
                    .from('prescriptions')
                    .insert(prescriptionPayload as Database['public']['Tables']['prescriptions']['Insert']);

                  if (error) throw error;
                } else {
                  // Update existing prescription
                  const { error } = await supabase
                    .from('prescriptions')
                    .update(prescriptionPayload as Database['public']['Tables']['prescriptions']['Update'])
                    .eq('id', prescriptionData.id)
                    .eq('clinic_id', activeClinic.clinic_id); // Filter by clinic_id for safety

                  if (error) throw error;
                }
            } else { // If prescription data is empty but an existing prescription exists, delete it
                if (prescriptionData.id) {
                    const { error } = await supabase
                      .from('prescriptions')
                      .delete()
                      .eq('id', prescriptionData.id)
                      .eq('clinic_id', activeClinic.clinic_id);

                    if (error) {
                        console.error("Error deleting empty prescription:", error);
                        toast({ title: 'Error', description: error.message, variant: 'destructive' });
                    }
              }
            }

            // Step 4: Update appointment status to "Completed"
            const { error: appointmentError } = await supabase
                .from('appointments')
                .update({ status: 'Completed' })
                .eq('id', appointment.id)
                .eq('clinic_id', activeClinic.clinic_id);

            if (appointmentError) throw appointmentError;

            toast({ title: 'Success', description: "Consultation record saved successfully", variant: 'default' });

            onOpenChange(false); // Close modal on success

            if (onConsultationSaved) {
                onConsultationSaved(); // Call the callback
            }

        } catch (error: unknown) {
            console.error("Error saving consultation record:", error);
            toast({ title: 'Error', description: error instanceof Error ? error.message : "An unexpected error occurred.", variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Consultation Record</DialogTitle>
          <DialogDescription>
            {`Documenting consultation for ${appointment?.patients?.[0]?.name || 'N/A'}`}
          </DialogDescription>
        </DialogHeader>

        {appointment && (
          <div className="bg-muted/50 p-3 rounded-md">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Patient:</span> {appointment.patients?.[0]?.name || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Doctor:</span> {appointment.doctors?.[0]?.name || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Date:</span> {new Date(appointment.date).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Department:</span> {appointment.department}
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="prescription">Prescription</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-4">
               {/* Fields for Medical Record (General History) */}
              <div className="space-y-2">
                <Label htmlFor="chief_complaint">Chief Complaint</Label>
                <Input
                  id="chief_complaint"
                  name="chief_complaint"
                  value={medicalRecordData.chief_complaint || ''}
                  onChange={handleMedicalRecordChange}
                  placeholder="Patient's main complaint"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms</Label>
                <textarea
                  id="symptoms"
                  name="symptoms"
                  value={medicalRecordData.symptoms || ''}
                  onChange={handleMedicalRecordChange}
                  className="w-full h-24 px-3 py-2 border rounded-md"
                  placeholder="Detailed description of symptoms"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input
                  id="diagnosis"
                  name="diagnosis"
                  value={medicalRecordData.diagnosis || ''}
                  onChange={handleMedicalRecordChange}
                  placeholder="Preliminary or final diagnosis"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment_plan">Treatment Plan</Label>
                <textarea
                  id="treatment_plan"
                  name="treatment_plan"
                  value={medicalRecordData.treatment_plan || ''}
                  onChange={handleMedicalRecordChange}
                  className="w-full h-24 px-3 py-2 border rounded-md"
                  placeholder="Treatment plan and recommendations"
                />
              </div>

               {/* Field for Consultation Specific Notes */}
              <div className="space-y-2">
                <Label htmlFor="clinical_notes">Clinical Notes (This Consultation)</Label>
                <textarea
                  id="clinical_notes"
                  name="notes" // Map to 'notes' for ease of handling in change handler
                  value={(consultationData.clinical_notes as string) || ''} // Cast Json to string for textarea value
                  onChange={handleConsultationChange}
                  className="w-full h-24 px-3 py-2 border rounded-md"
                  placeholder="Additional observations and clinical notes for this appointment"
                />
              </div>
            </div>
          </TabsContent>

          {activeTab === 'prescription' && (
            <TabsContent value="prescription" className="mt-4">
              <PrescriptionForm
                data={prescriptionData as SimplePrescriptionData}
                setData={setPrescriptionData}
                doctorName={appointment?.doctors?.[0]?.name || ''}
                patientName={appointment?.patients?.[0]?.name || ''}
                specialty={appointment?.department || ''} // Use department as specialty
              />
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !activeClinic || authLoading || !appointment}>Save Consultation Record</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConsultationModal; 