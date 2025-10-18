import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  totalPartners: number;
  activeObjectives: number;
  totalEvaluations: number;
  successRate: number;
}

interface RecentEvaluation {
  id: string;
  partnerName: string;
  productName: string;
  objectiveTitle: string;
  modelCount: number;
  totalModels: number;
  avgScore: number | null;
  status: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch('/api/dashboard/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  const result: ApiResponse<DashboardStats> = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch dashboard stats');
  }
  return result.data;
};

const fetchRecentEvaluations = async (
  limit = 5
): Promise<RecentEvaluation[]> => {
  const response = await fetch(
    `/api/dashboard/recent-evaluations?limit=${limit}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch recent evaluations');
  }
  const result: ApiResponse<RecentEvaluation[]> = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch recent evaluations');
  }
  return result.data;
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
  });
};

export const useRecentEvaluations = (limit = 5) => {
  return useQuery({
    queryKey: ['dashboard', 'recent-evaluations', limit],
    queryFn: () => fetchRecentEvaluations(limit),
  });
};
