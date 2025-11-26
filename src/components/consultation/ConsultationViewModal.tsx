import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSupabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Eye, Printer } from "lucide-react";
import { specialtyFieldSections } from "@/lib/consultationNotesSchemas";
import { ConsultationLayout } from './ConsultationLayout';
import { printConsultation } from './printUtils';
import { AppointmentData, Patient } from '@/types/patients';

const supabase = getSupabase();

// Types
type Consultation = Database['public']['Tables']['consultations']['Row'];

// Interface for transformed doctor data
interface TransformedDoctorData {
  id: string;
  name: string;
  department_name: string;
  phone: string | null;
  email: string | null;
  bio: string | null;
  user_id?: string; // Optional since we might not have it in transformed data
}

// Interfaces for nested clinic member data
interface DepartmentType {
  name: string;
}

interface ClinicDepartment {
  department_types: DepartmentType;
}

interface ClinicMember {
  clinic_departments: ClinicDepartment;
}

interface ConsultationViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentData | null;
}

export function ConsultationViewModal({ open, onOpenChange, appointment }: ConsultationViewModalProps) {
  const { activeClinic, user } = useAuth();

  // Fetch patient data if not available in appointment object
  const { data: patientData } = useQuery<Patient | null>({
    queryKey: ['patient', appointment?.patient_id],
    queryFn: async () => {
      if (!appointment?.patient_id || !activeClinic?.clinic_id) return null;
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', appointment.patient_id)
        .eq('clinic_id', activeClinic.clinic_id)
        .single();
      if (error) {
        console.error('Failed to fetch patient data:', error);
        return null;
      }
      return data;
    },
    enabled: open && !!appointment?.patient_id && !!activeClinic?.clinic_id && (!appointment.patient_gender || !appointment.patient_age),
  });

  // Fetch consultation data
  const { data: consultationData, isLoading: isLoadingConsultation } = useQuery<Consultation | null>({
    queryKey: ['consultation', appointment?.id],
    queryFn: async () => {
      if (!appointment?.id) return null;
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('appointment_id', appointment.id)
        .single();
      if (error && error.code !== 'PGRST116') {
        toast.error(`Failed to fetch consultation: ${error.message}`);
        throw error;
      }
      return data;
    },
    enabled: open && !!appointment?.id,
  });

  // Fetch doctor details to determine specialty
  const { data: doctorDetails } = useQuery<TransformedDoctorData[] | null>({
    queryKey: ['doctorDetails', appointment?.doctor_id, activeClinic?.clinic_id],
    queryFn: async () => {
      if (!appointment?.doctor_id || !activeClinic?.clinic_id) return null;

      // Try RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_doctors_by_clinic', {
        clinic_id: activeClinic.clinic_id,
      });

      if (!rpcError && rpcData) {
        console.log('RPC function succeeded, returning data:', rpcData);
        const doctor = rpcData?.find(d => d.id === appointment.doctor_id);
        return doctor ? [{
          id: doctor.id,
          name: doctor.name,
          department_name: doctor.department_name,
          phone: doctor.phone,
          email: doctor.email,
          bio: doctor.bio,
          user_id: doctor.user_id
        }] : null;
      }

      console.warn('RPC function failed, using fallback query:', rpcError?.message);

      // Fallback to direct query if RPC fails
      const { data: fallbackData } = await supabase
        .from('doctors')
        .select(`
          id,
          name,
          primary_specialization,
          phone,
          email,
          bio,
          clinic_members!clinic_members_user_id_fkey(
            department_id,
            clinic_departments!clinic_members_department_id_fkey(
              department_type_id,
              department_types!clinic_departments_department_type_id_fkey(name)
            )
          )
        `)
        .eq('clinic_id', activeClinic.clinic_id)
        .eq('is_active', true);

      const transformedData = fallbackData?.map((doctor) => {
        // Type-safe access to nested clinic_members data
        const clinicMember = doctor.clinic_members?.[0] as unknown as ClinicMember | undefined;
        const departmentType = clinicMember?.clinic_departments?.department_types;

        return {
          id: doctor.id,
          name: doctor.name,
          department_name: departmentType?.name ||
                           doctor.primary_specialization ||
                           'General Medicine',
          phone: doctor.phone,
          email: doctor.email,
          bio: doctor.bio
        };
      }) || [];

      const doctor = transformedData?.find(d => d.id === appointment.doctor_id);
      return doctor ? [doctor] : null;
    },
    enabled: open && !!appointment?.doctor_id && !!activeClinic?.clinic_id,
  });

  // Determine department and get field configs
  const firstDoctor = doctorDetails && doctorDetails.length > 0 ? doctorDetails[0] : null;
  const departmentType = firstDoctor?.department_name || 'General';

  // Get consultation specialty data
  const specialtyData = consultationData?.specialty_data &&
    typeof consultationData.specialty_data === 'object' &&
    !Array.isArray(consultationData.specialty_data)
    ? consultationData.specialty_data as Record<string, unknown>
    : {};

  // Get patient info with fallback to fetched patient data
  const patient: Patient = patientData || {
    name: appointment?.patient_name || 'Unknown',
    gender: appointment?.patient_gender || 'Unknown',
    age: appointment?.patient_age || null,
    phone: '',
    email: '',
    address: '',
    clinic_id: activeClinic?.clinic_id || '',
    created_at: '',
    id: '',
    medical_id: ''
  };

  // Get the full clinic object for printing
  const clinicDetails = activeClinic?.clinics || null;

  // Prepare clinic info for layout display
  const clinicInfo = clinicDetails ? {
    name: clinicDetails.name,
    address: clinicDetails.address || undefined,
    phone: clinicDetails.phone || undefined,
    email: clinicDetails.email || undefined,
    website: clinicDetails.website || undefined
  } : null;

  // Prepare doctor info
  const doctorInfo = {
    name: firstDoctor?.name || appointment?.doctor_name || user?.user_metadata?.full_name || 'Doctor Name',
    specialization: firstDoctor?.department_name || departmentType,
    qualification: '', // Default qualification
    registration_number: '', // Not available in current database schema
    phone: firstDoctor?.phone || '',
    email: firstDoctor?.email || user?.email || '',
    bio: firstDoctor?.bio || ''
  };

  // Get field sections for the department
  const sections = specialtyFieldSections[departmentType] || specialtyFieldSections.General;

  const handlePrint = async () => {
    if (!consultationData) {
      toast.error('No consultation data to print');
      return;
    }

    try {

      await printConsultation(
        specialtyData,
        patient,
        { 
          ...appointment, 
          clinic_id: appointment?.clinic_id || '',
          id: appointment?.id || '',
          patient_id: appointment?.patient_id || '',
          doctor_id: appointment?.doctor_id || '',
          date: appointment?.date || '',
          time: appointment?.time || '',
          notes: appointment?.notes || '',
          created_at: appointment?.created_at || null,
          status: appointment?.status || null,
          type: appointment?.type || null
        },
        clinicDetails,
        doctorInfo,
        user,
        departmentType,
      );
      toast.success('Print dialog opened successfully');
    } catch (error) {
      console.error('Error printing consultation:', error);
      toast.error('Failed to open print dialog');
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Consultation Notes - {patient.name}</span>
            </DialogTitle>
            {consultationData && (
              <Button
                size="sm"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          {/* Loading State */}
          {isLoadingConsultation && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading consultation details...</span>
            </div>
          )}

          {/* No Data State */}
          {!isLoadingConsultation && !consultationData && (
            <div className="text-center text-muted-foreground p-8">
              <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No consultation notes found for this appointment.</p>
            </div>
          )}

          {/* Consultation Layout */}
          {!isLoadingConsultation && consultationData && (
            <ConsultationLayout
              patient={patient}
              appointment={{ ...appointment, notes: appointment.notes || '' }}
              clinicInfo={clinicInfo}
              doctorInfo={doctorInfo}
              consultationData={specialtyData}
              specialtySections={sections}
              departmentType={departmentType}
              className="p-4"
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 