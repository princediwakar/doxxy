import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Stethoscope, Edit3, Trash2, Shield, UserCog, Users, Phone, Building2 } from 'lucide-react';
import { InviteMemberData, CreateDoctorData, MemberWithDetails, DepartmentWithDetails } from '@/hooks/useClinicMembers';
import { UserRole } from '@/types/core';

// --- Helper Functions ---
const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case 'superadmin': return <Shield className="h-4 w-4" />;
    case 'doctor': return <Stethoscope className="h-4 w-4" />;
    case 'staff': return <UserCog className="h-4 w-4" />;
    default: return <Users className="h-4 w-4" />;
  }
};

const getRoleBadgeColor = (role: UserRole) => {
  switch (role) {
    case 'superadmin': return 'bg-red-100 text-red-800 border-red-200';
    case 'doctor': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'staff': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Safe extraction of department name (handles if Join returns Array or Object)
const getDeptName = (dept: DepartmentWithDetails) => {
  if (!dept.department_types) return 'Unknown';
  if (Array.isArray(dept.department_types)) {
    return dept.department_types[0]?.name || 'Unknown';
  }
  return dept.department_types.name || 'Unknown';
};

// --- Strict Interfaces ---

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: InviteMemberData;
  setData: (data: InviteMemberData) => void;
  onSubmit: () => void;
  isPending: boolean;
  departments: DepartmentWithDetails[];
}

interface DoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CreateDoctorData;
  setData: (data: CreateDoctorData) => void;
  onSubmit: () => void;
  isPending: boolean;
  departments: DepartmentWithDetails[];
}

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberWithDetails | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  deptId: string | undefined;
  setDeptId: (id: string | undefined) => void;
  onSubmit: () => void;
  isPending: boolean;
  departments: DepartmentWithDetails[];
}

interface MembersListProps {
  members: MemberWithDetails[];
  isLoading: boolean;
  searchTerm: string;
  error: Error | null;
  onEdit: (m: MemberWithDetails) => void;
  onDelete: (member: MemberWithDetails) => void;
  onCreateDoctor: (m: MemberWithDetails) => void;
  isDeleting: boolean;
  isCreatingDoctor: boolean;
}

// --- Components ---

