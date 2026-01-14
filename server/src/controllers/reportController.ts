import { Request, Response } from 'express';
import { ReportService } from '../services/reportService';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  /**
   * Get daily report
   */
  getDailyReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.query;

      if (!date || typeof date !== 'string') {
        res.status(400).json({
          error: {
            message: 'Missing or invalid required query parameter: date (format: YYYY-MM-DD)',
            code: 'VALIDATION_ERROR'
          }
        });
        return;
      }

      const reportDate = new Date(date);
      if (isNaN(reportDate.getTime())) {
        res.status(400).json({
          error: {
            message: 'Invalid date format. Use YYYY-MM-DD',
            code: 'VALIDATION_ERROR'
          }
        });
        return;
      }

      const report = this.reportService.getDailyReport(reportDate);
      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  };
}
