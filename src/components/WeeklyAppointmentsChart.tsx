import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from "lucide-react";

interface WeeklyAppointmentsChartProps {
  appointmentData: { name: string; appointments: number }[];
  loading: boolean;
}

export function WeeklyAppointmentsChart({
  appointmentData,
  loading,
}: WeeklyAppointmentsChartProps) {
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
        {loading ? (
          <div className="w-full h-full animate-pulse bg-muted/30 rounded-md"></div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={appointmentData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="appointments" fill="#9b87f5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
} 