/**
 * PORTFOLIO CRASH THEATRE — REPORTS VIEW CONTROLLER
 * Formal stress test dossiers, audit documentation, PDF printing, and data package exports.
 */

import { formatCurrency, formatPercent } from '../../portfolio/calculations.js';
import { ExportService } from '../../reports/export-service.js';
import { SCENARIOS } from '../../simulation/scenarios.js';
import { SimulationEngine } from '../../simulation/simulation-engine.js';
import { notifications } from '../notifications.js';

export class ReportsView {
  constructor(state, portfolioManager) {
    this.state = state;
    this.pm = portfolioManager;

    this.dossierDate = document.getElementById('dossier-date');
    this.dossierAuditId = document.getElementById('dossier-audit-id');
    this.portName = document.getElementById('dossier-port-name');
    this.portVal = document.getElementById('dossier-port-val');
    this.portCount = document.getElementById('dossier-port-count');
    this.portBeta = document.getElementById('dossier-port-beta');
    this.scenariosTbody = document.getElementById('dossier-scenarios-tbody');

    this._bindEvents();
  }

  _bindEvents() {
    document.getElementById('btn-print-pdf-dossier')?.addEventListener('click', () => {
      ExportService.printDossier();
    });

    document.getElementById('btn-export-csv-dossier')?.addEventListener('click', () => {
      const portfolio = this.pm.getActivePortfolio();
      ExportService.exportHoldingsCSV(portfolio);
      notifications.success('CSV Exported', 'Holdings data downloaded successfully.');
    });

    document.getElementById('btn-export-json-dossier')?.addEventListener('click', () => {
      const portfolio = this.pm.getActivePortfolio();
      const scenario = this.state.activeScenario;
      const autopsy = this.state.latestAutopsy;
      ExportService.exportAuditDossierJSON(portfolio, scenario, { initialValue: 0, troughValue: 0, totalLoss: 0, maxDrawdownPct: 0 }, autopsy);
      notifications.success('JSON Exported', 'Complete stress audit package downloaded.');
    });

    this.state.on('portfolioChanged', () => this.render());
  }

  onEnter() {
    this.render();
  }

  render() {
    const summary = this.pm.getActiveSummary();
    const portfolio = this.pm.getActivePortfolio();
    const sym = this.state.settings.currencySymbol || '$';

    if (this.dossierDate) this.dossierDate.textContent = `Generated: ${new Date().toLocaleDateString()}`;
    if (this.dossierAuditId) this.dossierAuditId.textContent = `Audit ID: PCT-${Math.floor(100000 + Math.random() * 900000)}`;

    if (this.portName) this.portName.textContent = portfolio.name;
    if (this.portVal) this.portVal.textContent = formatCurrency(summary.totalCurrent, sym);
    if (this.portCount) this.portCount.textContent = `${summary.holdingsCount} Assets`;
    if (this.portBeta) this.portBeta.textContent = summary.weightedBeta.toFixed(2);

    // Multi-Scenario Stress Evaluation Table
    if (this.scenariosTbody) {
      this.scenariosTbody.innerHTML = '';
      const testScenarios = SCENARIOS.slice(0, 4);

      testScenarios.forEach(scenario => {
        const engine = new SimulationEngine(portfolio, scenario);
        const traj = engine.trajectory;
        const tr = document.createElement('tr');

        tr.innerHTML = `
          <td>
            <div class="font-bold text-xs">${scenario.name}</div>
            <div class="text-xs text-muted">${scenario.historicalPeriod}</div>
          </td>
          <td class="font-mono text-xs font-bold text-danger">${formatPercent(traj.maxDrawdownPct)}</td>
          <td class="font-mono text-xs font-bold text-danger">${formatCurrency(traj.totalLoss, sym)}</td>
          <td class="font-mono text-xs">+${((1 / (1 - Math.abs(traj.maxDrawdownPct) / 100) - 1) * 100).toFixed(1)}%</td>
          <td><span class="badge ${scenario.severity === 'extreme' ? 'badge-danger' : 'badge-warning'}">${scenario.severity.toUpperCase()}</span></td>
        `;

        this.scenariosTbody.appendChild(tr);
      });
    }
  }
}
