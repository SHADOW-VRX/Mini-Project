/**
 * PORTFOLIO CRASH THEATRE — ENVIRONMENT CONFIGURATION
 * Centralized environment definitions for frontend abstractions and future backend connections.
 */

export const ENV = {
  MODE: 'client-standalone', // 'client-standalone' | 'development' | 'production'
  API_BASE_URL: null, // Will connect to Node.js backend when present
  ENDPOINTS: {
    MARKET_DATA: '/api/v1/market-data',
    HISTORICAL_CRISIS: '/api/v1/historical-crisis',
    ANALYTICS: '/api/v1/analytics',
    EXPORT_PDF: '/api/v1/reports/pdf',
  },
  FEATURES: {
    OFFLINE_SIMULATION: true,
    CLIENT_SIDE_EXPORT: true,
    WEB_AUDIO_SYNTH: true,
  },
  METRICS: {
    TRADING_DAYS_PER_YEAR: 252,
    MONTHLY_FACTOR: Math.sqrt(21),
    ANNUAL_FACTOR: Math.sqrt(252),
  }
};
