import React from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { formatTimeIST } from "@/lib/utils";
import { Appointment } from "@/hooks/useConsultation";

interface ConsultationHeaderProps {
  appointment: Appointment | null;
  effectiveDepartmentType: string;
  isCurrentUserSuperadminConsulting: boolean;
  autoSaveStatus: { status: 'idle' | 'saving' | 'saved' | 'error'; timestamp?: string };
  editedFields: string[];
  getAge: (dateString?: string | null) => string;
}

export const ConsultationHeader: React.FC<ConsultationHeaderProps> = ({
  appointment,
  effectiveDepartmentType,
  isCurrentUserSuperadminConsulting,
  autoSaveStatus,
  editedFields,
  getAge,
}) => {
  return (
    <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b bg-background">
      <div className="flex items-center justify-between">
        <DialogTitle className="text-base sm:text-lg font-semibold text-foreground">
          {appointment?.patient_name || 'Unknown Patient'} - Consultation
          {effectiveDepartmentType && (
            <Badge className="status-badge status-pending ml-2 text-xs">
              {effectiveDepartmentType}
              {isCurrentUserSuperadminConsulting && effectiveDepartmentType === 'General' && " (Default)"}
            </Badge>
          )}
        </DialogTitle>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mr-4">
          {autoSaveStatus.status === 'saving' && <span>Saving...</span>}
          {autoSaveStatus.status === 'saved' && autoSaveStatus.timestamp && (
            <span>Saved at {autoSaveStatus.timestamp}</span>
          )}
          {autoSaveStatus.status === 'error' && (
            <span className="text-destructive">Error</span>
          )}
        </div>
      </div>
      
      {appointment && (
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Doctor:</span> {appointment.doctor_name || 'Unknown Doctor'}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span>
              {format(parseISO(appointment.date), 'PPP')} at {formatTimeIST(appointment.time)}
            </span>
            {appointment.patient_date_of_birth && (
              <span>{getAge(appointment.patient_date_of_birth)} yrs</span>
            )}
            {appointment.patient_gender && (
              <span className="capitalize">{appointment.patient_gender}</span>
            )}
          </div>
        </div>
      )}
      
      {editedFields.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="text-xs text-muted-foreground">Edited:</span>
          {editedFields.slice(0, 3).map((field) => (
            <Badge key={field} variant="secondary" className="text-xs">
              {field}
            </Badge>
          ))}
          {editedFields.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{editedFields.length - 3} more
            </Badge>
          )}
        </div>
      )}
    </DialogHeader>
  );
}; 