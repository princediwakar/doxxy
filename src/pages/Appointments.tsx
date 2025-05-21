
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar, ChevronDown, FileEdit, Plus, Trash2, Search, MoveRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppointmentModal } from "@/components/AppointmentModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Appointments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [openModal, setOpenModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctors:doctor_id (name, specialization),
          patients:patient_id (name)
        `)
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, name, specialization');
      
      if (error) {
        throw error;
      }
      
      setDoctors(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name');
      
      if (error) {
        throw error;
      }
      
      setPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const getDateGroupLabel = (dateString) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return "Today";
      if (isTomorrow(date)) return "Tomorrow";
      return format(date, "MMMM d, yyyy");
    } catch (error) {
      console.error("Date parsing error:", error);
      return dateString;
    }
  };

  const handleAppointmentClick = (appointment) => {
    const formattedAppointment = {
      ...appointment,
      patient: appointment.patients.name,
      doctor: appointment.doctors.name,
      doctorSpecialty: appointment.doctors.specialization
    };
    
    setSelectedAppointment(formattedAppointment);
    setOpenModal(true);
  };

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setOpenModal(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Scheduled": return "default";
      case "In Progress": return "outline";
      case "Completed": return "secondary";
      case "Cancelled": return "destructive";
      default: return "default";
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      fetchAppointments(); // Refresh the list
      
      toast.success(`Appointment status updated to ${status}`);
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Failed to update appointment status");
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        const { error } = await supabase
          .from('appointments')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        fetchAppointments(); // Refresh the list
        
        toast.success("Appointment deleted successfully");
      } catch (error) {
        console.error("Error deleting appointment:", error);
        toast.error("Failed to delete appointment");
      }
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patients.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctors.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.type.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Group appointments by date for card view
  const groupedAppointments = filteredAppointments.reduce((acc, appointment) => {
    const dateGroup = getDateGroupLabel(appointment.date);
    if (!acc[dateGroup]) {
      acc[dateGroup] = [];
    }
    acc[dateGroup].push(appointment);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage patient appointments and schedules</p>
        </div>
        <Button onClick={handleNewAppointment}>
          <Plus size={18} className="mr-2" />
          New Appointment
        </Button>
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border rounded-md h-10">
          <Button 
            variant={viewMode === "list" ? "default" : "ghost"} 
            className="rounded-r-none"
            onClick={() => setViewMode("list")}
          >
            List
          </Button>
          <Button 
            variant={viewMode === "card" ? "default" : "ghost"} 
            className="rounded-l-none"
            onClick={() => setViewMode("card")}
          >
            Cards
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-muted-foreground">Loading appointments...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <Calendar size={48} className="text-muted-foreground" />
          <div className="text-center">
            <h3 className="text-lg font-medium">No appointments found</h3>
            <p className="text-muted-foreground">Try changing your filters or create a new appointment</p>
          </div>
          <Button onClick={handleNewAppointment}>
            <Plus size={18} className="mr-2" />
            Schedule New
          </Button>
        </div>
      ) : viewMode === "list" ? (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow 
                  key={appointment.id}
                  className="cursor-pointer"
                  onClick={() => handleAppointmentClick(appointment)}
                >
                  <TableCell className="font-medium">{appointment.patients.name}</TableCell>
                  <TableCell>
                    {format(new Date(appointment.date), "MMM d, yyyy")}
                    <br />
                    <span className="text-muted-foreground text-sm">{appointment.time}</span>
                  </TableCell>
                  <TableCell>
                    {appointment.doctors.name}
                    <br />
                    <span className="text-muted-foreground text-sm">{appointment.doctors.specialization}</span>
                  </TableCell>
                  <TableCell>{appointment.type}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAppointmentClick(appointment);
                      }}
                    >
                      <FileEdit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAppointment(appointment.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedAppointments).map(([dateGroup, appointments]) => (
            <div key={dateGroup}>
              <div className="flex items-center mb-4">
                <h2 className="text-lg font-semibold">{dateGroup}</h2>
                <div className="ml-2 h-px bg-border flex-1"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {appointments.map((appointment) => (
                  <Card key={appointment.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleAppointmentClick(appointment)}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{appointment.patients.name}</CardTitle>
                        <Badge variant={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Time:</span>
                          <span className="font-medium">{appointment.time}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Type:</span>
                          <span>{appointment.type}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Doctor:</span>
                          <span>{appointment.doctors.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Department:</span>
                          <span>{appointment.doctors.specialization}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-between">
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAppointmentClick(appointment);
                          }}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAppointment(appointment.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Select 
                        defaultValue={appointment.status}
                        onValueChange={(value) => updateAppointmentStatus(appointment.id, value)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Scheduled">Scheduled</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <AppointmentModal
        open={openModal}
        onOpenChange={setOpenModal}
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default Appointments;
