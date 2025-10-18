import { type Request, type Response } from 'express';
import { dashboardService } from '../services/dashboard.service';

export const dashboardController = {
  getStats: async (req: Request, res: Response) => {
    try {
      console.info('📊 Fetching dashboard stats...');

      const stats = await dashboardService.getDashboardStats();

      console.info('✅ Dashboard stats retrieved successfully');

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({
        error: 'Failed to fetch dashboard statistics',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  },

  getRecentEvaluations: async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;

      console.info('📋 Fetching recent evaluations...', { limit });

      const recentEvaluations =
        await dashboardService.getRecentEvaluations(limit);

      console.info(
        `✅ Retrieved ${recentEvaluations.length} recent evaluations`
      );

      res.json({
        success: true,
        count: recentEvaluations.length,
        data: recentEvaluations,
      });
    } catch (error) {
      console.error('Error fetching recent evaluations:', error);
      res.status(500).json({
        error: 'Failed to fetch recent evaluations',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  },
};
