# Cross-Platform Hybrid Architecture & GCP Deployment Blueprint

**Project:** Invest Forest  
**Document:** 06-cross-platform-hybrid-gcp-architecture.md  
**Version:** 1.0.0  
**Scope:** Web MVP, Mobile Packaging (Capacitor), Hybrid Backend Service, and Modular Terraform on Google Cloud Platform (GCP).

---

## 1. Executive Summary & Architectural Evolution

Invest Forest bridges emotional behavioral psychology and institutional-grade financial discipline. While the foundational design principles prioritize privacy through a **local-first** data core, real-world cross-device usage requires an architectural foundation that supports:
1. **Universal Access:** Web-first deployment with instant load times, seamless offline support, and desktop keyboard/mouse controls.
2. **Mobile Portability:** Direct translation to native iOS and Android environments via **Capacitor** without rewriting the 3D rendering pipeline or business logic.
3. **Hybrid Backend Services:** A lightweight, sovereign backend providing real-time market quote proxying (bypassing browser CORS and rate-limits) and encrypted portfolio snapshot synchronization.
4. **Cloud Infrastructure as Code (IaC):** Repeatable, modular deployment targeting Google Cloud Platform (GCP) using Terraform, leveraging Cloud Run, Cloud Storage, Cloud CDN, and Secret Manager.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT DEVICES                                    |
|                                                                                   |
|   +--------------------------+             +----------------------------------+   |
|   |   Desktop / Mobile Web   |             |     Native iOS & Android Apps    |   |
|   |  (PWA / Modern Browser)  |             |      (Capacitor Web Container)   |   |
|   +------------+-------------+             +-----------------+----------------+   |
|                |                                             |                    |
|                +----------------------+----------------------+                    |
|                                       |                                           |
|                                       v                                           |
|                   +---------------------------------------+                       |
|                   |           apps/web (React 18)         |                       |
|                   |  - React Three Fiber 3D Canvas        |                       |
|                   |  - Financial Analytics Dashboard      |                       |
|                   |  - Dexie.js (IndexedDB Local Storage) |                       |
|                   |  - Zustand State Store                |                       |
|                   +-------------------+-------------------+                       |
+---------------------------------------|-------------------------------------------+
                                        | imports
                                        v
                    +---------------------------------------+
                    |          packages/core (TS)           |
                    |  - Newton-Raphson / Brent XIRR Solver |
                    |  - Compounding & Allocation Metrics   |
                    |  - Botanical Tree Scaling Math        |
                    |  - Game Weather & Seasons Engine      |
                    +---------------------------------------+
                                        |
                 HTTPS / REST           |  Market Quotes & Encrypted Sync
                 (CORS / Auth)          v
+-----------------------------------------------------------------------------------+
|                         GOOGLE CLOUD PLATFORM (GCP)                               |
|                                                                                   |
|   +-------------------------+                   +-----------------------------+   |
|   | Cloud Storage + CDN     |                   | Cloud Run (apps/server)     |   |
|   | (Static Web Application)|                   | - Market Data Quote Proxy   |   |
|   +-------------------------+                   | - In-Memory TTL Quote Cache |   |
|                                                 | - Encrypted Blob Sync API   |   |
|                                                 +--------------+--------------+   |
|                                                                |                  |
|                                                 +--------------v--------------+   |
|                                                 | Secret Manager & Cloud IAM  |   |
|                                                 | (API Keys & Service Accts)  |   |
|                                                 +-----------------------------+   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Monorepo Structure & Package Boundaries

The project uses npm workspaces to isolate business rules, client rendering, backend APIs, and infrastructure.

