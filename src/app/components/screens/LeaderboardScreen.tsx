import image_Asset_1_9 from "@/imports/Asset_1.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  LogOut,
  Globe,
  CalendarDays,
  Award,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  fetchLeaderboard,
  fetchDailyLeaderboard,
  fetchDailyWinners,
  logoutDoctor,
  type LeaderboardEntry,
  type DailyWinnerEntry,
} from "@/app/lib/auth";

type Tab = "daily" | "global" | "winners";

function rankBadge(rank: number) {
  if (rank === 1) return "🏆";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "";
}

/** Returns today's rotating branding image path (cycles through all 6 daily). */
function getDailyBrandingImage(): string {
  const images = [
    "/branding/Gemcit.png",
    "/branding/Renacarb.png",
    "/branding/Renoxtin.png",
    "/branding/RPag.png",
    "/branding/Tyrokin.png",
    "/branding/Taxopac.png",
  ];
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  return images[dayOfYear % images.length];
}

/** Format "2026-06-13" → "June 13, 2026" */
function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Shared Leaderboard Board UI (used by both Daily and Global tabs)
// ---------------------------------------------------------------------------
function LeaderboardBoard({
  loading,
  error,
  myStats,
  board,
  emptyMessage,
}: {
  loading: boolean;
  error: string | null;
  myStats: LeaderboardEntry | null;
  board: LeaderboardEntry[];
  emptyMessage: string;
}) {
  const top3 = board.slice(0, 3);

  return (
    <>
      {/* User Stats Card */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-gradient-to-br from-[#1E90FF]/20 to-[#0066CC]/10 border-2 border-[#1E90FF] rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto">
          {error && (
            <div className="text-center py-2 text-red-500 text-sm">{error}</div>
          )}
          {loading ? (
            <div className="text-center py-4 text-[#1A1A2E]/50 text-sm">
              Loading your stats…
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[#1A1A2E] font-medium text-xs sm:text-sm mb-1">
                    Your Rank
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl sm:text-4xl font-bold text-[#1A1A2E]">
                      #{myStats?.rank ?? "—"}
                    </span>
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <img
                    src={getDailyBrandingImage()}
                    alt="Sponsor"
                    className="h-6 w-auto max-w-[90px] object-contain"
                    style={{ imageRendering: "auto" }}
                  />
                </div>
                <div className="text-right">
                  <p className="text-[#1A1A2E] text-xs sm:text-sm mb-1 font-medium">
                    Total Points
                  </p>
                  <span className="text-2xl sm:text-3xl font-bold text-[#000]">
                    {myStats?.total ?? 0}
                  </span>
                </div>
              </div>

              <div className="border-t border-black/15 pt-4">
                <p className="text-[#1A1A2E] text-xs sm:text-sm mb-3 font-medium">
                  Score Breakdown
                </p>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-white/95 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-2xl mb-1">🧠</div>
                    <p className="text-[#1A1A2E] text-xs mb-1">Quiz</p>
                    <p className="text-[#1A1A2E] font-bold text-base sm:text-lg">
                      {myStats?.quiz_score ?? 0}
                    </p>
                  </div>
                  <div className="bg-white/95 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-2xl mb-1">🎮</div>
                    <p className="text-[#1A1A2E] text-xs mb-1">Games</p>
                    <p className="text-[#1A1A2E] font-bold text-base sm:text-lg">
                      {myStats?.game_score ?? 0}
                    </p>
                  </div>
                  <div className="bg-white/95 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-2xl mb-1">⚽</div>
                    <p className="text-[#1A1A2E] text-xs mb-1">Prediction</p>
                    <p className="text-[#1A1A2E] font-bold text-base sm:text-lg">
                      {myStats?.prediction_score ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top 3 Podium */}
      {!loading && top3.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 mb-6">
          <h3 className="text-[#1A1A2E] font-bold mb-4 text-sm sm:text-base max-w-4xl mx-auto">
            Top Champions
          </h3>
          <div className="flex items-end justify-center gap-1 sm:gap-2 mb-6 max-w-4xl mx-auto">
            {top3[1] && (
              <div className="flex-1 basis-0 min-w-0">
                <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-t-xl sm:rounded-t-2xl p-2 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl mb-1 sm:mb-2">
                    🥈
                  </div>
                  <p className="text-gray-900 font-bold text-[10px] sm:text-sm mb-0.5 sm:mb-1 truncate px-1">
                    {top3[1].name}
                  </p>
                  <p className="text-gray-700 text-[9px] sm:text-xs">
                    {top3[1].total} pts
                  </p>
                </div>
                <div className="bg-gradient-to-b from-gray-300 to-gray-500 h-16 sm:h-24 rounded-b-xl flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl">🥈</span>
                </div>
              </div>
            )}
            {top3[0] && (
              <div className="flex-1 basis-0 min-w-0">
                <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-t-xl sm:rounded-t-2xl p-2 sm:p-4 text-center relative">
                  <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-[#1E90FF] to-[#0066CC] rounded-full flex items-center justify-center">
                      <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl lg:text-5xl mb-1 sm:mb-2 mt-2 sm:mt-4">
                    🏆
                  </div>
                  <p className="text-gray-900 font-bold text-xs sm:text-base mb-0.5 sm:mb-1 truncate px-1">
                    {top3[0].name}
                  </p>
                  <p className="text-gray-700 text-[10px] sm:text-sm">
                    {top3[0].total} pts
                  </p>
                </div>
                <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 h-20 sm:h-32 rounded-b-xl flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl">🏆</span>
                </div>
              </div>
            )}
            {top3[2] && (
              <div className="flex-1 basis-0 min-w-0">
                <div className="bg-gradient-to-br from-orange-300 to-orange-400 rounded-t-xl sm:rounded-t-2xl p-2 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl mb-1 sm:mb-2">
                    🥉
                  </div>
                  <p className="text-gray-900 font-bold text-[10px] sm:text-sm mb-0.5 sm:mb-1 truncate px-1">
                    {top3[2].name}
                  </p>
                  <p className="text-gray-700 text-[9px] sm:text-xs">
                    {top3[2].total} pts
                  </p>
                </div>
                <div className="bg-gradient-to-b from-orange-300 to-orange-500 h-14 sm:h-20 rounded-b-xl flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl">🥉</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Rankings List */}
      <div className="px-4 sm:px-6 lg:px-8 mb-6">
        <h3 className="text-[#1A1A2E] font-bold mb-4 text-sm sm:text-base max-w-4xl mx-auto">
          All Rankings
        </h3>
        <div className="space-y-2 max-w-4xl mx-auto">
          {loading && (
            <div className="text-center py-8 text-[#1A1A2E]/50 text-sm">
              Loading rankings…
            </div>
          )}
          {!loading && board.length === 0 && (
            <div className="text-center py-8 text-[#1A1A2E]/50 text-sm">
              {emptyMessage}
            </div>
          )}
          {board.map((entry) => (
            <div
              key={entry.id}
              className={`bg-white/95 border border-black/15 rounded-xl p-3 sm:p-4 flex items-center justify-between ${
                entry.id === myStats?.id ? "ring-2 ring-[#1E90FF]" : ""
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    entry.rank <= 3
                      ? "bg-gradient-to-br from-[#1E90FF] to-[#0066CC]"
                      : "bg-white/95 border border-black/10"
                  }`}
                >
                  <span className="text-[#1A1A2E] font-bold text-sm sm:text-base">
                    {entry.rank}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[#1A1A2E] font-bold text-sm sm:text-base truncate">
                    {entry.name}
                    {entry.id === myStats?.id && (
                      <span className="ml-2 text-[#1E90FF] text-xs font-normal">
                        (You)
                      </span>
                    )}
                  </p>
                  {entry.userid && (
                    <p className="text-[#1A1A2E]/60 text-xs sm:text-sm">
                      User ID: {entry.userid}
                    </p>
                  )}
                  <p className="text-[#1A1A2E]/60 text-xs sm:text-sm">
                    Quiz {entry.quiz_score} · Game {entry.game_score} · Pred{" "}
                    {entry.prediction_score ?? 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className="text-[#1A1A2E] font-bold text-sm sm:text-base">
                  {entry.total} pts
                </span>
                {rankBadge(entry.rank) && (
                  <span className="text-2xl sm:text-3xl">
                    {rankBadge(entry.rank)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------
export default function LeaderboardScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("daily");

  // --- Daily Leaderboard state ---
  const [dailyMyStats, setDailyMyStats] = useState<LeaderboardEntry | null>(
    null,
  );
  const [dailyBoard, setDailyBoard] = useState<LeaderboardEntry[]>([]);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [dailyError, setDailyError] = useState<string | null>(null);

  // --- Global Leaderboard state ---
  const [globalMyStats, setGlobalMyStats] = useState<LeaderboardEntry | null>(
    null,
  );
  const [globalBoard, setGlobalBoard] = useState<LeaderboardEntry[]>([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalFetched, setGlobalFetched] = useState(false);

  // --- Daily Winners state ---
  const [winners, setWinners] = useState<DailyWinnerEntry[]>([]);
  const [winnersLoading, setWinnersLoading] = useState(false);
  const [winnersError, setWinnersError] = useState<string | null>(null);
  const [winnersFetched, setWinnersFetched] = useState(false);

  async function handleLogout() {
    await logoutDoctor();
    toast.success("Logged out successfully.");
    navigate("/login", { replace: true });
  }

  // Load daily leaderboard on mount
  useEffect(() => {
    setDailyError(null);
    fetchDailyLeaderboard()
      .then((res) => {
        setDailyMyStats(res.my_stats);
        setDailyBoard(res.leaderboard);
      })
      .catch((err: Error) =>
        setDailyError(err.message ?? "Failed to load daily leaderboard"),
      )
      .finally(() => setDailyLoading(false));
  }, []);

  // Load global leaderboard lazily when tab first activated
  useEffect(() => {
    if (activeTab !== "global" || globalFetched) return;
    setGlobalLoading(true);
    setGlobalError(null);
    fetchLeaderboard()
      .then((res) => {
        setGlobalMyStats(res.my_stats);
        setGlobalBoard(res.leaderboard);
        setGlobalFetched(true);
      })
      .catch((err: Error) =>
        setGlobalError(err.message ?? "Failed to load leaderboard"),
      )
      .finally(() => setGlobalLoading(false));
  }, [activeTab, globalFetched]);

  // Load daily winners lazily when tab first activated
  useEffect(() => {
    if (activeTab !== "winners" || winnersFetched) return;
    setWinnersLoading(true);
    setWinnersError(null);
    const today = new Date().toLocaleDateString("en-CA");
    fetchDailyWinners()
      .then((data) => {
        setWinners(data.filter((w) => w.rank === 1 && w.date < today));
        setWinnersFetched(true);
      })
      .catch((err: Error) =>
        setWinnersError(err.message ?? "Failed to load winners"),
      )
      .finally(() => setWinnersLoading(false));
  }, [activeTab, winnersFetched]);

  const tabs: {
    key: Tab;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    sub: string;
  }[] = [
    {
      key: "daily",
      icon: CalendarDays,
      label: "Daily Leaderboard",
      sub: "Resets at 12:00 AM",
    },
    {
      key: "global",
      icon: Globe,
      label: "Tournament Leaderboard",
      sub: "Full Campaign Ranking",
    },
    {
      key: "winners",
      icon: Award,
      label: "Daily Winner",
      sub: "Past Champions",
    },
  ];

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white/95 backdrop-blur-md border-b border-black/15 sticky top-0 z-10">
        <button
          onClick={() => navigate("/home")}
          className="cursor-pointer text-[#1A1A2E] w-11 h-11 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
          <ImageWithFallback
            src={image_Asset_1_9}
            alt="Renata Oncology Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className="cursor-pointer w-11 h-11 flex items-center justify-center rounded-full bg-white border border-black/10 text-red-500 hover:bg-red-50 active:scale-95 transition-all shadow"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Tab Bar */}
      <div className="bg-white border-b border-black/10 px-2 sm:px-4">
        <div className="flex max-w-4xl mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`cursor-pointer flex-1 flex flex-col items-center gap-0.5 pt-3 pb-2 px-1 relative transition-colors ${
                  isActive ? "text-[#1E90FF]" : "text-[#1A1A2E]/50"
                }`}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
                <span
                  className={`text-[11px] sm:text-xs font-bold leading-tight text-center ${isActive ? "text-[#1E90FF]" : "text-[#1A1A2E]/70"}`}
                >
                  {tab.label}
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] leading-tight text-center ${isActive ? "text-[#1E90FF]/70" : "text-[#1A1A2E]/40"}`}
                >
                  {tab.sub}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#1E90FF] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "daily" && (
        <LeaderboardBoard
          loading={dailyLoading}
          error={dailyError}
          myStats={dailyMyStats}
          board={dailyBoard}
          emptyMessage="No scores yet today. Play the quiz or mini-game!"
        />
      )}

      {activeTab === "global" && (
        <LeaderboardBoard
          loading={globalLoading}
          error={globalError}
          myStats={globalMyStats}
          board={globalBoard}
          emptyMessage="No scores yet. Play the quiz or mini-game!"
        />
      )}

      {activeTab === "winners" && (
        <div className="px-4 sm:px-6 lg:px-8 mt-4 max-w-4xl mx-auto space-y-3">
          {winnersError && (
            <div className="text-center py-6 text-red-500 text-sm">
              {winnersError}
            </div>
          )}
          {winnersLoading && (
            <div className="text-center py-12 text-[#1A1A2E]/50 text-sm">
              Loading daily winners…
            </div>
          )}
          {!winnersLoading && winners.length === 0 && !winnersError && (
            <div className="text-center py-12 text-[#1A1A2E]/50 text-sm">
              No daily winners yet. Check back tomorrow!
            </div>
          )}
          {winners.map((winner, index) => (
            <div
              key={winner.date}
              className={`relative bg-white/95 border rounded-2xl p-4 sm:p-5 flex items-center gap-4 ${
                index === 0
                  ? "border-yellow-400 ring-2 ring-yellow-300/60"
                  : "border-black/10"
              }`}
            >
              {/* Date badge top-left */}
              <div
                className={`absolute -top-3 left-4 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm ${
                  index === 0
                    ? "bg-yellow-400 text-yellow-900"
                    : "bg-[#1E90FF] text-white"
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>{formatDate(winner.date)}</span>
              </div>

              {/* Card body */}
              <div className="mt-2 flex items-center gap-4 w-full">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1A1A2E] font-bold text-base sm:text-lg mb-0.5">
                    {winner.doctor_name}
                  </p>
                  <p className="text-[#1A1A2E]/60 text-xs sm:text-sm mb-2">
                    User ID: {winner.doctor_user_id}
                  </p>
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
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl sm:text-3xl font-bold text-[#1E90FF]">
                    {winner.total_score}
                  </p>
                  <p className="text-[#1A1A2E]/50 text-xs">pts</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
