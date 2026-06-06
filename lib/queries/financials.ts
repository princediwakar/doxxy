'use server';

import { cache } from 'react';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { BillingSummary, PaymentTransaction } from '@/types/billing';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

// --- From lib/data/financials.ts ---

export const getFinancialsData = cache(async (clinicId: string) => {
  const supabase = await createServerSupabase();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const startDate = new Date(currentYear, currentMonth - 13, 1);
  const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

  const { data, error } = await supabase
    .from('bills')
    .select('amount, created_at')
    .eq('clinic_id', clinicId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<{ amount: number; created_at: string }>;
  const monthBuckets = new Map<string, { revenue: number; count: number }>();
  const dailyBuckets = new Map<number, { revenue: number; count: number }>();

  for (const row of rows) {
    const amount = Number(row.amount);
    const date = new Date(row.created_at);
    const mKey = monthKey(date.getFullYear(), date.getMonth() + 1);

    const mBucket = monthBuckets.get(mKey) || { revenue: 0, count: 0 };
    mBucket.revenue += amount;
    mBucket.count++;
    monthBuckets.set(mKey, mBucket);

    if (
      date.getFullYear() === currentYear &&
      date.getMonth() + 1 === currentMonth
    ) {
      const day = date.getDate();
      const dBucket = dailyBuckets.get(day) || { revenue: 0, count: 0 };
      dBucket.revenue += amount;
      dBucket.count++;
      dailyBuckets.set(day, dBucket);
    }
  }

  const currentKey = monthKey(currentYear, currentMonth);
  const prevKey = (() => {
    const d = new Date(currentYear, currentMonth - 2, 1);
    return monthKey(d.getFullYear(), d.getMonth() + 1);
  })();

  const toMonthlyData = (
    key: string,
    bucket: { revenue: number; count: number } | undefined,
  ) => {
    const [y, m] = key.split('-').map(Number);
    return {
      month: key,
      monthLabel: `${MONTH_NAMES[m - 1]} '${String(y).slice(2)}`,
      revenue: bucket?.revenue ?? 0,
      billCount: bucket?.count ?? 0,
      avgBill: bucket?.count ? bucket.revenue / bucket.count : 0,
    };
  };

  const currentMonthData = toMonthlyData(
    currentKey,
    monthBuckets.get(currentKey),
  );
  const previousMonthData = monthBuckets.get(prevKey)
    ? toMonthlyData(prevKey, monthBuckets.get(prevKey))
    : null;

  const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(currentYear, currentMonth - 1 - (11 - i), 1);
    return toMonthlyData(
      monthKey(d.getFullYear(), d.getMonth() + 1),
      monthBuckets.get(monthKey(d.getFullYear(), d.getMonth() + 1)),
    );
  });

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const dailyRevenue = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const bucket = dailyBuckets.get(day);
    return {
      day,
      dayLabel: String(day),
      revenue: bucket?.revenue ?? 0,
      billCount: bucket?.count ?? 0,
    };
  });

  const bestMonthEntry = Array.from(monthBuckets.entries()).sort(
    ([, a], [, b]) => b.revenue - a.revenue,
  )[0];
  const bestMonth = bestMonthEntry
    ? {
        label: toMonthlyData(bestMonthEntry[0], bestMonthEntry[1]).monthLabel,
        revenue: bestMonthEntry[1].revenue,
      }
    : null;

  return {
    monthlyTrend,
    dailyRevenue,
    currentMonth: currentMonthData,
    previousMonth: previousMonthData,
    bestMonth,
    momChanges: {
      revenuePct: previousMonthData
        ? pctChange(currentMonthData.revenue, previousMonthData.revenue)
        : null,
      billCountPct: previousMonthData
        ? pctChange(
            currentMonthData.billCount,
            previousMonthData.billCount,
          )
        : null,
      avgBillPct: previousMonthData
        ? pctChange(currentMonthData.avgBill, previousMonthData.avgBill)
        : null,
    },
  };
});

// --- From lib/data/payments.ts ---

export const getBillingSummary = cache(async (clinicId: string): Promise<BillingSummary> => {
  const supabase = await createServerSupabase();

  const { data: clinicCredits, error: clinicError } = await supabase
    .from('clinic_credits')
    .select('*')
    .eq('clinic_id', clinicId)
    .maybeSingle();

  if (clinicError) throw new Error(clinicError.message);

  const { count: pendingCount, error: countError } = await supabase
    .from('payment_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .eq('payment_status', 'pending');

  if (countError) throw new Error(countError.message);

  return {
    credit_balance: clinicCredits?.credit_balance || 0,
    total_credits_purchased: clinicCredits?.total_credits_purchased || 0,
    total_credits_used: clinicCredits?.total_credits_used || 0,
    pending_payments_count: pendingCount || 0,
  };
});

export const getPaymentTransactions = cache(async (clinicId: string): Promise<PaymentTransaction[]> => {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return (data || []) as unknown as PaymentTransaction[];
});
