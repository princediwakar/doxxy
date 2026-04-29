"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, Check, Building2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation"
import { useState } from "react";

const ClinicSwitcher = () => {
  const { userClinics, activeClinic, setActiveClinicId } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!userClinics || userClinics.length === 0) {
    return null; // Don't show switcher if no clinics or clinics data is not loaded
  }

  const handleClinicSelect = (clinicId: string) => {
    setActiveClinicId(clinicId);
    setOpen(false); // Close dropdown after selection
  };

  const handleCreateNewClinic = () => {
    router.push('/create-clinic');
    setOpen(false); // Close dropdown after navigation
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start text-left font-semibold hover:bg-accent/50 px-4"
          aria-label="Select clinic"
        >
          <Building2 size={16} className="mr-2" />
          <span className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
            {activeClinic ? activeClinic.clinics?.name : "Select a Clinic"}
          </span>
          {userClinics.length > 1 && (
             <ChevronDown size={16} className={cn(
               "ml-2 transition-transform duration-200",
               open && "transform rotate-180"
             )} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-1 bg-popover border border-border shadow-lg rounded-lg">
         {userClinics.map((clinic) => (
            <Button
               key={clinic.clinic_id}
               variant="ghost"
               className={cn(
                 "w-full justify-start gap-3 px-3 py-2.5 h-auto transition-colors rounded-md",
                 activeClinic?.clinic_id === clinic.clinic_id 
                   ? "bg-accent text-accent-foreground" 
                   : "hover:bg-accent/50"
               )}
               onClick={() => handleClinicSelect(clinic.clinic_id)}
            >
               <Building2 size={16} className={cn(
                 "flex-shrink-0",
                 activeClinic?.clinic_id === clinic.clinic_id ? "text-primary" : "text-muted-foreground"
               )} />
               <span className="flex-grow text-left truncate font-medium">
                {clinic.clinics?.name}</span>
               {activeClinic?.clinic_id === clinic.clinic_id && (
                  <Check size={16} className="text-primary flex-shrink-0" />
               )}
            </Button>
         ))}
         
         {/* Separator */}
         <div className="h-px bg-border my-1 mx-2" />
         
         {/* Create New Clinic Option */}
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
