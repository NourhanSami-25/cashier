import { Request, Response } from 'express';
import { InvoiceService } from '../services/invoiceService';

export class InvoiceController {
  private invoiceService: InvoiceService;

  constructor() {
    this.invoiceService = new InvoiceService();
  }

  /**
   * Create a new invoice
   */
  createInvoice = async (_req: Request, res: Response): Promise<void> => {
    try {
      const invoice = this.invoiceService.createInvoice();
      res.status(201).json(invoice);
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
   * Get invoice by ID
   */
  getInvoiceById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const invoice = this.invoiceService.getInvoiceById(id);

      if (!invoice) {
        res.status(404).json({
          error: {
            message: `Invoice with id ${id} not found`,
            code: 'NOT_FOUND'
          }
        });
        return;
      }

      res.status(200).json(invoice);
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
   * Add item to invoice
   */
  addItemToInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const { productId, quantity } = req.body;

      if (!productId || !quantity) {
        res.status(400).json({
          error: {
            message: 'Missing required fields: productId, quantity',
            code: 'VALIDATION_ERROR'
          }
        });
        return;
      }

      const invoice = this.invoiceService.addItemToInvoice(id, productId, quantity);
      res.status(200).json(invoice);
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        res.status(404).json({
          error: {
            message: error.message,
            code: 'NOT_FOUND'
          }
        });
      } else if (error.name === 'BusinessLogicError') {
        res.status(422).json({
          error: {
            message: error.message,
            code: 'BUSINESS_LOGIC_ERROR'
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
   * Update item quantity
   */
  updateItemQuantity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, itemId } = req.params as { id: string; itemId: string };
      const { quantity } = req.body;

      if (!quantity) {
        res.status(400).json({
          error: {
            message: 'Missing required field: quantity',
            code: 'VALIDATION_ERROR'
          }
        });
        return;
      }

      const invoice = this.invoiceService.updateItemQuantity(id, itemId, quantity);
      res.status(200).json(invoice);
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        res.status(404).json({
          error: {
            message: error.message,
            code: 'NOT_FOUND'
          }
        });
      } else if (error.name === 'BusinessLogicError') {
        res.status(422).json({
          error: {
            message: error.message,
            code: 'BUSINESS_LOGIC_ERROR'
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
   * Remove item from invoice
   */
  removeItemFromInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, itemId } = req.params as { id: string; itemId: string };
      const invoice = this.invoiceService.removeItemFromInvoice(id, itemId);
      res.status(200).json(invoice);
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        res.status(404).json({
          error: {
            message: error.message,
            code: 'NOT_FOUND'
          }
        });
      } else if (error.name === 'BusinessLogicError') {
        res.status(422).json({
          error: {
            message: error.message,
            code: 'BUSINESS_LOGIC_ERROR'
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
   * Complete invoice
   */
  completeInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const invoice = this.invoiceService.completeInvoice(id);
      res.status(200).json(invoice);
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        res.status(404).json({
          error: {
            message: error.message,
            code: 'NOT_FOUND'
          }
        });
      } else if (error.name === 'BusinessLogicError') {
        res.status(422).json({
          error: {
            message: error.message,
            code: 'BUSINESS_LOGIC_ERROR'
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
