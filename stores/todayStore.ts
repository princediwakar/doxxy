// stores/todayStore.ts
import { create } from 'zustand';

export type ActiveFilter = 'queue' | 'all';
export type ActiveModal = 'consult' | 'bill' | 'appointment' | 'patient-edit' | 'patient-new' | null;

interface TodayState {
  activeModal: ActiveModal;
  mobileDetailOpen: boolean;
  dirtyFormGuard: boolean;
  shakeTrigger: number;
}

interface TodayActions {
  openModal: (modal: ActiveModal) => void;
  closeModal: () => void;
  setMobileDetailOpen: (open: boolean) => void;
  setDirtyFormGuard: (dirty: boolean) => void;
  triggerShake: () => void;
}

export const useTodayStore = create<TodayState & TodayActions>((set) => ({
  activeModal: null,
  mobileDetailOpen: false,
  dirtyFormGuard: false,
  shakeTrigger: 0,

  openModal: (modal) => set({ activeModal: modal }),

  closeModal: () => set({ activeModal: null, dirtyFormGuard: false }),

  setMobileDetailOpen: (open) => set({ mobileDetailOpen: open }),

  setDirtyFormGuard: (dirty) => set({ dirtyFormGuard: dirty }),

  triggerShake: () => set((s) => ({ shakeTrigger: s.shakeTrigger + 1 })),
}));
