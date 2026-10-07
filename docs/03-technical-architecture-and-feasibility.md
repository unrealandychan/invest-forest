# Technical Architecture & Open-Source Feasibility Assessment

**Project:** Invest Forest  
**Document Purpose:** Detail the dual-view system architecture, evaluate visual rendering engines, specify local-first privacy data storage, evaluate market data fetching mechanisms, and establish open-source licensing.

---

## 1. Dual-View System Architecture

The core UX of Invest Forest bridges the emotional and analytical mind:
- **Forest Canvas View:** Emotional regulation, calm visual reinforcement, long-term horizon grounding.
- **Portfolio Analytics View:** Institutional-grade rigor, XIRR/TWR calculations, asset allocation, transaction logs.

### 1.1 View Synchronization & State Flow

```
                      ┌───────────────────────────────┐
                      │    Zustand / Reactive Store   │
                      │   (Portfolio & Engine State)  │
                      └───────▲───────────────▲───────┘
                              │               │
            ┌─────────────────┴─┐           ┌─┴─────────────────┐
            │                   │           │                   │
    ┌───────▼────────┐ ┌────────▼───────┐ ┌─▼─────────────┐ ┌───▼───────────┐
    │  Forest Canvas │ │ Forest Controls│ │ Data Dashboard│ │ Ledger Drawer │
    │  (WebGL / 3D)  │ │ (Time, Seasons)│ │ (Charts, XIRR)│ │ (Transactions)│
    └────────────────┘ └────────────────┘ └───────────────┘ └───────────────┘
```

### 1.2 Layout Options
1. **Seamless Toggle (Recommended for MVP):** A single-click switch `[ 🌲 Forest View ] <—> [ 📊 Dashboard View ]` with smooth cross-fade animation. Allows full immersion in either mode.
2. **Split Screen (Desktop):** Forest on the left (60%), Analytics Drawer on the right (40%). Ideal for large desktop displays (1440p+).
3. **Picture-in-Picture (PiP Mini-Forest):** While reviewing detailed financial data, a miniature ambient terrarium in the bottom corner reflects current market weather and canopy health.

---

## 2. Visual & Rendering Engine Feasibility

To render the forest, we evaluate three primary technical paths:

| Criterion | Option A: React Three Fiber (Three.js 3D) | Option B: PixiJS (2.5D Isometric WebGL) | Option C: SVG + Canvas 2D |
| :--- | :--- | :--- | :--- |
| **Visual Immersion** | **Exceptional.** Low-poly 3D, procedural tree generation, dynamic sun/shadows, wind sway shaders, snow accumulation. | **High.** Beautiful 2.5D pixel art or vector sprites; rich particle effects. | **Moderate.** Flat or hand-drawn cozy illustration style. |
| **Performance** | **60 FPS** easily achieved with low-poly instanced meshes and LOD (Level of Detail). | **60 FPS** with batch sprite rendering. Minimal GPU draw calls. | Can lag when rendering >500 complex tree nodes and weather particles. |
| **Asset Pipeline** | Can use procedural L-systems (algorithmic branches) or modular glTF low-poly assets (Blender/Kenney.nl open assets). | Requires 2D isometric sprite sheets for each tree species and maturity stage. | Requires vector artwork for each stage. |
| **Bundle Overhead** | ~500–600 KB gzip (Three.js + R3F). | ~150–200 KB gzip. | **< 30 KB.** Native browser APIs. |
| **Mobile Web Support**| Excellent on modern phones; higher battery usage if unthrottled. | Very battery friendly; lightweight. | Ultra lightweight. |
| **Verdict** | **Primary Recommendation for Prototype:** Low-poly 3D via Three.js / R3F allows procedural growth and camera rotation that feels genuinely magical. | **Viable Alternative:** Excellent if prioritizing retro pixel-art aesthetic (like Habbo or Stardew Valley). | Insufficient for dynamic weather and ecosystem depth. |

### Prototype Recommendation:
**React Three Fiber (R3F) + Drei** with low-poly procedural assets:
- Procedural generation (L-systems or modular trunk/branch stacking) allows trees to dynamically scale in height and branch thickness directly derived from financial math without needing pre-rendered 2D sprite frames for every dollar tier.
- Ambient weather (rain, snow particles, wind shaders) is straightforward to implement via standard Three.js shader materials.

---

## 3. Local-First Financial Data Architecture (Privacy & Security)

Users will not trust a financial tool that sends their net worth, stock tickers, or account balances to an unvetted cloud database. **Invest Forest will be 100% Local-First.**

