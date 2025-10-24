import { type Request, type Response } from 'express';
import { ObjectId } from 'mongodb';
import { toCamel, toSnake } from '../lib/case';
import { executionService } from '../services/execution.service';

export const executionController = {
  getExecutions: async (req: Request, res: Response) => {
    try {
      const { partnerId, productId, objectiveId } = toCamel(req.query) as {
        partnerId?: string;
        productId?: string;
        objectiveId?: string;
      };
      console.info('🔍 Looking for executions...', {
        partnerId,
        productId,
        objectiveId,
      });

      const filters = {
        ...(partnerId && { partnerId: partnerId as string }),
        ...(productId && { productId: productId as string }),
        ...(objectiveId && { objectiveId: objectiveId as string }),
      };

      const executions = await executionService.getExecutions(filters);
      console.info(`✅ Found ${executions.length} executions`);

      res.json(
        toSnake({
          success: true,
          count: executions.length,
          data: executions,
        })
      );
    } catch (error) {
      console.error('Error fetching executions:', error);
      res.status(500).json({
        error: 'Failed to fetch executions',
        message: 'Database error occurred',
      });
    }
  },

  createExecution: async (req: Request, res: Response) => {
    try {
      const { objectiveId, partnerId, productId } = toCamel(req.body) as {
        objectiveId?: string;
        partnerId?: string;
        productId?: string;
      };

      if (!objectiveId || !partnerId || !productId) {
        return res.status(400).json(
          toSnake({
            error: 'Invalid request',
            message: 'objectiveId, partnerId, and productId are required',
          })
        );
      }

      if (
        !ObjectId.isValid(objectiveId) ||
        !ObjectId.isValid(partnerId) ||
        !ObjectId.isValid(productId)
      ) {
        return res.status(400).json(
          toSnake({
            error: 'Invalid ID format',
            message:
              'objectiveId, partnerId, and productId must be valid MongoDB ObjectIds',
          })
        );
      }

      console.info('🔍 Creating execution...', {
        objectiveId,
        partnerId,
        productId,
      });

      const newExecutions = await executionService.createExecution({
        objectiveId,
        partnerId,
        productId,
      });

      // Get the first execution from the array
      const newExecution = newExecutions[0];

      if (!newExecution) {
        return res.status(500).json({
          error: 'Failed to create execution',
          message: 'No execution was created',
        });
      }

      console.info(`✅ Created execution:`, {
        id: newExecution.id,
        status: newExecution.status,
        partnerId: newExecution.partnerId,
        productId: newExecution.productId,
        objectiveId: newExecution.objectiveId,
      });

      res.status(201).json(
        toSnake({
          success: true,
          data: newExecution,
        })
      );
    } catch (error) {
      console.error('Error creating execution:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      res.status(500).json({
        error: 'Failed to create execution',
        message: errorMessage,
      });
    }
  },
};
