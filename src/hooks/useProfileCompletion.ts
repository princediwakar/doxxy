import { useState, useCallback, useRef } from "react";
import { getSupabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const supabase = getSupabase();

export const useProfileCompletion = () => {
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const profileCheckRef = useRef<string | null>(null);

  // Centralized profile completion check function
  const checkProfileCompletion = useCallback(async (userId: string): Promise<boolean> => {
    // Skip check if we already know profile is complete for this user
    if (profileCheckRef.current === userId && needsProfileCompletion === false) {
      console.log("Profile already marked complete for user:", userId);
      return false;
    }

    try {
      console.log("Checking profile completion for user:", userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error checking profile completion:", error);
        setNeedsProfileCompletion(true);
        profileCheckRef.current = null;
        return true;
      }

      const incomplete = !profile || !profile.name || !profile.phone;
      console.log("Profile completion check result:", {
        userId,
        hasProfile: !!profile,
        hasName: !!profile?.name,
        hasPhone: !!profile?.phone,
        needsCompletion: incomplete
      });

      setNeedsProfileCompletion(incomplete);
      profileCheckRef.current = incomplete ? null : userId;
      return incomplete;
    } catch (error) {
      console.error("Exception in profile completion check:", error);
      setNeedsProfileCompletion(true);
      profileCheckRef.current = null;
      return true;
    }
  }, [needsProfileCompletion]);

  // Function to mark profile as complete (called after successful profile update)
  const markProfileComplete = useCallback(async (user: User | null) => {
    if (!user?.id) {
      console.warn("Cannot mark profile complete - no user ID");
      return;
    }
    
    console.log("Marking profile as complete for user:", user.id);
    setNeedsProfileCompletion(false);
    profileCheckRef.current = user.id;

    // Refresh user session to update user_metadata
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error refreshing session:", error);
      return;
    }
    
    console.log("Profile completion state updated, profile is now complete");
    return session?.user || null;
  }, []);

  const resetProfileCompletion = useCallback(() => {
    setNeedsProfileCompletion(false);
    profileCheckRef.current = null;
  }, []);

  return {
    needsProfileCompletion,
    setNeedsProfileCompletion,
    checkProfileCompletion,
    markProfileComplete,
    resetProfileCompletion,
  };
}; 