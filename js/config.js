/**
 * PORTFOLIO CRASH THEATRE — CENTRALIZED CONFIGURATION
 * Contains default portfolios, scenario definitions, financial constants, and app defaults.
 */

export const APP_CONFIG = {
  name: 'Portfolio Crash Theatre',
  version: '1.0.0',
  tagline: 'Experience the crash. Discover the weakness. Understand the risk.',
  author: 'Financial Risk Intelligence Architecture',
  storageKey: 'pct_portfolio_store_v1',
  settingsKey: 'pct_settings_store_v1',
  historyKey: 'pct_simulation_history_v1',
  snapshotsKey: 'pct_portfolio_snapshots_v1',

  defaults: {
    currency: 'USD',
    currencySymbol: '$',
    riskFreeRate: 0.045, // 4.5% annual risk-free rate
    varConfidence: 0.95, // 95% default VaR confidence
    simulationSpeed: 1, // 1x default
    soundEnabled: true,
    hhiThresholdModerate: 1500,
    hhiThresholdHigh: 2500,
  },

  assetClasses: [
    'Equities (US)',
    'Equities (International)',
    'Fixed Income (Govt)',
    'Fixed Income (Corp)',
    'Commodities',
    'Precious Metals',
    'Real Estate (REITs)',
    'Cash & Equivalents',
    'Cryptocurrency',
  ],

  sectors: [
    'Technology',
    'Financials',
    'Healthcare',
    'Consumer Discretionary',
    'Consumer Staples',
    'Energy',
    'Industrials',
    'Materials',
    'Utilities',
    'Real Estate',
    'Government',
    'Cash',
  ],

  currencies: [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  ],

  liquidityTiers: [
    { id: 'high', name: 'High (T+1, negligible slippage)', penalty: 0.0 },
    { id: 'medium', name: 'Medium (Minor liquidity friction)', penalty: 0.05 },
    { id: 'low', name: 'Low (Severe illiquidity in crisis)', penalty: 0.15 },
  ],
};

/**
 * Realistic Institutional & Retail Seed Portfolios
 */
