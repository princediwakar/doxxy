
import { Calendar, FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  hasDateFilter: boolean;
  onNewAppointment?: () => void;
}

export function EmptyState({ hasDateFilter, onNewAppointment }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {hasDateFilter ? (
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
      ) : (
        <FilePlus2 className="h-12 w-12 text-muted-foreground mb-4" />
      )}
      <h3 className="text-lg font-medium">
        {hasDateFilter
          ? "No appointments found for this date"
          : "No appointments found"}
      </h3>
      <p className="text-muted-foreground mt-2 max-w-sm">
        {hasDateFilter
          ? "Try selecting a different date or clearing the filters to see more appointments."
          : "Create your first appointment by clicking the button below."}
      </p>
      
      {!hasDateFilter && onNewAppointment && (
        <Button 
          onClick={onNewAppointment}
          className="mt-4"
        >
          <FilePlus2 className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      )}
    </div>
  );
}
