import { getSupabase } from '@/integrations/supabase/client';

const supabase = getSupabase();

/**
 * Safely creates a doctor profile with proper error handling and clinic membership
 */
export async function createDoctorProfile({
  userId,
  clinicId,
  name,
  email,
  primarySpecialization = 'General Medicine',
  consultationFee,
  availability = 'Mon-Fri 9:00 AM - 5:00 PM',
  bio,
  departmentId
}: {
  userId: string;
  clinicId: string;
  name: string;
  email?: string;
  primarySpecialization?: string;
  consultationFee?: number;
  availability?: string;
  bio?: string;
  departmentId?: string | null;
}) {
  try {
    // Check if the user already has a clinic membership and their current role
    const { data: existingMembership, error: membershipCheckError } = await supabase
      .from('clinic_members')
      .select('role, department_id')
      .eq('user_id', userId)
      .eq('clinic_id', clinicId)
      .single();

    if (membershipCheckError && membershipCheckError.code !== 'PGRST116') {
      console.warn('Error checking existing membership:', membershipCheckError.message);
    }

    // Only update membership if the user doesn't exist or isn't a superadmin
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
        console.warn('Could not create clinic membership:', membershipError.message);
      }
    } else if (departmentId) {
      // If user is a superadmin, just update their department_id
      // BUT keep their role as superadmin
      const { error: updateError } = await supabase
        .from('clinic_members')
        .update({ 
          department_id: departmentId,
          role: 'superadmin' // Ensure role stays as superadmin
        })
        .eq('user_id', userId)
        .eq('clinic_id', clinicId);

      if (updateError) {
        console.warn('Could not update department_id:', updateError.message);
      }
    }

    // Wait a bit for the membership to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Now create the doctor profile
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .insert({
        user_id: userId,
        clinic_id: clinicId,
        name,
        email,
        primary_specialization: primarySpecialization,
        consultation_fee: consultationFee,
        availability,
        bio,
        is_active: true
      })
      .select()
      .single();

    if (doctorError) {
      throw new Error(`Failed to create doctor profile: ${doctorError.message}`);
    }

    return { data: doctorData, error: null };
  } catch (error) {
    console.error('Error in createDoctorProfile:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error occurred') 
    };
  }
}

/**
 * Gets all doctors for a clinic with proper error handling
 */
export async function getDoctorsForClinic(clinicId: string) {
  try {
    // Try using the RPC function first
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_doctors_by_clinic', { clinic_id: clinicId });

    if (!rpcError && rpcData) {
      return { data: rpcData, error: null };
    }

    // Fallback to direct query if RPC fails
    console.warn('RPC function failed, using fallback query:', rpcError?.message);
    
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('doctors')
      .select(`
        *,
        profiles!doctors_user_id_fkey(name, email, phone),
        clinic_members!doctors_user_id_fkey(role)
      `)
      .eq('clinic_id', clinicId)
      .eq('is_active', true);

    if (fallbackError) {
      throw new Error(`Failed to fetch doctors: ${fallbackError.message}`);
    }

    // Transform the data to match the expected format
    const transformedData = fallbackData?.map(doctor => ({
      id: doctor.id,
      user_id: doctor.user_id,
      name: doctor.name || doctor.profiles?.name || 'Unknown',
      email: doctor.email || doctor.profiles?.email || '',
      phone: doctor.phone || doctor.profiles?.phone || '',
      bio: doctor.bio,
      created_at: doctor.created_at,
      role: 'doctor',
      department_name: 'General Medicine',
      department_id: null,
      is_active: doctor.is_active,
      primary_specialization: doctor.primary_specialization,
      consultation_fee: doctor.consultation_fee
    })) || [];

    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error in getDoctorsForClinic:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error : new Error('Unknown error occurred') 
    };
  }
} 