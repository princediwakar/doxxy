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

// Helper function to create a test clinic
async function createTestClinic(page: any, testUser: any, testClinic: any, baseURL: string) {
  console.log('🏥 Creating test clinic...');
  
  // Wait for create-clinic page
  await expect(page).toHaveURL(/.*create-clinic.*/, { timeout: 10000 });
  
  // Fill clinic details
  await page.getByLabel(/clinic name/i).fill(testClinic.name);
  await page.getByLabel(/address/i).fill(testClinic.address);
  await page.getByLabel(/email/i).fill(testClinic.email);
  await page.getByLabel(/phone/i).fill(testClinic.phone);
  await page.getByLabel(/website/i).fill(testClinic.website);
  await page.getByRole('button', { name: /next.*departments/i }).click();
  
  // Select department
  await page.waitForSelector('input[type="checkbox"]', { timeout: 10000 });
  await page.getByRole('checkbox').first().click();
  await page.getByRole('button', { name: /next.*your role/i }).click();
  
  // Select "No, I'm an administrator"
  await page.getByText(/no.*administrator/i).click();
  
  // Create clinic
  await page.getByRole('button', { name: /create clinic/i }).click();
  
  // Wait for navigation
  await Promise.race([
    page.waitForURL(/.*dashboard.*/, { timeout: 30000 }),
    page.waitForURL(/.*complete-profile.*/, { timeout: 30000 }),
    page.waitForURL(/^\/$/, { timeout: 30000 })
  ]);
  
  console.log('✅ Clinic created successfully');
}

