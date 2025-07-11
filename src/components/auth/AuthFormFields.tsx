import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, Text } from "lucide-react";

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

interface NameFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export const NameField: React.FC<NameFieldProps> = ({ value, onChange, required = false }) => (
  <div className="relative">
    <Text className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      type="text"
      placeholder="Enter your name"
      value={value}
      onChange={onChange}
      className="pl-9 py-2 text-base rounded-lg border border-input focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
      required={required}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
    />
  </div>
);

interface PasswordFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  showPassword?: boolean;
  toggleShowPassword?: () => void;
  required?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  value,
  onChange,
  placeholder,
  showPassword,
  toggleShowPassword,
  required = false,
}) => (
  <div className="relative">
    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      type={showPassword ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="pl-9 py-2 text-base rounded-lg border border-input focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
      required={required}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
    />
    {toggleShowPassword && (
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2"
        onClick={toggleShowPassword}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
    )}
  </div>
);

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
    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border bg-white hover:bg-muted/20 text-foreground font-medium"
    variant="outline"
    disabled={loading}
    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
  >
    <img src="/google.svg" alt="Google" className="h-5 w-5" />
    {loading ? "Signing in..." : "Sign in with Google"}
  </Button>
);

interface FormFooterSwitcherProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const FormFooterSwitcher: React.FC<FormFooterSwitcherProps> = ({ activeTab, setActiveTab }) => (
  <p className="text-center text-sm text-muted-foreground font-sans pt-4">
    {activeTab === "login" ? (
      <>
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => setActiveTab("signup")}
          className="text-primary hover:underline cursor-pointer font-medium"
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
          className="text-primary hover:underline cursor-pointer font-medium"
        >
          Log in
        </button>{" "}
        instead.
      </>
    )}
  </p>
); 