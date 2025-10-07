import { prisma } from '../lib/db';

interface EvaluationFilters {
  partnerId?: string;
  productId?: string;
  objectiveId?: string;
}

export const evaluationRepository = {
  getEvaluations: async (filters: EvaluationFilters = {}) => {
    return prisma.evaluation.findMany({
      where: {
        ...(filters.partnerId && { partnerId: filters.partnerId }),
        ...(filters.productId && { productId: filters.productId }),
        ...(filters.objectiveId && { objectiveId: filters.objectiveId }),
      },
      include: {
        objective: {
          select: { id: true, title: true, category: true },
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
};
