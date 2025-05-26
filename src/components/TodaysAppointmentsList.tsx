import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { AppointmentType } from "@/components/AppointmentModal";

interface TodaysAppointmentsListProps {
  todayAppointments: AppointmentType[];
  loading: boolean;
  startConsultation: (appointment: AppointmentType) => void;
}

export function TodaysAppointmentsList({
  todayAppointments,
  loading,
  startConsultation,
}: TodaysAppointmentsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Today's Appointments ({format(new Date(), "MMMM d, yyyy")})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/50 rounded-md animate-pulse"></div>
            ))}
          </div>
        ) : todayAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No appointments scheduled for today.
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <User size={16} className="text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{appointment.patients?.[0]?.name || 'Unknown Patient'}</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Clock size={14} className="mr-1" /> {appointment.time} • {appointment.type}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    appointment.status === "Scheduled" ? "outline" :
                    appointment.status === "In Progress" ? "default" : "secondary"
                  }>
                    {appointment.status}
                  </Badge>
                  {(appointment.status === "Scheduled" || appointment.status === "In Progress") && (
                    <Button size="sm" onClick={() => startConsultation(appointment)}>
                      {appointment.status === "Scheduled" ? "Start" : "Continue"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 