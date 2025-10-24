import { CreateObjectiveRequestSchema } from '@shared/db/api-types';
import { safeValidateRequest } from '@shared/db/validation';
import { objectiveRepository } from '../repositories/objective.repository';

export const objectiveService = {
  getObjectives: async () => {
    const objectives = await objectiveRepository.getObjectives();
    return objectives.filter((objective) => objective.isActive !== false);
  },

  createObjective: async (request: unknown) => {
    // Use Zod for proper validation
    const validation = safeValidateRequest(
      CreateObjectiveRequestSchema,
      request
    );

    if (!validation.success) {
      throw new Error(validation.error.message);
    }

    // Now we have properly validated data with correct types
    const validatedData = validation.data;

    return objectiveRepository.createObjective(validatedData);
  },
};
