import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show auth page for unauthenticated users', async ({ page }) => {
    await page.goto('/auth');

    // Check if auth page is loaded
    await expect(page.getByText('Sign in to your account')).toBeVisible();

    // Check for authentication methods
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send magic link' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/auth');

    // Enter invalid email
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByRole('button', { name: 'Send magic link' }).click();

    // Should show validation error
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
  });

  test('should show password reset option', async ({ page }) => {
    await page.goto('/auth');

    // Click forgot password
    await page.getByRole('button', { name: 'Forgot password?' }).click();

    // Should show password reset form
    await expect(page.getByText('Reset your password')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send reset email' })).toBeVisible();
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to auth page when accessing protected route', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard');

    // Should redirect to auth page
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should show 404 for non-existent routes', async ({ page }) => {
    const response = await page.goto('/non-existent-route');
    expect(response?.status()).toBe(404);
  });
});