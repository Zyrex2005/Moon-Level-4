import { useEffect, useState } from "react";
import { getReputationDetails } from "../lib/soroban";

export function ReputationBadge({ freelancerAddress }: { freelancerAddress: string }) {
  const [rep, setRep] = useState<{ total_score: number; rating_count: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!freelancerAddress) return;
    setLoading(true);
    getReputationDetails(freelancerAddress)
      .then((res: { total_score: number; rating_count: number }) => {
        setRep(res);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error("Failed to load reputation:", err);
        setLoading(false);
      });
  }, [freelancerAddress]);

  if (loading) {
    return <span className="animate-pulse text-[10px] text-purple-400 font-mono">Loading score…</span>;
  }

  const ratingCount = rep?.rating_count || 0;
  const totalScore = rep?.total_score || 0;
  const averageRating = ratingCount > 0 ? (totalScore / ratingCount).toFixed(1) : null;
  const numAvg = averageRating ? parseFloat(averageRating) : 0;

  // Determine trust tier
  let badgeColor = "border-slate-800 bg-slate-900/90 text-slate-300";
  let tierLabel = "New Freelancer";

  if (ratingCount > 0) {
    if (numAvg >= 4.8 && ratingCount >= 3) {
      badgeColor = "border-purple-500/40 bg-purple-500/10 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)]";
      tierLabel = "Midnight Elite";
    } else if (numAvg >= 4.0) {
      badgeColor = "border-cyan-500/40 bg-cyan-500/10 text-cyan-300 shadow-[0_0_12px_rgba(0,242,254,0.15)]";
      tierLabel = "Verified ZK";
    } else {
      badgeColor = "border-amber-500/40 bg-amber-500/10 text-amber-300";
      tierLabel = "Active";
    }
  }

  return (
    <div className={`inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold ${badgeColor}`}>
      <span className="text-amber-400">★</span>
      {averageRating ? (
        <span>
          <span className="font-bold text-white">{averageRating}</span>
          <span className="text-slate-400 font-normal"> / 5.0</span>
          <span className="ml-1 opacity-80">({ratingCount} gig{ratingCount !== 1 ? 's' : ''}) • {tierLabel}</span>
        </span>
      ) : (
        <span>{tierLabel}</span>
      )}
    </div>
  );
}
