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
import { NeurologyForm } from "./medical-records/NeurologyForm";
import { OphthalmologyForm } from "./medical-records/OphthalmologyForm";
import { PrescriptionForm } from "./medical-records/PrescriptionForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { AppointmentType } from "./AppointmentModal";

// Define a type for MedicalRecord with potential joined tables
interface MedicalRecordWithJoins extends Tables<'medical_records'> {
  neurology_records?: Tables<'neurology_records'>[] | null; // Joined neurology records
  ophthalmology_records?: Tables<'ophthalmology_records'>[] | null; // Joined ophthalmology records
  prescriptions?: Tables<'prescriptions'>[] | null; // Joined prescriptions
}

interface MedicalRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentType | null;
  existingRecord?: MedicalRecordWithJoins;
}

export function MedicalRecordModal({ 
  open, 
  onOpenChange, 
  appointment, 
  existingRecord 
}: MedicalRecordModalProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const isExistingRecord = !!existingRecord;
  const recordType = appointment?.department || '';

  // Form states
  const [generalData, setGeneralData] = useState({
    chief_complaint: "",
    diagnosis: "",
    notes: "",
    symptoms: "",
    treatment_plan: ""
  });
  
  const [neurologyData, setNeurologyData] = useState({
    neurological_exam: "",
    motor_function: "",
    sensory_function: "",
    reflexes: "",
    coordination: "",
    cognitive_assessment: "",
    scan_results: ""
  });
  
  const [ophthalmologyData, setOphthalmologyData] = useState({
    visual_acuity_right: "",
    visual_acuity_left: "",
    intraocular_pressure_right: "",
    intraocular_pressure_left: "",
    eye_examination: "",
    fundoscopy: "",
    color_vision: "",
    peripheral_vision: ""
  });
  
  const [prescriptionData, setPrescriptionData] = useState({
    medicines: [] as { name: string; dosage: string; frequency: string; duration: string; }[],
    instructions: "",
    follow_up_date: null as Date | null
  });

  useEffect(() => {
    if (open && existingRecord) {
      // Populate form with existing data
      setGeneralData({
        chief_complaint: existingRecord.chief_complaint || "",
        diagnosis: existingRecord.diagnosis || "",
        notes: existingRecord.notes || "",
        symptoms: existingRecord.symptoms || "",
        treatment_plan: existingRecord.treatment_plan || ""
      });
      
      // If record type specific data exists, load it using correct property names from join/fetch
      // Assume existingRecord includes joined data or fetch separately if needed
      // For now, assuming existingRecord might have properties matching joined table names or fetched data shape
      if (existingRecord.neurology_records?.[0]) {
        const neuroRecord = existingRecord.neurology_records[0];
        setNeurologyData({
          neurological_exam: neuroRecord.neurological_exam || "",
          motor_function: neuroRecord.motor_function || "",
          sensory_function: neuroRecord.sensory_function || "",
          reflexes: neuroRecord.reflexes || "",
          coordination: neuroRecord.coordination || "",
          cognitive_assessment: neuroRecord.cognitive_assessment || "",
          scan_results: neuroRecord.scan_results || ""
        });
      }
      
      if (existingRecord.ophthalmology_records?.[0]) {
        const ophthRecord = existingRecord.ophthalmology_records[0];
        setOphthalmologyData({
          visual_acuity_right: ophthRecord.visual_acuity_right || "",
          visual_acuity_left: ophthRecord.visual_acuity_left || "",
          intraocular_pressure_right: ophthRecord.intraocular_pressure_right || "",
          intraocular_pressure_left: ophthRecord.intraocular_pressure_left || "",
          eye_examination: ophthRecord.eye_examination || "",
          fundoscopy: ophthRecord.fundoscopy || "",
          color_vision: ophthRecord.color_vision || "",
          peripheral_vision: ophthRecord.peripheral_vision || ""
        });
      }
      
      // Assuming prescription might be a direct property or fetched separately
      // If fetched via join on medical_records, the property might be 'prescriptions' (array) or 'prescription' (single object) depending on the query
      // For now, assuming a 'prescriptions' array property on the fetched medical record
      if (existingRecord.prescriptions?.[0]) {
        const prescriptionRecord = existingRecord.prescriptions[0];
        setPrescriptionData({
          medicines: Array.isArray(prescriptionRecord.medications)
            ? prescriptionRecord.medications as { name: string; dosage: string; frequency: string; duration: string; }[]
            : [],
          instructions: prescriptionRecord.instructions || "",
          follow_up_date: prescriptionRecord.follow_up_date ? new Date(prescriptionRecord.follow_up_date) : null
        });
      }
      
    } else if (open) {
      // Reset form for new record
      setGeneralData({
        chief_complaint: "",
        diagnosis: "",
        notes: "",
        symptoms: "",
        treatment_plan: ""
      });
      
      setNeurologyData({
        neurological_exam: "",
        motor_function: "",
        sensory_function: "",
        reflexes: "",
        coordination: "",
        cognitive_assessment: "",
        scan_results: ""
      });
      
      setOphthalmologyData({
        visual_acuity_right: "",
        visual_acuity_left: "",
        intraocular_pressure_right: "",
        intraocular_pressure_left: "",
        eye_examination: "",
        fundoscopy: "",
        color_vision: "",
        peripheral_vision: ""
      });
      
      setPrescriptionData({
        medicines: [],
        instructions: "",
        follow_up_date: null
      });
    }
  }, [open, existingRecord]);

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGeneralData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!appointment) return;
    
    setLoading(true);
    try {
      // Step 1: Save or update the medical record
      let medicalRecordId = existingRecord?.id;
      
      if (!medicalRecordId) {
        // Create new medical record
        const { data: medicalRecord, error: medicalRecordError } = await supabase
          .from('medical_records')
          .insert({
            appointment_id: appointment.id,
            patient_id: appointment.patient_id,
            doctor_id: appointment.doctor_id,
            record_type: recordType,
            chief_complaint: generalData.chief_complaint,
            diagnosis: generalData.diagnosis,
            notes: generalData.notes,
            symptoms: generalData.symptoms,
            treatment_plan: generalData.treatment_plan
          })
          .select()
          .single();
          
        if (medicalRecordError) throw medicalRecordError;
        medicalRecordId = medicalRecord.id;
      } else {
        // Update existing medical record
        const { data: medicalRecord, error: medicalRecordError } = await supabase
          .from('medical_records')
          .update({
            chief_complaint: generalData.chief_complaint,
            diagnosis: generalData.diagnosis,
            notes: generalData.notes,
            symptoms: generalData.symptoms,
            treatment_plan: generalData.treatment_plan
          })
          .eq('id', medicalRecordId)
          .select()
          .single();
          
        if (medicalRecordError) throw medicalRecordError;
      }
      
      // Step 2: Save specialty-specific data
      if (recordType === 'Neurology') {
        // Check if existing neurology record exists based on the fetched data structure
        if (existingRecord?.neurology_records?.[0]?.id) {
          // Update existing neurology record
          const { error: neurologyError } = await supabase
            .from('neurology_records')
            .update(neurologyData as any)
            .eq('id', existingRecord.neurology_records[0].id);
            
          if (neurologyError) throw neurologyError;
        } else {
          // Create new neurology record
          const { error: neurologyError } = await supabase
            .from('neurology_records')
            .insert({
              ...neurologyData,
              medical_record_id: medicalRecordId
            });
            
          if (neurologyError) throw neurologyError;
        }
      } else if (recordType === 'Ophthalmology') {
        // Check if existing ophthalmology record exists based on the fetched data structure
        if (existingRecord?.ophthalmology_records?.[0]?.id) {
          // Update existing ophthalmology record
          const { error: ophthalmologyError } = await supabase
            .from('ophthalmology_records')
            .update(ophthalmologyData as any)
            .eq('id', existingRecord.ophthalmology_records[0].id);
            
          if (ophthalmologyError) throw ophthalmologyError;
        } else {
          // Create new ophthalmology record
          const { error: ophthalmologyError } = await supabase
            .from('ophthalmology_records')
            .insert({
              ...ophthalmologyData,
              medical_record_id: medicalRecordId
            });
            
          if (ophthalmologyError) throw ophthalmologyError;
        }
      }
      
      // Step 3: Save prescription if it exists
      if (prescriptionData.medicines.length > 0) {
        // Check if existing prescription exists based on the fetched data structure
        if (existingRecord?.prescriptions?.[0]?.id) {
          // Update existing prescription
          const { error: prescriptionError } = await supabase
            .from('prescriptions')
            .update({
              medications: prescriptionData.medicines,
              instructions: prescriptionData.instructions,
              follow_up_date: prescriptionData.follow_up_date ? 
                new Date(prescriptionData.follow_up_date).toISOString().split('T')[0] : null
            })
            .eq('id', existingRecord.prescriptions[0].id);
            
          if (prescriptionError) throw prescriptionError;
        } else {
          // Create new prescription
          const { error: prescriptionError } = await supabase
            .from('prescriptions')
            .insert({
              consultation_id: appointment.id,
              patient_id: appointment.patient_id,
              doctor_id: appointment.doctor_id,
              medications: prescriptionData.medicines,
              instructions: prescriptionData.instructions,
              follow_up_date: prescriptionData.follow_up_date ? 
                new Date(prescriptionData.follow_up_date).toISOString().split('T')[0] : null
            });
            
          if (prescriptionError) throw prescriptionError;
        }
      }
      
      // Step 4: Update appointment status to "Completed"
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ status: 'Completed' })
        .eq('id', appointment.id);
        
      if (appointmentError) throw appointmentError;
      
      toast.success("Medical record saved successfully", {
        description: "The patient's medical record has been updated."
      });
      
      // Update UI
      window.location.reload();
    } catch (error) {
      console.error("Error saving medical record:", error);
      toast.error("Failed to save medical record");
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isExistingRecord ? "Edit Medical Record" : "New Medical Record"}</DialogTitle>
          <DialogDescription>
            {isExistingRecord 
              ? `Updating medical record for ${appointment?.patients?.[0]?.name}`
              : `Creating medical record for ${appointment?.patients?.[0]?.name}`}
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
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="specialty">
              {recordType === 'Neurology' ? 'Neurology' : 'Ophthalmology'}
            </TabsTrigger>
            <TabsTrigger value="prescription">Prescription</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chief_complaint">Chief Complaint</Label>
                <Input
                  id="chief_complaint"
                  name="chief_complaint"
                  value={generalData.chief_complaint}
                  onChange={handleGeneralChange}
                  placeholder="Patient's main complaint"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms</Label>
                <textarea
                  id="symptoms"
                  name="symptoms"
                  value={generalData.symptoms}
                  onChange={handleGeneralChange}
                  className="w-full h-24 px-3 py-2 border rounded-md"
                  placeholder="Detailed description of symptoms"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input
                  id="diagnosis"
                  name="diagnosis"
                  value={generalData.diagnosis}
                  onChange={handleGeneralChange}
                  placeholder="Preliminary or final diagnosis"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="treatment_plan">Treatment Plan</Label>
                <textarea
                  id="treatment_plan"
                  name="treatment_plan"
                  value={generalData.treatment_plan}
                  onChange={handleGeneralChange}
                  className="w-full h-24 px-3 py-2 border rounded-md"
                  placeholder="Treatment plan and recommendations"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Clinical Notes</Label>
                <textarea
                  id="notes"
                  name="notes"
                  value={generalData.notes}
                  onChange={handleGeneralChange}
                  className="w-full h-24 px-3 py-2 border rounded-md"
                  placeholder="Additional observations and clinical notes"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specialty" className="mt-4">
            {recordType === 'Neurology' ? (
              <NeurologyForm
                data={neurologyData}
                setData={setNeurologyData}
              />
            ) : (
              <OphthalmologyForm
                data={ophthalmologyData}
                setData={setOphthalmologyData}
              />
            )}
          </TabsContent>

          <TabsContent value="prescription" className="mt-4">
            <PrescriptionForm
              data={prescriptionData}
              setData={setPrescriptionData}
              doctorName={appointment?.doctors?.[0]?.name || ''}
              patientName={appointment?.patients?.[0]?.name || ''}
              specialty={recordType}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Medical Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
