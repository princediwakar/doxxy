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

interface DoctorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: any | null;
}

export function DoctorModal({ open, onOpenChange, doctor }: DoctorModalProps) {
  const isNewDoctor = !doctor;
  const [patientList, setPatientList] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
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

  useEffect(() => {
    if (open && doctor) {
      setFormData({
        name: doctor.name || "",
        specialty: doctor.specialty || "",
        email: doctor.email || "",
        phone: doctor.phone || "",
        availability: doctor.availability || "Available",
        bio: doctor.bio || "",
        workDays: doctor.workDays || [],
        workHours: {
          start: doctor.workHours?.start || "09:00",
          end: doctor.workHours?.end || "17:00"
        }
      });

      fetchDoctorDetails(doctor.id);
    } else if (open && !doctor) {
      // Reset form for new doctor
      setFormData({
        name: "",
        specialty: "",
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
    }
  }, [open, doctor]);

  const fetchDoctorDetails = async (doctorId) => {
    setLoading(true);
    try {
      // Fetch doctor's patients
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          type,
          status,
          patients (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('doctor_id', doctorId)
        .order('date', { ascending: false });

      if (appointmentsError) throw appointmentsError;
      
      // Get unique patients
      const uniquePatients = [];
      const patientMap = new Map();
      
      if (appointments) {
        appointments.forEach(app => {
          if (app.patients && !patientMap.has(app.patients.id)) {
            patientMap.set(app.patients.id, {
              id: app.patients.id,
              name: app.patients.name,
              lastVisit: app.date
            });
            uniquePatients.push({
              id: app.patients.id,
              name: app.patients.name,
              lastVisit: app.date
            });
          }
        });
      }
      
      setPatientList(uniquePatients);
      
      // Get today's appointments
      const today = new Date().toISOString().split('T')[0];
      const todayApps = appointments ? appointments.filter(app => app.date === today) : [];
      setTodayAppointments(todayApps);
    } catch (error) {
      console.error("Error fetching doctor details:", error);
      toast.error("Failed to load doctor details");
    } finally {
      setLoading(false);
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
    setLoading(true);
    try {
      const doctorData = {
        name: formData.name,
        specialization: formData.specialty,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio
      };

      if (isNewDoctor) {
        // Insert new doctor
        const { data, error } = await supabase
          .from('doctors')
          .insert(doctorData)
          .select()
          .single();

        if (error) throw error;
        
        toast.success("Doctor profile created", {
          description: `${formData.name} has been added to your doctors list.`,
        });
      } else {
        // Update existing doctor
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
      
      window.location.reload(); // Refresh the page to show the changes
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
              <AvatarImage src={doctor?.image || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {doctor?.initials || getInitials(doctor?.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-lg">{doctor?.name}</h3>
              <p className="text-muted-foreground">{doctor?.specialty}</p>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
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
                  value={formData.specialty} 
                  onValueChange={(value) => handleSelectChange("specialty", value)}
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
            <div className="space-y-4">
              <div>
                <Label>Working Days</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={formData.workDays.includes(day) ? "default" : "outline"}
                      onClick={() => {
                        setFormData(prev => {
                          const newDays = prev.workDays.includes(day)
                            ? prev.workDays.filter(d => d !== day)
                            : [...prev.workDays, day];
                          return { ...prev, workDays: newDays };
                        });
                      }}
                      className="h-auto py-1.5"
                    >
                      {day.substring(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input 
                    id="startTime" 
                    type="time"
                    value={formData.workHours.start}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      workHours: { ...prev.workHours, start: e.target.value }
                    }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input 
                    id="endTime" 
                    type="time" 
                    value={formData.workHours.end}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      workHours: { ...prev.workHours, end: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>

            {!isNewDoctor && (
              <>
                <Separator className="my-4" />
                
                <div>
                  <h4 className="font-medium mb-2">Today's Schedule</h4>
                  {loading ? (
                    <p className="text-sm text-muted-foreground">Loading schedule...</p>
                  ) : todayAppointments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No appointments scheduled for today.</p>
                  ) : (
                    <div className="space-y-2">
                      {todayAppointments.map(appointment => (
                        <div key={appointment.id} className="p-3 border rounded-md flex justify-between">
                          <div>
                            <p className="font-medium">{appointment.patients.name}</p>
                            <p className="text-sm text-muted-foreground">{appointment.type}</p>
                          </div>
                          <p className="text-sm font-medium">{appointment.time}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
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
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading patients...</p>
                ) : patientList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No patients assigned to this doctor yet.</p>
                ) : (
                  <div className="space-y-2">
                    {patientList.map(patient => (
                      <div key={patient.id} className="p-3 border rounded-md flex justify-between items-center">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(patient.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-xs text-muted-foreground">Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</p>
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
