import React from 'react';
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
type DoctorDetails = Database['public']['Functions']['get_doctors_by_clinic']['Returns'][0];
type AppointmentType = Database['public']['Tables']['appointments']['Row'];

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
    enabled: open && !!appointment?.patient_id && !!activeClinic?.clinic_id && (!appointment.patient_gender || !appointment.patient_date_of_birth),
  });

  // Fetch consultation data
  const { data: consultationData, isLoading: isLoadingConsultation } = useQuery<Consultation | null>({
    queryKey: ['consultation', appointment?.id],
    queryFn: async () => {
      if (!appointment?.id) return null;
      const { data, error } = await supabase
        .from('consultations')
        .select('*, clinical_notes')
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
  const { data: doctorDetails } = useQuery<DoctorDetails[] | null>({
    queryKey: ['doctorDetails', appointment?.doctor_id, activeClinic?.clinic_id],
    queryFn: async () => {
      if (!appointment?.doctor_id || !activeClinic?.clinic_id) return null;
          const { data, error } = await supabase.rpc('get_doctors_by_clinic', {
      clinic_id: activeClinic.clinic_id,
    });
      if (error) throw error;
      const doctor = data?.find(d => d.id === appointment.doctor_id);
      return doctor ? [doctor] : null;
    },
    enabled: open && !!appointment?.doctor_id && !!activeClinic?.clinic_id,
  });

  // Determine department and get field configs
  const departmentType = doctorDetails?.[0]?.department_name || 'General';
  
  // Get consultation specialty data
  const specialtyData = consultationData?.specialty_data && 
    typeof consultationData.specialty_data === 'object' && 
    !Array.isArray(consultationData.specialty_data) 
      ? consultationData.specialty_data as Record<string, unknown>
      : {};

  // Get patient info with fallback to fetched patient data
  const patient = patientData || {
    name: appointment?.patient_name || 'Unknown',
    gender: appointment?.patient_gender || 'Unknown',
    date_of_birth: appointment?.patient_date_of_birth || null,
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
    address: clinicDetails.address,
    phone: clinicDetails.phone,
    email: clinicDetails.email,
    website: clinicDetails.website
  } : null;
  
  // Prepare doctor info
  const doctorInfo = {
    name: doctorDetails?.[0]?.name || appointment?.doctor_name || user?.user_metadata?.full_name || 'Doctor Name',
    specialization: doctorDetails?.[0]?.department_name || departmentType,
    qualification: '', // Default qualification
    registration_number: '', // Not available in current database schema
    phone: doctorDetails?.[0]?.phone || '',
    email: doctorDetails?.[0]?.email || user?.email || '',
    bio: doctorDetails?.[0]?.bio || ''
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
         { ...appointment, notes: appointment.notes || '' },
         clinicDetails,
         doctorInfo,
         user,
         departmentType
       );
      toast.success('Consultation printed successfully');
    } catch (error) {
      console.error('Error printing consultation:', error);
      toast.error('Failed to print consultation');
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Consultation Notes - {patient.name}</span>
          </DialogTitle>
            {consultationData && (
              <Button
                variant="outline"
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