// File: src/components/PrivateRoute.tsx
"use client";
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/loading";
import { useEffect } from "react"; 
import Layout from "@/components/Layout";

const PrivateRoute = ({ children }: { children?: React.ReactNode }) => {
  const {
    user,
    loading: initialLoading,
    clinicLoading,
    activeClinic,
    needsProfileCompletion
  } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // 1. Wait for loading to finish
    if (initialLoading || clinicLoading) return;

    // 2. No user -> Auth
    if (!user) {
      router.replace('/auth');
      return;
    }

    // 3. Profile Incomplete -> Complete Profile
    if (needsProfileCompletion && !pathname.startsWith('/complete-profile')) {
      router.replace('/complete-profile');
      return;
    }

    // 4. Logic Fix: Check for invitation token BEFORE redirecting to create-clinic
    // This protects against page refreshes or race conditions
    const invitationToken = typeof localStorage !== 'undefined' ? localStorage.getItem('invitation_token') : null;

    if (!needsProfileCompletion && !activeClinic && !pathname.startsWith('/create-clinic')) {
      // If we have a token, DO NOT redirect to create-clinic yet.
      // The loading state below will catch this and show a spinner.
      if (invitationToken) {
        console.log('PrivateRoute: Invitation token found, holding redirect.');
        return; 
      }
      
      console.log('PrivateRoute: No active clinic, redirecting to /create-clinic');
      router.replace('/create-clinic');
      return;
    }
  }, [user, initialLoading, clinicLoading, needsProfileCompletion, activeClinic, pathname, router]);

  // --- RENDER STATES ---

  // 1. Loading
  if (initialLoading || clinicLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // 2. No User (will redirect via useEffect)
  if (!user) return null;

  // 3. Invitation Processing State
  // If we aren't on create-clinic/profile, but have no clinic AND have a token, show loading
  if (!activeClinic && !pathname.startsWith('/create-clinic') && !pathname.startsWith('/complete-profile')) {
     const invitationToken = typeof localStorage !== 'undefined' ? localStorage.getItem('invitation_token') : null;
     if (invitationToken) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <Spinner size="lg" className="mx-auto mb-4" />
              <p className="text-muted-foreground">Setting up your clinic access...</p>
            </div>
          </div>
        );
     }
  }

  // 4. Allow /complete-profile
  if (pathname.startsWith('/complete-profile')) {
    return (
      <div className="min-h-screen">
        <main className="p-4 md:p-8 max-w-4xl mx-auto bg-white min-h-screen">
          {children}
        </main>
      </div>
    );
  }

  // 5. Allow /create-clinic
  if (pathname.startsWith('/create-clinic')) {
    return (
      <div className="min-h-screen">
        <main className="p-4 md:p-8 max-w-4xl mx-auto bg-white min-h-screen">
          {children}
        </main>
      </div>
    );
  }

  // 6. Standard Protected Route
  return <Layout>{children}</Layout>;
};

export default PrivateRoute;