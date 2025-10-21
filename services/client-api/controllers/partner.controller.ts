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
  type PartnerFilters,
  type CreatePartnerRequest,
  type UpdatePartnerRequest,
  type IdParams,
} from '@shared/db/api-types';
import {
  safeValidateRequest,
  createApiResponse,
  transformPrismaToApi,
  extractPagination,
} from '@shared/db/validation';

export const partnerController = {
  getPartners: async (req: Request, res: Response) => {
    try {
      console.info('🔍 Looking for partners...');

      // Validate query parameters
      const filtersValidation = safeValidateRequest(
        PartnerFiltersSchema,
        toCamel(req.query as any)
      );
      if (!filtersValidation.success) {
        return res.status(400).json(filtersValidation.error);
      }

      const filters = filtersValidation.data;
      const { page, limit, skip } = extractPagination(req.query);

      const partners = await partnerService.getPartners(filters, {
        skip,
        limit,
      });
      const total = await partnerService.getPartnersCount(filters);

      console.info(`✅ Found ${partners.length} partners (${total} total)`);

      // Transform Prisma data to API format
      const transformedPartners: PartnerResponse[] =
        partners.map(transformPrismaToApi);

      res.json(
        toSnake(
          createApiResponse.paginated(
            transformedPartners,
            {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit),
            },
            `Retrieved ${partners.length} partners successfully`
          )
        )
      );
    } catch (error) {
      console.error('Error fetching partners:', error);
      res
        .status(500)
        .json(
          toSnake(
            createApiResponse.error(
              'Internal Server Error',
              'Failed to fetch partners',
              500
            )
          )
        );
    }
  },

  getPartner: async (req: Request, res: Response) => {
    try {
      console.info('🔍 Looking for partner with ID:', req.params.id);

      const paramsValidation = safeValidateRequest(
        IdParamsSchema,
        toCamel(req.params as any)
      );
      if (!paramsValidation.success) {
        return res.status(400).json(paramsValidation.error);
      }

      const { id } = paramsValidation.data;
      const partner = await partnerService.getPartnerById(new ObjectId(id));

      if (!partner) {
        return res
          .status(404)
          .json(
            createApiResponse.error(
              'Partner not found',
              `No partner found with ID: ${id}`,
              404
            )
          );
      }

      console.info('✅ Found partner:', partner.name);

      // Transform Prisma data to API format
      const transformedPartner: PartnerResponse = transformPrismaToApi(partner);

      res.json(
        toSnake(
          createApiResponse.success(
            transformedPartner,
            'Partner retrieved successfully'
          )
        )
      );
    } catch (error) {
      console.error('Error fetching partner:', error);
      res
        .status(500)
        .json(
          toSnake(
            createApiResponse.error(
              'Internal Server Error',
              'Failed to fetch partner data',
              500
            )
          )
        );
    }
  },

  createPartner: async (req: Request, res: Response) => {
    try {
      console.info('➕ Creating new partner...');

      const bodyValidation = safeValidateRequest(
        CreatePartnerRequestSchema,
        toCamel(req.body as any)
      );
      if (!bodyValidation.success) {
        return res.status(400).json(bodyValidation.error);
      }

      const partnerData: CreatePartnerRequest = bodyValidation.data;
      const newPartner = await partnerService.createPartner(partnerData);

      console.info('✅ Partner created:', newPartner.name);

      const transformedPartner: PartnerResponse =
        transformPrismaToApi(newPartner);

      res
        .status(201)
        .json(
          toSnake(
            createApiResponse.success(
              transformedPartner,
              'Partner created successfully'
            )
          )
        );
    } catch (error) {
      console.error('Error creating partner:', error);
      res
        .status(500)
        .json(
          toSnake(
            createApiResponse.error(
              'Internal Server Error',
              'Failed to create partner',
              500
            )
          )
        );
    }
  },

  updatePartner: async (req: Request, res: Response) => {
    try {
      console.info('✏️ Updating partner with ID:', req.params.id);

      // Validate route parameters
      const paramsValidation = safeValidateRequest(
        IdParamsSchema,
        toCamel(req.params as any)
      );
      if (!paramsValidation.success) {
        return res.status(400).json(paramsValidation.error);
      }

      // Validate request body
      const bodyValidation = safeValidateRequest(
        UpdatePartnerRequestSchema,
        toCamel(req.body as any)
      );
      if (!bodyValidation.success) {
        return res.status(400).json(bodyValidation.error);
      }

      const { id } = paramsValidation.data;
      const updateData: UpdatePartnerRequest = bodyValidation.data;

      const updatedPartner = await partnerService.updatePartner(
        new ObjectId(id),
        updateData
      );

      if (!updatedPartner) {
        return res
          .status(404)
          .json(
            createApiResponse.error(
              'Partner not found',
              `No partner found with ID: ${id}`,
              404
            )
          );
      }

      console.info('✅ Partner updated:', updatedPartner.name);

      const transformedPartner: PartnerResponse =
        transformPrismaToApi(updatedPartner);

      res.json(
        toSnake(
          createApiResponse.success(
            transformedPartner,
            'Partner updated successfully'
          )
        )
      );
    } catch (error) {
      console.error('Error updating partner:', error);
      res
        .status(500)
        .json(
          toSnake(
            createApiResponse.error(
              'Internal Server Error',
              'Failed to update partner',
              500
            )
          )
        );
    }
  },

  deletePartner: async (req: Request, res: Response) => {
    try {
      console.info('🗑️ Deleting partner with ID:', req.params.id);

      // Validate route parameters
      const paramsValidation = safeValidateRequest(
        IdParamsSchema,
        toCamel(req.params as any)
      );
      if (!paramsValidation.success) {
        return res.status(400).json(paramsValidation.error);
      }

      const { id } = paramsValidation.data;
      const deleted = await partnerService.deletePartner(new ObjectId(id));

      if (!deleted) {
        return res
          .status(404)
          .json(
            createApiResponse.error(
              'Partner not found',
              `No partner found with ID: ${id}`,
              404
            )
          );
      }

      console.info('✅ Partner deleted successfully');

      res.json(
        toSnake(
          createApiResponse.success(
            { deleted: true },
            'Partner deleted successfully'
          )
        )
      );
    } catch (error) {
      console.error('Error deleting partner:', error);
      res
        .status(500)
        .json(
          toSnake(
            createApiResponse.error(
              'Internal Server Error',
              'Failed to delete partner',
              500
            )
          )
        );
    }
  },
};
