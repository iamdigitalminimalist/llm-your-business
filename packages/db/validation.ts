import { z } from 'zod';
import type { ApiError } from './api-types.js';

// =============================================================================
// DATA TRANSFORMATION UTILITIES
// =============================================================================

export function transformToApiResponse<T extends Record<string, any>>(
  prismaDoc: T
): T & { createdAt: string; updatedAt: string } {
  return {
    ...prismaDoc,
    createdAt: prismaDoc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: prismaDoc.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

// Alias for easier usage in controllers
export const transformPrismaToApi = transformToApiResponse;

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

export function safeValidateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: ApiError } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.issues
        .map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');

      return {
        success: false,
        error: {
          success: false,
          error: 'Validation Error',
          message: formattedErrors,
          statusCode: 400,
        },
      };
    }

    return {
      success: false,
      error: {
        success: false,
        error: 'Internal Error',
        message: 'An unexpected error occurred during validation',
        statusCode: 500,
      },
    };
  }
}

// =============================================================================
// API RESPONSE HELPERS
// =============================================================================

export const createApiResponse = {
  success: <T>(data: T, message?: string) => ({
    success: true as const,
    data,
    message,
  }),

  error: (error: string, message: string, statusCode?: number): ApiError => ({
    success: false as const,
    error,
    message,
    statusCode,
  }),

  paginated: <T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message?: string
  ) => ({
    success: true as const,
    data,
    pagination,
    message,
  }),
};

/**
 * Extract and validate pagination parameters from query
 */
export function extractPagination(query: Record<string, any>) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
