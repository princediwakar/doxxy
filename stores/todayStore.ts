// stores/todayStore.ts
import { create } from 'zustand';

export type ActiveFilter = 'queue' | 'all';
export type ActiveModal = 'consult' | 'bill' | 'appointment' | 'patient-edit' | 'patient-new' | null;

interface TodayModalState {
  activeModal: ActiveModal;
  appointmentModalOpen: boolean;
  openModal: (modal: ActiveModal) => void;
  closeModal: () => void;
  setAppointmentModalOpen: (open: boolean) => void;
}

export const useTodayStore = create<TodayModalState>((set) => ({
  activeModal: null,
  appointmentModalOpen: false,

  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  setAppointmentModalOpen: (open) => set({ appointmentModalOpen: open }),
}));
