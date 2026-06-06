'use server';

import { cache } from 'react';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { DbPatientByClinic, DbPatient, DbBill } from '@/types/core';
import { getCurrentDateStringIST } from '@/lib/utils';

import type { PatientDetail } from '@/types/core';

// --- From lib/data/patients.ts ---

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

// --- Existing lib/queries/patients.ts functions ---

export async function queryPatientDetail(
  clinicId: string,
  patientId: string,
): Promise<PatientDetail> {
  const supabase = await createServerSupabase();

  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .eq('clinic_id', clinicId)
    .single();

  if (patientError) throw new Error(patientError.message);

  const { data: consultations, error: consultationsError } = await supabase
    .from('consultations')
    .select('*, appointments(id, date, time, status, doctor_id, type, created_at, doctors(name))')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (consultationsError) throw new Error(consultationsError.message);

  const { data: bills } = await supabase
    .from('bills')
    .select('*, patients(name)')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  const billsWithPatientName = (bills ?? []).map((b) => {
    const { patients, ...billData } = b as Record<string, unknown> & { patients?: { name?: string } | null };
    return { ...billData, patient_name: patients?.name ?? null };
  });

  const today = getCurrentDateStringIST();
  const { data: futureApps } = await supabase
    .from('appointments')
    .select('id')
    .eq('patient_id', patientId)
    .gt('date', today)
    .limit(1);

  return {
    patient: patient as DbPatientByClinic | null,
    consultations: (consultations ?? []) as Array<Record<string, unknown>>,
    bills: billsWithPatientName as Array<Record<string, unknown>>,
    hasFutureAppointment: (futureApps?.length ?? 0) > 0,
  };
}

export async function queryPatientBills(patientId: string) {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from('bills')
    .select('*, patients(name)')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as Array<Record<string, unknown>>).map((b) => {
    const { patients, ...billData } = b as Record<string, unknown> & { patients?: { name?: string } | null };
    return { ...billData, patient_name: patients?.name ?? null };
  }) as unknown as DbBill[];
}

const ITEMS_PER_PAGE = 20;

function ageGroupToRange(ageGroup: string): { gte?: number; lte?: number } | null {
  const match = ageGroup.match(/^(\d+)[-+](\d+)?$/);
  if (!match) return null;
  const minAge = parseInt(match[1], 10);
  const suffix = ageGroup.slice(String(minAge).length);
  if (suffix === "+") return { gte: minAge };
  const maxAge = parseInt(match[2], 10);
  return { gte: minAge, lte: maxAge };
}

export interface PatientSearchResult {
  patients: DbPatientByClinic[];
  totalCount: number;
}

export async function queryPatientSearch(
  clinicId: string,
  search: string,
  options?: {
    gender?: string;
    ageGroup?: string;
    page?: number;
  },
): Promise<PatientSearchResult> {
  const supabase = await createServerSupabase();
  const page = options?.page ?? 1;
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE - 1;
  const ageRange = options?.ageGroup ? ageGroupToRange(options.ageGroup) : null;

  let query = supabase
    .from('patients')
    .select('*', { count: 'exact', head: false })
    .eq('clinic_id', clinicId)
    .order('name')
    .range(start, end);

  if (search?.trim()) {
    query = query.ilike('name', `%${search}%`);
  }
  if (options?.gender) {
    query = query.eq('gender', options.gender);
  }
  if (ageRange) {
    if (ageRange.gte !== undefined) query = query.gte('age', ageRange.gte);
    if (ageRange.lte !== undefined) query = query.lte('age', ageRange.lte);
  }

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);
  return { patients: (data ?? []) as DbPatientByClinic[], totalCount: count ?? 0 };
}
