import { cache } from 'react';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { DbPatientByClinic, DbPatient } from '@/types/core';

export const getPatientsByClinic = cache(async (clinicId: string) => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc('get_patients_by_clinic', {
    _clinic_id: clinicId,
  });
  if (error) throw new Error(error.message);
  return (data || []) as DbPatientByClinic[];
});

export const searchPatients = cache(async (clinicId: string, query: string) => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', clinicId)
    .ilike('name', `%${query}%`)
    .order('name');
  if (error) throw new Error(error.message);
  return (data || []) as DbPatient[];
});

export const getPatientDetail = cache(async (patientId: string) => {
  const supabase = await createServerSupabase();

  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single();
  if (patientError) throw new Error(patientError.message);

  const { data: consultations, error: consError } = await supabase
    .from('consultations')
    .select(
      '*, appointments(id, date, time, status, doctor_id, type, created_at, doctors(name))',
    )
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (consError) throw new Error(consError.message);

  const { data: bills, error: billsError } = await supabase
    .from('bills')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  if (billsError) throw new Error(billsError.message);

  return {
    patient: patient as DbPatientByClinic,
    consultations: consultations || [],
    bills: bills || [],
  };
});

export const getPatientAppointments = cache(async (patientId: string) => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('appointments')
    .select('*, doctors(name)')
    .eq('patient_id', patientId)
    .order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
});

export const getPatientBills = cache(async (patientId: string) => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
});
