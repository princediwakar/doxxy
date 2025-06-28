import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

test.describe.serial('Debug Department Selection', () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  async function login(page: any, email: string, password: string, baseURL: string = 'http://localhost:8080') {
    await page.goto(`${baseURL}/auth`);
    await page.getByRole('tab', { name: 'Login' }).click();
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Log In' }).click();
  }

  test('Debug Department Loading in Clinic Creation', async ({ page, baseURL }) => {
    console.log('🔍 Debugging department loading...');

    const testUser = {
      email: `debug_${Date.now()}@example.com`,
      password: 'Debug!123',
      name: 'Debug User'
    };

    const clinic = {
      name: `Debug Clinic ${randomUUID().slice(0, 8)}`,
      address: '123 Debug Street',
      email: `debug${Date.now()}@clinic.com`,
      phone: '+1-555-DEBUG',
      website: 'https://debug.example.com'
    };

    // Create user
    const { data: userData, error } = await admin.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
      user_metadata: { name: testUser.name },
    });

    if (error && !error.message.includes('User already registered')) {
      throw error;
    }

    // Login and navigate to clinic creation
    await login(page, testUser.email, testUser.password, baseURL);
    await expect(page).toHaveURL(/.*create-clinic.*/, { timeout: 10000 });

    console.log('✅ Successfully logged in and navigated to clinic creation');

    // Fill clinic details
    await page.getByLabel(/clinic name/i).fill(clinic.name);
    await page.getByLabel(/address/i).fill(clinic.address);
    await page.getByLabel(/email/i).fill(clinic.email);
    await page.getByLabel(/phone/i).fill(clinic.phone);
    await page.getByLabel(/website/i).fill(clinic.website);

    console.log('✅ Filled clinic details');

    // Move to departments step
    await page.getByRole('button', { name: /next.*departments/i }).click();
    console.log('✅ Clicked Next to Departments');

    // Wait and inspect the departments section
    await page.waitForTimeout(3000);

    // Check if departments are loading
    const loadingText = page.getByText(/loading departments/i);
    if (await loadingText.isVisible({ timeout: 2000 })) {
      console.log('⏳ Departments are loading...');
      await page.waitForTimeout(5000);
    }

    // Check for error messages
    const errorText = page.getByText(/error.*departments/i);
    if (await errorText.isVisible({ timeout: 1000 })) {
      console.log('❌ Error loading departments detected');
      const errorMessage = await errorText.textContent();
      console.log('Error message:', errorMessage);
    }

    // Check for "No departments found" message
    const noDepsText = page.getByText(/no departments found/i);
    if (await noDepsText.isVisible({ timeout: 1000 })) {
      console.log('❌ No departments found message displayed');
    }

    // Look for any checkboxes
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    console.log(`📊 Found ${checkboxCount} checkboxes`);

    if (checkboxCount > 0) {
      console.log('✅ Checkboxes found! Listing them:');
      for (let i = 0; i < checkboxCount; i++) {
        const checkbox = checkboxes.nth(i);
        const label = checkbox.locator('..').getByRole('label');
        const labelText = await label.textContent();
        console.log(`  ${i + 1}. ${labelText}`);
      }

      // Try to click the first checkbox
      await checkboxes.first().click();
      console.log('✅ Successfully clicked first checkbox');
      
      // Try to proceed
      await page.getByRole('button', { name: /next.*your role/i }).click();
      console.log('✅ Successfully proceeded to next step');
    } else {
      console.log('❌ No checkboxes found');
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'debug-departments.png', fullPage: true });
      console.log('📸 Screenshot saved as debug-departments.png');
      
      // Check the page content
      const pageContent = await page.textContent('body');
      console.log('Page content preview:', pageContent.substring(0, 500));
    }

    // Cleanup
    await admin.auth.admin.deleteUser(userData?.user?.id || '');
    console.log('✅ Debug test completed');
  });
}); 