
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
