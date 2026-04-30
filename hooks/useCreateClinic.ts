"use client";

import { useMutation } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { showErrorToast } from "@/lib/error-utils";
import { toast } from "sonner";
import { createDoctorProfile } from "@/lib/doctor-utils";
import { logger } from "@/lib/logger";

interface CreateClinicParams {
  user: {
    id: string;
    email?: string | undefined;
    phone?: string | undefined;
    user_metadata?: { name?: string } | undefined;
  };
  clinicDetails: {
    name: string;
    address?: string;
    email?: string;
    phone?: string;
    website?: string;
  };
  departments: string[];
  doctorProfile: {
    isDoctor: string;
    bio?: string;
    phone?: string;
    selectedDepartment?: string;
    consultationFee?: number;
  };
}

const supabase = getSupabase();

export function useCreateClinic() {
  return useMutation({
    mutationFn: async (params: CreateClinicParams): Promise<string> => {
      const { user, clinicDetails, departments, doctorProfile } = params;

      // 1. Create clinic via RPC
      const { data: clinicResult, error: clinicError } = await supabase
        .rpc('create_clinic_with_admin', {
          clinic_name: clinicDetails.name,
          user_phone: user.phone || undefined
        })
        .single();

      if (clinicError) throw clinicError;
      if (!clinicResult) throw new Error("Clinic creation failed - no result returned.");

      const createdClinicId = (clinicResult as { clinic_id: string }).clinic_id;

      // 2. Update additional clinic details (address, email, phone, website)
      const { error: updateError } = await supabase
        .from('clinics')
        .update({
          address: clinicDetails.address || null,
          email: clinicDetails.email || null,
          phone: clinicDetails.phone || null,
          website: clinicDetails.website || null,
          created_by: user.id
        })
        .eq('id', createdClinicId);

      if (updateError) throw updateError;

      // 3. Insert selected departments into clinic_departments
      // IMPORTANT: clinic_members.department_id references clinic_departments.id (NOT department_types.id)
      let userDepartmentId: string | null = null;
      if (departments.length > 0) {
        const departmentRows = departments.map((departmentTypeId) => ({
          clinic_id: createdClinicId,
          department_type_id: departmentTypeId,
        }));
        const { data: insertedDepartments, error: deptError } = await supabase
          .from('clinic_departments')
          .insert(departmentRows)
          .select('id, department_type_id');
        if (deptError) throw deptError;

        // Find the clinic_departments.id for the user's selected department
        // We need clinic_departments.id (not department_types.id) for the foreign key
        if (doctorProfile.isDoctor === 'yes' && doctorProfile.selectedDepartment && insertedDepartments) {
          const userDepartment = insertedDepartments.find(
            dept => dept.department_type_id === doctorProfile.selectedDepartment
          );
          if (!userDepartment) {
            logger.warn('Could not find matching clinic_departments row for selected department', {
              selectedDepartment: doctorProfile.selectedDepartment,
              insertedDepartmentIds: insertedDepartments.map(d => d.id),
            });
          }
          userDepartmentId = userDepartment?.id || null;
        }
      }

      // 4. Handle doctor profile or admin member
      if (doctorProfile.isDoctor === 'yes') {
        // First update the clinic_members record with the selected department
        // BUT keep the role as superadmin since they are the clinic creator
        const { error: memberUpdateError } = await supabase
          .from('clinic_members')
          .update({
            department_id: userDepartmentId,
            role: 'superadmin'
          })
          .eq('user_id', user.id)
          .eq('clinic_id', createdClinicId);

        if (memberUpdateError) throw memberUpdateError;

        // Then create the doctor profile
        const { error: doctorError } = await createDoctorProfile({
          userId: user.id,
          clinicId: createdClinicId,
          name: user.user_metadata?.name || user.email || '',
          email: user.email,
          consultationFee: doctorProfile.consultationFee || 0,
          bio: doctorProfile.bio,
          departmentId: userDepartmentId
        });
        if (doctorError) throw doctorError;
      } else {
        // For admin-only users, ensure they have a clinic_members record without department_id
        const { error: adminMemberError } = await supabase
          .from('clinic_members')
          .upsert({
            user_id: user.id,
            clinic_id: createdClinicId,
            role: 'superadmin',
            department_id: null
          }, {
            onConflict: 'user_id,clinic_id'
          });

        if (adminMemberError) throw adminMemberError;
      }

      return createdClinicId;
    },
    onSuccess: (_, variables) => {
      toast.success(`Clinic "${variables.clinicDetails.name}" created successfully.`);
    },
    onError: (error: Error) => {
      logger.error("Error creating clinic:", error);
      showErrorToast(error, { title: "Error creating clinic" });
    },
  });
}
