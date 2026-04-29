// components/superadmin/ClinicDepartmentsManagement.tsx
"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';
import { DbDepartmentType, DbClinicDepartment } from '@/types/core';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
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
  Stethoscope,
  Smile
} from 'lucide-react';

interface DepartmentWithStatus extends DbDepartmentType {
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
  const { data: departmentTypes = [], isLoading: isLoadingDepartmentTypes } = useQuery<DbDepartmentType[]>({
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
  const { data: clinicDepartments = [], isLoading: isLoadingClinicDepartments } = useQuery<DbClinicDepartment[]>({
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

      const { count, error: countError } = await supabase
        .from('clinic_members')
        .select('*', { count: 'exact', head: true })
        .eq('department_id', clinicDepartmentId)

      if (countError) {
        throw new Error(`Failed to check for department members: ${countError.message}`);
      }

      if (count && count > 0) {
        throw new Error(`Cannot remove department: ${count} member(s) are still assigned.`);
      }

      const { error } = await supabase
        .from('clinic_departments')
        .delete()
        .eq('id', clinicDepartmentId);

      if (error) {
        if (error.message.includes('violates foreign key constraint')) {
          throw new Error("This department is in use and cannot be removed.");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicDepartmentsForClinic', clinicId] });
      queryClient.invalidateQueries({ queryKey: ['clinicDepartments', clinicId] });
      toast.success('Department removed successfully');
    },
    onError: (error: Error) => {
      console.error('Error removing department:', error);
      toast.error(error.message || 'Failed to remove department.');
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
    if (nameLower.includes('dental')) return <Smile className="h-5 w-5" />;
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
    <div className="space-y-6 px-4 md:px-0 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Clinic Departments</h2>
          <p className="text-sm text-muted-foreground">
            Manage departments & specialties
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className="status-badge bg-primary/10 text-primary border border-primary/20 text-sm font-medium">
            {activeDepartments.length} Active
          </Badge>
          <Badge className="status-badge bg-muted text-muted-foreground border border-border text-sm font-medium hidden sm:inline-flex">
            {availableDepartments.length} Available
          </Badge>
        </div>
      </div>

      {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-border focus:ring-primary"
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
            <Check className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Active Departments</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDepartments.map((department) => (
              <Card key={department.id} className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {getDepartmentIcon(department.name)}
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">{department.name}</h4>
                        <Badge className="status-badge bg-primary/10 text-primary border border-primary/20 text-xs">Active</Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleDepartment(department)}
                      disabled={isLoading}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
            <Plus className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Available Departments</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableDepartments.map((department) => (
              <Card key={department.id} className="hover:border-border hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                        {getDepartmentIcon(department.name)}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{department.name}</h4>
                        <Badge className="status-badge bg-muted text-muted-foreground border border-border text-xs">Available</Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleDepartment(department)}
                      disabled={isLoading}
                      className="text-foreground hover:text-foreground hover:bg-muted"
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
              <Building2 className="h-5 w-5 mx-auto mb-3 opacity-50" />
              <p>{searchTerm ? "No departments match your search" : "No departments found"}</p>
              <p className="text-sm">
                {searchTerm ? "Try adjusting your search terms" : "Contact support to add department types"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      
    </div>
  );
};

export default ClinicDepartmentsManagement; 