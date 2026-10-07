# Invest Forest 🌲📊

> **Gamifying Long-Term Investing Through Organic Cultivation & Behavioral Discipline**  
> Inspired by *"Just Keep Buying"* by Nick Maggiulli and *"The Psychology of Money"* by Morgan Housel.

---

## 🌟 Overview

Most financial apps gamify **trading**: sirens, confetti, notifications for volatile penny stocks, and variable-ratio reward loops that trick retail investors into frequent churn and wealth destruction.

**Invest Forest** reframes wealth accumulation from speculative anxiety into a living, serene forest ecosystem through a synchronized **Dual-View Architecture**:
1. **🌲 The 3D Forest Canvas:** A low-poly woodland where asset classes are distinct botanical species (Ancient Oak, Honey Apple Tree, Silver Willow, Cash Stream, Wild Mushrooms), holding duration forms dense concentric growth rings, market corrections manifest as winter rainfall/snow, and consistent DCA deposits cultivate wildflowers and blossoming fruit.
2. **📊 The Portfolio Terminal:** An institutional-grade personal finance dashboard displaying true Internal Rate of Return (Newton-Raphson XIRR), compounding multipliers ($M$), asset allocation breakdown, and a disciplined DCA execution ledger.
3. **🦉 The Canopy Spirit (AI Guide):** A behavioral financial intelligence agent (supporting OpenAI, Google Gemini, Anthropic Claude, local Ollama, and offline heuristics) providing personalized ecology audits, market weather interpretation, and anti-panic counseling.

---

## 🎮 1-Command Local Playtesting (Docker)

To play and test the complete stack locally with zero configuration:

```bash
# 1. Start all containers (Web frontend + AI backend)
docker compose up -d

# 2. Open in your browser:
# http://localhost:3000
```

### What to Explore in Playtest:
- **🌲 Interactive 3D Canopy:** Left-click/drag to orbit, right-click to pan, scroll to zoom. Trees grow taller and thicker as capital compounds.
- **🪵 Annual Growth Rings:** Click any tree to inspect its botanical cross-section, concentric rings, and holding duration lore.
- **📖 First-Time Onboarding Guide:** Click **"📖 Guide"** in the top navbar for the 5-step tutorial on patient compounding.
- **🦉 Canopy Spirit AI:** Click **"🦉 Canopy AI"** to run an automated **Portfolio Ecology Audit** or ask behavioral investing questions.
- **🌱 Plant Seedlings / DCA:** Click **"Plant / DCA"** to browse 18+ ETFs across Broad Market, Dividend, Bonds, Cash, or type any custom ticker! Watch the tree animate and sprout!
- **❄️ Market Weather Simulator:** Click the weather button in the navbar to cycle between **Sunny**, **Breeze**, **Rain**, and **Winter Snow** to test bear market seedling discounts.
- **🚶 24-Hour Canopy Walk:** Click **"Canopy Walk"** or simulate a panic sell in the terminal to test the anti-panic selling guardrail.

---

## 🏗️ System Architecture & Monorepo Structure

Invest Forest is built as a modular monorepo supporting **Web-First access**, **Capacitor cross-platform mobile packaging**, and **serverless GCP cloud deployment**:

