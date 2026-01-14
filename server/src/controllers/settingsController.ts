import { Request, Response } from 'express';
import { SettingsService } from '../services/settingsService';

export class SettingsController {
  private settingsService: SettingsService;

  constructor() {
    this.settingsService = new SettingsService();
  }

  /**
   * Get current settings
   */
  getSettings = async (_req: Request, res: Response): Promise<void> => {
    try {
      const settings = this.settingsService.getSettings();
      res.status(200).json(settings);
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
   * Update tax rate
   */
  updateTaxRate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { rate } = req.body;

      if (rate === undefined || rate === null) {
        res.status(400).json({
          error: {
            message: 'Missing required field: rate',
            code: 'VALIDATION_ERROR'
          }
        });
        return;
      }

      const settings = this.settingsService.updateTaxRate(rate);
      res.status(200).json(settings);
    } catch (error: any) {
      res.status(400).json({
        error: {
          message: error.message,
          code: 'VALIDATION_ERROR'
        }
      });
    }
  };

  /**
   * Update service rate
   */
  updateServiceRate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { rate } = req.body;

      if (rate === undefined || rate === null) {
        res.status(400).json({
          error: {
            message: 'Missing required field: rate',
            code: 'VALIDATION_ERROR'
          }
        });
        return;
      }

      const settings = this.settingsService.updateServiceRate(rate);
      res.status(200).json(settings);
    } catch (error: any) {
      res.status(400).json({
        error: {
          message: error.message,
          code: 'VALIDATION_ERROR'
        }
      });
    }
  };
}
