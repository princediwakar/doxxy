// src/components/appointments/AppointmentsTable.tsx
"use client";
import { logger } from "@/lib/logger";
import React, { useCallback } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal, Calendar, Receipt, User, Play, Edit } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { formatTimeIST } from '@/lib/utils';
import { AppointmentWithDetails } from '@/types/appointments';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AppointmentCardProps {
  appointment: AppointmentWithDetails;
  index: number;
  onAppointmentClick: (appointment: AppointmentWithDetails) => void;
  onCancelAppointment: (appointmentId: string) => void;
  onStartConsultation: (appointment: AppointmentWithDetails) => void;
  onViewConsultation: (appointment: AppointmentWithDetails) => void;
  onCreateBill: (appointment: AppointmentWithDetails) => void;
  cancelLoading: boolean;
  getStatusColor: (status: string) => string;
}

const AppointmentCard: React.FC<AppointmentCardProps> = React.memo(({
  appointment,
  index,
  onAppointmentClick,
  onCancelAppointment,
  onStartConsultation,
  onViewConsultation,
  onCreateBill,
  cancelLoading,
  getStatusColor,
}) => {
  const { user } = useAuth();
  const router = useRouter();

  const handleCardClick = useCallback(() => {
    onAppointmentClick(appointment);
  }, [onAppointmentClick, appointment]);

  const handleStopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleStart = useCallback(() => {
    onStartConsultation(appointment);
  }, [onStartConsultation, appointment]);

  const handleContinue = useCallback(() => {
    onStartConsultation(appointment);
  }, [onStartConsultation, appointment]);

  const handleViewOrEdit = useCallback(async () => {
    if (appointment.user_id === user?.id) {
      router.push(`/consultation/${appointment.id}`);
    } else {
      onViewConsultation(appointment);
    }
  }, [appointment, user?.id, router, onViewConsultation]);

  const handleCreateBill = useCallback(() => {
    onCreateBill(appointment);
  }, [onCreateBill, appointment]);

  const handleViewEditAppointment = useCallback(() => {
    onAppointmentClick(appointment);
  }, [onAppointmentClick, appointment]);

  const handleCancel = useCallback(() => {
    onCancelAppointment(appointment.id);
  }, [onCancelAppointment, appointment.id]);

  return (
    <Card
      className="cursor-pointer hover:bg-muted/50 touch-manipulation"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{appointment.patient_name}</h4>
              <p className="text-sm text-muted-foreground">
                {format(parseISO(appointment.date), 'MMM dd, yyyy')} at {formatTimeIST(appointment.time)}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(getStatusColor(appointment.status), "text-xs")}
          >
            {appointment.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-5 w-5">
            <AvatarImage src={appointment.doctor_avatar_url} />
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {appointment.doctor_name?.[0]?.toUpperCase() || 'D'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{appointment.doctor_name}</span>
          {appointment.department_name && (
            <span className="text-xs text-muted-foreground">• {appointment.department_name}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Badge
            variant={appointment.billing_status === 'Paid' ? 'default' : 'secondary'}
            className={cn(
              appointment.billing_status === 'Paid'
                ? 'bg-green-100 text-green-800'
                : appointment.billing_status === 'Pending'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-gray-100 text-gray-800',
              "text-xs"
            )}
          >
            {appointment.billing_status || 'Unbilled'}
          </Badge>
          <div className="flex items-center gap-2" onClick={handleStopPropagation}>
            {appointment.status === 'Scheduled' && appointment.user_id === user?.id && (
              <Button size="sm" onClick={handleStart}>
                <Play className="mr-1 h-4 w-4" /> Start
              </Button>
            )}
            {appointment.status === 'In Progress' && appointment.user_id === user?.id && (
              <Button size="sm" onClick={handleContinue}>
                <Play className="mr-1 h-4 w-4" /> Continue
              </Button>
            )}
            {appointment.status === 'Completed' && (
              <Button size="sm" variant="outline" onClick={handleViewOrEdit}>
                {appointment.user_id === user?.id ? "Edit" : "View"}
              </Button>
            )}
            {appointment.status !== 'Cancelled' &&
             (!appointment.billing_status || appointment.billing_status === 'Unbilled') && (
              <Button size="sm" onClick={handleCreateBill}>
                <Receipt className="mr-1 h-4 w-4" /> Bill
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleViewEditAppointment}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Appointment
                </DropdownMenuItem>
                {(appointment.status === 'Scheduled' || appointment.status === 'In Progress') && (
                  <DropdownMenuItem
                    onClick={handleCancel}
                    className="text-destructive"
                    disabled={cancelLoading}
                  >
                    Cancel Appointment
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

interface TableAppointmentRowProps {
  appointment: AppointmentWithDetails;
  onAppointmentClick: (appointment: AppointmentWithDetails) => void;
  onCancelAppointment: (appointmentId: string) => void;
  onStartConsultation: (appointment: AppointmentWithDetails) => void;
  onViewConsultation: (appointment: AppointmentWithDetails) => void;
  onCreateBill: (appointment: AppointmentWithDetails) => void;
  getStatusColor: (status: string) => string;
  cancelLoading: boolean;
}

const TableAppointmentRow: React.FC<TableAppointmentRowProps> = React.memo(({
  appointment,
  onAppointmentClick,
  onCancelAppointment,
  onStartConsultation,
  onViewConsultation,
  onCreateBill,
  getStatusColor,
  cancelLoading,
}) => {
  const { user } = useAuth();
  const router = useRouter();

  const handleRowClick = useCallback(() => {
    onAppointmentClick(appointment);
  }, [onAppointmentClick, appointment]);

  const handleStopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleStart = useCallback(() => {
    onStartConsultation(appointment);
  }, [onStartConsultation, appointment]);

  const handleContinue = useCallback(() => {
    onStartConsultation(appointment);
  }, [onStartConsultation, appointment]);

  const handleEditOrView = useCallback(async () => {
    if (appointment.user_id === user?.id) {
      try {
        router.push(`/consultation/${appointment.id}`);
      } catch (error) {
        logger.error('Error prefetching consultation data:', error);
        router.push(`/consultation/${appointment.id}`);
      }
    } else {
      onViewConsultation(appointment);
    }
  }, [appointment, user?.id, router, onViewConsultation]);

  const handleCreateBill = useCallback(() => {
    onCreateBill(appointment);
  }, [onCreateBill, appointment]);

  const handleViewEdit = useCallback(() => {
    onAppointmentClick(appointment);
  }, [onAppointmentClick, appointment]);

  const handleCancel = useCallback(() => {
    onCancelAppointment(appointment.id);
  }, [onCancelAppointment, appointment.id]);

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={handleRowClick}
    >
      <TableCell>
        <div className="font-medium">{appointment.patient_name}</div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={appointment.doctor_avatar_url} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {appointment.doctor_name?.[0]?.toUpperCase() || 'D'}
            </AvatarFallback>
          </Avatar>
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
      <TableCell onClick={handleStopPropagation}>
        <div className="flex items-center gap-2">
          {appointment.status === 'Scheduled' && appointment.user_id === user?.id && (
            <Button
              size="sm"
              onClick={handleStart}
              title="Start Consultation"
            >
              <span>Start</span>
            </Button>
          )}

          {appointment.status === 'In Progress' && appointment.user_id === user?.id && (
            <Button
              size="sm"
              onClick={handleContinue}
              title="Continue Consultation"
            >
              <span>Continue</span>
            </Button>
          )}

          {appointment.status === 'Completed' && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleEditOrView}
              title={appointment.user_id === user?.id ? "Edit Notes" : "View Notes"}
            >
              <span>{appointment.user_id === user?.id ? "Edit Notes" : "View Notes"}</span>
            </Button>
          )}

          {appointment.status !== 'Cancelled' &&
           (!appointment.billing_status || appointment.billing_status === 'Unbilled') && (
            <Button
              size="sm"
              onClick={handleCreateBill}
              title="Create Bill"
            >
              <Receipt className="h-4 w-4 mr-1" />
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
              <DropdownMenuItem onClick={handleViewEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Appointment
              </DropdownMenuItem>
              {(appointment.status === 'Scheduled' || appointment.status === 'In Progress') && (
                <DropdownMenuItem
                  onClick={handleCancel}
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
  );
});

interface AppointmentsTableProps {
  appointments: AppointmentWithDetails[];
  onAppointmentClick: (appointment: AppointmentWithDetails) => void;
  onCancelAppointment: (appointmentId: string) => void;
  onStartConsultation: (appointment: AppointmentWithDetails) => void;
  onViewConsultation: (appointment: AppointmentWithDetails) => void;
  onCreateBill: (appointment: AppointmentWithDetails) => void;
  activeClinicRole?: string | null;
  cancelLoading?: boolean;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  onAppointmentClick,
  onCancelAppointment,
  onStartConsultation,
  onViewConsultation,
  onCreateBill,
  cancelLoading = false,
}) => {
  const { user } = useAuth();
  const router = useRouter();

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

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
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {appointments.map((appointment, index) => (
          <AppointmentCard
            key={`${appointment.id}-${index}`}
            appointment={appointment}
            index={index}
            onAppointmentClick={onAppointmentClick}
            onCancelAppointment={onCancelAppointment}
            onStartConsultation={onStartConsultation}
            onViewConsultation={onViewConsultation}
            onCreateBill={onCreateBill}
            cancelLoading={cancelLoading}
            getStatusColor={getStatusColor}
          />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
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
          {appointments.map((appointment, index) => (
            <TableAppointmentRow
              key={`${appointment.id}-${index}`}
              appointment={appointment}
              onAppointmentClick={onAppointmentClick}
              onCancelAppointment={onCancelAppointment}
              onStartConsultation={onStartConsultation}
              onViewConsultation={onViewConsultation}
              onCreateBill={onCreateBill}
              getStatusColor={getStatusColor}
              cancelLoading={cancelLoading}
            />
          ))}
        </TableBody>
      </Table>
      </div>
    </>
  );
}; 