import { cache } from 'react';
import { createServerSupabase } from '@/integrations/supabase/server';

export const getBillsByClinic = cache(
  async (clinicId: string, year: number, month: number) => {
    const supabase = await createServerSupabase();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const { data, error } = await supabase
      .from('bills')
      .select('*, patients(name)')
      .eq('clinic_id', clinicId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((b) => {
      const { patients, ...billData } = b as Record<string, unknown> & { patients?: { name?: string } | null };
      return { ...billData, patient_name: patients?.name ?? null };
    });
  },
);

export const getBillingStats = cache(
  async (clinicId: string, year: number, month: number) => {
    const supabase = await createServerSupabase();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const { data, error } = await supabase
      .from('bills')
      .select('amount')
      .eq('clinic_id', clinicId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw new Error(error.message);

    const totalRevenue = (data as { amount: number }[]).reduce(
      (sum, b) => sum + Number(b.amount),
      0,
    );
    return { totalRevenue, totalBills: (data as unknown[]).length };
  },
);

export const getOutstandingBalances = cache(async (clinicId: string) => {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from('bills')
    .select('patient_id, amount, patients(name)')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const byPatient = new Map<
    string,
    { name: string; total: number; count: number }
  >();

  for (const row of (data ?? []) as Array<{
    patient_id: string;
    amount: number;
    patients: { name: string } | null;
  }>) {
    const existing = byPatient.get(row.patient_id);
    if (existing) {
      existing.total += Number(row.amount);
      existing.count++;
    } else {
      byPatient.set(row.patient_id, {
        name: row.patients?.name ?? 'Unknown',
        total: Number(row.amount),
        count: 1,
      });
    }
  }

  return Array.from(byPatient.entries())
    .map(([patient_id, v]) => ({
      patient_id,
      patient_name: v.name,
      total_due: v.total,
      bill_count: v.count,
    }))
    .sort((a, b) => b.total_due - a.total_due);
});
