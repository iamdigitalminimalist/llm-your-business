import type { LLMModel } from '../generated/prisma';
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

  createObjective: async (data: {
    title: string;
    question: string;
    partnerId: string;
    productId: string;
    llmModels: LLMModel[];
  }) => {
    return prisma.objective.create({
      data: {
        title: data.title,
        question: data.question,
        partnerId: data.partnerId,
        productId: data.productId,
        llmModels: data.llmModels,
        isActive: true,
      },
      include: {
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
