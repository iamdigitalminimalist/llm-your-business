import { z } from 'zod';

export const ObjectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  });

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T
) =>
  z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      total: z.number().int().nonnegative(),
      totalPages: z.number().int().nonnegative(),
    }),
    message: z.string().optional(),
  });

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string(),
  statusCode: z.number().int().optional(),
});

export const PartnerTypeEnum = z.enum([
  'RESTAURANT',
  'TECH',
  'RETAIL',
  'SERVICE',
  'HEALTHCARE',
  'EDUCATION',
  'OTHER',
]);
export const ProductTypeEnum = z.enum([
  'PHYSICAL_PRODUCT',
  'SERVICE_LOCATION',
  'DIGITAL_SERVICE',
  'EXPERIENCE',
]);
export const LLMModelEnum = z.enum([
  'GPT_4O',
  'GPT_4O_MINI',
  'CLAUDE_3_5_SONNET',
  'GEMINI_PRO',
]);
export const EvaluationStatusEnum = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'TIMEOUT',
]);

export const BaseDocumentSchema = z.object({
  id: z.string(),
  publicId: z.string(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const PartnerDataSchema = z.object({
  name: z.string().min(1, 'Partner name is required').max(200, 'Name too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  partnerType: PartnerTypeEnum,
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  addressLine1: z.string().max(200, 'Address line 1 too long').optional(),
  addressLine2: z.string().max(200, 'Address line 2 too long').optional(),
  city: z.string().max(100, 'City name too long').optional(),
  state: z.string().max(100, 'State name too long').optional(),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country name too long'),
  postalCode: z.string().max(20, 'Postal code too long').optional(),
  industry: z.string().max(100, 'Industry too long').optional(),
});

// Request schemas (what client sends)
export const CreatePartnerRequestSchema = PartnerDataSchema;
export const UpdatePartnerRequestSchema = PartnerDataSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Response schema (what API returns - includes MongoDB fields)
export const PartnerResponseSchema = BaseDocumentSchema.extend({
  name: z.string(),
  description: z.string().nullable(),
  partnerType: PartnerTypeEnum,
  website: z.string().nullable(),
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  country: z.string(),
  postalCode: z.string().nullable(),
  industry: z.string().nullable(),
});

// Query filters
export const PartnerFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  industry: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  country: z.string().optional(),
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100)),
});

export const ProductDataSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Name too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  productType: ProductTypeEnum,
  price: z.number().positive('Price must be positive').optional(),
  priceRange: z.string().max(50, 'Price range too long').optional(),
  currency: z
    .string()
    .length(3, 'Currency must be 3 characters (ISO 4217)')
    .optional(),
  city: z.string().max(100, 'City name too long').optional(),
  country: z.string().max(100, 'Country name too long').optional(),
  partnerId: ObjectIdSchema,
});

// Request schemas
export const CreateProductRequestSchema = ProductDataSchema;
export const UpdateProductRequestSchema = ProductDataSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Response schema (includes MongoDB fields)
export const ProductResponseSchema = BaseDocumentSchema.extend({
  name: z.string(),
  description: z.string().nullable(),
  productType: ProductTypeEnum,
  price: z.number().nullable(),
  priceRange: z.string().nullable(),
  currency: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  partnerId: z.string(),
});

// =============================================================================
// OBJECTIVE SCHEMAS
// =============================================================================

// Core objective business data (client input)
export const ObjectiveDataSchema = z.object({
  title: z
    .string()
    .min(1, 'Objective title is required')
    .max(200, 'Title too long'),
  question: z
    .string()
    .min(1, 'Question is required')
    .max(2000, 'Question too long'),
  partnerId: ObjectIdSchema,
  productId: ObjectIdSchema,
  llmModels: z.array(LLMModelEnum).min(1, 'At least one LLM model is required'),
});

// Request schemas
export const CreateObjectiveRequestSchema = ObjectiveDataSchema;
export const UpdateObjectiveRequestSchema =
  ObjectiveDataSchema.partial().extend({
    isActive: z.boolean().optional(),
  });

// Response schema (includes MongoDB fields)
export const ObjectiveResponseSchema = BaseDocumentSchema.extend({
  title: z.string(),
  question: z.string(),
  partnerId: z.string(),
  productId: z.string(),
  llmModels: z.array(LLMModelEnum),
});

// =============================================================================
// EVALUATION SCHEMAS
// =============================================================================

