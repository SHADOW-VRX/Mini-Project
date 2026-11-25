/**
 * PORTFOLIO CRASH THEATRE — CRISIS SCENARIO LIBRARY
 * Definitive repository of historical and hypothetical crisis templates.
 */

export const SCENARIOS = [
  {
    id: 'gfc_2008',
    name: '2008 Global Liquidity & Credit Shock',
    subtitle: 'Subprime Mortgage Contagion & Systemic Banking Freeze',
    severity: 'extreme',
    severityScore: 95,
    historicalPeriod: '2007 - 2009',
    benchmarkDrawdown: -50.9,
    durationDays: 60,
    description: 'Systemic banking collapse triggered by subprime mortgage defaults, Lehman Brothers liquidation, credit freeze, and catastrophic de-leveraging.',
    catalyst: 'Subprime mortgage defaults, Lehman bankruptcy, interbank liquidity freeze.',
    mostAffectedSectors: ['Financials', 'Real Estate', 'Consumer Discretionary', 'Technology'],
    safeHavens: ['Government Treasuries (TLT/IEF)', 'Gold (GLD)', 'Cash & Equivalents'],
    marketBetaFactor: 1.35,
    liquidityStressFactor: 1.5,
    sectorShocks: {
      Financials: -0.58,
      'Real Estate': -0.52,
      Technology: -0.42,
      'Consumer Discretionary': -0.44,
      Industrials: -0.40,
      Energy: -0.38,
      Materials: -0.35,
      Healthcare: -0.18,
      'Consumer Staples': -0.14,
      Utilities: -0.12,
      Government: 0.12, // Flight to Treasuries
      Cash: 0.00,
    },
    milestones: [
      { day: 2, headline: 'Interbank credit spreads (TED spread) explode to multi-decade highs.', alert: true },
      { day: 8, headline: 'Lehman Brothers files for Chapter 11 bankruptcy; Reserve Primary Fund "breaks the buck".', alert: true },
      { day: 18, headline: 'Global margin calls trigger forced liquidations across equities and corporate bonds.', alert: true },
      { day: 36, headline: 'G7 central banks coordinate unprecedented emergency liquidity injections and rate cuts.', alert: false },
      { day: 45, headline: 'Capitulation selling trough reached; distress valuations emerge in core assets.', alert: true },
      { day: 55, headline: 'Fiscal stimulus package signed into law; high-grade credit and treasuries stabilize.', alert: false, recovery: true },
    ]
  },

  {
    id: 'covid_2020',
    name: '2020 Pandemic Shock & Flash Crash',
    subtitle: 'Global Economic Lockdown, Travel Halt & V-Shaped Stimulus',
    severity: 'extreme',
    severityScore: 90,
    historicalPeriod: 'Feb - April 2020',
    benchmarkDrawdown: -33.9,
    durationDays: 45,
    description: 'Fastest 30% drop in modern financial history. Global travel stoppage, unprecedented supply chain shutdowns, oil price negative shock, followed by massive fiscal stimulus.',
    catalyst: 'Worldwide COVID-19 pandemic lockdowns, global economic paralysis.',
    mostAffectedSectors: ['Energy', 'Consumer Discretionary', 'Industrials', 'Real Estate'],
    safeHavens: ['Mega-Cap Tech (Cloud/WFH)', 'Government Bonds', 'Gold'],
    marketBetaFactor: 1.50,
    liquidityStressFactor: 1.8,
    sectorShocks: {
      Energy: -0.55,
      'Consumer Discretionary': -0.38,
      'Real Estate': -0.34,
      Industrials: -0.32,
      Financials: -0.30,
      Materials: -0.25,
      Technology: -0.16, // Proved resilient
      Healthcare: -0.10,
      'Consumer Staples': -0.08,
      Utilities: -0.15,
      Government: 0.08,
      Cash: 0.00,
    },
    milestones: [
      { day: 3, headline: 'World Health Organization declares COVID-19 a global pandemic; borders shut.', alert: true },
      { day: 10, headline: 'NYSE activates Level 1 circuit breakers three times in a single week.', alert: true },
      { day: 16, headline: 'WTI Crude Oil futures flash crash into negative territory amid zero storage.', alert: true },
      { day: 24, headline: 'Fed announces "unlimited QE" (CARES Act) and corporate bond backstop facility.', alert: false },
      { day: 35, headline: 'Market bottom forms as tech and work-from-home leaders experience explosive demand.', alert: false, recovery: true },
    ]
  },

  {
    id: 'dotcom_2000',
    name: '2000 Dot-Com Tech Meltdown',
    subtitle: 'Speculative Valuation Bubble Collapse & Tech Winter',
    severity: 'severe',
    severityScore: 85,
    historicalPeriod: '2000 - 2002',
    benchmarkDrawdown: -49.1, // NASDAQ dropped -78%
    durationDays: 65,
    description: 'Catastrophic repricing of speculative, unprofitable internet and technology enterprises. Prolonged multi-year bear market with massive sector divergence.',
    catalyst: 'Overvalued tech multiples, venture capital dry up, corporate burn rate exhaustion.',
    mostAffectedSectors: ['Technology', 'Consumer Discretionary', 'Telecommunications'],
    safeHavens: ['Value Equities', 'Consumer Staples', 'Treasuries', 'Cash'],
    marketBetaFactor: 1.40,
    liquidityStressFactor: 1.2,
    sectorShocks: {
      Technology: -0.72,
      'Consumer Discretionary': -0.38,
      Telecommunications: -0.65,
      Financials: -0.15,
      Industrials: -0.18,
      Materials: -0.10,
      Energy: 0.05, // Old economy held
      Healthcare: -0.05,
      'Consumer Staples': 0.10,
      Utilities: 0.08,
      Government: 0.15,
      Cash: 0.00,
    },
    milestones: [
      { day: 4, headline: 'Barron’s publishes landmark "Burning Up" exposé on unsustainable tech cash burn.', alert: true },
      { day: 14, headline: 'Tech IPO pipeline freezes completely; secondary offerings plummet 80%.', alert: true },
      { day: 28, headline: 'Telecom giants default on optic cable debt; tech write-offs cross $500 Billion.', alert: true },
      { day: 48, headline: 'Capitulation selling in unprofitable SaaS and dot-com symbols.', alert: true },
      { day: 60, headline: 'Value equities and dividend stalwarts decouple from ongoing tech weakness.', alert: false, recovery: true },
    ]
  },

  {
    id: 'rate_shock_2022',
    name: '2022 Aggressive Interest Rate Shock',
    subtitle: 'Fed +500bps Tightening, Historic Bond Rout & Tech Derating',
    severity: 'severe',
    severityScore: 80,
    historicalPeriod: '2022 - 2023',
    benchmarkDrawdown: -25.4,
    durationDays: 50,
    description: 'Central banks embark on the fastest interest rate tightening cycle in 40 years to combat sticky post-pandemic inflation, shattering long-duration bonds and high-multiple tech.',
    catalyst: 'Headline inflation peaking at 9.1%, Fed funds rate hiked from 0% to 5.25%.',
    mostAffectedSectors: ['Real Estate', 'Technology', 'Fixed Income (Long-Duration)', 'Utilities'],
    safeHavens: ['Energy', 'Cash & Equivalents', 'Short-Term T-Bills', 'Commodities'],
    marketBetaFactor: 1.15,
    liquidityStressFactor: 1.1,
    sectorShocks: {
      'Real Estate': -0.32,
      Technology: -0.35,
      Utilities: -0.22,
      'Consumer Discretionary': -0.28,
      Financials: -0.18,
      Healthcare: -0.08,
      'Consumer Staples': -0.06,
      Materials: -0.12,
      Energy: 0.28, // Energy gained massively
      Government: -0.18, // Rare dual equity/bond drawdown!
      Cash: 0.04, // Cash paid 5%
    },
    milestones: [
      { day: 5, headline: 'CPI print hits 8.6%; Fed delivers first 75bps rate hike in 28 years.', alert: true },
      { day: 15, headline: 'Long-term Treasuries suffer worst historical drawdown since 1788.', alert: true },
      { day: 26, headline: 'Mortgage rates cross 7%; housing volume decelerates sharply.', alert: true },
      { day: 40, headline: 'Peak rate expectations priced in; high-quality mega-caps start establishing bottom.', alert: false, recovery: true },
    ]
  },

  {
    id: 'stagflation_1970s',
    name: '1970s Stagflation & Energy Crisis',
    subtitle: 'Double-Digit Inflation, Oil Embargo & Real Return Decay',
    severity: 'extreme',
    severityScore: 88,
    historicalPeriod: '1973 - 1974',
    benchmarkDrawdown: -48.2,
    durationDays: 60,
    description: 'Devastating macroeconomic combination of stagnant economic growth, double-digit consumer inflation, geopolitical oil supply embargoes, and purchasing power destruction.',
    catalyst: 'OPEC oil embargo, wage-price spiral, geopolitical supply shocks.',
    mostAffectedSectors: ['Consumer Discretionary', 'Financials', 'Industrials', 'Fixed Income'],
    safeHavens: ['Gold (Precious Metals)', 'Energy & Crude', 'Commodities'],
    marketBetaFactor: 1.25,
    liquidityStressFactor: 1.4,
    sectorShocks: {
      'Consumer Discretionary': -0.45,
      Financials: -0.42,
      Technology: -0.40,
      Industrials: -0.38,
      'Real Estate': -0.25,
      Healthcare: -0.18,
      'Consumer Staples': -0.15,
      Utilities: -0.20,
      Materials: 0.15,
      Energy: 0.45,
      Government: -0.22, // Yield spike damaged bonds
      Cash: -0.12, // Purchasing power eroded by inflation
    },
    milestones: [
      { day: 4, headline: 'OPEC proclaims oil export embargo; crude oil prices quadruple overnight.', alert: true },
      { day: 18, headline: 'US CPI inflation accelerates to 12.3%; consumer sentiment plunges to record lows.', alert: true },
      { day: 32, headline: 'Industrial manufacturers announce broad production cutbacks due to energy rationing.', alert: true },
      { day: 50, headline: 'Gold prices surge to historic highs as institutional investors abandon paper fiat.', alert: false },
    ]
  },

  {
    id: 'geopolitical_shock',
    name: 'Geopolitical Conflict & Supply Blockade',
    subtitle: 'Maritime Chokepoint Disruption & Raw Material Sanctions',
    severity: 'severe',
    severityScore: 82,
    historicalPeriod: 'Simulated Macro Shock',
    benchmarkDrawdown: -28.5,
    durationDays: 40,
    description: 'Escalation of global geopolitical hostilities shutting major maritime transit corridors (Strait of Hormuz / Malacca), triggering semiconductor trade embargoes and defense mobilization.',
    catalyst: 'Maritime corridor closure, strategic resource embargoes, cyber grid attacks.',
    mostAffectedSectors: ['Technology (Semiconductors)', 'Consumer Discretionary', 'Industrials'],
    safeHavens: ['Defense & Aerospace', 'Energy', 'Gold', 'Precious Metals'],
    marketBetaFactor: 1.30,
    liquidityStressFactor: 1.3,
    sectorShocks: {
      Technology: -0.38,
      'Consumer Discretionary': -0.32,
      Financials: -0.26,
      'Real Estate': -0.20,
      Industrials: -0.24,
      Materials: 0.18,
      Energy: 0.35,
      Healthcare: -0.06,
      'Consumer Staples': -0.04,
      Utilities: -0.08,
      Government: 0.05,
      Cash: 0.02,
    },
    milestones: [
      { day: 2, headline: 'Major international shipping lanes close amid regional military conflict.', alert: true },
      { day: 12, headline: 'Brent crude surpasses $130/barrel; maritime insurance premiums skyrocket 600%.', alert: true },
      { day: 22, headline: 'Strategic semiconductor export controls freeze global tech manufacturing.', alert: true },
      { day: 35, headline: 'Emergency diplomatic talks initiate maritime safe passage escort corridors.', alert: false, recovery: true },
    ]
  },

  {
    id: 'custom_crash',
    name: 'Custom Market Crash Builder',
    subtitle: 'User-Defined Stress Parameters & Shock Multipliers',
    severity: 'custom',
    severityScore: 75,
    historicalPeriod: 'User Configured',
    benchmarkDrawdown: -35.0,
    durationDays: 50,
    description: 'Fully customizable stress testing environment allowing you to dictate exact sector penalties, beta multipliers, and contagion speed.',
    catalyst: 'User defined macroeconomic or asset specific shock parameters.',
    mostAffectedSectors: ['Configurable'],
    safeHavens: ['Configurable'],
    marketBetaFactor: 1.20,
    liquidityStressFactor: 1.2,
    sectorShocks: {
      Technology: -0.35,
      Financials: -0.30,
      Healthcare: -0.15,
      'Consumer Discretionary': -0.30,
      'Consumer Staples': -0.10,
      Energy: -0.20,
      Industrials: -0.25,
      Materials: -0.20,
      Utilities: -0.10,
      'Real Estate': -0.25,
      Government: 0.05,
      Cash: 0.00,
    },
    milestones: [
      { day: 5, headline: 'Custom market catalyst triggers initial liquidation cascade across equities.', alert: true },
      { day: 20, headline: 'Contagion reaches peak stress; volatility index (VIX) tests crisis highs.', alert: true },
      { day: 38, headline: 'Systemic bottom is established; divergence begins between strong and weak balance sheets.', alert: false, recovery: true },
    ]
  }
];

export function getScenarioById(id) {
  return SCENARIOS.find(s => s.id === id) || SCENARIOS[0];
}
