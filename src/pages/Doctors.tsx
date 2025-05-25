
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, User, Phone, Mail, Stethoscope } from "lucide-react";
import { DoctorModal } from "@/components/DoctorModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization: 'Neurology' | 'Ophthalmology';
  availability?: string;
  bio?: string;
  created_at?: string;
}

const Doctors = () => {
  const { userRole } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('name');

      if (error) throw error;

      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleAddNewDoctor = () => {
    setSelectedDoctor(null);
    setIsModalOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const getSpecializationColor = (specialization: string) => {
    return specialization === 'Neurology' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-teal-100 text-teal-800';
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'Away':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Doctors</h1>
          <p className="text-muted-foreground">
            Manage doctor profiles and specializations.
          </p>
        </div>
        {userRole === 'admin' && (
          <Button onClick={handleAddNewDoctor}>
            <Plus className="h-4 w-4 mr-2" />
            Add Doctor
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6 h-48"></CardContent>
            </Card>
          ))
        ) : doctors.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No doctors found</h3>
              <p className="text-muted-foreground">
                No doctors have been added to the system yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          doctors.map((doctor) => (
            <Card 
              key={doctor.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleDoctorClick(doctor)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(doctor.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{doctor.name}</CardTitle>
                    <Badge className={getSpecializationColor(doctor.specialization)}>
                      {doctor.specialization}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="truncate">{doctor.email}</span>
                </div>
                
                {doctor.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{doctor.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    <span>Status:</span>
                  </div>
                  <Badge className={getAvailabilityColor(doctor.availability || 'Available')}>
                    {doctor.availability || 'Available'}
                  </Badge>
                </div>

                {doctor.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {doctor.bio}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <DoctorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        doctor={selectedDoctor}
      />
    </div>
  );
};

export default Doctors;
