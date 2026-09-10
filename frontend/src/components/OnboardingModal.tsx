import React, { useState } from "react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isWalletInstalled: boolean;
  isConnected: boolean;
  onConnectWallet: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  isWalletInstalled,
  isConnected,
  onConnectWallet,
}) => {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="glass-panel border border-purple-900/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-6 relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold transition"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black text-base shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            {step}
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-gradient-cyan">
              {step === 1 && "Welcome to ZyrexEscrow on Midnight"}
              {step === 2 && "Connect Midnight Lace Wallet"}
              {step === 3 && "ZK Escrow & Reputation Engine"}
            </h2>
            <p className="text-xs text-slate-400 font-mono">Step {step} of 3 — Midnight Quick Start</p>
          </div>
        </div>

        {/* Step 1: Introduction */}
        {step === 1 && (
          <div className="flex flex-col gap-4 text-xs text-slate-300">
            <p className="leading-relaxed">
              <strong>ZyrexEscrow Protocol</strong> is a privacy-first Web3 freelance marketplace built on the <strong>Midnight Network</strong> (Cardano ecosystem / Input Output zero-knowledge smart contract blockchain). Funds are secured in <strong>Compact</strong> zero-knowledge escrow contracts with automated release and timelock protection.
            </p>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-purple-400 font-semibold">
                <span>✦</span> Zero-Knowledge Private Client & Amount Shielding
              </div>
              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                <span>✦</span> Compact Smart Contracts (`zyrex_escrow.compact`)
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span>✦</span> Verifiable On-Chain Freelancer Reputation Scores
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Wallet Setup & Network Check */}
        {step === 2 && (
          <div className="flex flex-col gap-4 text-xs text-slate-300">
            <p className="leading-relaxed">
              ZyrexEscrow Protocol connects to the <strong>Midnight Lace Wallet</strong> extension running on <strong>Midnight Devnet / Testnet</strong>.
            </p>

            {!isWalletInstalled ? (
              <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl text-xs text-purple-300 flex flex-col gap-2">
                <span className="font-bold">🌙 Midnight Lace Extension Guide</span>
                <span>Install Midnight Lace Wallet to generate zero-knowledge proofs and sign tDUST escrow transactions.</span>
                <a
                  href="https://midnight.network/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-center bg-purple-500 hover:bg-purple-400 text-white font-extrabold py-2 px-4 rounded-xl transition text-xs shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                >
                  Download Midnight Lace Wallet ↗
                </a>
              </div>
            ) : isConnected ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-xs text-emerald-400 font-semibold flex items-center gap-2">
                <span>✓</span> Midnight Lace Wallet Connected Successfully!
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={onConnectWallet}
                  className="w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 hover:from-purple-400 hover:to-cyan-300 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl transition text-xs shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                >
                  Connect Midnight Lace Wallet Now
                </button>
              </div>
            )}

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-[10px] font-mono">
              <span className="text-slate-400">Need free Testnet tDUST?</span>
              <a
                href="https://midnight.network/"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 font-bold hover:underline"
              >
                Midnight Testnet Faucet ↗
              </a>
            </div>
          </div>
        )}

        {/* Step 3: Mechanics Explainer */}
        {step === 3 && (
          <div className="flex flex-col gap-4 text-xs text-slate-300">
            <p className="leading-relaxed">
              When a job is completed, payment is released in <strong>tDUST</strong> and an <strong>atomic Compact circuit call</strong> updates the freelancer's trust score on Midnight Network zero-knowledge ledger.
            </p>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col gap-2 font-mono text-[10px]">
              <span className="text-purple-400">1. Client creates gig & locks tDUST in Compact Escrow</span>
              <span className="text-cyan-400">2. Freelancer submits deliverable proof on Midnight</span>
              <span className="text-emerald-400">3. Client releases payment + submits 1-5★ ZK rating</span>
              <span className="text-indigo-400">4. Escrow invokes reputation Compact contract atomically</span>
            </div>
          </div>
        )}

        {/* Modal Controls */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 transition"
          >
            ← Previous
          </button>

          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition ${
                  step === i ? "bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]" : "bg-slate-800"
                }`}
              />
            ))}
          </div>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => Math.min(3, s + 1))}
              className="bg-slate-900 hover:bg-slate-800 text-purple-400 px-4 py-1.5 rounded-xl text-xs font-bold transition border border-purple-500/30"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 text-slate-950 px-4 py-1.5 rounded-xl text-xs font-extrabold transition shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              Get Started 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