```
invest-forest/
├── packages/
│   └── core/                      # Pure TypeScript domain & deterministic financial math
│       ├── src/finance/           # Newton-Raphson XIRR solver, metrics, 18+ asset catalogue
│       ├── src/ecosystem/         # Botanical species mapping, weather engine, DCA streak
│       └── tests/                 # Unit tests for financial formulas and growth scaling
│
├── apps/
│   ├── web/                       # Web & Mobile Client Application
│   │   ├── src/components/canvas/ # React Three Fiber 3D Scene, low-poly procedural trees & weather
│   │   ├── src/components/dashboard/# Portfolio terminal, metric cards, holdings table
│   │   ├── src/components/ai/     # Canopy Spirit chat & Ecology Audit dialog
│   │   ├── src/components/modals/ # Tree inspection, onboarding guide, DCA modal, canopy walk
│   │   ├── src/storage/           # Dexie.js (IndexedDB) local-first storage with live reactivity
│   │   ├── capacitor.config.ts    # Capacitor 6+ configuration for iOS and Android
│   │   └── Dockerfile             # Multi-stage production container with reverse proxy
│   │
│   └── server/                    # Backend Microservice
│       ├── src/routes/            # /api/v1/quotes, /api/v1/sync, /api/v1/ai (multi-provider), /healthz
│       ├── src/services/ai/       # OpenAI, Gemini, Claude, Ollama & offline heuristic engine
│       └── Dockerfile             # Multi-stage production container
│
├── infra/
│   └── terraform/                 # Production-ready Google Cloud Platform IaC
│       ├── modules/cloud_run/     # Auto-scaling container microservice (0 to 5 instances)
│       ├── modules/storage_cdn/   # Static website bucket with Cloud CDN edge caching
│       ├── modules/artifact_registry/# Docker image repository
│       ├── modules/firestore/     # Cloud Firestore database in Native mode
│       └── modules/iam/           # Least-privilege service account & IAM bindings
│
└── docs/                          # Comprehensive research, behavioral specs, audits & roadmap
```

---

## 🤖 AI / LLM Multi-Provider Architecture

The backend supports pluggable LLM backends via environment variables (`.env.example`):
- **Offline Heuristic (Default):** 100% local, zero latency, requires 0 API keys.
- **OpenAI:** GPT-4o / GPT-4o-mini (`OPENAI_API_KEY`)
- **Google Gemini:** Gemini 1.5 Flash (`GEMINI_API_KEY`)
- **Anthropic:** Claude 3.5 Sonnet (`ANTHROPIC_API_KEY`)
- **Local Ollama:** Run your own private open-source models with zero external cloud calls (`OLLAMA_BASE_URL=http://host.docker.internal:11434/v1`).

---

## 📱 Cross-Platform Mobile (iOS & Android with Capacitor)

Invest Forest uses **Capacitor 6+** to run the hardware-accelerated WebGL Three.js canvas natively inside iOS and Android WebViews with native haptics, lifecycle listeners, and persistent storage:

```bash
# 1. Build the production web bundle
npm --workspace=@invest-forest/web run build

# 2. Sync web bundle to native platforms
cd apps/web
npx cap sync

# 3. Open in Xcode (iOS) or Android Studio (Android)
npx cap open ios
npx cap open android
```

---

## ☁️ Google Cloud Platform (GCP) Deployment with Terraform

The infrastructure is 100% automated using modular Terraform targeting serverless, cost-effective GCP primitives:

```bash
# 1. Initialize Terraform
cd infra/terraform
terraform init

# 2. Review plan
terraform plan -var="project_id=YOUR_GCP_PROJECT_ID" -var="region=us-central1"

# 3. Apply infrastructure
terraform apply -var="project_id=YOUR_GCP_PROJECT_ID" -var="region=us-central1"
```

---

## 🧪 Testing & Quality Assurance

Run the complete test suite across all packages:

```bash
# Run all unit tests (financial math, species, and server APIs)
npm test

# Build all workspace packages
npm run build

# Validate Terraform GCP infrastructure code
npm run tf:validate
```

---

## 📜 Documentation & Community Roadmap

- **[01. Competitive & Market Research](./docs/01-competitive-and-market-research.md)**
- **[02. Game Mechanics & Behavioral Design](./docs/02-game-mechanics-and-behavioral-design.md)**
- **[03. Technical Architecture & Feasibility](./docs/03-technical-architecture-and-feasibility.md)**
- **[04. Implementation Roadmap & Blueprint](./docs/04-implementation-roadmap-and-blueprint.md)**
- **[05. QA & Design Audit](./docs/05-qa-and-design-audit.md)**
- **[06. Cross-Platform Hybrid & GCP Architecture](./docs/06-cross-platform-hybrid-gcp-architecture.md)**
- **[07. AI, Docker & PoC Quality Audit Report](./docs/07-ai-docker-poc-audit.md)**
- **[08. GitHub Issues & Future Implementation Roadmap](./docs/08-github-issues-and-future-roadmap.md)**

---

## 📄 License

Invest Forest is open-source software licensed under the [MIT License](./LICENSE).
