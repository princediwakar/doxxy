'use server';

import { createServerSupabase } from '@/integrations/supabase/server';
import type { DbPatientByClinic, DbPatient, DbBill } from '@/types/core';

import type { PatientDetail } from '@/types/core';

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
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  return {
    patient: patient as DbPatientByClinic | null,
    consultations: (consultations ?? []) as Array<Record<string, unknown>>,
    bills: (bills ?? []) as Array<Record<string, unknown>>,
  };
}

export async function queryPatientBills(patientId: string) {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as DbBill[];
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
