import type { ObjectId } from 'mongodb';
import { prisma } from '../lib/db';

export const productRepository = {
  getProducts: async () => {
    return prisma.product.findMany({
      include: {
        partner: {
          select: { id: true, name: true, publicId: true },
        },
      },
    });
  },

  getProductById: async (id: ObjectId) => {
    return prisma.product.findUnique({
      where: { id: id.toString() },
      include: {
        partner: true,
        evaluations: {
          include: {
            objective: true,
          },
        },
      },
    });
  },
};
