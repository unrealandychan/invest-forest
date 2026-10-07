# Phased Prototype Implementation Roadmap & Technical Blueprint

**Project:** Invest Forest  
**Document Purpose:** Provide an actionable, milestone-based execution plan, codebase folder layout, and concrete prototype acceptance criteria for building the open-source MVP.

---

## 1. Prototype Scope Definition

The goal of the prototype is to deliver a **fully functional, interactive proof-of-concept** that demonstrates the dual-view emotional shift: turning boring, disciplined long-term investing into a living, serene forest ecosystem.

### In Scope for MVP:
- **Dual-View UI:** Instant toggle between **3D Forest Canvas** and **Portfolio Analytics Dashboard**.
- **3D Forest Engine:** Low-poly procedural trees (Broad Market Oak, Dividend Apple Tree, Bond Willow, Cash Stream) with camera orbit/zoom.
- **Dynamic Weather System:** Visual transitions for Market Bull (Summer Sun), Normal (Autumn Breeze), and Bear Market (Winter Snowstorm & Rain).
- **Core Behavioral Mechanics:**
  - Tree growth scaled by holding time and capital compounded.
  - Interactive Tree Cross-Section (Growth Rings inspect modal).
  - Bear market "Winter Seedling" discount badges.
  - 24-Hour "Cooling-Off Walk" prompt on simulated panic selling.
- **Financial Analytics Engine:**
  - Total Net Worth, Invested Principal, Total Gain ($ and %).
  - Real-time Newton-Raphson XIRR calculation.
  - Asset allocation breakdown.
  - DCA Cadence and Streak tracker.
- **Local-First Storage:**
  - In-browser IndexedDB (Dexie.js).
  - Manual transaction entry form (Buy, Dividend, Sell).
  - Preloaded Demo Scenarios ("The Boglehead DCA Journey", "Winter Crash Veteran", "New Sprout").
  - Export/Import JSON backup.

### Deferred to Post-MVP (v1.1+):
- Automated brokerage API syncing (Plaid / SnapTrade).
- Native mobile packaging (Capacitor / Tauri).
- Multiplayer / Social discipline cards (pure local-first privacy remains priority).

---

## 2. Recommended Project Directory Structure

```
invest-forest/
├── README.md
├── docs/
│   ├── 01-competitive-and-market-research.md
│   ├── 02-game-mechanics-and-behavioral-design.md
│   ├── 03-technical-architecture-and-feasibility.md
│   └── 04-implementation-roadmap-and-blueprint.md
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── src/
    ├── main.tsx
    ├── App.tsx
    │
    ├── domain/                    # Pure TypeScript business logic (Zero UI dependencies)
    │   ├── finance/
    │   │   ├── xirr.ts            # Newton-Raphson IRR calculation
    │   │   ├── metrics.ts         # Portfolio value, gains, CAGR, compounding multiplier
    │   │   └── types.ts           # Holdings, Transactions, AssetClasses
    │   └── ecosystem/
    │       ├── weather.ts         # Sentiment-to-weather mapper (Summer, Winter, Rain)
    │       ├── treeMapping.ts     # Maps asset types to botanical species & scaling
    │       └── streak.ts          # DCA consistency & biodiversity score
    │
    ├── storage/                   # Local-first persistence layer
    │   ├── db.ts                  # Dexie.js database schema
    │   ├── repository.ts          # CRUD operations for transactions and holdings
    │   └── presets.ts             # Preloaded demo datasets
    │
    ├── store/                     # Global state management
    │   └── useForestStore.ts      # Zustand store coordinating ViewMode, Selection, Data
    │
    ├── components/
    │   ├── canvas/                # 3D / Three.js Visual View
    │   │   ├── ForestScene.tsx    # R3F Canvas root & OrbitControls
    │   │   ├── Ground.tsx         # Terrain, stream, grass patches
    │   │   ├── WeatherSystem.tsx  # Rain/snow particle shaders & sky lighting
    │   │   ├── TreeRenderer.tsx   # Instanced/procedural tree geometry
    │   │   └── TreeInspectModal.tsx# Growth rings cross-section inspection
    │   │
    │   ├── dashboard/             # Financial Analytics View
    │   │   ├── DashboardView.tsx  # Dashboard layout container
    │   │   ├── StatCard.tsx       # Net worth, principal, XIRR summary cards
    │   │   ├── AllocationChart.tsx# Asset allocation donut chart (Recharts)
    │   │   ├── NetWorthChart.tsx  # Principal vs Compounded Growth area chart
    │   │   ├── TransactionLog.tsx # History table with filtering
    │   │   └── AddTradeModal.tsx  # DCA deposit & transaction form
    │   │
    │   ├── common/                # Shared UI primitives
    │   │   ├── ViewToggle.tsx     # Toggle between Forest and Dashboard
    │   │   ├── PanicModal.tsx     # 24-hr cooling off dialog with Housel quotes
    │   │   └── Header.tsx         # Navigation, demo switcher, import/export
    │   └── ui/                    # Base Radix/Tailwind components (Button, Modal, Input)
    │
    └── styles/
        └── globals.css            # Earth-tone CSS variables & ambient transitions
```

