/**
 * PORTFOLIO CRASH THEATRE — POST-CRASH AUTOPSY VIEW CONTROLLER
 * Forensic stress breakdown, loss attribution, recovery trajectories, and corrective recommendations.
 */

import { formatCurrency, formatPercent } from '../../portfolio/calculations.js';
import { ReportGenerator } from '../../reports/report-generator.js';
import { SimulationEngine } from '../../simulation/simulation-engine.js';
import { ChartPresets } from '../../charts/chart-presets.js';

export class AutopsyView {
  constructor(state, portfolioManager) {
    this.state = state;
    this.pm = portfolioManager;

    this.titleEl = document.getElementById('autopsy-scenario-title');
    this.startValEl = document.getElementById('autopsy-start-val');
    this.troughValEl = document.getElementById('autopsy-trough-val');
    this.lossValEl = document.getElementById('autopsy-loss-val');
    this.maxDDEl = document.getElementById('autopsy-max-dd');

    this.assetTbody = document.getElementById('autopsy-asset-tbody');
    this.sectorTbody = document.getElementById('autopsy-sector-tbody');
    this.actionList = document.getElementById('autopsy-action-list');

    this.reqGainEl = document.getElementById('autopsy-req-gain');
    this.rec6El = document.getElementById('autopsy-rec-6cagr');
    this.rec10El = document.getElementById('autopsy-rec-10cagr');
    this.canvas = document.getElementById('chart-autopsy-recovery');

    this._bindEvents();
  }

  _bindEvents() {
    document.getElementById('btn-autopsy-print')?.addEventListener('click', () => {
      window.print();
    });

    this.state.on('autopsyReady', () => this.render());
  }

  onEnter() {
    if (!this.state.latestAutopsy) {
      // Generate default autopsy from 2008 shock on active portfolio
      const portfolio = this.pm.getActivePortfolio();
      const scenario = this.state.activeScenario;
      const engine = new SimulationEngine(portfolio, scenario);
      const autopsy = ReportGenerator.generateAutopsy(portfolio, scenario, engine.trajectory);
      this.state.setLatestAutopsy(autopsy);
    }
    this.render();
  }

  render() {
    const autopsy = this.state.latestAutopsy;
    if (!autopsy) return;
    const sym = this.state.settings.currencySymbol || '$';

    // 1. Header Banner
    if (this.titleEl) this.titleEl.textContent = `${autopsy.scenarioName} — Forensic Autopsy`;
    if (this.startValEl) this.startValEl.textContent = formatCurrency(autopsy.initialValue, sym);
    if (this.troughValEl) this.troughValEl.textContent = formatCurrency(autopsy.troughValue, sym);
    if (this.lossValEl) this.lossValEl.textContent = formatCurrency(autopsy.totalLoss, sym);
    if (this.maxDDEl) this.maxDDEl.textContent = formatPercent(autopsy.maxDrawdownPct);

    // 2. Recovery Requirements
    if (this.reqGainEl) this.reqGainEl.textContent = `+${autopsy.requiredGain.toFixed(1)}%`;
    if (this.rec6El) this.rec6El.textContent = `${autopsy.recoveryYears.at6} Yrs`;
    if (this.rec10El) this.rec10El.textContent = `${autopsy.recoveryYears.at10} Yrs`;

    if (this.canvas) {
      ChartPresets.renderAutopsyRecovery(this.canvas, autopsy.initialValue, autopsy.troughValue);
    }

    // 3. Asset Loss Attribution Table
    if (this.assetTbody) {
      this.assetTbody.innerHTML = '';
      autopsy.assetAttribution.forEach(a => {
        const tr = document.createElement('tr');
        const isLoss = a.dollarLoss < 0;

        tr.innerHTML = `
          <td>
            <span class="font-bold text-xs">${a.symbol}</span>
            <span class="text-xs text-muted">(${a.sector})</span>
          </td>
          <td class="font-mono text-xs font-bold ${isLoss ? 'text-danger' : 'text-success'}">
            ${formatCurrency(a.dollarLoss, sym)}
          </td>
          <td class="font-mono text-xs ${isLoss ? 'text-danger' : 'text-success'}">
            ${formatPercent(a.simulatedReturn)}
          </td>
          <td class="font-mono text-xs">${a.lossSharePct > 0 ? a.lossSharePct.toFixed(1) + '%' : '—'}</td>
        `;
        this.assetTbody.appendChild(tr);
      });
    }

    // 4. Sector Contagion Table
    if (this.sectorTbody) {
      this.sectorTbody.innerHTML = '';
      autopsy.sectorAttribution.forEach(s => {
        const tr = document.createElement('tr');
        const isLoss = s.totalLoss < 0;

        tr.innerHTML = `
          <td class="font-bold text-xs">${s.sector}</td>
          <td class="font-mono text-xs font-bold ${isLoss ? 'text-danger' : 'text-success'}">
            ${formatCurrency(s.totalLoss, sym)}
          </td>
          <td class="font-mono text-xs ${isLoss ? 'text-danger' : 'text-success'}">
            ${formatPercent(s.avgReturn)}
          </td>
        `;
        this.sectorTbody.appendChild(tr);
      });
    }

    // 5. Prescriptive Recommendations
    if (this.actionList) {
      this.actionList.innerHTML = '';
      autopsy.recommendations.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'action-plan-item';
        item.innerHTML = `
          <div class="action-plan-icon font-bold">⚡</div>
          <div>
            <div class="font-bold text-xs text-primary">${rec.title}</div>
            <div class="text-xs text-secondary">${rec.desc}</div>
          </div>
        `;
        this.actionList.appendChild(item);
      });
    }
  }
}
