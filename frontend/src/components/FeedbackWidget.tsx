import React, { useState } from "react";

interface FeedbackWidgetProps {
  userAddress: string | null;
  apiBaseUrl?: string;
  onFeedbackSubmitted?: () => void;
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  userAddress,
  apiBaseUrl = "http://localhost:3001",
  onFeedbackSubmitted,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<string>("UI/UX Design");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    const feedbackPayload = {
      rating,
      category,
      comment: comment.trim(),
      address: userAddress || "anonymous",
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${apiBaseUrl}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackPayload),
      });

      if (!res.ok) {
        throw new Error("Failed to submit feedback to API server");
      }
    } catch (err) {
      console.warn("[Feedback] API server offline or error, saving locally:", err);
      try {
        const localItems = JSON.parse(localStorage.getItem("astratrust_feedback") || "[]");
        localItems.push({
          id: `fb_local_${Date.now()}`,
          ...feedbackPayload,
        });
        localStorage.setItem("astratrust_feedback", JSON.stringify(localItems));
      } catch (localErr) {
        console.error("Local storage error:", localErr);
      }
    }

    setStatusMsg({ type: "success", text: "Thank you! Feedback recorded." });
    setComment("");
    if (onFeedbackSubmitted) onFeedbackSubmitted();

    setTimeout(() => {
      setIsOpen(false);
      setStatusMsg(null);
    }, 2000);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 glass-panel border border-slate-800 p-5 rounded-2xl max-w-xs w-full shadow-2xl animate-fade-in text-white">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-black text-gradient-cyan">Share App Feedback</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-bold">Your Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-lg transition ${
                      star <= rating ? "text-amber-400 scale-110" : "text-slate-700"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-bold">Feedback Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-[10px] rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="UI/UX Design">🎨 UI / UX Aesthetics</option>
                <option value="Transaction Speed">⚡ Transaction Speed & RPC</option>
                <option value="Clarity">📖 Instructions & Clarity</option>
                <option value="Feature Request">💡 Feature Suggestion</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-bold">Comments</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you loved or how we can improve..."
                rows={3}
                className="w-full focus-ring bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 p-3 rounded-xl resize-none"
                required
              />
            </div>

            {statusMsg && (
              <div className="text-[10px] text-emerald-400 font-bold text-center">
                ✓ {statusMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 hover:from-cyan-300 hover:to-violet-400 text-slate-950 font-extrabold py-2.5 rounded-xl text-xs transition disabled:opacity-50 shadow-[0_0_15px_rgba(0,242,254,0.3)]"
            >
              {isSubmitting ? "Submitting…" : "Submit Feedback"}
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 text-slate-950 font-extrabold px-5 py-3 rounded-full text-xs shadow-[0_0_20px_rgba(0,242,254,0.4)] flex items-center gap-2 hover:scale-105 transition"
      >
        <span>💬 Feedback</span>
      </button>
    </div>
  );
};

