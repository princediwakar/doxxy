// File: src/components/PrivateRoute.tsx
// Updated for Next.js - uses Next.js navigation instead of React Router
"use client";
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/loading";
import { useEffect } from "react";

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

  // Handle redirects with useEffect to avoid rendering issues
  useEffect(() => {
    if (initialLoading || clinicLoading) return;

    if (!user) {
      console.log('PrivateRoute: No user, redirecting to /auth');
      router.replace('/auth');
      return;
    }

    // Profile incomplete - redirect to complete profile
    if (needsProfileCompletion && pathname !== '/complete-profile') {
      console.log('PrivateRoute: Profile incomplete, redirecting to /complete-profile');
      router.replace('/complete-profile');
      return;
    }

    // Profile complete but no active clinic - redirect to create clinic
    if (!needsProfileCompletion && !activeClinic && pathname !== '/create-clinic') {
      console.log('PrivateRoute: No active clinic, redirecting to /create-clinic');
      router.replace('/create-clinic');
      return;
    }
  }, [user, initialLoading, clinicLoading, needsProfileCompletion, activeClinic, pathname, router]);

  // Wait for both initial session and clinic data to load
  if (initialLoading || clinicLoading) {
    console.log('PrivateRoute: Waiting for initial or clinic loading');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // If no user, show nothing (redirect handled by useEffect)
  if (!user) {
    return null;
  }

  // Clean up invitation tokens if user has active clinic
  if (activeClinic) {
    const shouldCleanup =
      sessionStorage.getItem('invitation_token') ||
      sessionStorage.getItem('invitation_start_time');

    if (shouldCleanup) {
      console.log('PrivateRoute: User has active clinic, cleaning up invitation tokens');
      sessionStorage.removeItem('invitation_token');
      sessionStorage.removeItem('invitation_start_time');
    }
  }

  // Check if invitation is being processed
  if (!needsProfileCompletion && !activeClinic && pathname !== '/create-clinic') {
    const invitationToken = typeof localStorage !== 'undefined' ? localStorage.getItem('invitation_token') : null;

    if (invitationToken) {
      // Show loading state while invitation is being processed
      console.log('PrivateRoute: Invitation being processed, showing loading state');
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Processing your invitation...</p>
          </div>
        </div>
      );
    }
  }

  // Allow /complete-profile page to render even without active clinic
  if (pathname === '/complete-profile') {
    console.log('PrivateRoute: Rendering /complete-profile page');
    return (
      <div className="min-h-screen">
        <main className="p-4 md:p-8 max-w-4xl mx-auto bg-white min-h-screen">
          {children}
        </main>
      </div>
    );
  }

  // Allow /create-clinic page to render
  if (pathname === '/create-clinic') {
    console.log('PrivateRoute: Rendering /create-clinic page');
    return (
      <div className="min-h-screen">
        <main className="p-4 md:p-8 max-w-4xl mx-auto bg-white min-h-screen">
          {children}
        </main>
      </div>
    );
  }

  // Clear invitation tokens if we have an active clinic (invitation was processed successfully)
  if (activeClinic) {
    const invitationToken = sessionStorage.getItem('invitation_token');
    if (invitationToken) {
      console.log('PrivateRoute: Invitation processed successfully, clearing tokens');
      sessionStorage.removeItem('invitation_token');
      sessionStorage.removeItem('invitation_start_time');
    }
  }

  console.log('PrivateRoute: Rendering protected content');
  return <>{children}</>;
};

export default PrivateRoute;