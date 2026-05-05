// components/schedule/DateCarousel.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, subDays, addDays, parseISO, isToday, isYesterday, isTomorrow } from "date-fns";
import { Button } from "@/components/ui/button";

function resolveCenterLabel(date: Date): string {
  if (isToday(date)) return `Today, ${format(date, "MMM d")}`;
  if (isYesterday(date)) return `Yesterday, ${format(date, "MMM d")}`;
  if (isTomorrow(date)) return `Tomorrow, ${format(date, "MMM d")}`;
  return format(date, "EEEE, MMM d");
}

function resolveSideLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM d");
}

export function DateCarousel() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const dateStr = searchParams.get("date");
  const date = dateStr ? parseISO(dateStr) : new Date();

  const prevDate = subDays(date, 1);
  const nextDate = addDays(date, 1);

  const goToDate = (d: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    const formatted = format(d, "yyyy-MM-dd");
    params.set("date", formatted);
    params.delete("patient");
    params.delete("appointment");
    router.push(`/schedule?${params.toString()}`, { scroll: false });
  };

  const goToToday = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("date");
    params.delete("patient");
    params.delete("appointment");
    router.push(`/schedule?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center justify-between px-2 py-2 border-b bg-muted/30">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => goToDate(prevDate)}
        className="text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4 lg:mr-1" />
        <span className="hidden lg:inline">{resolveSideLabel(prevDate)}</span>
      </Button>

      <div className="flex flex-col items-center">
        <span className="text-sm font-semibold tabular-nums">
          {resolveCenterLabel(date)}
        </span>
        {!isToday(date) && (
          <button 
            onClick={goToToday}
            className="text-[10px] font-medium text-primary hover:underline mt-0.5 flex items-center"
          >
            <Calendar className="h-3 w-3 mr-1" /> Return to Today
          </button>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => goToDate(nextDate)}
        className="text-muted-foreground hover:text-foreground"
      >
        <span className="hidden lg:inline">{resolveSideLabel(nextDate)}</span>
        <ChevronRight className="h-4 w-4 lg:ml-1" />
      </Button>
    </div>
  );
}