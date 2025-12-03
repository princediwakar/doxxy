import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Calendar } from 'lucide-react';
import { AppointmentModal } from '@/components/appointments/AppointmentModal';
import { SkeletonLoader } from '@/components/ui/loading';

import { Suspense, lazy } from 'react';

// Lazy load heavy components
const ConsultationViewModal = lazy(() => import('@/components/consultation/ConsultationViewModal').then(module => ({ default: module.ConsultationViewModal })));
const BillingModal = lazy(() => import('@/components/billing/BillingModal').then(module => ({ default: module.BillingModal })));
import { useAppointments } from '@/hooks/useAppointments';
import { usePrefetching } from '@/hooks/usePrefetching';
import type { AppointmentWithDetails } from '@/types/appointments';
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

  // Prefetching hook
  const { prefetchPatients, prefetchDoctors, prefetchConsultationData } = usePrefetching();

  // Prefetch essential data when appointments are loaded
  useEffect(() => {
    if (!isLoading) {
      // Prefetch patients and doctors in background
      Promise.all([
        prefetchPatients(),
        prefetchDoctors(),
      ]).catch(console.error);
    }
  }, [isLoading, prefetchPatients, prefetchDoctors]);

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
      console.log('handleStartConsultationClick called for appointment:', {
        id: appointment.id,
        patient_name: appointment.patient_name,
        status: appointment.status
      });
      // Prefetch consultation data before starting the consultation process
      await prefetchConsultationData(appointment.id);

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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
                <p className="text-muted-foreground">Manage and track all clinic appointments</p>
              </div>
            </div>
          </div>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              disabled
              placeholder="Search appointments..."
              className="pl-9"
            />
          </div>
          <div className="w-48">
            <SkeletonLoader count={1} itemClassName="h-10 bg-muted/50 rounded-md" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-b">
            <div className="flex space-x-4">
              {['Today', 'Upcoming', 'Past'].map((tab) => (
                <button
                  key={tab}
                  disabled
                  className="px-3 py-2 text-sm font-medium text-muted-foreground border-b-2 border-transparent"
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <SkeletonLoader count={5} itemClassName="h-16 bg-muted/50 rounded-md" />
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
        appointment={selectedAppointment}
      />

      

      <Suspense fallback={null}>
        <ConsultationViewModal
          open={isConsultationViewModalOpen}
          onOpenChange={handleConsultationViewModalClose}
          appointment={selectedAppointment}
        />
      </Suspense>

      <Suspense fallback={null}>
        <BillingModal
          open={isBillingModalOpen}
          onOpenChange={handleBillingModalClose}
          appointment={selectedAppointment}
        />
      </Suspense>
    </div>
  );
};

export default Appointments;
