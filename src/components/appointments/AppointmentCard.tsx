
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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
    switch (status) {
      case "Scheduled":
        return "default";
      case "In Progress":
        return "secondary";
      case "Completed":
        return "secondary"; 
      case "Cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="space-y-1 mb-3 sm:mb-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{appointment.patient}</h3>
                <Badge variant={getBadgeVariant(appointment.status)}>{appointment.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(appointment.date), 'MMM dd, yyyy')} • {appointment.time} • {appointment.type}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {appointment.status === "Scheduled" && (
                <Button 
                  variant="default"
                  size="sm"
                  onClick={() => onStartConsultation(appointment)}
                >
                  Start Consultation
                </Button>
              )}
              {appointment.status === "In Progress" && (
                <Button 
                  variant="default"
                  size="sm"
                  onClick={() => onStartConsultation(appointment)}
                >
                  Continue Consultation
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(appointment)}
              >
                Edit
              </Button>
            </div>
          </div>
        </div>
        <div className="px-4 py-2 bg-muted/20 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium">Doctor:</span> {appointment.doctor}
            </div>
            {appointment.notes && (
              <div className="text-sm text-right">
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
