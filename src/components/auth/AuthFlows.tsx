import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm, EmailField, NameField, PasswordField, OAuthDivider, GoogleButton, FormFooterSwitcher } from "./AuthFormFields";
import { AuthFlow } from "@/hooks/useAuth";

interface AuthFlowProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  name: string;
  setName: (name: string) => void;
  loading: boolean;
  googleLoading: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  authFlow: AuthFlow;
  handleLogin: (e: React.FormEvent) => void;
  handleSignup: (e: React.FormEvent) => void;
  handleForgotPassword: (e: React.FormEvent) => void;
  handleSetPassword: (e: React.FormEvent) => void;
  handleGoogleSignIn: () => void;
}

const getCardDescription = (authFlow: AuthFlow) => {
  switch (authFlow) {
    case "signup":
      return "Create a new account to get started";
    case "reset":
      return "Enter your email to reset your password";
    case "invite":
      return "Complete your account setup by setting a password";
    case "update-password":
      return "Please set your new password";
    default:
      return "Welcome back! Please sign in to your account";
  }
};

export const LoginFlow: React.FC<Pick<AuthFlowProps, 'email' | 'setEmail' | 'password' | 'setPassword' | 'loading' | 'googleLoading' | 'showPassword' | 'setShowPassword' | 'handleLogin' | 'handleGoogleSignIn' | 'setActiveTab'>> = ({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  googleLoading,
  showPassword,
  setShowPassword,
  handleLogin,
  handleGoogleSignIn,
  setActiveTab
}) => (
  <>
    <AuthForm onSubmit={handleLogin}>
      <EmailField
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <PasswordField
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        showPassword={showPassword}
        toggleShowPassword={() => setShowPassword(!showPassword)}
        required
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setActiveTab("reset")}
          className="text-sm text-primary hover:underline cursor-pointer"
        >
          Forgot your password?
        </button>
      </div>
      <Button
        type="submit"
        className="w-full py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
        disabled={loading}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </AuthForm>
    
    <OAuthDivider />
    <GoogleButton onClick={handleGoogleSignIn} loading={googleLoading} />
  </>
);

export const SignupFlow: React.FC<Pick<AuthFlowProps, 'name' | 'setName' | 'email' | 'setEmail' | 'password' | 'setPassword' | 'confirmPassword' | 'setConfirmPassword' | 'loading' | 'googleLoading' | 'showPassword' | 'setShowPassword' | 'handleSignup' | 'handleGoogleSignIn'>> = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  googleLoading,
  showPassword,
  setShowPassword,
  handleSignup,
  handleGoogleSignIn
}) => (
  <>
    <AuthForm onSubmit={handleSignup}>
      <NameField
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <EmailField
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <PasswordField
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Create a password"
        showPassword={showPassword}
        toggleShowPassword={() => setShowPassword(!showPassword)}
        required
      />
      <PasswordField
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm your password"
        required
      />
      <Button
        type="submit"
        className="w-full py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
        disabled={loading}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
      >
        {loading ? "Creating account..." : "Create Account"}
      </Button>
    </AuthForm>
    
    <OAuthDivider />
    <GoogleButton onClick={handleGoogleSignIn} loading={googleLoading} />
  </>
);

export const ResetPasswordFlow: React.FC<Pick<AuthFlowProps, 'email' | 'setEmail' | 'loading' | 'handleForgotPassword' | 'setActiveTab'>> = ({
  email,
  setEmail,
  loading,
  handleForgotPassword,
  setActiveTab
}) => (
  <AuthForm onSubmit={handleForgotPassword}>
    <EmailField
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    <Button
      type="submit"
      className="w-full py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
      disabled={loading}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      {loading ? "Sending..." : "Send Reset Email"}
    </Button>
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={() => setActiveTab("login")}
    >
      Back to Sign In
    </Button>
  </AuthForm>
);

export const SetPasswordFlow: React.FC<Pick<AuthFlowProps, 'password' | 'setPassword' | 'confirmPassword' | 'setConfirmPassword' | 'loading' | 'showPassword' | 'setShowPassword' | 'handleSetPassword'>> = ({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  showPassword,
  setShowPassword,
  handleSetPassword
}) => (
  <AuthForm onSubmit={handleSetPassword}>
    <PasswordField
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter your new password"
      showPassword={showPassword}
      toggleShowPassword={() => setShowPassword(!showPassword)}
      required
    />
    <PasswordField
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      placeholder="Confirm your new password"
      required
    />
    <Button
      type="submit"
      className="w-full py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
      disabled={loading}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      {loading ? "Setting password..." : "Set Password"}
    </Button>
  </AuthForm>
);

export const AuthCard: React.FC<AuthFlowProps> = (props) => {
  const { authFlow, activeTab, setActiveTab } = props;
  
  const showTabsAndSwitcher = authFlow === "login" || authFlow === "signup";
  
  return (
    <Card className="w-full max-w-md shadow-lg border-0 bg-card">
      <CardHeader className="space-y-2 text-center pb-4">
        <CardTitle className="text-xl font-semibold text-foreground font-sans">
          {authFlow === "invite" ? "Complete Your Account" : 
           authFlow === "update-password" ? "Set New Password" :
           authFlow === "reset" ? "Reset Password" : "Doxxy"}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground font-sans">
          {getCardDescription(authFlow)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-0">
        {authFlow === "reset" ? (
          <ResetPasswordFlow {...props} />
        ) : authFlow === "invite" || authFlow === "update-password" ? (
          <SetPasswordFlow {...props} />
        ) : showTabsAndSwitcher ? (
          <>
            {activeTab === "login" ? (
              <LoginFlow {...props} />
            ) : (
              <SignupFlow {...props} />
            )}
            <FormFooterSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}; 