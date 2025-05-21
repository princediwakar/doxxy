
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
import { FileText, Clock, FileUp } from "lucide-react";
import { MedicalRecordModal } from "@/components/MedicalRecordModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConsultationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any | null;
}

export function ConsultationModal({ open, onOpenChange, appointment }: ConsultationModalProps) {
  const [activeTab, setActiveTab] = useState("record");
  const [existingRecord, setExistingRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openMedicalRecord, setOpenMedicalRecord] = useState(false);

  useEffect(() => {
    if (open && appointment) {
      fetchMedicalRecord();
      
      // Update appointment status to "In Progress" when consultation starts
      if (appointment.status === "Scheduled") {
        updateAppointmentStatus("In Progress");
      }
    }
  }, [open, appointment]);

  const fetchMedicalRecord = async () => {
    if (!appointment) return;
    
    setLoading(true);
    try {
      // Fetch the medical record for this appointment
      const { data: medicalRecords, error: recordError } = await supabase
        .from('medical_records')
        .select(`
          *,
          neurology_records (*),
          ophthalmology_records (*),
          prescriptions (*)
        `)
        .eq('appointment_id', appointment.id)
        .single();

      if (recordError && recordError.code !== 'PGRST116') {
        // PGRST116 is "Results contain 0 rows" - not an error in this case
        throw recordError;
      }

      setExistingRecord(medicalRecords || null);
    } catch (error) {
      console.error("Error fetching medical record:", error);
      toast.error("Failed to load patient medical record");
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointment.id);
        
      if (error) throw error;
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const handleOpenMedicalRecord = () => {
    setOpenMedicalRecord(true);
  };

  const doctorSpecialty = appointment?.doctor?.includes("neuro") 
    ? "Neurology" 
    : appointment?.doctor?.includes("ophthal") || appointment?.doctor?.includes("eye")
      ? "Ophthalmology"
      : "General";
  
  const enhancedAppointment = appointment 
    ? { ...appointment, doctorSpecialty }
    : null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Consultation</DialogTitle>
            <DialogDescription>
              {appointment && (
                <span>
                  Consultation for {appointment.patient} with {appointment.doctor}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {appointment && (
            <>
              <div className="bg-muted/50 p-3 rounded-md mb-4">
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
                    <span className="font-medium">Time:</span> {appointment.time}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {appointment.type}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {appointment.status}
                  </div>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="record" className="flex items-center">
                    <FileText size={16} className="mr-2 md:mr-1" />
                    <span className="hidden md:inline">Medical Record</span>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center">
                    <Clock size={16} className="mr-2 md:mr-1" />
                    <span className="hidden md:inline">History</span>
                  </TabsTrigger>
                  <TabsTrigger value="files" className="flex items-center">
                    <FileUp size={16} className="mr-2 md:mr-1" />
                    <span className="hidden md:inline">Files</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="record" className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">Loading medical record...</div>
                  ) : (
                    <div className="space-y-4 mt-2">
                      {existingRecord ? (
                        <div>
                          <div className="space-y-2">
                            <h3 className="font-semibold">Medical Record</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {existingRecord.chief_complaint && (
                                <div>
                                  <h4 className="text-sm font-medium">Chief Complaint</h4>
                                  <p className="text-sm">{existingRecord.chief_complaint}</p>
                                </div>
                              )}
                              {existingRecord.diagnosis && (
                                <div>
                                  <h4 className="text-sm font-medium">Diagnosis</h4>
                                  <p className="text-sm">{existingRecord.diagnosis}</p>
                                </div>
                              )}
                            </div>
                            <Button onClick={handleOpenMedicalRecord}>
                              Edit Medical Record
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="mb-4">No medical record has been created for this appointment yet.</p>
                          <Button onClick={handleOpenMedicalRecord}>
                            Create Medical Record
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <div className="mt-2">
                    <h3 className="font-semibold mb-2">Patient History</h3>
                    <div className="text-sm text-muted-foreground">
                      This section will display the patient's medical history from previous appointments.
                    </div>
                    {/* Patient history content will be implemented later */}
                    <div className="text-center py-4 italic text-muted-foreground">
                      Patient history feature will be available soon.
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="files" className="space-y-4">
                  <div className="mt-2">
                    <h3 className="font-semibold mb-2">Patient Files</h3>
                    <div className="text-sm text-muted-foreground">
                      This section will allow uploading and viewing patient-related files like test results, imaging, etc.
                    </div>
                    {/* Files content will be implemented later */}
                    <div className="text-center py-4 italic text-muted-foreground">
                      File upload and management feature will be available soon.
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Medical Record Modal */}
      <MedicalRecordModal 
        open={openMedicalRecord}
        onOpenChange={setOpenMedicalRecord}
        appointment={enhancedAppointment}
        existingRecord={existingRecord}
      />
    </>
  );
}
