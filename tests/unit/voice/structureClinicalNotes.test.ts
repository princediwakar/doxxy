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

import { TranscriptTooLongError } from '@/lib/voice/structureClinicalNotes';
import { mapSchemaToOutput } from '@/lib/voice/structureUtils';

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

describe('mapSchemaToOutput', () => {
  it('maps chief_complaint → symptoms', () => {
    const { output } = mapSchemaToOutput({ chief_complaint: 'Headache', _clinical_reasoning: 'test' });
    expect(output.symptoms).toBe('Headache');
  });

  it('maps diagnosis → diagnosis', () => {
    const { output } = mapSchemaToOutput({ diagnosis: 'Migraine', _clinical_reasoning: 'test' });
    expect(output.diagnosis).toBe('Migraine');
  });

  it('maps treatment → advice (preferring treatment over therapy_plan)', () => {
    const { output } = mapSchemaToOutput({
      treatment: 'Rest and hydration',
      therapy_plan: 'PT 3x/week',
      _clinical_reasoning: 'test',
    });
    expect(output.advice).toBe('Rest and hydration');
  });

  it('maps therapy_plan → advice when treatment is absent', () => {
    const { output } = mapSchemaToOutput({
      therapy_plan: 'Physical therapy',
      _clinical_reasoning: 'test',
    });
    expect(output.advice).toBe('Physical therapy');
  });

  it('maps follow_up → follow_up', () => {
    const { output } = mapSchemaToOutput({ follow_up: '2 weeks', _clinical_reasoning: 'test' });
    expect(output.follow_up).toBe('2 weeks');
  });

  it('maps prescriptions → prescriptions', () => {
    const { output } = mapSchemaToOutput({
      prescriptions: [{ name: 'Paracetamol', dosage: '500mg' }],
      _clinical_reasoning: 'test',
    });
    expect(output.prescriptions).toEqual([{ name: 'Paracetamol', dosage: '500mg' }]);
  });

  it('routes unknown fields to rawFields, excluding _clinical_reasoning', () => {
    const { output } = mapSchemaToOutput({
      chief_complaint: 'Fever',
      vital_signs: { temperature: '101' },
      _clinical_reasoning: 'Reasoning here',
      custom_field: 'value',
    });
    expect(output.rawFields).toEqual({
      vital_signs: { temperature: '101' },
      custom_field: 'value',
    });
  });

  it('returns undefined rawFields when there are no extra fields', () => {
    const { output } = mapSchemaToOutput({
      chief_complaint: 'Cough',
      _clinical_reasoning: 'test',
    });
    expect(output.rawFields).toBeUndefined();
  });

  it('returns null for missing top-level fields', () => {
    const { output } = mapSchemaToOutput({ _clinical_reasoning: 'test' });
    expect(output.symptoms).toBeNull();
    expect(output.diagnosis).toBeNull();
    expect(output.advice).toBeNull();
    expect(output.follow_up).toBeNull();
  });

  it('returns empty confidence array', () => {
    const { confidence } = mapSchemaToOutput({ _clinical_reasoning: 'test' });
    expect(confidence).toEqual([]);
  });
});
