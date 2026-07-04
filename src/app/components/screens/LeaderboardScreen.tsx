import { useState, useEffect } from "react";

import bgMobile from "@/imports/Fifa_Worldcup_bg_mobile.png";
import bgDesktop from "@/imports/Fifa_Worldcup_bg_Desktop.png";
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
import PremiumBackground from "../PremiumBackground";
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
      <div className="px-4 sm:px-6 py-4">
        <div className="bg-gradient-to-br from-[#FFD700]/[0.08] to-[#1E90FF]/[0.05] border border-[#FFD700]/20 rounded-2xl p-5 sm:p-6 max-w-4xl mx-auto shadow-[0_0_40px_rgba(255,215,0,0.06)]">
          {error && (
            <div className="text-center py-2 text-red-400 text-sm">{error}</div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2">
              <div className="w-5 h-5 border-2 border-white/20 border-t-[#FFD700] rounded-full animate-spin" />
              <span className="text-white/30 text-xs">Loading your stats…</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">
                    Your Rank
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-4xl font-black text-white"
                      style={{ textShadow: "0 0 24px rgba(255,215,0,0.25)" }}
                    >
                      #{myStats?.rank ?? "—"}
                    </span>
                    <TrendingUp className="w-5 h-5 text-[#34D399]" />
                  </div>
                </div>

                <img
                  src={getDailyBrandingImage()}
                  alt="Sponsor"
                  className="h-8 w-auto max-w-[100px] object-contain opacity-80 drop-shadow-lg"
                />

                <div className="text-right">
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">
                    Total Points
                  </p>
                  <span
                    className="text-4xl font-black text-[#FFD700]"
                    style={{ textShadow: "0 0 24px rgba(255,215,0,0.35)" }}
                  >
                    {myStats?.total ?? 0}
                  </span>
                </div>
              </div>

              <div className="border-t border-white/[0.07] pt-4">
                <p className="text-white/30 text-xs uppercase tracking-widest font-semibold mb-3">
                  Score Breakdown
                </p>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    {
                      emoji: "🧠",
                      label: "Quiz",
                      value: myStats?.quiz_score ?? 0,
                      color: "#A78BFA",
                    },
                    {
                      emoji: "🎮",
                      label: "Games",
                      value: myStats?.game_score ?? 0,
                      color: "#F97316",
                    },
                    {
                      emoji: "⚽",
                      label: "Prediction",
                      value: myStats?.prediction_score ?? 0,
                      color: "#34D399",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white/[0.05] border border-white/[0.07] rounded-xl p-3 text-center"
                    >
                      <div className="text-xl mb-1">{stat.emoji}</div>
                      <p className="text-white/40 text-[10px] uppercase tracking-wide mb-1">
                        {stat.label}
                      </p>
                      <p
                        className="font-black text-lg"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top 3 Podium */}
      {!loading && top3.length > 0 && (
        <div className="px-4 sm:px-6 mb-6">
          <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4 max-w-4xl mx-auto">
            Top Champions
          </h3>
          <div className="flex items-end justify-center gap-1 sm:gap-2 mb-6 max-w-4xl mx-auto">
            {top3[1] && (
              <div className="flex-1 basis-0 min-w-0">
                <div className="bg-white/[0.06] border border-white/10 rounded-t-xl p-2 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🥈</div>
                  <p className="text-white/80 font-bold text-[10px] sm:text-sm mb-0.5 truncate px-1">
                    {top3[1].name}
                  </p>
                  <p className="text-white/50 text-[9px]">
                    {top3[1].total} pts
                  </p>
                </div>
                <div className="bg-gradient-to-b from-white/10 to-white/[0.03] h-16 sm:h-24 rounded-b-xl flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl">🥈</span>
                </div>
              </div>
            )}
            {top3[0] && (
              <div className="flex-1 basis-0 min-w-0">
                <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-t-2xl p-2 sm:p-4 text-center relative">
                  <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2">
                    <div className="gold-pulse w-8 h-8 sm:w-12 sm:h-12 bg-[#FFD700] rounded-full flex items-center justify-center">
                      <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-[#0A0E1A]" />
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl mb-1 sm:mb-2 mt-2 sm:mt-4">
                    🏆
                  </div>
                  <p className="text-white font-black text-xs sm:text-sm mb-0.5 truncate px-1">
                    {top3[0].name}
                  </p>
                  <p className="text-[#FFD700] text-[10px] font-bold">
                    {top3[0].total} pts
                  </p>
                </div>
                <div className="bg-gradient-to-b from-[#FFD700]/20 to-[#FFD700]/5 h-24 sm:h-32 rounded-b-xl flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl">🏆</span>
                </div>
              </div>
            )}
            {top3[2] && (
              <div className="flex-1 basis-0 min-w-0">
                <div className="bg-[#F97316]/[0.08] border border-[#F97316]/20 rounded-t-xl p-2 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🥉</div>
                  <p className="text-white/80 font-bold text-[10px] sm:text-sm mb-0.5 truncate px-1">
                    {top3[2].name}
                  </p>
                  <p className="text-white/50 text-[9px]">
                    {top3[2].total} pts
                  </p>
                </div>
                <div className="bg-gradient-to-b from-[#F97316]/10 to-[#F97316]/[0.03] h-14 sm:h-20 rounded-b-xl flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl">🥉</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Rankings List */}
      <div className="px-4 sm:px-6 mb-6">
        <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3 max-w-4xl mx-auto">
          All Rankings
        </h3>
        <div className="space-y-2 max-w-4xl mx-auto">
          {loading && (
            <div className="text-center py-8 text-white/30 text-sm">
              Loading rankings…
            </div>
          )}
          {!loading && board.length === 0 && (
            <div className="text-center py-8 text-white/30 text-sm">
              {emptyMessage}
            </div>
          )}
          {board.map((entry) => {
            const isMe = entry.id === myStats?.id;
            const isTop3 = entry.rank <= 3;
            return (
              <div
                key={entry.id}
                className={`rounded-xl p-3 sm:p-4 flex items-center justify-between transition-all ${
                  isMe
                    ? "bg-[#1E90FF]/[0.05] border border-[#1E90FF]/20 ring-1 ring-[#1E90FF]/40"
                    : "bg-[#0D1526] border border-white/[0.07]"
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isTop3
                        ? "bg-[#FFD700]/15 border border-[#FFD700]/30"
                        : "bg-white/[0.06] border border-white/[0.08]"
                    }`}
                  >
                    <span
                      className={`text-sm ${isTop3 ? "text-[#FFD700] font-black" : "text-white/50 font-bold"}`}
                    >
                      {entry.rank}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-sm sm:text-base truncate">
                      {entry.name}
                      {isMe && (
                        <span className="ml-2 text-[#1E90FF] text-xs font-normal">
                          (You)
                        </span>
                      )}
                    </p>
                    {entry.userid && (
                      <p className="text-white/30 text-xs sm:text-sm">
                        User ID: {entry.userid}
                      </p>
                    )}
                    <p className="text-white/30 text-xs sm:text-sm">
                      Quiz {entry.quiz_score} · Game {entry.game_score} · Pred{" "}
                      {entry.prediction_score ?? 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-white font-black text-base sm:text-lg">
                    {entry.total} pts
                  </span>
                  {rankBadge(entry.rank) && (
                    <span className="text-2xl sm:text-3xl">
                      {rankBadge(entry.rank)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
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
    <div className="min-h-screen bg-[#0A0E1A] relative pb-10">
      <style>{`
        @keyframes goldPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,215,0,0.35); }
          50% { box-shadow: 0 0 0 8px rgba(255,215,0,0); }
        }
        .gold-pulse { animation: goldPulse 2.2s ease-out infinite; }
      `}</style>

      {/* Background — matches HomeDashboard */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 z-0 sm:hidden"
          style={{
            backgroundImage: `url(${bgMobile})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          className="absolute inset-0 z-0 hidden sm:block"
          style={{
            backgroundImage: `url(${bgDesktop})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>
      <div className="opacity-[0.04] fixed inset-0 pointer-events-none z-0">
        <PremiumBackground />
      </div>

      {/* Header + Tab Bar — one sticky block so both stay pinned together */}
      <div className="sticky top-0 z-20 bg-[#0A0E1A]/80 backdrop-blur-md border-b border-white/[0.07]">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.05]">
          <button
            onClick={() => navigate("/home")}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/10 text-white/70 hover:text-white active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#FFD700] rounded-full" />
            <span className="text-sm font-black text-white tracking-widest uppercase">
              Leaderboard
            </span>
            <div className="w-1 h-4 bg-[#FFD700] rounded-full" />
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-white/35 text-xs underline hover:text-white/60 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Sign out
          </button>
        </div>

        <div className="px-2 sm:px-4">
          <div className="flex max-w-4xl mx-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex flex-col items-center gap-0.5 pt-3 pb-2 px-1 relative transition-all duration-200 ${
                    isActive
                      ? "text-[#FFD700]"
                      : "text-white/30 hover:text-white/60"
                  }`}
                >
                  <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
                  <span
                    className={`text-[11px] sm:text-xs font-bold leading-tight text-center ${
                      isActive ? "text-[#FFD700]" : "text-white/40"
                    }`}
                  >
                    {tab.label}
                  </span>
                  <span
                    className={`text-[9px] leading-tight text-center ${
                      isActive ? "text-[#FFD700]/60" : "text-white/20"
                    }`}
                  >
                    {tab.sub}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#FFD700] rounded-full shadow-[0_0_8px_rgba(255,215,0,0.7)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative z-10">
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
          <div className="px-4 sm:px-6 pt-4 max-w-4xl mx-auto space-y-3">
            {winnersError && (
              <div className="text-center py-6 text-red-400 text-sm">
                {winnersError}
              </div>
            )}
            {winnersLoading && (
              <div className="flex items-center justify-center py-16 gap-2">
                <div className="w-5 h-5 border-2 border-white/20 border-t-[#FFD700] rounded-full animate-spin" />
                <span className="text-white/30 text-sm">Loading winners…</span>
              </div>
            )}
            {!winnersLoading && winners.length === 0 && !winnersError && (
              <div className="text-center py-16 text-white/25 text-sm">
                No daily winners yet. Check back tomorrow!
              </div>
            )}
            {winners.map((winner, index) => (
              <div
                key={winner.date}
                className={`relative rounded-2xl p-4 sm:p-5 flex items-center gap-4 ${
                  index === 0
                    ? "bg-[#FFD700]/[0.07] border border-[#FFD700]/25 shadow-[0_0_32px_rgba(255,215,0,0.08)]"
                    : "bg-white/[0.04] border border-white/[0.07]"
                }`}
              >
                {/* Date badge top-left */}
                <div
                  className={`absolute -top-3 left-4 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm ${
                    index === 0
                      ? "bg-[#FFD700] text-[#0A0E1A]"
                      : "bg-[#1E90FF]/80 text-white"
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(winner.date)}</span>
                </div>

                {/* Card body */}
                <div className="mt-2 flex items-center gap-4 w-full">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600 ${
                      index === 0 ? "gold-pulse" : ""
                    }`}
                  >
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-base mb-0.5">
                      {winner.doctor_name}
                    </p>
                    <p className="text-white/30 text-xs mb-2">
                      User ID: {winner.doctor_user_id}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-[10px] sm:text-xs bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/20 px-2 py-0.5 rounded-full font-semibold">
                        🧠 Quiz {winner.quiz_score}
                      </span>
                      <span className="text-[10px] sm:text-xs bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 px-2 py-0.5 rounded-full font-semibold">
                        🎮 Game {winner.game_score}
                      </span>
                      <span className="text-[10px] sm:text-xs bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20 px-2 py-0.5 rounded-full font-semibold">
                        ⚽ Pred {winner.prediction_score}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[#FFD700] font-black text-2xl sm:text-3xl">
                      {winner.total_score}
                    </p>
                    <p className="text-white/30 text-xs">pts</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
