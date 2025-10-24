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
  extractPagination,
} from '@shared/db/validation';

// Custom transformation for partners to handle missing fields from old schema
function transformPartnerToApi(partner: any): PartnerResponse {
  return {
    id: partner.id,
    publicId: partner.id, // Use id as publicId since publicId doesn't exist in new schema
    name: partner.name,
    description: partner.description,
    partnerType: partner.partnerType,
    website: partner.website,
    addressLine1: null, // Not in new schema
    addressLine2: null, // Not in new schema
    city: null, // Not in new schema
    state: null, // Not in new schema
    country: partner.country,
    postalCode: null, // Not in new schema
    industry: partner.industry,
    isActive: partner.isActive,
    createdAt: partner.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: partner.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

export const partnerController = {
  getPartners: async (req: Request, res: Response) => {
    try {
      console.info('🔍 Looking for partners...');

      // Validate query parameters
      const filtersValidation = safeValidateRequest(
        PartnerFiltersSchema,
        toCamel(req.query)
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
      const transformedPartners: PartnerResponse[] = partners.map(
        transformPartnerToApi
      );

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
        toCamel(req.params)
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
      const transformedPartner: PartnerResponse =
        transformPartnerToApi(partner);

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
        toCamel(req.body)
      );
      if (!bodyValidation.success) {
        return res.status(400).json(bodyValidation.error);
      }

      const partnerData: CreatePartnerRequest = bodyValidation.data;
      const newPartner = await partnerService.createPartner(partnerData);

      console.info('✅ Partner created:', newPartner.name);

      const transformedPartner: PartnerResponse =
        transformPartnerToApi(newPartner);

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
        toCamel(req.params)
      );
      if (!paramsValidation.success) {
        return res.status(400).json(paramsValidation.error);
      }

      // Validate request body
      const bodyValidation = safeValidateRequest(
        UpdatePartnerRequestSchema,
        toCamel(req.body)
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
        transformPartnerToApi(updatedPartner);

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
        toCamel(req.params)
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
