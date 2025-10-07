import type { ObjectId } from 'mongodb';
import { productRepository } from '../repositories/product.repository';

export const productService = {
  getProducts: async () => {
    const products = await productRepository.getProducts();
    return products.filter((product) => product.isActive !== false);
  },

  getProductById: async (id: ObjectId) => {
    const product = await productRepository.getProductById(id);

    if (!product) {
      return null;
    }

    return {
      ...product,
      evaluationCount: product.evaluations?.length || 0,
      hasEvaluations: (product.evaluations?.length || 0) > 0,
    };
  },
};
