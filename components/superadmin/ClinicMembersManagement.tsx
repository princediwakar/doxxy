// components/superadmin/ClinicMembersManagement.tsx
"use client";

import { useState } from 'react';
import { useAppState } from '@/contexts/AppStateContext';
import { getSupabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, Plus, Settings, Users } from 'lucide-react';

import { createDoctorForMember, updateClinicMember, removeClinicMember as removeClinicMemberAction } from '@/actions/clinic';
import { UserRole, MemberWithDetails, InviteMemberData, CreateDoctorData, DepartmentWithDetails } from '@/types/core';
import { ClinicMembersList, InviteMemberDialog, CreateDoctorDialog, EditMemberDialog } from './ClinicMemberComponents';

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
  const clinicId = activeClinicId;
  const isSuperadmin = activeClinicRole === 'superadmin';

  // --- State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");

  const [showInvite, setShowInvite] = useState(false);
  const [inviteData, setInviteData] = useState<InviteMemberData>({ email: '', name: '', phone: '', role: 'staff' });

  const [showDoctor, setShowDoctor] = useState(false);
  const [doctorMember, setDoctorMember] = useState<MemberWithDetails | null>(null);
  const [doctorData, setDoctorData] = useState<CreateDoctorData>({ name: '', email: '', primary_specialization: '', consultation_fee: 0, bio: '', department_id: '', google_place_id: '' });

  const [showEdit, setShowEdit] = useState(false);
  const [editMember, setEditMember] = useState<MemberWithDetails | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('staff');
  const [editDept, setEditDept] = useState<string | undefined>(undefined);

  const [isInviting, setIsInviting] = useState(false);
  const [isCreatingDoctor, setIsCreatingDoctor] = useState(false);
  const [isUpdatingMember, setIsUpdatingMember] = useState(false);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  // --- Filters ---
  const filteredMembers = serverMembers.filter(member => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = !search || member.profile?.name?.toLowerCase().includes(search) || member.profile?.email?.toLowerCase().includes(search);
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

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

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        toast.error('Invalid email format');
        setIsInviting(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('invite-member', {
        body: {
          memberData: {
            ...inviteData,
            email: cleanEmail,
            name: cleanName,
            clinic_id: clinicId,
          },
        },
      });

      if (error) {
        let errorMessage: string | null = null;
        try {
          if (error.context && typeof error.context.json === 'function') {
            const body = await error.context.json();
            errorMessage = body?.error || null;
          }
        } catch {
          // context not available
        }
        throw new Error(errorMessage || 'Failed to invite member');
      }

      if (!data?.success) throw new Error(data?.error || 'Failed to invite user');

      const msg = data?.message || 'Member invited successfully!';
      if (data?.invitationLink) {
        toast.success(msg, {
          description: 'Email could not be sent. Share this link with the invitee:',
          action: {
            label: 'Copy Link',
            onClick: () => {
              navigator.clipboard.writeText(data.invitationLink);
              toast.success('Link copied!');
            },
          },
          duration: 20000,
        });
      } else {
        toast.success(msg);
      }

      setShowInvite(false);
      setInviteData({ email: '', name: '', phone: '', role: 'staff' });
    } catch (err) {
      toast.error((err as Error).message || 'Failed to invite member');
    } finally {
      setIsInviting(false);
    }
  };

  const openDoctorForm = (member: MemberWithDetails) => {
    setDoctorMember(member);
    setDoctorData({
      name: member.profile?.name || '',
      email: member.profile?.email || '',
      primary_specialization: '',
      consultation_fee: 0,
      bio: '',
      department_id: member.department_id || undefined,
      google_place_id: '',
    });
    setShowDoctor(true);
  };

  const handleCreateDoctor = async () => {
    if (!doctorMember?.user_id) {
      toast.error('Invalid member selected');
      return;
    }
    if (!doctorData.name || !doctorData.email) {
      toast.error('Name and email are required');
      return;
    }
    if (!activeClinicId) return;
    setIsCreatingDoctor(true);
    try {
      const result = await createDoctorForMember({
        userId: doctorMember.user_id,
        clinicId: activeClinicId,
        name: doctorData.name,
        email: doctorData.email,
        primarySpecialization: doctorData.primary_specialization,
        consultationFee: doctorData.consultation_fee,
        bio: doctorData.bio,
        departmentId: doctorData.department_id,
        googlePlaceId: doctorData.google_place_id,
      });
      if ('error' in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Doctor profile created successfully');
      setShowDoctor(false);
      setDoctorMember(null);
      setDoctorData({ name: '', email: '', primary_specialization: '', consultation_fee: 0, bio: '', department_id: '', google_place_id: '' });
    } catch (err) {
      toast.error('Failed to create doctor profile: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setIsCreatingDoctor(false);
    }
  };

  const openEditForm = (member: MemberWithDetails) => {
    setEditMember(member);
    setEditRole(member.role);
    setEditDept(member.department_id || undefined);
    setShowEdit(true);
  };

  const handleUpdateMember = async () => {
    if (!editMember?.id) {
      toast.error('Invalid member selected');
      return;
    }
    if (!activeClinicId) return;
    setIsUpdatingMember(true);
    try {
      const result = await updateClinicMember(editMember.id, {
        role: editRole,
        department_id: editDept || null,
      });
      if ('error' in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Member updated successfully');
      setShowEdit(false);
      setEditMember(null);
      setEditRole('staff');
      setEditDept(undefined);
    } catch (err) {
      toast.error('Failed to update member: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setIsUpdatingMember(false);
    }
  };

  if (!isSuperadmin) {
    return (
      <Card><CardContent className="p-6 text-center text-muted-foreground"><Settings className="h-12 w-12 mx-auto mb-3 opacity-50"/><p>Access Denied</p><p className="text-sm">Only Superadmins can manage clinic members.</p></CardContent></Card>
    );
  }

  return (
    <div className="space-y-6 px-4 md:px-0" data-testid="clinic-members-management">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Staff</h1>
            <p className="hidden sm:block text-muted-foreground">Manage clinic members and roles</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className="bg-primary/10 text-primary border border-primary/20 hidden sm:inline-flex">{serverMembers.length} Members</Badge>
          <Button onClick={() => setShowInvite(true)} className="flex items-center gap-2"><Plus className="h-4 w-4" /><span className="sm:inline">Invite</span></Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={selectedRole} onValueChange={(val: UserRole | 'all') => setSelectedRole(val)}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter by role" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Roles</SelectItem><SelectItem value="superadmin">Superadmin</SelectItem><SelectItem value="doctor">Doctor</SelectItem><SelectItem value="staff">Staff</SelectItem></SelectContent>
        </Select>
      </div>

      <ClinicMembersList
        members={filteredMembers}
        isLoading={false}
        searchTerm={searchTerm}
        error={null}
        onEdit={openEditForm}
        onDelete={async (member) => {
          setIsRemovingMember(true);
          try {
            const result = await removeClinicMemberAction(member.id);
            if ('error' in result && result.error) {
              toast.error(result.error);
              return;
            }
            toast.success('Member removed successfully');
          } catch (err) {
            toast.error('Failed to remove member: ' + (err instanceof Error ? err.message : ''));
          } finally {
            setIsRemovingMember(false);
          }
        }}
        onCreateDoctor={openDoctorForm}
        isDeleting={isRemovingMember}
        isCreatingDoctor={isCreatingDoctor}
      />

      <InviteMemberDialog
        open={showInvite}
        onOpenChange={setShowInvite}
        data={inviteData}
        setData={setInviteData}
        onSubmit={handleInvite}
        isPending={isInviting}
        departments={serverDepartments}
      />

      <CreateDoctorDialog
        open={showDoctor}
        onOpenChange={setShowDoctor}
        data={doctorData}
        setData={setDoctorData}
        onSubmit={handleCreateDoctor}
        isPending={isCreatingDoctor}
        departments={serverDepartments}
      />

      <EditMemberDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        member={editMember}
        role={editRole}
        setRole={(role) => { setEditRole(role); if (role === 'staff') setEditDept(undefined); }}
        deptId={editDept}
        setDeptId={setEditDept}
        onSubmit={handleUpdateMember}
        isPending={isUpdatingMember}
        departments={serverDepartments}
      />
    </div>
  );
};

export default ClinicMembersManagement;
