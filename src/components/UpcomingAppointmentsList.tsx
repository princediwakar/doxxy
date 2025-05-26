import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarCheck, User } from "lucide-react";
import { FormattedAppointment } from "@/pages/Dashboard"; // Assuming FormattedAppointment is defined in Dashboard

interface UpcomingAppointmentsListProps {
  upcomingAppointments: FormattedAppointment[];
  loading: boolean;
}

export function UpcomingAppointmentsList({
  upcomingAppointments,
  loading,
}: UpcomingAppointmentsListProps) {
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
              <div key={index} className="animate-pulse h-12 bg-muted/30 rounded-md"></div>
            ))}
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No upcoming appointments scheduled.
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="space-y-1">
                  <p className="font-medium">{appointment.patient}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User size={14} className="mr-1" />
                    <span>{appointment.doctor}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{appointment.time}</p>
                  <div className="flex items-center text-sm text-muted-foreground justify-end">
                    <CalendarCheck size={14} className="mr-1" />
                    <span>{appointment.date}</span>
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