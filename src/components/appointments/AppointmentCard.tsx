
import { CalendarCheck, Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

interface AppointmentCardProps {
  appointment: any;
  onEdit: (appointment: any) => void;
  onStartConsultation: (appointment: any) => void;
}

export function AppointmentCard({ 
  appointment, 
  onEdit, 
  onStartConsultation 
}: AppointmentCardProps) {
  // Get department based on doctor name (this is temporary)
  const department = 
    appointment.doctor?.toLowerCase().includes("neuro") 
      ? "Neurology" 
      : appointment.doctor?.toLowerCase().includes("eye") || appointment.doctor?.toLowerCase().includes("ophthal")
      ? "Ophthalmology"
      : "General";
  
  // Generate department-specific styles
  const getBadgeClass = () => {
    if (department === "Neurology") return "bg-purple-100 text-purple-800";
    if (department === "Ophthalmology") return "bg-teal-100 text-teal-800";
    return "bg-blue-100 text-blue-800";
  };

  // Format date
  const formattedDate = appointment.date 
    ? format(typeof appointment.date === 'string' ? parseISO(appointment.date) : appointment.date, 'MMM dd, yyyy')
    : 'Date not specified';

  // Handle appointment status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Scheduled": return "default";
      case "In Progress": return "outline";
      case "Completed": return "secondary";
      case "Cancelled": return "destructive";
      default: return "default";
    }
  };

  const canStartConsultation = appointment.status === 'Scheduled' || appointment.status === 'In Progress';
  
  return (
    <div className={`border rounded-md p-4 ${department === "Neurology" ? "border-l-4 border-l-purple-500" : department === "Ophthalmology" ? "border-l-4 border-l-teal-500" : ""}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{appointment.patient}</h3>
            <Badge variant={getStatusVariant(appointment.status)}>
              {appointment.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">with {appointment.doctor}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getBadgeClass()}>
            {department}
          </Badge>
          <Badge variant="outline" className="bg-gray-100">
            {appointment.type}
          </Badge>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarCheck size={16} className="mr-1" />
          {formattedDate}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock size={16} className="mr-1" />
          {appointment.time}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onEdit(appointment)}
        >
          Edit
        </Button>
        <Button 
          variant="default" 
          size="sm"
          disabled={!canStartConsultation}
          onClick={() => onStartConsultation(appointment)}
          className={department === "Neurology" ? "bg-purple-600 hover:bg-purple-700" : department === "Ophthalmology" ? "bg-teal-600 hover:bg-teal-700" : ""}
        >
          <Eye size={16} className="mr-1" /> Consultation
        </Button>
      </div>
    </div>
  );
}
