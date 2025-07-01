
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Dashboard from '../src/pages/Dashboard';
import TestWrapper from './TestWrapper';

describe('Dashboard Page', () => {
  it('renders the dashboard page', () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );
    expect(screen.getByText(/Good morning, Test User/i)).toBeInTheDocument();
  });
});
