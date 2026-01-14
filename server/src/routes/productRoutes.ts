import { Router } from 'express';
import { ProductController } from '../controllers/productController';

const router = Router();
const productController = new ProductController();

// GET /api/products - Get all products
router.get('/', productController.getAllProducts);

// POST /api/products - Create a new product
router.post('/', productController.createProduct);

// GET /api/products/:id - Get product by ID
router.get('/:id', productController.getProductById);

// PUT /api/products/:id - Update product
router.put('/:id', productController.updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', productController.deleteProduct);

export default router;
