"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTodayStore, type ActiveFilter } from "@/stores/todayStore";

const FILTERS: { value: ActiveFilter; label: string }[] = [
  { value: "queue", label: "Queue" },
  { value: "all", label: "All" },
];

export function TodayHeader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const openModal = useTodayStore((s) => s.openModal);

  const activeFilter = (searchParams.get('filter') as ActiveFilter) || 'queue';
  const urlSearchQuery = searchParams.get('q') || '';
  const [localSearch, setLocalSearch] = useState(urlSearchQuery);

  // Sync local search state when URL changes externally
  useEffect(() => {
    setLocalSearch(urlSearchQuery);
  }, [urlSearchQuery]);

  const debouncedPushSearch = useDebouncedCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set('q', value.trim());
        params.set('filter', 'all');
      } else {
        params.delete('q');
      }
      router.push(`/today?${params.toString()}`, { scroll: false });
    },
    300
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    debouncedPushSearch(value);
  };

  const handleFilterChange = (value: ActiveFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('filter', value);
    if (value === 'queue') {
      params.delete('q');
    }
    router.push(`/today?${params.toString()}`, { scroll: false });
  };

  const handleNewPatient = useCallback(() => {
    openModal("patient-new");
  }, [openModal]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients, appointments..."
            value={localSearch}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        <Button onClick={handleNewPatient} className="hidden lg:inline-flex shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          New Patient
        </Button>
      </div>

      <div className="flex gap-1 border-b">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-[1px] ${
              activeFilter === f.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
