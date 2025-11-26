// Dynamic PDF export functionality to reduce bundle size
import { useState } from 'react';
import { format, parseISO } from 'date-fns';

interface PatientInfo {
  name: string;
  medical_id: string;
  gender: string;
  age: number | null;
  phone?: string;
  email?: string;
}

interface SpecialtyData {
  chief_complaint?: string;
  history_of_present_illness?: string;
  physical_examination?: string;
  assessment?: string;
  plan?: string;
  visual_acuity?: string;
  neurological_findings?: string;
  [key: string]: unknown;
}

interface ConsultationData {
  id: string;
  created_at: string;
  specialty_data: SpecialtyData | null;
  appointment: {
    date: string;
    time?: string;
    doctor_name?: string;
    department_name?: string;
    type?: string;
  };
}

interface MedicationData {
  name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  route?: string;
  eye?: string;
  instructions?: string;
}

interface PrescriptionData {
  id: string;
  medications: MedicationData[];
  created_at: string;
  consultation_id: string;
}

interface ExportOptions {
  includeHeader?: boolean;
  includeFooter?: boolean;
  logoUrl?: string;
  clinicInfo?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

// Dynamically load PDF libraries only when needed
const loadPDFLibraries = async () => {
  const [jsPDFModule, html2canvasModule] = await Promise.all([
    import('jspdf'),
    import('html2canvas')
  ]);
  
  return {
    jsPDF: jsPDFModule.default,
    html2canvas: html2canvasModule.default
  };
};

// Dynamic PDF exporter class
export class DynamicMedicalRecordPDFExporter {
  private jsPDF: typeof import('jspdf').default | null = null;
  private html2canvas: typeof import('html2canvas').default | null = null;
  private isLoaded = false;

  // Initialize PDF libraries dynamically
  private async ensureLibrariesLoaded() {
    if (this.isLoaded) return;
    
    try {
      const { jsPDF, html2canvas } = await loadPDFLibraries();
      this.jsPDF = jsPDF;
      this.html2canvas = html2canvas;
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load PDF libraries:', error);
      throw new Error('PDF export functionality is not available');
    }
  }

  // Export consultation data as PDF
  async exportConsultation(
    patient: PatientInfo,
    consultation: ConsultationData,
    prescriptions: PrescriptionData[] = [],
    options: ExportOptions = {}
  ): Promise<void> {
    await this.ensureLibrariesLoaded();
    
    const pdf = new this.jsPDF!('p', 'mm', 'a4');
    let currentY = 20;

    // Add header if enabled
    if (options.includeHeader !== false) {
      currentY = this.addHeader(pdf, options, currentY);
    }

    // Patient information
    currentY = this.addPatientInfo(pdf, patient, currentY);
    
    // Consultation details
    currentY = this.addConsultationDetails(pdf, consultation, currentY);
    
    // Prescriptions
    if (prescriptions.length > 0) {
      currentY = this.addPrescriptions(pdf, prescriptions, currentY);
    }

    // Use currentY to avoid unused variable warning
    console.debug('PDF generation completed at Y position:', currentY);

    // Add footer if enabled
    if (options.includeFooter !== false) {
      this.addFooter(pdf);
    }

    // Download the PDF
    const filename = `consultation-${patient.name?.replace(/\s+/g, '-') || 'unknown-patient'}-${consultation.id}.pdf`;
    pdf.save(filename);
  }

  // Export HTML element as PDF
  async exportHTMLElement(
    elementId: string,
    filename: string = 'medical-record.pdf'
  ): Promise<void> {
    await this.ensureLibrariesLoaded();
    
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }

    try {
      const canvas = await this.html2canvas!(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new this.jsPDF!('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
    } catch (error) {
      console.error('Failed to export HTML element:', error);
      throw new Error('Failed to generate PDF from HTML element');
    }
  }

  // Private helper methods
  private addHeader(pdf: InstanceType<typeof import('jspdf').default>, options: ExportOptions, startY: number): number {
    const { clinicInfo } = options;
    let currentY = startY;

    if (clinicInfo) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(clinicInfo.name, 20, currentY);
      currentY += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      if (clinicInfo.address) {
        pdf.text(clinicInfo.address, 20, currentY);
        currentY += 5;
      }
      
      if (clinicInfo.phone || clinicInfo.email) {
        const contact = [clinicInfo.phone, clinicInfo.email].filter(Boolean).join(' | ');
        pdf.text(contact, 20, currentY);
        currentY += 5;
      }
    }

    // Add a line separator
    currentY += 5;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, currentY, 190, currentY);
    currentY += 10;

