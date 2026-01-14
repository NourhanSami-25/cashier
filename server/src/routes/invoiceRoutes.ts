import { Router } from 'express';
import { InvoiceController } from '../controllers/invoiceController';

const router = Router();
const invoiceController = new InvoiceController();

// POST /api/invoices - Create a new invoice
router.post('/', invoiceController.createInvoice);

// GET /api/invoices/:id - Get invoice by ID
router.get('/:id', invoiceController.getInvoiceById);

// POST /api/invoices/:id/items - Add item to invoice
router.post('/:id/items', invoiceController.addItemToInvoice);

// PUT /api/invoices/:id/items/:itemId - Update item quantity
router.put('/:id/items/:itemId', invoiceController.updateItemQuantity);

// DELETE /api/invoices/:id/items/:itemId - Remove item from invoice
router.delete('/:id/items/:itemId', invoiceController.removeItemFromInvoice);

// POST /api/invoices/:id/complete - Complete invoice
router.post('/:id/complete', invoiceController.completeInvoice);

export default router;
