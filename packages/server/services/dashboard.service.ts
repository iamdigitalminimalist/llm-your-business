import { evaluationRepository } from '../repositories/evaluation.repository';
import { objectiveRepository } from '../repositories/objective.repository';
import { partnerRepository } from '../repositories/partner.repository';

interface DashboardStats {
  totalPartners: number;
  activeObjectives: number;
  totalEvaluations: number;
  successRate: number;
}

interface RecentEvaluation {
  id: string;
  partnerName: string;
  productName: string;
  objectiveTitle: string;
  modelCount: number;
  totalModels: number;
  avgScore: number | null;
  status: string;
  createdAt: Date;
}

export const dashboardService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    console.info('📊 Calculating dashboard statistics...');

    // Get all partners
    const partners = await partnerRepository.getPartners();
    const totalPartners = partners.filter((p) => p.isActive).length;

    // Get all objectives
    const objectives = await objectiveRepository.getObjectives();
    const activeObjectives = objectives.filter((o) => o.isActive).length;

    // Get all evaluations
    const evaluations = await evaluationRepository.getEvaluations();
    const totalEvaluations = evaluations.length;

    // Calculate success rate (completed evaluations with mentions)
    const successfulEvaluations = evaluations.filter(
      (e) => e.status === 'COMPLETED' && e.mentionFound
    ).length;

    const successRate =
      totalEvaluations > 0
        ? Math.round((successfulEvaluations / totalEvaluations) * 100)
        : 0;

    console.info('✅ Dashboard stats calculated', {
      totalPartners,
      activeObjectives,
      totalEvaluations,
      successRate,
    });

    return {
      totalPartners,
      activeObjectives,
      totalEvaluations,
      successRate,
    };
  },

  getRecentEvaluations: async (
    limit: number = 5
  ): Promise<RecentEvaluation[]> => {
    console.info('📋 Fetching recent evaluations...', { limit });

    const evaluations = await evaluationRepository.getEvaluations();

    // Group evaluations by objective to count models
    const evaluationsByObjective = new Map<string, any[]>();

    evaluations.forEach((evaluation) => {
      const objectiveId = evaluation.objectiveId;
      if (!evaluationsByObjective.has(objectiveId)) {
        evaluationsByObjective.set(objectiveId, []);
      }
      evaluationsByObjective.get(objectiveId)!.push(evaluation);
    });

    // Get the most recent evaluations per objective
    const recentEvaluations: RecentEvaluation[] = [];

    for (const [objectiveId, objEvaluations] of evaluationsByObjective) {
      // Sort by creation date, most recent first
      const sortedEvaluations = objEvaluations.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const mostRecent = sortedEvaluations[0];
      if (
        mostRecent &&
        mostRecent.objective &&
        mostRecent.partner &&
        mostRecent.product
      ) {
        // Calculate average score for this objective
        const completedEvaluations = objEvaluations.filter(
          (e) => e.status === 'COMPLETED' && e.score !== null
        );
        const avgScore =
          completedEvaluations.length > 0
            ? completedEvaluations.reduce((sum, e) => sum + (e.score || 0), 0) /
              completedEvaluations.length
            : null;

        // Count total models for this objective (from objective.llmModels)
        const objective =
          await objectiveRepository.getObjectiveById(objectiveId);
        const totalModels = objective?.llmModels?.length || 0;
        const completedModels = objEvaluations.filter(
          (e) => e.status === 'COMPLETED'
        ).length;

        recentEvaluations.push({
          id: mostRecent.id,
          partnerName: mostRecent.partner.name,
          productName: mostRecent.product.name,
          objectiveTitle: mostRecent.objective.title,
          modelCount: completedModels,
          totalModels: totalModels,
          avgScore: avgScore ? Math.round(avgScore * 10) / 10 : null,
          status: mostRecent.status,
          createdAt: mostRecent.createdAt,
        });
      }
    }

    // Sort by creation date and limit
    const result = recentEvaluations
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit);

    console.info(`✅ Retrieved ${result.length} recent evaluations`);

    return result;
  },
};
