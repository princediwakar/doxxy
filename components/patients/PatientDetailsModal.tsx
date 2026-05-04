// components/patients/PatientDetailsModal.tsx
"use client";

import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Phone, Mail, MapPin, User, Clock, Plus, FileText } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';
import { usePatientAppointments } from '@/hooks/usePatientAppointments';
import { usePatientBills } from '@/hooks/usePatientBills';
import { AppointmentModal } from '../appointments/AppointmentModal';
import { BillingModal } from '../billing/BillingModal';
import { formatTimeIST } from "@/lib/utils";
import type { Patient } from "@/types/patients";
import type { BillWithDetails } from "@/types/billing";

interface PatientDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
}

const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  open,
  onOpenChange,
  patient,
}) => {
  const { activeClinic } = useAuth();
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillWithDetails | null>(null);
  const [billingModalMode, setBillingModalMode] = useState<"view" | "edit">("view");

  const { data: appointments, isLoading: appointmentsLoading } = usePatientAppointments(
    open ? patient?.id : undefined
  );

  const { data: bills } = usePatientBills(open ? patient?.id : undefined);

  const billByAppointmentId = useMemo(() => {
    if (!bills) return new Map<string, BillWithDetails>();
    const map = new Map<string, BillWithDetails>();
    for (const bill of bills) {
      if (bill.appointment_id && !map.has(bill.appointment_id)) {
        map.set(bill.appointment_id, bill);
      }
    }
    return map;
  }, [bills]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'outline';
      case 'In Progress': return 'default';
      case 'Completed': return 'default';
      case 'Cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const handleViewBill = (bill: BillWithDetails) => {
    setSelectedBill(bill);
    setBillingModalMode("view");
    setIsBillingModalOpen(true);
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
                {patient.age && (
                  <span className="ml-1">{patient.age} yrs, {patient.gender}</span>
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
                    <span>{patient.age ? `${patient.age} years old` : 'Age not provided'}</span>
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
                                    <span>{formatTimeIST(appointment.time)}</span>
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
                              <Badge variant={getStatusBadgeVariant(appointment.status || 'Unknown')}>
                                {appointment.status}
                              </Badge>
                              <Badge variant="outline">
                                {appointment.type}
                              </Badge>
                            </div>
                          </div>
                          {(() => {
                            const linkedBill = billByAppointmentId.get(appointment.id);
                            if (!linkedBill) return null;
                            return (
                              <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                                <Badge variant="secondary" className="text-xs">Auto</Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewBill(linkedBill)}
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  View Bill
                                </Button>
                              </div>
                            );
                          })()}
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
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBill(null);
            setBillingModalMode("view");
          }
          setIsBillingModalOpen(open);
        }}
        bill={selectedBill}
        patient={patient}
        mode={billingModalMode}
        onModeChange={(newMode) => setBillingModalMode(newMode as "view" | "edit")}
      />
    </>
  );
};

export { PatientDetailsModal };
