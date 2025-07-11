import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';
import { Tables, Enums } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const supabase = getSupabase();

export interface MemberWithProfile {
  member: Tables<'clinic_members'>;
  profile: Tables<'profiles'> | null;
  department: DepartmentWithType | null;
}

export interface DepartmentWithType extends Tables<'clinic_departments'> {
  department_types?: { name: string };
}

export interface InviteFormData {
  email: string;
  role: Enums<'user_role'>;
  departmentId: string;
}

const getTimestamp = () => new Date().toISOString();

export const useClinicMembers = () => {
  const { activeClinic, activeClinicRole, session } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const isSuperadmin = activeClinicRole === 'superadmin';

  // Fetch clinic members with profiles and departments
  const { data: members = [], isLoading: membersLoading, error: membersError } = useQuery({
    queryKey: ['clinicMembers', activeClinic?.clinic_id],
    queryFn: async (): Promise<MemberWithProfile[]> => {
      if (!activeClinic?.clinic_id) {
        return [];
      }

      // Fetch clinic members
      const { data: membersData, error: membersError } = await supabase
        .from("clinic_members")
        .select("*")
        .eq("clinic_id", activeClinic.clinic_id);
        
      if (membersError) throw membersError;
      if (!membersData?.length) return [];

      const userIds = membersData.map(m => m.user_id).filter(Boolean);
      
      // Parallel fetch of profiles and doctors
      const [profilesResult, doctorsResult] = await Promise.all([
        supabase.from("profiles").select("*").in("id", userIds),
        supabase.from("doctors").select("user_id, name, email").eq("clinic_id", activeClinic.clinic_id).in("user_id", userIds)
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (doctorsResult.error) throw doctorsResult.error;

      // Fetch departments if needed
      const departmentIds = membersData.map(m => m.department_id).filter(Boolean);
      let departmentsData: DepartmentWithType[] = [];
      
      if (departmentIds.length > 0) {
        const { data, error: deptError } = await supabase
          .from("clinic_departments")
          .select("*, department_types(name)")
          .in("id", departmentIds);
          
        if (deptError) throw deptError;
        departmentsData = (data || []) as DepartmentWithType[];
      }

      // Combine data
      return membersData.map(member => {
        const profile = profilesResult.data?.find(p => p.id === member.user_id) || null;
        const doctor = doctorsResult.data?.find(d => d.user_id === member.user_id) || null;
        const department = member.department_id 
          ? departmentsData.find(d => d.id === member.department_id) || null
          : null;
          
        return {
          member,
          profile: profile || {
            id: member.user_id,
            name: doctor?.name || null,
            email: doctor?.email || null,
            phone: null,
            created_at: null,
            updated_at: null
          },
          department,
        };
      });
    },
    enabled: !!activeClinic?.clinic_id,
    staleTime: 0,
  });

  // Fetch active departments
  const { data: activeDepartments = [], isLoading: departmentsLoading } = useQuery({
    queryKey: ['clinicDepartments', activeClinic?.clinic_id],
    queryFn: async (): Promise<DepartmentWithType[]> => {
      if (!activeClinic?.clinic_id) return [];
      
      const { data, error } = await supabase
        .from("clinic_departments")
        .select("*, department_types(name)")
        .eq("clinic_id", activeClinic.clinic_id);
        
      if (error) throw error;
      return (data || []) as DepartmentWithType[];
    },
    enabled: !!activeClinic?.clinic_id,
    staleTime: 0,
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
    staleTime: 5 * 60 * 1000,
  });

  // Filter members based on search term
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return members;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return members.filter(memberData => {
      const profile = memberData.profile;
      const department = memberData.department;
      
      return (
        profile?.name?.toLowerCase().includes(lowerSearchTerm) ||
        profile?.email?.toLowerCase().includes(lowerSearchTerm) ||
        profile?.phone?.toLowerCase().includes(lowerSearchTerm) ||
        memberData.member.role.toLowerCase().includes(lowerSearchTerm) ||
        department?.department_types?.name?.toLowerCase().includes(lowerSearchTerm)
      );
    });
  }, [members, searchTerm]);

  // Calculate inactive department types
  const inactiveDepartmentTypes = useMemo(() => {
    const activeDepartmentTypeIds = activeDepartments.map(dept => dept.department_type_id).filter(Boolean);
    return allDepartmentTypes.filter(dt => !activeDepartmentTypeIds.includes(dt.id));
  }, [allDepartmentTypes, activeDepartments]);

  // Add department mutation
  const addDepartmentMutation = useMutation({
    mutationFn: async (departmentTypeId: string) => {
      if (!activeClinic?.clinic_id) throw new Error('Active clinic not found');
      
      const departmentType = allDepartmentTypes.find(dt => dt.id === departmentTypeId);
      if (!departmentType) throw new Error('Invalid department type selected');
      
      const { data, error } = await supabase
        .from('clinic_departments')
        .insert({
          clinic_id: activeClinic.clinic_id,
          department_type_id: departmentTypeId,
        })
        .select('*, department_types(name)')
        .single();
        
      if (error) {
        if (error.code === '23505') {
          throw new Error('Department already exists for this clinic');
        }
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clinicDepartments', activeClinic?.clinic_id] });
      toast.success(`${data.department_types?.name} department added successfully!`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add department');
    },
  });

  // Invite member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: async (formData: InviteFormData & { name: string; phone: string }) => {
      if (!activeClinic?.clinic_id) throw new Error('Active clinic not found');
      
      const { data, error } = await supabase.rpc('invite_and_add_member', {
        p_email: formData.email,
        p_name: formData.name,
        p_phone: formData.phone,
        p_clinic_id: activeClinic.clinic_id,
        p_role: formData.role,
        p_department_id: formData.departmentId === 'no-department' ? null : formData.departmentId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicMembers', activeClinic?.clinic_id] });
      toast.success('Member invited successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to invite member');
    },
  });

  // Update member mutation
  const updateMemberMutation = useMutation({
    mutationFn: async ({ userId, role, departmentId }: { 
      userId: string; 
      role: Enums<'user_role'>; 
      departmentId: string 
    }) => {
      if (!activeClinic?.clinic_id) throw new Error('Active clinic not found');
      
      const { error } = await supabase.rpc('update_clinic_member_details', {
        member_user_id: userId,
        target_clinic_id: activeClinic.clinic_id,
        updated_role: role,
        updated_department_id: departmentId === 'no-department' ? null : departmentId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicMembers', activeClinic?.clinic_id] });
      toast.success('Member updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update member');
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!activeClinic?.clinic_id) throw new Error('Active clinic not found');
      
      const { error } = await supabase
        .from('clinic_members')
        .delete()
        .eq('user_id', userId)
        .eq('clinic_id', activeClinic.clinic_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicMembers', activeClinic?.clinic_id] });
      toast.success('Member removed successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove member');
    },
  });

  return {
    // Data
    members: filteredMembers,
    activeDepartments,
    inactiveDepartmentTypes,
    allDepartmentTypes,
    
    // Loading states
    membersLoading,
    departmentsLoading,
    
    // Search
    searchTerm,
    setSearchTerm,
    
    // Permissions
    isSuperadmin,
    
    // Mutations
    addDepartmentMutation,
    inviteMemberMutation,
    updateMemberMutation,
    removeMemberMutation,
    
    // Utils
    getRoleBadgeVariant: (role: string) => {
      switch (role) {
        case 'superadmin': return 'destructive';
        case 'doctor': return 'default';
        case 'staff': return 'secondary';
        default: return 'outline';
      }
    }
  };
}; 