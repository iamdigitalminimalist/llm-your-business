import { prisma } from '../lib/db';

export const objectiveRepository = {
  getObjectives: async () => {
    return prisma.objective.findMany({
      select: {
        id: true,
        publicId: true,
        title: true,
        question: true,
        category: true,
        scope: true,
        isActive: true,
        _count: {
          select: {
            evaluations: true,
          },
        },
      },
    });
  },
};
