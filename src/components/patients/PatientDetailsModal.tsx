import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Phone, Mail, MapPin, User, Clock, Plus, CreditCard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { AppointmentModal } from '../appointments/AppointmentModal';
import { BillingModal } from '../billing/BillingModal';
import { getAge, renderGender } from "@/lib/utils";

type Patient = Database['public']['Tables']['patients']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];
type Bill = Database['public']['Tables']['bills']['Row'];

interface PatientDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
}

interface AppointmentWithDetails extends Appointment {
  doctor_name: string;
}

interface BillWithDetails extends Bill {
  appointment_date?: string;
}

const supabase = getSupabase();

const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  open,
  onOpenChange,
  patient,
}) => {
  const { activeClinic } = useAuth();
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  // Fetch patient appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['patientAppointments', patient?.id, activeClinic?.clinic_id],
    queryFn: async () => {
      if (!patient?.id || !activeClinic?.clinic_id) return [];
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctors!inner(name)
        `)
        .eq('patient_id', patient.id)
        .eq('clinic_id', activeClinic.clinic_id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(apt => ({
        ...apt,
        doctor_name: apt.doctors?.name || 'Unknown Doctor'
      })) as AppointmentWithDetails[];
    },
    enabled: open && !!patient?.id && !!activeClinic?.clinic_id,
  });

  // Fetch patient bills
  const { data: bills, isLoading: billsLoading } = useQuery({
    queryKey: ['patientBills', patient?.id, activeClinic?.clinic_id],
    queryFn: async () => {
      if (!patient?.id || !activeClinic?.clinic_id) return [];
      
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          appointments(date)
        `)
        .eq('patient_id', patient.id)
        .eq('clinic_id', activeClinic.clinic_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(bill => ({
        ...bill,
        appointment_date: bill.appointments?.date
      })) as BillWithDetails[];
    },
    enabled: open && !!patient?.id && !!activeClinic?.clinic_id,
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'outline';
      case 'In Progress': return 'default';
      case 'Completed': return 'default';
      case 'Cancelled': return 'destructive';
      default: return 'outline';
    }
  };



  if (!patient) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {patient.name}
              <span className="ml-2 flex items-center gap-2 text-base text-muted-foreground">
                
                {getAge(patient.date_of_birth) && (
                  <span className="ml-1">{getAge(patient.date_of_birth)}, {patient.gender}</span>
                )}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Patient Info */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.phone || 'No phone provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.date_of_birth ? format(parseISO(patient.date_of_birth), 'PPP') : 'No DOB provided'}</span>
                    {getAge(patient.date_of_birth) && (
                      <span className="ml-2">({getAge(patient.date_of_birth)} yrs)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.gender}</span>
                  </div>
                </div>
                {patient.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <span>{patient.address}</span>
                  </div>
                )}
                {patient.medical_id && (
                  <div>
                    <strong>Medical ID:</strong> {patient.medical_id}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabs for Appointments and Bills */}
            <Tabs defaultValue="appointments" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="appointments" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Appointments
                </TabsTrigger>
                {/*
                <TabsTrigger value="bills" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Bills
                </TabsTrigger>
                */}
              </TabsList>

              <TabsContent value="appointments" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Appointments</h3>
                  <Button onClick={() => setIsAppointmentModalOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>

                {appointmentsLoading ? (
                  <div className="text-center py-4">Loading appointments...</div>
                ) : appointments && appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.map((appointment) => (
                      <Card key={appointment.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {format(parseISO(appointment.date), 'PPP')}
                                </span>
                                {appointment.time && (
                                  <>
                                    <span>at</span>
                                    <span>{appointment.time}</span>
                                  </>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Doctor: {appointment.doctor_name}
                              </div>
                              {appointment.notes && (
                                <div className="text-sm">
                                  <strong>Notes:</strong> {appointment.notes}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusBadgeVariant(appointment.status)}>
                                {appointment.status}
                              </Badge>
                              <Badge variant="outline">
                                {appointment.type}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No appointments found for this patient.
                  </div>
                )}
              </TabsContent>

              {/*
              <TabsContent value="bills" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Bills</h3>
                  <Button onClick={() => setIsBillingModalOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Bill
                  </Button>
                </div>

                {billsLoading ? (
                  <div className="text-center py-4">Loading bills...</div>
                ) : bills && bills.length > 0 ? (
                  <div className="space-y-3">
                    {bills.map((bill) => (
                      <Card key={bill.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  ${bill.amount.toString()}
                                </span>
                                {bill.invoice_number && (
                                  <span className="text-sm text-muted-foreground">
                                    #{bill.invoice_number}
                                  </span>
                                )}
                              </div>
                              {bill.appointment_date && (
                                <div className="text-sm text-muted-foreground">
                                  Service Date: {format(parseISO(bill.appointment_date), 'PPP')}
                                </div>
                              )}
                              {bill.description && (
                                <div className="text-sm">
                                  {bill.description}
                                </div>
                              )}
                            </div>
                            <Badge variant={getBillStatusBadgeVariant(bill.status)}>
                              {bill.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No bills found for this patient.
                  </div>
                )}
              </TabsContent>
              */}
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <AppointmentModal
        open={isAppointmentModalOpen}
        onOpenChange={setIsAppointmentModalOpen}
        appointment={null}
        patient={patient}
      />

      <BillingModal
        open={isBillingModalOpen}
        onOpenChange={setIsBillingModalOpen}
        bill={null}
        patient={patient}
      />
    </>
  );
};

export { PatientDetailsModal };
