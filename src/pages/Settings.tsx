import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ClinicDepartmentsManagement from '@/components/superadmin/ClinicDepartmentsManagement';
import ClinicMembersManagement from '@/components/superadmin/ClinicMembersManagement';
import ClinicDetailsManagement from '@/components/superadmin/ClinicDetailsManagement';
import { PaymentsDashboard } from '@/components/payments/PaymentsDashboard';
import { 
  Settings, 
  Users, 
  Building2, 
  Building, 
  ShieldAlert,
  Info,
  Wallet
} from 'lucide-react';

const SettingsPage = () => {
  const { activeClinicRole, activeClinic } = useAuth();
  const isSuperadmin = activeClinicRole === 'superadmin';
  const clinicName = activeClinic?.clinics?.name || 'Unknown Clinic';

  // Early return for access control
  if (!isSuperadmin) {
    return (
      <div className="container mx-auto">
        <Card className="">
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
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-2 text-destructive">
                  <Info className="h-4 w-4" />
                  <span className="text-sm font-medium">Current Role: {activeClinicRole || 'No Role'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                <Settings className="w-5 h-5 " />
              </div>
              <div>
                <h1 className="text-2xl font-bold ">Clinic Settings</h1>
                <p className="text-muted-foreground">
                  Manage settings and configuration for 
                  <span className="font-bold ">{" "} {clinicName}</span>
                </p>
              </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px] bg-muted/30">
          <TabsTrigger 
            value="members" 
            className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Users className="h-4 w-4" />
            <span>Members</span>
          </TabsTrigger>
          <TabsTrigger 
            value="departments" 
            className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Building2 className="h-4 w-4" />
            <span>Departments</span>
          </TabsTrigger>
          <TabsTrigger 
            value="details" 
            className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Building className="h-4 w-4" />
            <span>Details</span>
          </TabsTrigger>
          <TabsTrigger 
            value="payments" 
            className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Wallet className="h-4 w-4" />
            <span>Payments</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-0">
          <ClinicMembersManagement />
        </TabsContent>

        <TabsContent value="departments" className="space-y-0">
          <ClinicDepartmentsManagement />
        </TabsContent>

        <TabsContent value="details" className="space-y-0">
          <ClinicDetailsManagement />
        </TabsContent>

        <TabsContent value="payments" className="space-y-0">
          <PaymentsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage; 