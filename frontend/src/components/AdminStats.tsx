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
        const localItems = JSON.parse(localStorage.getItem("zyrex_feedback") || "[]");
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

  const totalVolumeTokens = jobs.reduce((acc, j) => acc + (parseFloat(j.amount) || 0), 0);

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
      <div className="flex justify-between items-center border-b border-purple-900/40 pb-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gradient-cyan">
            📊 ZyrexEscrow Protocol Telemetry & Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Real-time on-chain metrics, Midnight Compact contract performance, and user feedback logs
          </p>
        </div>
        <button
          onClick={fetchFeedback}
          className="bg-slate-900/90 border border-purple-900/50 hover:border-purple-500/40 text-purple-300 px-4 py-2 rounded-xl text-xs font-bold transition shadow-[0_0_12px_rgba(168,85,247,0.1)]"
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
          <span className="text-3xl font-black text-purple-400 font-mono">
            {totalVolumeTokens.toLocaleString()} <span className="text-xs text-slate-400">tDUST</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Locked in Midnight ZK contracts</span>
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
                className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-purple-300 break-all flex items-center justify-between"
              >
                <span>{addr}</span>
                <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-md font-sans">Active</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Logs Table */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-base font-bold text-white">
            User Feedback Submissions ({filteredFeedback.length})
          </h3>
          <input
            type="text"
            placeholder="Search feedback..."
            value={feedbackSearch}
            onChange={(e) => setFeedbackSearch(e.target.value)}
            className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-white placeholder-slate-500 w-full sm:w-60 focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="p-6 text-center text-xs text-slate-400 animate-pulse">Loading feedback logs...</div>
        ) : filteredFeedback.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No user feedback logs found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-3">Rating</th>
                  <th className="py-2.5 px-3">Comment</th>
                  <th className="py-2.5 px-3">Wallet Address</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredFeedback.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-3 font-bold text-amber-400 font-mono">
                      {item.rating} ★
                    </td>
                    <td className="py-3 px-3 text-slate-200 max-w-xs">{item.comment}</td>
                    <td className="py-3 px-3 font-mono text-purple-300 text-[11px]">
                      {item.address.slice(0, 10)}…{item.address.slice(-6)}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[10px] font-mono">
                      {new Date(item.timestamp).toLocaleString()}
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
