// components/auth/AuthFlows.tsx
import React, { useRef, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm, EmailField, OAuthDivider, GoogleButton } from "./AuthFormFields";
import { Spinner } from "@/components/ui/loading";
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
  otpCode: string;
  setOtpCode: (code: string) => void;
  verifying: boolean;
  verifyOTP: (code: string) => Promise<boolean | undefined>;
}

const getCardDescription = (otpSent: boolean) => {
  return otpSent
    ? "Enter the verification code sent to your email"
    : "Enter your email to sign in or create an account";
};

const getCardTitle = (otpSent: boolean) => {
  return otpSent ? "Verify Your Email" : "Welcome to Doxxy";
};

interface OTPInputProps {
  otpCode: string;
  setOtpCode: (code: string) => void;
  verifying: boolean;
  verifyOTP: (code: string) => Promise<boolean | undefined>;
  onError: () => void;
}

const OTPDigitInput: React.FC<OTPInputProps> = ({ otpCode, setOtpCode, verifying, verifyOTP, onError }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digitValues = otpCode.split("");

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) {
      // Paste: distribute characters
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newCode = Array.from({ length: 6 }, (_, i) => digits[i] || "");
      setOtpCode(digits.join("").padEnd(6, " ").trim());
      const lastFilled = Math.min(digits.length, 5);
      focusInput(lastFilled);
      return;
    }
    const newDigits = [...digitValues];
    newDigits[index] = value;
    while (newDigits.length < 6) newDigits.push("");
    const newCode = newDigits.join("");
    setOtpCode(newCode);
    if (value) {
      focusInput(Math.min(index + 1, 5));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digitValues[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    setOtpCode(pasted);
  };

  const verifyRef = useRef(verifyOTP);
  verifyRef.current = verifyOTP;
  const triggeredRef = useRef(false);

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    if (otpCode.length !== 6 || verifying || triggeredRef.current) return;
    triggeredRef.current = true;
    const timer = setTimeout(async () => {
      const success = await verifyRef.current(otpCode);
      if (!success) {
        triggeredRef.current = false;
        onError();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [otpCode, verifying, onError]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-foreground mb-1">Enter verification code</h3>
        <p className="text-xs text-muted-foreground">
          We sent a 6-digit code to your email
        </p>
      </div>

      {verifying ? (
        <div className="flex justify-center py-4">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {Array.from({ length: 6 }, (_, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]"
              maxLength={1}
              value={digitValues[i] || ""}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-10 h-12 text-center text-lg font-semibold rounded-lg border border-input bg-background focus:border-primary focus:ring-1 focus:ring-ring focus:ring-offset-0 outline-none transition-colors"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const UnifiedAuthFlow: React.FC<AuthFlowProps> = ({
  email,
  setEmail,
  loading,
  googleLoading,
  handleEmailAuth,
  handleGoogleSignIn,
  otpSent,
  resendOTP,
  otpCode,
  setOtpCode,
  verifying,
  verifyOTP,
}) => {
  const [shake, setShake] = React.useState(false);

  const handleError = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <>
      {!otpSent ? (
        // Email Entry Step — Google first, then email
        <>
          <GoogleButton onClick={handleGoogleSignIn} loading={googleLoading} />
          <OAuthDivider />
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
            We&apos;ll send you a verification code to sign in or create your account
          </div>
        </>
      ) : (
        // OTP Verification Step
        <div className={shake ? "animate-shake" : ""}>
          <OTPDigitInput
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            verifying={verifying}
            verifyOTP={verifyOTP}
            onError={handleError}
          />

          <div className="flex gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={resendOTP}
              disabled={loading || verifying}
            >
              Resend Code
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => window.location.reload()}
              disabled={verifying}
            >
              Change Email
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

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