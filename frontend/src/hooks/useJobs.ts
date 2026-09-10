import { useEffect, useState, useCallback, useRef } from "react";
import type { JobItem } from "../components/JobList";
import { getJobDetails, ESCROW_CONTRACT_ID, rpcServer } from "../lib/soroban";

const DEFAULT_DEMO_JOBS: JobItem[] = [
  {
    id: 1,
    client: "mn_test1q8zyrex88midnightnetworkescrow9901",
    freelancer: "mn_test1q8freelancer77midnightnetwork002",
    token: "mn_token1tdust99midnightnetworkdevnet001",
    amount: "150",
    description: "Conduct security audit, ZK proof verification, and circuit gas review for Midnight Compact contracts.",
    deadline: Math.floor(Date.now() / 1000) + 86400 * 7,
    status: "Funded",
    rated: false,
  },
  {
    id: 2,
    client: "mn_test1q8zyrex88midnightnetworkescrow9901",
    freelancer: "mn_test1q8freelancer77midnightnetwork002",
    token: "mn_token1tdust99midnightnetworkdevnet001",
    amount: "300",
    description: "Build Node.js serverless event caching relay for Midnight Network RPC & Indexer telemetry.",
    deadline: Math.floor(Date.now() / 1000) + 86400 * 14,
    status: "Completed",
    rated: true,
  },
];

export function useJobs() {
  const [jobs, setJobs] = useState<JobItem[]>(DEFAULT_DEMO_JOBS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastLedgerRef = useRef<number>(0);

  const refreshJobs = useCallback(async () => {
    if (!ESCROW_CONTRACT_ID) {
      setLoading(false);
      return;
    }
    
    try {
      const jobList: JobItem[] = [];
      let id = 0;
      
      while (id < 5) {
        try {
          const jobData = await getJobDetails(id);
          if (jobData) {
            jobList.push({
              id,
              client: jobData.client || "mn_test1q8zyrex88midnightnetworkescrow9901",
              freelancer: jobData.freelancer || "mn_test1q8freelancer77midnightnetwork002",
              token: jobData.token || "mn_token1tdust99midnightnetworkdevnet001",
              amount: jobData.amount || "100",
              description: jobData.description || "Midnight Compact Smart Contract Escrow Gig",
              deadline: jobData.deadline || Math.floor(Date.now() / 1000) + 86400,
              status: jobData.status || "Funded",
              rated: !!jobData.rated,
            });
          }
          id++;
        } catch {
          break;
        }
      }

      if (jobList.length === 0) {
        setJobs(DEFAULT_DEMO_JOBS);
      } else {
        jobList.sort((a, b) => b.id - a.id);
        setJobs(jobList);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to load jobs from ledger:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshJobs();
    
    rpcServer.getLatestLedger()
      .then((res) => {
        lastLedgerRef.current = res.sequence;
      })
      .catch((err) => {
        console.error("Failed to fetch latest ledger:", err);
      });
  }, [refreshJobs]);

  useEffect(() => {
    if (!ESCROW_CONTRACT_ID) return;

    const interval = setInterval(async () => {
      try {
        if (lastLedgerRef.current === 0) return;
        const response = await rpcServer.getEvents();
        if (response.events && response.events.length > 0) {
          await refreshJobs();
        }
      } catch (err) {
        console.warn("[Event Listener] Polling error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshJobs]);

  return { jobs, loading, error, refreshJobs };
}
