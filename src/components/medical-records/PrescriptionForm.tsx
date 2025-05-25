
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionFormProps {
  data: {
    medicines: Medicine[];
    instructions: string;
    follow_up_date: Date | null;
  };
  setData: (data: any) => void;
  doctorName: string;
  patientName: string;
  specialty: string;
}

export function PrescriptionForm({ 
  data, 
  setData, 
  doctorName,
  patientName,
  specialty
}: PrescriptionFormProps) {
  const [newMedicine, setNewMedicine] = useState<Medicine>({
    name: '',
    dosage: '',
    frequency: '',
    duration: ''
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev: any) => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setData((prev: any) => ({ ...prev, follow_up_date: date }));
    }
  };
  
  const handleAddMedicine = () => {
    if (newMedicine.name && newMedicine.dosage) {
      setData((prev: any) => ({ 
        ...prev, 
        medicines: [...prev.medicines, { ...newMedicine }] 
      }));
      
      // Reset new medicine form
      setNewMedicine({
        name: '',
        dosage: '',
        frequency: '',
        duration: ''
      });
    }
  };
  
  const handleRemoveMedicine = (index: number) => {
    setData((prev: any) => ({
      ...prev,
      medicines: prev.medicines.filter((_: any, i: number) => i !== index)
    }));
  };
  
  const handleMedicineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMedicine(prev => ({ ...prev, [name]: value }));
  };

  // Department-specific styling
  const getDepartmentStyle = () => {
    if (specialty === "Neurology") {
      return {
        headerBg: "bg-purple-50 border-purple-200",
        borderColor: "border-purple-200",
        titleColor: "text-purple-700",
        accentColor: "bg-purple-100",
        buttonColor: "hover:bg-purple-100",
        gradientBg: "bg-gradient-to-r from-purple-50 to-blue-50",
        icon: "🧠"
      };
    } else if (specialty === "Ophthalmology") {
      return {
        headerBg: "bg-teal-50 border-teal-200",
        borderColor: "border-teal-200",
        titleColor: "text-teal-700",
        accentColor: "bg-teal-100",
        buttonColor: "hover:bg-teal-100",
        gradientBg: "bg-gradient-to-r from-teal-50 to-green-50",
        icon: "👁️"
      };
    } else {
      return {
        headerBg: "bg-gray-50 border-gray-200",
        borderColor: "border-gray-200",
        titleColor: "text-gray-700",
        accentColor: "bg-gray-100",
        buttonColor: "hover:bg-gray-100",
        gradientBg: "bg-gradient-to-r from-gray-50 to-gray-100",
        icon: "📋"
      };
    }
  };

  const style = getDepartmentStyle();

  return (
    <div className="space-y-6">
      <div className={cn("border rounded-md p-4", style.borderColor, style.gradientBg)}>
        <div className={cn("text-center mb-4 pb-3 border-b", style.borderColor)}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className={cn("text-xl font-bold", style.titleColor)}>MediClinic</h2>
          </div>
          <p className="text-sm text-muted-foreground">{specialty} Department</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm">
              <span className="font-medium">Patient:</span> {patientName}
            </p>
            <p className="text-sm">
              <span className="font-medium">Date:</span> {format(new Date(), 'MMM dd, yyyy')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm">
              <span className="font-medium">Doctor:</span> {doctorName}
            </p>
            <p className="text-sm">
              <span className="font-medium">Specialty:</span> {specialty}
            </p>
          </div>
        </div>

        {specialty === "Ophthalmology" && (
          <div className={cn("p-3 mb-4 rounded-md", style.accentColor)}>
            <h4 className="text-sm font-medium mb-2">Vision Prescription</h4>
            <div className="grid grid-cols-5 gap-2 text-xs font-medium border-b pb-1 mb-1">
              <div>Eye</div>
              <div>SPH</div>
              <div>CYL</div>
              <div>AXIS</div>
              <div>VA</div>
            </div>
            <div className="grid grid-cols-5 gap-2 text-xs mb-1">
              <div>Right (OD)</div>
              <div>—</div>
              <div>—</div>
              <div>—</div>
              <div>—</div>
            </div>
            <div className="grid grid-cols-5 gap-2 text-xs">
              <div>Left (OS)</div>
              <div>—</div>
              <div>—</div>
              <div>—</div>
              <div>—</div>
            </div>
            <div className="text-xs mt-2">
              <span className="font-medium">Add:</span> —  
              <span className="ml-4 font-medium">PD:</span> —
            </div>
          </div>
        )}
        
        {specialty === "Neurology" && (
          <div className={cn("p-3 mb-4 rounded-md", style.accentColor)}>
            <h4 className="text-sm font-medium mb-2">Neurological Assessment</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium">Motor Function:</span> WNL
              </div>
              <div>
                <span className="font-medium">Sensory Function:</span> WNL
              </div>
              <div>
                <span className="font-medium">Reflexes:</span> Normal
              </div>
              <div>
                <span className="font-medium">Coordination:</span> Normal
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4 mb-6">
          <div>
            <Label className="text-sm mb-1 block">Medications</Label>
            
            {data.medicines.length > 0 ? (
              <div className="space-y-2 mb-4">
                {data.medicines.map((medicine: Medicine, index: number) => (
                  <div key={index} className={cn("flex items-center space-x-2 p-2 border rounded-md", style.borderColor)}>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{medicine.name}</p>
                      <div className="text-sm text-muted-foreground">
                        <span>{medicine.dosage}</span>
                        {medicine.frequency && <span> • {medicine.frequency}</span>}
                        {medicine.duration && <span> • {medicine.duration}</span>}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveMedicine(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic mb-4">No medications added yet</p>
            )}
            
            <div className={cn("border rounded-md p-3", style.borderColor)}>
              <h4 className="text-sm font-medium mb-2">Add New Medication</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <Input
                  placeholder="Medication name"
                  value={newMedicine.name}
                  name="name"
                  onChange={handleMedicineChange}
                />
                <Input
                  placeholder="Dosage (e.g., 10mg)"
                  value={newMedicine.dosage}
                  name="dosage"
                  onChange={handleMedicineChange}
                />
                <Input
                  placeholder="Frequency (e.g., Twice daily)"
                  value={newMedicine.frequency}
                  name="frequency"
                  onChange={handleMedicineChange}
                />
                <Input
                  placeholder="Duration (e.g., 7 days)"
                  value={newMedicine.duration}
                  name="duration"
                  onChange={handleMedicineChange}
                />
              </div>
              <Button 
                type="button" 
                variant="outline"
                size="sm"
                className={cn("w-full", style.buttonColor)}
                onClick={handleAddMedicine}
                disabled={!newMedicine.name || !newMedicine.dosage}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Medication
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <textarea
              id="instructions"
              name="instructions"
              value={data.instructions}
              onChange={handleInputChange}
              className={cn("w-full h-24 px-3 py-2 border rounded-md", style.borderColor)}
              placeholder={specialty === "Ophthalmology" 
                ? "Special instructions for eye care..."
                : specialty === "Neurology"
                ? "Follow-up instructions for neurological care..."
                : "Special instructions for the patient..."
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="follow_up_date">Follow-up Appointment</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left",
                    !data.follow_up_date && "text-muted-foreground",
                    style.buttonColor
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data.follow_up_date ? format(data.follow_up_date, "PPP") : "Select follow-up date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.follow_up_date || undefined}
                  onSelect={handleDateChange}
                  initialFocus
                  disabled={(date) => date < new Date()}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground">
          {specialty === "Neurology" ? (
            <p>This prescription is issued by the Neurology Department of MediClinic. For emergencies, call: (123) 456-7890</p>
          ) : specialty === "Ophthalmology" ? (
            <p>This prescription is issued by the Ophthalmology Department of MediClinic. For vision emergencies, call: (123) 456-7890</p>
          ) : (
            <p>This prescription is issued by MediClinic. For emergencies, call: (123) 456-7890</p>
          )}
        </div>
      </div>
    </div>
  );
}
