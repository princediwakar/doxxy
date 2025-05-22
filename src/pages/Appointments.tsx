
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AppointmentModal } from "@/components/AppointmentModal";
import { ConsultationModal } from "@/components/ConsultationModal";
import { AppointmentFilters } from "@/components/appointments/AppointmentFilters";
import { AppointmentList } from "@/components/appointments/AppointmentList";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Calendar as CalendarIcon, ListFilter } from "lucide-react";

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [type, setType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openConsultationModal, setOpenConsultationModal] = useState(false);
  const [selectedAppointmentForConsultation, setSelectedAppointmentForConsultation] = useState<any>(null);
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');

  const fetchAppointments = async () => {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patients (name),
          doctors (name)
        `)
        .order('date', { ascending: false });

      if (selectedDate) {
        const isoDate = selectedDate.toISOString().split('T')[0];
        query = query.eq('date', isoDate);
      }

      if (type && type !== "all") {
        query = query.eq('type', type);
      }

      if (searchTerm) {
        query = query.ilike('notes', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Format the appointments for easy use
      const formattedAppointments = data.map(app => ({
        id: app.id,
        patient_id: app.patient_id,
        doctor_id: app.doctor_id,
        patient: app.patients.name,
        doctor: app.doctors.name,
        date: app.date,
        time: app.time,
        type: app.type,
        status: app.status,
        notes: app.notes
      }));

      return formattedAppointments;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
      throw error;
    }
  };

  const { data: appointments = [], isLoading, error, refetch } = useQuery({
    queryKey: ['appointments', selectedDate, type, searchTerm],
    queryFn: fetchAppointments
  });

  useEffect(() => {
    if (error) {
      toast.error("Error loading appointments. Please try again.");
    }
  }, [error]);

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setOpenModal(true);
  };

  const handleUpdateAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenModal(true);
  };

  const handleStartConsultation = (appointment: any) => {
    setSelectedAppointmentForConsultation(appointment);
    setOpenConsultationModal(true);
  };

  const handleModalClose = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">View and manage patient appointments</p>
        </div>
        <Button onClick={handleCreateAppointment}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Appointment
        </Button>
      </div>

      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'list' | 'calendar')} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <TabsList className="mb-2 sm:mb-0">
            <TabsTrigger value="list">
              <ListFilter className="mr-2 h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar View
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1">
            <AppointmentFilters
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              type={type}
              setType={setType}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
        </div>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate
                  ? `Appointments for ${format(selectedDate, "PPP")}`
                  : type !== "all"
                  ? `${type} Appointments`
                  : "All Appointments"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentList
                appointments={appointments}
                loading={isLoading}
                selectedDate={selectedDate}
                onEdit={handleUpdateAppointment}
                onStartConsultation={handleStartConsultation}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[500px] flex items-center justify-center text-muted-foreground">
                Calendar view will be implemented in the next phase
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AppointmentModal
        open={openModal}
        onOpenChange={setOpenModal}
        appointment={selectedAppointment}
        onClose={handleModalClose}
      />
      
      <ConsultationModal
        open={openConsultationModal}
        onOpenChange={setOpenConsultationModal}
        appointment={selectedAppointmentForConsultation}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default Appointments;
