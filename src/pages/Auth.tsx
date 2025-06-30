import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { getSupabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Mail, Lock, Text, Stethoscope, Heart, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const supabase = getSupabase();

type AuthFlow = "login" | "signup" | "invite" | "reset" | "update-password";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [authFlow, setAuthFlow] = useState<AuthFlow>("login");
  const [searchParams] = useSearchParams();
  const { user, activeClinic, loading: authLoading, checkProfileCompletion, needsProfileCompletion } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
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
        toast.info("Please enter your new password.");
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

  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    const emailFromUrl = searchParams.get('email');

    console.log("Auth: URL params:", { token, type, emailFromUrl, authLoading, user, activeClinic });

    if (authLoading) return;

    // If user is already logged in and needs profile completion, redirect to complete-profile
    if (user && needsProfileCompletion && location.pathname === '/auth' && !token) {
      navigate('/complete-profile', { replace: true });
      return;
    }

    // If user is already logged in and has active clinic, redirect to dashboard
    if (user && activeClinic && location.pathname === '/auth' && !token) {
      console.log("Auth: Logged in user with active clinic, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
      return;
    }

    // If user is logged in but no active clinic, redirect to create-clinic
    if (!authLoading && user && !activeClinic && authFlow === "login" && !token && !needsProfileCompletion) {
      console.log("Auth: Logged in user without active clinic, redirecting to create-clinic");
      navigate('/create-clinic', { replace: true });
      return;
    }

    // Handle invite token – if a user is already logged in (e.g. superadmin)
    // log them out first so the invited account can be verified and prompted
    // to set a password.
    if (token && type === 'invite') {
      const processInvite = () => handleInvite(token, emailFromUrl);

      if (user) {
        // Existing session blocks invite verification – clear it first.
        supabase.auth.signOut().then(processInvite);
      } else {
        processInvite();
      }
      return;
    }

    // Handle password reset token
    if (token && type === 'recovery') {
      handlePasswordReset(token, emailFromUrl);
      return;
    }

    // If no special flow and no user, ensure we're on login
    if (!token && !user && authFlow !== "reset") {
      setAuthFlow("login");
    }

  }, [navigate, searchParams, activeClinic, authLoading, handleInvite, handlePasswordReset, user, location.pathname, authFlow]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        console.log("Auth: Login successful");
        toast.success("Login successful!");
      }
    } catch (error: unknown) {
      console.error("Auth: Login error:", error);
      toast.error((error as Error).message || "An unknown error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !name) {
      toast.error("Please enter email, name, and password");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        console.log("Auth: Signup successful with immediate session");
        toast.success("Account created successfully!");
      } else {
        console.log("Auth: Signup successful, verification email sent");
        toast.info("Please check your email for verification");
      }
    } catch (error: unknown) {
      console.error("Auth: Signup error:", error);
      toast.error((error as Error).message || "An unknown error occurred during signup.");
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        throw error;
      }

      toast.success("Password reset email sent! Check your inbox.");
      setAuthFlow("login");
    } catch (error: unknown) {
      console.error("Auth: Forgot password error:", error);
      toast.error((error as Error).message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please enter and confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) { 
        throw error; 
      }

      console.log("Auth: Password set successfully for user:", data?.user?.id);
      toast.success("Password set successfully!");

      // Check if profile is complete
      const currentUser = user || data?.user || null;
      if (currentUser) {
        const needsCompletion = await checkProfileCompletion(currentUser.id);
        
        if (needsCompletion) {
          console.log("Auth: Profile incomplete, redirecting to complete profile");
          navigate("/complete-profile", {
            state: {
              prefillName: name || currentUser.user_metadata?.name,
              prefillEmail: email || currentUser.email,
            },
            replace: true,
          });
        } else {
          console.log("Auth: Profile complete, redirecting to dashboard");
          navigate("/home");
        }
      } else {
        navigate("/complete-profile", { replace: true });
      }
    } catch (error: unknown) {
      console.error("Auth: Set password error:", error);
      toast.error((error as Error).message || "An unknown error occurred while setting password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth`
      }
    });
    if (error) {
      toast.error("Google sign-in failed: " + error.message);
    }
    setGoogleLoading(false);
  };

  const getCardDescription = () => {
    switch (authFlow) {
      case "invite":
        return "Welcome! Set your password to complete your account setup";
      case "update-password":
        return "Enter your new password";
      case "reset":
        return "Enter your email to reset your password";
      default:
        return activeTab === "login" 
          ? "Enter your credentials to log in" 
          : "Create an account to get started";
    }
  };

  const showGoogleButton = authFlow === "login" || authFlow === "signup";
  const showTabs = authFlow === "login" || authFlow === "signup";

  return (
    <div className="min-h-screen pt-16">
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md border-primary/10">
          <CardHeader className="space-y-4 text-center">
            <div className="flex items-center justify-center">
              <img src="/logo.svg" alt="Doxxy" className="w-32 " />
            </div>
            <div>
              <CardDescription className="text-base">
                {getCardDescription()}
              </CardDescription>
            </div>
          </CardHeader>
        <CardContent className="space-y-4">
          {/* Google OAuth Button */}
          {showGoogleButton && (
            <>
              <Button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/30"
                variant="outline"
                disabled={googleLoading}
              >
                <img src="/google.svg" alt="Google" className="h-5 w-5" />
                {googleLoading ? "Signing in..." : "Sign in with Google"}
              </Button>
              <div className="flex items-center my-2">
                <div className="flex-grow border-t border-muted-foreground/20" />
                <span className="mx-2 text-muted-foreground text-xs">or</span>
                <div className="flex-grow border-t border-muted-foreground/20" />
              </div>
            </>
          )}

          {/* Password setting form for invites */}
          {authFlow === "invite" && (
            <form onSubmit={handleSetPassword}>
              <div className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-8"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-2.5"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-8"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 " 
                  disabled={loading}
                >
                  {loading ? "Setting password..." : "Set Password & Continue"}
                </Button>
              </div>
            </form>
          )}

          {/* Password update form for password reset */}
          {authFlow === "update-password" && (
            <form onSubmit={handleSetPassword}>
              <div className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-8"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-2.5"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-8"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 " 
                  disabled={loading}
                >
                  {loading ? "Updating password..." : "Update Password"}
                </Button>
              </div>
            </form>
          )}

          {/* Forgot password form */}
          {authFlow === "reset" && (
            <form onSubmit={handleForgotPassword}>
              <div className="space-y-4">
                <div className="flex items-center relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-8"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 " 
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Email"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setAuthFlow("login")}
                >
                  Back to Login
                </Button>
              </div>
            </form>
          )}

          {/* Regular login/signup tabs */}
          {showTabs && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-full bg-muted/30">
                <TabsTrigger 
                  value="login"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 pt-4">
                <form onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2.5 top-2.5"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        type="button" 
                        variant="link" 
                        className="text-sm p-0 h-auto"
                        onClick={() => setAuthFlow("reset")}
                      >
                        Forgot password?
                      </Button>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 " 
                      disabled={loading}
                    >
                      {loading ? "Logging in..." : "Log In"}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 pt-4">
                <form onSubmit={handleSignup}>
                  <div className="space-y-2">
                    <div className="relative">
                      <Text className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-8"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-8"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-8"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2.5 top-2.5"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 " 
                      disabled={loading}
                    >
                      {loading ? "Creating account..." : "Sign Up"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter className="flex-col">
          {showTabs && (
            <p className="text-center text-sm text-muted-foreground">
              {activeTab === "login" ? (
                <>
                  Don't have an account? Go to{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("signup")}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                  .
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    Log in
                  </button>{" "}
                  instead.
                </>
              )}
            </p>
          )}
        </CardFooter>
      </Card>
      </div>
    </div>
  );
};

export default Auth;
