'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import type { ClinicMemberWithClinic } from '@/types/core';
import { signOutAction } from '@/actions/auth';

interface AppState {
  user: User | null;
  activeClinicId: string | undefined;
  activeClinicRole: string | undefined;
  profileName: string | undefined;
  activeClinicName: string | undefined;
  userClinics: ClinicMemberWithClinic[];
  signOut: () => Promise<void>;
  setActiveClinicId: (clinicId: string | null) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

interface AppStateProviderProps {
  children: ReactNode;
  serverUser: User | null;
  serverClinics: ClinicMemberWithClinic[];
  serverProfileName: string | null;
  serverActiveClinicId: string | null;
}

function getInitialClinic(
  clinics: ClinicMemberWithClinic[],
  preferredId: string | null,
): ClinicMemberWithClinic | undefined {
  if (preferredId) {
    const match = clinics.find((c) => c.clinic_id === preferredId);
    if (match) return match;
  }
  return clinics[0];
}

export function AppStateProvider({
  children,
  serverUser,
  serverClinics,
  serverProfileName,
  serverActiveClinicId,
}: AppStateProviderProps) {
  const [user] = useState<User | null>(serverUser);
  const [userClinics] = useState<ClinicMemberWithClinic[]>(serverClinics);
  const initialClinic = getInitialClinic(serverClinics, serverActiveClinicId);
  const [activeClinicId, setActiveClinicIdState] = useState<string | undefined>(
    () => initialClinic?.clinic_id ?? undefined,
  );
  const [activeClinicRole, setActiveClinicRole] = useState<string | undefined>(
    () => initialClinic?.role ?? undefined,
  );
  const [activeClinicName, setActiveClinicName] = useState<string | undefined>(
    () => initialClinic?.clinics?.name ?? undefined,
  );
  const [profileName] = useState<string | undefined>(
    () => serverProfileName ?? user?.user_metadata?.name ?? user?.email ?? undefined,
  );

  const setActiveClinicId = useCallback((clinicId: string | null) => {
    if (!clinicId) {
      setActiveClinicIdState(undefined);
      setActiveClinicRole(undefined);
      setActiveClinicName(undefined);
      return;
    }
    const selected = userClinics.find((c) => c.clinic_id === clinicId);
    if (selected) {
      setActiveClinicIdState(selected.clinic_id);
      setActiveClinicRole(selected.role);
      setActiveClinicName(selected.clinics?.name ?? undefined);
    }
  }, [userClinics]);

  const signOut = useCallback(async () => {
    await signOutAction();
  }, []);

  const value = useMemo<AppState>(() => ({
    user,
    activeClinicId,
    activeClinicRole,
    profileName,
    activeClinicName,
    userClinics,
    signOut,
    setActiveClinicId,
  }), [user, activeClinicId, activeClinicRole, profileName, activeClinicName, userClinics, signOut, setActiveClinicId]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (ctx === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return ctx;
}
