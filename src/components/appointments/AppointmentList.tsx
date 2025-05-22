
import { AppointmentCard } from "./AppointmentCard";
import { EmptyState } from "./EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

interface AppointmentListProps {
  appointments: any[];
  loading: boolean;
  selectedDate: Date | null;
  onEdit: (appointment: any) => void;
  onStartConsultation: (appointment: any) => void;
  onNewAppointment?: () => void;
}

export function AppointmentList({ 
  appointments, 
  loading, 
  selectedDate,
  onEdit,
  onStartConsultation,
  onNewAppointment
}: AppointmentListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return <EmptyState hasDateFilter={!!selectedDate} onNewAppointment={onNewAppointment} />;
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <AppointmentCard 
          key={appointment.id} 
          appointment={appointment} 
          onEdit={onEdit}
          onStartConsultation={onStartConsultation}
        />
      ))}
    </div>
  );
}
