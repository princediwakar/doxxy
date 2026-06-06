import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

export async function createServerSupabase() {
  const cookieStore = await cookies();

  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll called from a Server Component. Ignored — middleware handles session refresh.
          }
        },
      },
    },
  );

  // createServerClient sets skipAutoInitialize: true and does not allow overriding it.
  // Without this, queries run as anonymous and RLS blocks all data.
  await client.auth.getSession();

  return client;
}
