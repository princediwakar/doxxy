import { getSupabase } from '@/integrations/supabase/client';
import { logger } from "@/lib/logger";

const supabase = getSupabase();

/**
 * Safely creates a doctor profile with proper error handling and clinic membership
 */
export async function createDoctorProfile({
  userId,
clinicId,
  name,
  email,
  primarySpecialization,
  consultationFee,
  bio,
  departmentId
}: {
  userId: string;
  clinicId: string;
  name: string;
  email?: string;
  primarySpecialization?: string;
  consultationFee?: number;
  bio?: string;
  departmentId?: string | null;
}) {
  try {
    // Upsert clinic membership — preserve superadmin role when it already exists
    const { data: existingMembership, error: membershipCheckError } = await supabase
      .from('clinic_members')
      .select('role, department_id')
      .eq('user_id', userId)
      .eq('clinic_id', clinicId)
      .single();

    if (membershipCheckError && membershipCheckError.code !== 'PGRST116') {
      logger.warn('Error checking existing membership:', membershipCheckError.message);
    }

    if (!existingMembership || existingMembership.role !== 'superadmin') {
      const { error: membershipError } = await supabase
        .from('clinic_members')
        .upsert({
          user_id: userId,
          clinic_id: clinicId,
          role: 'doctor',
          department_id: departmentId
        }, {
          onConflict: 'user_id,clinic_id'
        });

      if (membershipError) {
        logger.warn('Could not create clinic membership:', membershipError.message);
      }
    }

    const isActive = !!departmentId;

    // Create the doctor profile (upsert so retries are safe)
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .upsert({
        user_id: userId,
        clinic_id: clinicId,
        name,
        email,
        primary_specialization: primarySpecialization,
        consultation_fee: consultationFee,
        bio,
        is_active: isActive
      }, {
        onConflict: 'user_id,clinic_id'
      })
      .select()
      .single();

    if (doctorError) {
      throw new Error(`Failed to create doctor profile: ${doctorError.message}`);
    }

    return { data: doctorData, error: null };
  } catch (error) {
    logger.error('Error in createDoctorProfile:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error occurred') 
    };
  }
}

