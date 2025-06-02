
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarCheck, User, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FormattedAppointment } from "@/types/dashboard";

interface UpcomingAppointmentsListProps {
  upcomingAppointments: FormattedAppointment[];
  loading: boolean;
}

export function UpcomingAppointmentsList({
  upcomingAppointments,
  loading,
}: UpcomingAppointmentsListProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'default';
      case 'in progress':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarCheck size={18} className="mr-2 text-purple-500" />
          Upcoming Appointments
        </CardTitle>
        <CardDescription>Next scheduled appointments</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse h-16 bg-muted/30 rounded-md"></div>
            ))}
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarCheck className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p>No upcoming appointments scheduled.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{appointment.patient}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User size={14} className="mr-1" />
                      <span>Dr. {appointment.doctor}</span>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <CalendarCheck size={14} className="mr-1" />
                    <span>{appointment.date}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock size={14} className="mr-1" />
                    <span>{appointment.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
