import express, { type Request, type Response } from 'express';
import { partnerController } from './controllers/partner.controller';
import { productController } from './controllers/product.controller';
import { objectiveController } from './controllers/objective.controller';
import { executionController } from './controllers/execution.controller';
import { dashboardController } from './controllers/dashboard.controller';
import { personaController } from './controllers/persona.controller';

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
router.post('/api/partners', partnerController.createPartner);
router.put('/api/partners/:id', partnerController.updatePartner);
router.delete('/api/partners/:id', partnerController.deletePartner);

// Product routes
router.get('/api/products', productController.getProducts);
router.get('/api/products/:id', productController.getProduct);
router.post('/api/products', productController.createProduct);

// Persona routes
router.get('/api/personas', personaController.getPersonas);
router.post('/api/personas', personaController.createPersona);

// Objective routes
router.get('/api/objectives', objectiveController.getObjectives);
router.post('/api/objectives', objectiveController.createObjective);

// Execution routes
router.get('/api/executions', executionController.getExecutions);
router.post('/api/executions', executionController.createExecution);

export default router;
