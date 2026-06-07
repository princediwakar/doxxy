// components/superadmin/ClinicMemberComponents.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Stethoscope, Edit2, Trash2, Shield, UserCog, Users, Phone, Building2 } from 'lucide-react';
import type { InviteMemberData, MemberWithDetails, DepartmentWithDetails, UserRole } from '@/types/core';

// --- Utility Functions ---
const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case 'superadmin': return <Shield className="h-4 w-4 text-red-500" />;
    case 'doctor': return <Stethoscope className="h-4 w-4 text-blue-500" />;
    default: return <UserCog className="h-4 w-4 text-green-500" />;
  }
};

const getDeptName = (dept?: DepartmentWithDetails | null) => {
  if (!dept?.department_types) return 'Unassigned';
  return Array.isArray(dept.department_types) ? dept.department_types[0]?.name : dept.department_types.name;
};

// --- Types ---
export interface EditProfileState {
  name: string;
  phone: string;
  role: UserRole;
  department_id: string;
  primary_specialization: string;
  consultation_fee: number;
  bio: string;
}

// --- High Density List Component ---
export const ClinicMembersList = ({ 
  members, 
  onEdit, 
  onDelete, 
  isDeleting 
}: {
  members: MemberWithDetails[];
  onEdit: (m: MemberWithDetails) => void;
  onDelete: (m: MemberWithDetails) => void;
  isDeleting: boolean;
}) => {
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground text-center">
        <Users className="h-10 w-10 mb-4 opacity-20" />
        <p className="text-sm">No members found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {members.map(member => (
        <div key={member.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-muted/30 transition-colors gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 border">
              {getRoleIcon(member.role)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm truncate">{member.profile?.name || 'Pending User'}</p>
                <Badge variant="secondary" className="text-[10px] h-5 capitalize shrink-0">{member.role}</Badge>
                {member.hasDoctor && <Badge variant="outline" className="text-[10px] h-5 border-blue-200 text-blue-600 bg-blue-50 shrink-0">MD</Badge>}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 truncate"><Mail className="h-3 w-3"/> {member.profile?.email}</span>
                {member.profile?.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3"/> {member.profile.phone}</span>}
                <span className="flex items-center gap-1"><Building2 className="h-3 w-3"/> {getDeptName(member.department)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <Button variant="ghost" size="sm" onClick={() => onEdit(member)} className="h-8 text-xs">
              <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(member)} disabled={isDeleting} className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Edit Member Modal (Replaces Inline Accordion) ---
export const EditMemberDialog = ({ 
  member, open, onOpenChange, onSave, isSaving, departments 
}: {
  member: MemberWithDetails;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (m: MemberWithDetails, s: EditProfileState) => void;
  isSaving: boolean;
  departments: DepartmentWithDetails[];
}) => {
  const [state, setState] = useState<EditProfileState>({
    name: member.profile?.name || '',
    phone: member.profile?.phone || '',
    role: member.role,
    department_id: member.department_id || '',
    primary_specialization: member.doctor?.primary_specialization || '',
    consultation_fee: member.doctor?.consultation_fee || 0,
    bio: member.doctor?.bio || '',
  });

  const set = (patch: Partial<EditProfileState>) => setState(p => ({ ...p, ...patch }));
  const isDoc = state.role === 'doctor' || state.role === 'superadmin';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Member Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Full Name</label>
              <Input value={state.name} onChange={e => set({ name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Phone</label>
              <Input value={state.phone} onChange={e => set({ phone: e.target.value })} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Role</label>
              <Select value={state.role} onValueChange={(v: UserRole) => set({ role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Department</label>
              <Select value={state.department_id || 'none'} onValueChange={v => set({ department_id: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{getDeptName(d)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isDoc && (
            <div className="rounded-md grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Specialization</label>
                  <Input value={state.primary_specialization} onChange={e => set({ primary_specialization: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Consultation Fee (₹)</label>
                  <Input type="number" value={state.consultation_fee} onChange={e => set({ consultation_fee: Number(e.target.value) })} />
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
          <Button onClick={() => onSave(member, state)} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};



interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: InviteMemberData;
  setData: (data: InviteMemberData) => void;
  onSubmit: () => void;
  isPending: boolean;
  departments: DepartmentWithDetails[];
}

export const InviteMemberDialog = ({
  open,
  onOpenChange,
  data,
  setData,
  onSubmit,
  isPending,
  departments
}: InviteDialogProps) => {
  
  // Helper to keep state updates clean and concise
  const set = (patch: Partial<InviteMemberData>) => setData({ ...data, ...patch });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            Invite New Member
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Row 1: Core Identity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Full Name *</label>
              <Input
                placeholder="John Doe"
                value={data.name}
                onChange={e => set({ name: e.target.value })}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Email *</label>
              <Input
                type="email"
                placeholder="email@clinic.com"
                value={data.email}
                onChange={e => set({ email: e.target.value })}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Row 2: Contact & Access */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Phone</label>
              <Input
                placeholder="+1 (555) 000-0000"
                value={data.phone || ''}
                onChange={e => set({ phone: e.target.value })}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Role *</label>
              <Select 
                value={data.role} 
                onValueChange={(v: UserRole) => set({ role: v })}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conditional Row: Department (Grouped visually to show it's context-dependent) */}
          {data.role !== 'staff' && (
            <div className="space-y-2 p-4 bg-muted/40 rounded-md border mt-2">
              <label className="text-xs font-medium">Department Assignment</label>
              <Select
                value={data.department_id || 'none'}
                onValueChange={v => set({ department_id: v === 'none' ? undefined : v })}
                disabled={isPending}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Department</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {getDeptName(d)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground pt-1">
                Assigning a department helps route relevant metrics and permissions to this user.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSubmit} 
            disabled={isPending}
          >
            {isPending ? 'Sending Invite...' : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};