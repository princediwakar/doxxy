"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { FileText } from "lucide-react";
import type { MonthlyData, DailyData } from "@/hooks/useFinancialsData";

export function RevenueChart({ data }: { data: MonthlyData[] }) {
  const chartData = useMemo(() =>
    data.map((m) => ({
      ...m,
      fill: m.month === data[data.length - 1]?.month ? "var(--color-primary, #0080ff)" : "#94a3b8",
    })),
    [data]
  );

  if (data.every((m) => m.revenue === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <FileText className="w-10 h-10 mb-2 opacity-40" />
        <p className="text-sm">No revenue data yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v))}
        />
        <Tooltip
          formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
          labelStyle={{ fontWeight: 600 }}
        />
        <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DailyRevenueChart({ data }: { data: DailyData[] }) {
  const hasData = data.some((d) => d.revenue > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <FileText className="w-6 h-6 mb-1 opacity-40" />
        <p className="text-xs">No bills this month yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <XAxis dataKey="dayLabel" tick={{ fontSize: 9 }} tickLine={false} interval={Math.max(Math.floor(data.length / 8), 1)} />
        <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={32}
          tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v))}
        />
        <Tooltip
          formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
        />
        <Bar dataKey="revenue" fill="var(--color-primary, #0080ff)" radius={[2, 2, 0, 0]} maxBarSize={8} />
      </BarChart>
    </ResponsiveContainer>
  );
}
