/**
 * PORTFOLIO CRASH THEATRE — POST-CRASH RECOVERY MATHEMATICS
 * Quantifies loss asymmetry, required breakeven gains, and compound annual growth rate recovery trajectories.
 */

export class RecoveryCalculator {
  /**
   * Calculate exact mathematical required gain to recover from a given drawdown percentage
   * e.g., -50% loss requires +100% gain; -33.3% requires +50% gain.
   */
  static calculateRequiredGain(drawdownPct) {
    const dd = Math.abs(drawdownPct) / 100;
    if (dd >= 1.0) return Infinity;
    if (dd <= 0) return 0;
    return ((1 / (1 - dd)) - 1) * 100;
  }

  /**
   * Calculate estimated years required to recover to original capital at a given annual CAGR
   * Formula: T = ln(1 / (1 - DD)) / ln(1 + CAGR)
   */
  static calculateYearsToRecover(drawdownPct, cagrPercent) {
    const dd = Math.abs(drawdownPct) / 100;
    const r = cagrPercent / 100;
    if (dd <= 0) return 0;
    if (dd >= 0.999 || r <= 0) return 99;

    const years = Math.log(1 / (1 - dd)) / Math.log(1 + r);
    return Math.max(0, Number(years.toFixed(1)));
  }

  /**
   * Generate recovery path projections over 10 years at varying CAGR rates
   */
  static generateRecoveryProjections(initialValue, troughValue, maxYears = 8) {
    const rates = [
      { name: 'Conservative (6% CAGR)', cagr: 0.06, color: '#38BDF8' },
      { name: 'Historical Avg (10% CAGR)', cagr: 0.10, color: '#22C55E' },
      { name: 'Aggressive Rebound (14% CAGR)', cagr: 0.14, color: '#F4B942' },
    ];

    const labels = [];
    for (let yr = 0; yr <= maxYears; yr++) {
      labels.push(`Year ${yr}`);
    }

    const series = rates.map(rate => {
      const data = [];
      for (let yr = 0; yr <= maxYears; yr++) {
        const val = troughValue * Math.pow(1 + rate.cagr, yr);
        data.push(Math.round(val));
      }
      return {
        name: rate.name,
        color: rate.color,
        data,
      };
    });

    return { labels, series, targetValue: initialValue };
  }
}
