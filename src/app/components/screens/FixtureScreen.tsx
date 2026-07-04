import { useState, useEffect, useRef } from "react";

import bgMobile from "@/imports/Fifa_Worldcup_bg_mobile.png";
import bgDesktop from "@/imports/Fifa_Worldcup_bg_Desktop.png";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  ChevronDown,
  Clock,
  Globe,
  Loader2,
  X,
} from "lucide-react";
import PremiumBackground from "../PremiumBackground";
import { fetchAllFixtures, type WcFixture } from "@/app/lib/fixtures";
import FixtureDetailDrawer from "./FixtureDetailDrawer";

export default function FixtureScreen() {
  const navigate = useNavigate();
  const [fixtures, setFixtures] = useState<WcFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFixture, setSelectedFixture] = useState<WcFixture | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [todayKey, setTodayKey] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const todayRef = useRef<HTMLDivElement>(null);

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

  // Find today's date group (BD timezone), falling back to the nearest upcoming date
  useEffect(() => {
    if (loading || fixtures.length === 0) return;
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Dhaka",
    });
    const matchingKey =
      allSortedDates.find((d) => d === today) ??
      allSortedDates.find((d) => d >= today) ??
      null;
    setTodayKey(matchingKey);
  }, [loading, fixtures]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to today's date group once it's known
  useEffect(() => {
    if (!todayKey || !todayRef.current) return;
    const t = setTimeout(() => {
      todayRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
    return () => clearTimeout(t);
  }, [todayKey]);

  // Group all (unfiltered) fixtures by BD date — powers the date filter options
  // and the today-key lookup, independent of whatever filters are active.
  const allGroupedByDate = fixtures.reduce<
    Record<string, { label: string; fixtures: WcFixture[] }>
  >((acc, f) => {
    const key = f.match_date;
    if (!acc[key]) acc[key] = { label: f.match_date_label, fixtures: [] };
    acc[key].fixtures.push(f);
    return acc;
  }, {});
  const allSortedDates = Object.keys(allGroupedByDate).sort();

  // Unique countries appearing in the schedule, for the country filter dropdown
  const countryOptions = (() => {
    const map = new Map<string, string>();
    fixtures.forEach((f) => {
      if (!map.has(f.home_code)) {
        map.set(f.home_code, f.is_placeholder ? f.home_code : f.home_team);
      }
      if (!map.has(f.away_code)) {
        map.set(f.away_code, f.is_placeholder ? f.away_code : f.away_team);
      }
    });
    return Array.from(map.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  })();

  const hasActiveFilters = countryFilter !== "all" || dateFilter !== "all";

  const filteredFixtures = fixtures.filter((f) => {
    const matchesCountry =
      countryFilter === "all" ||
      f.home_code === countryFilter ||
      f.away_code === countryFilter;
    const matchesDate = dateFilter === "all" || f.match_date === dateFilter;
    return matchesCountry && matchesDate;
  });

  // Group filtered fixtures by BD date — this is what actually renders
  const groupedByDate = filteredFixtures.reduce<
    Record<string, { label: string; fixtures: WcFixture[] }>
  >((acc, f) => {
    const key = f.match_date;
    if (!acc[key]) acc[key] = { label: f.match_date_label, fixtures: [] };
    acc[key].fixtures.push(f);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort();

  return (
    <div className="min-h-screen pb-8 relative bg-[#0A0E1A]">
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

      {/* Header — stays pinned on scroll, filters live inside it */}
      <div className="sticky top-0 z-20 bg-[#0A0E1A]/80 backdrop-blur-md border-b border-white/[0.07]">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <button
            onClick={() => navigate("/home")}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1E90FF] rounded-full" />
            <h1 className="text-sm font-black text-white tracking-widest uppercase">
              Fixture
            </h1>
            <div className="w-1 h-4 bg-[#1E90FF] rounded-full" />
          </div>

          <div className="w-10" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pb-3 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Globe className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full appearance-none bg-white/[0.06] border border-white/10 rounded-full pl-8 pr-7 py-2 text-[11px] font-semibold text-white/80 truncate focus:outline-none focus:border-[#1E90FF]/50 focus:ring-2 focus:ring-[#1E90FF]/15"
            >
              <option value="all" className="bg-[#0D1526] text-white">
                All Countries
              </option>
              {countryOptions.map((c) => (
                <option
                  key={c.code}
                  value={c.code}
                  className="bg-[#0D1526] text-white"
                >
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-white/30 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative flex-1">
            <CalendarDays className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full appearance-none bg-white/[0.06] border border-white/10 rounded-full pl-8 pr-7 py-2 text-[11px] font-semibold text-white/80 truncate focus:outline-none focus:border-[#1E90FF]/50 focus:ring-2 focus:ring-[#1E90FF]/15"
            >
              <option value="all" className="bg-[#0D1526] text-white">
                All Dates
              </option>
              {allSortedDates.map((d) => (
                <option key={d} value={d} className="bg-[#0D1526] text-white">
                  {allGroupedByDate[d].label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-white/30 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setCountryFilter("all");
                setDateFilter("all");
              }}
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-white/50 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              title="Clear filters"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 px-3 sm:px-6 py-4 max-w-2xl mx-auto space-y-5 pb-10">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#1E90FF]" />
            <span className="text-white/40 text-xs tracking-widest uppercase">
              Loading fixtures...
            </span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-24 gap-2">
            <span className="text-white/30 text-sm">{error}</span>
          </div>
        )}

        {!loading && !error && sortedDates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-white/40 text-sm text-center">
              No matches found for the selected filters.
            </span>
            <button
              onClick={() => {
                setCountryFilter("all");
                setDateFilter("all");
              }}
              className="text-[#1E90FF] text-xs font-bold tracking-wide uppercase"
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          sortedDates.map((date) => {
            const { label, fixtures: dayFixtures } = groupedByDate[date];
            const [month, day] = label.split(" ");
            const isToday = date === todayKey;
            return (
              <div
                key={date}
                ref={isToday ? todayRef : null}
                className="scroll-mt-[108px]"
              >
                {/* Date header */}
                <div className="flex items-center gap-3 mb-2 px-1">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black tracking-widest uppercase ${
                      isToday
                        ? "bg-[#FFD700]/15 border-[#FFD700]/40 text-[#FFD700]"
                        : "bg-[#1E90FF]/10 border-[#1E90FF]/30 text-[#1E90FF]"
                    }`}
                  >
                    <Calendar className="w-3 h-3" />
                    {isToday ? "Today · " : ""}
                    {month} {day}, 2026
                  </div>
                  <div className="flex-1 h-px bg-white/[0.08]" />
                  <span className="text-white/30 text-[10px] font-medium">
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
                        className={`rounded-2xl border flex items-center px-3 py-3 gap-3 transition-all duration-150 ${
                          isEffectivelyDone
                            ? "bg-white/[0.06] border-white/10 cursor-pointer hover:bg-white/[0.09] hover:border-white/15 active:scale-[0.985]"
                            : isLive && isHalfTime
                              ? "bg-[#FFD700]/[0.07] border-[#FFD700]/20"
                              : isLive
                                ? "bg-[#1E90FF]/[0.08] border-[#1E90FF]/25"
                                : "bg-[#0D1526] border-white/[0.07]"
                        }`}
                      >
                        {/* Home team */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-9 h-6 rounded-md overflow-hidden flex-shrink-0 border border-white/10 bg-white/[0.05]">
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
                                <span className="text-white/40 font-bold text-sm">
                                  –
                                </span>
                                <span className="text-white font-black text-lg leading-none">
                                  {f.away_score}
                                </span>
                              </div>
                              <span className="text-[#34D399] text-[9px] font-bold tracking-wide uppercase">
                                Full Time
                              </span>
                              <span className="text-white/35 text-[9px]">
                                {groupLabel}
                              </span>
                              <span className="text-[#1E90FF] text-[9px] font-bold tracking-wide">
                                Stats ›
                              </span>
                            </>
                          ) : isLive ? (
                            <>
                              <div
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${isHalfTime ? "bg-[#FFD700]" : "bg-[#1E90FF]"}`}
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
                                <div className="flex items-center gap-0.5 text-white/50 text-[10px] font-semibold">
                                  <Clock className="w-2.5 h-2.5" />
                                  {f.match_time}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="text-white/30 text-[11px] font-black">
                                VS
                              </span>
                              <div className="flex items-center gap-0.5 text-white/50 text-[10px] font-semibold">
                                <Clock className="w-2.5 h-2.5" />
                                {f.match_time}
                              </div>
                              <span className="text-white/30 text-[9px] font-bold tracking-wide">
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
                          <div className="w-9 h-6 rounded-md overflow-hidden flex-shrink-0 border border-white/10 bg-white/[0.05]">
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
