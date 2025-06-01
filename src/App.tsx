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
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
// import Billing from "./pages/Billing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import Profile from "./pages/Profile";
import CreateClinicPage from "./pages/CreateClinicPage";
import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes handled by PrivateRoute */}
            <Route element={<PrivateRoute />}> 
               {/* Clinic Selection Page and Create Clinic Page - only accessible if no active clinic, logic handled in PrivateRoute */}
               <Route path="/create-clinic" element={<CreateClinicPage />} />

              {/* Main application layout and nested routes - only accessible if active clinic, logic handled in PrivateRoute */}
              <Route element={<Layout />}> {/* Layout renders for main app paths */}
                <Route index element={<Dashboard />} /> {/* Dashboard is the index route within Layout */}
                <Route path="patients" element={<Patients />} />
                <Route path="doctors" element={<Doctors />} />
                <Route path="appointments" element={<Appointments />} />
                {/* <Route path="billing" element={<Billing />} /> */}
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
