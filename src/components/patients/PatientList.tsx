import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "lucide-react";
import {  PatientWithConsultations } from "@/types/patients";


interface PatientListProps {
  isLoading: boolean;
  patients: PatientWithConsultations[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  selectedPatient: PatientWithConsultations | null;
  setSelectedPatient: (patient: PatientWithConsultations) => void;
}

export const PatientList = ({
  isLoading,
  patients,
  totalCount,
  totalPages,
  currentPage,
  setCurrentPage,
  selectedPatient,
  setSelectedPatient,
}: PatientListProps) => {
  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 ">
          <User className="h-5 w-5" />
          <span>Patients</span>
          <Badge variant="default" className="status-badge ">{totalCount}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-md animate-pulse" />
              ))}
            </div>
          ) :
            <div className="space-y-1">
              {(patients || []).map((patient) => (
                <div
                  key={patient.id}
                  className={`p-4 cursor-pointer transition-colors border-b hover:bg-primary/10 ${selectedPatient?.id === patient.id ? 'bg-primary/10 border-primary/20' : ''
                    }`}
                  onClick={() => setSelectedPatient(patient)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 " />
                      </div>
                      <div>
                        <h4 className="font-medium">{patient.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {patient.gender} • Age {patient.age || 'N/A'}
                        </p>
                        {patient.medical_id && (
                          <p className="text-xs text-muted-foreground">ID: {patient.medical_id}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {patient.consultations.length === 1 ? patient.consultations.length + ' visit' : patient.consultations.length + ' visits'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }
        </ScrollArea>

        {totalPages > 1 && (
          <div className="p-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (pageNum <= totalPages && pageNum > 0) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  )
};
