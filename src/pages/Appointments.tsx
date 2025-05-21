
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Search, CalendarPlus, Calendar as CalendarIcon } from "lucide-react";
import { AppointmentModal } from "@/components/AppointmentModal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

// Mock appointment data
const appointmentData = [
  { 
    id: 1, 
    patient: "Sarah Johnson", 
    doctor: "Dr. Michael Chen", 
    date: "2025-05-21", 
    time: "10:00 AM", 
    type: "Check-up", 
    status: "Scheduled" 
  },
  { 
    id: 2, 
    patient: "Robert Williams", 
    doctor: "Dr. Emily Parker", 
    date: "2025-05-21", 
    time: "11:30 AM", 
    type: "Consultation", 
    status: "In Progress" 
  },
  { 
    id: 3, 
    patient: "Emma Davis", 
    doctor: "Dr. James Wilson", 
    date: "2025-05-21", 
    time: "1:15 PM", 
    type: "Follow-up", 
    status: "Scheduled" 
  },
  { 
    id: 4, 
    patient: "Thomas Brown", 
    doctor: "Dr. Michael Chen", 
    date: "2025-05-21", 
    time: "2:45 PM", 
    type: "Check-up", 
    status: "Scheduled" 
  },
  { 
    id: 5, 
    patient: "Lisa Wilson", 
    doctor: "Dr. Sarah Adams", 
    date: "2025-05-22", 
    time: "9:30 AM", 
    type: "Check-up", 
    status: "Scheduled" 
  },
  { 
    id: 6, 
    patient: "Kevin Miller", 
    doctor: "Dr. Robert Johnson", 
    date: "2025-05-22", 
    time: "11:00 AM", 
    type: "Follow-up", 
    status: "Scheduled" 
  },
  { 
    id: 7, 
    patient: "Emily Thompson", 
    doctor: "Dr. Lisa Thompson", 
    date: "2025-05-22", 
    time: "3:15 PM", 
    type: "Consultation", 
    status: "Scheduled" 
  },
];

const Appointments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("list");
  const [selectedDoctor, setSelectedDoctor] = useState<string | undefined>();
  const [openModal, setOpenModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Filter appointments based on search term, selected date, and doctor
  const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  const filteredAppointments = appointmentData.filter((appointment) => {
    const matchesSearch = 
      appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = formattedDate === appointment.date;
    
    const matchesDoctor = !selectedDoctor || appointment.doctor === selectedDoctor;
    
    return matchesSearch && matchesDate && matchesDoctor;
  });

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setOpenModal(true);
  };

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setOpenModal(true);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Scheduled": return "default";
      case "In Progress": return "outline";
      case "Completed": return "secondary";
      case "Cancelled": return "destructive";
      default: return "default";
    }
  };

  // Group appointments by time for calendar view
  const timeSlots = filteredAppointments.reduce((acc: any, appointment) => {
    if (!acc[appointment.time]) {
      acc[appointment.time] = [];
    }
    acc[appointment.time].push(appointment);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage and schedule appointments</p>
        </div>
        <Button onClick={handleNewAppointment}>
          <CalendarPlus size={18} className="mr-2" />
          New Appointment
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2 flex items-center">
                <CalendarIcon size={16} className="mr-2 text-purple-500" />
                Calendar
              </h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Filter by Doctor</h4>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="All doctors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={undefined}>All doctors</SelectItem>
                    <SelectItem value="Dr. Michael Chen">Dr. Michael Chen</SelectItem>
                    <SelectItem value="Dr. Emily Parker">Dr. Emily Parker</SelectItem>
                    <SelectItem value="Dr. James Wilson">Dr. James Wilson</SelectItem>
                    <SelectItem value="Dr. Sarah Adams">Dr. Sarah Adams</SelectItem>
                    <SelectItem value="Dr. Robert Johnson">Dr. Robert Johnson</SelectItem>
                    <SelectItem value="Dr. Lisa Thompson">Dr. Lisa Thompson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search appointments..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-[200px]">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="list">List</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <TabsContent value="list" className="p-0 m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead className="hidden md:table-cell">Doctor</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="hidden lg:table-cell">Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appointment) => (
                      <TableRow 
                        key={appointment.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        <TableCell className="font-medium">{appointment.patient}</TableCell>
                        <TableCell className="hidden md:table-cell">{appointment.doctor}</TableCell>
                        <TableCell>{appointment.time}</TableCell>
                        <TableCell className="hidden lg:table-cell">{appointment.type}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No appointments found for the selected date
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="calendar" className="p-0 m-0">
              <div className="min-h-[400px]">
                <div className="grid grid-cols-1 divide-y">
                  {Object.keys(timeSlots).length > 0 ? (
                    Object.keys(timeSlots).sort().map((time) => (
                      <div key={time} className="flex py-3 px-4">
                        <div className="w-16 font-medium">{time}</div>
                        <div className="flex-1 space-y-2">
                          {timeSlots[time].map((appointment: any) => (
                            <div 
                              key={appointment.id} 
                              className="p-2 pl-3 border-l-4 border-primary rounded-r bg-primary/5 hover:bg-primary/10 cursor-pointer"
                              style={{borderColor: appointment.doctor.includes('Chen') ? '#9b87f5' : appointment.doctor.includes('Parker') ? '#7E69AB' : '#6E59A5'}}
                              onClick={() => handleAppointmentClick(appointment)}
                            >
                              <div className="font-medium">{appointment.patient}</div>
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{appointment.doctor}</span>
                                <span>{appointment.type}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center py-16 text-muted-foreground">
                      No appointments found for the selected date
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </div>
      </div>

      <AppointmentModal
        open={openModal}
        onOpenChange={setOpenModal}
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default Appointments;
