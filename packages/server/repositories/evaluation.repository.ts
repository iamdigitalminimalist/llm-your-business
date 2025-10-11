import type { EvaluationStatus, LLMModel } from '@shared/db/types';
import { prisma } from '@shared/db';

interface CreateEvaluationData {
  llmModel: LLMModel;
  prompt: string;
  response: string;
  mentionFound: boolean;
  status: EvaluationStatus;
  objectiveId: string;
  partnerId?: string;
  productId?: string;
  score?: number;
  ranking?: number;
  totalCompetitors?: number;
  recommendationLikelihood?: number;
  competitiveStrengths?: string[];
  competitiveWeaknesses?: string[];
  marketPosition?: string;
  keyDifferentiators?: string[];
  evaluation?: string;
}

export const evaluationRepository = {
  getEvaluations: async () => {
    return prisma.evaluation.findMany({
      include: {
        objective: {
          select: { id: true, title: true },
        },
        partner: {
          select: { id: true, name: true, publicId: true },
        },
        product: {
          select: { id: true, name: true, publicId: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },
  createEvaluation: async (data: CreateEvaluationData) => {
    return prisma.evaluation.create({
      data,
      include: {
        objective: {
          select: { id: true, title: true },
        },
        partner: {
          select: { id: true, name: true, publicId: true },
        },
        product: {
          select: { id: true, name: true, publicId: true },
        },
      },
    });
  },
};
