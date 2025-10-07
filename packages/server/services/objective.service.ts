import { objectiveRepository } from '../repositories/objective.repository';

export const objectiveService = {
  getObjectives: async () => {
    const objectives = await objectiveRepository.getObjectives();
    return objectives.filter((objective) => objective.isActive !== false);
  },
};
