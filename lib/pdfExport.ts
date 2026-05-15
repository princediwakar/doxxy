// src/lib/pdfExport.ts - Dynamically loaded PDF exporter
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
  physical_exam?: string;
  assessment?: string;
  treatment?: string;
  visual_acuity?: string;
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
  created_at: string;
  medications: MedicationData[] | string;
  instructions?: string;
  follow_up_date?: string;
  doctor_name?: string;
}

interface ExportOptions {
  includeConsultations?: boolean;
  includePrescriptions?: boolean;
  includeTimeline?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// Type definitions for dynamically loaded libraries
type JSPDFType = typeof import('jspdf').default;
type Html2CanvasType = (element: HTMLElement, options?: import('html2canvas').Html2CanvasOptions) => Promise<HTMLCanvasElement>;

interface JSPDFLibrary {
  default: JSPDFType;
}

interface Html2CanvasLibrary {
  default: Html2CanvasType;
}

export class MedicalRecordPDFExporter {
  private pdf: InstanceType<JSPDFType> | null = null;
  private currentY: number = 20;
  private pageHeight: number = 297; // A4 height in mm
  private margin: number = 20;
  private librariesLoaded: boolean = false;
  private jsPDF: JSPDFType | null = null;
  private html2canvas: Html2CanvasType | null = null;

  private async loadLibraries(): Promise<void> {
    if (this.librariesLoaded) return;

    const [jsPDFModule, html2canvasModule] = await Promise.all([
      import('jspdf') as Promise<JSPDFLibrary>,
      import('html2canvas') as Promise<Html2CanvasLibrary>
    ]);

    // Store the libraries for later use
    this.jsPDF = jsPDFModule.default;
    this.html2canvas = html2canvasModule.default;
    this.librariesLoaded = true;
  }

  private async ensureLibrariesLoaded(): Promise<void> {
    if (!this.librariesLoaded) {
      await this.loadLibraries();
    }
  }

  private async initializePDF(): Promise<void> {
    await this.ensureLibrariesLoaded();
    if (!this.jsPDF) {
      throw new Error('jsPDF library not loaded');
    }
    this.pdf = new this.jsPDF('p', 'mm', 'a4');
  }

  private ensurePDFInitialized(): void {
    if (!this.pdf) {
      throw new Error('PDF not initialized. Call initializePDF() first.');
    }
  }

  private checkPageBreak(additionalHeight: number = 10): void {
    this.ensurePDFInitialized();
    if (this.currentY + additionalHeight > this.pageHeight - this.margin) {
      this.pdf!.addPage();
      this.currentY = this.margin;
    }
  }

  private setBold(size: number): void {
    this.ensurePDFInitialized();
    this.pdf!.setFontSize(size);
    this.pdf!.setFont('helvetica', 'bold');
  }

  private setNormal(size: number): void {
    this.ensurePDFInitialized();
    this.pdf!.setFontSize(size);
    this.pdf!.setFont('helvetica', 'normal');
  }

  private addHeader(clinicName: string = 'Medical Clinic'): void {
    this.ensurePDFInitialized();

    // Clinic Header
    this.setBold(20);
    this.pdf!.text(clinicName, this.margin, this.currentY);

    this.currentY += 10;
    this.setNormal(12);
    this.pdf!.text('Medical Records Report', this.margin, this.currentY);

    this.currentY += 5;
    this.pdf!.text(`Generated on: ${format(new Date(), 'PPP')}`, this.margin, this.currentY);

    this.currentY += 15;

    // Add line separator
    this.pdf!.line(this.margin, this.currentY, 210 - this.margin, this.currentY);
    this.currentY += 10;
  }

  private addPatientInfo(patient: PatientInfo): void {
    this.checkPageBreak(30);

    this.setBold(16);
    this.pdf!.text('PATIENT INFORMATION', this.margin, this.currentY);
    this.currentY += 10;

    this.setNormal(11);

    const patientData = [
      ['Name:', patient.name],
      ['Medical ID:', patient.medical_id],
      ['Gender:', patient.gender],
      ['Age:', patient.age ? `${patient.age} years` : 'Unknown'],
    ];

    if (patient.phone) patientData.push(['Phone:', patient.phone]);
    if (patient.email) patientData.push(['Email:', patient.email]);

    patientData.forEach(([label, value]) => {
      this.pdf!.setFont('helvetica', 'bold');
      this.pdf!.text(label, this.margin, this.currentY);
      this.pdf!.setFont('helvetica', 'normal');
      // Ensure value is a valid string for jsPDF
      const safeValue = value?.toString() || 'Unknown';
      this.pdf!.text(safeValue, this.margin + 35, this.currentY);
      this.currentY += 6;
    });

    this.currentY += 10;
  }

