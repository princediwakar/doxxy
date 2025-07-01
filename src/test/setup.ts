import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock the entire AuthContext module
vi.mock('../src/contexts/AuthContext', () => {
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

  return {
    useAuth: () => ({
      session: null,
      user: mockUser,
      loading: false,
      initialLoading: false,
      clinicLoading: false,
      signOut: vi.fn(),
      userClinics: [mockClinic],
      activeClinic: mockClinic,
      setActiveClinicId: vi.fn(),
      activeClinicRole: 'admin',
      fetchUserAndClinicData: vi.fn(),
      profileName: 'Test User',
      needsProfileCompletion: false,
      checkProfileCompletion: vi.fn(() => false),
      markProfileComplete: vi.fn(),
      hasDoctorProfile: false,
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  };
});