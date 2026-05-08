// stores/todayStore.ts
import { create } from 'zustand';
import type { AppointmentWithDetails } from '@/types/appointments';
import type { BillWithDetails } from '@/types/billing';
import type { DbPatientByClinic } from '@/types/core';
import type { AppointmentData } from '@/types/patients';
import type { Patient } from '@/types/patients';

export type ActiveFilter = 'queue' | 'all';
export type ActiveModal = 'consult' | 'bill' | 'appointment' | 'patient-edit' | 'patient-new' | null;

interface TodayState {
  // Modal visibility
  activeModal: ActiveModal;
  // Mobile detail panel
  mobileDetailOpen: boolean;
  // Context for modals — which record is being operated on
  selectedAppointment: AppointmentWithDetails | null;
  selectedBill: BillWithDetails | null;
  billPatient: DbPatientByClinic | null;
  historyAppointment: AppointmentData | null;
  appointmentModalPatient: Patient | null;
  appointmentModalOpen: boolean;
  // Form guard (dirty bill form)
  dirtyFormGuard: boolean;
  shakeTrigger: number;
}

interface TodayActions {
  // Simple actions
  setMobileDetailOpen: (open: boolean) => void;
  setDirtyFormGuard: (dirty: boolean) => void;
  triggerShake: () => void;
  // Combined actions — set context then open modal
  openModal: (modal: ActiveModal) => void;
  closeModal: () => void;
  selectAppointment: (app: AppointmentWithDetails | null) => void;
  createBill: (app: AppointmentWithDetails) => void;
  createBillForPatient: (patient: DbPatientByClinic) => void;
  viewBill: (bill: BillWithDetails) => void;
  viewConsultation: (appointmentId: string, patientId: string, doctorId: string, date?: string, time?: string, doctorName?: string) => void;
  scheduleAppointment: (patient: Patient) => void;
  editAppointment: (app: AppointmentWithDetails) => void;
  editPatient: () => void;
  patientCreated: (patient: Patient) => void;
}

export const useTodayStore = create<TodayState & TodayActions>((set) => ({
  activeModal: null,
  mobileDetailOpen: false,
  selectedAppointment: null,
  selectedBill: null,
  billPatient: null,
  historyAppointment: null,
  appointmentModalPatient: null,
  appointmentModalOpen: false,
  dirtyFormGuard: false,
  shakeTrigger: 0,

  setMobileDetailOpen: (open) => set({ mobileDetailOpen: open }),
  setDirtyFormGuard: (dirty) => set({ dirtyFormGuard: dirty }),
  triggerShake: () => set((s) => ({ shakeTrigger: s.shakeTrigger + 1 })),

  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () =>
    set({
      activeModal: null,
      dirtyFormGuard: false,
      selectedBill: null,
      historyAppointment: null,
    }),

  selectAppointment: (app) => set({ selectedAppointment: app }),

  createBill: (app) =>
    set({
      selectedAppointment: app,
      billPatient: null,
      selectedBill: null,
      activeModal: 'bill',
    }),

  createBillForPatient: (patient) =>
    set({
      billPatient: patient,
      selectedAppointment: null,
      selectedBill: null,
      activeModal: 'bill',
    }),

  viewBill: (bill) =>
    set({
      selectedBill: bill,
      activeModal: 'bill',
    }),

  viewConsultation: (appointmentId, patientId, doctorId, date = '', time = '', doctorName) =>
    set({
      selectedAppointment: null,
      selectedBill: null,
      historyAppointment: {
        id: appointmentId,
        patient_id: patientId,
        doctor_id: doctorId,
        doctor_name: doctorName,
        date,
        time,
        type: 'Walk-in',
        status: 'Completed',
        created_at: '',
      },
      activeModal: 'consult',
    }),

  scheduleAppointment: (patient) =>
    set({
      appointmentModalPatient: patient as unknown as Patient,
      selectedAppointment: null,
      appointmentModalOpen: true,
    }),

  editAppointment: (app) =>
    set({
      selectedAppointment: app,
      appointmentModalOpen: true,
    }),

  editPatient: () => set({ activeModal: 'patient-edit' }),

  patientCreated: (patient) =>
    set({
      activeModal: null,
      appointmentModalPatient: patient,
      selectedAppointment: null,
      appointmentModalOpen: true,
    }),
}));
