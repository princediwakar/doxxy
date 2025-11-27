import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Calendar } from 'lucide-react';
import { AppointmentModal } from '@/components/appointments/AppointmentModal';

import { ConsultationViewModal } from '@/components/consultation/ConsultationViewModal';
import { BillingModal } from '@/components/billing/BillingModal';
import { useAppointments, AppointmentWithDetails } from '@/hooks/useAppointments';
import { Database } from '@/integrations/supabase/types';

// Define types for modal props
type AppointmentData = Database['public']['Tables']['appointments']['Row'];
import { AppointmentsTabs } from '@/components/appointments/AppointmentsTabs';
import { DoctorSelector } from '@/components/appointments/DoctorSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Appointments = () => {
  const navigate = useNavigate();
  const {
    appointments,
    isLoading,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    currentPage,
    handlePageChange,
    getPaginatedAppointments,
    getTotalPages,
    handleCancelAppointment,
    handleStartConsultation,
    refreshAppointments,
    cancelLoading,
    selectedDoctorId,
    setSelectedDoctorId,
  } = useAppointments();

  const { activeClinicRole } = useAuth();
  // Modal states
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [isConsultationViewModalOpen, setIsConsultationViewModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  // Handle opening the modal for a new appointment
  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setIsAppointmentModalOpen(true);
  };

  // Handle opening the modal for an existing appointment
  const handleAppointmentClick = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
    setIsAppointmentModalOpen(true);
  };

  // Handle closing the modal and refreshing data
  const handleModalClose = (open: boolean) => {
    setIsAppointmentModalOpen(open);
    if (!open) {
      refreshAppointments();
      setSelectedAppointment(null);
    }
  };

  const handleStartConsultationClick = async (appointment: AppointmentWithDetails) => {
    try {
      await handleStartConsultation(appointment.id);
      navigate(`/consultation/${appointment.id}`);
    } catch (error) {
      console.error('Error starting consultation:', error);
    }
  };

  const handleViewConsultation = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
    setIsConsultationViewModalOpen(true);
  };

  const handleCreateBill = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
    setIsBillingModalOpen(true);
  };

  const handleBillingModalClose = (open: boolean) => {
    setIsBillingModalOpen(open);
    if (!open) {
      refreshAppointments();
      setSelectedAppointment(null);
    }
  };

  const handleConsultationViewModalClose = (open: boolean) => {
    setIsConsultationViewModalOpen(open);
    if (!open) {
      setSelectedAppointment(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between space-y-4 sm:space-y-0">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Appointments</h1>
              <p className="text-muted-foreground">Manage and track all clinic appointments</p>
            </div>
          </div>
        </div>
        <Button onClick={handleNewAppointment}>
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
      </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Add doctor selector for all users */}
            <DoctorSelector
              selectedDoctorId={selectedDoctorId}
              onDoctorChange={setSelectedDoctorId}
            />
          </div>

          <AppointmentsTabs
            appointments={appointments}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            getPaginatedAppointments={getPaginatedAppointments}
            getTotalPages={getTotalPages}
            onAppointmentClick={handleAppointmentClick}
            onCancelAppointment={handleCancelAppointment}
            onStartConsultation={handleStartConsultationClick}
            onViewConsultation={handleViewConsultation}
            onCreateBill={handleCreateBill}
            activeClinicRole={activeClinicRole}
            cancelLoading={cancelLoading}
          />

      {/* Modals */}
      <AppointmentModal
        open={isAppointmentModalOpen}
        onOpenChange={handleModalClose}
        appointment={selectedAppointment as AppointmentData | null}
      />

      

      <ConsultationViewModal
        open={isConsultationViewModalOpen}
        onOpenChange={handleConsultationViewModalClose}
        appointment={selectedAppointment}
      />

      <BillingModal
        open={isBillingModalOpen}
        onOpenChange={handleBillingModalClose}
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default Appointments;
