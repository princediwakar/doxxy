// src/lib/schemaUtils.ts
import * as z from "zod";

export type NoteFieldConfig = {
  name: string;
  label: string;
  type: "input" | "textarea" | "prescription" | "vital_signs" | "tabular_eye" | "motor_examination" | "reflex_examination";
  rows?: number;
  placeholder?: string;
  mandatory?: boolean;
  section?: string;
};

export type FieldSection = {
  title: string;
  fields: NoteFieldConfig[];
};

/**
 * Enhanced Zod field with UI metadata
 */
export const zField = <T extends z.ZodTypeAny>(
  schema: T,
  config: Omit<NoteFieldConfig, 'name'>
): T => {
  return schema.describe(JSON.stringify(config));
};

/**
 * Factory for creating eye examination fields with consistent metadata
 */
export const createEyeField = (
  label: string,
  placeholder?: string
) => {
  return zField(
    z.object({
      left: z.string().optional(),
      right: z.string().optional(),
      notes: z.string().optional(),
    }).optional(),
    {
      label,
      type: "tabular_eye",
      placeholder: placeholder || `Enter ${label.toLowerCase()} findings`,
    }
  );
};

/**
 * Extract UI configuration from Zod schema metadata
 */
export const extractFieldConfig = (
  fieldName: string,
  schema: z.ZodTypeAny
): NoteFieldConfig | null => {
  try {
    const description = schema.description;
    if (!description) return null;

    const config = JSON.parse(description) as Omit<NoteFieldConfig, 'name'>;
    return {
      name: fieldName,
      ...config,
    };
  } catch {
    return null;
  }
};

/**
 * Bridge function to convert schema metadata to the legacy field sections format
 */
export const getSectionsFromSchema = (
  schema: z.ZodObject<z.ZodRawShape>,
  sectionMapping: Record<string, string[]> = {}
): FieldSection[] => {
  const sections: Record<string, FieldSection> = {};

  // Initialize sections from mapping if provided
  Object.entries(sectionMapping).forEach(([sectionTitle]) => {
    sections[sectionTitle] = {
      title: sectionTitle,
      fields: [],
    };
  });

  // Extract field configurations from schema
  const shape = schema.shape;
  Object.entries(shape).forEach(([fieldName, fieldSchema]) => {
    const config = extractFieldConfig(fieldName, fieldSchema as z.ZodTypeAny);
    if (config && config.section) {
      // Use the section from the field configuration
      const sectionTitle = config.section;

      // Initialize section if it doesn't exist
      if (!sections[sectionTitle]) {
        sections[sectionTitle] = {
          title: sectionTitle,
          fields: [],
        };
      }

      // Add field to the appropriate section
      sections[sectionTitle].fields.push(config);
    }
  });

  return Object.values(sections).filter(section => section.fields.length > 0);
};

/**
 * Helper to get all fields from a schema
 */
export const getAllFieldsFromSchema = (
  schema: z.ZodObject<z.ZodRawShape>
): NoteFieldConfig[] => {
  const shape = schema.shape;
  return Object.entries(shape)
    .map(([fieldName, fieldSchema]) =>
      extractFieldConfig(fieldName, fieldSchema as z.ZodTypeAny)
    )
    .filter((config): config is NoteFieldConfig => config !== null);
};

/**
 * Helper to get mandatory fields from a schema
 */
export const getMandatoryFieldsFromSchema = (
  schema: z.ZodObject<z.ZodRawShape>
): string[] => {
  const allFields = getAllFieldsFromSchema(schema);
  return allFields
    .filter(field => field.mandatory)
    .map(field => field.name);
};