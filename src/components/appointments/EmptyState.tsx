
import { Calendar } from "lucide-react";

interface EmptyStateProps {
  hasDateFilter: boolean;
}

export function EmptyState({ hasDateFilter }: EmptyStateProps) {
  return (
    <div className="text-center py-10">
      <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">No appointments found</h3>
      <p className="text-muted-foreground">
        {hasDateFilter 
          ? "There are no appointments scheduled for this date." 
          : "Use the filters above to find appointments."}
      </p>
    </div>
  );
}
