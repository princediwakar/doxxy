import { test } from '@playwright/test';

test.describe('Invitation System Debug Tests', () => {
  const TEST_EMAIL = 'test-trigger-debug@example.com';
  const ADMIN_EMAIL = 'mental.alternate@gmail.com'; // From the migration data
  
  test('Complete invitation flow debugging', async ({ page, context }) => {
    console.log('🔍 Starting systematic invitation debugging...');
    
    // Step 1: Navigate and login as admin
    console.log('📍 Step 1: Navigate to app and login as superadmin');
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    // Check if we're on login page
    const isLoginPage = await page.locator('text=Sign in').isVisible();
    console.log(`Login page visible: ${isLoginPage}`);
    
    if (isLoginPage) {
      // Try to login with the test admin account
      const emailInput = page.locator('input[type="email"]');
      const loginButton = page.locator('button:has-text("Sign in")');
      
      if (await emailInput.isVisible()) {
        await emailInput.fill(ADMIN_EMAIL);
        await loginButton.click();
        await page.waitForLoadState('networkidle');
      }
    }
    
    // Take screenshot of current state
    await page.screenshot({ path: 'debug-step1-login.png', fullPage: true });
    
    // Step 2: Navigate to invitation creation area
    console.log('📍 Step 2: Navigate to member management/invitation creation');
    
    // Look for sidebar navigation
    const sidebar = page.locator('[data-testid="sidebar"], .sidebar, nav');
    if (await sidebar.isVisible()) {
      // Try common navigation patterns
      const navOptions = [
        'text=Settings',
        'text=Team',
        'text=Members',
        'text=Clinic',
        'text=Management',
        'text=Admin'
      ];
      
      for (const navOption of navOptions) {
        const element = page.locator(navOption);
        if (await element.isVisible()) {
          console.log(`Found navigation option: ${navOption}`);
          await element.click();
          await page.waitForLoadState('networkidle');
          break;
        }
      }
    }
    
    await page.screenshot({ path: 'debug-step2-navigation.png', fullPage: true });
    
    // Step 3: Look for invitation creation UI
    console.log('📍 Step 3: Look for invitation creation interface');
    
    const inviteButtons = [
      'text=Invite',
      'text=Add Member',
      'text=Invite Member',
      'button:has-text("Invite")',
      '[data-testid="invite-button"]'
    ];
    
    let inviteButton = null;
    for (const selector of inviteButtons) {
      const button = page.locator(selector);
      if (await button.isVisible()) {
        console.log(`Found invite button: ${selector}`);
        inviteButton = button;
        break;
      }
    }
    
    if (inviteButton) {
      await inviteButton.click();
      await page.waitForLoadState('networkidle');
      
      // Fill invitation form
      console.log('📍 Step 4: Fill invitation form');
      const emailField = page.locator('input[type="email"], input[name="email"]');
      const nameField = page.locator('input[name="name"], input[placeholder*="name"]');
      const roleSelect = page.locator('select[name="role"], [data-testid="role-select"]');
      const departmentSelect = page.locator('select[name="department"], [data-testid="department-select"]');
      
      if (await emailField.isVisible()) {
        await emailField.fill(TEST_EMAIL);
        console.log(`✅ Filled email: ${TEST_EMAIL}`);
      }
      
      if (await nameField.isVisible()) {
        await nameField.fill('Test User Debug');
        console.log('✅ Filled name');
      }
      
      if (await roleSelect.isVisible()) {
        await roleSelect.selectOption('doctor');
        console.log('✅ Selected role: doctor');
      }
      
      if (await departmentSelect.isVisible()) {
        // Select the first available department
        const options = await departmentSelect.locator('option').allTextContents();
        if (options.length > 1) {
          await departmentSelect.selectOption({ index: 1 });
          console.log('✅ Selected department');
        }
      }
      
      await page.screenshot({ path: 'debug-step4-form-filled.png', fullPage: true });
      
      // Submit invitation
      const submitButton = page.locator('button:has-text("Send"), button:has-text("Invite"), button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
        console.log('✅ Submitted invitation form');
      }
    } else {
      console.log('❌ No invite button found - checking page content');
      const bodyText = await page.textContent('body');
      console.log('Page content preview:', bodyText?.substring(0, 500));
    }
    
    await page.screenshot({ path: 'debug-step5-invitation-sent.png', fullPage: true });
    
    // Step 6: Check database for invitation record
    console.log('📍 Step 6: Manual database check required');
    console.log(`Please check database for invitation record with email: ${TEST_EMAIL}`);
    
    // Step 7: Open new browser context for signup simulation
    console.log('📍 Step 7: Simulate new user signup process');
    const newContext = await context.browser()?.newContext();
    const signupPage = await newContext?.newPage();
    
    if (signupPage) {
      await signupPage.goto('http://localhost:8080');
      await signupPage.waitForLoadState('networkidle');
      
      // Look for signup/auth interface
      const signupButton = signupPage.locator('text=Sign up, text=Register, text=Create Account');
      if (await signupButton.isVisible()) {
        await signupButton.click();
        await signupPage.waitForLoadState('networkidle');
      }
      
      await signupPage.screenshot({ path: 'debug-step7-signup-page.png', fullPage: true });
      
      // Try to simulate Google OAuth or email signup
      const googleButton = signupPage.locator('text=Google, [aria-label*="Google"], button:has-text("Continue with Google")');
      const emailSignup = signupPage.locator('input[type="email"]');
      
      if (await googleButton.isVisible()) {
        console.log('Found Google OAuth button - manual testing required');
        console.log('Google OAuth cannot be automated - requires manual testing');
      } else if (await emailSignup.isVisible()) {
        await emailSignup.fill(TEST_EMAIL);
        const passwordField = signupPage.locator('input[type="password"]');
        if (await passwordField.isVisible()) {
          await passwordField.fill('TestPassword123!');
        }
        
        const submitSignup = signupPage.locator('button:has-text("Sign up"), button[type="submit"]');
        if (await submitSignup.isVisible()) {
          await submitSignup.click();
          await signupPage.waitForLoadState('networkidle');
        }
      }
      
      await signupPage.screenshot({ path: 'debug-step8-after-signup.png', fullPage: true });
      await newContext?.close();
    }
    
    console.log('🏁 Test completed - check screenshots and database manually');
    console.log('Screenshots saved:');
    console.log('- debug-step1-login.png');
    console.log('- debug-step2-navigation.png');
    console.log('- debug-step4-form-filled.png');
    console.log('- debug-step5-invitation-sent.png');
    console.log('- debug-step7-signup-page.png');
    console.log('- debug-step8-after-signup.png');
  });
  
  test('Database state verification', async () => {
    console.log('📊 Database verification test - requires manual SQL queries');
    
    const queries = [
      `-- Check if invitation was created
SELECT id, email, clinic_id, role, department_id, accepted_at, created_at 
FROM pending_invitations 
WHERE email = '${TEST_EMAIL}' 
ORDER BY created_at DESC;`,
      
      `-- Check trigger function exists
SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';`,
      
      `-- Check if trigger is attached to auth.users
SELECT tgname, tgrelid::regclass, tgfoid::regproc 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';`,
      
      `-- Check recent auth.users inserts
SELECT id, email, created_at, raw_user_meta_data 
FROM auth.users 
WHERE email = '${TEST_EMAIL}' 
ORDER BY created_at DESC;`,
      
      `-- Check if profile was created
SELECT id, name, email, created_at 
FROM profiles 
WHERE email = '${TEST_EMAIL}';`,
      
      `-- Check if clinic_members was created
SELECT user_id, clinic_id, role, department_id, created_at 
FROM clinic_members cm
JOIN profiles p ON p.id = cm.user_id 
WHERE p.email = '${TEST_EMAIL}';`,
      
      `-- Check if doctors record was created
SELECT user_id, clinic_id, name, email, created_at 
FROM doctors d
JOIN profiles p ON p.id = d.user_id 
WHERE p.email = '${TEST_EMAIL}';`
    ];
    
    console.log('🔍 Run these queries in your database to debug:');
    queries.forEach((query, index) => {
      console.log(`\n--- Query ${index + 1} ---`);
      console.log(query);
    });
    
    console.log(`\n🔧 To check Supabase logs for errors:`);
    console.log(`npx supabase logs --level=error --since=10m`);
    console.log(`npx supabase logs --filter="handle_new_user" --since=10m`);
    console.log(`npx supabase logs --filter="RLS" --since=10m`);
  });
});