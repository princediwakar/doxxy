import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getSupabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { 
  History, 
  Stethoscope, 
  ClipboardList, 
  User, 
  Calendar,
  FileText,
  Building2,
  Pill
} from "lucide-react";
import {
  specialtyNoteFieldConfigs,
  NoteFieldConfig,
} from "@/lib/consultationNotesSchemas";

const supabase = getSupabase();

// Types
type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  patient_name?: string;
  doctor_name?: string;
  patient_date_of_birth?: string | null;
  patient_gender?: string | null;
};
type Consultation = Database['public']['Tables']['consultations']['Row'];
type DoctorDetails = Database['public']['Functions']['get_doctors_by_clinic']['Returns'][0];

interface ConsultationViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

// Section definitions for organizing the view
const viewSectionDefinitions = [
  {
    key: "Patient Information",
    icon: User,
    fields: ["patient_info"],
  },
  {
    key: "History",
    icon: History,
    fields: [
      "chief_complaint",
      "history_of_present_illness",
      "review_of_systems",
      "past_medical_history",
      "family_history",
      "social_history",
      "medications",
      "allergies",
    ],
  },
  {
    key: "Examination",
    icon: Stethoscope,
    neurologyFields: ["physical_exam", "neurological_exam_findings"],
    ophthalmologyFields: [
      "physical_exam",
      "visual_acuity",
      "refraction",
      "slit_lamp_exam",
      "fundus_exam",
      "intraocular_pressure",
      "visual_fields",
    ],
    generalFields: ["physical_exam"],
  },
  {
    key: "Assessment & Plan",
    icon: ClipboardList,
    fields: [
      "investigations",
      "assessment",
      "treatment_plan",
      "prognosis",
      "follow_up",
      "referrals",
    ],
  },
];

export function ConsultationViewModal({ open, onOpenChange, appointment }: ConsultationViewModalProps) {
  const { activeClinic } = useAuth();

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
  const fieldConfigs = specialtyNoteFieldConfigs[departmentType] || specialtyNoteFieldConfigs['General'];

  // Get specialty data
  const specialtyData = consultationData?.specialty_data && 
    typeof consultationData.specialty_data === 'object' && 
    !Array.isArray(consultationData.specialty_data) 
      ? consultationData.specialty_data as Record<string, unknown>
      : {};

  // Helper function to get field value
  const getFieldValue = (fieldName: string) => {
    if (fieldName === 'patient_info') {
      return `${appointment?.patient_name || 'Unknown'} | ${appointment?.patient_gender || 'Unknown'} | DOB: ${appointment?.patient_date_of_birth || 'Unknown'}`;
    }
    return specialtyData?.[fieldName] as string || null;
  };

  // Helper function to get field label
  const getFieldLabel = (fieldName: string) => {
    if (fieldName === 'patient_info') return 'Patient Information';
    const config = fieldConfigs.find(c => c.name === fieldName);
    return config?.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Build sections dynamically
  const sections = viewSectionDefinitions.map((section) => {
    let fields: string[] = [];
    
    if (section.key === "Patient Information") {
      fields = section.fields || [];
    } else if (section.key === "Examination") {
      if (departmentType === "Neurology") {
        fields = section.neurologyFields || [];
      } else if (departmentType === "Ophthalmology") {
        fields = section.ophthalmologyFields || [];
      } else {
        fields = section.generalFields || [];
      }
    } else {
      fields = section.fields || [];
    }

    // Filter fields that have values
    const fieldsWithValues = fields.filter(field => {
      const value = getFieldValue(field);
      return value && value.trim().length > 0;
    });

    return {
      ...section,
      fields: fieldsWithValues,
    };
  }).filter(section => section.fields.length > 0);

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Consultation Notes</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh]">
          <div className="space-y-6 p-1">
            {/* Header Information */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="text-lg font-semibold">
                        {format(parseISO(appointment.date), 'PPP')} at {appointment.time}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {appointment.doctor_name} | {departmentType} Department
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      <Building2 className="h-3 w-3 mr-1" />
                      {departmentType}
                    </Badge>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Loading State */}
            {isLoadingConsultation && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading consultation details...</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Data State */}
            {!isLoadingConsultation && !consultationData && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No consultation notes found for this appointment.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Consultation Sections */}
            {!isLoadingConsultation && consultationData && sections.map((section) => (
              <Card key={section.key}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <section.icon className="h-4 w-4" />
                    <span>{section.key}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.fields.map((field, index) => {
                    const value = getFieldValue(field);
                    if (!value) return null;
                    
                    return (
                      <div key={field}>
                        <h4 className="font-medium text-sm text-foreground mb-1">
                          {getFieldLabel(field)}
                        </h4>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-md">
                          {value}
                        </div>
                        {index < section.fields.length - 1 && <Separator className="mt-4" />}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}

            {/* Empty State for No Clinical Notes */}
            {!isLoadingConsultation && consultationData && sections.length === 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No clinical notes were recorded for this consultation.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 