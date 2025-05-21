
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

interface DoctorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: any | null;
}

export function DoctorModal({ open, onOpenChange, doctor }: DoctorModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const isNewDoctor = !doctor;

  // Form fields
  const [formData, setFormData] = useState({
    name: doctor?.name || "",
    specialty: doctor?.specialty || "",
    email: "",
    phone: "",
    availability: doctor?.availability || "Available",
    bio: "",
    workDays: [],
    workHours: {
      start: "09:00",
      end: "17:00"
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Here you would typically save the data to your backend
    toast({
      title: isNewDoctor ? "Doctor profile created" : "Doctor profile updated",
      description: `${formData.name} has been ${isNewDoctor ? 'added to' : 'updated in'} your doctors list.`,
    });
    onOpenChange(false);
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
                    <SelectItem value="General Practitioner">General Practitioner</SelectItem>
                    <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                    <SelectItem value="Cardiologist">Cardiologist</SelectItem>
                    <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                    <SelectItem value="Orthopedic Surgeon">Orthopedic Surgeon</SelectItem>
                    <SelectItem value="Neurologist">Neurologist</SelectItem>
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
                  <div className="space-y-2">
                    <div className="p-3 border rounded-md flex justify-between">
                      <div>
                        <p className="font-medium">Sarah Johnson</p>
                        <p className="text-sm text-muted-foreground">General Checkup</p>
                      </div>
                      <p className="text-sm font-medium">10:00 AM</p>
                    </div>
                    <div className="p-3 border rounded-md flex justify-between">
                      <div>
                        <p className="font-medium">Robert Williams</p>
                        <p className="text-sm text-muted-foreground">Follow-up</p>
                      </div>
                      <p className="text-sm font-medium">11:30 AM</p>
                    </div>
                    <div className="p-3 border rounded-md flex justify-between">
                      <div>
                        <p className="font-medium">Emma Davis</p>
                        <p className="text-sm text-muted-foreground">Consultation</p>
                      </div>
                      <p className="text-sm font-medium">2:15 PM</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="patients" className="mt-4">
            {!isNewDoctor ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Patient List</h4>
                  <span className="text-sm text-muted-foreground">Total: {doctor?.patients || 0} patients</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="p-3 border rounded-md flex justify-between items-center">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">SJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Sarah Johnson</p>
                        <p className="text-xs text-muted-foreground">Last visit: May 10, 2023</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                  <div className="p-3 border rounded-md flex justify-between items-center">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">RW</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Robert Williams</p>
                        <p className="text-xs text-muted-foreground">Last visit: Apr 22, 2023</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                  <div className="p-3 border rounded-md flex justify-between items-center">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">ED</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Emma Davis</p>
                        <p className="text-xs text-muted-foreground">Last visit: Mar 15, 2023</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Save doctor profile first to assign patients.</p>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{isNewDoctor ? "Create Profile" : "Update Profile"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
