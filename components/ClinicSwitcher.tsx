"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/contexts/AppStateContext";
import { ChevronDown, Check, Building2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ClinicSwitcherProps {
  isCollapsed?: boolean;
}

const ClinicSwitcher = ({ isCollapsed = false }: ClinicSwitcherProps) => {
  const { userClinics, activeClinicId, activeClinicName, setActiveClinicId } = useAppState();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!userClinics || userClinics.length === 0) {
    return null; 
  }

  const handleClinicSelect = (clinicId: string) => {
    setActiveClinicId(clinicId);
    document.cookie = `active-clinic-id=${clinicId}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    setOpen(false);
    router.refresh();
  };

  const handleCreateNewClinic = () => {
    router.push('/clinics/new');
    setOpen(false); 
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={isCollapsed ? "outline" : "ghost"}
          className={cn(
            "font-semibold transition-all duration-300",
            isCollapsed 
              ? "w-10 h-10 px-0 flex items-center justify-center mx-auto" 
              : "w-full justify-start text-left px-4 hover:bg-accent/50"
          )}
          aria-label="Select clinic"
        >
          <Building2 size={18} className={cn("flex-shrink-0", !isCollapsed && "mr-2")} />
          
          {!isCollapsed && (
            <>
              <span className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
                {activeClinicName || "Select a Clinic"}
              </span>
              <ChevronDown size={16} className={cn(
                "ml-2 transition-transform duration-200 flex-shrink-0",
                open && "transform rotate-180"
              )} />
            </>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-64 p-1 bg-popover border border-border shadow-lg rounded-lg" 
        side={isCollapsed ? "right" : "bottom"} 
        align="start"
      >
         {userClinics.map((clinic) => (
            <Button
               key={clinic.clinic_id}
               variant="ghost"
               className={cn(
                 "w-full justify-start gap-3 px-3 py-2.5 h-auto transition-colors rounded-md",
                 activeClinicId === clinic.clinic_id
                   ? "bg-accent text-accent-foreground"
                   : "hover:bg-accent/50"
               )}
               onClick={() => handleClinicSelect(clinic.clinic_id)}
            >
               <Building2 size={16} className={cn(
                 "flex-shrink-0",
                 activeClinicId === clinic.clinic_id ? "text-primary" : "text-muted-foreground"
               )} />
               <span className="flex-grow text-left truncate font-medium">
                {clinic.clinics?.name}</span>
               {activeClinicId === clinic.clinic_id && (
                  <Check size={16} className="text-primary flex-shrink-0" />
               )}
            </Button>
         ))}
         
         <div className="h-px bg-border my-1 mx-2" />
         
         <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 py-2.5 h-auto text-primary hover:bg-primary/10 hover:text-primary rounded-md transition-colors"
            onClick={handleCreateNewClinic}
         >
            <Plus size={16} className="flex-shrink-0" />
            <span className="flex-grow text-left font-medium">Create New Clinic</span>
         </Button>
      </PopoverContent>
    </Popover>
  );
};

export default ClinicSwitcher;