'use server';

import { createServerSupabase } from '@/integrations/supabase/server';

export async function queryMedicineSearch(searchQuery: string) {
  const supabase = await createServerSupabase();

  if (!searchQuery.trim()) {
    const { data, error } = await supabase.rpc('search_medicines', {
      search_term: '',
      limit_count: 50,
    });
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  const { data, error } = await supabase.rpc('search_medicines', {
    search_term: searchQuery.toLowerCase(),
    limit_count: 50,
  });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function queryInventory(clinicId: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, medicines:medicine_id(name, manufacturer_name)')
    .eq('clinic_id', clinicId)
    .order('expiry_date', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}
