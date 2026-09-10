# ZyrexEscrow Protocol — Next-Gen Zero-Knowledge Escrow & Reputation on Midnight Network

🟢 **Level 4 — Waxing Gibbous Submission (Rise In | Moonshot on Midnight)**

🚀 **Live Protocol:** [new-moon-alpha.vercel.app](https://new-moon-alpha.vercel.app)  
🎥 **Demo Video:** [https://drive.google.com/file/d/1gF_c0dQRqNR60qFIehgE2Y9NsJxVWu8I/view?usp=sharing](https://drive.google.com/file/d/1gF_c0dQRqNR60qFIehgE2Y9NsJxVWu8I/view?usp=sharing)  
🔏 **Smart Contracts:** Compact DSL (`contracts/zyrex_escrow.compact`, `contracts/reputation.compact`)  
🌙 **Network:** Midnight Testnet / Devnet (Cardano Privacy Blockchain)  

---

## 📝 User Feedback & Testing Record

- **Google Form:** https://docs.google.com/forms/d/e/1FAIpQLSdkH5jicUv_iJpKaAULf9jGbagu9LoSYN7ZQgLY-XNXUU-MVA/viewform?usp=sharing
- **Feedback Google Sheet:** https://docs.google.com/spreadsheets/d/1d8ZYc_93PM-ZHsHxYFSDZA5S8Zb53Nd2H4PAVzh_fL0/edit?usp=sharing

### 📊 User Feedback Summary Table

| User Name | Contact | Feedback Summary | Rating |
| :--- | :--- | :--- | :--- |
| **Vivek Tiwari** | `vivek32@gmail.com` | Seamless Midnight UI and Lace Wallet connection; suggested clearer instructions for proposal creation. | **Extremely Likely (9 - 10)** |
| **Viru Kumar** | `kumar1235@gmail.com` | Excellent zero-knowledge privacy features and Compact contract execution; requested tDUST faucet link. | **Extremely Likely (9 - 10)** |
| **Riya Tiwari** | `riyatiwari4985@gmail.com` | Intuitive UI & fast ZK proof verification; requested clearer gig creation steps. | **Extremely Likely (9 - 10)** |
| **Yogesh Dey** | `yogeshdey32@gmail.com` | Very easy proposal submission process; smooth Lace wallet connection and fast Compact execution. | **Extremely Likely (9 - 10)** |
| **Maya Saini** | `sainimaya142@gmail.com` | Intuitive UI; requested better explanation for zero-knowledge reputation concept. | **Moderate / Likely (7 - 8)** |
| **Maniya Kumar** | `maniyakumar54@gmail.com` | Functional UI with Midnight wallet integration; transactions had fast confirmation. | **Extremely Likely (9 - 10)** |

---

## Overview

**ZyrexEscrow Protocol** is a privacy-first, trustless Web3 freelance marketplace built on the **Midnight Network** (Cardano ecosystem / Input Output zero-knowledge smart contract platform). It enables buyers (clients) and sellers (freelancers) to lock assets in non-custodial Compact smart contracts (`zyrex_escrow.compact`) with automated, time-locked release and refund guarantees using **tDUST** tokens. Upon gig completion, releasing payment triggers an **atomic cross-contract invocation** into `reputation.compact` to update the freelancer's on-chain trust score zero-knowledgely.

---

## 🏛️ Level 4 System Architecture (Midnight Network)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            REACT + VITE FRONTEND                            │
│ (Onboarding Modal, Midnight Lace Wallet SDK, Nav Drawer, Feedback Widget)   │
└──────┬──────────────────────────────┬───────────────────────────────┬───────┘
       │                              │                               │
       │ Event Tracking               │ Express API Relay             │ Midnight JS / Lace
       ▼                              ▼ (10s Event Cache)             ▼ ZK Proof / Submit
┌──────────────┐             ┌──────────────────┐           ┌──────────────────┐
│  PostHog /   │             │   Node/Express   │           │ Midnight Network │
│  GA4 &       │             │   API Service    │           │ RPC & Indexer    │
│  Sentry DSN  │             │   (/api/relay)   │           └────────┬─────────┘
└──────────────┘             └────────┬─────────┘                    │
                                      │                              ▼
                                      │ Feedback Store    ┌────────────────────┐
                                      ▼ (JSON / DB)       │  ZyrexEscrow       │
                             ┌──────────────────┐         │ Compact Contract   │
                             │  User Feedback   │         │ (mn_contract1...)  │
                             │  Telemetry Store │         └──────────┬─────────┘
                             └──────────────────┘                    │ Atomic ZK Call
                                                                     ▼
                                                          ┌────────────────────┐
                                                          │ Reputation Contract│
                                                          │ (mn_contract2...)  │
                                                          └────────────────────┘
```

---

## 🚀 Key Features Introduced in Level 4 (Midnight Moonshot Upgrade)

1. **Compact Smart Contracts (`contracts/`):**
   - Written in Midnight's **Compact** language (`zyrex_escrow.compact`, `reputation.compact`, `escrow.compact`).
   - Zero-Knowledge circuit validation (`create_job`, `fund_job`, `release_payment`, `refund_job`).
   - Strict validation guards (`amount > 0`, timelock checks, status transitions) with custom error handles.

2. **Midnight Lace Wallet Integration (`frontend/`):**
   - Connects to **Midnight Lace Wallet** (`window.midnight.mnLace` & DApp Connector API).
   - Handles Midnight Bech32 address format (`mn_test1...`).
   - Step-by-step Onboarding Modal guiding new users through Lace wallet setup and tDUST testnet tokens.

3. **Lightweight Backend & Midnight RPC Relay (`api/`):**
   - Express serverless API relay caching Midnight RPC & Indexer queries with a 10-second TTL to avoid rate limits.
   - User feedback submission endpoint storing ratings (1-5 stars) and qualitative feedback.
   - Health check endpoint (`/api/health`) reporting system status, uptime, and Midnight RPC connectivity.

4. **Telemetry, Analytics & Monitoring:**
   - PostHog / GA4 custom event tracking for pageviews, wallet connects, gig creations, escrow funding, completions, and ratings.
   - Sentry error monitoring integration capturing unhandled exceptions with full stack traces.
   - Internal `/admin` Stats Dashboard presenting live counts for total jobs listed, active volume in `tDUST`, unique interacting wallets, average rating, and user feedback logs.

---

## 📖 User Onboarding Walkthrough

Follow these simple steps to interact with ZyrexEscrow on Midnight Testnet:

1. **Install Midnight Lace Wallet:** Download and install the [Midnight Lace Extension](https://midnight.network/).
2. **Switch to Midnight Testnet:** Open Lace wallet settings → Select **Midnight Devnet/Testnet**.
3. **Fund Testnet Account:** Use the [Midnight Testnet Faucet](https://midnight.network/) to request free testnet **tDUST**.
4. **Connect Wallet & Post Gig:** Click **Connect Lace Wallet** in the top navigation bar, navigate to **Post Gig**, enter the freelancer address, amount in `tDUST`, and submit!

---

## 💻 Tech Stack

- **Smart Contracts:** Compact Smart Contract Language (`@midnight-ntwrk/compactc`), Midnight JS SDK
- **Blockchain:** Midnight Network Testnet / Devnet (Cardano / IOHK Zero-Knowledge Ecosystem)
- **Frontend Framework:** React 19, TypeScript, Vite 8, TailwindCSS 3.4
- **State & Router:** React Hooks, Code-Split Lazy Loading
- **Wallet Connection:** Midnight Lace Wallet DApp Connector API (`window.midnight.mnLace`)
- **Backend API:** Node.js, Express, CORS, JSON Store
- **Testing:** Vitest, Testing Library React
- **Telemetry:** PostHog, GA4, Sentry Error Tracking

---

## 🛠️ Local Development & Setup

### Prerequisites

- Node.js (v18.0+)
- npm or pnpm

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install --prefix frontend

# Install root dependencies
npm install
```

### 2. Compile Compact Smart Contracts

```bash
# Compile Compact contracts
npx @midnight-ntwrk/compactc contracts/zyrex_escrow.compact --output build/
```

### 3. Run Backend API Server

```bash
node api/index.js
```

### 4. Run Frontend Application

```bash
npm --prefix frontend run dev
```

The application will be running at `http://localhost:5173`.

### 5. Run Automated Tests

```bash
npm --prefix frontend test
```

---

## 📜 Repository Structure

```
Zyrex Moon Level4/
├── contracts/
│   ├── zyrex_escrow.compact    # Midnight Compact escrow smart contract
│   ├── reputation.compact      # Midnight Compact reputation smart contract
│   ├── escrow.compact          # Modular timelocked vault contract
│   ├── midnight-bindings.ts    # Midnight TS SDK bindings & contract config
│   └── README.md               # Midnight contracts documentation
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, JobList, CreateJobForm, OnboardingModal, WalletButton, AdminStats
│   │   ├── hooks/              # useWallet (Lace Wallet), useJobs
│   │   ├── lib/                # midnight.ts, analytics.ts, sentry.ts
│   │   └── __tests__/          # Vitest unit test suite
│   ├── package.json
│   └── vite.config.ts
├── api/
│   ├── index.js                # Express Midnight RPC relay & feedback API
│   └── feedback_store.json     # Feedback storage
├── scripts/
│   ├── deploy-midnight.ps1     # PowerShell Midnight contract deployer
│   └── deploy-midnight.sh      # Shell Midnight contract deployer
├── package.json
└── README.md
```
