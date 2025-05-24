
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface AppointmentFiltersProps {
  onTypeChange: (type: string) => void;
  onStatusChange: (status: string) => void;
  onClearFilters: () => void;
  filterType: string;
  filterStatus: string;
}

export function AppointmentFilters({
  onTypeChange,
  onStatusChange,
  onClearFilters,
  filterType,
  filterStatus
}: AppointmentFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex items-center space-x-2">
        <label htmlFor="type-filter" className="text-sm font-medium">
          Type:
        </label>
        <Select value={filterType} onValueChange={onTypeChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="Walk-in">Walk-in</SelectItem>
            <SelectItem value="Digital">Digital</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <label htmlFor="status-filter" className="text-sm font-medium">
          Status:
        </label>
        <Select value={filterStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button variant="outline" onClick={onClearFilters}>
        Clear Filters
      </Button>
    </div>
  );
}
