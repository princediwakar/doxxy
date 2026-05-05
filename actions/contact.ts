'use server';

import { createServerSupabase } from '@/integrations/supabase/server';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  city?: string;
  message: string;
}

export async function submitContactForm(formData: ContactFormData) {
  const supabase = await createServerSupabase();

  const { data, error: rpcError } = await supabase.rpc('submit_contact_form', {
    name: formData.name,
    email: formData.email,
    phone: formData.phone || undefined,
    company: formData.company || undefined,
    city: formData.city || undefined,
    message: formData.message,
  });

  if (rpcError) return { error: rpcError.message };

  supabase.functions.invoke('send-contact-email', {
    body: {
      record: {
        id: data,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        city: formData.city,
        message: formData.message,
        created_at: new Date().toISOString(),
      },
    },
  }).catch(() => {});

  return { data: data as string };
}
