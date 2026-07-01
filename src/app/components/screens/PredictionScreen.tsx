import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Trophy,
  Clock,
  CheckCircle,
  History,
} from "lucide-react";
import { toast } from "sonner";
import PremiumBackground from "../PremiumBackground";
import { matchKey, type Match } from "@/app/lib/matches";
import { fetchAllFixtures, wcFixtureToMatch } from "@/app/lib/fixtures";
import {
  submitPrediction,
  fetchMyPredictions,
  fetchMatchResults,
  type Prediction,
  type MatchResult,
} from "@/app/lib/predictions";

// All fixture times are BD time (UTC+6). Returns true if kickoff has passed.
function hasMatchStarted(matchDate: string, matchTime: string): boolean {
  const [time, period] = matchTime.split(" ");
  const [hStr, mStr] = time.split(":");
  let hour = parseInt(hStr, 10);
  const minute = parseInt(mStr, 10);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  const [y, mo, d] = matchDate.split("-").map(Number);
  const kickoffUtcMs = Date.UTC(y, mo - 1, d, hour - 6, minute);
  return Date.now() >= kickoffUtcMs;
}

// Returns today's date in BD time (UTC+6) as "YYYY-MM-DD"
function todayInBD(): string {
  const now = new Date();
  const bdMs = now.getTime() + 6 * 60 * 60 * 1000;
  return new Date(bdMs).toISOString().slice(0, 10);
}

// Returns tomorrow's date in BD time (UTC+6) as "YYYY-MM-DD"
function tomorrowInBD(): string {
  const now = new Date();
  const bdMs = now.getTime() + 6 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000;
  return new Date(bdMs).toISOString().slice(0, 10);
}

