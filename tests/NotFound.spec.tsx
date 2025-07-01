
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NotFound from '../src/pages/NotFound';
import TestWrapper from './TestWrapper';

describe('NotFound Page', () => {
  it('renders the not found page', () => {
    render(
      <TestWrapper>
        <NotFound />
      </TestWrapper>
    );
    expect(screen.getByText(/Not Found/i)).toBeInTheDocument();
  });
});
