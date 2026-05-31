// File: components/consultation/ConsultationParts.tsx
import React from "react";
import { format } from "date-fns";
import { formatTimeIST } from "@/lib/utils";
import { Phone, Mail, MapPin, Globe } from "lucide-react";
import { DbAppointment } from "@/types/core";
import {
  PatientWithClinic,
  ClinicInfo,
  DoctorInfo,
} from "@/types/consultation";

export const ConsultationHeader: React.FC<{
  clinicInfo: ClinicInfo | null;
  doctorInfo: DoctorInfo | null;
}> = ({ clinicInfo, doctorInfo }) => {
  return (
    <div className="letterhead w-full mb-6 print:mb-4">
      {/* Design Philosophy:
        1. No background colors (saves ink).
        2. High contrast text (slate-900) for readability.
        3. Subtle accent color (blue-700) for branding, but thin lines only.
        4. Bottom border separates header from content cleanly.
      */}

      <div className="flex justify-between items-start border-b border-border pb-4">
        {/* LEFT: Clinic Details */}
        <div className="clinic-info max-w-[50%] space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground uppercase tracking-wide leading-none">
              {clinicInfo?.name}
            </h1>
            {/* A single thin accent line for branding */}
          </div>

          <div className="text-xs text-muted-foreground space-y-1 font-medium">
            {clinicInfo?.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                <span className="leading-tight">{clinicInfo.address}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {clinicInfo?.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span>{clinicInfo.phone}</span>
                </div>
              )}
              {clinicInfo?.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span>{clinicInfo.email}</span>
                </div>
              )}
              {clinicInfo?.website && (
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3 w-3 text-muted-foreground" />
                  <span>{clinicInfo.website}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Doctor Details */}
        <div className="doctor-info text-right max-w-[45%]">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">
              {doctorInfo?.name}
            </h2>
            <div className="text-sm font-semibold text-primary uppercase tracking-wider">
              {doctorInfo?.specialization}
            </div>
          </div>

          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            {doctorInfo?.qualification && (
              <div className="uppercase tracking-tight">
                {typeof doctorInfo.qualification === 'string' ? doctorInfo.qualification : String(doctorInfo.qualification)}
              </div>
            )}
            {typeof doctorInfo?.registration_number === 'string' && doctorInfo.registration_number && (
              <div className="font-mono text-muted-foreground">
                Reg: {doctorInfo.registration_number}
              </div>
            )}
            {typeof doctorInfo?.email === 'string' && doctorInfo.email && (
              <div className="flex items-center justify-end gap-1.5 mt-1 text-muted-foreground">
                <span>{doctorInfo.email}</span>
                <Mail className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Optional: Very subtle date printed automatically if you want
      <div className="text-[10px] text-slate-300 text-right mt-1 print:block hidden">
        Printed on {new Date().toLocaleDateString()}
      </div> 
      */}
    </div>
  );
};


export const ConsultationSignatureFooter: React.FC<{
  signature?: string | null;
}> = ({ signature }) => {
  if (!signature) return null;

  const lines = signature.split('\n').filter(l => l.trim() !== '');
  if (lines.length === 0) return null;
  const [name, ...credentials] = lines;
  const hasImplicitBreaks = lines.length === 1 && name.includes(',');
  const creds = hasImplicitBreaks
    ? name.split(',').map(s => s.trim()).filter(Boolean).slice(1)
    : credentials;
  const displayName = hasImplicitBreaks ? name.split(',')[0].trim() : name;

  return (
    <div id="signature-footer" className="w-[250px] mt-4 pt-4 border-t border-border print:mt-4 print:pt-2 break-inside-avoid">
      <div className="text-left">
        <div className="text-sm text-foreground font-bold leading-relaxed">
          {displayName}
        </div>
        {creds.map((cred: string, idx: number) => (
          <div key={idx} className="text-xs leading-relaxed mt-0.5">
            {cred}
          </div>
        ))}
      </div>
    </div>
  );
};



export const ConcisePatientInfo: React.FC<{
  patient: PatientWithClinic;
  appointment: DbAppointment | null;
  departmentType?: string;
}> = ({ patient, appointment, departmentType }) => {
  return (
    <div className="mb-4 print:mb-3">
      <h3 className="text-lg font-semibold text-foreground mb-2 pb-1 border-b border-border print:mb-1">
        PATIENT INFORMATION
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
        <div>
          <span className="font-bold text-foreground">Name: </span>
          <span className="text-foreground">{patient?.name || '—'}</span>
        </div>
        <div>
          <span className="font-bold text-foreground">Age: </span>
          <span className="text-foreground">
            {patient?.age ? `${patient.age} years` : '—'}
            {patient?.gender ? `, ${patient.gender}` : ''}
          </span>
        </div>
        {departmentType && departmentType !== "General" && (
          <div>
            <span className="font-bold text-foreground">Department: </span>
            <span className="text-foreground">{departmentType}</span>
          </div>
        )}
        <div>
          <span className="font-bold text-foreground">Address: </span>
          <span className="text-foreground">{patient?.address || '—'}</span>
        </div>
        <div>
          <span className="font-bold text-foreground">Medical ID: </span>
          <span className="text-foreground">{patient?.medical_id || '—'}</span>
        </div>
        {appointment?.date && (
          <div className="md:col-span-2">
            <span className="font-bold text-foreground">Appointment: </span>
            <span className="text-foreground">
              {format(new Date(appointment.date), "MMM d, yyyy")}
              {appointment?.time && ` • ${formatTimeIST(appointment.time)}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