```
┌─────────────────────────────────────────────────────────────┐
│                       USER BROWSER                          │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                 React Application                   │   │
│   └──────────────▲───────────────────────▲──────────────┘   │
│                  │                       │                  │
│   ┌──────────────▼─────────────┐   ┌─────▼──────────────┐   │
│   │   Dexie.js / IndexedDB     │   │ File System / OPFS │   │
│   │  (Accounts, Holdings, DCA) │   │ (JSON / SQLite DB) │   │
│   └────────────────────────────┘   └────────────────────┘   │
│                                                             │
│         ▲                                   │               │
│         │ Manual / CSV                      ▼ Export        │
│   ┌─────┴──────────────┐             ┌──────────────┐       │
│   │ CSV / JSON Importer│             │ Encrypted    │       │
│   │ (Schwab/IBKR/etc.) │             │ Backup JSON  │       │
│   └────────────────────┘             └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Storage Engine: IndexedDB via Dexie.js
- **Zero Server Footprint:** No user login required to use the prototype. All state persists in browser IndexedDB.
- **Reactive Queries:** Dexie's `useLiveQuery` hook allows React components to automatically re-render when transactions are added.
- **Portability:** Built-in 1-click **Export Backup (JSON)** and **Import Backup** allows users to move data between devices without cloud reliance.
- **Encrypted Local Storage (Future):** Optional AES-GCM client-side passphrase encryption for exported backup files.

### 3.2 Market Price Fetching & Offline Resilience
- **Ticker Quote Source:** Client-side fetch against free, non-authenticated market data proxies (e.g. Yahoo Finance public query API, Stooq, or Alpha Vantage free tier).
- **Offline Cache:** Quotes are cached in IndexedDB with timestamps. If the user opens the app on an airplane or without internet, the forest renders using the last known quote without breaking.
- **Manual Pricing Fallback:** Users can manually type prices or use approximate fixed compounding rates (e.g. 7% real annualized return) for pure simulation/privacy purists who want zero network outbound calls.

---

## 4. Financial Calculation Engine Specification

The financial engine must be deterministic, mathematically rigorous, and decoupled from the UI.

### 4.1 Required Core Metrics & Numerical Precision (QA Validated)
1. **Total Invested Principal ($P$):** Sum of all deposits minus capital withdrawals.
   - *Edge Case Guard:* If $P \le 0$, clamp $P = \max(P, 1.0)$ to prevent division by zero in returns calculations.
2. **Current Portfolio Value ($V$):** 
   $$V = \sum_{i=1}^K (\text{shares}_i \times \text{price}_i) + \text{cash\_balance}$$
3. **Internal Rate of Return (XIRR / Dollar-Weighted Return):**
   $$\sum_{t=0}^N \frac{C_t}{(1 + \text{XIRR})^{\frac{d_t - d_0}{365}}} = 0$$
   - **Signed Cash Flow Convention:** 
     - Deposits / Inflows: $C_t < 0$ (cash leaves personal bank to enter portfolio).
     - Dividends held as cash: Internal transfer ($C_t = 0$ externally).
     - Withdrawals / Outflows: $C_t > 0$ (cash realized).
     - Terminal Portfolio Value at evaluation date: $C_N = +V$ (positive).
   - **Solver Robustness & Convergence Guardrail:**
     - Primary solver: Newton-Raphson algorithm with initial seed $r_0 = 0.10$ (10%).
     - Convergence tolerance: $|\Delta r| < 10^{-7}$, max 100 iterations.
     - Fallback: If derivative $f'(r) \approx 0$ or oscillation occurs, automatically switch to **Brent's method / Bisection** bounded within $[-0.99, 10.0]$ to guarantee 100% convergence without UI crashes.
4. **Compounding Multiplier ($M$):**
   $$M = \frac{V - P}{\max(P, 1)}$$
   - $M < 0$: Soil dormancy / winter accumulation phase.
   - $0 \le M < 0.2$: Young Sprout Grove.
   - $0.2 \le M < 1.0$: Healthy Forest Canopy.
   - $M \ge 1.0$: Old-Growth Primeval Forest (compounded gains surpass all capital ever deposited).
5. **Display Precision vs Calculation Precision:**
   - Calculations: Full 64-bit IEEE-754 precision.
   - UI Display: Financial currencies formatted to locale standard 2 decimals (`Intl.NumberFormat`), percentages to 2 decimals, and shares up to 4 decimal places for fractional investing.

---

## 5. Technology Stack Selection

| Component | Selected Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14+ (App Router) or Vite + React 18/19** | For prototype simplicity and zero-backend portability, **Vite + React + TypeScript** is the fastest, most deployable static client (GitHub Pages / Vercel ready). |
| **Canvas / 3D** | **Three.js + React Three Fiber (@react-three/fiber, @react-three/drei)** | Declarative 3D tree nodes, easy camera orbit controls, performant instanced rendering. |
| **State Management**| **Zustand** | Minimalist, unopinionated, frictionless integration with non-React 3D canvas render loops. |
| **Styling & UI** | **Tailwind CSS + Lucide Icons + Radix UI** | Modern, accessible dashboard components with custom earth-tone palettes. |
| **Charts & Analytics**| **Recharts or Chart.js** | Clean, declarative financial charts (area charts for net worth growth, donut for asset allocation). |
| **Local Storage** | **Dexie.js (IndexedDB)** | Typed, high-performance client storage with live reactive queries. |
| **Math / Finance** | **financejs / custom XIRR helper** | Pure TypeScript implementation of Newton-Raphson XIRR and CAGR. |

---

## 6. Open-Source Licensing & Community Strategy

### 6.1 License Choice: **MIT License**
- **Why MIT:** Maximizes adoption, encourages community contributions, and signals genuine open-source altruism.
- While AGPL-3.0 prevents commercial forks, MIT builds the largest developer community for client-side productivity and personal finance tools (similar to Obsidian plugins, Logseq, and Joplin).

### 6.2 Open-Source Moat & Sustainability
- **Community Themes & Tree Packs:** Developers can contribute custom 3D tree models (e.g. Japanese Cherry Blossoms for Nikkei 225, Nordic Pines for European bonds).
- **Community Brokerage Importers:** Crowdsourced CSV parser parsers for international brokers across the US, EU, UK, and Asia.
- **Zero Monetization Conflict:** Can be funded via GitHub Sponsors or community bounties, maintaining pristine trust.
