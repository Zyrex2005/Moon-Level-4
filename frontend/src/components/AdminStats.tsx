import React, { useEffect, useState } from "react";
import type { JobItem } from "./JobList";

interface AdminStatsProps {
  jobs: JobItem[];
  apiBaseUrl?: string;
}

interface FeedbackEntry {
  id: string;
  rating: number;
  comment: string;
  address: string;
  timestamp: string;
}

export const AdminStats: React.FC<AdminStatsProps> = ({
  jobs,
  apiBaseUrl = "http://localhost:3001",
}) => {
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>([]);
  const [averageRating, setAverageRating] = useState<number | string>("N/A");
  const [loading, setLoading] = useState(false);
  const [feedbackSearch, setFeedbackSearch] = useState("");

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/feedback`);
      if (res.ok) {
        const data = await res.json();
        setFeedbackList(data.feedback || []);
        setAverageRating(data.averageRating || "N/A");
      }
    } catch (err) {
      console.warn("[AdminStats] Failed to fetch feedback from API server, reading local storage:", err);
      try {
        const localItems = JSON.parse(localStorage.getItem("astratrust_feedback") || localStorage.getItem("zyrex_feedback") || "[]");
        setFeedbackList(localItems);
        if (localItems.length > 0) {
          const avg = localItems.reduce((acc: number, item: any) => acc + item.rating, 0) / localItems.length;
          setAverageRating(avg.toFixed(1));
        }
      } catch (localErr) {
        console.error("Local storage read error:", localErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // Compute metrics from jobs
  const totalJobs = jobs.length;
  const fundedJobs = jobs.filter((j) => j.status === "Funded").length;
  const completedJobs = jobs.filter((j) => j.status === "Completed").length;
  const refundedJobs = jobs.filter((j) => j.status === "Refunded").length;

  const totalVolumeStroops = jobs.reduce((acc, j) => acc + (parseFloat(j.amount) || 0), 0);

  const uniqueWallets = Array.from(
    new Set(jobs.flatMap((j) => [j.client, j.freelancer]))
  ).filter(Boolean);

  const ratedJobs = jobs.filter((j) => j.rated);

  const filteredFeedback = feedbackList.filter(
    (fb) =>
      fb.address.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
      fb.comment.toLowerCase().includes(feedbackSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-white">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gradient-cyan">
            📊 AstraTrust Protocol Telemetry & Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Real-time on-chain metrics, Soroban smart contract performance, and user feedback logs
          </p>
        </div>
        <button
          onClick={fetchFeedback}
          className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 text-cyan-400 px-4 py-2 rounded-xl text-xs font-bold transition shadow-[0_0_12px_rgba(0,242,254,0.1)]"
        >
          🔄 Refresh Telemetry
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Total Jobs Listed</span>
          <span className="text-3xl font-black text-gradient-cyan">{totalJobs}</span>
          <span className="text-[10px] text-slate-400 font-medium">
            {fundedJobs} Active • {completedJobs} Settled • {refundedJobs} Refunded
          </span>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Total Escrow Volume</span>
          <span className="text-3xl font-black text-amber-400 font-mono">
            {totalVolumeStroops.toLocaleString()} <span className="text-xs text-slate-400">XLM</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Locked in non-custodial contracts</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Unique Active Wallets</span>
          <span className="text-3xl font-black text-emerald-400">{uniqueWallets.length}</span>
          <span className="text-[10px] text-slate-400 font-medium">Clients & Freelancers</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Average User Rating</span>
          <span className="text-3xl font-black text-violet-400">
            {averageRating} <span className="text-sm">★</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            From {feedbackList.length} feedback submissions ({ratedJobs.length} on-chain ratings)
          </span>
        </div>
      </div>

      {/* Unique Wallets List */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 border border-slate-800">
        <h3 className="text-base font-bold text-white">
          Distinct Interacting Wallets ({uniqueWallets.length})
        </h3>
        {uniqueWallets.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No wallet interactions recorded on ledger yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
            {uniqueWallets.map((addr) => (
              <div
                key={addr}
                className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-cyan-300 break-all flex items-center justify-between"
              >
                <span>{addr}</span>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-md font-sans">Active</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Feedback Table */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-base font-bold text-white">
            Product Feedback Submissions ({feedbackList.length})
          </h3>
          <input
            type="text"
            placeholder="Search feedback..."
            value={feedbackSearch}
            onChange={(e) => setFeedbackSearch(e.target.value)}
            className="focus-ring bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl text-xs text-white placeholder-slate-500 w-full sm:w-56"
          />
        </div>

        {loading ? (
          <p className="text-xs text-slate-400 animate-pulse">Loading telemetry logs...</p>
        ) : filteredFeedback.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            No feedback entries found. Use the floating feedback widget to submit ratings!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="py-3 px-3">Rating</th>
                  <th className="py-3 px-3">User Address</th>
                  <th className="py-3 px-3">Comment / Review</th>
                  <th className="py-3 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-sans">
                {filteredFeedback.map((fb) => (
                  <tr key={fb.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-3 font-bold text-amber-400 font-mono">
                      {fb.rating} ★
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300 truncate max-w-[160px]">
                      {fb.address}
                    </td>
                    <td className="py-3 px-3 text-slate-200">{fb.comment || "—"}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[10px]">
                      {new Date(fb.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

