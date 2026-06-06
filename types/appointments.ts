// src/types/appointments.ts
import type {
  DbAppointment,
  DbAppointmentWithDetails,
  DbDoctor,
  DbPatient,
  DbClinic,
} from './core';

// ============================================================================
// CONSTANTS & ENUMS
// ============================================================================

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed'
} as const;

export type AppointmentStatusEnum = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];

// ============================================================================
// APPOINTMENT TYPES
// ============================================================================

export type AppointmentWithDetails = DbAppointmentWithDetails;

// ADDED 'all' to support the search view pagination
export type AppointmentFilter = 'today' | 'upcoming' | 'past' | 'all';

export type Appointment = DbAppointment & {
  patients?: DbPatient;
  doctors?: DbDoctor;
  clinics?: DbClinic;
};

export type AppointmentData = Appointment | AppointmentWithDetails;

export interface AppointmentStatusUpdate {
  appointmentId: string;
  status: AppointmentStatusEnum;
}

export interface PaginatedAppointments {
  all: AppointmentWithDetails[];
  today: AppointmentWithDetails[];
  upcoming: AppointmentWithDetails[];
  past: AppointmentWithDetails[];
  totalCount: number;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

export interface TodayQueue {
  inProgress: AppointmentWithDetails[];
  scheduled: AppointmentWithDetails[];
  completed: AppointmentWithDetails[];
  upcoming: AppointmentWithDetails[];
}

export interface UseAppointmentsReturn {
  // Data
  appointments: PaginatedAppointments;
  isLoading: boolean;
  error: Error | null;

  // Search
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  // Filtering
  activeTab: AppointmentFilter;
  setActiveTab: (tab: AppointmentFilter) => void;

  // Doctor Selection
  selectedDoctorId: string | null;
  setSelectedDoctorId: (id: string | null) => void;

  // Pagination
  currentPage: Record<AppointmentFilter, number>;
  handlePageChange: (tab: AppointmentFilter, page: number) => void;
  getPaginatedAppointments: (list: AppointmentWithDetails[], page: number) => AppointmentWithDetails[];
  getTotalPages: (list: AppointmentWithDetails[]) => number;
  itemsPerPage: number;

  // Actions
  handleCancelAppointment: (id: string) => void;
  handleStartConsultation: (id: string) => Promise<boolean>;
  refreshAppointments: () => void;

  // Loading States
  cancelLoading: boolean;
  updateStatusLoading: boolean;
  hasAutoSelected: boolean;
}