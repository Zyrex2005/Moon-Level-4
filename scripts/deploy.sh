#!/usr/bin/env bash
# Deploy the Reputation + Escrow contracts to Stellar Testnet using stellar-cli.
#
# Prerequisites:
#   1. Install the CLI:  cargo install --locked stellar-cli
#   2. Create/fund an identity: stellar keys generate deployer --network testnet --fund
#
# Usage:
#   ./scripts/deploy.sh

set -euo pipefail

NETWORK="${STELLAR_NETWORK:-testnet}"
SOURCE_ACCOUNT="${SOURCE_ACCOUNT:-deployer}"

# Ensure deployer key exists if running in automated CI environments
if ! stellar keys address "$SOURCE_ACCOUNT" >/dev/null 2>&1; then
  echo "==> Deployer account '$SOURCE_ACCOUNT' not found. Generating identity on $NETWORK..." >&2
  stellar keys generate "$SOURCE_ACCOUNT" --network "$NETWORK" >/dev/null 2>&1 || true
fi

PUBLIC_KEY=$(stellar keys address "$SOURCE_ACCOUNT")
echo "==> Deployer Account: $SOURCE_ACCOUNT ($PUBLIC_KEY)" >&2

# Fund and wait for account activation on Stellar Testnet
echo "==> Checking testnet account activation for $PUBLIC_KEY..." >&2
IS_ACTIVE=false
for i in {1..12}; do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://horizon-testnet.stellar.org/accounts/$PUBLIC_KEY" || true)
  if [ "$HTTP_STATUS" = "200" ]; then
    echo "==> Account $PUBLIC_KEY is ACTIVE on Stellar Testnet." >&2
    IS_ACTIVE=true
    break
  fi
  echo "==> Account not active yet (HTTP $HTTP_STATUS). Requesting funds via Friendbot (attempt $i/12)..." >&2
  curl -s "https://friendbot.stellar.org?addr=$PUBLIC_KEY" >/dev/null 2>&1 || true
  sleep 5
done

if [ "$IS_ACTIVE" = "false" ]; then
  echo "==> Warning: Account activation check timed out. Proceeding with deployment..." >&2
fi

echo "==> Building contracts to WASM using Stellar CLI..." >&2
rustup target add wasm32v1-none || true
stellar contract build

REPUTATION_WASM="target/wasm32v1-none/release/reputation_contract.wasm"
ESCROW_WASM="target/wasm32v1-none/release/escrow_contract.wasm"

if [ ! -f "$REPUTATION_WASM" ]; then
  REPUTATION_WASM=$(find target -name "reputation_contract.wasm" | head -n 1)
fi

if [ ! -f "$ESCROW_WASM" ]; then
  ESCROW_WASM=$(find target -name "escrow_contract.wasm" | head -n 1)
fi

run_with_retry() {
  local retries=5
  local count=0
  local delay=8
  until "$@"; do
    exit_code=$?
    count=$((count + 1))
    if [ $count -ge $retries ]; then
      echo "==> Command failed after $count attempts with code $exit_code." >&2
      return $exit_code
    fi
    echo "==> RPC network operation glitch (attempt $count/$retries). Retrying in ${delay}s..." >&2
    sleep $delay
    delay=$((delay * 2))
  done
}

echo "==> Deploying Reputation contract..." >&2
REPUTATION_RAW=$(run_with_retry stellar contract deploy \
  --wasm "$REPUTATION_WASM" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK")

REPUTATION_ID=$(echo "$REPUTATION_RAW" | grep -E '^C[A-Z0-9]{55}$' | tail -n 1)
if [ -z "$REPUTATION_ID" ]; then
  REPUTATION_ID=$(echo "$REPUTATION_RAW" | tail -n 1)
fi
echo "Reputation contract ID: $REPUTATION_ID" >&2
sleep 6

echo "==> Deploying Escrow contract..." >&2
ESCROW_RAW=$(run_with_retry stellar contract deploy \
  --wasm "$ESCROW_WASM" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK")

ESCROW_ID=$(echo "$ESCROW_RAW" | grep -E '^C[A-Z0-9]{55}$' | tail -n 1)
if [ -z "$ESCROW_ID" ]; then
  ESCROW_ID=$(echo "$ESCROW_RAW" | tail -n 1)
fi
echo "Escrow contract ID: $ESCROW_ID" >&2
sleep 6

echo "==> Initializing Reputation contract (authorized_caller = Escrow contract)..." >&2
run_with_retry stellar contract invoke \
  --id "$REPUTATION_ID" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  -- initialize \
  --admin "$PUBLIC_KEY" \
  --authorized_caller "$ESCROW_ID"
sleep 6

echo "==> Initializing Escrow contract (reputation_contract = Reputation contract)..." >&2
run_with_retry stellar contract invoke \
  --id "$ESCROW_ID" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  -- initialize \
  --admin "$PUBLIC_KEY" \
  --reputation_contract "$REPUTATION_ID"

echo ""
echo "=================================================="
echo "Deployment complete."
echo "Reputation contract: $REPUTATION_ID"
echo "Escrow contract:     $ESCROW_ID"
echo "Admin / deployer:    $PUBLIC_KEY"
echo "=================================================="

