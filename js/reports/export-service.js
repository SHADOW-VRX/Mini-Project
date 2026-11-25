/**
 * PORTFOLIO CRASH THEATRE — EXPORT SERVICE
 * Handles file downloads (CSV, JSON) and PDF-ready print dialogs.
 */

export class ExportService {
  /**
   * Helper to trigger native browser file download
   */
  static downloadFile(content, fileName, mimeType = 'text/plain;charset=utf-8;') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Export simulation day-by-day trajectory to CSV
   */
  static exportSimulationCSV(trajectory, scenarioName) {
    if (!trajectory || !trajectory.steps) return;
    const header = 'Day,Phase,Phase Name,Portfolio Value ($),Dollar Loss ($),Drawdown (%)\n';
    const rows = trajectory.steps.map(s =>
      `${s.day},${s.phase},"${s.phaseName}",${s.portfolioValue.toFixed(2)},${s.totalLoss.toFixed(2)},${s.currentDrawdown.toFixed(2)}`
    ).join('\n');

    const cleanName = scenarioName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    this.downloadFile(header + rows, `simulation_${cleanName}_trajectory.csv`, 'text/csv;charset=utf-8;');
  }

  /**
   * Export portfolio holdings to CSV
   */
  static exportHoldingsCSV(portfolio) {
    if (!portfolio || !portfolio.holdings) return;
    const header = 'Symbol,Name,Asset Class,Sector,Quantity,Buy Price,Current Price,Beta,Volatility,Liquidity\n';
    const rows = portfolio.holdings.map(h =>
      `"${h.symbol}","${h.name}","${h.assetClass}","${h.sector}",${h.quantity},${h.buyPrice},${h.currentPrice},${h.beta || 1.0},${h.volatility || 0.18},"${h.liquidity || 'high'}"`
    ).join('\n');

    const cleanName = portfolio.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    this.downloadFile(header + rows, `portfolio_${cleanName}_holdings.csv`, 'text/csv;charset=utf-8;');
  }

  /**
   * Export complete stress audit trail as JSON
   */
  static exportAuditDossierJSON(portfolio, scenario, trajectory, autopsy) {
    const data = {
      auditTimestamp: new Date().toISOString(),
      platform: 'Portfolio Crash Theatre',
      portfolio: {
        id: portfolio.id,
        name: portfolio.name,
        holdingsCount: portfolio.holdings.length,
      },
      scenario: {
        id: scenario.id,
        name: scenario.name,
        severity: scenario.severity,
      },
      simulationOutcome: {
        initialVal: trajectory.initialValue,
        troughVal: trajectory.troughValue,
        totalLoss: trajectory.totalLoss,
        maxDrawdownPct: trajectory.maxDrawdownPct,
      },
      autopsyFindings: autopsy,
    };

    const jsonString = JSON.stringify(data, null, 2);
    this.downloadFile(jsonString, `stress_test_audit_${Date.now()}.json`, 'application/json');
  }

  /**
   * Trigger formal browser print dialog for institutional report
   */
  static printDossier() {
    window.print();
  }
}
