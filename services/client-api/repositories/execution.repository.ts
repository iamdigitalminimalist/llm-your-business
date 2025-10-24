import { prisma } from '@shared/db';

interface ExecutionFilters {
  partnerId?: string;
  productId?: string;
  objectiveId?: string;
}

export const executionRepository = {
  getExecutions: async (filters: ExecutionFilters = {}) => {
    return prisma.execution.findMany({
      where: {
        ...(filters.partnerId && { partnerId: filters.partnerId }),
        ...(filters.productId && { productId: filters.productId }),
        ...(filters.objectiveId && { objectiveId: filters.objectiveId }),
      },
      include: {
        partner: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
        objective: { select: { id: true, title: true } },
        insights: true,
      },
      orderBy: { startedAt: 'desc' },
    });
  },

  createExecution: async (data: {
    partnerId: string;
    productId: string;
    objectiveId: string;
  }) => {
    return prisma.execution.create({
      data,
    });
  },
};
