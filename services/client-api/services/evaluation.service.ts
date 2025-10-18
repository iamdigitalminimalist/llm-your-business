import { evaluationRepository } from '../repositories/evaluation.repository';
import { objectiveRepository } from '../repositories/objective.repository';
import { partnerRepository } from '../repositories/partner.repository';
import { productRepository } from '../repositories/product.repository';
import { llm } from '../lib/llm';
import { promptService } from './prompt.service';
import { ObjectId } from 'mongodb';
import type { LLMModel, EvaluationStatus } from '@shared/db/types';

interface EvaluationFilters {
  objectiveId?: string;
}

interface CreateEvaluationRequest {
  objectiveId: string;
}

export const evaluationService = {
  getEvaluations: async (filters: EvaluationFilters = {}) => {
    const evaluations = await evaluationRepository.getEvaluations();

    return evaluations.map((evaluation) => ({
      ...evaluation,
      hasScore: evaluation.score !== null && evaluation.score !== undefined,
      scorePercentage: evaluation.score
        ? Math.round(evaluation.score * 10)
        : null,
      isSuccessful:
        evaluation.status === 'COMPLETED' && evaluation.mentionFound,
      // Enhanced structured data indicators
      hasStructuredData: !!(
        evaluation.ranking ||
        evaluation.marketPosition ||
        evaluation.competitiveStrengths?.length
      ),
      competitiveStrengthsCount: evaluation.competitiveStrengths?.length || 0,
      competitiveWeaknessesCount: evaluation.competitiveWeaknesses?.length || 0,
    }));
  },

  createEvaluation: async (request: CreateEvaluationRequest) => {
    console.info('🔍 Creating evaluation...', request);

    const objective = await objectiveRepository.getObjectiveById(
      request.objectiveId
    );
    if (!objective) {
      throw new Error(`Objective with ID ${request.objectiveId} not found`);
    }

    const partner = await partnerRepository.getPartnerById(
      new ObjectId(objective.partnerId)
    );
    if (!partner) {
      throw new Error(`Partner with ID ${objective.partnerId} not found`);
    }

    const product = await productRepository.getProductById(
      new ObjectId(objective.productId)
    );
    if (!product) {
      throw new Error(`Product with ID ${objective.productId} not found`);
    }

    const prompt = promptService.generateEvaluationPrompt({
      objective,
      partner,
      product,
    });

    const evaluations = [];
    for (const llmModel of objective.llmModels) {
      console.info(`🤖 Generating evaluation with ${llmModel}...`);

      const llmResponse = await llm.generateEvaluationResponse({
        prompt,
        model: llmModel,
      });

      const analysis = promptService.analyzeResponse(
        llmResponse.response,
        partner.name
      );

      const evaluation = await evaluationRepository.createEvaluation({
        llmModel,
        prompt,
        response: llmResponse.response,
        score: analysis.score,
        mentionFound: analysis.mentionFound,
        status: 'COMPLETED' as EvaluationStatus,
        objectiveId: request.objectiveId,
        partnerId: objective.partnerId,
        productId: objective.productId,
        ranking: analysis.ranking,
        totalCompetitors: analysis.totalCompetitors,
        recommendationLikelihood: analysis.recommendationLikelihood,
        competitiveStrengths: analysis.competitiveStrengths,
        competitiveWeaknesses: analysis.competitiveWeaknesses,
        marketPosition: analysis.marketPosition,
        keyDifferentiators: analysis.keyDifferentiators,
        evaluation: analysis.evaluation,
      });

      evaluations.push(evaluation);
      console.info(`✅ Evaluation created with ${llmModel}`, {
        id: evaluation.id,
        score: analysis.score,
      });
    }

    console.info(
      `🎉 Created ${evaluations.length} evaluations for objective ${request.objectiveId}`
    );
    return evaluations;
  },
};
