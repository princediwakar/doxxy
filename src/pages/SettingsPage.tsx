import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ClinicDepartmentsManagement from '@/components/superadmin/ClinicDepartmentsManagement';

const SettingsPage = () => {
  const { activeClinicRole } = useAuth();

  // Ensure only superadmin can access this page
  if (activeClinicRole !== 'superadmin') {
    return <div className="p-4 text-center text-red-500">Access Denied: Only Superadmins can access settings.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Clinic Settings</h1>
      <Tabs defaultValue="departments">
        <TabsList>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          {/* Add more settings tabs here */}
          {/* <TabsTrigger value="members">Members</TabsTrigger> */}
          {/* <TabsTrigger value="details">Details</TabsTrigger> */}
        </TabsList>
        <TabsContent value="departments" className="mt-4">
          <ClinicDepartmentsManagement />
        </TabsContent>
        {/* Add more settings content here */}
        {/* <TabsContent value="members" className="mt-4">Clinic Members Management Component</TabsContent> */}
        {/* <TabsContent value="details" className="mt-4">Clinic Details Management Component</TabsContent> */}
      </Tabs>
    </div>
  );
};

export default SettingsPage; 