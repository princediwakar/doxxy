"use client";

// src/pages/Appointments.tsx
import { useState, useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Calendar } from 'lucide-react';
import { AppointmentModal } from '@/components/appointments/AppointmentModal';
import { useAppointments } from '@/hooks/useAppointments';
import { usePrefetching } from '@/hooks/usePrefetching';
import { AppointmentsTabs } from '@/components/appointments/AppointmentsTabs';
import { DoctorSelector } from '@/components/appointments/DoctorSelector';
import { useAuth } from '@/contexts/AuthContext';
import type { AppointmentWithDetails, AppointmentFilter } from '@/types/appointments';

// Lazy load heavy components
const ConsultationViewModal = lazy(() => import('@/components/consultation/ConsultationViewModal').then(module => ({ default: module.ConsultationViewModal })));
const BillingModal = lazy(() => import('@/components/billing/BillingModal').then(module => ({ default: module.BillingModal })));

const Appointments = () => {
  const router = useRouter();
  const { activeClinicRole } = useAuth();

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

  const { prefetchPatients, prefetchDoctors, prefetchConsultationData } = usePrefetching();

  useEffect(() => {
    if (!isLoading) {
      Promise.all([prefetchPatients(), prefetchDoctors()]).catch(console.error);
    }
  }, [isLoading, prefetchPatients, prefetchDoctors]);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [isConsultationViewModalOpen, setIsConsultationViewModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setIsAppointmentModalOpen(true);
  };

  const handleAppointmentClick = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
    setIsAppointmentModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setIsAppointmentModalOpen(open);
    if (!open) {
      refreshAppointments();
      setSelectedAppointment(null);
    }
  };

  const handleStartConsultationClick = async (appointment: AppointmentWithDetails) => {
    try {
      await prefetchConsultationData(appointment.id);
      await handleStartConsultation(appointment.id);
      router.push(`/consultation/${appointment.id}`);
    } catch (err) {
      console.warn('Consultation start prevented:', err);
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

  // REMOVED: The entire "if (showSkeleton)" block.
  // The layout below is now PERMANENT. Loading is handled inside the components.

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
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient, doctor, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <DoctorSelector
          selectedDoctorId={selectedDoctorId}
          onDoctorChange={setSelectedDoctorId}
        />
      </div>

      <AppointmentsTabs
        appointments={appointments}
        isLoading={isLoading} // PASSED isLoading PROP
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t as AppointmentFilter)}
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
        isSearching={!!searchTerm}
      />

      <AppointmentModal
        open={isAppointmentModalOpen}
        onOpenChange={handleModalClose}
        appointment={selectedAppointment}
      />

      <Suspense fallback={null}>
        <ConsultationViewModal
          open={isConsultationViewModalOpen}
          onOpenChange={(open) => {
             setIsConsultationViewModalOpen(open);
             if (!open) setSelectedAppointment(null);
          }}
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