import { useState, useEffect } from "react";
import { X, Loader2, BarChart2, Zap } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
} from "@/app/components/ui/drawer";
import { fetchFixtureById, type WcFixture } from "@/app/lib/fixtures";

// ── Sportmonks response types ────────────────────────────────────────────────

interface SmEvent {
  type_id?: number | null;
  minute?: number | null;
  extra_minute?: number | null;
  player_name?: string | null;
  related_player_name?: string | null;
  addition?: string | null;
  location?: string | null;
  participant?: string | null;
  type?: { name?: string | null } | null;
}

interface SmStat {
  type?: { name?: string | null } | null;
  data?: { value?: string | number | null } | null;
  location?: string | null;
  participant?: string | null;
}

interface MatchStats {
  statistics?: SmStat[] | { data?: SmStat[] };
  events?: SmEvent[] | { data?: SmEvent[] };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

// Normalise Sportmonks includes that may be paginated { data: [...] } or flat []
function toArray<T>(val: T[] | { data?: T[] } | null | undefined): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return val.data ?? [];
}

function parseNum(v: string | number | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  return parseFloat(String(v).replace("%", "")) || 0;
}

// Sportmonks v3 event type_id → display key mapping (fallback when type.name absent)
const TYPE_ID_NAME: Record<number, string> = {
  14:  "GOAL",
  15:  "REDCARD",
  16:  "YELLOWREDCARD",
  17:  "OWNGOAL",
  18:  "MISSEDPENALTY",
  19:  "YELLOWCARD",
  45:  "PENALTYGOAL",
  55:  "PENALTYGOAL",
  1:   "SUBSTITUTION",
  58:  "SUBSTITUTION",
};

const EVENT_ICON: Record<string, string> = {
  GOAL:          "⚽",
  PENALTYGOAL:   "⚽",
  OWNGOAL:       "⚽",
  YELLOWCARD:    "🟨",
  REDCARD:       "🟥",
  YELLOWREDCARD: "🟨🟥",
  MISSEDPENALTY: "✖️",
  PENALTYMISSED: "✖️",
};

function resolveTypeName(e: SmEvent): string {
  return (e.type?.name ?? TYPE_ID_NAME[e.type_id ?? -1] ?? "").toUpperCase();
}

function getEventIcon(e: SmEvent): string {
  return EVENT_ICON[resolveTypeName(e)] ?? "•";
}

function getEventNote(e: SmEvent): string {
  const t = resolveTypeName(e);
  if (t === "OWNGOAL")                        return " (OG)";
  if (t === "MISSEDPENALTY" || t === "PENALTYMISSED") return " (pen missed)";
  if (t === "PENALTYGOAL")                    return " (pen)";
  return "";
}

function minuteLabel(e: SmEvent): string {
  const extra = e.extra_minute ? `+${e.extra_minute}` : "";
  return `${e.minute ?? "?"}${extra}'`;
}

// Priority order — any stat not in this list appears after these
const PRIORITY_STATS = [
  "Ball Possession",
  "Shots on Goal",
  "Shots on target",
  "Total Shots",
  "Shots Off Target",
  "Corner Kicks",
  "Yellow Cards",
  "Red Cards",
  "Fouls",
  "Offsides",
  "Saves",
  "Crosses",
  "Passes",
  "Attacks",
  "Dangerous Attacks",
];

