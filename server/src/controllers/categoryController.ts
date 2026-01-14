import { Request, Response } from 'express';
import { CategoryService } from '../services/categoryService';

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  /**
   * Create a new category
   */
  createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.body;

      if (!name) {
        res.status(400).json({
          error: {
            message: 'Missing required field: name',
            code: 'VALIDATION_ERROR'
          }
        });
        return;
      }

      const category = this.categoryService.createCategory(name);
      res.status(201).json(category);
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
   * Get all categories
   */
  getAllCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
      const categories = this.categoryService.getAllCategories();
      res.status(200).json(categories);
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
   * Get category by ID
   */
  getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const category = this.categoryService.getCategoryById(id);

      if (!category) {
        res.status(404).json({
          error: {
            message: `Category with id ${id} not found`,
            code: 'NOT_FOUND'
          }
        });
        return;
      }

      res.status(200).json(category);
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
   * Delete category
   */
  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      this.categoryService.deleteCategory(id);
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