---

## 3. Phased Implementation Roadmap

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             EXECUTION PHASES                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Phase 1: Foundation & Math Engine   (Week 1)                                │
│    ├── Setup Vite + React + TS + Tailwind                                   │
│    ├── Implement pure financial domain math (XIRR, compounding factor)      │
│    └── Dexie.js schema + Mock datasets ("The Boglehead DCA Journey")        │
│                                                                             │
│  Phase 2: Financial Data Dashboard   (Week 1–2)                             │
│    ├── Stat cards (Net Worth, Principal, Compounded Gain, XIRR)             │
│    ├── Visual Charts (Principal vs Market Value area chart, Allocation)     │
│    └── Transaction management & local JSON export/import                    │
│                                                                             │
│  Phase 3: 3D Forest Canvas Engine    (Week 2–3)                             │
│    ├── React Three Fiber canvas + orbit camera setup                        │
│    ├── Procedural tree meshes (Oak, Apple, Willow, River stream)            │
│    └── Dynamic weather shader (Summer sun, Autumn breeze, Winter snow)      │
│                                                                             │
│  Phase 4: Dual-View Synthesis & Behavioral Guardrails (Week 3–4)            │
│    ├── Bi-directional sync (Click tree -> View stats; Click ETF -> Highlight)│
│    ├── Tree Growth Rings cross-section inspector modal                      │
│    ├── Winter discount seedling badges                                      │
│    └── 24-hour "Cooling Off Canopy Walk" panic selling guardrail            │
│                                                                             │
│  Phase 5: Open-Source Polish & GitHub Pages Deployment (Week 4)             │
│    ├── Audio ambience toggle (gentle forest rain / wind sound effects)      │
│    ├── Automated GitHub Pages CI workflow                                   │
│    └── Documentation, MIT license, and community contributor guide          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Prototype Acceptance Criteria (Quality Gates)

Before the prototype is considered complete and ready for public announcement:

- [ ] **Dual-View Toggle:** User can transition between 3D Forest and Data Dashboard in `< 100ms` without losing state.
- [ ] **Data Sovereignty:** Zero outbound network calls required for core functionality; works completely offline; local database persists across browser refreshes.
- [ ] **Accurate Math:** XIRR calculation matches Excel/Google Sheets `XIRR()` to within 0.01% precision across test cash flows.
- [ ] **Visual Differentiation:** The 4 core asset classes (Broad Index, Dividend, Bonds, Cash) are instantly recognizable as distinct botanical entities.
- [ ] **Weather Response:** Toggling the market sentiment simulator correctly shifts lighting, fog, and particle systems (snow/rain).
- [ ] **Growth Rings Modal:** Clicking a tree opens an interactive cross-section displaying annual ring density and investment timeline.
- [ ] **Behavioral Guardrail:** Attempting a panic sale invokes the calming reflective modal with the Morgan Housel quote and a historical recovery perspective.
- [ ] **Zero Friction Setup:** `git clone && npm install && npm run dev` compiles and runs cleanly without complex environment variables or external API keys.

---

## 5. Next Steps

With the research, game mechanics, technical feasibility, and implementation roadmap fully detailed, the project is ready for Phase 1 execution (Project scaffolding and core domain engine setup).