// Core evaluation business data (client input)
export const EvaluationDataSchema = z.object({
  llmModel: LLMModelEnum,
  prompt: z.string().min(1, 'Prompt is required'),
  response: z.string().min(1, 'Response is required'),
  score: z.number().min(0).max(100).optional(),
  mentionFound: z.boolean().optional(),
  ranking: z.number().int().positive().optional(),
  totalCompetitors: z.number().int().nonnegative().optional(),
  recommendationLikelihood: z.number().min(0).max(100).optional(),
  competitiveStrengths: z.string().optional(),
  competitiveWeaknesses: z.string().optional(),
  marketPosition: z.string().optional(),
  keyDifferentiators: z.string().optional(),
  evaluation: z.string().optional(),
  objectiveId: ObjectIdSchema,
  partnerId: ObjectIdSchema,
  productId: ObjectIdSchema,
});

// Request schemas
export const CreateEvaluationRequestSchema = EvaluationDataSchema;

// Response schema (includes MongoDB fields + status)
export const EvaluationResponseSchema = BaseDocumentSchema.extend({
  llmModel: LLMModelEnum,
  prompt: z.string(),
  response: z.string(),
  score: z.number().nullable(),
  mentionFound: z.boolean().nullable(),
  ranking: z.number().nullable(),
  totalCompetitors: z.number().nullable(),
  recommendationLikelihood: z.number().nullable(),
  competitiveStrengths: z.string().nullable(),
  competitiveWeaknesses: z.string().nullable(),
  marketPosition: z.string().nullable(),
  keyDifferentiators: z.string().nullable(),
  evaluation: z.string().nullable(),
  status: EvaluationStatusEnum,
  objectiveId: z.string(),
  partnerId: z.string(),
  productId: z.string(),
});

// =============================================================================
// DASHBOARD SCHEMAS
// =============================================================================

export const DashboardStatsSchema = z.object({
  totalPartners: z.number().int().nonnegative(),
  activeObjectives: z.number().int().nonnegative(),
  totalEvaluations: z.number().int().nonnegative(),
  successRate: z.number().min(0).max(100),
});

export const RecentEvaluationSchema = z.object({
  id: z.string(),
  partnerName: z.string(),
  productName: z.string(),
  objectiveTitle: z.string(),
  modelCount: z.number().int().nonnegative(),
  totalModels: z.number().int().positive(),
  avgScore: z.number().min(0).max(100).optional(),
  status: EvaluationStatusEnum,
  createdAt: z.string().datetime(),
});

// =============================================================================
// REQUEST PARAMETER SCHEMAS
// =============================================================================

export const IdParamsSchema = z.object({
  id: ObjectIdSchema,
});

export const PaginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100)),
});

// =============================================================================
// TYPE EXPORTS (Inferred from Zod schemas)
// =============================================================================

// Base types
export type BaseDocument = z.infer<typeof BaseDocumentSchema>;

// Generic response types
export type ApiResponse<T> = z.infer<
  ReturnType<typeof ApiResponseSchema<z.ZodType<T>>>
>;
export type PaginatedResponse<T> = z.infer<
  ReturnType<typeof PaginatedResponseSchema<z.ZodType<T>>>
>;
export type ApiError = z.infer<typeof ApiErrorSchema>;

// Enum types
export type PartnerType = z.infer<typeof PartnerTypeEnum>;
export type ProductType = z.infer<typeof ProductTypeEnum>;
export type LLMModel = z.infer<typeof LLMModelEnum>;
export type EvaluationStatus = z.infer<typeof EvaluationStatusEnum>;

// Partner types
export type PartnerData = z.infer<typeof PartnerDataSchema>;
export type CreatePartnerRequest = z.infer<typeof CreatePartnerRequestSchema>;
export type UpdatePartnerRequest = z.infer<typeof UpdatePartnerRequestSchema>;
export type PartnerFilters = z.infer<typeof PartnerFiltersSchema>;
export type PartnerResponse = z.infer<typeof PartnerResponseSchema>;

// Product types
export type ProductData = z.infer<typeof ProductDataSchema>;
export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;
export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>;
export type ProductResponse = z.infer<typeof ProductResponseSchema>;

// Objective types
export type ObjectiveData = z.infer<typeof ObjectiveDataSchema>;
export type CreateObjectiveRequest = z.infer<
  typeof CreateObjectiveRequestSchema
>;
export type UpdateObjectiveRequest = z.infer<
  typeof UpdateObjectiveRequestSchema
>;
export type ObjectiveResponse = z.infer<typeof ObjectiveResponseSchema>;

// Evaluation types
export type EvaluationData = z.infer<typeof EvaluationDataSchema>;
export type CreateEvaluationRequest = z.infer<
  typeof CreateEvaluationRequestSchema
>;
export type EvaluationResponse = z.infer<typeof EvaluationResponseSchema>;

// Dashboard types
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
export type RecentEvaluation = z.infer<typeof RecentEvaluationSchema>;

// Utility types
export type IdParams = z.infer<typeof IdParamsSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
