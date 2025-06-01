import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, Plus, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
// Assuming AppointmentModal exists and is correctly exported
import { AppointmentModal } from '@/components/AppointmentModal';
import { format, parseISO } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Type for the return of the get_appointments_with_details_by_clinic RPC
interface AppointmentWithDetails {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  notes: string;
  created_at: string;
  clinic_id: string;
  patient_name: string;
  doctor_name: string;
  department_name: string; // Although not explicitly in types.ts, it is in the RPC return type signature
}

const fetchAppointments = async (clinicId: string, searchTerm: string) => {
  console.log("fetchAppointments: Fetching for clinic", clinicId, "search", searchTerm);

  // Using the RPC to get appointments with patient and doctor names
  const query = supabase
    .rpc('get_appointments_with_details_by_clinic', { clinic_id: clinicId });

  // Basic client-side filtering by patient or doctor name (adjust as needed for performance with large datasets)
  // A server-side function might be more efficient for large datasets
   if (searchTerm.trim()) {
     // Note: Filtering on RPC results requires client-side logic or modifying the RPC
     // For simplicity, this example will filter client-side.
     // For better performance, consider adding search parameters to the RPC itself.
   }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }

  let filteredData = data || [];

   if (searchTerm.trim()) {
     const lowerSearchTerm = searchTerm.toLowerCase();
     filteredData = filteredData.filter(app =>
       app.patient_name.toLowerCase().includes(lowerSearchTerm) ||
       app.doctor_name.toLowerCase().includes(lowerSearchTerm) ||
       app.date.includes(lowerSearchTerm) // Simple date search
     );
   }


  return filteredData as AppointmentWithDetails[];
};

const Appointments = () => {
  console.log("Appointments: Rendering component");
  const { user, activeClinic, activeClinicRole, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  // State for the AppointmentModal - assuming it will be used
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: appointments, isLoading, isError, error } = useQuery({
    queryKey: ['appointments', activeClinic?.clinic_id, searchTerm],
    queryFn: () => fetchAppointments(activeClinic!.clinic_id, searchTerm),
    enabled: !!activeClinic && !authLoading, // Only fetch if clinic is selected and auth is not loading
    retry: 1,
  });

  // Filter appointments for doctors if necessary
  const filteredAppointments = activeClinicRole === 'doctor'
    ? (appointments || []).filter(app => app.doctor_id === user?.id)
    : (appointments || []);


  console.log("Appointments: authLoading=", authLoading, "activeClinic=", !!activeClinic, "appointments count=", filteredAppointments.length);


  // Handle opening the modal for a new appointment
  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setIsAppointmentModalOpen(true);
  };

  // Handle opening the modal for an existing appointment
  const handleAppointmentClick = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
    setIsAppointmentModalOpen(true);
  };

  // Handle closing the modal and refreshing data
  const handleModalClose = (open: boolean) => {
    setIsAppointmentModalOpen(open);
    if (!open && activeClinic) {
      queryClient.invalidateQueries({ queryKey: ['appointments', activeClinic.clinic_id] });
    }
  };

  // Handle canceling an appointment
  const handleCancelAppointment = async (appointmentId: string) => {
    if (!activeClinic?.clinic_id) {
      toast.error("No active clinic selected.");
      return;
    }
    // Add a confirmation step before canceling
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      setLoading(true); // Assuming you have a loading state
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'Cancelled' })
        .eq('id', appointmentId)
        .eq('clinic_id', activeClinic.clinic_id); // Ensure multi-tenancy

      if (error) {
        throw error;
      }

      toast.success("Appointment canceled successfully.");
      queryClient.invalidateQueries({ queryKey: ['appointments', activeClinic.clinic_id] });
    } catch (e) {
      console.error("Error canceling appointment:", e);
      toast.error(`Failed to cancel appointment: ${e instanceof Error ? e.message : 'An unknown error occurred'}`);
    } finally {
      setLoading(false); // Assuming you have a loading state
    }
  };

  if (authLoading) {
    console.log("Appointments: Rendering null due to authLoading");
    return null;
  }

  if (!activeClinic) {
    console.log("Appointments: Rendering no clinic message");
    return <div className="text-center py-4">Please select a clinic to view appointments.</div>;
  }

  if (error) {
    console.error("Appointments: Error fetching data", error);
    toast.error("Failed to load appointments");
    return <div className="text-center py-4 text-red-500">Error loading appointments.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">View and manage clinic appointments</p>
        </div>
        {/* Show New Appointment button for Superadmins and Staff */}
        {(activeClinicRole === 'admin' || activeClinicRole === 'superadmin' || activeClinicRole === 'staff') && (
          <Button
          onClick={handleNewAppointment}
          >
            <Plus size={18} className="mr-2" />
            New Appointment
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by patient or doctor name, or date..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {/* Placeholder for loading state */}
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
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      {searchTerm ? "No appointments match your search" : "No appointments found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow
                      key={appointment.id}
                      className="hover:bg-muted/50"
                    >
                      <TableCell onClick={() => handleAppointmentClick(appointment)} className="cursor-pointer">{format(parseISO(appointment.date), 'PPP')}</TableCell>
                      <TableCell onClick={() => handleAppointmentClick(appointment)} className="cursor-pointer">{appointment.time}</TableCell>
                      <TableCell onClick={() => handleAppointmentClick(appointment)} className="cursor-pointer font-medium">{appointment.patient_name}</TableCell>
                      <TableCell onClick={() => handleAppointmentClick(appointment)} className="cursor-pointer">{appointment.doctor_name}</TableCell>
                      <TableCell onClick={() => handleAppointmentClick(appointment)} className="cursor-pointer hidden sm:table-cell">{appointment.type}</TableCell>
                      <TableCell onClick={() => handleAppointmentClick(appointment)} className="cursor-pointer hidden sm:table-cell">{appointment.status}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleAppointmentClick(appointment)}>
                              Edit Appointment
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {appointment.status !== 'Cancelled' && (
                               <DropdownMenuItem
                                 onClick={() => handleCancelAppointment(appointment.id)}
                                 className="text-red-600 focus:text-red-600"
                               >
                                 Cancel Appointment
                               </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination can be added here if needed, but the current fetchPatients doesn't support it */}
          {/* For now, we'll omit pagination as the RPC doesn't support limit/offset directly */}
           {/*
           <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                 <PaginationItem>
                   <PaginationLink href="#">1</PaginationLink>
                 </PaginationItem>
                 <PaginationItem>
                   <PaginationLink href="#" isActive>
                     2
                   </PaginationLink>
                 </PaginationItem>
                 <PaginationItem>
                   <PaginationLink href="#">3</PaginationLink>
                 </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
           */}
        </>
      )}

      {/* Appointment Modal component */}
      <AppointmentModal
        open={isAppointmentModalOpen}
        onOpenChange={handleModalClose}
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default Appointments;
