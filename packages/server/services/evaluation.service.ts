import { evaluationRepository } from '../repositories/evaluation.repository';

interface EvaluationFilters {
  partnerId?: string;
  productId?: string;
  objectiveId?: string;
}

export const evaluationService = {
  getEvaluations: async (filters: EvaluationFilters = {}) => {
    const evaluations = await evaluationRepository.getEvaluations(filters);

    // Add computed fields for business logic
    return evaluations.map((evaluation) => ({
      ...evaluation,
      hasScore: evaluation.score !== null && evaluation.score !== undefined,
      scorePercentage: evaluation.score
        ? Math.round(evaluation.score * 10)
        : null,
      isSuccessful:
        evaluation.status === 'COMPLETED' && evaluation.mentionFound,
    }));
  },
};
