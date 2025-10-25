import type { ObjectId } from 'mongodb';
import { productRepository } from '../repositories/product.repository';
import type { ProductType } from '@shared/db/types';

export const productService = {
  getProducts: async () => {
    const products = await productRepository.getProducts();
    return products.filter((product) => product.isActive !== false);
  },

  getProductsByPartner: async (partnerId: ObjectId) => {
    const products = await productRepository.getProductsByPartner(partnerId);
    return products.filter((product) => product.isActive !== false);
  },

  getProductById: async (id: ObjectId) => {
    const product = await productRepository.getProductById(id);

    if (!product) {
      return null;
    }

    return {
      ...product,
      executionCount: product.executions?.length || 0,
      hasExecutions: (product.executions?.length || 0) > 0,
    };
  },

  createProduct: async (data: {
    name: string;
    description?: string;
    productType: ProductType;
    partnerId: string;
  }) => {
    return productRepository.createProduct(data);
  },
};
