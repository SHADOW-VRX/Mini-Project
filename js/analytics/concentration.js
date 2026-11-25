/**
 * PORTFOLIO CRASH THEATRE — CONCENTRATION & VULNERABILITY ANALYZER
 * Evaluates Herfindahl-Hirschman concentration, sector overexposure, and structural fault lines.
 */

export class ConcentrationAnalyzer {
  /**
   * Classify HHI score
   */
  static getHHIClassification(score) {
    if (score < 1500) {
      return { grade: 'Well Diversified', status: 'success', desc: 'Healthy dispersion across independent positions.' };
    } else if (score <= 2500) {
      return { grade: 'Moderate Concentration', status: 'warning', desc: 'Moderate overweighting in top positions; monitor sector exposures.' };
    } else {
      return { grade: 'High Concentration Risk', status: 'danger', desc: 'Critical single-point-of-failure vulnerability detected.' };
    }
  }

  /**
   * Scan portfolio for institutional risk red flags
   */
  static detectVulnerabilities(summary) {
    const alerts = [];
    const holdings = summary.holdings || [];
    const total = summary.totalCurrent || 0;

    if (total <= 0) return alerts;

    // Check 1: Single stock overweight (> 18%)
    for (const h of holdings) {
      if (h.weight > 18 && h.assetClass.includes('Equities')) {
        alerts.push({
          type: 'high_weight',
          level: 'danger',
          title: `Overweight Single Equity: ${h.symbol} (${h.weight.toFixed(1)}%)`,
          desc: `${h.name} exceeds standard institutional limits (15%). Severe drawdown in this single name will disproportionately damage portfolio.`,
        });
      }
    }

    // Check 2: Sector Overexposure (> 35%)
    for (const sector in summary.sectorAllocations) {
      const secWeight = (summary.sectorAllocations[sector] / total) * 100;
      if (secWeight > 35 && sector !== 'Cash') {
        alerts.push({
          type: 'sector_overweight',
          level: 'danger',
          title: `Excessive Sector Exposure: ${sector} (${secWeight.toFixed(1)}%)`,
          desc: `Over one-third of your capital is concentrated in ${sector}. Highly susceptible to industry-specific regulatory or macroeconomic shock.`,
        });
      }
    }

    // Check 3: High Weighted Beta (> 1.35)
    if (summary.weightedBeta > 1.35) {
      alerts.push({
        type: 'high_beta',
        level: 'warning',
        title: `Elevated Portfolio Beta (${summary.weightedBeta.toFixed(2)})`,
        desc: `Your portfolio carries 35%+ more volatility than the general market, amplifying drawdowns during sharp sell-offs.`,
      });
    }

    // Check 4: Zero Safe-Haven Hedges (No Treasuries, Gold, or Cash)
    const hasCash = (summary.liquidityAllocations?.high || 0) > 0.05 * total;
    const hasGold = (summary.assetAllocations['Precious Metals'] || 0) > 0.03 * total;
    const hasBonds = (summary.assetAllocations['Fixed Income (Govt)'] || 0) > 0.05 * total;

    if (!hasCash && !hasGold && !hasBonds) {
      alerts.push({
        type: 'no_hedge',
        level: 'danger',
        title: 'Complete Absence of Uncorrelated Safe Havens',
        desc: '0% capital allocated to Treasuries, Gold, or Cash reserves. During systemic crises, correlation breakdown will leave portfolio with zero capital shock absorbers.',
      });
    }

    return alerts;
  }
}
