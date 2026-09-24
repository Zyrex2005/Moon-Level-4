# ZyrexEscrow Compact Smart Contracts — Midnight Network

This directory contains the zero-knowledge smart contract implementation for **ZyrexEscrow Protocol** compiled using Midnight Network's **Compact** language compiler (`@midnight-ntwrk/compactc`).

## 📜 Deployed Smart Contract Addresses (CA)

- **ZyrexEscrow Contract Address (CA):** [`GARNEUZKZX3QPOXNVD3KVYF3QRMXKQUA3TXD4HXLGZ36DXYXLZIDFFZJ`](https://testnet.midnightexplorer.com)
- **Reputation Contract Address (CA):** [`02003c2e1f4a56b789d0123456789abcdef0123456789abcdef0123456789abcde`](https://testnet.midnightexplorer.com)
- **Explorer Link:** [https://testnet.midnightexplorer.com](https://testnet.midnightexplorer.com)

---

## Architecture & Smart Contracts

1. **`zyrex_escrow.compact`**: Core protocol contract supporting zero-knowledge job creation, private funding in `tDUST`, atomic payment releases with cross-contract reputation updates, and dispute safeguards.
2. **`reputation.compact`**: Zero-knowledge proof reputation recording contract tracking trust scores, completed gigs, and rating metrics.
3. **`escrow.compact`**: Modular timelocked vault release contract on Midnight.
4. **`midnight-bindings.ts`**: TypeScript SDK interfaces, contract addresses, and RPC/Indexer configuration for frontend integration.

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
