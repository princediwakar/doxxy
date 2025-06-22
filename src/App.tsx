// File: src/App.tsx

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Patients from "./pages/Patients";
import Prescriptions from "./pages/Prescriptions";
import Billing from "./pages/Billing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import CreateClinicPage from "./pages/CreateClinicPage";
import SettingsPage from "./pages/SettingsPage";
import CompleteProfile from "@/pages/CompleteProfile";
import TermsPage from "./pages/Terms";
import PrivacyPage from "./pages/Privacy";
import Consultation from "./pages/Consultation";
import PrivateRoute from "./components/PrivateRoute";
import { AppHeader } from "./components/AppHeader";

const queryClient = new QueryClient();

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      
      {/* Root route - redirect to dashboard with authentication check */}
      <Route path="/" element={<PrivateRoute><Navigate to="/dashboard" replace /></PrivateRoute>} />
      
      {/* Protected routes handled by PrivateRoute */}
      <Route element={<PrivateRoute />}> 
        <Route path="/create-clinic" element={<CreateClinicPage />} />
        <Route element={<Layout />}> {/* Layout renders for main app paths */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients/*" element={<Patients />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/consultation/:appointmentId" element={<Consultation />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
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
