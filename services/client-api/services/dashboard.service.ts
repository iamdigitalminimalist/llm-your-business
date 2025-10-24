import { executionRepository } from '../repositories/execution.repository';
import { objectiveRepository } from '../repositories/objective.repository';
import { partnerRepository } from '../repositories/partner.repository';
import type {
  Execution,
  Partner,
  Product,
  Objective,
  Insight,
} from '@shared/db/types';

type ExecutionWithRelations = Execution & {
  partner: Pick<Partner, 'id' | 'name'>;
  product: Pick<Product, 'id' | 'name'>;
  objective: Pick<Objective, 'id' | 'title'>;
  insights: Insight[];
};

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
  createdAt: Date;
}

export const dashboardService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    console.info('📊 Calculating dashboard statistics...');

    // Get all partners
    const partners = await partnerRepository.getPartners();
    const totalPartners = partners.filter((p) => p.isActive).length;

    // Get all objectives
    const objectives = await objectiveRepository.getObjectives();
    const activeObjectives = objectives.filter((o) => o.isActive).length;

    // Get all executions
    const executions = await executionRepository.getExecutions();
    const totalExecutions = executions.length;

    // Calculate success rate (completed executions)
    const successfulExecutions = executions.filter(
      (e: Execution) => e.status === 'COMPLETED'
    ).length;

    const successRate =
      totalExecutions > 0
        ? Math.round((successfulExecutions / totalExecutions) * 100)
        : 0;

    console.info('✅ Dashboard stats calculated', {
      totalPartners,
      activeObjectives,
      totalEvaluations: totalExecutions,
      successRate,
    });

    return {
      totalPartners,
      activeObjectives,
      totalEvaluations: totalExecutions,
      successRate,
    };
  },

  getRecentEvaluations: async (
    limit: number = 5
  ): Promise<RecentEvaluation[]> => {
    console.info('📋 Fetching recent executions...', { limit });

    const executions = await executionRepository.getExecutions();

    // For now, return a simplified version since executions have a different structure
    // This would need to be properly implemented based on the new execution/insight flow
    const recentEvaluations: RecentEvaluation[] = executions
      .slice(0, limit)
      .map((execution: ExecutionWithRelations) => ({
        id: execution.id,
        partnerName: 'Partner', // Would need to include partner relation
        productName: 'Product', // Would need to include product relation
        objectiveTitle: 'Objective', // Would need to include objective relation
        modelCount: 0,
        totalModels: 1,
        avgScore: null,
        status: execution.status,
        createdAt: execution.startedAt,
      }));

    console.info(`✅ Retrieved ${recentEvaluations.length} recent executions`);

    return recentEvaluations;
  },
};
