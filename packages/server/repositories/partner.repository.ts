import type { ObjectId } from 'mongodb';
import { prisma } from '../lib/db';

export const partnerRepository = {
  getPartners: async () => {
    return prisma.partner.findMany({
      select: {
        id: true,
        publicId: true,
        name: true,
        isActive: true,
        createdAt: true,
        partnerType: true,
        industry: true,
        country: true,
      },
    });
  },
  getPartnerById: async (id: ObjectId) => {
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
};
