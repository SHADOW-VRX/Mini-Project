/**
 * PORTFOLIO CRASH THEATRE — CHART PRESET CONTROLLER
 * High-level orchestration linking state and calculation engines to canvas renders.
 */

import { ChartEngine } from './chart-engine.js';

export class ChartPresets {
  /**
   * Render Dashboard Portfolio Growth Trajectory
   */
  static renderDashboardPerformance(canvas, initialValue) {
    if (!canvas) return;
    const base = initialValue || 100000;
    // Generate realistic historical 1-year trajectory
    const points = 30;
    const labels = [];
    const data = [];
    const baseline = [];

    for (let i = 0; i < points; i++) {
      labels.push(`M${i + 1}`);
      const t = i / points;
      // Upward trend with realistic market drift
      const drift = base * (1 + 0.12 * t + Math.sin(i * 0.7) * 0.04);
      data.push(Math.round(drift));
      baseline.push(Math.round(base * (1 + 0.08 * t)));
    }

    ChartEngine.renderLineChart(canvas, {
      labels,
      series: [
        { name: 'Portfolio Value', color: '#F4B942', data },
        { name: 'S&P 500 Baseline', color: '#5F6575', data: baseline, isBaseline: true },
      ],
      showArea: true,
      yAxisPrefix: '$',
      yAxisDecimals: 0,
    });
  }

  /**
   * Render Dashboard Allocation Donut
   */
  static renderAllocationDonut(canvas, summary) {
    if (!canvas || !summary) return;
    const segments = [];
    for (const assetClass in summary.assetAllocations) {
      segments.push({
        label: assetClass,
        value: summary.assetAllocations[assetClass],
      });
    }
    // Sort descending
    segments.sort((a, b) => b.value - a.value);
    ChartEngine.renderDonutChart(canvas, segments);
  }

  /**
   * Render Dashboard Sector Exposure Bars
   */
  static renderSectorBars(canvas, summary) {
    if (!canvas || !summary) return;
    const total = summary.totalCurrent || 1;
    const items = [];
    for (const sector in summary.sectorAllocations) {
      const val = (summary.sectorAllocations[sector] / total) * 100;
      items.push({
        label: sector,
        value: val,
        color: val > 30 ? '#EF4444' : (val > 18 ? '#F59E0B' : '#F4B942'),
      });
    }
    items.sort((a, b) => b.value - a.value);
    ChartEngine.renderBarChart(canvas, items);
  }

  /**
   * Render Live Crisis Theatre Real-Time Simulation Canvas
   */
  static renderTheatreSimulation(canvas, currentDay, trajectory) {
    if (!canvas || !trajectory) return;

    const visibleSteps = trajectory.steps.slice(0, Math.max(currentDay + 1, 1));
    const labels = [];
    const valData = [];
    const ddData = [];

    for (let i = 0; i <= trajectory.durationDays; i++) {
      labels.push(`D${i}`);
    }

    for (const s of visibleSteps) {
      valData.push(Math.round(s.portfolioValue));
      ddData.push(Number(s.currentDrawdown.toFixed(1)));
    }

    // Determine curve color based on peak drawdown (transitions to crimson as crash deepens)
    const latestStep = visibleSteps[visibleSteps.length - 1];
    const isDeepCrash = latestStep && latestStep.currentDrawdown < -25;
    const lineColor = isDeepCrash ? '#EF4444' : '#F4B942';

    ChartEngine.renderLineChart(canvas, {
      labels,
      series: [
        { name: 'Simulated Valuation', color: lineColor, data: valData },
      ],
      showArea: true,
      yAxisPrefix: '$',
      yAxisDecimals: 0,
    });
  }

  /**
   * Render What-If Dual Trajectory Comparison
   */
  static renderWhatIfComparison(canvas, origSteps, modSteps, durationDays) {
    if (!canvas || !origSteps || !modSteps) return;

    const labels = [];
    for (let i = 0; i <= durationDays; i++) {
      labels.push(`Day ${i}`);
    }

    const origData = origSteps.map(s => Math.round(s.portfolioValue));
    const modData = modSteps.map(s => Math.round(s.portfolioValue));

    ChartEngine.renderLineChart(canvas, {
      labels,
      series: [
        { name: 'Original Portfolio', color: '#EF4444', data: origData, isBaseline: true },
        { name: 'Modified Sandbox Portfolio', color: '#22C55E', data: modData },
      ],
      showArea: false,
      yAxisPrefix: '$',
      yAxisDecimals: 0,
    });
  }

  /**
   * Render Autopsy Recovery Projection Chart
   */
  static renderAutopsyRecovery(canvas, initialVal, troughVal) {
    if (!canvas) return;

    const rates = [
      { name: '6% Conservative', color: '#38BDF8', cagr: 0.06 },
      { name: '10% Historical Avg', color: '#22C55E', cagr: 0.10 },
      { name: '14% Rebound', color: '#F4B942', cagr: 0.14 },
    ];

    const labels = [];
    const maxYears = 7;
    for (let yr = 0; yr <= maxYears; yr++) {
      labels.push(`Yr ${yr}`);
    }

    const series = rates.map(r => {
      const data = [];
      for (let yr = 0; yr <= maxYears; yr++) {
        data.push(Math.round(troughVal * Math.pow(1 + r.cagr, yr)));
      }
      return {
        name: r.name,
        color: r.color,
        data,
      };
    });

    // Add initial portfolio breakeven threshold
    const baselineData = [];
    for (let yr = 0; yr <= maxYears; yr++) {
      baselineData.push(Math.round(initialVal));
    }
    series.push({
      name: 'Breakeven Target',
      color: '#EF4444',
      data: baselineData,
      isBaseline: true,
    });

    ChartEngine.renderLineChart(canvas, {
      labels,
      series,
      showArea: false,
      yAxisPrefix: '$',
      yAxisDecimals: 0,
    });
  }
}
