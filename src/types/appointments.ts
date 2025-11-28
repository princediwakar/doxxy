// src/types/appointments.ts
// Appointments Module - Hub & Spoke Type Architecture

import type {
  DbAppointment,
  DbAppointmentWithDetails,
  DbDoctor,
  DbPatient,
  DbClinic,
  AppointmentStatus,
  AppointmentType
} from './core';

// ============================================================================
// APPOINTMENT TYPES
// ============================================================================

/** Enhanced appointment with patient and doctor details */
export type AppointmentWithDetails = DbAppointmentWithDetails;

/** Appointment filter options */
export type AppointmentFilter = 'today' | 'upcoming' | 'past';

/** Appointment with related entities */
export type Appointment = DbAppointment & {
  patients?: DbPatient;
  doctors?: DbDoctor;
  clinics?: DbClinic;
};

/** Union type for appointment data that can be used in both contexts */
export type AppointmentData = Appointment | AppointmentWithDetails;

/** Appointment status update parameters */
export interface AppointmentStatusUpdate {
  appointmentId: string;
  status: AppointmentStatus;
}

/** Paginated appointments data structure */
export interface PaginatedAppointments {
  all: AppointmentWithDetails[];
  today: AppointmentWithDetails[];
  upcoming: AppointmentWithDetails[];
  past: AppointmentWithDetails[];
  totalCount: number;
}

// ============================================================================
// APPOINTMENT HOOK TYPES
// ============================================================================

/** Return type from useAppointments hook */
export interface UseAppointmentsReturn {
  // Data
  appointments: {
    today: AppointmentWithDetails[];
    upcoming: AppointmentWithDetails[];
    past: AppointmentWithDetails[];
    all: AppointmentWithDetails[];
  };
  isLoading: boolean;
  error: Error | null;

  // Search and filtering
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeTab: AppointmentFilter;
  setActiveTab: (tab: string) => void;

  // Doctor selection
  selectedDoctorId: string | null;
  setSelectedDoctorId: (doctorId: string | null) => void;

  // Pagination
  currentPage: Record<AppointmentFilter, number>;
  handlePageChange: (tab: AppointmentFilter, page: number) => void;
  getPaginatedAppointments: (appointmentList: AppointmentWithDetails[], page: number) => AppointmentWithDetails[];
  getTotalPages: (appointmentList: AppointmentWithDetails[]) => number;
  itemsPerPage: number;

  // Actions
  handleCancelAppointment: (appointmentId: string) => void;
  handleStartConsultation: (appointmentId: string) => Promise<void>;
  refreshAppointments: () => void;

  // Loading states
  cancelLoading: boolean;
  updateStatusLoading: boolean;
}

// ============================================================================
// APPOINTMENT UTILITY TYPES
// ============================================================================

/** Appointment sorting function parameters */
export interface AppointmentSortParams {
  appointments: AppointmentWithDetails[];
  filter: AppointmentFilter;
}

/** Appointment fetch parameters */
export interface AppointmentFetchParams {
  clinicId: string | undefined;
  searchTerm: string;
}

/** Current user doctor profile */
export interface CurrentUserDoctorProfile {
  id: string;
}

// ============================================================================
// APPOINTMENT COMPONENT TYPES
// ============================================================================

/** Props for appointment components */
export interface AppointmentComponentProps {
  appointment: AppointmentWithDetails;
  onCancel?: (appointmentId: string) => void;
  onStartConsultation?: (appointmentId: string) => void;
  isLoading?: boolean;
}

/** Appointment card display props */
export interface AppointmentCardProps extends AppointmentComponentProps {
  showActions?: boolean;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  type AppointmentStatus,
  type AppointmentType,
};