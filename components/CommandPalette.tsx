"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAppState } from "@/contexts/AppStateContext";
import { queryPatientSearch } from "@/lib/queries/patients";
import type { DbPatientByClinic } from "@/types/core";

export function CommandPalette() {
  const router = useRouter();
  const { activeClinicId } = useAppState();
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<DbPatientByClinic[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useDebouncedCallback(async (value: string) => {
    if (!activeClinicId || !value.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const { patients } = await queryPatientSearch(activeClinicId, value);
      setResults(patients.slice(0, 8));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, 200);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    const onCustom = () => setOpen(true);
    document.addEventListener("keydown", down);
    document.addEventListener("open-command-palette", onCustom);
    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("open-command-palette", onCustom);
    };
  }, []);

  const handleSelect = useCallback(
    (patientId: string) => {
      setOpen(false);
      router.push(`/patients/${patientId}`);
    },
    [router],
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search patients by name..."
        onValueChange={search}
        autoFocus
      />
      <CommandList>
        <CommandEmpty>
          {loading ? "Searching..." : "No patients found."}
        </CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="Patients">
            {results.map((patient) => (
            <CommandItem
              key={patient.id}
              value={`${patient.name} ${patient.id}`}
              onSelect={() => handleSelect(patient.id)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{patient.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[patient.gender, patient.age ? `${patient.age}y` : null]
                      .filter(Boolean)
                      .join(" · ")}
                    {patient.phone ? ` · ${patient.phone}` : ""}
                  </p>
                </div>
              </div>
            </CommandItem>
          ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
