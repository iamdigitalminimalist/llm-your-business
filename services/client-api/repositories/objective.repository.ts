import type { CreateObjectiveRequest } from '@shared/db/api-types';
import { prisma } from '@shared/db';

export const objectiveRepository = {
  getObjectives: async () => {
    return prisma.objective.findMany({
      include: {
        partner: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            executions: true,
            questions: true,
          },
        },
      },
    });
  },

  getObjectiveById: async (id: string) => {
    return prisma.objective.findUnique({
      where: { id },
      include: {
        partner: true,
        questions: true,
        objectiveParameters: true,
      },
    });
  },

  createObjective: async (data: CreateObjectiveRequest) => {
    return prisma.objective.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        models: data.models,
        partnerId: data.partnerId,
        isActive: true,
      },
      include: {
        partner: {
          select: { id: true, name: true },
        },
      },
    });
  },
};
