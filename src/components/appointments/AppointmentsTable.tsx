import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Calendar, Stethoscope, Eye } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { formatTimeIST } from '@/lib/utils';
import { AppointmentWithDetails } from '@/hooks/useAppointments';
import { useAuth } from '@/contexts/AuthContext';

interface AppointmentsTableProps {
  appointments: AppointmentWithDetails[];
  onAppointmentClick: (appointment: AppointmentWithDetails) => void;
  onCancelAppointment: (appointmentId: string) => void;
  onStartConsultation: (appointment: AppointmentWithDetails) => void;
  onViewConsultation: (appointment: AppointmentWithDetails) => void;
  onCreateBill: (appointment: AppointmentWithDetails) => void;
  activeClinicRole: string | null;
  cancelLoading?: boolean;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  onAppointmentClick,
  onCancelAppointment,
  onStartConsultation,
  onViewConsultation,
  onCreateBill,
  activeClinicRole,
  cancelLoading = false,
}) => {
  const { user } = useAuth();
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
        <p className="text-muted-foreground">
          There are no appointments matching your current filter.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Billing</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow
              key={appointment.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onAppointmentClick(appointment)}
            >
              <TableCell>
                <div className="font-medium">{appointment.patient_name}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.doctor_name}</span>
                </div>
                {appointment.department_name && (
                  <div className="text-xs text-muted-foreground">
                    {appointment.department_name}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">
                    {format(parseISO(appointment.date), 'MMM dd, yyyy')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatTimeIST(appointment.time)}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <Badge
                  variant="outline"
                  className={getStatusColor(appointment.status)}
                >
                  {appointment.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={appointment.billing_status === 'Paid' ? 'default' : 'secondary'}
                  className={
                    appointment.billing_status === 'Paid'
                      ? 'bg-green-100 text-green-800'
                      : appointment.billing_status === 'Pending'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
                  }
                >
                  {appointment.billing_status || 'Unbilled'}
                </Badge>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  {appointment.status === 'Scheduled' && appointment.doctor_user_id === user?.id && (
                    <Button
                      size="sm"
                      onClick={() => onStartConsultation(appointment)}
                      title="Start Consultation"
                    >
                      <span>Start</span>
                    </Button>
                  )}

                  {appointment.status === 'In Progress' && appointment.doctor_user_id === user?.id && (
                    <Button
                      size="sm"
                      onClick={() => onStartConsultation(appointment)}
                      title="Continue Consultation"
                    >
                      <span>Continue</span>
                    </Button>
                  )}

                  {appointment.status === 'Completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewConsultation(appointment)}
                      title="View Notes"
                    >
                      <span>View Notes</span>
                    </Button>
                  )}

                  {appointment.status === 'Completed' && !appointment.billing_status && (
                    <Button
                      size="sm"
                      onClick={() => onCreateBill(appointment)}
                      title="Create Bill"
                    >
                      <span>Create Bill</span>
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onAppointmentClick(appointment)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View/Edit Appointment
                      </DropdownMenuItem>
                      {(appointment.status === 'Scheduled' || appointment.status === 'In Progress') && (
                        <DropdownMenuItem
                          onClick={() => onCancelAppointment(appointment.id)}
                          className="text-destructive"
                          disabled={cancelLoading}
                        >
                          Cancel Appointment
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 