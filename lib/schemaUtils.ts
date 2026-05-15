// src/lib/schemaUtils.ts
import * as z from "zod";

export type NoteFieldConfig = {
  name: string;
  label: string;
  type?: "input" | "textarea" | "prescription" | "vital_signs" | "tabular_eye" | "motor_examination" | "reflex_examination";
  rows?: number;
  placeholder?: string;
  mandatory?: boolean;
  section?: string;
};

export type FieldSection = {
  title: string;
  fields: NoteFieldConfig[];
};

// Registry for full UI configs, keyed by field name.
// Separated from Zod .describe() so that OpenAI's zodResponseFormat only sees clean semantic metadata.
const fieldUIRegistry = new Map<string, NoteFieldConfig>();

export function registerFieldUI(config: NoteFieldConfig): void {
  fieldUIRegistry.set(config.name, config);
}

/**
 * Enhanced Zod field with UI metadata.
 * Stores only { label, description } in .describe() for the LLM.
 * Registers the full UI config (type, rows, section, placeholder) in the fieldUIRegistry.
 */
export const zField = <T extends z.ZodTypeAny>(
  name: string,
  schema: T,
  config: Omit<NoteFieldConfig, "name">,
): T => {
  const fullConfig: NoteFieldConfig = { name, ...config };
  registerFieldUI(fullConfig);

  const llmDescription = config.placeholder || config.label;
  return schema.describe(JSON.stringify({ label: config.label, description: llmDescription }));
};

/**
 * Factory for textarea/text fields.
 * Switched to .nullable() for native OpenAI strict mode compatibility.
 */
export const textField = (
  name: string,
  label: string,
  section: string,
  rows: number,
  placeholder: string,
) => {
  return zField(name, z.string().nullable(), { label, section, type: "textarea", rows, placeholder });
};

/**
 * Factory for eye examination fields.
 */
export const createEyeField = (
  name: string,
  label: string,
  section = "Examination",
) => {
  return zField(
    name,
    z.object({
      left: z.string().nullable(),
      right: z.string().nullable(),
      notes: z.string().nullable(),
    }).nullable(),
    {
      label,
      type: "tabular_eye",
      section,
      placeholder: `Enter ${label.toLowerCase()} findings`,
    },
  );
};

/**
 * Extract UI configuration for a field. Reads from the fieldUIRegistry.
 */
export const extractFieldConfig = (
  fieldName: string,
  _schema?: z.ZodTypeAny,
): NoteFieldConfig | null => {
  return fieldUIRegistry.get(fieldName) ?? null;
};

export const getSectionsFromSchema = (
  schema: z.ZodObject<z.ZodRawShape>,
  sectionMapping: Record<string, string[]> = {},
): FieldSection[] => {
  const sections: Record<string, FieldSection> = {};

  Object.entries(sectionMapping).forEach(([sectionTitle]) => {
    sections[sectionTitle] = { title: sectionTitle, fields: [] };
  });

  const shape = schema.shape;
  Object.entries(shape).forEach(([fieldName, fieldSchema]) => {
    const config = extractFieldConfig(fieldName, fieldSchema as z.ZodTypeAny);
    if (config && config.section) {
      const sectionTitle = config.section;
      if (!sections[sectionTitle]) {
        sections[sectionTitle] = { title: sectionTitle, fields: [] };
      }
      sections[sectionTitle].fields.push(config);
    }
  });

  return Object.values(sections).filter((section) => section.fields.length > 0);
};

export const getAllFieldsFromSchema = (
  schema: z.ZodObject<z.ZodRawShape>,
): NoteFieldConfig[] => {
  const shape = schema.shape;
  return Object.entries(shape)
    .map(([fieldName, fieldSchema]) =>
      extractFieldConfig(fieldName, fieldSchema as z.ZodTypeAny),
    )
    .filter((config): config is NoteFieldConfig => config !== null);
};

export const getMandatoryFieldsFromSchema = (
  schema: z.ZodObject<z.ZodRawShape>,
): string[] => {
  return getAllFieldsFromSchema(schema)
    .filter((field) => field.mandatory)
    .map((field) => field.name);
};

export const BRIEF_THRESHOLD = 10;

/**
 * Safe string coercion.
 * Fallback is now null, not "NOT_SPECIFIED".
 */
export function safeString(val: unknown, fallback: string | null = null): string | null {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    console.warn("[safeString] expected string, received object:", val);
    return fallback;
  }
  return String(val);
}