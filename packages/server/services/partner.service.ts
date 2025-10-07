import type { ObjectId } from 'mongodb';
import { partnerRepository } from '../repositories/partner.repository';

export const partnerService = {
  getPartners: async () => {
    const partners = await partnerRepository.getPartners();

    return partners.filter((partner) => partner.isActive !== false);
  },

  getPartnerById: async (id: ObjectId) => {
    const partner = await partnerRepository.getPartnerById(id);

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
};
