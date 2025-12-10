import { test, expect } from '@playwright/test';

// Note: These tests assume a test environment with mocked authentication
// In a real scenario, you would need to set up test users and data

test.describe('Patient Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to patients page (assuming authenticated)
    await page.goto('/patients');
  });

  test('should show patients list page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Patients' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New Patient' })).toBeVisible();
  });

  test('should open new patient modal', async ({ page }) => {
    await page.getByRole('button', { name: 'New Patient' }).click();

    // Check if modal opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'New Patient' })).toBeVisible();

    // Check form fields
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Gender')).toBeVisible();
    await expect(page.getByLabel('Age')).toBeVisible();
    await expect(page.getByLabel('Phone')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('should validate patient form', async ({ page }) => {
    await page.getByRole('button', { name: 'New Patient' }).click();

    // Try to submit empty form
    await page.getByRole('button', { name: 'Create Patient' }).click();

    // Should show validation errors
    await expect(page.getByText('Name must be at least 2 characters.')).toBeVisible();
  });

  test('should create new patient', async ({ page }) => {
    await page.getByRole('button', { name: 'New Patient' }).click();

    // Fill patient form
    await page.getByLabel('Name').fill('Test Patient');
    await page.getByText('Male').click();
    await page.getByLabel('Age').fill('30');
    await page.getByLabel('Phone').fill('9876543210');
    await page.getByLabel('Email').fill('test@example.com');

    // Submit form
    await page.getByRole('button', { name: 'Create Patient' }).click();

    // Should show success message and close modal
    await expect(page.getByRole('dialog')).not.toBeVisible();
    // In real test, you would check for toast notification
  });

  test('should search patients', async ({ page }) => {
    // Assuming there are existing patients
    const searchInput = page.getByPlaceholder('Search patients...');
    await expect(searchInput).toBeVisible();

    // Enter search term
    await searchInput.fill('Test');
    await searchInput.press('Enter');

    // Should show search results
    // In real test, you would check for filtered results
  });

  test('should view patient details', async ({ page }) => {
    // Click on a patient row (assuming there are patients)
    const firstPatientRow = page.locator('tbody tr').first();
    await firstPatientRow.click();

    // Should navigate to patient details page
    await expect(page).toHaveURL(/\/patients\/.+/);
    await expect(page.getByRole('heading', { name: 'Patient Details' })).toBeVisible();
  });

  test('should edit patient', async ({ page }) => {
    // Navigate to patient details
    await page.locator('tbody tr').first().click();

    // Click edit button
    await page.getByRole('button', { name: 'Edit' }).click();

    // Should open edit modal
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Edit Patient' })).toBeVisible();

    // Update patient information
    await page.getByLabel('Name').fill('Updated Name');
    await page.getByRole('button', { name: 'Update Patient' }).click();

    // Should show success message
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});

test.describe('Appointment Scheduling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/appointments');
  });

  test('should schedule new appointment', async ({ page }) => {
    await page.getByRole('button', { name: 'New Appointment' }).click();

    // Check appointment form
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'New Appointment' })).toBeVisible();

    // Form fields should be visible
    await expect(page.getByLabel('Patient')).toBeVisible();
    await expect(page.getByLabel('Doctor')).toBeVisible();
    await expect(page.getByLabel('Date')).toBeVisible();
    await expect(page.getByLabel('Time')).toBeVisible();
    await expect(page.getByLabel('Type')).toBeVisible();
  });

  test('should create new patient from appointment modal', async ({ page }) => {
    await page.getByRole('button', { name: 'New Appointment' }).click();

    // Click "Create new patient" in patient select
    await page.getByLabel('Patient').click();
    await page.getByText('Create new patient').click();

    // Should open patient modal
    await expect(page.getByRole('dialog', { name: 'New Patient' })).toBeVisible();
  });
});

test.describe('Consultation Flow', () => {
  test('should navigate to consultation from appointment', async ({ page }) => {
    // Go to appointments page
    await page.goto('/appointments');

    // Find an appointment with "Start Consultation" button
    const consultationButton = page.getByRole('button', { name: 'Start Consultation' }).first();
    await consultationButton.click();

    // Should navigate to consultation page
    await expect(page).toHaveURL(/\/consultation\/.+/);
    await expect(page.getByText('Medical Consultation')).toBeVisible();
  });

  test('should show consultation form sections', async ({ page }) => {
    // Navigate to consultation page (mocking appointment ID)
    await page.goto('/consultation/test-appointment-id');

    // Check for consultation sections
    await expect(page.getByText('History')).toBeVisible();
    await expect(page.getByText('Examination')).toBeVisible();
    await expect(page.getByText('Assessment & Plan')).toBeVisible();

    // Check for action buttons
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Complete' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Print' })).toBeVisible();
  });
});

test.describe('Billing Flow', () => {
  test('should create bill from appointment', async ({ page }) => {
    // Navigate to appointments
    await page.goto('/appointments');

    // Find appointment with "Create Bill" button
    const billButton = page.getByRole('button', { name: 'Create Bill' }).first();
    await billButton.click();

    // Should open billing modal
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Create Bill' })).toBeVisible();

    // Check billing form
    await expect(page.getByLabel('Patient')).toBeVisible();
    await expect(page.getByLabel('Invoice Number')).toBeVisible();
    await expect(page.getByText('Service Items')).toBeVisible();
  });

  test('should calculate bill totals', async ({ page }) => {
    // Open billing modal (mocking)
    await page.goto('/billing/create?appointmentId=test');

    // Add service item
    await page.getByRole('button', { name: 'Add Service' }).click();

    // Fill service item details
    await page.locator('input[name="service_items.0.description"]').fill('Consultation');
    await page.locator('input[name="service_items.0.quantity"]').fill('1');
    await page.locator('input[name="service_items.0.rate"]').fill('1000');

    // Should auto-calculate amount
    const amountInput = page.locator('input[name="service_items.0.amount"]');
    await expect(amountInput).toHaveValue('1000');

    // Check totals calculation
    await expect(page.getByText('Subtotal: ₹1000.00')).toBeVisible();
  });
});