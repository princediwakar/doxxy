"use client";

import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { queryKeys } from '@/lib/query-keys';

const supabase = getSupabase();

export interface Doctor {
  id: string;
  name: string;
  user_id: string;
  primary_specialization?: string;
}

export const useDoctors = () => {
  const { activeClinic } = useAuth();

  const { data: doctors = [], isLoading, error } = useQuery({
    queryKey: queryKeys.doctors.byClinic(activeClinic?.clinics?.id ?? ""),
    queryFn: async () => {
      if (!activeClinic?.clinics?.id) return [];

      const { data, error } = await supabase
        .from('doctors')
        .select('id, name, user_id, primary_specialization')
        .eq('clinic_id', activeClinic.clinics.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Doctor[];
    },
    enabled: !!activeClinic?.clinics?.id,
    staleTime: 10 * 60 * 1000,
  });

  return { doctors, isLoading, error };
};