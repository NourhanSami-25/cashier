import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';

const router = Router();
const categoryController = new CategoryController();

// GET /api/categories - Get all categories
router.get('/', categoryController.getAllCategories);

// POST /api/categories - Create a new category
router.post('/', categoryController.createCategory);

// GET /api/categories/:id - Get category by ID
router.get('/:id', categoryController.getCategoryById);

// DELETE /api/categories/:id - Delete category
router.delete('/:id', categoryController.deleteCategory);

export default router;
