
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Filter, Search, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AppointmentFiltersProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  type: string;
  setType: (type: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus?: string;
  setFilterStatus?: (status: string) => void;
}

export function AppointmentFilters({
  selectedDate,
  setSelectedDate,
  type,
  setType,
  searchTerm,
  setSearchTerm,
  filterStatus = "all",
  setFilterStatus = () => {},
}: AppointmentFiltersProps) {
  const [date, setDate] = useState<Date | undefined>(selectedDate || undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Sync local date state with parent component's selectedDate
  useEffect(() => {
    if (selectedDate !== null && (!date || date.getTime() !== selectedDate.getTime())) {
      setDate(selectedDate);
    }
  }, [selectedDate, date]);

  const handleClearDate = () => {
    setDate(undefined);
    setSelectedDate(null);
    setIsCalendarOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search appointments..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute right-1 top-1 h-8 w-8 p-0" 
            onClick={() => setSearchTerm("")}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full sm:w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Pick a date"}
            {date && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto h-6 w-6 p-0" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearDate();
                }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Clear date</span>
              </Button>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              setDate(selectedDate);
              setSelectedDate(selectedDate || null);
              setIsCalendarOpen(false);
            }}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="Check-up">Check-up</SelectItem>
          <SelectItem value="Consultation">Consultation</SelectItem>
          <SelectItem value="Follow-up">Follow-up</SelectItem>
          <SelectItem value="Other">Other</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Scheduled">Scheduled</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
          <SelectItem value="Cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
