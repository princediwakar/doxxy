
export interface FormattedAppointment {
  id: string;
  patient: string;
  doctor: string;
  time: string;
  date: string;
  status: string;
  type: string;
}

export interface DatabaseAppointment {
  id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
}

export interface DashboardStats {
  total_patients: number;
  total_doctors: number;
  appointments_today: number;
  all_relevant_appointments: any; // Json type from Supabase
}
