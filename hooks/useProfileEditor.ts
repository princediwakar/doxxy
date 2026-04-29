"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { showErrorToast } from "@/lib/error-utils";
import { logger } from "@/lib/logger";

const supabase = getSupabase();

interface UpdateProfileInput {
  name: string;
  phone: string;
  profilePhoto: File | null;
  currentAvatarUrl?: string;
  userEmail?: string;
}

interface UseProfileEditorOptions {
  userId?: string;
  enabled: boolean;
  activeClinicId?: string;
  onSuccess?: () => void;
}

export function useProfileEditor({
  userId,
  enabled,
  activeClinicId,
  onSuccess,
}: UseProfileEditorOptions) {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: queryKeys.profile.user(userId ?? ""),
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!userId && enabled,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      if (!userId) throw new Error("User ID is missing");

      const { name, phone, profilePhoto, currentAvatarUrl, userEmail } = input;
      let avatarUrl = currentAvatarUrl;

      if (profilePhoto) {
        const fileExt = profilePhoto.name?.split(".").pop() || "jpg";
        const fileName = `${userId}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, profilePhoto);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        avatarUrl = urlData.publicUrl;
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name,
          avatar_url: avatarUrl,
        },
      });
      if (authError) throw authError;

      const updates: Promise<void>[] = [];

      updates.push(
        (async () => {
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", userId)
            .maybeSingle();

          const profileData = {
            name,
            phone: phone || null,
            email: userEmail || null,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          };

          if (!existingProfile) {
            const { error } = await supabase.from("profiles").insert({
              id: userId,
              created_at: new Date().toISOString(),
              ...profileData,
            });
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from("profiles")
              .update(profileData)
              .eq("id", userId);
            if (error) throw error;
          }
        })()
      );

      updates.push(
        (async () => {
          const { data: doctorProfile } = await supabase
            .from("doctors")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

          if (doctorProfile) {
            const { error } = await supabase
              .from("doctors")
              .update({
                name,
                phone: phone || null,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", userId);
            if (error) throw error;
          }
        })()
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile.user(userId ?? ""),
      });
      if (activeClinicId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.profile.doctor(userId ?? "", activeClinicId),
        });
      }
      onSuccess?.();
    },
    onError: (error: Error) => {
      logger.error("Profile update failed:", error);
      showErrorToast(error, { title: "Error updating profile" });
    },
  });

  return {
    profileData: profileQuery.data,
    profileLoading: profileQuery.isLoading,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
}
