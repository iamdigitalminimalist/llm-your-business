import type { ObjectId } from 'mongodb';
import { prisma } from '@shared/db';
import type {
  CreatePartnerRequest,
  UpdatePartnerRequest,
  PartnerFilters,
} from '@shared/db/api-types';

export const partnerRepository = {
  getPartners: async (
    filters?: PartnerFilters,
    pagination?: { skip: number; limit: number }
  ) => {
    const where: any = {};

    // Apply filters
    if (filters) {
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters.type) {
        where.partnerType = filters.type;
      }

      if (filters.industry) {
        where.industry = filters.industry;
      }

      if (filters.country) {
        where.country = filters.country;
      }

      if (filters.status) {
        where.isActive = filters.status === 'active';
      }
    }

    const queryOptions: any = {
      where,
      select: {
        id: true,
        publicId: true,
        name: true,
        description: true,
        partnerType: true,
        website: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        industry: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    };

    if (pagination) {
      queryOptions.skip = pagination.skip;
      queryOptions.take = pagination.limit;
    }

    return prisma.partner.findMany(queryOptions);
  },

  getPartnersCount: async (filters?: PartnerFilters) => {
    const where: any = {};

    // Apply same filters as in getPartners
    if (filters) {
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters.type) {
        where.partnerType = filters.type;
      }

      if (filters.industry) {
        where.industry = filters.industry;
      }

      if (filters.country) {
        where.country = filters.country;
      }

      if (filters.status) {
        where.isActive = filters.status === 'active';
      }
    }

    return prisma.partner.count({ where });
  },

  getPartnerById: async (id: ObjectId) => {
    return prisma.partner.findUnique({
      where: { id: id.toString() },
      select: {
        id: true,
        publicId: true,
        name: true,
        description: true,
        partnerType: true,
        website: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        industry: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  getPartnerByIdWithRelations: async (id: ObjectId) => {
    return prisma.partner.findUnique({
      where: { id: id.toString() },
      include: {
        products: true,
        evaluations: {
          include: {
            objective: true,
          },
        },
      },
    });
  },

  createPartner: async (data: CreatePartnerRequest) => {
    return prisma.partner.create({
      data: {
        ...data,
        partnerType: data.partnerType, // Cast to Prisma enum
        publicId: `partner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      select: {
        id: true,
        publicId: true,
        name: true,
        description: true,
        partnerType: true,
        website: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        industry: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  updatePartner: async (id: ObjectId, data: UpdatePartnerRequest) => {
    const updateData = { ...data };
    if (updateData.partnerType) {
      updateData.partnerType = data.partnerType;
    }

    return prisma.partner.update({
      where: { id: id.toString() },
      data: updateData,
      select: {
        id: true,
        publicId: true,
        name: true,
        description: true,
        partnerType: true,
        website: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        industry: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  deletePartner: async (id: ObjectId) => {
    try {
      await prisma.partner.delete({
        where: { id: id.toString() },
      });
      return true;
    } catch (error) {
      return false;
    }
  },
};
