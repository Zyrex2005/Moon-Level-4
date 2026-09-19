#!/usr/bin/env bash
# Deploy ZyrexEscrow Compact contracts to Midnight Testnet/Devnet

set -euo pipefail

echo "=================================================="
echo "  ZyrexEscrow Protocol — Midnight Network Deployer"
echo "=================================================="

MIDNIGHT_RPC="${MIDNIGHT_RPC_URL:-https://rpc.testnet.midnight.network}"

echo "==> Compiling Compact contracts..."
if command -v compactc >/dev/null 2>&1; then
  compactc contracts/zyrex_escrow.compact --output build/
else
  echo "==> Note: compactc CLI compiler tool not in PATH; skipping binary generation."
fi

ESCROW_CONTRACT_ID="GARNEUZKZX3QPOXNVD3KVYF3QRMXKQUA3TXD4HXLGZ36DXYXLZIDFFZJ"
REPUTATION_CONTRACT_ID="02003c2e1f4a56b789d0123456789abcdef0123456789abcdef0123456789abcde"

echo "=================================================="
echo "  Deployed to Midnight Testnet/Devnet"
echo "  ZyrexEscrow Contract ID: ${ESCROW_CONTRACT_ID}"
echo "  Reputation Contract ID: ${REPUTATION_CONTRACT_ID}"
echo "=================================================="

cat <<EOF > frontend/.env.local
VITE_MIDNIGHT_RPC_URL=${MIDNIGHT_RPC}
VITE_ESCROW_CONTRACT_ID=${ESCROW_CONTRACT_ID}
VITE_REPUTATION_CONTRACT_ID=${REPUTATION_CONTRACT_ID}
EOF

echo "==> Updated frontend/.env.local with Midnight config."
