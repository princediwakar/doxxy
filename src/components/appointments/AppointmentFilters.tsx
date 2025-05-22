
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AppointmentFiltersProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  type: string;
  setType: (type: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function AppointmentFilters({
  selectedDate,
  setSelectedDate,
  type,
  setType,
  searchTerm,
  setSearchTerm,
}: AppointmentFiltersProps) {
  const [date, setDate] = useState<Date | undefined>(selectedDate || new Date());

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
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full sm:w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => {
              setDate(date);
              setSelectedDate(date);
            }}
            initialFocus
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
    </div>
  );
}
