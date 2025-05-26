import { Card, CardContent } from "@/components/ui/card";
import { Users, User, CalendarCheck } from "lucide-react";

interface AdminStatsGridProps {
  stats: { totalPatients: number; totalDoctors: number; appointmentsToday: number };
  loading: boolean;
}

export function AdminStatsGrid({
  stats,
  loading,
}: AdminStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {loading ? (
        // Loading skeletons for stats
        Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6 h-[88px]"></CardContent>
          </Card>
        ))
      ) : (
        // Actual stats
        <>
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-2 rounded-full bg-blue-50 text-blue-500">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <h3 className="text-2xl font-bold">{stats.totalPatients}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-2 rounded-full bg-indigo-50 text-indigo-500">
                <User size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Doctors</p>
                <h3 className="text-2xl font-bold">{stats.totalDoctors}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-2 rounded-full bg-purple-50 text-purple-500">
                <CalendarCheck size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Appointments Today</p>
                <h3 className="text-2xl font-bold">{stats.appointmentsToday}</h3>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 