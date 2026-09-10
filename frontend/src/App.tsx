import { useState, useEffect, lazy, Suspense } from "react";
import { useWallet } from "./hooks/useWallet";
import { useJobs } from "./hooks/useJobs";
import { Navbar } from "./components/Navbar";
import type { NavTab } from "./components/Navbar";
import { CreateJobForm } from "./components/CreateJobForm";
import type { JobFormData } from "./components/CreateJobForm";
import { JobList } from "./components/JobList";
import { FeedbackWidget } from "./components/FeedbackWidget";
import {
  callContractMethod,
  ESCROW_CONTRACT_ID,
  SOROBAN_RPC_URL as MIDNIGHT_RPC_URL,
  rpcServer,
} from "./lib/midnight";
import { analytics } from "./lib/analytics";
import { initSentry, captureException } from "./lib/sentry";

// Code-split lazy views
const OnboardingModal = lazy(() =>
  import("./components/OnboardingModal").then((m) => ({
    default: m.OnboardingModal,
  }))
);

const AdminStats = lazy(() =>
  import("./components/AdminStats").then((m) => ({
    default: m.AdminStats,
  }))
);

const FreelancerDirectory = lazy(() =>
  import("./components/FreelancerDirectory").then((m) => ({
    default: m.FreelancerDirectory,
  }))
);

