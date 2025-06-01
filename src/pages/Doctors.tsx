import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Search, Plus, Stethoscope, Mail, Phone, CalendarDays, Info } from 'lucide-react'; // Added icons for email, phone, calendar, info
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Database } from '@/integrations/supabase/types';
import { DoctorModal } from '@/components/DoctorModal'; // Import the DoctorModal

// Type for the return of the get_doctors_by_clinic RPC, now includes department_id
// This type is generated from the Supabase schema via types.ts
type DoctorWithDetails = Database['public']['Functions']['get_doctors_by_clinic']['Returns'][0];

const fetchDoctors = async (clinicId: string, searchTerm: string): Promise<DoctorWithDetails[]> => {
  console.log("fetchDoctors: Fetching for clinic", clinicId, "search", searchTerm);

  // Using the RPC to get doctors with details
  const { data, error } = await supabase
    .rpc('get_doctors_by_clinic', { clinic_id: clinicId });

  if (error) {
    console.error("Error fetching doctors:", error);
    throw error;
  }

  const rpcData: DoctorWithDetails[] = data || [];
  console.log("fetchDoctors: Data received from RPC:", rpcData);

  // Client-side filtering by name, email, or department name
   if (searchTerm.trim()) {
     const lowerSearchTerm = searchTerm.toLowerCase();
     const filteredData = rpcData.filter((doctor: DoctorWithDetails) =>
       doctor.name.toLowerCase().includes(lowerSearchTerm) ||
       (doctor.email?.toLowerCase().includes(lowerSearchTerm) || false) ||
       (doctor.department_name?.toLowerCase().includes(lowerSearchTerm) || false)
     );
     return filteredData;
   } else {
      return rpcData; // Return RPC data if no search term
   }
};

// Doctor Card Component
// This component receives the DoctorWithDetails type directly from the RPC
const DoctorCard: React.FC<{ doctor: DoctorWithDetails } & React.HTMLAttributes<HTMLDivElement>> = ({ doctor, ...props }) => (
  <Card className="flex flex-col" {...props}> {/* Allow passing click handler */}
    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
       <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
         <Stethoscope size={20} className="text-primary" />
       </div>
      <div className="flex-grow">
        <CardTitle className="text-xl font-semibold truncate">{doctor.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{doctor.role} {doctor.department_name ? `(${doctor.department_name})` : ''}</p>
      </div>
    </CardHeader>
    <CardContent className="space-y-2 text-sm">
      {doctor.email && (
        <div className="flex items-center">
          <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> {doctor.email}
        </div>
      )}
      {doctor.phone && (
        <div className="flex items-center">
          <Phone className="mr-2 h-4 w-4 text-muted-foreground" /> {doctor.phone}
        </div>
      )}
       {doctor.availability && (
        <div className="flex items-center">
          <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /> Available: {doctor.availability}
        </div>
      )}
       {doctor.bio && (
        <div className="flex items-start">
          <Info className="mr-2 h-4 w-4 text-muted-foreground mt-1" /> <span className="flex-1">Bio: {doctor.bio}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const Doctors = () => {
  console.log("Doctors: Rendering component");
  const { activeClinic, activeClinicRole, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  // State for DoctorModal
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  // selectedDoctor should use the updated DoctorWithDetails type
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithDetails | null>(null);

  const { data: doctors, isLoading, isError, error } = useQuery({
    queryKey: ['doctors', activeClinic?.clinic_id, searchTerm],
    // The queryFn now returns the correct DoctorWithDetails type
    queryFn: () => fetchDoctors(activeClinic!.clinic_id, searchTerm),
    enabled: !!activeClinic && !authLoading, // Only fetch if clinic is selected and auth is not loading
    retry: 1,
  });

  console.log("Doctors: authLoading=", authLoading, "activeClinic=", !!activeClinic, "doctors count=", doctors?.length);

   // Handle opening the modal for a new doctor
  const handleNewDoctor = () => {
    setSelectedDoctor(null); // No doctor object means creating new
    setIsDoctorModalOpen(true);
  };

  // Handle opening the modal for an existing doctor
  const handleDoctorClick = (doctor: DoctorWithDetails) => {
    // Pass the doctor object with correct details to the modal
    setSelectedDoctor(doctor); 
    setIsDoctorModalOpen(true);
  };

  // Handle closing the modal and refreshing data
  const handleModalClose = (open: boolean) => {
    setIsDoctorModalOpen(open);
    if (!open && activeClinic) {
      // Invalidate the doctors query to refetch data after modal is closed
      queryClient.invalidateQueries({ queryKey: ['doctors', activeClinic.clinic_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData', activeClinic.clinic_id] }); // Invalidate dashboard data as doctor count might change
      setSelectedDoctor(null); // Clear selected doctor state
    }
  };


  if (authLoading) {
    console.log("Doctors: Rendering null due to authLoading");
    return null;
  }

  if (!activeClinic) {
    console.log("Doctors: Rendering no clinic message");
    return <div className="text-center py-4">Please select a clinic to view doctors.</div>;
  }

  if (error) {
    console.error("Doctors: Error fetching data", error);
    toast.error("Failed to load doctors");
    return <div className="text-center py-4 text-red-500">Error loading doctors.</div>;
  }

  const displayDoctors = doctors || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Doctors</h1>
          <p className="text-muted-foreground">View and manage clinic doctors</p>
        </div>
        {/* Show New Doctor button for Superadmins and Admins */}
        {(activeClinicRole === 'admin' || activeClinicRole === 'superadmin') && ( // Assuming 'admin' role can add doctors based on project rules
          <Button
           onClick={handleNewDoctor}
          >
            <Plus size={18} className="mr-2" />
            New Doctor
          </Button>
        )}
      </div>

      <div className="relative mb-6"> {/* Added bottom margin */}
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name, email, or department..." // Updated placeholder
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Loading placeholder grid */}
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-[200px] animate-pulse bg-muted/50"></Card>
          ))}
        </div>
      ) : (
        displayDoctors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground"> {/* Adjusted empty state */}
             {searchTerm ? "No doctors match your search criteria." : "No doctors found for this clinic."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Grid layout for cards */}
            {displayDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onClick={() => handleDoctorClick(doctor)}
                className="cursor-pointer hover:border-primary transition-colors" // Added hover effect
              />
            ))}
          </div>
        )
      )}

      {/* Doctor Modal component */}
       <DoctorModal
        open={isDoctorModalOpen}
        onOpenChange={handleModalClose}
        // Pass the selected doctor object with correct details to the modal
        doctor={selectedDoctor}
      />
    </div>
  );
};

export default Doctors;
