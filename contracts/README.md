# ZyrexEscrow Compact Smart Contracts — Midnight Network

This directory contains the zero-knowledge smart contract implementation for **ZyrexEscrow Protocol** compiled using Midnight Network's **Compact** language compiler (`@midnight-ntwrk/compactc`).

## 📜 Deployed Smart Contract Addresses (CA)

### 1. Stellar Soroban Smart Contracts (Testnet)
- **Escrow Contract Address (CA):** `CAZYNXWSZ3NVBDDFAZFE4TD2HIRB7QVY3QLGU7LLXQWJRXU3SRCBNSTA`
- **Reputation Contract Address (CA):** `CAZGFW4NFBQ5CMVT2XPU72QKQLLD77XKZWITTWP7JVXRMQKCTDVX2VRV`

### 2. Midnight Network Compact Contracts (Testnet/Devnet)
- **ZyrexEscrow Contract Address (CA):** `mn_contract1zyrexescrow99midnightnetworkdevnet001`
- **Reputation Contract Address (CA):** `mn_contract1reputation88midnightnetworkdevnet002`

---

## Architecture & Smart Contracts

1. **`escrow_contract/`**: Soroban Rust escrow contract implementation (`contracts/escrow_contract/src/lib.rs`).
2. **`reputation_contract/`**: Soroban Rust reputation scoring contract implementation (`contracts/reputation_contract/src/lib.rs`).
3. **`zyrex_escrow.compact`**: Core protocol contract supporting zero-knowledge job creation, private funding in `tDUST`, atomic payment releases with cross-contract reputation updates, and dispute safeguards.
4. **`reputation.compact`**: Zero-knowledge proof reputation recording contract tracking trust scores, completed gigs, and rating metrics.
5. **`escrow.compact`**: Modular timelocked vault release contract on Midnight.
6. **`midnight-bindings.ts`**: TypeScript SDK interfaces, contract addresses, and RPC/Indexer configuration for frontend integration.

## Key Features & ZK Privacy Layout

- **Private Client State:** Client public key identities and signatures can be shielded using Compact private witness functions (`witness get_private_client_key()`).
- **Verifiable Reputation:** Freelancer reputation is updated on-chain atomically when payment is released without revealing sensitive client parameters.
- **Proof Generation:** Midnight Proof Server generates local ZK proofs before submitting transactions to Midnight Testnet nodes.

## Compilation & Deployment

To compile the Compact contracts locally:

```bash
# Compile Compact smart contracts to Midnight bytecode & TypeScript bindings
npx @midnight-ntwrk/compactc contracts/zyrex_escrow.compact --output build/
```

To deploy to Midnight Testnet/Devnet:

```bash
powershell -ExecutionPolicy Bypass -File ./scripts/deploy-midnight.ps1
```
