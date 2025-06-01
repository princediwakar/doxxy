import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination";

// Import Supabase generated types
import { Tables } from "@/integrations/supabase/types";

// Define local Patient type using generated types
type Patient = Tables<'patients'>;

// Define local enhanced patient type to match what's passed from parent
interface EnhancedPatientForDoctorList extends Patient {
  lastVisit?: string;
}

interface DoctorPatientsListProps {
  // Use the local enhanced patient type for the patients prop
  patients: EnhancedPatientForDoctorList[];
  patientsLoading: boolean;
  currentPatientPage: number;
  patientsPerPage: number;
  totalPatientPages: number;
  setCurrentPatientPage: (page: number) => void;
  // Use local Patient type for onPatientClick
  onPatientClick: (patient: Patient) => void;
}

export function DoctorPatientsList({
  patients,
  patientsLoading,
  currentPatientPage,
  patientsPerPage,
  totalPatientPages,
  setCurrentPatientPage,
  onPatientClick,
}: DoctorPatientsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          My Patients
        </CardTitle>
      </CardHeader>
      <CardContent>
        {patientsLoading ? (
          <div className="space-y-3">
            {[...Array(patientsPerPage)].map((_, i) => (
              <div key={i} className="h-10 bg-muted/50 rounded-md animate-pulse"></div>
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No patients found for this doctor.
          </div>
        ) : (
          <div className="space-y-2">
            {patients.map((patient) => (
              <div 
                key={patient.id} 
                className="p-3 border rounded-md flex justify-between items-center cursor-pointer hover:bg-muted/50"
                onClick={() => onPatientClick(patient)}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                    <User size={16} className="text-primary" />
                  </div>
                  <span className="font-medium">{patient.name}</span>
                </div>
                {/* Ensure lastVisit is displayed correctly, using fallback if undefined */}
                <div className="text-sm text-muted-foreground">Last visit: {patient.lastVisit || 'N/A'}</div>
              </div>
            ))}
          </div>
        )}
        {totalPatientPages > 1 && (
           <div className="flex justify-center mt-4">
             <Pagination>
               <PaginationContent>
                 <PaginationItem>
                   <PaginationPrevious 
                     onClick={() => setCurrentPatientPage(prev => Math.max(prev - 1, 1))}
                     className={currentPatientPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                     disabled={patientsLoading}
                   />
                 </PaginationItem>
                 
                 {[...Array(totalPatientPages)].map((_, i) => {
                   const pageNum = i + 1;
                   return (
                     <PaginationItem key={i}>
                       <PaginationLink 
                         onClick={() => setCurrentPatientPage(pageNum)}
                         isActive={currentPatientPage === pageNum}
                         disabled={patientsLoading}
                       >
                         {pageNum}
                       </PaginationLink>
                     </PaginationItem>
                   );
                 })}
                 
                 <PaginationItem>
                   <PaginationNext 
                     onClick={() => setCurrentPatientPage(prev => Math.min(prev + 1, totalPatientPages))}
                     className={currentPatientPage === totalPatientPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                     disabled={patientsLoading}
                   />
                 </PaginationItem>
               </PaginationContent>
             </Pagination>
           </div>
        )}
      </CardContent>
    </Card>
  );
} 