"use client";

import { Suspense } from "react";
import { useAuthFlow } from "@/hooks/useAuth";
import { AuthCard } from "@/components/auth/AuthFlows";

// Disable static generation for auth page since it uses useSearchParams()
export const dynamic = 'force-dynamic';

const AuthContent = () => {
  const authProps = useAuthFlow();

  // If user is already authenticated and has active clinic, the hook will redirect
  if (authProps.authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <AuthCard {...authProps} />
      </div>
    </div>
  );
};

const Auth = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
};

export default Auth;