import { test } from '@playwright/test';

test.describe('Page Dump', () => {
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  test('show schedule page content', async ({ page }) => {
    await page.goto('/schedule', { waitUntil: 'networkidle', timeout: 30_000 });
    
    console.log('URL:', page.url());
    
    const headings = await page.locator('h1, h2, h3, h4').allTextContents();
    console.log('HEADINGS:', headings);
    
    const buttons = await page.locator('button:visible').allTextContents();
    console.log('BUTTONS:', buttons.slice(0, 15));
    
    // Get all visible text content, cleaned up
    const bodyText = await page.locator('body').innerText();
    console.log('BODY TEXT (first 2000 chars):');
    console.log(bodyText.substring(0, 2000));
  });
});
