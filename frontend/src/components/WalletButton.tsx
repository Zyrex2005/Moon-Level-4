import { useState } from "react";
import { useWallet } from "../hooks/useWallet";

function truncateAddress(addr: string) {
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

type WalletButtonProps = {
  address?: string | null;
  isConnecting?: boolean;
  isInstalled?: boolean | null;
  error?: string | null;
  connect?: () => Promise<void>;
  disconnect?: () => void;
};

export function WalletButton(props: WalletButtonProps) {
  const hookWallet = useWallet();
  const [copied, setCopied] = useState(false);

  const address = props.address !== undefined ? props.address : hookWallet.address;
  const isConnecting = props.isConnecting !== undefined ? props.isConnecting : hookWallet.isConnecting;
  const isInstalled = props.isInstalled !== undefined ? props.isInstalled : hookWallet.isInstalled;
  const error = props.error !== undefined ? props.error : hookWallet.error;
  const connect = props.connect !== undefined ? props.connect : hookWallet.connect;
  const disconnect = props.disconnect !== undefined ? props.disconnect : hookWallet.disconnect;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isInstalled === false) {
    return (
      <a
        href="https://midnight.network/"
        target="_blank"
        rel="noreferrer"
        className="focus-ring border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-xs rounded-xl font-bold text-purple-300 transition hover:bg-purple-500/20"
      >
        🌙 Install Midnight Lace Wallet
      </a>
    );
  }

  if (address) {
    return (
      <div className="flex items-center gap-2 bg-slate-900/90 border border-purple-500/40 px-3.5 py-1.5 rounded-xl font-mono text-xs text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
        <button
          onClick={handleCopy}
          className="hover:underline font-bold"
          title="Click to copy Midnight address"
        >
          {copied ? "Copied! ✓" : truncateAddress(address)}
        </button>
        <button
          onClick={disconnect}
          className="ml-1 text-slate-400 hover:text-rose-400 text-xs font-sans transition"
          title="Disconnect wallet"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={connect}
        disabled={isConnecting}
        className="focus-ring bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 hover:from-purple-400 hover:to-cyan-300 px-5 py-2 text-xs rounded-xl font-extrabold text-slate-950 transition disabled:cursor-wait disabled:opacity-60 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]"
      >
        {isConnecting ? "Connecting Midnight Wallet…" : "Connect Lace Wallet"}
      </button>
      {error && (
        <p className="max-w-[250px] text-right text-[10px] text-rose-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
