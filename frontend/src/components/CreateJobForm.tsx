import React, { useState, useEffect } from "react";

export type JobFormData = {
  freelancer: string;
  token: string;
  amount: string;
  description: string;
  deadlineDate: string;
};

type CreateJobFormProps = {
  onSubmit: (data: JobFormData) => Promise<void>;
  isSubmitting: boolean;
  walletConnected: boolean;
  prefilledFreelancer?: string;
};

export const DEFAULT_MIDNIGHT_TOKEN = "mn_token1tdust99midnightnetworkdevnet001"; // Midnight Testnet tDUST Token ID

interface GigTemplate {
  title: string;
  icon: string;
  description: string;
  suggestedAmount: string;
  daysToAdd: number;
}

const TEMPLATES: GigTemplate[] = [
  {
    title: "Compact Smart Contract Audit",
    icon: "🛡️",
    description: "Conduct security audit, ZK proof verification, and circuit gas review for Midnight Compact contracts.",
    suggestedAmount: "150",
    daysToAdd: 7,
  },
  {
    title: "Midnight DApp Frontend UI/UX",
    icon: "🎨",
    description: "Design & develop modern glassmorphic React interface with Midnight Lace wallet integration.",
    suggestedAmount: "200",
    daysToAdd: 14,
  },
  {
    title: "Midnight Indexer API Relay",
    icon: "🔌",
    description: "Build Node.js serverless event caching relay for Midnight Network RPC & Indexer telemetry.",
    suggestedAmount: "100",
    daysToAdd: 5,
  },
  {
    title: "Full-Stack Midnight ZK DApp",
    icon: "🚀",
    description: "End-to-end development: Compact smart contracts, Midnight relay server, and responsive React frontend.",
    suggestedAmount: "500",
    daysToAdd: 30,
  },
];

