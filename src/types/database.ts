
export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  medical_id?: string;
  created_at?: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization: 'Neurology' | 'Ophthalmology';
  availability?: string;
  bio?: string;
  created_at?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  type: 'Walk-in' | 'Digital';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  department: 'Neurology' | 'Ophthalmology';
  notes?: string;
  created_at?: string;
  // Relations
  patients?: Patient;
  doctors?: Doctor;
}

export interface MedicalRecord {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  record_type: string;
  chief_complaint?: string;
  diagnosis?: string;
  notes?: string;
  symptoms?: string;
  treatment_plan?: string;
  created_at?: string;
  // Relations
  patients?: Patient;
  doctors?: Doctor;
  appointments?: Appointment;
  neurologyRecord?: NeurologyRecord;
  ophthalmologyRecord?: OphthalmologyRecord;
  prescription?: Prescription;
}

export interface NeurologyRecord {
  id: string;
  medical_record_id: string;
  neurological_exam?: string;
  motor_function?: string;
  sensory_function?: string;
  reflexes?: string;
  coordination?: string;
  cognitive_assessment?: string;
  scan_results?: string;
  created_at?: string;
}

export interface OphthalmologyRecord {
  id: string;
  medical_record_id: string;
  visual_acuity_right?: string;
  visual_acuity_left?: string;
  intraocular_pressure_right?: string;
  intraocular_pressure_left?: string;
  eye_examination?: string;
  fundoscopy?: string;
  color_vision?: string;
  peripheral_vision?: string;
  created_at?: string;
}

export interface Prescription {
  id: string;
  consultation_id: string;
  patient_id: string;
  doctor_id?: string;
  medications: any[];
  instructions?: string;
  follow_up_date?: string;
  created_at?: string;
  // For medical records
  medical_record_id?: string;
  medicines?: any[];
}

export interface Bill {
  id: string;
  patient_id: string;
  consultation_id: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  invoice_number?: string;
  created_at?: string;
  // Relations
  patients?: Patient;
  consultations?: any;
}

export interface Consultation {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  department: 'Neurology' | 'Ophthalmology';
  clinical_notes: any;
  created_at?: string;
  // Relations
  patients?: Patient;
  doctors?: Doctor;
  prescriptions?: Prescription[];
}
