import { type Request, type Response } from 'express';
import { ObjectId } from 'mongodb';
import { evaluationService } from '../services/evaluation.service';
import { toCamel, toSnake } from '../lib/case';

export const evaluationController = {
  getEvaluations: async (req: Request, res: Response) => {
    try {
      const { partnerId, productId, objectiveId } = toCamel(
        req.query as any
      ) as {
        partnerId?: string;
        productId?: string;
        objectiveId?: string;
      };
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

      res.json(
        toSnake({
          success: true,
          count: evaluations.length,
          data: evaluations,
        })
      );
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      res.status(500).json({
        error: 'Failed to fetch evaluations',
        message: 'Database error occurred',
      });
    }
  },

  createEvaluation: async (req: Request, res: Response) => {
    try {
      const { objectiveId } = toCamel(req.body as any) as {
        objectiveId?: string;
      };

      if (!objectiveId) {
        return res.status(400).json(
          toSnake({
            error: 'Invalid request',
            message: 'objectiveId is required',
          })
        );
      }

      if (!ObjectId.isValid(objectiveId)) {
        return res.status(400).json(
          toSnake({
            error: 'Invalid ID format',
            message: 'objectiveId must be a valid MongoDB ObjectId',
          })
        );
      }

      console.info('🔍 Creating evaluations for objective...', { objectiveId });

      const newEvaluations = await evaluationService.createEvaluation({
        objectiveId,
      });

      console.info(`✅ Created ${newEvaluations.length} evaluations:`, {
        evaluations: newEvaluations.map((e) => ({
          id: e.id,
          llmModel: e.llmModel,
          score: e.score,
          mentionFound: e.mentionFound,
        })),
      });

      res.status(201).json(
        toSnake({
          success: true,
          count: newEvaluations.length,
          data: newEvaluations,
        })
      );
    } catch (error) {
      console.error('Error creating evaluations:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      res.status(500).json({
        error: 'Failed to create evaluations',
        message: errorMessage,
      });
    }
  },
};
