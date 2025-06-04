import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ClinicDepartmentsManagement from '@/components/superadmin/ClinicDepartmentsManagement';
import ClinicMembersManagement from '@/components/superadmin/ClinicMembersManagement';
import ClinicDetailsManagement from '@/components/superadmin/ClinicDetailsManagement';

const SettingsPage = () => {
  const { activeClinicRole } = useAuth();

  // Ensure only superadmin can access this page
  if (activeClinicRole !== 'superadmin') {
    return <div className="p-4 text-center text-red-500">Access Denied: Only Superadmins can access settings.</div>;
  }

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-4">Clinic Settings</h1>
      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="mt-4">
          <ClinicMembersManagement />
        </TabsContent>
        <TabsContent value="departments" className="mt-4">
          <ClinicDepartmentsManagement />
        </TabsContent>
        <TabsContent value="details" className="mt-4">
          <ClinicDetailsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage; 