import React, { useState, useEffect } from "react";
import type { JobItem } from "./JobList";
import { getReputationDetails } from "../lib/soroban";

interface FreelancerDirectoryProps {
  jobs: JobItem[];
  onSelectFreelancer: (freelancerAddress: string) => void;
}

interface FreelancerProfile {
  address: string;
  totalGigs: number;
  completedGigs: number;
  totalScore: number;
  ratingCount: number;
  averageRating: number | null;
  tier: "Apex Pioneer" | "Gold Pro" | "Silver Contributor" | "Rising Talent";
}

export const FreelancerDirectory: React.FC<FreelancerDirectoryProps> = ({
  jobs,
  onSelectFreelancer,
}) => {
  const [profiles, setProfiles] = useState<FreelancerProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFreelancers() {
      setLoading(true);
      const freelancerMap = new Map<string, { totalGigs: number; completedGigs: number }>();
      
      jobs.forEach((j) => {
        if (!j.freelancer) return;
        const existing = freelancerMap.get(j.freelancer) || { totalGigs: 0, completedGigs: 0 };
        existing.totalGigs += 1;
        if (j.status === "Completed") existing.completedGigs += 1;
        freelancerMap.set(j.freelancer, existing);
      });

      const profileList: FreelancerProfile[] = [];

      for (const [address, stats] of freelancerMap.entries()) {
        let rep = { total_score: 0, rating_count: 0 };
        try {
          rep = await getReputationDetails(address);
        } catch (err) {
          console.warn("[FreelancerDirectory] Could not fetch reputation for:", address);
        }

        const ratingCount = rep.rating_count;
        const totalScore = rep.total_score;
        const averageRating = ratingCount > 0 ? parseFloat((totalScore / ratingCount).toFixed(1)) : null;

        let tier: FreelancerProfile["tier"] = "Rising Talent";
        if (averageRating !== null) {
          if (averageRating >= 4.8 && stats.completedGigs >= 3) {
            tier = "Apex Pioneer";
          } else if (averageRating >= 4.0) {
            tier = "Gold Pro";
          } else if (averageRating > 0) {
            tier = "Silver Contributor";
          }
        }

        profileList.push({
          address,
          totalGigs: stats.totalGigs,
          completedGigs: stats.completedGigs,
          totalScore,
          ratingCount,
          averageRating,
          tier,
        });
      }

      // Sort by rating desc, then completed gigs desc
      profileList.sort((a, b) => {
        const rateA = a.averageRating ?? 0;
        const rateB = b.averageRating ?? 0;
        if (rateB !== rateA) return rateB - rateA;
        return b.completedGigs - a.completedGigs;
      });

      setProfiles(profileList);
      setLoading(false);
    }

    loadFreelancers();
  }, [jobs]);

  const filteredProfiles = profiles.filter((p) =>
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gradient-cyan">
            ⭐ AstraTrust Freelancer Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Discover verified Web3 talent on Stellar Soroban with immutable cross-contract reputation scores.
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search freelancer address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="focus-ring bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-500 w-full md:w-72"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-panel p-6 rounded-2xl animate-pulse flex flex-col gap-3">
              <div className="h-5 bg-slate-800 w-2/3 rounded"></div>
              <div className="h-4 bg-slate-800 w-full rounded"></div>
              <div className="h-10 bg-slate-800 w-full rounded-xl mt-2"></div>
            </div>
          ))}
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl text-center text-slate-400">
          <p className="font-bold text-base text-slate-200">No freelancers found in directory.</p>
          <p className="text-xs text-slate-400 mt-1">
            When clients create gigs and assign freelancers, their on-chain profiles will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProfiles.map((p) => {
            let tierBadge = (
              <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                🚀 Rising Talent
              </span>
            );
            if (p.tier === "Apex Pioneer") {
              tierBadge = (
                <span className="bg-violet-500/15 text-violet-300 border border-violet-500/30 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  💎 Apex Pioneer
                </span>
              );
            } else if (p.tier === "Gold Pro") {
              tierBadge = (
                <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                  🥇 Gold Pro
                </span>
              );
            } else if (p.tier === "Silver Contributor") {
              tierBadge = (
                <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  🥈 Silver Talent
                </span>
              );
            }

            return (
              <div key={p.address} className="glass-panel-interactive p-6 rounded-2xl flex flex-col justify-between gap-5">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    {tierBadge}
                    <div className="flex items-center gap-1 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800 text-xs">
                      <span className="text-amber-400 font-bold">★</span>
                      <span className="font-extrabold text-white">
                        {p.averageRating ? p.averageRating.toFixed(1) : "N/A"}
                      </span>
                      <span className="text-slate-400 text-[10px]">({p.ratingCount})</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-mono text-xs font-extrabold text-white truncate mt-1">
                      {p.address}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Stellar Testnet Public Key
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Gigs</span>
                    <span className="font-mono font-extrabold text-white">{p.totalGigs}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Completed</span>
                    <span className="font-mono font-extrabold text-emerald-400">{p.completedGigs}</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectFreelancer(p.address)}
                  className="w-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 hover:from-cyan-300 hover:to-violet-400 text-slate-950 font-extrabold py-3 rounded-xl transition text-xs shadow-[0_0_20px_rgba(0,242,254,0.3)]"
                >
                  ⚡ Hire Talent for Gig
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

