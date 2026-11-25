/**
 * PORTFOLIO CRASH THEATRE — CRISIS THEATRE VIEW CONTROLLER
 * Flagship interactive stress simulator: live playback, milestone wire, real-time damage attribution, and phase progression.
 */

import { formatCurrency, formatPercent } from '../../portfolio/calculations.js';
import { SimulationEngine } from '../../simulation/simulation-engine.js';
import { SimulationTimeline } from '../../simulation/timeline.js';
import { ChartPresets } from '../../charts/chart-presets.js';
import { ReportGenerator } from '../../reports/report-generator.js';
import { audio } from '../audio.js';
import { storage } from '../../storage.js';

export class TheatreView {
  constructor(state, portfolioManager) {
    this.state = state;
    this.pm = portfolioManager;

    this.engine = null;
    this.timeline = null;

    // DOM Elements
    this.scenarioNameEl = document.getElementById('theatre-active-scenario-name');
    this.statusTextEl = document.getElementById('theatre-status-text');
    this.dayLabelEl = document.getElementById('theatre-day-label');
    this.scrubberEl = document.getElementById('theatre-scrubber');
    this.phaseDescEl = document.getElementById('theatre-phase-desc');

    this.kpiValEl = document.getElementById('theatre-kpi-val');
    this.kpiStartValEl = document.getElementById('theatre-kpi-start-val');
    this.kpiLossEl = document.getElementById('theatre-kpi-loss');
    this.kpiLossPctEl = document.getElementById('theatre-kpi-loss-pct');
    this.kpiMaxDDEl = document.getElementById('theatre-kpi-max-dd');
    this.kpiTroughEl = document.getElementById('theatre-kpi-trough');
    this.kpiHedgedEl = document.getElementById('theatre-kpi-hedged');

    this.canvas = document.getElementById('chart-theatre-canvas');
    this.feedList = document.getElementById('theatre-feed-list');
    this.damageTbody = document.getElementById('theatre-damage-tbody');
    this.autopsyPrompt = document.getElementById('theatre-autopsy-prompt');

    this.playBtn = document.getElementById('btn-theatre-play-pause');
    this.playIcon = document.getElementById('icon-theatre-play');
    this.speedSelect = document.getElementById('theatre-speed-select');

    this._bindControls();
  }

  _bindControls() {
    this.playBtn?.addEventListener('click', () => {
      if (this.timeline?.isPlaying) {
        this.timeline.pause();
        this._updatePlayButtonState(false);
      } else {
        this.timeline?.play();
        this._updatePlayButtonState(true);
      }
    });

    document.getElementById('btn-theatre-step-fwd')?.addEventListener('click', () => {
      this.timeline?.stepForward();
      this._updatePlayButtonState(false);
    });

    document.getElementById('btn-theatre-step-back')?.addEventListener('click', () => {
      this.timeline?.stepBackward();
      this._updatePlayButtonState(false);
    });

    document.getElementById('btn-theatre-restart')?.addEventListener('click', () => {
      this.timeline?.restart();
      this._updatePlayButtonState(false);
      if (this.feedList) this.feedList.innerHTML = '';
      if (this.autopsyPrompt) this.autopsyPrompt.style.display = 'none';
    });

    this.scrubberEl?.addEventListener('input', e => {
      this.timeline?.pause();
      this._updatePlayButtonState(false);
      this.timeline?.seek(parseInt(e.target.value, 10));
    });

    this.speedSelect?.addEventListener('change', e => {
      this.timeline?.setSpeed(e.target.value);
    });

    // Switch scenario button navigates to scenario library
    document.getElementById('btn-theatre-switch-scenario')?.addEventListener('click', () => {
      window.location.hash = '#scenarios';
    });

    // Launch autopsy button
    document.getElementById('btn-theatre-goto-autopsy')?.addEventListener('click', () => {
      window.location.hash = '#autopsy';
    });

    // Listen to scenario change events
    this.state.on('scenarioChanged', () => {
      if (this.state.activeScenario) {
        this.initSimulation(this.state.activeScenario);
      }
    });

    this.state.on('portfolioChanged', () => {
      if (this.state.activeScenario) {
        this.initSimulation(this.state.activeScenario);
      }
    });
  }

