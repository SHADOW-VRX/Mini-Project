/**
 * PORTFOLIO CRASH THEATRE — ASSET CORRELATION MATRIX ENGINE
 * Models cross-asset relationships, diversification benefits, and stress-breakdown matrices.
 */

export class CorrelationEngine {
  /**
   * Determine pairwise correlation coefficient between two assets based on their class and sector
   */
  static getCorrelation(assetA, assetB) {
    if (assetA.id === assetB.id || assetA.symbol === assetB.symbol) {
      return 1.0;
    }

    const classA = assetA.assetClass;
    const classB = assetB.assetClass;
    const sectorA = assetA.sector;
    const sectorB = assetB.sector;

    // Cash is uncorrelated to everything
    if (classA === 'Cash & Equivalents' || classB === 'Cash & Equivalents') {
      return 0.0;
    }

    // Treasuries vs Equities (Flight to safety hedge)
    if ((classA === 'Fixed Income (Govt)' && classB.includes('Equities')) ||
        (classB === 'Fixed Income (Govt)' && classA.includes('Equities'))) {
      return -0.25;
    }

    // Gold vs Equities
    if ((classA === 'Precious Metals' && classB.includes('Equities')) ||
        (classB === 'Precious Metals' && classA.includes('Equities'))) {
      return 0.08;
    }

    // Commodities vs Treasuries
    if ((classA === 'Commodities' && classB.includes('Fixed Income')) ||
        (classB === 'Commodities' && classA.includes('Fixed Income'))) {
      return -0.15;
    }

    // Both same sector equities (e.g. AAPL and MSFT)
    if (classA === classB && sectorA === sectorB) {
      return 0.82;
    }

    // Both equities, different sectors
    if (classA.includes('Equities') && classB.includes('Equities')) {
      if ((sectorA === 'Technology' && sectorB === 'Consumer Discretionary') ||
          (sectorA === 'Consumer Discretionary' && sectorB === 'Technology')) {
        return 0.72;
      }
      if ((sectorA === 'Technology' && sectorB === 'Utilities') ||
          (sectorA === 'Utilities' && sectorB === 'Technology')) {
        return 0.28;
      }
      return 0.55;
    }

    // Default cross-asset baseline
    return 0.35;
  }

  /**
   * Build complete NxN pairwise correlation matrix for portfolio holdings
   */
  static buildMatrix(holdings) {
    // Limit to top 10 holdings if portfolio is very large for heatmap readability
    const targetHoldings = holdings.slice(0, 10);
    const symbols = targetHoldings.map(h => h.symbol);
    const matrix = [];

    for (let i = 0; i < targetHoldings.length; i++) {
      const row = [];
      for (let j = 0; j < targetHoldings.length; j++) {
        row.push(this.getCorrelation(targetHoldings[i], targetHoldings[j]));
      }
      matrix.push(row);
    }

    return { symbols, targetHoldings, matrix };
  }

  /**
   * Convert correlation value [-1, 1] to CSS background color
   * -1.0 (Dark Emerald Green) -> 0.0 (Neutral Slate) -> +1.0 (Deep Crimson Red)
   */
  static getCorrelationColor(corr) {
    if (corr >= 0.99) return 'rgba(239, 68, 68, 0.75)'; // Self-correlation
    if (corr > 0.6) return 'rgba(239, 68, 68, 0.45)';
    if (corr > 0.3) return 'rgba(245, 158, 11, 0.35)';
    if (corr >= 0) return 'rgba(146, 152, 165, 0.2)';
    if (corr > -0.2) return 'rgba(56, 189, 248, 0.3)';
    return 'rgba(34, 197, 94, 0.5)'; // Strong negative diversifier
  }
}
