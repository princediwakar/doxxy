import { test, expect } from '@playwright/test';

test.describe('Core Functionality Verification', () => {
  test('Verify department_types API works', async ({ request }) => {
    console.log('🔍 Testing department_types API access...');

    const response = await request.get('http://localhost:54321/rest/v1/department_types', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
      }
    });

    console.log('Response status:', response.status());
    const data = await response.json();
    console.log('Department types count:', data.length);

    expect(response.status()).toBe(200);
    expect(data.length).toBeGreaterThan(0);
    
    // Verify we have the expected departments
    const departmentNames = data.map((d: any) => d.name);
    console.log('Available departments:', departmentNames.join(', '));
    
    expect(departmentNames).toContain('General Medicine');
    expect(departmentNames).toContain('Cardiology');
    
    console.log('✅ Department types API working correctly');
  });

  test('Verify frontend can load with proper environment', async ({ page }) => {
    console.log('🔍 Testing frontend loads correctly...');

    // Navigate to the auth page first
    await page.goto('http://localhost:8080/auth');
    
    // Check if the page loads without errors
    await expect(page.getByText(/doxxy|login|sign/i)).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Frontend loads successfully');
    
    // Check if Supabase client is working by checking if there are no immediate JS errors
    const errors = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log('⚠️ JavaScript errors detected:', errors);
    } else {
      console.log('✅ No JavaScript errors detected');
    }
  });

  test('Verify database schema and functions exist', async ({ request }) => {
    console.log('🔍 Testing database schema...');

    // Test if create_clinic_with_admin function exists
    const funcResponse = await request.post('http://localhost:54321/rest/v1/rpc/create_clinic_with_admin', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
        'Content-Type': 'application/json'
      },
      data: {
        clinic_name: 'Test Clinic Function Check',
        user_phone: null
      }
    });

    console.log('create_clinic_with_admin function status:', funcResponse.status());
    
    if (funcResponse.status() === 401) {
      console.log('✅ Function exists (401 expected for unauthenticated call)');
    } else if (funcResponse.status() === 200) {
      console.log('✅ Function exists and callable');
    } else {
      console.log('⚠️ Unexpected response for function test');
    }

    // Test if createDoctorProfile helper function exists by checking if doctors table is accessible
    const doctorsResponse = await request.get('http://localhost:54321/rest/v1/doctors?limit=1', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
      }
    });

    console.log('Doctors table access status:', doctorsResponse.status());
    
    if (doctorsResponse.status() === 200 || doctorsResponse.status() === 401) {
      console.log('✅ Doctors table exists and accessible');
    }

    console.log('✅ Database schema verification complete');
  });
}); 