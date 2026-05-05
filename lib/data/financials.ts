import { cache } from 'react';
import { createServerSupabase } from '@/integrations/supabase/server';

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
