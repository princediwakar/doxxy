"use client";
import { logger } from "@/lib/logger";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSupabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AuthFlow } from "./useAuth";

const supabase = getSupabase();

interface TokenHandlerDeps {
  setLoading: (loading: boolean) => void;
  setAuthFlow: (flow: AuthFlow) => void;
  setEmail: (email: string) => void;
}

export function useAuthTokenHandlers({
  setLoading,
  setAuthFlow,
  setEmail,
}: TokenHandlerDeps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    const type = searchParams.get("type");
    const action = searchParams.get("action");
    const emailFromUrl = searchParams.get("email");

    if (process.env.NODE_ENV === "development") {
      logger.log("Auth: useEffect running - checking URL params:", {
        token: token ? "present" : "missing",
        type,
        action,
        email: emailFromUrl ? "present" : "missing",
      });
    }

    if (token && (type || action)) {
      const run = async () => {
        if (type === "invite" || action === "invite") {
          if (process.env.NODE_ENV === "development") logger.log("Auth: Processing invitation...");
          await handleInvite(token, emailFromUrl);
        } else if (type === "recovery") {
          if (process.env.NODE_ENV === "development") logger.log("Auth: Processing password reset...");
          await handlePasswordReset(token, emailFromUrl);
        }
      };
      run();
    } else {
      if (process.env.NODE_ENV === "development") logger.log("Auth: No invitation/reset processing needed");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function handleInvite(inviteToken: string, inviteEmail: string | null) {
    setLoading(true);
    try {
      if (!inviteEmail) {
        toast.error("Invalid invitation link. Please ask the clinic admin to resend the invitation.");
        setAuthFlow("login");
        return;
      }

      if (process.env.NODE_ENV === "development") logger.log("Auth: Handling invite with token and email:", inviteToken, inviteEmail);

      const { data: invitationData, error: invitationError } = await supabase
        .rpc('verify_invitation_token', {
          p_token: inviteToken,
          p_email: inviteEmail?.toLowerCase() || '',
        })
        .single();

      if (invitationError) {
        logger.error("Auth: Invitation verification error:", invitationError);

        // Check if this invitation was already accepted (existing user was auto-added)
        const { data: acceptedInvitation } = await supabase
          .rpc('check_accepted_invitation', {
            p_token: inviteToken,
            p_email: inviteEmail?.toLowerCase() || '',
          })
          .maybeSingle();

        if (acceptedInvitation) {
          toast.success("You've already been added to the clinic! Please log in to continue.", {
            duration: 6000,
          });
          setAuthFlow("login");
          setEmail(inviteEmail || '');
          return;
        }

        // Check if expired
        const { data: expiredInvitation } = await supabase
          .rpc('check_expired_invitation', {
            p_token: inviteToken,
            p_email: inviteEmail?.toLowerCase() || '',
          })
          .maybeSingle();

        if (expiredInvitation) {
          toast.error("This invitation has expired. Please ask for a new invitation.");
        } else {
          toast.error("Invalid or already used invitation token.");
        }

        setAuthFlow("login");
        return;
      }

      if (invitationData) {
        if (process.env.NODE_ENV === "development") {
          logger.log("Auth: Invitation verified successfully:", invitationData);
          logger.log("Auth: Storing invitation data in localStorage:", {
            token: inviteToken,
            email: inviteEmail,
            clinic_id: invitationData.clinic_id
          });
        }
        localStorage.setItem('invitation_token', inviteToken);
        localStorage.setItem('invitation_data', JSON.stringify(invitationData));

        const storedToken = localStorage.getItem('invitation_token');
        const storedData = localStorage.getItem('invitation_data');
        if (process.env.NODE_ENV === "development") logger.log("Auth: Verification - stored token:", storedToken);
        if (process.env.NODE_ENV === "development") logger.log("Auth: Verification - stored data exists:", !!storedData);

        // Check for existing session — skip invite UI if already logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace('/schedule');
          return;
        }
        setAuthFlow("login");
        setEmail(inviteEmail || '');
        toast.info("Please sign in to join the clinic.");
      } else {
        logger.error("Auth: No valid invitation found");
        toast.error("No valid invitation found. Please ask for a new invitation.");
        setAuthFlow("login");
      }
    } catch (error: unknown) {
      logger.error("Auth: Exception during invite verification:", error);
      toast.error((error as Error).message || "An unknown error occurred during invite verification.");
      setAuthFlow("login");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset(resetToken: string, resetEmail: string | null) {
    setLoading(true);
    try {
      if (process.env.NODE_ENV === "development") logger.log("Auth: Handling password reset with token and email:", resetToken, resetEmail);

      const { data, error } = await supabase.auth.verifyOtp({
        email: resetEmail || '',
        token: resetToken,
        type: 'recovery',
      });

      if (error) {
        logger.error("Auth: Password reset verification error:", error);
        toast.error(error.message || "Invalid or expired reset token.");
        setAuthFlow("login");
        return;
      }

      if (data.session && data.user) {
        if (process.env.NODE_ENV === "development") logger.log("Auth: Password reset verified successfully, user logged in:", data.user.id);
        setAuthFlow("update-password");
        setEmail(resetEmail || data.user.email || '');
        toast.info("Please set your new password.");
      } else {
        logger.error("Auth: Password reset verification succeeded but no session created");
        toast.error("Failed to create session after password reset verification.");
        setAuthFlow("login");
      }
    } catch (error: unknown) {
      logger.error("Auth: Exception during password reset verification:", error);
      toast.error((error as Error).message || "An unknown error occurred during password reset verification.");
      setAuthFlow("login");
    } finally {
      setLoading(false);
    }
  }
}
