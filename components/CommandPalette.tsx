"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { User, AlertCircle, Loader2, ArrowLeft, Search } from "lucide-react";
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
  const [query, setQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

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
      setQuery("");
      router.push(`/patients?patient=${patientId}`);
    },
    [router],
  );

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // ─── Mobile: Full-Screen Takeover ───────────────────────────────────────
  if (isMobile && open) {
    return (
      <div className="fixed inset-0 z-[60] bg-background flex flex-col animate-in fade-in-0 duration-200">
        {/* Header with integrated search input */}
        <div className="flex items-center gap-3 px-3 pt-safe h-14 border-b shrink-0">
          <button
            onClick={handleClose}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-muted touch-manipulation shrink-0"
            aria-label="Close search"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 flex items-center gap-2 rounded-full border bg-muted/50 px-4 h-10">
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <input
              type="text"
              placeholder="Search patients..."
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              autoFocus
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto overscroll-contain pb-safe">
          {error ? (
            <div className="flex items-center justify-center gap-2 py-12 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" /> Failed to fetch results.
            </div>
          ) : loading && results.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Searching…
            </div>
          ) : query.trim() === "" ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Start typing to search…
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No patients found.
            </div>
          ) : (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                Patients
              </div>
              {results.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelect(patient.id)}
                  className="flex items-center gap-4 w-full rounded-lg px-3 py-2.5 text-left hover:bg-accent active:bg-accent touch-manipulation transition-colors"
                >
                  {(() => {
                    const g = (patient.gender || "").toLowerCase();
                    const color = g === "male" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : g === "female" ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400" : "bg-primary/10 text-primary";
                    return (
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-medium text-sm ${color}`}>
                        {patient.name ? (
                          getInitials(patient.name)
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                    );
                  })()}
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate">
                      {patient.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {[patient.gender, patient.age ? `${patient.age}y` : null, patient.phone]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Desktop: CommandDialog ─────────────────────────────────────────────
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div className="relative">
        <CommandInput
          placeholder="Search patients by name, ID, or phone..."
          onValueChange={handleInputChange}
          value={query}
          autoFocus
        />
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
            "Start typing to search..."
          )}
        </CommandEmpty>

        {results.length > 0 && query && (
          <CommandGroup heading="Patients">
            {results.map((patient) => (
              <CommandItem
                key={patient.id}
                value={`${patient.name} ${patient.id} ${patient.phone || ""} ${patient.email || ""}`}
                onSelect={() => handleSelect(patient.id)}
                className="flex items-center justify-between py-2.5"
              >
                <div className="flex items-center gap-4">
                  {(() => {
                    const g = (patient.gender || "").toLowerCase();
                    const color = g === "male" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : g === "female" ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400" : "bg-primary/10 text-primary";
                    return (
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-medium text-xs ${color}`}>
                        {patient.name ? (
                          getInitials(patient.name)
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                    );
                  })()}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{patient.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {[patient.gender, patient.age ? `${patient.age}y` : null, patient.phone]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
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
