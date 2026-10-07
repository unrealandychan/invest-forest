# GitHub Issues & Future Implementation Roadmap

**Project:** Invest Forest  
**Document:** `docs/08-github-issues-and-future-roadmap.md`  
**Purpose:** Actionable backlog of prioritized GitHub issues, feature milestones, and technical specifications for tracking progress across the open-source community.

---

## 🗺️ High-Level Phased Roadmap

```
  [PoC / Web MVP + Local Docker + AI Guide]  <-- CURRENT STATE (COMPLETED)
                     │
                     ▼
  [Phase 1.1: Native Mobile App Stores & Offline SQLite]
                     │
                     ▼
  [Phase 1.2: Read-Only Brokerage Sync (Plaid/SnapTrade)]
                     │
                     ▼
  [Phase 1.3: Social Discipline & Family Canopy Groves]
                     │
                     ▼
  [Phase 2.0: Dynamic Biomes, Audio Soundscapes & Voice AI]
```

---

## 📋 Prioritized GitHub Issues Ready for Tracking

### Issue 1: [ROADMAP-v1.1] Native iOS & Android Store Packaging with SQLCipher
- **Labels:** `mobile`, `capacitor`, `roadmap`
- **Milestone:** v1.1.0
- **Summary:** Package the current Capacitor 6 bundle into official binary releases for the Apple App Store and Google Play Store.
- **Tasks:**
  - [ ] Add `@capacitor-community/sqlite` with SQLCipher AES-256 local database encryption.
  - [ ] Generate adaptive app icons and launch splash screens (`assets/icon.png`, `assets/splash.png`).
  - [ ] Configure Xcode provisioning profiles and Android Gradle keystores.
  - [ ] Implement native in-app review prompts upon completing a 6-month DCA streak milestone.

---

### Issue 2: [ROADMAP-v1.1] Read-Only Brokerage Sync via Plaid & SnapTrade
- **Labels:** `integrations`, `finance`, `security`
- **Milestone:** v1.1.0
- **Summary:** Enable users to optionally link real brokerage accounts (Schwab, Fidelity, Vanguard, Interactive Brokers) to automatically sync DCA transactions without manual typing.
- **Privacy Constraints:**
  - Brokerage tokens and transactions must be encrypted locally using user's client-side passphrase.
  - Zero server logging of account credentials or cash balances.
  - Fallback manual CSV importer for non-US or privacy-conscious users.

---

### Issue 3: [FEAT] Social Discipline & Accountability Cards
- **Labels:** `enhancement`, `social`, `behavioral`
- **Milestone:** v1.2.0
- **Summary:** Create beautiful, shareable SVG and PNG discipline cards that showcase holding duration and botanical rings *without* revealing sensitive dollar amounts.
- **Deliverables:**
  - Dynamic client-side HTML-to-Canvas export.
  - Displays: "5-Year Ancient Oak Cultivator • 0 Panic Sells • 24 Consecutive DCA Deposits".
  - Shareable to Farcaster, Twitter/X, and messaging apps.

---

### Issue 4: [FEAT] Multiplayer Canopy Grove (Shared Family & Group Forests)
- **Labels:** `multiplayer`, `crdt`, `ecosystem`
- **Milestone:** v1.2.0
- **Summary:** Allow families, investment clubs, or partners to visualize their collective compounding in a shared forest clearing using peer-to-peer WebRTC / CRDT sync (Yjs).

---

### Issue 5: [3D-ENGINE] Dynamic Day/Night Cycle & Aurora Borealis Shaders
- **Labels:** `three.js`, `shaders`, `graphics`
- **Milestone:** v1.3.0
- **Summary:** Introduce real-time circadian lighting shifting through dawn, golden hour, starlit night, and aurora borealis during major compounding milestones.
- **Performance Budget:** Must maintain 60 FPS on mobile WebViews with DPR clamped to 1.75.

---

### Issue 6: [AI-AGENT] Voice-Enabled Canopy Spirit with Web Speech API
- **Labels:** `ai`, `voice`, `accessibility`
- **Milestone:** v1.3.0
- **Summary:** Allow users to converse with the Canopy Spirit hands-free using local browser speech recognition and synthesis with ambient nature soundscapes (rustling leaves, gentle stream audio).

---

### Issue 7: [INFRA] GCP Terraform Multi-Region Deployment & Cloudflare WAF
- **Labels:** `devops`, `terraform`, `gcp`
- **Milestone:** v2.0.0
- **Summary:** Extend Terraform infrastructure to multi-region Cloud Run endpoints behind Cloudflare Enterprise / Zero Trust DDoS mitigation and managed SSL termination.

---

### Issue 8: [FINANCE] Dividend DRIP Visualizer (Apples Planting Seedlings)
- **Labels:** `finance`, `animation`, `gamification`
- **Milestone:** v2.0.0
- **Summary:** When a dividend transaction is recorded, animate ripe apples detaching from the Honey Apple tree canopy, dropping into the soil, and sprouting into miniature reinvestment saplings.

---

## 🛠️ Automated Issue Creation Script

To publish these issues automatically to GitHub when the repository remote is connected:

```bash
# Push repository to GitHub
gh repo create unrealandychan/invest-forest --public --source=. --remote=origin --push

# Automatically create the issues
gh issue create --title "[ROADMAP-v1.1] Native iOS & Android Store Packaging with SQLCipher" \
  --body "Package the current Capacitor 6 bundle into official binary releases for the Apple App Store and Google Play Store with SQLCipher encryption." \
  --label "mobile,roadmap"

gh issue create --title "[ROADMAP-v1.1] Read-Only Brokerage Sync via Plaid & SnapTrade" \
  --body "Enable optional brokerage linking for automated DCA transaction importing with client-side envelope encryption." \
  --label "integrations,finance"

gh issue create --title "[FEAT] Social Discipline & Accountability Cards" \
  --body "Generate shareable zero-knowledge graphical cards showcasing holding duration and growth rings without exposing dollar balances." \
  --label "enhancement,behavioral"

gh issue create --title "[3D-ENGINE] Dynamic Day/Night Cycle & Aurora Borealis Shaders" \
  --body "Implement circadian sunlight, starlit skies, and milestone aurora particle shaders within mobile performance budgets." \
  --label "three.js,graphics"
```
