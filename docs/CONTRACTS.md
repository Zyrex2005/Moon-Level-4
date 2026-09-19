# Compact Smart Contract Specification & Resource Optimization Guide (`CONTRACTS.md`)

## 📜 Deployed Smart Contract Addresses (CA)

### Midnight Network Compact Contracts (Testnet/Devnet)
- **ZyrexEscrow Contract Address (CA):** `GARNEUZKZX3QPOXNVD3KVYF3QRMXKQUA3TXD4HXLGZ36DXYXLZIDFFZJ`
- **Reputation Contract Address (CA):** `02003c2e1f4a56b789d0123456789abcdef0123456789abcdef0123456789abcde`

---

## 1. Compact Smart Contract Architecture & Zero-Knowledge Circuits

Midnight's **Compact** language compiles smart contracts into zero-knowledge circuits and state mutation logic. ZyrexEscrow Protocol leverages Compact circuits for private state verification, non-custodial escrow custody, and cross-contract reputation updates.

| Circuit / Function | Contract | Rationale & ZK Witness Guard |
| --- | --- | --- |
| `create_job` | `zyrex_escrow.compact` | Registers gig metadata, client identity, and timelock parameters with circuit validation (`amount > 0`). |
| `fund_job` | `zyrex_escrow.compact` | Locks `tDUST` tokens in the non-custodial Compact contract vault and verifies client signature. |
| `release_payment` | `zyrex_escrow.compact` | Releases `tDUST` tokens to freelancer and triggers atomic cross-contract call to `reputation.compact`. |
| `refund_job` | `zyrex_escrow.compact` | Refunds locked tokens to client if job deadline timestamp has expired without completion. |
| `add_rating` | `reputation.compact` | Zero-knowledgely increments total score and rating count for freelancer upon gig completion. |

---

## 2. Zero-Knowledge Witness Layout & State Privacy

In Compact contracts, public ledger state is separated from private witness execution:

- **Private Client Witness:** `witness get_private_client_key()` shields raw wallet identity during local ZK proof generation.
- **State Proof Generation:** Proofs are generated locally via Midnight Proof Server before broadcasting transactions to Midnight Testnet RPC nodes.
- **State Footprint:** Minimal on-chain ledger footprint minimizes circuit constraint count and gas fees on Midnight Network.

---

## 3. Circuit Guards & Custom Error Conditions

Compact contract execution enforces strict validation guards:

| Error / Guard Condition | Trigger Criteria |
| --- | --- |
| `InvalidAmount` | Job creation attempted with `amount <= 0` |
| `InvalidStatus` | Attempting to fund an already funded job, or release payment on an un-funded job |
| `Unauthorized` | Caller address does not match client public key |
| `DeadlineNotPassed` | Refund requested prior to job timelock expiration |
| `AlreadyRated` | Submitting a rating score for an already rated job |
| `InvalidScore` | Submitting rating score outside bounds `1..5` |
