import * as React from "react"
import { Check, ChevronsUpDown, Pill, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { getSupabase } from "@/integrations/supabase/client"
import { useDebounce } from "use-debounce"

interface Medicine {
  id: number
  name: string
  price: number | null
  is_discontinued: boolean | null
  manufacturer_name: string | null
  pack_size_label: string | null
  pack_type: string | null
  short_composition1: string | null
  short_composition2: string | null
}

interface MedicineComboboxProps {
  value?: string
  onValueChange?: (value: string) => void
  onMedicineSelect?: (medicine: Medicine, autoFillData: AutoFillData) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showClearButton?: boolean
  onClear?: () => void
}

interface AutoFillData {
  dosage: string
  route: string
  suggestedFrequency?: string
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

  // Fetch medicines with name-only search for better relevance
  const { data: medicines = [], isLoading } = useQuery({
    queryKey: ['medicines', debouncedSearchQuery],
    queryFn: async () => {
      const supabase = getSupabase()
      
      if (!debouncedSearchQuery.trim()) {
        // If no search term, return popular medicines first
        const { data, error } = await supabase
          .from('medicines')
          .select('*')
          .eq('is_discontinued', false)
          .order('name')
          .limit(50)
        
        if (error) throw error
        return data || []
      }

      // Search only by medicine name for focused, relevant results
      const searchTerm = debouncedSearchQuery.toLowerCase().trim()
      
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('is_discontinued', false)
        .ilike('name', `%${searchTerm}%`)
        .limit(50)

      if (error) throw error
      if (!data) return []

      // Client-side relevance sorting for medical-grade accuracy
      const sortedData = data.sort((a, b) => {
        const aName = a.name.toLowerCase()
        const bName = b.name.toLowerCase()

        // Priority 1: Exact matches (highest priority)
        if (aName === searchTerm && bName !== searchTerm) return -1
        if (bName === searchTerm && aName !== searchTerm) return 1

        // Priority 2: Name starts with search term (most important for medicines)
        const aStartsWithName = aName.startsWith(searchTerm)
        const bStartsWithName = bName.startsWith(searchTerm)
        if (aStartsWithName && !bStartsWithName) return -1
        if (bStartsWithName && !aStartsWithName) return 1

        // Priority 3: Name contains search term (position matters - earlier = better)
        const aNameIndex = aName.indexOf(searchTerm)
        const bNameIndex = bName.indexOf(searchTerm)
        if (aNameIndex !== -1 && bNameIndex !== -1) {
          // Earlier position in name = higher priority
          if (aNameIndex !== bNameIndex) return aNameIndex - bNameIndex
        }

        // Priority 4: Alphabetical fallback for identical relevance
        return aName.localeCompare(bName)
      })

      return sortedData
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Separate query to get the selected medicine details if we have a value but no selectedMedicine
  const { data: selectedMedicineData } = useQuery({
    queryKey: ['selected-medicine', value],
    queryFn: async () => {
      if (!value || selectedMedicine?.name === value) return null
      
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('name', value)
        .eq('is_discontinued', false)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!value && selectedMedicine?.name !== value,
    staleTime: 5 * 60 * 1000,
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
    const autoFillData: AutoFillData = {
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

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return "Price N/A"
    return `₹${price.toFixed(2)}`
  }

  const formatComposition = (comp1: string | null, comp2: string | null) => {
    if (!comp1) return "Composition N/A"
    if (comp2) {
      return `${comp1} + ${comp2}`
    }
    return comp1
  }

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) => 
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 text-yellow-800 font-medium">
          {part}
        </span>
      ) : part
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 flex-1 text-left">
            <Pill className="h-4 w-4 text-muted-foreground" />
            {selectedMedicine ? (
              <div className="flex flex-col gap-1 flex-1">
                <span className="font-medium">{selectedMedicine.name}</span>
                {/* <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{selectedMedicine.pack_size_label || 'Pack size N/A'}</span>
                </div> */}
              </div>
            ) : value ? (
              <div className="flex flex-col gap-1 flex-1">
                <span className="font-medium">{value}</span>
                <span className="text-xs text-muted-foreground">Loading details...</span>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {showClearButton && (selectedMedicine || value) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[450px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search medicines by name..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="border-0 focus:ring-0"
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Loading medicines...</span>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <Pill className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p>No medicines found.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try searching by medicine brand name
                  </p>
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {medicines.map((medicine) => {
                const autoFillData = {
                  dosage: extractDosageFromName(medicine.name, medicine.short_composition1),
                  route: determineRouteFromName(medicine.name, medicine.pack_type, medicine.pack_size_label),
                  suggestedFrequency: suggestFrequencyFromComposition(medicine.short_composition1)
                };

                return (
                  <CommandItem
                    key={medicine.id}
                    value={medicine.name}
                    onSelect={() => handleSelect(medicine)}
                    className="flex flex-col items-start gap-2 p-4 cursor-pointer hover:bg-blue-50"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Check
                        className={cn(
                          "h-4 w-4",
                          selectedMedicine?.id === medicine.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-base">
                            {highlightSearchTerm(medicine.name, debouncedSearchQuery)}
                          </span>
                          <Badge variant="secondary" className="text-xs font-bold bg-green-100 text-green-800">
                            {formatPrice(medicine.price)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-blue-600 font-medium">
                              {medicine.manufacturer_name || 'Unknown Manufacturer'}
                            </span>
                            <span className="text-gray-500">
                              {medicine.pack_size_label || 'Pack size N/A'}
                            </span>
                          </div>
                          {medicine.short_composition1 && (
                            <div className="text-purple-600 font-medium">
                              {formatComposition(medicine.short_composition1, medicine.short_composition2)}
                            </div>
                          )}
                          {/* Show auto-fill preview */}
                          <div className="flex items-center gap-3 pt-1">
                            {autoFillData.dosage && (
                              <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                                📋 {autoFillData.dosage}
                              </span>
                            )}
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-medium">
                              🚀 {autoFillData.route}
                            </span>
                            {autoFillData.suggestedFrequency && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                ⏰ {autoFillData.suggestedFrequency}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 