```
invest-forest/
├── package.json                   # Root workspace manifest & orchestration scripts
├── tsconfig.base.json             # Shared strict TypeScript configuration
├── docs/                          # Architectural & behavioral design specifications
├── packages/
│   └── core/                      # Pure TypeScript domain & math (Zero DOM / Zero Node dependencies)
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   ├── finance/
│       │   │   ├── xirr.ts        # Robust Newton-Raphson XIRR solver with Brent fallback
│       │   │   ├── metrics.ts     # Portfolio valuation, compounding factor, TWR
│       │   │   └── types.ts       # Domain contracts (Transaction, Holding, AssetClass)
│       │   ├── ecosystem/
│       │   │   ├── species.ts     # Asset-to-tree species taxonomy & ring logic
│       │   │   ├── weather.ts     # Market sentiment to climate/season mapping
│       │   │   └── discipline.ts  # DCA streak, 24h cooling off walk logic
│       │   └── index.ts
│       └── tests/                 # Math & domain unit test suites (Vitest)
│
├── apps/
│   ├── web/                       # React 18 / Vite / Three.js / Dexie.js Client
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── capacitor.config.ts    # Capacitor cross-platform mobile configuration
│   │   ├── src/
│   │   │   ├── components/        # 3D canvas, dashboard terminal, modals
│   │   │   ├── storage/           # Dexie.js local database & export/import
│   │   │   ├── store/             # Zustand state management
│   │   │   ├── services/          # API client for backend quotes & sync
│   │   │   └── main.tsx
│   │   └── public/
│   │
│   └── server/                    # Node.js / Express / TypeScript Cloud Backend
│       ├── package.json
│       ├── tsconfig.json
│       ├── Dockerfile             # Multi-stage production container
│       ├── src/
│       │   ├── routes/            # /api/v1/quotes, /api/v1/sync, /healthz
│       │   ├── services/          # Market quote fetchers & cache
│       │   ├── middleware/        # Rate limiting, CORS, error handling
│       │   └── index.ts
│       └── tests/                 # API endpoint integration tests
│
└── infra/
    └── terraform/                 # GCP Infrastructure as Code
        ├── main.tf                # Primary orchestration
        ├── variables.tf           # Project ID, region, container tags
        ├── outputs.tf             # Service URLs, bucket names, CDN endpoints
        ├── terraform.tfvars.example
        └── modules/
            ├── artifact_registry/ # Docker image repository
            ├── cloud_run/         # Scalable backend container service
            ├── storage_cdn/       # Web app static hosting & global CDN
            └── iam_secrets/       # Service accounts & Secret Manager bindings
```

---

## 3. Cross-Platform Mobile Strategy (Capacitor Bridge)

To provide a consistent experience across Web, iOS, and Android without duplicating the complex Three.js procedural rendering pipeline, Invest Forest leverages **Capacitor 6+**.

### 3.1 Architecture of the Mobile Wrapper
- **Single Render Loop:** The React Three Fiber WebGL canvas runs inside the system WebView (WKWebView on iOS, Android System WebView on Android) utilizing hardware-accelerated WebGL 2.0.
- **Unified State & Storage:** Mobile uses the same Dexie.js IndexedDB storage engine. On native apps, IndexedDB is persistent; for critical redundancy, Capacitor Filesystem plugins allow automated local JSON snapshot backups to device storage.
- **Haptic & Sensory Feedback:** Native haptic pulses (`@capacitor/haptics`) fire when planting seedlings, harvesting dividends, or entering the 24-Hour "Cooling-Off Walk" dialog.
- **Native Lifecycle Integration:** App state listeners (`@capacitor/app`) pause the Three.js RAF (requestAnimationFrame) loop when the app transitions to the background, preventing battery drain.

### 3.2 3D Graphics Mobile Optimization Constraints
| Area | Web Desktop | Mobile WebView (Capacitor) |
| :--- | :--- | :--- |
| **Device Pixel Ratio (DPR)** | `Math.min(window.devicePixelRatio, 2)` | Clamped strictly to `[1, 1.5]` to prevent thermal throttling on Retina/OLED |
| **Shadow Maps** | Soft PCF Shadow Map (2048x2048) | Basic Shadows (1024x1024) or Static Directional Depth |
| **Particle Count** | 1,500 raindrops / snowflakes | 350 instanced particle points |
| **Camera Controls** | Mouse OrbitControls (rotate, zoom, pan) | Touch gestures (single touch rotate, two-finger pinch zoom, dual-drag pan) |
| **Frame Rate** | 60 FPS uncapped | Throttled to 30 or 60 FPS with powerPreference: `high-performance` |

### 3.3 Capacitor Configuration Specification
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.investforest.app',
  appName: 'Invest Forest',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#0d1b1e",
      showSpinner: false
    }
  }
};

