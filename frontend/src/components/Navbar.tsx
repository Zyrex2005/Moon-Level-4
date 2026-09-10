import React, { useState } from "react";
import { WalletButton } from "./WalletButton";

export type NavTab = "marketplace" | "my-escrows" | "post-gig" | "freelancers" | "admin";

interface NavbarProps {
  address: string | null;
  isConnecting: boolean;
  isInstalled: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenOnboarding: () => void;
  ledgerSequence?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  address,
  isConnecting,
  isInstalled,
  error,
  connect,
  disconnect,
  activeTab,
  onSelectTab,
  onOpenOnboarding,
  ledgerSequence,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: string }[] = [
    { id: "marketplace", label: "Marketplace", icon: "🌐" },
    { id: "my-escrows", label: "My Escrows", icon: "💼" },
    { id: "post-gig", label: "Post Gig", icon: "➕" },
    { id: "freelancers", label: "Freelancers", icon: "⭐" },
    { id: "admin", label: "Analytics", icon: "📊" },
  ];

  return (
    <header className="border-b border-purple-900/40 bg-slate-950/85 backdrop-blur-2xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex justify-between items-center gap-4">
        {/* Brand & Network Status */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onSelectTab("marketplace")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black text-base shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:scale-105 transition">
              🌙
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white font-sans group-hover:text-purple-400 transition">
              Zyrex<span className="text-gradient-cyan">Escrow</span>
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 border border-purple-900/50 px-3 py-1 rounded-full text-[10px] font-semibold text-purple-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            <span>Midnight Testnet (Devnet)</span>
            {ledgerSequence ? (
              <span className="text-slate-500">#{ledgerSequence}</span>
            ) : null}
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Right Side Tools */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://midnight.network/"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full hover:bg-purple-500/20 transition flex items-center gap-1 font-mono"
            title="Get free Testnet tDUST"
          >
            <span>🚰</span> Midnight Faucet ↗
          </a>

          <button
            onClick={onOpenOnboarding}
            className="text-xs font-semibold text-slate-400 hover:text-purple-400 transition"
          >
            📖 Guide
          </button>

          <WalletButton
            address={address}
            isConnecting={isConnecting}
            isInstalled={isInstalled}
            error={error}
            connect={connect}
            disconnect={disconnect}
          />
        </div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-100 hover:text-purple-400 focus:outline-none text-xl"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left flex items-center gap-2 ${
                    isActive
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "bg-slate-900 text-slate-300"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-1">
            <button
              onClick={() => {
                onOpenOnboarding();
                setMobileMenuOpen(false);
              }}
              className="text-xs font-semibold text-slate-300 py-1.5"
            >
              📖 Midnight Guide
            </button>
            <a
              href="https://midnight.network/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full"
            >
              🚰 tDUST Faucet ↗
            </a>
          </div>

          <div className="pt-2">
            <WalletButton
              address={address}
              isConnecting={isConnecting}
              isInstalled={isInstalled}
              error={error}
              connect={connect}
              disconnect={disconnect}
            />
          </div>
        </div>
      )}
    </header>
  );
};
