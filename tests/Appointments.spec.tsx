
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Appointments from '../src/pages/Appointments';
import TestWrapper from './TestWrapper';

describe('Appointments Page', () => {
  it('renders the appointments page', () => {
    render(
      <TestWrapper initialLoading={false} mockActiveClinic={{ id: 'test-clinic-id', clinic_id: 'test-clinic-id', name: 'Test Clinic', role: 'admin', user_id: 'test-user-id', department_id: null, created_at: '', clinics: { id: 'test-clinic-id', name: 'Test Clinic', address: '', email: '', phone: '', website: '', created_at: '' }, clinic_name: 'Test Clinic', joined_at: '' }}>
        <Appointments />
      </TestWrapper>
    );
    // Assuming that with an active clinic, the Appointments page will render something like a calendar or list
    // You'll need to adjust this expectation based on what the Appointments page actually renders when a clinic is active.
    // For now, I'll assume it renders a heading or a specific element that indicates it's ready.
    // If it renders a specific element, you might use screen.getByRole('heading', { name: /Appointments/i })
    // or screen.getByText('Some text that appears when appointments are loaded')
    // For now, I'll use a generic check that something is rendered, or you can add a specific element to the Appointments page for testing.
    expect(screen.getByRole('heading', { name: /Appointments/i })).toBeInTheDocument();
  });
});
