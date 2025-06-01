import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Mail, Lock, Text } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [isInviteFlow, setIsInviteFlow] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, activeClinic, activeClinicRole, loading: authLoading } = useAuth();

  const handleInvite = useCallback(async (inviteToken: string, inviteEmail: string | null) => {
      setLoading(true);
      try {
        const { error } = await supabase.auth.verifyOtp({
          email: inviteEmail || '',
          token: inviteToken,
          type: 'invite',
        });

        if (error) {
          toast.error(error.message || "Invalid or expired invite token.");
          console.error("Invite verification error:", error);
          setIsInviteFlow(false);
        } else {
          setIsInviteFlow(true);
          toast.info("Please set your new password.");
          navigate(location.pathname, { replace: true });
        }
      } catch (error: unknown) {
        console.error("An error occurred during invite verification:", error);
        toast.error((error as Error).message || "An unknown error occurred during invite verification.");
        setIsInviteFlow(false);
      } finally {
        setLoading(false);
      }
  }, [navigate]);

  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    const emailFromUrl = searchParams.get('email');

    if (authLoading) return;

    if (activeClinic !== null && location.pathname === '/auth') {
        console.log("Auth.tsx: Logged in user has active clinic, redirecting to /.");
        navigate('/', { replace: true });
        return;
    }

    if (!authLoading && user && activeClinic === null && !isInviteFlow) {
      console.log("Auth.tsx: Logged in user has no active clinic, redirecting to / (clinic selection).");
      navigate('/', { replace: true });
      return;
    }

    if (token && type === 'invite' && !user) {
       handleInvite(token, emailFromUrl);
       return;
    }

    if (!isInviteFlow && !user) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
             console.log('Auth state changed in Auth.tsx listener', event, session);
      }
    );
    return () => {
      subscription.unsubscribe();
    };
    }

  }, [navigate, searchParams, activeClinic, authLoading, isInviteFlow, handleInvite, user]);

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
        toast.success("Login successful!");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
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
        toast.success("Account created successfully!");
      } else {
        toast.info("Please check your email for verification");
      }
    } catch (error: unknown) {
      console.error("Signup error:", error);
      toast.error((error as Error).message || "An unknown error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please enter and confirm your new password.");
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

      if (error) { throw error; }

      toast.success("Password set successfully! You are now logged in.");
    } catch (error: unknown) {
      console.error("Set password error:", error);
      toast.error((error as Error).message || "An unknown error occurred during setting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Doxxy Clinic</CardTitle>
          <CardDescription>
            {isInviteFlow
              ? "Set your password"
              : activeTab === "login"
              ? "Enter your credentials to log in" 
              : "Create an account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isInviteFlow ? (
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Setting password..." : "Set Password"}
                </Button>
              </div>
            </form>
          ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 pt-4">
              <form onSubmit={handleLogin}>
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="email" 
                      placeholder="Email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="pl-8"
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
                  
                  <Button type="submit" className="w-full" disabled={loading}>
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
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
          )}
        </CardContent>
        <CardFooter className="flex-col">
          <p className="text-center text-sm text-muted-foreground">
            {activeTab === "login" 
              ? "Don't have an account? Try signing up." 
              : "Already have an account? Log in instead."}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
