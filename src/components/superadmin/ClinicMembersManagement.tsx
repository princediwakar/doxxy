import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from '@/integrations/supabase/client';
import { Tables, Enums } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Plus, MoreHorizontal, User, Mail, Search, Edit, Trash2, UserCheck } from "lucide-react";
import { SelectGroup, SelectLabel } from '@/components/ui/select';

const supabase = getSupabase();

// Types
interface MemberWithProfile {
  member: Tables<'clinic_members'>;
  profile: Tables<'profiles'> | null;
  department: DepartmentWithType | null;
}

interface DepartmentWithType extends Tables<'clinic_departments'> {
  department_types?: { name: string };
}

interface InviteFormData {
  email: string;
  role: Enums<'user_role'>;
  departmentId: string;
}

const ClinicMembersManagement = () => {
  const { activeClinic, activeClinicRole } = useAuth();
  const queryClient = useQueryClient();
  
  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberWithProfile | null>(null);
  
  // Form state
  const [inviteForm, setInviteForm] = useState<InviteFormData>({
    email: "",
    role: "doctor",
    departmentId: "no-department",
  });
  const [editForm, setEditForm] = useState<{ role: Enums<'user_role'>; departmentId: string }>({
    role: "doctor",
    departmentId: "no-department",
  });

  // Access control
  const isSuperadmin = activeClinicRole === 'superadmin';

  // Fetch clinic members with profiles and departments
  const { data: members = [], isLoading: membersLoading, error: membersError } = useQuery({
    queryKey: ['clinicMembers', activeClinic?.clinic_id],
    queryFn: async (): Promise<MemberWithProfile[]> => {
      if (!activeClinic?.clinic_id) return [];

      // Fetch clinic members
      const { data: membersData, error: membersError } = await supabase
        .from("clinic_members")
        .select("*")
        .eq("clinic_id", activeClinic.clinic_id);
        
      if (membersError) throw membersError;
      if (!membersData?.length) return [];

      // Fetch profiles
      const userIds = membersData.map(m => m.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);
        
      if (profilesError) throw profilesError;

      // Fetch doctor information for members who are doctors
      const { data: doctorsData, error: doctorsError } = await supabase
        .from("doctors")
        .select("user_id, name, email")
        .eq("clinic_id", activeClinic.clinic_id)
        .in("user_id", userIds);
        
      if (doctorsError) throw doctorsError;

      // Fetch departments with types
      const departmentIds = membersData
        .map(m => m.department_id)
        .filter(Boolean);
        
      let departmentsData: DepartmentWithType[] = [];
      if (departmentIds.length > 0) {
        const { data, error: deptError } = await supabase
          .from("clinic_departments")
          .select("*, department_types(*)")
          .in("id", departmentIds);
          
        if (deptError) throw deptError;
        departmentsData = (data || []) as DepartmentWithType[];
      }

      // Combine data
      return membersData.map(member => {
        const profile = profilesData?.find(p => p.id === member.user_id) || null;
        const doctor = doctorsData?.find(d => d.user_id === member.user_id) || null;
        
        return {
          member,
          profile: profile || {
            id: member.user_id,
            name: doctor?.name || null,
            email: doctor?.email || null,
            phone: null,
            address: null, // Add this to satisfy the type
            created_at: null,
            updated_at: null
          },
          department: member.department_id 
            ? departmentsData.find(d => d.id === member.department_id) || null
            : null,
        };
      });
    },
    enabled: !!activeClinic?.clinic_id,
  });

  // Fetch active clinic departments
  const { data: activeDepartments = [] } = useQuery({
    queryKey: ['clinicDepartments', activeClinic?.clinic_id],
    queryFn: async (): Promise<DepartmentWithType[]> => {
      if (!activeClinic?.clinic_id) return [];
      
      const { data, error } = await supabase
        .from("clinic_departments")
        .select("*, department_types(*)")
        .eq("clinic_id", activeClinic.clinic_id);
        
      if (error) throw error;
      return (data || []) as DepartmentWithType[];
    },
    enabled: !!activeClinic?.clinic_id,
  });

  // Fetch all department types  
  const { data: allDepartmentTypes = [] } = useQuery({
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

  // Calculate inactive departments
  const activeDepartmentTypeIds = activeDepartments.map(dept => dept.department_type_id);
  const inactiveDepartmentTypes = allDepartmentTypes.filter(
    dt => !activeDepartmentTypeIds.includes(dt.id)
  );

  // Add department mutation
  const addDepartmentMutation = useMutation({
    mutationFn: async (departmentTypeId: string) => {
      if (!activeClinic?.clinic_id) throw new Error('Active clinic not found.');
      const { data, error } = await supabase
        .from('clinic_departments')
        .insert({
          clinic_id: activeClinic.clinic_id,
          department_type_id: departmentTypeId,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicDepartments', activeClinic?.clinic_id] });
      toast.success('Department activated');
    },
    onError: (error: Error) => {
      console.error('Error adding department:', error);
      toast.error('Failed to activate department: ' + error.message);
    },
  });

  // Invite member mutation
  const inviteMutation = useMutation({
    mutationFn: async (formData: InviteFormData) => {
      if (!activeClinic?.clinic_id) throw new Error('No active clinic');
      
      let finalDepartmentId = formData.departmentId;
      
      // If department starts with 'type-', it's an inactive department we need to activate first
      if (formData.departmentId.startsWith('type-')) {
        const departmentTypeId = formData.departmentId.replace('type-', '');
        const newDepartment = await addDepartmentMutation.mutateAsync(departmentTypeId);
        finalDepartmentId = newDepartment.id;
      }
      
      const requestBody = {
        email: formData.email,
        clinic_id: activeClinic.clinic_id,
        role: formData.role,
        department_id: finalDepartmentId === "no-department" ? null : finalDepartmentId,
      };
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to invite member');
      }
      
      const responseData = await response.json();
      return responseData;
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully!");
      setInviteForm({ email: "", role: "staff", departmentId: "no-department" });
      setInviteDialogOpen(false);
      // Invalidate both clinic members and doctor queries since department_id affects both
      queryClient.invalidateQueries({ queryKey: ['clinicMembers', activeClinic?.clinic_id] });
      queryClient.invalidateQueries({ queryKey: ['doctorProfile'] });
    },
    onError: (error: Error) => {
      toast.error("Failed to invite member: " + error.message);
    },
  });

  // Update member mutation
  const updateMutation = useMutation({
    mutationFn: async ({ memberId, role, departmentId }: { memberId: string; role: Enums<'user_role'>; departmentId: string }) => {
      if (!selectedMember) throw new Error('No member selected');
      
      const rpcParams: {
        member_user_id: string;
        target_clinic_id: string;
        updated_role: Enums<'user_role'>;
        updated_department_id?: string | null;
      } = {
        member_user_id: selectedMember.member.user_id,
        target_clinic_id: selectedMember.member.clinic_id,
        updated_role: role,
      };
      
      // Only set department_id if it's being changed
      if (departmentId !== "no-department") {
        rpcParams.updated_department_id = departmentId;
      } else {
        rpcParams.updated_department_id = null;
      }
      
      // The RPC exists in the database but is not yet present in the generated TS types.
      // Suppress the type error until the types are regenerated.
      const { data, error } = await (supabase.rpc as any)("update_clinic_member_details", rpcParams);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Member updated successfully");
      handleEditDialogClose(false);
      // Invalidate both clinic members and doctor queries since department_id affects both
      queryClient.invalidateQueries({ queryKey: ['clinicMembers', activeClinic?.clinic_id] });
      queryClient.invalidateQueries({ queryKey: ['doctorProfile'] });
    },
    onError: (error: Error) => {
      toast.error("Failed to update member: " + error.message);
    },
  });

  // Remove member mutation
  const removeMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("clinic_members")
        .delete()
        .eq("id", memberId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Member removed successfully");
      handleRemoveDialogClose(false);
      queryClient.invalidateQueries({ queryKey: ['clinicMembers', activeClinic?.clinic_id] });
    },
    onError: (error: Error) => {
      toast.error("Failed to remove member: " + error.message);
    },
  });

  // Event handlers
  const handleInvite = () => {
    if (!inviteForm.email) {
      toast.error("Email is required");
      return;
    }
    
    inviteMutation.mutate(inviteForm);
  };

  const handleEdit = (member: MemberWithProfile) => {
    setSelectedMember(member);
    setEditForm({
      role: member.member.role,
      departmentId: member.department?.id || "no-department",
    });
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      // Reset state when dialog closes
      setSelectedMember(null);
      setEditForm({
        role: "staff",
        departmentId: "no-department",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedMember) return;
    
    let finalDepartmentId = editForm.departmentId;
    
    // If department starts with 'type-', it's an inactive department we need to activate first
    if (editForm.departmentId.startsWith('type-')) {
      const departmentTypeId = editForm.departmentId.replace('type-', '');
      try {
        const newDepartment = await addDepartmentMutation.mutateAsync(departmentTypeId);
        finalDepartmentId = newDepartment.id;
      } catch (error) {
        console.error('Error activating department:', error);
        return; // Stop if department activation fails
      }
    }
    
    updateMutation.mutate({
      memberId: selectedMember.member.id,
      role: editForm.role,
      departmentId: finalDepartmentId,
    });
  };

  const handleRemove = (member: MemberWithProfile) => {
    setSelectedMember(member);
    setRemoveDialogOpen(true);
  };

  const handleRemoveDialogClose = (open: boolean) => {
    setRemoveDialogOpen(open);
    if (!open) {
      // Reset state when dialog closes
      setSelectedMember(null);
    }
  };

  const confirmRemove = () => {
    if (!selectedMember) return;
    removeMutation.mutate(selectedMember.member.id);
  };

  // Filter members based on search
  const filteredMembers = members.filter(({ member, profile }) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      profile?.name?.toLowerCase().includes(searchLower) ||
      profile?.email?.toLowerCase().includes(searchLower) ||
      member.role.toLowerCase().includes(searchLower)
    );
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin': return 'default';
      case 'doctor': return 'secondary';
      case 'staff': return 'outline';
      default: return 'outline';
    }
  };

  // Early return for access control after all hooks
  if (!isSuperadmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Access Denied</p>
            <p className="text-sm">Only Superadmins can manage clinic members.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle loading and error states
  if (membersError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Failed to load members</p>
            <Button 
              variant="outline" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['clinicMembers', activeClinic?.clinic_id] })}
              className="mt-2"
            >
              Retry
            </Button>
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
          <h2 className="text-2xl font-bold">Clinic Members</h2>
          <p className="text-muted-foreground">Manage clinic staff, doctors, and administrators</p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)} disabled={membersLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-border focus:ring-primary"
            />
          </div>


      {/* Members Table */}
      {membersLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted/50 rounded-md animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4 min-w-[200px]">Member</TableHead>
                  <TableHead className="w-1/3 min-w-[200px]">Email</TableHead>
                  <TableHead className="w-1/6 min-w-[100px]">Role</TableHead>
                  <TableHead className="w-1/6 min-w-[120px]">Department</TableHead>
                  <TableHead className="w-auto text-right min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>{searchTerm ? "No members match your search" : "No members found"}</p>
                        <p className="text-sm">Get started by inviting your first team member.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map(({ member, profile, department }) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {profile?.name || "Pending"}
                            </p>
                            {!profile?.name && (
                              <p className="text-xs text-muted-foreground">
                                Profile incomplete
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 min-w-0">
                          <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">
                            {profile?.email || (
                              <span className="text-muted-foreground text-sm">
                                Profile incomplete ({member.user_id.slice(0, 8)}...)
                              </span>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {department?.department_types?.name || (
                          <span className="text-muted-foreground">No department</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit({ member, profile, department })}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRemove({ member, profile, department })}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to add a new member to your clinic team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={inviteForm.email}
                onChange={(e) => setInviteForm(f => ({ ...f, email: e.target.value }))}
                disabled={inviteMutation.isPending}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <Select
                value={inviteForm.role}
                onValueChange={(value: Enums<'user_role'>) => setInviteForm(f => ({ ...f, role: value }))}
                disabled={inviteMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Department (Optional)</label>
              <Select
                value={inviteForm.departmentId}
                onValueChange={(value) => setInviteForm(f => ({ ...f, departmentId: value }))}
                disabled={inviteMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-department">No Department</SelectItem>
                  
                  {activeDepartments.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Active Departments</SelectLabel>
                      {activeDepartments.map(dep => (
                        <SelectItem key={dep.id} value={dep.id}>
                          {dep.department_types?.name || dep.id}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  
                  {inactiveDepartmentTypes.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Available Departments</SelectLabel>
                      {inactiveDepartmentTypes.map(dt => (
                        <SelectItem key={`type-${dt.id}`} value={`type-${dt.id}`}>
                          {dt.name} (will be activated)
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setInviteDialogOpen(false)}
              disabled={inviteMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleInvite}
              disabled={inviteMutation.isPending}
            >
              {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={handleEditDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update the role and department assignment for this team member.
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {selectedMember.profile?.name || "Pending"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedMember.profile?.email}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <Select
                  value={editForm.role}
                  onValueChange={(value: Enums<'user_role'>) => setEditForm(f => ({ ...f, role: value }))}
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="superadmin">Superadmin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <Select
                  value={editForm.departmentId}
                  onValueChange={(value) => setEditForm(f => ({ ...f, departmentId: value }))}
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-department">No Department</SelectItem>
                    
                    {activeDepartments.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Active Departments</SelectLabel>
                        {activeDepartments.map(dep => (
                          <SelectItem key={dep.id} value={dep.id}>
                            {dep.department_types?.name || dep.id}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    
                    {inactiveDepartmentTypes.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Available Departments</SelectLabel>
                        {inactiveDepartmentTypes.map(dt => (
                          <SelectItem key={`type-${dt.id}`} value={`type-${dt.id}`}>
                            {dt.name} (will be activated)
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => handleEditDialogClose(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={handleRemoveDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The member will lose access to this clinic.
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <p>Are you sure you want to remove this member from the clinic?</p>
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {selectedMember.profile?.name || "Pending"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedMember.profile?.email}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. The member will lose access to this clinic.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => handleRemoveDialogClose(false)}
              disabled={removeMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmRemove}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending ? "Removing..." : "Remove Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicMembersManagement; 