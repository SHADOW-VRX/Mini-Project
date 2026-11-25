/**
 * PORTFOLIO CRASH THEATRE — MATHEMATICAL SIMULATION ENGINE
 * Calculates 5-phase stress contagion trajectories, daily portfolio valuations, drawdowns, and asset damage.
 */

import { calculatePortfolioSummary } from '../portfolio/calculations.js';

export class SimulationEngine {
  constructor(portfolio, scenario, configOverrides = {}) {
    this.portfolio = portfolio;
    this.scenario = scenario;
    this.overrides = configOverrides;
    this.duration = scenario.durationDays || 60;

    // Cache pre-calculated steps
    this.trajectory = this._computeFullTrajectory();
  }

  /**
   * Determine the current crisis phase for a given day step
   */
  static getPhaseForDay(day, totalDays) {
    const fraction = totalDays > 0 ? day / totalDays : 0;
    if (fraction <= 0.15) {
      return {
        phase: 1,
        name: 'Initial Shock',
        desc: 'Catalyst triggers initial liquidation cascade in high-beta assets.',
      };
    } else if (fraction <= 0.40) {
      return {
        phase: 2,
        name: 'Sector Contagion',
        desc: 'Spillover expands across credit, financials, and supply chains.',
      };
    } else if (fraction <= 0.70) {
      return {
        phase: 3,
        name: 'Correlation Breakdown',
        desc: 'Diversification fails as margin liquidations force selling everywhere.',
      };
    } else if (fraction <= 0.85) {
      return {
        phase: 4,
        name: 'Maximum Stress',
        desc: 'Capitulation selling and peak portfolio drawdown reached.',
      };
    } else {
      return {
        phase: 5,
        name: 'Recovery Divergence',
        desc: 'Quality safe havens rebound while high-debt assets lag behind.',
      };
    }
  }

  /**
   * Calculate non-linear crisis trajectory factor for normalized progress [0, 1]
   */
  _computeProgressCurve(tNorm) {
    // Trough occurs around 78% of the timeline
    const troughTime = 0.78;
    if (tNorm <= troughTime) {
      // Plunging phase using smooth S-curve
      const x = tNorm / troughTime;
      // Hermite smoothstep plunging from 0 to 1
      return (3 * x * x - 2 * x * x * x);
    } else {
      // Recovery phase: recovers about 20% to 35% from the trough
      const x = (tNorm - troughTime) / (1 - troughTime);
      const recoveryFraction = 0.28;
      return 1.0 - (recoveryFraction * (3 * x * x - 2 * x * x * x));
    }
  }

  /**
   * Calculate max shock for a specific holding
   */
  _computeAssetMaxShock(holding) {
    const sector = holding.sector || 'Unassigned';
    const sectorShock = this.scenario.sectorShocks[sector] !== undefined
      ? this.scenario.sectorShocks[sector]
      : (this.scenario.sectorShocks['Technology'] || -0.30);

    const beta = Number(holding.beta) || 1.0;
    const betaFactor = this.scenario.marketBetaFactor || 1.25;

    // Liquidity tier friction
    let liquidityPenalty = 0.0;
    if (holding.liquidity === 'low') liquidityPenalty = 0.08 * (this.scenario.liquidityStressFactor || 1.0);
    else if (holding.liquidity === 'medium') liquidityPenalty = 0.03;

    // Apply user severity multiplier override if present
    const severityMultiplier = this.overrides.severityMultiplier || 1.0;

    let finalShock = 0;
    if (sectorShock < 0) {
      // Downward shock amplified by beta and liquidity
      const betaMultiplier = Math.max(0.4, 1.0 + (beta - 1.0) * 0.45 * betaFactor);
      finalShock = (sectorShock * betaMultiplier - liquidityPenalty) * severityMultiplier;
      // Cap maximum loss at -98%
      finalShock = Math.max(finalShock, -0.98);
    } else {
      // Safe haven or hedge asset (e.g. Gold or Treasuries that gain in crisis)
      finalShock = sectorShock * severityMultiplier;
    }

    return finalShock;
  }

  /**
   * Pre-compute entire day-by-day trajectory
   */
  _computeFullTrajectory() {
    const days = this.duration;
    const initialSummary = calculatePortfolioSummary(this.portfolio);
    const initialPortfolioValue = initialSummary.totalCurrent;

    // Calculate max shock for each holding
    const assetProfiles = this.portfolio.holdings.map(h => {
      const maxShock = this._computeAssetMaxShock(h);
      const initialPrice = Number(h.currentPrice) || 0;
      const quantity = Number(h.quantity) || 0;
      return {
        holding: h,
        initialPrice,
        quantity,
        maxShock,
      };
    });

    const trajectory = [];
    let minPortfolioValue = initialPortfolioValue;
    let maxDrawdownPct = 0;

    for (let day = 0; day <= days; day++) {
      const tNorm = day / days;
      const curveFactor = this._computeProgressCurve(tNorm);
      const phaseInfo = SimulationEngine.getPhaseForDay(day, days);

      let dayTotalValue = 0;
      const assetSnapshots = [];

      for (const profile of assetProfiles) {
        // Daily return factor for this asset
        const currentReturnFactor = profile.maxShock * curveFactor;
        const currentPrice = profile.initialPrice * (1 + currentReturnFactor);
        const currentHoldingValue = profile.quantity * currentPrice;
        const dollarLoss = currentHoldingValue - (profile.quantity * profile.initialPrice);

        dayTotalValue += currentHoldingValue;

        // Categorize vulnerability status
        let vulnerability = 'Resilient';
        if (currentReturnFactor <= -0.45) vulnerability = 'Critical';
        else if (currentReturnFactor <= -0.25) vulnerability = 'Severe';
        else if (currentReturnFactor <= -0.10) vulnerability = 'Moderate';
        else if (currentReturnFactor > 0.02) vulnerability = 'Hedge';

        assetSnapshots.push({
          id: profile.holding.id,
          symbol: profile.holding.symbol,
          name: profile.holding.name,
          sector: profile.holding.sector,
          assetClass: profile.holding.assetClass,
          initialPrice: profile.initialPrice,
          currentPrice: Math.max(0, currentPrice),
          simulatedReturn: currentReturnFactor * 100,
          currentValue: Math.max(0, currentHoldingValue),
          dollarLoss,
          vulnerability,
        });
      }

      const totalLoss = dayTotalValue - initialPortfolioValue;
      const currentDrawdown = initialPortfolioValue > 0 ? (totalLoss / initialPortfolioValue) * 100 : 0;

      if (dayTotalValue < minPortfolioValue) {
        minPortfolioValue = dayTotalValue;
      }
      if (currentDrawdown < maxDrawdownPct) {
        maxDrawdownPct = currentDrawdown;
      }

      trajectory.push({
        day,
        phase: phaseInfo.phase,
        phaseName: phaseInfo.name,
        phaseDesc: phaseInfo.desc,
        portfolioValue: dayTotalValue,
        totalLoss,
        currentDrawdown,
        maxDrawdownSoFar: maxDrawdownPct,
        minPortfolioValueSoFar: minPortfolioValue,
        assets: assetSnapshots,
      });
    }

    return {
      initialValue: initialPortfolioValue,
      troughValue: minPortfolioValue,
      totalLoss: minPortfolioValue - initialPortfolioValue,
      maxDrawdownPct,
      durationDays: days,
      steps: trajectory,
    };
  }

  /**
   * Get pre-computed step data for a given day
   */
  getStep(day) {
    const clampedDay = Math.min(Math.max(day, 0), this.duration);
    return this.trajectory.steps[clampedDay];
  }
}
