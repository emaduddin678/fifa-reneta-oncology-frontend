import image_Asset_1_3 from "@/imports/Asset_1.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Trophy,
  Clock,
  CheckCircle,
  Loader2,
  History,
} from "lucide-react";
import { toast } from "sonner";
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
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  matchStarted: boolean;
}) {
  function handleClick(delta: number) {
    if (matchStarted) {
      toast.error("Match has finished — predictions are closed");
      return;
    }
    onChange(delta > 0 ? Math.min(20, value + 1) : Math.max(0, value - 1));
  }

  return (
    <div className="text-center">
      <p className="text-[#1A1A2E]/70 text-xs sm:text-sm mb-2 font-semibold">
        {label}
      </p>
      <div className="flex flex-col gap-2 items-center">
        <button
          onClick={() => handleClick(1)}
          className="w-14 h-11 sm:w-16 sm:h-12 bg-gray-100 border border-black/10 rounded-lg text-[#1A1A2E] text-lg sm:text-xl min-h-[44px] font-bold"
        >
          +
        </button>
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#1E90FF] to-[#0066CC] rounded-xl flex items-center justify-center shadow">
          <span className="text-white text-2xl sm:text-3xl font-bold">
            {value}
          </span>
        </div>
        <button
          onClick={() => handleClick(-1)}
          className="w-14 h-11 sm:w-16 sm:h-12 bg-gray-100 border border-black/10 rounded-lg text-[#1A1A2E] text-lg sm:text-xl min-h-[44px] font-bold"
        >
          −
        </button>
      </div>
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
      className={`border rounded-2xl p-4 sm:p-5 ${
        submitted
          ? "bg-white/95 border-[#1E90FF]/40"
          : "bg-white/95 border-black/15"
      }`}
    >
      {/* Match header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] sm:text-xs font-bold text-[#1A1A2E]/50 uppercase tracking-wide">
          {match.group}
        </span>
        <div className="flex items-center gap-1 text-[#1A1A2E]/50">
          <Clock className="w-3 h-3" />
          <span className="text-[10px] sm:text-xs">{match.time} BST</span>
        </div>
      </div>

      {/* Teams row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <img
            src={match.homeFlag}
            alt={match.homeName}
            className="w-8 h-6 rounded object-cover border border-black/10 flex-shrink-0"
          />
          <span className="font-bold text-[#1A1A2E] text-sm sm:text-base truncate">
            {match.homeName}
          </span>
        </div>
        <span className="text-[#1A1A2E]/40 font-black text-xs">VS</span>
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="font-bold text-[#1A1A2E] text-sm sm:text-base truncate text-right">
            {match.awayName}
          </span>
          <img
            src={match.awayFlag}
            alt={match.awayName}
            className="w-8 h-6 rounded object-cover border border-black/10 flex-shrink-0"
          />
        </div>
      </div>

      {/* Locked prediction or score pickers */}
      {submitted ? (
        <div className="flex items-center justify-center gap-3 py-2">
          <CheckCircle className="w-5 h-5 text-[#1E90FF] flex-shrink-0" />
          <span className="text-[#1A1A2E] font-bold text-lg">
            {existingPrediction.home_score} – {existingPrediction.away_score}
          </span>
          <span className="text-[#1A1A2E]/50 text-xs">Prediction locked</span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-4 sm:gap-8 mb-4">
            <ScoreStepper
              label={match.homeName}
              value={homeScore}
              onChange={setHomeScore}
              matchStarted={started}
            />
            <div className="text-3xl sm:text-4xl text-[#1A1A2E]/30 font-black">
              :
            </div>
            <ScoreStepper
              label={match.awayName}
              value={awayScore}
              onChange={setAwayScore}
              matchStarted={started}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-[#1E90FF] to-[#0066CC] text-white rounded-xl font-bold text-sm min-h-[44px] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit Prediction"
            )}
          </button>
        </>
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
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white/95 backdrop-blur-md border-b border-black/15 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="text-[#1A1A2E] w-11 h-11 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
          <img
            src={image_Asset_1_3}
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E90FF]" />
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8 max-w-2xl mx-auto">

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#1E90FF]" />
          </div>
        ) : (
          <>
            {/* ── TODAY'S OPEN MATCHES ── */}
            {todayMatches.length > 0 && (
              <div>
                <h2 className="text-[#1A1A2E] font-black text-base sm:text-lg mb-1 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#1E90FF]" />
                  Today's Matches
                </h2>
                <p className="text-[#1A1A2E]/50 text-xs mb-3">{today}</p>
                <div className="space-y-3">
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
                <h2 className="text-[#1A1A2E] font-black text-base sm:text-lg mb-1 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#1E90FF]" />
                  Upcoming Matches
                </h2>
                <p className="text-[#1A1A2E]/50 text-xs mb-3">
                  {nextDate} — predict before kickoff!
                </p>
                {nextMatches.length === 0 ? (
                  <div className="bg-white/95 border border-black/15 rounded-2xl p-6 text-center">
                    <p className="text-[#1A1A2E]/60 text-sm">No matches scheduled.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
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
                <h2 className="text-[#1A1A2E] font-black text-base sm:text-lg mb-3 flex items-center gap-2">
                  <History className="w-5 h-5 text-[#1E90FF]" />
                  My Predictions
                </h2>

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
                          className={`border rounded-xl px-4 py-3 flex items-center gap-3 ${
                            isWin
                              ? "bg-amber-50 border-amber-300"
                              : "bg-white/95 border-black/15"
                          }`}
                        >
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {p.home_flag && (
                              <img
                                src={p.home_flag}
                                alt={p.home_team}
                                className="w-7 h-5 rounded object-cover border border-black/10"
                              />
                            )}
                            {p.away_flag && (
                              <img
                                src={p.away_flag}
                                alt={p.away_team}
                                className="w-7 h-5 rounded object-cover border border-black/10"
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-[#1A1A2E] font-bold text-xs sm:text-sm truncate">
                              {p.home_team} vs {p.away_team}
                            </p>
                            <p className="text-[#1A1A2E]/50 text-[10px] sm:text-xs">
                              {p.match_date.slice(0, 10)}
                              {p.match_time ? ` · ${p.match_time} BST` : ""}
                            </p>
                          </div>

                          {isWin && (
                            <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0" />
                          )}

                          <div
                            className={`rounded-lg px-3 py-1.5 flex-shrink-0 ${
                              isWin
                                ? "bg-gradient-to-br from-amber-400 to-amber-600"
                                : "bg-gradient-to-br from-[#1E90FF] to-[#0066CC]"
                            }`}
                          >
                            <span className="text-white font-black text-sm">
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
