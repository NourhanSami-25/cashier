import { getDatabase } from '../config/database';
import { Settings } from '../models';

export class SettingsRepository {
  /**
   * Retrieve current settings
   */
  getSettings(): Settings {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM settings WHERE id = 1').get() as any;
    
    if (!row) {
      // This should never happen if database is properly initialized
      throw new Error('Settings not found in database');
    }
    
    return {
      taxRate: row.tax_rate,
      serviceRate: row.service_rate
    };
  }

  /**
   * Update tax rate
   */
  updateTaxRate(rate: number): Settings {
    const db = getDatabase();
    
    db.prepare(`
      UPDATE settings 
      SET tax_rate = ?
      WHERE id = 1
    `).run(rate);
    
    return this.getSettings();
  }

  /**
   * Update service rate
   */
  updateServiceRate(rate: number): Settings {
    const db = getDatabase();
    
    db.prepare(`
      UPDATE settings 
      SET service_rate = ?
      WHERE id = 1
    `).run(rate);
    
    return this.getSettings();
  }
}
