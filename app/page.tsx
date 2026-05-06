import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/integrations/supabase/server';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; state?: string; error?: string; error_description?: string }>;
}) {
  const params = await searchParams;

  // OAuth callback landed on root — forward to the callback route for server-side code exchange
  if (params.code) {
    const qs = new URLSearchParams();
    if (params.code) qs.set('code', params.code);
    if (params.state) qs.set('state', params.state);
    redirect(`/auth/callback?${qs.toString()}`);
  }

  if (params.error) {
    redirect(`/auth?error=${params.error}`);
  }

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/schedule');
  }

  redirect('/auth');
}
