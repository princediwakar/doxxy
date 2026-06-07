// components/superadmin/ClinicMembersManagement.tsx
"use client";

import { useState, useMemo } from 'react';
import { useAppState } from '@/contexts/AppStateContext';
import { getSupabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, Plus, Settings, Users } from 'lucide-react';

import { updateMemberProfile, removeClinicMember as removeClinicMemberAction } from '@/actions/clinic';
import { UserRole, MemberWithDetails, InviteMemberData, DepartmentWithDetails } from '@/types/core';
import { ClinicMembersList, InviteMemberDialog, EditMemberDialog, EditProfileState } from './ClinicMemberComponents';

const supabase = getSupabase();

interface ClinicMembersManagementProps {
  serverMembers: MemberWithDetails[];
  serverDepartments: DepartmentWithDetails[];
}

const ClinicMembersManagement = ({
  serverMembers,
  serverDepartments,
}: ClinicMembersManagementProps) => {
  const { activeClinicId, activeClinicRole } = useAppState();
  const isSuperadmin = activeClinicRole === 'superadmin';

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");

  const [showInvite, setShowInvite] = useState(false);
  const [inviteData, setInviteData] = useState<InviteMemberData>({ email: '', name: '', phone: '', role: 'staff' });

  // Replaced inline expansion with a focused editing state
  const [editingMember, setEditingMember] = useState<MemberWithDetails | null>(null);

  const [isInviting, setIsInviting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  // --- Filters ---
  const filteredMembers = useMemo(() => {
    return serverMembers.filter(member => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = !search || member.profile?.name?.toLowerCase().includes(search) || member.profile?.email?.toLowerCase().includes(search);
      const matchesRole = selectedRole === 'all' || member.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [serverMembers, searchTerm, selectedRole]);

  // --- Handlers ---
  const handleInvite = async () => {
    if (!inviteData.email || !inviteData.name) {
      toast.error('Email and name are required');
      return;
    }
    setIsInviting(true);
    try {
      const cleanEmail = inviteData.email.trim().toLowerCase();
      const cleanName = inviteData.name.trim();

      const { data, error } = await supabase.functions.invoke('invite-member', {
        body: {
          memberData: { ...inviteData, email: cleanEmail, name: cleanName, clinic_id: activeClinicId },
        },
      });

      if (error) throw new Error('Failed to invite member');
      if (!data?.success) throw new Error(data?.error || 'Failed to invite user');

      toast.success(data?.message || 'Member invited successfully!');
      setShowInvite(false);
      setInviteData({ email: '', name: '', phone: '', role: 'staff' });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleSave = async (member: MemberWithDetails, state: EditProfileState) => {
    if (!member.user_id || !activeClinicId) return toast.error('Invalid member');
    setIsSaving(true);
    try {
      const isMedicalRole = state.role === 'doctor' || state.role === 'superadmin';
      const result = await updateMemberProfile({
        memberId: member.id,
        clinicId: activeClinicId,
        userId: member.user_id,
        profile: { name: state.name, phone: state.phone || null },
        member: { role: state.role, department_id: state.department_id || null },
        doctor: isMedicalRole
          ? { primary_specialization: state.primary_specialization, consultation_fee: state.consultation_fee, bio: state.bio }
          : undefined,
      });
      if ('error' in result && result.error) throw new Error(result.error);
      
      toast.success('Member updated');
      setEditingMember(null);
    } catch (err) {
      toast.error('Failed to update: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (member: MemberWithDetails) => {
    if (!confirm(`Are you sure you want to remove ${member.profile?.name}?`)) return;
    setIsRemovingMember(true);
    try {
      const result = await removeClinicMemberAction(member.id);
      if ('error' in result && result.error) throw new Error(result.error);
      toast.success('Member removed');
    } catch (err) {
      toast.error('Failed to remove: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setIsRemovingMember(false);
    }
  };

  if (!isSuperadmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Settings className="h-12 w-12 mb-3 opacity-50"/>
        <p className="font-semibold text-lg">Access Denied</p>
        <p className="text-sm">Superadmin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="clinic-members-management">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-sm text-muted-foreground">Manage roles, departments, and access for {serverMembers.length} team members.</p>
        </div>
        <Button onClick={() => setShowInvite(true)} className="w-full sm:w-auto flex items-center gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Invite Member
        </Button>
      </div>

      {/* Control Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-9 bg-muted/50 border-transparent focus:bg-background" 
            />
          </div>
          <Select value={selectedRole} onValueChange={(val: UserRole | 'all') => setSelectedRole(val)}>
            <SelectTrigger className="w-full sm:w-[180px] bg-muted/50 border-transparent focus:bg-background">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="superadmin">Superadmin</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* High-Density Data List */}
      <Card className="border shadow-sm overflow-hidden">
        <ClinicMembersList
          members={filteredMembers}
          onEdit={setEditingMember}
          onDelete={handleDelete}
          isDeleting={isRemovingMember}
        />
      </Card>

      {/* Modals */}
      <InviteMemberDialog
        open={showInvite}
        onOpenChange={setShowInvite}
        data={inviteData}
        setData={setInviteData}
        onSubmit={handleInvite}
        isPending={isInviting}
        departments={serverDepartments}
      />

      {editingMember && (
        <EditMemberDialog
          member={editingMember}
          open={!!editingMember}
          onOpenChange={(open) => !open && setEditingMember(null)}
          onSave={handleSave}
          isSaving={isSaving}
          departments={serverDepartments}
        />
      )}
    </div>
  );
};

export default ClinicMembersManagement;