import { executionRepository } from '../repositories/execution.repository';
import type {
  Execution,
  Partner,
  Product,
  Objective,
  Insight,
} from '@shared/db/types';

interface ExecutionFilters {
  partnerId?: string;
  productId?: string;
  objectiveId?: string;
}

interface CreateExecutionRequest {
  objectiveId: string;
  partnerId: string;
  productId: string;
}

type ExecutionWithRelations = Execution & {
  partner: Pick<Partner, 'id' | 'name'>;
  product: Pick<Product, 'id' | 'name'>;
  objective: Pick<Objective, 'id' | 'title'>;
  insights: Insight[];
};

export const executionService = {
  getExecutions: async (filters: ExecutionFilters = {}) => {
    // Map to executions since executions are now part of the execution flow
    const executions = await executionRepository.getExecutions(filters);

    return executions.map((execution: ExecutionWithRelations) => ({
      id: execution.id,
      partnerId: execution.partnerId,
      productId: execution.productId,
      objectiveId: execution.objectiveId,
      status: execution.status,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      // Basic compatibility fields
      hasScore: execution.insights && execution.insights.length > 0,
      isSuccessful: execution.status === 'COMPLETED',
    }));
  },

  createExecution: async (request: CreateExecutionRequest) => {
    console.info('🔍 Creating execution (execution)...', request);

    // Create an execution which will trigger the LLM execution flow
    const execution = await executionRepository.createExecution({
      partnerId: request.partnerId,
      productId: request.productId,
      objectiveId: request.objectiveId,
    });

    console.info(`✅ Execution created:`, {
      id: execution.id,
      status: execution.status,
    });

    return [execution]; // Return as array for compatibility
  },
};
