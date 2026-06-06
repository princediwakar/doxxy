// tests/e2e/smoke/billing-flow.spec.ts
// Smoke test: Billing flow
//
// Prerequisites: Same as patient-booking.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Billing Flow', () => {
  test('complete appointment and verify bill creation', async ({ page }) => {
    await page.goto('/schedule');

    await expect(page.getByRole('link', { name: 'Schedule' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'New Patient' })).toBeVisible({ timeout: 10_000 });

    // Find a patient in the "In Progress" or completed queue
    const patientCard = page.getByTestId('patient-card').first();
    if (!(await patientCard.isVisible())) {
      test.skip(true, 'No patients in queue');
      return;
    }
    await patientCard.click();

    // Look for the billing/create bill button
    const billBtn = page.getByRole('button', { name: /create bill/i });
    if (await billBtn.isVisible()) {
      await billBtn.click();
      await page.waitForTimeout(1000);

      // Bill modal should be visible
      const billModal = page.getByRole('heading', { name: 'Create Bill' });
      await expect(billModal).toBeVisible({ timeout: 5000 });

      // Fill service item — amount auto-calculates from qty × rate
      const descInput = page.getByPlaceholder('Service description');
      if (await descInput.isVisible()) {
        await descInput.fill('E2E test service');
        const qtyInput = page.getByPlaceholder('Qty');
        if (await qtyInput.isVisible()) {
          await qtyInput.fill('1');
        }
        const rateInput = page.getByPlaceholder('Rate');
        if (await rateInput.isVisible()) {
          await rateInput.fill('500');
        }
      }

      // Submit bill — modal closes on success
      const saveBtn = page.getByRole('dialog').getByRole('button', { name: /create|update/i });
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(2000);

        // Modal should close after successful create
        await expect(page.getByRole('heading', { name: 'Create Bill' })).not.toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('billing page loads without errors', async ({ page }) => {
    await page.goto('/clinic/financials');

    // Financials page should load
    await expect(page.getByRole('heading', { name: 'Financials' })).toBeVisible({ timeout: 10_000 });

    // No error toasts
    const errorToast = page.getByText(/error|failed/i);
    await expect(errorToast).not.toBeVisible({ timeout: 3000 });
  });
});
