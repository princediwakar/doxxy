import * as React from "react"
import { Pill, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useQuery } from "@tanstack/react-query"
import { getSupabase } from "@/integrations/supabase/client"
import { useDebounce } from "use-debounce"
import { useAuth } from "@/contexts/AuthContext"
import { Medicine, MedicationAutoFillData } from "@/types/prescriptions"

interface MedicineComboboxProps {
  value?: string
  onValueChange?: (value: string) => void
  onMedicineSelect?: (medicine: Medicine, autoFillData: MedicationAutoFillData) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showClearButton?: boolean
  onClear?: () => void
}

// Smart extraction functions for auto-filling prescription fields
const extractDosageFromName = (medicineName: string, composition?: string | null): string => {
  // Extract dosage from medicine name (e.g., "Dolo 650 Tablet" -> "650mg")
  const nameMatch = medicineName.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|%|iu|units?)/i);
  if (nameMatch) {
    return `${nameMatch[1]}${nameMatch[2].toLowerCase()}`;
  }
  
  // Extract dosage from composition (e.g., "Paracetamol (650mg)" -> "650mg")
  if (composition) {
    const compMatch = composition.match(/\((\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|%|iu|units?)\)/i);
    if (compMatch) {
      return `${compMatch[1]}${compMatch[2].toLowerCase()}`;
    }
  }
  
  return ""; // Return empty if no dosage found
};

const determineRouteFromName = (medicineName: string, packType?: string | null, packSizeLabel?: string | null): string => {
  const name = medicineName.toLowerCase();
  const pack = (packSizeLabel || "").toLowerCase();
  
  // Injectable forms (highest priority)
  if (name.includes("injection") || name.includes("vial") || pack.includes("injection") || pack.includes("vial")) {
    if (name.includes("iv") || pack.includes("iv") || name.includes("intravenous")) return "IV";
    if (name.includes("im") || pack.includes("im") || name.includes("intramuscular")) return "IM";
    return "IM"; // Default for injections
  }
  
  // Eye preparations
  if (name.includes("eye") || name.includes("ophthalmic") || name.includes("drops") || 
      pack.includes("eye") || pack.includes("ophthalmic")) {
    return "Eye Drops";
  }
  
  // Topical preparations
  if (name.includes("cream") || name.includes("gel") || name.includes("ointment") || 
      name.includes("lotion") || name.includes("topical") || name.includes("paste") ||
      pack.includes("cream") || pack.includes("gel") || pack.includes("ointment")) {
    return "Topical";
  }
  
  // Inhalation preparations
  if (name.includes("inhaler") || name.includes("nebul") || name.includes("inhaled") ||
      name.includes("spray") || name.includes("aerosol") || pack.includes("inhaler")) {
    return "Inhaled";
  }
  
  // Liquid oral preparations (syrups, suspensions, solutions)
  if (name.includes("syrup") || name.includes("suspension") || name.includes("solution") ||
      name.includes("liquid") || name.includes("elixir") || name.includes("drops") ||
      pack.includes("syrup") || pack.includes("suspension") || pack.includes("solution")) {
    return "Oral";
  }
  
  // Subcutaneous preparations
  if (name.includes("subcutaneous") || name.includes("sc ") || name.includes("s.c.") ||
      name.includes("pen") || name.includes("autoinjector")) {
    return "Subcutaneous";
  }
  
  // Solid oral preparations (tablets, capsules, pills)
  if (name.includes("tablet") || name.includes("capsule") || name.includes("cap ") || 
      name.includes("pill") || name.includes("lozenge") || name.includes("chewable") ||
      packType === "strip" || pack.includes("tablet") || pack.includes("capsule")) {
    return "Oral";
  }
  
  // Default to oral for most medicines
  return "Oral";
};

