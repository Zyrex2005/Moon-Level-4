import React, { useState } from "react";

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

export const DEFAULT_SAC_TOKEN = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"; // Stellar Testnet Native XLM SAC ID

interface GigTemplate {
  title: string;
  icon: string;
  description: string;
  suggestedAmount: string;
  daysToAdd: number;
}

const TEMPLATES: GigTemplate[] = [
  {
    title: "Smart Contract Audit",
    icon: "🛡️",
    description: "Conduct security audit, invariant testing, and gas optimization review for Soroban contracts.",
    suggestedAmount: "150",
    daysToAdd: 7,
  },
  {
    title: "DApp Frontend UI/UX",
    icon: "🎨",
    description: "Design & develop modern glassmorphic React/Vite interface with Freighter wallet integration.",
    suggestedAmount: "200",
    daysToAdd: 14,
  },
  {
    title: "Express API Relay",
    icon: "🔌",
    description: "Build Node.js serverless event caching relay for Soroban RPC telemetry & user feedback.",
    suggestedAmount: "100",
    daysToAdd: 5,
  },
  {
    title: "Full-Stack Web3 DApp",
    icon: "🚀",
    description: "End-to-end development: Rust Soroban contracts, Express relay server, and responsive React frontend.",
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
    token: DEFAULT_SAC_TOKEN,
    amount: "",
    description: "",
    deadlineDate: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Sync prefilled address if passed
  React.useEffect(() => {
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

  const isFreelancerValid =
    formData.freelancer.startsWith("G") && formData.freelancer.length === 56;

  const isTokenValid =
    formData.token.startsWith("C") && formData.token.length === 56;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate fields
    if (!isFreelancerValid) {
      setError("Please enter a valid Stellar freelancer public key (starting with G).");
      return;
    }
    if (!isTokenValid) {
      setError("Please enter a valid Stellar Asset Contract token ID (starting with C).");
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
        token: DEFAULT_SAC_TOKEN,
        amount: "",
        description: "",
        deadlineDate: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job.");
    }
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      noValidate
      className="glass-panel p-8 rounded-2xl flex flex-col gap-6 border border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
    >
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-black text-gradient-cyan">Post AstraTrust Escrow Gig</h3>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
            Lock funds securely in a non-custodial Soroban smart escrow contract
          </p>
        </div>
        <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full text-[10px] font-mono font-extrabold shadow-[0_0_12px_rgba(0,242,254,0.15)]">
          Soroban Escrow
        </span>
      </div>

      {error && (
        <div
          role="alert"
          className="bg-rose-500/15 border border-rose-500/30 p-3.5 rounded-xl text-xs text-rose-300 font-semibold"
        >
          ⚠️ {error}
        </div>
      )}

      {/* Quick Templates */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-300">
          ⚡ Quick Presets (Click to pre-fill):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {TEMPLATES.map((tpl) => (
            <button
              type="button"
              key={tpl.title}
              onClick={() => applyTemplate(tpl)}
              className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 p-3 rounded-xl text-left transition text-[10px] flex items-center gap-2.5 group"
            >
              <span className="text-xl">{tpl.icon}</span>
              <div>
                <span className="font-extrabold text-white group-hover:text-cyan-400 block text-xs">
                  {tpl.title}
                </span>
                <span className="text-slate-400 font-mono">
                  {tpl.suggestedAmount} XLM • {tpl.daysToAdd}d deadline
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Freelancer Input */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-300">
            Freelancer Stellar Wallet Address
          </label>
          {formData.freelancer && (
            <span
              className={`text-[10px] font-mono font-bold ${
                isFreelancerValid ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {isFreelancerValid ? "✓ Valid Stellar Key" : "⚠️ Invalid G... Key"}
            </span>
          )}
        </div>
        <input
          type="text"
          name="freelancer"
          value={formData.freelancer}
          onChange={handleChange}
          placeholder="e.g. GB44L2MS..."
          className="focus-ring bg-slate-900/90 border border-slate-800 px-4 py-3 rounded-xl text-xs font-mono text-white placeholder-slate-500"
          required
        />
      </div>

      {/* Token Input with Preset */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-300">
            Payment Token (SAC Contract ID)
          </label>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, token: DEFAULT_SAC_TOKEN }))}
            className="text-[10px] font-mono font-bold text-cyan-400 hover:underline"
          >
            Use Native XLM SAC ↗
          </button>
        </div>
        <input
          type="text"
          name="token"
          value={formData.token}
          onChange={handleChange}
          placeholder="e.g. CDLZFC..."
          className="focus-ring bg-slate-900/90 border border-slate-800 px-4 py-3 rounded-xl text-[10px] font-mono text-white placeholder-slate-500"
          required
        />
      </div>

      {/* Budget & Deadline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-300">Budget Amount (Tokens)</label>
          <input
            type="number"
            name="amount"
            step="any"
            value={formData.amount}
            onChange={handleChange}
            placeholder="e.g. 150"
            className="focus-ring bg-slate-900/90 border border-slate-800 px-4 py-3 rounded-xl text-xs font-mono text-white placeholder-slate-500"
            required
          />
          <div className="flex gap-1.5 mt-1">
            {["50", "100", "250", "500"].map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => applyAmount(amt)}
                className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition"
              >
                +{amt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-300">Completion Deadline</label>
          <input
            type="date"
            name="deadlineDate"
            value={formData.deadlineDate}
            onChange={handleChange}
            className="focus-ring bg-slate-900/90 border border-slate-800 px-4 py-3 rounded-xl text-xs text-white placeholder-slate-500"
            required
          />
          <div className="flex gap-1.5 mt-1">
            {[
              { label: "+3d", days: 3 },
              { label: "+7d", days: 7 },
              { label: "+14d", days: 14 },
              { label: "+30d", days: 30 },
            ].map((item) => (
              <button
                type="button"
                key={item.label}
                onClick={() => applyDeadlineDays(item.days)}
                className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-300">
          Deliverable Requirements & Specifications
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe deliverables, milestone specifications, and acceptance criteria..."
          rows={3}
          className="focus-ring bg-slate-900/90 border border-slate-800 px-4 py-3 rounded-xl text-xs text-white placeholder-slate-500 resize-none"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !walletConnected}
        className="focus-ring mt-3 bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 hover:from-cyan-300 hover:to-violet-400 text-slate-950 py-3.5 rounded-xl font-extrabold transition disabled:opacity-50 disabled:cursor-not-allowed text-xs shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_25px_rgba(0,242,254,0.5)]"
      >
        {isSubmitting
          ? "Broadcasting to Soroban RPC…"
          : walletConnected
          ? "🚀 Create Smart Escrow Listing"
          : "🔒 Connect Wallet to Create Gig"}
      </button>
    </form>
  );
}

