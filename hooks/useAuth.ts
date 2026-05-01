"use client";
import { logger } from "@/lib/logger";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthTokenHandlers } from "./useAuthTokenHandlers";

const supabase = getSupabase();

export type AuthFlow = "login" | "signup" | "invite" | "reset" | "update-password" | "otp";

export const useAuthFlow = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [authFlow, setAuthFlow] = useState<AuthFlow>("login");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const searchParams = useSearchParams();
  const { user, activeClinic, loading: authLoading, needsProfileCompletion } = useAuth();
  const router = useRouter();

  // Process invite/reset tokens from URL
  useAuthTokenHandlers({ setLoading, setAuthFlow, setEmail });

  // Redirect authenticated users
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      if (process.env.NODE_ENV === "development") {
        logger.log('Auth: Authenticated user detected, checking redirect logic', {
          user: !!user,
          needsProfileCompletion,
          activeClinic: activeClinic ? 'present' : null
        });
      }

      if (needsProfileCompletion) {
        if (process.env.NODE_ENV === "development") logger.log('Auth: Redirecting to /complete-profile');
        router.replace("/complete-profile");
        return;
      }

      if (!activeClinic) {
        if (process.env.NODE_ENV === "development") logger.log('Auth: No active clinic, redirecting to /create-clinic');
        router.replace("/create-clinic");
        return;
      }

      if (process.env.NODE_ENV === "development") logger.log('Auth: User has active clinic, redirecting to /today');
      router.replace(searchParams.get('redirect') || "/today");
    }
  }, [user, authLoading, needsProfileCompletion, activeClinic, router, searchParams]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        logger.error('Email Auth Error:', error);

        if (error.message?.includes('Error sending confirmation email') ||
            error.message?.includes('Database error') ||
            error.message?.includes('500')) {
          toast.error("Having trouble sending the verification code. Please try signing in with Google instead.");
        } else if (error.message?.includes('rate limit')) {
          toast.error("Too many attempts. Please wait a few minutes before trying again.");
        } else if (error.message?.includes('invalid email')) {
          toast.error("Please enter a valid email address.");
        } else {
          toast.error(`Authentication failed: ${error.message}`);
        }
        return;
      }

      setOtpSent(true);
      toast.success("Magic link sent to your email! Check your inbox and click the link to sign in.");
    } catch (error: unknown) {
      logger.error('Email Auth Exception:', error);
      toast.error("Unable to send verification code. Please try again or use Google sign-in.");
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        logger.error('Resend OTP Error:', error);
        toast.error("Failed to resend code. Please try again.");
        return;
      }

      toast.success("New verification code sent!");
    } catch (error: unknown) {
      logger.error('Resend OTP Exception:', error);
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || "An unexpected error occurred");
    } finally {
      setGoogleLoading(false);
    }
  };

  return {
    email,
    setEmail,
    loading,
    authFlow,
    googleLoading,
    otpSent,
    user,
    activeClinic,
    authLoading,
    needsProfileCompletion,
    handleEmailAuth,
    resendOTP,
    handleGoogleSignIn,
  };
};
