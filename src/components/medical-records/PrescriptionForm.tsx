
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

  return (
    <div className="space-y-6">
      <div className="border rounded-md p-4">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold mb-1">MediClinic</h2>
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
        
        <div className="space-y-4 mb-6">
          <div>
            <Label className="text-sm mb-1 block">Medications</Label>
            
            {data.medicines.length > 0 ? (
              <div className="space-y-2 mb-4">
                {data.medicines.map((medicine: Medicine, index: number) => (
                  <div key={index} className="flex items-center space-x-2 p-2 border rounded-md">
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
            
            <div className="border rounded-md p-3">
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
                className="w-full"
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
              className="w-full h-24 px-3 py-2 border rounded-md"
              placeholder="Special instructions for the patient..."
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
                    !data.follow_up_date && "text-muted-foreground"
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
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}
