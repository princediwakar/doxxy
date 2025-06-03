import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import Supabase generated types
import { Tables } from "@/integrations/supabase/types";
import { getAge, renderGender } from "@/lib/utils";

// Define local Patient type using generated types
type Patient = Tables<'patients'>;

// Define local enhanced patient type to match what's passed from parent
export interface EnhancedPatientForDoctorList extends Patient {
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
  const handlePreviousPage = () => {
    if (currentPatientPage > 1) {
      setCurrentPatientPage(currentPatientPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPatientPage < totalPatientPages) {
      setCurrentPatientPage(currentPatientPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPatientPage(page);
  };

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
                className="p-3 border rounded-md flex justify-between items-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onPatientClick(patient)}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <User size={16} className="text-primary" />
                  </div>
                  <div>
                    <span className="font-medium flex items-center gap-2">
                      {patient.name}
                    </span>
                      {getAge(patient.date_of_birth) && (
                        <span className="text-xs text-muted-foreground">{getAge(patient.date_of_birth)}, {(patient.gender)}</span>
                      )}
                    {/* <p className="text-sm text-muted-foreground">ID: {patient.medical_id || 'N/A'}</p> */}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Last visit: {patient.lastVisit || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {totalPatientPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPatientPage === 1 || patientsLoading}
            >
              Previous
            </Button>
            
            <div className="flex space-x-1">
              {[...Array(totalPatientPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPatientPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageClick(pageNum)}
                    disabled={patientsLoading}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPatientPage === totalPatientPages || patientsLoading}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
