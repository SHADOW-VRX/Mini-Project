/**
 * PORTFOLIO CRASH THEATRE — QUANTITATIVE RISK ENGINE
 * Parametric VaR, Historical CVaR approximation, Annualized Volatility, and Sharpe Ratio.
 */

export class RiskEngine {
  /**
   * Standard Normal Distribution Quantiles (Z-scores)
   */
  static Z_SCORES = {
    0.90: 1.282,
    0.95: 1.645,
    0.99: 2.326,
  };

  /**
   * Standard Normal Probability Density Function phi(z)
   */
  static normalPdf(z) {
    return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  }

  /**
   * Calculate Parametric Value at Risk (VaR)
   * Daily VaR = PortfolioValue * (Z * (sigma / sqrt(252)))
   */
  static calculateVaR(portfolioValue, annualizedVolatility, confidence = 0.95, horizon = 'daily') {
    const z = this.Z_SCORES[confidence] || 1.645;
    const dailyVol = annualizedVolatility / Math.sqrt(252);

    let periodVol = dailyVol;
    if (horizon === 'monthly') {
      periodVol = dailyVol * Math.sqrt(21);
    } else if (horizon === 'annual') {
      periodVol = annualizedVolatility;
    }

    const varDollar = portfolioValue * z * periodVol;
    const varPercent = z * periodVol * 100;

    return {
      dollar: Math.max(0, varDollar),
      percent: Math.max(0, varPercent),
      confidence,
      horizon,
    };
  }

  /**
   * Calculate Conditional VaR (CVaR / Expected Shortfall)
   * Formula for normal distribution: CVaR = PortfolioValue * (phi(Z) / alpha) * periodVol
   */
  static calculateCVaR(portfolioValue, annualizedVolatility, confidence = 0.95, horizon = 'daily') {
    const z = this.Z_SCORES[confidence] || 1.645;
    const alpha = 1 - confidence;
    const dailyVol = annualizedVolatility / Math.sqrt(252);

    let periodVol = dailyVol;
    if (horizon === 'monthly') periodVol = dailyVol * Math.sqrt(21);
    else if (horizon === 'annual') periodVol = annualizedVolatility;

    const pdfZ = this.normalPdf(z);
    const cvarFactor = (pdfZ / alpha) * periodVol;

    const cvarDollar = portfolioValue * cvarFactor;
    const cvarPercent = cvarFactor * 100;

    return {
      dollar: Math.max(0, cvarDollar),
      percent: Math.max(0, cvarPercent),
      confidence,
      horizon,
    };
  }

  /**
   * Calculate Sharpe Ratio
   * Sharpe = (Expected Return - Risk Free Rate) / Annualized Volatility
   */
  static calculateSharpeRatio(expectedReturn, annualizedVolatility, riskFreeRate = 0.045) {
    if (annualizedVolatility <= 0.001) return 0;
    const excessReturn = expectedReturn - riskFreeRate;
    return Number((excessReturn / annualizedVolatility).toFixed(2));
  }

  /**
   * Calculate Diversification Ratio
   * Ratio of weighted sum of individual volatilities to total portfolio volatility
   */
  static calculateDiversificationRatio(holdings, totalPortfolioVol) {
    if (!holdings || holdings.length === 0 || totalPortfolioVol <= 0) return 1.0;
    let weightedVolSum = 0;
    for (const h of holdings) {
      const weight = (h.weight || 0) / 100;
      weightedVolSum += weight * (h.volatility || 0.18);
    }
    return Number((weightedVolSum / totalPortfolioVol).toFixed(2));
  }
}
