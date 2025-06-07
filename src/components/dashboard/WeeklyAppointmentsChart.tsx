import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, startOfWeek, addDays, isSameDay, parseISO, isValid } from 'date-fns';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, TrendingUp, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Appointment {
  date: string;
  status?: string;
  type?: string;
}

interface WeeklyAppointmentsChartProps {
  appointments: Appointment[];
  onBarClick?: (date: string) => void;
}

function getWeekDays(start: Date) {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium">{`${label}`}</p>
        <p className="text-primary">
          {`Appointments: ${data.count}`}
        </p>
        {data.completedCount > 0 && (
          <p className="text-green-600 text-sm">
            {`Completed: ${data.completedCount}`}
          </p>
        )}
        {data.pendingCount > 0 && (
          <p className="text-orange-600 text-sm">
            {`Pending: ${data.pendingCount}`}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const WeeklyAppointmentsChart: React.FC<WeeklyAppointmentsChartProps> = ({ 
  appointments, 
  onBarClick 
}) => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const weekDays = getWeekDays(weekStart);

  // Enhanced data processing with status breakdown
  const data = weekDays.map((day) => {
    const dayAppointments = appointments.filter((apt) => {
      if (!apt.date) return false;
      try {
        const aptDate = typeof apt.date === 'string' ? parseISO(apt.date) : apt.date;
        return isValid(aptDate) && isSameDay(day, aptDate);
      } catch (error) {
        console.warn('Invalid date format:', apt.date);
        return false;
      }
    });

    const count = dayAppointments.length;
    const completedCount = dayAppointments.filter(apt => 
      apt.status?.toLowerCase() === 'completed'
    ).length;
    const pendingCount = dayAppointments.filter(apt => 
      apt.status?.toLowerCase() === 'scheduled' || 
      apt.status?.toLowerCase() === 'in progress'
    ).length;

    return {
      day: format(day, 'EEE'),
      fullDate: format(day, 'MMMM d'),
      date: format(day, 'yyyy-MM-dd'),
      count,
      completedCount,
      pendingCount,
      isToday: isSameDay(day, new Date()),
    };
  });

  const totalAppointments = data.reduce((sum, day) => sum + day.count, 0);
  const totalCompleted = data.reduce((sum, day) => sum + day.completedCount, 0);
  const completionRate = totalAppointments > 0 ? (totalCompleted / totalAppointments * 100).toFixed(1) : '0';
  const busyDay = data.reduce((prev, current) => (prev.count > current.count) ? prev : current);

  const handleBarClick = (data: any) => {
    if (onBarClick) {
      onBarClick(data.date);
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity size={18} className="text-purple-500" />
            <CardTitle className="text-base">Weekly Appointments</CardTitle>
          </div>
          {totalAppointments > 0 && (
            <Badge variant="secondary" className="text-xs">
              <TrendingUp size={12} className="mr-1" />
              {completionRate}% completed
            </Badge>
          )}
        </div>
        <CardDescription className="flex items-center justify-between">
          <span>Appointments per day this week</span>
          {totalAppointments > 0 && busyDay.count > 0 && (
            <span className="text-xs text-muted-foreground">
              Busiest: {busyDay.day} ({busyDay.count})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        {totalAppointments === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Calendar size={48} className="mb-4 opacity-50" />
            <p className="text-sm">No appointments this week</p>
            <p className="text-xs mt-1">Chart will update when appointments are scheduled</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
              onClick={onBarClick ? handleBarClick : undefined}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e0e0e0' }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                cursor={onBarClick ? 'pointer' : 'default'}
                onClick={onBarClick ? handleBarClick : undefined}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}; 