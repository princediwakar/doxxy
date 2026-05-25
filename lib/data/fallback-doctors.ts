// lib/data/fallback-doctors.ts
import { createServerSupabase } from '@/integrations/supabase/server';

export interface FallbackDoctor {
  id: string;
  user_id: string;
  name: string;
  department_name: string;
  phone: string | null;
  email: string | null;
  bio: string | null;
  signature: string | null;
  primary_specialization: string | null;
}

export async function getFallbackDoctors(clinicId: string): Promise<FallbackDoctor[]> {
  const supabase = await createServerSupabase();

  const [doctorsResult, membersResult] = await Promise.all([
    supabase
      .from('doctors')
      .select('id, user_id, name, primary_specialization, phone, email, bio, signature')
      .eq('clinic_id', clinicId)
      .eq('is_active', true),
    supabase
      .from('clinic_members')
      .select('user_id')
      .eq('clinic_id', clinicId)
      .not('department_id', 'is', null),
  ]);

  if (doctorsResult.error) throw new Error(doctorsResult.error.message);

  const deptUserIds = new Set((membersResult.data || []).map(m => m.user_id));
  return (doctorsResult.data || [])
    .filter(d => deptUserIds.has(d.user_id))
    .map(d => ({
      ...d,
      department_name: d.primary_specialization || 'General Medicine',
    }));
}
