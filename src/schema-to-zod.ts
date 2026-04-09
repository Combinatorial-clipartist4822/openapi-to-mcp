import type { OpenAPIV3 } from 'openapi-types';
import { z, type ZodType } from 'zod';

type SchemaObject = OpenAPIV3.SchemaObject;
type SchemaOrRef = OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;

function isSchema(v: SchemaOrRef): v is SchemaObject {
  return !('$ref' in v);
}

/**
 * Converts an OpenAPI JSON Schema to a Zod schema.
 * Expects all $refs to be resolved before calling this function.
 */
export function jsonSchemaToZod(schema: SchemaOrRef): ZodType {
  if (!isSchema(schema)) return z.unknown();

  // Handle allOf — merge all schemas into a single object
  if (schema.allOf) {
    const merged: SchemaObject = {
      type: 'object',
      properties: {},
      required: [],
    };
    for (const sub of schema.allOf) {
      if (!isSchema(sub)) continue;
      if (sub.properties) {
        merged.properties = { ...merged.properties, ...sub.properties };
      }
      if (sub.required) {
        merged.required = [...(merged.required ?? []), ...sub.required];
      }
    }
    return jsonSchemaToZod(merged);
  }

  // Handle oneOf/anyOf — use z.union if multiple, otherwise convert the single schema
  if (schema.oneOf || schema.anyOf) {
    const variants = (schema.oneOf ?? schema.anyOf)!;
    if (variants.length === 1) {
      return jsonSchemaToZod(variants[0]);
    }
    const schemas = variants.map((v) => jsonSchemaToZod(v));
    return z.union(schemas);
  }

  let zodSchema: ZodType;

  switch (schema.type) {
    case 'string': {
      let s = z.string();
      if (schema.description) s = s.describe(schema.description);
      if (schema.enum) {
        zodSchema = z.enum(schema.enum);
        if (schema.description)
          zodSchema = zodSchema.describe(schema.description);
        break;
      }
      zodSchema = s;
      break;
    }

    case 'integer': {
      let n = z.number().int();
      if (schema.description) n = n.describe(schema.description);
      if (schema.minimum !== undefined) n = n.min(schema.minimum);
      if (schema.maximum !== undefined) n = n.max(schema.maximum);
      zodSchema = n;
      break;
    }

    case 'number': {
      let n = z.number();
      if (schema.description) n = n.describe(schema.description);
      if (schema.minimum !== undefined) n = n.min(schema.minimum);
      if (schema.maximum !== undefined) n = n.max(schema.maximum);
      zodSchema = n;
      break;
    }

    case 'boolean': {
      zodSchema = z.boolean();
      if (schema.description)
        zodSchema = zodSchema.describe(schema.description);
      break;
    }

    case 'array': {
      const itemSchema = schema.items
        ? jsonSchemaToZod(schema.items)
        : z.unknown();
      zodSchema = z.array(itemSchema);
      if (schema.description)
        zodSchema = zodSchema.describe(schema.description);
      break;
    }

    case 'object': {
      if (schema.properties && Object.keys(schema.properties).length > 0) {
        const shape: Record<string, ZodType> = {};
        const requiredFields = new Set(schema.required ?? []);

        for (const [key, propSchema] of Object.entries(schema.properties)) {
          let fieldSchema = jsonSchemaToZod(propSchema);
          if (!requiredFields.has(key)) {
            fieldSchema = fieldSchema.optional();
          }
          shape[key] = fieldSchema;
        }

        zodSchema = z.object(shape);
      } else if (schema.additionalProperties) {
        // Free-form object with typed values
        const valueSchema =
          typeof schema.additionalProperties === 'object'
            ? jsonSchemaToZod(schema.additionalProperties)
            : z.unknown();
        zodSchema = z.record(z.string(), valueSchema);
      } else {
        // Generic object
        zodSchema = z.record(z.string(), z.unknown());
      }
      if (schema.description)
        zodSchema = zodSchema.describe(schema.description);
      break;
    }

    default: {
      zodSchema = z.unknown();
      if (schema.description)
        zodSchema = zodSchema.describe(schema.description);
      break;
    }
  }

  // Handle nullable
  if (schema.nullable) {
    zodSchema = zodSchema.nullable();
  }

  return zodSchema;
}