export const DEFAULT_PORTFOLIOS = {
  balanced: {
    id: 'portfolio_balanced_60_40',
    name: 'Institutional 60/40 Balanced',
    description: 'Classic institutional benchmark: 60% diversified equities, 35% fixed income, 5% cash/gold.',
    createdAt: '2026-01-15T00:00:00.000Z',
    holdings: [
      { id: 'h1', symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', assetClass: 'Equities (US)', sector: 'Technology', quantity: 250, buyPrice: 220.00, currentPrice: 265.50, beta: 1.02, volatility: 0.16, liquidity: 'high', currency: 'USD', region: 'North America' },
      { id: 'h2', symbol: 'AAPL', name: 'Apple Inc.', assetClass: 'Equities (US)', sector: 'Technology', quantity: 120, buyPrice: 165.00, currentPrice: 228.00, beta: 1.15, volatility: 0.22, liquidity: 'high', currency: 'USD', region: 'North America' },
      { id: 'h3', symbol: 'MSFT', name: 'Microsoft Corporation', assetClass: 'Equities (US)', sector: 'Technology', quantity: 80, buyPrice: 310.00, currentPrice: 420.00, beta: 1.10, volatility: 0.20, liquidity: 'high', currency: 'USD', region: 'North America' },
      { id: 'h4', symbol: 'JNJ', name: 'Johnson & Johnson', assetClass: 'Equities (US)', sector: 'Healthcare', quantity: 100, buyPrice: 155.00, currentPrice: 162.00, beta: 0.58, volatility: 0.13, liquidity: 'high', currency: 'USD', region: 'North America' },
      { id: 'h5', symbol: 'JPM', name: 'JPMorgan Chase & Co.', assetClass: 'Equities (US)', sector: 'Financials', quantity: 90, buyPrice: 145.00, currentPrice: 215.00, beta: 1.12, volatility: 0.21, liquidity: 'high', currency: 'USD', region: 'North America' },
      { id: 'h6', symbol: 'VXUS', name: 'Vanguard Total International Stock ETF', assetClass: 'Equities (International)', sector: 'Industrials', quantity: 280, buyPrice: 52.00, currentPrice: 58.50, beta: 0.88, volatility: 0.17, liquidity: 'high', currency: 'USD', region: 'Global' },
      { id: 'h7', symbol: 'BND', name: 'Vanguard Total Bond Market ETF', assetClass: 'Fixed Income (Govt)', sector: 'Government', quantity: 500, buyPrice: 75.00, currentPrice: 73.20, beta: 0.12, volatility: 0.06, liquidity: 'high', currency: 'USD', region: 'North America' },
      { id: 'h8', symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', assetClass: 'Fixed Income (Govt)', sector: 'Government', quantity: 180, buyPrice: 98.00, currentPrice: 91.50, beta: -0.25, volatility: 0.15, liquidity: 'high', currency: 'USD', region: 'North America' },
      { id: 'h9', symbol: 'LQD', name: 'iShares iBoxx Inv Grade Corp Bond ETF', assetClass: 'Fixed Income (Corp)', sector: 'Financials', quantity: 160, buyPrice: 108.00, currentPrice: 109.80, beta: 0.28, volatility: 0.09, liquidity: 'high', currency: 'USD', region: 'North America' },
      { id: 'h10', symbol: 'GLD', name: 'SPDR Gold Shares', assetClass: 'Precious Metals', sector: 'Materials', quantity: 50, buyPrice: 185.00, currentPrice: 242.00, beta: 0.08, volatility: 0.14, liquidity: 'high', currency: 'USD', region: 'Global' },
      { id: 'h11', symbol: 'USD_CASH', name: 'US Dollar Treasury Sweep (Cash)', assetClass: 'Cash & Equivalents', sector: 'Cash', quantity: 15000, buyPrice: 1.00, currentPrice: 1.00, beta: 0.00, volatility: 0.001, liquidity: 'high', currency: 'USD', region: 'North America' },
    ]
  },

  techGrowth: {
    id: 'portfolio_tech_growth',
    name: 'Aggressive Tech Growth',
    description: 'High-beta, growth-oriented equity portfolio heavily concentrated in Mega-Cap Technology and Semiconductor leaders.',
    createdAt: '2026-02-01T00:00:00.000Z',
    holdings: [
      { id: 'tg1', symbol: 'NVDA', name: 'NVIDIA Corporation', assetClass: 'Equities (US)', sector: 'Technology', quantity: 220, buyPrice: 48.00, currentPrice: 135.00, beta: 2.25, volatility: 0.44, liquidity: 'high', currency: 'USD', region: 'North America' },
      { id: 'tg2', symbol: 'MSFT', name: 'Microsoft Corporation', assetClass: 'Equities (US)', sector: 'Technology', quantity: 80, buyPrice: 320.00, currentPrice: 420.00, beta: 1.15, volatility: 0.21, liquidity: 'high', currency: 'USD', region: 'North America' },
      { id: 'tg3', symbol: 'AMZN', name: 'Amazon.com Inc.', assetClass: 'Equities (US)', sector: 'Consumer Discretionary', quantity: 110, buyPrice: 135.00, currentPrice: 195.00, beta: 1.35, volatility: 0.28, liquidity: 'high', currency: 'USD', region: 'North America' },
      { id: 'tg4', symbol: 'TSLA', name: 'Tesla Inc.', assetClass: 'Equities (US)', sector: 'Consumer Discretionary', quantity: 70, buyPrice: 210.00, currentPrice: 225.00, beta: 2.10, volatility: 0.52, liquidity: 'high', currency: 'USD', region: 'North America' },
      { id: 'tg5', symbol: 'QQQ', name: 'Invesco QQQ Trust (Nasdaq 100)', assetClass: 'Equities (US)', sector: 'Technology', quantity: 120, buyPrice: 380.00, currentPrice: 485.00, beta: 1.28, volatility: 0.23, liquidity: 'high', currency: 'USD', region: 'North America' },
      { id: 'tg6', symbol: 'COIN', name: 'Coinbase Global Inc.', assetClass: 'Equities (US)', sector: 'Financials', quantity: 60, buyPrice: 180.00, currentPrice: 215.00, beta: 2.85, volatility: 0.68, liquidity: 'medium', currency: 'USD', region: 'North America' },
      { id: 'tg7', symbol: 'USD_CASH', name: 'US Dollar Cash Reserve', assetClass: 'Cash & Equivalents', sector: 'Cash', quantity: 6000, buyPrice: 1.00, currentPrice: 1.00, beta: 0.00, volatility: 0.001, liquidity: 'high', currency: 'USD', region: 'North America' },
    ]
  },

  allWeather: {
    id: 'portfolio_all_weather',
    name: 'All-Weather Risk Parity',
    description: 'Ray Dalio-inspired macro resilient structure designed to preserve capital across all inflation and growth regimes.',
    createdAt: '2026-02-10T00:00:00.000Z',
    holdings: [
      { id: 'aw1', symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', assetClass: 'Equities (US)', sector: 'Technology', quantity: 110, buyPrice: 460.00, currentPrice: 565.00, beta: 1.00, volatility: 0.15, liquidity: 'high', currency: 'USD', region: 'North America' },
      { id: 'aw2', symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', assetClass: 'Fixed Income (Govt)', sector: 'Government', quantity: 450, buyPrice: 94.00, currentPrice: 92.00, beta: -0.22, volatility: 0.15, liquidity: 'high', currency: 'USD', region: 'North America' },
      { id: 'aw3', symbol: 'IEF', name: 'iShares 7-10 Year Treasury Bond ETF', assetClass: 'Fixed Income (Govt)', sector: 'Government', quantity: 220, buyPrice: 95.00, currentPrice: 96.50, beta: -0.10, volatility: 0.07, liquidity: 'high', currency: 'USD', region: 'North America' },
      { id: 'aw4', symbol: 'GLD', name: 'SPDR Gold Shares', assetClass: 'Precious Metals', sector: 'Materials', quantity: 80, buyPrice: 195.00, currentPrice: 242.00, beta: 0.05, volatility: 0.13, liquidity: 'high', currency: 'USD', region: 'Global' },
      { id: 'aw5', symbol: 'DBC', name: 'Invesco DB Commodity Index Tracking', assetClass: 'Commodities', sector: 'Energy', quantity: 400, buyPrice: 22.00, currentPrice: 23.50, beta: 0.35, volatility: 0.19, liquidity: 'medium', currency: 'USD', region: 'Global' },
      { id: 'aw6', symbol: 'TIP', name: 'iShares TIPS Bond ETF', assetClass: 'Fixed Income (Govt)', sector: 'Government', quantity: 130, buyPrice: 104.00, currentPrice: 107.50, beta: 0.08, volatility: 0.06, liquidity: 'high', currency: 'USD', region: 'North America' },
      { id: 'aw7', symbol: 'USD_CASH', name: 'Cash Sweep', assetClass: 'Cash & Equivalents', sector: 'Cash', quantity: 10000, buyPrice: 1.00, currentPrice: 1.00, beta: 0.00, volatility: 0.001, liquidity: 'high', currency: 'USD', region: 'North America' },
    ]
  }
};
