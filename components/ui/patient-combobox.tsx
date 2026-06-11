// components/ui/patient-combobox.tsx
"use client";

import * as React from "react"
import { User, X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useDebounce } from "use-debounce"
import { useQuery } from "@tanstack/react-query"
import { queryPatientSearch } from "@/lib/queries/patients"
import { Spinner } from '@/components/ui/loading'
import { useAppState } from "@/contexts/AppStateContext"
import type { DbPatientByClinic } from "@/types/core"

interface PatientComboboxProps {
  value?: string
  onPatientSelect: (patient: Pick<DbPatientByClinic, 'id' | 'name' | 'uhid'>) => void
  onClear: () => void
  placeholder?: string
  disabled?: boolean
  onCreateNew?: (query: string) => void
  overridePatient?: Pick<DbPatientByClinic, 'id' | 'name' | 'uhid'> | null
}

export function PatientCombobox({
  value,
  onPatientSelect,
  onClear,
  placeholder = "Search patients...",
  disabled = false,
  onCreateNew,
  overridePatient,
}: PatientComboboxProps) {
  const { activeClinicId } = useAppState()
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300)
  const [selectedPatient, setSelectedPatient] = React.useState<Pick<DbPatientByClinic, 'id' | 'name' | 'uhid'> | null>(null)

  const { data: result, isLoading } = useQuery({
    queryKey: ['patients', 'search', activeClinicId, debouncedSearchQuery],
    queryFn: () => queryPatientSearch(activeClinicId ?? '', debouncedSearchQuery, { page: 1 }),
    enabled: !!activeClinicId,
    staleTime: 2 * 60 * 1000,
  })

  const patients = result?.patients ?? []

  React.useEffect(() => {
    if (value && patients.length > 0) {
      const found = patients.find((p) => p.id === value)
      if (found) setSelectedPatient(found)
    } else if (!value) {
      setSelectedPatient(null)
    }
  }, [value, patients])

  const handleSelect = (patient: Pick<DbPatientByClinic, 'id' | 'name' | 'uhid'>) => {
    setSelectedPatient(patient)
    onPatientSelect(patient)
    setOpen(false)
    setSearchQuery("")
  }

  const displayPatient = overridePatient || selectedPatient

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedPatient(null)
    setSearchQuery("")
    onClear()
  }

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearchQuery("") }} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", !displayPatient && "text-muted-foreground")}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 flex-1 text-left min-w-0">
            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
            {displayPatient ? (
              <span className="truncate">
                {displayPatient.name} <span className="text-muted-foreground text-xs">{displayPatient.uhid}</span>
              </span>
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          {displayPatient && !disabled && (
            <div
              className="h-6 w-6 p-0 hover:bg-muted rounded flex items-center justify-center shrink-0"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear patient</span>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name, phone, or UHID..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            disabled={disabled}
            className="h-9"
          />
          <CommandList 
            className="max-h-[240px] overflow-y-auto overscroll-contain touch-pan-y"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <CommandEmpty>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Spinner size="md" />
                  <span className="ml-2">Searching patients...</span>
                </div>
              ) : patients.length === 0 && debouncedSearchQuery ? (
                <div className="py-6 text-center">
                  <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p>No patients found for "{debouncedSearchQuery}"</p>
                  {onCreateNew && (
                    <button
                      type="button"
                      onClick={() => { const q = searchQuery; setOpen(false); setSearchQuery(""); onCreateNew(q) }}
                      className="mt-3 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-dashed border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-950 dark:hover:border-indigo-500 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Create new patient
                    </button>
                  )}
                </div>
              ) : patients.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Start typing to search patients...
                </div>
              ) : null}
            </CommandEmpty>
            {patients.map((patient) => (
              <CommandItem
                key={patient.id}
                value={patient.id}
                onSelect={() => handleSelect(patient)}
              >
                <User className="mr-2 h-4 w-4 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{patient.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {patient.uhid}{patient.phone ? ` · ${patient.phone}` : ''}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}