"use client";

import { RevenueChart, DailyRevenueChart } from "@/components/financials/RevenueChart";
import { Card, CardContent } from "@/components/ui/card";
import { IndianRupee, TrendingUp, TrendingDown, FileText, Users, Minus } from "lucide-react";

type MonthlyData = {
  month: string;
  monthLabel: string;
  revenue: number;
  billCount: number;
  avgBill: number;
};

type DailyData = {
  day: number;
  dayLabel: string;
  revenue: number;
  billCount: number;
};

type FinancialsData = {
  monthlyTrend: MonthlyData[];
  dailyRevenue: DailyData[];
  currentMonth: MonthlyData | null;
  previousMonth: MonthlyData | null;
  bestMonth: { label: string; revenue: number } | null;
  momChanges: {
    revenuePct: number | null;
    billCountPct: number | null;
    avgBillPct: number | null;
  };
};

function TrendBadge({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const isUp = pct > 0;
  const isDown = pct < 0;
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const cls = isUp ? "text-emerald-600" : isDown ? "text-red-500" : "text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${cls}`}>
      <Icon className="w-3 h-3" />{Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function fmt(n: number): string {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
}

type StatDef = {
  label: string;
  value: string;
  detail: React.ReactNode;
  icon: React.ElementType;
  color: string;
};

export default function FinancialsPageClient({ data }: { data: FinancialsData }) {
  const { currentMonth, monthlyTrend, dailyRevenue, bestMonth, momChanges } = data;

  const stats: StatDef[] = [
    {
      label: "This Month", value: fmt(currentMonth?.revenue ?? 0),
      detail: <TrendBadge pct={momChanges.revenuePct} />,
      icon: IndianRupee, color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Bill Count", value: String(currentMonth?.billCount ?? 0),
      detail: <TrendBadge pct={momChanges.billCountPct} />,
      icon: FileText, color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Avg Bill", value: fmt(currentMonth?.avgBill ?? 0),
      detail: <TrendBadge pct={momChanges.avgBillPct} />,
      icon: TrendingUp, color: "bg-violet-50 text-violet-600",
    },
    {
      label: "Best Month", value: bestMonth?.label ?? "—",
      detail: bestMonth ? <span className="text-xs">{fmt(bestMonth.revenue)}</span> : null,
      icon: Users, color: "bg-amber-50 text-amber-600",
    },
  ];

  const activeMonths = monthlyTrend.filter((m) => m.revenue > 0);
  const monthlyAvg = activeMonths.length > 0
    ? monthlyTrend.reduce((s, m) => s + m.revenue, 0) / activeMonths.length
    : 0;
  const avgBills = activeMonths.length > 0
    ? Math.round(monthlyTrend.reduce((s, m) => s + m.billCount, 0) / activeMonths.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
          <IndianRupee className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Financials</h1>
          <p className="hidden sm:block text-muted-foreground">Revenue trends and analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-bold">{s.value}</p>
                    {s.detail}
                  </div>
                  <div className={`p-3 rounded-lg ${s.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Revenue Trend</h3>
              <p className="text-sm text-muted-foreground">Last 12 months</p>
            </div>
          </div>
          <RevenueChart data={monthlyTrend} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Daily Revenue</h3>
            <p className="text-xs text-muted-foreground -mt-2 mb-3">
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
            <DailyRevenueChart data={dailyRevenue} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">At a Glance</h3>
            <div className="space-y-4">
              {[
                ["Monthly Avg Revenue", fmt(monthlyAvg)],
                ["Avg Bills / Month", String(avgBills)],
                ["Best Month", bestMonth ? `${bestMonth.label} (${fmt(bestMonth.revenue)})` : "—"],
                ["Months with Revenue", `${activeMonths.length} of 12`],
              ].map(([label, value]) => (
                <div key={label as string} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
