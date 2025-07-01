
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Billing from '../src/pages/Billing';
import TestWrapper from './TestWrapper';

describe('Billing Page', () => {
  it('renders the billing page', () => {
    render(
      <TestWrapper>
        <Billing />
      </TestWrapper>
    );
    expect(screen.getByText(/Billing/i)).toBeInTheDocument();
  });
});