export default config;
```

---

## 4. Hybrid Backend & Synchronization Protocol

### 4.1 Privacy Guarantees & Zero-Knowledge Vault Model
Financial data privacy is paramount:
1. **No Mandatory Account:** The app operates 100% locally by default. No server communication is required to add assets, calculate XIRR, or view tree growth.
2. **Client-Side Envelope Encryption (AES-GCM-256):** If the user opts into multi-device Cloud Sync:
   - All portfolio state is serialized to JSON.
   - The payload is encrypted locally using an AES-256-GCM symmetric key derived from a user passphrase via PBKDF2 (100,000 iterations, SHA-256).
   - Only the ciphertext, IV (initialization vector), salt, and SHA-256 verification hash are transmitted to the GCP Cloud Run backend.
   - The server has zero knowledge of tickers, balances, or transactions.

### 4.2 Backend API Schema Specification

#### `GET /healthz`
Health check endpoint used by GCP Cloud Run readiness and liveness probes.
- **Response 200:** `{"status": "healthy", "timestamp": "2026-10-07T00:00:00Z"}`

#### `GET /api/v1/quotes?symbols=AAPL,VOO,BND`
Fetches current market quotes for assets.
- **Caching Layer:** Cloud Run maintains an in-memory TTL cache (15 minutes during market hours, 1 hour off-market). Repeated requests for common ETF tickers (e.g., `VOO`, `VTI`, `VT`) do not trigger upstream calls.
- **Upstream Providers:** Primary fetch against Stooq / Yahoo Finance public endpoints with graceful fallback to simulated baseline quotes if upstream is rate-limited.
- **Response 200:**
  ```json
  {
    "quotes": {
      "VOO": { "price": 485.20, "changePercent": 0.42, "updatedAt": "2026-10-07T14:30:00Z" },
      "BND": { "price": 72.10, "changePercent": -0.05, "updatedAt": "2026-10-07T14:30:00Z" }
    }
  }
  ```

#### `POST /api/v1/sync/push`
Stores an encrypted portfolio snapshot identified by a public Sync ID.
- **Request Body:**
  ```json
  {
    "syncId": "uuidv4-or-nanoid-public-handle",
    "version": 1,
    "encryptedBlob": "base64-encoded-aes-gcm-ciphertext",
    "iv": "base64-iv-12-bytes",
    "salt": "base64-salt-16-bytes",
    "checksum": "sha256-hash-of-ciphertext"
  }
  ```
- **Response 200:** `{"success": true, "syncedAt": "2026-10-07T14:35:00Z", "version": 1}`

#### `GET /api/v1/sync/pull?syncId=...`
Retrieves the latest encrypted snapshot for recovery or multi-device sync.

---

## 5. Google Cloud Platform (GCP) Deployment Topology

### 5.1 Infrastructure Architecture
The architecture is serverless, auto-scaling, and cost-effective (free-tier friendly):

1. **Cloud Run (`invest-forest-server`):**
   - Hosts the Node.js backend container.
   - Auto-scales between 0 (scale to zero when idle) and 5 instances to minimize idle cost.
   - Enforces HTTPS, manages CORS headers, and terminates SSL.
2. **Cloud Storage Bucket (`invest-forest-web-app`):**
   - Configured for multi-region or regional static website hosting.
   - Serves the compiled Vite bundle (HTML, JS, CSS, WebGL glTF models, textures).
3. **Cloud CDN (Content Delivery Network):**
   - Fronts the Cloud Storage bucket with global edge caching for ultra-low latency 3D asset downloads.
4. **Artifact Registry (`invest-forest-repo`):**
   - Standard Docker container registry storing versioned backend images.
5. **Secret Manager & IAM:**
   - Stores optional third-party market data API keys.
   - Dedicated service account (`invest-forest-sa`) granted minimal permissions (`roles/run.serviceAgent`, `roles/secretmanager.secretAccessor`).

### 5.2 Network & Security Boundary
```
   Internet Traffic
          │
          ├──> [Cloud CDN / HTTPS] ───> Cloud Storage (Static Web / 3D Assets)
          │
          └──> [Cloud Run HTTPS]   ───> apps/server (Quotes & Encrypted Sync)
                                              │
                                              └──> Secret Manager (API Tokens)
```

---

## 6. Terraform IaC Specification

The Terraform configuration in `infra/terraform` is designed as reusable, declarative infrastructure modules:

### 6.1 Input Variables
- `project_id`: GCP Project identifier.
- `region`: Target GCP region (e.g. `us-central1`).
- `environment`: Deployment stage (`dev`, `staging`, `prod`).
- `container_image`: Full URI of the container in Artifact Registry.
- `domain_name`: Optional custom domain name for Cloud CDN routing.

### 6.2 Output Values
- `server_url`: The HTTPS Cloud Run endpoint.
- `web_bucket_url`: The Cloud Storage static website endpoint.
- `cdn_ip_address`: Edge IP address for DNS configuration.
- `artifact_registry_repository`: URI of the Docker repository.

---

## 7. Quality Gates & Verification Matrix

| Area | Verification Command | Gate Criteria |
| :--- | :--- | :--- |
| **Financial Engine** | `npm --workspace=@invest-forest/core run test` | 100% tests pass. XIRR converges across all edge-case cash flow patterns. |
| **Web Build** | `npm --workspace=@invest-forest/web run build` | 0 TypeScript errors. Output in `dist/`. Low-poly shaders compile. |
| **Server Build & Tests** | `npm --workspace=@invest-forest/server run test && build` | Quotes proxy unit tests pass; Docker multi-stage build completes. |
| **Capacitor Configuration** | `npx cap sync` | Validated capacitor config, platform manifests ready. |
| **Terraform IaC** | `terraform -chdir=infra/terraform fmt -check && validate` | Clean formatting, 100% valid provider and resource definitions. |
