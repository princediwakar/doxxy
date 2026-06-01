import { saveBill } from '@/actions/billing';
import { createServerSupabase } from '@/integrations/supabase/server';
import { revalidatePath } from 'next/cache';

jest.mock('@/integrations/supabase/server');

const mockSupabase = createServerSupabase as jest.Mock;

describe('saveBill', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const billData = {
    patient_id: 'patient-1',
    appointment_id: 'apt-1',
    clinic_id: 'clinic-1',
    amount: 500,
    description: 'Consultation fee',
    service_items: {},
    discount_percentage: 0,
    tax_percentage: 18,
    notes: 'Paid',
  };

  function mockCreateChain(error: unknown = null, data: unknown = { id: 'bill-1' }) {
    const single = jest.fn(() => Promise.resolve({ data, error }));
    const select = jest.fn(() => ({ single }));
    const insert = jest.fn(() => ({ select }));
    const from = jest.fn(() => ({ insert }));
    const rpc = jest.fn(() => Promise.resolve({ data: 'INV-000042', error: null }));
    mockSupabase.mockResolvedValue({ from, rpc });
    return { from, insert, single, rpc };
  }

  function mockEditChain(error: unknown = null, data: unknown = { id: 'bill-1' }) {
    const single = jest.fn(() => Promise.resolve({ data, error }));
    const select = jest.fn(() => ({ single }));
    const eq = jest.fn(() => ({ select }));
    const update = jest.fn(() => ({ eq }));
    const from = jest.fn(() => ({ update }));
    mockSupabase.mockResolvedValue({ from });
    return { from, update, eq, single };
  }

  it('creates a bill in "create" mode with a generated invoice number', async () => {
    const { from, insert, rpc } = mockCreateChain(null, { id: 'bill-1', ...billData });

    const result = await saveBill('create', billData);

    expect(result).toEqual({ success: true, data: { id: 'bill-1', ...billData } });
    expect(rpc).toHaveBeenCalledWith('generate_invoice_number', { clinic_id_arg: 'clinic-1' });
    expect(from).toHaveBeenCalledWith('bills');
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      amount: 500,
      invoice_number: 'INV-000042',
    }));
    expect(revalidatePath as jest.Mock).toHaveBeenCalledWith('/schedule');
  });

  it('returns { error } when create insert fails', async () => {
    const chains = mockCreateChain({ message: 'invoice number exists' });

    const result = await saveBill('create', billData);

    expect(result).toEqual({ error: 'invoice number exists' });
    expect(chains.rpc).toHaveBeenCalled();
  });

  it('updates a bill in "edit" mode with a billId', async () => {
    const { from, update } = mockEditChain(null, { id: 'bill-1', amount: 600 });

    const result = await saveBill('edit', { ...billData, amount: 600 }, 'bill-1');

    expect(result).toEqual({ success: true, data: { id: 'bill-1', amount: 600 } });
    expect(from).toHaveBeenCalledWith('bills');
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ amount: 600 }));
    expect(revalidatePath as jest.Mock).toHaveBeenCalledWith('/schedule');
  });

  it('returns { error } when edit update fails', async () => {
    mockEditChain({ message: 'not found' });

    const result = await saveBill('edit', billData, 'bill-1');

    expect(result).toEqual({ error: 'not found' });
  });
});
