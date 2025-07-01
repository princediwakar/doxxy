
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CreateClinicPage from '../src/pages/CreateClinicPage';
import TestWrapper from './TestWrapper';

describe('CreateClinicPage Page', () => {
  it('renders the create clinic page', () => {
    render(
      <TestWrapper>
        <CreateClinicPage />
      </TestWrapper>
    );
    expect(screen.getByText(/Create New Clinic/i)).toBeInTheDocument();
  });
});
