// components/auth/AuthFormFields.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

interface AuthFormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSubmit, children }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    {children}
  </form>
);

interface EmailFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export const EmailField: React.FC<EmailFieldProps> = ({ value, onChange, required = false }) => (
  <div className="relative">
    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      type="email"
      placeholder="Enter your email"
      value={value}
      onChange={onChange}
      className="pl-9 py-2 text-base rounded-lg border border-input focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
      required={required}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
    />
  </div>
);

// Removed NameField and PasswordField - no longer needed for unified auth

export const OAuthDivider: React.FC = () => (
  <div className="relative flex items-center py-4">
    <div className="flex-grow border-t border-muted-foreground/20" />
    <span className="mx-4 text-muted-foreground text-xs font-sans">or</span>
    <div className="flex-grow border-t border-foreground/20" />
  </div>
);

interface GoogleButtonProps {
  onClick: () => void;
  loading: boolean;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({ onClick, loading }) => (
  <Button
    onClick={onClick}
    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border bg-background hover:bg-muted/20 text-foreground font-medium"
    variant="outline"
    disabled={loading}
    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
  >
    <img src="/google.svg" alt="Google" className="h-5 w-5" />
    {loading ? "Signing in..." : "Sign in with Google"}
  </Button>
);

interface OTPFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export const OTPField: React.FC<OTPFieldProps> = ({ value, onChange, required = false }) => (
  <div className="relative">
    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      type="text"
      placeholder="Enter verification code"
      value={value}
      onChange={onChange}
      className="pl-9 py-2 text-base rounded-lg border border-input focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 text-center tracking-widest"
      required={required}
      maxLength={6}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
    />
  </div>
);

// Removed FormFooterSwitcher - no longer needed with unified auth flow 