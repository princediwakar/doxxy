
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AppointmentList } from "@/components/appointments/AppointmentList";
import { AppointmentFilters } from "@/components/appointments/AppointmentFilters";
import { AppointmentModal } from "@/components/AppointmentModal";
import { ConsultationModal } from "@/components/ConsultationModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Mock data for appointments (will be replaced with Supabase data)
const mockAppointmentsData = [
  { id: "1", patient: "Sarah Johnson", doctor: "Dr. Michael Chen (Neurology)", date: "2023-05-15", time: "10:00 AM", type: "Check-up", status: "Scheduled" },
  { id: "2", patient: "Robert Williams", doctor: "Dr. Emily Parker (Ophthalmology)", date: "2023-05-15", time: "11:30 AM", type: "Follow-up", status: "In Progress" },
  { id: "3", patient: "Emma Davis", doctor: "Dr. Michael Chen (Neurology)", date: "2023-05-16", time: "9:00 AM", type: "Consultation", status: "Scheduled" },
  { id: "4", patient: "Thomas Brown", doctor: "Dr. James Wilson (Neurology)", date: "2023-05-16", time: "2:00 PM", type: "Emergency", status: "Completed" },
  { id: "5", patient: "Lisa Wilson", doctor: "Dr. Sarah Adams (Ophthalmology)", date: "2023-05-17", time: "10:30 AM", type: "Check-up", status: "Scheduled" },
];

const fetchAppointments = async () => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        date,
        time,
        type,
        status,
        notes,
        patients (id, name),
        doctors (id, name, specialization)
      `)
      .order('date', { ascending: false });

    if (error) throw error;

    // Transform data to match expected format
    return (data || []).map(appointment => ({
      id: appointment.id,
      patient_id: appointment.patients?.id,
      patient: appointment.patients?.name || 'Unknown Patient',
      doctor_id: appointment.doctors?.id,
      doctor: appointment.doctors ? `Dr. ${appointment.doctors.name} (${appointment.doctors.specialization})` : 'Unknown Doctor',
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      status: appointment.status,
      notes: appointment.notes
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

const Appointments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openConsultationModal, setOpenConsultationModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState("list");

  // Query for appointments
  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ['appointments'],
    queryFn: fetchAppointments,
    staleTime: 60000, // 1 minute
  });

  // Filter appointments based on selected criteria
  const filteredAppointments = appointments.filter(appointment => {
    let includeAppointment = true;

    // Filter by selected date
    if (selectedDate) {
      const appointmentDate = typeof appointment.date === 'string' 
        ? new Date(appointment.date) 
        : appointment.date;
      
      const appDate = new Date(appointmentDate);
      const selDate = new Date(selectedDate);
      
      if (appDate.getDate() !== selDate.getDate() || 
          appDate.getMonth() !== selDate.getMonth() || 
          appDate.getFullYear() !== selDate.getFullYear()) {
        includeAppointment = false;
      }
    }

    // Filter by appointment type
    if (filterType && filterType !== 'all' && appointment.type !== filterType) {
      includeAppointment = false;
    }

    // Filter by appointment status
    if (filterStatus && filterStatus !== 'all' && appointment.status !== filterStatus) {
      includeAppointment = false;
    }

    return includeAppointment;
  });

  // Handle calendar date selection
  const handleDateSelect = (date: Date | undefined) => {
    setDate(date);
    if (date) {
      setSelectedDate(date);
    }
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setSelectedDate(null);
    setFilterType(null);
    setFilterStatus(null);
    setDate(new Date()); // Reset calendar to current date
  };

  // Function to handle filter changes
  const handleFilterChange = (type: string | null, status: string | null) => {
    setFilterType(type);
    setFilterStatus(status);
  };

  // Handle appointment edit
  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setOpenModal(true);
  };

  // Handle starting consultation
  const handleStartConsultation = (appointment: any) => {
    setSelectedAppointment(appointment);
    setOpenConsultationModal(true);
  };

  // Handle modal close with refresh if needed
  const handleModalClose = () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Schedule and manage patient appointments</p>
        </div>
        <Button onClick={() => {
          setSelectedAppointment(null);
          setOpenModal(true);
        }}>
          <Plus size={18} className="mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Tabs for list and calendar views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full sm:w-[400px]">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1">
              <AppointmentFilters 
                onFilterChange={handleFilterChange} 
                onClearFilters={handleClearFilters}
                filterType={filterType}
                filterStatus={filterStatus}
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full md:w-auto justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Filter by date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <AppointmentList 
            appointments={filteredAppointments} 
            loading={isLoading} 
            selectedDate={selectedDate}
            onEdit={handleEditAppointment}
            onStartConsultation={handleStartConsultation}
          />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <div className="border rounded-md p-4 min-h-[500px]">
            <div className="text-center text-muted-foreground py-20">
              Calendar view will be implemented soon.
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Appointment Modal */}
      <AppointmentModal
        open={openModal}
        onOpenChange={setOpenModal}
        appointment={selectedAppointment}
      />

      {/* Consultation Modal */}
      <ConsultationModal
        open={openConsultationModal}
        onOpenChange={setOpenConsultationModal}
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default Appointments;
