
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Consultation from '../src/pages/Consultation';
import TestWrapper from './TestWrapper';

describe('Consultation Page', () => {
  it('renders the consultation page', () => {
    render(
      <TestWrapper>
        <Consultation />
      </TestWrapper>
    );
    expect(screen.getByText(/Appointment not found/i)).toBeInTheDocument();
  });
});
