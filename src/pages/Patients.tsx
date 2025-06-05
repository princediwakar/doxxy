import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, Plus, User } from "lucide-react";
import { PatientModal } from "@/components/PatientModal";
import { PatientDetailsModal } from "@/components/PatientDetailsModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Database, Tables } from "@/integrations/supabase/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PostgrestError } from "@supabase/supabase-js";
import { AppointmentModal } from "@/components/AppointmentModal";
import { getAge } from "@/lib/utils";

type Patient = Database['public']['Tables']['patients']['Row'];
type GetPatientsByClinicResult = Patient[];

const fetchPatients = async (clinicId: string, page: number, itemsPerPage: number, searchTerm: string) => {
  console.log("fetchPatients: Fetching for clinic", clinicId, "page", page, "search", searchTerm);
  const from = (page - 1) * itemsPerPage;

  // Fetch patients and count using RPC only
  // Note: For count, ideally add a get_patients_count_by_clinic RPC in the backend
  let patientsData = [];
  let totalCount = 0;
  let error = null;

  // Use RPC for both search and non-search
  const { data, error: rpcError } = await supabase.rpc('get_patients_by_clinic', {
    _clinic_id: clinicId,
    _limit: itemsPerPage,
    _offset: from,
  });
  if (rpcError) throw rpcError;
  patientsData = data || [];

  // For count, fallback to length if no count RPC exists
  totalCount = patientsData.length < itemsPerPage ? from + patientsData.length : from + itemsPerPage + 1; // Approximate

  // TODO: Replace with a count RPC for accurate totalCount

  return { patients: patientsData, totalCount };
};

const Patients = () => {
  console.log("Patients: Rendering component");
  const { activeClinic, activeClinicRole, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isPatientDetailsModalOpen, setIsPatientDetailsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentPatient, setAppointmentPatient] = useState<Patient | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['patients', activeClinic?.clinic_id, currentPage, searchTerm],
    queryFn: () => fetchPatients(activeClinic!.clinic_id, currentPage, itemsPerPage, searchTerm),
    enabled: !!activeClinic && !authLoading,
    retry: 1,
  });

  console.log("Patients: authLoading=", authLoading, "activeClinic=", !!activeClinic, "patients=", data?.patients);

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsPatientDetailsModalOpen(true);
  };

  const handleNewPatient = () => {
    setSelectedPatient(null);
    setIsPatientModalOpen(true);
  };

  const handlePatientModalClose = () => {
    setIsPatientModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['patients', activeClinic?.clinic_id] });
  };

  const handlePatientDetailsModalClose = () => {
    setIsPatientDetailsModalOpen(false);
    setSelectedPatient(null);
  };

  if (authLoading) {
    console.log("Patients: Rendering null due to authLoading");
    return null;
  }

  if (!activeClinic) {
    console.log("Patients: Rendering no clinic message");
    return <div className="text-center py-4">Please select a clinic to view patients.</div>;
  }

  if (error) {
    console.error("Patients: Error fetching data", error);
    toast.error("Failed to load patients");
    return <div className="text-center py-4 text-red-500">Error loading patients.</div>;
  }

  const patients = data?.patients || [];
  const totalPages = Math.ceil((data?.totalCount || 0) / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Patients</h1>
          <p className="text-muted-foreground">Manage patient records</p>
        </div>
        {(activeClinicRole === 'superadmin') && (
          <Button onClick={handleNewPatient}>
            <Plus size={18} className="mr-2" />
            New Patient
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name or email..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted/50 rounded-md animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Age</TableHead>
                  <TableHead className="hidden sm:table-cell">Gender</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">Email</TableHead>
                  <TableHead className="hidden xl:table-cell">Date of Birth</TableHead>
                  <TableHead className="hidden xl:table-cell">Medical ID</TableHead>
                  {(activeClinicRole === 'superadmin' || activeClinicRole === 'staff') && (
                    <TableHead>Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      {searchTerm ? "No patients match your search" : "No patients found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  patients.map((patient) => (
                    <TableRow
                      key={patient.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handlePatientClick(patient)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                            <User size={16} className="text-primary" />
                          </div>
                          {patient.name}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{getAge(patient.date_of_birth)}</TableCell>
                      <TableCell className="hidden sm:table-cell">{patient.gender || "-"}</TableCell>
                      <TableCell className="hidden md:table-cell">{patient.phone || "-"}</TableCell>
                      <TableCell className="hidden lg:table-cell">{patient.email || "-"}</TableCell>
                      <TableCell className="hidden xl:table-cell">{patient.date_of_birth || "-"}</TableCell>
                      <TableCell className="hidden xl:table-cell">{patient.medical_id || "-"}</TableCell>
                      {(activeClinicRole === 'superadmin' || activeClinicRole === 'staff') && (
                        <TableCell onClick={e => e.stopPropagation()}>
                          <Button
                            size="sm"
                            onClick={() => {
                              setAppointmentPatient(patient);
                              setIsAppointmentModalOpen(true);
                            }}
                          >
                            <Plus size={14} className="mr-1" />
                            Schedule
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => {
                  const pageNum = currentPage <= 2 ? i + 1 : currentPage - 1 + i;
                  if (pageNum <= totalPages) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
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
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      <PatientModal
        open={isPatientModalOpen}
        onOpenChange={handlePatientModalClose}
        patient={selectedPatient}
        onPatientCreated={() => {}}
      />

      <PatientDetailsModal
        open={isPatientDetailsModalOpen}
        onOpenChange={handlePatientDetailsModalClose}
        patient={selectedPatient}
      />

      <AppointmentModal
        open={isAppointmentModalOpen}
        onOpenChange={(open) => {
          setIsAppointmentModalOpen(open);
          if (!open) setAppointmentPatient(null);
        }}
        appointment={null}
        patient={appointmentPatient}
      />
    </div>
  );
};

export default Patients;
