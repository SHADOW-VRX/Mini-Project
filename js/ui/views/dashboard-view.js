/**
 * PORTFOLIO CRASH THEATRE — DASHBOARD VIEW CONTROLLER
 */

import { formatCurrency, formatPercent } from '../../portfolio/calculations.js';
import { ChartPresets } from '../../charts/chart-presets.js';
import { RiskEngine } from '../../analytics/risk-engine.js';
import { ConcentrationAnalyzer } from '../../analytics/concentration.js';
import { storage } from '../../storage.js';

export class DashboardView {
  constructor(state, portfolioManager) {
    this.state = state;
    this.pm = portfolioManager;

    this.valEl = document.getElementById('kpi-total-val');
    this.investedSubEl = document.getElementById('kpi-invested-sub');
    this.plEl = document.getElementById('kpi-total-pl');
    this.returnPctEl = document.getElementById('kpi-return-pct');
    this.riskScoreEl = document.getElementById('kpi-risk-score');
    this.riskGradeEl = document.getElementById('kpi-risk-grade');
    this.varValEl = document.getElementById('kpi-var-val');
    this.vulnBannerEl = document.getElementById('dashboard-vuln-banner');
    this.vulnGridEl = document.getElementById('dashboard-vuln-grid');
    this.vulnCountBadge = document.getElementById('vuln-count-badge');
    this.historyTbody = document.getElementById('sim-history-tbody');

    this._bindEvents();
  }

  _bindEvents() {
    const clearBtn = document.getElementById('btn-clear-sim-history');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        storage.clearHistory();
        this.renderHistory();
      });
    }

    // Subscribe to portfolio changes
    this.state.on('portfolioChanged', () => {
      this.render();
    });
  }

  onEnter() {
    this.render();
  }

  render() {
    const summary = this.pm.getActiveSummary();
    const sym = this.state.settings.currencySymbol || '$';

    // 1. Update KPIs
    if (this.valEl) this.valEl.textContent = formatCurrency(summary.totalCurrent, sym);
    if (this.investedSubEl) this.investedSubEl.textContent = `Invested: ${formatCurrency(summary.totalInvested, sym)}`;

    if (this.plEl) {
      this.plEl.textContent = formatCurrency(summary.totalPL, sym);
      this.plEl.className = `kpi-value ${summary.totalPL >= 0 ? 'text-success' : 'text-danger'}`;
    }
    if (this.returnPctEl) {
      this.returnPctEl.textContent = `${formatPercent(summary.totalPLPercent)} Return`;
      this.returnPctEl.className = `kpi-subtext ${summary.totalPL >= 0 ? 'text-success' : 'text-danger'}`;
    }

    if (this.riskScoreEl) this.riskScoreEl.textContent = `${summary.riskScore} / 100`;
    if (this.riskGradeEl) {
      let gradeText = 'Moderate Risk';
      if (summary.riskScore < 35) gradeText = 'Conservative / Low Risk';
      else if (summary.riskScore > 65) gradeText = 'High / Aggressive Risk';
      this.riskGradeEl.textContent = gradeText;
    }

    // Daily 95% VaR
    const varData = RiskEngine.calculateVaR(summary.totalCurrent, summary.weightedVolatility, this.state.settings.varConfidence || 0.95, 'daily');
    if (this.varValEl) this.varValEl.textContent = formatCurrency(varData.dollar, sym);

    // 2. Render Vulnerabilities
    this.renderVulnerabilities(summary);

    // 3. Render Canvas Charts
    const perfCanvas = document.getElementById('chart-dashboard-performance');
    if (perfCanvas) ChartPresets.renderDashboardPerformance(perfCanvas, summary.totalCurrent);

    const allocCanvas = document.getElementById('chart-dashboard-allocation');
    if (allocCanvas) ChartPresets.renderAllocationDonut(allocCanvas, summary);

    const sectorCanvas = document.getElementById('chart-dashboard-sectors');
    if (sectorCanvas) ChartPresets.renderSectorBars(sectorCanvas, summary);

    // 4. Render Simulation History
    this.renderHistory();
  }

  renderVulnerabilities(summary) {
    if (!this.vulnGridEl) return;
    const alerts = ConcentrationAnalyzer.detectVulnerabilities(summary);

    if (this.vulnCountBadge) {
      this.vulnCountBadge.textContent = `${alerts.length} ${alerts.length === 1 ? 'Risk' : 'Risks'} Detected`;
    }

    this.vulnGridEl.innerHTML = '';
    if (alerts.length === 0) {
      const okItem = document.createElement('div');
      okItem.className = 'vuln-item';
      okItem.innerHTML = `
        <div class="vuln-item-title text-success"><span>✓ Diversification Nominal</span></div>
        <div class="vuln-item-desc">No single-point-of-failure vulnerabilities detected under baseline rules.</div>
      `;
      this.vulnGridEl.appendChild(okItem);
      return;
    }

    alerts.slice(0, 3).forEach(alert => {
      const item = document.createElement('div');
      item.className = 'vuln-item';
      item.innerHTML = `
        <div class="vuln-item-title text-${alert.level}">
          <span>⚠ ${alert.title}</span>
        </div>
        <div class="vuln-item-desc">${alert.desc}</div>
      `;
      this.vulnGridEl.appendChild(item);
    });
  }

  renderHistory() {
    if (!this.historyTbody) return;
    const history = storage.getSimulationHistory();

    this.historyTbody.innerHTML = '';
    if (history.length === 0) {
      this.historyTbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted text-xs">No simulations run yet. Launch Crisis Theatre!</td></tr>`;
      return;
    }

    history.slice(0, 5).forEach(record => {
      const tr = document.createElement('tr');
      const ddPct = record.maxDrawdownPct ? Number(record.maxDrawdownPct).toFixed(1) : '0.0';

      tr.innerHTML = `
        <td>
          <div class="font-bold text-xs">${record.scenarioName || 'Stress Test'}</div>
          <div class="text-muted" style="font-size: 0.65rem;">${new Date(record.timestamp).toLocaleDateString()}</div>
        </td>
        <td><span class="badge badge-danger">${ddPct}%</span></td>
        <td>
          <button class="btn btn-xs btn-outline btn-view-hist" data-id="${record.id}">View Autopsy</button>
        </td>
      `;

      tr.querySelector('.btn-view-hist').addEventListener('click', () => {
        if (record.autopsy) {
          this.state.setLatestAutopsy(record.autopsy);
          window.location.hash = '#autopsy';
        }
      });

      this.historyTbody.appendChild(tr);
    });
  }
}
