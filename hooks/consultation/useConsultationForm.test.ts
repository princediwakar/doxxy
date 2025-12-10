import { renderHook, act, waitFor } from '@testing-library/react';
import { useConsultationForm } from './useConsultationForm';
import { getSupabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { mockAppointment, mockConsultation, mockClinic, mockUser } from '@/__tests__/test-utils';

// Mock dependencies
jest.mock('@/integrations/supabase/client');
jest.mock('@/contexts/AuthContext');
jest.mock('@/hooks/use-toast');
jest.mock('@/lib/consultationNotesSchemas', () => ({
  consultationNotesSchema: {},
  getMandatoryFieldsForDepartment: jest.fn(),
}));
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

const mockSupabase = {
  from: jest.fn(),
  rpc: jest.fn(),
};

const mockUseQuery = jest.fn();
const mockUseMutation = jest.fn();
const mockUseQueryClient = jest.fn();

describe('useConsultationForm', () => {
  const defaultParams = {
    appointmentId: 'appointment-123',
    appointment: mockAppointment,
    existingConsultation: mockConsultation,
    departmentType: 'General',
  };

  beforeEach(() => {
    (getSupabase as jest.Mock).mockReturnValue(mockSupabase);
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      activeClinic: mockClinic,
      hasDoctorProfile: true,
    });

    const { getMandatoryFieldsForDepartment } = require('@/lib/consultationNotesSchemas');
    getMandatoryFieldsForDepartment.mockReturnValue(['chief_complaint', 'history_of_present_illness']);

    require('@tanstack/react-query').useQuery = mockUseQuery;
    require('@tanstack/react-query').useMutation = mockUseMutation;
    require('@tanstack/react-query').useQueryClient = mockUseQueryClient;

    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
    });

    mockUseMutation.mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      isPending: false,
    });

    mockUseQueryClient.mockReturnValue({
      invalidateQueries: jest.fn(),
    });

    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize form with existing consultation data', () => {
      const { result } = renderHook(() => useConsultationForm(defaultParams));

      expect(result.current.form).toBeDefined();
      expect(result.current.isConsultationCompleted).toBe(false);
      expect(result.current.canEditConsultation).toBe(true);
    });

    it('should mark consultation as completed if appointment status is Completed', () => {
      const completedAppointment = {
        ...mockAppointment,
        status: 'Completed' as const,
      };

      const { result } = renderHook(() =>
        useConsultationForm({
          ...defaultParams,
          appointment: completedAppointment,
        })
      );

      expect(result.current.isConsultationCompleted).toBe(true);
    });

    it('should allow editing for assigned doctor', () => {
      const assignedDoctor = { ...mockUser, id: 'user-123' };
      (useAuth as jest.Mock).mockReturnValue({
        user: assignedDoctor,
        activeClinic: mockClinic,
        hasDoctorProfile: true,
      });

      mockUseQuery.mockReturnValue({
        data: { user_id: 'user-123' }, // Same as assignedDoctor.id
        isLoading: false,
      });

      const { result } = renderHook(() => useConsultationForm(defaultParams));

      expect(result.current.canEditConsultation).toBe(true);
    });

    it('should not allow editing for non-assigned users', () => {
      const differentUser = { ...mockUser, id: 'user-456' };
      (useAuth as jest.Mock).mockReturnValue({
        user: differentUser,
        activeClinic: { ...mockClinic, role: 'staff' },
        hasDoctorProfile: false,
      });

      mockUseQuery.mockReturnValue({
        data: { user_id: 'user-123' }, // Different from current user
        isLoading: false,
      });

      const { result } = renderHook(() => useConsultationForm(defaultParams));

      expect(result.current.canEditConsultation).toBe(false);
    });
  });

  describe('Auto-save', () => {
    it('should auto-save when form values change', async () => {
      const mockMutate = jest.fn();
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: jest.fn(),
        isPending: false,
      });

      const { result } = renderHook(() => useConsultationForm(defaultParams));

      // Simulate form value change
      act(() => {
        result.current.form.setValue('specialty_data.chief_complaint', 'Updated complaint');
      });

      // Wait for auto-save debounce
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should not auto-save when editing is not allowed', () => {
      const differentUser = { ...mockUser, id: 'user-456' };
      (useAuth as jest.Mock).mockReturnValue({
        user: differentUser,
        activeClinic: { ...mockClinic, role: 'staff' },
        hasDoctorProfile: false,
      });

      mockUseQuery.mockReturnValue({
        data: { user_id: 'user-123' },
        isLoading: false,
      });

      const mockMutate = jest.fn();
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: jest.fn(),
        isPending: false,
      });

      const { result } = renderHook(() => useConsultationForm(defaultParams));

      act(() => {
        result.current.form.setValue('specialty_data.chief_complaint', 'Updated complaint');
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe('Mandatory Field Validation', () => {
    it('should detect missing mandatory fields', () => {
      // Create a consultation with empty mandatory fields
      const emptyConsultation = {
        ...mockConsultation,
        specialty_data: {
          ...mockConsultation.specialty_data,
          chief_complaint: '',
          history_of_present_illness: '',
        },
      };

      const { result } = renderHook(() =>
        useConsultationForm({
          ...defaultParams,
          existingConsultation: emptyConsultation,
        })
      );

      const errors = result.current.validateMandatoryFields();
      expect(errors).toEqual(['Chief Complaint', 'History Of Present Illness']);
    });

    it('should return empty array when all mandatory fields are filled', () => {
      const { result } = renderHook(() => useConsultationForm(defaultParams));

      const errors = result.current.validateMandatoryFields();
      expect(errors).toEqual([]);
    });

    it('should validate prescription fields', () => {
      // Mock to include prescriptions in mandatory fields
      const { getMandatoryFieldsForDepartment } = require('@/lib/consultationNotesSchemas');
      getMandatoryFieldsForDepartment.mockReturnValue(['prescriptions']);

      const { result } = renderHook(() => useConsultationForm(defaultParams));

      // Add empty prescription
      act(() => {
        result.current.form.setValue('specialty_data.prescriptions', [
          { name: '', dosage: '', frequency: '', duration: '' },
        ]);
      });

      const errors = result.current.validateMandatoryFields();
      expect(errors).toContain('Prescriptions');
    });

    it('should accept valid prescriptions', () => {
      // Mock to include prescriptions in mandatory fields
      const { getMandatoryFieldsForDepartment } = require('@/lib/consultationNotesSchemas');
      getMandatoryFieldsForDepartment.mockReturnValue(['prescriptions']);

      const { result } = renderHook(() => useConsultationForm(defaultParams));

      // Add valid prescription
      act(() => {
        result.current.form.setValue('specialty_data.prescriptions', [
          { name: 'Paracetamol', dosage: '500mg', frequency: 'BD', duration: '5 days' },
        ]);
      });

      const errors = result.current.validateMandatoryFields();
      expect(errors).not.toContain('Prescriptions');
    });
  });

  describe('Consultation Completion', () => {
    it('should complete consultation successfully', async () => {
      const mockMutateAsync = jest.fn().mockResolvedValue(mockConsultation);
      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: [{ ...mockAppointment, status: 'Completed' }],
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const { result } = renderHook(() => useConsultationForm(defaultParams));

      // Fill mandatory fields
      act(() => {
        result.current.form.setValue('specialty_data.chief_complaint', 'Headache');
        result.current.form.setValue('specialty_data.history_of_present_illness', 'Started 2 days ago');
      });

      await act(async () => {
        await result.current.handleCompleteConsultation();
      });

      expect(mockMutateAsync).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('appointments');
      expect(mockSupabase.rpc).toHaveBeenCalledWith('deduct_appointment_credit', expect.any(Object));
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Consultation Completed',
          description: 'The consultation has been marked as complete.',
        })
      );
    });

    it('should validate mandatory fields before completion', async () => {
      // Create a consultation with empty mandatory fields
      const emptyConsultation = {
        ...mockConsultation,
        specialty_data: {
          ...mockConsultation.specialty_data,
          chief_complaint: '',
          history_of_present_illness: '',
        },
      };

      const { result } = renderHook(() =>
        useConsultationForm({
          ...defaultParams,
          existingConsultation: emptyConsultation,
        })
      );

      await act(async () => {
        await result.current.handleCompleteConsultation();
      });

      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Mandatory Fields Missing',
          variant: 'destructive',
        })
      );
    });

    it('should handle completion error', async () => {
      const errorMessage = 'Database error';
      const mockMutateAsync = jest.fn().mockRejectedValue(new Error(errorMessage));
      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      const { result } = renderHook(() => useConsultationForm(defaultParams));

      // Fill mandatory fields
      act(() => {
        result.current.form.setValue('specialty_data.chief_complaint', 'Headache');
        result.current.form.setValue('specialty_data.history_of_present_illness', 'Started 2 days ago');
      });

      await act(async () => {
        await result.current.handleCompleteConsultation();
      });

      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Completion Failed',
          variant: 'destructive',
        })
      );
    });

    it('should handle credit deduction failure gracefully', async () => {
      const mockMutateAsync = jest.fn().mockResolvedValue(mockConsultation);
      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: [{ ...mockAppointment, status: 'Completed' }],
              error: null,
            }),
          }),
        }),
      });

      const deductError = new Error('Credit deduction failed');
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: deductError,
      });

      const { result } = renderHook(() => useConsultationForm(defaultParams));

      // Fill mandatory fields
      act(() => {
        result.current.form.setValue('specialty_data.chief_complaint', 'Headache');
        result.current.form.setValue('specialty_data.history_of_present_illness', 'Started 2 days ago');
      });

      await act(async () => {
        await result.current.handleCompleteConsultation();
      });

      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Consultation Completed',
          description: 'Consultation marked as complete, but credit deduction failed. Please check billing.',
        })
      );
    });
  });

  describe('Manual Save', () => {
    it('should save consultation manually', () => {
      const mockMutate = jest.fn();
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: jest.fn(),
        isPending: false,
      });

      const { result } = renderHook(() => useConsultationForm(defaultParams));

      // Make a change to trigger save
      act(() => {
        result.current.form.setValue('specialty_data.chief_complaint', 'Updated complaint');
        result.current.handleSave();
      });

      expect(mockMutate).toHaveBeenCalled();
    });

    it('should not save when editing is not allowed', () => {
      const differentUser = { ...mockUser, id: 'user-456' };
      (useAuth as jest.Mock).mockReturnValue({
        user: differentUser,
        activeClinic: { ...mockClinic, role: 'staff' },
        hasDoctorProfile: false,
      });

      mockUseQuery.mockReturnValue({
        data: { user_id: 'user-123' },
        isLoading: false,
      });

      const mockMutate = jest.fn();
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: jest.fn(),
        isPending: false,
      });

      const { result } = renderHook(() => useConsultationForm(defaultParams));

      act(() => {
        result.current.handleSave();
      });

      expect(mockMutate).not.toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Cannot Save',
          variant: 'destructive',
        })
      );
    });
  });

  describe('Real-time Validation Status', () => {
    it('should provide real-time validation status', () => {
      // Create a consultation with empty mandatory fields
      const emptyConsultation = {
        ...mockConsultation,
        specialty_data: {
          ...mockConsultation.specialty_data,
          chief_complaint: '',
          history_of_present_illness: '',
        },
      };

      const { result } = renderHook(() =>
        useConsultationForm({
          ...defaultParams,
          existingConsultation: emptyConsultation,
        })
      );

      const status = result.current.mandatoryFieldsStatus;
      expect(status).toEqual({
        completed: 0,
        total: 2,
        allCompleted: false,
        isValid: false,
        errors: ['Chief Complaint', 'History Of Present Illness'],
        missingFields: 2,
        validationMessage: 'Missing required fields: Chief Complaint, History Of Present Illness',
      });
    });

    it('should update validation status when fields are filled', () => {
      // Create a consultation with empty mandatory fields
      const emptyConsultation = {
        ...mockConsultation,
        specialty_data: {
          ...mockConsultation.specialty_data,
          chief_complaint: '',
          history_of_present_illness: '',
        },
      };

      const { result } = renderHook(() =>
        useConsultationForm({
          ...defaultParams,
          existingConsultation: emptyConsultation,
        })
      );

      // Fill one mandatory field
      act(() => {
        result.current.form.setValue('specialty_data.chief_complaint', 'Headache');
      });

      const status = result.current.mandatoryFieldsStatus;
      expect(status.completed).toBe(1);
      expect(status.missingFields).toBe(1);
    });
  });
});