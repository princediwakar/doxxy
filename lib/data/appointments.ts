import { cache } from 'react';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { DbAppointmentWithDetails } from '@/types/core';

export const getAppointmentById = cache(async (appointmentId: string) => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('appointments')
    .select('*, patients(name), doctors(name)')
    .eq('id', appointmentId)
    .single();
  if (error) throw new Error(error.message);
  return data;
});

export const getAppointmentsByClinic = cache(async (clinicId: string) => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc(
    'get_appointments_with_details_by_clinic',
    { clinic_id: clinicId },
  );
  if (error) throw new Error(error.message);
  return (data || []) as DbAppointmentWithDetails[];
});

export const getAppointmentFilters = cache(async (clinicId: string) => {
  const supabase = await createServerSupabase();

  const { data: appointments, error: apptError } = await supabase
    .from('appointments')
    .select('date, status')
    .eq('clinic_id', clinicId);
  if (apptError) throw new Error(apptError.message);

  const { data: doctors, error: docError } = await supabase.rpc(
    'get_doctors_by_clinic',
    { clinic_id: clinicId },
  );
  if (docError) throw new Error(docError.message);

  const dates = Array.from(new Set((appointments || []).map((a) => a.date))).sort();
  const statuses = Array.from(
    new Set(
      (appointments || [])
        .map((a) => a.status)
        .filter((s): s is NonNullable<typeof s> => s !== null),
    ),
  );

  return { dates, doctors: doctors || [], statuses };
});
