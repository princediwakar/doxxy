import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PatientModal } from './PatientModal';
import { mockPatient, mockClinic } from '@/__tests__/test-utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('@/integrations/supabase/client', () => ({
  getSupabase: jest.fn(),
}));
jest.mock('sonner');
jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

const mockUseMutation = jest.fn();
const mockUseQueryClient = jest.fn();

describe('PatientModal', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnPatientCreated = jest.fn();

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      activeClinic: mockClinic,
    });

    const { getSupabase } = require('@/integrations/supabase/client');
    getSupabase.mockReturnValue({
      from: jest.fn(),
    });

    mockUseMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    mockUseQueryClient.mockReturnValue({
      invalidateQueries: jest.fn(),
    });

    require('@tanstack/react-query').useMutation = mockUseMutation;
    require('@tanstack/react-query').useQueryClient = mockUseQueryClient;

    jest.clearAllMocks();
  });

  describe('Create Patient', () => {
    it('should render create patient form', () => {
      render(
        <PatientModal
          open={true}
          onOpenChange={mockOnOpenChange}
          patient={null}
          onPatientCreated={mockOnPatientCreated}
        />
      );

      expect(screen.getByText('New Patient')).toBeInTheDocument();
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByText('Create Patient')).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      render(
        <PatientModal
          open={true}
          onOpenChange={mockOnOpenChange}
          patient={null}
          onPatientCreated={mockOnPatientCreated}
        />
      );

      const submitButton = screen.getByText('Create Patient');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters.')).toBeInTheDocument();
      });
    });

    it('should handle successful patient creation', async () => {
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

      render(
        <PatientModal
          open={true}
          onOpenChange={mockOnOpenChange}
          patient={null}
          onPatientCreated={mockOnPatientCreated}
        />
      );

      // Fill form
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'John Doe' },
      });
      fireEvent.click(screen.getByText('Male'));
      fireEvent.change(screen.getByLabelText('Age'), {
        target: { value: '30' },
      });
      fireEvent.change(screen.getByLabelText('Phone'), {
        target: { value: '9876543210' },
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john@example.com' },
      });

      // Submit
      fireEvent.click(screen.getByText('Create Patient'));

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
        const call = mockMutate.mock.calls[0];
        expect(call[0]).toMatchObject({
          name: 'John Doe',
          gender: 'Male',
          age: 30,
          phone: '9876543210',
          email: 'john@example.com',
        });
        expect(call[1]).toMatchObject({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        });
      });
    });

    it('should handle patient creation error', async () => {
      const errorMessage = 'Database error';
      const mockMutate = jest.fn((values, options) => {
        // Simulate error by calling onError
        if (options?.onError) {
          options.onError({ message: errorMessage });
        }
      });

      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      render(
        <PatientModal
          open={true}
          onOpenChange={mockOnOpenChange}
          patient={null}
          onPatientCreated={mockOnPatientCreated}
        />
      );

      // Fill minimal form
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'John Doe' },
      });

      // Submit
      fireEvent.click(screen.getByText('Create Patient'));

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith(
          `Failed to create patient: ${errorMessage}`
        );
      });
    });
  });

  describe('Edit Patient', () => {
    it('should render edit patient form with existing data', () => {
      render(
        <PatientModal
          open={true}
          onOpenChange={mockOnOpenChange}
          patient={mockPatient}
          onPatientCreated={mockOnPatientCreated}
        />
      );

      expect(screen.getByText('Edit Patient')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('30')).toBeInTheDocument();
      expect(screen.getByText('Update Patient')).toBeInTheDocument();
    });

    it('should handle successful patient update', async () => {
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

      render(
        <PatientModal
          open={true}
          onOpenChange={mockOnOpenChange}
          patient={mockPatient}
          onPatientCreated={mockOnPatientCreated}
        />
      );

      // Update name
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'John Smith' },
      });

      // Submit
      fireEvent.click(screen.getByText('Update Patient'));

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
        const call = mockMutate.mock.calls[0];
        expect(call[0]).toMatchObject({
          name: 'John Smith',
        });
        expect(call[1]).toMatchObject({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        });
      });
    });

    it('should handle missing patient ID during update', async () => {
      const patientWithoutId = { ...mockPatient, id: undefined };
      const mockMutate = jest.fn((values, options) => {
        // Simulate error by calling onError
        if (options?.onError) {
          options.onError(new Error('Patient ID is missing for update.'));
        }
      });

      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      render(
        <PatientModal
          open={true}
          onOpenChange={mockOnOpenChange}
          patient={patientWithoutId}
          onPatientCreated={mockOnPatientCreated}
        />
      );

      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'John Smith' },
      });

      fireEvent.click(screen.getByText('Update Patient'));

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to update patient: Patient ID is missing for update.'
        );
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      render(
        <PatientModal
          open={true}
          onOpenChange={mockOnOpenChange}
          patient={null}
          onPatientCreated={mockOnPatientCreated}
        />
      );

      // Fill form with invalid email
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'invalid-email' },
      });

      const submitButton = screen.getByText('Create Patient');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email address.')).toBeInTheDocument();
      });
    });

    it('should validate age range', async () => {
      render(
        <PatientModal
          open={true}
          onOpenChange={mockOnOpenChange}
          patient={null}
          onPatientCreated={mockOnPatientCreated}
        />
      );

      // Fill form with invalid age
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText('Age'), {
        target: { value: '200' }, // Above max
      });

      const submitButton = screen.getByText('Create Patient');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Number must be less than or equal to 150')).toBeInTheDocument();
      });
    });

    it('should auto-capitalize name correctly', async () => {
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

      render(
        <PatientModal
          open={true}
          onOpenChange={mockOnOpenChange}
          patient={null}
          onPatientCreated={mockOnPatientCreated}
        />
      );

      // Test lowercase name
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'john doe' },
      });

      fireEvent.click(screen.getByText('Create Patient'));

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
        const call = mockMutate.mock.calls[0];
        expect(call[0]).toMatchObject({
          name: 'John Doe', // Should be title cased
        });
        expect(call[1]).toMatchObject({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        });
      });
    });
  });

  describe('Clinic Validation', () => {
    it('should show error when no active clinic', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        activeClinic: null,
      });

      const mockMutate = jest.fn((values, options) => {
        // Simulate error by calling onError
        if (options?.onError) {
          options.onError(new Error('No active clinic selected.'));
        }
      });

      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      render(
        <PatientModal
          open={true}
          onOpenChange={mockOnOpenChange}
          patient={null}
          onPatientCreated={mockOnPatientCreated}
        />
      );

      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'John Doe' },
      });

      fireEvent.click(screen.getByText('Create Patient'));

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to create patient: No active clinic selected.'
        );
      });
    });
  });
});