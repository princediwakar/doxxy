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
 * Factory for textarea/text fields to reduce boilerplate
 */
export const textField = (
  name: string,
  label: string,
  section: string,
  rows: number,
  placeholder: string
) => {
  return zField(z.string().optional(), { label, section, type: "textarea", rows, placeholder });
};

/**
 * Factory for creating eye examination fields with consistent metadata
 */
export const createEyeField = (
  name: string,
  label: string
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
      placeholder: `Enter ${label.toLowerCase()} findings`,
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

// ============================================================================
// Zod → OpenAI JSON Schema Converter
// ============================================================================

type JsonSchema = {
  type?: string | string[];
  description?: string;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  enum?: string[];
  required?: string[];
  additionalProperties?: boolean;
};

function getFieldDescription(schema: z.ZodTypeAny): string | undefined {
  try {
    const desc = schema.description;
    if (!desc) return undefined;
    const meta = JSON.parse(desc) as { label?: string; placeholder?: string };
    return meta.label;
  } catch {
    return undefined;
  }
}

function zodToJsonSchemaInner(schema: z.ZodTypeAny): JsonSchema {
  const def = schema._def;

  // Unwrap optional — propagate description from the outer type (zField wraps .optional())
  // For OpenAI strict mode, make the inner type nullable (["string", "null"]) since
  // all properties must appear in "required" — optionality is expressed via nullability.
  if (def.typeName === 'ZodOptional') {
    const innerResult = zodToJsonSchemaInner(def.innerType);
    if (!innerResult.description) {
      const outerDesc = getFieldDescription(schema);
      if (outerDesc) innerResult.description = outerDesc;
    }
    // Convert type to nullable union: "string" → ["string", "null"]
    if (innerResult.type && !Array.isArray(innerResult.type)) {
      innerResult.type = [innerResult.type, 'null'];
    }
    // If it's an enum, we MUST add null to the enum array so OpenAI accepts it as a valid choice
    if (innerResult.enum && !innerResult.enum.includes(null as any)) {
      innerResult.enum.push(null as any);
    }
    return innerResult;
  }

  if (def.typeName === 'ZodString') {
    const result: JsonSchema = { type: 'string' };
    const desc = getFieldDescription(schema);
    if (desc) result.description = desc;
    return result;
  }

  if (def.typeName === 'ZodEnum') {
    const result: JsonSchema = { type: 'string', enum: [...def.values] };
    const desc = getFieldDescription(schema);
    if (desc) result.description = desc;
    return result;
  }

  if (def.typeName === 'ZodObject') {
    const shape = def.shape() as Record<string, z.ZodTypeAny>;
    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToJsonSchemaInner(value);
      // OpenAI strict mode requires all properties to be in "required"
      required.push(key);
    }

    const result: JsonSchema = {
      type: 'object',
      properties,
      required,
      additionalProperties: false,
    };
    const desc = getFieldDescription(schema);
    if (desc) result.description = desc;
    return result;
  }

  if (def.typeName === 'ZodArray') {
    const result: JsonSchema = {
      type: 'array',
      items: zodToJsonSchemaInner(def.type),
    };
    const desc = getFieldDescription(schema);
    if (desc) result.description = desc;
    return result;
  }

  // Fallback for unsupported types (ZodEffects, ZodUnion, etc.)
  return { };
}

export function zodToJsonSchema(schema: z.ZodObject<z.ZodRawShape>): JsonSchema {
  return zodToJsonSchemaInner(schema);
}