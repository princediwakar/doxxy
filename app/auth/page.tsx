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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full p-6 flex items-center border-b border-border">
        <Image src="/logo.svg" alt="Doxxy" width={100} height={32} className="h-8 w-auto" priority />
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthCard {...authProps} />
        </div>
      </main>
    </div>
  );
};

const Auth = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col">
        <header className="w-full p-6 flex items-center border-b border-border">
          <Image src="/logo.svg" alt="Doxxy" width={100} height={32} className="h-8 w-auto" priority />
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto" />
            <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
};

export default Auth;