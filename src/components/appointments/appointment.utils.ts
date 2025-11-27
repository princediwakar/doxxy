// src/components/appointments/appointment-utils.ts
import * as z from 'zod';
import { Database } from '@/integrations/supabase/types';

// --- Types ---
export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type Patient = Database['public']['Tables']['patients']['Row'];
export type RpcPatient = Database['public']['Functions']['get_patients_by_clinic']['Returns'][0];

// We define the Doctor type explicitly based on the transformation logic
export interface TransformedDoctor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  bio: string | null;
  created_at: string;
  role: string;
  department_name: string;
  department_id: string | null;
  is_active: boolean | null;
  primary_specialization: string | null;
  consultation_fee: number | null;
  // Add other nullable fields used in the UI if necessary
}

// --- Zod Schema ---
export const appointmentFormSchema = z.object({
  date: z.date({ required_error: 'Date is required' }),
  time: z.string().nullable().optional().transform(e => e === "" ? null : e),
  patient_id: z.string().nonempty('Patient is required'),
  doctor_id: z.string().nonempty('Doctor is required'),
  type: z.enum(['Walk-in', 'Digital'], {
    required_error: 'Appointment type is required',
  }),
  status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Cancelled'], {
    required_error: 'Status is required',
  }),
  notes: z.string().nullable().optional().transform(e => e === "" ? null : e),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

// --- Helper Functions ---
export const getNextTimeSlot = (): string => {
  const now = new Date();
  const minutes = now.getMinutes();
  const hours = now.getHours();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;

  if (roundedMinutes === 60) {
    const nextHour = (hours + 1) % 24;
    return `${nextHour.toString().padStart(2, '0')}:00`;
  } else {
    return `${hours.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
  }
};

export const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time24h = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour >= 12 ? 'PM' : 'AM';
      const time12h = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
      
      slots.push({ value: time24h, display: time12h });
    }
  }
  return slots;
};