// src/components/consultation/consultationPrintUtils.ts
import { ConsultationFormValues } from '@/types/consultation';
import { DbPatient } from '@/types/core';
import { Tables } from '@/integrations/supabase/types';
import { createRoot } from 'react-dom/client';
import { ConsultationLayout } from './ConsultationLayout';
import React from 'react';

// Flexible doctor type that works with both profiles and doctors table
type DoctorInfo = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  qualification?: string | null;
  registration_number?: string | null;
  specialization?: string | null;
  [key: string]: unknown;
};

type AppointmentRow = Tables<'appointments'>;
type Clinic = Tables<'clinics'>;
type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string };
};

// Helper function to generate proper filename
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
// Adjust this value to match the height of your physical paper's letterhead.
const PRINT_TOP_MARGIN = '45mm'; 
// Adjust this to prevent content from hitting the bottom edge or physical footer.
const PRINT_BOTTOM_MARGIN = '20mm'; 
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
      // Pass null to hide the digital letterhead
      clinicInfo: null, 
      doctorInfo: null, 
      consultationData: formData,
      departmentType,
      showPrintStyles: true,
      className: 'print-layout'
    })
  );

  return new Promise<string>((resolve) => {
    setTimeout(() => {
      // CSS explanation: margin: TOP RIGHT BOTTOM LEFT
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
              margin: 8mm; 
              size: A4; 
            }
            * { 
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.5; 
              color: #374151;
              background: white;
          font-size: 12px;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            @media print {
              @page { 
                /* UPDATED: Added PRINT_BOTTOM_MARGIN */
                margin: ${PRINT_TOP_MARGIN} 8mm ${PRINT_BOTTOM_MARGIN} 8mm; 
                size: A4; 
              }
            }
            
            @page { 
              /* UPDATED: Added PRINT_BOTTOM_MARGIN */
              margin: ${PRINT_TOP_MARGIN} 8mm ${PRINT_BOTTOM_MARGIN} 8mm !important; 
              size: A4 !important;
              @top-left { content: "" !important; }
              @top-center { content: "" !important; }
              @top-right { content: "" !important; }
              @bottom-left { content: "" !important; }
              @bottom-center { content: "" !important; }
              @bottom-right { content: "" !important; }
            }
            
            @media print {
              body { 
                margin: 0 !important;
                padding: 0 !important;
              }
              .max-w-4xl { 
                max-width: 100% !important; 
                margin: 0 !important;
                padding: 0 !important;
              }
              .mx-auto { margin-left: 0 !important; margin-right: 0 !important; }
              .no-print { display: none !important; }
              
              .letterhead { 
                display: none !important;
                margin: 0 !important;
                padding: 0 !important; 
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

              /* Ensure compact fields display properly in print */
              .flex {
                display: flex !important;
              }

              .flex-1 {
                flex: 1 !important;
              }

              .items-start {
                align-items: flex-start !important;
              }

              .gap-2 {
                gap: 0.5rem !important;
              }
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
      console.error('Could not open print window');
      return;
    }

    printWindow.document.title = filename;
    try {
      printWindow.history.replaceState({}, '', '');
    } catch {
      // Ignore history replace errors
    }
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    const additionalCSS = printWindow.document.createElement('style');
    // UPDATED: Added PRINT_BOTTOM_MARGIN here
    additionalCSS.textContent = `
      @page {
        margin: ${PRINT_TOP_MARGIN} 15mm ${PRINT_BOTTOM_MARGIN} 15mm !important;
        size: A4 !important;
        @top-left { content: "" !important; }
        @top-center { content: "" !important; }
        @top-right { content: "" !important; }
        @bottom-left { content: "" !important; }
        @bottom-center { content: "" !important; }
        @bottom-right { content: "" !important; }
      }
      @media print {
        @page {
          margin: ${PRINT_TOP_MARGIN} 8mm ${PRINT_BOTTOM_MARGIN} 8mm !important;
          size: A4 !important;
          @top-left { content: "" !important; }
          @top-center { content: "" !important; }
          @top-right { content: "" !important; }
          @bottom-left { content: "" !important; }
          @bottom-center { content: "" !important; }
          @bottom-right { content: "" !important; }
        }
        html::before, html::after,
        body::before, body::after {
          display: none !important;
          content: "" !important;
        }
        
        .space-y-6 > * + * { margin-top: 0.75rem !important; }
        .space-y-4 > * + * { margin-top: 0.5rem !important; }
        .section-notes { margin-bottom: 0.75rem !important; }

        .grid.grid-cols-1\\/md\\:grid-cols-2\\/lg\\:grid-cols-3 {
          grid-template-columns: 1fr 1fr 1fr !important;
        }

        /* Ensure compact fields display properly in print */
        .flex {
          display: flex !important;
        }

        .flex-1 {
          flex: 1 !important;
        }

        .items-start {
          align-items: flex-start !important;
        }

        .gap-2 {
          gap: 0.5rem !important;
        }
      }
    `;
    printWindow.document.head.appendChild(additionalCSS);
    
    const script = printWindow.document.createElement('script');
    // UPDATED: Added PRINT_BOTTOM_MARGIN in the beforeprint script
    script.textContent = `
      window.addEventListener('beforeprint', function() {
        document.title = '${filename}';
        const extraStyle = document.createElement('style');
        extraStyle.textContent = \`
          @page {
            margin: ${PRINT_TOP_MARGIN} 8mm ${PRINT_BOTTOM_MARGIN} 8mm !important;
            size: A4 !important;
            @top-left { content: "" !important; }
            @top-center { content: "" !important; }
            @top-right { content: "" !important; }
            @bottom-left { content: "" !important; }
            @bottom-center { content: "" !important; }
            @bottom-right { content: "" !important; }
          }
        \`;
        document.head.appendChild(extraStyle);
      });
    `;
    printWindow.document.head.appendChild(script);
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  } catch (error) {
    console.error('Error generating print content:', error);
  }
};