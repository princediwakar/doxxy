import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBilling } from './useBilling';
import { getSupabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { mockPatient, mockAppointment, mockBill, mockClinic } from '@/__tests__/test-utils';

// Mock dependencies
jest.mock('@/integrations/supabase/client');
jest.mock('@/contexts/AuthContext');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
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

describe('useBilling', () => {
  const defaultProps = {
    bill: null,
    patient: null,
    appointment: null,
    mode: 'create' as const,
    open: true,
  };

  beforeEach(() => {
    // Reset all mocks first
    jest.clearAllMocks();

    (getSupabase as jest.Mock).mockReturnValue(mockSupabase);
    (useAuth as jest.Mock).mockReturnValue({
      activeClinic: mockClinic,
    });

    // Set up the React Query mocks
    const reactQuery = require('@tanstack/react-query');
    reactQuery.useQuery = mockUseQuery;
    reactQuery.useMutation = mockUseMutation;
    reactQuery.useQueryClient = mockUseQueryClient;

    mockUseQuery.mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'newInvoiceNumber') {
        return {
          data: 'INV-2024-001',
          isLoading: false,
          error: null,
          refetch: jest.fn(),
        };
      }
      if (queryKey[0] === 'appointments') {
        return {
          data: [mockAppointment],
          isLoading: false,
        };
      }
      if (queryKey[0] === 'patients') {
        return {
          data: [mockPatient],
          isLoading: false,
        };
      }
      if (queryKey[0] === 'doctorFee') {
        return {
          data: null,
          isLoading: false,
        };
      }
      return { data: undefined, isLoading: false };
    });

    mockUseMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    mockUseQueryClient.mockReturnValue({
      invalidateQueries: jest.fn(),
    });
  });

  describe('Initialization', () => {
    it('should initialize form with default values for create mode', () => {
      const { result } = renderHook(() => useBilling(defaultProps));

      expect(result.current.form).toBeDefined();
      expect(result.current.form.getValues()).toEqual(
        expect.objectContaining({
          patient_id: '',
          appointment_id: '',
          invoice_number: '',
          service_items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
        })
      );
    });

    it('should initialize form with bill data for edit mode', () => {
      const props = {
        ...defaultProps,
        bill: mockBill,
        mode: 'edit' as const,
      };

      const { result } = renderHook(() => useBilling(props));

      expect(result.current.form.getValues().invoice_number).toBe('INV-2024-001');
      expect(result.current.form.getValues().patient_id).toBe('patient-123');
    });

    it('should initialize form with patient data when provided', () => {
      const props = {
        ...defaultProps,
        patient: mockPatient,
      };

      const { result } = renderHook(() => useBilling(props));

      expect(result.current.form.getValues().patient_id).toBe('patient-123');
    });

    it('should initialize form with appointment data when provided', () => {
      const props = {
        ...defaultProps,
        appointment: mockAppointment,
      };

      const { result } = renderHook(() => useBilling(props));

      expect(result.current.form.getValues().appointment_id).toBe('appointment-123');
      expect(result.current.form.getValues().patient_id).toBe('patient-123');
    });
  });

  describe('Invoice Number Generation', () => {
    it('should generate invoice number for create mode', async () => {
      // Clear all mocks first
      jest.clearAllMocks();

      // Mock the query to return invoice number immediately
      mockUseQuery.mockImplementation(({ queryKey, enabled }) => {
        if (queryKey[0] === 'newInvoiceNumber') {
          return {
            data: enabled ? 'INV-2024-001' : undefined,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
          };
        }
        // Return default for other queries
        return { data: undefined, isLoading: false };
      });

      const { result } = renderHook(() => useBilling(defaultProps));

      // Wait for the useEffect to set the invoice number
      await waitFor(() => {
        expect(result.current.isLoadingInvoiceNumber).toBe(false);
        expect(result.current.form.getValues().invoice_number).toBe('INV-2024-001');
      }, { timeout: 5000 });
    });

    it('should not generate invoice number for view/edit mode', () => {
      const props = {
        ...defaultProps,
        bill: mockBill,
        mode: 'view' as const,
      };

      mockUseQuery.mockImplementation(({ queryKey, enabled }) => {
        if (queryKey[0] === 'newInvoiceNumber') {
          return {
            data: enabled ? undefined : mockBill.invoice_number,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
          };
        }
        return { data: undefined, isLoading: false };
      });

      const { result } = renderHook(() => useBilling(props));

      expect(result.current.isLoadingInvoiceNumber).toBe(false);
      expect(result.current.form.getValues().invoice_number).toBe('INV-2024-001');
    });

    it('should handle invoice generation failure', () => {
      mockUseQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === 'newInvoiceNumber') {
          return {
            data: undefined,
            isLoading: false,
            error: new Error('Generation failed'),
            refetch: jest.fn(),
          };
        }
        return { data: undefined, isLoading: false };
      });

      const { result } = renderHook(() => useBilling(defaultProps));

      expect(result.current.form.getValues().invoice_number).toBe('');
    });
  });

  describe('Service Item Management', () => {
    it('should add service item', () => {
      const { result } = renderHook(() => useBilling(defaultProps));

      const initialItems = result.current.form.getValues().service_items;
      expect(initialItems).toHaveLength(1);

      act(() => {
        result.current.addServiceItem();
      });

      const updatedItems = result.current.form.getValues().service_items;
      expect(updatedItems).toHaveLength(2);
      expect(updatedItems[1]).toEqual({
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
      });
    });

    it('should remove service item', () => {
      const { result } = renderHook(() => useBilling(defaultProps));

      // Add two items
      act(() => {
        result.current.addServiceItem();
        result.current.addServiceItem();
      });

      expect(result.current.form.getValues().service_items).toHaveLength(3);

      // Remove middle item
      act(() => {
        result.current.removeServiceItem(1);
      });

      const items = result.current.form.getValues().service_items;
      expect(items).toHaveLength(2);
      expect(items[0].description).toBe('');
      expect(items[1].description).toBe('');
    });

    it('should not remove the last service item', () => {
      const { result } = renderHook(() => useBilling(defaultProps));

      act(() => {
        result.current.removeServiceItem(0);
      });

      expect(result.current.form.getValues().service_items).toHaveLength(1);
    });

    it('should update service item and auto-calculate amount', () => {
      const { result } = renderHook(() => useBilling(defaultProps));

      act(() => {
        result.current.updateServiceItem(0, 'description', 'Consultation');
        result.current.updateServiceItem(0, 'quantity', 2);
        result.current.updateServiceItem(0, 'rate', 500);
      });

      const items = result.current.form.getValues().service_items;
      expect(items[0]).toEqual({
        description: 'Consultation',
        quantity: 2,
        rate: 500,
        amount: 1000, // 2 * 500
      });
    });
  });

  describe('Calculation Logic', () => {
    it('should calculate totals correctly', () => {
      const { result } = renderHook(() => useBilling(defaultProps));

      // Update service items
      act(() => {
        result.current.updateServiceItem(0, 'description', 'Service 1');
        result.current.updateServiceItem(0, 'quantity', 2);
        result.current.updateServiceItem(0, 'rate', 500);
      });

      // Add discount and tax
      act(() => {
        result.current.form.setValue('discount_percentage', 10);
        result.current.form.setValue('tax_percentage', 18);
      });

      const totals = result.current.calculateTotals;
      expect(totals.subtotal).toBe(1000); // 2 * 500
      expect(totals.discountAmount).toBe(100); // 10% of 1000
      expect(totals.subtotalAfterDiscount).toBe(900); // 1000 - 100
      expect(totals.taxAmount).toBe(162); // 18% of 900
      expect(totals.total).toBe(1062); // 900 + 162
    });

    it('should handle zero values', () => {
      const { result } = renderHook(() => useBilling(defaultProps));

      const totals = result.current.calculateTotals;
      expect(totals.subtotal).toBe(0);
      expect(totals.discountAmount).toBe(0);
      expect(totals.subtotalAfterDiscount).toBe(0);
      expect(totals.taxAmount).toBe(0);
      expect(totals.total).toBe(0);
    });

    it('should use bill amount in view mode when no service items', () => {
      const props = {
        ...defaultProps,
        bill: mockBill,
        mode: 'view' as const,
      };

      // Clear service items for view mode
      const mockBillWithoutServiceItems = {
        ...mockBill,
        service_items: null,
      };

      mockUseQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === 'newInvoiceNumber') {
          return {
            data: undefined,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
          };
        }
        return { data: undefined, isLoading: false };
      });

      const { result } = renderHook(() => useBilling({
        ...props,
        bill: mockBillWithoutServiceItems,
      }));

      const totals = result.current.calculateTotals;
      expect(totals.subtotal).toBe(1000); // From mockBill.amount
    });
  });

  describe('Bill Creation/Update', () => {
    it('should create bill successfully', async () => {
      const mockMutate = jest.fn((values, options) => {
        // Simulate successful mutation by calling onSuccess
        if (options?.onSuccess) {
          options.onSuccess(values);
        }
      });
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      // Mock invoice number query
      mockUseQuery.mockImplementation(({ queryKey, enabled }) => {
        if (queryKey[0] === 'newInvoiceNumber') {
          return {
            data: enabled ? 'INV-2024-001' : undefined,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
          };
        }
        return { data: undefined, isLoading: false };
      });

      const { result } = renderHook(() => useBilling(defaultProps));

      // Wait for invoice number to be set
      await waitFor(() => {
        expect(result.current.form.getValues().invoice_number).toBe('INV-2024-001');
      });

      // Fill required fields
      act(() => {
        result.current.form.setValue('patient_id', 'patient-123');
        result.current.updateServiceItem(0, 'description', 'Consultation');
        result.current.updateServiceItem(0, 'rate', 1000);
      });

      await act(async () => {
        await result.current.saveBillMutation.mutate(result.current.form.getValues());
      });

      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          patient_id: 'patient-123',
          invoice_number: 'INV-2024-001',
        }),
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Bill created successfully!');
    }, 10000);

    it('should update bill successfully', async () => {
      const props = {
        ...defaultProps,
        bill: mockBill,
        mode: 'edit' as const,
      };

      const mockMutate = jest.fn((values, options) => {
        // Simulate successful mutation by calling onSuccess
        if (options?.onSuccess) {
          options.onSuccess(values);
        }
      });
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      const { result } = renderHook(() => useBilling(props));

      // Update service item
      act(() => {
        result.current.updateServiceItem(0, 'rate', 1500);
      });

      await act(async () => {
        await result.current.saveBillMutation.mutate(result.current.form.getValues());
      });

      expect(mockMutate).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Bill updated successfully!');
    }, 10000);

    it('should handle bill creation error', async () => {
      const errorMessage = 'Database error';
      const mockMutate = jest.fn((values, options) => {
        // Simulate error by calling onError
        if (options?.onError) {
          options.onError(new Error(errorMessage));
        }
      });

      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      const { result } = renderHook(() => useBilling(defaultProps));

      await act(async () => {
        await result.current.saveBillMutation.mutate(result.current.form.getValues());
      });

      expect(mockMutate).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(
        errorMessage || 'Failed to create bill'
      );
    }, 10000);

    it('should validate required clinic', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        activeClinic: null,
      });

      const mockMutate = jest.fn((values, options) => {
        // Simulate error by calling onError
        if (options?.onError) {
          options.onError(new Error('No active clinic selected'));
        }
      });

      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      const { result } = renderHook(() => useBilling(defaultProps));

      await act(async () => {
        await result.current.saveBillMutation.mutate(result.current.form.getValues());
      });

      expect(mockMutate).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(
        'No active clinic selected' || 'Failed to create bill'
      );
    }, 10000);
  });

  describe('Appointment Filtering', () => {
    it('should filter appointments by selected patient', () => {
      const mockAppointments = [
        { ...mockAppointment, id: 'apt-1', patient_id: 'patient-123' },
        { ...mockAppointment, id: 'apt-2', patient_id: 'patient-456' },
      ];

      mockUseQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === 'appointments') {
          return {
            data: mockAppointments,
            isLoading: false,
          };
        }
        return { data: undefined, isLoading: false };
      });

      const { result } = renderHook(() => useBilling(defaultProps));

      // Select patient
      act(() => {
        result.current.form.setValue('patient_id', 'patient-123');
      });

      expect(result.current.appointments).toHaveLength(1);
      expect(result.current.appointments[0].id).toBe('apt-1');
    });

    it('should show all appointments when no patient selected', () => {
      const mockAppointments = [
        { ...mockAppointment, id: 'apt-1', patient_id: 'patient-123' },
        { ...mockAppointment, id: 'apt-2', patient_id: 'patient-456' },
      ];

      mockUseQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === 'appointments') {
          return {
            data: mockAppointments,
            isLoading: false,
          };
        }
        return { data: undefined, isLoading: false };
      });

      const { result } = renderHook(() => useBilling(defaultProps));

      expect(result.current.appointments).toHaveLength(2);
    });
  });

  describe('Doctor Fee Prefill', () => {
    it('should prefill consultation service item with doctor fee', async () => {
      const mockDoctorFee = {
        consultation_fee: 1500,
        doctor_name: 'Dr. Smith',
      };

      // Create appointment with department_name
      const mockAppointmentWithDepartment = {
        ...mockAppointment,
        department_name: 'General Medicine',
      };

      mockUseQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === 'doctorFee') {
          return {
            data: mockDoctorFee,
            isLoading: false,
          };
        }
        if (queryKey[0] === 'appointments') {
          return {
            data: [mockAppointmentWithDepartment],
            isLoading: false,
          };
        }
        return { data: undefined, isLoading: false };
      });

      const props = {
        ...defaultProps,
        appointment: mockAppointmentWithDepartment,
      };

      const { result } = renderHook(() => useBilling(props));

      // Select appointment
      act(() => {
        result.current.form.setValue('appointment_id', 'appointment-123');
      });

      // Wait for the useEffect to prefill the service item
      await waitFor(() => {
        const serviceItems = result.current.form.getValues().service_items;
        expect(serviceItems[0].description).toBe('General Consultation');
        expect(serviceItems[0].rate).toBe(1500);
        expect(serviceItems[0].amount).toBe(1500);
      });
    }, 10000);

    it('should not prefill in view mode', () => {
      const mockDoctorFee = {
        consultation_fee: 1500,
        doctor_name: 'Dr. Smith',
      };

      mockUseQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === 'doctorFee') {
          return {
            data: mockDoctorFee,
            isLoading: false,
          };
        }
        return { data: undefined, isLoading: false };
      });

      const props = {
        ...defaultProps,
        appointment: mockAppointment,
        mode: 'view' as const,
      };

      const { result } = renderHook(() => useBilling(props));

      const serviceItems = result.current.form.getValues().service_items;
      expect(serviceItems[0].description).toBe('');
      expect(serviceItems[0].rate).toBe(0);
    });
  });
});