  private addConsultations(consultations: ConsultationData[]): void {
    if (consultations.length === 0) return;

    this.checkPageBreak(20);

    this.setBold(16);
    this.pdf!.text('CONSULTATION HISTORY', this.margin, this.currentY);
    this.currentY += 10;

    consultations.forEach((consultation, index) => {
      this.checkPageBreak(40);

      // Consultation header
      this.setBold(12);
      const consultationTitle = `Consultation #${index + 1}`;
      this.pdf!.text(consultationTitle, this.margin, this.currentY);
      this.currentY += 8;

      // Basic info
      this.setNormal(10);

      const basicInfo = [
        `Date: ${consultation.appointment.date ? format(parseISO(consultation.appointment.date), 'PPP') : 'Unknown'}`,
        `Doctor: ${consultation.appointment.doctor_name || 'Unknown'}`,
        `Department: ${consultation.appointment.department_name || 'General'}`,
      ];

      if (consultation.appointment.time) {
        basicInfo.push(`Time: ${consultation.appointment.time}`);
      }

      basicInfo.forEach(info => {
        this.pdf!.text(info, this.margin + 5, this.currentY);
        this.currentY += 5;
      });

      this.currentY += 3;

      // Specialty data
      if (consultation.specialty_data && typeof consultation.specialty_data === 'object') {
        const data = consultation.specialty_data;

        if (data.chief_complaint) {
          this.addSection('Chief Complaint:', data.chief_complaint);
        }

        if (data.history_of_present_illness) {
          this.addSection('History of Present Illness:', data.history_of_present_illness);
        }

        if (data.physical_exam) {
          this.addSection('Physical Exam:', data.physical_exam);
        }

        if (data.assessment) {
          this.addSection('Assessment:', data.assessment);
        }

        if (data.treatment) {
          this.addSection('Treatment:', data.treatment);
        }

        // Add specialty-specific fields
        if (data.visual_acuity) {
          this.addSection('Visual Acuity:', data.visual_acuity);
        }


      }

      this.currentY += 8;

      // Add separator line
      this.pdf!.line(this.margin, this.currentY, 210 - this.margin, this.currentY);
      this.currentY += 8;
    });
  }

  private addPrescriptions(prescriptions: PrescriptionData[]): void {
    if (prescriptions.length === 0) return;

    this.checkPageBreak(20);

    this.setBold(16);
    this.pdf!.text('PRESCRIPTION HISTORY', this.margin, this.currentY);
    this.currentY += 10;

    prescriptions.forEach((prescription, index) => {
      this.checkPageBreak(30);

      // Prescription header
      this.setBold(12);
      const prescriptionTitle = `Prescription #${index + 1}`;
      this.pdf!.text(prescriptionTitle, this.margin, this.currentY);
      this.currentY += 8;

      // Basic info
      this.setNormal(10);

      const basicInfo = [
        `Date: ${prescription.created_at ? format(parseISO(prescription.created_at), 'PPP') : 'Unknown'}`,
        `Prescribed by: ${prescription.doctor_name || 'Unknown'}`,
      ];

      basicInfo.forEach(info => {
        this.pdf!.text(info, this.margin + 5, this.currentY);
        this.currentY += 5;
      });

      this.currentY += 3;

      // Medications
      const medicationsText = typeof prescription.medications === 'string'
        ? prescription.medications
        : JSON.stringify(prescription.medications, null, 2);

      this.addSection('Medications:', medicationsText);

      // Instructions
      if (prescription.instructions) {
        this.addSection('Instructions:', prescription.instructions);
      }

      // Follow-up
      if (prescription.follow_up_date) {
        this.addSection('Follow-up Date:', format(parseISO(prescription.follow_up_date), 'PPP'));
      }

      this.currentY += 8;

      // Add separator line
      this.pdf!.line(this.margin, this.currentY, 210 - this.margin, this.currentY);
      this.currentY += 8;
    });
  }

  private addSection(title: string, content: string): void {
    this.checkPageBreak(15);

    this.pdf!.setFont('helvetica', 'bold');
    this.pdf!.text(title, this.margin + 5, this.currentY);
    this.currentY += 6;

    this.pdf!.setFont('helvetica', 'normal');

    // Handle multi-line content
    const lines = this.pdf!.splitTextToSize(content, 160);
    lines.forEach((line: string) => {
      this.checkPageBreak(5);
      this.pdf!.text(line, this.margin + 10, this.currentY);
      this.currentY += 5;
    });

    this.currentY += 3;
  }

  private addFooter(): void {
    const pageCount = this.pdf!.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.pdf!.setPage(i);
      this.setNormal(8);
      this.pdf!.text(
        `Page ${i} of ${pageCount}`,
        210 - this.margin - 20,
        297 - 10
      );
      this.pdf!.text(
        'This is a computer-generated medical record.',
        this.margin,
        297 - 10
      );
    }
  }

  public async exportMedicalRecord(
    patient: PatientInfo,
    consultations: ConsultationData[] = [],
    prescriptions: PrescriptionData[] = [],
    clinicName: string = 'Medical Clinic',
    options: ExportOptions = {}
  ): Promise<void> {
    // Initialize PDF with dynamic libraries
    await this.initializePDF();

    // Filter data based on date range if provided
    let filteredConsultations = consultations;
    let filteredPrescriptions = prescriptions;

    if (options.dateRange) {
      filteredConsultations = consultations.filter(consultation => {
        const consultationDate = new Date(consultation.appointment?.date || consultation.created_at);
        return consultationDate >= options.dateRange!.from && consultationDate <= options.dateRange!.to;
      });

      filteredPrescriptions = prescriptions.filter(prescription => {
        const prescriptionDate = new Date(prescription.created_at);
        return prescriptionDate >= options.dateRange!.from && prescriptionDate <= options.dateRange!.to;
      });
    }

    // Add content
    this.addHeader(clinicName);
    this.addPatientInfo(patient);

    if (options.includeConsultations !== false) {
      this.addConsultations(filteredConsultations);
    }

    if (options.includePrescriptions !== false) {
      this.addPrescriptions(filteredPrescriptions);
    }

    // Add footer
    this.addFooter();

    // Generate filename
    const filename = `${patient.name?.replace(/\s+/g, '_') || 'unknown-patient'}_Medical_Record_${format(new Date(), 'yyyy-MM-dd')}.pdf`;

    // Save the PDF
    this.pdf!.save(filename);
  }

}