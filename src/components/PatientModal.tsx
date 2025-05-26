import { useState, useEffect, useCallback } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarCheck, FileText, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Patient as PatientType } from "@/types/database";
import { Database } from "@/integrations/supabase/types";
import { AppointmentModal, AppointmentType } from "./AppointmentModal";
import { supabase } from "@/integrations/supabase/client";
import { MedicalRecordModal } from "./MedicalRecordModal";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface PatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: PatientType | null;
  onPatientCreated?: (patient: PatientType) => void;
}

export function PatientModal({ open, onOpenChange, patient, onPatientCreated }: PatientModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const isNewPatient = !patient;
  const [loading, setLoading] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [patientAppointments, setPatientAppointments] = useState<AppointmentType[]>([]);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentPatient, setAppointmentPatient] = useState<PatientType | null>(null);

  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [selectedAppointmentForConsultation, setSelectedAppointmentForConsultation] = useState<AppointmentType | null>(null);

  const [formData, setFormData] = useState<Partial<PatientType>>({
    name: patient?.name || "",
    gender: patient?.gender || "",
    phone: patient?.phone || "",
    email: patient?.email || "",
    address: patient?.address || "",
  });

  const fetchPatientAppointments = useCallback(async (patientId: string) => {
    setAppointmentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, patients(name)')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

      if (error) {
        console.error("Error fetching patient appointments:", error);
        toast({ title: "Error fetching appointments", description: error.message, variant: "destructive" });
        setPatientAppointments([]);
      } else {
        const formattedAppointments: AppointmentType[] = (data || []).map(apt => ({
          ...apt,
          patients: apt.patients ? [apt.patients] : null,
          doctors: null,
        })) as AppointmentType[];
        setPatientAppointments(formattedAppointments);
      }
    } catch (error: unknown) {
      console.error("Error fetching patient appointments:", error);
      toast({ title: "Error fetching appointments", description: (error as Error).message || "An unexpected error occurred.", variant: "destructive" });
      setPatientAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  }, [setAppointmentsLoading, setPatientAppointments, toast]);

  useEffect(() => {
    if (open && patient) {
      setFormData({
        name: patient.name || "",
        gender: patient.gender || "",
        phone: patient.phone || "",
        email: patient.email || "",
        address: patient.address || "",
      });
      setActiveTab("details");
      fetchPatientAppointments(patient.id);
    } else if (open && isNewPatient) {
      setActiveTab("details");
    }

    if (open && isNewPatient) {
      setFormData({
        name: "",
        gender: "",
        phone: "",
    email: "",
    address: "",
      });
    }

    if (patient) {
      fetchPatientAppointments(patient.id);
    }
  }, [open, patient, isNewPatient, fetchPatientAppointments]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof Partial<PatientType>, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({ title: "Name is required", description: "Please enter the patient's full name.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (isNewPatient) {
        const patientToInsert: Database["public"]["Tables"]["patients"]["Insert"] = {
          name: formData.name,
          gender: formData.gender,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
        };
        const { data, error } = await supabase
          .from('patients')
          .insert([patientToInsert])
          .select()
          .single();

        if (error) {
          console.error("Error creating patient:", error);
          toast({ title: "Error creating patient", description: error.message, variant: "destructive" });
          setLoading(false);
          return;
        }

        console.log("Created patient:", data);
        toast({ title: "Patient created", description: `${data.name} has been added to your patients list.` });
        setAppointmentPatient(data);
        setSelectedAppointmentForConsultation(null);

        if (onPatientCreated && data) {
          onPatientCreated(data);
        }

      } else {
        const { data, error } = await supabase
          .from('patients')
          .update(formData)
          .eq('id', patient.id!)
          .select()
          .single();

        if (error) {
          console.error("Error updating patient:", error);
          toast({ title: "Error updating patient", description: error.message, variant: "destructive" });
          setLoading(false);
          return;
        }

        console.log("Updated patient:", data);
        toast({ title: "Patient updated", description: `${data.name} has been updated in your patients list.` });
        onOpenChange(false);
      }
    } catch (error: unknown) {
      console.error("Error saving patient:", error);
      toast({ title: "Error saving patient", description: (error as Error).message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleAppointment = () => {
    if (!patient) {
      toast({ title: "Cannot schedule appointment", description: "Please save patient details first.", variant: "default" });
      return;
    }
    setAppointmentPatient(patient);
    setIsAppointmentModalOpen(true);
  };

  const handleAppointmentModalClose = (newAppointmentScheduled?: boolean) => {
    setIsAppointmentModalOpen(false);
    if (newAppointmentScheduled) {
      fetchPatientAppointments(patient.id);
      if (!isNewPatient) {
        onOpenChange(false);
      }
    } else if (isNewPatient) {
      onOpenChange(false);
    }
  };

  const handleAppointmentScheduledForNewPatient = () => {
    setIsAppointmentModalOpen(false);
    onOpenChange(false);
  };

  const handleConsultationClick = (appointment: AppointmentType) => {
    console.log("Selected appointment for consultation:", appointment);
    setSelectedAppointmentForConsultation(appointment);
    setIsConsultationModalOpen(true);
  };

  const handleConsultationModalClose = () => {
    setIsConsultationModalOpen(false);
    setSelectedAppointmentForConsultation(null);
    if (patient) {
      fetchPatientAppointments(patient.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNewPatient ? "Add New Patient" : "Patient Details"}</DialogTitle>
          <DialogDescription>
            {isNewPatient 
              ? "Enter the information of the new patient." 
              : "View and edit patient information."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="details" className="flex items-center">
              <User size={16} className="mr-2" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
            <TabsTrigger value="medical" className="flex items-center">
              <FileText size={16} className="mr-2" />
              <span className="hidden sm:inline">Medical</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center">
              <CalendarCheck size={16} className="mr-2" />
              <span className="hidden sm:inline">Appointments</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={formData.gender || ''}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  value={formData.email || ''}
                  onChange={handleChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange} 
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="medical" className="space-y-4 mt-4">
            {!isNewPatient ? (
              <div className="pt-4">
                <h4 className="font-medium mb-2">Medical History / Consultations</h4>
                <Separator className="my-2" />
                {appointmentsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading consultations...</p>
                ) : patientAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {patientAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{appointment.department} Consultation</p>
                          <p className="text-sm text-muted-foreground">{appointment.date ? format(new Date(appointment.date), 'PPP') : 'N/A'} at {appointment.time}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleConsultationClick(appointment)}>
                          View Consultation
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No past consultations found for this patient.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Save patient details first to view medical history.</p>
            )}
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4 mt-4">
            {!isNewPatient ? (
              <>
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Appointment History</h4>
                  <Button variant="outline" size="sm" onClick={handleScheduleAppointment}>Schedule New</Button>
                </div>
                <Separator className="my-2" />
                 {appointmentsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading appointments...</p>
                ) : patientAppointments.length > 0 ? (
                <div className="space-y-3">
                    {patientAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                          <p className="font-medium">{appointment.department} - {appointment.type}</p>
                          <div className="text-sm text-muted-foreground">{appointment.date ? format(new Date(appointment.date), 'PPP') : 'N/A'} at {appointment.time} - Status: <Badge variant={appointment.status === 'Completed' ? 'secondary' : appointment.status === 'Cancelled' ? 'destructive' : 'default'}>{appointment.status}</Badge></div>
                      </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No appointments found for this patient.</p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Save patient details first to schedule appointments.</p>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? (isNewPatient ? "Creating..." : "Updating...") : (isNewPatient ? "Create Patient" : "Update Patient")}</Button>
        </DialogFooter>
      </DialogContent>

      <AppointmentModal
        open={isAppointmentModalOpen}
        onOpenChange={(open) => {
          if (!open) handleAppointmentModalClose();
          setIsAppointmentModalOpen(open);
        }}
        appointment={null}
        patient={appointmentPatient}
        initialPatient={appointmentPatient}
        onAppointmentScheduled={handleAppointmentScheduledForNewPatient}
      />

      <MedicalRecordModal
        open={isConsultationModalOpen}
        onOpenChange={handleConsultationModalClose}
        appointment={selectedAppointmentForConsultation}
      />
    </Dialog>
  );
}
