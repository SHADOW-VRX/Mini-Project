/**
 * PORTFOLIO CRASH THEATRE — REPORT & AUTOPSY GENERATOR
 * Compiles forensic post-crisis autopsies, loss attribution matrices, and actionable recommendations.
 */

import { RecoveryCalculator } from '../simulation/recovery.js';

export class ReportGenerator {
  /**
   * Generate comprehensive forensic autopsy data from a completed simulation trajectory
   */
  static generateAutopsy(portfolio, scenario, trajectory) {
    const initialVal = trajectory.initialValue;
    const troughVal = trajectory.troughValue;
    const totalLoss = trajectory.totalLoss;
    const maxDrawdownPct = trajectory.maxDrawdownPct;

    // Last step contains the final asset valuations
    const finalStep = trajectory.steps[trajectory.steps.length - 1];
    const assetSnapshots = finalStep.assets || [];

    // Calculate asset loss attribution
    const assetAttribution = assetSnapshots.map(a => {
      const loss = a.dollarLoss;
      const shareOfTotalLoss = totalLoss < 0 && loss < 0 ? (loss / totalLoss) * 100 : 0;
      return {
        id: a.id,
        symbol: a.symbol,
        name: a.name,
        sector: a.sector,
        assetClass: a.assetClass,
        dollarLoss: loss,
        simulatedReturn: a.simulatedReturn,
        lossSharePct: shareOfTotalLoss,
        vulnerability: a.vulnerability,
      };
    });

    // Sort by worst dollar loss first
    assetAttribution.sort((a, b) => a.dollarLoss - b.dollarLoss);

    // Calculate sector loss attribution
    const sectorMap = {};
    for (const a of assetSnapshots) {
      if (!sectorMap[a.sector]) {
        sectorMap[a.sector] = { totalLoss: 0, returns: [] };
      }
      sectorMap[a.sector].totalLoss += a.dollarLoss;
      sectorMap[a.sector].returns.push(a.simulatedReturn);
    }

    const sectorAttribution = Object.keys(sectorMap).map(sec => {
      const data = sectorMap[sec];
      const avgReturn = data.returns.reduce((sum, r) => sum + r, 0) / (data.returns.length || 1);
      return {
        sector: sec,
        totalLoss: data.totalLoss,
        avgReturn,
      };
    });
    sectorAttribution.sort((a, b) => a.totalLoss - b.totalLoss);

    // Compute recovery metrics
    const reqGain = RecoveryCalculator.calculateRequiredGain(maxDrawdownPct);
    const yearsAt6 = RecoveryCalculator.calculateYearsToRecover(maxDrawdownPct, 6);
    const yearsAt10 = RecoveryCalculator.calculateYearsToRecover(maxDrawdownPct, 10);
    const yearsAt14 = RecoveryCalculator.calculateYearsToRecover(maxDrawdownPct, 14);

    // Generate actionable recommendations
    const recommendations = [];

    // Check worst contributor
    const worstAsset = assetAttribution[0];
    if (worstAsset && worstAsset.dollarLoss < 0) {
      recommendations.push({
        title: `De-risk Anchor Exposure: ${worstAsset.symbol}`,
        desc: `${worstAsset.symbol} caused ${worstAsset.lossSharePct.toFixed(1)}% of your entire portfolio drawdown. Consider sizing single speculative positions below 10%.`,
      });
    }

    // Check sector contagion
    const worstSector = sectorAttribution[0];
    if (worstSector && worstSector.totalLoss < 0) {
      recommendations.push({
        title: `Hedge Sector Vulnerability: ${worstSector.sector}`,
        desc: `Macro shock in ${worstSector.sector} caused an average asset decline of ${worstSector.avgReturn.toFixed(1)}%. Rebalance a portion into defensive staples or cash reserves.`,
      });
    }

    // Check drawdown depth
    if (Math.abs(maxDrawdownPct) > 25) {
      recommendations.push({
        title: 'Establish Systemic Volatility Shock Absorbers',
        desc: `At ${Math.abs(maxDrawdownPct).toFixed(1)}% maximum drawdown, your portfolio requires a ${reqGain.toFixed(1)}% market rally just to break even. Introducing 10-15% gold or short-duration treasuries drastically reduces trough severity.`,
      });
    }

    return {
      portfolioName: portfolio.name,
      scenarioName: scenario.name,
      initialValue: initialVal,
      troughValue: troughVal,
      totalLoss,
      maxDrawdownPct,
      requiredGain: reqGain,
      recoveryYears: {
        at6: yearsAt6,
        at10: yearsAt10,
        at14: yearsAt14,
      },
      assetAttribution,
      sectorAttribution,
      recommendations,
    };
  }
}
