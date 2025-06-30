import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, Check, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ClinicSwitcher = ({ sidebarOpen }: { sidebarOpen: boolean }) => {
  const { userClinics, activeClinic, setActiveClinicId } = useAuth();

  if (!userClinics || userClinics.length === 0) {
    return null; // Don't show switcher if no clinics or clinics data is not loaded
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-left font-semibold",
            sidebarOpen ? "px-4" : "px-2 justify-center"
          )}
          aria-label="Select clinic"
        >
          <Building2 size={16} className="mr-2" />
          <span className={cn(
             "flex-grow overflow-hidden text-ellipsis whitespace-nowrap transition-opacity duration-200",
             sidebarOpen ? "opacity-100" : "opacity-0 md:opacity-0 hidden md:block"
          )}>
            {activeClinic ? activeClinic.clinics?.name : "Select a Clinic"}
          </span>
          {userClinics.length > 1 && sidebarOpen && (
             <ChevronDown size={16} className="ml-2 transition-transform duration-200" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 border">
         {userClinics.map((clinic) => (
            <Button
               key={clinic.clinic_id}
               variant="ghost"
               className={cn(
                 "w-full justify-start gap-2 transition-colors",
                 activeClinic?.clinic_id === clinic.clinic_id 
                   ? "bg-primary/10 text-primary hover:bg-primary/15" 
                   : "hover:bg-muted/50"
               )}
               onClick={() => setActiveClinicId(clinic.clinic_id)}
            >
               <span className="flex-grow text-left truncate">
                {clinic.clinics?.name}</span>
               {activeClinic?.clinic_id === clinic.clinic_id && (
                  <Check size={16} className="text-primary" />
               )}
            </Button>
         ))}
      </PopoverContent>
    </Popover>
  );
};

export default ClinicSwitcher;
