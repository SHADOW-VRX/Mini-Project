# PORTFOLIO CRASH THEATRE

> **"Experience the crash. Discover the weakness. Understand the risk."**

*A production-grade, interactive financial stress-testing platform built with vanilla HTML5, CSS3, and ES6+.*

---

## 1. Executive Overview

**Portfolio Crash Theatre** is an institutional-grade financial risk intelligence and simulation platform. Traditional wealth dashboards display static risk metrics (standard deviation, beta) that fail to convey how a portfolio actually behaves under liquidity panics, correlation breakdowns, and systemic cascades.

Portfolio Crash Theatre lets investors and asset managers stress-test their holdings against historical market crashes (2008 GFC, 2020 Pandemic, 2000 Dot-Com Meltdown, 2022 Rapid Rate Shock, 1970s Stagflation) and custom macroeconomic shocks.

---

## 2. Architecture & Tech Stack

- **Zero Framework Overhead:** Built strictly with modern Vanilla HTML5, CSS3, and modular ES6+ JavaScript.
- **No External Charting Libraries:** Zero dependencies like Chart.js or D3. Includes a purpose-built, high-performance HTML5 Canvas financial charting engine supporting retina crispness, multi-line trajectories, area fills, donut allocation breakdowns, and interactive correlation heatmaps.
- **Client-Side Reactive Architecture:** Single-Page Application (SPA) architecture driven by a hash router (`#dashboard`, `#portfolio`, `#theatre`, `#scenarios`, `#risk`, `#whatif`, `#autopsy`, `#reports`, `#settings`) and an observable state store with pub/sub event broadcasting.
- **Zero-Backend Requirement for Frontend Execution:** Instant local persistence via versioned LocalStorage, with full JSON snapshot export and restore.

### Directory Structure

```
d:\ff\Mini Project\
├── index.html                       # Main master shell loading all views, modal dialogs, audio, navigation
├── css/
│   ├── variables.css                # CSS custom properties (colors, typography, spacing, shadows, transitions)
│   ├── reset.css                    # Modern CSS reset & base element styling
│   ├── typography.css               # Font scales, weights, badges, monetary formatting helpers
│   ├── layout.css                   # Grid, desktop sidebar, top header, content areas, mobile responsive drawer
│   ├── components.css               # Buttons, cards, modals, form controls, tables, toasts, badges, tabs, sliders
│   ├── dashboard.css                # Dashboard view specific styling, KPI cards, vulnerability radar
│   ├── portfolio.css                # Portfolio table, holding badges, CSV import wizard, CRUD modal
│   ├── theatre.css                  # Crisis theatre full-screen, live tickers, timeline scrubber, visual alarms
│   ├── analytics.css                # Risk intelligence cards, correlation matrix heatmap, gauge charts
│   ├── whatif.css                   # Dual portfolio split view, rebalance sliders, delta chips
│   ├── reports.css                  # Report builder, print stylesheet (@media print) for PDF export
│   └── responsive.css               # Breakpoint styling (320px, 480px, 768px, 1024px, 1440px)
├── js/
│   ├── config.js                    # Centralized config, default portfolios, market crisis templates, settings
│   ├── state.js                     # Central reactive state store, observer pattern, event emitter
│   ├── storage.js                   # LocalStorage persistence, backup/restore, versioning, data migrations
│   ├── router.js                    # View router (supports hash navigation: #dashboard, #portfolio, etc.)
│   ├── app.js                       # Application bootstrapper, lifecycle management, global listeners
│   ├── portfolio/
│   │   ├── portfolio-manager.js     # Holdings CRUD, portfolio snapshots, metrics calculations
│   │   ├── calculations.js          # Financial mathematics: weights, values, returns, HHI, weighted beta
│   │   └── csv-importer.js          # CSV parsing, injection sanitization, column mapping, duplicate detection
│   ├── simulation/
│   │   ├── simulation-engine.js     # Mathematical multi-phase crisis calculation engine
│   │   ├── scenarios.js             # Scenario library definitions, parameters, historical context
│   │   ├── timeline.js              # Simulation tick loop, phase transitions, event log generator
│   │   └── recovery.js              # Post-crash recovery projections (CAGR, breakeven mathematics)
│   ├── analytics/
│   │   ├── risk-engine.js           # VaR (Parametric & Historical), CVaR, Volatility, Sharpe, Drawdown
│   │   ├── correlation.js           # Asset correlation calculations & matrix builder
│   │   └── concentration.js         # Sector, asset, currency, geography & liquidity concentration
│   ├── charts/
│   │   ├── chart-engine.js          # High-performance zero-dependency Canvas financial chart engine
│   │   └── chart-presets.js         # Configured chart builders (performance, allocation, drawdown, heatmap)
│   ├── reports/
│   │   ├── report-generator.js      # Executive dossier compiler, printable view, HTML/PDF formatter
│   │   └── export-service.js        # CSV & JSON export formatting & download triggers
│   └── ui/
│       ├── navigation.js            # Desktop sidebar, mobile drawer, active module indicators
│       ├── modal.js                 # Reusable modal system (Add holding, CSV import, Scenario config, etc.)
│       ├── notifications.js         # Toast notification system (success, warning, danger, info)
│       ├── audio.js                 # Web Audio API synthetic crisis sound effects (toggleable)
│       └── views/                   # View controllers rendering and binding UI for each module
│           ├── dashboard-view.js
│           ├── portfolio-view.js
│           ├── theatre-view.js
│           ├── scenarios-view.js
│           ├── risk-view.js
│           ├── whatif-view.js
│           ├── autopsy-view.js
│           ├── reports-view.js
│           └── settings-view.js
├── config/
│   └── environment.js               # Centralized environment example
└── README.md
```

