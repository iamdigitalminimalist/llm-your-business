import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface Partner {
  id: string;
  publicId: string;
  name: string;
  description?: string;
  partnerType:
    | 'RESTAURANT'
    | 'TECH'
    | 'RETAIL'
    | 'SERVICE'
    | 'HEALTHCARE'
    | 'EDUCATION'
    | 'OTHER';
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
  industry?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
    objectives: number;
    evaluations: number;
  };
}

export interface PartnerFilters {
  search?: string;
  type?: string;
  industry?: string;
  status?: 'active' | 'inactive' | 'all';
  country?: string;
}

export interface PartnerStats {
  totalPartners: number;
  activePartners: number;
  partnersByType: Record<string, number>;
  partnersByIndustry: Record<string, number>;
  recentlyAdded: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Functions
export const fetchPartners = async (
  filters: PartnerFilters = {},
  page = 1,
  limit = 12
): Promise<PaginatedResponse<Partner>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters.search) params.append('search', filters.search);
  if (filters.type) params.append('type', filters.type);
  if (filters.industry) params.append('industry', filters.industry);
  if (filters.status && filters.status !== 'all') {
    params.append('isActive', (filters.status === 'active').toString());
  }
  if (filters.country) params.append('country', filters.country);

  const response = await fetch(`/api/partners?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch partners');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch partners');
  }

  return result;
};

export const fetchPartnerStats = async (): Promise<PartnerStats> => {
  const response = await fetch('/api/partners/stats');

  if (!response.ok) {
    throw new Error('Failed to fetch partner statistics');
  }

  const result: ApiResponse<PartnerStats> = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch partner statistics');
  }

  return result.data;
};

export const fetchPartner = async (id: string): Promise<Partner> => {
  const response = await fetch(`/api/partners/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch partner');
  }

  const result: ApiResponse<Partner> = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch partner');
  }

  return result.data;
};

export const deletePartner = async (id: string): Promise<void> => {
  const response = await fetch(`/api/partners/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete partner');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Failed to delete partner');
  }
};

export const updatePartnerStatus = async (
  id: string,
  isActive: boolean
): Promise<Partner> => {
  const response = await fetch(`/api/partners/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isActive }),
  });

  if (!response.ok) {
    throw new Error('Failed to update partner status');
  }

  const result: ApiResponse<Partner> = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Failed to update partner status');
  }

  return result.data;
};

// React Query Hooks
export const usePartners = (
  filters: PartnerFilters = {},
  page = 1,
  limit = 12
) => {
  return useQuery({
    queryKey: ['partners', filters, page, limit],
    queryFn: () => fetchPartners(filters, page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePartnerStats = () => {
  return useQuery({
    queryKey: ['partners', 'stats'],
    queryFn: fetchPartnerStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePartner = (id: string) => {
  return useQuery({
    queryKey: ['partners', id],
    queryFn: () => fetchPartner(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDeletePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePartner,
    onSuccess: () => {
      // Invalidate and refetch partners list
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdatePartnerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updatePartnerStatus(id, isActive),
    onSuccess: (updatedPartner) => {
      // Update the partner in the cache
      queryClient.setQueryData(['partners', updatedPartner.id], updatedPartner);

      // Invalidate partners list to refresh
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// Helper functions for UI
export const getPartnerTypeLabel = (type: Partner['partnerType']): string => {
  const labels: Record<Partner['partnerType'], string> = {
    RESTAURANT: 'Restaurant',
    TECH: 'Technology',
    RETAIL: 'Retail',
    SERVICE: 'Service',
    HEALTHCARE: 'Healthcare',
    EDUCATION: 'Education',
    OTHER: 'Other',
  };
  return labels[type];
};

export const getPartnerTypeColor = (type: Partner['partnerType']): string => {
  const colors: Record<Partner['partnerType'], string> = {
    RESTAURANT: 'bg-orange-100 text-orange-800',
    TECH: 'bg-blue-100 text-blue-800',
    RETAIL: 'bg-purple-100 text-purple-800',
    SERVICE: 'bg-green-100 text-green-800',
    HEALTHCARE: 'bg-red-100 text-red-800',
    EDUCATION: 'bg-indigo-100 text-indigo-800',
    OTHER: 'bg-gray-100 text-gray-800',
  };
  return colors[type];
};
