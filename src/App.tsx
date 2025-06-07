// File: src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";

import Appointments from "./pages/Appointments";
import MedicalRecords from "./pages/MedicalRecords";
import Prescriptions from "./pages/Prescriptions";
import Billing from "./pages/Billing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import Profile from "./pages/Profile";
import CreateClinicPage from "./pages/CreateClinicPage";
import SettingsPage from "./pages/SettingsPage";
import CompleteProfile from "@/pages/CompleteProfile";

const queryClient = new QueryClient();

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={<Auth />} />
      {/* Protected routes handled by PrivateRoute */}
      <Route element={<PrivateRoute />}> 
        <Route path="/create-clinic" element={<CreateClinicPage />} />
        <Route element={<Layout />}> {/* Layout renders for main app paths */}
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="medical-records" element={<MedicalRecords />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="billing" element={<Billing />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
