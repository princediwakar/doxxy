
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConsultationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any | null;
}

export function ConsultationModal({ open, onOpenChange, appointment }: ConsultationModalProps) {
  const [activeTab, setActiveTab] = useState("record");
  const [existingConsultation, setExistingConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && appointment) {
      fetchConsultation();
      
      // Update appointment status to "In Progress" when consultation starts
      if (appointment.status === "Scheduled") {
        updateAppointmentStatus("In Progress");
      }
    }
  }, [open, appointment]);

  const fetchConsultation = async () => {
    if (!appointment) return;
    
    setLoading(true);
    try {
      // Fetch the consultation for this appointment
      const { data: consultation, error: consultationError } = await supabase
        .from('consultations')
        .select(`
          *,
          prescriptions (*)
        `)
        .eq('appointment_id', appointment.id)
        .single();

      if (consultationError && consultationError.code !== 'PGRST116') {
        throw consultationError;
      }

      setExistingConsultation(consultation || null);
    } catch (error) {
      console.error("Error fetching consultation:", error);
      toast.error("Failed to load consultation record");
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (status: "Scheduled" | "In Progress" | "Completed" | "Cancelled") => {
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

  const createConsultation = async () => {
    if (!appointment) return;

    try {
      const { data, error } = await supabase
        .from('consultations')
        .insert({
          appointment_id: appointment.id,
          doctor_id: appointment.doctor_id,
          patient_id: appointment.patient_id,
          department: appointment.department,
          clinical_notes: {}
        })
        .select()
        .single();

      if (error) throw error;

      setExistingConsultation(data);
      toast.success("Consultation record created");
    } catch (error) {
      console.error("Error creating consultation:", error);
      toast.error("Failed to create consultation record");
    }
  };

  return (
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
                  <span className="font-medium">Patient ID:</span> {appointment.patient_id}
                </div>
                <div>
                  <span className="font-medium">Doctor ID:</span> {appointment.doctor_id}
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
                  <span className="hidden md:inline">Consultation</span>
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
                  <div className="text-center py-8">Loading consultation record...</div>
                ) : (
                  <div className="space-y-4 mt-2">
                    {existingConsultation ? (
                      <div>
                        <div className="space-y-2">
                          <h3 className="font-semibold">Consultation Record</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium">Department</h4>
                              <p className="text-sm">{existingConsultation.department}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">Created</h4>
                              <p className="text-sm">{new Date(existingConsultation.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {existingConsultation.clinical_notes && Object.keys(existingConsultation.clinical_notes).length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium">Clinical Notes</h4>
                              <pre className="text-sm bg-muted p-2 rounded">
                                {JSON.stringify(existingConsultation.clinical_notes, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="mb-4">No consultation record has been created for this appointment yet.</p>
                        <Button onClick={createConsultation}>
                          Create Consultation Record
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="mt-2">
                  <h3 className="font-semibold mb-2">Patient History</h3>
                  <div className="text-center py-4 italic text-muted-foreground">
                    Patient history feature will be available soon.
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="files" className="space-y-4">
                <div className="mt-2">
                  <h3 className="font-semibold mb-2">Patient Files</h3>
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
  );
}
