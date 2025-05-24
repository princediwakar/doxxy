
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
        <select
          id="type-filter"
          value={filterType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">All Types</option>
          <option value="Walk-in">Walk-in</option>
          <option value="Digital">Digital</option>
        </select>
      </div>
      
      <div className="flex items-center space-x-2">
        <label htmlFor="status-filter" className="text-sm font-medium">
          Status:
        </label>
        <select
          id="status-filter"
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      
      <button
        onClick={onClearFilters}
        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
      >
        Clear Filters
      </button>
    </div>
  );
}
