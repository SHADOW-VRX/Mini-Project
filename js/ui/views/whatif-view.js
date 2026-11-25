/**
 * PORTFOLIO CRASH THEATRE — WHAT-IF LAB VIEW CONTROLLER
 * Interactive sandbox rebalancing, cash/gold hedge simulations, and dual-trajectory crash comparisons.
 */

import { formatCurrency, formatPercent, calculatePortfolioSummary } from '../../portfolio/calculations.js';
import { SCENARIOS, getScenarioById } from '../../simulation/scenarios.js';
import { SimulationEngine } from '../../simulation/simulation-engine.js';
import { ChartPresets } from '../../charts/chart-presets.js';
import { notifications } from '../notifications.js';

export class WhatIfView {
  constructor(state, portfolioManager) {
    this.state = state;
    this.pm = portfolioManager;

    this.origList = document.getElementById('whatif-orig-holdings-list');
    this.slidersContainer = document.getElementById('whatif-sliders-container');
    this.sumBar = document.getElementById('whatif-modified-sum-bar');
    this.sumVal = document.getElementById('whatif-modified-sum-val');

    this.scenarioSelect = document.getElementById('whatif-scenario-select');
    this.canvas = document.getElementById('chart-whatif-comparison');

    this.origLossEl = document.getElementById('whatif-orig-loss');
    this.origLossPctEl = document.getElementById('whatif-orig-loss-pct');
    this.modLossEl = document.getElementById('whatif-mod-loss');
    this.modLossPctEl = document.getElementById('whatif-mod-loss-pct');
    this.capitalSavedEl = document.getElementById('whatif-capital-saved');
    this.ddReductionEl = document.getElementById('whatif-dd-reduction');

    this.modifiedHoldings = [];

    this._populateScenarios();
    this._bindEvents();
  }