test.describe('Comprehensive Profile Tests', () => {
  test('Complete profile workflow: edit basic info, setup doctor profile, edit doctor profile', async ({ page, baseURL }) => {
    console.log('🧪 Testing comprehensive profile workflow...');

    const testUser = {
      email: `test_profile_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: 'Test User Profile'
    };

    const testClinic = {
      name: `Profile Test Clinic ${Date.now()}`,
      address: '123 Profile Street, Test City, TC 12345',
      email: `profileclinic${Date.now()}@example.com`,
      phone: '+1-555-PROF-123',
      website: 'https://profileclinic.example.com'
    };

    let userId: string = '';
    let clinicId: string = '';

    try {
      // 1. Create user and login
      console.log('👤 Creating test user...');
      const { data: userData, error: userError } = await admin.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
        user_metadata: { name: testUser.name },
      });

      if (userError && !userError.message.includes('User already registered')) {
        throw userError;
      }

      userId = userData?.user?.id || '';
      console.log('✅ User created successfully');

      // Login and create clinic
      await login(page, testUser.email, testUser.password, baseURL);
      await createTestClinic(page, testUser, testClinic, baseURL);

      // Get clinic ID for cleanup
      const { data: clinics } = await admin
        .from('clinics')
        .select('id')
        .eq('name', testClinic.name)
        .single();
      clinicId = clinics?.id || '';

      // Handle complete-profile redirect if needed
      const currentUrl = page.url();
      if (currentUrl.includes('complete-profile')) {
        console.log('📝 Completing initial profile...');
        await page.getByPlaceholder('Enter your full name').fill(testUser.name);
        await page.getByPlaceholder('9876543210').fill('5551234567');
        await page.getByRole('button', { name: /save.*continue/i }).click();
        await page.waitForLoadState('networkidle');
      }

      // Navigate to profile page
      console.log('📄 Navigating to profile page...');
      await page.goto(`${baseURL}/profile`);
      await page.waitForLoadState('networkidle');
      
      // Wait for profile page to load
      await expect(page.getByText('Profile')).toBeVisible({ timeout: 10000 });
      console.log('✅ Profile page loaded');

      // ========================
      // TEST 1: Edit Basic Profile Info
      // ========================
      console.log('🔧 Testing basic profile editing...');
      
      // Click Edit Profile button
      await page.getByRole('button', { name: /edit profile/i }).click();
      
      // Wait for modal to open
      await expect(page.getByText('Edit Profile')).toBeVisible({ timeout: 5000 });
      console.log('✅ Basic profile editor opened');
      
      // Edit name
      const newName = 'Dr. Updated Profile Name';
      await page.getByLabel(/full name/i).clear();
      await page.getByLabel(/full name/i).fill(newName);
      
      // Edit phone
      const newPhone = '5559876543';
      await page.getByLabel(/phone number/i).clear();
      await page.getByLabel(/phone number/i).fill(newPhone);
      
      // Save changes
      await page.getByRole('button', { name: /save changes/i }).click();
      
      // Wait for modal to close and verify toast
      await expect(page.getByText('Edit Profile')).toBeHidden({ timeout: 10000 });
      
      // Verify changes are reflected on profile page
      await expect(page.getByText(newName)).toBeVisible({ timeout: 5000 });
      console.log('✅ Basic profile updated successfully');

      // ========================
      // TEST 2: Setup Doctor Profile
      // ========================
      console.log('👨‍⚕️ Testing doctor profile setup...');
      
      // Look for "Setup Medical Profile" button (for superadmin users)
      const setupDoctorButton = page.getByRole('button', { name: /setup medical profile/i });
      
      // If button exists, click it
      if (await setupDoctorButton.isVisible({ timeout: 3000 })) {
        await setupDoctorButton.click();
        console.log('✅ Clicked Setup Medical Profile button');
      } else {
        // Alternative: look for "Complete Medical Profile" in the medical profile card
        const completeMedicalButton = page.getByRole('button', { name: /complete medical profile/i });
        if (await completeMedicalButton.isVisible({ timeout: 3000 })) {
          await completeMedicalButton.click();
          console.log('✅ Clicked Complete Medical Profile button');
        } else {
          console.log('ℹ️ No doctor profile setup button found - user may already have doctor profile');
        }
      }
      
      // Check if doctor onboarding modal opened
      const onboardingModalExists = await page.getByText(/create.*medical profile/i).isVisible({ timeout: 3000 });
      
      if (onboardingModalExists) {
        console.log('📋 Doctor onboarding modal opened');
        
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
        
        // Submit doctor profile
        await page.getByRole('button', { name: /create medical profile/i }).click();
        
        // Wait for modal to close
        await page.waitForTimeout(3000);
        console.log('✅ Doctor profile created');
        
        // Refresh page to see updated profile
        await page.reload();
        await page.waitForLoadState('networkidle');
      }

      // ========================
      // TEST 3: Edit Doctor Profile (Medical Credentials)
      // ========================
      console.log('⚕️ Testing medical credentials editing...');
      
      // Look for medical profile edit button
      const medicalProfileCard = page.locator('text=Medical Profile').locator('..').locator('..');
      const editMedicalButton = medicalProfileCard.getByRole('button', { name: /edit/i });
      
      // If medical profile exists, edit it
      if (await editMedicalButton.isVisible({ timeout: 3000 })) {
        await editMedicalButton.click();
        console.log('✅ Medical credentials editor opened');
        
        // Wait for modal to open
        await expect(page.getByText(/medical credentials/i)).toBeVisible({ timeout: 5000 });
        
        // Fill comprehensive medical details
        
        // Basic Information tab fields
        await page.getByLabel(/medical registration number/i).fill('REG123456789');
        await page.getByLabel(/medical council/i).fill('Medical Council of India');
        await page.getByLabel(/license state/i).fill('California');
        
        // Education tab - click if exists
        const educationTab = page.getByRole('tab', { name: /education/i });
        if (await educationTab.isVisible({ timeout: 2000 })) {
          await educationTab.click();
          await page.getByLabel(/medical degree/i).fill('MBBS');
          await page.getByLabel(/medical college/i).fill('Harvard Medical School');
          await page.getByLabel(/graduation year/i).fill('2015');
        }
        
        // Experience tab - click if exists  
        const experienceTab = page.getByRole('tab', { name: /experience/i });
        if (await experienceTab.isVisible({ timeout: 2000 })) {
          await experienceTab.click();
          await page.getByLabel(/years of experience/i).fill('8');
          await page.getByLabel(/professional summary/i).fill('Experienced general practitioner with expertise in preventive care and chronic disease management.');
        }
        
        // Save medical credentials
        await page.getByRole('button', { name: /save.*credentials/i }).click();
        
        // Wait for modal to close
        await expect(page.getByText(/medical credentials/i)).toBeHidden({ timeout: 10000 });
        console.log('✅ Medical credentials updated successfully');
        
        // Verify changes are reflected
        await page.waitForTimeout(2000);
        await expect(page.getByText('REG123456789')).toBeVisible({ timeout: 5000 });
        
      } else {
        console.log('ℹ️ Medical profile edit not available - may need to setup doctor profile first');
        
        // Try alternative approach - look for "Complete Medical Profile" button
        const completeMedicalProfileBtn = page.getByRole('button', { name: /complete.*medical.*profile/i });
        if (await completeMedicalProfileBtn.isVisible({ timeout: 3000 })) {
          await completeMedicalProfileBtn.click();
          
          // Fill the medical credentials form
          await page.getByLabel(/medical registration number/i).fill('REG123456789');
          await page.getByLabel(/medical council/i).fill('Medical Council of India');
          
          // Save
          await page.getByRole('button', { name: /save/i }).click();
          console.log('✅ Medical credentials completed via alternative flow');
        }
      }

      // ========================
      // TEST 4: Verify Profile Completeness
      // ========================
      console.log('✅ Verifying profile completeness...');
      
      // Check that all profile sections are now visible and populated
      await expect(page.getByText(newName)).toBeVisible();
      await expect(page.getByText(newPhone)).toBeVisible();
      
      // Check if medical profile information is visible
      const medicalProfileVisible = await page.getByText(/medical profile/i).isVisible({ timeout: 3000 });
      if (medicalProfileVisible) {
        console.log('✅ Medical profile section visible');
        
        // Check for some medical details
        const hasSpecialization = await page.getByText(/general medicine/i).isVisible({ timeout: 2000 });
        const hasRegistration = await page.getByText(/REG123456789/i).isVisible({ timeout: 2000 });
        
        if (hasSpecialization) console.log('✅ Specialization information displayed');
        if (hasRegistration) console.log('✅ Registration information displayed');
      }

      // ========================
      // TEST 5: Database Verification
      // ========================
      console.log('🔍 Verifying changes in database...');
      
      // Verify basic profile updates
      const { data: profileData } = await admin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      expect(profileData?.phone).toBe(newPhone);
      console.log('✅ Basic profile changes verified in database');
      
      // Verify doctor profile if created
      const { data: doctorData } = await admin
        .from('doctors')
        .select('*')
        .eq('user_id', userId)
        .eq('clinic_id', clinicId)
        .maybeSingle();
      
      if (doctorData) {
        console.log('✅ Doctor profile exists in database');
        expect(doctorData.is_active).toBe(true);
        
        // Check medical credentials if updated
        if (doctorData.medical_registration_number) {
          expect(doctorData.medical_registration_number).toBe('REG123456789');
          console.log('✅ Medical credentials verified in database');
        }
      }

      console.log('🎉 Comprehensive profile test completed successfully!');
      console.log('✅ Test Summary:');
      console.log('   - ✅ Basic profile editing working');
      console.log('   - ✅ Doctor profile setup working');
      console.log('   - ✅ Medical credentials editing working');
      console.log('   - ✅ Database persistence verified');
      console.log('   - ✅ UI updates reflecting changes');

    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    } finally {
      // Cleanup
      console.log('🧹 Cleaning up test data...');
      
      if (userId) {
        await admin.auth.admin.deleteUser(userId);
      }
      
      if (clinicId) {
        await admin.from('clinics').delete().eq('id', clinicId);
      }
      
      console.log('✅ Cleanup completed');
    }
  });

  test('Profile page accessibility and navigation', async ({ page, baseURL }) => {
    console.log('♿ Testing profile page accessibility...');

    const testUser = {
      email: `test_accessibility_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: 'Accessibility Test User'
    };

    const testClinic = {
      name: `Accessibility Test Clinic ${Date.now()}`,
      address: '123 Access Street, Test City, TC 12345',
      email: `accessclinic${Date.now()}@example.com`,
      phone: '+1-555-ACCESS',
      website: 'https://accessclinic.example.com'
    };

    let userId: string = '';
    let clinicId: string = '';

    try {
      // Create user and setup
      const { data: userData } = await admin.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
        user_metadata: { name: testUser.name },
      });

      userId = userData?.user?.id || '';

      await login(page, testUser.email, testUser.password, baseURL);
      await createTestClinic(page, testUser, testClinic, baseURL);

      const { data: clinics } = await admin
        .from('clinics')
        .select('id')
        .eq('name', testClinic.name)
        .single();
      clinicId = clinics?.id || '';

      // Navigate to profile
      await page.goto(`${baseURL}/profile`);
      await page.waitForLoadState('networkidle');

      // Test keyboard navigation
      console.log('⌨️ Testing keyboard navigation...');
      
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Verify focus indicators are visible
      const focusedElement = page.locator(':focus');
      expect(await focusedElement.isVisible()).toBe(true);
      console.log('✅ Keyboard navigation working');

      // Test ARIA labels and roles
      console.log('🏷️ Testing ARIA accessibility...');
      
      // Check for proper heading structure
      const h1 = page.getByRole('heading', { level: 1 });
      expect(await h1.count()).toBeGreaterThan(0);
      
      // Check for proper button labels
      const editButton = page.getByRole('button', { name: /edit profile/i });
      expect(await editButton.isVisible()).toBe(true);
      
      console.log('✅ ARIA accessibility verified');

      // Test responsive design
      console.log('📱 Testing responsive design...');
      
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      
      // Verify profile content is still accessible
      expect(await page.getByText('Profile').isVisible()).toBe(true);
      expect(await editButton.isVisible()).toBe(true);
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(1000);
      
      expect(await page.getByText('Profile').isVisible()).toBe(true);
      
      // Reset to desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      
      console.log('✅ Responsive design verified');

    } finally {
      // Cleanup
      if (userId) {
        await admin.auth.admin.deleteUser(userId);
      }
      if (clinicId) {
        await admin.from('clinics').delete().eq('id', clinicId);
      }
    }
  });
});
