
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  ClipboardList, 
  History, 
  File医edical,
  Prescription
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NeurologyForm } from "./medical-records/NeurologyForm";
import { OphthalmologyForm } from "./medical-records/OphthalmologyForm";
import { PrescriptionForm } from "./medical-records/PrescriptionForm";
import { format } from "date-fns";

interface ConsultationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any | null;
  existingRecord?: any;
}

export function ConsultationModal({ 
  open, 
  onOpenChange, 
  appointment, 
  existingRecord 
}: ConsultationModalProps) {
  const [activeTab, setActiveTab] = useState("symptoms");
  const [loading, setLoading] = useState(false);
  const [patientHistory, setPatientHistory] = useState([]);
  const isExistingRecord = !!existingRecord;
  const recordType = appointment?.doctorSpecialty || '';

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
    medicines: [],
    instructions: "",
    follow_up_date: null
  });

  useEffect(() => {
    if (open && appointment?.patient_id) {
      fetchPatientHistory(appointment.patient_id);
    }
    
    if (open && existingRecord) {
      // Populate form with existing data
      setGeneralData({
        chief_complaint: existingRecord.chief_complaint || "",
        diagnosis: existingRecord.diagnosis || "",
        notes: existingRecord.notes || "",
        symptoms: existingRecord.symptoms || "",
        treatment_plan: existingRecord.treatment_plan || ""
      });
      
      // If record type specific data exists, load it
      if (existingRecord.neurologyRecord) {
        setNeurologyData({
          neurological_exam: existingRecord.neurologyRecord.neurological_exam || "",
          motor_function: existingRecord.neurologyRecord.motor_function || "",
          sensory_function: existingRecord.neurologyRecord.sensory_function || "",
          reflexes: existingRecord.neurologyRecord.reflexes || "",
          coordination: existingRecord.neurologyRecord.coordination || "",
          cognitive_assessment: existingRecord.neurologyRecord.cognitive_assessment || "",
          scan_results: existingRecord.neurologyRecord.scan_results || ""
        });
      }
      
      if (existingRecord.ophthalmologyRecord) {
        setOphthalmologyData({
          visual_acuity_right: existingRecord.ophthalmologyRecord.visual_acuity_right || "",
          visual_acuity_left: existingRecord.ophthalmologyRecord.visual_acuity_left || "",
          intraocular_pressure_right: existingRecord.ophthalmologyRecord.intraocular_pressure_right || "",
          intraocular_pressure_left: existingRecord.ophthalmologyRecord.intraocular_pressure_left || "",
          eye_examination: existingRecord.ophthalmologyRecord.eye_examination || "",
          fundoscopy: existingRecord.ophthalmologyRecord.fundoscopy || "",
          color_vision: existingRecord.ophthalmologyRecord.color_vision || "",
          peripheral_vision: existingRecord.ophthalmologyRecord.peripheral_vision || ""
        });
      }
      
      if (existingRecord.prescription) {
        setPrescriptionData({
          medicines: existingRecord.prescription.medicines || [],
          instructions: existingRecord.prescription.instructions || "",
          follow_up_date: existingRecord.prescription.follow_up_date ? new Date(existingRecord.prescription.follow_up_date) : null
        });
      }
    } else if (open) {
      // Reset form for new record
      resetFormData();
    }
  }, [open, existingRecord, appointment]);

  const resetFormData = () => {
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
  };

  const fetchPatientHistory = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          patients (name),
          doctors (name, specialization),
          appointments (date, time, status),
          neurologyRecord:neurology_records(*),
          ophthalmologyRecord:ophthalmology_records(*),
          prescription:prescriptions(*)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setPatientHistory(data || []);
    } catch (error) {
      console.error("Error fetching patient history:", error);
    }
  };

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGeneralData(prev => ({ ...prev, [name]: value }));
  };

  const updateAppointmentStatus = async (status: string) => {
    if (!appointment) return;
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointment.id);
        
      if (error) throw error;
    } catch (error) {
      console.error("Error updating appointment status:", error);
      throw error;
    }
  };

  const handleStartConsultation = async () => {
    if (!appointment) return;
    
    setLoading(true);
    try {
      await updateAppointmentStatus('In Progress');
      
      toast.success("Consultation started", {
        description: `You are now consulting with ${appointment.patient}`
      });
    } catch (error) {
      console.error("Error starting consultation:", error);
      toast.error("Failed to start consultation");
    } finally {
      setLoading(false);
    }
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
        const { error: medicalRecordError } = await supabase
          .from('medical_records')
          .update({
            chief_complaint: generalData.chief_complaint,
            diagnosis: generalData.diagnosis,
            notes: generalData.notes,
            symptoms: generalData.symptoms,
            treatment_plan: generalData.treatment_plan
          })
          .eq('id', medicalRecordId);
          
        if (medicalRecordError) throw medicalRecordError;
      }
      
      // Step 2: Save specialty-specific data
      if (recordType === 'Neurology') {
        if (existingRecord?.neurologyRecord?.id) {
          // Update existing neurology record
          const { error: neurologyError } = await supabase
            .from('neurology_records')
            .update(neurologyData)
            .eq('id', existingRecord.neurologyRecord.id);
            
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
        if (existingRecord?.ophthalmologyRecord?.id) {
          // Update existing ophthalmology record
          const { error: ophthalmologyError } = await supabase
            .from('ophthalmology_records')
            .update(ophthalmologyData)
            .eq('id', existingRecord.ophthalmologyRecord.id);
            
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
        if (existingRecord?.prescription?.id) {
          // Update existing prescription
          const { error: prescriptionError } = await supabase
            .from('prescriptions')
            .update({
              medicines: prescriptionData.medicines,
              instructions: prescriptionData.instructions,
              follow_up_date: prescriptionData.follow_up_date ? 
                new Date(prescriptionData.follow_up_date).toISOString().split('T')[0] : null
            })
            .eq('id', existingRecord.prescription.id);
            
          if (prescriptionError) throw prescriptionError;
        } else {
          // Create new prescription
          const { error: prescriptionError } = await supabase
            .from('prescriptions')
            .insert({
              medical_record_id: medicalRecordId,
              patient_id: appointment.patient_id,
              doctor_id: appointment.doctor_id,
              medicines: prescriptionData.medicines,
              instructions: prescriptionData.instructions,
              follow_up_date: prescriptionData.follow_up_date ? 
                new Date(prescriptionData.follow_up_date).toISOString().split('T')[0] : null
            });
            
          if (prescriptionError) throw prescriptionError;
        }
      }
      
      // Step 4: Update appointment status to "Completed"
      await updateAppointmentStatus('Completed');
      
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
          <DialogTitle className="flex items-center gap-2">
            {!isExistingRecord && appointment?.status !== "In Progress" ? (
              <>Start Consultation</>
            ) : (
              <>Patient Consultation</>
            )}
          </DialogTitle>
          <DialogDescription>
            {isExistingRecord 
              ? `Updating medical record for ${appointment?.patient}`
              : `Creating medical record for ${appointment?.patient}`}
          </DialogDescription>
        </DialogHeader>

        {appointment && (
          <div className="bg-muted/50 p-3 rounded-md">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Patient:</span> {appointment.patient}
              </div>
              <div>
                <span className="font-medium">Doctor:</span> {appointment.doctor}
              </div>
              <div>
                <span className="font-medium">Date:</span> {new Date(appointment.date).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Department:</span> {appointment.doctorSpecialty}
              </div>
            </div>
          </div>
        )}

        {!isExistingRecord && appointment?.status !== "In Progress" ? (
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              You are about to start a consultation with {appointment?.patient}. 
              Click the button below to start.
            </p>
            <div className="flex justify-center">
              <Button onClick={handleStartConsultation} disabled={loading}>
                {loading ? "Starting..." : "Start Consultation"}
              </Button>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="symptoms" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                <span className="hidden sm:inline">Symptoms</span>
              </TabsTrigger>
              <TabsTrigger value="diagnosis" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Diagnosis</span>
              </TabsTrigger>
              <TabsTrigger value="specialty">
                <span className="hidden sm:inline">
                  {recordType === 'Neurology' ? 'Neurology' : 'Ophthalmology'}
                </span>
                <span className="sm:hidden">Exam</span>
              </TabsTrigger>
              <TabsTrigger value="prescription" className="flex items-center gap-2">
                <Prescription className="h-4 w-4" />
                <span className="hidden sm:inline">Prescription</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="symptoms" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="chief_complaint" className="block text-sm font-medium">
                    Chief Complaint
                  </label>
                  <textarea
                    id="chief_complaint"
                    name="chief_complaint"
                    value={generalData.chief_complaint}
                    onChange={handleGeneralChange}
                    placeholder="Patient's main complaint"
                    className="w-full h-24 px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="symptoms" className="block text-sm font-medium">
                    Symptoms
                  </label>
                  <textarea
                    id="symptoms"
                    name="symptoms"
                    value={generalData.symptoms}
                    onChange={handleGeneralChange}
                    placeholder="Detailed description of symptoms"
                    className="w-full h-32 px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="notes" className="block text-sm font-medium">
                    Clinical Notes
                  </label>
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

            <TabsContent value="diagnosis" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="diagnosis" className="block text-sm font-medium">
                    Diagnosis
                  </label>
                  <textarea
                    id="diagnosis"
                    name="diagnosis"
                    value={generalData.diagnosis}
                    onChange={handleGeneralChange}
                    placeholder="Preliminary or final diagnosis"
                    className="w-full h-24 px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="treatment_plan" className="block text-sm font-medium">
                    Treatment Plan
                  </label>
                  <textarea
                    id="treatment_plan"
                    name="treatment_plan"
                    value={generalData.treatment_plan}
                    onChange={handleGeneralChange}
                    placeholder="Treatment plan and recommendations"
                    className="w-full h-32 px-3 py-2 border rounded-md"
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
                doctorName={appointment?.doctor || ''}
                patientName={appointment?.patient || ''}
                specialty={recordType}
              />
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Patient Medical History</h3>
                
                {patientHistory.length > 0 ? (
                  <div className="space-y-4">
                    {patientHistory.map((record: any) => (
                      <div key={record.id} className="border rounded-md p-4">
                        <div className="flex justify-between mb-2">
                          <div>
                            <p className="font-medium">{format(new Date(record.created_at), 'PPP')}</p>
                            <p className="text-sm text-muted-foreground">
                              Dr. {record.doctors?.name} • {record.record_type}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          {record.chief_complaint && (
                            <p><span className="font-medium">Chief Complaint:</span> {record.chief_complaint}</p>
                          )}
                          
                          {record.diagnosis && (
                            <p><span className="font-medium">Diagnosis:</span> {record.diagnosis}</p>
                          )}
                          
                          {record.treatment_plan && (
                            <p><span className="font-medium">Treatment Plan:</span> {record.treatment_plan}</p>
                          )}
                          
                          {record.prescription && record.prescription.medicines && record.prescription.medicines.length > 0 && (
                            <div>
                              <p className="font-medium">Prescribed Medications:</p>
                              <ul className="list-disc pl-5 mt-1">
                                {record.prescription.medicines.map((medicine: any, index: number) => (
                                  <li key={index}>
                                    {medicine.name} - {medicine.dosage}
                                    {medicine.frequency && ` • ${medicine.frequency}`}
                                    {medicine.duration && ` • ${medicine.duration}`}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No previous medical records found for this patient.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          {(isExistingRecord || appointment?.status === "In Progress") && (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save Medical Record"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
