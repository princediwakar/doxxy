import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, Plus, Settings } from 'lucide-react';

import { useClinicMembers, MemberWithDetails, InviteMemberData, CreateDoctorData } from './useClinicMembers';
import { UserRole } from '@/types/core';
import { ClinicMembersList, InviteMemberDialog, CreateDoctorDialog, EditMemberDialog } from './ClinicMemberComponents';

const ClinicMembersManagement = () => {
  const { activeClinic, activeClinicRole } = useAuth();
  const clinicId = activeClinic?.clinic_id;
  const isSuperadmin = activeClinicRole === 'superadmin';

  // --- State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  
  const [showInvite, setShowInvite] = useState(false);
  const [inviteData, setInviteData] = useState<InviteMemberData>({ email: '', name: '', phone: '', role: 'staff' });

  const [showDoctor, setShowDoctor] = useState(false);
  const [doctorMember, setDoctorMember] = useState<MemberWithDetails | null>(null);
  const [doctorData, setDoctorData] = useState<CreateDoctorData>({ name: '', email: '', primary_specialization: '', consultation_fee: 0, bio: '', department_id: '' });

  const [showEdit, setShowEdit] = useState(false);
  const [editMember, setEditMember] = useState<MemberWithDetails | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('staff');
  const [editDept, setEditDept] = useState<string | undefined>(undefined);

  const ops = useClinicMembers(clinicId);

  // --- Filters ---
  const filteredMembers = ops.members.filter(member => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = !search || member.profile?.name?.toLowerCase().includes(search) || member.profile?.email?.toLowerCase().includes(search);
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // --- Handlers ---
  const handleInvite = () => {
    if (!inviteData.email || !inviteData.name) {
      toast.error('Email and name are required');
      return;
    }
    ops.inviteMemberMutation.mutate(inviteData, {
      onSuccess: () => {
        setShowInvite(false);
        setInviteData({ email: '', name: '', phone: '', role: 'staff' });
      }
    });
  };

  const openDoctorForm = (member: MemberWithDetails) => {
    setDoctorMember(member);
    setDoctorData({
      name: member.profile?.name || '',
      email: member.profile?.email || '',
      primary_specialization: '',
      consultation_fee: 0,
      bio: '',
      department_id: member.department_id || undefined
    });
    setShowDoctor(true);
  };

  const handleCreateDoctor = () => {
    if (!doctorMember?.user_id) {
      toast.error('Invalid member selected');
      return;
    }
    if (!doctorData.name || !doctorData.email) {
      toast.error('Name and email are required');
      return;
    }
    ops.createDoctorMutation.mutate({ ...doctorData, userId: doctorMember.user_id }, {
      onSuccess: () => {
        setShowDoctor(false);
        setDoctorMember(null);
        setDoctorData({ name: '', email: '', primary_specialization: '', consultation_fee: 0, bio: '', department_id: '' });
      }
    });
  };

  const openEditForm = (member: MemberWithDetails) => {
    setEditMember(member);
    setEditRole(member.role);
    setEditDept(member.department_id || undefined);
    setShowEdit(true);
  };

  const handleUpdateMember = () => {
    if (!editMember?.user_id) {
      toast.error('Invalid member selected');
      return;
    }
    ops.updateMemberMutation.mutate({ userId: editMember.user_id, role: editRole, departmentId: editDept }, {
      onSuccess: () => {
        setShowEdit(false);
        setEditMember(null);
        setEditRole('staff');
        setEditDept(undefined);
      }
    });
  };

  if (!isSuperadmin) {
    return (
      <Card><CardContent className="p-6 text-center text-muted-foreground"><Settings className="h-12 w-12 mx-auto mb-3 opacity-50"/><p>Access Denied</p><p className="text-sm">Only Superadmins can manage clinic members.</p></CardContent></Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="clinic-members-management">
      <div className="flex justify-between items-start">
        <div><h2 className="text-2xl font-bold text-foreground">Clinic Members</h2><p className="text-muted-foreground">Manage your clinic staff, doctors, and administrators</p></div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-primary/10 text-primary border border-primary/20">{ops.members.length} Members</Badge>
          <Button onClick={() => setShowInvite(true)} className="flex items-center space-x-2"><Plus className="h-4 w-4" /><span>Invite Member</span></Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search members by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={selectedRole} onValueChange={(val: UserRole | 'all') => setSelectedRole(val)}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter by role" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Roles</SelectItem><SelectItem value="superadmin">Superadmin</SelectItem><SelectItem value="doctor">Doctor</SelectItem><SelectItem value="staff">Staff</SelectItem></SelectContent>
        </Select>
      </div>

      <ClinicMembersList 
        members={filteredMembers}
        isLoading={ops.isLoadingMembers}
        searchTerm={searchTerm}
        error={ops.membersError}
        onEdit={openEditForm}
        onDelete={(id) => ops.removeMemberMutation.mutate(id)}
        onCreateDoctor={openDoctorForm}
        isDeleting={ops.removeMemberMutation.isPending}
        isCreatingDoctor={ops.createDoctorMutation.isPending}
      />

      <InviteMemberDialog 
        open={showInvite} 
        onOpenChange={setShowInvite} 
        data={inviteData} 
        setData={setInviteData} 
        onSubmit={handleInvite} 
        isPending={ops.inviteMemberMutation.isPending}
        departments={ops.departments}
      />

      <CreateDoctorDialog 
        open={showDoctor} 
        onOpenChange={setShowDoctor} 
        data={doctorData} 
        setData={setDoctorData} 
        onSubmit={handleCreateDoctor}
        isPending={ops.createDoctorMutation.isPending}
        departments={ops.departments}
      />

      <EditMemberDialog 
        open={showEdit} 
        onOpenChange={setShowEdit} 
        member={editMember}
        role={editRole}
        setRole={setEditRole}
        deptId={editDept}
        setDeptId={setEditDept}
        onSubmit={handleUpdateMember}
        isPending={ops.updateMemberMutation.isPending}
        departments={ops.departments}
      />
    </div>
  );
};

export default ClinicMembersManagement;