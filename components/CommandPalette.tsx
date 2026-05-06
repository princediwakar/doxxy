"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { User, AlertCircle, Loader2 } from "lucide-react";
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
  const [error, setError] = useState(false);
  const [query, setQuery] = useState(""); // Track query state for zero-state rendering

  const search = useDebouncedCallback(async (value: string) => {
    if (!activeClinicId || !value.trim()) {
      setResults([]);
      setError(false);
      return;
    }
    
    setLoading(true);
    setError(false);
    
    try {
      const { patients } = await queryPatientSearch(activeClinicId, value);
      setResults(patients.slice(0, 8));
    } catch {
      setError(true);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, 200);

  const handleInputChange = (val: string) => {
    setQuery(val);
    search(val);
  };

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
      setQuery(""); // Reset on close
      router.push(`/patients/${patientId}`);
    },
    [router],
  );

  // Get initials for the avatar (e.g., "John Doe" -> "JD")
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div className="relative">
        <CommandInput
          placeholder="Search patients by name, ID, or phone..."
          onValueChange={handleInputChange}
          value={query}
          autoFocus
        />
        {/* Subtle loading indicator inside the input area */}
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      <CommandList>
        <CommandEmpty>
          {error ? (
            <span className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" /> Failed to fetch results.
            </span>
          ) : loading ? (
             "Searching..." 
          ) : query.trim() !== "" ? (
             "No patients found."
          ) : (
             "Start typing to search..." // Or render your "Recent Patients" component here
          )}
        </CommandEmpty>

        {results.length > 0 && query && (
          <CommandGroup heading="Patients">
            {results.map((patient) => (
              <CommandItem
                key={patient.id}
                /* CRITICAL FIX: Index everything the user might type */
                value={`${patient.name} ${patient.id} ${patient.phone || ""} ${patient.email || ""}`}
                onSelect={() => handleSelect(patient.id)}
                className="flex items-center justify-between py-3" // Larger hit area
              >
                <div className="flex items-center gap-4">
                  {/* Visual anchor: Replace generic icon with identity */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs">
                    {patient.name ? getInitials(patient.name) : <User className="h-4 w-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{patient.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {[
                        patient.gender, 
                        patient.age ? `${patient.age}y` : null,
                        patient.phone
                      ].filter(Boolean).join(" • ")}
                    </span>
                  </div>
                </div>
                {/* Optional: Add a quick-action button or status pill on the far right here later */}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}