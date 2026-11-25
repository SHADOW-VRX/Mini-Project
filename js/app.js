/**
 * PORTFOLIO CRASH THEATRE — MASTER APP BOOTSTRAPPER
 * Initializes reactive state, portfolio manager, router, views, and global event listeners.
 */

import { state } from './state.js';
import { storage } from './storage.js';
import { PortfolioManager } from './portfolio/portfolio-manager.js';
import { Router } from './router.js';
import { NavigationManager } from './ui/navigation.js';
import { ModalManager } from './ui/modal.js';
import { audio } from './ui/audio.js';
import { formatCurrency } from './portfolio/calculations.js';

// View Controllers
import { DashboardView } from './ui/views/dashboard-view.js';
import { PortfolioView } from './ui/views/portfolio-view.js';
import { TheatreView } from './ui/views/theatre-view.js';
import { ScenariosView } from './ui/views/scenarios-view.js';
import { RiskView } from './ui/views/risk-view.js';
import { WhatIfView } from './ui/views/whatif-view.js';
import { AutopsyView } from './ui/views/autopsy-view.js';
import { ReportsView } from './ui/views/reports-view.js';
import { SettingsView } from './ui/views/settings-view.js';

class Application {
  constructor() {
    this.pm = new PortfolioManager(state);

    // Initialize all 9 module views
    this.views = {
      dashboard: new DashboardView(state, this.pm),
      portfolio: new PortfolioView(state, this.pm),
      theatre: new TheatreView(state, this.pm),
      scenarios: new ScenariosView(state, this.pm),
      risk: new RiskView(state, this.pm),
      whatif: new WhatIfView(state, this.pm),
      autopsy: new AutopsyView(state, this.pm),
      reports: new ReportsView(state, this.pm),
      settings: new SettingsView(state, this.pm),
    };

    this.router = new Router(this.views);
    this.navigation = new NavigationManager(this.router);

    this._initHeaderSync();
    this._initAudioControl();
    this._initResizeHandler();
    ModalManager.initGlobalListeners();
  }

  init() {
    // Sync initial active portfolio
    const activePort = this.pm.getActivePortfolio();
    state.setActivePortfolio(activePort);

    // Start router
    this.router.init();

    // Listen to route changes to update active sidebar state
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      this.navigation.setActiveView(hash);
    });
    this.navigation.setActiveView(window.location.hash.replace('#', '') || 'dashboard');
  }

  _initHeaderSync() {
    const portNameEl = document.getElementById('header-portfolio-name');
    const portValEl = document.getElementById('header-portfolio-value');

    const updateHeader = () => {
      const summary = this.pm.getActiveSummary();
      const port = this.pm.getActivePortfolio();
      const sym = state.settings.currencySymbol || '$';

      if (portNameEl) portNameEl.textContent = port.name;
      if (portValEl) portValEl.textContent = formatCurrency(summary.totalCurrent, sym);
    };

    state.on('portfolioChanged', updateHeader);
    state.on('settingsChanged', updateHeader);
    updateHeader();
  }

  _initAudioControl() {
    const btn = document.getElementById('btn-toggle-audio');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const enabled = audio.toggle();
      btn.classList.toggle('active', enabled);
      btn.title = enabled ? 'Crisis Sound FX: Enabled' : 'Crisis Sound FX: Muted';
    });

    btn.classList.add('active'); // Enabled by default
  }

  _initResizeHandler() {
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Trigger render on active view if it has charts
        const activeRoute = this.router.activeRoute;
        if (activeRoute && this.views[activeRoute]?.render) {
          this.views[activeRoute].render();
        }
      }, 200);
    });
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new Application();
  app.init();
});
