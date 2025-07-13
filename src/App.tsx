// File: src/App.tsx

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
const SettingsPage = lazy(() => import("./pages/Settings"));
const CompleteProfile = lazy(() => import("@/pages/CompleteProfile"));
const TermsPage = lazy(() => import("./pages/(marketing)/Terms"));
const PrivacyPage = lazy(() => import("./pages/(marketing)/Privacy"));
const Consultation = lazy(() => import("./pages/Consultation"));
const LandingPage = lazy(() => import("./pages/(marketing)/LandingPage"));
const Features = lazy(() => import("./pages/(marketing)/Features"));
const Pricing = lazy(() => import("./pages/(marketing)/Pricing"));
const About = lazy(() => import("./pages/(marketing)/About"));
const Contact = lazy(() => import("./pages/(marketing)/Contact"));
const ComparisonIndex = lazy(() => import("./pages/(marketing)/comparisons/index"));
const DoxxyVsEkaCare = lazy(() => import("./pages/(marketing)/comparisons/DoxxyVsEkaCare"));
const EkaCareAlternative = lazy(() => import("./pages/(marketing)/comparisons/EkaCareAlternative"));
const DoxxyVsPracto = lazy(() => import("./pages/(marketing)/comparisons/DoxxyVsPracto"));
const DoxxyVsMFine = lazy(() => import("./pages/(marketing)/comparisons/DoxxyVsMFine"));
const DoxxyVsLybrate = lazy(() => import("./pages/(marketing)/comparisons/DoxxyVsLybrate"));
const DoxxyVsClinicPlus = lazy(() => import("./pages/(marketing)/comparisons/DoxxyVsClinicPlus"));
const FAQ = lazy(() => import("./pages/(marketing)/FAQ"));
const Security = lazy(() => import("./pages/(marketing)/Security"));


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


const AppContent = () => {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes with AppHeader */}
          <Route element={<AppHeader />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/comparisons" element={<ComparisonIndex />} />
            <Route path="/comparisons/doxxy-vs-eka-care" element={<DoxxyVsEkaCare />} />
            <Route path="/comparisons/eka-care-alternative" element={<EkaCareAlternative />} />
            <Route path="/comparisons/doxxy-vs-practo" element={<DoxxyVsPracto />} />
            <Route path="/comparisons/doxxy-vs-mfine" element={<DoxxyVsMFine />} />
            <Route path="/comparisons/doxxy-vs-lybrate" element={<DoxxyVsLybrate />} />
            <Route path="/comparisons/doxxy-vs-clinicplus" element={<DoxxyVsClinicPlus />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/security" element={<Security />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/auth" element={<Auth />} />

          </Route>
          {/* Protected routes handled by PrivateRoute */}
          <Route element={<PrivateRoute />}>
            <Route path="/create-clinic" element={<CreateClinicPage />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patients/*" element={<Patients />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/consultation/:appointmentId" element={<Consultation />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="/complete-profile" element={<CompleteProfile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;


