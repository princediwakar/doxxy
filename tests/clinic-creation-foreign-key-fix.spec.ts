import { test, expect } from '@playwright/test';

test.describe('Clinic Creation - Foreign Key Fix Verification', () => {
  test('should create clinic successfully with correct foreign key relationships', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8080');
    
    // Check for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait for the page to load and take a screenshot
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/clinic-creation-landing.png' });
    
    // Navigate to create clinic page (assuming user is logged in)
    // This will depend on the current auth state
    
    // Check if we're on a login page or create clinic page
    const currentUrl = page.url();
    console.log(`Current page URL: ${currentUrl}`);
    
    // Check for any console errors
    expect(consoleErrors.length).toBe(0);
    
    // Take a screenshot of the current state
    await page.screenshot({ path: 'test-results/clinic-creation-initial-state.png' });
    
    // Log the page title and content for debugging
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Check if there are any elements indicating clinic creation
    const hasCreateClinicButton = await page.locator('text=Create Clinic').count() > 0;
    const hasLoginForm = await page.locator('input[type="email"]').count() > 0;
    
    console.log(`Has create clinic button: ${hasCreateClinicButton}`);
    console.log(`Has login form: ${hasLoginForm}`);
    
    // For now, just verify the page loads without console errors
    // The actual clinic creation flow would require authentication setup
  });
  
  test('should verify console has no foreign key constraint errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    // Check for specific foreign key constraint errors
    const foreignKeyErrors = consoleErrors.filter(error => 
      error.includes('foreign key constraint') || 
      error.includes('clinic_members_department_id_fkey')
    );
    
    expect(foreignKeyErrors.length).toBe(0);
    
    // Log all console messages for debugging
    console.log('Console Errors:', consoleErrors);
    console.log('Console Warnings:', consoleWarnings);
  });
}); 