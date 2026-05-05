import { createServerSupabase } from '@/integrations/supabase/server';
import { redirect } from 'next/navigation';
import LandingPageContent from '@/components/LandingPageContent';

export default async function LandingPage() {
  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    redirect('/today');
  }

  return <LandingPageContent />;
}
