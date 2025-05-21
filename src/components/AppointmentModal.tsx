
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
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any | null;
}

export function AppointmentModal({ open, onOpenChange, appointment }: AppointmentModalProps) {
  const { toast } = useToast();
  const isNewAppointment = !appointment;

  // Form fields
  const [formData, setFormData] = useState({
    patient: appointment?.patient || "",
    doctor: appointment?.doctor || "",
    date: appointment?.date ? new Date(appointment.date) : new Date(),
    time: appointment?.time || "10:00 AM",
    type: appointment?.type || "Check-up",
    status: appointment?.status || "Scheduled",
    notes: ""
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    appointment?.date ? new Date(appointment.date) : new Date()
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({ ...prev, date }));
    }
  };

  const handleSubmit = () => {
    // Here you would typically save the data to your backend
    toast({
      title: isNewAppointment ? "Appointment scheduled" : "Appointment updated",
      description: `Appointment for ${formData.patient} on ${format(formData.date, 'PP')} at ${formData.time} has been ${isNewAppointment ? 'scheduled' : 'updated'}.`,
    });
    onOpenChange(false);
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="patient">Patient</Label>
            {isNewAppointment ? (
              <Select 
                value={formData.patient} 
                onValueChange={(value) => handleSelectChange("patient", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                  <SelectItem value="Robert Williams">Robert Williams</SelectItem>
                  <SelectItem value="Emma Davis">Emma Davis</SelectItem>
                  <SelectItem value="Thomas Brown">Thomas Brown</SelectItem>
                  <SelectItem value="Lisa Wilson">Lisa Wilson</SelectItem>
                  <SelectItem value="Kevin Miller">Kevin Miller</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input 
                id="patient" 
                name="patient"
                value={formData.patient} 
                onChange={handleChange} 
                disabled={!isNewAppointment}
              />
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="doctor">Doctor</Label>
            <Select 
              value={formData.doctor} 
              onValueChange={(value) => handleSelectChange("doctor", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dr. Michael Chen">Dr. Michael Chen</SelectItem>
                <SelectItem value="Dr. Emily Parker">Dr. Emily Parker</SelectItem>
                <SelectItem value="Dr. James Wilson">Dr. James Wilson</SelectItem>
                <SelectItem value="Dr. Sarah Adams">Dr. Sarah Adams</SelectItem>
                <SelectItem value="Dr. Robert Johnson">Dr. Robert Johnson</SelectItem>
                <SelectItem value="Dr. Lisa Thompson">Dr. Lisa Thompson</SelectItem>
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
                  disabled={(date) => date < new Date()}
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
                <SelectItem value="Check-up">Check-up</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Consultation">Consultation</SelectItem>
                <SelectItem value="Procedure">Procedure</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {!isNewAppointment && (
              <>
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
              </>
            )}
          </div>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{isNewAppointment ? "Schedule" : "Update"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
