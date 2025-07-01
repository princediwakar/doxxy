import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, MoreHorizontal, Calendar, AlertCircle, CheckCircle2, Timer, Activity, Stethoscope } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppointmentModal } from '@/components/appointments/AppointmentModal';
import { format, parseISO, isToday, isFuture, isPast } from 'date-fns';
import { formatTimeIST } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConsultationModal } from '@/components/consultation/ConsultationModal';
import { ConsultationViewModal } from '@/components/consultation/ConsultationViewModal';
import { BillingModal } from '@/components/billing/BillingModal';
import { Enums, Database } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Type for the return of the get_appointments_with_details_by_clinic RPC
// Uses the properly typed RPC return type from supabase
type AppointmentWithDetails = Database['public']['Functions']['get_appointments_with_details_by_clinic']['Returns'][0];

type AppointmentFilter = 'today' | 'upcoming' | 'past';

const supabase = getSupabase();

// Enhanced sorting function to prioritize appointments properly
const sortAppointments = (appointments: AppointmentWithDetails[], filter: AppointmentFilter) => {
  return appointments.sort((a, b) => {
    const aDate = parseISO(a.date);
    const bDate = parseISO(b.date);
    
    if (filter === 'today') {
      // For today's appointments, prioritize by urgency and time
      const urgencyOrder = { 'Scheduled': 0, 'In Progress': 1, 'Completed': 2, 'Cancelled': 3 };
      const aUrgency = urgencyOrder[a.status] ?? 999;
      const bUrgency = urgencyOrder[b.status] ?? 999;
      
      if (aUrgency !== bUrgency) {
        return aUrgency - bUrgency;
      }
      
      // If same urgency, sort by time
      return a.time.localeCompare(b.time);
    } else if (filter === 'upcoming') {
      // For upcoming appointments, sort by date then time
      if (aDate.getTime() !== bDate.getTime()) {
        return aDate.getTime() - bDate.getTime();
      }
      return a.time.localeCompare(b.time);
    } else {
      // For past appointments, show most recent first
      if (aDate.getTime() !== bDate.getTime()) {
        return bDate.getTime() - aDate.getTime();
      }
      return b.time.localeCompare(a.time);
    }
  });
};

const fetchAppointments = async (clinicId: string, searchTerm: string) => {


  // Using the RPC to get appointments with patient and doctor names
  const { data, error } = await supabase
    .rpc('get_appointments_with_details_by_clinic', { clinic_id: clinicId });

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

  
  
  const todayAppointments = filteredData.filter(app => isToday(parseISO(app.date)));
  const upcomingAppointments = filteredData.filter(app => isFuture(parseISO(app.date)));
  const pastAppointments = filteredData.filter(app => isPast(parseISO(app.date)) && !isToday(parseISO(app.date)));

  return {
    all: filteredData,
    today: sortAppointments(todayAppointments, 'today'),
    upcoming: sortAppointments(upcomingAppointments, 'upcoming'),
    past: sortAppointments(pastAppointments, 'past'),
    totalCount: filteredData.length
  };
};

