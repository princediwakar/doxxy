"use client";

import { Suspense } from "react";
import Image from "next/image";
import { useAuthFlow } from "@/hooks/useAuth";
import { AuthCard } from "@/components/auth/AuthFlows";
import { Spinner } from '@/components/ui/loading';

// Disable static generation for auth page since it uses useSearchParams()
export const dynamic = 'force-dynamic';

const AuthContent = () => {
  const authProps = useAuthFlow();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="mb-8">
        <Image src="/logo.svg" alt="Doxxy" className="h-10 w-auto" width="200" height="40" priority />
      </div>
      <div className="w-full max-w-md">
        <AuthCard {...authProps} />
      </div>
    </div>
  );
};

const Auth = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
};

export default Auth;