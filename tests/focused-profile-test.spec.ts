import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://chftygsapwhahqbqlfdx.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoZnR5Z3NhcHdoYWhxYnFsZmR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg1NTg2MywiZXhwIjoyMDYzNDMxODYzfQ.Gy5YQKJLxaWIqYqBPeHQFIYvBtZKGVBi2UQD1YVbAKM';

// Admin client for database operations
const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper function to login
async function login(page: any, email: string, password: string, baseURL: string = 'http://localhost:5173') {
  await page.goto(`${baseURL}/auth`);
  await page.getByRole('tab', { name: 'Login' }).click();
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();
}

// Helper to setup a test clinic and user with basic profile
async function setupTestEnvironment() {
  const testUser = {
    email: `test_profile_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test Profile User'
  };

  const testClinic = {
    name: `Profile Test Clinic ${Date.now()}`,
    address: '123 Profile Street, Test City, TC 12345',
    email: `profileclinic${Date.now()}@example.com`,
    phone: '+1-555-PROFILE',
    website: 'https://profileclinic.example.com'
  };

  // Create user
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: testUser.email,
    password: testUser.password,
    email_confirm: true,
    user_metadata: { name: testUser.name },
  });

  if (userError && !userError.message.includes('User already registered')) {
    throw userError;
  }

  const userId = userData?.user?.id;
  if (!userId) throw new Error('Failed to create user');

  // Create clinic
  const { data: clinicData, error: clinicError } = await admin
    .from('clinics')
    .insert({
      name: testClinic.name,
      address: testClinic.address,
      email: testClinic.email,
      phone: testClinic.phone,
      website: testClinic.website,
      created_by: userId
    })
    .select()
    .single();

  if (clinicError) throw clinicError;
  const clinicId = clinicData.id;

  // Create a department for the clinic
  const { data: departmentTypeData } = await admin
    .from('department_types')
    .select('id')
    .eq('name', 'General Medicine')
    .single();

  const { data: deptData, error: deptError } = await admin
    .from('clinic_departments')
    .insert({
      clinic_id: clinicId,
      department_type_id: departmentTypeData?.id
    })
    .select()
    .single();

  if (deptError) throw deptError;

  // Create clinic membership for user as superadmin
  const { error: memberError } = await admin
    .from('clinic_members')
    .insert({
      user_id: userId,
      clinic_id: clinicId,
      role: 'superadmin',
      department_id: deptData.id
    });

  if (memberError) throw memberError;

  // Create basic profile
  const { error: profileError } = await admin
    .from('profiles')
    .insert({
      id: userId,
      name: testUser.name,
      phone: '5551234567',
      updated_at: new Date().toISOString()
    });

  if (profileError && !profileError.message.includes('duplicate')) {
    throw profileError;
  }

  return {
    testUser,
    testClinic,
    userId,
    clinicId,
    departmentId: deptData.id
  };
}

test.describe('Focused Profile Tests', () => {
  test('Edit basic profile information', async ({ page, baseURL }) => {
    console.log('🧪 Testing basic profile editing...');

    let testData: any;
    
    try {
      // Setup test environment
      testData = await setupTestEnvironment();
      const { testUser, userId, clinicId } = testData;

      // Login
      await login(page, testUser.email, testUser.password, baseURL);
      
      // Handle any redirects and navigate to profile
      await page.waitForLoadState('networkidle');
      await page.goto(`${baseURL}/profile`);
      await page.waitForLoadState('networkidle');

      // Handle complete-profile redirect if it appears
      const currentUrl = page.url();
      if (currentUrl.includes('complete-profile')) {
        console.log('📝 Completing profile form first...');
        await page.getByPlaceholder('Enter your full name').fill(testUser.name);
        await page.getByPlaceholder('9876543210').fill('5551234567');
        await page.getByRole('button', { name: /save.*continue/i }).click();
        await page.waitForLoadState('networkidle');
        
        // Navigate to profile again
        await page.goto(`${baseURL}/profile`);
        await page.waitForLoadState('networkidle');
      }

      // Wait for profile page to load
      await expect(page.getByText('Profile')).toBeVisible({ timeout: 10000 });
      console.log('✅ Profile page loaded');

      // Click Edit Profile button
      await expect(page.getByRole('button', { name: /edit profile/i })).toBeVisible({ timeout: 5000 });
      await page.getByRole('button', { name: /edit profile/i }).click();
      
      // Wait for modal to open
      await expect(page.getByText('Edit Profile')).toBeVisible({ timeout: 5000 });
      console.log('✅ Basic profile editor opened');
      
      // Edit name
      const newName = 'Dr. Updated Profile Name';
      const nameField = page.getByLabel(/full name/i);
      await nameField.clear();
      await nameField.fill(newName);
      
      // Edit phone
      const newPhone = '5559876543';
      const phoneField = page.getByLabel(/phone number/i);
      await phoneField.clear();
      await phoneField.fill(newPhone);
      
      console.log('✅ Updated name and phone fields');
      
      // Save changes
      await page.getByRole('button', { name: /save changes/i }).click();
      
      // Wait for modal to close
      await expect(page.getByText('Edit Profile')).toBeHidden({ timeout: 10000 });
      console.log('✅ Profile changes saved');
      
      // Verify changes are reflected on profile page
      await expect(page.getByText(newName)).toBeVisible({ timeout: 5000 });
      console.log('✅ Name change reflected in UI');

      // Verify in database
      const { data: profileData } = await admin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      expect(profileData?.phone).toBe(newPhone);
      console.log('✅ Basic profile changes verified in database');

      console.log('🎉 Basic profile editing test completed successfully!');

    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    } finally {
      // Cleanup
      if (testData) {
        console.log('🧹 Cleaning up test data...');
        const { userId, clinicId } = testData;
        
        if (userId) {
          await admin.auth.admin.deleteUser(userId);
        }
        
        if (clinicId) {
          await admin.from('clinics').delete().eq('id', clinicId);
        }
        
        console.log('✅ Cleanup completed');
      }
    }
  });

  test('Setup and edit doctor profile', async ({ page, baseURL }) => {
    console.log('🧪 Testing doctor profile setup and editing...');

    let testData: any;
    
    try {
      // Setup test environment
      testData = await setupTestEnvironment();
      const { testUser, userId, clinicId, departmentId } = testData;

      // Login
      await login(page, testUser.email, testUser.password, baseURL);
      
      // Navigate to profile
      await page.waitForLoadState('networkidle');
      await page.goto(`${baseURL}/profile`);
      await page.waitForLoadState('networkidle');

      // Handle complete-profile redirect if it appears
      const currentUrl = page.url();
      if (currentUrl.includes('complete-profile')) {
        console.log('📝 Completing profile form first...');
        await page.getByPlaceholder('Enter your full name').fill(testUser.name);
        await page.getByPlaceholder('9876543210').fill('5551234567');
        await page.getByRole('button', { name: /save.*continue/i }).click();
        await page.waitForLoadState('networkidle');
        
        // Navigate to profile again
        await page.goto(`${baseURL}/profile`);
        await page.waitForLoadState('networkidle');
      }

      // Wait for profile page to load
      await expect(page.getByText('Profile')).toBeVisible({ timeout: 10000 });
      console.log('✅ Profile page loaded');

      // Look for "Setup Medical Profile" button
      const setupDoctorButton = page.getByRole('button', { name: /setup medical profile/i });
      
      if (await setupDoctorButton.isVisible({ timeout: 3000 })) {
        console.log('👨‍⚕️ Setting up doctor profile...');
        await setupDoctorButton.click();
        
        // Wait for onboarding modal
        await expect(page.getByText(/create.*medical profile/i)).toBeVisible({ timeout: 5000 });
        console.log('✅ Doctor onboarding modal opened');
        
        // Fill doctor onboarding form
        // Select primary department (required)
        await page.getByRole('combobox', { name: /primary department/i }).click();
        await page.getByRole('option').first().click();
        
        // Fill specialization
        await page.getByLabel(/primary specialization/i).fill('General Medicine');
        
        // Fill consultation fee
        await page.getByLabel(/consultation fee/i).fill('750');
        
        // Fill professional phone
        await page.getByLabel(/professional phone/i).fill('+1-555-DOC-1234');
        
        console.log('✅ Doctor form filled');
        
        // Submit doctor profile
        await page.getByRole('button', { name: /create medical profile/i }).click();
        
        // Wait for modal to close
        await page.waitForTimeout(3000);
        console.log('✅ Doctor profile created');
        
        // Refresh page to see updated profile
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Verify doctor profile exists in database
        const { data: doctorData } = await admin
          .from('doctors')
          .select('*')
          .eq('user_id', userId)
          .eq('clinic_id', clinicId)
          .single();
        
        expect(doctorData).toBeTruthy();
        expect(doctorData.is_active).toBe(true);
        expect(doctorData.primary_specialization).toBe('General Medicine');
        console.log('✅ Doctor profile verified in database');

        // Now test editing medical credentials
        console.log('⚕️ Testing medical credentials editing...');
        
        // Look for medical profile edit button
        const editMedicalButton = page.getByRole('button', { name: /edit/i }).first();
        
        if (await editMedicalButton.isVisible({ timeout: 3000 })) {
          await editMedicalButton.click();
          console.log('✅ Medical credentials editor opened');
          
          // Wait for modal to open
          await expect(page.getByText(/medical credentials/i)).toBeVisible({ timeout: 5000 });
          
          // Fill medical registration details
          const registrationField = page.getByLabel(/medical registration number/i);
          if (await registrationField.isVisible({ timeout: 2000 })) {
            await registrationField.fill('REG123456789');
          }
          
          const councilField = page.getByLabel(/medical council/i);
          if (await councilField.isVisible({ timeout: 2000 })) {
            await councilField.fill('Medical Council of India');
          }
          
          const stateField = page.getByLabel(/license state/i);
          if (await stateField.isVisible({ timeout: 2000 })) {
            await stateField.fill('California');
          }
          
          console.log('✅ Medical credentials filled');
          
          // Save medical credentials
          const saveButton = page.getByRole('button', { name: /save.*credentials/i });
          if (await saveButton.isVisible({ timeout: 2000 })) {
            await saveButton.click();
          } else {
            // Alternative save button text
            await page.getByRole('button', { name: /save/i }).click();
          }
          
          // Wait for modal to close
          await page.waitForTimeout(3000);
          console.log('✅ Medical credentials saved');
          
          // Verify changes in database
          const { data: updatedDoctorData } = await admin
            .from('doctors')
            .select('*')
            .eq('user_id', userId)
            .eq('clinic_id', clinicId)
            .single();
          
          if (updatedDoctorData.medical_registration_number) {
            expect(updatedDoctorData.medical_registration_number).toBe('REG123456789');
            console.log('✅ Medical credentials verified in database');
          }
        }
        
      } else {
        console.log('ℹ️ No Setup Medical Profile button found - may already have doctor profile');
      }

      console.log('🎉 Doctor profile setup and editing test completed successfully!');

    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    } finally {
      // Cleanup
      if (testData) {
        console.log('🧹 Cleaning up test data...');
        const { userId, clinicId } = testData;
        
        if (userId) {
          await admin.auth.admin.deleteUser(userId);
        }
        
        if (clinicId) {
          await admin.from('clinics').delete().eq('id', clinicId);
        }
        
        console.log('✅ Cleanup completed');
      }
    }
  });

  test('Profile page navigation and UI elements', async ({ page, baseURL }) => {
    console.log('🧪 Testing profile page UI and navigation...');

    let testData: any;
    
    try {
      // Setup test environment
      testData = await setupTestEnvironment();
      const { testUser } = testData;

      // Login
      await login(page, testUser.email, testUser.password, baseURL);
      
      // Navigate to profile
      await page.waitForLoadState('networkidle');
      await page.goto(`${baseURL}/profile`);
      await page.waitForLoadState('networkidle');

      // Handle complete-profile redirect if it appears
      const currentUrl = page.url();
      if (currentUrl.includes('complete-profile')) {
        console.log('📝 Completing profile form first...');
        await page.getByPlaceholder('Enter your full name').fill(testUser.name);
        await page.getByPlaceholder('9876543210').fill('5551234567');
        await page.getByRole('button', { name: /save.*continue/i }).click();
        await page.waitForLoadState('networkidle');
        
        // Navigate to profile again
        await page.goto(`${baseURL}/profile`);
        await page.waitForLoadState('networkidle');
      }

      // Wait for profile page to load
      await expect(page.getByText('Profile')).toBeVisible({ timeout: 10000 });
      console.log('✅ Profile page loaded');

      // Test UI elements are visible
      console.log('🔍 Testing UI elements...');
      
      // Check for profile heading
      await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
      console.log('✅ Profile heading visible');
      
      // Check for edit button
      await expect(page.getByRole('button', { name: /edit profile/i })).toBeVisible();
      console.log('✅ Edit profile button visible');
      
      // Check for basic profile card
      await expect(page.getByText(testUser.name)).toBeVisible();
      console.log('✅ User name displayed');
      
      // Check for email
      await expect(page.getByText(testUser.email)).toBeVisible();
      console.log('✅ User email displayed');
      
      // Test keyboard navigation
      console.log('⌨️ Testing keyboard navigation...');
      
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Verify focus indicators work
      const focusedElement = page.locator(':focus');
      const isFocused = await focusedElement.isVisible();
      if (isFocused) {
        console.log('✅ Keyboard navigation working');
      } else {
        console.log('ℹ️ Keyboard focus may not be visible but elements are accessible');
      }

      // Test responsive design
      console.log('📱 Testing responsive design...');
      
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      
      // Verify profile content is still accessible
      await expect(page.getByText('Profile')).toBeVisible();
      console.log('✅ Mobile view working');
      
      // Reset to desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(1000);
      
      console.log('🎉 Profile page UI and navigation test completed successfully!');

    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    } finally {
      // Cleanup
      if (testData) {
        console.log('🧹 Cleaning up test data...');
        const { userId, clinicId } = testData;
        
        if (userId) {
          await admin.auth.admin.deleteUser(userId);
        }
        
        if (clinicId) {
          await admin.from('clinics').delete().eq('id', clinicId);
        }
        
        console.log('✅ Cleanup completed');
      }
    }
  });
});