---

## 3. Application Modules

1. **Dashboard:** Real-time portfolio valuation, total return, weighted beta, 95% Daily VaR, vulnerability warning radar, valuation curve, asset allocation donut, sector bars, and past simulation history.
2. **My Portfolio:** Full holding CRUD (Symbol, Name, Class, Sector, Quantity, Buy Price, Current Price, Beta, Volatility, Liquidity Tier). Advanced CSV Importer with delimiter auto-detection, formula injection sanitization, column mapping, and duplicate detection.
3. **Crisis Theatre (Flagship Feature):** Immersive simulator with 5 distinct phases: Initial Shock, Sector Contagion, Correlation Breakdown, Maximum Stress, and Recovery Divergence. Includes playback deck (Play, Pause, Step, Scrubber, 0.5x to Instant speed), real-time canvas trajectory, breaking milestone news wire, and holding-level damage matrix.
4. **Scenario Library:** Searchable historical crises and macroeconomic stress templates with severity filters, customization sliders, and one-click launch.
5. **Risk Intelligence:** Parametric Value at Risk (90%, 95%, 99% confidence), Conditional VaR (Expected Shortfall), Annualized Volatility, Sharpe Ratio, Herfindahl-Hirschman concentration meter, and interactive NxN cross-asset correlation heatmap.
6. **What-If Lab:** Dual-portfolio view (Original vs Modified Sandbox) with interactive allocation sliders, defensive cash and gold hedge presets, and simultaneous side-by-side stress test comparison.
7. **Post-Crash Autopsy:** Forensic post-mortem report displaying start vs trough value, capital evaporated, asset & sector loss attribution, breakeven gain requirement (+X%), and compound recovery trajectories across 6%, 10%, and 14% CAGRs.
8. **Reports & Dossier:** Institutional stress-test dossier with native print-to-PDF formatting (`@media print`), CSV export, and JSON audit backup.
9. **Settings:** Base currency selector (USD, EUR, GBP, INR, JPY, CAD, AUD), risk-free rate calibration, VaR confidence intervals, sound effects toggle, and state backup/restore.

---

## 4. Mathematical Methodology

### Value at Risk (VaR) & Conditional VaR (CVaR)
$$\text{Daily VaR} = V_p \times Z_{\alpha} \times \frac{\sigma_p}{\sqrt{252}}$$
$$\text{CVaR} = V_p \times \frac{\phi(Z_{\alpha})}{1 - \alpha} \times \frac{\sigma_p}{\sqrt{252}}$$
Where $Z_{0.95} = 1.645$, $Z_{0.99} = 2.326$, and $\phi(Z)$ is the standard normal PDF.

### Concentration Risk (Herfindahl-Hirschman Index - HHI)
$$\text{HHI} = \sum_{i=1}^N (w_i \times 100)^2$$
- **HHI < 1,500:** Well-diversified
- **1,500 ≤ HHI ≤ 2,500:** Moderately concentrated
- **HHI > 2,500:** High concentration vulnerability

### Recovery Asymmetry Mathematics
$$\text{Required Breakeven Gain } G = \frac{1}{1 - \text{Drawdown}} - 1$$
$$\text{Years to Recover } T = \frac{\ln(1 / (1 - \text{Drawdown}))}{\ln(1 + \text{CAGR})}$$

---

## 5. Security & Hardening

- **CSV Formula Injection Mitigation:** Strips all leading formula control characters (`=`, `+`, `-`, `@`, `\t`, `\r`) from imported CSV fields to prevent spreadsheet client code execution.
- **XSS Prevention:** All user-supplied asset names, tickers, and values are injected via strict `textContent` or sanitized attributes.
- **Local Storage Boundaries:** Zero credential or secret storage in LocalStorage. Clean serialization with fallback schema validation.

---

## 6. How to Run Locally

Because this project is built entirely on native web standards with zero compilation or Docker requirements:

1. **Option A (Instant Open):** Double-click `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
2. **Option B (Local Web Server):** Serve using any static server:
   ```bash
   npx serve .
   # or
   python -m http.server 8080
   ```
   Open `http://localhost:8080` in your browser.
