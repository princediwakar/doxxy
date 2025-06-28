// File: src/App.tsx

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import { AppHeader } from "./components/AppHeader";
import { Suspense, lazy } from "react";

// Lazy load page components for better code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Appointments = lazy(() => import("./pages/Appointments"));
const Patients = lazy(() => import("./pages/Patients"));
const Billing = lazy(() => import("./pages/Billing"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const CreateClinicPage = lazy(() => import("./pages/CreateClinicPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const CompleteProfile = lazy(() => import("@/pages/CompleteProfile"));
const TermsPage = lazy(() => import("./pages/Terms"));
const PrivacyPage = lazy(() => import("./pages/Privacy"));
const Consultation = lazy(() => import("./pages/Consultation"));
const LandingPage = lazy(() => import("./pages/LandingPage"));

// Configure QueryClient with better caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disable automatic refetch on window focus
      staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
      gcTime: 1000 * 60 * 30, // Cache persists for 30 minutes
      retry: 1, // Only retry failed requests once
    },
  },
});

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        
        {/* Protected routes handled by PrivateRoute */}
        <Route element={<PrivateRoute />}> 
          <Route path="/create-clinic" element={<CreateClinicPage />} />
          <Route element={<Layout />}> {/* Layout renders for main app paths */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients/*" element={<Patients />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/consultation/:appointmentId" element={<Consultation />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AppHeader />
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
