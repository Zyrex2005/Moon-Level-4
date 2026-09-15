# 1–2 Minute Demo Video Script — Midnight Network

**Goal:** Demonstrate the full protocol workflow to the reviewer — Midnight Lace Wallet connection, Compact smart escrow funding in `tDUST`, zero-knowledge proof generation, payment release, and cross-contract reputation updates.

---

### **0:00–0:10 — Introduction & Hook**
"This is ZyrexEscrow Protocol on Midnight Network: a privacy-first, zero-knowledge Web3 freelance marketplace where completing a gig automatically updates the freelancer's on-chain reputation through Compact smart contract execution."

### **0:10–0:30 — Connect Lace Wallet & Post Gig**
- Click **Connect Lace Wallet** (show `mn_test1...` Bech32 address in header).
- Fill the "Post ZyrexEscrow Gig" form: freelancer address, `tDUST` token amount, description, and timelock deadline.
- Click **Post Gig & Lock Escrow Funds**, demonstrate zero-knowledge transaction proof generation and toast confirmation.
- Point out the newly created gig appearing in the Marketplace list.

### **0:30–0:50 — Release Payment & ZK Reputation Update**
- Click **Release Payment & Rate** on a funded gig.
- Show status transition from `Funded` → `Completed`.
- Demonstrate the `ReputationBadge` updating atomically via cross-contract invocation into `reputation.compact`.

### **0:50–1:05 — User Feedback & Telemetry**
- Open the **Feedback Widget** at the bottom right.
- Submit a 5-star user rating and view instant telemetry relay sync via the Express API relay (`/api/feedback`).

### **1:05–1:20 — Engineering Verification**
- Screen-record: Vitest suite execution (`npm test --prefix frontend`) passing all unit tests.
- Screen-record: Compact contract compilation (`npx @midnight-ntwrk/compactc`).

### **1:20–1:30 — Conclusion**
"Compact contracts are live on Midnight Network Devnet/Testnet. Demo is live at [new-moon-alpha.vercel.app](https://new-moon-alpha.vercel.app), full source code and documentation are available on GitHub."

---

## Recording Checklist
- [ ] Record at 1080p, 60fps landscape view.
- [ ] Ensure Midnight Lace Wallet browser extension is connected to Devnet/Testnet.
- [ ] Have testnet account pre-funded with `tDUST`.
- [ ] Ensure terminal test suite shows green status.
