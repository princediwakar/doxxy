import React from "react";
import { format } from "date-fns";
import { formatTimeIST } from "@/lib/utils";
import { User, Calendar, Phone, Mail, MapPin, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DbAppointment } from "@/types/core";
import {
  PatientWithClinic,
  ClinicInfo,
  DoctorInfo,
} from "@/types/consultation";

export const PrintStyles: React.FC = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
    @media print {
      @page { margin: 10mm; size: A4; }
      body { 
        font-size: 12px !important; 
        -webkit-print-color-adjust: exact !important; 
        print-color-adjust: exact !important; 
        margin: 0 !important; 
        padding: 0 !important; 
      }
      
      /* --- NEW: TABLE HEADER REPEAT LOGIC --- */
      table { width: 100%; }
      thead { display: table-header-group; } 
      tfoot { display: table-footer-group; }
      tr { page-break-inside: avoid; }
      /* -------------------------------------- */

      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
      .avoid-break { page-break-inside: avoid; }
      
      /* ... keep your existing styles below ... */
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .max-w-4xl { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
      
      /* ... rest of your existing styles ... */
      .info-cards { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 0.75rem !important; margin-bottom: 0.5rem !important; page-break-inside: avoid !important; }

      /* Grid layout for consultation content */
      .consultation-content .grid {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 0.75rem !important;
      }
      .consultation-content .grid.grid-cols-1 { grid-template-columns: 1fr !important; }
      .consultation-content .grid.grid-cols-1\\/md\\:grid-cols-2 { grid-template-columns: 1fr 1fr !important; }
      .consultation-content .grid.grid-cols-1\\/md\\:grid-cols-2\\/lg\\:grid-cols-3 { grid-template-columns: 1fr 1fr 1fr !important; }
      .consultation-content .section-notes .grid {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 0.5rem !important;
      }
      .consultation-content .w-full { width: 100% !important; grid-column: 1 / -1 !important; }
      .section-notes { page-break-inside: avoid !important; margin-bottom: 0.75rem !important; }
      .section-notes h3 { margin-bottom: 0.5rem !important; }
      .field-group { page-break-inside: avoid !important; margin-bottom: 0.25rem !important; }
      /* ... */
    }
  `,
    }}
  />
);

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

      <div className="flex justify-between items-start border-b-[1px] border-slate-300 pb-4">
        {/* LEFT: Clinic Details */}
        <div className="clinic-info max-w-[50%] space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide leading-none">
              {clinicInfo?.name}
            </h1>
            {/* A single thin accent line for branding */}
          </div>

          <div className="text-xs text-slate-600 space-y-1 font-medium">
            {clinicInfo?.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                <span className="leading-tight">{clinicInfo.address}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {clinicInfo?.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-slate-400" />
                  <span>{clinicInfo.phone}</span>
                </div>
              )}
              {clinicInfo?.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-slate-400" />
                  <span>{clinicInfo.email}</span>
                </div>
              )}
              {clinicInfo?.website && (
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3 w-3 text-slate-400" />
                  <span>{clinicInfo.website}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Doctor Details */}
        <div className="doctor-info text-right max-w-[45%]">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-800">
              {doctorInfo?.name}
            </h2>
            <div className="text-sm font-semibold text-blue-700 uppercase tracking-wider text-[10px]">
              {doctorInfo?.specialization}
            </div>
          </div>

          <div className="mt-3 space-y-1 text-xs text-slate-500">
            {doctorInfo?.qualification && (
              <div className="uppercase tracking-tight">
                {typeof doctorInfo.qualification === 'string' ? doctorInfo.qualification : String(doctorInfo.qualification)}
              </div>
            )}
            {typeof doctorInfo?.registration_number === 'string' && doctorInfo.registration_number && (
              <div className="font-mono text-slate-400">
                Reg: {doctorInfo.registration_number}
              </div>
            )}
            {typeof doctorInfo?.email === 'string' && doctorInfo.email && (
              <div className="flex items-center justify-end gap-1.5 mt-1 text-slate-600">
                <span>{doctorInfo.email}</span>
                <Mail className="h-3 w-3 text-slate-400" />
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

export const PatientInfoCards: React.FC<{
  patient: PatientWithClinic;
  appointment: DbAppointment | null;
  departmentType: string;
}> = ({ patient, appointment, departmentType }) => {
  return (
    <div className="info-cards grid grid-cols-2 gap-4 mb-4 print:gap-3 print:mb-2">
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <User className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Patient Information</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-900">{patient?.name}</span>
            </div>
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="text-gray-600">Age/Gender:</span>
              <span className="font-medium text-gray-900">
                {patient?.age && `${patient.age} yrs • `}
                {patient?.gender}
              </span>
            </div>
            {patient?.phone && (
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-900">
                  {patient.phone}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="h-5 w-5 text-success" />
            <h3 className="font-semibold text-gray-900">Appointment Details</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="text-gray-600">Date/Time:</span>
              <span className="font-medium text-gray-900">
                {appointment?.date &&
                  format(new Date(appointment.date), "MMM d, yyyy")}
                {appointment?.time && ` • ${formatTimeIST(appointment.time)}`}
              </span>
            </div>
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="text-gray-600">Department:</span>
              <span className="font-medium text-gray-900">
                {departmentType}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
