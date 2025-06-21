import { Eye, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConsultationFormValues, Patient } from './types';
import { UseFormReturn } from 'react-hook-form';
import { specialtyFieldSections, FieldSection } from '@/lib/consultationNotesSchemas';
import { Tables } from '@/integrations/supabase/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConsultationLayout } from './ConsultationLayout';
import { useAuth } from '@/contexts/AuthContext';
import { printConsultation } from './printUtils';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

const supabase = getSupabase();

interface ConsultationPreviewModalProps {
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  form: UseFormReturn<ConsultationFormValues>;
  patient: Patient;
  appointment: Tables<'appointments'> | null;
  specialtySections: FieldSection[];
  departmentType?: string;
}

type DoctorDetails = Database['public']['Functions']['get_doctors_by_clinic_enhanced']['Returns'][0];

export const ConsultationPreviewModal = ({
  showPreview,
  setShowPreview,
  form,
  patient,
  appointment,
  specialtySections,
  departmentType = 'General'
}: ConsultationPreviewModalProps) => {
  const { activeClinic, user } = useAuth();
  
  // Get consultation data from form
  const consultationData = form.watch('specialty_data');
  
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
  
  // Fetch doctor details for current user
  const { data: doctorDetails } = useQuery({
    queryKey: ['currentDoctorDetails', activeClinic?.clinic_id, user?.id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id || !user?.id) return null;
      const { data, error } = await supabase.rpc('get_doctors_by_clinic_enhanced', {
        clinic_id: activeClinic.clinic_id,
      });
      if (error) throw error;
      return data?.find(d => d.user_id === user.id) || null;
    },
    enabled: !!activeClinic?.clinic_id && !!user?.id,
  });

    // Prepare doctor info
  const doctorInfo = {
    name: doctorDetails?.name || user?.user_metadata?.full_name || 'Doctor Name',
    specialization: doctorDetails?.department_name || departmentType,
    qualification: 'Medical Doctor', // Default qualification
    registration_number: '', // Not available in current database schema
    phone: doctorDetails?.phone || user?.phone || '',
    email: doctorDetails?.email || user?.email || '',
    bio: doctorDetails?.bio || ''
  };

  const handlePrint = async () => {
    try {
      await printConsultation(
        consultationData,
        patient,
        appointment,
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

  return (
    <Dialog open={showPreview} onOpenChange={setShowPreview}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Consultation Preview
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <ConsultationLayout
            patient={patient}
            appointment={appointment}
            clinicInfo={clinicInfo}
            doctorInfo={doctorInfo}
            consultationData={consultationData}
            specialtySections={specialtySections}
            departmentType={departmentType}
            className="p-4"
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}; 