const suggestFrequencyFromComposition = (composition?: string | null): string => {
  if (!composition) return ""; // Return empty if no composition
  
  const comp = composition.toLowerCase();
  
  // Antibiotics - usually TDS (3 times daily)
  if (comp.includes("amoxicillin") || comp.includes("azithromycin") || comp.includes("cephalexin") ||
      comp.includes("ciprofloxacin") || comp.includes("doxycycline") || comp.includes("erythromycin") ||
      comp.includes("clindamycin") || comp.includes("clarithromycin") || comp.includes("cefixime") ||
      comp.includes("norfloxacin") || comp.includes("levofloxacin") || comp.includes("trimethoprim")) {
    return "TDS";
  }
  
  // Pain relievers & NSAIDs - usually TDS
  if (comp.includes("paracetamol") || comp.includes("ibuprofen") || comp.includes("diclofenac") ||
      comp.includes("aspirin") || comp.includes("naproxen") || comp.includes("aceclofenac") ||
      comp.includes("nimesulide") || comp.includes("tramadol") || comp.includes("ketorolac")) {
    return "TDS";
  }
  
  // Antacids & PPIs - usually OD (once daily)
  if (comp.includes("omeprazole") || comp.includes("pantoprazole") || comp.includes("esomeprazole") ||
      comp.includes("lansoprazole") || comp.includes("rabeprazole") || comp.includes("ranitidine") ||
      comp.includes("famotidine") || comp.includes("cimetidine")) {
    return "OD";
  }
  
  // Hypertension medications - usually OD
  if (comp.includes("amlodipine") || comp.includes("telmisartan") || comp.includes("atenolol") ||
      comp.includes("metoprolol") || comp.includes("lisinopril") || comp.includes("enalapril") ||
      comp.includes("losartan") || comp.includes("valsartan") || comp.includes("nifedipine")) {
    return "OD";
  }
  
  // Diabetes medications - usually OD or BD
  if (comp.includes("metformin") || comp.includes("glimepiride") || comp.includes("gliclazide") ||
      comp.includes("pioglitazone") || comp.includes("sitagliptin") || comp.includes("vildagliptin")) {
    return "OD";
  }
  
  // Cholesterol medications - usually OD (evening)
  if (comp.includes("atorvastatin") || comp.includes("rosuvastatin") || comp.includes("simvastatin") ||
      comp.includes("pravastatin") || comp.includes("lovastatin")) {
    return "OD";
  }
  
  // Antihistamines - usually OD or BD
  if (comp.includes("cetirizine") || comp.includes("loratadine") || comp.includes("fexofenadine") ||
      comp.includes("chlorpheniramine") || comp.includes("diphenhydramine")) {
    return "OD";
  }
  
  // Cough & cold medications - usually TDS
  if (comp.includes("dextromethorphan") || comp.includes("guaifenesin") || comp.includes("bromhexine") ||
      comp.includes("ambroxol") || comp.includes("terbutaline") || comp.includes("salbutamol")) {
    return "TDS";
  }
  
  // Eye drops - usually BD (twice daily)
  if (comp.includes("timolol") || comp.includes("prednisolone") || comp.includes("dexamethasone") ||
      comp.includes("cyclosporine") || comp.includes("brimonidine") || comp.includes("latanoprost")) {
    return "BD";
  }
  
  // Antifungals - usually BD or TDS
  if (comp.includes("fluconazole") || comp.includes("itraconazole") || comp.includes("ketoconazole") ||
      comp.includes("terbinafine") || comp.includes("clotrimazole")) {
    return "BD";
  }
  
  // Antiviral medications - usually BD
  if (comp.includes("acyclovir") || comp.includes("valacyclovir") || comp.includes("oseltamivir") ||
      comp.includes("ribavirin")) {
    return "BD";
  }
  
  // Proton pump inhibitors - usually OD (before breakfast)
  if (comp.includes("dexlansoprazole") || comp.includes("vonoprazan")) {
    return "OD";
  }
  
  // Anticonvulsants - usually BD
  if (comp.includes("phenytoin") || comp.includes("carbamazepine") || comp.includes("valproic") ||
      comp.includes("levetiracetam") || comp.includes("lamotrigine")) {
    return "BD";
  }
  
  // Thyroid medications - usually OD (morning)
  if (comp.includes("levothyroxine") || comp.includes("liothyronine")) {
    return "OD";
  }
  
  // Return empty if no specific frequency found
  return "";
};

