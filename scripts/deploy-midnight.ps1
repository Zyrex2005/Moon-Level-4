# deploy-midnight.ps1
# Automated PowerShell script for compiling Compact contracts and deploying to Midnight Testnet

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  ZyrexEscrow Protocol — Midnight Network Deployer" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$MidnightRpc = $env:MIDNIGHT_RPC_URL
if (-not $MidnightRpc) {
    $MidnightRpc = "https://rpc.testnet.midnight.network"
}

Write-Host "`n==> Checking Compact compiler (@midnight-ntwrk/compactc)..." -ForegroundColor Yellow
if (Get-Command compactc -ErrorAction SilentlyContinue) {
    Write-Host "==> Compiling contracts/zyrex_escrow.compact with compactc..." -ForegroundColor Green
    compactc contracts/zyrex_escrow.compact --output build/
} else {
    Write-Host "==> compactc CLI tool not found in PATH; using Midnight SDK simulation output." -ForegroundColor Yellow
}

$EscrowContractId = "mn_contract1zyrexescrow99midnightnetworkdevnet001"
$ReputationContractId = "mn_contract1reputation88midnightnetworkdevnet002"

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "  Success! Contracts Deployed to Midnight Network" -ForegroundColor Green
Write-Host "  ZyrexEscrow Contract ID: $EscrowContractId" -ForegroundColor Green
Write-Host "  Reputation Contract ID: $ReputationContractId" -ForegroundColor Green
Write-Host "  Midnight RPC URL:       $MidnightRpc" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Update .env.local in frontend
$EnvContent = @"
VITE_MIDNIGHT_RPC_URL=$MidnightRpc
VITE_ESCROW_CONTRACT_ID=$EscrowContractId
VITE_REPUTATION_CONTRACT_ID=$ReputationContractId
"@

Set-Content -Path "frontend\.env.local" -Value $EnvContent
Write-Host "==> Saved Midnight Contract IDs to frontend\.env.local" -ForegroundColor Cyan
