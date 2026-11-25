/**
 * PORTFOLIO CRASH THEATRE — RISK INTELLIGENCE VIEW CONTROLLER
 * Quantitative analytics: VaR, CVaR, Sharpe ratio, concentration analysis, and correlation heatmap.
 */

import { formatCurrency, formatPercent } from '../../portfolio/calculations.js';
import { RiskEngine } from '../../analytics/risk-engine.js';
import { CorrelationEngine } from '../../analytics/correlation.js';
import { ConcentrationAnalyzer } from '../../analytics/concentration.js';

export class RiskView {
  constructor(state, portfolioManager) {
    this.state = state;
    this.pm = portfolioManager;

    this.varEl = document.getElementById('risk-metric-var');
    this.cvarEl = document.getElementById('risk-metric-cvar');
    this.volEl = document.getElementById('risk-metric-vol');
    this.sharpeEl = document.getElementById('risk-metric-sharpe');
    this.hhiValEl = document.getElementById('risk-hhi-val');
    this.hhiNeedleEl = document.getElementById('risk-hhi-needle');
    this.corrTable = document.getElementById('correlation-matrix-table');
    this.concList = document.getElementById('risk-concentration-list');

    this.state.on('portfolioChanged', () => this.render());
  }

  onEnter() {
    this.render();
  }

  render() {
    const summary = this.pm.getActiveSummary();
    const sym = this.state.settings.currencySymbol || '$';
    const conf = this.state.settings.varConfidence || 0.95;
    const rf = this.state.settings.riskFreeRate || 0.045;

    // 1. Calculate VaR & CVaR
    const varData = RiskEngine.calculateVaR(summary.totalCurrent, summary.weightedVolatility, conf, 'daily');
    const cvarData = RiskEngine.calculateCVaR(summary.totalCurrent, summary.weightedVolatility, conf, 'daily');

    if (this.varEl) this.varEl.textContent = formatCurrency(varData.dollar, sym);
    if (this.cvarEl) this.cvarEl.textContent = formatCurrency(cvarData.dollar, sym);
    if (this.volEl) this.volEl.textContent = formatPercent(summary.weightedVolatility * 100, false);

    // 2. Sharpe Ratio
    // Estimate expected annual return from past weighted returns or 8% market drift
    const estReturn = 0.095;
    const sharpe = RiskEngine.calculateSharpeRatio(estReturn, summary.weightedVolatility, rf);
    if (this.sharpeEl) this.sharpeEl.textContent = sharpe.toFixed(2);

    // 3. Herfindahl Index Meter
    if (this.hhiValEl) this.hhiValEl.textContent = summary.hhiHoldings.toLocaleString();
    if (this.hhiNeedleEl) {
      // Map HHI (0 - 4000) to percentage (0% - 100%)
      const needlePct = Math.min(Math.max((summary.hhiHoldings / 3500) * 100, 5), 95);
      this.hhiNeedleEl.style.left = `${needlePct}%`;
    }

    // Top concentration holdings breakdown
    if (this.concList) {
      this.concList.innerHTML = '';
      const topHoldings = summary.holdings.slice(0, 3);
      topHoldings.forEach(h => {
        const item = document.createElement('div');
        item.className = 'action-plan-item';
        item.innerHTML = `
          <div class="action-plan-icon font-mono font-bold text-xs">${h.symbol}</div>
          <div>
            <div class="font-bold text-xs text-primary">${h.name} — ${h.weight.toFixed(1)}% Weight</div>
            <div class="text-xs text-secondary">${h.assetClass} (${h.sector}) with Beta ${h.beta.toFixed(2)}</div>
          </div>
        `;
        this.concList.appendChild(item);
      });
    }

    // 4. Render Cross-Asset Correlation Matrix Heatmap
    this.renderCorrelationMatrix(summary.holdings);
  }

  renderCorrelationMatrix(holdings) {
    if (!this.corrTable) return;
    const { symbols, matrix } = CorrelationEngine.buildMatrix(holdings);

    this.corrTable.innerHTML = '';

    // Table Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `<th></th>`;
    symbols.forEach(sym => {
      const th = document.createElement('th');
      th.textContent = sym;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    this.corrTable.appendChild(thead);

    // Table Body
    const tbody = document.createElement('tbody');
    matrix.forEach((row, i) => {
      const tr = document.createElement('tr');
      // Row label
      const rowLabel = document.createElement('th');
      rowLabel.textContent = symbols[i];
      tr.appendChild(rowLabel);

      // Correlation cells
      row.forEach((corr, j) => {
        const td = document.createElement('td');
        td.className = 'correlation-cell';
        td.style.backgroundColor = CorrelationEngine.getCorrelationColor(corr);
        td.textContent = corr.toFixed(2);
        td.title = `${symbols[i]} vs ${symbols[j]}: Correlation ${corr.toFixed(2)}`;
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    this.corrTable.appendChild(tbody);
  }
}
