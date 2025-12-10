import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function that includes providers
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock data factories
export const mockPatient = {
  id: 'patient-123',
  name: 'John Doe',
  gender: 'Male',
  age: 30,
  phone: '9876543210',
  email: 'john@example.com',
  address: '123 Main St',
  medical_id: 'MED123',
  clinic_id: 'clinic-123',
  created_at: '2024-01-01T00:00:00Z',
};

export const mockAppointment = {
  id: 'appointment-123',
  clinic_id: 'clinic-123',
  date: '2024-01-15',
  time: '10:00 AM',
  patient_id: 'patient-123',
  doctor_id: 'doctor-123',
  type: 'Walk-in',
  status: 'Scheduled',
  notes: 'Test appointment',
  created_at: '2024-01-01T00:00:00Z',
  patient: mockPatient,
};

export const mockConsultation = {
  id: 'consultation-123',
  appointment_id: 'appointment-123',
  patient_id: 'patient-123',
  doctor_id: 'doctor-123',
  clinic_id: 'clinic-123',
  specialty_data: {
    chief_complaint: 'Headache',
    history_of_present_illness: 'Started 2 days ago',
    past_medical_history: 'None',
    medications: 'None',
    allergies: 'None',
    family_history: 'None',
    social_history: 'Non-smoker',
    review_of_systems: 'Normal',
    physical_examination: 'Normal',
    assessment: 'Tension headache',
    plan: 'Rest and hydration',
    prescriptions: [],
  },
  created_at: '2024-01-01T00:00:00Z',
};

export const mockBill = {
  id: 'bill-123',
  patient_id: 'patient-123',
  appointment_id: 'appointment-123',
  clinic_id: 'clinic-123',
  invoice_number: 'INV-2024-001',
  amount: 1000,
  description: 'Consultation fee',
  service_items: [
    {
      description: 'General Consultation',
      quantity: 1,
      rate: 1000,
      amount: 1000,
    },
  ],
  discount_percentage: 0,
  tax_percentage: 18,
  notes: 'Test bill',
  status: 'Pending',
  created_at: '2024-01-01T00:00:00Z',
};

export const mockUser = {
  id: 'user-123',
  email: 'doctor@example.com',
  user_metadata: {
    name: 'Dr. Smith',
  },
};

export const mockClinic = {
  clinic_id: 'clinic-123',
  clinic_name: 'Test Clinic',
  role: 'doctor' as const,
  clinics: {
    id: 'clinic-123',
    name: 'Test Clinic',
    address: '123 Clinic St',
    phone: '9876543210',
    email: 'clinic@example.com',
  },
};

// Mock Supabase responses
export const mockSupabaseSuccess = (data: any) => ({
  data,
  error: null,
});

export const mockSupabaseError = (message: string) => ({
  data: null,
  error: { message },
});

// Re-export everything from RTL
export * from '@testing-library/react';
export { customRender as render };