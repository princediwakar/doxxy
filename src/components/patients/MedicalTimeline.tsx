import { format, parseISO } from 'date-fns';
import { formatTimeIST } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  Stethoscope, 
  Pill, 
  FileText, 
  Clock,
  User,
  Activity,
  Eye
} from 'lucide-react';
import { Tables } from "@/integrations/supabase/types";

// Define proper types
type Consultation = Tables<"consultations"> & {
  appointment?: {
    date: string;
    time: string;
    doctor_name: string;
    department_name: string;
  } | null;
};

type Prescription = Tables<"prescriptions"> & {
  doctor_name?: string;
};

type AppointmentData = Tables<"appointments"> & {
  patient_name?: string;
  doctor_name?: string;
  department_name?: string;
};

interface TimelineEvent {
  id: string;
  type: 'consultation' | 'prescription' | 'appointment';
  date: string;
  time?: string;
  title: string;
  description: string;
  doctor_name?: string;
  department_name?: string;
  status?: string;
  data?: Consultation | Prescription | AppointmentData; // Properly typed data object
}

interface MedicalTimelineProps {
  consultations: Consultation[];
  prescriptions: Prescription[];
  appointments?: AppointmentData[];
  onViewConsultation?: (consultation: Consultation) => void;
  onViewPrescription?: (prescription: Prescription) => void;
  loading?: boolean;
}

export function MedicalTimeline({ 
  consultations, 
  prescriptions, 
  appointments = [], 
  onViewConsultation,
  onViewPrescription,
  loading = false 
}: MedicalTimelineProps) {
  
  // Convert all medical events into timeline events
  const createTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // Add consultation events
    consultations.forEach(consultation => {
      const appointmentDate = consultation.appointment?.date || consultation.created_at;
      if (appointmentDate) {
        events.push({
          id: `consultation-${consultation.id}`,
          type: 'consultation',
          date: appointmentDate,
          time: consultation.appointment?.time,
          title: 'Consultation',
          description: getConsultationDescription(consultation),
          doctor_name: consultation.appointment?.doctor_name,
          department_name: consultation.appointment?.department_name,
          status: 'Completed',
          data: consultation
        });
      }
    });

    // Add prescription events
    prescriptions.forEach(prescription => {
      if (prescription.created_at) {
        events.push({
          id: `prescription-${prescription.id}`,
          type: 'prescription',
          date: prescription.created_at,
          title: 'Prescription',
          description: getPrescriptionDescription(prescription),
          doctor_name: prescription.doctor_name,
          status: 'Prescribed',
          data: prescription
        });
      }
    });

    // Add appointment events (future or past)
    appointments.forEach(appointment => {
      if (appointment.date) {
        events.push({
          id: `appointment-${appointment.id}`,
          type: 'appointment',
          date: appointment.date,
          time: appointment.time,
          title: 'Appointment',
          description: `${appointment.type} appointment`,
          doctor_name: appointment.doctor_name,
          department_name: appointment.department_name,
          status: appointment.status,
          data: appointment
        });
      }
    });

    // Sort by date (most recent first)
    return events.sort((a, b) => {
      const dateA = new Date(a.date + (a.time ? ` ${a.time}` : ''));
      const dateB = new Date(b.date + (b.time ? ` ${b.time}` : ''));
      return dateB.getTime() - dateA.getTime();
    });
  };

  const getConsultationDescription = (consultation: Consultation): string => {
    if (consultation.specialty_data && typeof consultation.specialty_data === 'object') {
      const data = consultation.specialty_data as Record<string, unknown>;
      if (data.chief_complaint && typeof data.chief_complaint === 'string') {
        return `Chief Complaint: ${data.chief_complaint.substring(0, 100)}${data.chief_complaint.length > 100 ? '...' : ''}`;
      }
      if (data.assessment && typeof data.assessment === 'string') {
        return `Assessment: ${data.assessment.substring(0, 100)}${data.assessment.length > 100 ? '...' : ''}`;
      }
    }
    return 'Medical consultation completed';
  };

  const getPrescriptionDescription = (prescription: Prescription): string => {
    if (prescription.medications) {
      if (typeof prescription.medications === 'string') {
        return `Medications: ${prescription.medications.substring(0, 100)}${prescription.medications.length > 100 ? '...' : ''}`;
      } else if (typeof prescription.medications === 'object') {
        return 'Medication prescribed - view details';
      }
    }
    return 'Prescription issued';
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return <Stethoscope className="h-4 w-4" />;
      case 'prescription':
        return <Pill className="h-4 w-4" />;
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string, status?: string) => {
    switch (type) {
      case 'consultation':
        return 'border-l-blue-500 bg-blue-50';
      case 'prescription':
        return 'border-l-green-500 bg-green-50';
      case 'appointment':
        if (status === 'Completed') return 'border-l-purple-500 bg-purple-50';
        if (status === 'Cancelled') return 'border-l-red-500 bg-red-50';
        return 'border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getStatusBadgeVariant = (type: string, status?: string) => {
    if (type === 'consultation') return 'default';
    if (type === 'prescription') return 'secondary';
    if (status === 'Completed') return 'default';
    if (status === 'Cancelled') return 'destructive';
    return 'outline';
  };

  const timelineEvents = createTimelineEvents();

  if (loading) {
    return (
      <ScrollArea className="h-[500px]">
        <div className="space-y-4 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted/50 rounded-md animate-pulse" />
          ))}
        </div>
      </ScrollArea>
    );
  }

  if (timelineEvents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No medical events found</p>
        <p className="text-sm">Medical history will appear here as events are recorded</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-4">
        {timelineEvents.map((event, index) => (
          <Card 
            key={event.id} 
            className={`border-l-4 ${getEventColor(event.type, event.status)} transition-all hover:shadow-md`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="p-2 rounded-full bg-white shadow-sm">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h4 className="font-medium text-foreground">{event.title}</h4>
                      <Badge variant={getStatusBadgeVariant(event.type, event.status)}>
                        {event.status || event.type}
                      </Badge>
                      {event.department_name && (
                        <Badge variant="outline" className="text-xs">
                          {event.department_name}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(parseISO(event.date), 'PPP')}</span>
                      </div>
                      {event.time && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeIST(event.time)}</span>
                        </div>
                      )}
                      {event.doctor_name && (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{event.doctor_name}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {event.type === 'consultation' && onViewConsultation && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewConsultation(event.data as Consultation)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  )}
                  {event.type === 'prescription' && onViewPrescription && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewPrescription(event.data as Prescription)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Timeline connector line */}
              {index < timelineEvents.length - 1 && (
                <div className="ml-6 mt-4 w-px h-4 bg-border"></div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
} 