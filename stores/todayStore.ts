import { create } from 'zustand';
import { toast } from 'sonner';
import type { AIStructuredOutput } from '@/types/voice';

export type ActiveFilter = 'queue' | 'all';
export type ActiveModal = 'consult' | 'bill' | 'appointment' | 'patient-edit' | 'patient-new' | null;

interface TodayState {
  activeFilter: ActiveFilter;
  searchQuery: string;
  debouncedSearch: string;
  genderFilter: string | null;
  ageGroupFilter: string | null;
  selectedPatientId: string | null;
  selectedAppointmentId: string | null;
  activeModal: ActiveModal;
  mobileDetailOpen: boolean;
  dirtyFormGuard: boolean;
  shakeTrigger: number;
  draftConsultationData: AIStructuredOutput | null;
}

interface TodayActions {
  setFilter: (filter: ActiveFilter) => void;
  setSearchQuery: (query: string) => void;
  setDebouncedSearch: (query: string) => void;
  setGenderFilter: (gender: string | null) => void;
  setAgeGroupFilter: (ageGroup: string | null) => void;
  selectPatient: (patientId: string, appointmentId?: string) => boolean;
  clearSelection: () => void;
  openModal: (modal: ActiveModal) => void;
  closeModal: () => void;
  setMobileDetailOpen: (open: boolean) => void;
  setDirtyFormGuard: (dirty: boolean) => void;
  setDraftConsultationData: (data: AIStructuredOutput | null) => void;
  clearDraftConsultationData: () => void;
}

export const useTodayStore = create<TodayState & TodayActions>((set, get) => ({
  activeFilter: 'queue',
  searchQuery: '',
  debouncedSearch: '',
  genderFilter: null,
  ageGroupFilter: null,
  selectedPatientId: null,
  selectedAppointmentId: null,
  activeModal: null,
  mobileDetailOpen: false,
  dirtyFormGuard: false,
  shakeTrigger: 0,
  draftConsultationData: null,

  setFilter: (filter) => set({ activeFilter: filter }),

  setSearchQuery: (query) => {
    const state: Partial<TodayState> = { searchQuery: query };
    if (query.trim()) state.activeFilter = 'all';
    set(state);
  },

  setDebouncedSearch: (query) => set({ debouncedSearch: query }),

  setGenderFilter: (gender) => set({ genderFilter: gender, ...(gender ? { activeFilter: 'all' } : {}) }),

  setAgeGroupFilter: (ageGroup) => set({ ageGroupFilter: ageGroup, ...(ageGroup ? { activeFilter: 'all' } : {}) }),

  selectPatient: (patientId, appointmentId) => {
    if (get().dirtyFormGuard) {
      toast.error('Complete or discard the current bill before switching patients.');
      set((s) => ({ shakeTrigger: s.shakeTrigger + 1 }));
      return false;
    }
    set({ selectedPatientId: patientId, selectedAppointmentId: appointmentId ?? null, mobileDetailOpen: true });
    return true;
  },

  clearSelection: () => set({ selectedPatientId: null, selectedAppointmentId: null, mobileDetailOpen: false }),

  openModal: (modal) => set({ activeModal: modal }),

  closeModal: () => set({ activeModal: null, dirtyFormGuard: false }),

  setMobileDetailOpen: (open) => set({ mobileDetailOpen: open }),

  setDirtyFormGuard: (dirty) => set({ dirtyFormGuard: dirty }),

  setDraftConsultationData: (data) => set({ draftConsultationData: data }),
  clearDraftConsultationData: () => set({ draftConsultationData: null }),
}));
