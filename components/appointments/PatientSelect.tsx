// src/components/appointments/PatientSelect.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import { Check, Plus, Phone, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { FormControl } from "@/components/ui/form";
import type { RpcPatient } from "./appointment.utils";

interface PatientSelectProps {
  patients: RpcPatient[] | undefined;
  isLoading: boolean;
  value: string;
  onSelect: (patientId: string) => void;
  onCreateNew: (name: string) => void;
  fallbackName?: string;
}

// Helper moved inside or imported
const formatDemographics = (age?: number | null, gender?: string | null) => {
  const parts = [];
  if (age !== null && age !== undefined) parts.push(age);
  if (gender) parts.push(gender.charAt(0).toUpperCase());
  return parts.length > 0 ? parts.join("/") : null;
};

export const PatientSelect: React.FC<PatientSelectProps> = ({
  patients,
  isLoading,
  value,
  onSelect,
  onCreateNew,
  fallbackName,
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const commandRef = useRef<HTMLDivElement>(null);

  // Sync input text with selected value, using fallback when patient not in loaded list
  useEffect(() => {
    if (value && patients) {
      const selected = patients.find((p) => p.id === value);
      if (selected) {
        setInputValue(selected.name);
      } else if (!isLoading && fallbackName) {
        setInputValue(fallbackName);
      }
    } else if (value && isLoading && fallbackName) {
      setInputValue(fallbackName);
    } else if (!value) {
      setInputValue("");
    }
  }, [value, patients, isLoading, fallbackName]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPatients = patients?.filter((p) =>
    p.name?.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <FormControl>
      <div className="relative" ref={commandRef}>
        <Command shouldFilter={false} className="rounded-lg border shadow-sm overflow-visible bg-background">
          <CommandInput
            placeholder="Type name to search..."
            value={inputValue}
            onValueChange={(val) => {
              setInputValue(val);
              setOpen(!!val);
              if (!val) onSelect(""); // Clear form if input cleared
            }}
            onFocus={() => { if (inputValue) setOpen(true); }}
            className="border-none focus:ring-0 capitalize"
          />

          <div
            className={cn(
              "absolute top-full left-0 w-full bg-popover text-popover-foreground shadow-lg rounded-md border mt-1 z-[60] flex flex-col",
              !open && "hidden"
            )}
          >
            <div className="max-h-[220px] overflow-y-auto overflow-x-hidden">
              <CommandList>
                {isLoading ? (
                  <div className="p-2 text-xs text-muted-foreground text-center">Loading...</div>
                ) : (
                  <CommandGroup>
                    {filteredPatients?.map((p) => (
                      <CommandItem
                        key={p.id}
                        value={p.name + p.id}
                        onSelect={() => {
                          onSelect(p.id);
                          setInputValue(p.name);
                          setOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 shrink-0",
                            value === p.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col gap-0.5 w-full">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{p.name}</span>
                            {formatDemographics(p.age, p.gender) && (
                              <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-sm uppercase tracking-wide font-medium">
                                {formatDemographics(p.age, p.gender)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground truncate">
                            {p.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 opacity-70" />
                                <span>{p.phone}</span>
                              </div>
                            )}
                            {p.uhid && (
                                <div className="flex items-center gap-1">
                                    <Hash className="h-3 w-3 opacity-70" />
                                    <span>{p.uhid}</span>
                                </div>
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </div>

            {inputValue.length > 0 && (
              <div className="border-t p-1 bg-accent/5 backdrop-blur-sm">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-primary font-medium transition-colors"
                  onClick={() => {
                    setOpen(false);
                    onCreateNew(inputValue);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Create "{inputValue}"
                </button>
              </div>
            )}
          </div>
        </Command>
      </div>
    </FormControl>
  );
};