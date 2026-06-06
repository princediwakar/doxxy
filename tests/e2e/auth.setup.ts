// tests/e2e/auth.setup.ts
// E2E authentication helper — signs in via Supabase API, then sets chunked
// cookies matching the @supabase/ssr v0.10.x format (base64url encoding +
// cookie chunking for large sessions).
//
// Requires the following env vars:
//   PLAYWRIGHT_TEST_EMAIL — test user email
//   PLAYWRIGHT_TEST_PASSWORD — test user password
//   NEXT_PUBLIC_SUPABASE_URL — Supabase project URL

import { test as setup, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { stringToBase64URL } from '@supabase/ssr/dist/module/utils/base64url.js';

const AUTH_FILE = 'tests/e2e/.auth/user.json';
const MAX_CHUNK_SIZE = 3180;

setup('authenticate', async ({ page }) => {
  const email = process.env.PLAYWRIGHT_TEST_EMAIL;
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error('PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD must be set');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];

  const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    throw new Error(`Auth failed: ${error?.message || 'No session'}`);
  }

  const cookieName = `sb-${projectRef}-auth-token`;
  const sessionJson = JSON.stringify(data.session);
  const encoded = `base64-${stringToBase64URL(sessionJson)}`;

  // @supabase/ssr chunks cookies when encoded value exceeds MAX_CHUNK_SIZE.
  // It first URL-encodes (no-op for base64url alphabet), then splits.
  const cookieOptions = {
    domain: 'localhost',
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'Lax' as const,
  };

  if (encoded.length <= MAX_CHUNK_SIZE) {
    await page.context().addCookies([{ name: cookieName, value: encoded, ...cookieOptions }]);
  } else {
    // Chunked: cookies named key.0, key.1, etc. (no un-suffixed cookie)
    const chunks: { name: string; value: string }[] = [];
    for (let i = 0, pos = 0; pos < encoded.length; i++, pos += MAX_CHUNK_SIZE) {
      chunks.push({
        name: `${cookieName}.${i}`,
        value: encoded.slice(pos, pos + MAX_CHUNK_SIZE),
      });
    }
    await page.context().addCookies(chunks.map((c) => ({ ...c, ...cookieOptions })));
  }

  await page.goto('/schedule');

  await expect(page).not.toHaveURL(/\/auth/);

  await page.context().storageState({ path: AUTH_FILE });
});

export { AUTH_FILE };
