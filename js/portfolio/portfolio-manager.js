/**
 * PORTFOLIO CRASH THEATRE — PORTFOLIO MANAGER
 * Handles active portfolio lifecycle, CRUD holding operations, and snapshot management.
 */

import { storage } from '../storage.js';
import { DEFAULT_PORTFOLIOS } from '../config.js';
import { calculatePortfolioSummary } from './calculations.js';

export class PortfolioManager {
  constructor(state) {
    this.state = state;
  }

  /**
   * Get currently active portfolio
   */
  getActivePortfolio() {
    const portfolios = storage.getPortfolios();
    const activeId = storage.getActivePortfolioId();
    let found = portfolios.find(p => p.id === activeId);

    if (!found) {
      found = portfolios[0] || DEFAULT_PORTFOLIOS.balanced;
      storage.setActivePortfolioId(found.id);
    }
    return found;
  }

  /**
   * Switch to a different portfolio by ID
   */
  switchPortfolio(portfolioId) {
    const portfolios = storage.getPortfolios();
    const found = portfolios.find(p => p.id === portfolioId);
    if (found) {
      storage.setActivePortfolioId(found.id);
      this.state.emit('portfolioChanged', found);
      return found;
    }
    return null;
  }

  /**
   * Switch to a preset portfolio
   */
  loadPreset(presetKey) {
    const preset = DEFAULT_PORTFOLIOS[presetKey];
    if (!preset) return null;

    const portfolios = storage.getPortfolios();
    let existingIdx = portfolios.findIndex(p => p.id === preset.id);

    if (existingIdx !== -1) {
      portfolios[existingIdx] = JSON.parse(JSON.stringify(preset));
    } else {
      portfolios.push(JSON.parse(JSON.stringify(preset)));
    }

    storage.savePortfolios(portfolios);
    storage.setActivePortfolioId(preset.id);
    this.state.emit('portfolioChanged', preset);
    return preset;
  }

  /**
   * Add or update a holding in active portfolio
   */
  saveHolding(holdingData) {
    const portfolio = this.getActivePortfolio();
    const holdings = [...portfolio.holdings];

    if (holdingData.id) {
      // Edit existing
      const idx = holdings.findIndex(h => h.id === holdingData.id);
      if (idx !== -1) {
        holdings[idx] = { ...holdings[idx], ...holdingData };
      }
    } else {
      // Add new
      const newHolding = {
        ...holdingData,
        id: 'h_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      };
      holdings.push(newHolding);
    }

    portfolio.holdings = holdings;
    this._persistPortfolio(portfolio);
    this.state.emit('portfolioChanged', portfolio);
    return portfolio;
  }

  /**
   * Remove a holding by ID
   */
  deleteHolding(holdingId) {
    const portfolio = this.getActivePortfolio();
    portfolio.holdings = portfolio.holdings.filter(h => h.id !== holdingId);
    this._persistPortfolio(portfolio);
    this.state.emit('portfolioChanged', portfolio);
    return portfolio;
  }

  /**
   * Batch import holdings from CSV importer
   */
  importBatchHoldings(validHoldings, replaceExisting = false) {
    const portfolio = this.getActivePortfolio();
    if (replaceExisting) {
      portfolio.holdings = validHoldings;
    } else {
      // Append unique symbols or replace matching symbols
      const existingMap = new Map(portfolio.holdings.map(h => [h.symbol.toUpperCase(), h]));
      validHoldings.forEach(h => {
        existingMap.set(h.symbol.toUpperCase(), h);
      });
      portfolio.holdings = Array.from(existingMap.values());
    }

    this._persistPortfolio(portfolio);
    this.state.emit('portfolioChanged', portfolio);
    return portfolio;
  }

  /**
   * Internal helper to update portfolio in storage
   */
  _persistPortfolio(updatedPortfolio) {
    const portfolios = storage.getPortfolios();
    const idx = portfolios.findIndex(p => p.id === updatedPortfolio.id);
    if (idx !== -1) {
      portfolios[idx] = updatedPortfolio;
    } else {
      portfolios.push(updatedPortfolio);
    }
    storage.savePortfolios(portfolios);
  }

  /**
   * Calculate summary metrics of active portfolio
   */
  getActiveSummary() {
    return calculatePortfolioSummary(this.getActivePortfolio());
  }
}
