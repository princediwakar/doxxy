
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SettingsPage from '../src/pages/SettingsPage';
import TestWrapper from './TestWrapper';

describe('SettingsPage Page', () => {
  it('renders the settings page', () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();
  });
});
