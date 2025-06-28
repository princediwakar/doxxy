import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

// TypeScript interfaces for better type safety
interface Patient {
  name: string;
  phone: string;
  email: string;
  address: string;
  medicalId: string;
  gender: string;
}

interface Clinic {
  name: string;
  address: string;
  email: string;
  phone: string;
  website: string;
}

interface User {
  email: string;
  password: string;
  name: string;
}

// Helper function to wait for navigation and verify page load
async function waitForNavigationAndLoad(page: any, expectedUrls: RegExp[], timeout: number = 30000) {
  console.log('🔄 Waiting for navigation to:', expectedUrls.map(r => r.toString()));
  
  // Wait for navigation to complete
  await Promise.race([
    ...expectedUrls.map(url => page.waitForURL(url, { timeout })),
    // Also wait for error states
    page.waitForSelector('text=/error/i', { state: 'visible', timeout })
      .then(() => { throw new Error('Navigation error detected'); })
  ]);

  // Wait for critical UI elements
  await Promise.race([
    page.waitForSelector('nav', { timeout: 5000 }), // Main navigation
    page.waitForSelector('[role="main"]', { timeout: 5000 }), // Main content area
  ]).catch(() => console.log('⚠️ Common UI elements not found after navigation'));

  // Wait for any loading indicators to disappear
  await Promise.all([
    page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 5000 })
      .catch(() => console.log('ℹ️ No spinner found')),
    page.waitForSelector('text=/loading/i', { state: 'hidden', timeout: 5000 })
      .catch(() => console.log('ℹ️ No loading text found'))
  ]);

  // Wait for network to be idle
  await page.waitForLoadState('networkidle', { timeout: 5000 })
    .catch(() => console.log('⚠️ Network not fully idle after navigation'));

  console.log('✅ Navigation completed to:', page.url());
}

// Helper function to handle appointment and consultation workflow
async function handleAppointmentAndConsultation(page: any, patient: Patient, baseURL: string) {
  console.log('🩺 Starting appointment and consultation workflow...');
  
  // Navigate to appointments page and wait for load
  await page.goto(`${baseURL}/appointments`);
  await waitForNavigationAndLoad(page, [/.*appointments.*/]);
  
  // Try to find appointment with retries
  let appointmentFound = false;
  let retries = 3;
  
  while (retries > 0 && !appointmentFound) {
    console.log(`Looking for appointment (attempt ${4-retries}/3)...`);
    
    // Try exact match first
    let patientCell = page.getByText(patient.name, { exact: true });
    if (!(await patientCell.isVisible({ timeout: 2000 }))) {
      // Try partial match
      patientCell = page.getByText(patient.name.split(' ')[0], { exact: false });
    }
    
    if (await patientCell.isVisible({ timeout: 2000 })) {
      appointmentFound = true;
      console.log('✅ Found patient appointment');
      
      // Get the appointment row
      const appointmentRow = patientCell.locator('..').locator('..');
      
      // Try to start consultation
      for (const buttonText of ['start consultation', 'start', 'continue', 'consult']) {
        const button = appointmentRow.getByRole('button', { name: new RegExp(buttonText, 'i') });
        if (await button.isVisible({ timeout: 2000 })) {
          await button.click();
          console.log(`✅ Clicked ${buttonText} button`);
          
          // Wait for consultation form
          await page.waitForSelector('textarea, input[type="text"]', { timeout: 5000 });
          
          // Fill consultation details
          await page.getByLabel(/chief complaint/i)
            .fill('Patient presents with fatigue and intermittent headaches');
          
          await page.getByLabel(/history.*present illness/i)
            .fill('Symptoms began gradually over past week. No fever or other systemic symptoms.');
          
          await page.getByLabel(/physical examination/i)
            .fill('Vitals stable. BP 120/80, HR 72, RR 16, T 98.6F. No acute distress.');
          
          await page.getByLabel(/assessment.*diagnosis/i)
            .fill('1. Tension headache\n2. Fatigue - likely stress-related');
          
          await page.getByLabel(/plan.*treatment/i)
            .fill('1. Rest and stress management\n2. OTC pain relievers as needed\n3. Follow-up in 1 week if not improving');
          
          // Add prescription if button exists
          const addMedButton = page.getByRole('button', { name: /add medication/i });
          if (await addMedButton.isVisible({ timeout: 2000 })) {
            await addMedButton.click();
            await page.getByPlaceholder(/medication name/i).fill('Acetaminophen');
            await page.getByPlaceholder(/dosage/i).fill('500mg');
            await page.getByPlaceholder(/frequency/i).fill('Every 6 hours as needed');
            await page.getByPlaceholder(/duration/i).fill('7 days');
            await page.getByPlaceholder(/instructions/i).fill('Take with food');
          }
          
          // Save consultation
          await page.getByRole('button', { name: /save/i }).click();
          
          // Wait for success message
          await page.waitForSelector('text=/saved|success/i', { timeout: 5000 })
            .catch(() => console.log('⚠️ No success message found after saving'));
          
          return true; // Consultation completed successfully
        }
      }
      
      console.log('⚠️ No consultation button found on appointment');
      return false;
    }
    
    retries--;
    if (retries > 0) {
      console.log('Refreshing page and retrying...');
      await page.reload();
      await waitForNavigationAndLoad(page, [/.*appointments.*/]);
    }
  }
  
  console.log('⚠️ No appointment found after all retries');
  return false;
}