    return currentY;
  }

  private addPatientInfo(pdf: InstanceType<typeof import('jspdf').default>, patient: PatientInfo, startY: number): number {
    let currentY = startY;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Patient Information', 20, currentY);
    currentY += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const patientDetails = [
      `Name: ${patient.name}`,
      `Medical ID: ${patient.medical_id}`,
      `Gender: ${patient.gender}`,
      patient.age ? `Age: ${patient.age} years` : '',
      patient.phone ? `Phone: ${patient.phone}` : '',
      patient.email ? `Email: ${patient.email}` : ''
    ].filter(Boolean);

    patientDetails.forEach(detail => {
      pdf.text(detail, 20, currentY);
      currentY += 5;
    });

    return currentY + 10;
  }

  private addConsultationDetails(pdf: InstanceType<typeof import('jspdf').default>, consultation: ConsultationData, startY: number): number {
    let currentY = startY;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Consultation Details', 20, currentY);
    currentY += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    // Consultation metadata
    const consultationDate = format(parseISO(consultation.created_at), 'PPpp');
    pdf.text(`Date: ${consultationDate}`, 20, currentY);
    currentY += 5;

    if (consultation.appointment.doctor_name) {
      pdf.text(`Doctor: ${consultation.appointment.doctor_name}`, 20, currentY);
      currentY += 5;
    }

    if (consultation.appointment.department_name) {
      pdf.text(`Department: ${consultation.appointment.department_name}`, 20, currentY);
      currentY += 5;
    }

    currentY += 5;

    // Specialty data
    if (consultation.specialty_data) {
      const fields = [
        { label: 'Chief Complaint', value: consultation.specialty_data.chief_complaint },
        { label: 'History of Present Illness', value: consultation.specialty_data.history_of_present_illness },
        { label: 'Physical Examination', value: consultation.specialty_data.physical_examination },
        { label: 'Assessment', value: consultation.specialty_data.assessment },
        { label: 'Plan', value: consultation.specialty_data.plan }
      ];

      fields.forEach(field => {
        if (field.value) {
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${field.label}:`, 20, currentY);
          currentY += 5;
          
          pdf.setFont('helvetica', 'normal');
          const lines = pdf.splitTextToSize(field.value, 170);
          pdf.text(lines, 20, currentY);
          currentY += lines.length * 5 + 5;
        }
      });
    }

    return currentY + 5;
  }

  private addPrescriptions(pdf: InstanceType<typeof import('jspdf').default>, prescriptions: PrescriptionData[], startY: number): number {
    let currentY = startY;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Prescriptions', 20, currentY);
    currentY += 10;

    prescriptions.forEach((prescription, index) => {
      if (index > 0) currentY += 5;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Prescription ${index + 1}`, 20, currentY);
      currentY += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      prescription.medications.forEach((med, medIndex) => {
        if (med.name) {
          const medText = [
            med.name,
            med.dosage ? `${med.dosage}` : '',
            med.frequency ? `${med.frequency}` : '',
            med.duration ? `for ${med.duration}` : ''
          ].filter(Boolean).join(' - ');
          
          pdf.text(`${medIndex + 1}. ${medText}`, 25, currentY);
          currentY += 5;

          if (med.instructions) {
            pdf.setFont('helvetica', 'italic');
            pdf.text(`   Instructions: ${med.instructions}`, 25, currentY);
            pdf.setFont('helvetica', 'normal');
            currentY += 5;
          }
        }
      });
    });

    return currentY + 10;
  }

  private addFooter(pdf: InstanceType<typeof import('jspdf').default>): void {
    const pageHeight = pdf.internal.pageSize.height;
    const footerY = pageHeight - 20;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    
    const footerText = `Generated on ${format(new Date(), 'PPpp')} | Page 1`;
    pdf.text(footerText, 20, footerY);
  }
}

// Singleton instance for easy access
export const dynamicPDFExporter = new DynamicMedicalRecordPDFExporter();

// Hook for easy PDF export with loading state
export const useDynamicPDFExport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportPDF = async (exportFunction: () => Promise<void>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await exportFunction();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export PDF';
      setError(errorMessage);
      console.error('PDF export error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    exportPDF,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

// Preload PDF libraries for better UX
export const preloadPDFLibraries = async (): Promise<boolean> => {
  try {
    await loadPDFLibraries();
    return true;
  } catch (error) {
    console.warn('Failed to preload PDF libraries:', error);
    return false;
  }
};