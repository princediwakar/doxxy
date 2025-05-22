
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
import { Badge } from "@/components/ui/badge";
import { PatientModal } from "@/components/PatientModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPatients();
  }, [currentPage]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      // Calculate pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Set total pages
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));

      // Fetch patients with pagination
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get appointment data for each patient to determine "status"
      const enhancedPatients = await Promise.all((data || []).map(async (patient) => {
        // Get last appointment
        const { data: lastAppointment, error: appError } = await supabase
          .from('appointments')
          .select('date, status')
          .eq('patient_id', patient.id)
          .order('date', { ascending: false })
          .limit(1)
          .single();

        if (appError && appError.code !== 'PGRST116') {
          console.error("Error fetching appointment:", appError);
        }

        // Determine status based on last appointment
        let status = "Inactive";
        if (lastAppointment) {
          const today = new Date().toISOString().split('T')[0];
          const appointmentDate = lastAppointment.date;

          if (lastAppointment.status === "Scheduled" && appointmentDate >= today) {
            status = "Scheduled";
          } else if (lastAppointment.status === "Completed" && 
                    new Date(appointmentDate) >= new Date(new Date().setDate(new Date().getDate() - 30))) {
            status = "Active";
          }
        }

        // Format date of birth if exists
        const formattedDob = patient.date_of_birth 
          ? new Date(patient.date_of_birth).toLocaleDateString() 
          : '';

        // Calculate age if date of birth exists
        let age = null;
        if (patient.date_of_birth) {
          const dob = new Date(patient.date_of_birth);
          const today = new Date();
          age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
          }
        }

        // Format last visit date if exists
        const { data: lastVisitData } = await supabase
          .from('appointments')
          .select('date')
          .eq('patient_id', patient.id)
          .eq('status', 'Completed')
          .order('date', { ascending: false })
          .limit(1)
          .single();

        const lastVisit = lastVisitData ? new Date(lastVisitData.date).toLocaleDateString() : '';

        return {
          ...patient,
          age,
          lastVisit,
          status,
        };
      }));

      setPatients(enhancedPatients);
    } catch (error: any) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const handlePatientClick = (patient: any) => {
    setSelectedPatient(patient);
    setOpenModal(true);
  };

  const handleNewPatient = () => {
    setSelectedPatient(null);
    setOpenModal(true);
  };

  const handleModalClose = (newPatient?: boolean) => {
    if (newPatient) {
      fetchPatients();
    }
    setOpenModal(false);
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter((patient) =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">Manage and view patient records</p>
        </div>
        <Button onClick={handleNewPatient}>
          <Plus size={18} className="mr-2" />
          Add Patient
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients by name, email, or phone..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted/50 rounded-md animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Gender</TableHead>
                  <TableHead className="hidden md:table-cell">Age</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Visit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      {searchTerm ? "No patients match your search" : "No patients found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
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
                      <TableCell className="hidden sm:table-cell">{patient.gender || "-"}</TableCell>
                      <TableCell className="hidden md:table-cell">{patient.age || "-"}</TableCell>
                      <TableCell className="hidden md:table-cell">{patient.phone || "-"}</TableCell>
                      <TableCell className="hidden lg:table-cell">{patient.lastVisit || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={
                          patient.status === "Active" ? "default" :
                          patient.status === "Scheduled" ? "outline" : "secondary"
                        }>
                          {patient.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!searchTerm && totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => {
                  // Show max 3 pages with current page in middle when possible
                  let pageNum = currentPage;
                  if (currentPage === 1) {
                    pageNum = i + 1;
                  } else if (currentPage === totalPages && totalPages >= 3) {
                    pageNum = totalPages - 2 + i;
                  } else if (totalPages >= 3) {
                    pageNum = currentPage - 1 + i;
                  } else {
                    pageNum = i + 1;
                  }
                  
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
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      <PatientModal
        open={openModal}
        onOpenChange={handleModalClose}
        patient={selectedPatient}
      />
    </div>
  );
};

export default Patients;
