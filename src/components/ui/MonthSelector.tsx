import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

interface MonthSelectorProps {
  value: string; // Format: "YYYY-MM"
  onChange: (value: string) => void;
  className?: string;
}

export function MonthSelector({
  value,
  onChange,
  className,
}: MonthSelectorProps) {
  const [year, month] = value.split("-").map(Number);

  // Generate years (last 5 years + current year + next 1 year)
  const currentYear = new Date().getFullYear();
  const years = React.useMemo(() => {
    const yearsList = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      yearsList.push(i);
    }
    return yearsList;
  }, [currentYear]);

  // Months
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const handleYearChange = (newYear: string) => {
    onChange(`${newYear}-${String(month).padStart(2, "0")}`);
  };

  const handleMonthChange = (newMonth: string) => {
    onChange(`${year}-${newMonth.padStart(2, "0")}`);
  };

  const displayValue = value
    ? `${months.find((m) => m.value === month)?.label} ${year}`
    : "Select month";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[200px] justify-between text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Month</label>
            <Select value={month.toString()} onValueChange={handleMonthChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value.toString()}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Year</label>
            <Select value={year.toString()} onValueChange={handleYearChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
