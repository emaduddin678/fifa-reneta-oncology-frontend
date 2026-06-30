import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  PlayCircle,
  Trophy,
  Clock,
  CheckCircle,
  Loader2,
  Calendar,
} from "lucide-react";
import PremiumCard from "../PremiumCard";
import PremiumButton from "../PremiumButton";
import {
  fetchLiveFixtures,
  fetchTodayFixtures,
  type WcFixture,
} from "@/app/lib/fixtures";

const LIVE_REFRESH_MS = 30_000; // refresh live scores every 30 seconds

function ScoreDisplay({ f }: { f: WcFixture }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      {/* Home */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-10 h-7 rounded overflow-hidden border border-black/10 flex-shrink-0 bg-gray-50">
          <img
            src={
              f.home_flag ??
              `https://flagcdn.com/w80/${f.home_code.toLowerCase()}.png`
            }
            alt={f.home_team}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <span className="font-bold text-[#1A1A2E] text-sm truncate">
          {f.is_placeholder ? f.home_code : f.home_team}
        </span>
      </div>

      {/* Score */}
      <div className="flex flex-col items-center flex-shrink-0">
        {f.status === "live" ? (
          (() => {
            const isFtState =
              f.state_id === 5 ||
              f.state_id === 7 ||
              f.state_id === 8 ||
              f.state_id === 9;
            const isHalfTime = f.state_id === 3 || f.state_id === 13;
            const periodLabel = isFtState
              ? "Full Time"
              : (() => {
                  switch (f.state_id) {
                    case 2:
                      return "1st Half";
                    case 3:
                      return "Half Time";
                    case 4:
                      return "2nd Half";
                    case 6:
                      return "ET 1st";
                    case 10:
                      return "ET Break";
                    case 11:
                      return "ET 2nd";
                    case 12:
                      return "Penalties";
                    case 13:
                      return "ET HT";
                    default:
                      return "Live";
                  }
                })();

            if (isFtState) {
              return (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#1A1A2E] font-black text-2xl leading-none">
                      {f.home_score}
                    </span>
                    <span className="text-[#1A1A2E]/40 font-black text-lg">
                      –
                    </span>
                    <span className="text-[#1A1A2E] font-black text-2xl leading-none">
                      {f.away_score}
                    </span>
                  </div>
                  <span className="text-green-600 text-[10px] font-bold uppercase tracking-wide mt-0.5">
                    Full Time
                  </span>
                </>
              );
            }

            return (
              <>
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full mb-1 ${isHalfTime ? "bg-yellow-500" : "bg-red-500"}`}
                >
                  {!isHalfTime && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  )}
                  <span className="text-white text-[10px] font-black uppercase">
                    {periodLabel}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#1A1A2E] font-black text-2xl leading-none">
                    {f.home_score ?? 0}
                  </span>
                  <span className="text-[#1A1A2E]/40 font-black text-lg">
                    –
                  </span>
                  <span className="text-[#1A1A2E] font-black text-2xl leading-none">
                    {f.away_score ?? 0}
                  </span>
                </div>
              </>
            );
          })()
        ) : f.status === "done" ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-[#1A1A2E] font-black text-2xl leading-none">
                {f.home_score}
              </span>
              <span className="text-[#1A1A2E]/40 font-black text-lg">–</span>
              <span className="text-[#1A1A2E] font-black text-2xl leading-none">
                {f.away_score}
              </span>
            </div>
            <span className="text-green-600 text-[10px] font-bold uppercase tracking-wide mt-0.5">
              Full Time
            </span>
          </>
        ) : (
          <>
            <span className="text-[#1A1A2E]/40 font-black text-xs mb-1">
              VS
            </span>
            <div className="flex items-center gap-0.5 text-[#1A1A2E]/60 text-xs">
              <Clock className="w-3 h-3" />
              <span>{f.match_time} BST</span>
            </div>
          </>
        )}
      </div>

      {/* Away */}
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <span className="font-bold text-[#1A1A2E] text-sm truncate text-right">
          {f.is_placeholder ? f.away_code : f.away_team}
        </span>
        <div className="w-10 h-7 rounded overflow-hidden border border-black/10 flex-shrink-0 bg-gray-50">
          <img
            src={
              f.away_flag ??
              `https://flagcdn.com/w80/${f.away_code.toLowerCase()}.png`
            }
            alt={f.away_team}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function LiveDashboard() {
  const navigate = useNavigate();
  const [liveFixtures, setLiveFixtures] = useState<WcFixture[]>([]);
  const [todayFixtures, setTodayFixtures] = useState<WcFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [live, today] = await Promise.all([
        fetchLiveFixtures(),
        fetchTodayFixtures(),
      ]);
      setLiveFixtures(live);
      setTodayFixtures(today);
      setLastUpdated(new Date());
    } catch {
      // silently keep previous data on refresh failure
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, LIVE_REFRESH_MS);
    return () => clearInterval(interval);
  }, [loadData]);

  const FT_STATE_IDS = [5, 7, 8, 9];
  const actuallyLive = liveFixtures.filter(
    (f) => f.state_id === null || !FT_STATE_IDS.includes(f.state_id),
  );
  const justFinished = liveFixtures.filter(
    (f) => f.state_id !== null && FT_STATE_IDS.includes(f.state_id),
  );
  const upcomingToday = todayFixtures.filter((f) => f.status === "upcoming");
  const doneToday = [
    ...justFinished,
    ...todayFixtures.filter((f) => f.status === "done"),
  ];

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-black/15 sticky top-0 z-10 bg-white/95 backdrop-blur-md">
        <button
          onClick={() => navigate("/home")}
          className="text-[#1A1A2E] w-11 h-11 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <h1 className="text-lg font-black text-[#1A1A2E]">
            Live Match Center
          </h1>
        </div>
        <div className="w-11" />
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-2xl mx-auto space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-[#1E90FF]" />
          </div>
        ) : (
          <>
            {/* ── LIVE NOW ── */}
            {actuallyLive.length > 0 && (
              <PremiumCard>
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <h2 className="font-black text-[#1A1A2E] text-sm uppercase tracking-wider">
                      Live Now
                    </h2>
                    <span className="ml-auto text-[10px] text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded-full">
                      {actuallyLive.length} match
                      {actuallyLive.length !== 1 ? "es" : ""} in play
                    </span>
                  </div>
                  <div className="divide-y divide-black/8">
                    {actuallyLive.map((f) => (
                      <ScoreDisplay key={f.id} f={f} />
                    ))}
                  </div>
                </div>
              </PremiumCard>
            )}

            {/* ── NO LIVE MATCHES ── */}
            {actuallyLive.length === 0 && (
              <PremiumCard>
                <div className="p-5 text-center">
                  <p className="text-[#1A1A2E]/60 text-sm font-medium">
                    No matches live right now
                  </p>
                  {upcomingToday.length > 0 && (
                    <p className="text-[#1A1A2E]/40 text-xs mt-1">
                      Next up today: {upcomingToday[0].match_datetime_bd} BST
                    </p>
                  )}
                </div>
              </PremiumCard>
            )}

            {/* ── TODAY'S UPCOMING ── */}
            {upcomingToday.length > 0 && (
              <PremiumCard>
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-[#1E90FF]" />
                    <h2 className="font-black text-[#1A1A2E] text-sm uppercase tracking-wider">
                      Upcoming Today
                    </h2>
                  </div>
                  <div className="divide-y divide-black/8">
                    {upcomingToday.map((f) => (
                      <ScoreDisplay key={f.id} f={f} />
                    ))}
                  </div>
                </div>
              </PremiumCard>
            )}

            {/* ── TODAY'S RESULTS ── */}
            {doneToday.length > 1000 && (
              <PremiumCard>
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <h2 className="font-black text-[#1A1A2E] text-sm uppercase tracking-wider">
                      Today's Results
                    </h2>
                  </div>
                  <div className="divide-y divide-black/8">
                    {doneToday.map((f) => (
                      <ScoreDisplay key={f.id} f={f} />
                    ))}
                  </div>
                </div>
              </PremiumCard>
            )}

            {/* ── NO MATCHES TODAY ── */}
            {todayFixtures.length === 0 && actuallyLive.length === 0 && (
              <PremiumCard>
                <div className="p-5 text-center">
                  <Calendar className="w-8 h-8 text-[#1E90FF]/40 mx-auto mb-2" />
                  <p className="text-[#1A1A2E]/60 text-sm">
                    No matches scheduled today
                  </p>
                </div>
              </PremiumCard>
            )}

            {/* ── ACTION BUTTONS ── */}
            <PremiumCard>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <PremiumButton
                    icon={PlayCircle}
                    onClick={() => navigate("/live")}
                  >
                    Watch Live
                  </PremiumButton>
                  <PremiumButton
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => navigate("/toffee-coupon")}
                  >
                    Watch live on Toffee
                  </PremiumButton>
                  <PremiumButton
                    icon={Trophy}
                    variant="secondary"
                    onClick={() => navigate("/predict")}
                  >
                    Predict Now
                  </PremiumButton>
                </div>
              </div>
            </PremiumCard>

            {lastUpdated && (
              <p className="text-center text-[#1A1A2E]/30 text-[10px]">
                Updated{" "}
                {lastUpdated.toLocaleTimeString("en-BD", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                BST · auto-refreshes every 30s
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
