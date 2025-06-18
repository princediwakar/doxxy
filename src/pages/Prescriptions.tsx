import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Calendar,
  User,
  Stethoscope,
  Pill,
  Clock,
  FileText,
  Activity,
  Heart,
  Shield
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/integrations/supabase/client';
import { Database, Tables } from '@/integrations/supabase/types';
import { PrescriptionViewModal } from '@/components/prescriptions/PrescriptionViewModal';
import { PrescriptionModal } from '@/components/prescriptions/PrescriptionModal';
import { toast } from 'sonner';

const supabase = getSupabase();

type Prescription = Database['public']['Tables']['prescriptions']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];
type Doctor = Database['public']['Tables']['doctors']['Row'];

interface PrescriptionWithDetails extends Prescription {
  patient_name: string;
  doctor_name: string;
  patient_gender?: string;
  patient_age?: number;
}

interface PrescriptionStats {
  totalPrescriptions: number;
  activePrescriptions: number;
  followUpRequired: number;
  recentPrescriptions: number;
}

// Medication templates for quick prescription creation
const medicationTemplates = {
  common: [
    { name: 'Paracetamol', dosage: '500mg', frequency: 'TDS', duration: '5 days', route: 'Oral' },
    { name: 'Ibuprofen', dosage: '400mg', frequency: 'BD', duration: '3 days', route: 'Oral' },
    { name: 'Amoxicillin', dosage: '500mg', frequency: 'TDS', duration: '7 days', route: 'Oral' },
    { name: 'Omeprazole', dosage: '20mg', frequency: 'OD', duration: '14 days', route: 'Oral' },
  ],
  neurology: [
    { name: 'Levetiracetam', dosage: '500mg', frequency: 'BD', duration: '1 month', route: 'Oral' },
    { name: 'Carbamazepine', dosage: '200mg', frequency: 'BD', duration: '1 month', route: 'Oral' },
    { name: 'Sumatriptan', dosage: '50mg', frequency: 'PRN', duration: 'As needed', route: 'Oral' },
    { name: 'Propranolol', dosage: '40mg', frequency: 'BD', duration: '1 month', route: 'Oral' },
  ],
  ophthalmology: [
    { name: 'Timolol Eye Drops', dosage: '0.5%', frequency: 'BD', duration: '1 month', route: 'Eye Drops', eye: 'Both' },
    { name: 'Prednisolone Eye Drops', dosage: '1%', frequency: 'QID', duration: '1 week', route: 'Eye Drops', eye: 'Both' },
    { name: 'Artificial Tears', dosage: '1 drop', frequency: 'QID', duration: 'As needed', route: 'Eye Drops', eye: 'Both' },
    { name: 'Cyclosporine Eye Drops', dosage: '0.05%', frequency: 'BD', duration: '1 month', route: 'Eye Drops', eye: 'Both' },
  ]
};

