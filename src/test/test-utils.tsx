import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'

// Mock AuthContext Provider
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-testid="mock-auth-provider">
      {children}
    </div>
  )
}

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
})

// All the providers wrapper
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      <MockAuthProvider>
        <TooltipProvider>
          <div data-testid="mock-router">
            {children}
          </div>
        </TooltipProvider>
      </MockAuthProvider>
    </QueryClientProvider>
  )
}

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock data for tests
export const mockPatient = {
  id: '1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  date_of_birth: '1990-01-01',
  gender: 'Male',
  address: '123 Main St',
  medical_id: 'MED001',
  clinic_id: 'clinic-1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export const mockDoctor = {
  id: '1',
  first_name: 'Dr. Jane',
  last_name: 'Smith',
  email: 'jane.smith@example.com',
  phone: '+1234567891',
  specialization: 'General Medicine',
  license_number: 'LIC001',
  clinic_id: 'clinic-1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export const mockAppointment = {
  id: '1',
  patient_id: '1',
  doctor_id: '1',
  clinic_id: 'clinic-1',
  date: '2024-01-01',
  time: '10:00',
  type: 'Walk-in' as const,
  status: 'Scheduled' as const,
  notes: 'Regular checkup',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
} as const

export const mockConsultation = {
  id: '1',
  appointment_id: '1',
  patient_id: '1',
  doctor_id: '1',
  clinic_id: 'clinic-1',
  chief_complaint: 'Headache',
  history_of_present_illness: 'Patient reports headache for 2 days',
  physical_examination: 'Normal vital signs',
  assessment: 'Tension headache',
  plan: 'Rest and hydration',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export const mockPrescription = {
  id: '1',
  consultation_id: '1',
  patient_id: '1',
  doctor_id: '1',
  clinic_id: 'clinic-1',
  medication_name: 'Ibuprofen',
  dosage: '200mg',
  frequency: 'Twice daily',
  duration: '3 days',
  instructions: 'Take with food',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
} 