// ---------- Score stepper sub-component ----------
function ScoreStepper({
  label,
  value,
  onChange,
  matchStarted,
  accent,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  matchStarted: boolean;
  accent: "green" | "blue";
}) {
  function handleClick(delta: number) {
    if (matchStarted) {
      toast.error("Match has finished — predictions are closed");
      return;
    }
    onChange(delta > 0 ? Math.min(20, value + 1) : Math.max(0, value - 1));
  }

  const boxClasses =
    accent === "green"
      ? "bg-[#34D399]/10 border-[#34D399]/30 shadow-[0_0_20px_rgba(52,211,153,0.1)]"
      : "bg-[#1E90FF]/10 border-[#1E90FF]/30 shadow-[0_0_20px_rgba(30,144,255,0.1)]";
  const textClasses = accent === "green" ? "text-[#34D399]" : "text-[#1E90FF]";
  const incrementHover =
    accent === "green"
      ? "hover:bg-[#34D399]/10 hover:border-[#34D399]/30 hover:text-[#34D399]"
      : "hover:bg-[#1E90FF]/10 hover:border-[#1E90FF]/30 hover:text-[#1E90FF]";

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-white/30 text-[10px] uppercase tracking-widest">
        {label}
      </span>
      <button
        onClick={() => handleClick(1)}
        className={`w-9 h-9 rounded-xl bg-white/[0.07] border border-white/10 text-white/60 active:scale-95 transition-all text-lg font-black flex items-center justify-center ${incrementHover}`}
      >
        +
      </button>
      <div
        className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${boxClasses}`}
      >
        <span className={`font-black text-2xl ${textClasses}`}>{value}</span>
      </div>
      <button
        onClick={() => handleClick(-1)}
        className="w-9 h-9 rounded-xl bg-white/[0.07] border border-white/10 text-white/60 hover:bg-red-500/10 hover:border-red-400/30 hover:text-red-400 active:scale-95 transition-all text-lg font-black flex items-center justify-center"
      >
        −
      </button>
    </div>
  );
}

// ---------- Single match prediction card ----------
function MatchPredictionCard({
  match,
  existingPrediction,
  started,
  onSubmitted,
}: {
  match: Match;
  existingPrediction: Prediction | undefined;
  started: boolean;
  onSubmitted: (p: Prediction) => void;
}) {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const submitted = !!existingPrediction;

  // Match started + no prediction → hide card entirely
  if (started && !submitted) return null;

  async function handleSubmit() {
    if (started) {
      toast.error("Match has finished — predictions are closed");
      return;
    }
    setSubmitting(true);
    try {
      const saved = await submitPrediction(match, homeScore, awayScore);
      toast.success(
        `Prediction saved: ${match.homeName} ${homeScore} – ${awayScore} ${match.awayName}`,
      );
      onSubmitted(saved);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`bg-[#0D1526] border rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)] ${
        submitted ? "border-[#34D399]/25" : "border-white/[0.08]"
      }`}
    >
      {/* Stage + kickoff time strip */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/[0.05]">
        <div className="bg-[#34D399]/10 border border-[#34D399]/20 rounded-full px-2.5 py-0.5">
          <span className="text-[#34D399] text-[9px] font-black tracking-widest uppercase">
            {match.group}
          </span>
        </div>
        <div className="flex items-center gap-1 text-white/30">
          <Clock className="w-3 h-3" />
          <span className="text-[10px] font-medium">{match.time} BST</span>
        </div>
      </div>

      {/* Teams row */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <img
            src={match.homeFlag}
            alt={match.homeName}
            className="w-6 h-4 rounded-sm object-cover border border-white/10 flex-shrink-0"
          />
          <span className="text-white font-bold text-sm truncate">
            {match.homeName}
          </span>
        </div>
        <span className="text-white/20 text-xs font-black px-3">VS</span>
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="text-white font-bold text-sm truncate text-right">
            {match.awayName}
          </span>
          <img
            src={match.awayFlag}
            alt={match.awayName}
            className="w-6 h-4 rounded-sm object-cover border border-white/10 flex-shrink-0"
          />
        </div>
      </div>

      {/* Locked prediction or score pickers */}
      {submitted ? (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-center gap-4 py-3">
            <div className="w-14 h-14 rounded-2xl bg-[#34D399]/10 border border-[#34D399]/30 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.1)]">
              <span className="text-[#34D399] font-black text-2xl">
                {existingPrediction.home_score}
              </span>
            </div>
            <span className="text-white/20 text-xl font-black">–</span>
            <div className="w-14 h-14 rounded-2xl bg-[#1E90FF]/10 border border-[#1E90FF]/30 flex items-center justify-center shadow-[0_0_20px_rgba(30,144,255,0.1)]">
              <span className="text-[#1E90FF] font-black text-2xl">
                {existingPrediction.away_score}
              </span>
            </div>
          </div>
          <div className="w-full py-3 rounded-xl bg-[#34D399]/10 border border-[#34D399]/20 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#34D399]" />
            <span className="text-[#34D399] font-bold text-sm">
              Prediction Submitted
            </span>
          </div>
        </div>
      ) : (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-center gap-6 py-4">
            <ScoreStepper
              label={match.homeName}
              value={homeScore}
              onChange={setHomeScore}
              matchStarted={started}
              accent="green"
            />
            <div className="flex flex-col items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>
            <ScoreStepper
              label={match.awayName}
              value={awayScore}
              onChange={setAwayScore}
              matchStarted={started}
              accent="blue"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#34D399]/80 to-[#1E90FF]/80 hover:from-[#34D399] hover:to-[#1E90FF] text-white font-black text-sm tracking-widest uppercase shadow-[0_4px_20px_rgba(52,211,153,0.2)] active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting…</span>
              </div>
            ) : (
              "Submit Prediction"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- Main screen ----------
export default function PredictionScreen() {
  const navigate = useNavigate();

  const today = todayInBD();
  const tomorrow = tomorrowInBD();

  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [results, setResults] = useState<Record<string, MatchResult>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAllFixtures(),
      fetchMyPredictions(),
      fetchMatchResults(),
    ])
      .then(([fixtures, preds, res]) => {
        // Only include non-placeholder group stage matches for predictions
        const matches = fixtures
          .filter((f) => !f.is_placeholder)
          .map(wcFixtureToMatch);
        setAllMatches(matches);
        setPredictions(preds);
        const map: Record<string, MatchResult> = {};
        res.forEach((r: MatchResult) => {
          map[r.match_key] = r;
        });
        setResults(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Today's matches — card-level logic hides started+unpredicted ones automatically
  const todayMatches = allMatches.filter((m) => m.date === today);

  // Next-day matches: tomorrow if scheduled, else the next available date
  const allDates = Array.from(new Set(allMatches.map((m) => m.date))).sort();
  const futureDates = allDates.filter((d) => d >= tomorrow);
  const nextDate = futureDates.length > 0 ? futureDates[0] : null;
  const nextMatches = nextDate
    ? allMatches.filter((m) => m.date === nextDate)
    : [];

  function handleNewPrediction(p: Prediction) {
    setPredictions((prev) => [...prev, p]);
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] relative pb-12">
      {/* Background — matches HomeDashboard */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0E1A] via-[#10172A] to-[#0A0E1A]" />
      </div>
      <div className="opacity-[0.04] fixed inset-0 pointer-events-none z-0">
        <PremiumBackground />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-[#0A0E1A]/80 backdrop-blur-md border-b border-white/[0.07]">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/10 text-white/70 hover:text-white active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#34D399] rounded-full" />
          <span className="text-sm font-black text-white tracking-widest uppercase">
            Predictions
          </span>
          <div className="w-1 h-4 bg-[#34D399] rounded-full" />
        </div>

        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20">
          <Trophy className="w-4 h-4 text-[#FFD700]" />
        </div>
      </div>

      <div className="relative z-10 px-0 sm:px-0 py-4 sm:py-6 space-y-6 sm:space-y-8 max-w-2xl mx-auto">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="mx-4 sm:mx-6 bg-[#0D1526] border border-white/[0.06] rounded-2xl p-4 animate-pulse"
              >
                <div className="h-3 bg-white/[0.06] rounded w-1/3 mb-3" />
                <div className="h-8 bg-white/[0.06] rounded mb-3" />
                <div className="flex justify-center gap-8">
                  <div className="w-14 h-14 bg-white/[0.06] rounded-2xl" />
                  <div className="w-14 h-14 bg-white/[0.06] rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* ── TODAY'S OPEN MATCHES ── */}
            {todayMatches.length > 0 && (
              <div>
                <div className="flex items-center gap-3 px-4 sm:px-6 mb-3">
                  <div className="w-1 h-5 bg-[#34D399] rounded-full" />
                  <div>
                    <h2 className="text-white font-black text-base tracking-tight">
                      Today's Matches
                    </h2>
                    <p className="text-white/30 text-[10px] font-medium mt-0.5">
                      {today}
                    </p>
                  </div>
                </div>
                <div className="space-y-3 px-4 sm:px-6">
                  {todayMatches.map((match) => (
                    <MatchPredictionCard
                      key={matchKey(match)}
                      match={match}
                      existingPrediction={predictions.find(
                        (p) => p.match_key === matchKey(match),
                      )}
                      started={hasMatchStarted(match.date, match.time)}
                      onSubmitted={handleNewPrediction}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── UPCOMING MATCHES (tomorrow / next scheduled day) ── */}
            {nextDate && (
              <div>
                <div className="flex items-center gap-3 px-4 sm:px-6 mb-3">
                  <div className="w-1 h-5 bg-[#1E90FF] rounded-full" />
                  <div>
                    <h2 className="text-white font-black text-base tracking-tight">
                      Upcoming Matches
                    </h2>
                    <p className="text-white/30 text-[10px] font-medium mt-0.5">
                      {nextDate} — predict before kickoff!
                    </p>
                  </div>
                </div>
                {nextMatches.length === 0 ? (
                  <div className="mx-4 sm:mx-6 py-8 text-center bg-[#0D1526] border border-white/[0.07] rounded-2xl">
                    <p className="text-white/20 text-sm">No matches scheduled.</p>
                  </div>
                ) : (
                  <div className="space-y-3 px-4 sm:px-6">
                    {nextMatches.map((match) => (
                      <MatchPredictionCard
                        key={matchKey(match)}
                        match={match}
                        existingPrediction={predictions.find(
                          (p) => p.match_key === matchKey(match),
                        )}
                        started={hasMatchStarted(match.date, match.time)}
                        onSubmitted={handleNewPrediction}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── MY PREDICTIONS HISTORY ── */}
            {predictions.length > 0 && (
              <div>
                <div className="flex items-center gap-3 px-4 sm:px-6 mb-3">
                  <div className="w-1 h-5 bg-[#FFD700] rounded-full" />
                  <div className="flex items-center gap-1.5">
                    <History className="w-4 h-4 text-white/40" />
                    <h2 className="text-white font-black text-base tracking-tight">
                      My Predictions
                    </h2>
                  </div>
                </div>

                <div className="space-y-2">
                  {predictions
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(b.match_date).getTime() -
                        new Date(a.match_date).getTime(),
                    )
                    .map((p) => {
                      const result = results[p.match_key];
                      const isWin =
                        result !== undefined &&
                        result.home_score === p.home_score &&
                        result.away_score === p.away_score;
                      return (
                        <div
                          key={p.id}
                          className={`mx-4 sm:mx-6 rounded-xl px-4 py-3 flex items-center gap-3 transition-colors ${
                            isWin
                              ? "bg-[#FFD700]/[0.08] border border-[#FFD700]/30"
                              : "bg-[#0D1526] border border-white/[0.07] hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {p.home_flag && (
                              <img
                                src={p.home_flag}
                                alt={p.home_team}
                                className="w-5 h-3.5 rounded-sm object-cover border border-white/10"
                              />
                            )}
                            {p.away_flag && (
                              <img
                                src={p.away_flag}
                                alt={p.away_team}
                                className="w-5 h-3.5 rounded-sm object-cover border border-white/10"
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-white/80 text-xs sm:text-sm font-semibold truncate">
                              {p.home_team} vs {p.away_team}
                            </p>
                            <p className="text-white/30 text-[10px] sm:text-xs mt-0.5">
                              {p.match_date.slice(0, 10)}
                              {p.match_time ? ` · ${p.match_time} BST` : ""}
                            </p>
                          </div>

                          {isWin && (
                            <Trophy className="w-4 h-4 text-[#FFD700] flex-shrink-0" />
                          )}

                          <div
                            className={`rounded-full px-3 py-1 flex-shrink-0 border ${
                              isWin
                                ? "bg-[#FFD700]/15 border-[#FFD700]/30"
                                : "bg-[#1E90FF]/10 border-[#1E90FF]/25"
                            }`}
                          >
                            <span
                              className={`font-black text-xs ${
                                isWin ? "text-[#FFD700]" : "text-[#1E90FF]"
                              }`}
                            >
                              {p.home_score} – {p.away_score}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