export const InviteMemberDialog = ({ open, onOpenChange, data, setData, onSubmit, isPending, departments }: InviteDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2"><Mail className="h-5 w-5" /><span>Invite New Member</span></DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-full overflow-hidden">
        <div><label className="text-sm font-medium">Email *</label><Input value={data.email} onChange={e => setData({...data, email: e.target.value})} placeholder="email@example.com" /></div>
        <div><label className="text-sm font-medium">Name *</label><Input value={data.name} onChange={e => setData({...data, name: e.target.value})} placeholder="John Doe" /></div>
        <div><label className="text-sm font-medium">Phone</label><Input value={data.phone} onChange={e => setData({...data, phone: e.target.value})} /></div>
        <div>
          <label className="text-sm font-medium">Role *</label>
          <Select value={data.role} onValueChange={(v: UserRole) => setData({...data, role: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="staff">Staff</SelectItem><SelectItem value="doctor">Doctor</SelectItem><SelectItem value="superadmin">Superadmin</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Department</label>
          <Select value={data.department_id || 'none'} onValueChange={v => setData({...data, department_id: v === 'none' ? undefined : v})}>
            <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Department</SelectItem>
              {departments.map((d) => <SelectItem key={d.id} value={d.id}>{getDeptName(d)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
        <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Cancel</Button>
        <Button onClick={onSubmit} disabled={isPending} className="w-full sm:w-auto">{isPending ? 'Sending...' : 'Send Invitation'}</Button>
      </div>
    </DialogContent>
  </Dialog>
);

export const CreateDoctorDialog = ({ open, onOpenChange, data, setData, onSubmit, isPending, departments }: DoctorDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2"><Stethoscope className="h-5 w-5" /><span>Create Doctor Profile</span></DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-full overflow-hidden">
        <div><Label>Name *</Label><Input value={data.name} onChange={e => setData({...data, name: e.target.value})} /></div>
        <div><Label>Email *</Label><Input value={data.email} onChange={e => setData({...data, email: e.target.value})} /></div>
        <div><Label>Specialization</Label><Input value={data.primary_specialization} onChange={e => setData({...data, primary_specialization: e.target.value})} /></div>
        <div><Label>Fee (₹)</Label><Input type="number" value={data.consultation_fee} onChange={e => setData({...data, consultation_fee: Number(e.target.value)})} /></div>
        <div className="md:col-span-2">
          <Label>Department</Label>
          <Select value={data.department_id || 'none'} onValueChange={v => setData({...data, department_id: v === 'none' ? '' : v})}>
            <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Department</SelectItem>
              {departments.map((d) => <SelectItem key={d.id} value={d.id}>{getDeptName(d)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2"><Label>Bio</Label><Input value={data.bio} onChange={e => setData({...data, bio: e.target.value})} /></div>
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
        <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Cancel</Button>
        <Button onClick={onSubmit} disabled={isPending} className="w-full sm:w-auto">{isPending ? 'Creating...' : 'Create'}</Button>
      </div>
    </DialogContent>
  </Dialog>
);

export const EditMemberDialog = ({ open, onOpenChange, member, role, setRole, deptId, setDeptId, onSubmit, isPending, departments }: EditDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle className="flex items-center space-x-2"><Edit3 className="h-5 w-5" /><span>Edit Member</span></DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Editing: <span className="font-medium">{member?.profile?.name}</span></div>
        <div>
          <Label>Role *</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="staff">Staff</SelectItem><SelectItem value="doctor">Doctor</SelectItem><SelectItem value="superadmin">Superadmin</SelectItem></SelectContent>
          </Select>
        </div>
        <div>
          <Label>Department</Label>
          <Select value={deptId || 'none'} onValueChange={v => setDeptId(v === 'none' ? undefined : v)}>
            <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Department</SelectItem>
              {departments.map((d) => <SelectItem key={d.id} value={d.id}>{getDeptName(d)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
        <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Cancel</Button>
        <Button onClick={onSubmit} disabled={isPending} className="w-full sm:w-auto">{isPending ? 'Updating...' : 'Update'}</Button>
      </div>
    </DialogContent>
  </Dialog>
);

export const ClinicMembersList = ({ members, isLoading, searchTerm, error, onEdit, onDelete, onCreateDoctor, isDeleting, isCreatingDoctor }: MembersListProps) => {
  if (isLoading) return <div className="grid gap-4">{[1,2,3].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-4 h-24 bg-muted/10"/></Card>)}</div>;
  
  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>{searchTerm ? 'No members match your filters' : 'No members found'}</p>
          {error && <p className="text-red-500 mt-2 text-sm">Error: {error.message}</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 w-full max-w-full overflow-hidden">
      {members.map(member => (
        <Card key={member.id} className="hover:shadow-md transition-shadow w-full max-w-full overflow-hidden">
          <CardContent className="p-4 w-full max-w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full max-w-full">
              <div className="flex items-start space-x-3 sm:space-x-4 min-w-0 flex-1 w-full max-w-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">{getRoleIcon(member.role)}</div>
                <div className="min-w-0 flex-1 w-full max-w-full">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <h3 className="font-semibold truncate min-w-0 max-w-full">{member.profile?.name || 'Unknown'}</h3>
                    <Badge className={`text-xs shrink-0 ${getRoleBadgeColor(member.role)}`}>{member.role}</Badge>
                    {member.hasDoctor && <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 shrink-0"><Stethoscope className="h-3 w-3 mr-1"/>Doctor</Badge>}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground mt-1 min-w-0">
                    {member.profile?.email && <div className="flex items-center space-x-1 min-w-0"><Mail className="h-3 w-3 shrink-0" /><span className="truncate min-w-0">{member.profile.email}</span></div>}
                    {member.profile?.phone && <div className="flex items-center space-x-1"><Phone className="h-3 w-3 shrink-0" /><span>{member.profile.phone}</span></div>}
                    {member.department?.department_types && <div className="flex items-center space-x-1"><Building2 className="h-3 w-3 shrink-0" /><span className="truncate">{getDeptName(member.department)}</span></div>}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 ml-auto sm:ml-0 shrink-0">
                {(member.role === 'superadmin' || member.role === 'doctor') && !member.hasDoctor && (
                  <Button variant="outline" size="sm" onClick={() => onCreateDoctor(member)} disabled={isCreatingDoctor} className="text-blue-600 hover:text-blue-700"><Stethoscope className="h-4 w-4" /></Button>
                )}
                <Button variant="outline" size="sm" onClick={() => onEdit(member)}><Edit3 className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(member)} disabled={isDeleting} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};