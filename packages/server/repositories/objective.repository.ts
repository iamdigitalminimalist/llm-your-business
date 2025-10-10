import { prisma } from '../lib/db';

export const objectiveRepository = {
  getObjectives: async () => {
    return prisma.objective.findMany({
      include: {
        partner: {
          select: { id: true, name: true, publicId: true },
        },
        product: {
          select: { id: true, name: true, publicId: true },
        },
        _count: {
          select: {
            evaluations: true,
          },
        },
      },
    });
  },

  getObjectiveById: async (id: string) => {
    return prisma.objective.findUnique({
      where: { id },
      select: {
        id: true,
        publicId: true,
        title: true,
        question: true,
        partnerId: true,
        productId: true,
        isActive: true,
        llmModels: true,
      },
    });
  },
};
