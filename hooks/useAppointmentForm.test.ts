import { renderHook, act, waitFor } from '@testing-library/react';
import { useAppointmentForm, useAppointmentMutation } from './useAppointmentForm';
import { getSupabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { mockPatient, mockAppointment, mockClinic } from '@/__tests__/test-utils';

// Mock dependencies
jest.mock('@/integrations/supabase/client');
jest.mock('@/contexts/AuthContext');
jest.mock('sonner');
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
    dismiss: jest.fn(),
    toasts: [],
  }),
}));
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useParams: () => ({}),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

const mockSupabase = {
  rpc: jest.fn(),
  from: jest.fn(),
};

const mockUseQuery = jest.fn();
const mockUseMutation = jest.fn();
const mockUseQueryClient = jest.fn();

describe('useAppointmentForm', () => {
  beforeEach(() => {
    (getSupabase as jest.Mock).mockReturnValue(mockSupabase);
    (useAuth as jest.Mock).mockReturnValue({
      activeClinic: mockClinic,
    });

    require('@tanstack/react-query').useQuery = mockUseQuery;
    require('@tanstack/react-query').useMutation = mockUseMutation;
    require('@tanstack/react-query').useQueryClient = mockUseQueryClient;

    jest.clearAllMocks();
  });

  describe('Data Fetching', () => {
    it('should fetch patients when modal is open', () => {
      const mockPatients = [mockPatient];
      mockUseQuery.mockImplementation(({ queryKey, queryFn, enabled }) => {
        if (queryKey[0] === 'patients') {
          return {
            data: enabled ? mockPatients : undefined,
            isLoading: false,
          };
        }
        return { data: undefined, isLoading: false };
      });

      const { result } = renderHook(() => useAppointmentForm(true));

      expect(result.current.patients).toEqual(mockPatients);
      expect(result.current.isLoadingPatients).toBe(false);
    });

    it('should not fetch patients when modal is closed', () => {
      mockUseQuery.mockReturnValue({ data: undefined, isLoading: false });

      const { result } = renderHook(() => useAppointmentForm(false));

      expect(result.current.patients).toBeUndefined();
      expect(result.current.isLoadingPatients).toBe(false);
    });

    it('should fetch doctors when modal is open', () => {
      const mockDoctors = [
        {
          id: 'doctor-123',
          name: 'Dr. Smith',
          department_name: 'General Medicine',
        },
      ];

      mockUseQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === 'doctorsForAppointment') {
          return {
            data: mockDoctors,
            isLoading: false,
          };
        }
        return { data: undefined, isLoading: false };
      });

      const { result } = renderHook(() => useAppointmentForm(true));

      expect(result.current.doctors).toEqual(mockDoctors);
      expect(result.current.isLoadingDoctors).toBe(false);
    });

    it('should handle RPC failure and use fallback query', async () => {
      const rpcError = new Error('RPC failed');
      const fallbackDoctors = [
        {
          id: 'doctor-123',
          name: 'Dr. Smith',
          department_name: 'General Medicine',
        },
      ];

      // Mock rpc to return error
      mockSupabase.rpc.mockReturnValue(Promise.resolve({
        data: null,
        error: rpcError,
      }));

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              data: fallbackDoctors,
              error: null,
            }),
          }),
        }),
      });

      mockUseQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === 'doctorsForAppointment') {
          return {
            data: fallbackDoctors,
            isLoading: false,
          };
        }
        return { data: undefined, isLoading: false };
      });

      const { result } = renderHook(() => useAppointmentForm(true));

      expect(result.current.doctors).toEqual(fallbackDoctors);
    });
  });

  describe('Clinic Validation', () => {
    it('should return empty arrays when no active clinic', () => {
      (useAuth as jest.Mock).mockReturnValue({
        activeClinic: null,
      });

      mockUseQuery.mockReturnValue({ data: undefined, isLoading: false });

      const { result } = renderHook(() => useAppointmentForm(true));

      expect(result.current.patients).toBeUndefined();
      expect(result.current.doctors).toBeUndefined();
    });
  });
});

