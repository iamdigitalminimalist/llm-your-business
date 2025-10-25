import { prisma } from '@shared/db';

export const personaRepository = {
  getPersonas: async () => {
    return await prisma.persona.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  createPersona: async (data: {
    name: string;
    description?: string;
    occupation: string[];
    technicalSkills: string;
    goals: string[];
    motivations: string[];
  }) => {
    return await prisma.persona.create({
      data,
    });
  },
};