function buildStatPairs(
  rawStats: SmStat[] | { data?: SmStat[] } | null | undefined,
): { name: string; home: string | number; away: string | number }[] {
  const stats = toArray(rawStats);
  const map = new Map<string, { home?: string | number; away?: string | number }>();

  for (const s of stats) {
    const name = s.type?.name;
    if (!name) continue;
    const side = s.location ?? s.participant;
    if (!side) continue;
    if (!map.has(name)) map.set(name, {});
    const entry = map.get(name)!;
    if (side === "home") entry.home = s.data?.value ?? 0;
    if (side === "away") entry.away = s.data?.value ?? 0;
  }

  const allNames = [...map.keys()];
  const ordered = [
    ...PRIORITY_STATS.filter((k) => map.has(k)),
    ...allNames.filter((k) => !PRIORITY_STATS.includes(k)),
  ];

  return ordered
    .filter((k) => {
      const { home = 0, away = 0 } = map.get(k)!;
      return parseNum(home) > 0 || parseNum(away) > 0;
    })
    .map((k) => ({
      name: k,
      home: map.get(k)!.home ?? 0,
      away: map.get(k)!.away ?? 0,
    }));
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatRow({
  name,
  home,
  away,
}: {
  name: string;
  home: string | number;
  away: string | number;
}) {
  const h = parseNum(home);
  const a = parseNum(away);
  const isPct = name.toLowerCase().includes("possession");
  const total = h + a;
  const homeW = isPct ? h : total === 0 ? 50 : Math.round((h / total) * 100);
  const awayW = isPct ? a : total === 0 ? 50 : Math.round((a / total) * 100);
  const homeDisplay = isPct ? `${h}%` : String(h);
  const awayDisplay = isPct ? `${a}%` : String(a);

  return (
    <div className="py-3.5 border-b border-white/8 last:border-0">
      {/* Numbers + label row */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-white font-black text-xl tabular-nums w-14">
          {homeDisplay}
        </span>
        <span className="text-white/45 text-[10px] font-bold uppercase tracking-wider text-center flex-1 px-2">
          {name}
        </span>
        <span className="text-white font-black text-xl tabular-nums w-14 text-right">
          {awayDisplay}
        </span>
      </div>

      {/* Proportional bar — full width, blue home / white-faded away */}
      <div className="flex h-[5px] rounded-full overflow-hidden gap-px">
        <div
          className="h-full bg-[#1E90FF] rounded-l-full transition-all duration-500"
          style={{ width: `${homeW}%` }}
        />
        <div
          className="h-full bg-white/30 rounded-r-full transition-all duration-500"
          style={{ width: `${awayW}%` }}
        />
      </div>
    </div>
  );
}

function EventTimeline({
  rawEvents,
  homeCode,
  awayCode,
  homeFlagUrl,
  awayFlagUrl,
}: {
  rawEvents: SmEvent[] | { data?: SmEvent[] } | null | undefined;
  homeCode: string;
  awayCode: string;
  homeFlagUrl: string;
  awayFlagUrl: string;
}) {
  const events = toArray(rawEvents);

  const keyEvents = events
    .filter((e) => {
      const t = resolveTypeName(e);
      const isSub = t === "SUBSTITUTION";
      const hasType = t !== "" || e.type_id != null;
      const hasSide = !!(e.location ?? e.participant);
      return !isSub && hasType && hasSide;
    })
    .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));

  if (keyEvents.length === 0) {
    // Check if there ARE events but they're all substitutions/untyped
    const anyEvents = events.filter((e) => !!(e.location ?? e.participant));
    return (
      <p className="text-center text-white/30 text-sm py-8">
        {anyEvents.length > 0
          ? "No key events (goals, cards) recorded"
          : "No events recorded for this match"}
      </p>
    );
  }

  let shownHalfTime = false;
  let shownET = false;

  return (
    <div className="space-y-0.5 pb-4">
      {keyEvents.map((e, i) => {
        const min = e.minute ?? 0;
        const isHome = (e.location ?? e.participant) === "home";
        const icon = getEventIcon(e);
        const note = getEventNote(e);
        const label = minuteLabel(e);
        const flagUrl = isHome ? homeFlagUrl : awayFlagUrl;
        const code = isHome ? homeCode : awayCode;

        const dividers: React.ReactNode[] = [];
        if (!shownHalfTime && min > 45) {
          shownHalfTime = true;
          dividers.push(
            <div key="ht" className="flex items-center gap-3 py-2.5 my-1">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-[9px] font-black tracking-widest uppercase">
                Half Time
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>,
          );
        }
        if (!shownET && min > 90) {
          shownET = true;
          dividers.push(
            <div key="et" className="flex items-center gap-3 py-2.5 my-1">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-[9px] font-black tracking-widest uppercase">
                Extra Time
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>,
          );
        }

        return (
          <div key={i}>
            {dividers}
            <div
              className={`flex items-center gap-2.5 px-1 py-2.5 rounded-lg hover:bg-white/5 ${
                isHome ? "flex-row" : "flex-row-reverse"
              }`}
            >
              {/* Flag */}
              <div className="w-7 h-5 rounded overflow-hidden border border-white/10 flex-shrink-0 bg-white/5">
                <img
                  src={flagUrl}
                  alt={code}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              {/* Event info */}
              <div
                className={`flex items-center gap-2 flex-1 min-w-0 ${
                  isHome ? "flex-row" : "flex-row-reverse"
                }`}
              >
                <span className="text-base leading-none flex-shrink-0">{icon}</span>
                <div className={`min-w-0 ${isHome ? "" : "text-right"}`}>
                  <span className="text-white font-semibold text-sm truncate block">
                    {e.player_name ?? "Unknown"}
                    <span className="text-white/40 font-normal">{note}</span>
                  </span>
                </div>
              </div>

              {/* Minute */}
              <span className="text-white/50 text-[11px] font-bold tabular-nums flex-shrink-0 w-8 text-center">
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function FixtureDetailDrawer({
  fixture,
  open,
  onClose,
}: {
  fixture: WcFixture | null;
  open: boolean;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<WcFixture | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"events" | "stats">("events");

  useEffect(() => {
    if (!open || !fixture) return;
    setDetail(null);
    setTab("events");
    setLoading(true);
    fetchFixtureById(fixture.id)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, fixture?.id]);

  if (!fixture) return null;

  const active = detail ?? fixture;
  const stats = active.stats as MatchStats | null;
  const rawEvents = stats?.events;
  const statPairs = buildStatPairs(stats?.statistics);
  const groupLabel = [fixture.group_name, fixture.round_name]
    .filter(Boolean)
    .join(" · ");

  const homeFlagUrl =
    fixture.home_flag ??
    `https://flagcdn.com/w80/${fixture.home_code.toLowerCase()}.png`;
  const awayFlagUrl =
    fixture.away_flag ??
    `https://flagcdn.com/w80/${fixture.away_code.toLowerCase()}.png`;

  const isFt = [5, 7, 8, 9].includes(fixture.state_id ?? -1);
  const isLive = fixture.status === "live" && !isFt;

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="!bg-[#0d1b2e] border-white/10 max-h-[92vh]">
        {/* ── Match header ── */}
        <div className="px-5 pt-2 pb-4 border-b border-white/10">
          <div className="flex justify-center mb-4">
            {isLive ? (
              <span className="flex items-center gap-1.5 bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-red-500/30">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                Live
              </span>
            ) : (
              <span className="text-green-400 text-[10px] font-black uppercase tracking-widest">
                Full Time
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Home */}
            <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
              <div className="w-14 h-9 rounded overflow-hidden border border-white/15 bg-white/5 flex-shrink-0">
                <img
                  src={homeFlagUrl}
                  alt={fixture.home_team}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <span className="text-white font-bold text-xs text-center leading-tight">
                {fixture.is_placeholder ? fixture.home_code : fixture.home_team}
              </span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-white font-black text-4xl tabular-nums leading-none">
                  {fixture.home_score ?? "–"}
                </span>
                <span className="text-white/30 font-bold text-2xl">–</span>
                <span className="text-white font-black text-4xl tabular-nums leading-none">
                  {fixture.away_score ?? "–"}
                </span>
              </div>
              {groupLabel && (
                <span className="text-white/40 text-[10px] mt-1.5">{groupLabel}</span>
              )}
            </div>

            {/* Away */}
            <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
              <div className="w-14 h-9 rounded overflow-hidden border border-white/15 bg-white/5 flex-shrink-0">
                <img
                  src={awayFlagUrl}
                  alt={fixture.away_team}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <span className="text-white font-bold text-xs text-center leading-tight">
                {fixture.is_placeholder ? fixture.away_code : fixture.away_team}
              </span>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-white/10 flex-shrink-0">
          <button
            onClick={() => setTab("events")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              tab === "events"
                ? "text-white border-b-2 border-[#1E90FF]"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <Zap className="w-3 h-3" />
            Events
          </button>
          <button
            onClick={() => setTab("stats")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              tab === "stats"
                ? "text-white border-b-2 border-[#1E90FF]"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            Statistics
          </button>
        </div>

        {/* ── Tab content ── */}
        <div className="overflow-y-auto flex-1 px-4 py-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#1E90FF]" />
              <span className="text-white/30 text-xs">Loading match data…</span>
            </div>
          ) : tab === "events" ? (
            <EventTimeline
              rawEvents={rawEvents}
              homeCode={fixture.home_code}
              awayCode={fixture.away_code}
              homeFlagUrl={homeFlagUrl}
              awayFlagUrl={awayFlagUrl}
            />
          ) : statPairs.length > 0 ? (
            <div className="pb-6">
              {/* Team labels above stats */}
              <div className="flex justify-between py-3 mb-1">
                <span className="text-[#1E90FF] text-[11px] font-black uppercase tracking-wider">
                  {fixture.home_code}
                </span>
                <span className="text-white/30 text-[11px] font-black uppercase tracking-wider">
                  {fixture.away_code}
                </span>
              </div>
              {statPairs.map((s) => (
                <StatRow key={s.name} name={s.name} home={s.home} away={s.away} />
              ))}
            </div>
          ) : (
            <p className="text-center text-white/30 text-sm py-10">
              Statistics not available yet
            </p>
          )}
        </div>

        {/* ── Close button ── */}
        <DrawerClose asChild>
          <button className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}
