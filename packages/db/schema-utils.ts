import { z } from 'zod';
import {
  BaseDocumentSchema,
  PartnerDataSchema,
  ProductDataSchema,
  ObjectiveDataSchema,
  EvaluationDataSchema,
} from './api-types.js';

export function createResponseSchema<T extends z.ZodRawShape>(
  dataSchema: z.ZodObject<T>
) {
  return BaseDocumentSchema.merge(dataSchema);
}

export function createRequestSchema<T extends z.ZodRawShape>(
  dataSchema: z.ZodObject<T>
) {
  return dataSchema;
}

export function createUpdateSchema<T extends z.ZodRawShape>(
  dataSchema: z.ZodObject<T>
) {
  return dataSchema.partial().extend({
    isActive: z.boolean().optional(),
  });
}

// Response schemas are now defined in api-types.ts to avoid duplication
// These utility functions can be used to create additional response schemas as needed

export function transformToApiResponse<T extends Record<string, any>>(
  prismaDoc: T
): T & { createdAt: string; updatedAt: string } {
  return {
    ...prismaDoc,
    createdAt: prismaDoc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: prismaDoc.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

export function transformArrayToApiResponse<T extends Record<string, any>>(
  docs: T[]
): (T & { createdAt: string; updatedAt: string })[] {
  return docs.map(transformToApiResponse);
}

export function validateApiData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string = 'data'
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues
      .map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');

    throw new Error(`Invalid ${context}: ${errors}`);
  }

  return result.data;
}

export function createSafeValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => {
    const result = schema.safeParse(data);

    if (result.success) {
      return { success: true as const, data: result.data };
    } else {
      return {
        success: false as const,
        errors: result.error.issues.map((err: z.ZodIssue) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      };
    }
  };
}
