import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

test.describe('Test Department Types API', () => {
  test('Direct API call to department_types', async () => {
    console.log('🔍 Testing direct API call to department_types...');

    // Test with anon key (what the frontend uses)
    const supabaseUrl = 'http://localhost:54321';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
    
    const client = createClient(supabaseUrl, anonKey);

    const { data, error } = await client.from('department_types').select('*');
    
    console.log('API Response:');
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('Error:', error);

    // The test should pass if we can read the data
    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data?.length).toBeGreaterThan(0);
    
    console.log(`✅ Found ${data?.length} department types`);
  });

  test('Test with authenticated user', async () => {
    console.log('🔍 Testing with authenticated user...');

    const supabaseUrl = 'http://localhost:54321';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create a test user
    const testUser = {
      email: `apitest_${Date.now()}@example.com`,
      password: 'Test!123'
    };

    const { data: userData, error: createError } = await admin.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true
    });

    if (createError && !createError.message.includes('User already registered')) {
      throw createError;
    }

    // Now test with authenticated client
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
    const authClient = createClient(supabaseUrl, anonKey);

    // Sign in the user
    const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });

    console.log('Sign in result:', signInError ? 'Error: ' + signInError.message : 'Success');

    if (!signInError) {
      // Try the query as authenticated user
      const { data, error } = await authClient.from('department_types').select('*');
      
      console.log('Authenticated API Response:');
      console.log('Data:', JSON.stringify(data, null, 2));
      console.log('Error:', error);

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.length).toBeGreaterThan(0);
      
      console.log(`✅ Authenticated user found ${data?.length} department types`);
    }

    // Cleanup
    if (userData?.user?.id) {
      await admin.auth.admin.deleteUser(userData.user.id);
    }
  });
}); 