import type { Execution } from '@shared/db/types';
import { executionRepository } from '../repositories/execution.repository';

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

export const executionService = {
  getExecutions: async (filters: ExecutionFilters = {}) => {
    // Map to executions since executions are now part of the execution flow
    const executions = await executionRepository.getExecutions(filters);

    return executions.map((execution: Execution) => ({
      id: execution.id,
      partnerId: execution.partnerId,
      productId: execution.productId,
      objectiveId: execution.objectiveId,
      status: execution.status,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
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