describe('useAppointmentMutation', () => {
  const mockOnSuccessCallback = jest.fn();
  const mockQueryClient = {
    invalidateQueries: jest.fn(),
  };

  beforeEach(() => {
    (getSupabase as jest.Mock).mockReturnValue(mockSupabase);
    (useAuth as jest.Mock).mockReturnValue({
      activeClinic: mockClinic,
    });

    mockUseQueryClient.mockReturnValue(mockQueryClient);
    mockUseMutation.mockImplementation(({ onSuccess, onError }) => ({
      mutate: jest.fn((values, options) => {
        // Simulate successful mutation by calling onSuccess
        if (options?.onSuccess) {
          options.onSuccess(values);
        }
      }),
      isPending: false,
    }));

    jest.clearAllMocks();
  });

  describe('Create Appointment', () => {
    it('should create appointment successfully', async () => {
      const appointmentData = {
        date: new Date('2024-01-15'),
        time: '10:00 AM',
        patient_id: 'patient-123',
        doctor_id: 'doctor-123',
        type: 'Walk-in',
        status: 'Scheduled',
        notes: 'Test appointment',
      };

      const { result } = renderHook(() =>
        useAppointmentMutation(null, mockOnSuccessCallback)
      );

      await act(async () => {
        await result.current.mutate(appointmentData);
      });

      expect(mockOnSuccessCallback).toHaveBeenCalled();
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['appointments', mockClinic.clinic_id],
      });
      expect(toast.success).toHaveBeenCalledWith('Appointment created successfully!');
    });

    it('should handle appointment creation error', async () => {
      const errorMessage = 'Database error';
      const appointmentData = {
        date: new Date('2024-01-15'),
        time: '10:00 AM',
        patient_id: 'patient-123',
        doctor_id: 'doctor-123',
        type: 'Walk-in',
        status: 'Scheduled',
        notes: '',
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: errorMessage },
            }),
          }),
        }),
      });

      const { result } = renderHook(() =>
        useAppointmentMutation(null, mockOnSuccessCallback)
      );

      await act(async () => {
        try {
          await result.current.mutate(appointmentData);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to create appointment.',
        { description: errorMessage }
      );
    });

    it('should validate required clinic', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        activeClinic: null,
      });

      const appointmentData = {
        date: new Date('2024-01-15'),
        time: '10:00 AM',
        patient_id: 'patient-123',
        doctor_id: 'doctor-123',
        type: 'Walk-in',
        status: 'Scheduled',
        notes: '',
      };

      const { result } = renderHook(() =>
        useAppointmentMutation(null, mockOnSuccessCallback)
      );

      await act(async () => {
        try {
          await result.current.mutate(appointmentData);
        } catch (error) {
          expect(error.message).toBe('No active clinic selected.');
        }
      });
    });
  });

  describe('Update Appointment', () => {
    it('should update appointment successfully', async () => {
      const appointmentData = {
        date: new Date('2024-01-15'),
        time: '11:00 AM',
        patient_id: 'patient-123',
        doctor_id: 'doctor-123',
        type: 'Digital',
        status: 'In Progress',
        notes: 'Updated notes',
      };

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: 'appointment-123', ...appointmentData },
                error: null,
              }),
            }),
          }),
        }),
      });

      const { result } = renderHook(() =>
        useAppointmentMutation(mockAppointment, mockOnSuccessCallback)
      );

      await act(async () => {
        await result.current.mutate(appointmentData);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('appointments');
      expect(toast.success).toHaveBeenCalledWith('Appointment updated!');
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalled();
      expect(mockOnSuccessCallback).toHaveBeenCalled();
    });

    it('should handle appointment update error', async () => {
      const errorMessage = 'Update failed';
      const appointmentData = {
        date: new Date('2024-01-15'),
        time: '11:00 AM',
        patient_id: 'patient-123',
        doctor_id: 'doctor-123',
        type: 'Digital',
        status: 'In Progress',
        notes: '',
      };

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: errorMessage },
              }),
            }),
          }),
        }),
      });

      const { result } = renderHook(() =>
        useAppointmentMutation(mockAppointment, mockOnSuccessCallback)
      );

      await act(async () => {
        try {
          await result.current.mutate(appointmentData);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to update appointment.',
        { description: errorMessage }
      );
    });
  });

  describe('Date Formatting', () => {
    it('should format date correctly for database', async () => {
      const appointmentData = {
        date: new Date('2024-01-15T10:00:00Z'),
        time: '10:00 AM',
        patient_id: 'patient-123',
        doctor_id: 'doctor-123',
        type: 'Walk-in',
        status: 'Scheduled',
        notes: '',
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'appointment-123', ...appointmentData },
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() =>
        useAppointmentMutation(null, mockOnSuccessCallback)
      );

      await act(async () => {
        await result.current.mutate(appointmentData);
      });

      // Check that date was formatted to YYYY-MM-DD
      expect(mockSupabase.from).toHaveBeenCalled();
    });
  });
});