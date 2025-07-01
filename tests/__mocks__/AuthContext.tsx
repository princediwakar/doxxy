import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { vi } from 'vitest';

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: { name: 'Test User' },
};

const mockClinic = {
  id: 'test-clinic-id',
  user_id: 'test-user-id',
  clinic_id: 'test-clinic-id',
  name: 'Test Clinic',
  role: 'admin',
  department_id: null,
  created_at: '',
  clinics: { id: 'test-clinic-id', name: 'Test Clinic', address: '', email: '', phone: '', website: '', created_at: '' },
  clinic_name: 'Test Clinic',
  joined_at: '',
};

const AuthContext = createContext({
  session: null,
  user: mockUser,
  loading: false,
  initialLoading: false,
  clinicLoading: false,
  signOut: async () => {},
  userClinics: [mockClinic],
  activeClinic: mockClinic,
  setActiveClinicId: (clinicId: string | null) => {},
  activeClinicRole: 'admin',
  fetchUserAndClinicData: async (userFromSession: any) => {},
  profileName: 'Test User',
  needsProfileCompletion: false,
  checkProfileCompletion: async (userId: string) => false,
  markProfileComplete: async () => {},
  hasDoctorProfile: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
  initialLoading?: boolean;
  mockNeedsProfileCompletion?: boolean;
  mockActiveClinic?: any;
}

export const AuthProvider = ({ 
  children, 
  initialLoading = false, 
  mockNeedsProfileCompletion = false,
  mockActiveClinic = mockClinic
}: AuthProviderProps) => {
  const [user, setUser] = useState(mockUser);
  const [activeClinic, setActiveClinic] = useState(mockActiveClinic);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(mockNeedsProfileCompletion);

  const mockCheckProfileCompletion = useCallback(async (userId: string) => {
    return needsProfileCompletion;
  }, [needsProfileCompletion]);

  const mockMarkProfileComplete = useCallback(async () => {
    setNeedsProfileCompletion(false);
  }, []);

  const mockSetActiveClinicId = useCallback((clinicId: string | null) => {
    if (clinicId === null) {
      setActiveClinic(null);
    } else {
      setActiveClinic(mockClinic);
    }
  }, []);

  const mockFetchUserAndClinicData = useCallback(async (userFromSession: any) => {
    // Simulate fetching data
    setUser(mockUser);
    setActiveClinic(mockClinic);
  }, []);

  const value = useMemo(() => ({
    session: null,
    user,
    loading: initialLoading,
    initialLoading: initialLoading,
    clinicLoading: initialLoading,
    signOut: vi.fn(),
    userClinics: [mockClinic],
    activeClinic,
    setActiveClinicId: mockSetActiveClinicId,
    activeClinicRole: activeClinic?.role || null,
    fetchUserAndClinicData: mockFetchUserAndClinicData,
    profileName: user?.user_metadata?.name || user?.email || null,
    needsProfileCompletion,
    checkProfileCompletion: mockCheckProfileCompletion,
    markProfileComplete: mockMarkProfileComplete,
    hasDoctorProfile: false,
  }), [
    user, activeClinic, initialLoading, needsProfileCompletion,
    mockSetActiveClinicId, mockFetchUserAndClinicData, mockCheckProfileCompletion, mockMarkProfileComplete
  ]);

  return React.createElement(AuthContext.Provider, { value: value }, children);
};