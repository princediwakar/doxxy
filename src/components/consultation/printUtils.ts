import { ConsultationFormValues, Patient, Clinic } from './types';
import { Tables } from '@/integrations/supabase/types';
import { createRoot } from 'react-dom/client';
import { ConsultationLayout } from './ConsultationLayout';
import React from 'react';

// Flexible doctor type that works with both profiles and doctors table
type DoctorInfo = {
  name?: string;
  email?: string;
  phone?: string;
  qualification?: string;
  registration_number?: string;
  specialization?: string;
  // allow any additional fields without using `any`
  [key: string]: unknown;
};

type AppointmentRow = Tables<'appointments'>;
type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string };
};

export const generatePrintContent = (
  formData: ConsultationFormValues['specialty_data'],
  patient: Patient,
  appointment: AppointmentRow | null,
  clinicDetails: Clinic | null,
  doctorDetails: DoctorInfo | null,
  user: SupabaseUser | null,
  departmentType: string = 'General'
) => {
  // Create a temporary container for React rendering
  const container = document.createElement('div');
  const root = createRoot(container);
  
  // Prepare clinic info for the layout
  const clinicInfo = clinicDetails ? {
    name: clinicDetails.name,
    address: clinicDetails.address,
    phone: clinicDetails.phone,
    email: clinicDetails.email,
    website: clinicDetails.website
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
      <title>Medical Consultation Report</title>
          <meta charset="utf-8">
          <script src="https://cdn.tailwindcss.com"></script>
      <style>
            @page { 
              margin: 15mm; 
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
              @page { margin: 10mm; size: A4; }
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
              
              /* Force two-column layouts to work in print */
              .info-cards { 
                display: grid !important; 
                grid-template-columns: 1fr 1fr !important; 
                gap: 1rem !important; 
              }
              
              /* Force letterhead grid to stay two-column */
              .letterhead .grid { 
                display: grid !important; 
                grid-template-columns: 1fr 1fr !important; 
                gap: 1rem !important; 
              }
              
              /* Reduce letterhead padding for print */
              .letterhead { 
                padding: 1rem !important; 
                margin-bottom: 1rem !important; 
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

// Helper function to generate proper filename for consultation documents
const generateConsultationFilename = (
  patient: Patient,
  appointment: AppointmentRow | null,
  departmentType: string
): string => {
  // Clean patient name for filename (remove special characters)
  const patientName = patient?.name?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'Patient';
  
  // Format date (use appointment date if available, otherwise current date)
  const appointmentDate = appointment?.date ? new Date(appointment.date) : new Date();
  const dateStr = appointmentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Create filename: PatientName_YYYY-MM-DD_Department_Consultation
  return `${patientName}_${dateStr}_${departmentType}_Consultation`;
};

export const printConsultation = async (
  formData: ConsultationFormValues['specialty_data'],
  patient: Patient,
  appointment: AppointmentRow | null,
  clinicDetails: Clinic | null,
  doctorDetails: DoctorInfo | null,
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
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
    
    // Wait for content to load before printing
    setTimeout(() => {
  printWindow.print();
  printWindow.close();
    }, 500);
  } catch (error) {
    console.error('Error generating print content:', error);
  }
}; 