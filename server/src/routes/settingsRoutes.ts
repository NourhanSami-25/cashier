import { Router } from 'express';
import { SettingsController } from '../controllers/settingsController';

const router = Router();
const settingsController = new SettingsController();

// GET /api/settings - Get current settings
router.get('/', settingsController.getSettings);

// PUT /api/settings/tax - Update tax rate
router.put('/tax', settingsController.updateTaxRate);

// PUT /api/settings/service - Update service rate
router.put('/service', settingsController.updateServiceRate);

export default router;
