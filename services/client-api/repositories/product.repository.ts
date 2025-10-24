import type { ObjectId } from 'mongodb';
import { prisma } from '@shared/db';
import type { ProductType } from '@shared/db/types';

export const productRepository = {
  getProducts: async () => {
    return prisma.product.findMany({
      include: {
        partner: {
          select: { id: true, name: true },
        },
      },
    });
  },

  getProductsByPartner: async (partnerId: ObjectId) => {
    return prisma.product.findMany({
      where: {
        partnerId: partnerId.toString(),
      },
      include: {
        partner: {
          select: { id: true, name: true },
        },
      },
    });
  },

  getProductById: async (id: ObjectId) => {
    return prisma.product.findUnique({
      where: { id: id.toString() },
      include: {
        partner: true,
        executions: {
          include: {
            objective: true,
          },
        },
      },
    });
  },

  createProduct: async (data: {
    name: string;
    description?: string;
    productType: ProductType;
    partnerId: string;
  }) => {
    return prisma.product.create({
      data: {
        ...data,
        productType: data.productType,
      },
    });
  },
};
