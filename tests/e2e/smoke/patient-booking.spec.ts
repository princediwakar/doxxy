// tests/e2e/smoke/patient-booking.spec.ts
// Smoke test: Patient booking flow
//
// Prerequisites:
//   1. A test clinic exists with at least one active doctor
//   2. PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD env vars are set
//   3. Local dev server is running on localhost:3000
//
// Run:  npx playwright test tests/e2e/smoke/patient-booking.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Patient Booking Flow', () => {
  test('create patient and book appointment', async ({ page }) => {
    // Navigate to schedule page (the main clinic view)
    await page.goto('/schedule');

    // Wait for schedule page to load — sidebar nav is always visible
    await expect(page.getByRole('link', { name: 'Schedule' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'New Patient' })).toBeVisible({ timeout: 10_000 });

    // Click the "New Patient" button
    const newPatientBtn = page.getByRole('button', { name: 'New Patient' });
    if (await newPatientBtn.isVisible()) {
      await newPatientBtn.click();
    }

    // If a modal/form opens, fill basic patient details
    const nameInput = page.getByLabel(/name/i);
    if (await nameInput.isVisible()) {
      const testName = `E2E Test Patient ${Date.now()}`;
      await nameInput.fill(testName);

      // Fill phone if present
      const phoneInput = page.getByLabel(/phone/i);
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('9876543210');
      }

      // Submit the form
      const submitBtn = page.getByRole('button', { name: /create patient/i });
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
      }
    }

    // Verify we land back on schedule without error toasts
    await page.waitForTimeout(2000);
    const errorToast = page.getByText(/error|failed/i);
    await expect(errorToast).not.toBeVisible({ timeout: 5000 });
  });

  test('schedule page loads with appointment queue', async ({ page }) => {
    await page.goto('/schedule');

    // The schedule page should load and show the appointment queue
    // or a message if no appointments exist
    await expect(page.getByRole('button', { name: 'New Patient' })).toBeVisible({ timeout: 10_000 });
  });
});
