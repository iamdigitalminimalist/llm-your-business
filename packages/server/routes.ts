import express, { type Request, type Response } from 'express';
import { partnerController } from './controllers/partner.controller';
import { productController } from './controllers/product.controller';
import { objectiveController } from './controllers/objective.controller';
import { evaluationController } from './controllers/evaluation.controller';
import { dashboardController } from './controllers/dashboard.controller';

const router = express.Router();

// Health check routes
router.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

router.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello from the server!' });
});

// Dashboard routes
router.get('/api/dashboard/stats', dashboardController.getStats);
router.get(
  '/api/dashboard/recent-evaluations',
  dashboardController.getRecentEvaluations
);

// Partner routes
router.get('/api/partners', partnerController.getPartners);
router.get('/api/partners/:id', partnerController.getPartner);

// Product routes
router.get('/api/products', productController.getProducts);
router.get('/api/products/:id', productController.getProduct);

// Objective routes
router.get('/api/objectives', objectiveController.getObjectives);
router.post('/api/objectives', objectiveController.createObjective);

// Evaluation routes
router.get('/api/evaluations', evaluationController.getEvaluations);
router.post('/api/evaluation', evaluationController.createEvaluation);

export default router;
