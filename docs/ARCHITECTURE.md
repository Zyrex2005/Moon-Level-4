# Midnight Network System Architecture (`ARCHITECTURE.md`)

## 🏛️ Architecture Overview

ZyrexEscrow Protocol is structured into a modular, privacy-preserving zero-knowledge Web3 marketplace architecture on the **Midnight Network** (Cardano ecosystem zero-knowledge smart contract platform).

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
                             │  User Feedback   │         │ (02008f5a6b89...)  │
                             │  Telemetry Store │         └──────────┬─────────┘
                             └──────────────────┘                    │ Atomic ZK Call
                                                                     ▼
                                                          ┌────────────────────┐
                                                          │ Reputation Contract│
                                                          │ (02003c2e1f4a...)  │
                                                          └────────────────────┘
```

---

## 🔐 Why Dual Compact Contracts?

Splitting contract responsibility into `zyrex_escrow.compact` and `reputation.compact` enforces modularity and composability on Midnight Network:

1. **`reputation.compact`**: A generic zero-knowledge ledger mapping `(address -> reputation_score)`. It acts as an independent trust registry that can be queried by external Midnight dApps without exposing client transaction histories.
2. **`zyrex_escrow.compact`**: Controls gig creation, timelock escrow state transitions, `tDUST` token custody, and refund policies. Upon gig completion, it executes an **atomic cross-contract invocation** into `reputation.compact` to record the rating score zero-knowledgely.

---

## ⚡ Inter-Contract Execution & Privacy Guarantees

1. **Atomicity:** The reputation update occurs in the same execution block as the token release. If the reputation circuit fails, the transaction is safely rolled back.
2. **Zero-Knowledge Witness Shielding:** Client identities and raw witness data are shielded locally via the Midnight Proof Server before transactions are submitted to Midnight Network indexers and RPC nodes.
3. **Bech32 Compatibility:** Full native support for Midnight Bech32 address formatting (`mn_test1...` / `mn_contract1...`).

---

## 📊 Event Tracking & Telemetry Relay

- **Front-End Caching:** `api/index.js` provides an Express API relay with a 10-second TTL cache for Midnight RPC node event queries to optimize network traffic and prevent RPC rate limiting.
- **User Feedback Collection:** Collects user experience ratings and comments at `/api/feedback`.
- **Telemetry & Error Monitoring:** Integrated with Sentry for real-time stack-trace tracking and PostHog/GA4 for analytics.
