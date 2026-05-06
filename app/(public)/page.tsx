import { createServerSupabase } from '@/integrations/supabase/server';
import { redirect } from 'next/navigation';
import LandingPageContent from '@/components/LandingPageContent';

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; state?: string; error?: string; error_description?: string }>;
}) {
  const params = await searchParams;

  // OAuth callback landed on root — forward to the callback route for server-side code exchange
  if (params.code) {
    const qs = new URLSearchParams();
    qs.set('code', params.code);
    if (params.state) qs.set('state', params.state);
    redirect(`/auth/callback?${qs.toString()}`);
  }

  if (params.error) {
    redirect(`/auth?error=${params.error}`);
  }

  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    redirect('/schedule');
  }

  return <LandingPageContent />;
}
