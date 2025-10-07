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
};
