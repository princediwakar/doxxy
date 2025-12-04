import { getSupabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const supabase = getSupabase();

export interface InvitationProcessingResult {
  hasInvitation: boolean;
  hasClinics: boolean;
  shouldNavigateToDashboard: boolean;
  shouldNavigateToCreateClinic: boolean;
  message?: string;
}

/**
 * Explicitly processes pending invitations during profile completion
 * This is called after profile completion to create clinic memberships
 */
export const processInvitationsOnProfileComplete = async (user: User, userName: string, userPhone?: string): Promise<InvitationProcessingResult> => {
  console.log('InvitationUtils: Processing invitations for user:', user.id, user.email);

  try {
    // Step 1: Check if user already has clinic memberships
    const { data: existingMemberships, error: membershipError } = await supabase
      .from('clinic_members')
      .select('id, clinic_id')
      .eq('user_id', user.id);

    if (membershipError) {
      console.error('InvitationUtils: Error checking existing memberships:', membershipError);
    }

    const hasClinics = existingMemberships && existingMemberships.length > 0;

    if (hasClinics) {
      console.log('InvitationUtils: User already has clinic memberships');
      return {
        hasInvitation: false,
        hasClinics: true,
        shouldNavigateToDashboard: true,
        shouldNavigateToCreateClinic: false,
        message: 'Welcome back! Loading your clinic data...'
      };
    }

    // Step 2: Look for pending invitations - check both by email and by invitation token
    let pendingInvitations = null;
    let invitationError = null;

    // First, check if there's a specific invitation token in localStorage
    const invitationToken = typeof localStorage !== 'undefined' ? localStorage.getItem('invitation_token') : null;

    if (invitationToken) {
      console.log('InvitationUtils: Found invitation token in localStorage:', invitationToken);
      const { data, error } = await supabase
        .from('pending_invitations')
        .select('*')
        .eq('invitation_token', invitationToken)
        .eq('email', user.email?.toLowerCase() || '')
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (!error && data) {
        pendingInvitations = [data]; // Convert to array for consistency
        console.log('InvitationUtils: Found invitation by token:', data);
      } else {
        console.log('InvitationUtils: No invitation found by token, falling back to email search');
        invitationError = error;
      }
    }

    // If no invitation found by token, search by email
    if (!pendingInvitations) {
      console.log('InvitationUtils: Searching for invitations by email:', user.email);
      const { data, error } = await supabase
        .from('pending_invitations')
        .select('*')
        .eq('email', user.email?.toLowerCase() || '')
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      pendingInvitations = data;
      invitationError = error;
    }

    if (invitationError) {
      console.error('InvitationUtils: Error checking pending invitations:', invitationError);
      return {
        hasInvitation: false,
        hasClinics: false,
        shouldNavigateToDashboard: false,
        shouldNavigateToCreateClinic: true
      };
    }

    if (!pendingInvitations || pendingInvitations.length === 0) {
      console.log('InvitationUtils: No pending invitations found');
      return {
        hasInvitation: false,
        hasClinics: false,
        shouldNavigateToDashboard: false,
        shouldNavigateToCreateClinic: true
      };
    }

    // Step 3: Process the first (most recent) invitation
    const invitation = pendingInvitations[0];
    console.log('InvitationUtils: Processing invitation:', invitation);

    // Step 3a: Ensure profile exists before creating clinic membership
    // This handles the race condition where profile creation might be delayed
    let profileExists = false;
    
    // First, check if profile exists
    const { error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileCheckError && profileCheckError.code === 'PGRST116') {
      // Profile doesn't exist, create it first
      console.log('InvitationUtils: Profile not found, creating it first');
      const { error: profileCreateError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name: userName,
          email: user.email,
          phone: userPhone || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileCreateError) {
        // Handle duplicate email constraint gracefully (profile might exist with same email)
        if (profileCreateError.code === '23505' && profileCreateError.message.includes('unique_email')) {
          console.log('InvitationUtils: Profile with this email already exists, continuing...');
          profileExists = true;
        } else {
          console.error('InvitationUtils: Error creating profile:', profileCreateError);
          throw new Error(`Failed to create profile: ${profileCreateError.message}`);
        }
      } else {
        console.log('InvitationUtils: Profile created successfully');
        profileExists = true;
      }
    } else if (profileCheckError) {
      console.error('InvitationUtils: Error checking profile:', profileCheckError);
      throw new Error(`Failed to verify profile: ${profileCheckError.message}`);
    } else {
      console.log('InvitationUtils: Profile already exists');
      profileExists = true;
    }

    // Double-check profile exists before proceeding
    if (!profileExists) {
      // Wait a bit for potential eventual consistency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { error: finalCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (finalCheckError) {
        console.error('InvitationUtils: Profile still not found after creation attempt');
        throw new Error('Failed to ensure profile exists before creating clinic membership');
      }
      console.log('InvitationUtils: Profile confirmed to exist');
    }

    // Step 3b: Create clinic membership now that profile exists
    console.log('InvitationUtils: Attempting to create clinic membership with:', {
      user_id: user.id,
      clinic_id: invitation.clinic_id,
      role: invitation.role,
      department_id: invitation.department_id
    });

    const { data: membershipData, error: membershipCreateError } = await supabase
      .from('clinic_members')
      .insert({
        user_id: user.id,
        clinic_id: invitation.clinic_id,
        role: invitation.role,
        department_id: invitation.department_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (membershipCreateError) {
      console.error('InvitationUtils: Error creating clinic membership:', membershipCreateError);
      console.error('InvitationUtils: Full error details:', JSON.stringify(membershipCreateError, null, 2));
      throw new Error(`Failed to create clinic membership: ${membershipCreateError.message}`);
    }

    console.log('InvitationUtils: Clinic membership created successfully:', membershipData);

    // Create doctor profile if role is doctor
    if (invitation.role === 'doctor') {
      console.log('InvitationUtils: Creating doctor profile for user:', user.id);
      const { data: doctorData, error: doctorCreateError } = await supabase
        .from('doctors')
        .insert({
          user_id: user.id,
          clinic_id: invitation.clinic_id,
          name: userName,
          email: user.email || '',
          phone: userPhone || null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (doctorCreateError) {
        console.error('InvitationUtils: Error creating doctor profile:', doctorCreateError);
        console.error('InvitationUtils: Full doctor profile error details:', JSON.stringify(doctorCreateError, null, 2));
        // Don't fail the whole process for doctor profile creation
      } else {
        console.log('InvitationUtils: Doctor profile created successfully:', doctorData);
      }
    }

    // Mark invitation as accepted
    console.log('InvitationUtils: Attempting to mark invitation as accepted:', invitation.id);
    const { error: acceptError } = await supabase
      .from('pending_invitations')
      .update({
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', invitation.id);

    if (acceptError) {
      console.error('InvitationUtils: Error marking invitation as accepted:', acceptError);
      console.error('InvitationUtils: Full error details:', JSON.stringify(acceptError, null, 2));
      // Don't fail the whole process for this
    } else {
      console.log('InvitationUtils: Successfully marked invitation as accepted');
    }

    console.log('InvitationUtils: Successfully processed invitation');

    // Clean up localStorage after successful invitation processing
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('invitation_token');
      localStorage.removeItem('invitation_data');
      console.log('InvitationUtils: Cleared invitation data from localStorage');
    }

    return {
      hasInvitation: true,
      hasClinics: true,
      shouldNavigateToDashboard: true,
      shouldNavigateToCreateClinic: false,
      message: `Welcome to your clinic! You've been added as a ${invitation.role}.`
    };

  } catch (error) {
    console.error('InvitationUtils: Exception during invitation processing:', error);
    return {
      hasInvitation: false,
      hasClinics: false,
      shouldNavigateToDashboard: false,
      shouldNavigateToCreateClinic: true,
      message: 'Failed to process invitation. Please contact support.'
    };
  }
};

/**
 * Waits for clinic membership to be created (for real-time processing)
 */
export const waitForClinicMembership = async (
  user: User,
  timeoutMs: number = 10000
): Promise<boolean> => {
  console.log('InvitationUtils: Waiting for clinic membership creation');
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    try {
      const { data: memberships } = await supabase
        .from('clinic_members')
        .select('id')
        .eq('user_id', user.id);

      if (memberships && memberships.length > 0) {
        console.log('InvitationUtils: Clinic membership found!');
        return true;
      }

      // Wait 500ms before checking again
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('InvitationUtils: Error while waiting for membership:', error);
      break;
    }
  }

  console.log('InvitationUtils: Timeout waiting for clinic membership');
  return false;
};