import { cache } from 'react';
import { createServerSupabase } from '@/integrations/supabase/server';

export const getInventory = cache(async (clinicId: string) => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, medicines:medicine_id(name, manufacturer_name)')
    .eq('clinic_id', clinicId)
    .order('expiry_date', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
});

export const getProcurements = cache(async (clinicId: string) => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('procurements')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
});

export const searchMedicines = cache(async (searchQuery: string) => {
  const supabase = await createServerSupabase();

  if (!searchQuery.trim()) {
    const { data, error } = await supabase.rpc('search_medicines', {
      search_term: '',
      limit_count: 50,
    });
    if (error) throw new Error(error.message);
    return data || [];
  }

  const { data, error } = await supabase.rpc('search_medicines', {
    search_term: searchQuery.toLowerCase(),
    limit_count: 50,
  });
  if (error) throw new Error(error.message);
  return data || [];
});

export const searchMedicineByName = cache(async (name: string) => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc('search_medicines', {
    search_term: name,
    limit_count: 1,
  });
  if (error) throw new Error(error.message);
  return data?.[0] || null;
});
