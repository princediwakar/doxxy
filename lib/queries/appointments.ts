'use server';

import { cache } from 'react';
import { addDays, format, parseISO } from 'date-fns';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { DbPatientByClinic } from '@/types/core';
import { getCurrentDateStringIST } from '@/lib/utils';

export const resolveUserDoctor = cache(async (userId: string, clinicId: string) => {
  const supabase = await createServerSupabase();

  const { data } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', userId)
    .eq('clinic_id', clinicId)
    .maybeSingle();

  return data?.id ?? null;
});

export async function getTodayAppointments(clinicId: string, doctorId?: string | null, date?: string | null) {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase.rpc(
    'get_appointments_with_details_by_clinic',
    { clinic_id: clinicId, filter_doctor_id: doctorId ?? undefined },
  );

  if (error) throw new Error(error.message);

  const targetDate = date || getCurrentDateStringIST();

  const filtered = (data || []).filter((app) => {
    if (!app.date) return false;
    return app.date.substring(0, 10) === targetDate;
  });

  const inProgress = filtered.filter((a) => a.status === 'In Progress');
  const scheduled = filtered.filter((a) => a.status === 'Scheduled');
  const completed = filtered.filter((a) => a.status === 'Completed');

  const todayDate = parseISO(targetDate);
  const nextDate = format(addDays(todayDate, 1), 'yyyy-MM-dd');
  const weekEndDate = format(addDays(todayDate, 7), 'yyyy-MM-dd');

  const upcoming = (data || []).filter((app) => {
    if (!app.date) return false;
    const appDate = app.date.substring(0, 10);
    return appDate >= nextDate && appDate <= weekEndDate;
  });

  upcoming.sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return a.time.localeCompare(b.time);
  });

  return { inProgress, scheduled, completed, upcoming };
}

export async function getPatientById(patientId: string) {
  const supabase = await createServerSupabase();

  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single();

  if (error) return null;

  const { data: consultations } = await supabase
    .from('consultations')
    .select('*, appointments(id, date, time, status, doctor_id, type, created_at, doctors(name))')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: bills } = await supabase
    .from('bills')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  const today = getCurrentDateStringIST();
  const { data: futureApps } = await supabase
    .from('appointments')
    .select('id')
    .eq('patient_id', patientId)
    .gt('date', today)
    .limit(1);

  return { patient: patient as DbPatientByClinic, consultations: consultations || [], bills: bills || [], hasFutureAppointment: (futureApps?.length ?? 0) > 0 };
}
