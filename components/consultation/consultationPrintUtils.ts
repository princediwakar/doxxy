import { logger } from "@/lib/logger";
import { FieldValue } from '@/types/consultation';
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
  signature?: string | null;
  [key: string]: unknown;
};

type AppointmentRow = DbAppointment;
type Clinic = DbClinic;
type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string };
};

function generateConsultationFilename(
  patient: DbPatient,
  appointment: AppointmentRow | null,
  departmentType: string
): string {
  const patientName = patient?.name?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'Patient';
  const appointmentDate = appointment?.date ? new Date(appointment.date) : new Date();
  const dateStr = appointmentDate.toISOString().split('T')[0];
  return `${patientName}_${dateStr}_${departmentType}_Consultation`;
};

const PRINT_TOP_MARGIN = '45mm';
const PRINT_BOTTOM_MARGIN = '20mm';
const PRINT_LEFT_MARGIN = '20mm';
const PRINT_RIGHT_MARGIN = '20mm';

export const generatePrintContent = async (
  formData: Record<string, FieldValue>,
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
      doctorInfo: _doctorDetails ? {
        name: '',
        qualification: '',
        specialization: '',
        registration_number: null,
        signature: _doctorDetails.signature as string
      } : null,
      consultationData: formData,
      departmentType,
      showPrintStyles: true,
      className: 'print-layout'
    })
  );

  // Allow React to finish initial render pass
  await new Promise(resolve => setTimeout(resolve, 50));

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=210mm, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @page { 
          margin: ${PRINT_TOP_MARGIN} ${PRINT_RIGHT_MARGIN} ${PRINT_BOTTOM_MARGIN} ${PRINT_LEFT_MARGIN} !important;
          size: A4 !important; 
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
          width: 210mm; /* Force A4 width for mobile engines */
          margin: 0 auto;
        }
        
        @media print {
          html, body { width: 210mm; height: auto; margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .print-layout { display: block !important; }
          .print-grid-3-cols { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 0.5rem !important; }
          .print-grid-2-cols { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 0.5rem !important; }
        }
      </style>
    </head>
    <body>
      ${container.innerHTML}
    </body>
    </html>
  `;
  root.unmount();
  return html;
};

export const printConsultation = async (
  formData: Record<string, FieldValue>,
  patient: DbPatient,
  appointment: AppointmentRow | null,
  _clinicDetails: Clinic | null | undefined,
  _doctorDetails: DoctorInfo | null | undefined,
  _user: SupabaseUser | null,
  departmentType: string = 'General'
) => {
  try {
    const printContent = await generatePrintContent(formData, patient, appointment, _clinicDetails, _doctorDetails, _user, departmentType);
    const iframe = document.createElement('iframe');
    
    // Hidden but present
    Object.assign(iframe.style, {
      position: 'fixed',
      right: '0',
      bottom: '0',
      width: '0',
      height: '0',
      border: 'none',
      visibility: 'hidden'
    });

    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(printContent);
    doc.close();

    const handlePrint = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      iframe.contentWindow?.addEventListener('afterprint', () => {
        document.body.removeChild(iframe);
      }, { once: true });
    };

    // Wait for the iframe (and Tailwind script) to be fully ready
    if (doc.readyState === 'complete') {
      setTimeout(handlePrint, 500);
    } else {
      iframe.onload = () => setTimeout(handlePrint, 500);
    }
  } catch (error) {
    logger.error('Error generating print content:', error);
  }
};