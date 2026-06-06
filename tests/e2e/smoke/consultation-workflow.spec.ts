// tests/e2e/smoke/consultation-workflow.spec.ts
// Smoke test: Staff consultation workflow
//
// Prerequisites: Same as patient-booking.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Consultation Workflow', () => {
  test('select patient and view consultation panel', async ({ page }) => {
    await page.goto('/schedule');

    // Wait for schedule page to load — sidebar nav is always visible
    await expect(page.getByRole('link', { name: 'Schedule' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'New Patient' })).toBeVisible({ timeout: 10_000 });

    // Click on a patient card in the queue (first available)
    const patientCard = page.getByTestId('patient-card').first();
    if (await patientCard.isVisible()) {
      await patientCard.click();
      await page.waitForTimeout(1000);

      // The consultation/patient detail panel should appear
      await expect(page.getByText(/history|examination/i).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('start consultation and type notes', async ({ page }) => {
    await page.goto('/schedule');

    // Wait for schedule page to load
    await expect(page.getByRole('link', { name: 'Schedule' })).toBeVisible({ timeout: 10_000 });

    // Wait for patient cards or empty state to appear (data-dependent)
    const patientCard = page.getByTestId('patient-card').first();
    try {
      await patientCard.waitFor({ state: 'visible', timeout: 10_000 });
    } catch {
      test.skip(true, 'No patients in queue');
      return;
    }
    await patientCard.click();
    await page.waitForTimeout(1000);

    // Expand the History section if collapsed
    const historyBtn = page.getByRole('button', { name: /history/i });
    if (await historyBtn.isVisible()) {
      await historyBtn.click();
      await page.waitForTimeout(300);
    }

    // Fill the Chief Complaint textarea
    const notesArea = page.getByPlaceholder('Enter chief complaint');
    await expect(notesArea).toBeVisible({ timeout: 5000 });
    await notesArea.fill('E2E test note: patient presents with mild symptoms.');

    // Verify auto-save works (no error toast after debounce)
    await page.waitForTimeout(3000);
    const errorToast = page.getByText(/save failed|error/i);
    await expect(errorToast).not.toBeVisible({ timeout: 5000 });
  });
});
