import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type DepartmentType = Database['public']['Tables']['department_types']['Row'];
type ClinicDepartment = Database['public']['Tables']['clinic_departments']['Row'];

const ClinicDepartmentsManagement = () => {
  const { activeClinic, activeClinicRole } = useAuth();
  const queryClient = useQueryClient();

  const clinicId = activeClinic?.clinic_id;
  const isSuperadmin = activeClinicRole === 'superadmin';

  // Fetch all available department types (called unconditionally)
  const { data: departmentTypes, isLoading: isLoadingDepartmentTypes } = useQuery<DepartmentType[]>({
    queryKey: ['departmentTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('department_types')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch clinic departments for the active clinic (called unconditionally, enabled based on conditions)
  const { data: clinicDepartments, isLoading: isLoadingClinicDepartments } = useQuery<ClinicDepartment[]>({
    queryKey: ['clinicDepartmentsForClinic', clinicId], // Use a specific key for clinic departments per clinic
    queryFn: async () => {
      if (!clinicId) return []; // Should not run if !clinicId due to enabled, but good practice
      const { data, error } = await supabase
        .from('clinic_departments')
        .select('*')
        .eq('clinic_id', clinicId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!clinicId && isSuperadmin, // Only run query if clinicId is available AND user is superadmin
  });

  // Mutation to add a department to the clinic (called unconditionally)
  const addDepartmentMutation = useMutation<void, Error, string>({ // Input is department_type_id
    mutationFn: async (departmentTypeId) => {
      if (!clinicId) throw new Error('Active clinic not found.');
      const { error } = await supabase
        .from('clinic_departments')
        .insert({
          clinic_id: clinicId,
          department_type_id: departmentTypeId,
        });
      if (error) throw error;
    },
    onSuccess: (_, departmentTypeName) => {
        // Invalidate clinic departments query to refetch
        queryClient.invalidateQueries({ queryKey: ['clinicDepartmentsForClinic', clinicId] });
         // Find the name to show in toast - need to rethink onSuccess context or fetch name separately
        // toast.success(`${departmentTypeName} added to clinic departments.`);
        toast.success('Department added to clinic departments.');

    },
    onError: (error) => {
      console.error('Error adding department:', error);
      toast.error('Failed to add department to clinic.', { description: error.message });
    },
  });

  // Mutation to remove a department from the clinic (called unconditionally)
  const removeDepartmentMutation = useMutation<void, Error, string>({ // Input is clinic_department_id
    mutationFn: async (clinicDepartmentId) => {
       if (!clinicId) throw new Error('Active clinic not found.');
      const { error } = await supabase
        .from('clinic_departments')
        .delete()
        .eq('id', clinicDepartmentId);
      if (error) throw error;
    },
     onSuccess: () => {
         // Invalidate clinic departments query to refetch
        queryClient.invalidateQueries({ queryKey: ['clinicDepartmentsForClinic', clinicId] });
        toast.success('Department removed from clinic departments.');
    },
    onError: (error) => {
       console.error('Error removing department:', error);
       toast.error('Failed to remove department from clinic.', { description: error.message });
    },
  });

  const handleCheckChange = (isChecked: boolean, departmentTypeId: string) => {
     const clinicDepartment = clinicDepartments?.find(cd => cd.department_type_id === departmentTypeId);

    if (isChecked) {
      // If checked and doesn't exist, add it
      if (!clinicDepartment) {
        addDepartmentMutation.mutate(departmentTypeId);
      }
    } else {
      // If unchecked and exists, remove it
      if (clinicDepartment) {
        removeDepartmentMutation.mutate(clinicDepartment.id);
      }
    }
  };

  const isLoading = isLoadingDepartmentTypes || isLoadingClinicDepartments || addDepartmentMutation.isPending || removeDepartmentMutation.isPending;

  // Render access denied message if not superadmin
  if (!isSuperadmin) {
    return <div className="p-4 text-center text-red-500">Access Denied: Only Superadmins can manage clinic departments.</div>;
  }

  // Render loading or content based on data and mutations
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Clinic Departments</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center">Loading departments...</div>
        ) : departmentTypes && departmentTypes.length > 0 ? (
          <div className="grid gap-4">
            {departmentTypes.map((departmentType) => {
              const isClinicDepartment = clinicDepartments?.some(
                (cd) => cd.department_type_id === departmentType.id
              );
              return (
                <div key={departmentType.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={departmentType.id}
                    checked={isClinicDepartment}
                    onCheckedChange={(checked) => handleCheckChange(!!checked, departmentType.id)}
                    disabled={addDepartmentMutation.isPending || removeDepartmentMutation.isPending}
                  />
                  <Label htmlFor={departmentType.id}>{departmentType.name}</Label>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">No department types found.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClinicDepartmentsManagement; 