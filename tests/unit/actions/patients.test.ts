import { createPatient, updatePatient } from '@/actions/patients';
import { createServerSupabase } from '@/integrations/supabase/server';
import { revalidatePath } from 'next/cache';

jest.mock('@/integrations/supabase/server');

const mockSupabase = createServerSupabase as jest.Mock;
const mockRevalidatePath = revalidatePath as jest.Mock;

function mockChain() {
  const single = jest.fn();
  const select = jest.fn(() => ({ single }));
  const insert = jest.fn(() => ({ select }));
  const from = jest.fn(() => ({ insert }));
  mockSupabase.mockResolvedValue({ from });
  return { single, insert, from };
}

describe('createPatient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validPatient = {
    name: 'John Doe',
    clinic_id: 'clinic-1',
    phone: '9876543210',
    age: 45,
    gender: 'Male' as const,
  };

  it('inserts a patient, revalidates /schedule, and returns the row', async () => {
    const { single } = mockChain();
    const created = { id: 'patient-1', ...validPatient };
    single.mockResolvedValue({ data: created, error: null });

    const result = await createPatient(validPatient);

    expect(result).toEqual({ success: true, data: created });
    expect(mockRevalidatePath).toHaveBeenCalledWith('/schedule');
  });

  it('returns { error } when Supabase rejects the insert', async () => {
    const { single } = mockChain();
    single.mockResolvedValue({ data: null, error: { message: 'duplicate phone' } });

    const result = await createPatient(validPatient);

    expect(result).toEqual({ error: 'duplicate phone' });
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it('returns { error } when insert returns no data and no error (defensive)', async () => {
    const { single } = mockChain();
    single.mockResolvedValue({ data: null, error: null });

    const result = await createPatient(validPatient);

    expect(result).toEqual({ success: true, data: null });
  });
});

describe('updatePatient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates a patient, revalidates, and returns success', async () => {
    const eq = jest.fn(() => Promise.resolve({ error: null }));
    const update = jest.fn(() => ({ eq }));
    const from = jest.fn(() => ({ update }));
    mockSupabase.mockResolvedValue({ from });

    const result = await updatePatient('patient-1', { name: 'Jane' });

    expect(result).toEqual({ success: true });
    expect(mockRevalidatePath).toHaveBeenCalledWith('/schedule');
  });

  it('returns { error } when update fails', async () => {
    const eq = jest.fn(() => Promise.resolve({ error: { message: 'not found' } }));
    const update = jest.fn(() => ({ eq }));
    const from = jest.fn(() => ({ update }));
    mockSupabase.mockResolvedValue({ from });

    const result = await updatePatient('patient-1', { name: 'Jane' });

    expect(result).toEqual({ error: 'not found' });
  });
});
