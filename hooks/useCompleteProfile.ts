"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/query-keys";

const supabase = getSupabase();

interface CompleteProfileData {
  userId: string;
  name: string;
  phone: string | null;
  avatarUrl?: string;
  email?: string;
}

export function useCompleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, name, phone, avatarUrl, email }: CompleteProfileData) => {
      if (phone) {
        await supabase.auth.updateUser({ data: { phone } });
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          phone: phone || null,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error && error.code === 'PGRST116') {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: userId,
          name,
          phone: phone || null,
          email: email,
          avatar_url: avatarUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        if (insertError) throw insertError;
      } else if (error) {
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.profile.user(userId) });
    },
  });
}
