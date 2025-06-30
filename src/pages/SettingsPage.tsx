import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ClinicDepartmentsManagement from '@/components/superadmin/ClinicDepartmentsManagement';
import ClinicMembersManagement from '@/components/superadmin/ClinicMembersManagement';
import ClinicDetailsManagement from '@/components/superadmin/ClinicDetailsManagement';
import { 
  Settings, 
  Users, 
  Building2, 
  Building, 
  ShieldAlert,
  Info,
  Shield,
  Heart,
  Stethoscope
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
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary">Clinic Settings</h1>
                <p className="text-muted-foreground">
                  Manage settings and configuration for 
                  <span className="font-bold text-primary">{" "} {clinicName}</span>
                </p>
              </div>
            </div>
          <Badge className="">
            <Stethoscope className="h-3 w-3 mr-1" />
            Superadmin Access
          </Badge>
        </div>

        {/* Info Card
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Info className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm text-primary">
                <p className="font-medium mb-1">Settings Management</p>
                <p className="text-muted-foreground">Use the tabs below to manage different aspects of your clinic. Changes are saved automatically and take effect immediately.</p>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-muted/30">
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
      </Tabs>
    </div>
  );
};

export default SettingsPage; 