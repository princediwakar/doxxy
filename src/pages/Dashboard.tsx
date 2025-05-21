
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Users, User, Clock, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  // Mock data for the dashboard
  const stats = [
    { title: "Total Patients", value: "1,240", icon: Users, color: "bg-blue-50 text-blue-500" },
    { title: "Total Doctors", value: "8", icon: User, color: "bg-indigo-50 text-indigo-500" },
    { title: "Appointments Today", value: "32", icon: CalendarCheck, color: "bg-purple-50 text-purple-500" },
    { title: "Avg. Wait Time", value: "18 min", icon: Clock, color: "bg-pink-50 text-pink-500" },
  ];

  const appointmentData = [
    { name: 'Mon', appointments: 24 },
    { name: 'Tue', appointments: 18 },
    { name: 'Wed', appointments: 30 },
    { name: 'Thu', appointments: 32 },
    { name: 'Fri', appointments: 28 },
    { name: 'Sat', appointments: 16 },
    { name: 'Sun', appointments: 8 },
  ];

  const upcomingAppointments = [
    { id: 1, patient: "Sarah Johnson", doctor: "Dr. Michael Chen", time: "10:00 AM", type: "Check-up" },
    { id: 2, patient: "Robert Williams", doctor: "Dr. Emily Parker", time: "11:30 AM", type: "Consultation" },
    { id: 3, patient: "Emma Davis", doctor: "Dr. James Wilson", time: "1:15 PM", type: "Follow-up" },
    { id: 4, patient: "Thomas Brown", doctor: "Dr. Michael Chen", time: "2:45 PM", type: "Check-up" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your clinic's performance and schedule.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className={`p-2 rounded-full ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Appointments Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity size={18} className="mr-2 text-purple-500" />
              Weekly Appointments
            </CardTitle>
            <CardDescription>Number of appointments per day this week</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointments" fill="#9b87f5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarCheck size={18} className="mr-2 text-purple-500" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>Today's scheduled appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="space-y-1">
                    <p className="font-medium">{appointment.patient}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User size={14} className="mr-1" />
                      <span>{appointment.doctor}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{appointment.time}</p>
                    <p className="text-sm text-muted-foreground">{appointment.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
