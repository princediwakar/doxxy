// Must mock before the module load — jest.mock is hoisted.
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn(function (this: any) {
    this.chat = { completions: { parse: jest.fn() } };
  }),
}));

jest.mock('openai/helpers/zod', () => ({
  zodResponseFormat: jest.fn((schema: unknown, name: string) => ({ schema, name })),
}));

import { TranscriptTooLongError, stripNotSpecified } from '@/lib/voice/structureClinicalNotes';

describe('TranscriptTooLongError', () => {
  it('includes the length and limit in the message', () => {
    const err = new TranscriptTooLongError(90_000, 80_000);
    expect(err.message).toContain('90000');
    expect(err.message).toContain('80000');
    expect(err.name).toBe('TranscriptTooLongError');
    expect(err.length).toBe(90_000);
    expect(err.limit).toBe(80_000);
  });
});

describe('stripNotSpecified', () => {
  it('returns null for null/undefined', () => {
    expect(stripNotSpecified(null)).toBeNull();
    expect(stripNotSpecified(undefined)).toBeNull();
  });

  it('returns null for "NOT_SPECIFIED" and empty/whitespace strings', () => {
    expect(stripNotSpecified('NOT_SPECIFIED')).toBeNull();
    expect(stripNotSpecified('')).toBeNull();
    expect(stripNotSpecified('   ')).toBeNull();
  });

  it('returns trimmed string for meaningful content', () => {
    expect(stripNotSpecified('Headache')).toBe('Headache');
    expect(stripNotSpecified('  Mild pain  ')).toBe('Mild pain');
  });

  it('filters null entries from arrays', () => {
    expect(stripNotSpecified(['NOT_SPECIFIED', 'Valid', '', null])).toEqual(['Valid']);
  });

  it('returns null for an array where every element is stripped', () => {
    expect(stripNotSpecified(['NOT_SPECIFIED', '', null])).toBeNull();
  });

  it('recursively cleans nested objects', () => {
    const input = {
      name: 'John',
      notes: 'NOT_SPECIFIED',
      nested: { a: 'ok', b: '' },
      empty: { x: 'NOT_SPECIFIED' },
    };

    const result = stripNotSpecified(input) as Record<string, unknown>;

    expect(result.name).toBe('John');
    expect(result.notes).toBeUndefined();
    expect(result.nested).toEqual({ a: 'ok' });
    expect(result.empty).toBeUndefined();
  });

  it('returns null for an object where every value is stripped', () => {
    expect(stripNotSpecified({ a: 'NOT_SPECIFIED', b: '' })).toBeNull();
  });

  it('passes through non-null primitives', () => {
    expect(stripNotSpecified(42)).toBe(42);
    expect(stripNotSpecified(true)).toBe(true);
  });

  it('handles arrays of objects', () => {
    const input = [{ name: 'OK' }, { name: 'NOT_SPECIFIED' }];
    const result = stripNotSpecified(input) as Array<Record<string, unknown>>;
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('OK');
  });
});
