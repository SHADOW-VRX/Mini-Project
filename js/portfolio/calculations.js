/**
 * PORTFOLIO CRASH THEATRE — FINANCIAL CALCULATIONS ENGINE
 * Mathematical logic for portfolio valuations, weights, risk metrics, and allocations.
 */

/**
 * Format currency with configured symbol and precision
 */
export function formatCurrency(amount, symbol = '$', decimals = 2) {
  if (isNaN(amount) || amount === null || amount === undefined) return `${symbol}0.00`;
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

/**
 * Format percentage with explicit sign if needed
 */
export function formatPercent(value, includeSign = true, decimals = 2) {
  if (isNaN(value) || value === null || value === undefined) return '0.00%';
  const prefix = includeSign && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(decimals)}%`;
}

/**
 * Calculate metrics for an individual holding
 */
export function calculateHolding(holding, totalPortfolioValue = 0) {
  const qty = Number(holding.quantity) || 0;
  const buy = Number(holding.buyPrice) || 0;
  const current = Number(holding.currentPrice) || 0;

  const investedValue = qty * buy;
  const currentValue = qty * current;
  const unrealizedPL = currentValue - investedValue;
  const unrealizedPLPercent = investedValue > 0 ? (unrealizedPL / investedValue) * 100 : 0;
  const weight = totalPortfolioValue > 0 ? (currentValue / totalPortfolioValue) * 100 : 0;

  return {
    ...holding,
    quantity: qty,
    buyPrice: buy,
    currentPrice: current,
    investedValue,
    currentValue,
    unrealizedPL,
    unrealizedPLPercent,
    weight,
    beta: Number(holding.beta) || 1.0,
    volatility: Number(holding.volatility) || 0.15,
  };
}

/**
 * Calculate comprehensive summary metrics for an entire portfolio
 */
export function calculatePortfolioSummary(portfolio) {
  if (!portfolio || !Array.isArray(portfolio.holdings) || portfolio.holdings.length === 0) {
    return {
      totalInvested: 0,
      totalCurrent: 0,
      totalPL: 0,
      totalPLPercent: 0,
      weightedBeta: 0,
      weightedVolatility: 0,
      hhiHoldings: 0,
      hhiSectors: 0,
      riskScore: 0,
      holdingsCount: 0,
      holdings: [],
      assetAllocations: {},
      sectorAllocations: {},
      currencyAllocations: {},
      regionAllocations: {},
      liquidityAllocations: { high: 0, medium: 0, low: 0 },
    };
  }

  // First pass: calculate total portfolio market value
  let totalCurrent = 0;
  let totalInvested = 0;

  for (const h of portfolio.holdings) {
    const qty = Number(h.quantity) || 0;
    const buy = Number(h.buyPrice) || 0;
    const cur = Number(h.currentPrice) || 0;
    totalInvested += qty * buy;
    totalCurrent += qty * cur;
  }

  // Second pass: detailed metrics per holding with exact weights
  const enrichedHoldings = portfolio.holdings.map(h => calculateHolding(h, totalCurrent));

  // Sort holdings descending by market value
  enrichedHoldings.sort((a, b) => b.currentValue - a.currentValue);

  const totalPL = totalCurrent - totalInvested;
  const totalPLPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  let weightedBeta = 0;
  let weightedVolatility = 0;
  let hhiHoldings = 0;

  const assetAllocations = {};
  const sectorAllocations = {};
  const currencyAllocations = {};
  const regionAllocations = {};
  const liquidityAllocations = { high: 0, medium: 0, low: 0 };

  for (const h of enrichedHoldings) {
    const fraction = totalCurrent > 0 ? h.currentValue / totalCurrent : 0;
    const weightPct = h.weight;

    weightedBeta += fraction * h.beta;
    weightedVolatility += fraction * h.volatility;
    hhiHoldings += weightPct * weightPct;

    // Asset Class
    const assetClass = h.assetClass || 'Other';
    assetAllocations[assetClass] = (assetAllocations[assetClass] || 0) + h.currentValue;

    // Sector
    const sector = h.sector || 'Unassigned';
    sectorAllocations[sector] = (sectorAllocations[sector] || 0) + h.currentValue;

    // Currency
    const currency = h.currency || 'USD';
    currencyAllocations[currency] = (currencyAllocations[currency] || 0) + h.currentValue;

    // Region
    const region = h.region || 'Global';
    regionAllocations[region] = (regionAllocations[region] || 0) + h.currentValue;

    // Liquidity
    const liqTier = (h.liquidity || 'high').toLowerCase();
    if (liquidityAllocations[liqTier] !== undefined) {
      liquidityAllocations[liqTier] += h.currentValue;
    } else {
      liquidityAllocations.medium += h.currentValue;
    }
  }

  // Sector HHI
  let hhiSectors = 0;
  for (const sector in sectorAllocations) {
    const sectorWeightPct = totalCurrent > 0 ? (sectorAllocations[sector] / totalCurrent) * 100 : 0;
    hhiSectors += sectorWeightPct * sectorWeightPct;
  }

  // Composite Risk Score (0 - 100)
  // Factors: Beta (30%), Volatility (30%), Concentration HHI (25%), Illiquidity (15%)
  const betaScore = Math.min(Math.max((weightedBeta - 0.5) * 40, 0), 100);
  const volScore = Math.min(Math.max((weightedVolatility - 0.08) * 350, 0), 100);
  const concentrationScore = Math.min((hhiHoldings / 3000) * 100, 100);
  const illiquidityPct = totalCurrent > 0 ? ((liquidityAllocations.low * 1.0 + liquidityAllocations.medium * 0.4) / totalCurrent) * 100 : 0;
  const liquidityScore = Math.min(illiquidityPct * 2, 100);

  const rawRiskScore = (betaScore * 0.3) + (volScore * 0.3) + (concentrationScore * 0.25) + (liquidityScore * 0.15);
  const riskScore = Math.round(Math.min(Math.max(rawRiskScore, 5), 98));

  return {
    totalInvested,
    totalCurrent,
    totalPL,
    totalPLPercent,
    weightedBeta: Number(weightedBeta.toFixed(2)),
    weightedVolatility: Number(weightedVolatility.toFixed(4)),
    hhiHoldings: Math.round(hhiHoldings),
    hhiSectors: Math.round(hhiSectors),
    riskScore,
    holdingsCount: enrichedHoldings.length,
    holdings: enrichedHoldings,
    assetAllocations,
    sectorAllocations,
    currencyAllocations,
    regionAllocations,
    liquidityAllocations,
  };
}
