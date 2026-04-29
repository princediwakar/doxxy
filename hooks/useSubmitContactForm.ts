"use client";

import { logger } from "@/lib/logger";
import { useMutation } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";

const supabase = getSupabase();

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  city?: string;
  message: string;
}

export function useSubmitContactForm() {
  return useMutation({
    mutationFn: async (formData: ContactFormData) => {
      const { data, error: rpcError } = await supabase.rpc('submit_contact_form', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        city: formData.city || undefined,
        message: formData.message
      });

      if (rpcError) throw rpcError;

      try {
        await supabase.functions.invoke('send-contact-email', {
          body: {
            record: {
              id: data,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              company: formData.company,
              city: formData.city,
              message: formData.message,
              created_at: new Date().toISOString()
            }
          }
        });
      } catch (emailError) {
        logger.error('Error sending email notification:', emailError);
      }

      return data as string;
    },
  });
}
