
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, Clock, User } from "lucide-react";
import { AppointmentModal } from "@/components/AppointmentModal";
import { AppointmentFilters } from "@/components/appointments/AppointmentFilters";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: 'Walk-in' | 'Digital';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  department: 'Neurology' | 'Ophthalmology';
  patients?: { name: string };
  doctors?: { name: string };
}

const Appointments = () => {
  const { userRole, user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, [userRole, user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          type,
          status,
          department,
          patients (name),
          doctors (name)
        `)
        .order('date', { ascending: false })
        .order('time', { ascending: true });

      // If user is a doctor, filter by their appointments only
      if (userRole === 'doctor' && user) {
        query = query.eq('doctor_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filterType && appointment.type !== filterType) return false;
    if (filterStatus && appointment.status !== filterStatus) return false;
    return true;
  });

  const handleTypeChange = (type: string) => {
    setFilterType(type);
  };

  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
  };

  const handleClearFilters = () => {
    setFilterType("");
    setFilterStatus("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'Digital' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage and view all appointment schedules.
          </p>
        </div>
        {userRole === 'admin' && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentFilters
            onTypeChange={handleTypeChange}
            onStatusChange={handleStatusChange}
            onClearFilters={handleClearFilters}
            filterType={filterType}
            filterStatus={filterStatus}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6 h-24"></CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No appointments found</h3>
              <p className="text-muted-foreground">
                {appointments.length === 0 
                  ? "No appointments have been scheduled yet."
                  : "No appointments match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {appointment.patients?.name || 'Unknown Patient'}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <User className="h-4 w-4 mr-1" />
                        <span>Dr. {appointment.doctors?.name || 'Unknown Doctor'}</span>
                        <span className="mx-2">•</span>
                        <span>{appointment.department}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center text-sm font-medium">
                        <Clock className="h-4 w-4 mr-1" />
                        {appointment.time}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(appointment.date).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                      <Badge variant="outline" className={getTypeColor(appointment.type)}>
                        {appointment.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AppointmentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        appointment={null}
        onSuccess={fetchAppointments}
      />
    </div>
  );
};

export default Appointments;
