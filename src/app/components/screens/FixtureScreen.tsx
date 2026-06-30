import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Calendar, Clock, Loader2 } from "lucide-react";
import bgDesktop from "../../../imports/Fifa_Worldcup_bg_Desktop.png";
import bgMobile from "../../../imports/Fifa_Worldcup_bg_mobile.png";
import { fetchAllFixtures, type WcFixture } from "@/app/lib/fixtures";
import FixtureDetailDrawer from "./FixtureDetailDrawer";

export default function FixtureScreen() {
  const navigate = useNavigate();
  const [fixtures, setFixtures] = useState<WcFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFixture, setSelectedFixture] = useState<WcFixture | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dateSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  function openDetail(f: WcFixture) {
    setSelectedFixture(f);
    setDrawerOpen(true);
  }

  useEffect(() => {
    fetchAllFixtures()
      .then(setFixtures)
      .catch((e) => setError(e.message ?? "Failed to load fixtures"))
      .finally(() => setLoading(false));
  }, []);

  // Auto-scroll to today's date section once fixtures are loaded
  useEffect(() => {
    if (loading || fixtures.length === 0) return;
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const ref = dateSectionRefs.current[today];
    if (ref) {
      ref.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // If today has no matches, scroll to the nearest upcoming date
      const upcoming = sortedDates.find((d) => d >= today);
      if (upcoming) {
        dateSectionRefs.current[upcoming]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [loading, fixtures]); // eslint-disable-line react-hooks/exhaustive-deps

  // Group by BD date
  const groupedByDate = fixtures.reduce<
    Record<string, { label: string; fixtures: WcFixture[] }>
  >((acc, f) => {
    const key = f.match_date;
    if (!acc[key]) acc[key] = { label: f.match_date_label, fixtures: [] };
    acc[key].fixtures.push(f);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort();

  return (
    <div className="min-h-screen pb-8 relative overflow-hidden">
      {/* Background */}
      <img
        src={bgDesktop}
        alt=""
        className="hidden sm:block fixed inset-0 w-full h-full object-cover object-center z-0 pointer-events-none"
      />
      <img
        src={bgMobile}
        alt=""
        className="sm:hidden fixed inset-0 w-full h-full object-cover object-center z-0 pointer-events-none"
      />
      <div className="fixed inset-0 z-0 bg-black/30 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/15 sticky top-0 z-10 bg-black/40 backdrop-blur-md">
        <button
          onClick={() => navigate("/home")}
          className="text-white w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#1E90FF]" />
          <h1 className="text-lg font-black text-white">FIFA World Cup 2026</h1>
        </div>
        <div className="w-11" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 py-4 max-w-2xl mx-auto space-y-6">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-white/70 text-sm">{error}</div>
        )}

        {!loading &&
          !error &&
          sortedDates.map((date) => {
            const { label, fixtures: dayFixtures } = groupedByDate[date];
            const [month, day] = label.split(" ");
            return (
              <div key={date} ref={(el) => { dateSectionRefs.current[date] = el; }}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2 bg-[#1E90FF] text-white px-3 py-1.5 rounded-full shadow">
                    <Calendar className="w-3 h-3" />
                    <span className="text-xs font-bold">
                      {month} {day}, 2026
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-white/25" />
                  <span className="text-white/60 text-xs">
                    {dayFixtures.length} match
                    {dayFixtures.length !== 1 ? "es" : ""}
                  </span>
                </div>

                {/* Match list */}
                <div className="space-y-2">
                  {dayFixtures.map((f) => {
                    const isDone = f.status === "done";
                    const isLive = f.status === "live";
                    const groupLabel = f.group_name ?? f.stage;

                    // Map Sportmonks state_id to a human-readable period label
                    // 2=1st Half, 3=HT, 4=2nd Half, 5=FT, 6=ET 1st, 10=ET Break, 11=ET 2nd, 12=Penalties, 13=ET HT
                    const isFtState =
                      f.state_id === 5 ||
                      f.state_id === 7 ||
                      f.state_id === 8 ||
                      f.state_id === 9;
                    const periodLabel = (() => {
                      if (!isLive) return null;
                      if (isFtState) return "Full Time";
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
                    const isHalfTime = f.state_id === 3 || f.state_id === 13;
                    const isEffectivelyDone = isDone || isFtState;

                    return (
                      <div
                        key={f.id}
                        onClick={() => isEffectivelyDone && openDetail(f)}
                        className={`backdrop-blur-md rounded-xl border shadow-sm flex items-center px-3 py-3 gap-3 transition-all ${
                          isEffectivelyDone
                            ? "bg-white/25 border-white/40 cursor-pointer hover:bg-white/35 active:scale-[0.985]"
                            : isLive && isHalfTime
                              ? "bg-yellow-500/20 border-yellow-400/50"
                              : isLive
                                ? "bg-red-500/20 border-red-400/50"
                                : "bg-white/15 border-white/25"
                        }`}
                      >
                        {/* Home team */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-9 h-6 rounded overflow-hidden border border-black/10 flex-shrink-0 bg-gray-50">
                            <img
                              src={
                                f.home_flag ??
                                `https://flagcdn.com/w80/${f.home_code.toLowerCase()}.png`
                              }
                              alt={f.home_team}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                          <span className="text-white font-bold text-xs sm:text-sm truncate">
                            {f.is_placeholder ? f.home_code : f.home_team}
                          </span>
                        </div>

                        {/* Centre — score or VS */}
                        <div className="flex flex-col items-center gap-0.5 flex-shrink-0 min-w-[72px] max-w-[80px] text-center">
                          {isEffectivelyDone && f.home_score !== null ? (
                            <>
                              <div className="flex items-center gap-1">
                                <span className="text-white font-black text-lg leading-none">
                                  {f.home_score}
                                </span>
                                <span className="text-white/60 font-bold text-sm">
                                  –
                                </span>
                                <span className="text-white font-black text-lg leading-none">
                                  {f.away_score}
                                </span>
                              </div>
                              <span className="text-green-300 text-[9px] font-bold tracking-wide uppercase">
                                Full Time
                              </span>
                              <span className="text-white/50 text-[9px]">
                                {groupLabel}
                              </span>
                              <span className="text-white/35 text-[8px] font-semibold tracking-wide">
                                Stats ›
                              </span>
                            </>
                          ) : isLive ? (
                            <>
                              <div
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${isHalfTime ? "bg-yellow-500" : "bg-red-500"}`}
                              >
                                {!isHalfTime && (
                                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                )}
                                <span className="text-white text-[10px] font-black uppercase">
                                  {periodLabel}
                                </span>
                              </div>
                              {f.home_score !== null && (
                                <div className="flex items-center gap-1">
                                  <span className="text-white font-black text-base leading-none">
                                    {f.home_score}
                                  </span>
                                  <span className="text-white/60 text-sm">
                                    –
                                  </span>
                                  <span className="text-white font-black text-base leading-none">
                                    {f.away_score}
                                  </span>
                                </div>
                              )}
                              {!isHalfTime && (
                                <div className="flex items-center gap-0.5 text-white/70 text-[10px] font-semibold">
                                  <Clock className="w-2.5 h-2.5" />
                                  {f.match_time}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="text-white/60 text-[11px] font-black">
                                VS
                              </span>
                              <div className="flex items-center gap-0.5 text-white/70 text-[10px] font-semibold">
                                <Clock className="w-2.5 h-2.5" />
                                {f.match_time}
                              </div>
                              <span className="text-white/60 text-[9px] font-bold tracking-wide">
                                {groupLabel} · BST
                              </span>
                            </>
                          )}
                        </div>

                        {/* Away team */}
                        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                          <span className="text-white font-bold text-xs sm:text-sm truncate text-right">
                            {f.is_placeholder ? f.away_code : f.away_team}
                          </span>
                          <div className="w-9 h-6 rounded overflow-hidden border border-black/10 flex-shrink-0 bg-gray-50">
                            <img
                              src={
                                f.away_flag ??
                                `https://flagcdn.com/w80/${f.away_code.toLowerCase()}.png`
                              }
                              alt={f.away_team}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      <FixtureDetailDrawer
        fixture={selectedFixture}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