const Appointments = () => {
  const { user, activeClinic, activeClinicRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<AppointmentFilter>('today');
  const [currentPage, setCurrentPage] = useState<Record<AppointmentFilter, number>>({
    today: 1,
    upcoming: 1,
    past: 1
  });
  const itemsPerPage = 10;
  // State for the AppointmentModal - assuming it will be used
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['appointments', activeClinic?.clinics?.id, searchTerm],
    queryFn: () => fetchAppointments(activeClinic!.clinics?.id, searchTerm),
    enabled: !!activeClinic && !authLoading, // Only fetch if clinic is selected and auth is not loading
    retry: 1,
  });

  const appointments = data || { all: [], today: [], upcoming: [], past: [], totalCount: 0 };

  // Filter appointments for doctors if necessary
  const getFilteredAppointments = (appointmentList: AppointmentWithDetails[]) => {
    return activeClinicRole === 'doctor'
      ? appointmentList.filter(app => app.doctor_id === user?.id)
      : appointmentList;
  };

  const filteredAppointments = {
    today: getFilteredAppointments(appointments.today),
    upcoming: getFilteredAppointments(appointments.upcoming),
    past: getFilteredAppointments(appointments.past),
    all: getFilteredAppointments(appointments.all)
  };

  // Pagination logic
  const getPaginatedAppointments = (appointmentList: AppointmentWithDetails[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    return appointmentList.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (appointmentList: AppointmentWithDetails[]) => {
    return Math.ceil(appointmentList.length / itemsPerPage);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as AppointmentFilter);
  };

  const handlePageChange = (tab: AppointmentFilter, page: number) => {
    setCurrentPage(prev => ({ ...prev, [tab]: page }));
  };

  // console.log("Appointments: authLoading=", authLoading, "activeClinic=", !!activeClinic, "appointments count=", filteredAppointments.all.length);

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
      queryClient.invalidateQueries({ queryKey: ['appointments', activeClinic.clinics?.id] });
    }
  };

  // Handle canceling an appointment
  const handleCancelAppointment = async (appointmentId: string) => {
    if (!activeClinic?.clinics?.id) {
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
        .update({ status: "Cancelled" as Enums<'appointment_status'> })
        .eq('id', appointmentId)
        .eq('clinic_id', activeClinic.clinics.id); // Ensure multi-tenancy

      if (error) {
        throw error;
      }

      toast.success("Appointment canceled successfully.");
      queryClient.invalidateQueries({ queryKey: ['appointments', activeClinic.clinics.id] });
    } catch (e) {
      console.error("Error canceling appointment:", e);
      toast.error(`Failed to cancel appointment: ${e instanceof Error ? e.message : 'An unknown error occurred'}`);
    } finally {
      setLoading(false); // Assuming you have a loading state
    }
  };

  // State for ConsultationModal
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [selectedAppointmentForConsultation, setSelectedAppointmentForConsultation] = useState<AppointmentWithDetails | null>(null);
  
  // State for Consultation View Modal
  const [isConsultationViewModalOpen, setIsConsultationViewModalOpen] = useState(false);
  const [selectedAppointmentForView, setSelectedAppointmentForView] = useState<AppointmentWithDetails | null>(null);

  // State for Billing Modal
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [selectedAppointmentForBilling, setSelectedAppointmentForBilling] = useState<AppointmentWithDetails | null>(null);

  // Handle opening ConsultationModal (now redirects to page)
  const handleStartConsultation = async (appointment: AppointmentWithDetails) => {

    
    // Update appointment status to "In Progress" if it's currently "Scheduled"
    if (appointment.status === 'Scheduled') {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('appointments')
          .update({ status: 'In Progress' })
          .eq('id', appointment.id);
        
        if (error) {
          console.error('Error updating appointment status:', error);
          toast.error('Failed to update appointment status');
        } else {
          // Refresh appointments data
          queryClient.invalidateQueries({ queryKey: ['appointments', activeClinic?.clinics?.id] });
          toast.success('Consultation started');
        }
      } catch (error) {
        console.error('Error updating appointment status:', error);
        toast.error('Failed to start consultation');
      } finally {
        setLoading(false);
      }
    }
    
    navigate(`/consultation/${appointment.id}`);
  };

  // Handle viewing consultation
  const handleViewConsultation = (appointment: AppointmentWithDetails) => {
    setSelectedAppointmentForView(appointment);
    setIsConsultationViewModalOpen(true);
  };

  // Handle creating bill
  const handleCreateBill = (appointment: AppointmentWithDetails) => {
    setSelectedAppointmentForBilling(appointment);
    setIsBillingModalOpen(true);
  };

  // Handle billing modal close
  const handleBillingModalClose = (open: boolean) => {
    setIsBillingModalOpen(open);
    if (!open && activeClinic) {
      queryClient.invalidateQueries({ queryKey: ['bills', activeClinic.clinics?.id] });
      setSelectedAppointmentForBilling(null);
    }
  };





  // Handle closing ConsultationModal and refreshing data (if needed)
  const handleConsultationModalClose = (open: boolean) => {
    setIsConsultationModalOpen(open);
    if (!open && activeClinic) {
      // Optionally invalidate appointments query if consultation saves change appointment status
      queryClient.invalidateQueries({ queryKey: ['appointments', activeClinic.clinics?.id] });
       // Consider also invalidating dashboard data if it shows appointment status
        queryClient.invalidateQueries({ queryKey: ['dashboard-data', activeClinic.clinics?.id] });
    }
  };

  // Handle closing Consultation View Modal
  const handleConsultationViewModalClose = (open: boolean) => {
    setIsConsultationViewModalOpen(open);
    if (!open) {
      setSelectedAppointmentForView(null);
    }
  };

  // Set initial tab from URL parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['today', 'upcoming', 'past'].includes(tabParam)) {
      setActiveTab(tabParam as AppointmentFilter);
    }
  }, [searchParams]);

  // Render appointment table for a specific filter
  const renderAppointmentTable = (appointmentList: AppointmentWithDetails[], filter: AppointmentFilter) => {
    const currentPageForFilter = currentPage[filter];
    const paginatedAppointments = getPaginatedAppointments(appointmentList, currentPageForFilter);
    const totalPages = getTotalPages(appointmentList);

    return (
      <>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold text-foreground">Date</TableHead>
              <TableHead className="font-semibold text-foreground">Time</TableHead>
              <TableHead className="font-semibold text-foreground">Patient</TableHead>
              <TableHead className="font-semibold text-foreground">Doctor</TableHead>
              <TableHead className="hidden sm:table-cell font-semibold text-foreground">Type</TableHead>
              <TableHead className="hidden sm:table-cell font-semibold text-foreground">Status</TableHead>
              <TableHead className="hidden md:table-cell font-semibold text-foreground">Billing</TableHead>
              {/* Add a new header for Consultation action if user is a doctor */}
              {(activeClinicRole === 'doctor' || activeClinicRole === 'superadmin') && <TableHead className="font-semibold text-foreground">Consultation</TableHead>}
              <TableHead className="font-semibold text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={(activeClinicRole === 'doctor' || activeClinicRole === 'superadmin') ? 9 : 8} className="text-center py-12">
                  <div className="flex flex-col items-center space-y-2">
                    {filter === 'today' ? <AlertCircle className="w-12 h-12 text-warning" /> :
                     filter === 'upcoming' ? <Calendar className="w-12 h-12 text-primary" /> :
                     <CheckCircle2 className="w-12 h-12 text-muted-foreground" />}
                    <h3 className="text-lg font-semibold text-foreground">
                      {filter === 'today' ? 'No appointments today' :
                       filter === 'upcoming' ? 'No upcoming appointments' :
                       'No past appointments'}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? `No appointments match "${searchTerm}"` : 
                       filter === 'today' ? "No appointments scheduled for today" :
                       filter === 'upcoming' ? "No future appointments scheduled" :
                       "No past appointments found"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedAppointments.map((appointment) => {
      
                return (
                <TableRow
                  key={appointment.id}
                  className="hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <TableCell onClick={() => handleAppointmentClick(appointment)} className="cursor-pointer">{format(parseISO(appointment.date), 'PPP')}</TableCell>
                  <TableCell onClick={() => handleAppointmentClick(appointment)} className="cursor-pointer">{formatTimeIST(appointment.time)}</TableCell>
                  <TableCell onClick={() => handleAppointmentClick(appointment)} className="cursor-pointer font-medium">{appointment.patient_name}</TableCell>
                  <TableCell onClick={() => handleAppointmentClick(appointment)} className="cursor-pointer">{appointment.doctor_name}</TableCell>
                  <TableCell onClick={() => handleAppointmentClick(appointment)} className="cursor-pointer hidden sm:table-cell">{appointment.type}</TableCell>
                  <TableCell onClick={() => handleAppointmentClick(appointment)} className="cursor-pointer hidden sm:table-cell">
                    <Badge variant={
                      appointment.status === 'Completed' ? "default" :
                      appointment.status === 'In Progress' ? "secondary" :
                      appointment.status === 'Scheduled' ? "outline" :
                      "destructive"
                    } className={
                      appointment.status === 'Completed' ? "status-badge status-active" :
                      appointment.status === 'In Progress' ? "status-badge status-in-progress" :
                      appointment.status === 'Scheduled' ? "status-badge status-pending" :
                      "status-badge status-inactive"
                    }>
                      {appointment.status}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={() => handleAppointmentClick(appointment)} className="cursor-pointer hidden md:table-cell">
                    <Badge variant={
                      appointment.billing_status === 'Paid' ? "default" :
                      appointment.billing_status === 'Partially Paid' ? "secondary" :
                      appointment.billing_status === 'Overdue' ? "destructive" :
                      "outline"
                    } className={
                      appointment.billing_status === 'Paid' ? "status-badge status-active" :
                      appointment.billing_status === 'Partially Paid' ? "status-badge status-warning" :
                      appointment.billing_status === 'Overdue' ? "status-badge status-inactive" :
                      "status-badge status-pending"
                    }>
                      {appointment.billing_status || 'Pending'}
                    </Badge>
                  </TableCell>

                  {/* Add a cell for the Start Consultation button if user is a doctor/superadmin and appointment is not completed/cancelled */}
                  {(activeClinicRole === 'doctor' || activeClinicRole === 'superadmin') && appointment.status !== 'Completed' && appointment.status !== 'Cancelled' && (
                     <TableCell>
                       <Button 
                         size="sm" 
                         onClick={() => handleStartConsultation(appointment)}
                         className="bg-primary text-primary-foreground hover:bg-primary/90"
                       >
                         {appointment.status === "Scheduled" ? "Start" : "Continue"}
                       </Button>
                     </TableCell>
                  )}

                  {/* Add View Consultation button for completed appointments */}
                  {(activeClinicRole === 'doctor' || activeClinicRole === 'superadmin') && appointment.status === 'Completed' && (
                     <TableCell>
                       <Button 
                         size="sm" 
                         variant="outline" 
                         onClick={() => handleViewConsultation(appointment)}
                         className="border-primary text-primary hover:bg-primary/10"
                       >
                         View Notes
                       </Button>
                     </TableCell>
                  )}

                   {/* Add an empty cell if neither button is shown to maintain table structure */}
                   {(activeClinicRole === 'doctor' || activeClinicRole === 'superadmin') && appointment.status === 'Cancelled' && (
                       <TableCell></TableCell>
                   )}

                <TableCell className="text-right flex gap-2 ">
                    
                    {/* Create Bill button (staff/superadmin, not cancelled) */}
                    {(activeClinicRole === 'staff' || activeClinicRole === 'superadmin') && appointment.status !== 'Cancelled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={e => { e.stopPropagation(); handleCreateBill(appointment); }}
                        className="border-primary text-primary hover:bg-primary/10"
                      >
                        Create Bill
                      </Button>
                    )}
                    {/* Keep dropdown for other actions */}
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
                          View/Edit Appointment
                        </DropdownMenuItem>
                        {/* Option to cancel appointment - visible for staff/superadmin, or potentially doctors depending on policy */}
                        {(activeClinicRole === 'staff' || activeClinicRole === 'superadmin') && appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
                          <DropdownMenuItem onClick={() => handleCancelAppointment(appointment.id)} disabled={loading}>
                            Cancel Appointment
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination for this specific tab */}
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(filter, Math.max(currentPageForFilter - 1, 1))}
                    className={currentPageForFilter === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  const pageNum = currentPageForFilter <= 3 ? i + 1 : currentPageForFilter - 2 + i;
                  if (pageNum <= totalPages && pageNum > 0) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => handlePageChange(filter, pageNum)}
                          isActive={currentPageForFilter === pageNum}
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
                    onClick={() => handlePageChange(filter, Math.min(currentPageForFilter + 1, totalPages))}
                    className={currentPageForFilter === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </>
    );
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!activeClinic) {
    return (
      <Card className="m-6">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Please select a clinic to view appointments.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error("Appointments: Error fetching data", error);
    toast.error("Failed to load appointments");
    return (
      <Card className="m-6">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <Activity className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-destructive">Error loading appointments.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 ">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
              <Calendar className="w-5 h-5 " />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Appointments</h1>
              <p className="text-muted-foreground">View and manage clinic appointments</p>
            </div>
          </div>
          
        </div>
        {/* Show New Appointment button for Doctors, Superadmins and Staff */}
        {(activeClinicRole === 'staff' || activeClinicRole === 'superadmin' || activeClinicRole === 'doctor') && (
          <Button
            onClick={handleNewAppointment}
            className="bg-primary text-primary-foreground hover:bg-primary/90 "
          >
            <Plus size={18} className="mr-2" />
            New Appointment
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Appointments</p>
                <p className="text-2xl font-bold text-primary">{filteredAppointments.all.length}</p>
                
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Appointments</p>
                <p className="text-2xl font-bold text-warning">
                  {filteredAppointments.today.length}
                </p>
                
              </div>
              <div className="bg-warning/10 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold text-info">
                  {filteredAppointments.upcoming.length}
                </p>
              </div>
              <div className="bg-info/10 p-3 rounded-lg">
                <Timer className="w-6 h-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Past</p>
                <p className="text-2xl font-bold text-success">
                  {filteredAppointments.past.length}
                </p>
                
              </div>
              <div className="bg-success/10 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Search Section */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by patient or doctor name, or date..."
            className="pl-10 border-border focus:ring-primary"
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
        
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="today" className="flex items-center gap-2">
                    <AlertCircle size={16} />
                    Today ({filteredAppointments.today.length})
                  </TabsTrigger>
                  <TabsTrigger value="upcoming" className="flex items-center gap-2">
                    <Timer size={16} />
                    Upcoming ({filteredAppointments.upcoming.length})
                  </TabsTrigger>
                  <TabsTrigger value="past" className="flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    Past ({filteredAppointments.past.length})
                  </TabsTrigger>
                </TabsList>
              
              <TabsContent value="today" className="mt-0">
                {renderAppointmentTable(filteredAppointments.today, 'today')}
              </TabsContent>
              
              <TabsContent value="upcoming" className="mt-0">
                {renderAppointmentTable(filteredAppointments.upcoming, 'upcoming')}
              </TabsContent>
              
              <TabsContent value="past" className="mt-0">
                {renderAppointmentTable(filteredAppointments.past, 'past')}
              </TabsContent>
            </Tabs>
        
      )}

      {/* Appointment Modal component */}
      <AppointmentModal
        open={isAppointmentModalOpen}
        onOpenChange={handleModalClose}
        appointment={selectedAppointment ? { 
          ...selectedAppointment, 
          clinic_id: activeClinic?.clinics?.id || ''
        } : null}
      />

      {/* Consultation Modal component */}
      <ConsultationModal
        open={isConsultationModalOpen}
        onOpenChange={handleConsultationModalClose}
        appointment={selectedAppointmentForConsultation ? { 
          ...selectedAppointmentForConsultation, 
          clinic_id: activeClinic?.clinic_id || ''
        } : null}
      />

      {/* Consultation View Modal component */}
      <ConsultationViewModal
        open={isConsultationViewModalOpen}
        onOpenChange={handleConsultationViewModalClose}
        appointment={selectedAppointmentForView ? {
          ...selectedAppointmentForView,
          clinic_id: activeClinic?.clinic_id || ''
        } : null}
      />

      {/* illing Modal component */}
      <BillingModal
        open={isBillingModalOpen}
        onOpenChange={handleBillingModalClose}
        bill={null}
        appointment={selectedAppointmentForBilling ? {
          ...selectedAppointmentForBilling,
          // clinic_id: activeClinic?.clinic_id || ''    // TODO: Check whether to add clinic_id to the appointment object
        } : null}
      />

      
    </div>
  );
};

export default Appointments;
