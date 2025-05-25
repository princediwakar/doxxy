import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, Clock, User } from "lucide-react";
import { AppointmentModal } from "@/components/AppointmentModal";
import { MedicalRecordModal } from "@/components/MedicalRecordModal";
import { AppointmentFilters } from "@/components/appointments/AppointmentFilters";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { AppointmentType } from "@/components/AppointmentModal";
import { BillingModal } from "@/components/BillingModal";

// Define interface for the exact structure returned by the get_appointments_with_details RPC
interface RpcAppointmentResult {
  id: string;
  date: string; // Assuming date is string from RPC
  appointment_time: string; // Name from RPC
  type: string; // Type from RPC is string
  status: string; // Status from RPC is string
  department: string; // Department from RPC is string
  patient_id: string;
  doctor_id: string;
  notes?: string | null; // Assuming notes can be null
  created_at?: string; // Assuming created_at is string
  patient_name: string; // Flattened patient name from RPC
  doctor_name: string; // Flattened doctor name from RPC
  doctor_specialization?: string; // Assuming specialization is also returned
}

const Appointments = () => {
  const { userRole, user } = useAuth();
  // State should hold AppointmentType[]
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMedicalRecordModalOpen, setIsMedicalRecordModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  // selectedAppointment should also be AppointmentType
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentType | null>(null);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);

      // Explicitly type the data from RPC
      const { data, error } = await supabase
        .rpc('get_appointments_with_details', {}, { count: 'exact' }) as { data: RpcAppointmentResult[] | null, error: unknown }; // Type the data, changed any to unknown

      if (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Failed to load appointments');
        setAppointments([]);
        return;
      }

      // Map the RpcAppointmentResult[] to AppointmentType[]
      const formattedAppointments: AppointmentType[] = (data || []).map(rpcApt => ({
        id: rpcApt.id,
        patient_id: rpcApt.patient_id,
        doctor_id: rpcApt.doctor_id,
        date: rpcApt.date,
        time: rpcApt.appointment_time, // Map RPC's appointment_time to time
        type: rpcApt.type as 'Walk-in' | 'Digital', // Cast string to union type
        status: rpcApt.status as 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled', // Cast string to union type
        department: rpcApt.department as 'Neurology' | 'Ophthalmology', // Cast string to union type
        notes: rpcApt.notes || undefined, // Map notes, handle null
        created_at: rpcApt.created_at || undefined, // Map created_at, handle null
        // Create nested patient object from flattened name
        patients: rpcApt.patient_name ? [{ name: rpcApt.patient_name }] : null, // Supabase often returns relationships as arrays even for one-to-one
        // Create nested doctor object from flattened name and specialization
        doctors: rpcApt.doctor_name ? [{ name: rpcApt.doctor_name, specialization: rpcApt.doctor_specialization || '' }] : null, // Assuming doctors relationship is also array
      }));

      // If user is a doctor, filter by their appointments only after mapping
      let appointmentsToSet = formattedAppointments;
      if (userRole === 'doctor' && user) {
        appointmentsToSet = appointmentsToSet.filter(appointment => appointment.doctor_id === user.id);
      }

      setAppointments(appointmentsToSet);
    } catch (error: unknown) { // Use unknown for catch clause variable
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [userRole, user, setAppointments, toast]); // Add dependencies for useCallback

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]); // Include the memoized function in useEffect dependencies

  const filteredAppointments = appointments.filter(appointment => {
    // Filtering logic should now work correctly with AppointmentType
    // Apply type filter if filterType is not 'all' and not empty
    if (filterType && filterType !== 'all' && appointment.type !== filterType) {
      return false;
    }
    // Apply status filter if filterStatus is not 'all' and not empty
    if (filterStatus && filterStatus !== 'all' && appointment.status !== filterStatus) {
      return false;
    }
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

  const handleEditAppointment = (appointment: AppointmentType) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleStartConsultation = (appointment: AppointmentType) => {
    setSelectedAppointment(appointment);
    setIsMedicalRecordModalOpen(true);
  };

  const handleRaiseBill = (appointment: AppointmentType) => {
    console.log("Raise Bill clicked for appointment:", appointment);
    setSelectedAppointment(appointment);
    setIsBillingModalOpen(true);
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
          <Button onClick={() => {
            setSelectedAppointment(null);
            setIsModalOpen(true);
          }}>
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
                        {appointment.patients?.[0]?.name || 'Unknown Patient'}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <User className="h-4 w-4 mr-1" />
                        <span>{appointment.doctors?.[0]?.name || 'Unknown Doctor'}</span>
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
                        {appointment.date ? new Date(appointment.date).toLocaleDateString() : 'N/A'}
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

                    <div className="flex flex-col space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditAppointment(appointment)}
                      >
                        Edit
                      </Button>
                      {appointment.status === 'Scheduled' || appointment.status === 'In Progress' ? (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleStartConsultation(appointment)}
                        >
                          Start Consultation
                        </Button>
                      ) : null}
                      
                      {appointment.status === 'In Progress' || appointment.status === 'Completed' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRaiseBill(appointment)}
                        >
                          Raise Bill
                        </Button>
                      ) : null}
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
        appointment={selectedAppointment}
      />

      <MedicalRecordModal
        open={isMedicalRecordModalOpen}
        onOpenChange={setIsMedicalRecordModalOpen}
        appointment={selectedAppointment}
      />

      <BillingModal
        open={isBillingModalOpen}
        onOpenChange={setIsBillingModalOpen}
        bill={null}
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default Appointments;
