import { personaRepository } from 'repositories/persona.repository';

export const personaService = {
  getPersonas: async () => {
    return personaRepository.getPersonas();
  },

  createPersona: async (data: {
    name: string;
    description?: string;
    occupation: string[];
    technicalSkills: string;
    goals: string[];
    motivations: string[];
  }) => {
    return personaRepository.createPersona(data);
  },
};
