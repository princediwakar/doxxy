"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { getSupabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const supabase = getSupabase();

export type AuthFlow = "login" | "signup" | "invite" | "reset" | "update-password" | "otp";

export const useAuthFlow = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [authFlow, setAuthFlow] = useState<AuthFlow>("login");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  const searchParams = useSearchParams();
  const { user, activeClinic, loading: authLoading, needsProfileCompletion } = useAuth();
  const location = usePathname();
  const router = useRouter();

  const handleInvite = useCallback(async (inviteToken: string, inviteEmail: string | null) => {
    setLoading(true);
    try {
      console.log("Auth: Handling invite with token and email:", inviteToken, inviteEmail);

      // For custom invitations, we need to verify the invitation token directly
      // instead of using Supabase's OTP verification
      const { data: invitationData, error: invitationError } = await supabase
        .from('pending_invitations')
        .select('*')
        .eq('invitation_token', inviteToken)
        .eq('email', inviteEmail?.toLowerCase() || '')
        .is('accepted_at', null)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (invitationError) {
        console.error("Auth: Invitation verification error:", invitationError);

        // Check if it's an expired invitation
        const { data: expiredInvitation } = await supabase
          .from('pending_invitations')
          .select('*')
          .eq('invitation_token', inviteToken)
          .eq('email', inviteEmail?.toLowerCase() || '')
          .lt('expires_at', new Date().toISOString())
          .single();

        if (expiredInvitation) {
          toast.error("This invitation has expired. Please ask for a new invitation.");
        } else {
          toast.error("Invalid or already used invitation token.");
        }

        setAuthFlow("login");
        return;
      }

      if (invitationData) {
        console.log("Auth: Invitation verified successfully:", invitationData);

        // Store the invitation data for PrivateRoute logic - use localStorage for persistence
        console.log("Auth: Storing invitation data in localStorage:", {
          token: inviteToken,
          email: inviteEmail,
          clinic_id: invitationData.clinic_id
        });
        localStorage.setItem('invitation_token', inviteToken);
        localStorage.setItem('invitation_data', JSON.stringify(invitationData));

        // Verify storage worked
        const storedToken = localStorage.getItem('invitation_token');
        const storedData = localStorage.getItem('invitation_data');
        console.log("Auth: Verification - stored token:", storedToken);
        console.log("Auth: Verification - stored data exists:", !!storedData);

        // Set the auth flow to invite mode
        setAuthFlow("invite");
        setEmail(inviteEmail || '');
        toast.info("Welcome! Please set your password to complete your account setup.");
      } else {
        console.error("Auth: No valid invitation found");
        toast.error("No valid invitation found. Please ask for a new invitation.");
        setAuthFlow("login");
      }
    } catch (error: unknown) {
      console.error("Auth: Exception during invite verification:", error);
      toast.error((error as Error).message || "An unknown error occurred during invite verification.");
      setAuthFlow("login");
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePasswordReset = useCallback(async (resetToken: string, resetEmail: string | null) => {
    setLoading(true);
    try {
      console.log("Auth: Handling password reset with token and email:", resetToken, resetEmail);
      
      const { data, error } = await supabase.auth.verifyOtp({
        email: resetEmail || '',
        token: resetToken,
        type: 'recovery',
      });

      if (error) {
        console.error("Auth: Password reset verification error:", error);
        toast.error(error.message || "Invalid or expired reset token.");
        setAuthFlow("login");
        return;
      }

      if (data.session && data.user) {
        console.log("Auth: Password reset verified successfully, user logged in:", data.user.id);
        setAuthFlow("update-password");
        setEmail(resetEmail || data.user.email || '');
        toast.info("Please set your new password.");
      } else {
        console.error("Auth: Password reset verification succeeded but no session created");
        toast.error("Failed to create session after password reset verification.");
        setAuthFlow("login");
      }
    } catch (error: unknown) {
      console.error("Auth: Exception during password reset verification:", error);
      toast.error((error as Error).message || "An unknown error occurred during password reset verification.");
      setAuthFlow("login");
    } finally {
      setLoading(false);
    }
  }, []);

  // Check for invite or reset tokens in URL on mount
  useEffect(() => {
    const token = searchParams.get("token");
    const type = searchParams.get("type");
    const action = searchParams.get("action");
    const emailFromUrl = searchParams.get("email");

    console.log("Auth: useEffect running - checking URL params:", {
      token: token ? "present" : "missing",
      type,
      action,
      email: emailFromUrl ? "present" : "missing"
    });

    if (token && (type || action)) {
      console.log("Auth: Conditions met for invitation/reset processing");
      if (type === "invite" || action === "invite") {
        console.log("Auth: Processing invitation...");
        const processInvite = () => handleInvite(token, emailFromUrl);
        processInvite();
      } else if (type === "recovery") {
        console.log("Auth: Processing password reset...");
        const processPasswordReset = () => handlePasswordReset(token, emailFromUrl);
        processPasswordReset();
      }
    } else {
      console.log("Auth: No invitation/reset processing needed");
    }
  }, [searchParams, handleInvite, handlePasswordReset]);

  // Redirect authenticated users
  // Set auth flow to unified approach
  useEffect(() => {
    setAuthFlow("otp");
  }, []);

  useEffect(() => {
    // Wait for auth loading to complete
    if (authLoading) return;

    // If user is authenticated, redirect to appropriate page
    if (user) {
      console.log('Auth: Authenticated user detected, checking redirect logic', {
        user: !!user,
        needsProfileCompletion,
        activeClinic: activeClinic ? 'present' : null
      });

      // Profile incomplete - redirect to complete profile
      if (needsProfileCompletion) {
        console.log('Auth: Redirecting to /complete-profile');
        const redirectTo = "/complete-profile";
        router.replace(redirectTo);
        return;
      }

      // Profile complete, no clinic - redirect to create clinic
      if (!activeClinic) {
        console.log('Auth: No active clinic, redirecting to /create-clinic');
        const redirectTo = "/create-clinic";
        router.replace(redirectTo);
        return;
      }

      // Profile complete, has clinic - redirect to dashboard or intended page
      console.log('Auth: User has active clinic, redirecting to dashboard');
      const redirectTo = searchParams.get('redirect') || "/dashboard";
      router.replace(redirectTo);
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
        console.error('Email Auth Error:', error);
        
        // Handle specific error cases with better messaging
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
      console.error('Email Auth Exception:', error);
      toast.error("Unable to send verification code. Please try again or use Google sign-in.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) {
      toast.error("Please enter the verification code");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'email',
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        toast.success("Account created successfully!");
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || "An unexpected error occurred");
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
        console.error('Resend OTP Error:', error);
        toast.error("Failed to resend code. Please try again.");
        return;
      }

      toast.success("New verification code sent!");
    } catch (error: unknown) {
      console.error('Resend OTP Exception:', error);
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
    // State
    email,
    setEmail,
    otp,
    setOtp,
    loading,
    authFlow,
    googleLoading,
    otpSent,
    
    // Auth context
    user,
    activeClinic,
    authLoading,
    needsProfileCompletion,
    
    // Handlers
    handleEmailAuth,
    handleOTPVerify,
    resendOTP,
    handleGoogleSignIn,
  };
}; 