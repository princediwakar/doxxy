import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm, EmailField, OAuthDivider, GoogleButton } from "./AuthFormFields";
import { AuthFlow } from "@/hooks/useAuth";

interface AuthFlowProps {
  email: string;
  setEmail: (email: string) => void;
  loading: boolean;
  googleLoading: boolean;
  authFlow: AuthFlow;
  handleEmailAuth: (e: React.FormEvent) => void;
  handleGoogleSignIn: () => void;
  otpSent: boolean;
  resendOTP: () => void;
}

const getCardDescription = (otpSent: boolean) => {
  return otpSent 
    ? "Enter the verification code sent to your email" 
    : "Enter your email to sign in or create an account";
};

const getCardTitle = (otpSent: boolean) => {
  return otpSent ? "Verify Your Email" : "Welcome to Doxxy";
};

export const UnifiedAuthFlow: React.FC<AuthFlowProps> = ({
  email,
  setEmail,
  loading,
  googleLoading,
  handleEmailAuth,
  handleGoogleSignIn,
  otpSent,
  resendOTP
}) => (
  <>
    {!otpSent ? (
      // Email Entry Step
      <>
        <AuthForm onSubmit={handleEmailAuth}>
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
            {loading ? "Sending code..." : "Continue with Email"}
          </Button>
        </AuthForm>
        
        <div className="text-center text-xs text-muted-foreground">
          We'll send you a verification code to sign in or create your account
        </div>
        
        <OAuthDivider />
        <GoogleButton onClick={handleGoogleSignIn} loading={googleLoading} />
      </>
    ) : (
      // Magic Link Verification Step
      <div className="text-center space-y-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Check Your Email</h3>
          <p className="text-sm text-muted-foreground">
            We sent a magic link to <strong>{email}</strong>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Click the link in your email to sign in instantly
          </p>
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            You can close this window and check your email, or wait here - you'll be signed in automatically when you click the link.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={resendOTP}
            disabled={loading}
          >
            Resend Link
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={() => window.location.reload()}
          >
            Change Email
          </Button>
        </div>
      </div>
    )}
  </>
);

export const AuthCard: React.FC<AuthFlowProps> = (props) => {
  const { otpSent } = props;
  
  return (
    <Card className="w-full max-w-md shadow-lg border-0 bg-card">
      <CardHeader className="space-y-2 text-center pb-4">
        <CardTitle className="text-xl font-semibold text-foreground font-sans">
          {getCardTitle(otpSent)}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground font-sans">
          {getCardDescription(otpSent)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-0">
        <UnifiedAuthFlow {...props} />
      </CardContent>
    </Card>
  );
};