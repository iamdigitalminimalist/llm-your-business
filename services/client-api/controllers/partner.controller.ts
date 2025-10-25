import { type Request, type Response } from 'express';
import { ObjectId } from 'mongodb';
import { partnerService } from '../services/partner.service';
import { toCamel, toSnake } from '../lib/case';
import {
  PartnerFiltersSchema,
  IdParamsSchema,
  CreatePartnerRequestSchema,
  UpdatePartnerRequestSchema,
  type PartnerResponse,
  type CreatePartnerRequest,
  type UpdatePartnerRequest,
} from '@shared/db/api-types';

export const partnerController = {
  getPartners: async (req: Request, res: Response) => {
    try {
      console.info('🔍 Looking for partners...');

      // Validate query parameters
      const filtersValidation = PartnerFiltersSchema.safeParse(
        toCamel(req.query)
      );
      if (!filtersValidation.success) {
        return res.status(400).json({
          error: `Validation failed: ${filtersValidation.error.message}`,
        });
      }

      const filters = filtersValidation.data;

      // Extract pagination parameters directly
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(
        100,
        Math.max(1, parseInt(req.query.limit as string) || 10)
      );
      const skip = (page - 1) * limit;

      const partners = await partnerService.getPartners(filters, {
        skip,
        limit,
      });
      const total = await partnerService.getPartnersCount(filters);

      console.info(`✅ Found ${partners.length} partners (${total} total)`);

      // Partners already match the API format
      const transformedPartners: PartnerResponse[] = partners.map(
        (partner) => ({
          ...partner,
          createdAt:
            partner.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt:
            partner.updatedAt?.toISOString() || new Date().toISOString(),
        })
      );

      res.json(
        toSnake({
          success: true,
          data: transformedPartners,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          message: `Retrieved ${partners.length} partners successfully`,
        })
      );
    } catch (error) {
      console.error('Error fetching partners:', error);
      res.status(500).json(
        toSnake({
          success: false,
          error: 'Internal Server Error',
          message: 'Failed to fetch partners',
          statusCode: 500,
        })
      );
    }
  },

  getPartner: async (req: Request, res: Response) => {
    try {
      console.info('🔍 Looking for partner with ID:', req.params.id);

      const paramsValidation = IdParamsSchema.safeParse(toCamel(req.params));
      if (!paramsValidation.success) {
        return res.status(400).json({
          error: `Validation failed: ${paramsValidation.error.message}`,
        });
      }

      const { id } = paramsValidation.data;
      const partner = await partnerService.getPartnerById(new ObjectId(id));

      if (!partner) {
        return res.status(404).json({
          error: 'Partner not found',
          message: `No partner found with ID: ${id}`,
        });
      }

      console.info('✅ Found partner:', partner.name);

      // Transform Prisma data to API format
      const transformedPartner: PartnerResponse = {
        ...partner,
        createdAt: partner.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: partner.updatedAt?.toISOString() || new Date().toISOString(),
      };

      res.json(
        toSnake({
          success: true,
          data: transformedPartner,
          message: 'Partner retrieved successfully',
        })
      );
    } catch (error) {
      console.error('Error fetching partner:', error);
      res.status(500).json({
        error: 'Failed to fetch partner data',
        message: 'Internal Server Error',
      });
    }
  },

  createPartner: async (req: Request, res: Response) => {
    try {
      console.info('➕ Creating new partner...');

      const bodyValidation = CreatePartnerRequestSchema.safeParse(
        toCamel(req.body)
      );
      if (!bodyValidation.success) {
        return res.status(400).json({
          error: `Validation failed: ${bodyValidation.error.message}`,
        });
      }

      const partnerData: CreatePartnerRequest = bodyValidation.data;
      const newPartner = await partnerService.createPartner(partnerData);

      console.info('✅ Partner created:', newPartner.name);

      const transformedPartner: PartnerResponse = {
        ...newPartner,
        createdAt:
          newPartner.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt:
          newPartner.updatedAt?.toISOString() || new Date().toISOString(),
      };

      res.status(201).json(
        toSnake({
          success: true,
          data: transformedPartner,
          message: 'Partner created successfully',
        })
      );
    } catch (error) {
      console.error('Error creating partner:', error);
      res.status(500).json({
        error: 'Failed to create partner',
        message: 'Internal Server Error',
      });
    }
  },

  updatePartner: async (req: Request, res: Response) => {
    try {
      console.info('✏️ Updating partner with ID:', req.params.id);

      // Validate route parameters
      const paramsValidation = IdParamsSchema.safeParse(toCamel(req.params));
      if (!paramsValidation.success) {
        return res.status(400).json({
          error: `Validation failed: ${paramsValidation.error.message}`,
        });
      }

      // Validate request body
      const bodyValidation = UpdatePartnerRequestSchema.safeParse(
        toCamel(req.body)
      );
      if (!bodyValidation.success) {
        return res.status(400).json({
          error: `Validation failed: ${bodyValidation.error.message}`,
        });
      }

      const { id } = paramsValidation.data;
      const updateData: UpdatePartnerRequest = bodyValidation.data;

      const updatedPartner = await partnerService.updatePartner(
        new ObjectId(id),
        updateData
      );

      if (!updatedPartner) {
        return res.status(404).json({
          error: 'Partner not found',
          message: `No partner found with ID: ${id}`,
        });
      }

      console.info('✅ Partner updated:', updatedPartner.name);

      const transformedPartner: PartnerResponse = {
        ...updatedPartner,
        createdAt:
          updatedPartner.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt:
          updatedPartner.updatedAt?.toISOString() || new Date().toISOString(),
      };

      res.json(
        toSnake({
          success: true,
          data: transformedPartner,
          message: 'Partner updated successfully',
        })
      );
    } catch (error) {
      console.error('Error updating partner:', error);
      res.status(500).json({
        error: 'Failed to update partner',
        message: 'Internal Server Error',
      });
    }
  },

  deletePartner: async (req: Request, res: Response) => {
    try {
      console.info('🗑️ Deleting partner with ID:', req.params.id);

      // Validate route parameters
      const paramsValidation = IdParamsSchema.safeParse(toCamel(req.params));
      if (!paramsValidation.success) {
        return res.status(400).json({
          error: `Validation failed: ${paramsValidation.error.message}`,
        });
      }

      const { id } = paramsValidation.data;
      const deleted = await partnerService.deletePartner(new ObjectId(id));

      if (!deleted) {
        return res.status(404).json({
          error: 'Partner not found',
          message: `No partner found with ID: ${id}`,
        });
      }

      console.info('✅ Partner deleted successfully');

      res.json(
        toSnake({
          success: true,
          data: { deleted: true },
          message: 'Partner deleted successfully',
        })
      );
    } catch (error) {
      console.error('Error deleting partner:', error);
      res.status(500).json({
        error: 'Failed to delete partner',
        message: 'Internal Server Error',
      });
    }
  },
};
