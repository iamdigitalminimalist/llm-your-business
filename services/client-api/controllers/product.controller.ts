import { type Request, type Response } from 'express';
import { ObjectId } from 'mongodb';
import { productService } from '../services/product.service';
import { toCamel, toSnake } from '../lib/case';

export const productController = {
  getProducts: async (req: Request, res: Response) => {
    try {
      const { partnerId } = toCamel(req.query as any) as { partnerId?: string };
      console.info('🔍 Looking for products...', { partnerId });

      let products;
      if (partnerId) {
        if (!ObjectId.isValid(partnerId as string)) {
          return res.status(400).json(
            toSnake({
              error: 'Invalid partner ID format',
              message: 'Partner ID must be a valid MongoDB ObjectId',
            })
          );
        }
        products = await productService.getProductsByPartner(
          new ObjectId(partnerId as string)
        );
      } else {
        products = await productService.getProducts();
      }

      console.info(`✅ Found ${products.length} products`);

      res.json(
        toSnake({
          success: true,
          count: products.length,
          data: products,
        })
      );
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json(
        toSnake({
          error: 'Failed to fetch products',
          message: 'Database error occurred',
        })
      );
    }
  },

  getProduct: async (req: Request, res: Response) => {
    try {
      const productId = req.params.id;
      console.info('🔍 Looking for product with ID:', productId);

      if (!productId) {
        return res.status(400).json(
          toSnake({
            error: 'Invalid request',
            message: 'Product ID is required',
          })
        );
      }

      if (!ObjectId.isValid(productId)) {
        return res.status(400).json(
          toSnake({
            error: 'Invalid ID format',
            message: 'Product ID must be a valid MongoDB ObjectId',
          })
        );
      }

      const product = await productService.getProductById(
        new ObjectId(productId)
      );

      if (!product) {
        return res.status(404).json(
          toSnake({
            error: 'Product not found',
            message: `No product found with ID: ${productId}`,
          })
        );
      }

      console.info('✅ Found product:', product.name);

      res.json(
        toSnake({
          success: true,
          data: product,
        })
      );
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json(
        toSnake({
          error: 'Internal server error',
          message: 'Failed to fetch product data',
        })
      );
    }
  },
};
