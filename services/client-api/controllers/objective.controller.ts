import { type Request, type Response } from 'express';
import { objectiveService } from '../services/objective.service';

export const objectiveController = {
  getObjectives: async (req: Request, res: Response) => {
    try {
      console.info('🔍 Looking for objectives...');
      const objectives = await objectiveService.getObjectives();
      console.info(`✅ Found ${objectives.length} objectives`);

      res.json({
        success: true,
        count: objectives.length,
        data: objectives,
      });
    } catch (error) {
      console.error('Error fetching objectives:', error);
      res.status(500).json({
        error: 'Failed to fetch objectives',
        message: 'Database error occurred',
      });
    }
  },

  createObjective: async (req: Request, res: Response) => {
    try {
      const { title, question, partnerId, productId, llmModels } = req.body;

      console.info('🎯 Creating new objective...', {
        title,
        partnerId,
        productId,
        modelCount: llmModels?.length || 0,
      });

      // Validate required fields
      if (!title || !question || !partnerId || !productId || !llmModels) {
        return res.status(400).json({
          error: 'Invalid request',
          message:
            'title, question, partnerId, productId, and llmModels are required',
        });
      }

      const objective = await objectiveService.createObjective({
        title,
        question,
        partnerId,
        productId,
        llmModels,
      });

      console.info(`✅ Objective created successfully:`, {
        id: objective.id,
        title: objective.title,
        partner: objective.partner?.name,
        product: objective.product?.name,
      });

      res.status(201).json({
        success: true,
        data: objective,
      });
    } catch (error) {
      console.error('Error creating objective:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      res.status(500).json({
        error: 'Failed to create objective',
        message: errorMessage,
      });
    }
  },
};
