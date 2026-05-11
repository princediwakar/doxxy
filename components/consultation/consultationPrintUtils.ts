// File: components/consultation/consultationPrintUtils.ts
import { logger } from "@/lib/logger";
import { ConsultationFormValues } from '@/types/consultation';
import { DbPatient, DbAppointment, DbClinic } from '@/types/core';
import { createRoot } from 'react-dom/client';
import { ConsultationLayout } from './ConsultationLayout';
import React from 'react';

type DoctorInfo = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  qualification?: string | null;
  registration_number?: string | null;
  specialization?: string | null;
  [key: string]: unknown;
};

type AppointmentRow = DbAppointment;
type Clinic = DbClinic;
type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string };
};

function generateConsultationFilename (
  patient: DbPatient,
  appointment: AppointmentRow | null,
  departmentType: string
): string {
  const patientName = patient?.name?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'Patient';
  const appointmentDate = appointment?.date ? new Date(appointment.date) : new Date();
  const dateStr = appointmentDate.toISOString().split('T')[0];
  return `${patientName}_${dateStr}_${departmentType}_Consultation`;
};

// --- CONFIGURATION ---
const PRINT_TOP_MARGIN = '45mm'; 
const PRINT_BOTTOM_MARGIN = '20mm'; // Back to standard. The table natively creates the gap.
const PRINT_LEFT_MARGIN = '20mm';
const PRINT_RIGHT_MARGIN = '20mm';
// ---------------------

export const generatePrintContent = (
  formData: ConsultationFormValues['specialty_data'],
  patient: DbPatient,
  appointment: AppointmentRow | null,
  _clinicDetails: Clinic | null | undefined,
  _doctorDetails: DoctorInfo | null | undefined,
  _user: SupabaseUser | null,
  departmentType: string = 'General'
) => {
  const filename = generateConsultationFilename(patient, appointment, departmentType);
  const container = document.createElement('div');
  const root = createRoot(container);
  
  root.render(
    React.createElement(ConsultationLayout, {
      patient,
      appointment,
      clinicInfo: null,
      doctorInfo: _doctorDetails ? { name: '', qualification: '', specialization: '', signature: _doctorDetails.signature as string } : null,
      consultationData: formData,
      departmentType,
      showPrintStyles: true,
      className: 'print-layout'
    })
  );

  return new Promise<string>((resolve) => {
    setTimeout(() => {
      const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
          <meta charset="utf-8">
          <meta name="format-detection" content="telephone=no">
          <meta name="print-option" content="no-header-footer">
          <script src="https://cdn.tailwindcss.com"></script>
      <style>
            @page { 
              margin: ${PRINT_TOP_MARGIN} ${PRINT_RIGHT_MARGIN} ${PRINT_BOTTOM_MARGIN} ${PRINT_LEFT_MARGIN} !important;
              size: A4 !important; 
              @top-left { content: "" !important; }
              @top-center { content: "" !important; }
              @top-right { content: "" !important; }
              @bottom-left { content: "" !important; }
              @bottom-center { content: "" !important; }
              @bottom-right { content: "" !important; }
            }
            
            * { 
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            body { 
              font-family: 'Inter', sans-serif;
              line-height: 1.5; 
              color: #374151;
              background: white;
              font-size: 12px;
            }
            
            @media print {
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    height: auto !important; 
    min-height: 100% !important; 
  }
  
  .max-w-4xl {
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  .mx-auto { margin-left: 0 !important; margin-right: 0 !important; }
  .no-print { display: none !important; }
  .letterhead { display: none !important; }

  .print-layout {
    display: block !important;
    height: auto !important;
    min-height: 0 !important;
  }

  /* Table rules to trigger the repeating footer */
  table { width: 100%; }
  tfoot { display: table-footer-group; }

  .space-y-6 > * + * { margin-top: 0.75rem !important; }
  .space-y-4 > * + * { margin-top: 0.5rem !important; }
  .section-notes { margin-bottom: 0.75rem !important; }

  .print-grid-3-cols {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 0.5rem !important;
  }
  
  .print-grid-2-cols {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 0.5rem !important;
  }

  .print-grid-3-cols > div, .print-grid-2-cols > div { min-width: 0; }
  .flex { display: flex !important; }
  .flex-1 { flex: 1 !important; }
  .items-start { align-items: flex-start !important; }
  .gap-2 { gap: 0.5rem !important; }
}
              .space-y-6 > * + * { margin-top: 0.75rem !important; }
              .space-y-4 > * + * { margin-top: 0.5rem !important; }
              .section-notes { margin-bottom: 0.75rem !important; }

              .print-grid-3-cols {
                display: grid !important;
                grid-template-columns: repeat(3, 1fr) !important;
                gap: 0.5rem !important;
              }

              .print-grid-2-cols {
                display: grid !important;
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 0.5rem !important;
              }

              .print-grid-3-cols > div,
              .print-grid-2-cols > div {
                min-width: 0;
              }

              .flex { display: flex !important; }
              .flex-1 { flex: 1 !important; }
              .items-start { align-items: flex-start !important; }
              .gap-2 { gap: 0.5rem !important; }
            }
      </style>
    </head>
    <body>
          ${container.innerHTML}
    </body>
    </html>
  `;
      root.unmount();
      resolve(html);
    }, 100);
  });
};

export const printConsultation = async (
  formData: ConsultationFormValues['specialty_data'],
  patient: DbPatient,
  appointment: AppointmentRow | null,
  _clinicDetails: Clinic | null | undefined,
  _doctorDetails: DoctorInfo | null | undefined,
  _user: SupabaseUser | null,
  departmentType: string = 'General'
) => {
  try {
    const printContent = await generatePrintContent(
      formData,
      patient,
      appointment,
      _clinicDetails,
      _doctorDetails,
      _user,
      departmentType
    );

    const filename = generateConsultationFilename(patient, appointment, departmentType);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      logger.error('Could not open print window');
      return;
    }

    printWindow.document.title = filename;
    try {
      printWindow.history.replaceState({}, '', '');
    } catch {}
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Cleaned up the redundant CSS injection. 
    // The iframe/window will respect the styles built into the HTML string perfectly.
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  } catch (error) {
    logger.error('Error generating print content:', error);
  }
};