import { CreateObjectiveRequestSchema } from '@shared/db/api-types';
import { objectiveRepository } from '../repositories/objective.repository';

export const objectiveService = {
  getObjectives: async () => {
    const objectives = await objectiveRepository.getObjectives();
    return objectives.filter((objective) => objective.isActive !== false);
  },

  createObjective: async (request: unknown) => {
    // Use Zod's safeParse for validation
    const validation = CreateObjectiveRequestSchema.safeParse(request);

    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.error.message}`);
    }

    // Now we have properly validated data with correct types
    const validatedData = validation.data;

    return objectiveRepository.createObjective(validatedData);
  },
};
