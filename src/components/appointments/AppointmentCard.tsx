
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, Edit, Play, User } from "lucide-react";

interface AppointmentCardProps {
  appointment: {
    id: string;
    patient: string;
    doctor: string;
    date: string;
    time: string;
    type: string;
    status: string;
    notes?: string;
  };
  onEdit: (appointment: any) => void;
  onStartConsultation: (appointment: any) => void;
}

export function AppointmentCard({ appointment, onEdit, onStartConsultation }: AppointmentCardProps) {
  const getBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "default";
      case "in progress":
        return "secondary";
      case "completed":
        return "success"; 
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  // Determine department (placeholder logic - to be replaced with actual department data)
  const getDepartmentFromType = (type: string) => {
    if (type.includes('Neuro')) return 'Neurology';
    if (type.includes('Eye') || type.includes('Vision')) return 'Ophthalmology';
    return 'General';
  };
  
  const department = getDepartmentFromType(appointment.type);
  
  return (
    <Card className="overflow-hidden border-l-4" style={{ 
      borderLeftColor: department === 'Neurology' ? '#8b5cf6' : department === 'Ophthalmology' ? '#10b981' : '#6b7280' 
    }}>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="space-y-1 mb-3 sm:mb-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{appointment.patient}</h3>
                <Badge variant={getBadgeVariant(appointment.status)}>{appointment.status}</Badge>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {format(new Date(appointment.date), 'MMM dd, yyyy')} • {appointment.time}
                </div>
                <div className="hidden sm:block">•</div>
                <div>{appointment.type}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {appointment.status === "Scheduled" && (
                <Button 
                  variant="default"
                  size="sm"
                  onClick={() => onStartConsultation(appointment)}
                  className={department === 'Neurology' ? 'bg-purple-600 hover:bg-purple-700' : department === 'Ophthalmology' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  <Play className="mr-1 h-3 w-3" />
                  Start Consultation
                </Button>
              )}
              {appointment.status === "In Progress" && (
                <Button 
                  variant="default"
                  size="sm"
                  onClick={() => onStartConsultation(appointment)}
                  className={department === 'Neurology' ? 'bg-purple-600 hover:bg-purple-700' : department === 'Ophthalmology' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  <Play className="mr-1 h-3 w-3" />
                  Continue Consultation
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(appointment)}
              >
                <Edit className="mr-1 h-3 w-3" />
                Edit
              </Button>
            </div>
          </div>
        </div>
        <div className="px-4 py-2 bg-muted/20 border-t">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="font-medium flex items-center">
                <User className="mr-1 h-3 w-3" /> 
                {appointment.doctor}
              </span>
            </div>
            {appointment.notes && (
              <div className="text-right truncate max-w-[50%]" title={appointment.notes}>
                <span className="font-medium">Notes: </span>
                {appointment.notes}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
