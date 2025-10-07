import { type Request, type Response } from 'express';
import { evaluationService } from '../services/evaluation.service';

export const evaluationController = {
  getEvaluations: async (req: Request, res: Response) => {
    try {
      const { partnerId, productId, objectiveId } = req.query;
      console.info('🔍 Looking for evaluations...', {
        partnerId,
        productId,
        objectiveId,
      });

      const filters = {
        ...(partnerId && { partnerId: partnerId as string }),
        ...(productId && { productId: productId as string }),
        ...(objectiveId && { objectiveId: objectiveId as string }),
      };

      const evaluations = await evaluationService.getEvaluations(filters);
      console.info(`✅ Found ${evaluations.length} evaluations`);

      res.json({
        success: true,
        count: evaluations.length,
        data: evaluations,
      });
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      res.status(500).json({
        error: 'Failed to fetch evaluations',
        message: 'Database error occurred',
      });
    }
  },
};