export function MedicineCombobox({
  value,
  onValueChange,
  onMedicineSelect,
  placeholder = "Search medicines by name...",
  disabled = false,
  className,
  showClearButton = true,
  onClear
}: MedicineComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300)
  const [selectedMedicine, setSelectedMedicine] = React.useState<Medicine | null>(null)
  const { session, initialLoading } = useAuth()

  // Fetch medicines with name-only search for better relevance
  const { data: medicines = [], isLoading } = useQuery({
    queryKey: ['medicines', debouncedSearchQuery, session?.access_token],
    queryFn: async () => {
      if (!session?.access_token) {
        return []
      }

      const supabase = getSupabase()
      
      if (!debouncedSearchQuery.trim()) {
        // If no search term, return popular medicines first
        const { data, error } = await supabase
          .rpc('search_medicines', { search_term: '', limit_count: 50 })
        
        if (error) {
          console.error('Error fetching medicines:', error)
          return []
        }
        return data || []
      }

      // Search using the search_medicines function
      const { data, error } = await supabase
        .rpc('search_medicines', {
          search_term: debouncedSearchQuery.toLowerCase(),
          limit_count: 50
        })

      if (error) {
        console.error('Error searching medicines:', error)
        return []
      }

      return data || []
    },
    enabled: !!session?.access_token && !initialLoading,
  })

  // Separate query to get the selected medicine details if we have a value but no selectedMedicine
  const { data: selectedMedicineData } = useQuery({
    queryKey: ['selected-medicine', value, session?.access_token],
    queryFn: async () => {
      if (!session?.access_token || !value || selectedMedicine?.name === value) {
        return null
      }
      
      const supabase = getSupabase()
      const { data, error } = await supabase
        .rpc('search_medicines', { search_term: value, limit_count: 1 })

      if (error) {
        console.error('Error fetching selected medicine:', error)
        return null
      }
      return data?.[0] || null
    },
    enabled: !!value && !!session?.access_token && !initialLoading && selectedMedicine?.name !== value,
  })

  // Update selectedMedicine when we get the data
  React.useEffect(() => {
    if (selectedMedicineData) {
      setSelectedMedicine(selectedMedicineData)
    } else if (!value) {
      setSelectedMedicine(null)
    }
  }, [selectedMedicineData, value])

  // Also check if the selected medicine is in the current medicines array
  React.useEffect(() => {
    if (value && medicines.length > 0) {
      const foundMedicine = medicines.find((medicine) => medicine.name === value)
      if (foundMedicine && (!selectedMedicine || selectedMedicine.name !== value)) {
        setSelectedMedicine(foundMedicine)
      }
    }
  }, [value, medicines, selectedMedicine])

  const handleSelect = (medicine: Medicine) => {
    const autoFillData: MedicationAutoFillData = {
      dosage: extractDosageFromName(medicine.name, medicine.short_composition1),
      route: determineRouteFromName(medicine.name, medicine.pack_type, medicine.pack_size_label),
      suggestedFrequency: suggestFrequencyFromComposition(medicine.short_composition1)
    };

    setSelectedMedicine(medicine)
    onValueChange?.(medicine.name)
    onMedicineSelect?.(medicine, autoFillData)
    setOpen(false)
    setSearchQuery("") // Clear search after selection
  }

  const handleClear = () => {
    setSelectedMedicine(null)
    setSearchQuery("") // Clear search query immediately
    onValueChange?.("")
    onClear?.()
  }


  const formatComposition = (comp1: string | null, comp2: string | null) => {
    if (!comp1) return "Composition N/A"
    if (comp2) {
      return `${comp1} + ${comp2}`
    }
    return comp1
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled || initialLoading}
        >
          <div className="flex items-center gap-2 flex-1 text-left">
            <Pill className="h-4 w-4 text-muted-foreground" />
            {selectedMedicine ? (
              <div className="flex flex-col gap-1 flex-1">
                <span className="font-medium">{selectedMedicine.name}</span>
              </div>
            ) : value ? (
              <div className="flex flex-col gap-1 flex-1">
                <span className="font-medium">{value}</span>
                <span className="text-xs text-muted-foreground">Loading details...</span>
              </div>
            ) : initialLoading ? (
              <span className="text-muted-foreground">Loading medicines...</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          {showClearButton && (value || selectedMedicine) && (
            <div
              className="h-6 w-6 p-0 hover:bg-muted rounded flex items-center justify-center cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear medicine</span>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search medicines..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            disabled={disabled || initialLoading}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>
              {isLoading || initialLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Loading medicines...</span>
                </div>
              ) : medicines.length === 0 && debouncedSearchQuery ? (
                <div className="py-6 text-center">
                  <Pill className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p>No medicines found for "{debouncedSearchQuery}"</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try searching by medicine brand name or composition
                  </p>
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Start typing to search medicines...
                </div>
              )}
            </CommandEmpty>
            {medicines.map((medicine) => (
                  <CommandItem
                    key={medicine.id}
                    value={medicine.name}
                    onSelect={() => handleSelect(medicine)}
                  >
                <Pill className="mr-2 h-4 w-4 shrink-0" />
                <div className="flex flex-col">
                  <span>{medicine.name}</span>
                          {medicine.short_composition1 && (
                    <span className="text-xs text-muted-foreground">
                              {formatComposition(medicine.short_composition1, medicine.short_composition2)}
                              </span>
                            )}
                    </div>
                  </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 