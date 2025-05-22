
import { AppointmentCard } from "./AppointmentCard";
import { EmptyState } from "./EmptyState";

interface AppointmentListProps {
  appointments: any[];
  loading: boolean;
  selectedDate: Date | null;
  onEdit: (appointment: any) => void;
  onStartConsultation: (appointment: any) => void;
}

export function AppointmentList({ 
  appointments, 
  loading, 
  selectedDate,
  onEdit,
  onStartConsultation 
}: AppointmentListProps) {
  if (loading) {
    return <div className="text-center py-10">Loading appointments...</div>;
  }

  if (appointments.length === 0) {
    return <EmptyState hasDateFilter={!!selectedDate} />;
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
