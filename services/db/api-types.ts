import { z } from 'zod';
import { $Enums } from './types';

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

export const PartnerTypeEnum = z.enum($Enums.PartnerType);
export const ProductTypeEnum = z.enum($Enums.ProductType);
export const ObjectiveTypeEnum = z.enum($Enums.ObjectiveType);
export const LLMModelEnum = z.enum($Enums.LLMModel);
export const ExecutionStatusEnum = z.enum($Enums.ExecutionStatus);

export const BaseDocumentSchema = z.object({
  id: z.string(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const PartnerDataSchema = z.object({
  name: z.string().min(1, 'Partner name is required').max(200, 'Name too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  partnerType: PartnerTypeEnum,
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  country: z.string().max(100, 'Country name too long').default('US'),
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
  country: z.string(),
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
  partnerId: z.string(),
});

// =============================================================================
// PERSONA SCHEMAS
// =============================================================================

export const PersonaDataSchema = z.object({
  name: z.string().min(1, 'Persona name is required').max(200, 'Name too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  occupation: z.array(z.string()).min(1, 'At least one occupation is required'),
  technicalSkills: z
    .string()
    .min(1, 'Technical skills description is required'),
  goals: z.array(z.string()).min(1, 'At least one goal is required'),
  motivations: z
    .array(z.string())
    .min(1, 'At least one motivation is required'),
});

// Request schemas
export const CreatePersonaRequestSchema = PersonaDataSchema;
export const UpdatePersonaRequestSchema = PersonaDataSchema.partial();

// Response schema (includes MongoDB fields)
export const PersonaResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  occupation: z.array(z.string()),
  technicalSkills: z.string(),
  goals: z.array(z.string()),
  motivations: z.array(z.string()),
  createdAt: z.string().datetime(),
});

// =============================================================================
// EXECUTION SCHEMAS
// =============================================================================

export const ExecutionDataSchema = z.object({
  partnerId: ObjectIdSchema,
  productId: ObjectIdSchema,
  objectiveId: ObjectIdSchema,
});

// Request schemas
export const CreateExecutionRequestSchema = ExecutionDataSchema;

// Response schema (includes MongoDB fields)
export const ExecutionResponseSchema = BaseDocumentSchema.extend({
  partnerId: z.string(),
  productId: z.string(),
  objectiveId: z.string(),
  status: ExecutionStatusEnum,
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
});

// =============================================================================
// QUESTION SCHEMAS
// =============================================================================

export const QuestionDataSchema = z.object({
  template: z.string().min(1, 'Question template is required'),
  placeholders: z.array(z.string()).default([]),
  objectiveId: ObjectIdSchema,
});

// Request schemas
export const CreateQuestionRequestSchema = QuestionDataSchema;
export const UpdateQuestionRequestSchema = QuestionDataSchema.partial();

// Response schema (includes MongoDB fields)
export const QuestionResponseSchema = z.object({
  id: z.string(),
  template: z.string(),
  placeholders: z.array(z.string()),
  objectiveId: z.string(),
});

// =============================================================================
// OBJECTIVE PARAMETER SCHEMAS
// =============================================================================

export const ObjectiveParameterDataSchema = z.object({
  key: z.string().min(1, 'Parameter key is required'),
  value: z.string().min(1, 'Parameter value is required'),
  objectiveId: ObjectIdSchema,
});

// Request schemas
export const CreateObjectiveParameterRequestSchema =
  ObjectiveParameterDataSchema;
export const UpdateObjectiveParameterRequestSchema =
  ObjectiveParameterDataSchema.partial();

// Response schema (includes MongoDB fields)
export const ObjectiveParameterResponseSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
  objectiveId: z.string(),
});

// =============================================================================
// TARGET SCHEMAS
// =============================================================================

export const TargetDataSchema = z.object({
  location: z.string().default('United States'),
  language: z.string().default('English'),
  personaId: ObjectIdSchema,
  executionId: ObjectIdSchema,
  objectiveId: ObjectIdSchema.optional(),
});

// Request schemas
export const CreateTargetRequestSchema = TargetDataSchema;
export const UpdateTargetRequestSchema = TargetDataSchema.partial();

// Response schema (includes MongoDB fields)
export const TargetResponseSchema = z.object({
  id: z.string(),
  location: z.string(),
  language: z.string(),
  personaId: z.string(),
  executionId: z.string(),
  objectiveId: z.string().nullable(),
});

// =============================================================================
// OBJECTIVE SCHEMAS
// =============================================================================

// Core objective business data (client input)
export const ObjectiveDataSchema = z.object({
  type: ObjectiveTypeEnum,
  title: z
    .string()
    .min(1, 'Objective title is required')
    .max(200, 'Title too long'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description too long'),
  models: z.array(LLMModelEnum).min(1, 'At least one LLM model is required'),
  partnerId: ObjectIdSchema.optional(),
});

// Request schemas
export const CreateObjectiveRequestSchema = ObjectiveDataSchema;
export const UpdateObjectiveRequestSchema =
  ObjectiveDataSchema.partial().extend({
    isActive: z.boolean().optional(),
  });

// Response schema (includes MongoDB fields)
export const ObjectiveResponseSchema = BaseDocumentSchema.extend({
  type: ObjectiveTypeEnum,
  title: z.string(),
  description: z.string(),
  models: z.array(LLMModelEnum),
  partnerId: z.string().nullable(),
});

// =============================================================================
// ANSWER SCHEMAS
// =============================================================================

export const AnswerDataSchema = z.object({
  originalQuestion: z.string().min(1, 'Original question is required'),
  answerText: z.string().min(1, 'Answer text is required'),
  model: LLMModelEnum,
  tokensUsed: z.number().int().positive().optional(),
  processingTime: z.number().int().positive().optional(),
  questionId: ObjectIdSchema,
  executionId: ObjectIdSchema,
});

// Request schemas
export const CreateAnswerRequestSchema = AnswerDataSchema;

// Response schema (includes MongoDB fields)
export const AnswerResponseSchema = z.object({
  id: z.string(),
  originalQuestion: z.string(),
  answerText: z.string(),
  model: LLMModelEnum,
  tokensUsed: z.number().nullable(),
  processingTime: z.number().nullable(),
  questionId: z.string(),
  executionId: z.string(),
  createdAt: z.string().datetime(),
});

// =============================================================================
// INSIGHT SCHEMAS
// =============================================================================

export const InsightDataSchema = z.object({
  mentioned: z.boolean().default(false),
  ranking: z.number().int().positive().optional(),
  totalItems: z.number().int().nonnegative().optional(),
  mentionContext: z.string().optional(),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).optional(),
  answerId: ObjectIdSchema,
  executionId: ObjectIdSchema,
});

// Request schemas
export const CreateInsightRequestSchema = InsightDataSchema;

// Response schema (includes MongoDB fields)
export const InsightResponseSchema = z.object({
  id: z.string(),
  mentioned: z.boolean(),
  ranking: z.number().nullable(),
  totalItems: z.number().nullable(),
  mentionContext: z.string().nullable(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  confidence: z.number().nullable(),
  answerId: z.string(),
  executionId: z.string(),
  createdAt: z.string().datetime(),
});

// =============================================================================
// DASHBOARD SCHEMAS
// =============================================================================

export const DashboardStatsSchema = z.object({
  totalPartners: z.number().int().nonnegative(),
  activeObjectives: z.number().int().nonnegative(),
  totalExecutions: z.number().int().nonnegative(),
  successRate: z.number().min(0).max(100),
});

export const RecentExecutionSchema = z.object({
  id: z.string(),
  partnerName: z.string(),
  productName: z.string(),
  objectiveTitle: z.string(),
  status: ExecutionStatusEnum,
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
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
export type ObjectiveType = z.infer<typeof ObjectiveTypeEnum>;
export type LLMModel = z.infer<typeof LLMModelEnum>;
export type ExecutionStatus = z.infer<typeof ExecutionStatusEnum>;

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

// Persona types
export type PersonaData = z.infer<typeof PersonaDataSchema>;
export type CreatePersonaRequest = z.infer<typeof CreatePersonaRequestSchema>;
export type UpdatePersonaRequest = z.infer<typeof UpdatePersonaRequestSchema>;
export type PersonaResponse = z.infer<typeof PersonaResponseSchema>;

// Execution types
export type ExecutionData = z.infer<typeof ExecutionDataSchema>;
export type CreateExecutionRequest = z.infer<
  typeof CreateExecutionRequestSchema
>;
export type ExecutionResponse = z.infer<typeof ExecutionResponseSchema>;

// Answer types
export type AnswerData = z.infer<typeof AnswerDataSchema>;
export type CreateAnswerRequest = z.infer<typeof CreateAnswerRequestSchema>;
export type AnswerResponse = z.infer<typeof AnswerResponseSchema>;

// Insight types
export type InsightData = z.infer<typeof InsightDataSchema>;
export type CreateInsightRequest = z.infer<typeof CreateInsightRequestSchema>;
export type InsightResponse = z.infer<typeof InsightResponseSchema>;

// Question types
export type QuestionData = z.infer<typeof QuestionDataSchema>;
export type CreateQuestionRequest = z.infer<typeof CreateQuestionRequestSchema>;
export type UpdateQuestionRequest = z.infer<typeof UpdateQuestionRequestSchema>;
export type QuestionResponse = z.infer<typeof QuestionResponseSchema>;

// ObjectiveParameter types
export type ObjectiveParameterData = z.infer<
  typeof ObjectiveParameterDataSchema
>;
export type CreateObjectiveParameterRequest = z.infer<
  typeof CreateObjectiveParameterRequestSchema
>;
export type UpdateObjectiveParameterRequest = z.infer<
  typeof UpdateObjectiveParameterRequestSchema
>;
export type ObjectiveParameterResponse = z.infer<
  typeof ObjectiveParameterResponseSchema
>;

// Target types
export type TargetData = z.infer<typeof TargetDataSchema>;
export type CreateTargetRequest = z.infer<typeof CreateTargetRequestSchema>;
export type UpdateTargetRequest = z.infer<typeof UpdateTargetRequestSchema>;
export type TargetResponse = z.infer<typeof TargetResponseSchema>;

// Dashboard types
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
export type RecentExecution = z.infer<typeof RecentExecutionSchema>;

// Utility types
export type IdParams = z.infer<typeof IdParamsSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
