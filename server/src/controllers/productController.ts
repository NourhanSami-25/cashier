import { Request, Response } from 'express';
import { ProductService } from '../services/productService';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Create a new product
   */
  createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, price, categoryId } = req.body;

      if (!name || !price || !categoryId) {
        res.status(400).json({
          error: {
            message: 'Missing required fields: name, price, categoryId',
            code: 'VALIDATION_ERROR'
          }
        });
        return;
      }

      const product = this.productService.createProduct(name, price, categoryId);
      res.status(201).json(product);
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        res.status(400).json({
          error: {
            message: error.message,
            code: 'VALIDATION_ERROR',
            field: error.field
          }
        });
      } else {
        res.status(500).json({
          error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR'
          }
        });
      }
    }
  };

  /**
   * Get all products
   */
  getAllProducts = async (_req: Request, res: Response): Promise<void> => {
    try {
      const products = this.productService.getAllProducts();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  };

  /**
   * Get product by ID
   */
  getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const product = this.productService.getProductById(id);

      if (!product) {
        res.status(404).json({
          error: {
            message: `Product with id ${id} not found`,
            code: 'NOT_FOUND'
          }
        });
        return;
      }

      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  };

  /**
   * Update product
   */
  updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const { name, price, categoryId } = req.body;

      if (!name || !price || !categoryId) {
        res.status(400).json({
          error: {
            message: 'Missing required fields: name, price, categoryId',
            code: 'VALIDATION_ERROR'
          }
        });
        return;
      }

      const product = this.productService.updateProduct(id, name, price, categoryId);
      res.status(200).json(product);
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        res.status(400).json({
          error: {
            message: error.message,
            code: 'VALIDATION_ERROR',
            field: error.field
          }
        });
      } else if (error.name === 'NotFoundError') {
        res.status(404).json({
          error: {
            message: error.message,
            code: 'NOT_FOUND'
          }
        });
      } else {
        res.status(500).json({
          error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR'
          }
        });
      }
    }
  };

  /**
   * Delete product
   */
  deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      this.productService.deleteProduct(id);
      res.status(204).send();
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        res.status(404).json({
          error: {
            message: error.message,
            code: 'NOT_FOUND'
          }
        });
      } else {
        res.status(500).json({
          error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR'
          }
        });
      }
    }
  };
}