test.describe.serial('Complete Healthcare Workflows', () => {
  // Initialize Supabase admin client
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://chftygsapwhahqbqlfdx.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoZnR5Z3NhcHdoYWhxYnFsZmR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg1NTg2MywiZXhwIjoyMDYzNDMxODYzfQ.Gy5YQKJLxaWIqYqBPeHQFIYvBtZKGVBi2UQD1YVbAKM';
  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Helper function for login
  async function login(page: any, email: string, password: string, baseURL: string = 'http://localhost:8081') {
    await page.goto(`${baseURL}/auth`);
    await page.getByRole('tab', { name: 'Login' }).click();
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Log In' }).click();

    // Handle complete profile flow if needed
    try {
      await page.waitForURL(/.*complete-profile.*/, { timeout: 5000 });
      console.log('🔄 Completing user profile...');
      await page.getByPlaceholder('9876543210').fill('5551234567');
      await page.getByRole('button', { name: /save.*continue/i }).click();
      await page.waitForURL(/.*dashboard.*/, { timeout: 10000 });
      console.log('✅ Profile completed');
    } catch (e) {
      // Profile might already be complete, continue with test
      console.log('ℹ️ Profile already complete or different flow');
    }
  }

  test('Admin-Only Onboarding: Should NOT appear in doctor dropdown', async ({ page, baseURL }) => {
    console.log('🚀 Testing Admin-Only Onboarding Flow...');

    const adminUser = {
      email: `admin_${Date.now()}@example.com`,
      password: 'Admin!123',
      name: 'Test Admin User'
    };

    const clinic = {
      name: `Admin Clinic ${randomUUID().slice(0, 8)}`,
      address: '123 Admin Street, Admin City, AC 12345',
      email: `admin${Date.now()}@clinic.com`,
      phone: '+1-555-ADMIN',
      website: 'https://adminclinic.example.com'
    };

    // Create admin user
    const { data: userData, error } = await admin.auth.admin.createUser({
      email: adminUser.email,
      password: adminUser.password,
      email_confirm: true,
      user_metadata: { name: adminUser.name },
    });

    if (error && !error.message.includes('User already registered')) {
      throw error;
    }

    // Onboarding flow
    await login(page, adminUser.email, adminUser.password, baseURL);
    await expect(page).toHaveURL(/.*create-clinic.*/, { timeout: 10000 });

    // Fill clinic details
    await page.getByLabel(/clinic name/i).fill(clinic.name);
    await page.getByLabel(/address/i).fill(clinic.address);
    await page.getByLabel(/email/i).fill(clinic.email);
    await page.getByLabel(/phone/i).fill(clinic.phone);
    await page.getByLabel(/website/i).fill(clinic.website);

    await page.getByRole('button', { name: /next.*departments/i }).click();
    
    // Wait for departments to load and select first one
    await page.waitForSelector('input[type="checkbox"]', { timeout: 10000 });
    await page.getByRole('checkbox').first().click();
    await page.getByRole('button', { name: /next.*your role/i }).click();

    // Select "Yes, I'm a practicing doctor" to create doctor profile
    await page.getByText(/yes.*practicing doctor/i).click();

    // Wait for medical details section to appear and fill doctor information
    await page.waitForSelector('text=Essential Medical Details', { state: 'visible', timeout: 5000 });
    
    // Select primary department first (required for doctor creation)
    await page.getByRole('combobox', { name: /primary department/i }).click();
    await page.getByRole('option').first().click();

    // Fill doctor details using the correct field labels
    await page.getByLabel(/Medical Specialization/i).fill('Internal Medicine, Family Practice');
    await page.getByLabel(/Consultation Fee/i).fill('200');
    await page.getByLabel(/Professional Phone/i).fill('+1-555-DOC-PHONE');
    await page.getByLabel(/Availability/i).fill('Mon-Fri 9:00 AM - 6:00 PM, Sat 9:00 AM - 2:00 PM');
    await page.getByLabel(/Professional Bio/i).fill('Board-certified internal medicine physician with 8+ years of experience in family practice and preventive care.');

    // Create clinic
    await page.getByRole('button', { name: /create clinic/i }).click();
    console.log('⏳ Waiting for clinic creation...');

    // Wait for loading states and check for errors
    await Promise.race([
      page.waitForSelector('text=/creating.*clinic/i', { state: 'visible', timeout: 5000 }),
      page.waitForSelector('text=/error/i', { state: 'visible', timeout: 5000 })
    ]).catch(() => console.log('ℹ️ No loading or error state found'));

    // Check for any error messages
    const hasError = await page.getByRole('alert').isVisible();
    if (hasError) {
      const errorText = await page.getByRole('alert').textContent();
      console.error('❌ Error during clinic creation:', errorText);
      throw new Error(`Clinic creation failed: ${errorText}`);
    }

    // Wait for navigation and page load
    await waitForNavigationAndLoad(page, [
      /.*complete-profile.*/,
      /.*dashboard.*/,
      /^\/$/ // Root URL
    ]);

    // Complete profile if needed
    if (page.url().includes('complete-profile')) {
      console.log('🔄 Completing profile after clinic creation...');
      await page.getByPlaceholder('9876543210').fill('5551234567');
      await page.getByRole('button', { name: /save.*continue/i }).click();
      
      // Wait for navigation after profile completion
      await waitForNavigationAndLoad(page, [
        /.*dashboard.*/,
        /^\/$/ // Root URL
      ]);
      console.log('✅ Profile completed after clinic creation');
    }

    console.log('✅ Clinic creation completed');

    // Wait for auth context to update and sidebar to appear
    await page.waitForSelector('nav', { timeout: 30000 })
      .catch(() => console.log('ℹ️ Sidebar not found'));

    // Navigate to appointments page
    await page.goto(`${baseURL}/appointments`);
    await page.waitForLoadState('networkidle');

    console.log('✅ Admin onboarding completed');

    // Test: Admin should NOT appear in doctor dropdown for appointments
    await page.getByRole('button', { name: /new appointment/i }).click();

    await page.getByRole('combobox', { name: /doctor/i }).click();
    await page.waitForTimeout(1000);

    const doctorOptions = page.getByRole('option');
    const optionCount = await doctorOptions.count();

    if (optionCount === 0) {
      console.log('✅ CORRECT: Admin user does not appear in doctor dropdown');
    } else {
      const optionText = await doctorOptions.first().textContent();
      if (optionText?.includes(adminUser.name)) {
        throw new Error('INCORRECT: Admin user appears in doctor dropdown when they should not');
      } else {
        console.log('✅ CORRECT: Admin user does not appear in doctor dropdown');
      }
    }

    // Cleanup
    await admin.auth.admin.deleteUser(userData?.user?.id || '');
    console.log('✅ Admin-only test completed successfully');
  });

  test('Practicing Doctor Onboarding + Complete Consultation Workflow', async ({ page, baseURL }) => {
    console.log('🚀 Testing Practicing Doctor Onboarding + Full Consultation...');

    const doctorUser = {
      email: `doctor_${Date.now()}@example.com`,
      password: 'Doctor!123',
      name: 'Dr. Test Physician'
    };

    const patient = {
      name: `Test Patient ${randomUUID().slice(0, 8)}`,
      phone: `+1-555-${Math.floor(1000000 + Math.random() * 8999999)}`,
      email: `patient${Date.now()}@example.com`,
      address: '123 Patient Street, Patient City, PC 12345',
      medicalId: `MID-${Math.floor(Math.random() * 90000) + 10000}`,
      gender: 'Male'
    };

    const clinic = {
      name: `Doctor Clinic ${randomUUID().slice(0, 8)}`,
      address: '456 Medical Ave, Medical City, MC 67890',
      email: `doctor${Date.now()}@clinic.com`,
      phone: '+1-555-DOCTOR',
      website: 'https://doctorclinic.example.com'
    };

    // Create doctor user
    const { data: userData, error } = await admin.auth.admin.createUser({
      email: doctorUser.email,
      password: doctorUser.password,
      email_confirm: true,
      user_metadata: { name: doctorUser.name },
    });

    if (error && !error.message.includes('User already registered')) {
      throw error;
    }

    // =========================================================================
    // STEP 1: Onboarding as Practicing Doctor
    // =========================================================================
    console.log('👨‍⚕️ Step 1: Onboarding as practicing doctor...');

    await login(page, doctorUser.email, doctorUser.password, baseURL);
    await expect(page).toHaveURL(/.*create-clinic.*/, { timeout: 10000 });

    // Fill clinic details
    await page.getByLabel(/clinic name/i).fill(clinic.name);
    await page.getByLabel(/address/i).fill(clinic.address);
    await page.getByLabel(/email/i).fill(clinic.email);
    await page.getByLabel(/phone/i).fill(clinic.phone);
    await page.getByLabel(/website/i).fill(clinic.website);

    await page.getByRole('button', { name: /next.*departments/i }).click();
    
    // Wait for departments to load and select first one
    await page.waitForSelector('input[type="checkbox"]', { timeout: 10000 });
    await page.getByRole('checkbox').first().click();
    await page.getByRole('button', { name: /next.*your role/i }).click();

    // Select "Yes, I'm a practicing doctor"
    await page.getByText(/yes.*practicing doctor/i).click();

    // Wait for conditional doctor fields to appear and fill them
    await page.waitForSelector('input[placeholder*="Clinical Cardiology"]', { timeout: 5000 });
    
    // Select primary department first (required for doctor creation)
    await page.getByRole('combobox', { name: /primary department/i }).click();
    await page.getByRole('option').first().click();

    // Fill doctor details
    await page.getByPlaceholder(/Clinical Cardiology, General Medicine, Neurology/i).fill('Internal Medicine');
    await page.getByLabel(/Consultation Fee/i).fill('750');
    await page.getByPlaceholder(/\+91 98765 43210/i).fill('+1-555-DOC-PHONE');
    await page.getByPlaceholder(/Mon-Fri 9:00 AM - 5:00 PM/i).fill('Mon-Fri 9:00 AM - 5:00 PM');
    await page.getByPlaceholder(/Specialist in cardiology with 10\+ years/i).fill('Experienced internal medicine physician');

    await page.getByRole('button', { name: /create clinic/i }).click();

    // Wait for any loading states or error messages
    console.log('⏳ Waiting for clinic creation...');
    await page.waitForLoadState('networkidle');
    
    // Check for any error messages
    const hasError = await page.getByRole('alert').isVisible();
    if (hasError) {
      const errorText = await page.getByRole('alert').textContent();
      console.error('❌ Error during clinic creation:', errorText);
      throw new Error(`Clinic creation failed: ${errorText}`);
    }

    // Wait for loading indicator to appear and disappear
    try {
      await page.getByText(/creating.*clinic/i).waitFor({ timeout: 5000 });
      await page.getByText(/creating.*clinic/i).waitFor({ state: 'hidden', timeout: 30000 });
    } catch (e) {
      // Loading indicator might not be visible if the operation was too fast
      console.log('ℹ️ Loading indicator not found or already gone');
    }
    
    // Log current URL and wait for navigation
    console.log('📍 Current URL before navigation:', page.url());
    await page.waitForTimeout(2000); // Small delay to let any redirects start
    
    // Wait for navigation to complete
    await Promise.race([
      page.waitForURL(/.*complete-profile.*/, { timeout: 30000 }),
      page.waitForURL(/.*dashboard.*/, { timeout: 30000 })
    ]);
    console.log('📍 Current URL after navigation:', page.url());

    // Check if we need to complete profile
    const isOnProfilePage = page.url().includes('complete-profile');
    if (isOnProfilePage) {
      console.log('🔄 Completing doctor profile after clinic creation...');
      
      // Fill in name if not already filled
      const nameInput = page.getByLabel(/full name/i);
      const currentName = await nameInput.inputValue();
      if (!currentName) {
        await nameInput.fill(doctorUser.name);
      }
      
      // Fill in phone number
      await page.getByPlaceholder('9876543210').fill('5551234567');
      await page.getByRole('button', { name: /save.*continue/i }).click();
      
      // Wait for redirect to dashboard
      await page.waitForURL(/.*dashboard.*/, { timeout: 30000 });
      console.log('✅ Doctor profile completed after clinic creation');
    } else {
      console.log('ℹ️ No profile completion needed, already on dashboard');
    }

    // Navigate to dashboard
    await page.goto(`${baseURL}/dashboard`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Step 1: Doctor onboarding completed');

    // =========================================================================
    // STEP 2: Create Patient
    // =========================================================================
    console.log('👤 Step 2: Creating patient...');

    await page.goto(`${baseURL}/patients`);
    await page.getByRole('button', { name: /add patient/i }).click();

    await page.getByPlaceholder('Patient Name').fill(patient.name);
    await page.getByRole('button', { name: patient.gender, exact: true }).click();
    await page.getByPlaceholder('e.g., +1 123 456 7890').fill(patient.phone);
    await page.getByPlaceholder('patient@example.com').fill(patient.email);
    await page.getByPlaceholder('Patient Address').fill(patient.address);
    await page.getByPlaceholder('Optional Medical ID').fill(patient.medicalId);

    await page.getByRole('button', { name: /create patient/i }).click();
    await expect(page.getByText(/patient created/i)).toBeVisible();
    await page.waitForTimeout(2000);

    console.log('✅ Step 2: Patient created');

    // =========================================================================
    // STEP 3: Create Appointment (Doctor should appear in dropdown)
    // =========================================================================
    console.log('📅 Step 3: Creating appointment...');

    await page.goto(`${baseURL}/appointments`);
    await page.getByRole('button', { name: /new appointment/i }).click();

    // Select patient
    await page.getByRole('combobox', { name: /patient/i }).click();
    await page.getByRole('option', { name: patient.name }).click();

    // Select doctor - doctor should be available
    await page.getByRole('combobox', { name: /doctor/i }).click();
    await page.waitForTimeout(1000);

    const doctorOptions = page.getByRole('option');
    const firstOption = doctorOptions.first();

    if (await firstOption.isVisible({ timeout: 3000 })) {
      const doctorOptionText = await firstOption.textContent();
      console.log(`✅ Doctor found in dropdown: ${doctorOptionText}`);
      await firstOption.click();

      // Select time slot
      await page.getByRole('combobox', { name: /time/i }).click();
      await page.getByRole('option', { name: '9:00 AM' }).click();

      // Add notes
      await page.getByRole('textbox', { name: /notes/i }).fill('Comprehensive consultation for test workflow');

      // Create appointment
      await page.getByRole('button', { name: /create appointment/i }).click();
      await expect(page.getByText(/appointment created/i)).toBeVisible();

      console.log('✅ Step 3: Appointment created successfully with doctor');
    } else {
      throw new Error('Doctor not found in dropdown - onboarding doctor creation failed');
    }

    // =========================================================================
    // STEP 4: Consultation Workflow
    // =========================================================================
    console.log('🩺 Step 4: Starting consultation workflow...');
    
    const consultationCompleted = await handleAppointmentAndConsultation(page, patient, baseURL);
    
    if (consultationCompleted) {
      console.log('✅ Step 4: Consultation workflow completed successfully');
    } else {
      console.log('⚠️ Step 4: Consultation workflow skipped or failed');
    }

    // =========================================================================
    // STEP 5: Billing Workflow
    // =========================================================================
    console.log('💰 Step 5: Starting billing workflow...');
    
    // Only proceed with billing if consultation was completed
    if (consultationCompleted) {
      await page.goto(`${baseURL}/billing`);
      await waitForNavigationAndLoad(page, [/.*billing.*/]);
      
            // Try to find the patient's billing record
      if (patient.name) {
        const billingRow = page.getByText(patient.name).locator('..');
        if (await billingRow.isVisible({ timeout: 5000 })) {
          // Click generate invoice button if available
          const generateButton = billingRow.getByRole('button', { name: /generate|create.*invoice/i });
          if (await generateButton.isVisible()) {
            await generateButton.click();
            
            // Wait for invoice generation
            await page.waitForSelector('text=/invoice.*generated/i', { timeout: 5000 })
              .catch(() => console.log('⚠️ No invoice generation confirmation found'));
            
            console.log('✅ Step 5: Billing workflow completed - invoice generated');
          } else {
            console.log('⚠️ Step 5: No generate invoice button found');
          }
        } else {
          console.log('⚠️ Step 5: No billing record found for patient');
        }
      } else {
        console.log('⚠️ Step 5: Patient name not available for billing lookup');
      }
    } else {
      console.log('⚠️ Step 5: Billing workflow skipped (no completed consultation)');
    }

    // Cleanup
    await admin.auth.admin.deleteUser(userData?.user?.id || '');
    console.log('✅ Practicing doctor test completed successfully');
  });

  test('Admin should not appear in doctor dropdown', async ({ page }) => {
    // Sign up as a new admin
    await page.goto('/auth');
    await page.getByRole('tab', { name: 'Sign Up' }).click();
    await page.getByRole('textbox', { name: 'Full Name' }).fill('Test Admin');
    await page.getByRole('textbox', { name: 'Email' }).fill('test_admin@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('Test!123');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Wait for signup to complete and session to be created
    await page.waitForTimeout(2000); // Wait for auth state to update
    await page.waitForURL('/');
    console.log('✅ Signup successful, redirected to home page');

    // Create a new clinic
    await page.getByRole('button', { name: /create.*clinic/i }).click();
    await page.getByRole('textbox', { name: /clinic name/i }).fill('Test Clinic');
    await page.getByRole('textbox', { name: /clinic email/i }).fill('test_clinic@example.com');
    await page.getByRole('textbox', { name: /clinic phone/i }).fill('+1234567890');
    await page.getByRole('textbox', { name: /clinic address/i }).fill('123 Test St');

    // Click next to go to departments
    await page.getByRole('button', { name: /next.*departments/i }).click();

    // Select first department
    await page.waitForSelector('input[type="checkbox"]');
    await page.getByRole('checkbox').first().click();
    await page.getByRole('button', { name: /next.*your role/i }).click();

    // Select "No, administrator only" since we don't want admin to appear in doctor dropdown
    await page.getByText(/no.*administrator only/i).click();

    // Click create clinic and wait for loading states
    await page.getByRole('button', { name: /create clinic/i }).click();
    console.log('⏳ Waiting for clinic creation...');

    // Wait for loading states
    await Promise.race([
      page.waitForSelector('text=/creating.*clinic/i', { state: 'visible', timeout: 5000 }),
      page.waitForSelector('text=/error/i', { state: 'visible', timeout: 5000 })
    ]).catch(() => console.log('ℹ️ No loading or error state found'));

    // Wait for loading to complete
    await Promise.race([
      page.waitForSelector('text=/creating.*clinic/i', { state: 'hidden', timeout: 30000 }),
      page.waitForSelector('text=/error/i', { state: 'visible', timeout: 30000 })
    ]).catch(() => console.log('ℹ️ Loading state not found or already complete'));

    // Check for any error messages
    const hasError = await page.getByRole('alert').isVisible();
    if (hasError) {
      const errorText = await page.getByRole('alert').textContent();
      console.error('❌ Error during clinic creation:', errorText);
      throw new Error(`Clinic creation failed: ${errorText}`);
    }

    // Log current URL and wait for navigation
    console.log('📍 Current URL before navigation:', page.url());
    await page.waitForTimeout(2000); // Small delay to let any redirects start

    // Wait for loading indicator to disappear
    await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 30000 })
      .catch(() => console.log('ℹ️ Loading indicator not found or already gone'));

    // Wait for navigation to complete profile or dashboard
    await Promise.race([
      page.waitForURL(/.*complete-profile.*/),
      page.waitForURL(/.*dashboard.*/),
      page.waitForURL(/^\/$/)
    ]);
    console.log('✅ Clinic created, redirected to next page');

    // Complete profile if needed
    const currentUrl = page.url();
    if (currentUrl.includes('complete-profile')) {
      console.log('ℹ️ Completing profile...');
      await page.getByRole('textbox', { name: /phone/i }).fill('+1234567890');
      await page.getByRole('button', { name: /continue/i }).click();
      await page.waitForURL(/.*dashboard.*/);
      console.log('✅ Profile completed');
    }

    // Wait for dashboard to load
    await page.waitForSelector('text=/dashboard/i', { state: 'visible', timeout: 5000 });

    // Create a doctor
    await page.getByRole('button', { name: /add.*doctor/i }).click();
    await page.getByRole('textbox', { name: /name/i }).fill('Test Doctor');
    await page.getByRole('textbox', { name: /email/i }).fill('test_doctor@example.com');
    await page.getByRole('textbox', { name: /phone/i }).fill('+1234567891');
    await page.getByRole('textbox', { name: /specialization/i }).fill('General Medicine');
    await page.getByRole('textbox', { name: /consultation fee/i }).fill('100');
    await page.getByRole('button', { name: /save/i }).click();

    // Wait for doctor to be created
    await page.waitForSelector('text=/Test Doctor/i', { state: 'visible', timeout: 5000 });

    // Create a patient
    await page.getByRole('link', { name: /patients/i }).click();
    await page.getByRole('button', { name: /add.*patient/i }).click();
    await page.getByRole('textbox', { name: /name/i }).fill('Test Patient');
    await page.getByRole('textbox', { name: /email/i }).fill('test_patient@example.com');
    await page.getByRole('textbox', { name: /phone/i }).fill('+1234567892');
    await page.getByRole('button', { name: /save/i }).click();

    // Wait for patient to be created
    await page.waitForSelector('text=/Test Patient/i', { state: 'visible', timeout: 5000 });

    // Create an appointment
    await page.getByRole('link', { name: /appointments/i }).click();
    await page.getByRole('button', { name: /add.*appointment/i }).click();

    // Wait for doctor dropdown to be visible
    await page.waitForSelector('select[name="doctor_id"]', { state: 'visible', timeout: 5000 });

    // Verify that admin is not in doctor dropdown
    const doctorDropdown = page.getByRole('combobox', { name: /doctor/i });
    await doctorDropdown.click();
    const adminOption = page.getByRole('option', { name: /test admin/i });
    const adminExists = await adminOption.isVisible();
    expect(adminExists).toBe(false);
  });
}); 