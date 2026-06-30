import { useRef, useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Trophy } from "lucide-react";
import { toast } from "sonner";
import { submitGameScore, fetchMyGamePlays, getUser } from "@/app/lib/auth";

export default function MiniGameScreen() {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const doctor = getUser();

  const handleMessage = useCallback(async (event: MessageEvent) => {
    if (event.data?.type !== "penaltyScore") return;
    const goals: number = event.data.goals ?? 0;
    setSubmitting(true);
    try {
      await submitGameScore(goals);
      const lb = await fetchMyGamePlays();
      iframeRef.current?.contentWindow?.postMessage(
        { type: "dbLeaderboard", scores: lb },
        "*",
      );
    } catch (err) {
      toast.error((err as Error).message ?? "Could not save your score.");
    } finally {
      setSubmitting(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  const doctorName = encodeURIComponent(
    doctor?.name ?? doctor?.userid ?? "Player",
  );
  const gameUrl = `/games/penalty/index.html?name=${doctorName}`;
// old data has in the old folder
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-black/80 backdrop-blur-md flex-shrink-0">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
        {submitting && (
          <span className="text-yellow-400 text-xs animate-pulse">
            Saving score…
          </span>
        )}
        <div className="flex items-center gap-1.5 text-white/50 text-xs">
          <Trophy className="w-3.5 h-3.5 text-[#1E90FF]" />
          <span>Score saves automatically</span>
        </div>
      </div>
      <iframe
        ref={iframeRef}
        src={gameUrl}
        className="flex-1 w-full border-0"
        title="Penalty Shoot Game"
        allow="autoplay"
      />
    </div>
  );
}
