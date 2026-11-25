/**
 * PORTFOLIO CRASH THEATRE — SETTINGS VIEW CONTROLLER
 * Display currencies, risk modeling parameters, and full state backup/restore.
 */

import { storage } from '../../storage.js';
import { notifications } from '../notifications.js';
import { APP_CONFIG } from '../../config.js';

export class SettingsView {
  constructor(state, portfolioManager) {
    this.state = state;
    this.pm = portfolioManager;

    this.currencySelect = document.getElementById('setting-currency');
    this.rfInput = document.getElementById('setting-risk-free-rate');
    this.varConfSelect = document.getElementById('setting-var-confidence');
    this.backupFileInput = document.getElementById('backup-file-input');

    this._bindEvents();
  }

  _bindEvents() {
    this.currencySelect?.addEventListener('change', e => {
      const code = e.target.value;
      const found = APP_CONFIG.currencies.find(c => c.code === code);
      this.state.updateSettings({
        currency: code,
        currencySymbol: found ? found.symbol : '$',
      });
      notifications.success('Settings Saved', `Display currency updated to ${code}.`);
    });

    this.rfInput?.addEventListener('change', e => {
      const rf = parseFloat(e.target.value) / 100;
      this.state.updateSettings({ riskFreeRate: isNaN(rf) ? 0.045 : rf });
      notifications.success('Settings Saved', `Risk-free rate updated to ${e.target.value}%.`);
    });

    this.varConfSelect?.addEventListener('change', e => {
      const conf = parseFloat(e.target.value);
      this.state.updateSettings({ varConfidence: isNaN(conf) ? 0.95 : conf });
      notifications.success('Settings Saved', `VaR confidence set to ${(conf * 100).toFixed(0)}%.`);
    });

    // Export backup JSON
    document.getElementById('btn-export-backup-json')?.addEventListener('click', () => {
      const json = storage.exportBackupJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio_crash_theatre_backup_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      notifications.success('Backup Exported', 'Full state JSON downloaded.');
    });

    // Trigger file picker for restore
    document.getElementById('btn-trigger-import-json')?.addEventListener('click', () => {
      this.backupFileInput?.click();
    });

    this.backupFileInput?.addEventListener('change', e => {
      if (e.target.files?.length > 0) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = evt => {
          const res = storage.importBackupJSON(evt.target.result);
          if (res.success) {
            notifications.success('Restore Complete', `Imported ${res.count} portfolios.`);
            location.reload();
          } else {
            notifications.danger('Restore Failed', res.error);
          }
        };
        reader.readAsText(file);
      }
    });

    // Factory reset
    document.getElementById('btn-reset-factory-defaults')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all data to default institutional templates? All custom holdings and history will be cleared.')) {
        storage.resetAll();
        notifications.info('System Reset', 'Restored to factory default portfolios.');
        location.reload();
      }
    });
  }

  onEnter() {
    this.render();
  }

  render() {
    const s = this.state.settings;
    if (this.currencySelect) this.currencySelect.value = s.currency || 'USD';
    if (this.rfInput) this.rfInput.value = ((s.riskFreeRate || 0.045) * 100).toFixed(1);
    if (this.varConfSelect) this.varConfSelect.value = (s.varConfidence || 0.95).toString();
  }
}
