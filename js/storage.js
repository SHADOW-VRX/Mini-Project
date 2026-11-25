/**
 * PORTFOLIO CRASH THEATRE — STORAGE SERVICE
 * Handles safe local persistence, versioning, snapshots, simulation history, and backups.
 */

import { APP_CONFIG, DEFAULT_PORTFOLIOS } from './config.js';

class StorageService {
  constructor() {
    this.storageKey = APP_CONFIG.storageKey;
    this.settingsKey = APP_CONFIG.settingsKey;
    this.historyKey = APP_CONFIG.historyKey;
    this.snapshotsKey = APP_CONFIG.snapshotsKey;
  }

  /**
   * Safe JSON parse with fallback
   */
  _safeParse(jsonString, fallback) {
    if (!jsonString) return fallback;
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.warn('[StorageService] Failed to parse JSON:', e);
      return fallback;
    }
  }

  /**
   * Get all portfolios
   */
  getPortfolios() {
    const raw = localStorage.getItem(this.storageKey);
    const parsed = this._safeParse(raw, null);
    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    // Seed initial default portfolios
    const initial = Object.values(DEFAULT_PORTFOLIOS);
    this.savePortfolios(initial);
    return initial;
  }

  /**
   * Save portfolios list
   */
  savePortfolios(portfolios) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(portfolios));
      return true;
    } catch (e) {
      console.error('[StorageService] Error saving portfolios:', e);
      return false;
    }
  }

  /**
   * Get currently selected portfolio ID
   */
  getActivePortfolioId() {
    const saved = localStorage.getItem('pct_active_portfolio_id');
    if (saved) return saved;
    const portfolios = this.getPortfolios();
    const firstId = portfolios[0]?.id || DEFAULT_PORTFOLIOS.balanced.id;
    this.setActivePortfolioId(firstId);
    return firstId;
  }

  /**
   * Set active portfolio ID
   */
  setActivePortfolioId(id) {
    try {
      localStorage.setItem('pct_active_portfolio_id', id);
    } catch (e) {
      console.error('[StorageService] Error setting active portfolio ID:', e);
    }
  }

  /**
   * Load user settings
   */
  getSettings() {
    const raw = localStorage.getItem(this.settingsKey);
    const parsed = this._safeParse(raw, null);
    return { ...APP_CONFIG.defaults, ...(parsed || {}) };
  }

  /**
   * Save user settings
   */
  saveSettings(settings) {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error('[StorageService] Error saving settings:', e);
      return false;
    }
  }

  /**
   * Get all portfolio snapshots
   */
  getSnapshots() {
    const raw = localStorage.getItem(this.snapshotsKey);
    return this._safeParse(raw, []);
  }

  /**
   * Save a new snapshot
   */
  saveSnapshot(name, portfolio) {
    const snapshots = this.getSnapshots();
    const newSnapshot = {
      id: 'snap_' + Date.now(),
      name: name || `Snapshot ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      portfolio: JSON.parse(JSON.stringify(portfolio))
    };
    snapshots.unshift(newSnapshot);
    try {
      localStorage.setItem(this.snapshotsKey, JSON.stringify(snapshots));
      return newSnapshot;
    } catch (e) {
      console.error('[StorageService] Error saving snapshot:', e);
      return null;
    }
  }

  /**
   * Delete snapshot
   */
  deleteSnapshot(id) {
    let snapshots = this.getSnapshots();
    snapshots = snapshots.filter(s => s.id !== id);
    localStorage.setItem(this.snapshotsKey, JSON.stringify(snapshots));
    return true;
  }

  /**
   * Get simulation history
   */
  getSimulationHistory() {
    const raw = localStorage.getItem(this.historyKey);
    return this._safeParse(raw, []);
  }

  /**
   * Record a completed simulation run
   */
  recordSimulation(record) {
    const history = this.getSimulationHistory();
    const entry = {
      id: 'sim_' + Date.now(),
      timestamp: new Date().toISOString(),
      ...record
    };
    history.unshift(entry);
    // Limit to latest 30 runs
    if (history.length > 30) history.pop();
    try {
      localStorage.setItem(this.historyKey, JSON.stringify(history));
      return entry;
    } catch (e) {
      console.error('[StorageService] Error recording simulation:', e);
      return null;
    }
  }

  /**
   * Clear simulation history
   */
  clearHistory() {
    localStorage.removeItem(this.historyKey);
  }

  /**
   * Export all application state as JSON
   */
  exportBackupJSON() {
    return JSON.stringify({
      version: APP_CONFIG.version,
      exportedAt: new Date().toISOString(),
      portfolios: this.getPortfolios(),
      activePortfolioId: this.getActivePortfolioId(),
      snapshots: this.getSnapshots(),
      history: this.getSimulationHistory(),
      settings: this.getSettings()
    }, null, 2);
  }

  /**
   * Import complete application backup JSON
   */
  importBackupJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.portfolios)) {
        throw new Error('Invalid backup file schema: missing portfolios array');
      }
      this.savePortfolios(parsed.portfolios);
      if (parsed.activePortfolioId) this.setActivePortfolioId(parsed.activePortfolioId);
      if (parsed.snapshots) localStorage.setItem(this.snapshotsKey, JSON.stringify(parsed.snapshots));
      if (parsed.history) localStorage.setItem(this.historyKey, JSON.stringify(parsed.history));
      if (parsed.settings) this.saveSettings(parsed.settings);
      return { success: true, count: parsed.portfolios.length };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Reset everything to factory defaults
   */
  resetAll() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.settingsKey);
    localStorage.removeItem(this.historyKey);
    localStorage.removeItem(this.snapshotsKey);
    localStorage.removeItem('pct_active_portfolio_id');
    return this.getPortfolios();
  }
}

export const storage = new StorageService();
