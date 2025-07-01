
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Profile from '../src/pages/Profile';
import TestWrapper from './TestWrapper';

describe('Profile Page', () => {
  it('renders the profile page', () => {
    render(
      <TestWrapper>
        <Profile />
      </TestWrapper>
    );
    expect(screen.getByText(/Manage your profile information and settings/i)).toBeInTheDocument();
  });
});
