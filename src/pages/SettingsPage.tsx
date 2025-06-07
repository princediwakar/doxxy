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
  Info
} from 'lucide-react';

const SettingsPage = () => {
  const { activeClinicRole, activeClinic } = useAuth();
  const isSuperadmin = activeClinicRole === 'superadmin';
  const clinicName = activeClinic?.clinics?.name || 'Unknown Clinic';

  // Early return for access control
  if (!isSuperadmin) {
    return (
      <div className="container mx-auto ">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <ShieldAlert className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Access Denied</h2>
              <p className="text-gray-600 mb-4">
                Only Superadmins can access clinic settings and management features.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center space-x-2 text-red-800">
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
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clinic Settings</h1>
              <p className="text-gray-600">
                Manage settings and configuration for {clinicName}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
            <Settings className="h-3 w-3 mr-1" />
            Superadmin Access
          </Badge>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Settings Management</p>
                <p>Use the tabs below to manage different aspects of your clinic. Changes are saved automatically and take effect immediately.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="members" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Members</span>
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Departments</span>
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center space-x-2">
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