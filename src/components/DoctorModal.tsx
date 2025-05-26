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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Doctor, Patient, Appointment } from "@/types/database";

// Define a type for the fetched appointment data with nested patient information
interface FetchedAppointmentWithPatient {
  id?: string; // id is not always fetched (e.g., in fetchDoctorPatientList)
  date: string;
  time?: string; // time is not always fetched
  type?: string; // type is not always fetched
  status?: string; // status is not always fetched
  department?: string; // department is not always fetched
  patients: { // Nested patient object
    id: string;
    name: string;
  } | null;
}

interface DoctorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: Doctor | null;
}

export function DoctorModal({ open, onOpenChange, doctor }: DoctorModalProps) {
  const isNewDoctor = !doctor;
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    specialization: "" as 'Neurology' | 'Ophthalmology' | "",
    email: "",
    phone: "",
    availability: "Available",
    bio: "",
    workDays: [] as string[],
    workHours: {
      start: "09:00",
      end: "17:00"
    }
  });

  useEffect(() => {
    if (open && doctor) {
      fetchDoctorBasicDetails(doctor.id);
      setActiveTab("details");
      setPatientList([]);
      setTodayAppointments([]);

      setFormData({
        name: doctor.name || "",
        specialization: doctor.specialization || "",
        email: doctor.email || "",
        phone: doctor.phone || "",
        availability: doctor.availability || "Available",
        bio: doctor.bio || "",
        workDays: [],
        workHours: {
          start: "09:00",
          end: "17:00"
        }
      });
    } else if (open && !doctor) {
      setFormData({
        name: "",
        specialization: "",
        email: "",
        phone: "",
        availability: "Available",
        bio: "",
        workDays: [],
        workHours: {
          start: "09:00",
          end: "17:00"
        }
      });
      setPatientList([]);
      setTodayAppointments([]);
      setActiveTab("details");
    }
  }, [open, doctor]);

  const fetchDoctorBasicDetails = async (doctorId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('name, specialization, email, phone, availability, bio')
        .eq('id', doctorId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name || "",
          specialization: data.specialization || "",
          email: data.email || "",
          phone: data.phone || "",
          availability: data.availability || "Available",
          bio: data.bio || "",
          workDays: [],
          workHours: {
            start: "09:00",
            end: "17:00"
          }
        });
      }
    } catch (error) {
      console.error("Error fetching doctor basic details:", error);
      toast.error("Failed to load doctor basic details");
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAppointments = async (doctorId: string) => {
    setScheduleLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          type,
          status,
          patients!inner(
            id,
            name
          )
        `)
        .eq('doctor_id', doctorId)
        .eq('date', today)
        .order('time', { ascending: true });

      if (error) throw error;

      // Cast data to the new interface array
      setTodayAppointments(data as Appointment[] || []); // Keep as Appointment[] for state compatibility for now, casting fetched data internally if needed for processing
    } catch (error) {
      console.error("Error fetching today's appointments:", error);
      toast.error("Failed to load today's appointments");
      setTodayAppointments([]);
    } finally {
      setScheduleLoading(false);
    }
  };

  const fetchDoctorPatientList = async (doctorId: string) => {
    setPatientsLoading(true);
    try {
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          date,
          patients!inner(
            id,
            name
          )
        `)
        .eq('doctor_id', doctorId)
        .order('date', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      const uniquePatients: (Patient & { lastVisit: string })[] = [];
      const patientMap = new Map<string, boolean>(); // Use a map to track seen patient IDs

      // Use the new interface for appointments data
      if (appointments) {
        const patientLatestVisitMap = new Map<string, string>();
        (appointments as FetchedAppointmentWithPatient[]).forEach((app) => {
          if (app.patients && !patientLatestVisitMap.has(app.patients.id)) {
            patientLatestVisitMap.set(app.patients.id, app.date);
          }
        });

        (appointments as FetchedAppointmentWithPatient[]).forEach((app) => {
          if (app.patients && !patientMap.has(app.patients.id)) {
            patientMap.set(app.patients.id, true);
            uniquePatients.push({
              id: app.patients.id,
              name: app.patients.name,
              lastVisit: patientLatestVisitMap.get(app.patients.id) || ''
            } as Patient & { lastVisit: string });
          }
        });
      }

      uniquePatients.sort((a, b) => a.name.localeCompare(b.name));

      setPatientList(uniquePatients);
    } catch (error) {
      console.error("Error fetching doctor's patient list:", error);
      toast.error("Failed to load doctor's patient list");
      setPatientList([]);
    } finally {
      setPatientsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.specialization) {
      toast.error("Please select a specialization");
      return;
    }

    setLoading(true);
    try {
      const doctorData = {
        name: formData.name,
        specialization: formData.specialization as 'Neurology' | 'Ophthalmology',
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio
      };

      if (isNewDoctor) {
        const { error } = await supabase
          .from('doctors')
          .insert({
            ...doctorData
          });

        if (error) throw error;
        
        // Call the new Edge Function to invite the doctor via email
        const { data: inviteData, error: inviteError } = await supabase.functions.invoke('invite-doctor', { body: { email: formData.email } });

        if (inviteError) {
          console.error("Error inviting user:", inviteError);
          // Optionally handle the error, e.g., show a warning that the doctor was added but invite failed
          toast.warning("Doctor profile created, but failed to send invitation email.");
        } else {
           toast.success("Doctor profile created and invitation email sent", {
             description: `${formData.name} has been added to your doctors list and an invitation email has been sent to ${formData.email}.`,
           });
           console.log("Invitation data:", inviteData); // Log invitation data for debugging
        }
        
      } else {
        const { data, error } = await supabase
          .from('doctors')
          .update(doctorData)
          .eq('id', doctor.id)
          .select()
          .single();

        if (error) throw error;
        
        toast.success("Doctor profile updated", {
          description: `${formData.name} has been updated in your doctors list.`,
        });
      }
      
    } catch (error) {
      console.error("Error saving doctor:", error);
      toast.error(isNewDoctor ? "Failed to create doctor profile" : "Failed to update doctor profile");
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };
  
  // For displaying initials when no image is available
  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNewDoctor ? "Add New Doctor" : "Doctor Profile"}</DialogTitle>
          <DialogDescription>
            {isNewDoctor 
              ? "Enter the information of the new doctor." 
              : "View and edit doctor information."}
          </DialogDescription>
        </DialogHeader>

        {!isNewDoctor && (
          <div className="flex items-center space-x-4 my-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {getInitials(doctor?.name || "")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-lg">{doctor?.name}</h3>
              <p className="text-muted-foreground">{doctor?.specialization}</p>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          // Fetch data for the selected tab if the doctor is not new
          if (doctor) {
            if (value === 'schedule') {
              fetchTodayAppointments(doctor.id);
            } else if (value === 'patients') {
              fetchDoctorPatientList(doctor.id);
            }
          }
        }} className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="details" className="flex items-center">
              <User size={16} className="mr-2" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center">
              <Calendar size={16} className="mr-2" />
              <span className="hidden sm:inline">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center">
              <FileText size={16} className="mr-2" />
              <span className="hidden sm:inline">Patients</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={formData.name} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Select 
                  value={formData.specialization} 
                  onValueChange={(value) => handleSelectChange("specialization", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Neurology">Neurology</SelectItem>
                    <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone"
                  value={formData.phone} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="availability">Availability Status</Label>
                <Select 
                  value={formData.availability} 
                  onValueChange={(value) => handleSelectChange("availability", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Busy">Busy</SelectItem>
                    <SelectItem value="Away">Away</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biography</Label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full h-24 px-3 py-2 border rounded-md"
                placeholder="Enter doctor's professional biography..."
              />
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 mt-4">
            {!isNewDoctor && (
              <div>
                <h4 className="font-medium mb-2">Today's Schedule</h4>
                {scheduleLoading ? (
                  <p className="text-sm text-muted-foreground">Loading schedule...</p>
                ) : todayAppointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No appointments scheduled for today.</p>
                ) : (
                  <div className="space-y-2">
                    {todayAppointments.map((appointment: Appointment) => (
                      <div key={appointment.id} className="p-3 border rounded-md flex justify-between">
                        <div>
                          <p className="font-medium">{appointment.patients?.name}</p>
                          <p className="text-sm text-muted-foreground">{appointment.type}</p>
                        </div>
                        <p className="text-sm font-medium">{appointment.time}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="patients" className="mt-4">
            {!isNewDoctor ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Patient List</h4>
                  <span className="text-sm text-muted-foreground">Total: {patientList.length} patients</span>
                </div>
                <Separator />
                {patientsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading patients...</p>
                ) : patientList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No patients assigned to this doctor yet.</p>
                ) : (
                  <div className="space-y-2">
                    {patientList.map((patient: Patient & { lastVisit: string }) => (
                      <div key={patient.id} className="p-3 border rounded-md flex justify-between items-center">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(patient.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-xs text-muted-foreground">Last visit: {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Save doctor profile first to assign patients.</p>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isNewDoctor ? "Create Profile" : "Update Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
