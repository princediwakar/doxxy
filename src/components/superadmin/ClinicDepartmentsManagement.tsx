import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Search, 
  Plus, 
  Building2, 
  Check, 
  X, 
  Settings, 
  Activity,
  Brain,
  Eye,
  Heart,
  Stethoscope
} from 'lucide-react';

type DepartmentType = Database['public']['Tables']['department_types']['Row'];
type ClinicDepartment = Database['public']['Tables']['clinic_departments']['Row'];

interface DepartmentWithStatus extends DepartmentType {
  isActive: boolean;
  clinicDepartmentId?: string;
}

const supabase = getSupabase();

const ClinicDepartmentsManagement = () => {
  const { activeClinic, activeClinicRole } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const clinicId = activeClinic?.clinic_id;
  const isSuperadmin = activeClinicRole === 'superadmin';

  // Fetch all available department types
  const { data: departmentTypes = [], isLoading: isLoadingDepartmentTypes } = useQuery<DepartmentType[]>({
    queryKey: ['departmentTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('department_types')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch clinic departments for the active clinic
  const { data: clinicDepartments = [], isLoading: isLoadingClinicDepartments } = useQuery<ClinicDepartment[]>({
    queryKey: ['clinicDepartmentsForClinic', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const { data, error } = await supabase
        .from('clinic_departments')
        .select('*')
        .eq('clinic_id', clinicId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!clinicId,
  });

  // Add department mutation
  const addDepartmentMutation = useMutation({
    mutationFn: async (departmentTypeId: string) => {
      if (!clinicId) throw new Error('Active clinic not found.');
      const { error } = await supabase
        .from('clinic_departments')
        .insert({
          clinic_id: clinicId,
          department_type_id: departmentTypeId,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicDepartmentsForClinic', clinicId] });
      queryClient.invalidateQueries({ queryKey: ['clinicDepartments', clinicId] }); // Also invalidate for members component
      toast.success('Department added successfully');
    },
    onError: (error: Error) => {
      console.error('Error adding department:', error);
      toast.error('Failed to add department: ' + error.message);
    },
  });

  // Remove department mutation
  const removeDepartmentMutation = useMutation({
    mutationFn: async (clinicDepartmentId: string) => {
      if (!clinicId) throw new Error('Active clinic not found.');
      const { error } = await supabase
        .from('clinic_departments')
        .delete()
        .eq('id', clinicDepartmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicDepartmentsForClinic', clinicId] });
      queryClient.invalidateQueries({ queryKey: ['clinicDepartments', clinicId] }); // Also invalidate for members component
      toast.success('Department removed successfully');
    },
    onError: (error: Error) => {
      console.error('Error removing department:', error);
      toast.error('Failed to remove department: ' + error.message);
    },
  });

  // Combine department types with their active status
  const departmentsWithStatus: DepartmentWithStatus[] = departmentTypes.map(dept => {
    const clinicDept = clinicDepartments.find(cd => cd.department_type_id === dept.id);
    return {
      ...dept,
      isActive: !!clinicDept,
      clinicDepartmentId: clinicDept?.id,
    };
  });

  // Filter departments based on search
  const filteredDepartments = departmentsWithStatus.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group departments by status
  const activeDepartments = filteredDepartments.filter(d => d.isActive);
  const availableDepartments = filteredDepartments.filter(d => !d.isActive);

  const handleToggleDepartment = (department: DepartmentWithStatus) => {
    if (department.isActive && department.clinicDepartmentId) {
      removeDepartmentMutation.mutate(department.clinicDepartmentId);
    } else {
      addDepartmentMutation.mutate(department.id);
    }
  };

  const getDepartmentIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('neuro')) return <Brain className="h-5 w-5" />;
    if (nameLower.includes('ophthal') || nameLower.includes('eye')) return <Eye className="h-5 w-5" />;
    if (nameLower.includes('cardio') || nameLower.includes('heart')) return <Heart className="h-5 w-5" />;
    if (nameLower.includes('general') || nameLower.includes('internal')) return <Stethoscope className="h-5 w-5" />;
    return <Activity className="h-5 w-5" />;
  };

  const isLoading = isLoadingDepartmentTypes || isLoadingClinicDepartments || 
                    addDepartmentMutation.isPending || removeDepartmentMutation.isPending;

  // Early return for access control after all hooks
  if (!isSuperadmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Access Denied</p>
            <p className="text-sm">Only Superadmins can manage clinic departments.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Clinic Departments</h2>
          <p className="text-muted-foreground">
            Manage medical departments and specialties for your clinic
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {activeDepartments.length} Active
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {availableDepartments.length} Available
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-muted/50 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Active Departments */}
      {!isLoading && activeDepartments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Active Departments</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDepartments.map((department) => (
              <Card key={department.id} className="border-green-200 bg-green-50/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-green-100 text-green-700">
                        {getDepartmentIcon(department.name)}
                      </div>
                      <div>
                        <h4 className="font-medium text-green-900">{department.name}</h4>
                        <p className="text-xs text-green-700">Active</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleDepartment(department)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Departments */}
      {!isLoading && availableDepartments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Available Departments</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableDepartments.map((department) => (
              <Card key={department.id} className="border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        {getDepartmentIcon(department.name)}
                      </div>
                      <div>
                        <h4 className="font-medium">{department.name}</h4>
                        <p className="text-xs text-muted-foreground">Available</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleDepartment(department)}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty States */}
      {!isLoading && filteredDepartments.length === 0 && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{searchTerm ? "No departments match your search" : "No departments found"}</p>
              <p className="text-sm">
                {searchTerm ? "Try adjusting your search terms" : "Contact support to add department types"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && filteredDepartments.length > 0 && activeDepartments.length === 0 && availableDepartments.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-6">
            <div className="text-center text-blue-900">
              <Plus className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium mb-1">No Active Departments</h3>
              <p className="text-sm text-blue-700">
                Click the + button on any department above to add it to your clinic
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClinicDepartmentsManagement; 