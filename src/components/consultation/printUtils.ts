// src/components/consultation/printUtils.ts
import { ConsultationFormValues, Patient } from './types';
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
  // allow any additional fields without using `any`
  [key: string]: unknown;
};

type AppointmentRow = Tables<'appointments'>;
type Clinic = Tables<'clinics'>;
type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string };
};

// Helper function to generate proper filename for consultation documents
function generateConsultationFilename (
  patient: Patient,
  appointment: AppointmentRow | null,
  departmentType: string
): string {
  // Clean patient name for filename (remove special characters)
  const patientName = patient?.name?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'Patient';

  // Format date (use appointment date if available, otherwise current date)
  const appointmentDate = appointment?.date ? new Date(appointment.date) : new Date();
  const dateStr = appointmentDate.toISOString().split('T')[0]; // YYYY-MM-DD format

  // Create filename: PatientName_YYYY-MM-DD_Department_Consultation
  return `${patientName}_${dateStr}_${departmentType}_Consultation`;
};

export const generatePrintContent = (
  formData: ConsultationFormValues['specialty_data'],
  patient: Patient,
  appointment: AppointmentRow | null,
  clinicDetails: Clinic | null | undefined,
  doctorDetails: DoctorInfo | null | undefined,
  user: SupabaseUser | null,
  departmentType: string = 'General'
) => {
  // Generate filename first
  const filename = generateConsultationFilename(patient, appointment, departmentType);

  // Create a temporary container for React rendering
  const container = document.createElement('div');
  const root = createRoot(container);
  
  // Prepare clinic info for the layout
  const clinicInfo = clinicDetails ? {
    name: clinicDetails.name,
    address: clinicDetails.address || undefined,
    phone: clinicDetails.phone || undefined,
    email: clinicDetails.email || undefined,
    website: clinicDetails.website || undefined
  } : null;
  
  // Prepare doctor info for the layout
  const doctorInfo = {
    name: doctorDetails?.name || user?.user_metadata?.full_name || 'Doctor Name',
    qualification: '',
    registration_number: '',
    specialization: departmentType,
    email: doctorDetails?.email || user?.email || ''
  };

  // Render the ConsultationLayout component to HTML
  root.render(
    React.createElement(ConsultationLayout, {
      patient,
      appointment,
      clinicInfo,
      doctorInfo,
      consultationData: formData,
      departmentType,
      showPrintStyles: true,
      className: 'print-layout'
    })
  );

  // Wait for rendering to complete and get the HTML
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
            
            /* Force layout consistency for print */
            @media print {
              @page { 
                margin: 6mm 8mm 8mm 8mm; 
                size: A4; 
              }
              
              /* Additional @page rule without @media wrapper for better compatibility */
            }
            
            /* Standalone @page rule for broader browser support */
            @page { 
              margin: 6mm 8mm 8mm 8mm !important; 
              size: A4 !important;
              /* Completely disable all browser headers and footers */
              @top-left { content: "" !important; }
              @top-center { content: "" !important; }
              @top-right { content: "" !important; }
              @bottom-left { content: "" !important; }
              @bottom-center { content: "" !important; }
              @bottom-right { content: "" !important; }
              @top-left-corner { content: "" !important; }
              @top-right-corner { content: "" !important; }
              @bottom-left-corner { content: "" !important; }
              @bottom-right-corner { content: "" !important; }
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
              
              
              
              /* Reduce letterhead padding for print */
              .letterhead { 
                margin: 0 !important;
                padding: 0.5rem !important; 
                margin-bottom: 0.5rem !important; 
              }
              
              /* Reduce spacing between consultation sections */
              .space-y-6 > * + * {
                margin-top: 0.75rem !important;
              }
              
              .space-y-4 > * + * {
                margin-top: 0.5rem !important;
              }
              
              /* Ensure sections are tightly spaced */
              .section-notes {
                margin-bottom: 0.75rem !important;
              }

              .section-notes h3 {
                margin-bottom: 0.5rem !important;
              }

              .field-group {
                margin-bottom: 0.25rem !important;
              }

              /* Force 3-column layout specifically for 3-field grids in print */
              .grid.grid-cols-1\\/md\\:grid-cols-2\\/lg\\:grid-cols-3 {
                grid-template-columns: 1fr 1fr 1fr !important;
              }

            }

      </style>
    </head>
    <body>
          ${container.innerHTML}
    </body>
    </html>
  `;
      
      // Clean up
      root.unmount();
      resolve(html);
    }, 100);
  });
};

/**
 * Print consultation function
 * 
 * IMPORTANT: Browser Print Dialog Behavior
 * - The browser's print dialog may show "Headers and footers" as checked by default
 * - This is controlled by browser settings and cannot be programmatically changed
 * - For cleanest results, users should uncheck "Headers and footers" in the print dialog
 * - Our CSS attempts to suppress headers/footers but browser behavior varies
 */
export const printConsultation = async (
  formData: ConsultationFormValues['specialty_data'],
  patient: Patient,
  appointment: AppointmentRow | null,
  clinicDetails: Clinic | null | undefined,
  doctorDetails: DoctorInfo | null | undefined,
  user: SupabaseUser | null,
  departmentType: string = 'General'
) => {
  try {
    const printContent = await generatePrintContent(
    formData,
    patient,
    appointment,
    clinicDetails,
    doctorDetails,
      user,
      departmentType
    );

    // Generate proper filename for the document
    const filename = generateConsultationFilename(patient, appointment, departmentType);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Could not open print window');
      return;
    }

    // Set the document title to our generated filename
    printWindow.document.title = filename;
    // Replace the URL so that browsers don't print about:blank in the footer
    try {
      printWindow.history.replaceState({}, '', '');
    } catch {
      // Some browsers might restrict this; ignore safely
    }
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Add additional CSS to aggressively suppress headers and footers
    const additionalCSS = printWindow.document.createElement('style');
    additionalCSS.textContent = `
      @page {
        margin: 10mm 15mm 10mm 15mm !important;
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
          margin: 6mm 8mm 8mm 8mm !important;
          size: A4 !important;
          @top-left { content: "" !important; }
          @top-center { content: "" !important; }
          @top-right { content: "" !important; }
          @bottom-left { content: "" !important; }
          @bottom-center { content: "" !important; }
          @bottom-right { content: "" !important; }
        }
        /* Hide any default browser headers/footers */
        html::before, html::after,
        body::before, body::after {
          display: none !important;
          content: "" !important;
        }
        
        /* Additional spacing fixes */
        .space-y-6 > * + * {
          margin-top: 0.75rem !important;
        }
        
        .space-y-4 > * + * {
          margin-top: 0.5rem !important;
        }
        
        .section-notes {
          margin-bottom: 0.75rem !important;
        }

        /* Force 3-column layout specifically for 3-field grids in print */
        .grid.grid-cols-1\\/md\\:grid-cols-2\\/lg\\:grid-cols-3 {
          grid-template-columns: 1fr 1fr 1fr !important;
        }







      }
    `;
    printWindow.document.head.appendChild(additionalCSS);
    
    // Add a script to handle print events
    const script = printWindow.document.createElement('script');
    script.textContent = `
      // Ensure no headers/footers even if browser setting is enabled
      window.addEventListener('beforeprint', function() {
        document.title = '${filename}';
        
        // Add extra CSS right before printing
        const extraStyle = document.createElement('style');
        extraStyle.textContent = \`
          @page {
            margin: 6mm 8mm 8mm 8mm !important;
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
    
    // Wait for content to load before printing
    setTimeout(() => {
  printWindow.print();
  printWindow.close();
    }, 500);
  } catch (error) {
    console.error('Error generating print content:', error);
  }
}; 