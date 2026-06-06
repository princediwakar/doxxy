"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import React, { useMemo } from "react";
import { useTheme } from "next-themes";
import { format, startOfWeek, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Calendar } from "lucide-react";
import type { DailyBreakdown, WeeklyAppointmentsChartProps } from "@/types/dashboard";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DailyBreakdown & { name: string } }>;
  label?: string;
}

const CustomTooltip = React.memo(({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{data.date}</p>
        <div className="mt-1 space-y-0.5 text-sm">
          <p className="text-green-600 dark:text-green-400">Completed: {data.completed}</p>
          <p className="text-muted-foreground">Pending: {data.pending}</p>
          <p className="text-red-500 dark:text-red-400">No-Shows: {data.no_shows}</p>
          <p className="text-amber-500 dark:text-amber-400">Cancelled: {data.cancelled}</p>
          <p className="font-medium">Total: {data.total}</p>
        </div>
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = "CustomTooltip";

const CustomCursor = ({ x, y, width, height, isDark }: { x?: number; y?: number; width?: number; height?: number; isDark: boolean }) => {
  if (x === undefined || y === undefined || width === undefined || height === undefined) {
    return null;
  }
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"}
      rx={4}
    />
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
    <Calendar size={48} className="mb-4 opacity-50" />
    <p className="text-sm">No appointments in this period</p>
    <p className="text-xs mt-1">Chart will update when appointments are scheduled</p>
  </div>
);

export const WeeklyAppointmentsChart = React.memo(function WeeklyAppointmentsChart({
  appointments,
  data,
  onBarClick,
  loading = false,
}: WeeklyAppointmentsChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const chartData: DailyBreakdown[] = useMemo(() => {
    if (data) return data;
    if (appointments) {
      const map = new Map<string, DailyBreakdown>();
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      for (let i = 0; i < 7; i++) {
        const d = addDays(weekStart, i);
        const key = format(d, "yyyy-MM-dd");
        map.set(key, {
          date: key,
          completed: 0,
          pending: 0,
          no_shows: 0,
          cancelled: 0,
          total: 0,
        });
      }
      appointments.forEach((apt) => {
        const entry = map.get(apt.date);
        if (!entry) return;
        entry.total++;
        const s = apt.status.toLowerCase();
        if (s === "completed") entry.completed++;
        else if (s === "scheduled" || s === "in progress") entry.pending++;
        else if (s === "cancelled") entry.cancelled++;
        else if (s === "no-show") entry.no_shows++;
      });
      return Array.from(map.values());
    }
    return [];
  }, [data, appointments]);

  const { totalAppointments, completionRate, dailyAvg } = useMemo(() => {
    const total = chartData.reduce((sum, d) => sum + (d.total || 0), 0);
    const completed = chartData.reduce((sum, d) => sum + (d.completed || 0), 0);
    const rate = total > 0 ? (completed / total) * 100 : 0;
    const avg = chartData.length > 0 ? total / chartData.length : 0;
    return { totalAppointments: total, completionRate: rate, dailyAvg: avg };
  }, [chartData]);

  const formattedData = useMemo(
    () =>
      chartData.map((d) => {
        const dateStr = d.date ? d.date.slice(0, 10) : "";
        return {
          ...d,
          day: dateStr ? format(new Date(dateStr + "T12:00:00"), "EEE") : "",
        };
      }),
    [chartData]
  );

  const handleBarClick = (entry: { date: string }) => {
    if (onBarClick && entry.date) {
      onBarClick(entry.date);
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity size={18} />
            <CardTitle className="text-base">Appointment Breakdown</CardTitle>
          </div>
          {totalAppointments > 0 && (
            <Badge variant="secondary" className="text-xs">
              <TrendingUp size={12} className="mr-1" />
              {completionRate.toFixed(1)}% completed
            </Badge>
          )}
        </div>
        <CardDescription>
          <span>
            {totalAppointments} total &middot; avg {dailyAvg.toFixed(1)}/day
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        {loading ? (
          <div className="h-full bg-muted rounded animate-pulse" />
        ) : totalAppointments === 0 && formattedData.length === 0 ? (
          <div className="h-full">
            <EmptyState />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
              barGap={0}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#f0f0f0"} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: isDark ? "#4b5563" : "#e0e0e0" }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: isDark ? "#4b5563" : "#e0e0e0" }}
                axisLine={{ stroke: isDark ? "#4b5563" : "#e0e0e0" }}
              />
              <Tooltip content={<CustomTooltip />} cursor={<CustomCursor isDark={isDark} />} />
              {dailyAvg > 0 && (
                <ReferenceLine
                  y={dailyAvg}
                  stroke={isDark ? "#64748b" : "#94a3b8"}
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                  label={{
                    value: `avg ${dailyAvg.toFixed(1)}`,
                    position: "insideTopRight",
                    fontSize: 11,
                    fill: isDark ? "#64748b" : "#94a3b8",
                  }}
                />
              )}
              <Bar
                dataKey="completed"
                stackId="a"
                fill="#22c55e"
                radius={[0, 0, 0, 0]}
                cursor={onBarClick ? "pointer" : "default"}
                onClick={onBarClick ? handleBarClick : undefined}
              />
              <Bar
                dataKey="pending"
                stackId="a"
                fill="#94a3b8"
                radius={[0, 0, 0, 0]}
                cursor={onBarClick ? "pointer" : "default"}
                onClick={onBarClick ? handleBarClick : undefined}
              />
              <Bar
                dataKey="no_shows"
                stackId="a"
                fill="#ef4444"
                radius={[0, 0, 0, 0]}
                cursor={onBarClick ? "pointer" : "default"}
                onClick={onBarClick ? handleBarClick : undefined}
              />
              <Bar
                dataKey="cancelled"
                stackId="a"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                cursor={onBarClick ? "pointer" : "default"}
                onClick={onBarClick ? handleBarClick : undefined}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
});
