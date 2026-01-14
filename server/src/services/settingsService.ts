import { SettingsRepository } from '../repositories/settingsRepository';
import { Settings } from '../models';

export class SettingsService {
  private settingsRepository: SettingsRepository;

  constructor() {
    this.settingsRepository = new SettingsRepository();
  }

  /**
   * Get current settings
   */
  getSettings(): Settings {
    return this.settingsRepository.getSettings();
  }

  /**
   * Update tax rate
   */
  updateTaxRate(rate: number): Settings {
    if (rate < 0 || rate > 1) {
      throw new Error('Tax rate must be between 0 and 1');
    }
    return this.settingsRepository.updateTaxRate(rate);
  }

  /**
   * Update service rate
   */
  updateServiceRate(rate: number): Settings {
    if (rate < 0 || rate > 1) {
      throw new Error('Service rate must be between 0 and 1');
    }
    return this.settingsRepository.updateServiceRate(rate);
  }
}
