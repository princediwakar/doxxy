import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface Appointment {
  date: string;
}

interface WeeklyAppointmentsChartProps {
  appointments: Appointment[];
  onBarClick?: (date: string) => void;
}

function getWeekDays(start: Date) {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export const WeeklyAppointmentsChart: React.FC<WeeklyAppointmentsChartProps> = ({ appointments, onBarClick }) => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const weekDays = getWeekDays(weekStart);

  // Count appointments per day
  const data = weekDays.map((day) => {
    const count = appointments.filter((apt) => {
      const aptDate = typeof apt.date === 'string' ? parseISO(apt.date) : apt.date;
      return isSameDay(day, aptDate);
    }).length;
    return {
      day: format(day, 'EEE'),
      date: format(day, 'yyyy-MM-dd'),
      count,
    };
  });

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity size={18} className="mr-2 text-purple-500" />
          Weekly Appointments
        </CardTitle>
        <CardDescription>Number of appointments per day this week</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <div className="bg-white rounded-lg shadow p-4 h-full">
          <h3 className="text-lg font-semibold mb-2">Appointments This Week</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                cursor={onBarClick ? 'pointer' : 'default'}
                onClick={onBarClick ? (data, index) => onBarClick(data.date) : undefined}
                onMouseOver={onBarClick ? (e) => { e.target.style.opacity = 0.8; } : undefined}
                onMouseOut={onBarClick ? (e) => { e.target.style.opacity = 1; } : undefined}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 