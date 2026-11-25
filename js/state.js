/**
 * PORTFOLIO CRASH THEATRE — REACTIVE STATE STORE
 * Centralized observable state with publish/subscribe event management.
 */

import { storage } from './storage.js';
import { SCENARIOS } from './simulation/scenarios.js';

class StateStore {
  constructor() {
    this.events = new Map();
    this.activePortfolio = null;
    this.activeScenario = SCENARIOS[0]; // 2008 by default
    this.currentSimulation = null;
    this.latestAutopsy = null;
    this.settings = storage.getSettings();
  }

  /**
   * Subscribe to state event
   */
  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(listener);
    return () => this.off(event, listener);
  }

  /**
   * Unsubscribe from event
   */
  off(event, listener) {
    if (!this.events.has(event)) return;
    const listeners = this.events.get(event).filter(l => l !== listener);
    this.events.set(event, listeners);
  }

  /**
   * Emit event to all subscribers
   */
  emit(event, data) {
    if (!this.events.has(event)) return;
    this.events.get(event).forEach(listener => {
      try {
        listener(data);
      } catch (e) {
        console.error(`[StateStore] Error in listener for event ${event}:`, e);
      }
    });
  }

  setActivePortfolio(portfolio) {
    this.activePortfolio = portfolio;
    this.emit('portfolioChanged', portfolio);
  }

  setActiveScenario(scenario) {
    this.activeScenario = scenario;
    this.emit('scenarioChanged', scenario);
  }

  setLatestAutopsy(autopsyData) {
    this.latestAutopsy = autopsyData;
    this.emit('autopsyReady', autopsyData);
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    storage.saveSettings(this.settings);
    this.emit('settingsChanged', this.settings);
  }
}

export const state = new StateStore();
