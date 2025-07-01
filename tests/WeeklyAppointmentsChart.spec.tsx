
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeeklyAppointmentsChart } from '@/components/dashboard/WeeklyAppointmentsChart';
import '@testing-library/jest-dom';

describe('WeeklyAppointmentsChart', () => {
  it('renders no appointments message when no appointments are provided', () => {
    render(<WeeklyAppointmentsChart appointments={[]} />);
    expect(screen.getByText('No appointments this week')).toBeInTheDocument();
  });
});
