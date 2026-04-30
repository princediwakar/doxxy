// app/(app)/settings/page.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Spinner } from '@/components/ui/loading';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import {
  Settings,
  Users,
  Building2,
  Building,
  ShieldAlert,
  Info,
  Wallet,
} from "lucide-react";

const ClinicDepartmentsManagement = dynamic(() => import('@/components/superadmin/ClinicDepartmentsManagement'));
const ClinicMembersManagement = dynamic(() => import('@/components/superadmin/ClinicMembersManagement'));
const ClinicDetailsManagement = dynamic(() => import('@/components/superadmin/ClinicDetailsManagement'));
const PaymentsDashboard = dynamic(() => import('@/components/payments/PaymentsDashboard').then(mod => mod.PaymentsDashboard));

const SettingsPage = () => {
  const { activeClinicRole, activeClinic } = useAuth();
  const isSuperadmin = activeClinicRole === "superadmin";
  const clinicName = activeClinic?.clinics?.name || "Unknown Clinic";

  if (!isSuperadmin) {
    return (
      <div className="container mx-auto px-4">
        <Card className="w-full">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="bg-destructive/10 p-4 rounded-full w-fit mx-auto">
                <ShieldAlert className="h-16 w-16 text-destructive" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 text-primary">Access Denied</h2>
                <p className="text-muted-foreground mb-4">
                  Only Superadmins can access clinic settings and management features.
                </p>
              </div>
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 max-w-md mx-auto w-full">
                <div className="flex items-center justify-center space-x-2 text-destructive">
                  <Info className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium truncate">
                    Current Role: {activeClinicRole || "No Role"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-0 space-y-6 w-full max-w-full overflow-x-hidden box-border">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate">Clinic Settings</h1>
            <p className="text-muted-foreground text-sm sm:text-base truncate">
              Manage settings and configuration for {clinicName}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="members" className="space-y-6 w-full max-w-full">
        {/* Horizontal scroll wrapper for tabs - explicitly allowing scroll here only */}
        <div className="border-b border-border w-full overflow-x-auto scrollbar-hide">
          <TabsList className="flex w-max justify-start gap-1 bg-transparent h-auto p-0 -mb-px">
            <TabsTrigger
              value="members"
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none data-[state=active]:text-primary border-b-2 border-transparent hover:bg-muted/50 rounded-t-md shrink-0"
            >
              <Users className="h-4 w-4" />
              <span className="text-sm whitespace-nowrap">Members</span>
            </TabsTrigger>
            <TabsTrigger
              value="departments"
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none data-[state=active]:text-primary border-b-2 border-transparent hover:bg-muted/50 rounded-t-md shrink-0"
            >
              <Building2 className="h-4 w-4" />
              <span className="text-sm whitespace-nowrap">Departments</span>
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none data-[state=active]:text-primary border-b-2 border-transparent hover:bg-muted/50 rounded-t-md shrink-0"
            >
              <Building className="h-4 w-4" />
              <span className="text-sm whitespace-nowrap">Details</span>
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none data-[state=active]:text-primary border-b-2 border-transparent hover:bg-muted/50 rounded-t-md shrink-0"
            >
              <Wallet className="h-4 w-4" />
              <span className="text-sm whitespace-nowrap">Payments</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Added min-w-0 and overflow-hidden to prevent flex children from blowing out width */}
        <TabsContent value="members" className="space-y-0 w-full min-w-0 overflow-hidden outline-none">
          <Suspense fallback={<div className="flex items-center justify-center p-4"><Spinner size="md" /></div>}>
            <ClinicMembersManagement />
          </Suspense>
        </TabsContent>

        <TabsContent value="departments" className="space-y-0 w-full min-w-0 overflow-hidden outline-none">
          <Suspense fallback={<div className="flex items-center justify-center p-4"><Spinner size="md" /></div>}>
            <ClinicDepartmentsManagement />
          </Suspense>
        </TabsContent>

        <TabsContent value="details" className="space-y-0 w-full min-w-0 overflow-hidden outline-none">
          <Suspense fallback={<div className="flex items-center justify-center p-4"><Spinner size="md" /></div>}>
            <ClinicDetailsManagement />
          </Suspense>
        </TabsContent>

        <TabsContent value="payments" className="space-y-0 w-full min-w-0 overflow-hidden outline-none">
          <Suspense fallback={<div className="flex items-center justify-center p-4"><Spinner size="md" /></div>}>
            <PaymentsDashboard />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;