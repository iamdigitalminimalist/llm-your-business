import { type Request, type Response } from 'express';
import { objectiveService } from '../services/objective.service';
import { toCamel, toSnake } from '../lib/case';

export const objectiveController = {
  getObjectives: async (req: Request, res: Response) => {
    try {
      console.info('🔍 Looking for objectives...');
      const objectives = await objectiveService.getObjectives();
      console.info(`✅ Found ${objectives.length} objectives`);

      res.json(
        toSnake({
          success: true,
          count: objectives.length,
          data: objectives,
        })
      );
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
      // Convert snake_case to camelCase for validation
      const body = toCamel(req.body);

      console.info('🎯 Creating new objective...', {
        title: body.title,
        type: body.type,
        partnerId: body.partnerId,
        modelCount: body.models?.length || 0,
      });

      // Pass raw body to service for Zod validation
      const objective = await objectiveService.createObjective(body);

      console.info(`✅ Objective created successfully:`, {
        id: objective.id,
        title: objective.title,
        partner: objective.partner?.name,
      });

      res.status(201).json(
        toSnake({
          success: true,
          data: objective,
        })
      );
    } catch (error) {
      console.error('Error creating objective:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      // Check if it's a validation error
      const statusCode =
        error instanceof Error && error.message.includes('validation')
          ? 400
          : 500;

      res.status(statusCode).json({
        error:
          statusCode === 400
            ? 'Validation Error'
            : 'Failed to create objective',
        message: errorMessage,
      });
    }
  },
};
