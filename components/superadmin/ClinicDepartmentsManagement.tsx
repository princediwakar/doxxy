// components/superadmin/ClinicDepartmentsManagement.tsx
"use client";

import { useState } from 'react';
import { DbDepartmentType, DbClinicDepartment } from '@/types/core';
import { useAppState } from '@/contexts/AppStateContext';
import { addClinicDepartment, removeClinicDepartment } from '@/actions/clinic';
import { toast } from 'sonner';
import { showErrorToast } from '@/lib/error-utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

interface ClinicDepartmentsManagementProps {
  serverDepartmentTypes: DbDepartmentType[];
  serverClinicDepartments: DbClinicDepartment[];
}

const ClinicDepartmentsManagement = ({
  serverDepartmentTypes,
  serverClinicDepartments,
}: ClinicDepartmentsManagementProps) => {
  const { activeClinicId, activeClinicRole } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMutating, setIsMutating] = useState(false);

  const clinicId = activeClinicId;
  const isSuperadmin = activeClinicRole === 'superadmin';

  const departmentsWithStatus: DepartmentWithStatus[] = serverDepartmentTypes.map(dept => {
    const clinicDept = serverClinicDepartments.find(cd => cd.department_type_id === dept.id);
    return {
      ...dept,
      isActive: !!clinicDept,
      clinicDepartmentId: clinicDept?.id,
    };
  });

  const filteredDepartments = departmentsWithStatus.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDepartments = filteredDepartments.filter(d => d.isActive);
  const availableDepartments = filteredDepartments.filter(d => !d.isActive);

  const handleToggleDepartment = async (department: DepartmentWithStatus) => {
    if (!clinicId) return;
    setIsMutating(true);
    try {
      if (department.isActive && department.clinicDepartmentId) {
        const result = await removeClinicDepartment(department.clinicDepartmentId);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success('Department removed successfully');
        }
      } else {
        const result = await addClinicDepartment(clinicId, department.id);
        if (result.error) {
          showErrorToast(new Error(result.error), { title: 'Failed to add department' });
        } else {
          toast.success('Department added successfully');
        }
      }
    } catch (err) {
      showErrorToast(err instanceof Error ? err : new Error('Failed to update department'), { title: 'Error' });
    } finally {
      setIsMutating(false);
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Departments</h1>
            <p className="hidden sm:block text-muted-foreground">Manage clinic departments</p>
          </div>
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

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-border focus:ring-primary"
        />
      </div>

      {activeDepartments.length > 0 && (
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
                      disabled={isMutating}
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

      {availableDepartments.length > 0 && (
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
                      disabled={isMutating}
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

      {filteredDepartments.length === 0 && (
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
