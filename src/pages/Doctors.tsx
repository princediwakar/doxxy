
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DoctorModal } from "@/components/DoctorModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      // Process doctors data for display
      const formattedDoctors = data.map(doctor => ({
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialization,
        email: doctor.email,
        phone: doctor.phone,
        availability: "Available", // We'll add this to the database later
        image: doctor.avatar_url,
        initials: getInitials(doctor.name),
        patients: 0, // We'll calculate this in a follow-up query
        appointments: 0 // We'll calculate this in a follow-up query
      }));
      
      // Get appointment counts for each doctor
      for (const doctor of formattedDoctors) {
        // Count appointments
        const { count: appointmentCount, error: apptError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('doctor_id', doctor.id);
        
        if (apptError) throw apptError;
          
        // Count unique patients
        const { data: patientData, error: patientError } = await supabase
          .from('appointments')
          .select('patient_id')
          .eq('doctor_id', doctor.id);
        
        if (patientError) throw patientError;
          
        // Calculate unique patient count
        const uniquePatients = new Set();
        patientData?.forEach(app => uniquePatients.add(app.patient_id));
        
        doctor.appointments = appointmentCount || 0;
        doctor.patients = uniquePatients.size || 0;
      }
      
      setDoctors(formattedDoctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

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

  // Filter doctors based on search term
  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-48"></CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No doctors found. Try a different search term or add a new doctor.</p>
        </div>
      ) : (
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
      )}

      <DoctorModal
        open={openModal}
        onOpenChange={setOpenModal}
        doctor={selectedDoctor}
      />
    </div>
  );
};

export default Doctors;
