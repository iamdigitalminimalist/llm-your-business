// Shared API types for client-server communication
// These will be used when integrating the client package

// Generic API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Paginated API Response
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

// Error Response
export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode?: number;
}

// Request/Response types for major entities
export interface CreatePartnerRequest {
  name: string;
  description?: string;
  partnerType: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
  industry?: string;
}

export interface UpdatePartnerRequest extends Partial<CreatePartnerRequest> {
  isActive?: boolean;
}

export interface PartnerFilters {
  search?: string;
  type?: string;
  industry?: string;
  status?: 'active' | 'inactive';
  country?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  productType: string;
  price?: number;
  priceRange?: string;
  currency?: string;
  city?: string;
  country?: string;
  partnerId: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  isActive?: boolean;
}

export interface CreateObjectiveRequest {
  title: string;
  question: string;
  partnerId: string;
  productId: string;
  llmModels: string[];
}

export interface UpdateObjectiveRequest
  extends Partial<CreateObjectiveRequest> {
  isActive?: boolean;
}

// Dashboard stats types
export interface DashboardStats {
  totalPartners: number;
  activeObjectives: number;
  totalEvaluations: number;
  successRate: number;
}

export interface RecentEvaluation {
  id: string;
  partnerName: string;
  productName: string;
  objectiveTitle: string;
  modelCount: number;
  totalModels: number;
  avgScore?: number;
  status: string;
  createdAt: string;
}
