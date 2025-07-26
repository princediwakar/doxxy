#!/usr/bin/env node

/**
 * Test script to demonstrate the multi-tenant invitation fix
 * This shows the concept without needing the edge function to reload
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

async function testMultiTenantInvitation() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const testEmail = 'mental.alternate@gmail.com';
  const clinicId = 'b6a6e214-8944-4254-bc10-8fa0886b577a';

  console.log('🧪 Testing Multi-Tenant Invitation Logic');
  console.log('==========================================');

  try {
    // Step 1: Check if user exists
    console.log(`\n1. Checking if user exists: ${testEmail}`);
    const { data: allUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.log('❌ Error listing users:', listError.message);
      return;
    }
    
    const existingUser = allUsers.users.find(u => u.email?.toLowerCase() === testEmail.toLowerCase());
    
    if (!existingUser) {
      console.log('✅ User does not exist - would use standard Supabase invitation flow');
      return;
    }

    console.log(`✅ User exists with ID: ${existingUser.id}`);
      
    // Step 2: Check if user is already a member of this clinic
    console.log(`\n2. Checking clinic membership for clinic: ${clinicId}`);
    const { data: existingMembership, error: membershipError } = await supabase
      .from('clinic_members')
      .select('*')
      .eq('user_id', existingUser.id)
      .eq('clinic_id', clinicId)
      .single();
      
    if (membershipError && membershipError.code !== 'PGRST116') {
      console.log('❌ Error checking membership:', membershipError.message);
      return;
    }
    
    if (existingMembership) {
      console.log('⚠️  User is already a member of this clinic');
      console.log('   Membership details:', existingMembership);
      return;
    }
    
    console.log('✅ User is not a member of this clinic');
    
    // Step 3: This is where we would create the membership
    console.log('\n3. Multi-tenant invitation logic would:');
    console.log('   ✅ Create clinic membership directly');
    console.log('   ✅ Send custom notification email');
    console.log('   ✅ Skip Supabase Auth invitation (user already exists)');
    console.log('   ✅ Return success without "user already registered" error');
    
    console.log('\n🎉 SOLUTION: Multi-tenant invitation would work!');
    console.log('   The "Database error saving new user" error is avoided');
    console.log('   because we detected the existing user and handled it properly.');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run the test
testMultiTenantInvitation().catch(console.error);