export default function App() {
  const wallet = useWallet();
  const { address, sign } = wallet;
  const { jobs, loading, error, refreshJobs } = useJobs();

  const [activeTab, setActiveTab] = useState<NavTab>("marketplace");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [prefilledFreelancer, setPrefilledFreelancer] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeJobId, setActiveJobId] = useState<number | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  const [ledgerSequence, setLedgerSequence] = useState<number | undefined>(undefined);

  useEffect(() => {
    initSentry();
    analytics.init();

    // Fetch latest block sequence on Midnight Network
    rpcServer
      .getLatestLedger()
      .then((res) => setLedgerSequence(res.sequence))
      .catch((err) => console.warn("Failed to fetch Midnight ledger sequence:", err));
  }, []);

  useEffect(() => {
    if (address) {
      analytics.trackWalletConnect(address);
    }
  }, [address]);

  // Helper to clear transaction alerts
  const setTimedAlerts = (successMsg: string | null, errorMsg: string | null) => {
    setTxSuccess(successMsg);
    setTxError(errorMsg);
    setTimeout(() => {
      setTxSuccess(null);
      setTxError(null);
    }, 8000);
  };

  const handleCreateJob = async (data: JobFormData) => {
    if (!address) return;
    setIsSubmitting(true);
    setTxError(null);
    setTxSuccess(null);

    try {
      const budgetInTokens = BigInt(Math.floor(parseFloat(data.amount)));
      const deadlineSec = BigInt(Math.floor(new Date(data.deadlineDate).getTime() / 1000));

      const args = [
        address,
        data.freelancer,
        data.token,
        budgetInTokens.toString(),
        data.description,
        deadlineSec.toString(),
      ];

      await callContractMethod(address, ESCROW_CONTRACT_ID, "create_job", args, sign);

      setTimedAlerts("⚡ Compact Escrow gig created on Midnight Network!", null);
      analytics.trackJobCreated(Date.now(), address, data.freelancer, data.amount);
      await refreshJobs();
      setActiveTab("marketplace");
      setPrefilledFreelancer("");
    } catch (err) {
      captureException(err, "handleCreateJob");
      setTimedAlerts(null, err instanceof Error ? err.message : "Failed to create escrow job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFundJob = async (jobId: number) => {
    if (!address) return;
    setActiveJobId(jobId);
    setTxError(null);
    setTxSuccess(null);

    try {
      const args = [jobId];
      await callContractMethod(address, ESCROW_CONTRACT_ID, "fund_job", args, sign);
      setTimedAlerts(`✓ Job #${jobId} funded! tDUST tokens locked in Midnight Compact escrow.`, null);
      analytics.trackJobFunded(jobId, address);
      await refreshJobs();
    } catch (err) {
      captureException(err, "handleFundJob");
      setTimedAlerts(null, err instanceof Error ? err.message : "Failed to fund job.");
    } finally {
      setActiveJobId(null);
    }
  };

  const handleCompleteJob = async (jobId: number) => {
    if (!address) return;
    setActiveJobId(jobId);
    setTxError(null);
    setTxSuccess(null);

    try {
      const args = [jobId];
      await callContractMethod(address, ESCROW_CONTRACT_ID, "release_payment", args, sign);
      setTimedAlerts(`✓ Job #${jobId} completed. Escrow funds released to freelancer on Midnight!`, null);
      analytics.trackJobCompleted(jobId, address);
      await refreshJobs();
    } catch (err) {
      captureException(err, "handleCompleteJob");
      setTimedAlerts(null, err instanceof Error ? err.message : "Failed to complete job.");
    } finally {
      setActiveJobId(null);
    }
  };

  const handleRefundJob = async (jobId: number) => {
    if (!address) return;
    setActiveJobId(jobId);
    setTxError(null);
    setTxSuccess(null);

    try {
      const args = [jobId];
      await callContractMethod(address, ESCROW_CONTRACT_ID, "refund_job", args, sign);
      setTimedAlerts(`✓ Job #${jobId} timelock refund claimed successfully!`, null);
      await refreshJobs();
    } catch (err) {
      captureException(err, "handleRefundJob");
      setTimedAlerts(null, err instanceof Error ? err.message : "Failed to request refund.");
    } finally {
      setActiveJobId(null);
    }
  };

  const handleRateJob = async (jobId: number, score: number) => {
    if (!address) return;
    setActiveJobId(jobId);
    setTxError(null);
    setTxSuccess(null);

    try {
      const args = [jobId, score];
      await callContractMethod(address, ESCROW_CONTRACT_ID, "release_payment", args, sign);
      setTimedAlerts(`⭐ Submitted atomic Compact rating of ${score} stars on Midnight Network!`, null);
      analytics.trackRatingSubmitted(jobId, score);
      await refreshJobs();
    } catch (err) {
      captureException(err, "handleRateJob");
      setTimedAlerts(null, err instanceof Error ? err.message : "Failed to submit rating.");
    } finally {
      setActiveJobId(null);
    }
  };

  const handleHireFreelancer = (freelancerAddr: string) => {
    setPrefilledFreelancer(freelancerAddr);
    setActiveTab("post-gig");
  };

  const isConfigured = ESCROW_CONTRACT_ID !== "";

  // Compute protocol summary metrics
  const totalVolume = jobs.reduce((sum, j) => sum + (parseFloat(j.amount) || 0), 0);
  const activeEscrowsCount = jobs.filter((j) => j.status === "Funded").length;
  const completedCount = jobs.filter((j) => j.status === "Completed").length;

  return (
    <div className="min-h-screen bg-[#05070f] text-slate-300 flex flex-col font-sans selection:bg-purple-500 selection:text-slate-950">
      {/* Header */}
      <Navbar
        address={wallet.address}
        isConnecting={wallet.isConnecting}
        isInstalled={!!wallet.isInstalled}
        error={wallet.error}
        connect={wallet.connect}
        disconnect={wallet.disconnect}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        ledgerSequence={ledgerSequence}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Protocol Overview Hero Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,0,0,0.4)]">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-extrabold">Total Volume</span>
            <span className="text-xl font-black text-gradient-cyan font-mono">
              {totalVolume.toLocaleString()} <span className="text-xs text-slate-400 font-sans">tDUST</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-extrabold">Active Escrows</span>
            <span className="text-xl font-black text-purple-400 font-mono">
              {activeEscrowsCount} <span className="text-xs text-slate-400 font-sans">Gigs</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-extrabold">Settled Volume</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              {completedCount} <span className="text-xs text-slate-400 font-sans">Completed</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-extrabold">Midnight Network</span>
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              Midnight Testnet (Devnet)
            </span>
          </div>
        </div>

        {/* Global Contract Config Check */}
        {!isConfigured && (
          <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-2xl text-xs text-purple-300 font-semibold flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <span>
              ⚠️ <strong>Contracts Not Configured:</strong> Midnight Escrow contract ID is missing. Deploy contracts using <code>deploy-midnight.ps1</code> or set <code>.env.local</code>.
            </span>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-extrabold px-4 py-2 rounded-xl transition"
            >
              Onboarding Setup Guide →
            </button>
          </div>
        )}

        {/* Transaction Toast Alerts */}
        {txSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-xs text-emerald-300 font-bold shadow-lg flex justify-between items-center">
            <span>{txSuccess}</span>
            <button onClick={() => setTxSuccess(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        )}
        {txError && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl text-xs text-rose-300 font-bold shadow-lg flex justify-between items-center">
            <span>Error: {txError}</span>
            <button onClick={() => setTxError(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Dynamic Tabbed Views */}
        {activeTab === "marketplace" && (
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-gradient-cyan">
                  🌐 ZyrexEscrow Marketplace
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Browse and interact with active, completed, and draft zero-knowledge escrow contracts on Midnight.
                </p>
              </div>

              <button
                onClick={refreshJobs}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 transition flex items-center gap-1 font-mono bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800"
              >
                <span>🔄</span> Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="glass-panel p-6 rounded-2xl animate-pulse flex flex-col gap-3"
                  >
                    <div className="h-6 bg-slate-800 w-1/3 rounded"></div>
                    <div className="h-12 bg-slate-800 w-full rounded"></div>
                    <div className="h-4 bg-slate-800 w-2/3 rounded"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl text-center text-rose-300 text-xs font-bold">
                {error}
              </div>
            ) : (
              <JobList
                jobs={jobs}
                walletAddress={address}
                onFund={handleFundJob}
                onComplete={handleCompleteJob}
                onRefund={handleRefundJob}
                onRate={handleRateJob}
                activeActionJobId={activeJobId}
                filterMode="all"
              />
            )}
          </div>
        )}

        {activeTab === "my-escrows" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-gradient-cyan">
                💼 My Escrows Dashboard
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Escrow contracts where your connected wallet ({address ? `${address.slice(0,8)}…${address.slice(-6)}` : "Not connected"}) is Buyer Client or Freelancer.
              </p>
            </div>

            {!address ? (
              <div className="glass-panel p-10 rounded-2xl text-center flex flex-col items-center gap-3">
                <p className="text-sm font-bold text-slate-200">Connect your Midnight Lace wallet to view your escrows.</p>
                <button
                  onClick={wallet.connect}
                  className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                >
                  Connect Lace Wallet
                </button>
              </div>
            ) : (
              <JobList
                jobs={jobs}
                walletAddress={address}
                onFund={handleFundJob}
                onComplete={handleCompleteJob}
                onRefund={handleRefundJob}
                onRate={handleRateJob}
                activeActionJobId={activeJobId}
                filterMode="client"
              />
            )}
          </div>
        )}

        {activeTab === "post-gig" && (
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-4">
            <CreateJobForm
              onSubmit={handleCreateJob}
              isSubmitting={isSubmitting}
              walletConnected={!!address}
              prefilledFreelancer={prefilledFreelancer}
            />

            <div className="glass-panel p-4 rounded-2xl text-[10px] text-slate-400 flex flex-col gap-1.5 font-mono border border-slate-800">
              <span className="font-bold text-purple-400 font-sans">Midnight Network Status:</span>
              <span className="break-all">RPC URL: {MIDNIGHT_RPC_URL}</span>
              <span className="break-all">
                Compact Escrow Contract ID: {ESCROW_CONTRACT_ID || "Not Deployed"}
              </span>
            </div>
          </div>
        )}

        {activeTab === "freelancers" && (
          <Suspense fallback={<div className="text-center py-12 text-slate-400 text-xs font-mono">Loading Freelancer Directory...</div>}>
            <FreelancerDirectory
              jobs={jobs}
              onSelectFreelancer={handleHireFreelancer}
            />
          </Suspense>
        )}

        {activeTab === "admin" && (
          <Suspense fallback={<div className="text-center py-12 text-slate-400 text-xs font-mono">Loading Protocol Telemetry...</div>}>
            <AdminStats jobs={jobs} />
          </Suspense>
        )}
      </main>

      {/* Floating In-App Feedback Widget */}
      <FeedbackWidget
        userAddress={address}
        onFeedbackSubmitted={() => {
          analytics.trackFeedbackSubmitted(5, 0);
        }}
      />

      {/* Lazy Loaded Onboarding Modal */}
      <Suspense fallback={null}>
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          isWalletInstalled={!!wallet.isInstalled}
          isConnected={!!wallet.address}
          onConnectWallet={wallet.connect}
        />
      </Suspense>
    </div>
  );
}
