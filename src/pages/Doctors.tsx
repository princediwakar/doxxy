
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Search, Plus, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DoctorModal } from "@/components/DoctorModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock doctor data
const doctorData = [
  { 
    id: 1, 
    name: "Dr. Michael Chen", 
    specialty: "General Practitioner", 
    patients: 342, 
    appointments: 18, 
    availability: "Available",
    image: null,
    initials: "MC" 
  },
  { 
    id: 2, 
    name: "Dr. Emily Parker", 
    specialty: "Pediatrician", 
    patients: 286, 
    appointments: 15, 
    availability: "Available",
    image: null, 
    initials: "EP" 
  },
  { 
    id: 3, 
    name: "Dr. James Wilson", 
    specialty: "Cardiologist", 
    patients: 210, 
    appointments: 12, 
    availability: "Busy",
    image: null,
    initials: "JW" 
  },
  { 
    id: 4, 
    name: "Dr. Sarah Adams", 
    specialty: "Dermatologist", 
    patients: 178, 
    appointments: 10, 
    availability: "Available",
    image: null,
    initials: "SA" 
  },
  { 
    id: 5, 
    name: "Dr. Robert Johnson", 
    specialty: "Orthopedic Surgeon", 
    patients: 195, 
    appointments: 8, 
    availability: "Away",
    image: null,
    initials: "RJ" 
  },
  { 
    id: 6, 
    name: "Dr. Lisa Thompson", 
    specialty: "Neurologist", 
    patients: 165, 
    appointments: 9, 
    availability: "Available",
    image: null,
    initials: "LT" 
  },
];

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Filter doctors based on search term
  const filteredDoctors = doctorData.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDoctorClick = (doctor: any) => {
    setSelectedDoctor(doctor);
    setOpenModal(true);
  };

  const handleNewDoctor = () => {
    setSelectedDoctor(null);
    setOpenModal(true);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Available": return "bg-green-500";
      case "Busy": return "bg-amber-500";
      case "Away": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Doctors</h1>
          <p className="text-muted-foreground">Manage and view doctor profiles and schedules</p>
        </div>
        <Button onClick={handleNewDoctor}>
          <Plus size={18} className="mr-2" />
          Add Doctor
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search doctors by name or specialty..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map((doctor) => (
          <Card 
            key={doctor.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleDoctorClick(doctor)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={doctor.image || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {doctor.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{doctor.name}</h3>
                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(doctor.availability)} mr-1`}></div>
                  <span className="text-xs font-medium">{doctor.availability}</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-lg font-semibold">{doctor.patients}</span>
                  <span className="text-xs text-muted-foreground">Patients</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-lg font-semibold">{doctor.appointments}</span>
                  <span className="text-xs text-muted-foreground">Today</span>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm" className="w-full">
                  <Calendar size={16} className="mr-2" />
                  View Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DoctorModal
        open={openModal}
        onOpenChange={setOpenModal}
        doctor={selectedDoctor}
      />
    </div>
  );
};

export default Doctors;
