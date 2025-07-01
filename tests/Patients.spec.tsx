
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Patients from '../src/pages/Patients';
import TestWrapper from './TestWrapper';

describe('Patients Page', () => {
  it('renders the patients page', () => {
    render(
      <TestWrapper>
        <Patients />
      </TestWrapper>
    );
    expect(screen.getByText(/Please select a clinic to view medical records./i)).toBeInTheDocument();
  });
});
