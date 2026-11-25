/**
 * PORTFOLIO CRASH THEATRE — SCENARIO LIBRARY VIEW CONTROLLER
 * Search, filter, configure, compare, and launch historical and custom stress templates.
 */

import { SCENARIOS, getScenarioById } from '../../simulation/scenarios.js';
import { ModalManager } from '../modal.js';
import { notifications } from '../notifications.js';

export class ScenariosView {
  constructor(state, portfolioManager) {
    this.state = state;
    this.pm = portfolioManager;

    this.grid = document.getElementById('scenarios-cards-grid');
    this.searchInput = document.getElementById('scenario-search');
    this.severityFilter = document.getElementById('filter-scenario-severity');
    this.selectedScenarioForConfig = null;

    this._bindEvents();
  }

  _bindEvents() {
    this.searchInput?.addEventListener('input', () => this.render());
    this.severityFilter?.addEventListener('change', () => this.render());

    // Scenario Configuration Modal
    document.getElementById('btn-close-scenario-modal')?.addEventListener('click', () => ModalManager.close('modal-scenario-config'));
    document.getElementById('btn-cancel-scenario-config')?.addEventListener('click', () => ModalManager.close('modal-scenario-config'));

    document.getElementById('btn-launch-configured-scenario')?.addEventListener('click', () => {
      if (this.selectedScenarioForConfig) {
        // Read severity multiplier slider
        const slider = document.getElementById('config-severity-slider');
        const multiplier = slider ? parseFloat(slider.value) : 1.0;

        const configuredScenario = {
          ...this.selectedScenarioForConfig,
          marketBetaFactor: (this.selectedScenarioForConfig.marketBetaFactor || 1.2) * multiplier,
        };

        this.state.setActiveScenario(configuredScenario);
        ModalManager.close('modal-scenario-config');
        window.location.hash = '#theatre';
        notifications.success('Crisis Launched', `Running ${configuredScenario.name} in Crisis Theatre.`);
      }
    });

    // Custom Crash Builder button
    document.getElementById('btn-open-custom-scenario')?.addEventListener('click', () => {
      const custom = getScenarioById('custom_crash');
      this._openConfigModal(custom);
    });

    // Compare Scenarios button
    document.getElementById('btn-open-scenario-compare')?.addEventListener('click', () => {
      notifications.info('Scenario Comparison', 'Comparing 2008 Liquidity Shock vs 2022 Interest Rate Shock in What-If Lab.');
      window.location.hash = '#whatif';
    });
  }

  onEnter() {
    this.render();
  }

  render() {
    if (!this.grid) return;
    const query = this.searchInput?.value.toLowerCase().trim() || '';
    const selectedSeverity = this.severityFilter?.value || '';

    let list = [...SCENARIOS];

    if (query) {
      list = list.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.catalyst.toLowerCase().includes(query)
      );
    }

    if (selectedSeverity) {
      list = list.filter(s => s.severity === selectedSeverity);
    }

    this.grid.innerHTML = '';
    list.forEach(scenario => {
      const card = document.createElement('div');
      card.className = 'scenario-card';

      let severityBadgeClass = 'severity-moderate';
      if (scenario.severity === 'extreme') severityBadgeClass = 'severity-extreme';
      else if (scenario.severity === 'severe') severityBadgeClass = 'severity-severe';

      card.innerHTML = `
        <div>
          <div class="scenario-card-header">
            <div>
              <h3 class="scenario-card-title">${scenario.name}</h3>
              <div class="scenario-card-period">${scenario.historicalPeriod}</div>
            </div>
            <span class="severity-pill ${severityBadgeClass}">${scenario.severity.toUpperCase()}</span>
          </div>

          <p class="scenario-card-desc">${scenario.description}</p>

          <div class="scenario-metrics-bar">
            <div class="scenario-metric-item">
              <span class="scenario-metric-label">Benchmark DD</span>
              <span class="scenario-metric-val text-danger">${scenario.benchmarkDrawdown}%</span>
            </div>
            <div class="scenario-metric-item">
              <span class="scenario-metric-label">Duration</span>
              <span class="scenario-metric-val">${scenario.durationDays} Days</span>
            </div>
            <div class="scenario-metric-item">
              <span class="scenario-metric-label">Beta Factor</span>
              <span class="scenario-metric-val">${scenario.marketBetaFactor.toFixed(2)}x</span>
            </div>
          </div>

          <div style="margin-bottom: var(--space-4);">
            <div class="text-xs text-muted" style="margin-bottom: 4px;">AFFECTED SECTORS:</div>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              ${scenario.mostAffectedSectors.map(sec => `<span class="badge badge-default text-xs">${sec}</span>`).join('')}
            </div>
          </div>
        </div>

        <div class="scenario-card-footer">
          <button class="btn btn-primary btn-sm btn-launch" style="flex: 1;" data-id="${scenario.id}">
            Run Simulation
          </button>
          <button class="btn btn-outline btn-sm btn-config" data-id="${scenario.id}">
            Configure
          </button>
        </div>
      `;

      card.querySelector('.btn-launch')?.addEventListener('click', () => {
        this.state.setActiveScenario(scenario);
        window.location.hash = '#theatre';
        notifications.success('Simulation Initiated', `Loaded ${scenario.name} into Crisis Theatre.`);
      });

      card.querySelector('.btn-config')?.addEventListener('click', () => {
        this._openConfigModal(scenario);
      });

      this.grid.appendChild(card);
    });
  }

  _openConfigModal(scenario) {
    this.selectedScenarioForConfig = scenario;
    const details = document.getElementById('scenario-config-details');
    if (!details) return;

    details.innerHTML = `
      <div style="margin-bottom: var(--space-4);">
        <h3 class="font-bold text-primary">${scenario.name}</h3>
        <p class="text-xs text-secondary">${scenario.description}</p>
      </div>

      <div class="form-group">
        <label class="form-label">Stress Severity Multiplier</label>
        <div class="range-slider-wrapper">
          <input type="range" class="form-range" id="config-severity-slider" min="0.5" max="1.75" step="0.05" value="1.0">
          <span class="font-mono text-sm font-bold text-accent" id="config-slider-val">1.0x</span>
        </div>
        <span class="form-hint">Adjust the baseline market decline intensity from 50% up to 175%.</span>
      </div>

      <div class="form-group">
        <label class="form-label">Key Macro Catalyst</label>
        <div class="card" style="padding: var(--space-3); font-size: var(--font-xs); color: var(--text-secondary);">
          ${scenario.catalyst}
        </div>
      </div>
    `;

    const slider = document.getElementById('config-severity-slider');
    const valText = document.getElementById('config-slider-val');
    slider?.addEventListener('input', e => {
      if (valText) valText.textContent = `${parseFloat(e.target.value).toFixed(2)}x`;
    });

    ModalManager.open('modal-scenario-config');
  }
}
