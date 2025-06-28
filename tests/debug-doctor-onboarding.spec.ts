import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

test.describe.serial('Debug Doctor Onboarding', () => {
  // Initialize Supabase admin client
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Helper function for login
  async function login(page: any, email: string, password: string, baseURL: string = 'http://localhost:8080') {
    await page.goto(`${baseURL}/auth`);
    await page.getByRole('tab', { name: 'Login' }).click();
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Log In' }).click();
    await page.waitForTimeout(2000);
  }

  test('Debug Practicing Doctor Onboarding', async ({ page, baseURL }) => {
    console.log('🚀 Debugging Practicing Doctor Onboarding...');

    const doctorUser = {
      email: `doctor_${Date.now()}@example.com`,
      password: 'Doctor!123',
      name: 'Dr. Test Physician'
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
    await page.getByRole('checkbox').first().click();
    await page.getByRole('button', { name: /next.*your role/i }).click();

    // Select "Yes, I'm a practicing doctor"
    await page.getByText(/yes.*practicing doctor/i).click();

    // Fill doctor details
    await page.getByPlaceholder(/Clinical Cardiology, General Medicine, Neurology/i).fill('Internal Medicine');
    await page.getByLabel(/Consultation Fee/i).fill('750');
    await page.getByPlaceholder(/\+91 98765 43210/i).fill('+1-555-DOC-PHONE');
    await page.getByPlaceholder(/Mon-Fri 9:00 AM - 5:00 PM/i).fill('Mon-Fri 9:00 AM - 5:00 PM');
    await page.getByPlaceholder(/Specialist in cardiology with 10\+ years/i).fill('Experienced internal medicine physician');

    // Monitor console logs for errors
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warn') {
        consoleLogs.push(`${msg.type()}: ${msg.text()}`);
      }
    });

    await page.getByRole('button', { name: /create clinic/i }).click();
    
    // Wait longer and check for success/error messages
    await page.waitForTimeout(5000);

    console.log('Console logs during clinic creation:');
    consoleLogs.forEach(log => console.log(`  ${log}`));

    // Check current URL after clinic creation
    console.log('Current URL after clinic creation:', page.url());

    // Check if doctor was created
    const { data: clinics, error: clinicError } = await admin
      .from('clinics')
      .select('id')
      .eq('name', clinic.name)
      .single();

    if (clinicError) {
      console.log('❌ Could not find clinic:', clinicError.message);
    } else {
      console.log('✅ Clinic found:', clinics.id);

      // Check clinic members first
      const { data: members, error: membersError } = await admin
        .from('clinic_members')
        .select('*')
        .eq('user_id', userData?.user?.id)
        .eq('clinic_id', clinics.id);

      if (membersError) {
        console.log('❌ Could not check clinic members:', membersError.message);
      } else if (members && members.length > 0) {
        console.log('✅ Clinic membership found:', members[0]);
      } else {
        console.log('❌ No clinic membership found');
      }

      const { data: doctors, error: doctorError } = await admin
        .from('doctors')
        .select('*')
        .eq('user_id', userData?.user?.id)
        .eq('clinic_id', clinics.id);

      if (doctorError) {
        console.log('❌ Could not check doctor:', doctorError.message);
      } else if (doctors && doctors.length > 0) {
        console.log('✅ Doctor profile created:', doctors[0]);
      } else {
        console.log('❌ No doctor profile found');
        
        // Try to manually create doctor profile using the same function
        console.log('Attempting manual doctor profile creation...');
        try {
          const { data: manualData, error: manualError } = await admin
            .from('doctors')
            .insert({
              user_id: userData?.user?.id,
              clinic_id: clinics.id,
              name: doctorUser.name,
              email: doctorUser.email,
              primary_specialization: 'Internal Medicine',
              consultation_fee: 750,
              availability: 'Mon-Fri 9:00 AM - 5:00 PM',
              bio: 'Experienced internal medicine physician',
              is_active: true
            })
            .select()
            .single();

          if (manualError) {
            console.log('❌ Manual doctor creation failed:', manualError.message);
          } else {
            console.log('✅ Manual doctor creation succeeded:', manualData);
          }
        } catch (e) {
          console.log('❌ Manual doctor creation error:', e);
        }
      }
    }

    // Complete profile if needed
    if (page.url().includes('/complete-profile')) {
      console.log('📝 Completing profile...');
      await page.getByPlaceholder('9876543210').fill('5551234567');
      await page.getByRole('button', { name: /save.*continue/i }).click();
      await page.waitForURL(/.*dashboard.*/, { timeout: 10000 });
    }

    console.log('✅ Step 1: Doctor onboarding completed');
    console.log('Final URL:', page.url());

    // Navigate to patients page and check what's available
    await page.goto(`${baseURL}/patients`);
    await page.waitForTimeout(3000);
    
    console.log('Current URL after navigating to patients:', page.url());
    
    // Check if Add Patient button exists
    const addPatientButton = page.getByRole('button', { name: /add patient/i });
    const isVisible = await addPatientButton.isVisible({ timeout: 5000 });
    console.log('Add Patient button visible:', isVisible);

    if (isVisible) {
      console.log('✅ Add Patient button found');
    } else {
      console.log('❌ Add Patient button not found');
    }

    // Cleanup
    await admin.auth.admin.deleteUser(userData?.user?.id || '');
    
    console.log('✅ Debug test completed');
  });
}); 