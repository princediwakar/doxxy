
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
import { CalendarCheck, FileText, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: any | null;
}

export function PatientModal({ open, onOpenChange, patient }: PatientModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const isNewPatient = !patient;

  // Form fields
  const [formData, setFormData] = useState({
    name: patient?.name || "",
    gender: patient?.gender || "",
    age: patient?.age || "",
    phone: patient?.phone || "",
    email: "",
    address: "",
    bloodType: "",
    allergies: "",
    notes: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Here you would typically save the data to your backend
    toast({
      title: isNewPatient ? "Patient created" : "Patient updated",
      description: `${formData.name} has been ${isNewPatient ? 'added to' : 'updated in'} your patients list.`,
    });
    onOpenChange(false);
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
                  value={formData.name} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={formData.gender} 
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
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  name="age"
                  type="number" 
                  value={formData.age} 
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
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  name="address"
                  value={formData.address} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="medical" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select 
                  value={formData.bloodType} 
                  onValueChange={(value) => handleSelectChange("bloodType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Input 
                  id="allergies" 
                  name="allergies"
                  value={formData.allergies} 
                  onChange={handleChange} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Medical Notes</Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={(e) => handleSelectChange("notes", e.target.value)}
                className="w-full h-24 px-3 py-2 border rounded-md"
              />
            </div>

            {!isNewPatient && (
              <div className="pt-4">
                <h4 className="font-medium mb-2">Medical History</h4>
                <Separator className="my-2" />
                <p className="text-sm text-muted-foreground">No medical records found.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4 mt-4">
            {!isNewPatient ? (
              <>
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Appointment History</h4>
                  <Button variant="outline" size="sm">Schedule New</Button>
                </div>
                <Separator className="my-2" />
                <div className="space-y-3">
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">General Check-up</p>
                        <p className="text-sm text-muted-foreground">Dr. Michael Chen</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">May 10, 2023</p>
                        <p className="text-sm text-muted-foreground">10:00 AM</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Blood Test</p>
                        <p className="text-sm text-muted-foreground">Dr. Emily Parker</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Apr 22, 2023</p>
                        <p className="text-sm text-muted-foreground">2:30 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Save patient details first to schedule appointments.</p>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{isNewPatient ? "Create Patient" : "Update Patient"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
