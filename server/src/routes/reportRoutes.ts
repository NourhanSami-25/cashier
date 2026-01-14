import { Router } from 'express';
import { ReportController } from '../controllers/reportController';

const router = Router();
const reportController = new ReportController();

// GET /api/reports/daily - Get daily report
router.get('/daily', reportController.getDailyReport);

export default router;
