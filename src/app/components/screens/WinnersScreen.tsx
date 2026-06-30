import image_Asset_1_9 from "@/imports/Asset_1.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Trophy, LogOut, Calendar } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  logoutDoctor,
  fetchDailyWinners,
  type DailyWinnerEntry,
} from "@/app/lib/auth";

/** Format "2026-06-13" → "June 13, 2026" */
function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function WinnersScreen() {
  const navigate = useNavigate();
  const [winners, setWinners] = useState<DailyWinnerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    await logoutDoctor();
    toast.success("Logged out successfully.");
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    setError(null);
    // Today's date string in local time (YYYY-MM-DD)
    const today = new Date().toLocaleDateString("en-CA"); // "2026-06-14"
    fetchDailyWinners()
      .then((data) =>
        setWinners(data.filter((w) => w.rank === 1 && w.date < today)),
      )
      .catch((err: Error) => setError(err.message ?? "Failed to load winners"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white/95 backdrop-blur-md border-b border-black/15 sticky top-0 z-10">
        <button
          onClick={() => navigate("/home")}
          className="text-[#1A1A2E] w-11 h-11 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
          <ImageWithFallback
            src={image_Asset_1_9}
            alt="Rolac Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white border border-black/10 text-red-500 hover:bg-red-50 active:scale-95 transition-all shadow"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Page Title */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-2 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A2E]">Daily Winners</h2>
        </div>
        <p className="text-[#1A1A2E]/60 text-sm pl-1">
          Each day's champion — highest combined score (Quiz + Game +
          Prediction)
        </p>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 mt-4 max-w-4xl mx-auto space-y-3">
        {error && (
          <div className="text-center py-6 text-red-500 text-sm">{error}</div>
        )}

        {loading && (
          <div className="text-center py-12 text-[#1A1A2E]/50 text-sm">
            Loading daily winners…
          </div>
        )}

        {!loading && winners.length === 0 && !error && (
          <div className="text-center py-12 text-[#1A1A2E]/50 text-sm">
            No daily winners yet. Check back tomorrow!
          </div>
        )}

        {winners.map((winner, index) => (
          <div
            key={winner.date}
            className={`bg-white/95 border rounded-2xl p-4 sm:p-5 flex items-center gap-4 ${
              index === 0
                ? "border-yellow-400 ring-2 ring-yellow-300/60"
                : "border-black/10"
            }`}
          >
            {/* Trophy badge — all are daily champions */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600">
              <Trophy className="w-6 h-6 text-white" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[#1A1A2E] font-bold text-base sm:text-lg truncate">
                  {winner.doctor_name}
                </p>
                {index === 0 && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                    Latest
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[#1A1A2E]/55 text-xs mb-2">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(winner.date)}</span>
              </div>
              {/* Score breakdown */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                  🧠 Quiz {winner.quiz_score}
                </span>
                <span className="text-[10px] sm:text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                  🎮 Game {winner.game_score}
                </span>
                <span className="text-[10px] sm:text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                  ⚽ Pred {winner.prediction_score}
                </span>
              </div>
            </div>

            {/* Total score */}
            <div className="text-right flex-shrink-0">
              <p className="text-2xl sm:text-3xl font-bold text-[#1E90FF]">
                {winner.total_score}
              </p>
              <p className="text-[#1A1A2E]/50 text-xs">pts</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