const Prescriptions = () => {
  const { activeClinic, activeClinicRole } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionWithDetails | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatePrescriptionModalOpen, setIsCreatePrescriptionModalOpen] = useState(false);
  const [manualDoctorId, setManualDoctorId] = useState<string | null>(null);
  const [manualPatientId, setManualPatientId] = useState<string | null>(null);
  const [selectedAppointmentForPrescription, setSelectedAppointmentForPrescription] = useState<Tables<'appointments'> | null>(null);

  // Fetch prescriptions with patient and doctor details
  const { data: prescriptions = [], isLoading, error } = useQuery({
    queryKey: ['prescriptions', activeClinic?.clinic_id, searchTerm, statusFilter, dateFilter],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];

      // Simplified query without the problematic nested join
      const query = supabase
        .from('prescriptions')
        .select(`
          *,
          patients!inner(id, name, gender, date_of_birth),
          doctors!inner(id, name)
        `)
        .eq('clinic_id', activeClinic.clinic_id)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(prescription => {
        const patient = prescription.patients as Partial<Patient>;
        const doctor = prescription.doctors as Partial<Doctor>;

        // Calculate age
        let age: number | undefined;
        if (patient?.date_of_birth) {
          const today = new Date();
          const birthDate = new Date(patient.date_of_birth);
          age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        }

        return {
          ...prescription,
          patient_name: patient?.name || 'Unknown Patient',
          doctor_name: doctor?.name || 'Unknown Doctor',
          patient_gender: patient?.gender,
          patient_age: age,
        } as PrescriptionWithDetails;
      });
    },
    enabled: !!activeClinic?.clinic_id,
  });

  // Calculate statistics
  const stats: PrescriptionStats = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      totalPrescriptions: prescriptions.length,
      activePrescriptions: prescriptions.filter(p => {
        if (!p.follow_up_date) return true;
        return new Date(p.follow_up_date) >= today;
      }).length,
      followUpRequired: prescriptions.filter(p => {
        if (!p.follow_up_date) return false;
        const followUpDate = new Date(p.follow_up_date);
        return followUpDate <= today || (followUpDate.getTime() - today.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      }).length,
      recentPrescriptions: prescriptions.filter(p => {
        return new Date(p.created_at!) >= weekAgo;
      }).length,
    };
  }, [prescriptions]);

  // Filter and paginate prescriptions
  const { filteredPrescriptions, totalPages, totalCount } = useMemo(() => {
    const filtered = prescriptions.filter(prescription => {
      const matchesSearch = !searchTerm ||
        prescription.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof prescription.medications === 'string' &&
          prescription.medications.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && (!prescription.follow_up_date || new Date(prescription.follow_up_date) >= new Date())) ||
        (statusFilter === 'followup' && prescription.follow_up_date && new Date(prescription.follow_up_date) <= new Date());

      const matchesDate = dateFilter === 'all' ||
        (dateFilter === 'today' && new Date(prescription.created_at!).toDateString() === new Date().toDateString()) ||
        (dateFilter === 'week' && new Date(prescription.created_at!) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (dateFilter === 'month' && new Date(prescription.created_at!) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

      return matchesSearch && matchesStatus && matchesDate;
    });

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

    return {
      filteredPrescriptions: paginatedData,
      totalPages,
      totalCount
    };
  }, [prescriptions, searchTerm, statusFilter, dateFilter, currentPage, itemsPerPage]);

  const handleViewPrescription = (prescription: PrescriptionWithDetails) => {
    setSelectedPrescription(prescription);
    setIsViewModalOpen(true);
  };

  const formatMedications = (medications: unknown): string => {
    if (typeof medications === 'string') return medications;
    if (Array.isArray(medications)) {
      return medications.map(med => {
        if (typeof med === 'string') return med;
        const parts = [med.name];
        if (med.dosage) parts.push(med.dosage);
        if (med.frequency) parts.push(med.frequency);
        if (med.duration) parts.push(`for ${med.duration}`);
        return parts.join(' ');
      }).join(', ');
    }
    return 'Medication details available';
  };

  const getMedicationCount = (medications: unknown): number => {
    if (Array.isArray(medications)) return medications.length;
    if (typeof medications === 'string') return 1;
    return 0;
  };

  // Fetch doctors for manual selection
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];
      const { data, error } = await getSupabase().rpc('get_doctors_by_clinic', { clinic_id: activeClinic.clinic_id });
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeClinic?.clinic_id && isCreatePrescriptionModalOpen,
  });

  // Fetch patients for manual selection
  const { data: patients = [] } = useQuery({
    queryKey: ['patients', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];
      const { data, error } = await getSupabase().from('patients').select('id, name').eq('clinic_id', activeClinic.clinic_id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeClinic?.clinic_id && isCreatePrescriptionModalOpen,
  });

  // Fetch appointments for selection
  const { data: appointmentsForSelect = [] } = useQuery({
    queryKey: ['appointments', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];
      const { data, error } = await getSupabase().from('appointments').select('id, patient_id, doctor_id').eq('clinic_id', activeClinic.clinic_id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeClinic?.clinic_id && isCreatePrescriptionModalOpen,
  });

  if (!activeClinic) {
    return (
      <Card className="medical-card m-6">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <Pill className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Please select a clinic to view prescriptions.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="medical-card m-6">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <Activity className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-destructive">Error loading prescriptions.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 ">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Pill className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">Prescriptions</h1>
            <p className="text-muted-foreground">Manage patient prescriptions and medication records</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Prescription
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="medical-card shadow-medical">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Prescriptions</p>
                <p className="text-2xl font-bold text-primary">{stats.totalPrescriptions}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Pill className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card shadow-medical">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Prescriptions</p>
                <p className="text-2xl font-bold text-success">{stats.activePrescriptions}</p>
              </div>
              <div className="bg-success/10 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card shadow-medical">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Follow-up Required</p>
                <p className="text-2xl font-bold text-warning">{stats.followUpRequired}</p>
              </div>
              <div className="bg-warning/10 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card shadow-medical">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-accent">{stats.recentPrescriptions}</p>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card className="medical-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search prescriptions by patient, doctor, or medication..."
                className="pl-10 bg-background border-border focus:ring-primary"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-[180px] border-border focus:ring-primary">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prescriptions</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="followup">Follow-up Required</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={(value) => {
              setDateFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-[180px] border-border focus:ring-primary">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions Table */}
      <Card className="medical-card shadow-medical">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <FileText className="w-5 h-5" />
            Prescription Records
            <Badge variant="default" className="status-badge status-active">{filteredPrescriptions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-md animate-pulse" />
              ))}
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No prescriptions found</p>
              <p className="text-sm">Prescriptions will appear here as they are created</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Medications</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Follow-up</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.map((prescription) => {
                  const isActive = !prescription.follow_up_date || new Date(prescription.follow_up_date) >= new Date();
                  const needsFollowUp = prescription.follow_up_date && new Date(prescription.follow_up_date) <= new Date();

                  return (
                    <TableRow
                      key={prescription.id}
                      className="cursor-pointer hover:bg-primary/5"
                      onClick={() => handleViewPrescription(prescription)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{prescription.patient_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {prescription.patient_gender} • Age {prescription.patient_age || 'Unknown'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{prescription.doctor_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{getMedicationCount(prescription.medications)} medication(s)</div>
                          <div className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {formatMedications(prescription.medications)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {format(parseISO(prescription.created_at!), 'PPP')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {prescription.follow_up_date ? (
                          <div className={needsFollowUp ? 'text-orange-600' : ''}>
                            {format(parseISO(prescription.follow_up_date), 'PP')}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`status-badge ${needsFollowUp ? 'status-pending' :
                          isActive ? 'status-active' :
                            'status-inactive'
                          }`}>
                          {needsFollowUp ? 'Follow-up Due' : isActive ? 'Active' : 'Completed'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPrescription(prescription);
                          }}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (pageNum <= totalPages && pageNum > 0) {
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescription View Modal */}
      <PrescriptionViewModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        prescription={selectedPrescription}
      />

      {/* Prescription Create Modal */}
      <PrescriptionModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        consultationId={null}
        appointment={null}
        doctorId={null}
        patientId={null}
        clinicId={activeClinic?.clinic_id || null}
      />

      {/* Add Create Prescription button */}


      {/* Prescription Modal for manual/selected context */}
      <PrescriptionModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        consultationId={null}
        appointment={selectedAppointmentForPrescription}
        doctorId={manualDoctorId}
        patientId={manualPatientId}
        clinicId={activeClinic?.clinic_id || null}
      />
    </div>
  );
};

export default Prescriptions; 