  _populateScenarios() {
    if (!this.scenarioSelect) return;
    this.scenarioSelect.innerHTML = '';
    SCENARIOS.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name;
      this.scenarioSelect.appendChild(opt);
    });
  }

  _bindEvents() {
    document.getElementById('btn-run-whatif-comparison')?.addEventListener('click', () => {
      this.runComparison();
    });

    document.getElementById('btn-preset-defensive')?.addEventListener('click', () => {
      this._applyDefensivePreset();
    });

    document.getElementById('btn-preset-hedge-tech')?.addEventListener('click', () => {
      this._applyHedgePreset();
    });

    document.getElementById('btn-whatif-reset')?.addEventListener('click', () => {
      this._resetModifiedToOriginal();
    });

    this.state.on('portfolioChanged', () => {
      this._resetModifiedToOriginal();
      this.render();
    });
  }

  onEnter() {
    if (this.modifiedHoldings.length === 0) {
      this._resetModifiedToOriginal();
    }
    this.render();
    this.runComparison();
  }

  _resetModifiedToOriginal() {
    const origSummary = this.pm.getActiveSummary();
    this.modifiedHoldings = origSummary.holdings.map(h => ({
      ...h,
      modifiedWeight: h.weight,
    }));
    this.render();
  }

  _applyDefensivePreset() {
    // Reduce high-beta equities by 35% and inject weight into Cash
    let cashWeight = 20;
    const nonCash = this.modifiedHoldings.filter(h => h.assetClass !== 'Cash & Equivalents');
    const scaleFactor = 0.80; // 80% remaining

    this.modifiedHoldings.forEach(h => {
      if (h.assetClass === 'Cash & Equivalents') {
        h.modifiedWeight = cashWeight;
      } else {
        h.modifiedWeight = h.weight * scaleFactor;
      }
    });

    this._normalizeWeights();
    this.render();
    this.runComparison();
    notifications.success('Defensive Preset', 'Allocated 20% to Cash reserves.');
  }

  _applyHedgePreset() {
    // Increase Treasuries & Gold by taking weight from Tech
    this.modifiedHoldings.forEach(h => {
      if (h.sector === 'Technology') {
        h.modifiedWeight = h.weight * 0.65; // Trim tech by 35%
      } else if (h.assetClass === 'Precious Metals' || h.assetClass === 'Fixed Income (Govt)') {
        h.modifiedWeight = h.weight * 1.5; // Boost safe havens by 50%
      }
    });

    this._normalizeWeights();
    this.render();
    this.runComparison();
    notifications.success('Hedge Preset', 'Trimmed Tech concentration and boosted Gold & Treasuries.');
  }

  _normalizeWeights() {
    const total = this.modifiedHoldings.reduce((sum, h) => sum + h.modifiedWeight, 0);
    if (total > 0) {
      this.modifiedHoldings.forEach(h => {
        h.modifiedWeight = (h.modifiedWeight / total) * 100;
      });
    }
  }

  render() {
    const origSummary = this.pm.getActiveSummary();
    const sym = this.state.settings.currencySymbol || '$';

    // 1. Render Original Column
    if (this.origList) {
      this.origList.innerHTML = '';
      origSummary.holdings.forEach(h => {
        const row = document.createElement('div');
        row.className = 'rebalance-slider-row';
        row.innerHTML = `
          <div class="rebalance-asset-info">
            <span class="font-bold text-xs">${h.symbol}</span>
            <div class="text-xs text-muted">${h.name}</div>
          </div>
          <div class="rebalance-slider-container">
            <div class="weight-progress-track">
              <div class="weight-progress-fill" style="width: ${h.weight}%;"></div>
            </div>
          </div>
          <div class="rebalance-val-badge">${h.weight.toFixed(1)}%</div>
        `;
        this.origList.appendChild(row);
      });
    }

    // 2. Render Modified Sliders Column
    if (this.slidersContainer) {
      this.slidersContainer.innerHTML = '';
      this.modifiedHoldings.forEach((h, idx) => {
        const row = document.createElement('div');
        row.className = 'rebalance-slider-row';
        row.innerHTML = `
          <div class="rebalance-asset-info">
            <span class="font-bold text-xs">${h.symbol}</span>
            <div class="text-xs text-muted">${h.name}</div>
          </div>
          <div class="rebalance-slider-container">
            <input type="range" class="form-range" min="0" max="100" step="0.5" value="${h.modifiedWeight.toFixed(1)}" data-idx="${idx}">
          </div>
          <div class="rebalance-val-badge text-accent" id="mod-badge-${idx}">${h.modifiedWeight.toFixed(1)}%</div>
        `;

        const slider = row.querySelector('.form-range');
        slider?.addEventListener('input', e => {
          const newVal = parseFloat(e.target.value);
          this.modifiedHoldings[idx].modifiedWeight = newVal;
          const badge = document.getElementById(`mod-badge-${idx}`);
          if (badge) badge.textContent = `${newVal.toFixed(1)}%`;
          this._updateSumBar();
        });

        this.slidersContainer.appendChild(row);
      });
    }

    this._updateSumBar();
  }

  _updateSumBar() {
    const total = this.modifiedHoldings.reduce((sum, h) => sum + h.modifiedWeight, 0);
    if (this.sumVal) this.sumVal.textContent = `${total.toFixed(1)}%`;

    const isValid = Math.abs(total - 100) < 0.8;
    if (this.sumBar) {
      this.sumBar.className = `allocation-sum-bar ${isValid ? 'valid' : 'invalid'}`;
    }
  }

  runComparison() {
    const scenarioId = this.scenarioSelect?.value || 'gfc_2008';
    const scenario = getScenarioById(scenarioId);
    const origPortfolio = this.pm.getActivePortfolio();
    const sym = this.state.settings.currencySymbol || '$';

    // Construct synthetic modified portfolio
    const totalOrigVal = origPortfolio.holdings.reduce((sum, h) => sum + (h.quantity * h.currentPrice), 0);
    const modPortfolio = {
      ...origPortfolio,
      holdings: this.modifiedHoldings.map(h => {
        // Adjust quantity to match the modified target weight
        const targetValue = (h.modifiedWeight / 100) * totalOrigVal;
        const targetQty = h.currentPrice > 0 ? targetValue / h.currentPrice : h.quantity;
        return {
          ...h,
          quantity: targetQty,
        };
      })
    };

    // Run simulations for both
    const origEngine = new SimulationEngine(origPortfolio, scenario);
    const modEngine = new SimulationEngine(modPortfolio, scenario);

    const origTraj = origEngine.trajectory;
    const modTraj = modEngine.trajectory;

    // Compare metrics
    const origLoss = origTraj.totalLoss;
    const origLossPct = origTraj.maxDrawdownPct;
    const modLoss = modTraj.totalLoss;
    const modLossPct = modTraj.maxDrawdownPct;

    const capitalSaved = modLoss - origLoss; // Positive if mod loss is less negative
    const ddDelta = Math.abs(origLossPct) - Math.abs(modLossPct);

    // Update KPI UI
    if (this.origLossEl) this.origLossEl.textContent = formatCurrency(origLoss, sym);
    if (this.origLossPctEl) this.origLossPctEl.textContent = `${formatPercent(origLossPct)} Max Drawdown`;

    if (this.modLossEl) this.modLossEl.textContent = formatCurrency(modLoss, sym);
    if (this.modLossPctEl) this.modLossPctEl.textContent = `${formatPercent(modLossPct)} Max Drawdown`;

    if (this.capitalSavedEl) {
      this.capitalSavedEl.textContent = formatCurrency(capitalSaved, sym);
      this.capitalSavedEl.className = `delta-badge ${capitalSaved >= 0 ? 'delta-positive' : 'delta-negative'}`;
    }

    if (this.ddReductionEl) {
      this.ddReductionEl.textContent = `${ddDelta >= 0 ? '+' : ''}${ddDelta.toFixed(1)}%`;
      this.ddReductionEl.className = `delta-badge ${ddDelta >= 0 ? 'delta-positive' : 'delta-negative'}`;
    }

    // Render Dual Trajectory Canvas
    if (this.canvas) {
      ChartPresets.renderWhatIfComparison(this.canvas, origTraj.steps, modTraj.steps, scenario.durationDays);
    }
  }
}
