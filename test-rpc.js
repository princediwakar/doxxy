import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.rpc('search_medicines', { search_term: '', limit_count: 50 });
  console.log("search_medicines err:", error?.message, "data length:", data?.length);
  
  const { data: mData, error: mError } = await supabase.rpc('match_invoice_item', { search_term: 'paracetamol' });
  console.log("match_invoice_item err:", mError?.message, "data keys:", mData?.[0] ? Object.keys(mData[0]) : null);
}
run();