export function CreateJobForm({
  onSubmit,
  isSubmitting,
  walletConnected,
  prefilledFreelancer = "",
}: CreateJobFormProps) {
  const [formData, setFormData] = useState<JobFormData>({
    freelancer: prefilledFreelancer,
    token: DEFAULT_MIDNIGHT_TOKEN,
    amount: "",
    description: "",
    deadlineDate: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Sync prefilled address if passed
  useEffect(() => {
    if (prefilledFreelancer) {
      setFormData((prev) => ({ ...prev, freelancer: prefilledFreelancer }));
    }
  }, [prefilledFreelancer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const applyTemplate = (tpl: GigTemplate) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + tpl.daysToAdd);
    const dateStr = futureDate.toISOString().split("T")[0];

    setFormData((prev) => ({
      ...prev,
      description: tpl.description,
      amount: tpl.suggestedAmount,
      deadlineDate: dateStr,
    }));
  };

  const applyDeadlineDays = (days: number) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const dateStr = futureDate.toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, deadlineDate: dateStr }));
  };

  const applyAmount = (amt: string) => {
    setFormData((prev) => ({ ...prev, amount: amt }));
  };

  const isFreelancerValid = formData.freelancer.length >= 8;
  const isTokenValid = formData.token.length >= 8;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate fields
    if (!isFreelancerValid) {
      setError("Please enter a valid Midnight freelancer public key or address.");
      return;
    }
    if (!isTokenValid) {
      setError("Please enter a valid Midnight token ID.");
      return;
    }
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      setError("Please enter a valid budget amount greater than 0.");
      return;
    }
    if (!formData.description.trim()) {
      setError("Please enter a description for the job.");
      return;
    }
    if (!formData.deadlineDate) {
      setError("Please select a valid job completion deadline date.");
      return;
    }
    const selectedTime = new Date(formData.deadlineDate).getTime();
    if (selectedTime <= Date.now()) {
      setError("Deadline must be in the future.");
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        freelancer: "",
        token: DEFAULT_MIDNIGHT_TOKEN,
        amount: "",
        description: "",
        deadlineDate: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Template Quick Selection */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-purple-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <span>⚡</span> Quick-Start Gig Templates
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Click to prefill details</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="text-left p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/40 transition duration-200 group flex items-start gap-3 shadow-sm hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]"
            >
              <span className="text-2xl p-2 rounded-xl bg-slate-950 border border-slate-800 group-hover:scale-110 transition">{tpl.icon}</span>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-purple-300 transition">
                  {tpl.title}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {tpl.description}
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono text-cyan-300">
                  <span className="font-bold">{tpl.suggestedAmount} tDUST</span>
                  <span>•</span>
                  <span>{tpl.daysToAdd} days</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form
        onSubmit={handleFormSubmit}
        className="glass-panel p-6 sm:p-8 rounded-2xl border border-purple-900/50 space-y-6 shadow-2xl relative text-white"
      >
        <div className="border-b border-slate-800/90 pb-4">
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>✨</span> Post ZyrexEscrow Gig on Midnight
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Lock tDUST in a Midnight Compact zero-knowledge escrow contract. Payments and atomic reputation updates are executed upon completion.
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-xs text-rose-300 font-semibold flex items-center gap-2 animate-fade-in">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-5">
          {/* Freelancer Address */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono">
              Freelancer Midnight Address <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="freelancer"
              value={formData.freelancer}
              onChange={handleChange}
              placeholder="mn_test1q8zyrex88midnightnetworkescrow9901"
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus-ring font-mono"
            />
          </div>

          {/* Token ID */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono">
              Escrow Token ID (Midnight Network) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="token"
              value={formData.token}
              onChange={handleChange}
              placeholder={DEFAULT_MIDNIGHT_TOKEN}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 placeholder-slate-600 focus-ring font-mono"
            />
          </div>

          {/* Budget & Presets */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-300 font-mono">
                Budget (tDUST Tokens) <span className="text-rose-400">*</span>
              </label>
              <div className="flex gap-1.5">
                {["50", "100", "250", "500"].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => applyAmount(amt)}
                    className="text-[10px] font-mono bg-slate-900 hover:bg-slate-800 text-purple-300 px-2.5 py-1 rounded-lg border border-slate-800 transition font-bold"
                  >
                    {amt} tDUST
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              step="any"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="e.g. 150"
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus-ring font-mono"
            />
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono">
              Deliverable Specifications <span className="text-rose-400">*</span>
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detail work scope, deliverables, github repo links, or acceptance criteria..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus-ring font-sans leading-relaxed"
            />
          </div>

          {/* Deadline Date */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-300 font-mono">
                Completion Deadline Date <span className="text-rose-400">*</span>
              </label>
              <div className="flex gap-1.5">
                {[7, 14, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => applyDeadlineDays(days)}
                    className="text-[10px] font-mono bg-slate-900 hover:bg-slate-800 text-cyan-300 px-2.5 py-1 rounded-lg border border-slate-800 transition font-bold"
                  >
                    +{days}d
                  </button>
                ))}
              </div>
            </div>
            <input
              type="date"
              name="deadlineDate"
              value={formData.deadlineDate}
              onChange={handleChange}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus-ring font-mono"
            />
          </div>
        </div>

        {/* Live Card Preview Box */}
        {formData.description && (
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-purple-500/30 space-y-2">
            <span className="text-[10px] font-mono uppercase text-purple-400 font-extrabold tracking-wider block">
              ✦ Live Gig Card Preview
            </span>
            <div className="text-xs font-bold text-white">
              {formData.description}
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
              <span>Budget: <strong className="text-cyan-300">{formData.amount || "0"} tDUST</strong></span>
              <span>Deadline: <strong className="text-purple-300">{formData.deadlineDate || "Not set"}</strong></span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !walletConnected}
            className="w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 hover:from-purple-400 hover:to-cyan-300 text-slate-950 font-black py-3.5 px-6 rounded-2xl transition text-xs shadow-[0_0_25px_rgba(168,85,247,0.35)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          >
            {isSubmitting
              ? "Submitting Compact Circuit Transaction..."
              : walletConnected
              ? "Post Gig & Lock Escrow Funds in Compact Contract 🚀"
              : "Connect Midnight Lace Wallet to Post Gig"}
          </button>
        </div>
      </form>
    </div>
  );
}
