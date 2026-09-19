import { useState } from "react";
import { ReputationBadge } from "./ReputationBadge";

export type JobItem = {
  id: number;
  client: string;
  freelancer: string;
  token: string;
  amount: string;
  description: string;
  deadline: number; // Unix timestamp in seconds
  status: "Created" | "Funded" | "Completed" | "Refunded";
  rated: boolean;
};

type JobListProps = {
  jobs: JobItem[];
  walletAddress: string | null;
  onFund: (jobId: number) => Promise<void>;
  onComplete: (jobId: number) => Promise<void>;
  onRefund: (jobId: number) => Promise<void>;
  onRate: (jobId: number, score: number) => Promise<void>;
  activeActionJobId: number | null;
  filterMode?: "all" | "client" | "freelancer";
};

export function JobList({
  jobs,
  walletAddress,
  onFund,
  onComplete,
  onRefund,
  onRate,
  activeActionJobId,
  filterMode = "all",
}: JobListProps) {
  const [ratingScores, setRatingScores] = useState<{ [jobId: number]: number }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"newest" | "budget" | "deadline">("newest");

  const handleScoreChange = (jobId: number, score: number) => {
    setRatingScores((prev) => ({ ...prev, [jobId]: score }));
  };

  // 1. Role Filtering
  let displayedJobs = jobs;
  if (filterMode === "client" && walletAddress) {
    displayedJobs = jobs.filter(
      (j) => j.client.toLowerCase() === walletAddress.toLowerCase()
    );
  } else if (filterMode === "freelancer" && walletAddress) {
    displayedJobs = jobs.filter(
      (j) => j.freelancer.toLowerCase() === walletAddress.toLowerCase()
    );
  }

  // 2. Status Filtering
  if (statusFilter !== "All") {
    displayedJobs = displayedJobs.filter((j) => {
      if (statusFilter === "Funded") return j.status === "Funded";
      if (statusFilter === "Created") return j.status === "Created";
      if (statusFilter === "Completed") return j.status === "Completed";
      if (statusFilter === "Refunded") return j.status === "Refunded";
      return true;
    });
  }

  // 3. Search Query Filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayedJobs = displayedJobs.filter(
      (j) =>
        j.description.toLowerCase().includes(q) ||
        j.client.toLowerCase().includes(q) ||
        j.freelancer.toLowerCase().includes(q) ||
        j.id.toString().includes(q)
    );
  }

  // 4. Sorting
  displayedJobs = [...displayedJobs].sort((a, b) => {
    if (sortBy === "budget") {
      return parseFloat(b.amount) - parseFloat(a.amount);
    }
    if (sortBy === "deadline") {
      return a.deadline - b.deadline;
    }
    return b.id - a.id; // Newest first
  });

  const nowSec = Math.floor(Date.now() / 1000);

  return (
    <div className="flex flex-col gap-5">
      {/* Search, Filter & Sort Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-3 border border-slate-800 shadow-md">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search gigs by title, address or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="focus-ring bg-slate-900/90 border border-slate-800 px-4 py-2.5 pl-9 rounded-xl text-xs text-white placeholder-slate-500 w-full"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center bg-slate-950/90 border border-slate-800 p-1 rounded-xl text-[11px] font-mono">
            {["All", "Funded", "Created", "Completed", "Refunded"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  statusFilter === st
                    ? "bg-gradient-to-r from-cyan-500/25 to-violet-500/25 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,254,0.15)]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-slate-950/90 border border-slate-800 text-slate-300 text-[11px] rounded-xl px-3 py-2.5 font-mono focus:outline-none"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="budget">Sort: Highest Budget</option>
            <option value="deadline">Sort: Soonest Deadline</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {displayedJobs.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center text-slate-400 space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl mx-auto text-slate-500">
            🔍
          </div>
          <p className="font-bold text-base text-slate-200">No escrow listings found matching criteria.</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {filterMode === "client"
              ? "You haven't posted any escrow gigs with this connected wallet yet."
              : filterMode === "freelancer"
              ? "No active escrow gigs have been assigned to your freelancer address yet."
              : "Try adjusting your search query or status filter above."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {displayedJobs.map((job) => {
            const isClient =
              walletAddress && walletAddress.toLowerCase() === job.client.toLowerCase();
            const isFreelancer =
              walletAddress && walletAddress.toLowerCase() === job.freelancer.toLowerCase();
            const isDeadlinePassed = nowSec >= job.deadline;
            const isBusy = activeActionJobId === job.id;
            const selectedScore = ratingScores[job.id] ?? 5;

            // Compute remaining time string
            let timeRemainingText = "";
            if (job.status === "Funded") {
              if (isDeadlinePassed) {
                timeRemainingText = "⚠️ Deadline Expired (Refund Eligible)";
              } else {
                const diffSec = job.deadline - nowSec;
                const days = Math.floor(diffSec / 86400);
                const hours = Math.floor((diffSec % 86400) / 3600);
                timeRemainingText = `⏱️ ${days}d ${hours}h remaining`;
              }
            }

            // Status Badges
            let statusBadge = (
              <span className="bg-slate-800/80 text-slate-400 border border-slate-700/80 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono">
                Draft / Pending Fund
              </span>
            );
            if (job.status === "Funded") {
              statusBadge = (
                <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono shadow-[0_0_15px_rgba(0,242,254,0.2)]">
                  Active Escrow Locked
                </span>
              );
            } else if (job.status === "Completed") {
              statusBadge = (
                <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                  Settled / Completed
                </span>
              );
            } else if (job.status === "Refunded") {
              statusBadge = (
                <span className="bg-rose-500/15 text-rose-300 border border-rose-500/40 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono">
                  Refunded to Buyer
                </span>
              );
            }

            return (
              <div
                key={job.id}
                className="glass-panel-interactive p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden"
              >
                {/* Card Top Row */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-black text-white font-sans">
                        Gig #{job.id}
                      </h4>
                      {statusBadge}
                      {job.rated && (
                        <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono">
                          ⭐ Rated
                        </span>
                      )}
                      {isClient && (
                        <span className="bg-violet-500/15 text-violet-300 border border-violet-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono">
                          You (Buyer)
                        </span>
                      )}
                      {isFreelancer && (
                        <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono">
                          You (Freelancer)
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      Freelancer: <span className="text-slate-200 font-semibold">{job.freelancer.slice(0, 8)}…{job.freelancer.slice(-6)}</span>
                    </div>
                  </div>

                  <div className="text-right bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-2xl shadow-inner">
                    <span className="text-2xl font-black text-gradient-cyan font-mono">
                      {job.amount}
                    </span>
                    <span className="text-[10px] text-purple-300 font-mono block font-bold">tDUST Tokens</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-200 bg-slate-950/70 p-4 rounded-xl border border-slate-800/90 font-sans leading-relaxed">
                  {job.description}
                </p>

                {/* Details Footer */}
                <div className="flex flex-wrap justify-between items-center gap-3 text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-3.5">
                  <div className="flex flex-col gap-1">
                    <span>Buyer Client: <strong className="text-slate-300">{job.client.slice(0, 6)}…{job.client.slice(-4)}</strong></span>
                    <span>Deadline: <strong className="text-slate-300">{new Date(job.deadline * 1000).toLocaleString()}</strong></span>
                    {timeRemainingText && (
                      <span className={isDeadlinePassed ? "text-amber-300 font-extrabold" : "text-cyan-300 font-bold"}>
                        {timeRemainingText}
                      </span>
                    )}
                  </div>
                  <div>
                    <ReputationBadge freelancerAddress={job.freelancer} />
                  </div>
                </div>

                {/* Contextual Action Buttons */}
                <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-800/80">
                  {job.status === "Created" && isClient && (
                    <button
                      onClick={() => onFund(job.id)}
                      disabled={isBusy}
                      className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 hover:from-cyan-300 hover:to-violet-400 text-slate-950 px-5 py-2.5 text-xs rounded-xl font-black transition disabled:opacity-50 shadow-[0_0_20px_rgba(0,242,254,0.35)] transform hover:-translate-y-0.5"
                    >
                      {isBusy ? "Funding gig…" : "⚡ Fund & Activate Escrow"}
                    </button>
                  )}

                  {job.status === "Funded" && isClient && (
                    <button
                      onClick={() => onComplete(job.id)}
                      disabled={isBusy}
                      className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-5 py-2.5 text-xs rounded-xl font-black transition disabled:opacity-50 shadow-[0_0_18px_rgba(52,211,153,0.35)] transform hover:-translate-y-0.5"
                    >
                      {isBusy ? "Releasing funds…" : "✓ Complete & Release Payment"}
                    </button>
                  )}

                  {job.status === "Funded" && isDeadlinePassed && (
                    <button
                      onClick={() => onRefund(job.id)}
                      disabled={isBusy}
                      className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-5 py-2.5 text-xs rounded-xl font-extrabold hover:bg-rose-500/30 transition disabled:opacity-50"
                    >
                      {isBusy ? "Processing refund…" : " Claim Timed Refund"}
                    </button>
                  )}

                  {job.status === "Completed" && !job.rated && isClient && (
                    <div className="flex items-center gap-2 bg-slate-950 border border-amber-500/40 p-2.5 rounded-xl shadow-lg">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] text-amber-300 font-extrabold uppercase font-mono">Rate Freelancer:</label>
                        <select
                          value={selectedScore}
                          onChange={(e) => handleScoreChange(job.id, Number(e.target.value))}
                          className="bg-slate-900 border border-slate-800 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none font-mono"
                        >
                          <option value={5}>5 Stars ★★★★★</option>
                          <option value={4}>4 Stars ★★★★</option>
                          <option value={3}>3 Stars ★★★</option>
                          <option value={2}>2 Stars ★★</option>
                          <option value={1}>1 Star ★</option>
                        </select>
                      </div>
                      <button
                        onClick={() => onRate(job.id, selectedScore)}
                        disabled={isBusy}
                        className="bg-amber-400 text-slate-950 px-4 py-1.5 text-xs rounded-lg font-black hover:bg-amber-300 transition disabled:opacity-50 shadow-[0_0_15px_rgba(251,191,36,0.35)]"
                      >
                        {isBusy ? "Submitting…" : "★ Submit Rating"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
