import { LLMModel } from '@shared/db/types';
import { objectiveRepository } from '../repositories/objective.repository';

interface CreateObjectiveRequest {
  title: string;
  question: string;
  partnerId: string;
  productId: string;
  llmModels: LLMModel[];
}

export const objectiveService = {
  getObjectives: async () => {
    const objectives = await objectiveRepository.getObjectives();
    return objectives.filter((objective) => objective.isActive !== false);
  },

  createObjective: async (request: CreateObjectiveRequest) => {
    // Validate the request data
    if (!request.title || request.title.length < 3) {
      throw new Error('Title must be at least 3 characters long');
    }

    if (!request.question || request.question.length < 10) {
      throw new Error('Question must be at least 10 characters long');
    }

    if (!request.partnerId || !request.productId) {
      throw new Error('Partner and product are required');
    }

    if (!request.llmModels || request.llmModels.length === 0) {
      throw new Error('At least one LLM model must be selected');
    }

    const invalidModels = request.llmModels.filter(
      (model) => !Object.values(LLMModel).includes(model)
    );
    if (invalidModels.length > 0) {
      throw new Error(`Invalid LLM models: ${invalidModels.join(', ')}`);
    }

    return objectiveRepository.createObjective(request);
  },
};
