import { test, expect } from '@playwright/test';

test.describe.serial('Debug Department Error Details', () => {
  test('Check browser console and network for department loading errors', async ({ page }) => {
    console.log('🔍 Debugging department loading with detailed error info...');

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console Error:', msg.text());
      }
    });

    // Listen for failed network requests
    page.on('response', response => {
      if (!response.ok() && response.url().includes('department_types')) {
        console.log(`Network Error: ${response.status()} ${response.statusText()} for ${response.url()}`);
      }
    });

    // Go to clinic creation page
    await page.goto('http://localhost:8080/create-clinic');
    
    // Wait for the page to load
    await page.waitForTimeout(2000);
    
    // Check if we're redirected to auth
    if (page.url().includes('/auth')) {
      console.log('📋 Page redirected to auth, need to login first');
      return;
    }
    
    // Check if we're on the clinic creation page
    if (page.url().includes('/create-clinic')) {
      console.log('✅ On clinic creation page');
      
      // Fill minimal clinic details to get to departments step
      await page.getByLabel(/clinic name/i).fill('Test Clinic');
      await page.getByRole('button', { name: /next.*departments/i }).click();
      
      // Wait for departments to load and capture any errors
      await page.waitForTimeout(5000);
      
      // Check for loading state
      const loadingText = page.getByText(/loading departments/i);
      if (await loadingText.isVisible({ timeout: 1000 })) {
        console.log('⏳ Departments loading state found');
      }
      
      // Check for error state
      const errorText = page.getByText(/error.*departments/i);
      if (await errorText.isVisible({ timeout: 1000 })) {
        console.log('❌ Error loading departments displayed');
      }
      
      // Check for successful state
      const checkboxes = page.locator('input[type="checkbox"]');
      const checkboxCount = await checkboxes.count();
      console.log(`📊 Found ${checkboxCount} department checkboxes`);
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'debug-detailed.png', fullPage: true });
    } else {
      console.log('❌ Unexpected page:', page.url());
    }
  });

  test('Test direct navigation to create-clinic with manual auth bypass', async ({ page }) => {
    console.log('🔍 Testing with manual token injection...');

    // Inject a session manually using browser context
    await page.goto('http://localhost:8080/auth');
    
    // Try to inject session storage for auth
    await page.evaluate(() => {
      // This simulates being authenticated
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'fake-token',
        user: { id: 'fake-user-id', email: 'test@example.com' }
      }));
    });
    
    // Now navigate to clinic creation
    await page.goto('http://localhost:8080/create-clinic');
    await page.waitForTimeout(3000);
    
    console.log('📍 Current URL:', page.url());
    console.log('📋 Checking if departments issue is auth-related...');
  });
}); 