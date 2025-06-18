import { ConsultationFormValues, Patient, Clinic } from './types';
import { Tables } from '@/integrations/supabase/types';

// Flexible doctor type that works with both profiles and doctors table
type DoctorInfo = {
  name?: string;
  email?: string;
  phone?: string;
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
  user: SupabaseUser | null
) => {
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Medical Consultation Report</title>
      <style>
        @page { margin: 15mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.5; 
          color: hsl(210, 24%, 16%);
          background: hsl(0, 0%, 99%);
          font-size: 12px;
        }
        .letterhead {
          text-align: center;
          border-bottom: 3px solid hsl(210, 100%, 56%);
          padding: 24px 0;
          margin-bottom: 24px;
          background: linear-gradient(to bottom, hsl(0, 0%, 99%), hsl(210, 20%, 96%));
        }
        .clinic-name {
          font-size: 28px;
          font-weight: 700;
          color: hsl(210, 100%, 56%);
          margin-bottom: 8px;
          letter-spacing: -0.025em;
        }
        .doctor-name {
          font-size: 18px;
          font-weight: 600;
          color: hsl(160, 84%, 39%);
          margin-bottom: 12px;
        }
        .clinic-details {
          font-size: 11px;
          color: hsl(210, 12%, 47%);
          line-height: 1.4;
        }
        .patient-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
          padding: 20px;
          border: 1px solid hsl(210, 20%, 90%);
          background: hsl(210, 20%, 96%);
          border-radius: 8px;
        }
        .info-section h3 {
          font-size: 15px;
          font-weight: 600;
          color: hsl(210, 100%, 56%);
          margin-bottom: 10px;
          border-bottom: 2px solid hsl(210, 100%, 56%);
          padding-bottom: 4px;
        }
        .info-row {
          margin-bottom: 4px;
          display: flex;
        }
        .info-label {
          font-weight: bold;
          min-width: 80px;
          margin-right: 10px;
        }
        .section {
          margin-bottom: 15px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 8px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 3px;
        }
        .section-content {
          margin-left: 10px;
          line-height: 1.5;
        }
        .prescription-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .prescription-table th,
        .prescription-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 11px;
        }
        .prescription-table th {
          background: #f5f5f5;
          font-weight: bold;
        }
        .footer {
          margin-top: 40px;
          text-align: right;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        .doctor-signature {
          margin-top: 30px;
        }
        @media print {
          body { font-size: 11px; }
        }
      </style>
    </head>
    <body>
      <div class="letterhead">
        <div class="clinic-name">${clinicDetails?.name || 'Medical Clinic'}</div>
        <div class="doctor-name">${doctorDetails?.name || user?.user_metadata?.full_name || 'Doctor Name'}</div>
        <div class="clinic-details">
          ${clinicDetails?.address || 'Clinic Address'}<br>
          Email: ${clinicDetails?.email || 'clinic@example.com'} | Phone: ${clinicDetails?.phone || '+1-234-567-8900'}<br>
          ${clinicDetails?.website ? `Website: ${clinicDetails.website}` : ''}
        </div>
      </div>

      <div class="patient-info">
        <div class="info-section">
          <h3>Patient Information</h3>
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span>${patient?.name || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Age:</span>
            <span>${patient?.date_of_birth ? calculateAge(patient.date_of_birth) + ' years' : 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Gender:</span>
            <span>${patient?.gender || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone:</span>
            <span>${patient?.phone || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span>${patient?.email || 'N/A'}</span>
          </div>
        </div>
        <div class="info-section">
          <h3>Appointment Details</h3>
          <div class="info-row">
            <span class="info-label">Date:</span>
            <span>${appointment?.date ? new Date(appointment.date).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Time:</span>
            <span>${appointment?.time || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Type:</span>
            <span>${appointment?.type || 'Consultation'}</span>
          </div>
        </div>
      </div>

      <div class="consultation-content">
        ${Object.entries(formData).map(([key, value]) => {
          if (!value || (Array.isArray(value) && value.length === 0)) return '';
          
          const formatFieldName = (field: string) => {
            return field.replace(/_/g, ' ')
                       .replace(/^./, str => str.toUpperCase())
                       .replace(/([a-z])([A-Z])/g, '$1 $2');
          };

          if (key === 'prescriptions' && Array.isArray(value) && value.length > 0) {
            return `
              <div class="section">
                <div class="section-title">Prescriptions</div>
                <table class="prescription-table">
                  <thead>
                    <tr>
                      <th>Medication</th>
                      <th>Dosage</th>
                      <th>Route</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${value.map(med => `
                      <tr>
                        <td>${med.name || 'N/A'}</td>
                        <td>${med.dosage || 'N/A'}</td>
                        <td>${med.route || 'N/A'}</td>
                        <td>${med.frequency || 'N/A'}</td>
                        <td>${med.duration || 'N/A'}</td>
                        <td>${med.instructions || 'N/A'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `;
          }

          return `
            <div class="section">
              <div class="section-title">${formatFieldName(key)}</div>
              <div class="section-content">${typeof value === 'string' ? value : JSON.stringify(value)}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="footer">
        <div class="doctor-signature">
          <div style="margin-bottom: 40px;">_________________________</div>
          <div><strong>${doctorDetails?.name || user?.user_metadata?.full_name || 'Doctor Name'}</strong></div>
          <div>Medical Doctor</div>
          <div>Date: ${new Date().toLocaleDateString()}</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const printConsultation = (
  formData: ConsultationFormValues['specialty_data'],
  patient: Patient,
  appointment: AppointmentRow | null,
  clinicDetails: Clinic | null,
  doctorDetails: DoctorInfo | null,
  user: SupabaseUser | null
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const printContent = generatePrintContent(
    formData,
    patient,
    appointment,
    clinicDetails,
    doctorDetails,
    user
  );

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}; 