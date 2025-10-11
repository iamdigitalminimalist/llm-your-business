import type { ObjectId } from 'mongodb';
import { partnerRepository } from '../repositories/partner.repository';
import type {
  PartnerFilters,
  CreatePartnerRequest,
  UpdatePartnerRequest,
} from '@shared/db/api-types';

export const partnerService = {
  getPartners: async (
    filters?: PartnerFilters,
    pagination?: { skip: number; limit: number }
  ) => {
    return partnerRepository.getPartners(filters, pagination);
  },

  getPartnersCount: async (filters?: PartnerFilters) => {
    return partnerRepository.getPartnersCount(filters);
  },

  getPartnerById: async (id: ObjectId) => {
    return partnerRepository.getPartnerById(id);
  },

  getPartnerByIdWithRelations: async (id: ObjectId) => {
    const partner = await partnerRepository.getPartnerByIdWithRelations(id);

    if (!partner) {
      return null;
    }

    return {
      ...partner,
      productCount: partner.products?.length || 0,
      evaluationCount: partner.evaluations?.length || 0,
      hasActiveProducts: partner.products?.some((p) => p.isActive) || false,
    };
  },

  createPartner: async (data: CreatePartnerRequest) => {
    return partnerRepository.createPartner(data);
  },

  updatePartner: async (id: ObjectId, data: UpdatePartnerRequest) => {
    try {
      return await partnerRepository.updatePartner(id, data);
    } catch (error) {
      // Handle case where partner doesn't exist
      return null;
    }
  },

  deletePartner: async (id: ObjectId) => {
    return partnerRepository.deletePartner(id);
  },
};
