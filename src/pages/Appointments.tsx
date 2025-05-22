
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

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [type, setType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openConsultationModal, setOpenConsultationModal] = useState(false);
  const [selectedAppointmentForConsultation, setSelectedAppointmentForConsultation] = useState<any>(null);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, type, searchTerm]);

  const fetchAppointments = async () => {
    setLoading(true);
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

      if (type) {
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

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">View and manage appointments</p>
        </div>
        <Button onClick={handleCreateAppointment}>Add Appointment</Button>
      </div>

      <AppointmentFilters
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        type={type}
        setType={setType}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? `Appointments for ${format(selectedDate, "PPP")}` : "All Appointments"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentList
            appointments={appointments}
            loading={loading}
            selectedDate={selectedDate}
            onEdit={handleUpdateAppointment}
            onStartConsultation={handleStartConsultation}
          />
        </CardContent>
      </Card>
      
      <AppointmentModal
        open={openModal}
        onOpenChange={setOpenModal}
        appointment={selectedAppointment}
      />
      
      <ConsultationModal
        open={openConsultationModal}
        onOpenChange={setOpenConsultationModal}
        appointment={selectedAppointmentForConsultation}
      />
    </div>
  );
};

export default Appointments;
