"use client";

import * as React from "react";
import { format, getYear, getMonth, setYear, setMonth, startOfYear, endOfYear, eachMonthOfInterval } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // Assuming this is the standard shadcn calendar
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea

interface DatePickerWithYearProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  disabled?: boolean;
  minYear?: number;
  maxYear?: number;
}

export function DatePickerWithYear({
  date,
  setDate,
  disabled,
  minYear = 1900, // Default minimum year for DOB
  maxYear = new Date().getFullYear(), // Default maximum year is current year
}: DatePickerWithYearProps) {
  const [month, setMonthState] = React.useState<Date>(date || new Date());

  const handleYearChange = (year: string) => {
    const newYear = parseInt(year, 10);
    const newDate = setYear(month, newYear);
    setMonthState(newDate); // Update the displayed month/year in calendar
    // If a date is already selected, update its year as well
    if (date) {
      setDate(setYear(date, newYear));
    }
  };

  const handleMonthChange = (monthIndex: string) => {
    const newMonthIndex = parseInt(monthIndex, 10);
    const newDate = setMonth(month, newMonthIndex);
    setMonthState(newDate); // Update the displayed month/year in calendar
     // If a date is already selected, update its month as well
     if (date) {
       setDate(setMonth(date, newMonthIndex));
     }
  };

  // Generate years for the select dropdown
  const years = React.useMemo(() => {
    const yearsList = [];
    for (let i = maxYear; i >= minYear; i--) {
      yearsList.push(i);
    }
    return yearsList;
  }, [minYear, maxYear]);

   // Generate months for the select dropdown
   const months = React.useMemo(() => {
     return eachMonthOfInterval({ start: startOfYear(new Date()), end: endOfYear(new Date()) });
   }, []);

   // Sync the internal month state with the selected date prop when it changes externally
   React.useEffect(() => {
    if (date) {
      setMonthState(date);
    }
   }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex justify-between p-2 space-x-2">
          {/* Year Select */}
          <Select
            onValueChange={handleYearChange}
            value={getYear(month).toString()}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {/* Use ScrollArea for a long list of years */}
              <ScrollArea className="h-48">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>

          {/* Month Select */}
          <Select
            onValueChange={handleMonthChange}
            value={getMonth(month).toString()}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {format(month, "MMMM")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          month={month} // Control the displayed month/year using our state
          onMonthChange={setMonthState} // Keep internal state in sync if user navigates with arrows
          disabled={(date) =>
            date > new Date() || date < new Date(minYear, 0, 1)
          }
          initialFocus
          // Remove captionLayout="dropdown" as we have custom selects
          // captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
} 