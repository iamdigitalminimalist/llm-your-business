import { type Request, type Response } from 'express';
import { toCamel, toSnake } from '../lib/case';
import { personaService } from 'services/persona.service';

export const personaController = {
  getPersonas: async (req: Request, res: Response) => {
    try {
      console.info('🔍 Looking for personas...');
      const personas = await personaService.getPersonas();
      console.info(`✅ Found ${personas.length} personas`);

      res.json(
        toSnake({
          success: true,
          count: personas.length,
          data: personas,
        })
      );
    } catch (error) {
      console.error('Error fetching personas:', error);
      res.status(500).json({
        error: 'Failed to fetch personas',
        message: 'Database error occurred',
      });
    }
  },

  createPersona: async (req: Request, res: Response) => {
    try {
      const body = toCamel(req.body);
      const {
        name,
        description,
        occupation,
        technicalSkills,
        goals,
        motivations,
      } = body;

      console.info('👤 Creating new persona...', {
        name,
        occupation: occupation?.length || 0,
        goals: goals?.length || 0,
      });

      // Validate required fields
      if (!name || !occupation || !technicalSkills || !goals || !motivations) {
        return res.status(400).json({
          error: 'Invalid request',
          message:
            'name, occupation, technicalSkills, goals, and motivations are required',
        });
      }

      const persona = await personaService.createPersona({
        name,
        description,
        occupation,
        technicalSkills,
        goals,
        motivations,
      });

      console.info(`✅ Persona created successfully:`, {
        id: persona.id,
        name: persona.name,
      });

      res.status(201).json(
        toSnake({
          success: true,
          data: persona,
        })
      );
    } catch (error) {
      console.error('Error creating persona:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      res.status(500).json({
        error: 'Failed to create persona',
        message: errorMessage,
      });
    }
  },
};
