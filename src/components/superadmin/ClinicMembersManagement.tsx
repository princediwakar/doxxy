import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Search, 
  Plus, 
  Users, 
  Settings, 
  Mail,
  Phone,
  Shield,
  Stethoscope,
  UserCog,
  Building2,
  Edit3,
  Trash2
} from 'lucide-react';

const supabase = getSupabase();

type UserRole = Database['public']['Enums']['user_role'];
type Profile = Database['public']['Tables']['profiles']['Row'];
// Using generated types from production schema
type ClinicDepartment = Database['public']['Tables']['clinic_departments']['Row'];
type DepartmentType = Database['public']['Tables']['department_types']['Row'];

interface MemberWithDetails {
  id: string;
  user_id: string | null;
  clinic_id: string | null;
  role: Database['public']['Enums']['user_role'];
  department_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  profile: Profile | null;
  department: (ClinicDepartment & { department_types: DepartmentType | null }) | null;
  hasDoctor: boolean;
}

interface InviteMemberData {
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  department_id?: string;
}

interface CreateDoctorData {
  name: string;
  email: string;
  primary_specialization?: string;
  consultation_fee?: number;
  bio?: string;
  department_id?: string;
}

const ClinicMembersManagement = () => {
  const { activeClinic, activeClinicRole } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState<InviteMemberData>({
    email: '',
    name: '',
    phone: '',
    role: 'staff'
  });
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [selectedMemberForDoctor, setSelectedMemberForDoctor] = useState<MemberWithDetails | null>(null);
  const [doctorData, setDoctorData] = useState<CreateDoctorData>({
    name: '',
    email: '',
    primary_specialization: '',
    consultation_fee: 0,
    bio: '',
    department_id: ''
  });
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState<MemberWithDetails | null>(null);
  const [editData, setEditData] = useState<{ role: UserRole; department_id?: string }>({
    role: 'staff',
    department_id: undefined
  });

  const clinicId = activeClinic?.clinic_id;
  const isSuperadmin = activeClinicRole === 'superadmin';

  // Fetch clinic members with details using a single optimized query
  const { data: members = [], isLoading: isLoadingMembers, error: membersError } = useQuery<MemberWithDetails[]>({
    queryKey: ['clinicMembers', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      console.log('Fetching clinic members for clinic:', clinicId);
      
      // Use a single query with joins to avoid N+1 problem
      const { data: clinicMembersData, error: membersError } = await supabase
        .from('clinic_members')
        .select(`
          id,
          user_id,
          clinic_id,
          role,
          department_id,
          created_at,
          updated_at,
          profiles!clinic_members_user_id_fkey (
            id,
            name,
            email,
            phone,
            avatar_url,
            created_at,
            updated_at
          )
        `)
        .eq('clinic_id', clinicId);
      
      if (membersError) {
        console.error('Error fetching clinic members:', membersError);
        throw membersError;
      }
      
      console.log('Raw clinic members data:', clinicMembersData);
      
      if (!clinicMembersData || clinicMembersData.length === 0) {
        console.log('No clinic members found for clinic:', clinicId);
        return [];
      }
      
      // Transform the data to match our interface
      const membersWithDetails: MemberWithDetails[] = await Promise.all(
        clinicMembersData.map(async (member: {
          id: string;
          user_id: string | null;
          clinic_id: string | null;
          role: Database['public']['Enums']['user_role'];
          department_id: string | null;
          created_at: string | null;
          updated_at: string | null;
          profiles: Profile | null;
        }) => {
          console.log('Processing member:', member);
          
          // Safely access profile data
          const profileData = member.profiles;
          if (!profileData) {
            console.warn('No profile data for member:', member.user_id);
          }
          
          // Check if user has doctor profile
          const { data: doctorProfile } = await supabase
            .from('doctors')
            .select('id')
            .eq('user_id', member.user_id || '')
            .eq('clinic_id', clinicId)
            .maybeSingle();

          // Get department info if exists
          let departmentInfo = null;
          if (member.department_id) {
            const { data: deptData } = await supabase
              .from('clinic_departments')
              .select(`
                *,
                department_types (
                  *
                )
              `)
              .eq('id', member.department_id)
              .maybeSingle();
            
            departmentInfo = deptData;
          }

          const transformedMember: MemberWithDetails = {
            id: member.id,
            user_id: member.user_id,
            clinic_id: member.clinic_id,
            role: member.role,
            department_id: member.department_id,
            created_at: member.created_at,
            updated_at: member.updated_at,
            profile: profileData || null,
            department: departmentInfo as (ClinicDepartment & { department_types: DepartmentType | null }) | null,
            hasDoctor: !!doctorProfile
          };
          
          console.log('Transformed member:', transformedMember);
          return transformedMember;
        })
      );
      
      console.log('Final members with details:', membersWithDetails);
      return membersWithDetails;
    },
    enabled: !!clinicId,
  });

  // Log any errors
  if (membersError) {
    console.error('Members query error:', membersError);
  }

  // Fetch clinic departments for dropdown
  const { data: departments = [] } = useQuery({
    queryKey: ['clinicDepartments', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('clinic_departments')
        .select(`
          *,
          department_types (
            *
          )
        `)
        .eq('clinic_id', clinicId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!clinicId,
  });

  // Invite member mutation - use edge function to send emails
  const inviteMemberMutation = useMutation({
    mutationFn: async (memberData: InviteMemberData) => {
      if (!clinicId) throw new Error('No active clinic');
      
      console.log('Inviting member with data:', memberData);
      
      // Use the edge function to send invitation emails
      const { data, error } = await supabase.functions.invoke('invite-member', {
        body: {
          memberData: {
            email: memberData.email.toLowerCase().trim(),
            name: memberData.name,
            phone: memberData.phone || undefined,
            role: memberData.role,
            department_id: memberData.department_id || undefined,
            clinic_id: clinicId
          }
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Failed to invite user: ${error.message}`);
      }

      if (!data?.success) {
        const errorMsg = data?.error || 'Failed to invite user';
        console.error('Invitation failed:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('Invitation sent successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      const message = (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string') 
        ? data.message 
        : 'Member invited successfully! They will be added to the clinic when they sign up.';
      toast.success(message);
      setShowInviteForm(false);
      setInviteData({ email: '', name: '', phone: '', role: 'staff' });
      queryClient.invalidateQueries({ queryKey: ['clinicMembers', clinicId] });
      queryClient.invalidateQueries({ queryKey: ['pendingInvitations', clinicId] });
    },
    onError: (error: Error) => {
      console.error('Member invitation failed:', error);
      const errorMessage = error.message || 'Failed to invite member';
      toast.error(errorMessage);
    },
  });

  // Update member role mutation
  const updateMemberMutation = useMutation({
    mutationFn: async ({ userId, role, departmentId }: { userId: string, role: UserRole, departmentId?: string }) => {
      if (!clinicId) throw new Error('No active clinic');
      
      // Using direct database update since RPC function might not exist
      const { error } = await supabase
        .from('clinic_members')
        .update({ 
          role: role,
          department_id: departmentId || null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('clinic_id', clinicId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Member updated successfully');
      queryClient.invalidateQueries({ queryKey: ['clinicMembers', clinicId] });
    },
    onError: (error: Error) => {
      toast.error('Failed to update member: ' + error.message);
    },
  });

  // Create doctor profile mutation
  const createDoctorMutation = useMutation({
    mutationFn: async (data: CreateDoctorData & { userId: string }) => {
      if (!clinicId) throw new Error('No active clinic');
      
      // Using direct database insert since RPC function might not exist
      const { data: doctorId, error } = await supabase
        .from('doctors')
        .insert({
          user_id: data.userId,
          clinic_id: clinicId,
          name: data.name,
          email: data.email,
          specialization: data.primary_specialization || null,
          phone: null, // We don't have this in the form
          is_active: true
        })
        .select('id')
        .single();
      
      if (error) throw error;
      return doctorId;
    },
    onSuccess: () => {
      toast.success('Doctor profile created successfully');
      setShowDoctorForm(false);
      setSelectedMemberForDoctor(null);
      setDoctorData({
        name: '',
        email: '',
        primary_specialization: '',
        consultation_fee: 0,
        bio: '',
        department_id: ''
      });
      queryClient.invalidateQueries({ queryKey: ['clinicMembers', clinicId] });
    },
    onError: (error: Error) => {
      toast.error('Failed to create doctor profile: ' + error.message);
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('clinic_members')
        .delete()
        .eq('id', memberId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Member removed successfully');
      queryClient.invalidateQueries({ queryKey: ['clinicMembers', clinicId] });
    },
    onError: (error: Error) => {
      toast.error('Failed to remove member: ' + error.message);
    },
  });

  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesSearch = !searchTerm || 
      member.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

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

  const handleInviteMember = () => {
    if (!inviteData.email || !inviteData.name) {
      toast.error('Email and name are required');
      return;
    }
    inviteMemberMutation.mutate(inviteData);
  };

  const handleCreateDoctorProfile = (member: MemberWithDetails) => {
    setSelectedMemberForDoctor(member);
    setDoctorData({
      name: member.profile?.name || '',
      email: member.profile?.email || '',
      primary_specialization: '',
      consultation_fee: 0,
      bio: '',
      department_id: member.department_id || undefined
    });
    setShowDoctorForm(true);
  };

  const handleSubmitDoctorProfile = () => {
    if (!selectedMemberForDoctor) return;
    
    if (!doctorData.name || !doctorData.email) {
      toast.error('Name and email are required');
      return;
    }
    
    if (!selectedMemberForDoctor.user_id) {
      toast.error('Invalid member selected');
      return;
    }
    
    createDoctorMutation.mutate({
      ...doctorData,
      userId: selectedMemberForDoctor.user_id
    });
  };

  const handleEditMember = (member: MemberWithDetails) => {
    setSelectedMemberForEdit(member);
    setEditData({
      role: member.role,
      department_id: member.department_id || undefined
    });
    setShowEditForm(true);
  };

  const handleSubmitEditMember = () => {
    if (!selectedMemberForEdit || !selectedMemberForEdit.user_id) {
      toast.error('Invalid member selected');
      return;
    }
    
    updateMemberMutation.mutate({
      userId: selectedMemberForEdit.user_id,
      role: editData.role,
      departmentId: editData.department_id
    });
    
    setShowEditForm(false);
    setSelectedMemberForEdit(null);
    setEditData({ role: 'staff', department_id: undefined });
  };

  // Early return for access control
  if (!isSuperadmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Access Denied</p>
            <p className="text-sm">Only Superadmins can manage clinic members.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="clinic-members-management">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Clinic Members</h2>
          <p className="text-muted-foreground">
            Manage your clinic staff, doctors, and administrators
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-primary/10 text-primary border border-primary/20">
            {members.length} Members
          </Badge>
          <Button onClick={() => setShowInviteForm(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Invite Member</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedRole} onValueChange={(value: UserRole | 'all') => setSelectedRole(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="superadmin">Superadmin</SelectItem>
            <SelectItem value="doctor">Doctor</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Invite New Member</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  placeholder="member@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  value={inviteData.name}
                  onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={inviteData.phone}
                  onChange={(e) => setInviteData({ ...inviteData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role *</label>
                <Select value={inviteData.role} onValueChange={(value: UserRole) => setInviteData({ ...inviteData, role: value })}>
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
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Department (Optional)</label>
                <Select value={inviteData.department_id || 'none'} onValueChange={(value) => setInviteData({ ...inviteData, department_id: value === 'none' ? undefined : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Department</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.department_types?.name || 'Unknown Department'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleInviteMember}
                disabled={inviteMemberMutation.isPending}
              >
                {inviteMemberMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctor Profile Creation Dialog */}
      <Dialog open={showDoctorForm} onOpenChange={setShowDoctorForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5" />
              <span>Create Doctor Profile</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="doctor-name">Full Name *</Label>
                <Input
                  id="doctor-name"
                  value={doctorData.name}
                  onChange={(e) => setDoctorData({ ...doctorData, name: e.target.value })}
                  placeholder="Dr. John Doe"
                />
              </div>
              <div>
                <Label htmlFor="doctor-email">Email *</Label>
                <Input
                  id="doctor-email"
                  type="email"
                  value={doctorData.email}
                  onChange={(e) => setDoctorData({ ...doctorData, email: e.target.value })}
                  placeholder="doctor@example.com"
                />
              </div>
              <div>
                <Label htmlFor="doctor-specialization">Primary Specialization</Label>
                <Input
                  id="doctor-specialization"
                  value={doctorData.primary_specialization}
                  onChange={(e) => setDoctorData({ ...doctorData, primary_specialization: e.target.value })}
                  placeholder="e.g., Cardiology, Pediatrics"
                />
              </div>
              <div>
                <Label htmlFor="doctor-fee">Consultation Fee (₹)</Label>
                <Input
                  id="doctor-fee"
                  type="number"
                  min="0"
                  value={doctorData.consultation_fee}
                  onChange={(e) => setDoctorData({ ...doctorData, consultation_fee: Number(e.target.value) })}
                  placeholder="500"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="doctor-department">Department</Label>
                <Select 
                  value={doctorData.department_id || 'none'} 
                  onValueChange={(value) => setDoctorData({ ...doctorData, department_id: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Department</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.department_types?.name || 'Unknown Department'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="doctor-bio">Bio</Label>
                <Input
                  id="doctor-bio"
                  value={doctorData.bio}
                  onChange={(e) => setDoctorData({ ...doctorData, bio: e.target.value })}
                  placeholder="Brief professional summary..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDoctorForm(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitDoctorProfile}
                disabled={createDoctorMutation.isPending}
              >
                {createDoctorMutation.isPending ? 'Creating...' : 'Create Doctor Profile'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit3 className="h-5 w-5" />
              <span>Edit Member</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Editing: <span className="font-medium">{selectedMemberForEdit?.profile?.name}</span>
            </div>
            <div>
              <Label htmlFor="edit-role">Role *</Label>
              <Select 
                value={editData.role} 
                onValueChange={(value: UserRole) => setEditData({ ...editData, role: value })}
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
              <Label htmlFor="edit-department">Department</Label>
              <Select 
                value={editData.department_id || 'none'} 
                onValueChange={(value) => setEditData({ ...editData, department_id: value === 'none' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Department</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.department_types?.name || 'Unknown Department'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditForm(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitEditMember}
                disabled={updateMemberMutation.isPending}
              >
                {updateMemberMutation.isPending ? 'Updating...' : 'Update Member'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Members List */}
      {isLoadingMembers ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{searchTerm || selectedRole !== 'all' ? 'No members match your filters' : 'No members found'}</p>
              <p className="text-sm">
                {searchTerm || selectedRole !== 'all' ? 'Try adjusting your search or filters' : 'Invite your first team member to get started'}
              </p>
              {membersError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">Error: {membersError.message}</p>
                </div>
              )}
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                <p>Debug Info:</p>
                <p>Clinic ID: {clinicId}</p>
                <p>Is Superadmin: {isSuperadmin ? 'Yes' : 'No'}</p>
                <p>Members Count: {members.length}</p>
                <p>Loading: {isLoadingMembers ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {getRoleIcon(member.role)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{member.profile?.name || 'Unknown'}</h3>
                        <Badge className={`text-xs ${getRoleBadgeColor(member.role)}`}>
                          {member.role}
                        </Badge>
                        {member.hasDoctor && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            <Stethoscope className="h-3 w-3 mr-1" />
                            Doctor Profile
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {member.profile?.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{member.profile.email}</span>
                          </div>
                        )}
                        {member.profile?.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{member.profile.phone}</span>
                          </div>
                        )}
                        {member.department?.department_types?.name && (
                          <div className="flex items-center space-x-1">
                            <Building2 className="h-3 w-3" />
                            <span>{member.department.department_types.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(member.role === 'superadmin' || member.role === 'doctor') && !member.hasDoctor && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateDoctorProfile(member)}
                        disabled={createDoctorMutation.isPending}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Stethoscope className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMember(member)}
                      disabled={updateMemberMutation.isPending}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeMemberMutation.mutate(member.id)}
                      disabled={removeMemberMutation.isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClinicMembersManagement;