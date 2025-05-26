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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Doctor, Patient } from "@/types/database";

export interface AppointmentType {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  type: "Walk-in" | "Digital";
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  department: "Neurology" | "Ophthalmology";
  notes?: string;
  created_at?: string;
  patients?: { name: string }[] | null;
  doctors?: { name: string, specialization: string }[] | null;
}

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentType | null;
  patient?: Patient;
  initialPatient?: Patient;
  onAppointmentScheduled?: () => void;
}

export function AppointmentModal({ open, onOpenChange, appointment, patient, initialPatient, onAppointmentScheduled }: AppointmentModalProps) {
  const isNewAppointment = !appointment;
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    date: new Date(),
    time: "10:00 AM",
    type: "Walk-in" as "Walk-in" | "Digital",
    status: "Scheduled" as "Scheduled" | "In Progress" | "Completed" | "Cancelled",
    notes: "",
    department: "Neurology" as "Neurology" | "Ophthalmology"
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (open) {
      fetchDoctors();
      if (!patient) {
        fetchPatients();
      }
      
      if (appointment) {
        setFormData({
          patient_id: appointment.patient_id || "",
          doctor_id: appointment.doctor_id || "",
          date: new Date(appointment.date),
          time: appointment.time || "10:00 AM",
          type: appointment.type || "Walk-in",
          status: appointment.status || "Scheduled",
          notes: appointment.notes || "",
          department: appointment.department || "Neurology"
        });
        setSelectedDate(new Date(appointment.date));
      } else if (patient) {
        setFormData({
          patient_id: patient.id || "",
          doctor_id: "",
          date: new Date(),
          time: "10:00 AM",
          type: "Walk-in",
          status: "Scheduled",
          notes: "",
          department: "Neurology"
        });
        setSelectedDate(new Date());
      } else {
        setFormData({
          patient_id: initialPatient?.id || "",
          doctor_id: "",
          date: new Date(),
          time: "10:00 AM",
          type: "Walk-in",
          status: "Scheduled",
          notes: "",
          department: "Neurology"
        });
        setSelectedDate(new Date());
      }
      if (initialPatient) {
        setFormData(prev => ({
          ...prev,
          patient_id: initialPatient.id || "",
        }));
        setPatients(prevPatients => {
          if (!prevPatients.find(p => p.id === initialPatient.id)) {
            return [...prevPatients, initialPatient];
          }
          return prevPatients;
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointment, patient, initialPatient]);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching doctors:", error);
        setDoctors([]);
      } else {
        setDoctors(data || []);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setDoctors([]);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching patients:", error);
        setPatients([]);
      } else {
        setPatients(data || []);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "doctor_id") {
      const selectedDoctor = doctors.find((d) => d.id === value);
      if (selectedDoctor) {
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          department: selectedDoctor.specialization as "Neurology" | "Ophthalmology"
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({ ...prev, date }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.patient_id || !formData.doctor_id) {
      toast.error("Please select both a patient and a doctor");
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        date: format(formData.date, 'yyyy-MM-dd'),
        time: formData.time,
        type: formData.type,
        status: formData.status,
        department: formData.department,
        notes: formData.notes
      };
      
      if (isNewAppointment) {
        const { error } = await supabase
          .from('appointments')
          .insert(appointmentData);
        
        if (error) {
          console.error("Error creating appointment:", error);
          throw error;
        }
        
        toast.success("Appointment scheduled successfully");
        onOpenChange(true);
        if (onAppointmentScheduled) {
          onAppointmentScheduled();
        }
      } else {
        const { error } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', appointment!.id);
        
        if (error) {
          console.error("Error updating appointment:", error);
          throw error;
        }
        
        toast.success("Appointment updated successfully");
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast.error(isNewAppointment ? "Failed to schedule appointment" : "Failed to update appointment");
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Scheduled": return "default";
      case "In Progress": return "outline";
      case "Completed": return "secondary";
      case "Cancelled": return "destructive";
      default: return "default";
    }
  };

  const getPatientName = (id: string) => {
    const patient = patients.find((p) => p.id === id);
    return patient ? patient.name : "Select patient";
  };
  
  const getDoctorName = (id: string) => {
    const doctor = doctors.find((d) => d.id === id);
    return doctor ? doctor.name : "Select doctor";
  };
  
  const filteredDoctors = doctors.filter((doctor) => 
    doctor.specialization === formData.department
  );
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isNewAppointment ? "Schedule Appointment" : "Appointment Details"}</DialogTitle>
          <DialogDescription>
            {isNewAppointment 
              ? "Fill in the details to schedule a new appointment." 
              : "View and edit appointment details."}
          </DialogDescription>
        </DialogHeader>

        {!isNewAppointment && (
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Current Status</h3>
            <Badge variant={getStatusColor(appointment?.status)}>
              {appointment?.status}
            </Badge>
          </div>
        )}

        {(patient || initialPatient) && !appointment && (
          <div className="mb-4">
            <Label>Patient</Label>
            <div className="flex items-center">
              <Badge>{patient?.name || initialPatient?.name}</Badge>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select 
              value={formData.department} 
              onValueChange={(value) => {
                handleSelectChange("department", value);
                setFormData(prev => ({ ...prev, doctor_id: "" }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Neurology">Neurology</SelectItem>
                <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor">Doctor</Label>
            <Select 
              value={formData.doctor_id} 
              onValueChange={(value) => handleSelectChange("doctor_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select doctor">
                  {formData.doctor_id ? getDoctorName(formData.doctor_id) : "Select doctor"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {filteredDoctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="patient">Patient</Label>
            <Select 
              value={formData.patient_id} 
              onValueChange={(value) => handleSelectChange("patient_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select patient">
                  {formData.patient_id ? getPatientName(formData.patient_id) : "Select patient"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  initialFocus
                  disabled={(date) => date < new Date() && !isToday(date)}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Select 
              value={formData.time} 
              onValueChange={(value) => handleSelectChange("time", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                <SelectItem value="9:30 AM">9:30 AM</SelectItem>
                <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                <SelectItem value="10:30 AM">10:30 AM</SelectItem>
                <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                <SelectItem value="11:30 AM">11:30 AM</SelectItem>
                <SelectItem value="1:00 PM">1:00 PM</SelectItem>
                <SelectItem value="1:30 PM">1:30 PM</SelectItem>
                <SelectItem value="2:00 PM">2:00 PM</SelectItem>
                <SelectItem value="2:30 PM">2:30 PM</SelectItem>
                <SelectItem value="3:00 PM">3:00 PM</SelectItem>
                <SelectItem value="3:30 PM">3:30 PM</SelectItem>
                <SelectItem value="4:00 PM">4:00 PM</SelectItem>
                <SelectItem value="4:30 PM">4:30 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Appointment Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleSelectChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Walk-in">Walk-in</SelectItem>
                <SelectItem value="Digital">Digital</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isNewAppointment && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full h-20 px-3 py-2 border rounded-md"
            placeholder="Any additional information or special instructions..."
          />
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isNewAppointment ? "Schedule" : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function isToday(date: Date) {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}
