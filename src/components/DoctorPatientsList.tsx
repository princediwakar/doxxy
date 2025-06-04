import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import Supabase generated types
import { Tables } from "@/integrations/supabase/types";
import { getAge, renderGender } from "@/lib/utils";
import { EnhancedPatientForDoctorList } from "@/types/dashboard";

interface DoctorPatientsListProps {
  patients: EnhancedPatientForDoctorList[];
  loading: boolean;
  patientsPerPage: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  onPatientClick: (patient: EnhancedPatientForDoctorList) => void;
}

export function DoctorPatientsList({
  patients,
  loading,
  patientsPerPage,
  currentPage,
  totalPages,
  setCurrentPage,
  onPatientClick,
}: DoctorPatientsListProps) {
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
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
        {loading ? (
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
                      {patient.date_of_birth && (
                        <span className="text-xs text-muted-foreground">{getAge(patient.date_of_birth)}, {patient.gender}</span>
                      )}
                    {/* <p className="text-sm text-muted-foreground">ID: {patient.medical_id || 'N/A'}</p> */}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Last visit: {patient.last_visit || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </Button>
            
            <div className="flex space-x-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageClick(pageNum)}
                    disabled={loading}
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
              disabled={currentPage === totalPages || loading}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
