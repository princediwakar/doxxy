import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Search, Plus, Stethoscope, Mail, Phone, CalendarDays, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Database } from '@/integrations/supabase/types';
import { DoctorModal } from '@/components/DoctorModal';
import { debounce } from 'lodash'; // Added for search debouncing
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'; // Added for text truncation tooltips

type DoctorWithDetails = Database['public']['Functions']['get_doctors_by_clinic']['Returns'][0];

const fetchDoctors = async (clinicId: string, searchTerm: string): Promise<DoctorWithDetails[]> => {
  console.log("fetchDoctors: Fetching for clinic", clinicId, "search", searchTerm);
  const { data, error } = await supabase.rpc('get_doctors_by_clinic', { clinic_id: clinicId });
  if (error) {
    console.error("Error fetching doctors:", error);
    throw error;
  }
  const rpcData: DoctorWithDetails[] = data || [];
  console.log("fetchDoctors: Data received from RPC:", rpcData);
  if (searchTerm.trim()) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return rpcData.filter(doctor =>
      doctor.name.toLowerCase().includes(lowerSearchTerm) ||
      (doctor.email?.toLowerCase().includes(lowerSearchTerm) || false) ||
      (doctor.department_name?.toLowerCase().includes(lowerSearchTerm) || false)
    );
  }
  return rpcData;
};

// Doctor Card Component
const DoctorCard: React.FC<{ doctor: DoctorWithDetails } & React.HTMLAttributes<HTMLDivElement>> = ({ doctor, ...props }) => (
  <Card
    className="flex flex-col cursor-pointer hover:border-primary hover:shadow-md transition-all duration-200"
    {...props}
    role="button"
    aria-label={`View details for Dr. ${doctor.name}`}
    tabIndex={0} // Make card keyboard-focusable
  >
    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Stethoscope size={20} className="text-primary" aria-hidden="true" />
      </div>
      <div className="flex-grow">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className="text-xl font-semibold truncate max-w-[200px]">
                {doctor.name}
              </CardTitle>
            </TooltipTrigger>
            <TooltipContent>{doctor.name}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <p className="text-sm text-muted-foreground">
          {doctor.role} {doctor.department_name ? `(${doctor.department_name})` : ''}
        </p>
      </div>
    </CardHeader>
    <CardContent className="space-y-2 text-sm">
      {doctor.email && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center truncate max-w-[250px]">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="truncate">{doctor.email}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>{doctor.email}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {doctor.phone && (
        <div className="flex items-center">
          <Phone className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {doctor.phone}
        </div>
      )}
      {doctor.availability && (
        <div className="flex items-center">
          <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Available: {doctor.availability}
        </div>
      )}
      {doctor.bio && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-start truncate max-w-[250px]">
                <Info className="mr-2 h-4 w-4 text-muted-foreground mt-1" aria-hidden="true" />
                <span className="flex-1 truncate">Bio: {doctor.bio}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>{doctor.bio}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </CardContent>
  </Card>
);

const Doctors = () => {
  console.log("Doctors: Rendering component");
  const { activeClinic, activeClinicRole, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithDetails | null>(null);

  // Debounced search handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => setSearchTerm(value), 300),
    []
  );

  const { data: doctors, isLoading, isError, error } = useQuery({
    queryKey: ['doctors', activeClinic?.clinic_id, searchTerm],
    queryFn: () => fetchDoctors(activeClinic!.clinic_id, searchTerm),
    enabled: !!activeClinic && !authLoading,
    retry: 1,
  });

  console.log("Doctors: authLoading=", authLoading, "activeClinic=", !!activeClinic, "doctors count=", doctors?.length);

  const handleNewDoctor = () => {
    setSelectedDoctor(null);
    setIsDoctorModalOpen(true);
  };

  const handleDoctorClick = (doctor: DoctorWithDetails) => {
    setSelectedDoctor(doctor);
    setIsDoctorModalOpen(true);
  };

  // Handle keyboard interaction for cards
  const handleDoctorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, doctor: DoctorWithDetails) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDoctorClick(doctor);
    }
  };

  const handleModalClose = (open: boolean) => {
    setIsDoctorModalOpen(open);
    if (!open && activeClinic) {
      queryClient.invalidateQueries({ queryKey: ['doctors', activeClinic.clinic_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData', activeClinic.clinic_id] });
      setSelectedDoctor(null);
    }
  };

  // Retry fetching doctors on error
  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['doctors', activeClinic?.clinic_id, searchTerm] });
  };

  if (authLoading) {
    console.log("Doctors: Rendering null due to authLoading");
    return null;
  }

  if (!activeClinic) {
    console.log("Doctors: Rendering no clinic message");
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-lg">Please select a clinic to view doctors.</p>
      </div>
    );
  }

  if (isError) {
    console.error("Doctors: Error fetching data", error);
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-lg mb-4">Error loading doctors: {error.message}</p>
        <Button onClick={handleRetry} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  const displayDoctors = doctors || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Doctors</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage clinic doctors</p>
        </div>
        {(activeClinicRole === 'admin' || activeClinicRole === 'superadmin') && (
          <Button
            onClick={handleNewDoctor}
            className="transition-all duration-200 hover:scale-105"
          >
            <Plus size={18} className="mr-2" aria-hidden="true" />
            New Doctor
          </Button>
        )}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          placeholder="Search by name, email, or department..."
          className="pl-8"
          onChange={(e) => debouncedSetSearchTerm(e.target.value)}
          aria-label="Search doctors"
          // Handle Enter key for accessibility
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setSearchTerm(e.currentTarget.value); // Apply search immediately
            }
          }}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-grow">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : displayDoctors.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-lg mb-4">
            {searchTerm ? "No doctors match your search criteria." : "No doctors found for this clinic."}
          </p>
          {searchTerm ? (
            <Button variant="outline" onClick={() => setSearchTerm('')}>
              Clear Search
            </Button>
          ) : (activeClinicRole === 'admin' || activeClinicRole === 'superadmin') && (
            <Button onClick={handleNewDoctor}>
              <Plus size={18} className="mr-2" aria-hidden="true" />
              Add Your First Doctor
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayDoctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onClick={() => handleDoctorClick(doctor)}
              onKeyDown={(e) => handleDoctorKeyDown(e, doctor)}
            />
          ))}
        </div>
      )}

      <DoctorModal
        open={isDoctorModalOpen}
        onOpenChange={handleModalClose}
        doctor={selectedDoctor}
      />
    </div>
  );
};

export default Doctors;