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
      <div className="glass-panel border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-6 relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold transition"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-400 to-violet-600 flex items-center justify-center text-slate-950 font-black text-base shadow-[0_0_20px_rgba(0,242,254,0.4)]">
            {step}
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-gradient-cyan">
              {step === 1 && "Welcome to AstraTrust Protocol"}
              {step === 2 && "Connect Freighter Wallet"}
              {step === 3 && "How Escrow & Reputation Work"}
            </h2>
            <p className="text-xs text-slate-400 font-mono">Step {step} of 3 — Quick Setup Guide</p>
          </div>
        </div>

        {/* Step 1: Introduction */}
        {step === 1 && (
          <div className="flex flex-col gap-4 text-xs text-slate-300">
            <p className="leading-relaxed">
              <strong>AstraTrust Protocol</strong> is a next-generation decentralized freelance marketplace built on the Stellar Soroban smart contract platform. Funds are locked in non-custodial escrow contracts with automated timelock protection.
            </p>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span>✓</span> Non-Custodial Smart Contract Protection
              </div>
              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                <span>✓</span> Immutable On-Chain Freelancer Reputation Scores
              </div>
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <span>✓</span> Automated Timed Refunds & Dispute Safeguards
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Wallet Setup & Network Check */}
        {step === 2 && (
          <div className="flex flex-col gap-4 text-xs text-slate-300">
            <p className="leading-relaxed">
              AstraTrust Protocol connects to the <strong>Freighter Wallet</strong> browser extension on <strong>Stellar Testnet</strong>.
            </p>

            {!isWalletInstalled ? (
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-xs text-amber-300 flex flex-col gap-2">
                <span className="font-bold">⚠️ Freighter Extension Not Detected</span>
                <span>Install Freighter to sign transactions and create jobs on Stellar Testnet.</span>
                <a
                  href="https://www.freighter.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-center bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold py-2 px-4 rounded-xl transition text-xs shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                >
                  Download Freighter Extension ↗
                </a>
              </div>
            ) : isConnected ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-xs text-emerald-400 font-semibold flex items-center gap-2">
                <span>✓</span> Freighter Wallet Connected Successfully!
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={onConnectWallet}
                  className="w-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 hover:from-cyan-300 hover:to-violet-400 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl transition text-xs shadow-[0_0_20px_rgba(0,242,254,0.3)]"
                >
                  Connect Freighter Wallet Now
                </button>
              </div>
            )}

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-[10px] font-mono">
              <span className="text-slate-400">Need free Testnet XLM?</span>
              <a
                href="https://laboratory.stellar.org/#account-creator?network=testnet"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 font-bold hover:underline"
              >
                Stellar Friendbot Faucet ↗
              </a>
            </div>
          </div>
        )}

        {/* Step 3: Mechanics Explainer */}
        {step === 3 && (
          <div className="flex flex-col gap-4 text-xs text-slate-300">
            <p className="leading-relaxed">
              When a job is completed, payment is released and an <strong>atomic cross-contract invocation</strong> updates the freelancer's reputation score on-chain in the same transaction!
            </p>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col gap-2 font-mono text-[10px]">
              <span className="text-cyan-400">1. Client posts gig & locks tokens in Escrow</span>
              <span className="text-amber-400">2. Freelancer completes deliverable requirements</span>
              <span className="text-emerald-400">3. Client releases payment + submits 1-5★ rating</span>
              <span className="text-violet-400">4. Escrow invokes Reputation contract atomically</span>
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
                  step === i ? "bg-cyan-400 shadow-[0_0_10px_rgba(0,242,254,0.5)]" : "bg-slate-800"
                }`}
              />
            ))}
          </div>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => Math.min(3, s + 1))}
              className="bg-slate-900 hover:bg-slate-800 text-cyan-400 px-4 py-1.5 rounded-xl text-xs font-bold transition border border-cyan-500/30"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 text-slate-950 px-4 py-1.5 rounded-xl text-xs font-extrabold transition shadow-[0_0_15px_rgba(0,242,254,0.3)]"
            >
              Get Started 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

