process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.SARVAM_API_KEY = 'test-sarvam-key';

// jsdom doesn't ship TextEncoder; the jsdom test environment may not polyfill it.
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder: TE, TextDecoder: TD } = require('util');
  (global as any).TextEncoder = TE;
  (global as any).TextDecoder = TD;
}

// Prevent real next modules from loading in jsdom — they pull in
// Node web stream internals that aren't worth polyfilling.
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => []),
    set: jest.fn(),
  })),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// jsdom doesn't provide fetch; stub it so sarvamBatch tests can replace it.
if (typeof globalThis.fetch === 'undefined') {
  (globalThis as any).fetch = () =>
    Promise.reject(new Error('fetch not mocked — override in your test'));
}
