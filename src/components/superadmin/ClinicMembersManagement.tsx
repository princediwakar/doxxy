import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, UserCheck } from "lucide-react";
import { useClinicMembers, MemberWithProfile, InviteFormData } from "@/hooks/useClinicMembers";
import { MembersTable } from "./MembersTable";
import { InviteMemberDialog } from "./InviteMemberDialog";
import { Enums } from "@/integrations/supabase/types";

const ClinicMembersManagement = () => {
  const {
    members,
    activeDepartments,
    inactiveDepartmentTypes,
    membersLoading,
    departmentsLoading,
    searchTerm,
    setSearchTerm,
    isSuperadmin,
    addDepartmentMutation,
    inviteMemberMutation,
    updateMemberMutation,
    removeMemberMutation,
    getRoleBadgeVariant,
  } = useClinicMembers();

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberWithProfile | null>(null);
  const [editForm, setEditForm] = useState<{ role: Enums<'user_role'>; departmentId: string }>({
    role: "doctor",
    departmentId: "no-department",
  });

  const handleAddDepartment = (departmentTypeId: string) => {
    addDepartmentMutation.mutate(departmentTypeId);
  };

  const handleInviteMember = async (formData: InviteFormData & { name: string; phone: string }) => {
    await inviteMemberMutation.mutateAsync(formData);
  };

  const handleEditMember = (member: MemberWithProfile) => {
    setSelectedMember(member);
    setEditForm({
      role: member.member.role,
      departmentId: member.member.department_id || "no-department",
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedMember) return;
    
    try {
      await updateMemberMutation.mutateAsync({
        userId: selectedMember.member.user_id!,
        role: editForm.role,
        departmentId: editForm.departmentId,
      });
      setEditDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleRemoveMember = (member: MemberWithProfile) => {
    setSelectedMember(member);
    setRemoveDialogOpen(true);
  };

  const confirmRemove = async () => {
    if (!selectedMember) return;
    
    try {
      await removeMemberMutation.mutateAsync(selectedMember.member.user_id!);
      setRemoveDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  if (!isSuperadmin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">
              Only super administrators can manage clinic members.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Clinic Members Management</span>
            <Button onClick={() => setInviteDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members by name, email, phone, role, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {inactiveDepartmentTypes.length > 0 && (
              <Select onValueChange={handleAddDepartment}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Add Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Departments</SelectLabel>
                    {inactiveDepartmentTypes.map((deptType) => (
                      <SelectItem key={deptType.id} value={deptType.id}>
                        {deptType.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>

          <MembersTable
            members={members}
            isSuperadmin={isSuperadmin}
            onEditMember={handleEditMember}
            onRemoveMember={handleRemoveMember}
            getRoleBadgeVariant={getRoleBadgeVariant}
          />
        </CardContent>
      </Card>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        activeDepartments={activeDepartments}
        onInvite={handleInviteMember}
        loading={inviteMemberMutation.isPending}
      />

      {/* Edit Member Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update the role and department for {selectedMember?.profile?.name || 'this member'}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select 
                value={editForm.role} 
                onValueChange={(value: Enums<'user_role'>) => 
                  setEditForm(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Department</label>
              <Select 
                value={editForm.departmentId} 
                onValueChange={(value) => 
                  setEditForm(prev => ({ ...prev, departmentId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Departments</SelectLabel>
                    <SelectItem value="no-department">No Department</SelectItem>
                    {activeDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.department_types?.name || 'Unknown Department'}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              disabled={updateMemberMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={updateMemberMutation.isPending}
            >
              {updateMemberMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedMember?.profile?.name || 'this member'} from the clinic? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRemoveDialogOpen(false)}
              disabled={removeMemberMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmRemove}
              disabled={removeMemberMutation.isPending}
            >
              {removeMemberMutation.isPending ? "Removing..." : "Remove Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicMembersManagement;