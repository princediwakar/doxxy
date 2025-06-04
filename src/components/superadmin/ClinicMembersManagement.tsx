import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables, Enums } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface MemberWithProfile {
  member: Tables<'clinic_members'>;
  profile: Tables<'profiles'> | null;
  department: DepartmentWithType | null;
}

// Add a type for departments with joined department_types
interface DepartmentWithType extends Tables<'clinic_departments'> {
  department_types?: { name: string };
}

// Type for the raw member row returned from Supabase
interface RawMemberRow extends Tables<'clinic_members'> {
  profiles?: Tables<'profiles'>;
  department?: DepartmentWithType;
}

const ClinicMembersManagement = () => {
  const { activeClinic } = useAuth();
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "staff" as Enums<'user_role'>,
    departmentId: "",
  });
  const [departments, setDepartments] = useState<DepartmentWithType[]>([]);
  const [doctorNames, setDoctorNames] = useState<Record<string, string>>({});
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ role: Enums<'user_role'>; departmentId: string }>({ role: "staff", departmentId: "" });
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [removalLoading, setRemovalLoading] = useState(false);

  // Fetch members and departments
  useEffect(() => {
    const fetchMembers = async () => {
      if (!activeClinic?.clinic_id) return;
      setLoading(true);
      const { data: membersData, error: membersError } = await supabase
        .from("clinic_members")
        .select("*, profiles:profiles(*), department:clinic_departments(*, department_types(*))")
        .eq("clinic_id", activeClinic.clinic_id);
      if (membersError) {
        toast.error("Failed to fetch members: " + membersError.message);
        setLoading(false);
        return;
      }
      const membersList: Array<{ member: Tables<'clinic_members'>; profile: Tables<'profiles'> | null; department: DepartmentWithType | null }> = (membersData || []).map((m: RawMemberRow) => ({
        member: m,
        profile: m.profiles || null,
        department: m.department || null,
      }));
      setMembers(membersList);
      setLoading(false);
    };
    const fetchDepartments = async () => {
      if (!activeClinic?.clinic_id) return;
      const { data, error } = await supabase
        .from("clinic_departments")
        .select("id, department_types(name)")
        .eq("clinic_id", activeClinic.clinic_id);
      if (!error && data) setDepartments(data as DepartmentWithType[]);
    };
    fetchMembers();
    fetchDepartments();
  }, [activeClinic]);

  // Invite member handler
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClinic?.clinic_id) return;
    if (!inviteForm.email) {
      toast.error("Email is required");
      return;
    }
    setLoading(true);
    try {
      // Use the invite-member Edge Function for all roles (doctor, staff, superadmin)
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: inviteForm.email,
          clinic_id: activeClinic.clinic_id,
          role: inviteForm.role,
          department_id: inviteForm.departmentId || null,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to invite member via Edge Function.');
      }
      toast.success("Invitation sent successfully!");
      setInviteForm({ email: "", role: "staff", departmentId: "" });
    } catch (error: any) {
      toast.error("Failed to invite member: " + (error.message || error.toString()));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member: Tables<'clinic_members'>, department: DepartmentWithType | null) => {
    setEditMemberId(member.id);
    setEditForm({ role: member.role, departmentId: department?.id || "" });
  };

  const handleCancelEdit = () => {
    setEditMemberId(null);
  };

  const handleSaveEdit = async (member: Tables<'clinic_members'>) => {
    setLoading(true);
    const { error } = await supabase.rpc("update_clinic_member_details", {
      member_user_id: member.user_id,
      target_clinic_id: member.clinic_id,
      updated_role: editForm.role,
      updated_department_id: editForm.departmentId || null,
    });
    setLoading(false);
    if (error) {
      toast.error("Failed to update member: " + error.message);
    } else {
      toast.success("Member updated successfully");
      setEditMemberId(null);
      // Refresh members
      const fetchMembers = async () => {
        if (!activeClinic?.clinic_id) return;
        setLoading(true);
        const { data: membersData, error: membersError } = await supabase
          .from("clinic_members")
          .select("*, profiles:profiles(*), department:clinic_departments(*, department_types(*))")
          .eq("clinic_id", activeClinic.clinic_id);
        if (!membersError && membersData) {
          const membersList = (membersData || []).map((m: RawMemberRow) => ({
            member: m,
            profile: m.profiles || null,
            department: m.department || null,
          }));
          setMembers(membersList);
        }
        setLoading(false);
      };
      fetchMembers();
    }
  };

  const handleRemove = (member: Tables<'clinic_members'>) => {
    setRemovingMemberId(member.id);
  };

  const confirmRemove = async (member: Tables<'clinic_members'>) => {
    setRemovalLoading(true);
    const { error } = await supabase
      .from("clinic_members")
      .delete()
      .eq("id", member.id);
    setRemovalLoading(false);
    setRemovingMemberId(null);
    if (error) {
      toast.error("Failed to remove member: " + error.message);
    } else {
      toast.success("Member removed successfully");
      setMembers(members.filter(m => m.member.id !== member.id));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clinic Members</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col md:flex-row gap-2 mb-6" onSubmit={handleInvite}>
          <Input
            type="email"
            placeholder="Email"
            value={inviteForm.email}
            onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
            disabled={loading}
            required
            className="md:w-1/3"
          />
          <select
            value={inviteForm.role}
            onChange={e => setInviteForm(f => ({ ...f, role: e.target.value as Enums<'user_role'> }))}
            disabled={loading}
            className="border rounded px-2 py-1 md:w-1/4"
          >
            <option value="staff">Staff</option>
            <option value="doctor">Doctor</option>
            <option value="superadmin">Superadmin</option>
          </select>
          <select
            value={inviteForm.departmentId}
            onChange={e => setInviteForm(f => ({ ...f, departmentId: e.target.value }))}
            disabled={loading}
            className="border rounded px-2 py-1 md:w-1/4"
          >
            <option value="">No Department</option>
            {departments.map(dep => (
              <option key={dep.id} value={dep.id}>{dep.department_types?.name || dep.id}</option>
            ))}
          </select>
          <Button type="submit" disabled={loading} className="md:w-1/6">
            {loading ? "Inviting..." : "Invite"}
          </Button>
        </form>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Department</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(({ member, profile, department }) => {
                const isEditing = editMemberId === member.id;
                return (
                  <tr key={member.id} className="border-b">
                    <td className="p-2">{profile?.name || profile?.email || "Pending"}</td>
                    <td className="p-2">{profile?.email || member.user_id}</td>
                    <td className="p-2 capitalize">
                      {isEditing ? (
                        <select
                          value={editForm.role}
                          onChange={e => setEditForm(f => ({ ...f, role: e.target.value as Enums<'user_role'> }))}
                          className="border rounded px-2 py-1"
                          disabled={loading}
                        >
                          <option value="staff">Staff</option>
                          <option value="doctor">Doctor</option>
                          <option value="superadmin">Superadmin</option>
                        </select>
                      ) : (
                        member.role
                      )}
                    </td>
                    <td className="p-2">
                      {isEditing ? (
                        <select
                          value={editForm.departmentId}
                          onChange={e => setEditForm(f => ({ ...f, departmentId: e.target.value }))}
                          className="border rounded px-2 py-1"
                          disabled={loading}
                        >
                          <option value="">No Department</option>
                          {departments.map(dep => (
                            <option key={dep.id} value={dep.id}>{dep.department_types?.name || dep.id}</option>
                          ))}
                        </select>
                      ) : (
                        department?.department_types?.name || "-"
                      )}
                    </td>
                    <td className="p-2">
                      {isEditing ? (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleSaveEdit(member)} disabled={loading} className="mr-2">Save</Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEdit} disabled={loading}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(member, department)} className="mr-2">Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRemove(member)}>Remove</Button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {members.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-2 text-center text-muted-foreground">No members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Dialog open={!!removingMemberId} onOpenChange={open => !open && setRemovingMemberId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Member</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to remove this member? This action cannot be undone.</p>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setRemovingMemberId(null)} disabled={removalLoading}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                const member = members.find(m => m.member.id === removingMemberId);
                if (member) confirmRemove(member.member);
              }} disabled={removalLoading}>
                {removalLoading ? "Removing..." : "Remove"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ClinicMembersManagement; 