  onEnter() {
    if (!this.engine || this.engine.portfolio !== this.pm.getActivePortfolio() || this.engine.scenario !== this.state.activeScenario) {
      this.initSimulation(this.state.activeScenario);
    }
  }

  onLeave() {
    this.timeline?.pause();
    this._updatePlayButtonState(false);
  }

  initSimulation(scenario) {
    if (this.timeline) {
      this.timeline.destroy();
    }

    const portfolio = this.pm.getActivePortfolio();
    this.engine = new SimulationEngine(portfolio, scenario);

    if (this.scenarioNameEl) {
      this.scenarioNameEl.textContent = scenario.name;
    }

    if (this.scrubberEl) {
      this.scrubberEl.max = this.engine.duration;
      this.scrubberEl.value = 0;
    }

    if (this.feedList) {
      this.feedList.innerHTML = '';
    }

    if (this.autopsyPrompt) {
      this.autopsyPrompt.style.display = 'none';
    }

    // Initialize timeline controller
    this.timeline = new SimulationTimeline(
      this.engine,
      (stepData, day, totalDays) => this._onTick(stepData, day, totalDays),
      (milestone, day) => this._onMilestone(milestone, day),
      trajectory => this._onComplete(trajectory)
    );

    // Initial render at Day 0
    const step0 = this.engine.getStep(0);
    this._onTick(step0, 0, this.engine.duration);
    this._updatePlayButtonState(false);
  }

  _updatePlayButtonState(isPlaying) {
    if (!this.playIcon) return;
    if (isPlaying) {
      // Pause icon
      this.playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    } else {
      // Play icon
      this.playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
    }
  }

  _onTick(stepData, day, totalDays) {
    const sym = this.state.settings.currencySymbol || '$';

    // Play subtle audio tick
    audio.playTick();

    // 1. Scrubber and Header Labels
    if (this.scrubberEl) this.scrubberEl.value = day;
    if (this.dayLabelEl) this.dayLabelEl.textContent = `Day ${day} / ${totalDays}`;
    if (this.phaseDescEl) this.phaseDescEl.textContent = stepData.phaseDesc;

    // 2. Highlight active 5-phase bar
    this._updatePhaseTrack(stepData.phase);

    // 3. Update Real-time KPI Deck
    if (this.kpiValEl) this.kpiValEl.textContent = formatCurrency(stepData.portfolioValue, sym);
    if (this.kpiStartValEl) this.kpiStartValEl.textContent = `Started: ${formatCurrency(this.engine.trajectory.initialValue, sym)}`;

    if (this.kpiLossEl) {
      this.kpiLossEl.textContent = formatCurrency(stepData.totalLoss, sym);
      this.kpiLossEl.className = `theatre-kpi-val ${stepData.totalLoss < 0 ? 'loss-negative' : 'text-success'}`;
    }
    if (this.kpiLossPctEl) {
      this.kpiLossPctEl.textContent = `${formatPercent(stepData.currentDrawdown)} Return`;
      this.kpiLossPctEl.className = `kpi-subtext ${stepData.currentDrawdown < 0 ? 'text-danger' : 'text-success'}`;
    }

    if (this.kpiMaxDDEl) {
      this.kpiMaxDDEl.textContent = formatPercent(stepData.maxDrawdownSoFar);
    }
    if (this.kpiTroughEl) {
      this.kpiTroughEl.textContent = `Trough Value: ${formatCurrency(stepData.minPortfolioValueSoFar, sym)}`;
    }

    // Safe haven capital tally
    const hedgeAssets = stepData.assets.filter(a => a.dollarLoss >= 0);
    const hedgeCapital = hedgeAssets.reduce((sum, a) => sum + a.currentValue, 0);
    if (this.kpiHedgedEl) this.kpiHedgedEl.textContent = formatCurrency(hedgeCapital, sym);

    // 4. Update Canvas Curve
    if (this.canvas) {
      ChartPresets.renderTheatreSimulation(this.canvas, day, this.engine.trajectory);
    }

    // 5. Update Asset Damage Matrix
    this._renderDamageMatrix(stepData.assets);
  }

