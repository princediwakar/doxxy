
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Auth from '../src/pages/Auth';
import TestWrapper from './TestWrapper';

describe('Auth Page', () => {
  it('renders the auth page', () => {
    render(
      <TestWrapper>
        <Auth />
      </TestWrapper>
    );
    expect(screen.getByText(/Enter your credentials to log in/i)).toBeInTheDocument();
  });
});
