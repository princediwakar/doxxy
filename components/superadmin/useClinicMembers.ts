"use client";
import { logger } from "@/lib/logger";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';
import { UserRole, DbClinicDepartment, DbDepartmentType } from '@/types/core';
import { toast } from 'sonner';

// --- Types ---
export type ClinicDepartment = DbClinicDepartment;
export type DepartmentType = DbDepartmentType;

// Update: department_types might be returned as an array or object by Supabase joins
export type DepartmentWithDetails = ClinicDepartment & {
  department_types: DepartmentType | DepartmentType[] | null;
};

export interface ProfileData {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface MemberWithDetails {
  id: string;
  user_id: string | null;
  clinic_id: string | null;
  role: UserRole;
  department_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  profile: ProfileData | null;
  department: DepartmentWithDetails | null;
  hasDoctor: boolean;
}

export interface InviteMemberData {
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  department_id?: string;
}

export interface CreateDoctorData {
  name: string;
  email: string;
  primary_specialization?: string;
  consultation_fee?: number;
  bio?: string;
  department_id?: string;
}

const supabase = getSupabase();

// --- Hook ---
export const useClinicMembers = (clinicId: string | undefined) => {
  const queryClient = useQueryClient();

  // Fetch Members
  const { data: members = [], isLoading: isLoadingMembers, error: membersError } = useQuery<MemberWithDetails[]>({
    queryKey: ['clinicMembers', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data: clinicMembersData, error } = await supabase
        .from('clinic_members')
        .select(`
          id, user_id, clinic_id, role, department_id, created_at, updated_at,
          profiles!clinic_members_user_id_fkey (id, name, email, phone, avatar_url, created_at, updated_at)
        `)
        .eq('clinic_id', clinicId);
      
      if (error) throw error;
      if (!clinicMembersData) return [];
      
      return Promise.all(
        clinicMembersData.map(async (member) => {
          const { data: doctorProfile } = await supabase
            .from('doctors')
            .select('id')
            .eq('user_id', member.user_id || '')
            .eq('clinic_id', clinicId)
            .maybeSingle();

          let departmentInfo = null;
          if (member.department_id) {
            const { data: deptData } = await supabase
              .from('clinic_departments')
              .select('*, department_types(*)')
              .eq('id', member.department_id)
              .maybeSingle();
            departmentInfo = deptData;
          }

          return {
            id: member.id,
            user_id: member.user_id,
            clinic_id: member.clinic_id,
            role: member.role,
            department_id: member.department_id,
            created_at: member.created_at,
            updated_at: member.updated_at,
            profile: member.profiles,
            department: departmentInfo as DepartmentWithDetails | null,
            hasDoctor: !!doctorProfile
          };
        })
      );
    },
    enabled: !!clinicId,
  });

  // Fetch Departments for Dropdowns
  const { data: departments = [] } = useQuery<DepartmentWithDetails[]>({
    queryKey: ['clinicDepartments', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const { data, error } = await supabase
        .from('clinic_departments')
        .select('*, department_types(*)')
        .eq('clinic_id', clinicId);
      if (error) throw error;
      return (data as DepartmentWithDetails[]) || [];
    },
    enabled: !!clinicId,
  });

  // Mutations
  const inviteMemberMutation = useMutation({
    mutationFn: async (memberData: InviteMemberData) => {
      if (!clinicId) throw new Error('No active clinic');

      // 1. Sanitize Inputs Aggressively
      const cleanEmail = memberData.email.trim().toLowerCase();
      const cleanName = memberData.name.trim();

      // Validate before network request
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        throw new Error("Invalid email format");
      }

      logger.log("Inviting:", cleanEmail); // Debug log

      const { data, error } = await supabase.functions.invoke('invite-member', {
        body: { 
          memberData: { 
            ...memberData, 
            email: cleanEmail, 
            name: cleanName,
            clinic_id: clinicId 
          } 
        }
      });

      if (error) {
        // Parse Supabase Edge Function error structure
        try {
          const errorBody = JSON.parse(error.message);
          throw new Error(errorBody.error || error.message);
        } catch {
          throw new Error(error.message);
        }
      }
      
      if (!data?.success) throw new Error(data?.error || 'Failed to invite user');
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Member invited successfully!');
      queryClient.invalidateQueries({ queryKey: ['clinicMembers', clinicId] });
      queryClient.invalidateQueries({ queryKey: ['pendingInvitations', clinicId] });
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to invite member'),
  });

  const updateMemberMutation = useMutation({
    mutationFn: async ({ userId, role, departmentId }: { userId: string, role: UserRole, departmentId?: string }) => {
      if (!clinicId) throw new Error('No active clinic');
      const { error } = await supabase
        .from('clinic_members')
        .update({ role, department_id: departmentId || null, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('clinic_id', clinicId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Member updated successfully');
      queryClient.invalidateQueries({ queryKey: ['clinicMembers', clinicId] });
    },
    onError: (err: Error) => toast.error('Failed to update member: ' + err.message),
  });

  const createDoctorMutation = useMutation({
    mutationFn: async (data: CreateDoctorData & { userId: string }) => {
      if (!clinicId) throw new Error('No active clinic');
      const { error } = await supabase.from('doctors').insert({
        user_id: data.userId,
        clinic_id: clinicId,
        name: data.name,
        email: data.email,
        primary_specialization: data.primary_specialization || null,
        phone: null,
        is_active: true
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Doctor profile created successfully');
      queryClient.invalidateQueries({ queryKey: ['clinicMembers', clinicId] });
    },
    onError: (err: Error) => toast.error('Failed to create doctor profile: ' + err.message),
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from('clinic_members').delete().eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Member removed successfully');
      queryClient.invalidateQueries({ queryKey: ['clinicMembers', clinicId] });
    },
    onError: (err: Error) => toast.error('Failed to remove member: ' + err.message),
  });

  return {
    members,
    departments,
    isLoadingMembers,
    membersError,
    inviteMemberMutation,
    updateMemberMutation,
    createDoctorMutation,
    removeMemberMutation
  };
};