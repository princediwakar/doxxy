import { saveBill, generateInvoiceNumber } from '@/actions/billing';
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
    invoice_number: 'INV-000001',
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
    mockSupabase.mockResolvedValue({ from });
    return { from, insert, single };
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

  it('creates a bill in "create" mode and returns the row', async () => {
    const { from, insert } = mockCreateChain(null, { id: 'bill-1', ...billData });

    const result = await saveBill('create', billData);

    expect(result).toEqual({ success: true, data: { id: 'bill-1', ...billData } });
    expect(from).toHaveBeenCalledWith('bills');
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ amount: 500 }));
    expect(revalidatePath as jest.Mock).toHaveBeenCalledWith('/schedule');
  });

  it('returns { error } when create insert fails', async () => {
    mockCreateChain({ message: 'invoice number exists' });

    const result = await saveBill('create', billData);

    expect(result).toEqual({ error: 'invoice number exists' });
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

describe('generateInvoiceNumber', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the database RPC when available', async () => {
    const rpc = jest.fn(() => Promise.resolve({ data: 'INV-000042', error: null }));
    mockSupabase.mockResolvedValue({ rpc });

    const result = await generateInvoiceNumber('clinic-1');

    expect(result).toEqual({ data: 'INV-000042' });
    expect(rpc).toHaveBeenCalledWith('generate_invoice_number', { clinic_id_arg: 'clinic-1' });
  });

  it('falls back to incrementing the latest invoice number when RPC is unavailable', async () => {
    const rpc = jest.fn(() => Promise.reject(new Error('no RPC')));
    const maybeSingle = jest.fn(() =>
      Promise.resolve({ data: { invoice_number: 'INV000005' }, error: null }),
    );
    const limit = jest.fn(() => ({ maybeSingle }));
    const order = jest.fn(() => ({ limit }));
    const eq = jest.fn(() => ({ order }));
    const select = jest.fn(() => ({ eq }));
    const from = jest.fn(() => ({ select }));
    mockSupabase.mockResolvedValue({ rpc, from });

    const result = await generateInvoiceNumber('clinic-1');

    expect(result).toEqual({ data: 'INV000006' });
  });

  it('falls back to clinic-prefix generation as last resort', async () => {
    const rpc = jest.fn(() => Promise.reject(new Error('no RPC')));
    const maybeSingle = jest.fn(() =>
      Promise.resolve({ data: null, error: null }),
    );
    const limit = jest.fn(() => ({ maybeSingle }));
    const order = jest.fn(() => ({ limit }));
    const eq = jest.fn(() => ({ order }));
    const select = jest.fn(() => ({ eq }));
    const billsFrom = jest.fn(() => ({ select }));

    const clinicSingle = jest.fn(() =>
      Promise.resolve({ data: { name: 'Doxxy Clinic' }, error: null }),
    );
    const clinicEq = jest.fn(() => ({ single: clinicSingle }));
    const clinicSelect = jest.fn(() => ({ eq: clinicEq }));
    const clinicsFrom = jest.fn(() => ({ select: clinicSelect }));

    mockSupabase.mockResolvedValue({
      rpc,
      from: jest.fn((table: string) => {
        if (table === 'bills') return billsFrom();
        if (table === 'clinics') return clinicsFrom();
        return { select: jest.fn() };
      }),
    });

    const result = await generateInvoiceNumber('clinic-1');

    expect(result.data).toMatch(/^D\d{10}$/);
  });
});
