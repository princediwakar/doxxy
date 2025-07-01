
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CompleteProfile from '../src/pages/CompleteProfile';
import TestWrapper from './TestWrapper';

describe('CompleteProfile Page', () => {
  it('renders the complete profile page', () => {
    render(
      <TestWrapper initialLoading={false} mockNeedsProfileCompletion={true}>
        <CompleteProfile />
      </TestWrapper>
    );
    expect(screen.getByText(/Complete Your Profile/i)).toBeInTheDocument();
  });
});
