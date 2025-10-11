import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Partner {
  id: string;
  publicId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  partnerType: string;
  industry: string | null;
  country: string;
}

interface Product {
  id: string;
  publicId: string;
  name: string;
  description: string | null;
  productType: string;
  price: number | null;
  priceRange: string | null;
  currency: string;
  city: string | null;
  country: string | null;
  isActive: boolean;
  partnerId: string;
  createdAt: string;
  updatedAt: string;
  partner: {
    id: string;
    name: string;
    publicId: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count: number;
  message?: string;
}

export const fetchPartners = async (): Promise<Partner[]> => {
  const response = await fetch('/api/partners');

  if (!response.ok) {
    throw new Error('Failed to fetch partners');
  }

  const result: ApiResponse<Partner[]> = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch partners');
  }

  return result.data;
};

export const fetchProductsByPartner = async (
  partnerId: string
): Promise<Product[]> => {
  const response = await fetch(`/api/products?partnerId=${partnerId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch products for partner');
  }

  const result: ApiResponse<Product[]> = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch products for partner');
  }

  return result.data;
};

// React Query hooks
export const usePartners = () => {
  return useQuery({
    queryKey: ['partners'],
    queryFn: fetchPartners,
  });
};

export const useProductsByPartner = (partnerId: string | null) => {
  return useQuery({
    queryKey: ['products', 'by-partner', partnerId],
    queryFn: () => fetchProductsByPartner(partnerId!),
    enabled: !!partnerId,
  });
};

interface CreateObjectiveRequest {
  title: string;
  question: string;
  partnerId: string;
  productId: string;
  llmModels: string[];
}

interface CreateEvaluationRequest {
  objectiveId: string;
}

interface Objective {
  id: string;
  publicId: string;
  title: string;
  question: string;
  partnerId: string;
  productId: string;
  isActive: boolean;
  llmModels: string[];
  createdAt: string;
  updatedAt: string;
  partner?: {
    id: string;
    name: string;
    publicId: string;
  };
  product?: {
    id: string;
    name: string;
    publicId: string;
  };
}

interface Evaluation {
  id: string;
  publicId: string;
  llmModel: string;
  status: string;
  score?: number;
  mentionFound: boolean;
  createdAt: string;
  updatedAt: string;
}

// API functions for creating objectives and evaluations
export const createObjective = async (
  data: CreateObjectiveRequest
): Promise<Objective> => {
  const response = await fetch('/api/objectives', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create objective');
  }

  const result: ApiResponse<Objective> = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Failed to create objective');
  }

  return result.data;
};

export const createEvaluations = async (
  data: CreateEvaluationRequest
): Promise<Evaluation[]> => {
  const response = await fetch('/api/evaluation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create evaluations');
  }

  const result: ApiResponse<Evaluation[]> = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Failed to create evaluations');
  }

  return result.data;
};

export const createEvaluationWorkflow = async (
  formData: CreateObjectiveRequest
): Promise<{
  objective: Objective;
  evaluations: Evaluation[];
}> => {
  const objective = await createObjective(formData);

  const evaluations = await createEvaluations({ objectiveId: objective.id });

  return { objective, evaluations };
};

export const useCreateEvaluationWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvaluationWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
