import React, { useState } from "react";
import { ESCROW_CONTRACT_ID, REPUTATION_CONTRACT_ID, MIDNIGHT_EXPLORER_URL } from "../lib/midnight";

export const ContractInfoCard: React.FC = () => {
  const [copiedEscrow, setCopiedEscrow] = useState(false);
  const [copiedReputation, setCopiedReputation] = useState(false);

  const copyToClipboard = (text: string, type: "escrow" | "reputation") => {
    navigator.clipboard.writeText(text);
    if (type === "escrow") {
      setCopiedEscrow(true);
      setTimeout(() => setCopiedEscrow(false), 2500);
    } else {
      setCopiedReputation(true);
      setTimeout(() => setCopiedReputation(false), 2500);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-[#0c0a1d]/90 via-[#070b1a]/95 to-[#040612]/95 shadow-[0_10px_35px_rgba(0,0,0,0.6)] relative overflow-hidden my-2">
      {/* Background Decorative Glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
        {/* Left Side: Title & Badges */}
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono shadow-[0_0_12px_rgba(52,211,153,0.2)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Midnight Testnet Live
            </span>
            <span className="bg-purple-500/15 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono shadow-[0_0_12px_rgba(168,85,247,0.2)]">
              ⚡ Compact ZK Smart Contract
            </span>
            <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono">
              🛡️ Non-Custodial Escrow
            </span>
          </div>

          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            🔏 Smart Contract Address (CA) & Explorer Details
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            ZyrexEscrow protocol smart contracts are compiled with Midnight&apos;s Compact language. Verify on-chain state, balances, and atomic cross-contract calls using the verified address below.
          </p>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <a
            href={MIDNIGHT_EXPLORER_URL}
            target="_blank"
            rel="noreferrer"
            className="flex-1 lg:flex-none text-center bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-[0_0_20px_rgba(0,242,254,0.3)] transition transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5"
          >
            <span>🔍 View on Explorer</span>
            <span className="text-[10px]">↗</span>
          </a>

          <a
            href="https://docs.midnight.network"
            target="_blank"
            rel="noreferrer"
            className="flex-1 lg:flex-none text-center bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
          >
            <span>📖 Midnight Docs</span>
            <span className="text-[10px]">↗</span>
          </a>

          <a
            href="https://midnight.network"
            target="_blank"
            rel="noreferrer"
            className="flex-1 lg:flex-none text-center bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/40 font-extrabold px-4 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 font-mono shadow-[0_0_12px_rgba(168,85,247,0.15)]"
          >
            <span>🚰 tDUST Faucet</span>
            <span className="text-[10px]">↗</span>
          </a>
        </div>
      </div>

      {/* Contract Addresses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-800/80">
        {/* Escrow CA Card */}
        <div className="bg-slate-950/80 border border-slate-800/90 p-4 rounded-xl flex flex-col gap-2 hover:border-cyan-500/40 transition">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>💎</span> ZyrexEscrow Compact Contract ID
            </span>
            <button
              onClick={() => copyToClipboard(ESCROW_CONTRACT_ID, "escrow")}
              className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1 ${
                copiedEscrow
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                  : "bg-slate-900 text-slate-300 border border-slate-700 hover:text-white hover:border-cyan-400"
              }`}
            >
              {copiedEscrow ? "✓ Copied CA!" : "📋 Copy CA"}
            </button>
          </div>
          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/90 font-mono text-[11px] text-slate-200 break-all select-all flex items-center justify-between gap-2">
            <span className="truncate">{ESCROW_CONTRACT_ID}</span>
            <a
              href={`${MIDNIGHT_EXPLORER_URL}`}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-300 text-xs flex-shrink-0"
              title="Inspect on Midnight Explorer"
            >
              ↗
            </a>
          </div>
        </div>

        {/* Reputation CA Card */}
        <div className="bg-slate-950/80 border border-slate-800/90 p-4 rounded-xl flex flex-col gap-2 hover:border-purple-500/40 transition">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>⭐</span> Atomic Reputation Compact Contract ID
            </span>
            <button
              onClick={() => copyToClipboard(REPUTATION_CONTRACT_ID, "reputation")}
              className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1 ${
                copiedReputation
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                  : "bg-slate-900 text-slate-300 border border-slate-700 hover:text-white hover:border-purple-400"
              }`}
            >
              {copiedReputation ? "✓ Copied CA!" : "📋 Copy CA"}
            </button>
          </div>
          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/90 font-mono text-[11px] text-slate-200 break-all select-all flex items-center justify-between gap-2">
            <span className="truncate">{REPUTATION_CONTRACT_ID}</span>
            <a
              href={`${MIDNIGHT_EXPLORER_URL}`}
              target="_blank"
              rel="noreferrer"
              className="text-purple-400 hover:text-purple-300 text-xs flex-shrink-0"
              title="Inspect on Midnight Explorer"
            >
              ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