  _updatePhaseTrack(currentPhase) {
    for (let p = 1; p <= 5; p++) {
      const el = document.getElementById(`phase-step-${p}`);
      if (el) {
        if (p === currentPhase) {
          el.className = 'phase-step active';
        } else if (p < currentPhase) {
          el.className = 'phase-step past';
        } else {
          el.className = 'phase-step';
        }
      }
    }
  }

  _onMilestone(milestone, day) {
    if (!this.feedList) return;

    if (milestone.alert) {
      audio.playAlarm();
    } else if (milestone.recovery) {
      audio.playRecoveryChime();
    }

    const item = document.createElement('div');
    item.className = `feed-item ${milestone.alert ? 'feed-alert' : (milestone.recovery ? 'feed-recovery' : '')}`;
    item.innerHTML = `
      <div class="feed-time">DAY ${day} — BREAKING WIRE</div>
      <div class="feed-headline">${milestone.headline}</div>
    `;

    this.feedList.insertBefore(item, this.feedList.firstChild);
  }

  _renderDamageMatrix(assets) {
    if (!this.damageTbody) return;
    const sym = this.state.settings.currencySymbol || '$';

    this.damageTbody.innerHTML = '';
    assets.forEach(a => {
      const tr = document.createElement('tr');
      const isNegative = a.dollarLoss < 0;

      let vulnClass = 'badge-default';
      if (a.vulnerability === 'Critical') vulnClass = 'badge-danger';
      else if (a.vulnerability === 'Severe') vulnClass = 'badge-warning';
      else if (a.vulnerability === 'Hedge') vulnClass = 'badge-success';

      tr.innerHTML = `
        <td>
          <span class="font-mono font-bold text-xs">${a.symbol}</span>
          <div class="text-xs text-muted">${a.name}</div>
        </td>
        <td>
          <div class="text-xs">${a.assetClass}</div>
          <div class="text-xs text-muted">${a.sector}</div>
        </td>
        <td class="font-mono text-xs">${formatCurrency(a.initialPrice, sym)}</td>
        <td class="font-mono text-xs font-bold">${formatCurrency(a.currentPrice, sym)}</td>
        <td class="font-mono text-xs font-bold ${isNegative ? 'text-danger' : 'text-success'}">
          ${formatPercent(a.simulatedReturn)}
        </td>
        <td class="font-mono text-xs font-bold ${isNegative ? 'text-danger' : 'text-success'}">
          ${formatCurrency(a.dollarLoss, sym)}
        </td>
        <td><span class="badge ${vulnClass}">${a.vulnerability}</span></td>
      `;

      this.damageTbody.appendChild(tr);
    });
  }

  _onComplete(trajectory) {
    this._updatePlayButtonState(false);
    audio.playRecoveryChime();

    // Generate and store autopsy
    const autopsy = ReportGenerator.generateAutopsy(this.pm.getActivePortfolio(), this.state.activeScenario, trajectory);
    this.state.setLatestAutopsy(autopsy);

    // Save simulation record to history
    storage.recordSimulation({
      scenarioName: this.state.activeScenario.name,
      portfolioName: this.pm.getActivePortfolio().name,
      maxDrawdownPct: trajectory.maxDrawdownPct,
      totalLoss: trajectory.totalLoss,
      autopsy,
    });

    if (this.autopsyPrompt) {
      this.autopsyPrompt.style.display = 'flex';
      this.autopsyPrompt.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
