import { createAppointment, updateAppointment, cancelAppointment } from '@/actions/appointments';
import { createServerSupabase } from '@/integrations/supabase/server';
import { revalidatePath } from 'next/cache';

jest.mock('@/integrations/supabase/server');

const mockSupabase = createServerSupabase as jest.Mock;
const mockRevalidatePath = revalidatePath as jest.Mock;

describe('createAppointment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validAppointment = {
    patient_id: 'patient-1',
    clinic_id: 'clinic-1',
    doctor_id: 'doctor-1',
    date: '2026-05-20',
    time: '10:00',
    type: 'Walk-in' as const,
    status: 'Scheduled' as const,
  };

  function mockInsert(error: unknown = null) {
    const insert = jest.fn(() => Promise.resolve({ error }));
    const from = jest.fn(() => ({ insert }));
    mockSupabase.mockResolvedValue({ from });
    return { insert, from };
  }

  it('inserts an appointment, revalidates /schedule, and returns success', async () => {
    const { insert, from } = mockInsert(null);

    const result = await createAppointment(validAppointment);

    expect(result).toEqual({ success: true });
    expect(from).toHaveBeenCalledWith('appointments');
    expect(insert).toHaveBeenCalledWith(validAppointment);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/schedule');
  });

  it('returns { error } when insert fails', async () => {
    mockInsert({ message: 'slot taken' });

    const result = await createAppointment(validAppointment);

    expect(result).toEqual({ error: 'slot taken' });
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });
});

describe('updateAppointment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates an appointment and returns success', async () => {
    const eq = jest.fn(() => Promise.resolve({ error: null }));
    const update = jest.fn(() => ({ eq }));
    const from = jest.fn(() => ({ update }));
    mockSupabase.mockResolvedValue({ from });

    const result = await updateAppointment('apt-1', { status: 'Cancelled' });

    expect(result).toEqual({ success: true });
    expect(from).toHaveBeenCalledWith('appointments');
  });
});

describe('cancelAppointment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets status to Cancelled, revalidates, and returns success', async () => {
    const eq = jest.fn(() => Promise.resolve({ error: null }));
    const update = jest.fn(() => ({ eq }));
    const from = jest.fn(() => ({ update }));
    mockSupabase.mockResolvedValue({ from });

    const result = await cancelAppointment('apt-1');

    expect(result).toEqual({ success: true });
    expect(update).toHaveBeenCalledWith({ status: 'Cancelled' });
    expect(mockRevalidatePath).toHaveBeenCalledWith('/schedule');
  });

  it('returns { error } when the update fails', async () => {
    const eq = jest.fn(() => Promise.resolve({ error: { message: 'gone' } }));
    const update = jest.fn(() => ({ eq }));
    const from = jest.fn(() => ({ update }));
    mockSupabase.mockResolvedValue({ from });

    const result = await cancelAppointment('apt-1');

    expect(result).toEqual({ error: 'gone' });
  });
});
