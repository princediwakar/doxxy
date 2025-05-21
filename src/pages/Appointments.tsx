import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AppointmentModal } from "@/components/AppointmentModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ConsultationModal } from "@/components/ConsultationModal";

const Appointments = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
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

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "default";
      case "In Progress":
        return "secondary";
      case "Completed":
        return "success";
      case "Cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  const handleStartConsultation = (appointment: any) => {
    setSelectedAppointmentForConsultation(appointment);
    setOpenConsultationModal(true);
  };

  const renderAppointments = (appointments: any[]) => {
    return appointments.length === 0 ? (
      <div className="text-center py-10">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No appointments found</h3>
        <p className="text-muted-foreground">
          {selectedDate 
            ? "There are no appointments scheduled for this date." 
            : "Use the filters above to find appointments."}
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="space-y-1 mb-3 sm:mb-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{appointment.patient}</h3>
                      <Badge variant={getBadgeVariant(appointment.status)}>{appointment.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(appointment.date), 'MMM dd, yyyy')} • {appointment.time} • {appointment.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {appointment.status === "Scheduled" && (
                      <Button 
                        variant="default"
                        size="sm"
                        onClick={() => handleStartConsultation(appointment)}
                      >
                        Start Consultation
                      </Button>
                    )}
                    {appointment.status === "In Progress" && (
                      <Button 
                        variant="default"
                        size="sm"
                        onClick={() => handleStartConsultation(appointment)}
                      >
                        Continue Consultation
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setOpenModal(true);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 bg-muted/20 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">Doctor:</span> {appointment.doctor}
                  </div>
                  <div className="text-sm text-right">
                    {appointment.notes && (
                      <span className="font-medium">Notes: </span>
                    )}
                    {appointment.notes}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
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

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search appointments..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => {
                setDate(date);
                setSelectedDate(date);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="Check-up">Check-up</SelectItem>
            <SelectItem value="Consultation">Consultation</SelectItem>
            <SelectItem value="Follow-up">Follow-up</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? `Appointments for ${format(selectedDate, "PPP")}` : "All Appointments"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">Loading appointments...</div>
          ) : (
            renderAppointments(appointments)
          )}
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
