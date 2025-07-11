import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { getSupabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const supabase = getSupabase();

export type AuthFlow = "login" | "signup" | "invite" | "reset" | "update-password";

export const useAuthFlow = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [authFlow, setAuthFlow] = useState<AuthFlow>("login");
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const [searchParams] = useSearchParams();
  const { user, activeClinic, loading: authLoading, checkProfileCompletion, needsProfileCompletion } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleInvite = useCallback(async (inviteToken: string, inviteEmail: string | null) => {
    setLoading(true);
    try {
      console.log("Auth: Handling invite with token and email:", inviteToken, inviteEmail);
      
      const { data, error } = await supabase.auth.verifyOtp({
        email: inviteEmail || '',
        token: inviteToken,
        type: 'invite',
      });

      if (error) {
        console.error("Auth: Invite verification error:", error);
        toast.error(error.message || "Invalid or expired invite token.");
        setAuthFlow("login");
        return;
      }

      if (data.session && data.user) {
        console.log("Auth: Invite verified successfully, user logged in:", data.user.id);
        setAuthFlow("invite");
        setEmail(inviteEmail || data.user.email || '');
        toast.info("Welcome! Please set your password to complete your account setup.");
      } else {
        console.error("Auth: Invite verification succeeded but no session created");
        toast.error("Failed to create session after invite verification.");
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
    const emailFromUrl = searchParams.get("email");

    if (token && type) {
      if (type === "invite") {
        const processInvite = () => handleInvite(token, emailFromUrl);
        processInvite();
      } else if (type === "recovery") {
        const processPasswordReset = () => handlePasswordReset(token, emailFromUrl);
        processPasswordReset();
      }
    }
  }, [searchParams, handleInvite, handlePasswordReset]);

  // Redirect authenticated users
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
        navigate(redirectTo, { replace: true });
        return;
      }

      // Profile complete, no clinic - redirect to create clinic
      if (!activeClinic) {
        console.log('Auth: No active clinic, redirecting to /create-clinic');
        const redirectTo = "/create-clinic";
        navigate(redirectTo, { replace: true });
        return;
      }

      // Profile complete, has clinic - redirect to dashboard or intended page
      console.log('Auth: User has active clinic, redirecting to dashboard');
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    }
  }, [user, authLoading, needsProfileCompletion, activeClinic, navigate, location.state?.from?.pathname]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        toast.success("Logged in successfully!");
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        if (data.user.email_confirmed_at) {
          toast.success("Account created successfully!");
        } else {
          toast.success("Please check your email to verify your account");
        }
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password reset email sent! Check your inbox.");
      setAuthFlow("login");
    } catch (error: unknown) {
      toast.error((error as Error).message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter a password");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        toast.success("Password set successfully!");
        
        // Check if profile completion is needed
        const needsCompletion = await checkProfileCompletion(data.user.id);
        
        if (needsCompletion) {
          navigate("/complete-profile");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || "An unexpected error occurred");
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
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    name,
    setName,
    loading,
    showPassword,
    setShowPassword,
    activeTab,
    setActiveTab,
    authFlow,
    googleLoading,
    
    // Auth context
    user,
    activeClinic,
    authLoading,
    needsProfileCompletion,
    
    // Handlers
    handleLogin,
    handleSignup,
    handleForgotPassword,
    handleSetPassword,
    handleGoogleSignIn,
  };
}; 